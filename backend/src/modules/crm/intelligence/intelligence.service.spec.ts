/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { IntelligenceService } from './intelligence.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SegmentationQueryBuilder } from './services/segmentation-query.builder';
import { RfmAnalysisService } from './services/rfm-analysis.service';
import { DataExportService } from './services/data-export.service';

describe('IntelligenceService', () => {
  let service: IntelligenceService;
  let prisma: PrismaService;

  const mockPrisma = {
    customer: {
      count: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    segment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    segmentHistory: {
      create: jest.fn(),
    },
    store: {
      findFirst: jest.fn(),
    },
  };

  const mockQueryBuilder = {
    build: jest.fn().mockReturnValue({}),
  };

  const mockRfmService = {
    getAnalysis: jest.fn().mockResolvedValue([]),
    updateCustomerMetrics: jest.fn(),
  };

  const mockExportService = {
    exportSegmentToCsv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntelligenceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SegmentationQueryBuilder, useValue: mockQueryBuilder },
        { provide: RfmAnalysisService, useValue: mockRfmService },
        { provide: DataExportService, useValue: mockExportService },
      ],
    }).compile();

    service = module.get<IntelligenceService>(IntelligenceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePreview', () => {
    it('should return aggregated metrics', async () => {
      mockPrisma.customer.count.mockResolvedValueOnce(50); // Filtered
      mockPrisma.customer.count.mockResolvedValueOnce(100); // Total

      mockPrisma.customer.aggregate.mockResolvedValueOnce({
        _sum: { totalSpent: 5000 },
        _count: { id: 20 },
      });
      mockPrisma.customer.aggregate.mockResolvedValueOnce({
        _count: { email: 40, phone: 30 },
      });

      mockPrisma.customer.findMany.mockResolvedValue([]);

      const result = await service.calculatePreview([]);

      expect(result.metrics.total).toBe(50);
      expect(result.metrics.percent).toBe('50.0');
      expect(result.metrics.revenue.total).toBe(5000);
      expect(result.metrics.channels.email).toBe(40);
    });
  });

  describe('handleDailySegmentSnapshot', () => {
    it('should process snapshots for active segments', async () => {
      mockPrisma.segment.findMany.mockResolvedValue([
        { id: 'seg1', rules: [], name: 'Active Segment' },
      ]);
      mockPrisma.customer.count.mockResolvedValue(123);

      await service.handleDailySegmentSnapshot();

      expect(prisma.segmentHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ segmentId: 'seg1', count: 123 }),
      });

      expect(prisma.segment.update).toHaveBeenCalledWith({
        where: { id: 'seg1' },
        data: { lastCount: 123 },
      });
    });
  });

  describe('createSegment', () => {
    it('should create a new segment and calculate initial size', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({ id: 'store1' });
      mockPrisma.segment.findFirst.mockResolvedValue(null);
      mockPrisma.customer.count.mockResolvedValue(10);
      mockPrisma.segment.create.mockResolvedValue({ id: 'new-seg' });

      await service.createSegment({
        name: 'New Segment',
        rules: [],
        isDynamic: true,
      });

      expect(prisma.segment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lastCount: 10, storeId: 'store1' }),
        }),
      );
    });
  });
});
