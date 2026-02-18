import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    console.log('Verifying Customer Data...');
    try {
        const count = await prisma.customer.count();
        console.log(`Total Customers in DB: ${count}`);

        if (count > 0) {
            const sample = await prisma.customer.findFirst({
                orderBy: { updatedAt: 'desc' }
            });
            console.log('Latest Customer Sample:', JSON.stringify(sample, null, 2));
        }
    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
