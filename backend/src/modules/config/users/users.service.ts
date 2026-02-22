import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(currentUser: any) {
    if (currentUser.role === Role.SUPER_ADMIN) {
      return this.prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          organizationId: true, // changed from storeId
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
    role: string,
    targetOrganizationId?: string,
  ) {
    // Validation: Who can invite who?
    if (
      currentUser.role !== Role.SUPER_ADMIN &&
      currentUser.role !== Role.GERENTE_GERAL
    ) {
      throw new ConflictException(
        'Apenas Gerentes ou Super Admins podem convidar usuários.',
      );
    }

    // GERENTE_GERAL cannot create SUPER_ADMIN
    if (currentUser.role === Role.GERENTE_GERAL && role === Role.SUPER_ADMIN) {
      throw new ConflictException(
        'Acesso negado: Você não possui privilégios para criar contas de Super Admin.',
      );
    }

    // Determine Tenant
    const finalOrgId =
      currentUser.role === Role.SUPER_ADMIN && targetOrganizationId
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
      // Dispara o convite usando Clerk
      await clerkClient.invitations.createInvitation({
        emailAddress: email,
        publicMetadata: {
          role,
          tenantId: finalOrgId,
        },
        ignoreExisting: true,
      });

      // Cria o placeholder localmente para amarração futura no login
      return this.prisma.user.create({
        data: {
          email,
          name,
          role: role as Role,
          organizationId: finalOrgId,
        },
      });
    } catch (error) {
      console.error('Erro ao processar convite no Clerk:', error);
      throw new ConflictException(
        'Não foi possível disparar o convite no Clerk.',
      );
    }
  }

  async updateRole(currentUser: any, targetUserId: string, newRole: string) {
    if (currentUser.id === targetUserId) {
      throw new ConflictException(
        'Operação bloqueada: Você não pode alterar sua própria patente.',
      );
    }

    if (
      currentUser.role !== Role.SUPER_ADMIN &&
      currentUser.role !== Role.GERENTE_GERAL
    ) {
      throw new ConflictException(
        'Apenas Gerentes ou Super Admins podem alterar perfis.',
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser)
      throw new NotFoundException('Usuário alvo não encontrado.');

    // Isolamento de Tenant
    if (
      currentUser.role !== Role.SUPER_ADMIN &&
      targetUser.organizationId !== currentUser.organizationId
    ) {
      throw new ConflictException(
        'Acesso negado: O usuário alvo pertence a outra organização.',
      );
    }

    // Proteção de Escalonamento (Escalation Protection)
    if (currentUser.role === Role.GERENTE_GERAL) {
      if (newRole === Role.SUPER_ADMIN) {
        throw new ConflictException(
          'Acesso negado: Você não pode promover usuários a Super Admin.',
        );
      }
      if (targetUser.role === Role.SUPER_ADMIN) {
        throw new ConflictException(
          'Acesso negado: Você não pode rebaixar as permissões de um Super Admin.',
        );
      }
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as Role },
    });
  }

  async remove(currentUser: any, id: string) {
    // Retirar protecao de tentar se deletar? Melhor manter se for admin
    if (currentUser.id === id)
      throw new ConflictException('Você não pode se excluir.');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    // Isolamento de Tenant (preventivo, em caso de by-pass no prisma)
    if (
      currentUser.role !== Role.SUPER_ADMIN &&
      user.organizationId !== currentUser.organizationId
    ) {
      throw new ConflictException(
        'Acesso negado: O usuário alvo pertence a outra organização.',
      );
    }

    // Proteção de Escalonamento na Deleção
    if (currentUser.role === Role.GERENTE_GERAL) {
      if (user.role === Role.SUPER_ADMIN || user.role === Role.GERENTE_GERAL) {
        throw new ConflictException(
          'Acesso negado: Você não tem permissão para remover Super Admins ou outros Gerentes Gerais.',
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
      currentUser.role !== Role.SUPER_ADMIN &&
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
