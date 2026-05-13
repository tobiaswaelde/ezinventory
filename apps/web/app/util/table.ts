import type { ColumnDefinition } from '~/types/table';

/**
 * Utility functions for tables, such as syncing column order and visibility.
 */
export class TableUtil {
  public static parseJsonParam(value?: string): any {
    if (!value) return undefined;

    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  public static pathsToFieldsQuery(paths: string[]): string | undefined {
    if (!paths.length) return undefined;

    interface NodeMap {
      [key: string]: NodeMap | true;
    }
    const tree: NodeMap = {};

    for (const path of paths) {
      const parts = path.split('.').filter(Boolean);
      if (!parts.length) continue;

      let cursor = tree;
      for (let i = 0; i < parts.length; i++) {
        const key = parts[i];
        const isLeaf = i === parts.length - 1;
        const current = cursor[key];

        if (isLeaf) {
          if (current === undefined) cursor[key] = true;
        } else {
          if (current === true || current === undefined) cursor[key] = {};
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

  public static pathsToInclude(paths: string[]): Record<string, any> | undefined {
    type IncludeTree = Record<string, true | { include: IncludeTree }>;
    const include: IncludeTree = {};

    const addPath = (parts: string[]) => {
      let cursor = include;

      for (let i = 0; i < parts.length; i++) {
        const key = parts[i];
        const isLast = i === parts.length - 1;
        const current = cursor[key];

        if (isLast) {
          if (current === undefined) {
            cursor[key] = true;
          }
          return;
        }

        if (current === true) {
          cursor[key] = { include: {} };
        } else if (current === undefined) {
          cursor[key] = { include: {} };
        }

        cursor = (cursor[key] as { include: IncludeTree }).include;
      }
    };

    for (const path of paths) {
      const parts = path.split('.').filter(Boolean);
      if (parts.length < 2) continue;

      addPath(parts.slice(0, -1));
    }

    return Object.keys(include).length ? include : undefined;
  }

  /**
   * Sync the column order with the current column definition.
   * This will add any new columns to the end of the order and remove any columns that no longer exist.
   * @param {Ref<string[]>} order The reactive column order array
   * @param {ColumnDefinition<T>[]} columns The current column definition
   */
  public static syncColumnOrder<T>(order: Ref<string[]>, columns: ColumnDefinition<T>[]) {
    const ids = columns
      .filter((c) => c.header)
      .map((c) => String(c.id))
      .filter(Boolean);

    // add missing columns that are not in the order list
    const missing = ids.filter((id) => !order.value.includes(id));
    if (missing.length) {
      order.value = [...order.value, ...missing];
    }

    // remove stale columns that no longer exist
    order.value = order.value.filter((id) => ids.includes(id));
  }
}
