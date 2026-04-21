import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export interface PageMetaDtoParams {
  page: number;
  perPage: number;
  itemCount: number;
}

export class PageMetaDto {
  @Expose()
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @Expose()
  @ApiProperty({ description: 'Number of items per page' })
  perPage: number;

  @Expose()
  @ApiProperty({ description: 'Total number of items' })
  itemCount: number;

  @Expose()
  @ApiProperty({ description: 'Total number of pages' })
  pageCount: number;

  @Expose()
  @ApiProperty({ description: 'Indicates if there is a previous page' })
  hasPrevPage: boolean;

  @Expose()
  @ApiProperty({ description: 'Indicates if there is a next page' })
  hasNextPage: boolean;

  constructor({ page, perPage, itemCount }: PageMetaDtoParams) {
    this.page = page;
    this.perPage = perPage;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.perPage);
    this.hasPrevPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
