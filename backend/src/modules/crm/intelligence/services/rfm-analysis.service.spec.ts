import { Test, TestingModule } from '@nestjs/testing';
import { RfmAnalysisService } from './rfm-analysis.service';
import { PrismaService } from 'src/prisma/prisma.service';

// Mock do CRM Config para testes previsíveis
jest.mock('src/config/crm.config', () => ({
  CRM_CONFIG: {
    RFM: {
      CHURN_DAYS: 180,
      RISK_DAYS: 90,
      LOYAL_ORDER_COUNT: 5,
      LOYAL_TOTAL_SPENT: 1000,
      MIN_ORDERS_FOR_LOYALTY: 1,
    },
  },
}));

describe('RfmAnalysisService', () => {
  let service: RfmAnalysisService;
  let prisma: PrismaService;

  const mockPrisma = {
    customer: {
      groupBy: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RfmAnalysisService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RfmAnalysisService>(RfmAnalysisService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCustomerMetrics', () => {
    it('should classify as Hibernando if churn days exceeded', async () => {
      // Data antiga (> 180 dias)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 200);

      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { totalValue: 50 },
        _count: { id: 10 },
        _max: { date: oldDate },
      });

      await service.updateCustomerMetrics('cust1');

      expect(prisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rfmStatus: 'Hibernando' }),
        }),
      );
    });

    it('should classify as Champions if spent > 1000', async () => {
      const recentDate = new Date();

      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { totalValue: 1500 },
        _count: { id: 3 },
        _max: { date: recentDate },
      });

      await service.updateCustomerMetrics('cust2');

      expect(prisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rfmStatus: 'Champions' }),
        }),
      );
    });

    it('should classify as Leais if orders > 1 but not champion', async () => {
      const recentDate = new Date();

      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { totalValue: 100 },
        _count: { id: 3 },
        _max: { date: recentDate },
      });

      await service.updateCustomerMetrics('cust3');

      expect(prisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rfmStatus: 'Leais' }),
        }),
      );
    });
  });

  describe('getAnalysis', () => {
    it('should aggregate RFM groups correctly', async () => {
      mockPrisma.customer.groupBy.mockResolvedValue([
        { rfmStatus: 'Champions', _count: { id: 10 } },
        { rfmStatus: 'Hibernando', _count: { id: 5 } },
      ]);

      const result = await service.getAnalysis();

      expect(result.find((r) => r.name === 'Champions')?.value).toBe(10);
      expect(result.find((r) => r.name === 'Hibernando')?.value).toBe(5);
      expect(result.find((r) => r.name === 'Leais')?.value).toBe(0); // Default 0
    });
  });
});
