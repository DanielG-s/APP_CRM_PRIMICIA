import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsersSyncService {
    constructor(private prisma: PrismaService) { }

    async syncUser(clerkId: string, email: string, name?: string, storeId?: string) {
        let finalStoreId = storeId;

        if (!finalStoreId) {
            const store = await this.prisma.store.findFirst();
            if (!store) throw new Error('No store configured');
            finalStoreId = store.id;
        }

        return this.prisma.user.upsert({
            where: { email },
            update: { clerkId, name, storeId: finalStoreId },
            create: {
                clerkId,
                email,
                name,
                role: 'user',
                storeId: finalStoreId,
            },
        });
    }

    async removeUser(clerkId: string) {
        return this.prisma.user.deleteMany({
            where: { clerkId },
        });
    }
}
