import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MilleniumService } from '../src/modules/erp/millenium/millenium.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(MilleniumService);

    console.log('--- Debugging Pagination ---');

    try {
        // 1. Fetch First 5
        console.log('Fetching First 5...');
        const batch1 = await service.getCustomersBigBang({ $top: 5, $skip: 0 });
        console.log(`Batch 1 Count: ${batch1.length}`);
        if (batch1.length > 0) {
            console.log(`First ID: ${batch1[0].cod_cliente}`);
            console.log(`Last ID: ${batch1[batch1.length - 1].cod_cliente}`);
        }

        // 2. Fetch Next 5
        console.log('\nFetching Next 5 (Skip 5)...');
        const batch2 = await service.getCustomersBigBang({ $top: 5, $skip: 5 });
        console.log(`Batch 2 Count: ${batch2.length}`);
        if (batch2.length > 0) {
            console.log(`First ID: ${batch2[0].cod_cliente}`);
            console.log(`Last ID: ${batch2[batch2.length - 1].cod_cliente}`);
        }

    } catch (error) {
        console.error('Debug Failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
