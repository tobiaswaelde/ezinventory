import { Inject, Injectable } from '@nestjs/common';

import { CreateCategoryDto } from '~/modules/categories/dto/create-category.dto.js';
import { PrismaService } from '~/prisma/prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto): Promise<{ id: string; name: string; description: string | null }> {
    return await this.prisma.category.create({
      data: {
        name: dto.name,
        description: dto.description ?? null
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    });
  }

  async listCategories(): Promise<Array<{ id: string; name: string; description: string | null }>> {
    return await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true
      }
    });
  }
}
