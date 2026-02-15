
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const store = await this.prisma.store.findFirst();
        if (!store) return [];

        return this.prisma.user.findMany({
            where: { storeId: store.id },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                // Don't select password
            }
        });
    }

    async create(data: CreateUserDto) {
        const store = await this.prisma.store.findFirst();
        if (!store) throw new NotFoundException('Configure a loja primeiro.');

        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new ConflictException('E-mail já cadastrado.');

        return this.prisma.user.create({
            data: {
                ...data,
                storeId: store.id,
                // In a real app, hash the password here!
                // password: await bcrypt.hash(data.password, 10)
            }
        });
    }

    async remove(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }
}
