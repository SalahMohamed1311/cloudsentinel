import { Injectable, BadRequestException } from '@nestjs/common';
import * as tls from 'tls';
import * as dns from 'dns/promises';
import axios from 'axios';
  import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as tls from 'tls';
import * as dns from 'dns/promises';
import axios from 'axios';

export interface SslResult {
  valid: boolean;
  issuer: string;
  validTo: string;
  daysRemaining: number;
  tlsVersion: string;
}

export interface SecurityHeaderResult {
  header: string;
  present: boolean;
  value: string | null;
  score: number;
}

export interface DnsSecurityResult {
  spf: { present: boolean; record: string | null };
  dmarc: { present: boolean; record: string | null };
}

export interface ScanResponseDto {
  targetUrl: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  ssl: SslResult;
  headers: SecurityHeaderResult[];
  dns: DnsSecurityResult;
  scannedAt: string;
}

@Injectable()
export class ScanService {
  async scanUrl(rawUrl: string): Promise<ScanResponseDto> {
    const formattedUrl = this.normalizeUrl(rawUrl);
    let hostname: string;

    try {
      hostname = new URL(formattedUrl).hostname;
    } catch {
      throw new BadRequestException('Invalid URL provided');
    }

    const [sslResult, headersResult, dnsResult] = await Promise.all([
      this.checkSsl(hostname),
      this.checkHeaders(formattedUrl),
      this.checkDnsSecurity(hostname),
    ]);

    const { score, grade } = this.calculateScore(sslResult, headersResult, dnsResult);

    return {
      targetUrl: formattedUrl,
      score,
      grade,
      ssl: sslResult,
      headers: headersResult,
      dns: dnsResult,
      scannedAt: new Date().toISOString(),
    };
  }

  private normalizeUrl(url: string): string {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean;
  }

  private checkSsl(hostname: string): Promise<SslResult> {
    return new Promise((resolve) => {
      const socket = tls.connect(443, hostname, { servername: hostname, timeout: 5000 }, () => {
        const cert = socket.getPeerCertificate();
        
        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            valid: false,
            issuer: 'N/A',
            validTo: 'N/A',
            daysRemaining: 0,
            tlsVersion: 'N/A',
          });
          socket.end();
          return;
        }

        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.max(0, Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

        const rawIssuer = cert.issuer?.O || cert.issuer?.CN;
        const issuerName = Array.isArray(rawIssuer) ? rawIssuer.join(', ') : (rawIssuer || 'Unknown');

        resolve({
          valid: socket.authorized,
          issuer: issuerName,
          validTo: cert.valid_to,
          daysRemaining,
          tlsVersion: socket.getProtocol() || 'Unknown',
        });
        socket.end();
      });

      socket.setTimeout(5000, () => {
        socket.destroy();
        resolve({ valid: false, issuer: 'N/A', validTo: 'N/A', daysRemaining: 0, tlsVersion: 'Timeout' });
      });

      socket.on('error', () => {
        resolve({ valid: false, issuer: 'N/A', validTo: 'N/A', daysRemaining: 0, tlsVersion: 'Error' });
      });
    });
  }

  private async checkHeaders(url: string): Promise<SecurityHeaderResult[]> {
    const targetHeaders = [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'permissions-policy',
      'referrer-policy',
    ];

    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true,
        headers: { 'User-Agent': 'CloudSentinel-Scanner/1.0' },
      });

      const responseHeaders = response.headers;

      return targetHeaders.map((header) => {
        const rawValue = responseHeaders[header];
        const value = Array.isArray(rawValue) ? rawValue.join(', ') : (rawValue as string) || null;
        return {
          header,
          present: !!value,
          value,
          score: value ? 10 : 0,
        };
      });
    } catch {
      return targetHeaders.map((header) => ({ header, present: false, value: null, score: 0 }));
    }
  }

  private async checkDnsSecurity(hostname: string): Promise<DnsSecurityResult> {
    let spfRecord: string | null = null;
    let dmarcRecord: string | null = null;

    try {
      // Check SPF Record
      const txtRecords = await dns.resolveTxt(hostname);
      const flatTxt = txtRecords.map((r) => r.join(''));
      const spf = flatTxt.find((r) => r.startsWith('v=spf1'));
      if (spf) spfRecord = spf;
    } catch {
      // SPF Record Missing or Query Failed
    }

    try {
      // Check DMARC Record
      const dmarcTxt = await dns.resolveTxt(`_dmarc.${hostname}`);
      const flatDmarc = dmarcTxt.map((r) => r.join(''));
      const dmarc = flatDmarc.find((r) => r.startsWith('v=DMARC1'));
      if (dmarc) dmarcRecord = dmarc;
    } catch {
      // DMARC Record Missing or Query Failed
    }

    return {
      spf: { present: !!spfRecord, record: spfRecord },
      dmarc: { present: !!dmarcRecord, record: dmarcRecord },
    };
  }

  private calculateScore(ssl: SslResult, headers: SecurityHeaderResult[], dnsRes: DnsSecurityResult) {
    let total = 0;

    // SSL Score (Max 30)
    if (ssl.valid) total += 30;

    // Headers Score (Max 50)
    const headerScoreSum = headers.reduce((acc, curr) => acc + (curr.present ? 8 : 0), 0);
    total += headerScoreSum;

    // DNS Security Score (Max 20)
    if (dnsRes.spf.present) total += 10;
    if (dnsRes.dmarc.present) total += 10;

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (total >= 90) grade = 'A+';
    else if (total >= 80) grade = 'A';
    else if (total >= 65) grade = 'B';
    else if (total >= 50) grade = 'C';
    else if (total >= 30) grade = 'D';

    return { score: total, grade };
  }
// Interfaces... (احتفظ بنفس الـ Interfaces السابقة)

@Injectable()
export class ScanService {
  constructor(private prisma: PrismaService) {}

  async scanUrl(rawUrl: string) {
    const formattedUrl = this.normalizeUrl(rawUrl);
    let hostname: string;

    try {
      hostname = new URL(formattedUrl).hostname;
    } catch {
      throw new BadRequestException('Invalid URL provided');
    }

    const [sslResult, headersResult, dnsResult] = await Promise.all([
      this.checkSsl(hostname),
      this.checkHeaders(formattedUrl),
      this.checkDnsSecurity(hostname),
    ]);

    const { score, grade } = this.calculateScore(sslResult, headersResult, dnsResult);

    // Save scan result in DB
    const savedScan = await this.prisma.scanHistory.create({
      data: {
        targetUrl: formattedUrl,
        score,
        grade,
        ssl: JSON.parse(JSON.stringify(sslResult)),
        headers: JSON.parse(JSON.stringify(headersResult)),
        dns: JSON.parse(JSON.stringify(dnsResult)),
      },
    });

    return savedScan;
  }

  async getHistory() {
    return this.prisma.scanHistory.findMany({
      orderBy: { scannedAt: 'desc' },
      take: 10, // Latest 10 scans
    });
  }

  // (ضع باقي الميثودز المساعدة: normalizeUrl, checkSsl, checkHeaders, checkDnsSecurity, calculateScore كما هي)
}
}