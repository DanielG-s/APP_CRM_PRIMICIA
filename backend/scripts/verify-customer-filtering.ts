import { Test } from '@nestjs/testing';
import { MilleniumService } from '../src/modules/erp/millenium/millenium.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

async function bootstrap() {
    const moduleRef = await Test.createTestingModule({
        imports: [
            HttpModule,
            ConfigModule.forRoot({ isGlobal: true }),
        ],
        providers: [
            MilleniumService,
            Logger
        ]
    }).compile();

    const milleniumService = moduleRef.get<MilleniumService>(MilleniumService);
    const httpService = (milleniumService as any).httpService;
    const apiUrl = (milleniumService as any).apiUrl;

    console.log('Verifying Customer Endpoint Filtering...');

    try {
        // 1. Fetch recent customers (Last 5)
        console.log('\n--- 1. Fetching recent customers (no filter) ---');
        const response: any = await lastValueFrom(
            httpService.get(`${apiUrl}/clientes/lista`, {
                params: { $format: 'json', $top: 5 }
            })
        );
        const customers = response.data.value || [];
        const countNoFilter = customers.length;
        console.log(`Fetched: ${countNoFilter}`);

        if (countNoFilter === 0) {
            console.log('No customers found.');
            return;
        }

        // 2. Test OData Filter with FUTURE DATE
        // If filtering works, this should return 0 results.
        // If filtering is ignored, it will return > 0 results (likely 5).
        const futureDate = new Date();
        futureDate.setFullYear(2030);
        const futureIso = futureDate.toISOString();

        console.log(`\n--- 2. Testing OData $filter with FUTURE DATE (${futureIso}) ---`);
        // Syntax: data_atualizacao gt datetime'YYYY-MM-DDTHH:mm:ss.sssZ'
        // Note: Millenium might be picky about 'datetime' vs just string.
        // Trying the standard OData format first.

        try {
            const respFilter: any = await lastValueFrom(
                httpService.get(`${apiUrl}/clientes/lista`, {
                    params: {
                        $format: 'json',
                        $top: 5,
                        $filter: `data_atualizacao gt datetime'${futureIso}'`
                    }
                })
            );
            const countFilter = respFilter.data.value?.length || 0;
            console.log(`Count with Future Date $filter: ${countFilter}`);

            if (countFilter > 0) {
                console.log('❌ CONCLUSÃO: O filtro foi IGNORADO (retornou registros do futuro).');
            } else {
                console.log('✅ CONCLUSÃO: O filtro FUNCIONOU (retornou 0 registros).');
            }
        } catch (e) {
            console.log(`Error with $filter: ${e.message}`);
            if (e.response) console.log(e.response.data);
        }

    } catch (error) {
        console.error('General Error:', error.message);
    }
}

bootstrap();
