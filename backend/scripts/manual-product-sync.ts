import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProductSyncService } from '../src/modules/erp/sync/product-sync.service';

/**
 * Script for manually triggering the Product Synchronization.
 * Useful for debugging, testing, and initial data load.
 */
async function bootstrap() {
    console.log('--- Manual Product Sync Script Started ---');
    console.log(`Time: ${new Date().toISOString()}`);

    const app = await NestFactory.createApplicationContext(AppModule);
    const productSyncService = app.get(ProductSyncService);

    try {
        console.log('Initiating product synchronization from ERP...');
        await productSyncService.syncProducts();

        console.log('✅ Synchronization completed successfully.');
    } catch (error) {
        console.error('❌ Error during synchronization:', error);
    } finally {
        await app.close();
        console.log('--- Manual Product Sync Script Finished ---');
    }
}

bootstrap();
