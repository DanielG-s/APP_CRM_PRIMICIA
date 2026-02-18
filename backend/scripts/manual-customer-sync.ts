import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CustomerSyncService } from '../src/modules/erp/sync/customer-sync.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const syncService = app.get(CustomerSyncService);

    console.log('Starting Manual Customer Sync...');
    try {
        // Force full sync just to be sure
        await syncService.syncCustomers(true);
        console.log('Sync Completed Successfully.');
    } catch (error) {
        console.error('Sync Failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
