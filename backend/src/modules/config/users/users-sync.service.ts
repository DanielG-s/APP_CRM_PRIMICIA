import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersSyncService {
  constructor(private prisma: PrismaService) { }

  async syncUser(clerkId: string, email: string, name?: string, organizationId?: string) {
    // Find if user was invited (email exists)
    const existingUser = await this.prisma.user.findFirst({
      where: organizationId ? { organizationId, email } : { email },
    });

    if (!existingUser) {
      // Self-Serve SaaS Onboarding:
      // Se o usuário não foi convidado, criamos um Tenant isolado (Organization) novo para ele.
      const newOrg = await this.prisma.organization.create({
        data: {
          name: `Workspace de ${name || email}`,
        },
      });

      // @ts-ignore
      return this.prisma.user.create({
        data: {
          clerkId,
          email,
          name: name || 'Usuário',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          organizationId: newOrg.id,
        } as any,
      });
    }

    // Se o usuário existe, mas não tinha o clerkId associado (primeiro login após o convite ter sido providenciado)
    if (!existingUser.clerkId || existingUser.clerkId !== clerkId) {
      // @ts-ignore
      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          clerkId,
          status: 'ACTIVE',
          name: existingUser.name || name, // Mantém o nome do convite se existir, ou pega do Clerk
        } as any,
      });
    }

    return existingUser;
  }

  async removeUser(clerkId: string) {
    return this.prisma.user.deleteMany({
      where: { clerkId },
    });
  }
}
