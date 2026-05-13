import type { ColumnDefinition } from '~/types/table';
import type { FilterField } from '~/types/table/filtering';
import type { SortingField } from '~/types/table/sorting';

export type TableOptions<T> = {
  columnDefinitions: Ref<ColumnDefinition<T>[]>;
  sortableFields: Ref<SortingField[]>;
  filterFields: Ref<FilterField[]>;
  search: Ref<string>;
  staticFilter: Ref<any> | undefined;
};
