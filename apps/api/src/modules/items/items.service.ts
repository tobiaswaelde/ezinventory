import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { CreateItemDto } from '~/modules/items/dto/create-item.dto.js';
import { PrismaService } from '~/prisma/prisma.service.js';

const itemSelect = {
  id: true,
  categoryId: true,
  sku: true,
  qrCodeValue: true,
  name: true,
  unit: true,
  sizeLabel: true,
  sizeValue: true,
  sizeUnit: true,
  servings: true
} satisfies Prisma.ItemSelect;

type ItemRow = Prisma.ItemGetPayload<{ select: typeof itemSelect }>;
export type ItemResponse = Omit<ItemRow, 'sizeValue'> & { sizeValue: number | null };

@Injectable()
export class ItemsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private toItemResponse(row: ItemRow): ItemResponse {
    return {
      ...row,
      sizeValue: row.sizeValue ? row.sizeValue.toNumber() : null
    };
  }

  async createItem(dto: CreateItemDto): Promise<ItemResponse> {
    const item = await this.prisma.item.create({
      data: {
        categoryId: dto.categoryId,
        sku: dto.sku,
        qrCodeValue: `item:${dto.sku.toLowerCase()}:${crypto.randomUUID()}`,
        name: dto.name,
        unit: dto.unit ?? 'pcs',
        sizeLabel: dto.sizeLabel ?? null,
        sizeValue: dto.sizeValue ?? null,
        sizeUnit: dto.sizeUnit ?? null,
        servings: dto.servings ?? null
      },
      select: itemSelect
    });

    return this.toItemResponse(item);
  }

  async listItems(): Promise<ItemResponse[]> {
    const items = await this.prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      select: itemSelect
    });

    return items.map((item) => this.toItemResponse(item));
  }

  async lookupByCode(code: string): Promise<ItemResponse | null> {
    const item = await this.prisma.item.findFirst({
      where: {
        OR: [{ id: code }, { qrCodeValue: code }, { sku: { equals: code, mode: 'insensitive' } }]
      },
      select: itemSelect
    });

    return item ? this.toItemResponse(item) : null;
  }
}
