import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { MilleniumService } from './millenium/millenium.service';
import { SyncService } from './sync/sync.service';
import { SyncController } from './sync/sync.controller';
import { CustomerSyncService } from './sync/customer-sync.service';
import { ProductSyncService } from './sync/product-sync.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { SyncProcessor } from './sync/sync.processor';
import { QueueCleanupService } from './sync/cleanup.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'erp-sync-queue',
    }),
    BullBoardModule.forFeature({
      name: 'erp-sync-queue',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [SyncController],
  providers: [
    MilleniumService,
    SyncService,
    CustomerSyncService,
    ProductSyncService,
    SyncProcessor,
    QueueCleanupService,
    PrismaService,
  ],
  exports: [SyncService, CustomerSyncService, ProductSyncService],
})
export class ErpModule { }
