import { describe, expect, it, vi } from 'vitest';

import { MediaController } from '../../src/modules/media/media.controller.js';

describe('MediaController', () => {
  it('returns storage health from service', async () => {
    const health = {
      configured: true,
      endpoint: 'http://localhost:9000',
      bucket: 'ezinventory-media',
      reachable: true,
      statusCode: 200
    };

    const service = {
      getStorageHealth: vi.fn().mockResolvedValue(health)
    };

    const controller = new MediaController(service as never);
    await expect(controller.storageHealth()).resolves.toEqual(health);
    expect(service.getStorageHealth).toHaveBeenCalledTimes(1);
  });
});
