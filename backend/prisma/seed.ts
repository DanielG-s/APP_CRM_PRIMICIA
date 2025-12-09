import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed da Agenda...');

  // 1. Limpeza (Cuidado em produção!)
  // Tente limpar na ordem correta para evitar erros de chave estrangeira
  try {
      await prisma.transaction.deleteMany();
      await prisma.campaignSchedule.deleteMany();
      await prisma.campaignContent.deleteMany(); // Caso exista
      await prisma.campaignMetric.deleteMany();  // Caso exista
      await prisma.campaign.deleteMany();
      await prisma.customer.deleteMany();
      await prisma.user.deleteMany();
      await prisma.store.deleteMany();
  } catch (e) {
      console.log('Nota: Algumas tabelas podiam estar vazias ou ordem de deleção ignorada.');
  }

  // 2. Criar Loja e Usuário Base
  const store = await prisma.store.create({
    data: {
      name: 'Loja Matriz - Fashion',
      cnpj: '12.345.678/0001-99',
      cityNormalized: 'São Paulo'
    }
  });

  await prisma.user.create({
    data: {
      email: 'admin@quantix.com',
      password: 'admin', 
      role: 'ADMIN',
      storeId: store.id
    }
  });

  // 3. Criar Clientes (Necessário para as Vendas)
  console.log('👥 Criando Clientes...');
  
  // CORREÇÃO AQUI: Adicionamos a tipagem : any[]
  const customers: any[] = []; 
  
  for (let i = 0; i < 100; i++) {
    const customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        name: `Cliente ${i + 1}`,
        email: `cliente${i + 1}@email.com`,
        phone: `1199999${i.toString().padStart(4, '0')}`
      }
    });
    customers.push(customer);
  }

  // 4. Criar Campanhas (Agenda) - Passado e Futuro
  console.log('📅 Criando Agenda de Campanhas...');
  
  const CAMPAIGN_NAMES = [
    'Aniversariantes do Mês', 'Black Friday Antecipada', 'Recuperação de Inativos', 
    'Lançamento Verão', 'Oferta Relâmpago VIP', 'Desconto Progressivo', 
    'Dia do Cliente', 'Saldão de Estoque'
  ];
  const CHANNELS = ['WhatsApp', 'E-mail', 'SMS', 'Mobile push'];

  // Gerar 40 campanhas distribuídas entre 30 dias atrás e 7 dias a frente
  for (let i = 0; i < 40; i++) {
    const isPast = i < 30; // 30 campanhas passadas, 10 futuras
    const baseDate = isPast 
      ? subDays(new Date(), Math.floor(Math.random() * 30)) 
      : addDays(new Date(), Math.floor(Math.random() * 10));
    
    const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
    const sent = 500 + Math.floor(Math.random() * 2000);
    
    // Métricas de funil realistas
    const delivered = Math.floor(sent * (0.9 + Math.random() * 0.08)); // ~95% entrega
    const opens = Math.floor(delivered * (0.4 + Math.random() * 0.3)); // ~50% abertura
    const clicks = Math.floor(opens * (0.1 + Math.random() * 0.2));    // ~20% clique
    const unsubscribes = Math.floor(sent * 0.01);

    await prisma.campaign.create({
      data: {
        storeId: store.id,
        name: `${CAMPAIGN_NAMES[i % CAMPAIGN_NAMES.length]} - ${channel}`,
        channel: channel,
        status: isPast ? 'sent' : 'scheduled',
        date: baseDate,
        type: 'Agenda', // Marcando como tipo Agenda
        audienceSize: sent,
        
        // Métricas (Zeradas se for futuro)
        sent: isPast ? sent : 0,
        delivered: isPast ? delivered : 0,
        opens: isPast ? opens : 0,
        clicks: isPast ? clicks : 0,
        softBounces: Math.floor(Math.random() * 20),
        hardBounces: Math.floor(Math.random() * 10),
        unsubscribes: isPast ? unsubscribes : 0,
        spamReports: Math.floor(Math.random() * 5),

        // Criar agendamento atrelado
        schedules: {
            create: {
                sendDate: baseDate
            }
        }
      }
    });
  }

  // 5. Criar Transações (Vendas)
  // Misturar vendas orgânicas com vendas influenciadas pelas campanhas
  console.log('💰 Criando Vendas...');
  
  for (let i = 0; i < 200; i++) {
    const isInfluenced = Math.random() > 0.4; // 60% de chance de ser influenciada
    const date = subDays(new Date(), Math.floor(Math.random() * 30));
    
    await prisma.transaction.create({
        data: {
            storeId: store.id,
            customerId: customers[Math.floor(Math.random() * customers.length)].id,
            totalValue: 100 + Math.random() * 800, // Ticket entre 100 e 900
            date: date,
            items: {}, // JSON vazio por enquanto
            channel: isInfluenced ? CHANNELS[Math.floor(Math.random() * CHANNELS.length)] : 'Loja Física',
            isInfluenced: isInfluenced
        }
    });
  }

  console.log('✅ Seed Agenda Concluído com Sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });