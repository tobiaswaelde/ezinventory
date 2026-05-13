<template>
  <UTooltip :text="tooltip">
    <UButton :icon="icon" color="neutral" variant="outline" size="xs" @click="handleClick" />
  </UTooltip>
</template>

<script setup lang="ts">
import { FilteringMode, type Filtering } from '~/types/table/filtering';

const filtering = defineModel<Filtering>('filtering', { required: true });

const tooltip = computed(() => {
  return filtering.value.operator === FilteringMode.Intersect
    ? $t('common.table.filtering.actions.toggle-mode.tooltip.intersect')
    : $t('common.table.filtering.actions.toggle-mode.tooltip.union');
});

const icon = computed(() => {
  return filtering.value.operator === FilteringMode.Intersect ? 'i-tabler-layers-intersect-2' : 'i-tabler-layers-union';
});

const handleClick = () => {
  filtering.value.operator =
    filtering.value.operator === FilteringMode.Intersect ? FilteringMode.Union : FilteringMode.Intersect;
};
</script>
