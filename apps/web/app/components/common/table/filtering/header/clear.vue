<template>
  <UTooltip :text="$t('common.table.sorting.actions.clear.tooltip')">
    <UButton
      v-if="filtering.filters.length > 0"
      icon="i-tabler-cancel"
      :label="$t('common.table.sorting.actions.clear.label')"
      size="xs"
      color="error"
      variant="outline"
      @click="handleClick"
    />
  </UTooltip>
</template>

<script setup lang="ts">
import { FilteringMode, type Filtering } from '~/types/table/filtering';

const filtering = defineModel<Filtering>('filtering', { required: true });

const handleClick = () => {
  filtering.value.operator = FilteringMode.Intersect;
  filtering.value.filters = [];
};
</script>
