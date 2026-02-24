import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function migrateRoles() {
    console.log('--- MIGRANDO CARGOS (ROLES) VIA BACKUP ---');
    let backupData: any[] = [];
    try {
        const raw = fs.readFileSync('users_roles_backup.json', 'utf8');
        backupData = JSON.parse(raw);
    } catch (e) {
        console.error('Nenhum backup encontrado. Criando apenas Roles padrões para organizações existentes...');
    }

    // 1. Pegar todas as organizações
    const orgs = await prisma.organization.findMany({ select: { id: true } });

    // 2. Criar as roles básicas para cada organização
    const rolesByOrg = new Map<string, any>();

    for (const org of orgs) {
        console.log(`Configurando roles para org: ${org.id}`);

        // Super Admin (Level 0)
        const superAdmin = await prisma.role.upsert({
            where: { organizationId_name: { organizationId: org.id, name: 'Super Admin' } },
            create: {
                organizationId: org.id,
                name: 'Super Admin',
                description: 'Acesso total ao sistema',
                level: 0,
                permissions: ['*']
            },
            update: {}
        });

        // Gerente Geral (Level 10)
        const gerenteGeral = await prisma.role.upsert({
            where: { organizationId_name: { organizationId: org.id, name: 'Gerente Geral' } },
            create: {
                organizationId: org.id,
                name: 'Gerente Geral',
                description: 'Gestão da equipe e relatórios completos',
                level: 10,
                permissions: ['crm:read', 'crm:write', 'settings:read', 'users:read', 'users:write']
            },
            update: {}
        });

        // Vendedor (Level 30)
        const vendedor = await prisma.role.upsert({
            where: { organizationId_name: { organizationId: org.id, name: 'Vendedor' } },
            create: {
                organizationId: org.id,
                name: 'Vendedor',
                description: 'Acesso restrito apenas a vendas e clientes atribuídos',
                level: 30,
                permissions: ['crm:read', 'crm:write']
            },
            update: {}
        });

        rolesByOrg.set(org.id, {
            SUPER_ADMIN: superAdmin.id,
            GERENTE_GERAL: gerenteGeral.id,
            GERENTE_LOJA: gerenteGeral.id, // Fallback p/ Gerente Loja
            VENDEDOR: vendedor.id,
        });
    }

    // 3. Restaurar as roles dos usuários do backup
    console.log('Restaurando Níveis de Usuários...');
    let restoredCount = 0;
    for (const userLine of backupData) {
        const orgRoles = rolesByOrg.get(userLine.organizationId);
        if (!orgRoles) continue;

        const roleName = userLine.role || 'VENDEDOR';
        const newRoleId = orgRoles[roleName] || orgRoles.VENDEDOR;

        await prisma.user.updateMany({
            where: { id: userLine.id },
            data: { roleId: newRoleId }
        });
        restoredCount++;
    }

    console.log(`Migração Finalizada. ${restoredCount} usuários atualizados.`);
    await prisma.$disconnect();
}

migrateRoles().catch(console.error);
