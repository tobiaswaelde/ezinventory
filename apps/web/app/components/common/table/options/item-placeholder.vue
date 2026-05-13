<template>
  <li>
    <div
      v-if="show"
      class="flex flex-row gap-2 items-center text-dimmed text-sm border-2 border-dashed border-muted rounded-md p-2"
      :class="{
        'pb-1.5': isLeft,
        'pt-1.5': isRight,
        'py-1.5': isCenter,
      }"
    >
      <UIcon v-if="isCenter" name="i-lucide-pin-off" />
      <UIcon v-else name="i-lucide-pin" />

      <span>
        <span v-if="isLeft">
          {{ $t('common.table.options.pinning.pin-left') }}
        </span>
        <span v-if="isRight">
          {{ $t('common.table.options.pinning.pin-right') }}
        </span>
        <span v-if="isCenter">
          {{ $t('common.table.options.pinning.unpin') }}
        </span>
      </span>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { ColumnPinningState } from '@tanstack/table-core';

const props = defineProps<{
  side: 'left' | 'center' | 'right';
  columnPinning: ColumnPinningState;
  columnOrder: string[];
}>();

const isLeft = computed(() => props.side === 'left');
const isRight = computed(() => props.side === 'right');
const isCenter = computed(() => props.side === 'center');

const show = computed(() => {
  if (isLeft.value) {
    return (props.columnPinning.left ?? []).length === 0;
  } else if (isRight.value) {
    return (props.columnPinning.right ?? []).length === 0;
  } else if (isCenter.value) {
    const left = props.columnPinning.left ?? [];
    const right = props.columnPinning.right ?? [];
    return left.length + right.length === props.columnOrder.length;
  }
  return false;
});
</script>
