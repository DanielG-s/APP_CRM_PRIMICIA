import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';
import { tenantContext } from './src/common/tenancy/tenant.context';

async function bootstrap() {
    console.log('--- STRICT TENANCY VALIDATION ---');

    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    // 1. Create Mock Orgs
    const orgA = await prisma.organization.create({ data: { name: 'Org A Test' } });
    const orgB = await prisma.organization.create({ data: { name: 'Org B Test' } });

    console.log(`\nCreated Org A: ${orgA.id}`);
    console.log(`Created Org B: ${orgB.id}`);

    // Create Data in Org A
    const custA1 = await prisma.customer.create({
        data: { name: 'Customer A1', organizationId: orgA.id }
    });
    const custA2 = await prisma.customer.create({
        data: { name: 'Customer A2', organizationId: orgA.id }
    });

    // Create Data in Org B
    const custB1 = await prisma.customer.create({
        data: { name: 'Customer B1', organizationId: orgB.id }
    });

    console.log(`\n--- Test 1: Org A cannot read Org B (findMany) ---`);
    await tenantContext.run({ organizationId: orgA.id, role: 'VENDEDOR' }, async () => {
        const customers = await prisma.customer.findMany();
        const hasOrgB = customers.some(c => c.organizationId === orgB.id);
        console.log(`findMany returns ${customers.length} records. Leak block success: ${!hasOrgB}`);
    });

    console.log(`\n--- Test 2: Org A cannot read Org B (findUnique) ---`);
    await tenantContext.run({ organizationId: orgA.id, role: 'VENDEDOR' }, async () => {
        try {
            const c = await prisma.customer.findUnique({ where: { id: custB1.id } });
            console.log(`findUnique block success: ${c === null}`);
        } catch (e) {
            console.log('findUnique block success: Yes (Error thrown or null returned)');
        }
    });

    console.log(`\n--- Test 3: Org A cannot aggregate Org B (aggregate) ---`);
    await tenantContext.run({ organizationId: orgA.id, role: 'VENDEDOR' }, async () => {
        const agg = await prisma.customer.count();
        console.log(`Count items in scope: ${agg}. Leak block success: ${agg === 2}`);
    });

    console.log(`\n--- Test 4: Org A cannot update Org B (updateMany) ---`);
    await tenantContext.run({ organizationId: orgA.id, role: 'VENDEDOR' }, async () => {
        const updateResult = await prisma.customer.updateMany({
            where: { id: custB1.id },
            data: { name: 'Hacked by A' }
        });
        console.log(`updateMany affected: ${updateResult.count}. Leak block success: ${updateResult.count === 0}`);
    });

    console.log(`\n--- Test 5: Org A cannot delete Org B (deleteMany) ---`);
    await tenantContext.run({ organizationId: orgA.id, role: 'VENDEDOR' }, async () => {
        const deleteResult = await prisma.customer.deleteMany({
            where: { id: custB1.id }
        });
        console.log(`deleteMany affected: ${deleteResult.count}. Leak block success: ${deleteResult.count === 0}`);
    });

    console.log(`\n--- Test 6: Auto-inject on Create ---`);
    await tenantContext.run({ organizationId: orgB.id, role: 'VENDEDOR' }, async () => {
        // Intentionally omit organizationId
        const newCust = await prisma.customer.create({
            data: { name: 'Auto Injected B' } as any
        });
        console.log(`Created new customer. organizationId auto-injected: ${newCust.organizationId === orgB.id}`);
    });

    // Cleanup
    await prisma.customer.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });

    await app.close();
    console.log('\nTenancy Validation Complete.');
}

bootstrap().catch(console.error);
