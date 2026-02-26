import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true; // Sem @Permissions, a rota é livre (ou coberta por outro guard)
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.role) {
            throw new ForbiddenException('Acesso negado: Perfil de acesso não encontrado.');
        }

        // Nível 0 é Super Admin: Bypass total
        if (user.role.level === 0) {
            return true;
        }

        const userPermissions: string[] = user.role.permissions || [];

        // O Cargo precisa ter no mínimo 1 das permissões listadas no Decorator da Rota
        const hasPermission = requiredPermissions.some((permission) => userPermissions.includes(permission));

        if (!hasPermission) {
            throw new ForbiddenException('Acesso negado: Seu cargo não possui permissão para acessar este recurso.');
        }

        return true;
    }
}
