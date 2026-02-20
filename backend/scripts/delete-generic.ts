
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    try {
        console.log("🧹 Cleaning up generic 'CONSUMIDOR FINAL'...");

        // 1. Find the customer
        const consumer = await prisma.customer.findFirst({
            where: {
                OR: [
                    { externalId: '00001' },
                    { name: { contains: 'CONSUMIDOR FINAL', mode: 'insensitive' } }
                ]
            }
        });

        if (consumer) {
            console.log(`🗑️ Deleting customer: ${consumer.name} (ID: ${consumer.id}) and their transactions...`);

            // Delete transactions first (due to foreign key)
            const txDelete = await prisma.transaction.deleteMany({
                where: { customerId: consumer.id }
            });
            console.log(`✅ Deleted ${txDelete.count} transactions.`);

            // Delete customer
            await prisma.customer.delete({
                where: { id: consumer.id }
            });
            console.log("✅ Customer deleted.");
        } else {
            console.log("ℹ️ No generic consumer found.");
        }

    } catch (error) {
        console.error("❌ Error during cleanup:", error);
    } finally {
        await app.close();
    }
}

bootstrap();
