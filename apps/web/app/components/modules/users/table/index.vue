<template>
  <UTable
    sticky
    class="shrink-0"
    :columns="columns"
    :data="items"
    :ui="{
      th: 'first:pl-8 bg-neutral-100 dark:bg-neutral-950/20',
      td: 'first:pl-8',
      tr: 'cursor-pointer',
    }"
    @select="
      (e, row) => {
        // onSelect(row.original);
      }
    "
  >
    <template #role-cell="{ row }">
      <EnumsUserRoleBadge :value="row.original.role" variant="soft" />
    </template>
  </UTable>
</template>

<script setup lang="ts">
import type { UsersTableRow } from '~/components/modules/users/table/options';
import type { ColumnDefinition, TableProps } from '~/types/table';

const props = defineProps<TableProps<UsersTableRow>>();

const columns = computed<ColumnDefinition<UsersTableRow>[]>(() => [
  ...props.columns,
  { id: 'actions', accessorKey: 'actions', header: '' },
]);
</script>
