import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// --- CONFIGURAÇÕES ---
const TOTAL_CUSTOMERS = 5000;
const BATCH_SIZE = 1000;

// --- DADOS PARA GERAÇÃO ---
const CITIES_STATE = [
  { city: 'São Paulo', state: 'SP' }, { city: 'Campinas', state: 'SP' }, { city: 'Santos', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' }, { city: 'Niterói', state: 'RJ' },
  { city: 'Belo Horizonte', state: 'MG' }, { city: 'Uberlândia', state: 'MG' },
  { city: 'Curitiba', state: 'PR' }, { city: 'Porto Alegre', state: 'RS' },
  { city: 'Salvador', state: 'BA' }, { city: 'Recife', state: 'PE' },
  { city: 'Brasília', state: 'DF' }, { city: 'Manaus', state: 'AM' }
];

const FIRST_NAMES = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Pedro', 'Rafaela', 'Samuel', 'Tatiana', 'Vitor', 'Yasmin'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araujo', 'Fernandes', 'Carvalho', 'Gomes'];

const DEPARTMENTS = ['Tecnologia', 'Vestuário', 'Móveis', 'Lazer', 'Cosméticos'];
const CATEGORIES = ['Moda Masculina', 'Moda Feminina', 'Esportes', 'Eletrônicos', 'Casa & Jardim', 'Beleza', 'Brinquedos'];
const PRODUCTS = [
  { id: '1001', name: 'Camiseta Básica', price: 49.90, category: 'Moda Masculina', dept: 'Vestuário' },
  { id: '1002', name: 'Tênis Esportivo', price: 299.90, category: 'Esportes', dept: 'Vestuário' },
  { id: '1003', name: 'Smartphone X', price: 1999.00, category: 'Eletrônicos', dept: 'Tecnologia' },
  { id: '1004', name: 'Calça Jeans', price: 129.90, category: 'Moda Feminina', dept: 'Vestuário' },
  { id: '1005', name: 'Geladeira Frost', price: 2500.00, category: 'Casa & Jardim', dept: 'Móveis' },
  { id: '1006', name: 'Notebook Pro', price: 4500.00, category: 'Eletrônicos', dept: 'Tecnologia' },
  { id: '1007', name: 'Batom Matte', price: 39.90, category: 'Beleza', dept: 'Cosméticos' },
  { id: '1008', name: 'Bola de Futebol', price: 89.90, category: 'Esportes', dept: 'Lazer' },
];

const CAMPAIGNS = ['CMP-001 (Boas vindas)', 'CMP-002 (Carrinho abandonado)', 'CMP-003 (Black Friday)', 'CMP-004 (Dia das Mães)'];
const SEARCH_TERMS = ['iphone', 'geladeira', 'tênis', 'camiseta', 'notebook', 'promoção', 'frete grátis', 'presente'];

// --- LISTA COMPLETA DE EVENTOS PARA COBERTURA 100% ---
const ALL_EVENT_TYPES = [
  // NAV
  'acessou-home', 'acessou-departamento', 'acessou-categoria', 'acessou-produto', 'acessou-carrinho',
  // CHECKOUT
  'acessou-checkout-dados-pessoais', 'acessou-checkout-email', 'acessou-checkout-endereco-entrega', 'acessou-checkout-pagamento',
  // SEARCH
  'buscou-produto', 'adicionou-produto-ao-carrinho',
  // TRANSACTION
  'fez-pedido', 'fez-pedido-produto', 'comprou', 'comprou-produto', 'devolveu', 'devolveu-produto',
  // COMMUNICATION
  'open-notification', 'click-notification', 'receive-email-notification', 'recebeu-notificacao-sms', 'recebeu-contato',
  // RELATION
  'register', 'descadastrou-agenda', 'descadastrou-notificacao', 'nao-conseguiu-contato', 'erro-entrega-notificacao', 'reportou-spam'
];

// --- FUNÇÕES AUXILIARES ---
const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date;
};

// Gera payload específico para cada tipo de evento
function generatePayload(eventType: string, contextId: string | null = null) {
  const product = randomItem(PRODUCTS);
  const qtd = randomInt(1, 3);
  const total = Number((product.price * qtd).toFixed(2));

  switch (eventType) {
    // NAV
    case 'acessou-home': return { device: Math.random() > 0.6 ? 'mobile' : 'desktop' };
    case 'acessou-departamento': return { nome_departamento: product.dept };
    case 'acessou-categoria': return { nome_categoria: product.category };
    case 'acessou-produto': return { produto_id: product.name, categoria: product.category };
    case 'acessou-carrinho': return { quantidade_produtos: qtd, subtotal: total };
    
    // CHECKOUT
    case 'acessou-checkout-dados-pessoais': 
    case 'acessou-checkout-email':
    case 'acessou-checkout-endereco-entrega': return {};
    case 'acessou-checkout-pagamento': return { metodo: Math.random() > 0.5 ? 'Cartão' : 'Pix', valor: total };

    // SEARCH
    case 'buscou-produto': return { termo_busca: randomItem(SEARCH_TERMS), total_resultados: randomInt(0, 100) };
    case 'adicionou-produto-ao-carrinho': return { produto_id: product.name, preco: product.price };

    // TRANSACTION
    case 'fez-pedido': return { context_id: contextId, subtotal: total, quantidade_produtos: qtd };
    case 'fez-pedido-produto': return { context_id: contextId, produto_id: product.name, categoria: product.category };
    case 'comprou': return { context_id: contextId, total: total, metodo_pagamento: 'Cartão de Crédito' };
    case 'comprou-produto': return { context_id: contextId, produto_id: product.name, categoria: product.category, subtotal: total };
    case 'devolveu': return { context_id: contextId, motivo: 'Tamanho errado', total_estornado: total };
    case 'devolveu-produto': return { context_id: contextId, produto_id: product.name, categoria: product.category };

    // COMMUNICATION
    case 'open-notification':
    case 'click-notification':
    case 'receive-email-notification': return { campaign_id: randomItem(CAMPAIGNS), subject: 'Oferta Imperdível' };
    case 'recebeu-notificacao-sms': return { campaign_id: randomItem(CAMPAIGNS), mensagem: 'Seu cupom chegou!' };
    case 'recebeu-contato': return { canal: 'Whatsapp', motivo: 'Dúvida sobre produto' };

    // RELATION
    case 'register': return { origem: 'Google Ads' };
    case 'descadastrou-agenda': return { motivo: 'Muitas mensagens' };
    case 'descadastrou-notificacao': return { canal: 'Email' };
    case 'nao-conseguiu-contato': return { tentativa: randomInt(1, 3) };
    case 'erro-entrega-notificacao': return { erro: 'Email inválido / Bounce' };
    case 'reportou-spam': return { campanha: randomItem(CAMPAIGNS) };

    default: return {};
  }
}

async function createInChunks(modelName: string, data: any[]) {
  console.log(`   > Inserindo ${data.length} registros em ${modelName}...`);
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const chunk = data.slice(i, i + BATCH_SIZE);
    // @ts-ignore
    await prisma[modelName].createMany({ data: chunk, skipDuplicates: true });
  }
}

async function main() {
  console.log(`🚀 Iniciando Seed Completo (${TOTAL_CUSTOMERS} clientes)...`);

  // 1. Limpeza
  console.log('🧹 Limpando dados antigos...');
  try {
    await prisma.customerEvent.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.store.deleteMany();
  } catch (e) {}

  // 2. Loja
  const store = await prisma.store.create({
    data: { name: 'Primícia Matriz', cityNormalized: 'São Paulo', cnpj: '12.345.678/0001-90' }
  });

  // 3. Gerar Clientes
  console.log('👥 Gerando clientes...');
  const customersData: any[] = [];
  const customerIds: string[] = [];

  for (let i = 0; i < TOTAL_CUSTOMERS; i++) {
    const id = uuidv4();
    const loc = randomItem(CITIES_STATE);
    customerIds.push(id);
    
    customersData.push({
      id,
      storeId: store.id,
      name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
      email: `cli.${i}@seed.com`,
      phone: `119${randomInt(1000, 9999)}${randomInt(1000, 9999)}`,
      city: loc.city,
      state: loc.state,
      cpf: `${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}-${randomInt(10, 99)}`,
      totalSpent: 0,
      dataQualityIssues: {
        has_android: Math.random() > 0.4,
        gender: Math.random() > 0.5 ? 'Feminino' : 'Masculino',
        channels: { email: true, whatsapp: Math.random() > 0.3 }
      }
    });
  }
  await createInChunks('customer', customersData);

  // 4. Gerar Transações e Eventos (GARANTIA DE COBERTURA)
  console.log('⚡ Gerando eventos (Cobertura 100% dos tipos)...');
  const eventsData: any[] = [];
  const transactionsData: any[] = [];

  // PARTE A: GARANTIA DE COBERTURA (Pelo menos 10 eventos de CADA tipo espalhados)
  console.log('   > Garantindo todos os tipos de evento...');
  for (const eventType of ALL_EVENT_TYPES) {
    const iterations = randomInt(50, 150); // Pelo menos 50 clientes terão esse evento específico
    for (let k = 0; k < iterations; k++) {
      const custId = randomItem(customerIds);
      const date = randomDate(90);
      let contextId: string | null = null;

      // Se for transacional, cria a transaction para bater com o evento
      if (['fez-pedido', 'comprou', 'devolveu', 'comprou-produto'].includes(eventType)) {
         contextId = uuidv4();
         const product = randomItem(PRODUCTS);
         transactionsData.push({
            id: contextId,
            storeId: store.id,
            customerId: custId,
            totalValue: product.price,
            date: date,
            channel: 'E-commerce',
            items: [{ sku: product.id, name: product.name, price: product.price }]
         });
      }

      eventsData.push({
        customerId: custId,
        eventType: eventType,
        createdAt: date,
        payload: generatePayload(eventType, contextId)
      });
    }
  }

  // PARTE B: VOLUME DE JORNADAS (Para preencher gráficos)
  console.log('   > Gerando volume de navegação...');
  for (const custId of customerIds) {
    if (Math.random() > 0.7) continue; // 30% inativos

    // Navegação comum
    const visits = randomInt(1, 5);
    for (let v = 0; v < visits; v++) {
      const d = randomDate(60);
      eventsData.push({ customerId: custId, eventType: 'acessou-home', createdAt: d, payload: { device: 'mobile' } });
      
      if (Math.random() > 0.5) {
        eventsData.push({ customerId: custId, eventType: 'acessou-produto', createdAt: d, payload: generatePayload('acessou-produto') });
      }
    }
  }

  await createInChunks('transaction', transactionsData);
  await createInChunks('customerEvent', eventsData);

  console.log('✅ Seed finalizado!');
  console.log(`📊 Clientes: ${TOTAL_CUSTOMERS}`);
  console.log(`📊 Total Eventos: ${eventsData.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });