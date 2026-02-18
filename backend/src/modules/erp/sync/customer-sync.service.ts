import { Injectable, Logger } from '@nestjs/common';
import { MilleniumService } from '../millenium/millenium.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CustomerSyncService {
    private readonly logger = new Logger(CustomerSyncService.name);

    constructor(
        private readonly milleniumService: MilleniumService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async handleDailySync() {
        this.logger.log('Starting Daily Customer Sync...');
        await this.syncCustomers(true);
        this.logger.log('Daily Customer Sync Completed.');
    }

    /**
     * Syncs customers from Millennium ERP.
     * @param full If true, fetches all.
     */
    async syncCustomers(full: boolean = true) {
        try {
            const batchSize = Number(this.configService.get<number>('CUSTOMER_SYNC_BATCH_SIZE', 1000));
            let params: any = { $top: batchSize };

            this.logger.log(`Syncing customers (Full: ${full}, BatchSize: ${batchSize})`);

            // 2. Fetch from ERP using Keyset Strategy (trans_id)
            const milleniumCustomers = await this.milleniumService.getCustomersKeyset({
                ...params,
                limit: 1000000
            });

            this.logger.log(`Processing ${milleniumCustomers.length} customers from ERP...`);

            // 3. Upsert into CRM
            let updatedCount = 0;

            // Process in chunks to avoid overwhelming Prisma
            const chunkSize = 100;
            for (let i = 0; i < milleniumCustomers.length; i += chunkSize) {
                const chunk = milleniumCustomers.slice(i, i + chunkSize);

                await Promise.all(chunk.map(async (raw) => {
                    try {
                        await this.processCustomer(raw);
                        updatedCount++;
                    } catch (e) {
                        this.logger.error(`Failed to process customer ${raw.cod_cliente}: ${e.message}`);
                    }
                }));
            }

            this.logger.log(`Sync Finished. Processed ${updatedCount}.`);

        } catch (error) {
            this.logger.error(`Customer Sync Failed: ${error.message}`, error.stack);
        }
    }

    private async processCustomer(raw: any) {
        const externalId = String(raw.cod_cliente);
        if (!externalId) return;

        // Address Mapping
        const addressData = raw.enderecos?.[0] || {};
        let addressStr: string | null = null;
        if (addressData.logradouro) {
            addressStr = `${addressData.logradouro}, ${addressData.numero || ''}`;
        }

        // Phone Normalization
        const phone = raw.cel || raw.ddd_celular ? `${raw.ddd_celular || ''}${raw.cel || ''}` : raw.fone;

        // BirthDate
        let birthDate: Date | null = null;
        if (raw.data_aniversario) {
            if (typeof raw.data_aniversario === 'string' && raw.data_aniversario.includes('/Date(')) {
                const match = raw.data_aniversario.match(/\/Date\((\d+)([+-]\d+)?\)\//);
                if (match) birthDate = new Date(parseInt(match[1], 10));
            } else {
                birthDate = new Date(raw.data_aniversario);
            }
        }

        const customerData: any = {
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
        };

        // Check for "Real Duplicate" (Same Email + Same Name)
        // Since email is no longer unique at DB level, we must check manually.
        let potentialDuplicate: any = null;
        if (customerData.email) {
            potentialDuplicate = await this.prisma.customer.findFirst({
                where: {
                    email: customerData.email,
                    name: customerData.name // Exact match on name
                }
            });
        }

        const existing = await this.prisma.customer.findFirst({
            where: { externalId: externalId }
        });

        if (existing) {
            // It's the same ID, so just update it.
            await this.prisma.customer.update({
                where: { id: existing.id },
                data: customerData
            });
        } else {
            // New Customer ID.
            if (potentialDuplicate) {
                // Same Name + Same Email exists with DIFFERENT ID.
                // Action: "Remove the duplicate and leave a warning".
                // We SKIP creating this new record effectively "removing" it from CRM view.
                // We update the EXISTING record to warn about this ID.

                this.logger.warn(`Skipping Duplicate Customer Import: ${customerData.name} (${customerData.email}). ERP ID: ${externalId} matches CRM ID: ${potentialDuplicate.externalId}`);

                const issues = (potentialDuplicate.dataQualityIssues as any) || {};
                const dupes = issues.duplicateErpIds || [];
                if (!dupes.includes(externalId)) {
                    dupes.push(externalId);
                }

                await this.prisma.customer.update({
                    where: { id: potentialDuplicate.id },
                    data: {
                        dataQualityIssues: {
                            ...issues,
                            duplicateErpIds: dupes,
                            lastDuplicateWarning: `Found duplicate entry in ERP with ID ${externalId} on ${new Date().toISOString()}`
                        }
                    }
                });
                return; // SKIP IMPORT
            }

            // Not a duplicate (or just shared email with different name), proceed to create.
            await this.prisma.customer.create({
                data: customerData
            });
        }
    }
}
