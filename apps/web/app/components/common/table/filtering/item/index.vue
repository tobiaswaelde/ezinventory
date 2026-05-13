<template>
  <CommonTableFilteringItemBoolean
    v-if="field.type === FilterFieldType.Boolean"
    :id="filter.id"
    :field="field"
    v-model:filtering="filtering"
    v-model:value="value"
  />
  <CommonTableFilteringItemNumber
    v-else-if="field.type === FilterFieldType.Number"
    :id="filter.id"
    :field="field"
    v-model:filtering="filtering"
    v-model:operator="operator"
    v-model:value="value"
  />
  <CommonTableFilteringItemEnum
    v-else-if="field.type === FilterFieldType.Enum"
    :id="filter.id"
    :field="field"
    v-model:filtering="filtering"
    v-model:operator="operator"
    v-model:value="value"
  />
  <CommonTableFilteringItemSelect
    v-else-if="field.type === FilterFieldType.Select"
    :id="filter.id"
    :field="field"
    v-model:filtering="filtering"
    v-model:operator="operator"
    v-model:value="value"
  />
</template>

<script setup lang="ts">
import {
  FilterFieldType,
  type FilterField,
  type Filtering,
  type FilteringField,
  type FilteringFieldOperator,
} from '~/types/table/filtering';

const props = defineProps<{
  filter: FilteringField;
  field: FilterField;
}>();
const filtering = defineModel<Filtering>('filtering', { required: true });

const currentFilter = computed(() => filtering.value.filters.find((f) => f.id === props.filter.id));

const operator = computed<FilteringFieldOperator | undefined>({
  get: () => currentFilter.value?.operator as FilteringFieldOperator | undefined,
  set: (newVal: FilteringFieldOperator | undefined) => {
    filtering.value.filters = filtering.value.filters.map((f) =>
      f.id === props.filter.id ? { ...f, operator: newVal } : f,
    );
  },
});

const value = computed<any>({
  get: () => currentFilter.value?.value as any,
  set: (newVal: any) => {
    filtering.value.filters = filtering.value.filters.map((f) =>
      f.id === props.filter.id ? { ...f, value: newVal } : f,
    );
  },
});
</script>
