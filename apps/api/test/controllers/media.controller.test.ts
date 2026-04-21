import { describe, expect, it, vi } from 'vitest';

import { MediaController } from '../../src/modules/media/media.controller.js';

describe('MediaController', () => {
  const user = { id: '550e8400-e29b-41d4-a716-446655440010' };
  const uploaded = {
    id: '550e8400-e29b-41d4-a716-446655440020',
    ownerType: 'ITEM',
    ownerId: '550e8400-e29b-41d4-a716-446655440001',
    fileName: 'image.png',
    mimeType: 'image/png',
    sizeBytes: 1234,
    storageKey: 'items/550e8400-e29b-41d4-a716-446655440001/image.png',
    url: 'http://localhost:9000/signed-url',
    createdAt: new Date().toISOString()
  };

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

  it('lists media library via service', async () => {
    const list = [{ id: uploaded.id, fileName: uploaded.fileName, ownerType: uploaded.ownerType }];
    const service = {
      getStorageHealth: vi.fn(),
      listUserLibrary: vi.fn().mockResolvedValue(list)
    };

    const controller = new MediaController(service as never);
    const query = { fields: 'id,fileName,ownerType', search: 'image', sortBy: 'createdAt', sortDir: 'desc', limit: 25 };

    await expect(controller.listLibrary(query as never, user as never)).resolves.toEqual(list);
    expect(service.listUserLibrary).toHaveBeenCalledWith(query, user.id);
  });

  it('uploads item image via service', async () => {
    const service = {
      getStorageHealth: vi.fn(),
      uploadOwnerImage: vi.fn().mockResolvedValue(uploaded)
    };

    const controller = new MediaController(service as never);
    const file = {
      originalname: 'image.png',
      mimetype: 'image/png',
      size: 1234,
      buffer: Buffer.from('fake')
    };

    await expect(
      controller.uploadItemImage('550e8400-e29b-41d4-a716-446655440001', file as never, user as never)
    ).resolves.toEqual(uploaded);

    expect(service.uploadOwnerImage).toHaveBeenCalledWith(
      'ITEM',
      '550e8400-e29b-41d4-a716-446655440001',
      file,
      user.id
    );
  });

  it('uploads container image via service', async () => {
    const service = {
      getStorageHealth: vi.fn(),
      uploadOwnerImage: vi.fn().mockResolvedValue({ ...uploaded, ownerType: 'CONTAINER' })
    };

    const controller = new MediaController(service as never);
    const file = {
      originalname: 'container.png',
      mimetype: 'image/png',
      size: 4321,
      buffer: Buffer.from('fake')
    };

    await expect(
      controller.uploadContainerImage('550e8400-e29b-41d4-a716-446655440002', file as never, user as never)
    ).resolves.toEqual({ ...uploaded, ownerType: 'CONTAINER' });

    expect(service.uploadOwnerImage).toHaveBeenCalledWith(
      'CONTAINER',
      '550e8400-e29b-41d4-a716-446655440002',
      file,
      user.id
    );
  });

  it('replaces image via service', async () => {
    const replaced = {
      ...uploaded,
      fileName: 'replaced.png'
    };

    const service = {
      replaceImage: vi.fn().mockResolvedValue(replaced)
    };

    const controller = new MediaController(service as never);
    const file = {
      originalname: 'replaced.png',
      mimetype: 'image/png',
      size: 2345,
      buffer: Buffer.from('fake')
    };

    await expect(
      controller.replaceImage('550e8400-e29b-41d4-a716-446655440020', file as never, user as never)
    ).resolves.toEqual(replaced);

    expect(service.replaceImage).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440020', file, user.id);
  });

  it('deletes image via service', async () => {
    const result = { id: uploaded.id, deleted: true as const };
    const service = {
      deleteImage: vi.fn().mockResolvedValue(result)
    };

    const controller = new MediaController(service as never);
    await expect(controller.deleteImage(uploaded.id, user as never)).resolves.toEqual(result);
    expect(service.deleteImage).toHaveBeenCalledWith(uploaded.id, user.id);
  });
});
