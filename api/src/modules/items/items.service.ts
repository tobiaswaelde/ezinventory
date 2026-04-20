import { Inject, Injectable } from '@nestjs/common';

import { CreateItemDto } from '~/modules/items/dto/create-item.dto.js';
import { PrismaService } from '~/prisma/prisma.service.js';

@Injectable()
export class ItemsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createItem(dto: CreateItemDto): Promise<{ id: string; categoryId: string; sku: string; name: string; servings: number | null }> {
    return await this.prisma.item.create({
      data: {
        categoryId: dto.categoryId,
        sku: dto.sku,
        qrCodeValue: `item:${dto.sku.toLowerCase()}:${crypto.randomUUID()}`,
        name: dto.name,
        unit: 'pcs',
        servings: dto.servings ?? null
      },
      select: {
        id: true,
        categoryId: true,
        sku: true,
        name: true,
        servings: true
      }
    });
  }

  async listItems(): Promise<Array<{ id: string; categoryId: string; sku: string; name: string; servings: number | null }>> {
    return await this.prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        categoryId: true,
        sku: true,
        name: true,
        servings: true
      }
    });
  }
}
