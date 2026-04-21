import { describe, expect, it, vi } from 'vitest';

import { CategoriesController } from '../../src/modules/categories/categories.controller.js';

describe('CategoriesController', () => {
  it('creates category via service', async () => {
    const dto = { name: 'Food', description: 'Desc' };
    const created = { id: 'id-1', name: 'Food', description: 'Desc' };
    const service = {
      createCategory: vi.fn().mockResolvedValue(created),
      listCategories: vi.fn()
    };

    const controller = new CategoriesController(service as never);
    await expect(controller.createCategory(dto as never)).resolves.toEqual(created);
    expect(service.createCategory).toHaveBeenCalledWith(dto);
  });

  it('lists categories via service', async () => {
    const rows = [{ id: 'id-1', name: 'Food', description: null }];
    const service = {
      createCategory: vi.fn(),
      listCategories: vi.fn().mockResolvedValue(rows)
    };

    const controller = new CategoriesController(service as never);
    await expect(controller.listCategories()).resolves.toEqual(rows);
    expect(service.listCategories).toHaveBeenCalledTimes(1);
  });
});
