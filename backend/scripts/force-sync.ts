
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SyncService } from '../src/modules/erp/sync/sync.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const logger = new Logger('ForceSyncScript');
    const syncService = app.get(SyncService);
    const configService = app.get(ConfigService);

    try {
        // 1. Try to get dates from .env
        const envStart = configService.get<string>('SYNC_START_DATE');
        const envEnd = configService.get<string>('SYNC_END_DATE');

        let start: Date;
        let end: Date;

        if (envStart && envEnd) {
            start = new Date(envStart);
            end = new Date(envEnd);
            // Adjust end to end of day if it looks like a plain date
            if (envEnd.length === 10) { // YYYY-MM-DD
                end.setHours(23, 59, 59, 999);
            }
            logger.log(`📅 Using Dates from ENV: ${start.toISOString()} - ${end.toISOString()}`);
        } else {
            // 2. Default to User Request: 14/12/2025 - 31/12/2025
            start = new Date('2025-12-14T00:00:00');
            end = new Date('2025-12-31T23:59:59');
            logger.log(`📅 Using Requested Logic: ${start.toISOString()} - ${end.toISOString()}`);
        }

        logger.log(`🚀 Forcing Sync...`);

        // Call the sync
        const result = await syncService.syncSales(start, end);

        logger.log('✅ Sync Completed Successfully');
        logger.log(JSON.stringify(result, null, 2));

    } catch (error) {
        logger.error('❌ Sync Failed', error);
    } finally {
        await app.close();
    }
}

bootstrap();
