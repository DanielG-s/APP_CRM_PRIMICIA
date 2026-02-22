import { PrismaClient } from '@prisma/client';
import { fakerPT_BR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Configuração de Canais
const SALES_CHANNELS = [
  { value: 'Loja Física', weight: 40 },
  { value: 'WhatsApp', weight: 30 },
  { value: 'E-commerce', weight: 20 },
  { value: 'Instagram', weight: 5 },
  { value: 'Marketplace', weight: 5 }
];

// Helper para Gerar Datas Controladas (O Segredo!)
function getWeightedDate() {
  const rand = Math.random();

  if (rand < 0.20) {
    // 20% em 2024 (Histórico distante)
    return faker.date.between({
      from: '2024-01-01T00:00:00.000Z',
      to: '2024-12-31T23:59:59.000Z'
    });
  } else if (rand < 0.85) {
    // 65% em 2025 (O ANO INTEIRO PREENCHIDO)
    // Isso garante que o intervalo Jan/25 - Jan/26 tenha muitos dados
    return faker.date.between({
      from: '2025-01-01T00:00:00.000Z',
      to: '2025-12-31T23:59:59.000Z'
    });
  } else {
    // 15% em Jan/2026 (Dados recentes)
    return faker.date.between({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-30T23:59:59.000Z'
    });
  }
}

async function main() {
  console.log('🚀 Iniciando Seed "Ano Completo" (2025 Preenchido)...');

  // 1. Limpeza
  const cleanTable = async (model: any) => { try { await model.deleteMany(); } catch (e) { } };
  await cleanTable(prisma.campaignMetric);
  await cleanTable(prisma.campaignContent);
  await cleanTable(prisma.campaignSchedule);
  await cleanTable(prisma.campaign);
  await cleanTable(prisma.segmentHistory);
  await cleanTable(prisma.segment);
  await cleanTable(prisma.transaction);
  await cleanTable(prisma.storeWhatsappNumber);
  await cleanTable(prisma.emailSettings);
  await cleanTable(prisma.conversation);
  await cleanTable(prisma.customerEvent);
  await cleanTable(prisma.rfmHistory);
  await cleanTable(prisma.customer);
  await cleanTable(prisma.user);
  await cleanTable(prisma.store);

  // 2. Loja e Admin
  const store = await prisma.store.create({
    data: {
      id: 'DEFAULT', // Force ID for SyncService compatibility
      name: 'Primícia Modas - Matriz',
      cnpj: '12.345.678/0001-90',
      cityNormalized: 'sao paulo',
      users: {
        create: { name: 'Daniel Admin', email: 'admin@primicia.com', password: 'admin', role: 'GERENTE_GERAL' },
      },
      emailSettings: {
        create: {
          senderName: 'Equipe Primícia', senderEmail: 'news@primicia.com.br',
          host: 'smtp.sendgrid.net', port: 587, user: 'apikey', pass: 'SG.fake', secure: true
        }
      },
      whatsappNumbers: {
        create: [
          { name: 'Loja 01', number: '5511999998888', provider: 'evolution', status: 'CONNECTED', isDefault: true }
        ]
      }
    },
  });

  console.log(`🏪 Loja criada: ${store.name}`);

  // 3. Produtos (SKIP)
  /*
  const products = [
    { name: 'Camiseta Básica', price: 49.90 },
    { name: 'Calça Jeans Premium', price: 149.90 },
    { name: 'Vestido Verão', price: 199.90 },
    { name: 'Tênis Casual', price: 299.90 },
  ];
  */

  // 4. Clientes e Transações (SKIP)
  /*
  const customersToCreate = 3000; 
  console.log(`⏳ Gerando ${customersToCreate} clientes e forçando dados em 2025...`);

  for (let i = 0; i < customersToCreate; i++) {
     ... (fake logic)
  }
  */
  console.log('⏩ Skipping Fake Customers & Transactions (ERP Only Mode)');

  // 5. Segmentos e Histórico (Definitions Only)
  console.log('📊 Gerando Definições de Segmentos (Sem Histórico Fake)...');
  const segmentsList = [
    { name: 'Champions (VIP)', baseCount: 0 },
    { name: 'Em Risco (Churn)', baseCount: 0 },
    { name: 'Novos Clientes', baseCount: 0 },
    { name: 'Engajados WhatsApp', baseCount: 0 },
  ];

  for (const seg of segmentsList) {
    await prisma.segment.create({
      data: {
        storeId: store.id, name: seg.name, active: true, isDynamic: true, rules: [], lastCount: 0
      }
    });
  }

  // 6. Campanhas (SKIP)
  /*
  console.log('📅 Gerando Agenda (Todas os meses de 2025)...');
  ...
  */
  console.log('⏩ Skipping Fake Campaigns');

  console.log('✅ Seed Finalizado! Login: admin@primicia.com / admin');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });