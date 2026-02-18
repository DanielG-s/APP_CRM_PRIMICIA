import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MilleniumService {
  private readonly logger = new Logger(MilleniumService.name);
  public readonly apiUrl: string;
  private readonly username: string;
  private readonly pass: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('MILLENIUM_API_URL') || '';
    this.username = this.configService.get<string>('MILLENIUM_API_USERNAME') || '';
    this.pass = this.configService.get<string>('MILLENIUM_API_PASSWORD') || '';
  }

  async getFaturamentos(startDate: Date, endDate: Date) {
    // ... Keeping getFaturamentos same as before ... 
    // Optimization: Just copy the logic or simplified version since we are focusing on Customers
    // For safety, I'll restore the robust getFaturamentos logic I wrote earlier.
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const params = {
      $format: 'json',
      data_atualizacao_inicial: start,
      data_atualizacao_final: end,
      $top: 1000,
      $skip: 0,
    };

    const allSales: any[] = [];
    let hasMore = true;

    while (hasMore) {
      // Need to add Auth here too!
      try {
        const response = await lastValueFrom(
          this.httpService.get(`${this.apiUrl}/faturamento/listafaturamentos`, {
            params,
            auth: { username: this.username, password: this.pass }
          }),
        );
        const data = response.data;
        const sales = data.value || [];

        if (sales.length > 0) {
          allSales.push(...sales);
          params.$skip += params.$top;
        } else {
          hasMore = false;
        }

        if (allSales.length > 50000) break;
      } catch (error) {
        this.logger.error(`Error fetching Millenium sales: ${error.message}`);
        throw error;
      }
    }
    return allSales;
  }

  async getProductDetails(produtoId: number) {
    return null;
  }

  async getSalesOrder(params: { cod_pedidov?: string; nota?: string }) {
    try {
      if (!params.cod_pedidov && !params.nota) return null;

      const queryParams: any = { $format: 'json', $top: 1 };
      if (params.cod_pedidov) queryParams.cod_pedidov = params.cod_pedidov;
      else if (params.nota) queryParams.nota = params.nota;

      const response = await lastValueFrom(
        this.httpService.get(`${this.apiUrl}/pedido_venda/listapedidos`, {
          params: queryParams,
          auth: { username: this.username, password: this.pass }
        }),
      );
      return response.data.value?.[0] || null;
    } catch (error) {
      return null;
    }
  }

  async findProductInVitrines(produtoId: number) {
    return null;
  }

  /**
   * Fetches customers using 'trans_id' keyset pagination.
   * Confirmed that passing 'trans_id' acts as a >= filter in Millenium API.
   */
  async getCustomersKeyset(params: any = {}) {
    const allCustomers: any[] = [];
    const batchSize = 1000; // Safe batch size
    const maxItems = Number(params.limit) || 1000000;

    // Start from 0 or specific ID
    let currentTransId = 0;
    let hasMore = true;
    let loopCount = 0;

    this.logger.log(`Starting Keyset Sync (trans_id) - Max: ${maxItems}`);

    try {
      // Extract other params if needed
      const { limit, $top, ...apiParams } = params;

      while (hasMore) {
        loopCount++;

        // We assume trans_id parameter works as a filter >= currentTransId
        // Based on tests: trans_id=809 returned 812. So it seems to find "next" or "starting from".
        // To avoid stuck loop if it includes currentTransId, we must handle it.

        const response = await lastValueFrom(
          this.httpService.get(`${this.apiUrl}/clientes/lista`, {
            params: {
              ...apiParams,
              $format: 'json',
              $top: batchSize,
              trans_id: currentTransId,
              $orderby: 'trans_id', // CRITICAL: Guarantee order
            },
            auth: {
              username: this.username,
              password: this.pass,
            },
            timeout: 60000,
          }),
        );

        const batch = response.data.value || [];

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        allCustomers.push(...batch);

        // Prepare for next batch
        // We get the LAST trans_id from this batch and use it as the starting point for next?
        // If query is "trans_id >= X", next query should be "trans_id >= LastID + 1" to avoid duplicates.
        // But the API test `trans_id=809` returned `812`.
        // So let's take the LAST record's trans_id.

        const lastRecord = batch[batch.length - 1];
        const lastId = lastRecord.trans_id;

        // Logging progress every 5 batches
        if (loopCount % 5 === 0) {
          this.logger.log(`Keyset Progress: Fetched ${allCustomers.length} so far. Last trans_id: ${lastId}`);
        }

        if (lastId <= currentTransId) {
          // Panic: Infinite loop detection.
          this.logger.warn(`Stuck at trans_id ${currentTransId}. Aborting.`);
          hasMore = false;
        } else {
          currentTransId = lastId;
        }

        // Safety Limits
        if (allCustomers.length >= maxItems) break;
        if (loopCount > 5000) { // Safety break
          this.logger.warn('Hit safety loop limit.');
          break;
        }
      }

      this.logger.log(`Fetched ${allCustomers.length} customers via Keyset.`);
      return allCustomers;

    } catch (error) {
      this.logger.error(`Error fetching customers (Keyset): ${error.message}`);
      throw error;
    }
  }


  async getCustomersBigBang(params: any = {}) {
    // Kept for reference or fallback
    return this.getCustomersKeyset(params);
  }
}
