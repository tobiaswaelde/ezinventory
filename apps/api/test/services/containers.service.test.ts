import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContainersService } from '../../src/modules/containers/containers.service.js';

describe('ContainersService', () => {
  const prisma = {
    location: {
      findUnique: vi.fn()
    },
    container: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    prisma.location.findUnique.mockReset();
    prisma.container.findUnique.mockReset();
    prisma.container.create.mockReset();
    prisma.container.findMany.mockReset();
  });

  it('throws when location is missing', async () => {
    prisma.location.findUnique.mockResolvedValue(null);
    const service = new ContainersService(prisma as never);

    await expect(
      service.createContainer({
        locationId: 'loc-1',
        type: 'BOX',
        name: 'Drawer',
        code: 'DRAWER-1'
      } as never)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when parent container is in another location', async () => {
    prisma.location.findUnique.mockResolvedValue({ id: 'loc-1' });
    prisma.container.findUnique.mockResolvedValue({ id: 'parent-1', locationId: 'loc-2' });
    const service = new ContainersService(prisma as never);

    await expect(
      service.createContainer({
        locationId: 'loc-1',
        parentContainerId: 'parent-1',
        type: 'BOX',
        name: 'Drawer',
        code: 'DRAWER-1'
      } as never)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates container with generated qr code and lists by optional location filter', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('550e8400-e29b-41d4-a716-446655440abc');
    prisma.location.findUnique.mockResolvedValue({ id: 'loc-1' });
    prisma.container.create.mockResolvedValue({
      id: 'cont-1',
      locationId: 'loc-1',
      parentContainerId: null,
      type: 'BOX',
      name: 'Drawer',
      code: 'DRAWER-1',
      qrCodeValue: 'container:drawer-1:550e8400-e29b-41d4-a716-446655440abc',
      description: null,
      iconSet: null,
      iconName: null,
      isActive: true
    });
    prisma.container.findMany.mockResolvedValue([]);

    const service = new ContainersService(prisma as never);
    const created = await service.createContainer({
      locationId: 'loc-1',
      type: 'BOX',
      name: 'Drawer',
      code: 'DRAWER-1'
    } as never);

    expect(created.qrCodeValue).toBe('container:drawer-1:550e8400-e29b-41d4-a716-446655440abc');
    expect(prisma.container.create.mock.calls[0]?.[0]?.data?.qrCodeValue).toBe(
      'container:drawer-1:550e8400-e29b-41d4-a716-446655440abc'
    );

    await service.listContainers();
    await service.listContainers('loc-1');

    expect(prisma.container.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: {} }));
    expect(prisma.container.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { locationId: 'loc-1' } })
    );
  });
});
