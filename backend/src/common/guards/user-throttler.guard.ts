import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        // Se o usuário estiver autenticado, use o ID dele como a chave do Rate Limit
        if (req.user && req.user.id) {
            return `user-${req.user.id}`;
        }
        // Caso não esteja logado, fazemos fallback para o IP fornecido pelo Trust Proxy ou conexão nativa
        return req.ip || req.connection?.remoteAddress || 'unknown';
    }

    // GenerateKey uses the tracker (which is ID or IP) to isolate limits across endpoints if needed.
    // NestJS v5 Throttler usually uses generateKey for this.
    protected generateKey(context: ExecutionContext, suffix: string, name: string): string {
        const req = context.switchToHttp().getRequest();
        const tracker = req.user?.id ? `user-${req.user.id}` : (req.ip || 'unknown');
        return `${name}-${tracker}-${suffix}`;
    }

    // Override da exception para garantir que retorne 429 gracefully e não caia o node
    protected throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: any): Promise<void> {
        const { HttpException, HttpStatus } = require('@nestjs/common');
        throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
}
