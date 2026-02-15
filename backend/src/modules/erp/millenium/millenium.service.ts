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
    this.apiUrl = this.configService.get<string>(
      'MILLENIUM_API_URL',
      'http://api.millenium.com.br/api/millenium_eco',
    );
    this.vitrineId = Number(
      this.configService.get<number>('MILLENIUM_VITRINE_ID', 2),
    );

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
      this.logger.warn(
        'No credentials found for Millenium API (MILLENIUM_API_USERNAME/PASSWORD)',
      );
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

  /**
   * Fetches sales orders from Millenium API using pagination.
   * Supports filtering by date, status, etc.
   *
   * @param params Query parameters (limit, $top, custom filters).
   * @returns {Promise<any[]>} List of sales orders with parsed dates.
   */
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
              $top: batchSize,
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
          this.logger.log(
            `Reached requested limit of ${maxItems} items. Stopping.`,
          );
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

  /**
   * Fetches details for a specific customer by ID.
   * @returns {Promise<any | null>} Customer object or null if not found.
   */
  async getCustomer(clienteId: string | number) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.apiUrl}/clientes/lista`, {
          params: { cliente: clienteId, $format: 'json' },
        }),
      );
      return response.data.value?.[0] || null;
    } catch (error) {
      this.logger.warn(
        `Error fetching customer ${clienteId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Retrieves list of available Vitrines (Catalogs/Storefronts).
   * Caches the result in memory.
   */
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
      this.vitrinesCache = vitrines.map((v) => v.vitrine);
      this.logger.log(`Loaded vitrines: ${this.vitrinesCache.join(', ')}`);
      return this.vitrinesCache;
    } catch (error) {
      this.logger.warn(`Error fetching vitrines: ${error.message}`);
      // Fallback to config or default 2
      return [this.vitrineId || 2];
    }
  }

  /**
   * Fetches invoiced sales (faturamentos) from Millenium API.
   * STRICTLY filters by 24h window.
   *
   * @param start DateTime start of the window
   * @param end DateTime end of the window
   * @returns {Promise<any[]>} List of faturamentos with parsed dates.
   */
  async getFaturamentos(start: Date, end: Date) {
    const allSales: any[] = [];
    let skip = 0;
    const batchSize = 1000;
    let hasMore = true;

    // Helper to format Date to Millenium specific format if needed,
    // or ISO string if supported.
    // Based on docs, usually expects ISO-like or specific format.
    // Let's rely on standard ISO string first, interceptor might handle it or
    // we use a simple formatter.
    // Check previous usage? No previous usage of date range param confirmed.
    // We will use toISOString().
    const params = {
      data_emissao_inicial: start.toISOString(),
      data_emissao_final: end.toISOString(),
      lancamentos_pedido: true, // IMPORTANT: Get items
      $format: 'json',
      $top: batchSize,
    };

    this.logger.log(
      `Fetching faturamentos from ${params.data_emissao_inicial} to ${params.data_emissao_final}`,
    );

    try {
      while (hasMore) {
        const response = await lastValueFrom(
          this.httpService.get(
            `${this.apiUrl}/pedido_venda/listafaturamentos`,
            {
              params: {
                ...params,
                $skip: skip,
              },
              timeout: 30000, // 30 seconds
            },
          ),
        );

        const batch = response.data.value || [];

        if (batch.length > 0) {
          allSales.push(...batch);
          skip += batchSize;
          if (batch.length < batchSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      this.logger.log(`Total faturamentos fetched: ${allSales.length}`);

      return allSales.map((sale, index) => {
        if (index === 0) {
          this.logger.debug(`[DEBUG] Raw Sale Item 0: data_emissao=${sale.data_emissao}, data_atualizacao=${sale.data_atualizacao}, pedidov=${sale.cod_pedidov}`);
        }
        // 1. Data Emissao (Original)
        let dateEmissaoParsed = this.parseAspNetDate(sale.data_emissao);
        if (!dateEmissaoParsed && sale.data_emissao) {
          dateEmissaoParsed = new Date(sale.data_emissao);
        }

        // 2. Data Atualizacao (Real Chronology for History)
        let dateAtualizacaoParsed = this.parseAspNetDate(sale.data_atualizacao);
        if (!dateAtualizacaoParsed && sale.data_atualizacao) {
          dateAtualizacaoParsed = new Date(sale.data_atualizacao);
        }

        // Fallback for invalid dates
        if (!dateEmissaoParsed || isNaN(dateEmissaoParsed.getTime())) {
          dateEmissaoParsed = new Date();
        }

        return {
          ...sale,
          data_emissao_parsed: dateEmissaoParsed,
          data_atualizacao_parsed: dateAtualizacaoParsed, // New field
          // Parse items if they exist/needed
        };
      });
    } catch (error) {
      this.logger.error(
        `Error fetching faturamentos: ${error.message}`,
        error.stack,
      );
      // Clean error rethrow
      throw new Error(`Millenium API Error: ${error.message}`);
    }
  }

  /**
   * Searches for product details across all available vitrines.
   * Returns the first match found.
   */
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

    this.logger.warn(
      `Product ${produtoId} not found in any vitrine (${vitrines.join(',')})`,
    );
    return null;
  }
}
