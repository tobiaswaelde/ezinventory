<template>
  <li class="flex flex-row gap-2 items-center group">
    <UIcon
      v-if="sorting.length > 1"
      name="i-tabler-grip-vertical"
      class="drag-handle cursor-grab shrink-0 text-dimmed"
    />

    <span class="grow truncate text-muted text-sm"> {{ fieldLabel }} </span>

    <UTooltip
      :text="
        value.desc ? $t('common.table.sorting.directions.descending') : $t('common.table.sorting.directions.ascending')
      "
    >
      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        :icon="value.desc ? 'i-tabler-sort-descending' : 'i-tabler-sort-ascending'"
        :aria-label="$t('common.table.sorting.actions.toggle-direction.label')"
        @click="handleToggleSort"
      />
    </UTooltip>
    <UTooltip :text="$t('common.table.sorting.actions.remove.tooltip')">
      <UButton
        color="error"
        variant="outline"
        size="sm"
        icon="i-tabler-x"
        :aria-label="$t('common.table.sorting.actions.remove.label')"
        @click="handleRemoveSort"
      />
    </UTooltip>
  </li>
</template>

<script setup lang="ts">
import { type SortingState, type ColumnSort } from '@tanstack/table-core';
import type { SortingField } from '~/types/table/sorting';

const props = defineProps<{
  fields: SortingField[];
  value: ColumnSort;
}>();
const sorting = defineModel<SortingState>('sorting', { required: true });

const fieldLabel = computed(() => props.fields.find((x) => x.value === props.value.id)?.label ?? props.value.id);

const handleToggleSort = () => {
  if (!sorting.value) return;
  sorting.value = sorting.value.map((x) => {
    if (x.id === props.value.id) {
      return { ...x, desc: !x.desc };
    }
    return x;
  });
};

const handleRemoveSort = () => {
  if (!sorting.value) return;
  sorting.value = sorting.value.filter((x) => x.id !== props.value.id);
};
</script>
