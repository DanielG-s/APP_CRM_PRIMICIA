import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from '../tenancy/tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se há usuário autenticado com organizationId, iniciamos o contexto do Tenant para as queries do Prisma
    if (user && user.role) {
      let activeOrgId = user.organizationId;

      // SUPER_ADMIN override via header
      if (user.role === 'SUPER_ADMIN' && request.headers['x-org-id']) {
        activeOrgId = request.headers['x-org-id'];
      }

      if (activeOrgId) {
        return new Observable((subscriber) => {
          tenantContext.run({ organizationId: activeOrgId, role: user.role }, () => {
            next.handle().subscribe(subscriber);
          });
        });
      }
    }

    return next.handle();
  }
}
