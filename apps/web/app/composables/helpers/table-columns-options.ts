import type { ColumnPinningState } from '@tanstack/table-core';
import { useLocalStorage } from '@vueuse/core';
import type { ColumnDefinition } from '~/types/table';
import { TableUtil } from '~/util/table';

/**
 * Provides reactive column options for a table, including column order and visibility.
 * The options are persisted in local storage.
 * @param {string} tableName The name of the table (should be unique across the app) used for local storage keys.
 * @param {Ref<ColumnDefinition<TRow>[]>} columnDefinition The reactive reference to the column definitions.
 * @returns An object containing reactive column options for the table.
 */
export const useTableColumnsOptions = <TRow>(tableName: string, columnDefinition: Ref<ColumnDefinition<TRow>[]>) => {
  const columnOrder = useLocalStorage<string[]>(`table:${tableName}:column-order`, []);
  const columnVisibility = useLocalStorage<string[]>(`table:${tableName}:invisible-columns`, []);
  const columnPinning = useLocalStorage<ColumnPinningState>(`table:${tableName}:column-pinning`, {});

  // sync missing columns
  watch(
    () => columnDefinition.value,
    (cols) => cols && TableUtil.syncColumnOrder(columnOrder, cols),
    { immediate: true },
  );

  const columns = computed<ColumnDefinition<TRow>[]>(() => {
    return columnOrder.value
      .map((id) => columnDefinition.value.find((c) => c.id === id)!)
      .filter(Boolean)
      .filter((c) => !columnVisibility.value.includes(c.id));
  });

  return {
    columnOrder,
    columnVisibility,
    columnPinning,
    columns,
  };
};
