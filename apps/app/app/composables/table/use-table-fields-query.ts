import type { TableColumnDefinition } from '~/composables/table/use-table-columns-options';
import { TableUtil } from '~/utils/table';

export function useTableFieldsQuery(options: {
  columns: Ref<TableColumnDefinition[]>;
  staticFields?: Ref<string[]> | string[];
}) {
  return computed(() => {
    const paths = new Set<string>();
    const staticFields = Array.isArray(options.staticFields)
      ? options.staticFields
      : (options.staticFields?.value ?? []);

    for (const field of staticFields) {
      paths.add(field);
    }

    for (const column of options.columns.value) {
      if (column.fields && column.fields.length > 0) {
        for (const field of column.fields) {
          paths.add(field);
        }
      } else {
        paths.add(column.id);
      }
    }

    return TableUtil.pathsToFieldsQuery([...paths]);
  });
}
