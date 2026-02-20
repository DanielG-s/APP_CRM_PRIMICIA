
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    try {
        console.log("🔍 Searching for 'CONSUMIDOR FINAL'...");
        const consumers = await prisma.customer.findMany({
            where: {
                name: {
                    contains: 'CONSUMIDOR',
                    mode: 'insensitive' // Postgres specific, but works with prisma if provider supports
                }
            },
            include: {
                transactions: {
                    take: 5
                }
            }
        });

        if (consumers.length === 0) {
            console.log("❌ No customer found with name containing 'CONSUMIDOR'.");
        } else {
            console.log(`✅ Found ${consumers.length} customers.`);
            for (const c of consumers) {
                console.log(`\n--- Customer: ${c.name} (ID: ${c.id}, ExternalID: ${c.externalId}) ---`);
                console.log(`Email: ${c.email}`);
                console.log(`CPF: ${c.cpf}`);
                console.log(`Total Transactions: ${c.transactions.length} (showing recent)`);
                // Actually count real total
                const txCount = await prisma.transaction.count({ where: { customerId: c.id } });
                console.log(`Real Transaction Count: ${txCount}`);
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await app.close();
    }
}

bootstrap();
