import { Injectable, Logger } from '@nestjs/common';
import { MilleniumService } from '../millenium/millenium.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CustomerSyncService {
  private readonly logger = new Logger(CustomerSyncService.name);

  constructor(
    private readonly milleniumService: MilleniumService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('erp-sync-queue') private readonly syncQueue: Queue,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailySync() {
    const today = new Date().toISOString().split('T')[0];

    let skip = 0;
    const take = 100; // Pagination to not load 10k stores in memory
    let hasMore = true;
    let queueIndex = 0;

    // B-Audit: Configurable fairness jitter and max cap
    const delayStepMs = Number(
      this.configService.get('ERP_SYNC_DELAY_CUSTOMERS_MS_STEP', 120000),
    );
    const maxDelayMs = Number(
      this.configService.get('ERP_SYNC_DELAY_CUSTOMERS_MS_MAX', 3600000),
    ); // Default 1 hour cap

    while (hasMore) {
      // Fetch active stores only, ordered for determinism and fairness
      const stores = await this.prisma.store.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
        select: { id: true, name: true },
        take,
        skip,
      });

      if (!stores.length) {
        hasMore = false;
        break;
      }

      for (const store of stores) {
        const tenantId = store.id;
        // Idempotency: Predictable Job ID based on tenant + date
        const customJobId = `sync-customers:${tenantId}:${today}`;

        // Fairness: Hash based delay distribution across the 1h window to avoid bursts + Jitter
        const hash = Array.from(tenantId).reduce(
          (acc, char) => acc + char.charCodeAt(0),
          0,
        );
        const baseDelay = hash % maxDelayMs;
        const jitter = Math.floor(Math.random() * 15000); // 0-15s random jitter
        const delay = baseDelay + jitter;

        this.logger.log(
          `Queueing Daily Customer Sync for ${store.name} (Tenant: ${tenantId}) with ${delay / 1000}s delay. JobId: ${customJobId}`,
        );

        await this.syncQueue.add(
          'sync-customers',
          { tenantId },
          {
            jobId: customJobId,
            delay: delay,
            attempts: 3,
            backoff: { type: 'exponential', delay: 60000 }, // 1 min, 2 min, 4 min
            removeOnComplete: { age: 24 * 3600, count: 100 }, // Retention policy complete
            removeOnFail: { age: 7 * 24 * 3600, count: 500 }, // Retention policy failed
          },
        );

        queueIndex++;
      }

      skip += take;
    }
  }

  /**
   * Syncs customers from Millennium ERP.
   * @param full If true, fetches all.
   */
  async syncCustomers(full: boolean = true) {
    try {
      // "Turbo Mode": Use larger batch for ERP, but process via `processBatch`
      const batchSize = Number(
        this.configService.get<number>('CUSTOMER_SYNC_BATCH_SIZE', 1000),
      );
      // Use a smaller batch size for the first test run as requested by user
      // const batchSize = 100;

      const params: any = { $top: batchSize };

      this.logger.log(
        `Syncing customers (Full: ${full}, BatchSize: ${batchSize})`,
      );

      // 1. Fetch from ERP using Keyset Strategy (trans_id)
      const limit = Number(
        this.configService.get<number>('CUSTOMER_SYNC_LIMIT', 1000000),
      );

      const milleniumCustomers = await this.milleniumService.getCustomersKeyset(
        {
          ...params,
          limit: limit,
        },
      );

      this.logger.log(
        `Processing ${milleniumCustomers.length} customers from ERP...`,
      );

      // 2. Get Default Store Once (Optimization)
      const defaultStore = await this.prisma.store.findFirst();
      const defaultStoreId = defaultStore?.id;
      const defaultOrgId = defaultStore?.organizationId;

      if (!defaultStoreId || !defaultOrgId) {
        this.logger.warn(
          'No default store or organization found. Sync might fail for new customers.',
        );
      }

      // 3. Process in Optimal Batches
      let updatedCount = 0;
      const chunkSize = 50; // Smaller chunk size for validation as requested

      for (let i = 0; i < milleniumCustomers.length; i += chunkSize) {
        const chunk = milleniumCustomers.slice(i, i + chunkSize);
        try {
          await this.processBatch(chunk, defaultStoreId, defaultOrgId);
          updatedCount += chunk.length;

          if (updatedCount % 1000 === 0) {
            this.logger.log(
              `Processed ${updatedCount} / ${milleniumCustomers.length} records...`,
            );
          }
        } catch (e) {
          this.logger.error(`Failed to process batch ${i}: ${e.message}`);
        }
      }

      this.logger.log(`Sync Finished. Processed ${updatedCount}.`);
    } catch (error) {
      this.logger.error(`Customer Sync Failed: ${error.message}`, error.stack);
    }
  }

  private async processBatch(batch: any[], defaultStoreId: string | undefined, defaultOrgId: string | undefined) {
    // A. Extract Keys for Bulk Lookup
    const externalIds = batch
      .map((c) => String(c.cod_cliente))
      .filter((id) => !!id);
    const cpfs = batch.map((c) => c.cpf || c.cnpj).filter((cpf) => !!cpf);
    const emails = batch
      .map((c) => c.e_mail?.toLowerCase())
      .filter((email): email is string => !!email);

    // B. Bulk Fetch Existing Recrods form CRM
    // 1. Existing by External ID
    const existingCustomers = await this.prisma.customer.findMany({
      where: { externalId: { in: externalIds } },
      select: { id: true, externalId: true },
    });
    const existingMap = new Map(
      existingCustomers.map((c) => [c.externalId, c]),
    );

    // 2. Potential Duplicates by CPF
    const duplicatesByCpf = await this.prisma.customer.findMany({
      where: { cpf: { in: cpfs } },
      select: { id: true, cpf: true, name: true, externalId: true },
    });
    const cpfMap = new Map(duplicatesByCpf.map((c) => [c.cpf, c]));

    // 3. Potential Duplicates by Email
    const duplicatesByEmail = await this.prisma.customer.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true, name: true, externalId: true },
    });
    const emailMap = new Map(duplicatesByEmail.map((c) => [c.email, c]));

    // C. Process Each Record in Memory
    const operations = batch.map(async (raw) => {
      const externalId = String(raw.cod_cliente);
      if (!externalId) return;

      // Normalize Data
      const addressData = raw.enderecos?.[0] || {};
      const addressStr = addressData.logradouro
        ? `${addressData.logradouro}, ${addressData.numero || ''}`
        : null;
      const phone =
        raw.cel || raw.ddd_celular
          ? `${raw.ddd_celular || ''}${raw.cel || ''}`
          : raw.fone;

      // Date Parsing (BirthDate)
      const birthDateStr = raw.data_aniversario;
      let birthDate: Date | null = null;
      if (
        birthDateStr &&
        typeof birthDateStr === 'string' &&
        birthDateStr.includes('/Date(')
      ) {
        const match = birthDateStr.match(/\d+/);
        if (match && match[0]) {
          const timestamp = parseInt(match[0]);
          birthDate = new Date(timestamp);
        }
      } else if (birthDateStr) {
        const d = new Date(birthDateStr);
        if (!isNaN(d.getTime())) birthDate = d;
      }

      // Date Parsing (Registration Date / data_cadastro)
      const registrationDateStr = raw.data_cadastro;
      let registrationDate: Date = new Date(); // Default to now if missing
      if (
        registrationDateStr &&
        typeof registrationDateStr === 'string' &&
        registrationDateStr.includes('/Date(')
      ) {
        const match = registrationDateStr.match(/\d+/);
        if (match && match[0]) {
          const timestamp = parseInt(match[0]);
          registrationDate = new Date(timestamp);
        }
      } else if (registrationDateStr) {
        const d = new Date(registrationDateStr);
        if (!isNaN(d.getTime())) registrationDate = d;
      }

      const customerData: any = {
        createdAt: registrationDate, // MAP RAW ERP DATE CHECK
        name: raw.nome?.trim() || 'Cliente Sem Nome',
        email: raw.e_mail?.toLowerCase() || null,
        phone: phone,
        cpf: raw.cpf || raw.cnpj,
        neighborhood: addressData.bairro,
        city: addressData.cidade,
        state: addressData.estado,
        zipCode: addressData.cep,
        address: addressStr,
        personType: raw.pf_pj === 'PJ' ? 'PJ' : 'PF',
        birthDate: birthDate,
        externalId: externalId,
        isRegistrationComplete: true,
        updatedAt: new Date(),
        organizationId: defaultOrgId,
        storeId: defaultStoreId,
      };

      // D. Decision Logic
      const existing = existingMap.get(externalId);

      if (existing) {
        // CASE 1: UPDATE EXISTING
        await this.prisma.customer.update({
          where: { id: existing.id },
          data: customerData,
        });
      } else {
        // CASE 2: NEW EXTERNAL ID - Check for Duplicates

        // Priority 1: Check CPF Duplicate
        let realDuplicate: any = null;
        if (customerData.cpf && customerData.name) {
          const match = cpfMap.get(customerData.cpf);
          // Minimal name check to avoid disastrous merges of homonyms if CPF is wrong
          if (match && match.name === customerData.name) {
            realDuplicate = match;
          }
        }

        // Priority 2: Check Email Duplicate
        if (!realDuplicate && customerData.email && customerData.name) {
          const match = emailMap.get(customerData.email as string);
          if (match && match.name === customerData.name) {
            realDuplicate = match;
          }
        }

        if (realDuplicate) {
          // CASE 3: SMART MERGE
          this.logger.warn(
            `Smart Merge: Updating CRM ID ${realDuplicate.externalId} with contact info from ERP ID ${externalId}`,
          );

          await this.prisma.customer.update({
            where: { id: realDuplicate.id },
            data: {
              // Update Contact Info Only
              phone: customerData.phone,
              email: customerData.email,
              address: customerData.address,
              city: customerData.city,
              state: customerData.state,
              zipCode: customerData.zipCode,
              neighborhood: customerData.neighborhood,
              createdAt: customerData.createdAt, // SYNC REGISTRATION DATE
              updatedAt: new Date(),
              dataQualityIssues: {
                lastSmartMerge: `Merged with ERP ID ${externalId} on ${new Date().toISOString()}`,
              },
            },
          });
        } else {
          // CASE 4: CREATE NEW
          if (!customerData.storeId) return;

          await this.prisma.customer.create({
            data: customerData,
          });
        }
      }
    });

    // E. Execute Parallel Writes
    await Promise.all(operations);
  }
}
