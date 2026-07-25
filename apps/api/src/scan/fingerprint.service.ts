import { Injectable, Logger } from '@nestjs/common';
import { promises as dns } from 'dns';
import axios from 'axios';

export interface FingerprintResult {
  cloudProvider: string | null;
  waf: string | null;
}

@Injectable()
export class FingerprintService {
  private readonly logger = new Logger(FingerprintService.name);

  async check(url: string, hostname: string): Promise<FingerprintResult> {
    const [headerData, cnames] = await Promise.all([
      this.fetchHeaders(url),
      this.getCnames(hostname),
    ]);

    const cloudProvider = this.detectCloudProvider(headerData, cnames);
    const waf = this.detectWaf(headerData, cnames);

    return { cloudProvider, waf };
  }

  private async fetchHeaders(url: string): Promise<Record<string, string>> {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true,
        headers: { 'User-Agent': 'CloudSentinel-Scanner/1.0' },
      });

      // 💡 توحيد جميع أسماء الهيدرات لتكون lowercase لتجنب مشاكل الـ Case Sensitivity
      const rawHeaders = response.headers || {};
      const lowerHeaders: Record<string, string> = {};

      Object.keys(rawHeaders).forEach((key) => {
        const val = rawHeaders[key];
        lowerHeaders[key.toLowerCase()] = Array.isArray(val) ? val.join(', ') : String(val);
      });

      return lowerHeaders;
    } catch (error) {
      this.logger.error(`Error fetching headers for ${url}: ${error.message}`);
      return {};
    }
  }

  private async getCnames(hostname: string): Promise<string[]> {
    try {
      return await dns.resolveCname(hostname);
    } catch {
      return [];
    }
  }

  private detectCloudProvider(headers: Record<string, string>, cnames: string[]): string | null {
    const cnameStr = cnames.join(' ').toLowerCase();
    const serverHeader = headers['server']?.toLowerCase() || '';
    const viaHeader = headers['via']?.toLowerCase() || '';

    // 1. Cloudflare
    if (
      headers['cf-ray'] ||
      headers['cf-cache-status'] ||
      serverHeader.includes('cloudflare') ||
      cnameStr.includes('cloudflare')
    ) {
      return 'Cloudflare';
    }

    // 2. AWS / CloudFront / S3
    if (
      headers['x-amz-cf-id'] ||
      headers['x-amz-request-id'] ||
      viaHeader.includes('cloudfront') ||
      cnameStr.includes('cloudfront.net')
    ) {
      return 'AWS CloudFront';
    }
    if (serverHeader.includes('amazons3') || cnameStr.includes('s3.amazonaws')) {
      return 'AWS S3';
    }

    // 3. Fastly
    if (headers['x-fastly-request-id'] || serverHeader.includes('fastly') || cnameStr.includes('fastly')) {
      return 'Fastly';
    }

    // 4. Azure
    if (headers['x-azure-ref'] || cnameStr.includes('azure') || cnameStr.includes('trafficmanager.net')) {
      return 'Microsoft Azure';
    }

    // 5. GCP / Vercel / Netlify
    if (viaHeader.includes('google') || headers['server'] === 'gws') {
      return 'Google Cloud Platform';
    }
    if (headers['x-vercel-id'] || serverHeader.includes('vercel')) {
      return 'Vercel';
    }
    if (headers['server']?.includes('netlify')) {
      return 'Netlify';
    }

    // 6. Generic Nginx/Apache (إذا لم يتم اكتشاف cloud محدد)
    if (serverHeader.includes('nginx')) return 'Nginx Web Server';
    if (serverHeader.includes('apache')) return 'Apache HTTP Server';

    return null;
  }

  private detectWaf(headers: Record<string, string>, cnames: string[]): string | null {
    const cnameStr = cnames.join(' ').toLowerCase();
    const serverHeader = headers['server']?.toLowerCase() || '';

    // Cloudflare WAF
    if (headers['cf-ray'] || serverHeader.includes('cloudflare')) {
      return 'Cloudflare WAF';
    }

    // Sucuri WAF
    if (headers['x-sucuri-id'] || headers['x-sucuri-cache']) {
      return 'Sucuri WAF';
    }

    // Akamai WAF
    if (headers['akamai-x-cache'] || serverHeader.includes('akamaighost') || cnameStr.includes('akamai')) {
      return 'Akamai WAF';
    }

    // AWS WAF
    const hasAwsHeaders = Object.keys(headers).some((h) => h.startsWith('x-amzn-'));
    if (hasAwsHeaders || headers['x-amz-cf-id']) {
      return 'AWS WAF';
    }

    // Imperva / Incapsula
    if (headers['x-iinfo'] || headers['x-cdn']?.includes('incapsula')) {
      return 'Imperva / Incapsula';
    }

    return null;
  }
}