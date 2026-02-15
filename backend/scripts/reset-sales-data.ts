
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- RESETTING CRM DATA ---');
    console.log('⚠️  This will delete all Transactions and Customers!');

    try {
        // 1. Delete Transactions first (Foreign Key constraint)
        const deletedTransactions = await prisma.transaction.deleteMany({});
        console.log(`✅ Deleted ${deletedTransactions.count} Transactions.`);

        // 1.5 Delete Dependencies (RfmHistory)
        try {
            const deletedRfm = await prisma.rfmHistory.deleteMany({});
            console.log(`✅ Deleted ${deletedRfm.count} RfmHistory records.`);
        } catch (e) { console.warn('⚠️  RfmHistory deletion skipped/failed'); }

        // 2. Delete Customers
        const deletedCustomers = await prisma.customer.deleteMany({});
        console.log(`✅ Deleted ${deletedCustomers.count} Customers.`);

        // 3. Reset Stores? Maybe keep them. User said "dados atuais", usually implies transactional data.
        // Keeping Stores for now to avoid breaking config if any.

        console.log('--- DATA RESET COMPLETE ---');

    } catch (error) {
        console.error('❌ Error resetting data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
