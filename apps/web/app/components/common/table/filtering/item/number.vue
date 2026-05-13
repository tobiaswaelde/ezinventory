<template>
  <CommonTableFilteringItemTemplate :id="id" :label="field.label" v-model:filtering="filtering">
    <template #operator>
      <USelect class="w-16" :items="operators" v-model="operator" size="sm" />
    </template>
    <template #value>
      <UInputNumber class="w-48" v-model="value" size="sm" />
    </template>
  </CommonTableFilteringItemTemplate>
</template>

<script setup lang="ts">
import { FilteringFieldOperator, type FilterFieldNumber, type Filtering } from '~/types/table/filtering';

const props = defineProps<{
  id: string;
  field: FilterFieldNumber;
}>();
const filtering = defineModel<Filtering>('filtering', { required: true });
const operator = defineModel<FilteringFieldOperator | undefined>('operator', { required: true });
const value = defineModel<number | undefined>('value', { required: true });

const operators = computed(() => [
  { value: FilteringFieldOperator.Equals, label: '=' },
  { value: FilteringFieldOperator.NotEquals, label: '≠' },
  { value: FilteringFieldOperator.GreaterThan, label: '>' },
  { value: FilteringFieldOperator.GreaterThanOrEqual, label: '≥' },
  { value: FilteringFieldOperator.LessThan, label: '<' },
  { value: FilteringFieldOperator.LessThanOrEqual, label: '≤' },
]);
</script>
