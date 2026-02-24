import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function backupRoles() {
    console.log('Buscando usuários atuais...');
    const users = await prisma.$queryRaw`SELECT id, email, role, "organizationId" FROM "User"`;

    fs.writeFileSync('users_roles_backup.json', JSON.stringify(users, null, 2));
    console.log(`Backup concluído! Foram salvos ${Array.isArray(users) ? users.length : 0} usuários.`);
    await prisma.$disconnect();
}

backupRoles().catch(e => {
    console.error('Erro no backup:', e);
    process.exit(1);
});
