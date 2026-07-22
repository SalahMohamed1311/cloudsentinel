import { Module } from '@nestjs/common';
import { ScanModule } from './scan/scan.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ScanModule],
})
export class AppModule {}