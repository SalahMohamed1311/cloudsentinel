import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface CmsDetectionResult {
  cms: string | null;
  framework: string | null;
}

@Injectable()
export class CmsDetectionService {
  private readonly logger = new Logger(CmsDetectionService.name);

  async detect(url: string): Promise<CmsDetectionResult> {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true,
        headers: { 'User-Agent': 'CloudSentinel-Scanner/1.0' },
      });

      const html = typeof response.data === 'string' ? response.data : '';
      const headers = response.headers;

      return {
        cms: this.detectCms(html),
        framework: this.detectFramework(html, headers),
      };
    } catch (error) {
      this.logger.debug(`CMS detection failed for ${url}: ${error.message}`);
      return { cms: null, framework: null };
    }
  }

  private detectCms(html: string): string | null {
    if (/wp-content|wp-includes|generator" content="wordpress/i.test(html)) {
      return 'WordPress';
    }
    if (/cdn\.shopify\.com/i.test(html)) {
      return 'Shopify';
    }
    if (/Drupal/i.test(html)) {
      return 'Drupal';
    }
    if (/Joomla/i.test(html)) {
      return 'Joomla';
    }
    return null;
  }

  private detectFramework(html: string, headers: Record<string, any>): string | null {
    if (html.includes('__NEXT_DATA__') || headers['x-powered-by']?.includes('Next.js')) {
      return 'Next.js';
    }
    if (html.includes('data-reactroot') || /react/i.test(html)) {
      return 'React';
    }
    if (html.includes('__NUXT__')) {
      return 'Nuxt.js';
    }
    if (html.includes('v-app') || /vue/i.test(html)) {
      return 'Vue.js';
    }
    return null;
  }
}