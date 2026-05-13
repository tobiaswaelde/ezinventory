<template>
  <li class="flex flex-row gap-2 items-center group py-1.5">
    <UIcon v-if="showDragHandle" name="i-tabler-grip-vertical" class="drag-handle cursor-grab shrink-0 text-dimmed" />

    <span class="grow truncate text-muted text-sm"> {{ column.header }} </span>

    <USwitch
      unchecked-icon="i-tabler-eye-off"
      checked-icon="i-tabler-eye"
      :model-value="!!column.id && !invisibleColumns.includes(column.id)"
      @update:model-value="
        (val) => {
          if (!column.id) return;
          if (val) {
            invisibleColumns = invisibleColumns.filter((id) => id !== column.id);
          } else {
            if (!invisibleColumns.includes(column.id)) {
              invisibleColumns = [...invisibleColumns, column.id];
            }
          }
        }
      "
      :disabled="column.enableHiding === false"
    />
  </li>
</template>

<script setup lang="ts">
import type { ColumnDefinition } from '~/types/table';

const props = defineProps<{
  showDragHandle: boolean;
  column: ColumnDefinition<any>;
  isPinned?: boolean;
}>();
const invisibleColumns = defineModel<string[]>('invisibleColumns', { required: true });
</script>
