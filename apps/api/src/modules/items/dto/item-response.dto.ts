import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import type { ItemResponse } from '~/modules/items/items.service.js';

export class ItemResponseDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @Expose()
  @ApiProperty({ format: 'uuid' })
  categoryId!: string;

  @Expose()
  @ApiProperty()
  sku!: string;

  @Expose()
  @ApiProperty()
  qrCodeValue!: string;

  @Expose()
  @ApiProperty()
  name!: string;

  @Expose()
  @ApiProperty()
  unit!: string;

  @Expose()
  @ApiProperty({ nullable: true })
  sizeLabel!: string | null;

  @Expose()
  @ApiProperty({ nullable: true })
  sizeValue!: number | null;

  @Expose()
  @ApiProperty({ nullable: true })
  sizeUnit!: string | null;

  @Expose()
  @ApiProperty({ nullable: true })
  servings!: number | null;

  constructor(partial: Partial<ItemResponseDto>) {
    Object.assign(this, partial);
  }

  static fromModel(model: ItemResponse): ItemResponseDto {
    return new ItemResponseDto(model);
  }

  static fromModels(models: ItemResponse[]): ItemResponseDto[] {
    return models.map((model) => ItemResponseDto.fromModel(model));
  }
}
