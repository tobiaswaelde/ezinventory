<template>
  <CommonTableFilteringItemTemplate :id="id" :label="field.label" v-model:filtering="filtering">
    <template #operator>
      <USelect class="w-16" size="sm" :items="operators" v-model="operator" />
    </template>
    <template #value>
      <component
        v-if="field.customSelect"
        :is="field.customSelect"
        class="w-48"
        size="sm"
        v-model="value"
        multiple
        clear
      />
      <USelectMenu
        v-else
        class="w-48"
        size="sm"
        :items="values"
        value-key="value"
        label-key="label"
        multiple
        clear
        v-model="value"
      />
    </template>
  </CommonTableFilteringItemTemplate>
</template>

<script setup lang="ts">
import type { SelectMenuItem } from '#ui/types';
import { type FilterFieldEnum, type Filtering, FilteringFieldOperator } from '~/types/table/filtering';

const props = defineProps<{
  id: string;
  field: FilterFieldEnum;
}>();
const filtering = defineModel<Filtering>('filtering', { required: true });
const operator = defineModel<FilteringFieldOperator | undefined>('operator', { required: true });
const value = defineModel<string[]>('value', { required: true });

const operators = computed(() => [
  { value: FilteringFieldOperator.In, label: '∈' },
  { value: FilteringFieldOperator.NotIn, label: '∉' },
]);

const values = computed<SelectMenuItem[]>(() =>
  Object.values(props.field.enum).map((v) => ({
    value: v,
    label: $te(`enums.${props.field.enumName}.${v}`) ? $t(`enums.${props.field.enumName}.${v}`) : String(v),
  })),
);
</script>
