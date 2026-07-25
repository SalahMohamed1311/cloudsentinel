import { Module } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { DnsSecurityService } from './dns-security.service';
import { FingerprintService } from './fingerprint.service';
import { CmsDetectionService } from './cms-detection.service';
import { PortScanService } from './port-scan.service';
import { RecommendationsService } from './recommendations.service';

@Module({
  controllers: [ScanController],
  providers: [
    ScanService,
    DnsSecurityService,
    FingerprintService,
    CmsDetectionService,
    PortScanService,
    RecommendationsService,
    
  ],
  exports: [
    ScanService,
    DnsSecurityService,
    FingerprintService,
    CmsDetectionService,
    PortScanService,
    RecommendationsService,
    
  ],
})
export class ScanModule {}