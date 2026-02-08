import { Module } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SegmentationQueryBuilder } from './services/segmentation-query.builder';
import { RfmAnalysisService } from './services/rfm-analysis.service';
import { DataExportService } from './services/data-export.service';

@Module({
  controllers: [IntelligenceController],
  providers: [
    IntelligenceService,
    PrismaService,
    SegmentationQueryBuilder,
    RfmAnalysisService,
    DataExportService,
  ],
})
export class IntelligenceModule {}
