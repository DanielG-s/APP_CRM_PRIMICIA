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
import { UsersSyncService } from './users-sync.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerkClient;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    private prisma: PrismaService,
    private usersSyncService: UsersSyncService,
  ) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
      publishableKey: this.configService.get<string>(
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      ),
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

      let dbUser = await this.prisma.user.findUnique({
        where: { clerkId: sessionClaims.sub },
      });

      // Fallback: If the user is authenticated in Clerk but missing in our DB
      // (e.g. wiped database or missed webhook), we auto-provision them.
      if (!dbUser) {
        let name = 'Usuário (Auto-Sync)';
        let email = '';

        try {
          // Fetch full details from Clerk API to populate our DB accurately
          const clerkUser = await this.clerkClient.users.getUser(
            sessionClaims.sub,
          );
          name = clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
            : name;
          email = clerkUser.emailAddresses[0]?.emailAddress || email;
        } catch (e) {
          console.error('Clerk fetch user failed in guard:', e);
        }

        // Deixa a ForbiddenException do usersSyncService vazar para o interceptor caso não tenha sido convidado
        dbUser = await this.usersSyncService.syncUser(
          sessionClaims.sub, // clerkId
          email,
          name,
        );
      }

      request.user = dbUser;

      return true;
    } catch (error: any) {
      if (error.status === 403) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
