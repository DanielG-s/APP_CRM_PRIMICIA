import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MilleniumService } from '../src/modules/erp/millenium/millenium.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(MilleniumService);

    console.log('--- Analyzing Email Duplicates (Sampling 20k records) ---');

    const emailMap = new Map<string, any[]>();
    let totalProcessed = 0;
    const sampleSize = 20000;

    // We'll reuse the recursive/loop logic manually here or just call the service method if accessible?
    // Let's call getCustomersKeyset directly but limit it.

    try {
        // Fetch 20k
        const customers = await service.getCustomersKeyset({ limit: sampleSize });
        totalProcessed = customers.length;

        console.log(`Analyzing ${totalProcessed} records...`);

        for (const c of customers) {
            const email = c.e_mail?.toLowerCase()?.trim();
            if (!email) continue;

            if (!emailMap.has(email)) {
                emailMap.set(email, []);
            }
            const list = emailMap.get(email);
            if (list) {
                list.push({
                    id: c.cod_cliente,
                    name: c.nome,
                    trans_id: c.trans_id
                });
            }
        }

        console.log('--- DUPLICATE REPORT ---');
        let duplicateCount = 0;
        for (const [email, usage] of emailMap.entries()) {
            if (usage.length > 1) {
                duplicateCount++;
                if (duplicateCount <= 10) { // Show top 10
                    console.log(`\nEmail: [${email}] is used by ${usage.length} customers:`);
                    usage.forEach(u => console.log(`   - ID: ${u.id} | Name: ${u.name}`));
                }
            }
        }

        console.log(`\nTotal Duplicates Found (in sample): ${duplicateCount}`);

    } catch (e) {
        console.error(e);
    } finally {
        await app.close();
    }
}

bootstrap();
