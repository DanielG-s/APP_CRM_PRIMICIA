import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private clerkClient;

    constructor(
        private configService: ConfigService,
        private reflector: Reflector
    ) {
        this.clerkClient = createClerkClient({
            secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
            publishableKey: this.configService.get<string>('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
        });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];

        try {
            const sessionClaims = await this.clerkClient.verifyToken(token);

            request.user = {
                id: sessionClaims.sub,
                email: sessionClaims.email,
                metadata: sessionClaims.publicMetadata,
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
