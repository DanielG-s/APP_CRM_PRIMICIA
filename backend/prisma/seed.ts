import { PrismaClient } from '@prisma/client';
import { fakerPT_BR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Começando a semeadura do banco...');

  // --- 1. LIMPEZA (A ordem importa: Filhos primeiro, depois os Pais) ---
  
  // Filhos de Vendas/Clientes
  await prisma.transaction.deleteMany();
  await prisma.customerEvent.deleteMany();
  await prisma.surveyResponse.deleteMany();
  
  // Filhos de Campanhas (Aqui estava o erro)
  await prisma.campaignContent.deleteMany();
  await prisma.campaignSchedule.deleteMany();
  await prisma.campaignMetric.deleteMany();
  
  // Agora pode deletar os Pais
  await prisma.campaign.deleteMany();
  await prisma.customer.deleteMany();
  
  // Por fim, a Loja (que é pai de todo mundo)
  await prisma.store.deleteMany();

  console.log('🧹 Banco limpo e pronto.');

  // --- 2. CRIAR LOJA ---
  const loja = await prisma.store.create({
    data: {
      name: 'Primícia - Loja Matriz',
      cnpj: '12.345.678/0001-90',
      cityNormalized: 'São Paulo',
    },
  });

  console.log(`🏢 Loja criada: ${loja.name} (ID: ${loja.id})`);

  // --- 3. CRIAR DADOS ---
  console.log('👥 Criando 50 clientes com histórico...');

  for (let i = 0; i < 50; i++) {
    const customer = await prisma.customer.create({
      data: {
        storeId: loja.id,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        cpf: faker.string.numeric(11),
        birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        city: faker.location.city(),
        isRegistrationComplete: Math.random() > 0.2,
      },
    });

    const numCompras = faker.number.int({ min: 1, max: 5 });

    for (let j = 0; j < numCompras; j++) {
      const dataCompra = faker.date.recent({ days: 60 });
      
      await prisma.transaction.create({
        data: {
          storeId: loja.id,
          customerId: customer.id,
          date: dataCompra,
          totalValue: Number(faker.commerce.price({ min: 50, max: 1500 })),
          items: [
            { productName: faker.commerce.productName(), price: 100 }
          ],
        },
      });
    }
  }

  console.log('✅ Semeadura concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });