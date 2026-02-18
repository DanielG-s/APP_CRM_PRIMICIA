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

    console.log('--- Verifying trans_id Sequentiality ---');

    async function checkBatch(label: string, params: any) {
        try {
            const p = { $format: 'json', ...params };
            console.log(`Testing [${label}]:`, JSON.stringify(params));
            const res: any = await lastValueFrom(http.get(url, { params: p, auth }));
            const data = res.data.value || [];

            if (data.length === 0) {
                console.log('  -> Empty batch.');
                return;
            }

            console.log(`  -> Fetched ${data.length} items.`);

            let isSequential = true;
            let minId = data[0].trans_id;
            let maxId = data[0].trans_id;
            let unsortedCount = 0;

            for (let i = 0; i < data.length - 1; i++) {
                const current = data[i].trans_id;
                const next = data[i + 1].trans_id;

                if (current > next) {
                    console.log(`  !!! OUT OF ORDER: [${i}] ${current} > [${i + 1}] ${next}`);
                    isSequential = false;
                    unsortedCount++;
                }
                if (current < minId) minId = current;
                if (current > maxId) maxId = current;
                if (next < minId) minId = next;
                if (next > maxId) maxId = next;
            }

            if (isSequential) {
                console.log(`  ---> ✅ STRICTLY INCREASING (Min: ${minId}, Max: ${maxId})`);
            } else {
                console.log(`  ---> ❌ NOT SEQUENTIAL (${unsortedCount} violations)`);
            }

        } catch (e: any) {
            console.log(`  -> Error: ${e.message}`);
        }
    }

    // 1. Test WITHOUT $orderby (Natural Order)
    await checkBatch('Natural Order (No $orderby)', { $top: 100 });

    // 2. Test WITH $orderby (Explicit)
    await checkBatch('Explicit Order ($orderby=trans_id)', { $top: 100, $orderby: 'trans_id' });

}

bootstrap();
