import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import * as dns from 'dns/promises';

export interface PortScanResult {
  ip: string | null;
  isPrivateIp: boolean;
  openPorts: number[];
  error?: string;
}

@Injectable()
export class PortScanService {
  private readonly logger = new Logger(PortScanService.name);
  private readonly TARGET_PORTS = [80, 443, 8080, 22];

  /**
   * فحص المنافذ المحددة بعد التأكد من أن الـ IP ليس داخلياً (SSRF Guard)
   */
  async check(hostname: string): Promise<PortScanResult> {
    try {
      // 1. تحويل اسم النطاق (Hostname) إلى IP
      const resolvedIps = await dns.resolve4(hostname);
      if (!resolvedIps || resolvedIps.length === 0) {
        return { ip: null, isPrivateIp: false, openPorts: [] };
      }

      const targetIp = resolvedIps[0];

      // 2. فحص الـ SSRF Guard: التحقق مما إذا كان العنوان IP داخلي/خاص
      if (this.isPrivateIp(targetIp)) {
        this.logger.warn(`SSRF Blocked: ${hostname} resolved to private IP ${targetIp}`);
        return {
          ip: targetIp,
          isPrivateIp: true,
          openPorts: [],
          error: 'Scanning private or loopback IP addresses is restricted (SSRF Protection).',
        };
      }

      // 3. إجراء فحص المنافذ بالتوازي للمنافذ المسموح بها فقط
      const checkPromises = this.TARGET_PORTS.map((port) => this.checkPort(targetIp, port));
      const results = await Promise.all(checkPromises);

      const openPorts = results.filter((res) => res.isOpen).map((res) => res.port);

      return {
        ip: targetIp,
        isPrivateIp: false,
        openPorts,
      };
    } catch (error) {
      this.logger.debug(`Port scan failed for ${hostname}: ${error.message}`);
      return { ip: null, isPrivateIp: false, openPorts: [] };
    }
  }

  /**
   * دالة التحقق من العناوين الخاصة/الداخلية (Private & Loopback IP Ranges)
   */
  private isPrivateIp(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;

    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;

    // 10.0.0.0/8 (Private Network)
    if (parts[0] === 10) return true;

    // 172.16.0.0/12 (Private Network)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

    // 192.168.0.0/16 (Private Network)
    if (parts[0] === 192 && parts[1] === 168) return true;

    // 169.254.0.0/16 (Link-Local / AWS Metadata API)
    if (parts[0] === 169 && parts[1] === 254) return true;

    // 0.0.0.0/8
    if (parts[0] === 0) return true;

    return false;
  }

  /**
   * فحص منفذ فردي عبر Socket مع تحديد مهلة زمنية (Timeout)
   */
  private checkPort(host: string, port: number, timeout = 2000): Promise<{ port: number; isOpen: boolean }> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(timeout);

      socket.once('connect', () => {
        socket.destroy();
        resolve({ port, isOpen: true });
      });

      socket.once('timeout', () => {
        socket.destroy();
        resolve({ port, isOpen: false });
      });

      socket.once('error', () => {
        socket.destroy();
        resolve({ port, isOpen: false });
      });

      socket.connect(port, host);
    });
  }
}