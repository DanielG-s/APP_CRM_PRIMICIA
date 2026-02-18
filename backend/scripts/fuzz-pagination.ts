import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MilleniumService } from '../src/modules/erp/millenium/millenium.service';
import { lastValueFrom } from 'rxjs';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    // Hack to access httpService directly
    const service = app.get(MilleniumService);
    const http = (service as any).httpService;
    const url = `${service.apiUrl}/clientes/lista`;
    const auth = { username: (service as any).username, password: (service as any).pass };

    console.log('--- Fuzzing Pagination ---');

    // Helper
    async function testParams(label: string, params: any) {
        try {
            const p = { $format: 'json', ...params };
            console.log(`Testing [${label}]:`, JSON.stringify(params));
            const res: any = await lastValueFrom(http.get(url, { params: p, auth }));
            const data = res.data.value || [];
            const count = data.length;
            let firstId = 'N/A';
            if (count > 0) firstId = data[0].cod_cliente || data[0].id;
            console.log(`  -> Count: ${count}, FirstID: ${firstId}`);
            return firstId;
        } catch (e: any) {
            console.log(`  -> Error: ${e.message}`);
            return 'ERROR';
        }
    }

    // Baseline: Get First 5
    const baseId = await testParams('Baseline ($top=5)', { $top: 5 });

    if (baseId === 'ERROR' || baseId === 'N/A') {
        console.error('Baseline failed. Aborting.');
        return;
    }

    // Test 0: Large Batch ($top=2000)
    // If this works, maybe we can just fetch big chunks?
    await testParams('Large Batch ($top=2000)', { $top: 2000 });

    // Test 1: $skip=5
    const skipId = await testParams('$skip=5', { $top: 5, $skip: 5 });
    // logic to check skip...

    // Test 2: skip=5 (no $)
    await testParams('skip=5', { top: 5, skip: 5 });

    // Test 3: Skip=5 (Pascal)
    await testParams('Skip=5', { Top: 5, Skip: 5 });

    // Test 4: start=5
    await testParams('start=5', { limit: 5, start: 5 });

    // Test 5: offset=5
    await testParams('offset=5', { limit: 5, offset: 5 });
}

bootstrap();
