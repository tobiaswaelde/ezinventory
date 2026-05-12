export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    perPage: number;
    itemCount: number;
    pageCount: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
};
