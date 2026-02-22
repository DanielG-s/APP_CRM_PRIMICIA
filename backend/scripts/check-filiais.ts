import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MilleniumService } from '../src/modules/erp/millenium/millenium.service';

async function bootstrap() {
    console.log('--- Checking Millenium Filiais API ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    const milleniumService = app.get(MilleniumService);

    try {
        const filiais = await milleniumService.getFiliais();
        console.log(`Found ${filiais.length} filiais`);
        if (filiais.length > 0) {
            console.log('Sample 1:', filiais[0]);
            console.log('Sample 2:', filiais[1]);
            console.log('Sample 3:', filiais[2]);
            console.log('Sample randomly in the middle:', filiais[Math.floor(filiais.length / 2)]);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
