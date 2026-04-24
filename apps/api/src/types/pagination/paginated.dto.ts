import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray } from 'class-validator';
import { PageMetaDTO } from '~/types/pagination/page-meta.dto';

@ApiExtraModels()
export class PaginatedDTO<T> {
  @Expose()
  @ApiProperty({ isArray: true })
  @IsArray()
  readonly items: T[];

  @Expose()
  @ApiProperty({ type: () => PageMetaDTO })
  readonly meta: PageMetaDTO;

  constructor(items: T[], meta: PageMetaDTO) {
    this.items = items;
    this.meta = meta;
  }
}
