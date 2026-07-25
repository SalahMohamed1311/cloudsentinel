import { Injectable, Logger } from '@nestjs/common';
import { promises as dns } from 'dns';

export interface DnsSecurityResult {
  spf: {
    found: boolean;
    record?: string;
    policy?: string;
  };
  dmarc: {
    found: boolean;
    record?: string;
    policy?: string;
  };
  dkim: {
    found: boolean;
    selector?: string;
    note?: string;
  };
  dnssec: {
    enabled: boolean;
  };
}

@Injectable()
export class DnsSecurityService {
  private readonly logger = new Logger(DnsSecurityService.name);
  
  // قائمة الأشهر استخداماً لـ DKIM Selectors
  private readonly COMMON_DKIM_SELECTORS = [
    'default',
    'google',
    'selector1',
    'selector2',
    'k1',
    's1',
    'mail',
  ];

  /**
   * تشغيل جميع فحوصات الـ DNS بشكل متوازي
   */
  async check(domain: string): Promise<DnsSecurityResult> {
    const [spf, dmarc, dkim, dnssec] = await Promise.all([
      this.checkSPF(domain),
      this.checkDMARC(domain),
      this.checkDKIM(domain),
      this.checkDNSSEC(domain),
    ]);

    return { spf, dmarc, dkim, dnssec };
  }

  /**
   * 1. فحص سجل SPF (Sender Policy Framework)
   */
  private async checkSPF(domain: string) {
    try {
      const records = await dns.resolveTxt(domain);
      const spfRecord = records.flat().find((r) => r.startsWith('v=spf1'));

      if (!spfRecord) return { found: false };

      let policy = 'unknown';
      if (spfRecord.includes('-all')) policy = 'hard fail';
      else if (spfRecord.includes('~all')) policy = 'soft fail';
      else if (spfRecord.includes('+all')) policy = 'pass all (insecure)';

      return { found: true, record: spfRecord, policy };
    } catch (error) {
      this.logger.debug(`SPF check failed for ${domain}: ${error.message}`);
      return { found: false };
    }
  }

  /**
   * 2. فحص سجل DMARC (Domain-based Message Authentication)
   */
  private async checkDMARC(domain: string) {
    try {
      const records = await dns.resolveTxt(`_dmarc.${domain}`);
      const dmarcRecord = records.flat().find((r) => r.startsWith('v=DMARC1'));

      if (!dmarcRecord) return { found: false };

      const policyMatch = dmarcRecord.match(/p=(\w+)/);
      const policy = policyMatch ? policyMatch[1] : 'none';

      return { found: true, record: dmarcRecord, policy };
    } catch (error) {
      this.logger.debug(`DMARC check failed for ${domain}: ${error.message}`);
      return { found: false };
    }
  }

  /**
   * 3. فحص سجل DKIM بالتخمين القائم على الأشهر استخداماً (Heuristic Approach)
   */
  private async checkDKIM(domain: string) {
    for (const selector of this.COMMON_DKIM_SELECTORS) {
      try {
        const records = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
        if (records && records.length > 0) {
          return { found: true, selector };
        }
      } catch {
        continue;
      }
    }
    return { found: false, note: 'No common selector matched' };
  }

  /**
   * 4. فحص حالة DNSSEC عبر Cloudflare DNS-over-HTTPS API
   */
  private async checkDNSSEC(domain: string) {
    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=DNSKEY`,
        {
          headers: { accept: 'application/dns-json' },
        },
      );

      if (!res.ok) return { enabled: false };

      const data = await res.json();
      // AD flag (Authenticated Data) يشير إلى صحة التوقيع باستخدام DNSSEC
      return { enabled: data.AD === true };
    } catch (error) {
      this.logger.debug(`DNSSEC check failed for ${domain}: ${error.message}`);
      return { enabled: false };
    }
  }
}