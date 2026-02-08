import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { IntelligenceModule } from './../src/modules/crm/intelligence/intelligence.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('IntelligenceController (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockPrisma = {
    segment: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    customer: {
      count: jest.fn().mockResolvedValue(100),
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({
        _sum: { totalSpent: 1000 },
        _count: { id: 10, email: 5, phone: 3 },
      }),
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IntelligenceModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/webhook/crm/intelligence/segments (GET)', () => {
    return request(app.getHttpServer())
      .get('/webhook/crm/intelligence/segments')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('segments');
        expect(res.body).toHaveProperty('totalCustomers');
      });
  });

  it('/webhook/crm/intelligence/preview (POST)', () => {
    return request(app.getHttpServer())
      .post('/webhook/crm/intelligence/preview')
      .send({ rules: [] })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('metrics');
        expect(res.body.metrics.total).toBe(100);
      });
  });
});
