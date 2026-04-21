export type TableColumnDefinition = {
  id: string;
  label: string;
  fields?: string[];
};

export function useTableColumnsOptions(tableName: string, columnDefinition: Ref<TableColumnDefinition[]>) {
  const columnOrder = useState<string[]>(`table:${tableName}:column-order`, () =>
    columnDefinition.value.map((column) => column.id)
  );
  const hiddenColumns = useState<string[]>(`table:${tableName}:hidden-columns`, () => []);

  watch(
    columnDefinition,
    (columns) => {
      const ids = columns.map((column) => column.id);

      const missing = ids.filter((id) => !columnOrder.value.includes(id));
      if (missing.length > 0) {
        columnOrder.value = [...columnOrder.value, ...missing];
      }

      columnOrder.value = columnOrder.value.filter((id) => ids.includes(id));
      hiddenColumns.value = hiddenColumns.value.filter((id) => ids.includes(id));
    },
    { immediate: true }
  );

  const columns = computed(() =>
    columnOrder.value
      .map((id) => columnDefinition.value.find((column) => column.id === id))
      .filter((column): column is TableColumnDefinition => Boolean(column))
      .filter((column) => !hiddenColumns.value.includes(column.id))
  );

  const isVisible = (columnId: string): boolean => !hiddenColumns.value.includes(columnId);

  const setVisible = (columnId: string, visible: boolean): void => {
    if (visible) {
      hiddenColumns.value = hiddenColumns.value.filter((id) => id !== columnId);
      return;
    }

    if (!hiddenColumns.value.includes(columnId)) {
      hiddenColumns.value = [...hiddenColumns.value, columnId];
    }
  };

  return {
    columnOrder,
    hiddenColumns,
    columns,
    isVisible,
    setVisible
  };
}
