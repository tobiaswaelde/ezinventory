import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PageOptionsDTO } from '~/types/pagination/page-options.dto';

export interface PageMetaDTOParams {
  pageOptions: PageOptionsDTO;
  itemCount: number;
}
export class PageMetaDTO {
  @Expose()
  @ApiProperty({ description: 'Current page number' })
  readonly page: number;

  @Expose()
  @ApiProperty({ description: 'Number of items per page' })
  readonly perPage: number;

  @Expose()
  @ApiProperty({ description: 'Total number of items' })
  readonly itemCount: number;

  @Expose()
  @ApiProperty({ description: 'Total number of pages' })
  readonly pageCount: number;

  @Expose()
  @ApiProperty({ description: 'Indicates if there is a previous page' })
  readonly hasPrevPage: boolean;

  @Expose()
  @ApiProperty({ description: 'Indicates if there is a next page' })
  readonly hasNextPage: boolean;

  constructor({ pageOptions, itemCount }: PageMetaDTOParams) {
    this.page = pageOptions.page;
    this.perPage = pageOptions.perPage;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.perPage);
    this.hasPrevPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
