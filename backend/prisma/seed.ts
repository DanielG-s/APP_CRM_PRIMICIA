import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- CONFIGURAÇÕES DO GERADOR ---
const TOTAL_STORES = 5;
const TOTAL_CUSTOMERS = 300;
const TRANSACTIONS_PER_MONTH = 100; // Ajuste para mais ou menos volume
const MONTHS_HISTORY = 12;

// Arrays auxiliares para realismo
const STORE_NAMES = [
  'Primícia - Matriz Centro',
  'Primícia - Shopping Iguatemi',
  'Primícia - Norte Shopping',
  'Primícia - Filial Jardins',
  'Primícia - Outlet Sul',
];

const CHANNELS_DISTRIBUTION = [
  { name: 'Loja Física', weight: 0.5, influencedChance: 0.1 },
  { name: 'WhatsApp', weight: 0.25, influencedChance: 0.9 },
  { name: 'E-mail', weight: 0.15, influencedChance: 0.8 },
  { name: 'SMS', weight: 0.05, influencedChance: 0.7 },
  { name: 'Agenda', weight: 0.05, influencedChance: 0.6 },
];

function getRandomChannel() {
  const r = Math.random();
  let accumulated = 0;
  for (const ch of CHANNELS_DISTRIBUTION) {
    accumulated += ch.weight;
    if (r <= accumulated) return ch;
  }
  return CHANNELS_DISTRIBUTION[0];
}

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados...');

  // 1. Limpar dados antigos (Ordem importa por causa das chaves estrangeiras)
  console.log('🧹 Limpando tabelas antigas...');
  try {
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.store.deleteMany();
  } catch (e) {
    console.log('   (Tabelas já estavam vazias ou erro ignorado)');
  }

  // 2. Criar Lojas
  console.log('🏪 Criando Lojas...');
  // CORREÇÃO: Tipando explicitamente como any[] para o TS não reclamar
  const createdStores: any[] = []; 
  
  for (let i = 0; i < TOTAL_STORES; i++) {
    const store = await prisma.store.create({
      data: {
        name: STORE_NAMES[i],
        cnpj: `12.345.678/000${i + 1}-00`,
        cityNormalized: 'São Paulo',
      },
    });
    createdStores.push(store);
  }

  // 3. Criar Clientes (Base CRM)
  console.log('👥 Criando Clientes...');
  // CORREÇÃO: Tipando explicitamente como any[]
  const createdCustomers: any[] = [];

  for (let i = 0; i < TOTAL_CUSTOMERS; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: `Cliente Teste ${i + 1}`,
        email: `cliente${i + 1}@exemplo.com`,
        phone: `1199999${i.toString().padStart(4, '0')}`,
        storeId: createdStores[i % createdStores.length].id, // Distribui entre lojas
        propensityScore: Math.random() * 100,
        propensityLabel: Math.random() > 0.7 ? 'Alta' : 'Média',
      },
    });
    createdCustomers.push(customer);
  }

  // 4. Gerar Transações (Histórico de 12 meses)
  console.log('💳 Gerando Transações (pode demorar um pouco)...');
  
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setMonth(today.getMonth() - MONTHS_HISTORY);

  // CORREÇÃO: Tipando explicitamente como any[]
  const transactionsData: any[] = [];

  // Loop para criar volume
  const totalTransactions = TRANSACTIONS_PER_MONTH * MONTHS_HISTORY;
  
  for (let i = 0; i < totalTransactions; i++) {
    // Escolher Loja e Cliente Aleatórios
    const store = createdStores[Math.floor(Math.random() * createdStores.length)];
    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
    
    // Escolher Canal e Influência
    const channelInfo = getRandomChannel();
    const isInfluenced = Math.random() < channelInfo.influencedChance;

    // Gerar Data (com tendência de crescimento recente)
    const timeOffset = Math.pow(Math.random(), 0.5) * (today.getTime() - oneYearAgo.getTime());
    const date = new Date(today.getTime() - timeOffset);

    // Gerar Valor (Ticket Médio variado)
    const baseValue = 150 + Math.random() * 650;
    const totalValue = Number(baseValue.toFixed(2));

    transactionsData.push({
      storeId: store.id,
      customerId: customer.id,
      totalValue: totalValue,
      date: date,
      items: {}, // JSON vazio
      channel: channelInfo.name,
      isInfluenced: isInfluenced,
    });
  }

  // Inserção em Lote
  await prisma.transaction.createMany({
    data: transactionsData,
  });

  console.log(`✅ Seed concluído!`);
  console.log(`📊 Resumo:`);
  console.log(`   - ${createdStores.length} Lojas`);
  console.log(`   - ${createdCustomers.length} Clientes`);
  console.log(`   - ${transactionsData.length} Transações geradas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });