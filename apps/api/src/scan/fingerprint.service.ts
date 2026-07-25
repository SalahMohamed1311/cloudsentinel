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
    const waf = this.detectWaf(headerData);

    return { cloudProvider, waf };
  }

  private async fetchHeaders(url: string): Promise<Record<string, string>> {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true,
        headers: { 'User-Agent': 'CloudSentinel-Scanner/1.0' },
      });
      return (response.headers as Record<string, string>) || {};
    } catch {
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

    // Cloudflare
    if (headers['cf-ray'] || headers['server']?.toLowerCase().includes('cloudflare')) {
      return 'Cloudflare';
    }

    // AWS / CloudFront / S3
    if (
      headers['x-amz-cf-id'] ||
      headers['via']?.toLowerCase().includes('cloudfront') ||
      cnameStr.includes('cloudfront.net')
    ) {
      return 'AWS CloudFront';
    }
    if (headers['server']?.toLowerCase().includes('amazons3')) {
      return 'AWS S3';
    }

    // Azure
    if (headers['x-azure-ref'] || cnameStr.includes('azurewebsites.net')) {
      return 'Microsoft Azure';
    }

    // GCP
    if (headers['via']?.toLowerCase().includes('google')) {
      return 'Google Cloud Platform';
    }

    return null;
  }

  private detectWaf(headers: Record<string, string>): string | null {
    // Cloudflare WAF
    if (headers['cf-ray']) {
      return 'Cloudflare WAF';
    }

    // Sucuri WAF
    if (headers['x-sucuri-id'] || headers['x-sucuri-cache']) {
      return 'Sucuri WAF';
    }

    // Akamai WAF
    if (headers['akamai-x-cache'] || headers['server']?.toLowerCase().includes('akamaighost')) {
      return 'Akamai';
    }

    // AWS WAF
    const hasAwsHeaders = Object.keys(headers).some((h) => h.startsWith('x-amzn-'));
    if (hasAwsHeaders && headers['via']?.toLowerCase().includes('cloudfront')) {
      return 'AWS WAF';
    }

    return null;
  }
}