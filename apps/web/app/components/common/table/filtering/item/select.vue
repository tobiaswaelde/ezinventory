<template>
  <CommonTableFilteringItemTemplate :id="id" :label="field.label" v-model:filtering="filtering">
    <template #operator>
      <USelect class="w-16" size="sm" :items="operators" v-model="operator" />
    </template>
    <template #value>
      <component :is="field.select" class="w-48" size="sm" v-model="value" multiple clear />
    </template>
  </CommonTableFilteringItemTemplate>
</template>

<script setup lang="ts">
import { type FilterFieldSelect, type Filtering, FilteringFieldOperator } from '~/types/table/filtering';

const props = defineProps<{
  id: string;
  field: FilterFieldSelect;
}>();
const filtering = defineModel<Filtering>('filtering', { required: true });
const operator = defineModel<FilteringFieldOperator | undefined>('operator', { required: true });
const value = defineModel<string[]>('value', { required: true });

const operators = computed(() => [
  { value: FilteringFieldOperator.In, label: '∈' },
  { value: FilteringFieldOperator.NotIn, label: '∉' },
]);
</script>
