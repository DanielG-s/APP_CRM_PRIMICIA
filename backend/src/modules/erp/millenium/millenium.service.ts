import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MilleniumService {
  private readonly logger = new Logger(MilleniumService.name);
  private readonly apiUrl: string;
  private readonly vitrineId: number;
  private vitrinesCache: number[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('MILLENIUM_API_URL', 'http://api.millenium.com.br/api/millenium_eco');
    this.vitrineId = Number(this.configService.get<number>('MILLENIUM_VITRINE_ID', 2));

    // Configure Authentication Interceptor
    const username = this.configService.get<string>('MILLENIUM_API_USERNAME');
    const password = this.configService.get<string>('MILLENIUM_API_PASSWORD');

    if (username && password) {
      // Axios Basic Auth
      this.httpService.axiosRef.interceptors.request.use((config) => {
        const token = Buffer.from(`${username}:${password}`).toString('base64');
        config.headers['Authorization'] = `Basic ${token}`;
        return config;
      });
      this.logger.log('Basic Auth configured for Millenium API');
    } else {
      this.logger.warn('No credentials found for Millenium API (MILLENIUM_API_USERNAME/PASSWORD)');
    }
  }

  private parseAspNetDate(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    // Format: /Date(1552532400000-180)/
    const match = dateStr.match(/\/Date\((\d+)([+-]\d+)?\)\//);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      return new Date(timestamp);
    }
    return null;
  }

  async getSales(params: any = {}) {
    const allSales: any[] = [];
    let skip = 0;
    const batchSize = Number(params.$top) || 50;
    const maxItems = Number(params.limit) || 5000;
    let hasMore = true;

    this.logger.log(`Fetching sales with params: ${JSON.stringify(params)}`);

    try {
      // Separate internal params from API params
      const { limit, $top, ...apiParams } = params;

      while (hasMore) {
        const response = await lastValueFrom(
          this.httpService.get(`${this.apiUrl}/pedido_venda/consulta`, {
            params: {
              ...apiParams,
              $format: 'json',
              $skip: skip,
              $top: batchSize
            },
          }),
        );

        const salesBatch = response.data.value || [];

        if (salesBatch.length > 0) {
          allSales.push(...salesBatch);
          skip += batchSize;
          // Microsoft OData logic: if batch < limit, we are done.
          if (salesBatch.length < batchSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }

        // Check user defined limit
        if (allSales.length >= maxItems) {
          this.logger.log(`Reached requested limit of ${maxItems} items. Stopping.`);
          break;
        }
      }

      this.logger.log(`Total sales fetched: ${allSales.length}`);

      // Pre-process dates
      return allSales.map((sale) => ({
        ...sale,
        data_emissao_parsed: this.parseAspNetDate(sale.data_emissao),
        data_entrega_parsed: this.parseAspNetDate(sale.data_entrega),
        // Helper to get customer ID safely
        cliente_id_safe: sale.dados_cliente?.[0]?.cod_cliente || sale.cliente,
      }));
    } catch (error) {
      this.logger.error(`Error fetching sales: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCustomer(clienteId: string | number) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.apiUrl}/clientes/lista`, {
          params: { cliente: clienteId, $format: 'json' },
        }),
      );
      return response.data.value?.[0] || null;
    } catch (error) {
      this.logger.warn(`Error fetching customer ${clienteId}: ${error.message}`);
      return null;
    }
  }

  async getVitrines(): Promise<number[]> {
    try {
      if (this.vitrinesCache.length > 0) return this.vitrinesCache;

      const response = await lastValueFrom(
        this.httpService.get(`${this.apiUrl}/vitrine/listatabelas`, {
          params: { $format: 'json' },
        }),
      );

      const vitrines = response.data.value || [];
      // Store IDs. If user configured a PREFERRED id, maybe put it first?
      // For now, just trust the list order or sort.
      this.vitrinesCache = vitrines.map(v => v.vitrine);
      this.logger.log(`Loaded vitrines: ${this.vitrinesCache.join(', ')}`);
      return this.vitrinesCache;
    } catch (error) {
      this.logger.warn(`Error fetching vitrines: ${error.message}`);
      // Fallback to config or default 2
      return [this.vitrineId || 2];
    }
  }

  async getProductDetails(produtoId: string | number) {
    const vitrines = await this.getVitrines();

    for (const vitrine of vitrines) {
      try {
        const response = await lastValueFrom(
          this.httpService.get(`${this.apiUrl}/produtos/listavitrine`, {
            params: {
              produto: produtoId,
              vitrine: vitrine,
              $format: 'json',
              $top: 1,
            },
          }),
        );

        const product = response.data.value?.[0];
        if (product) {
          return product; // Found it!
        }
      } catch (error) {
        // Silent fail, try next vitrine
        continue;
      }
    }

    this.logger.warn(`Product ${produtoId} not found in any vitrine (${vitrines.join(',')})`);
    return null;
  }
}
