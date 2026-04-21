import type { TableColumnDefinition } from '~/composables/table/use-table-columns-options';

export class TableUtil {
  static pathsToFieldsQuery(paths: string[]): string | undefined {
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

  static syncColumnOrder(order: Ref<string[]>, columns: TableColumnDefinition[]): void {
    const ids = columns
      .map((column) => String(column.id).trim())
      .filter(Boolean);

    const missing = ids.filter((id) => !order.value.includes(id));
    if (missing.length > 0) {
      order.value = [...order.value, ...missing];
    }

    order.value = order.value.filter((id) => ids.includes(id));
  }
}
