import { Decimal } from '@prisma/client/runtime/client';

export const serializeDecimalValues = (obj: any): any => {
  if (obj == null || typeof obj !== 'object') return obj;

  if (obj instanceof Decimal) {
    return obj.toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDecimalValues);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, serializeDecimalValues(value)]),
  );
};
