// backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- CONFIGURAÇÕES DO GERADOR ---
const TOTAL_STORES = 5;
const TOTAL_CUSTOMERS = 300;
const TRANSACTIONS_PER_MONTH = 100;
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
  console.log('🌱 Iniciando Seed Completo do Banco de Dados...');

  // 1. Limpar dados antigos
  console.log('🧹 Limpando tabelas antigas...');
  try {
    // Limpeza de Campanhas e suas dependências
    await prisma.campaignMetric.deleteMany();
    await prisma.campaignContent.deleteMany();
    await prisma.campaignSchedule.deleteMany();
    await prisma.campaign.deleteMany();
    
    // Limpeza do CRM Core
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.store.deleteMany();
  } catch (e) {
    console.log('   (Tabelas já estavam vazias ou erro ignorado)');
  }

  // 2. Criar Lojas
  console.log('🏪 Criando Lojas...');
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
  const createdCustomers: any[] = [];

  for (let i = 0; i < TOTAL_CUSTOMERS; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: `Cliente Teste ${i + 1}`,
        email: `cliente${i + 1}@exemplo.com`,
        phone: `1199999${i.toString().padStart(4, '0')}`,
        storeId: createdStores[i % createdStores.length].id,
        propensityScore: Math.random() * 100,
        propensityLabel: Math.random() > 0.7 ? 'Alta' : 'Média',
      },
    });
    createdCustomers.push(customer);
  }

  // 4. Gerar Transações (Histórico de 12 meses)
  console.log('💳 Gerando Transações (Receita)...');
  
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setMonth(today.getMonth() - MONTHS_HISTORY);

  const transactionsData: any[] = [];
  const totalTransactions = TRANSACTIONS_PER_MONTH * MONTHS_HISTORY;
  
  for (let i = 0; i < totalTransactions; i++) {
    const store = createdStores[Math.floor(Math.random() * createdStores.length)];
    const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
    
    const channelInfo = getRandomChannel();
    const isInfluenced = Math.random() < channelInfo.influencedChance;

    const timeOffset = Math.pow(Math.random(), 0.5) * (today.getTime() - oneYearAgo.getTime());
    const date = new Date(today.getTime() - timeOffset);

    const baseValue = 150 + Math.random() * 650;
    const totalValue = Number(baseValue.toFixed(2));

    transactionsData.push({
      storeId: store.id,
      customerId: customer.id,
      totalValue: totalValue,
      date: date,
      items: {}, 
      channel: channelInfo.name,
      isInfluenced: isInfluenced,
    });
  }

  await prisma.transaction.createMany({
    data: transactionsData,
  });

  // --- 5. GERAR CAMPANHAS (NOVO CÓDIGO) ---
  console.log('📢 Gerando Campanhas com Métricas Detalhadas (Soft/Hard Bounces, Spam)...');
  
  // Vamos gerar campanhas dos últimos 60 dias até hoje
  const campaignStartDate = new Date();
  campaignStartDate.setDate(today.getDate() - 60);
  
  const campaignsData: any[] = [];
  let currentCampaignDate = new Date(campaignStartDate);

  while (currentCampaignDate <= today) {
    // 1 ou 2 campanhas por dia
    const dailyCampaignsCount = Math.random() > 0.7 ? 2 : 1;

    for (let k = 0; k < dailyCampaignsCount; k++) {
        // Escolher uma loja aleatória para ser a "dona" da campanha
        const store = createdStores[Math.floor(Math.random() * createdStores.length)];
        
        // Volume de envio (entre 2000 e 5000)
        const sent = Math.floor(Math.random() * 3000) + 2000;
        
        // Funil de Métricas
        const delivered = Math.floor(sent * (0.95 + Math.random() * 0.04)); // 95-99% entregue
        const totalBounces = sent - delivered;
        
        // Distribuição de Bounces
        const softBounces = Math.floor(totalBounces * 0.7); // 70% soft
        const hardBounces = totalBounces - softBounces;     // 30% hard

        // Engajamento
        const opens = Math.floor(delivered * (0.15 + Math.random() * 0.15)); // 15-30% abertura
        const clicks = Math.floor(opens * (0.10 + Math.random() * 0.10));    // 10-20% clique

        // Rejeição
        const unsubscribes = Math.floor(Math.random() * 15); // 0-15 descadastros
        const spamReports = Math.floor(Math.random() * 4);   // 0-4 spams

        campaignsData.push({
            storeId: store.id,
            name: `Campanha Diária ${k+1} - ${currentCampaignDate.getDate()}/${currentCampaignDate.getMonth() + 1}`,
            channel: Math.random() > 0.5 ? 'E-mail' : 'WhatsApp', // Alterna canais
            status: 'sent',
            segmentId: 'all',
            audienceSize: sent,
            date: new Date(currentCampaignDate), // Importante para o gráfico diário
            
            // Métricas
            sent,
            delivered,
            opens,
            clicks,
            softBounces,
            hardBounces,
            spamReports,
            unsubscribes,

            // Configuração fake
            config: { subject: "Oferta Exclusiva" },
            content: { body: "Conteúdo da campanha..." },
            
            // Datas de auditoria
            createdAt: new Date(currentCampaignDate),
            updatedAt: new Date(currentCampaignDate)
        });
    }
    // Avançar dia
    currentCampaignDate.setDate(currentCampaignDate.getDate() + 1);
  }

  await prisma.campaign.createMany({
    data: campaignsData,
  });

  console.log(`✅ Seed concluído!`);
  console.log(`📊 Resumo:`);
  console.log(`   - ${createdStores.length} Lojas`);
  console.log(`   - ${createdCustomers.length} Clientes`);
  console.log(`   - ${transactionsData.length} Transações`);
  console.log(`   - ${campaignsData.length} Campanhas com métricas de Bounces/Rejeições`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });