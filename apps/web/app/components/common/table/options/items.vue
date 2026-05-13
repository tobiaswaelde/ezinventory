<template>
  <div class="flex flex-col gap-4">
    <VueDraggable :animation="150" handle=".drag-handle" tag="ul" class="flex flex-col" v-model="items">
      <template v-for="item in items" :key="item.id">
        <CommonTableOptionsItem
          v-if="item.type === 'item'"
          :column="item"
          :show-drag-handle="columnDefinitions.length > 1"
          v-model:invisible-columns="invisibleColumns"
          v-model:column-pinning="columnPinning"
        />
        <template v-else-if="item.type === 'placeholder'">
          <CommonTableOptionsItemPlaceholder
            :side="item.side"
            :column-pinning="columnPinning"
            :column-order="columnOrder"
          />
        </template>
        <template v-else>
          <li>
            <USeparator class="py-2" />
          </li>
        </template>
      </template>
    </VueDraggable>
  </div>
</template>

<script setup lang="ts">
import type { ColumnPinningState } from '@tanstack/table-core';
import { VueDraggable } from 'vue-draggable-plus';
import type { ColumnDefinition } from '~/types/table';
import { ObjectUtil } from '~/util/object';

const props = defineProps<{
  columnDefinitions: ColumnDefinition<any>[];
}>();
const columnOrder = defineModel<string[]>('columnOrder', { required: true });
const invisibleColumns = defineModel<string[]>('invisibleColumns', { required: true });
const columnPinning = defineModel<ColumnPinningState>('columnPinning', { required: true });

const orderedColumns = computed(() =>
  columnOrder.value.map((id) => props.columnDefinitions.find((c) => c.id === id)!).filter(Boolean),
);

type Item =
  | ({ type: 'item' } & ColumnDefinition<any>)
  | { type: 'separator'; id: string }
  | { type: 'placeholder'; id: string; side: 'left' | 'center' | 'right' };

const placeholder1: Item = { type: 'placeholder', id: crypto.randomUUID(), side: 'left' };
const placeholder2: Item = { type: 'placeholder', id: crypto.randomUUID(), side: 'center' };
const placeholder3: Item = { type: 'placeholder', id: crypto.randomUUID(), side: 'right' };
const separator1: Item = { type: 'separator', id: crypto.randomUUID() };
const separator2: Item = { type: 'separator', id: crypto.randomUUID() };

const items = computed<Item[]>({
  get() {
    const leftIds = columnPinning.value.left ?? [];
    const rightIds = columnPinning.value.right ?? [];

    const leftCols = orderedColumns.value.filter((c) => leftIds.includes(c.id));
    const rightCols = orderedColumns.value.filter((c) => rightIds.includes(c.id));
    const centerCols = orderedColumns.value.filter((c) => !leftIds.includes(c.id) && !rightIds.includes(c.id));

    return [
      placeholder1,
      ...leftCols.map((c) => ({ type: 'item', ...c }) as Item),
      separator1,
      placeholder2,
      ...centerCols.map((c) => ({ type: 'item', ...c }) as Item),
      separator2,
      ...rightCols.map((c) => ({ type: 'item', ...c }) as Item),
      placeholder3,
    ].filter(Boolean) as Item[];
  },
  set(value) {
    const groups = ObjectUtil.splitByKey(value, 'type', 'separator');
    if (groups.length !== 3) return;
    const [leftGroup, centerGroup, rightGroup] = groups;

    columnOrder.value = [...leftGroup, ...centerGroup, ...rightGroup].filter((i) => i.type === 'item').map((i) => i.id);

    columnPinning.value = {
      left: leftGroup.filter((i) => i.type === 'item').map((i) => i.id),
      right: rightGroup.filter((i) => i.type === 'item').map((i) => i.id),
    };
  },
});
</script>
