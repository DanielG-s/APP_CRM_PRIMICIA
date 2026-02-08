import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class SegmentationQueryBuilder {
  public build(rules: any[]): Prisma.CustomerWhereInput {
    if (!rules || rules.length === 0) return {};

    // Se for o formato antigo (array de regras diretas)
    if (
      rules.length > 0 &&
      rules[0].field &&
      rules[0].operator &&
      !rules[0].category
    ) {
      return this.buildFromLegacyRules(rules);
    }

    const andConditions: Prisma.CustomerWhereInput[] = [];
    const orConditions: Prisma.CustomerWhereInput[] = [];

    rules.forEach((block, index) => {
      let condition: Prisma.CustomerWhereInput | undefined;

      if (block.category === 'characteristic') {
        condition = this.mapCharacteristicToPrisma(block);
      } else if (block.category === 'rfm') {
        condition = {
          rfmStatus: { contains: block.status, mode: 'insensitive' },
        };
      } else if (block.category === 'behavioral') {
        condition = this.mapBehaviorToPrisma(block);
      }

      if (condition && Object.keys(condition).length > 0) {
        if (index === 0) {
          andConditions.push(condition);
        } else {
          if (block.logicOperator === 'OR') orConditions.push(condition);
          else andConditions.push(condition);
        }
      }
    });

    if (orConditions.length > 0) {
      return { AND: [...andConditions, { OR: orConditions }] };
    }
    return { AND: andConditions };
  }

  private buildFromLegacyRules(rules: any[]): Prisma.CustomerWhereInput {
    const conditions: Prisma.CustomerWhereInput[] = [];

    for (const rule of rules) {
      if (rule.field === 'total_spent') {
        const val = parseFloat(rule.value);
        if (!isNaN(val)) {
          if (rule.operator === 'gt')
            conditions.push({ totalSpent: { gt: val } });
          else if (rule.operator === 'lt')
            conditions.push({ totalSpent: { lt: val } });
          else if (rule.operator === 'gte')
            conditions.push({ totalSpent: { gte: val } });
          else if (rule.operator === 'lte')
            conditions.push({ totalSpent: { lte: val } });
        }
      }

      if (rule.field === 'city' && rule.value) {
        conditions.push({
          city: { contains: rule.value, mode: 'insensitive' },
        });
      }

      if (rule.field === 'state' && rule.value) {
        conditions.push({
          state: { equals: rule.value, mode: 'insensitive' },
        });
      }
    }

    if (conditions.length === 0) return {};
    return { AND: conditions };
  }

  private mapCharacteristicToPrisma(block: any): Prisma.CustomerWhereInput {
    const { field, operator, value } = block;
    const mode = 'insensitive';

    if (field === 'totalSpent' || field === 'ordersCount') {
      const numVal = Number(value);
      if (operator === 'greater_than' || operator === 'gt')
        return { [field]: { gt: numVal } };
      if (operator === 'less_than' || operator === 'lt')
        return { [field]: { lt: numVal } };
      if (operator === 'equals' || operator === 'eq')
        return { [field]: { equals: numVal } };
      if (operator === 'greater_than_equals' || operator === 'gte')
        return { [field]: { gte: numVal } };
      if (operator === 'less_than_equals' || operator === 'lte')
        return { [field]: { lte: numVal } };
    }

    switch (operator) {
      case 'equals':
        return { [field]: { equals: value, mode } };
      case 'not_equals':
        return { [field]: { not: { equals: value, mode } } };
      case 'contains':
        return { [field]: { contains: value, mode } };
      case 'is_set':
        return { [field]: { not: null } };
      case 'is':
        return { [field]: value === 'true' };
      case 'greater_than':
        return { [field]: { gt: value } };
      case 'less_than':
        return { [field]: { lt: value } };
      default:
        return {};
    }
  }

  private mapBehaviorToPrisma(block: any): Prisma.CustomerWhereInput {
    if (block.event.includes('pedido') || block.event.includes('comprou')) {
      if (!block.filters || block.filters.length === 0) {
        const basicCondition: Prisma.CustomerWhereInput = {
          transactions: { some: {} },
        };
        return block.type === 'did_not'
          ? { NOT: basicCondition }
          : basicCondition;
      }

      const andFilters: Prisma.TransactionWhereInput[] = [];

      for (const f of block.filters) {
        const rawVal = f.value;
        const numVal = Number(String(rawVal).replace(/[^0-9.-]+/g, '')) || 0;

        if (['total', 'subtotal', 'valor', 'price'].includes(f.field)) {
          if (f.operator === 'greater_than')
            andFilters.push({ totalValue: { gt: numVal } });
          else if (f.operator === 'less_than')
            andFilters.push({ totalValue: { lt: numVal } });
          else if (f.operator === 'equals')
            andFilters.push({ totalValue: { equals: numVal } });
        } else if (['date', 'data', 'created_at'].includes(f.field)) {
          const dateVal = this.parseRelativeDate(String(rawVal));
          if (dateVal) {
            if (f.operator === 'greater_than')
              andFilters.push({ date: { gte: dateVal } });
            else if (f.operator === 'less_than')
              andFilters.push({ date: { lte: dateVal } });
            else if (f.operator === 'equals') {
              const nextDay = new Date(dateVal);
              nextDay.setDate(nextDay.getDate() + 1);
              andFilters.push({ date: { gte: dateVal, lt: nextDay } });
            }
          }
        } else if (['produto_id', 'nome_produto', 'name'].includes(f.field)) {
          andFilters.push({
            items: {
              array_contains: [{ name: rawVal }],
            },
          } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        } else if (
          ['categoria', 'category', 'nome_categoria'].includes(f.field)
        ) {
          andFilters.push({
            items: {
              array_contains: [{ category: rawVal }],
            },
          } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      }

      if (andFilters.length > 0) {
        const relationCondition: Prisma.CustomerWhereInput = {
          transactions: { some: { AND: andFilters } },
        };
        return block.type === 'did_not'
          ? { NOT: relationCondition }
          : relationCondition;
      }

      return { transactions: { some: {} } };
    }

    return {};
  }

  private parseRelativeDate(value: string): Date | null {
    const now = new Date();
    if (value === 'Hoje') return new Date(now.setHours(0, 0, 0, 0));
    if (value === 'Ontem') {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    if (value.includes('Últimos')) {
      const days = parseInt(value.replace(/\D/g, '')) || 30;
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
}
