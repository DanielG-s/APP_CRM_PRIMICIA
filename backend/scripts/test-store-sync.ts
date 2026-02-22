import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { StoreSyncService } from '../src/modules/erp/sync/store-sync.service';

async function bootstrap() {
    console.log('--- Manual Store Sync Script Started ---');
    console.log(`Time: ${new Date().toISOString()}`);

    const app = await NestFactory.createApplicationContext(AppModule);
    const storeSyncService = app.get(StoreSyncService);

    try {
        console.log('Initiating store synchronization from ERP...');
        await storeSyncService.syncStores();

        console.log('✅ Synchronization completed successfully.');
    } catch (error) {
        console.error('❌ Error during synchronization:', error);
    } finally {
        await app.close();
        console.log('--- Script Finished ---');
    }
}

bootstrap();
