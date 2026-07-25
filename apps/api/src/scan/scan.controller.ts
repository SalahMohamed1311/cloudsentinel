import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ScanService } from './scan.service';

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  // 1. مسار فحص الدومين الجديد (مع إمكانية حفظه لو المستخدم مسجل دخول)
  @Post()
  async scanUrl(
    @Body() body: { url: string; clerkId?: string; email?: string; name?: string },
  ) {
    return await this.scanService.scanUrl(
      body.url,
      body.clerkId,
      body.email,
      body.name,
    );
  }

  // 2. مسار حفظ نتيجة فحص جاهزة يدوياً
  @Post('save')
  async saveScan(
    @Body()
    body: {
      clerkId: string;
      email: string;
      name?: string;
      url: string;
      scanResult: any;
    },
  ) {
    return await this.scanService.saveScanResult(body);
  }

  // 3. مسار جلب المواقع المتابعة وتاريخ فحوصاتها للمستخدم (للـ Dashboard والـ Charts)
  @Get('websites')
  async getWebsites(@Query('clerkId') clerkId: string) {
    return await this.scanService.getUserWebsites(clerkId);
  }

  // 4. مسار جلب آخر عمليات الفحص العامة
  @Get('history')
  async getHistory() {
    return await this.scanService.getHistory();
  }
}