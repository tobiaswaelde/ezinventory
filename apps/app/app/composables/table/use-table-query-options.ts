import { useLocalStorage } from '@vueuse/core';

export type SortDirection = 'asc' | 'desc';

export function useTableQueryOptions<TSortBy extends string, TRoleFilter extends string>(options: {
  tableName: string;
  defaultSortBy: TSortBy;
  defaultSortDir?: SortDirection;
  defaultRoleFilter: TRoleFilter;
}) {
  const search = useLocalStorage<string>(`table:${options.tableName}:search`, '');
  const roleFilter = useLocalStorage<TRoleFilter>(`table:${options.tableName}:role-filter`, options.defaultRoleFilter);
  const sortBy = useLocalStorage<TSortBy>(`table:${options.tableName}:sort-by`, options.defaultSortBy);
  const sortDir = useLocalStorage<SortDirection>(`table:${options.tableName}:sort-dir`, options.defaultSortDir ?? 'asc');

  return {
    search,
    roleFilter,
    sortBy,
    sortDir
  };
}
