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
        onSelect(row.original);
      }
    "
  >
    <template #email-cell="{ row }">
      <span class="font-medium">{{ row.original.email }}</span>
    </template>

    <template #policyIds-cell="{ row }">
      <UBadge color="neutral" variant="soft">
        {{ row.original.policyIds?.length ?? 0 }}
      </UBadge>
    </template>

    <template #createdAt-cell="{ row }">
      {{ formatDate(row.original.createdAt) }}
    </template>

    <template #updatedAt-cell="{ row }">
      {{ formatDate(row.original.updatedAt) }}
    </template>

    <template #actions-cell>
      <div class="flex justify-end">
        <UIcon name="i-tabler-chevron-right" class="text-muted" />
      </div>
    </template>
  </UTable>
</template>

<script setup lang="ts">
import type { TableColumn } from '#ui/types';
import type { ManagedUser } from '@ezinventory/contracts';

const props = defineProps<{
  columns: TableColumn<ManagedUser>[];
  items: ManagedUser[];
}>();

const emit = defineEmits<{
  (e: 'select', row: ManagedUser): void;
}>();

const columns = computed<TableColumn<ManagedUser>[]>(() => [
  ...props.columns,
  { id: 'actions', accessorKey: 'actions', header: '' }
]);

const onSelect = (row: ManagedUser) => {
  emit('select', row);
};

const formatDate = (value: string): string => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};
</script>
