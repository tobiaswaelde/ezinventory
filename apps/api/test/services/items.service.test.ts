import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ItemsService } from '../../src/modules/items/items.service.js';

describe('ItemsService', () => {
  const prisma = {
    item: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn()
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    prisma.item.create.mockReset();
    prisma.item.findMany.mockReset();
    prisma.item.findFirst.mockReset();
  });

  it('creates an item with defaults and generated qr code', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('550e8400-e29b-41d4-a716-446655440abc');
    prisma.item.create.mockResolvedValue({
      id: 'item-1',
      categoryId: 'cat-1',
      sku: 'SKU-1',
      qrCodeValue: 'item:sku-1:550e8400-e29b-41d4-a716-446655440abc',
      name: 'Item One',
      unit: 'pcs',
      sizeLabel: null,
      sizeValue: null,
      sizeUnit: null,
      servings: null
    });

    const service = new ItemsService(prisma as never);
    const result = await service.createItem({
      categoryId: 'cat-1',
      sku: 'SKU-1',
      name: 'Item One'
    });

    expect(prisma.item.create).toHaveBeenCalledTimes(1);
    expect(prisma.item.create.mock.calls[0]?.[0]?.data).toMatchObject({
      categoryId: 'cat-1',
      sku: 'SKU-1',
      qrCodeValue: 'item:sku-1:550e8400-e29b-41d4-a716-446655440abc',
      name: 'Item One',
      unit: 'pcs'
    });
    expect(result.sizeValue).toBeNull();
  });

  it('maps decimal-like sizeValue to number for list and lookup', async () => {
    const decimal = { toNumber: () => 1.5 };
    prisma.item.findMany.mockResolvedValue([
      {
        id: 'item-1',
        categoryId: 'cat-1',
        sku: 'SKU-1',
        qrCodeValue: 'item:sku-1:id',
        name: 'Item One',
        unit: 'jar',
        sizeLabel: 'Bottle',
        sizeValue: decimal,
        sizeUnit: 'L',
        servings: 3
      }
    ]);
    prisma.item.findFirst.mockResolvedValue({
      id: 'item-1',
      categoryId: 'cat-1',
      sku: 'SKU-1',
      qrCodeValue: 'item:sku-1:id',
      name: 'Item One',
      unit: 'jar',
      sizeLabel: 'Bottle',
      sizeValue: decimal,
      sizeUnit: 'L',
      servings: 3
    });

    const service = new ItemsService(prisma as never);
    const list = await service.listItems();
    const lookup = await service.lookupByCode('SKU-1');

    expect(list[0]?.sizeValue).toBe(1.5);
    expect(lookup?.sizeValue).toBe(1.5);
    expect(prisma.item.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ id: 'SKU-1' }, { qrCodeValue: 'SKU-1' }, { sku: { equals: 'SKU-1', mode: 'insensitive' } }]
        }
      })
    );
  });

  it('returns null when lookup misses', async () => {
    prisma.item.findFirst.mockResolvedValue(null);
    const service = new ItemsService(prisma as never);
    await expect(service.lookupByCode('missing')).resolves.toBeNull();
  });
});
