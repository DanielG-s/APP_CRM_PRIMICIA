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
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private clerkClient;

    constructor(
        private configService: ConfigService,
        private reflector: Reflector,
        private prisma: PrismaService,
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

            const dbUser = await this.prisma.user.findUnique({
                where: { clerkId: sessionClaims.sub }
            });

            if (!dbUser) {
                throw new UnauthorizedException('User not found in database');
            }

            request.user = dbUser;

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
