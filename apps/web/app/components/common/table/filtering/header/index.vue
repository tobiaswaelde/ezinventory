<template>
  <div class="flex flex-row items-center gap-2 mb-4 justify-between">
    <div class="flex flex-row items-center gap-2 grow">
      <UIcon name="i-tabler-filter-2" />
      <span>{{ $t('common.table.filtering.title') }}</span>
    </div>

    <CommonTableFilteringHeaderModeToggle v-model:filtering="filtering" />

    <CommonTableFilteringHeaderClear v-model:filtering="filtering" />
  </div>
</template>

<script setup lang="ts">
import { type Filtering } from '~/types/table/filtering';

const filtering = defineModel<Filtering>('filtering', { required: true });
</script>
