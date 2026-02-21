import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CustomerSyncService } from '../src/modules/erp/sync/customer-sync.service';

/**
 * Script for testing BullMQ job dispatch manually.
 */
async function bootstrap() {
    console.log('--- Test BullMQ Job Dispatch Started ---');

    const app = await NestFactory.createApplicationContext(AppModule);
    const customerSyncService = app.get(CustomerSyncService);

    try {
        console.log('Dispatching sync job to Queue...');
        await customerSyncService.handleDailySync(); // This enqueues 'sync-customers'

        console.log('✅ Job effectively pushed to the queue. Wait a few moments to see worker execution logs.');
        // We leave it running for 10 seconds to watch the worker pick it up
        await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
        console.error('❌ Error during queue dispatch:', error);
    } finally {
        await app.close();
        console.log('--- Script Finished ---');
    }
}

bootstrap();
