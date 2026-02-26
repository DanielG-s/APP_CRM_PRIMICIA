import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/modules/config/users/users.service';
import { PrismaService } from './src/prisma/prisma.service';

async function testInvite() {
    console.log('--- TEST CLERK ORG INVITE FLOW ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const prisma = app.get(PrismaService);

    const admin = await prisma.user.findFirst({ where: { role: { level: 0 } } });

    if (!admin) {
        console.error('Nenhum SUPER_ADMIN encontrado.');
        await app.close();
        return;
    }

    console.log(`Admin: ${admin.email} (clerkId: ${admin.clerkId})`);

    const org = await prisma.organization.findUnique({ where: { id: admin.organizationId } }) as any;
    console.log(`Org: ${org?.name} (clerkOrgId: ${org?.clerkOrgId})`);

    // Primeiro deletar o convite anterior (se houver) para testar novamente
    await prisma.user.deleteMany({ where: { email: 'daniel_galdencio@hotmail.com' } });
    console.log('Removido convite anterior (se existia).\n');

    try {
        const result = await usersService.inviteUser(
            admin,
            'daniel_galdencio@hotmail.com',
            'Daniel Galdêncio',
            'GERENTE_GERAL',
        );
        console.log('✅ Convite via Clerk Organization disparado!');
        console.log('Registro local:', JSON.stringify(result, null, 2));
        console.log('\n→ Verifique o email. Dessa vez o convite é DENTRO da organização do Clerk!');
    } catch (error: any) {
        console.error('❌ Erro:', error.message || error);
    }

    await app.close();
}

testInvite().catch(console.error);
