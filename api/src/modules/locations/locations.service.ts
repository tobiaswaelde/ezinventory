import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateLocationDto } from '~/modules/locations/dto/create-location.dto.js';
import { PrismaService } from '~/prisma/prisma.service.js';

const locationSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  iconSet: true,
  iconName: true,
  isActive: true
} satisfies Prisma.LocationSelect;

export type LocationResponse = Prisma.LocationGetPayload<{ select: typeof locationSelect }>;

@Injectable()
export class LocationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createLocation(dto: CreateLocationDto): Promise<LocationResponse> {
    return await this.prisma.location.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description ?? null,
        iconSet: dto.iconSet ?? null,
        iconName: dto.iconName ?? null
      },
      select: locationSelect
    });
  }

  async listLocations(): Promise<LocationResponse[]> {
    return await this.prisma.location.findMany({
      orderBy: [{ name: 'asc' }],
      select: locationSelect
    });
  }
}
