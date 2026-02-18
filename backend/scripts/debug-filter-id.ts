import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MilleniumService } from '../src/modules/erp/millenium/millenium.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(MilleniumService);

    console.log('--- Debugging ID Filter ---');

    try {
        // 1. Fetch First 5
        console.log('Fetching First 5...');
        const batch1 = await service.getCustomersBigBang({ $top: 5 });
        if (batch1.length === 0) return;

        const lastId = batch1[batch1.length - 1].cod_cliente;
        console.log(`Last ID: ${lastId}`);

        // 2. Fetch Next 5 with Filter
        console.log(`\nFetching Next 5 (Filter: cod_cliente gt '${lastId}')...`);

        // Try OData standard
        const filter = `cod_cliente gt '${lastId}'`;

        // We need to bypass getCustomers helper because it puts params in a specific way? 
        // MilleniumService.getCustomers takes `params`. 
        // But it puts params into `apiParams`.
        // millenium.service.ts uses: params: { ...apiParams, ... }
        // So if pass { $filter: ... } it should work.

        const batch2 = await service.getCustomersBigBang({
            $top: 5,
            $filter: filter
        });

        console.log(`Batch 2 Count: ${batch2.length}`);
        if (batch2.length > 0) {
            console.log(`First ID: ${batch2[0].cod_cliente}`);
            if (batch2[0].cod_cliente === batch1[0].cod_cliente) {
                console.log('FAIL: Returned duplicates (Filter ignored)');
            } else {
                console.log('SUCCESS: Returned new records');
            }
        } else {
            console.log('Batch 2 Empty (Filter might be too strict or format wrong)');
        }

    } catch (error) {
        console.error('Debug Failed:', error);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
    } finally {
        await app.close();
    }
}

bootstrap();
