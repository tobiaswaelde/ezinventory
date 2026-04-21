import { describe, expect, it, vi } from 'vitest';

import { LocationsController } from '../../src/modules/locations/locations.controller.js';

describe('LocationsController', () => {
  it('creates location via service', async () => {
    const dto = { name: 'Garage', code: 'GARAGE', description: null, iconSet: null, iconName: null, isActive: true };
    const created = { id: 'l-1', ...dto };
    const service = {
      createLocation: vi.fn().mockResolvedValue(created),
      listLocations: vi.fn()
    };

    const controller = new LocationsController(service as never);
    await expect(controller.createLocation(dto as never)).resolves.toEqual(created);
    expect(service.createLocation).toHaveBeenCalledWith(dto);
  });

  it('lists locations via service', async () => {
    const rows = [{ id: 'l-1' }];
    const service = {
      createLocation: vi.fn(),
      listLocations: vi.fn().mockResolvedValue(rows)
    };

    const controller = new LocationsController(service as never);
    await expect(controller.listLocations()).resolves.toEqual(rows as never);
    expect(service.listLocations).toHaveBeenCalledTimes(1);
  });
});
