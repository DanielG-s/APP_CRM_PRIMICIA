import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async findAll(organizationId: string) {
        return this.prisma.role.findMany({
            where: { organizationId },
            orderBy: { level: 'asc' },
        });
    }

    async findOne(organizationId: string, roleId: string) {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role || role.organizationId !== organizationId) {
            throw new NotFoundException('Role não encontrada');
        }
        return role;
    }

    async create(organizationId: string, userLevel: number, data: any) {
        if (userLevel !== 0 && data.level <= userLevel) {
            throw new ForbiddenException('Você não pode criar um cargo com nível hierárquico maior ou igual ao seu.');
        }

        return this.prisma.role.create({
            data: {
                organizationId,
                name: data.name,
                description: data.description,
                level: data.level,
                permissions: data.permissions || [],
            },
        });
    }

    async update(organizationId: string, roleId: string, userLevel: number, data: any) {
        const role = await this.findOne(organizationId, roleId);

        // Ninguém pode editar a role de Super Admin exceto outro Super Admin, e Super Admin = Level 0
        if (role.level === 0 && userLevel !== 0) {
            throw new ForbiddenException('Você não pode editar o cargo de Administrador.');
        }

        // Se a role a ser editada tem um nível mais alto da hierarquia (menor valor numérico) do que o próprio usuário
        if (userLevel !== 0 && role.level <= userLevel) {
            throw new ForbiddenException('Você não pode editar um cargo com nível hierárquico maior ou igual ao seu.');
        }

        // Se tentam elevar a role para um nível superior ao seu
        if (userLevel !== 0 && data.level !== undefined && data.level <= userLevel) {
            throw new ForbiddenException('Você não pode elevar este cargo para um nível hierárquico maior ou igual ao seu.');
        }

        return this.prisma.role.update({
            where: { id: roleId },
            data: {
                name: data.name,
                description: data.description,
                level: data.level,
                permissions: data.permissions,
            },
        });
    }

    async remove(organizationId: string, roleId: string, userLevel: number) {
        const role = await this.findOne(organizationId, roleId);

        if (role.level === 0 && userLevel !== 0) {
            throw new ForbiddenException('Você não pode apagar o cargo de Administrador.');
        }

        if (userLevel !== 0 && role.level <= userLevel) {
            throw new ForbiddenException('Você não pode excluir um cargo com nível hierárquico maior ou igual ao seu.');
        }

        const linkedUsers = await this.prisma.user.count({ where: { roleId } });
        if (linkedUsers > 0) {
            throw new ForbiddenException('O cargo está em uso por usuários e não pode ser apagado.');
        }

        return this.prisma.role.delete({ where: { id: roleId } });
    }
}
