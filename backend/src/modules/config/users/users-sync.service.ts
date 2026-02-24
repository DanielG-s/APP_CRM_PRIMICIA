import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersSyncService {
  constructor(private prisma: PrismaService) { }

  async syncUser(clerkId: string, email: string, name?: string, organizationId?: string) {
    // Find if user was invited (email exists)
    const existingUser = await this.prisma.user.findFirst({
      where: organizationId ? { organizationId, email } : { email },
      include: { role: true, accessibleStores: true },
    });

    if (!existingUser) {
      // Se o usuário não existe pelo email, significa que ele tentou burlar
      // e se registrar no Clerk sem um convite do backend.
      throw new ForbiddenException(
        'Acesso negado: Sua conta não foi convidada para usar o sistema.',
      );
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
        include: { role: true, accessibleStores: true },
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
