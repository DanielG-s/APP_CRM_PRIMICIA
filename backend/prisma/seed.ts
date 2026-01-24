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
  const cleanTable = async (model: any) => { try { await model.deleteMany(); } catch (e) {} };
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
      name: 'Primícia Modas - Matriz',
      cnpj: '12.345.678/0001-90',
      cityNormalized: 'sao paulo',
      users: {
        create: { name: 'Daniel Admin', email: 'admin@primicia.com', password: 'admin', role: 'ADMIN' },
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

  // 3. Produtos
  const products = [
    { name: 'Camiseta Básica', price: 49.90 },
    { name: 'Calça Jeans Premium', price: 149.90 },
    { name: 'Vestido Verão', price: 199.90 },
    { name: 'Tênis Casual', price: 299.90 },
  ];

  // 4. Clientes e Transações (Focados em 2025)
  const customersToCreate = 3000; 
  console.log(`⏳ Gerando ${customersToCreate} clientes e forçando dados em 2025...`);

  for (let i = 0; i < customersToCreate; i++) {
    const hasOrders = Math.random() > 0.1; 
    let totalSpent = 0;
    let ordersCount = 0;
    let lastOrderDate: Date | null = null;
    let rfmStatus = 'Novos / Sem Dados';

    // Criação do Cliente (Cadastro também distribuído)
    // 50% cadastrados antes de 2025 (base antiga), 50% durante 2025/26
    const createdAt = Math.random() > 0.5 
        ? faker.date.past({ years: 3, refDate: '2025-01-01T00:00:00.000Z' }) // Base antiga
        : getWeightedDate(); // Base nova

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const uniqueEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@exemplo.com`;

    const createdCustomer = await prisma.customer.create({
      data: {
        storeId: store.id,
        name: `${firstName} ${lastName}`,
        email: uniqueEmail,
        phone: faker.phone.number({ style: 'national' }),
        city: faker.helpers.arrayElement(['São Paulo', 'Rio de Janeiro', 'Curitiba']),
        state: faker.helpers.arrayElement(['SP', 'RJ', 'PR']),
        birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        isRegistrationComplete: true,
        createdAt: createdAt
      }
    });

    if (hasOrders) {
      const numOrders = faker.number.int({ min: 1, max: 12 });
      
      for (let j = 0; j < numOrders; j++) {
        // AQUI ESTÁ A MÁGICA: Usamos a função ponderada
        // Isso vai jogar 60% das vendas dentro de 2025
        const date = getWeightedDate();

        // Evita venda antes do cadastro (opcional, mas bom pra realismo)
        const transactionDate = date < createdAt ? createdAt : date;

        const numItems = faker.number.int({ min: 1, max: 3 });
        const items: any[] = [];
        let orderTotal = 0;

        for (let k = 0; k < numItems; k++) {
          const prod = faker.helpers.arrayElement(products);
          items.push(prod);
          orderTotal += prod.price;
        }

        const channelName = faker.helpers.weightedArrayElement(SALES_CHANNELS);

        await prisma.transaction.create({
          data: {
            storeId: store.id,
            customerId: createdCustomer.id,
            date: transactionDate,
            totalValue: orderTotal,
            channel: channelName,
            items: items, 
            status: 'PAID', 
            isInfluenced: Math.random() > 0.6
          }
        });

        totalSpent += orderTotal;
        ordersCount++;
        if (!lastOrderDate || transactionDate > lastOrderDate) lastOrderDate = transactionDate;
      }

      // RFM Calculation
      const todayMs = new Date('2026-02-01').getTime(); // Simulando que estamos em Fev/26
      const lastOrderMs = lastOrderDate ? lastOrderDate.getTime() : 0;
      const daysSince = lastOrderDate ? Math.floor((todayMs - lastOrderMs) / 86400000) : 999;
      
      if (totalSpent > 1500 && daysSince < 30) rfmStatus = 'Champions';
      else if (totalSpent > 500 && daysSince < 60) rfmStatus = 'Leais';
      else if (daysSince < 30) rfmStatus = 'Recentes';
      else if (daysSince > 90) rfmStatus = 'Em Risco';
      else rfmStatus = 'Novos / Sem Dados';

      await prisma.customer.update({
        where: { id: createdCustomer.id },
        data: { totalSpent, ordersCount, lastOrderDate, rfmStatus }
      });
    }
    
    if((i+1) % 500 === 0) console.log(`✅ ${i+1} clientes...`);
  }

  // 5. Segmentos e Histórico (365 Dias - Para cobrir o ano todo)
  console.log('📊 Gerando Segmentos (Histórico de 1 ano)...');
  const segmentsList = [
    { name: 'Champions (VIP)', baseCount: 150 },
    { name: 'Em Risco (Churn)', baseCount: 420 },
    { name: 'Novos Clientes', baseCount: 85 },
    { name: 'Engajados WhatsApp', baseCount: 650 },
  ];

  for (const seg of segmentsList) {
    const createdSeg = await prisma.segment.create({
      data: {
        storeId: store.id, name: seg.name, active: true, isDynamic: true, rules: [], lastCount: seg.baseCount
      }
    });

    // Gera 365 dias de histórico (Jan 25 até hoje)
    for (let d = 365; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d); // Volta 365 dias
      
      const variation = Math.floor(Math.random() * 30) - 15;
      // Tendência de leve alta
      const trend = Math.floor((365 - d) * 0.2); 
      const historyCount = Math.max(0, seg.baseCount + variation + trend);

      await prisma.segmentHistory.create({
        data: { segmentId: createdSeg.id, date: date, count: historyCount }
      });
    }
  }

  // 6. Campanhas (Preenchendo 2025 inteiro)
  console.log('📅 Gerando Agenda (Todas os meses de 2025)...');
  const campTypes = ['email', 'whatsapp'];
  
  // Gera uma campanha por mês em 2025
  for(let month = 0; month < 12; month++) {
     const date = new Date(2025, month, 15); // Dia 15 de cada mês de 2025
     
     await prisma.campaign.create({
        data: {
            storeId: store.id,
            name: `Campanha Mensal - ${date.toLocaleString('default', { month: 'long' })}/25`,
            channel: faker.helpers.arrayElement(campTypes),
            status: 'sent',
            type: 'promotional',
            date: date,
            audienceSize: 1000 + (month * 100), // Crescendo ao longo do ano
            sent: 1000 + (month * 100), delivered: 980 + (month * 100),
            metrics: { create: { sentCount: 1000, revenueInfluenced: 5000 + (month*500), repurchaseRate: 10 } },
            contents: { create: { body: 'Oferta' } }
        }
     });
  }

  // Campanhas Futuras (2026)
  for(let i=1; i<=3; i++) {
    await prisma.campaign.create({
       data: {
           storeId: store.id,
           name: `Lançamento 2026 - Fase ${i}`,
           channel: 'whatsapp',
           status: 'scheduled',
           scheduledAt: new Date(2026, i, 10), // Fev, Mar, Abr 2026
           contents: { create: { body: 'Em breve' } }
       }
    });
 }

  console.log('✅ Seed Finalizado! Login: admin@primicia.com / admin');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });