import { Injectable, OnModuleInit, OnModuleDestroy, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantContext } from '../common/tenancy/tenant.context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();

    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const ctx = tenantContext.getStore();

            // Modelos que DEVEM ter isolamento por Organization
            const tenantModels = [
              'Store', 'User', 'Customer', 'Transaction', 'Campaign', 'Segment',
              'EmailSettings', 'StoreGoal', 'StoreWhatsappNumber', 'Product',
              'Conversation', 'AccessLog', 'JobRun'
            ];

            if (tenantModels.includes(model as string)) {
              if (ctx) {
                if (!ctx.organizationId) {
                  throw new UnauthorizedException('Multi-tenant isolation warning: Action requires an explicit Organization context.');
                }

                const orgId = ctx.organizationId;
                const typedArgs = args as any;

                // Helper to inject where recursively
                const injectWhere = (obj: any) => {
                  if (!obj || typeof obj !== 'object') return;
                  if (obj.where) {
                    obj.where.organizationId = orgId;
                  }
                  const relationalKeys = ['include', 'select'];
                  for (const key of relationalKeys) {
                    if (obj[key] && typeof obj[key] === 'object') {
                      for (const relation of Object.keys(obj[key])) {
                        if (typeof obj[key][relation] === 'object' && obj[key][relation] !== null) {
                          obj[key][relation].where = obj[key][relation].where || {};
                        }
                      }
                    }
                  }
                };

                const injectData = (obj: any) => {
                  if (!obj) return;
                  obj.data = obj.data || {};
                  if (Array.isArray(obj.data)) {
                    obj.data = obj.data.map((d: any) => ({ ...d, organizationId: orgId }));
                  } else {
                    obj.data.organizationId = orgId;
                    for (const key of Object.keys(obj.data)) {
                      if (obj.data[key] && typeof obj.data[key] === 'object' && obj.data[key].create) {
                        if (Array.isArray(obj.data[key].create)) {
                          obj.data[key].create = obj.data[key].create.map((d: any) => ({ ...d, organizationId: orgId }));
                        } else {
                          obj.data[key].create.organizationId = orgId;
                        }
                      }
                    }
                  }
                };

                const readOps = ['findUnique', 'findFirst', 'findMany', 'count', 'update', 'updateMany', 'delete', 'deleteMany', 'aggregate', 'groupBy', 'findUniqueOrThrow', 'findFirstOrThrow', 'upsert'];
                const writeOps = ['create', 'createMany'];

                // Explicit exception for update/delete on unique identifiers when skipping org boundaries if desired
                if (readOps.includes(operation)) {
                  typedArgs.where = typedArgs.where || {};
                  typedArgs.where.organizationId = orgId;
                } else if (writeOps.includes(operation)) {
                  injectData(typedArgs);
                }
              }
            }

            return query(args);
          }
        }
      }
    }) as this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
