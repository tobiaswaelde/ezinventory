<template>
  <div class="flex flex-row items-center gap-2 mb-4 justify-between">
    <div class="flex flex-row items-center gap-2 grow">
      <UIcon name="i-tabler-arrows-sort" />
      <span>{{ $t('common.table.sorting.title') }}</span>
    </div>

    <CommonTableSortingHeaderClear v-model:sorting="sorting" />
  </div>
</template>

<script setup lang="ts">
import type { SortingState } from '@tanstack/table-core';

const sorting = defineModel<SortingState>('sorting', { required: true });
</script>
