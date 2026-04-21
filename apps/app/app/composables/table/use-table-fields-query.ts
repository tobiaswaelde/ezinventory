import type { TableColumnDefinition } from '~/composables/table/use-table-columns-options';

function pathsToFieldsQuery(paths: string[]): string | undefined {
  if (paths.length === 0) {
    return undefined;
  }

  interface NodeMap {
    [key: string]: NodeMap | true;
  }

  const tree: NodeMap = {};

  for (const path of paths) {
    const parts = path.split('.').filter(Boolean);
    if (parts.length === 0) {
      continue;
    }

    let cursor = tree;
    for (let index = 0; index < parts.length; index += 1) {
      const key = parts[index];
      const isLeaf = index === parts.length - 1;
      const current = cursor[key];

      if (isLeaf) {
        if (current === undefined) {
          cursor[key] = true;
        }
      } else {
        if (current === true || current === undefined) {
          cursor[key] = {};
        }
        cursor = cursor[key] as NodeMap;
      }
    }
  }

  const stringify = (node: NodeMap): string =>
    Object.entries(node)
      .map(([key, value]) => (value === true ? key : `${key}{${stringify(value)}}`))
      .join(',');

  const query = stringify(tree);
  return query || undefined;
}

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

    return pathsToFieldsQuery([...paths]);
  });
}
