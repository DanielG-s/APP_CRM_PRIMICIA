import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MilleniumService } from '../millenium/millenium.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { subDays, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  // Simple in-memory cache for product names to avoid spamming the API
  private productCache = new Map<number, string>();

  constructor(
    private readonly milleniumService: MilleniumService,
    private readonly prisma: PrismaService,
  ) { }

  @Cron('0 3 * * *') // 3 AM every day
  async handleNightlySync() {
    this.logger.log('Running nightly sales sync (Listafaturamentos)...');

    // Strict 24h Window: Yesterday 00:00 to 23:59
    const yesterday = subDays(new Date(), 1);
    const startDate = startOfDay(yesterday);
    const endDate = endOfDay(yesterday);

    await this.syncSales(startDate, endDate);
  }

  @Cron(CronExpression.EVERY_HOUR) // Every hour
  async handleHourlySync() {
    this.logger.log('Running hourly sales sync...');
    // Sync Today only (since midnight)
    // This catches new sales during the day.
    const now = new Date();
    const startDate = startOfDay(now);

    await this.syncSales(startDate, now);
  }

  /**
   * Syncs sales from 'listafaturamentos' for a specific period.
   * Treating this endpoint as Single Source of Truth for:
   * 1. Transactions
   * 2. Active Customers (who bought in this period)
   * 3. Sold Products (embedded in transaction)
   */
  async syncSales(start: Date, end: Date) {
    this.logger.log(`Starting Sync from ${start.toISOString()} to ${end.toISOString()}...`);

    const sales = await this.milleniumService.getFaturamentos(start, end);

    this.logger.log(`Fetched ${sales.length} invoices from ERP.`);

    let newTransactions = 0;
    let updatedTransactions = 0;

    for (const sale of sales) {
      try {
        await this.processInvoice(sale);
        updatedTransactions++;
      } catch (error) {
        this.logger.error(
          `Failed to process invoice ${sale.cod_pedidov || sale.pedidov}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Sync complete. Processed ${sales.length} items.`);
    return {
      status: 'success',
      processed: sales.length,
      new: newTransactions,
      updated: updatedTransactions,
    };
  }

  private async processInvoice(sale: any) {
    // 0. Resolve Store (Filial)
    // PRIORIDADE: nome_emissor (conforme solicitado) > nome_filial > cod_filial
    const storeName = sale.nome_emissor || sale.nome_filial || (sale.cod_filial ? `Filial ${sale.cod_filial}` : 'Loja Principal');

    // Check if we already have this store cached or in DB
    let store = await this.prisma.store.findFirst({
      where: { name: storeName }
    });

    if (!store) {
      this.logger.debug(`Creating new Store from ERP: ${storeName}`);
      store = await this.prisma.store.create({
        data: {
          name: storeName,
        }
      });
    }

    const storeId = store.id;

    // 1. Resolve Customer from Embedded Data
    // 'listafaturamentos' returns 'cliente' as an array of objects
    const customerRaw = sale.cliente?.[0];

    // Safety check: Needs minimum data to be a valid customer in CRM
    if (!customerRaw || !customerRaw.cod_cliente) {
      this.logger.warn(`Skipping invoice ${sale.cod_pedidov}: No customer data.`);
      return;
    }

    // Resolve Address from 'endereco' or 'endereco_entrega' arrays
    // Use optional chaining carefully
    const addressData = customerRaw.endereco?.[0] || customerRaw.endereco_entrega?.[0] || {};

    // CPF/CNPJ Mapping
    const cpfCnpj = customerRaw.cpf || customerRaw.cgc;

    // Mapping Strategy:
    // We use 'cod_cliente' as externalId to link them.
    const externalId = String(customerRaw.cod_cliente);
    // Email is optional (can be null if not provided)
    const email = customerRaw.e_mail || null;

    let customer = await this.prisma.customer.findFirst({
      where: { externalId: externalId }
    });

    const customerData: any = {
      storeId: storeId,
      name: customerRaw.nome?.trim() || 'Cliente Sem Nome',
      email: email, // Can be null
      phone: customerRaw.cel || customerRaw.fone,
      city: addressData.cidade || customerRaw.cidade,
      state: addressData.estado || customerRaw.estado,
      externalId: externalId,
      cpf: cpfCnpj,
      address: addressData.logradouro ? `${addressData.logradouro}, ${addressData.numero || ''}` : null,
      neighborhood: addressData.bairro || customerRaw.bairro,
      zipCode: addressData.cep || customerRaw.cep,
      personType: 'PF',
      isRegistrationComplete: true,
      // Date logic handled in loop
    };

    if (customer) {
      // Update existing
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          ...customerData,
          email: email,
        }
      });
    } else {
      // MATCHING STRATEGY: Name + CPF OR Name + Email
      let realDuplicate: any = null;

      // 1. Check CPF
      if (cpfCnpj && customerData.name) {
        const match = await this.prisma.customer.findFirst({ where: { cpf: cpfCnpj } });
        if (match && match.name === customerData.name) {
          realDuplicate = match;
        }
      }

      // 2. Check Email (if no CPF match)
      if (!realDuplicate && email && customerData.name) {
        const match = await this.prisma.customer.findFirst({ where: { email: email } });
        if (match && match.name === customerData.name) {
          realDuplicate = match;
        }
      }

      if (realDuplicate) {
        // MERGE / LINK
        this.logger.debug(`Linking Sale to Existing Customer: ${realDuplicate.name} (ID: ${realDuplicate.id})`);
        customer = await this.prisma.customer.update({
          where: { id: realDuplicate.id },
          data: {
            externalId: externalId, // Link ERP ID
            phone: customerData.phone || realDuplicate.phone,
            address: customerData.address || realDuplicate.address,
            updatedAt: new Date()
          }
        });
      } else {
        // CREATE NEW
        customer = await this.prisma.customer.create({
          data: customerData,
        });
      }
    }

    // 2. Resolve Items
    const rawItems = sale.produto || [];

    const enrichedItems = rawItems.map((item: any) => ({
      id: item.cod_produto,
      name: item.descricao,
      quantity: item.quantidade,
      price: item.preco_venda,
      total: item.total_item,
    }));

    // 3. Save Transaction
    const isCancelled = sale.cancelada === true || sale.cancelada === 'True';
    let status = isCancelled ? 'CANCELLED' : 'PAID';

    // PRIORITIZA DATA DE EMISSÃO (Real do Pedido)
    // Parse regex /Date(123...)/ which is standard in this OData flavor
    let date = new Date();
    const dateStr = sale.data_hora_emissao || sale.data_emissao || sale.data;

    if (dateStr && typeof dateStr === 'string' && dateStr.includes('/Date(')) {
      const match = dateStr.match(/\d+/);
      if (match && match[0]) {
        date = new Date(parseInt(match[0]));
      }
    } else if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) date = parsed;
    }

    // REGRA DE NEGÓCIO: DEVOLUÇÃO (tipo_operacao = 'E')
    // Se for devolução, valor deve ser negativo para LTV correto.
    let totalValue = Number(sale.total || 0);
    if (sale.tipo_operacao === 'E') {
      totalValue = -Math.abs(totalValue); // Garante que seja negativo
      status = 'REFUNDED'; // Opcional: Marcar status como devolvido/estornado para Clientes verem
    }

    // HACK: Date Shift for Dev Visibility
    if (date.getFullYear() < 2024) {
      const currentYear = new Date().getFullYear();
      const targetYear = date.getMonth() > new Date().getMonth() ? currentYear - 1 : currentYear;
      date.setFullYear(targetYear);
    }

    const externalTxId = String(sale.romaneio || sale.cod_pedidov || sale.pedidov || sale.trans_id);

    // DEDUPLICATION: Use externalId unique key
    // @ts-ignore
    await this.prisma.transaction.upsert({
      // @ts-ignore
      where: { externalId: externalTxId },
      update: {
        storeId: storeId,
        customerId: customer.id,
        date: date,
        totalValue: totalValue,
        status: status,
        items: enrichedItems,
        channel: 'ERP',
        // Optionally update other fields if needed
      },
      create: {
        // @ts-ignore
        externalId: externalTxId,
        storeId: storeId,
        customerId: customer.id,
        date: date,
        totalValue: totalValue,
        status: status,
        items: enrichedItems,
        channel: 'ERP',
      },
    });
    this.logger.debug(`Synced Invoice ${externalTxId} (${totalValue})`);
  }
}
