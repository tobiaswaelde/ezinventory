<template>
  <VueDraggable v-model="sorting" :animation="150" handle=".drag-handle" tag="ul" class="flex flex-col gap-2">
    <CommonTableSortingItem
      v-for="sort in sorting"
      :key="sort.id"
      :fields="fields"
      :value="sort"
      v-model:sorting="sorting"
    />
  </VueDraggable>
</template>

<script setup lang="ts">
import { type SortingState } from '@tanstack/table-core';
import { VueDraggable } from 'vue-draggable-plus';
import type { SortingField } from '~/types/table/sorting';

const props = defineProps<{
  fields: SortingField[];
}>();
const sorting = defineModel<SortingState>('sorting', { required: true });
</script>
