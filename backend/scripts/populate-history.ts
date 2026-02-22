import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SyncService } from '../src/modules/erp/sync/sync.service';
import { subDays, startOfDay } from 'date-fns';

async function bootstrap() {
    console.log('--- Populating Historical Sales (90 Days) ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    try {
        const syncService = app.get(SyncService);

        const end = new Date();
        const start = startOfDay(subDays(new Date(), 90));

        console.log('Syncing from ' + start.toISOString() + ' to ' + end.toISOString());
        await syncService.syncSales(start, end);

        console.log('--- Population Complete ---');
    } catch (e) {
        console.error('--- SYNC FAILED ---');
        if (e.response?.data) {
            console.error('ERP Error Data:', JSON.stringify(e.response.data, null, 2));
        } else {
            console.error(e);
        }
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
