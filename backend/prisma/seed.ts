import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed...');

  // 1. Limpar banco (opcional, cuidado em produção)
  await prisma.transaction.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // 2. Criar Loja e Usuário
  const store = await prisma.store.create({
    data: {
      name: 'Loja Matriz - SP',
      cnpj: '12.345.678/0001-90',
      cityNormalized: 'São Paulo'
    }
  });

  const user = await prisma.user.create({
    data: {
      email: 'admin@primicia.com',
      password: 'hash-password', // Em produção use hash real
      role: 'ADMIN',
      storeId: store.id
    }
  });

  // 3. Dados para gerar variedade
  const CAMPAIGN_TYPES = ['Diário', 'Semanal', 'Mensal', 'Apenas uma vez', 'Assim que ativar', 'Comportamento'];
  const CHANNELS = ['E-mail', 'WhatsApp', 'SMS', 'Mobile push'];
  const TAGS_POOL = ['fim de ano', 'feliz natal', '10%', 'black friday', 'vip', 'recuperação'];

  console.log('🚀 Criando Campanhas...');

  // Criar 20 Campanhas variadas nos últimos 60 dias
  for (let i = 0; i < 20; i++) {
    const type = CAMPAIGN_TYPES[i % CAMPAIGN_TYPES.length];
    const channel = CHANNELS[i % CHANNELS.length];
    const date = subDays(new Date(), Math.floor(Math.random() * 60));
    
    // Seleciona 2 tags aleatórias
    const tags = [
        TAGS_POOL[Math.floor(Math.random() * TAGS_POOL.length)],
        TAGS_POOL[Math.floor(Math.random() * TAGS_POOL.length)]
    ];

    await prisma.campaign.create({
      data: {
        storeId: store.id,
        name: `Campanha ${type} - ${channel} ${i+1}`,
        channel: channel,
        type: type, // AQUI ESTÁ O SEGREDO: Salvando o tipo correto
        tags: tags, // E as tags corretas
        status: 'sent',
        date: date,
        sent: 1000 + Math.floor(Math.random() * 5000),
        delivered: 900 + Math.floor(Math.random() * 4000),
        opens: 400 + Math.floor(Math.random() * 2000),
        clicks: 100 + Math.floor(Math.random() * 500),
        softBounces: 10,
        hardBounces: 5,
        spamReports: 2,
        unsubscribes: 5,
        audienceSize: 1000
      }
    });
  }

  console.log('💰 Criando Vendas...');

  // Criar Clientes e Transações
  for (let i = 0; i < 50; i++) {
    const customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        name: `Cliente ${i}`,
        email: `cliente${i}@email.com`,
      }
    });

    // Cria transações para esse cliente
    for (let j = 0; j < 3; j++) {
        const isInfluenced = Math.random() > 0.5;
        await prisma.transaction.create({
            data: {
                storeId: store.id,
                customerId: customer.id,
                totalValue: 150 + Math.random() * 500,
                date: subDays(new Date(), Math.floor(Math.random() * 60)),
                items: {},
                channel: isInfluenced ? CHANNELS[Math.floor(Math.random() * CHANNELS.length)] : 'Loja Física',
                isInfluenced: isInfluenced
            }
        });
    }
  }

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });