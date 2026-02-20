
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting Full Customer Wipe...');

    console.log('1. Deleting Dependent Data (Transactions, Conversations, History)...');

    // Delete in order of dependency to avoid foreign key errors
    await prisma.transaction.deleteMany({});
    console.log('   - Transactions deleted.');

    await prisma.conversation.deleteMany({});
    console.log('   - Conversations deleted.');

    await prisma.customerEvent.deleteMany({});
    console.log('   - Customer Events deleted.');

    await prisma.rfmHistory.deleteMany({});
    console.log('   - RFM History deleted.');

    await prisma.surveyResponse.deleteMany({});
    console.log('   - Survey Responses deleted.');

    console.log('2. Deleting Customers...');
    const result = await prisma.customer.deleteMany({});
    console.log(`   - ${result.count} Customers deleted.`);

    console.log('✅ Database Cleaned Successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Error cleaning database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
