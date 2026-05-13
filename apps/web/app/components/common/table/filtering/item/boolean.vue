<template>
  <CommonTableFilteringItemTemplate :id="id" :label="field.label" v-model:filtering="filtering">
    <template #value>
      <UCheckbox v-model="value" />
    </template>
  </CommonTableFilteringItemTemplate>
</template>

<script setup lang="ts">
import type { FilterFieldBoolean, Filtering } from '~/types/table/filtering';

const props = defineProps<{
  id: string;
  field: FilterFieldBoolean;
}>();
const filtering = defineModel<Filtering>('filtering', { required: true });
const value = defineModel<boolean>('value', { required: true });
</script>
