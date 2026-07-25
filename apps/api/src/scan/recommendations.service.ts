import { Injectable } from '@nestjs/common';

export interface ScanDataInput {
  sslValid: boolean;
  missingHeaders: string[];
  spfFound: boolean;
  dmarcFound: boolean;
  dmarcPolicy?: string;
  dnssecEnabled: boolean;
  isPrivateIp?: boolean;
}

@Injectable()
export class RecommendationsService {
  private readonly RECOMMENDATIONS_MAP: Record<string, string> = {
    ssl_invalid: 'تفعيل أو تجديد شهادة SSL/TLS لتشفير الاتصال بين المستخدم والسيرفر.',
    hsts_missing: 'إضافة Header الخاص بـ Strict-Transport-Security (HSTS) لإجبار التصفح عبر HTTPS فقط.',
    csp_missing: 'إضافة Content-Security-Policy (CSP) للحماية من هجمات Cross-Site Scripting (XSS).',
    xfo_missing: 'إضافة X-Frame-Options لمنع تضمين الموقع داخل Iframes وحمايته من Clickjacking.',
    xcto_missing: 'إضافة X-Content-Type-Options: nosniff لمنع المتصفح من تخمين أنواع الملفات.',
    spf_missing: 'إضافة سجل SPF (Sender Policy Framework) للحد من استخدام الدومين في انتحال البريد (Phishing).',
    dmarc_missing: 'إضافة سجل DMARC لتحديد سياسة التعامل مع الرسائل التي تفشل في اختبارات SPF/DKIM.',
    dmarc_none: 'تغيير سياسة DMARC من p=none إلى p=quarantine أو p=reject لحظر الرسائل المزيفة فعلياً.',
    dnssec_missing: 'تفعيل خاصية DNSSEC عند موفر الـ DNS لحماية النطاق من هجمات DNS Spoofing.',
  };

  build(data: ScanDataInput): string[] {
    const recommendations: string[] = [];

    if (!data.sslValid) {
      recommendations.push(this.RECOMMENDATIONS_MAP['ssl_invalid']);
    }

    if (data.missingHeaders.includes('strict-transport-security')) {
      recommendations.push(this.RECOMMENDATIONS_MAP['hsts_missing']);
    }
    if (data.missingHeaders.includes('content-security-policy')) {
      recommendations.push(this.RECOMMENDATIONS_MAP['csp_missing']);
    }
    if (data.missingHeaders.includes('x-frame-options')) {
      recommendations.push(this.RECOMMENDATIONS_MAP['xfo_missing']);
    }
    if (data.missingHeaders.includes('x-content-type-options')) {
      recommendations.push(this.RECOMMENDATIONS_MAP['xcto_missing']);
    }

    if (!data.spfFound) {
      recommendations.push(this.RECOMMENDATIONS_MAP['spf_missing']);
    }

    if (!data.dmarcFound) {
      recommendations.push(this.RECOMMENDATIONS_MAP['dmarc_missing']);
    } else if (data.dmarcPolicy === 'none') {
      recommendations.push(this.RECOMMENDATIONS_MAP['dmarc_none']);
    }

    if (!data.dnssecEnabled) {
      recommendations.push(this.RECOMMENDATIONS_MAP['dnssec_missing']);
    }

    return recommendations;
  }
}