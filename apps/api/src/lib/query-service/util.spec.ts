import { Decimal } from '@prisma/client/runtime/client';
import { serializeDecimalValues } from '~/lib/query-service/util';

// Mock Decimal from prisma so instanceof checks work
jest.mock('@prisma/client/runtime/client', () => {
  class Decimal {
    private val: number;
    constructor(val: number) {
      this.val = val;
    }
    toNumber() {
      return this.val;
    }
  }
  return { Decimal };
});

describe('serializeDecimalValues', () => {
  it('returns null as-is', () => {
    expect(serializeDecimalValues(null)).toBeNull();
  });

  it('returns undefined as-is', () => {
    expect(serializeDecimalValues(undefined)).toBeUndefined();
  });

  it('returns primitive string as-is', () => {
    expect(serializeDecimalValues('hello')).toBe('hello');
  });

  it('returns primitive number as-is', () => {
    expect(serializeDecimalValues(42)).toBe(42);
  });

  it('converts Decimal instance to number', () => {
    const decimal = new Decimal(3.14);
    const result = serializeDecimalValues(decimal);
    expect(result).toBe(3.14);
  });

  it('recursively processes arrays', () => {
    const arr = [new Decimal(1.5), 'text', 42];
    const result = serializeDecimalValues(arr);
    expect(result).toEqual([1.5, 'text', 42]);
  });

  it('recursively processes plain objects', () => {
    const obj = { price: new Decimal(9.99), name: 'item', count: 5 };
    const result = serializeDecimalValues(obj);
    expect(result).toEqual({ price: 9.99, name: 'item', count: 5 });
  });

  it('handles deeply nested Decimal values', () => {
    const nested = { a: { b: { amount: new Decimal(100) } } };
    const result = serializeDecimalValues(nested);
    expect(result.a.b.amount).toBe(100);
  });
});
