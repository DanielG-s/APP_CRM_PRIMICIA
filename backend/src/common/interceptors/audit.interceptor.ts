import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const user = request.user;
        const isPublic = !user; // Public routes wouldn't have user initially

        // Only log specific methods or routes to avoid spamming the DB (e.g., skip /health)
        const url = request.originalUrl;
        if (url.includes('/health')) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(() => {
                // Successful response
                if (user && user.id) {
                    this.logAccess(user, request, response.statusCode);
                }
            }),
            catchError((error) => {
                // Error response (e.g. 403 Forbidden)
                if (user && user.id) {
                    const status = error.getStatus ? error.getStatus() : 500;
                    this.logAccess(user, request, status);
                }
                return throwError(() => error);
            }),
        );
    }

    private logAccess(user: any, request: any, status: number) {
        // Fire and forget logging
        this.prisma.accessLog.create({
            data: {
                userId: user.id,
                tenantId: user.storeId,
                endpoint: request.originalUrl,
                method: request.method,
                ip: request.ip || request.headers['x-forwarded-for'],
                status: status,
            }
        }).catch(err => {
            console.error('Failed to write AccessLog', err);
        });
    }
}
