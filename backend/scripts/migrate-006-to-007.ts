import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    console.log('--- Migrando Transações da Loja 006 para 007 ---');

    // 1. Encontrar as lojas pelos códigos
    const store006 = await (prisma.store as any).findUnique({ where: { code: '006' } });
    const store007 = await (prisma.store as any).findUnique({ where: { code: '007' } });

    if (!store006 || !store007) {
        console.error('Lojas 006 ou 007 não encontradas no banco.');
        if (!store006) console.log('Dica: Talvez a 006 já tenha sido excluída ou nunca sincronizada.');
        process.exit(1);
    }

    console.log('ID Loja 006:', store006.id);
    console.log('ID Loja 007:', store007.id);

    // 2. Mover transações
    const txUpdate = await prisma.transaction.updateMany({
        where: { storeId: store006.id },
        data: { storeId: store007.id }
    });

    console.log('Total de transações movidas:', txUpdate.count);

    // 3. Mover clientes (se houver clientes vinculados exclusivamente à 006)
    const customerUpdate = await prisma.customer.updateMany({
        where: { storeId: store006.id },
        data: { storeId: store007.id }
    });

    console.log('Total de clientes re-vinculados:', customerUpdate.count);

    console.log('--- Migração Concluída ---');
}

run()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
