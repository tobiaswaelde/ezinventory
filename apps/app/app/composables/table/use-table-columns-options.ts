import { useLocalStorage } from '@vueuse/core';
import { TableUtil } from '~/utils/table';

export type TableColumnDefinition = {
  id: string;
  label: string;
  fields?: string[];
};

export function useTableColumnsOptions(tableName: string, columnDefinition: Ref<TableColumnDefinition[]>) {
  const columnOrder = useLocalStorage<string[]>(`table:${tableName}:column-order`, []);
  const columnVisibility = useLocalStorage<string[]>(`table:${tableName}:invisible-columns`, []);
  const hiddenColumns = useLocalStorage<string[]>(`table:${tableName}:hidden-columns`, []);
  const columnPinning = useLocalStorage<Record<string, string[]>>(`table:${tableName}:column-pinning`, {});

  if (columnVisibility.value.length === 0 && hiddenColumns.value.length > 0) {
    columnVisibility.value = [...hiddenColumns.value];
  }

  watch(
    columnDefinition,
    (columns) => {
      TableUtil.syncColumnOrder(columnOrder, columns);
      const ids = columns.map((column) => column.id);
      columnVisibility.value = columnVisibility.value.filter((id) => ids.includes(id));
      hiddenColumns.value = [...columnVisibility.value];
    },
    { immediate: true }
  );

  const columns = computed(() =>
    columnOrder.value
      .map((id) => columnDefinition.value.find((column) => column.id === id))
      .filter((column): column is TableColumnDefinition => Boolean(column))
      .filter((column) => !columnVisibility.value.includes(column.id))
  );

  const isVisible = (columnId: string): boolean => !columnVisibility.value.includes(columnId);

  const setVisible = (columnId: string, visible: boolean): void => {
    if (visible) {
      columnVisibility.value = columnVisibility.value.filter((id) => id !== columnId);
      hiddenColumns.value = [...columnVisibility.value];
      return;
    }

    if (!columnVisibility.value.includes(columnId)) {
      columnVisibility.value = [...columnVisibility.value, columnId];
      hiddenColumns.value = [...columnVisibility.value];
    }
  };

  return {
    columnOrder,
    columnVisibility,
    columnPinning,
    hiddenColumns,
    columns,
    isVisible,
    setVisible
  };
}
