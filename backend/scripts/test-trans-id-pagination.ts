import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MilleniumService } from '../src/modules/erp/millenium/millenium.service';
import { lastValueFrom } from 'rxjs';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(MilleniumService);
    const http = (service as any).httpService;
    const url = `${service.apiUrl}/clientes/lista`;
    const auth = { username: (service as any).username, password: (service as any).pass };

    console.log('--- Testing trans_id Pagination Variations ---');

    async function testParams(label: string, params: any) {
        try {
            const p = { $format: 'json', ...params };
            console.log(`Testing [${label}]:`, JSON.stringify(params));
            const res: any = await lastValueFrom(http.get(url, { params: p, auth }));
            const data = res.data.value || [];
            const count = data.length;
            let firstInternalId = 'N/A';

            if (count > 0) {
                firstInternalId = data[0].trans_id;
            }
            console.log(`  -> Count: ${count}, First TransID: ${firstInternalId}`);
            return { count, firstInternalId };
        } catch (e: any) {
            console.log(`  -> Error: ${e.message}`);
            return { count: -1, firstInternalId: 'ERROR' };
        }
    }

    // 1. Get Baseline
    const baseline = await testParams('Baseline', { $top: 5 });
    const lastTransId = 809; // Hardcoded from previous run to be safe, or we could use baseline
    console.log(`Using Reference ID: ${lastTransId}`);

    // 2. Test Filter Variations
    await testParams('Standard OData ($filter=trans_id gt X)', { $top: 5, $filter: `trans_id gt ${lastTransId}` });

    await testParams('No $ (filter=trans_id gt X)', { $top: 5, filter: `trans_id gt ${lastTransId}` });

    await testParams('SQL Style ($filter=trans_id > X)', { $top: 5, $filter: `trans_id > ${lastTransId}` });

    await testParams('Exact Match ($filter=trans_id eq X)', { $top: 5, $filter: `trans_id eq ${lastTransId}` });

    await testParams('Direct Param (trans_id=X)', { $top: 5, trans_id: lastTransId });

    await testParams('Direct Param (trans_id>X)', { $top: 5, 'trans_id>': lastTransId });
}

bootstrap();
