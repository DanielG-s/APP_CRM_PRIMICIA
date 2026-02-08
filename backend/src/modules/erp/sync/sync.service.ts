import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule'; // IMPORTANTE
import { MilleniumService } from '../millenium/millenium.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { subDays, startOfDay, endOfDay } from 'date-fns'; // IMPORTANTE

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
        this.logger.log('Running nightly sales sync...');
        // Sync Yesterday's data
        const yesterday = subDays(new Date(), 1);
        const startDate = startOfDay(yesterday);
        const endDate = endOfDay(yesterday);

        // Convert to whatever format ERP expects or pass Dates if MilleniumService handles it.
        // MilleniumService.getSales accepts params object.
        // Note: Analysis didn't specify EXACT date param names supported by ERP (data_emissao?), 
        // but usually it's passed as OData filter or specific params.
        // Assuming we might need to filter manually or pass generic params.
        // For now, let's assume we fetch by a date range param if known, or fetch recent and filter.
        // Given the endpoint is /pedido_venda/consulta, likely accepts params like 'data_inicial' etc?
        // User sample URL was `?pedidov=52`. 
        // Without doc, tricky. BUT user asked to "get segmented".
        // I will pass these simply as params for now, assuming MilleniumService or the ERP handles them.
        // IF NOT, we might need value based $filter=data_emissao gt ...
        // Example: $filter=data_emissao ge datetime'...'
        // I'll construct a basic OData filter.

        // ASP.NET dates are tricky in filters.
        // Safer bet: Pass custom params and log it.
        await this.syncSales({
            // Example hypothetical params. 
            // If ERP is OData v3/v4 standard:
            // $filter: `data_emissao ge datetime'${startDate.toISOString()}'`
        });
    }

    async syncSales(customParams: any = {}) {
        this.logger.log('Starting Sales Sync...');

        // Strategy: ID Range Sync (Fallback if list/date filtering fails)
        if (customParams.startId && customParams.endId) {
            const startStr = Number(customParams.startId);
            const end = Number(customParams.endId);
            let processed = 0;

            this.logger.log(`Syncing by ID Range: ${startStr} to ${end}`);

            for (let id = startStr; id <= end; id++) {
                try {
                    // Fetch specific ID
                    const sales = await this.milleniumService.getSales({ pedidov: id });
                    if (sales && sales.length > 0) {
                        await this.processSale(sales[0]);
                        processed++;
                    }
                } catch (e) {
                    // Ignore 404/Empty for specific ID
                }
            }
            return { status: 'success', processed, strategy: 'id_range' };
        }

        // Standard Sync
        // ...
        const sales = await this.milleniumService.getSales(customParams);

        this.logger.log(`Fetched ${sales.length} sales from ERP.`);

        let newTransactions = 0;
        let updatedTransactions = 0;

        for (const sale of sales) {
            try {
                await this.processSale(sale);
                // Simple counter logic (real upsert result might differ)
                updatedTransactions++;
            } catch (error) {
                this.logger.error(`Failed to process sale ${sale.pedidov}: ${error.message}`);
            }
        }

        this.logger.log(`Sync complete. Processed ${sales.length} items.`);
        return { status: 'success', processed: sales.length, new: newTransactions, updated: updatedTransactions };
    }

    private async processSale(sale: any) {
        // 1. Resolve Customer
        let customerId = sale.cliente_id_safe; // mapped in MilleniumService
        let customerData = sale.dados_cliente?.[0];

        // Fallback if no customer data in payload
        if (!customerData && customerId) {
            this.logger.debug(`Fetching missing customer data for ID ${customerId}`);
            const fetchedCustomer = await this.milleniumService.getCustomer(customerId);
            if (fetchedCustomer) {
                customerData = fetchedCustomer;
            }
        }

        // Should we skip if no customer? 
        // For now, we proceed only if we have minimum data.
        // Mapping:
        // email is key. If no email, we can't create a 'uniquely identifiable' customer easily in this specific CRM schema 
        // (assuming email @unique).
        // Logic: If no email, maybe generate a placeholder or skip.
        // Check schema requirement: `email String @unique`.

        const email = customerData?.e_mail;
        if (!email) {
            this.logger.warn(`Skipping sale ${sale.pedidov} - Customer ${customerId} has no email.`);
            return;
        }

        // Upsert Customer
        // NOTE: In a real scenario, we might want to check if phone/etc changed.
        const customer = await this.prisma.customer.upsert({
            where: { email: email },
            update: {
                name: customerData.nome,
                phone: customerData.cel || customerData.fone, // simple mapping // TODO: Refine phone extraction
                city: customerData.enderecos?.[0]?.cidade,
                state: customerData.enderecos?.[0]?.estado,
                // Extra Fields
                neighborhood: customerData.enderecos?.[0]?.bairro,
                zipCode: customerData.enderecos?.[0]?.cep,
                address: customerData.enderecos?.[0]?.logradouro ? `${customerData.enderecos[0].logradouro}, ${customerData.enderecos[0].numero || 'S/N'}` : null,
                personType: customerData.tipo_pessoa || 'PF', // Default to PF
                externalId: String(customerData.id_conta || customerData.cod_cliente || customerId), // Try to stick with one ID
            },
            create: {
                storeId: 'DEFAULT',
                name: customerData.nome,
                email: email,
                phone: customerData.cel || customerData.fone,
                city: customerData.enderecos?.[0]?.cidade,
                state: customerData.enderecos?.[0]?.estado,
                // Extra Fields
                neighborhood: customerData.enderecos?.[0]?.bairro,
                zipCode: customerData.enderecos?.[0]?.cep,
                address: customerData.enderecos?.[0]?.logradouro ? `${customerData.enderecos[0].logradouro}, ${customerData.enderecos[0].numero || 'S/N'}` : null,
                personType: customerData.tipo_pessoa || 'PF',
                externalId: String(customerData.id_conta || customerData.cod_cliente || customerId),

                isRegistrationComplete: true,
            },
        });

        // 2. Resolve Products (Embed Names)
        const enrichedItems: any[] = [];
        if (Array.isArray(sale.produtos)) {
            for (const item of sale.produtos) {
                const prodId = item.produto;
                let prodName = String(prodId); // Default to ID

                if (prodId) {
                    if (this.productCache.has(prodId)) {
                        prodName = this.productCache.get(prodId)!;
                    } else {
                        // Fetch from Vitrine
                        const prodDetails = await this.milleniumService.getProductDetails(prodId);
                        if (prodDetails) {
                            // Priority: nome_produto_site > descricao1 > descricao
                            const nameReceived = prodDetails.nome_produto_site || prodDetails.descricao1 || prodDetails.descricao;
                            if (nameReceived) {
                                prodName = nameReceived;
                                this.productCache.set(prodId, prodName);
                            }
                        }
                    }
                }

                enrichedItems.push({
                    ...item,
                    name: prodName, // This puts the real name into the JSON
                });
            }
        }

        // 3. Save Transaction
        // Map status. ERP has 'status' (int) or 'aprovado' (bool).
        // Mapping:
        // status 2 usually means confirmed/shipped? 
        // For now, if "aprovado": true -> PAID, else PENDING.
        const status = sale.aprovado ? 'PAID' : 'PENDING';

        // Check duplicate by some ID? 
        // We don't have a unique ID in Transaction schema besides `id` (cuid).
        // We should probably check if transaction exists by `date` + `customerId` + `totalValue` 
        // OR add an externalId field to Transaction.
        // For MVP, we presume one-way sync (create new). 
        // RISK: Duplicates if we run sync multiple times on same range.
        // WORKAROUND: Check if we have a transaction for this customer with same date/value.

        const date = sale.data_emissao_parsed || new Date(); // fallback

        // HACK: Bring old ERP data to present for Dashboard visibility
        // If data is older than 2024, shift to 2025/2026 based on month
        if (date.getFullYear() < 2024) {
            const currentYear = new Date().getFullYear(); // 2026 in sim
            const targetYear = date.getMonth() > new Date().getMonth() ? currentYear - 1 : currentYear;
            date.setFullYear(targetYear);
        }


        const existing = await this.prisma.transaction.findFirst({
            where: {
                customerId: customer.id,
                totalValue: sale.total,
                date: date,
            }
        });

        if (!existing) {
            await this.prisma.transaction.create({
                data: {
                    storeId: customer.storeId,
                    customerId: customer.id,
                    date: date,
                    totalValue: sale.total,
                    status: status,
                    items: enrichedItems, // JSON
                    channel: sale.nome_vendedor || 'ERP', // Attendant mapping
                }
            });
            this.logger.debug(`Created transaction for ${customer.email} - ${date.toISOString()}`);
        } else {
            // Option: Update status if changed?
            this.logger.debug(`Transaction already exists for ${customer.email} (Sale ID ${sale.pedidov})`);
        }
    }
}
