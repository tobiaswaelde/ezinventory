<template>
  <UTooltip :text="$t('common.table.sorting.actions.clear.tooltip')">
    <UButton
      v-if="sorting && sorting.length > 0"
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
import type { SortingState } from '@tanstack/table-core';

const sorting = defineModel<SortingState>('sorting', { required: true });

const handleClick = () => {
  sorting.value = [];
};
</script>
