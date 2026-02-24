import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  organizationId: string;
  role: string;
}

export const tenantContext = new AsyncLocalStorage<TenantContextData>();
