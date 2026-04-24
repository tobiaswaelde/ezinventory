import { PageMetaDTO } from '~/types/pagination/page-meta.dto';

export type Paginated<T> = {
  items: T[];
  itemCount: number;
  pageMeta: PageMetaDTO;
};
