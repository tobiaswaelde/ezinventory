import type { Endpoint } from '~/types/api/endpoints';
import { useModuleApi } from '~/composables/api/module-api';
import { useTableColumnsOptions } from '~/composables/helpers/table-columns-options';
import { useTableQueryOptions } from '~/composables/helpers/table-query-options';
import type { ColumnDefinition } from '~/types/table';
import { TableUtil } from '~/util/table';

type UseTableOptions<TEndpoint extends Endpoint, TRow extends { id: string }> = {
  name: string;
  endpoint: TEndpoint;
  staticFields?: string[];
  defaultItemsPerPage?: number;
  staticFilter?: Ref<any>;
  columnDefinition: Ref<ColumnDefinition<TRow>[]>;
};

export const useTable = <TEndpoint extends Endpoint, TRow extends { id: string }>(
  options: UseTableOptions<TEndpoint, TRow>,
) => {
  const { name } = options;

  const { columnOrder, columnVisibility, columnPinning, columns } = useTableColumnsOptions<TRow>(
    name,
    options.columnDefinition,
  );
  const { page, queryPage, itemsPerPage, sorting, filtering, queryParams } = useTableQueryOptions(name, {
    defaultItemsPerPage: options.defaultItemsPerPage,
    staticFilter: options.staticFilter,
  });

  const api = useModuleApi(options.endpoint);
  const paths = computed(() => {
    const paths = new Set<string>(options.staticFields ?? ['id']);

    for (const column of columns.value) {
      const columnId = String(column.id || '').trim();
      if (!columnId || columnId === 'actions') continue;

      if (column.fields && column.fields.length > 0) {
        for (const field of column.fields) {
          paths.add(`${columnId}.${field}`);
        }
      } else {
        paths.add(columnId);
      }
    }

    return [...paths];
  });
  const fields = computed(() => TableUtil.pathsToFieldsQuery(paths.value));
  const include = computed(() => TableUtil.pathsToInclude(paths.value));

  //#region data
  const items = ref<TRow[]>([]);
  const totalItems = ref<number>(0);
  const totalPages = ref<number>(0);
  const loading = ref<boolean>(false);
  //#endregion

  const initialize = async () => {
    page.value = queryPage.value;
    useNuxtApp().$bus.emit('table:initialized', { tableName: name });
    await refresh();
  };

  const refresh = async () => {
    try {
      loading.value = true;

      const res = await api.query({
        page: queryParams.value.page,
        perPage: queryParams.value.perPage,
        where: TableUtil.parseJsonParam(queryParams.value.where),
        orderBy: TableUtil.parseJsonParam(queryParams.value.sort),
        fields: fields.value,
        include: include.value,
      });

      totalItems.value = res.data.meta.itemCount;
      totalPages.value = res.data.meta.pageCount;
      items.value = res.data.items as unknown as TRow[];

      useNuxtApp().$bus.emit('table:refreshed', { tableName: name });
    } catch {
      //
    } finally {
      loading.value = false;
    }
  };

  const updateRow = (row: TRow) => {
    for (let i = 0; i < items.value.length; i++) {
      if (items.value[i].id === row.id) {
        items.value[i] = { ...items.value[i], ...row };
        break;
      }
    }
  };

  watch([queryParams, fields, include], refresh, { deep: true });

  //#region events
  onMounted(() => {
    useNuxtApp().$bus.on('table:refresh', refresh);
  });
  onBeforeUnmount(() => {
    useNuxtApp().$bus.off('table:refresh');
  });

  watch(totalItems, () => {
    useNuxtApp().$bus.emit('table:update-item-count', { tableName: name, itemCount: totalItems.value });
  });
  //#endregion

  return {
    page,
    itemsPerPage,
    sorting,
    filtering,
    items,
    totalItems,
    totalPages,
    loading,
    columnOrder,
    columnVisibility,
    columnPinning,
    columns,
    initialize,
    refresh,
    updateRow,
  };
};
