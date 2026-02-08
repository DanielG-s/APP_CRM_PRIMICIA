import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SegmentationQueryBuilder } from './segmentation-query.builder';
import { CRM_CONFIG } from 'src/config/crm.config';

@Injectable()
export class DataExportService {
  constructor(
    private prisma: PrismaService,
    private queryBuilder: SegmentationQueryBuilder,
  ) {}

  async exportSegmentToCsv(segmentId: string): Promise<string> {
    const segment = await this.prisma.segment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) throw new Error('Segmento não encontrado');

    const whereClause = this.queryBuilder.build(segment.rules as any[]);

    const customers = await this.prisma.customer.findMany({
      where: whereClause,
      take: CRM_CONFIG.SEGMENTATION.EXPORT_LIMIT,
      orderBy: { name: 'asc' },
      select: {
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        totalSpent: true,
        lastOrderDate: true,
      },
    });

    const header = 'Nome,Email,Telefone,Cidade,UF,Total Gasto,Ultima Compra\n';

    const rows = customers
      .map((c) => {
        const safeName = c.name ? `"${c.name.replace(/"/g, '""')}"` : '';
        const safeCity = c.city ? `"${c.city}"` : '';
        const date = c.lastOrderDate
          ? c.lastOrderDate.toISOString().split('T')[0]
          : '';

        return `${safeName},${c.email || ''},${c.phone || ''},${safeCity},${c.state || ''},${c.totalSpent || 0},${date}`;
      })
      .join('\n');

    return header + rows;
  }
}
