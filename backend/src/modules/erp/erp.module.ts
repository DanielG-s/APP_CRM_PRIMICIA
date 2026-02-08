import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MilleniumService } from './millenium/millenium.service';
import { SyncService } from './sync/sync.service';
import { SyncController } from './sync/sync.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [SyncController],
  providers: [
    MilleniumService,
    SyncService,
    PrismaService, // Assumes PrismaService is not global or needs to be provided.
    // If Global, we don't need it here but explicit is safe.
    // Checking AppModule, PrismaService is exported, so if Global it's fine.
    // AppModule has @Global() decorator? No.
    // Wait, Step 162 shows AppModule has @Global() decorator?
    // Line 13: @Global(). Yes.
    // So PrismaService exported from there *should* be available if imported.
    // However, circular dependency usually prevents importing AppModule.
    // Best practice: Import PrismaModule or provide PrismaService locally if simple.
    // AppModule provides PrismaService directly.
    // I'll provide it here to be safe/stand-alone or remove if errors.
  ],
  exports: [SyncService],
})
export class ErpModule {}
