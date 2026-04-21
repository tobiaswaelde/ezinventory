import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray } from 'class-validator';

import { PageMetaDto } from '~/types/pagination/page-meta.dto.js';

@ApiExtraModels()
export class PaginatedDto<T> {
  @Expose()
  @ApiProperty({ isArray: true })
  @IsArray()
  readonly items: T[];

  @Expose()
  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(items: T[], meta: PageMetaDto) {
    this.items = items;
    this.meta = meta;
  }
}
