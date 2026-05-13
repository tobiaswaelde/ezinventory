<template>
  <UPopover
    v-model:open="open"
    :modal="false"
    :content="{ align: 'start', side: 'bottom', sideOffset: 8 }"
    :ui="{ content: 'px-2.5 py-2.5 min-w-80' }"
    arrow
  >
    <UTooltip :text="'Options'">
      <UButton icon="i-tabler-adjustments" variant="ghost" color="neutral" />
    </UTooltip>

    <template #content>
      <CommonTableOptionsHeader />
      <CommonTableOptionsItems
        :column-definitions="columnDefinitions"
        v-model:column-order="columnOrder"
        v-model:invisible-columns="invisibleColumns"
        v-model:column-pinning="columnPinning"
      />
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { ColumnPinningState } from '@tanstack/table-core';
import type { ColumnDefinition } from '~/types/table';

const props = defineProps<{
  columnDefinitions: ColumnDefinition<any>[];
}>();
const columnOrder = defineModel<string[]>('columnOrder', { required: true });
const invisibleColumns = defineModel<string[]>('invisibleColumns', { required: true });
const columnPinning = defineModel<ColumnPinningState>('columnPinning', { required: true });

const open = ref<boolean>(false);
defineShortcuts({
  shift_o: () => {
    open.value = !open.value;
  },
});
</script>
