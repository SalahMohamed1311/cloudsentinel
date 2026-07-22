import { Controller, Post, Get, Body } from '@nestjs/common';
import { ScanService } from './scan.service';

export class ScanRequestDto {
  url!: string;
}

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  async scan(@Body() dto: ScanRequestDto) {
    return this.scanService.scanUrl(dto.url);
  }

  @Get('history')
  async getHistory() {
    return this.scanService.getHistory();
  }
}