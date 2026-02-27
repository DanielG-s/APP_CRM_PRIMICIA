import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEmailSettingsDto } from './dto/update-email-settings.dto';
import { CreateWhatsappInstanceDto } from './dto/create-whatsapp.dto';
import { EncryptionService } from 'src/common/services/encryption.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) { }

  // ==========================
  // E-MAIL
  // ==========================
  async getEmailSettings() {
    // Pega a primeira loja (assumindo single-tenant por enquanto)
    const store = await this.prisma.store.findFirst();
    if (!store) return null; // Retorna null para o front saber que não tem config

    const settings = await this.prisma.emailSettings.findUnique({
      where: { storeId: store.id },
    });

    if (settings && settings.pass) {
      // Mascaramos a senha para o frontend, nunca enviamos decriptada para a UI
      settings.pass = '********';
    }

    return settings;
  }

  async upsertEmailSettings(data: UpdateEmailSettingsDto) {
    const store = await this.prisma.store.findFirst();
    if (!store)
      throw new NotFoundException('Nenhuma loja cadastrada no sistema.');

    // Criptografamos a senha antes de salvar
    const encryptedData = { ...data };
    if (data.pass) {
      encryptedData.pass = this.encryptionService.encrypt(data.pass);
    }

    // Upsert: Atualiza se existe, Cria se não existe
    return this.prisma.emailSettings.upsert({
      where: { storeId: store.id },
      update: {
        ...encryptedData,
      },
      create: {
        organizationId: store.organizationId,
        storeId: store.id,
        ...encryptedData,
      },
    });
  }

  // ==========================
  // WHATSAPP
  // ==========================
  async listWhatsappInstances() {
    const store = await this.prisma.store.findFirst();
    if (!store) return [];

    const instances = await this.prisma.storeWhatsappNumber.findMany({
      where: { storeId: store.id },
      orderBy: { isDefault: 'desc' }, // Mostra o padrão primeiro
    });

    return instances.map(inst => {
      if (inst.token) inst.token = '********'; // Mascara o token para a UI
      return inst;
    });
  }

  async addWhatsappInstance(data: CreateWhatsappInstanceDto) {
    const store = await this.prisma.store.findFirst();
    if (!store) throw new NotFoundException('Loja não encontrada.');

    // Criptografa o token se existir
    const encryptedData = { ...data };
    if (data.token) {
      encryptedData.token = this.encryptionService.encrypt(data.token);
    }

    // Se este for marcado como padrão, remove o padrão dos outros
    if (data.isDefault) {
      await this.prisma.storeWhatsappNumber.updateMany({
        where: { storeId: store.id },
        data: { isDefault: false },
      });
    }

    return this.prisma.storeWhatsappNumber.create({
      data: {
        organizationId: store.organizationId,
        storeId: store.id,
        ...encryptedData,
        status: 'CONNECTED', // Aqui você integraria com a API para checar o status real
      },
    });
  }

  async deleteWhatsappInstance(id: string) {
    return this.prisma.storeWhatsappNumber.delete({
      where: { id },
    });
  }
  // ==========================
  // STORE (GERAL)
  // ==========================
  async getStore() {
    return this.prisma.store.findFirst();
  }

  async updateStore(data: any) {
    const store = await this.prisma.store.findFirst();
    if (!store) throw new NotFoundException('Loja não encontrada.');

    return this.prisma.store.update({
      where: { id: store.id },
      data: {
        name: data.name,
        cnpj: data.cnpj,
        cityNormalized: data.cityNormalized,
      },
    });
  }
}
