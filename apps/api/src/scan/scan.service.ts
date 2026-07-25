import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DnsSecurityService } from './dns-security.service';
import { FingerprintService } from './fingerprint.service';
import { CmsDetectionService } from './cms-detection.service';
import { PortScanService } from './port-scan.service';
import { RecommendationsService } from './recommendations.service';
import * as tls from 'tls';
import axios from 'axios';

export interface SslResult {
  valid: boolean;
  issuer: string;
  validTo: string;
  daysRemaining: number;
  tlsVersion: string;
  subdomains: string[];
}

export interface SecurityHeaderResult {
  header: string;
  present: boolean;
  value: string | null;
  score: number;
}

@Injectable()
export class ScanService {
  constructor(
    private prisma: PrismaService,
    private readonly dnsSecurityService: DnsSecurityService,
    private readonly fingerprintService: FingerprintService,
    private readonly cmsDetectionService: CmsDetectionService,
    private readonly portScanService: PortScanService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  async scanUrl(rawUrl: string, clerkId?: string, email?: string, name?: string) {
    const formattedUrl = this.normalizeUrl(rawUrl);
    let hostname: string;

    try {
      hostname = new URL(formattedUrl).hostname;
    } catch {
      throw new BadRequestException('Invalid URL provided');
    }

    // 🛡️ [SSRF Guard Check] - التحقق من العناوين الداخلية قبل إجراء أي اتصال أو فحص
    if (this.isPrivateIp(hostname)) {
      throw new BadRequestException('SSRF Guard: Scanning internal or private IP addresses is prohibited.');
    }

    // 1. تشغيل جميع فحوصات الأمان والـ Fingerprinting بالتوازي بعد تخطي اختبار الأمان
    const [sslResult, headersResult, dnsResult, fingerprintResult, cmsResult, portScanResult] =
      await Promise.all([
        this.checkSsl(hostname),
        this.checkHeaders(formattedUrl),
        this.dnsSecurityService.check(hostname),
        this.fingerprintService.check(formattedUrl, hostname),
        this.cmsDetectionService.detect(formattedUrl),
        this.portScanService.check(hostname),
      ]);

    // 2. استخراج العناوين الناقصة بناءً على الفحص
    const missingHeaders = headersResult
      .filter((h) => !h.present)
      .map((h) => h.header);

    // 3. توليد التوصيات الأمنية بناءً على النتائج
    const recommendations = this.recommendationsService.build({
      sslValid: sslResult.valid,
      missingHeaders,
      spfFound: dnsResult.spf.found,
      dmarcFound: dnsResult.dmarc.found,
      dmarcPolicy: dnsResult.dmarc.policy,
      dnssecEnabled: dnsResult.dnssec.enabled,
      isPrivateIp: portScanResult.isPrivateIp,
    });

    // 4. حساب النتيجة الإجمالية والتقييم (Grade)
    const { score, grade } = this.calculateScore(
      sslResult.valid,
      headersResult,
      dnsResult.spf.found,
      dnsResult.dmarc.found,
    );

    // 4.5 توحيد شكل الـ DNS والـ Fingerprint عشان يتوافق مع الـ Frontend
    const normalizedDns = {
      spf: { present: dnsResult.spf.found, record: dnsResult.spf.record ?? null },
      dmarc: { present: dnsResult.dmarc.found, record: dnsResult.dmarc.record ?? null },
      dkim: {
        present: dnsResult.dkim.found,
        record: dnsResult.dkim.selector ? `selector: ${dnsResult.dkim.selector}` : null,
      },
      dnssec: { present: dnsResult.dnssec.enabled, record: null },
    };

    const normalizedFingerprint = {
      cloudProvider: fingerprintResult.cloudProvider ?? null,
      waf: fingerprintResult.waf ?? null,
      cms: cmsResult.cms ?? cmsResult.framework ?? null,
    };

    // 5. تجهيز كائن النتائج النهائي
    const scanResultData = {
      targetUrl: formattedUrl,
      hostname,
      score,
      grade,
      ssl: sslResult,
      headers: headersResult,
      dns: normalizedDns,
      fingerprint: normalizedFingerprint,
      cms: cmsResult,
      ports: portScanResult,
      recommendations,
      scannedAt: new Date(),
    };

    let websiteId: string | null = null;

    // 6. لو المستخدم مسجل دخول، نقوم بحفظ الموقع وربطه بـ ScanHistory تلقائياً (متطلبات الأسبوع 3)
    if (clerkId) {
      const user = await this.prisma.user.upsert({
        where: { clerkId },
        update: {},
        create: { clerkId, email: email || `${clerkId}@clerk.user`, name },
      });

      const website = await this.prisma.website.upsert({
        where: { userId_url: { userId: user.id, url: formattedUrl } },
        update: {},
        create: { url: formattedUrl, userId: user.id },
      });

      websiteId = website.id;
    }

    // 7. حفظ النتيجة في قاعدة البيانات عبر Prisma
    const savedScan = await this.prisma.scanHistory.create({
      data: {
        targetUrl: formattedUrl,
        score,
        grade,
        ssl: JSON.parse(JSON.stringify(sslResult)),
        headers: JSON.parse(JSON.stringify(headersResult)),
        dns: JSON.parse(JSON.stringify(normalizedDns)),
        recommendations: JSON.parse(JSON.stringify(recommendations)),
        websiteId: websiteId,
      },
    });

    return {
      id: savedScan.id,
      ...scanResultData,
    };
  }

  async saveScanResult(data: {
    clerkId: string;
    email: string;
    name?: string;
    url: string;
    scanResult: any;
  }) {
    const { clerkId, email, name, url, scanResult } = data;

    const user = await this.prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: { clerkId, email, name },
    });

    const website = await this.prisma.website.upsert({
      where: { userId_url: { userId: user.id, url } },
      update: {},
      create: { url, userId: user.id },
    });

    const history = await this.prisma.scanHistory.create({
      data: {
        targetUrl: url,
        score: scanResult.score,
        grade: scanResult.grade,
        ssl: scanResult.ssl || {},
        headers: scanResult.headers || {},
        dns: scanResult.dns || {},
        fingerprint: scanResult.fingerprint || null,
        recommendations: scanResult.recommendations || null,
        websiteId: website.id,
      },
    });

    return { user, website, history };
  }

  async getUserWebsites(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        websites: {
          include: {
            scans: {
              orderBy: { scannedAt: 'desc' },
            },
          },
        },
      },
    });

    return user?.websites || [];
  }

  async getHistory() {
    return this.prisma.scanHistory.findMany({
      orderBy: { scannedAt: 'desc' },
      take: 10,
    });
  }

  private isPrivateIp(ipOrHost: string): boolean {
    const cleanHost = ipOrHost.toLowerCase().trim();
    return (
      cleanHost === '127.0.0.1' ||
      cleanHost === 'localhost' ||
      cleanHost === '::1' ||
      cleanHost === '0.0.0.0' ||
      cleanHost.startsWith('10.') ||
      cleanHost.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanHost)
    );
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
            subdomains: [],
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
          subdomains: [],
        });
        socket.end();
      });

      socket.setTimeout(5000, () => {
        socket.destroy();
        resolve({ valid: false, issuer: 'N/A', validTo: 'N/A', daysRemaining: 0, tlsVersion: 'Timeout', subdomains: [] });
      });

      socket.on('error', () => {
        resolve({ valid: false, issuer: 'N/A', validTo: 'N/A', daysRemaining: 0, tlsVersion: 'Error', subdomains: [] });
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

  private calculateScore(sslValid: boolean, headers: SecurityHeaderResult[], spfFound: boolean, dmarcFound: boolean) {
    let total = 0;

    if (sslValid) total += 30;

    const headerScoreSum = headers.reduce((acc, curr) => acc + (curr.present ? 8 : 0), 0);
    total += headerScoreSum;

    if (spfFound) total += 10;
    if (dmarcFound) total += 10;

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (total >= 90) grade = 'A+';
    else if (total >= 80) grade = 'A';
    else if (total >= 65) grade = 'B';
    else if (total >= 50) grade = 'C';
    else if (total >= 30) grade = 'D';

    return { score: total, grade };
  }
}