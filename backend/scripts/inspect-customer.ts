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

    console.log('--- Inspecting Customer Object ---');

    try {
        const res: any = await lastValueFrom(http.get(url, {
            params: { $format: 'json', $top: 1 },
            auth
        }));

        const data = res.data.value || [];
        if (data.length > 0) {
            console.log('Customer Keys:', Object.keys(data[0]));
            console.log('Full Object:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('No customers returned.');
        }

    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await app.close();
    }
}

bootstrap();
