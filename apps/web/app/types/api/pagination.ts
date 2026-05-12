export type PageMetaDto = {
  page: number;
  perPage: number;
  itemCount: number;
  pageCount: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type PaginatedDto<T> = {
  items: T[];
  meta: PageMetaDto;
};
