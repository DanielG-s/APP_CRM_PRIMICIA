import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MilleniumService } from '../millenium/millenium.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  private static readonly ALLOWED_EVENT_NAMES = [
    'S - VENDA E-COMMERCE',
    'S - VENDA VAREJO NFC-E (LOJAS)',
    'S - VENDA VAREJO CFE (LOJAS)',
    'S - VENDA VAREJO CFE ( ESTOQUE NEGAT',
    'S - VENDA VAREJO NFE',
    'E - DEVOLUCAO DE VENDA VAREJO',
    'E - DEVOLUCAO DE VENDA E-COMMERCE',
  ];

  // Simple in-memory cache for product names to avoid spamming the API
  private productCache = new Map<number, string>();

  constructor(
    private readonly milleniumService: MilleniumService,
    private readonly prisma: PrismaService,
    @InjectQueue('erp-sync-queue') private readonly syncQueue: Queue,
  ) { }

  @Cron('0 3 * * *') // 3 AM every day
  async handleNightlySync() {
    this.logger.log('Queueing nightly sales sync (Staggered)...');

    const yesterday = subDays(new Date(), 1);
    const start = startOfDay(yesterday).toISOString();
    const end = endOfDay(yesterday).toISOString();

    await this.queueStoreSyncs(start, end, 'nightly');
  }

  @Cron('0 * * * *') // Every hour on the hour
  async handleHourlySync() {
    this.logger.log('Queueing hourly sales sync (Staggered)...');
    const now = new Date();
    const start = startOfDay(now).toISOString();
    const end = now.toISOString();

    await this.queueStoreSyncs(start, end, 'hourly');
  }

  private async queueStoreSyncs(start: string, end: string, frequency: string) {
    const stores = await (this.prisma.store as any).findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
    });

    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];
      // Jitter: (index * 2 minutes) + random 0-30s
      const delay = i * 120000 + Math.floor(Math.random() * 30000);
      const jobId = `sync-sales:${store.code}:${frequency}:${today}`;

      await this.syncQueue.add(
        'sync-sales',
        { tenantId: store.id, start, end, storeCode: store.code },
        {
          jobId,
          delay,
          attempts: 3,
          backoff: { type: 'exponential', delay: 300000 }, // 5min
        },
      );
    }
  }

  /**
   * Syncs sales from 'listafaturamentos' for a specific period.
   * Treating this endpoint as Single Source of Truth for:
   * 1. Transactions
   * 2. Active Customers (who bought in this period)
   * 3. Sold Products (embedded in transaction)
   */
  async syncSales(start: Date, end: Date) {
    this.logger.log(
      `Starting Sync from ${start.toISOString()} to ${end.toISOString()}...`,
    );

    const sales = await this.milleniumService.getFaturamentos(start, end);

    this.logger.log(`Fetched ${sales.length} invoices from ERP.`);

    const newTransactions = 0;
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
    // PRIORIDADE MUDOU: cod_emissor ou cod_filial para fazer o match exato
    let storeCode = String(sale.cod_emissor || sale.cod_filial);
    const storeName =
      sale.nome_emissor || sale.nome_filial || `Filial ${storeCode}`;
    const eventName = sale.nome_evento || '';

    // Temporarily disabled mapping rule since historical ERP sales miss nome_evento
    // if (!SyncService.ALLOWED_EVENT_NAMES.includes(eventName)) {
    //   this.logger.debug(
    //     `Skipping invoice ${sale.cod_pedidov || sale.pedidov}: Event '${eventName}' not in allow-list.`,
    //   );
    //   return;
    // }

    // REDIRECIONAMENTO: 006 deve ser tratada como 007
    if (storeCode === '006') {
      this.logger.debug(`Redirecting sale from store 006 to 007`);
      storeCode = '007';
    }

    // Check if we already have this store cached or in DB explicitly by CODE
    let store = await (this.prisma.store as any).findFirst({
      where: { code: storeCode },
    });

    if (!store) {
      this.logger.debug(
        `Skipping invoice ${sale.cod_pedidov || sale.pedidov}: Store ${storeCode} is not in the allowed stores list.`,
      );
      return;
    }

    const storeId = store.id;
    const organizationId = store.organizationId;

    // 1. Resolve Customer from Embedded Data
    // 'listafaturamentos' returns 'cliente' as an array of objects
    const customerRaw = sale.cliente?.[0];

    // Safety check: Needs minimum data to be a valid customer in CRM
    if (!customerRaw || !customerRaw.cod_cliente) {
      this.logger.warn(
        `Skipping invoice ${sale.cod_pedidov}: No customer data.`,
      );
      return;
    }

    // Resolve Address from 'endereco' or 'endereco_entrega' arrays
    // Use optional chaining carefully
    const addressData =
      customerRaw.endereco?.[0] || customerRaw.endereco_entrega?.[0] || {};

    // CPF/CNPJ Mapping
    const cpfCnpj = customerRaw.cpf || customerRaw.cgc;

    // Mapping Strategy:
    // We use 'cod_cliente' as externalId to link them.
    const externalId = String(customerRaw.cod_cliente);
    // Email is optional (can be null if not provided)
    const email = customerRaw.e_mail || null;

    let customer = await this.prisma.customer.findFirst({
      where: { externalId: externalId },
    });

    const customerData: any = {
      organizationId: organizationId,
      storeId: storeId,
      name: customerRaw.nome?.trim() || 'Cliente Sem Nome',
      email: email, // Can be null
      phone: customerRaw.cel || customerRaw.fone,
      city: addressData.cidade || customerRaw.cidade,
      state: addressData.estado || customerRaw.estado,
      externalId: externalId,
      cpf: cpfCnpj,
      address: addressData.logradouro
        ? `${addressData.logradouro}, ${addressData.numero || ''}`
        : null,
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
        },
      });
    } else {
      // MATCHING STRATEGY: Name + CPF OR Name + Email
      let realDuplicate: any = null;

      // 1. Check CPF
      if (cpfCnpj && customerData.name) {
        const match = await this.prisma.customer.findFirst({
          where: { cpf: cpfCnpj },
        });
        if (match && match.name === customerData.name) {
          realDuplicate = match;
        }
      }

      // 2. Check Email (if no CPF match)
      if (!realDuplicate && email && customerData.name) {
        const match = await this.prisma.customer.findFirst({
          where: { email: email },
        });
        if (match && match.name === customerData.name) {
          realDuplicate = match;
        }
      }

      if (realDuplicate) {
        // MERGE / LINK
        this.logger.debug(
          `Linking Sale to Existing Customer: ${realDuplicate.name} (ID: ${realDuplicate.id})`,
        );
        customer = await this.prisma.customer.update({
          where: { id: realDuplicate.id },
          data: {
            externalId: externalId, // Link ERP ID
            phone: customerData.phone || realDuplicate.phone,
            address: customerData.address || realDuplicate.address,
            updatedAt: new Date(),
          },
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
      const targetYear =
        date.getMonth() > new Date().getMonth() ? currentYear - 1 : currentYear;
      date.setFullYear(targetYear);
    }

    const externalTxId = String(
      sale.romaneio || sale.cod_pedidov || sale.pedidov || sale.trans_id,
    );

    // DEDUPLICATION: Use externalId unique key
    // @ts-ignore
    await this.prisma.transaction.upsert({
      // @ts-ignore
      where: { externalId: externalTxId },
      update: {
        organizationId: organizationId,
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
        organizationId: organizationId,
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
