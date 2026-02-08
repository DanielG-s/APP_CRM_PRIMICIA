import { Test, TestingModule } from '@nestjs/testing';
import { SegmentationQueryBuilder } from './segmentation-query.builder';

describe('SegmentationQueryBuilder', () => {
  let builder: SegmentationQueryBuilder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SegmentationQueryBuilder],
    }).compile();

    builder = module.get<SegmentationQueryBuilder>(SegmentationQueryBuilder);
  });

  it('should be defined', () => {
    expect(builder).toBeDefined();
  });

  describe('build', () => {
    it('should return empty object for empty rules', () => {
      const result = builder.build([]);
      expect(result).toEqual({});
    });

    it('should build simple Characteristic rule (City equals SP)', () => {
      const rules = [
        {
          category: 'characteristic',
          field: 'city',
          operator: 'equals',
          value: 'SP',
          logicOperator: 'AND',
        },
      ];
      const result = builder.build(rules);
      expect(result).toEqual({
        AND: [{ city: { equals: 'SP', mode: 'insensitive' } }],
      });
    });

    it('should build OR logic correctly', () => {
      const rules = [
        {
          category: 'characteristic',
          field: 'city',
          operator: 'equals',
          value: 'SP',
          logicOperator: 'AND',
        },
        {
          category: 'characteristic',
          field: 'state',
          operator: 'equals',
          value: 'RJ',
          logicOperator: 'OR',
        },
      ];
      const result = builder.build(rules);
      // O Builder empilha o primeiro no AND e o segundo no OR se logicOperator for OR
      expect(result).toEqual({
        AND: [
          { city: { equals: 'SP', mode: 'insensitive' } },
          { OR: [{ state: { equals: 'RJ', mode: 'insensitive' } }] },
        ],
      });
    });

    it('should handle Total Spent numeric operators', () => {
      const rules = [
        {
          category: 'characteristic',
          field: 'totalSpent',
          operator: 'greater_than',
          value: '1000',
          logicOperator: 'AND',
        },
      ];
      const result = builder.build(rules);
      expect(result).toEqual({
        AND: [{ totalSpent: { gt: 1000 } }],
      });
    });

    it('should handle Behavioral rules (Transactions)', () => {
      const rules = [
        {
          category: 'behavioral',
          event: 'realizou um pedido',
          type: 'did',
          filters: [],
          logicOperator: 'AND',
        },
      ];
      const result = builder.build(rules);
      expect(result).toEqual({
        AND: [{ transactions: { some: {} } }],
      });
    });

    it('should fallback to empty for unknown category', () => {
      const rules = [{ category: 'unknown', logicOperator: 'AND' }];
      const result = builder.build(rules);
      expect(result).toEqual({ AND: [] });
    });
  });
});
