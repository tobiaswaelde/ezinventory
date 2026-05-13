import type { SortingState } from '@tanstack/table-core';
import { useLocalStorage } from '@vueuse/core';
import { useRouteQuery } from '@vueuse/router';
import { FilteringMode, type Filtering } from '~/types/table/filtering';
import { FilteringUtil } from '~/util/filtering';
import { QueryUtil } from '~/util/query';

const DEFAULT_ITEMS_PER_PAGE = 25;

export type TableQueryOptions = {
  defaultItemsPerPage?: number;
  staticFilter?: Ref<any>;
};

/**
 * Provides reactive query options for a table, including pagination, sorting, and filtering.
 * The options are persisted in local storage and synced with the route query parameters.
 * @param {string} tableName The name of the table (should be unique across the app) used for local storage keys.
 * @param {TableQueryOptions} options Configuration options for the table query.
 * @returns An object containing reactive query options for the table.
 */
export const useTableQueryOptions = (tableName: string, options: TableQueryOptions) => {
  const page = ref<number>(1);
  const queryPage = useRouteQuery('page', 1, { transform: Number });
  const itemsPerPage = useLocalStorage<number>(
    `table:${tableName}:items-per-page`,
    options.defaultItemsPerPage ?? DEFAULT_ITEMS_PER_PAGE,
  );

  const sorting = useLocalStorage<SortingState>(`table:${tableName}:sort`, []);
  const filtering = useLocalStorage<Filtering>(`table:${tableName}:filtering`, {
    operator: FilteringMode.Intersect,
    filters: [],
  });

  // update route query when page changes
  watch(page, () => {
    queryPage.value = page.value;
  });

  const filter = computed(() => FilteringUtil.getFilterObject(filtering.value, options.staticFilter?.value));

  const queryParams = computed(() => ({
    page: page.value,
    perPage: itemsPerPage.value,
    where: QueryUtil.getFilterString(filter.value),
    sort: QueryUtil.getSortString(sorting.value),
  }));

  return { page, queryPage, itemsPerPage, sorting, filtering, queryParams };
};
