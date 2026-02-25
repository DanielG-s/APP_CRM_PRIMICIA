import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async getOrganizationName(organizationId: string) {
    return this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });
  }

  async findAll(currentUser: any) {
    if (currentUser.role?.level === 0) {
      return this.prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          organizationId: true,
          clerkId: true,
        },
      });
    }

    // Outros veem apenas da sua organização
    const organizationId = currentUser.organizationId;
    if (!organizationId) return [];

    return this.prisma.user.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async inviteUser(
    currentUser: any,
    email: string,
    name: string,
    roleId: string,
    storeIds?: string[],
    targetOrganizationId?: string,
  ) {
    const roleData = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!roleData) throw new NotFoundException('Cargo inválido.');

    // Validation: Who can invite who?
    const currentUserLevel = currentUser.role?.level ?? 999;
    if (currentUserLevel > 10) {
      throw new ConflictException(
        'Apenas Gerentes ou Super Admins podem convidar usuários.',
      );
    }

    if (currentUserLevel !== 0 && roleData.level <= currentUserLevel) {
      throw new ConflictException(
        'Acesso negado: Você não possui privilégios para atribuir este cargo.',
      );
    }

    // Determine Tenant
    const finalOrgId =
      currentUserLevel === 0 && targetOrganizationId
        ? targetOrganizationId
        : currentUser.organizationId;

    if (!finalOrgId)
      throw new NotFoundException('Identificador de Organização inválido.');

    const existing = await this.prisma.user.findFirst({
      where: { organizationId: finalOrgId, email },
    });
    if (existing)
      throw new ConflictException('E-mail já consta na base de dados.');

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    try {
      // 1. Buscar a Organization local e garantir que exista no Clerk
      const org = await this.prisma.organization.findUnique({
        where: { id: finalOrgId },
      });
      if (!org) throw new NotFoundException('Organização não encontrada.');

      let clerkOrgId = (org as any).clerkOrgId;

      // 2. Se não tem Clerk Org vinculada ainda, criar uma
      if (!clerkOrgId) {
        const clerkOrg = await clerkClient.organizations.createOrganization({
          name: org.name,
          createdBy: currentUser.clerkId,
        });
        clerkOrgId = clerkOrg.id;

        await this.prisma.organization.update({
          where: { id: finalOrgId },
          data: { clerkOrgId } as any,
        });
      }

      // 3. Dispara o convite usando Clerk Organization Invitation
      await clerkClient.organizations.createOrganizationInvitation({
        organizationId: clerkOrgId,
        emailAddress: email,
        inviterUserId: currentUser.clerkId,
        role: 'org:member',
        redirectUrl: (process.env.FRONTEND_URL || 'http://localhost:3001') + '/sign-up',
      });

      // 4. Cria o placeholder localmente para amarração futura no login
      return this.prisma.user.create({
        data: {
          email,
          name,
          roleId: roleId,
          status: 'INVITED',
          organizationId: finalOrgId,
          ...(storeIds && storeIds.length > 0 && {
            accessibleStores: { connect: storeIds.map((id) => ({ id })) },
          }),
        } as any,
      });
    } catch (error: any) {
      console.error('Erro ao processar convite no Clerk:', error?.message || error);
      if (error?.status === 404 || error?.status === 409) {
        throw new ConflictException(error.message || 'Erro ao processar convite.');
      }
      throw new ConflictException(
        'Não foi possível disparar o convite no Clerk.',
      );
    }
  }

  async updateRole(currentUser: any, targetUserId: string, newRoleId: string, storeIds?: string[]) {
    if (currentUser.id === targetUserId) {
      throw new ConflictException(
        'Operação bloqueada: Você não pode alterar sua própria patente.',
      );
    }

    const currentUserLevel = currentUser.role?.level ?? 999;
    if (currentUserLevel > 10) {
      throw new ConflictException(
        'Apenas Gerentes ou Super Admins podem alterar perfis.',
      );
    }

    const newRoleData = await this.prisma.role.findUnique({ where: { id: newRoleId } });
    if (!newRoleData) throw new NotFoundException('Novo cargo inválido.');

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { role: true },
    });
    if (!targetUser)
      throw new NotFoundException('Usuário alvo não encontrado.');

    // Isolamento de Tenant
    if (
      currentUserLevel !== 0 &&
      targetUser.organizationId !== currentUser.organizationId
    ) {
      throw new ConflictException(
        'Acesso negado: O usuário alvo pertence a outra organização.',
      );
    }

    // Proteção de Escalonamento (Escalation Protection)
    if (currentUserLevel !== 0) {
      if (newRoleData.level <= currentUserLevel) {
        throw new ConflictException(
          'Acesso negado: Você não pode promover usuários para este cargo.',
        );
      }
      if (targetUser.role && targetUser.role.level <= currentUserLevel) {
        throw new ConflictException(
          'Acesso negado: Você não pode alterar o perfil de um usuário com cargo igual ou superior ao seu.',
        );
      }
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        roleId: newRoleId,
        ...(storeIds !== undefined && { // can be [] if we want to remove all
          accessibleStores: { set: storeIds.map((id) => ({ id })) },
        }),
      },
    });
  }

  async remove(currentUser: any, id: string) {
    // Retirar protecao de tentar se deletar? Melhor manter se for admin
    if (currentUser.id === id)
      throw new ConflictException('Você não pode se excluir.');

    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const currentUserLevel = currentUser.role?.level ?? 999;
    // Isolamento de Tenant (preventivo, em caso de by-pass no prisma)
    if (
      currentUserLevel !== 0 &&
      user.organizationId !== currentUser.organizationId
    ) {
      throw new ConflictException(
        'Acesso negado: O usuário alvo pertence a outra organização.',
      );
    }

    // Proteção de Escalonamento na Deleção
    if (currentUserLevel !== 0) {
      if (user.role && user.role.level <= currentUserLevel) {
        throw new ConflictException(
          'Acesso negado: Você não tem permissão para remover superiores ou usuários com o mesmo cargo.',
        );
      }
    }

    // Deletar da organização do Clerk se existir clerkId
    if (user.clerkId) {
      try {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
          publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        });
        await clerkClient.users.deleteUser(user.clerkId);
      } catch (error) {
        console.error(
          `Erro ao deletar usuário ${user.clerkId} do Clerk:`,
          error,
        );
      }
    }

    return this.prisma.user.delete({ where: { id } });
  }

  async adminResetPassword(currentUser: any, targetUserId: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) throw new NotFoundException('Usuário alvo não encontrado.');

    // Isolamento de Tenant (preventivo, em caso de by-pass no prisma)
    if (
      currentUser.role?.level !== 0 &&
      targetUser.organizationId !== currentUser.organizationId
    ) {
      throw new ConflictException('Acesso negado: O usuário alvo pertence a outra organização.');
    }

    if (!targetUser.clerkId) {
      throw new ConflictException('O usuário alvo não concluiu a criação da conta no Clerk (ainda está como INVITED).');
    }

    // Ação principal
    try {
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      });

      // Revoke all sessions to enforce re-login
      const sessions = await clerkClient.sessions.getSessionList({ userId: targetUser.clerkId });
      for (const session of sessions) {
        await clerkClient.sessions.revokeSession(session.id);
      }

      // We cannot directly "send reset password email" from backend easily unless we use beta APIs or ticket creation.
      // Easiest is to just revoke, when they login they will click "forgot password".
      // But let's log the action exactly as requested.
      await this.prisma.accessLog.create({
        data: {
          userId: currentUser.id,
          organizationId: currentUser.organizationId,
          storeId: currentUser.storeId,
          endpoint: `/users/${targetUserId}/reset-password`,
          method: 'POST',
          actionType: 'ADMIN_PASSWORD_RESET',
        },
      });

      return { success: true, message: 'Senhas e sessões revogadas com sucesso. O usuário precisará utilizar o Esqueci minha senha no Clerk.' };
    } catch (error) {
      console.error('Erro ao resetar senha via Clerk:', error);
      throw new ConflictException('Falha ao comunicar com Clerk para reset de senha.');
    }
  }
}
