
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    try {
        console.log('🗑️  Deleting All Sales/Transactions...');
        const result = await prisma.transaction.deleteMany({});
        console.log(`✅ Deleted ${result.count} transactions.`);
    } catch (error) {
        console.error('❌ Error deleting transactions:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
