import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are strictly required for this endpoint, allow access (or it may be blocked by another guard like ClerkAuthGuard)
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by ClerkAuthGuard

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Acesso negado: Perfil de usuário não identificado.',
      );
    }

    // SUPER_ADMIN bypasses all role checks
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if the user's role is included in the required roles for this endpoint
    const hasRole = requiredRoles.includes(user.role as Role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado: Requer privilégios de ${requiredRoles.join(' ou ')}.`,
      );
    }

    return true;
  }
}
