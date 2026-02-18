import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MilleniumService } from './millenium/millenium.service';
import { SyncService } from './sync/sync.service';
import { SyncController } from './sync/sync.controller';
import { CustomerSyncService } from './sync/customer-sync.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [SyncController],
  providers: [
    MilleniumService,
    SyncService,
    CustomerSyncService,
    PrismaService,
  ],
  exports: [SyncService, CustomerSyncService],
})
export class ErpModule { }
