import { describe, expect, it, vi } from 'vitest';

import { ContainersController } from '../../src/modules/containers/containers.controller.js';

describe('ContainersController', () => {
  it('creates container via service', async () => {
    const dto = { locationId: 'loc-1', type: 'BOX', name: 'Bin', code: 'BIN', isActive: true };
    const created = { id: 'c-1', ...dto, parentContainerId: null, qrCodeValue: 'qr', description: null, iconSet: null, iconName: null };
    const service = {
      createContainer: vi.fn().mockResolvedValue(created),
      listContainers: vi.fn()
    };

    const controller = new ContainersController(service as never);
    await expect(controller.createContainer(dto as never)).resolves.toEqual(created);
    expect(service.createContainer).toHaveBeenCalledWith(dto);
  });

  it('lists containers and forwards optional locationId', async () => {
    const rows = [{ id: 'c-1' }];
    const service = {
      createContainer: vi.fn(),
      listContainers: vi.fn().mockResolvedValue(rows)
    };

    const controller = new ContainersController(service as never);
    await expect(controller.listContainers({ locationId: 'loc-1' } as never)).resolves.toEqual(rows);
    expect(service.listContainers).toHaveBeenCalledWith('loc-1');
  });
});
