import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ItemsController } from '../../src/modules/items/items.controller.js';

describe('ItemsController', () => {
  it('creates item via service', async () => {
    const dto = { categoryId: 'cat', sku: 'SKU-1', name: 'Item', unit: 'pcs' };
    const created = { id: 'i-1', ...dto, qrCodeValue: 'qr', sizeLabel: null, sizeValue: null, sizeUnit: null, servings: null };
    const service = {
      createItem: vi.fn().mockResolvedValue(created),
      listItems: vi.fn(),
      lookupByCode: vi.fn()
    };

    const controller = new ItemsController(service as never);
    await expect(controller.createItem(dto as never)).resolves.toEqual(created);
    expect(service.createItem).toHaveBeenCalledWith(dto);
  });

  it('lists items via service', async () => {
    const rows = [{ id: 'i-1' }];
    const service = {
      createItem: vi.fn(),
      listItems: vi.fn().mockResolvedValue(rows),
      lookupByCode: vi.fn()
    };

    const controller = new ItemsController(service as never);
    await expect(controller.listItems()).resolves.toEqual(rows as never);
    expect(service.listItems).toHaveBeenCalledTimes(1);
  });

  it('looks up item by trimmed code', async () => {
    const found = { id: 'i-1', sku: 'SKU-1' };
    const service = {
      createItem: vi.fn(),
      listItems: vi.fn(),
      lookupByCode: vi.fn().mockResolvedValue(found)
    };

    const controller = new ItemsController(service as never);
    await expect(controller.lookupItem({ code: '  abc  ' } as never)).resolves.toEqual(found as never);
    expect(service.lookupByCode).toHaveBeenCalledWith('abc');
  });

  it('throws not found when lookup misses', async () => {
    const service = {
      createItem: vi.fn(),
      listItems: vi.fn(),
      lookupByCode: vi.fn().mockResolvedValue(null)
    };

    const controller = new ItemsController(service as never);

    await expect(controller.lookupItem({ code: 'missing' } as never)).rejects.toBeInstanceOf(NotFoundException);
    await expect(controller.lookupItem({ code: 'missing' } as never)).rejects.toThrow('No item found for scanned code.');
  });
});
