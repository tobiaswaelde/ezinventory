import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { CreateContainerDto } from '~/modules/containers/dto/create-container.dto.js';
import { PrismaService } from '~/prisma/prisma.service.js';

const containerSelect = {
  id: true,
  locationId: true,
  parentContainerId: true,
  type: true,
  name: true,
  code: true,
  qrCodeValue: true,
  description: true,
  iconSet: true,
  iconName: true,
  isActive: true
} satisfies Prisma.ContainerSelect;

export type ContainerResponse = Prisma.ContainerGetPayload<{ select: typeof containerSelect }>;

@Injectable()
export class ContainersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createContainer(dto: CreateContainerDto): Promise<ContainerResponse> {
    const location = await this.prisma.location.findUnique({
      where: { id: dto.locationId },
      select: { id: true }
    });

    if (!location) {
      throw new NotFoundException('Location not found.');
    }

    if (dto.parentContainerId) {
      const parent = await this.prisma.container.findUnique({
        where: { id: dto.parentContainerId },
        select: { id: true, locationId: true }
      });

      if (!parent) {
        throw new NotFoundException('Parent container not found.');
      }

      if (parent.locationId !== dto.locationId) {
        throw new BadRequestException('Parent container must belong to the same location.');
      }
    }

    return await this.prisma.container.create({
      data: {
        locationId: dto.locationId,
        parentContainerId: dto.parentContainerId ?? null,
        type: dto.type,
        name: dto.name,
        code: dto.code,
        qrCodeValue: `container:${dto.code.toLowerCase()}:${crypto.randomUUID()}`,
        description: dto.description ?? null,
        iconSet: dto.iconSet ?? null,
        iconName: dto.iconName ?? null
      },
      select: containerSelect
    });
  }

  async listContainers(locationId?: string): Promise<ContainerResponse[]> {
    return await this.prisma.container.findMany({
      where: {
        ...(locationId ? { locationId } : {})
      },
      orderBy: [{ name: 'asc' }],
      select: containerSelect
    });
  }
}
