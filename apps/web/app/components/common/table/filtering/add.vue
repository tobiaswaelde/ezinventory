<template>
  <div class="flex flex-row gap-2">
    <USelect
      class="w-full"
      size="sm"
      autofocus
      :items="items"
      v-model="selectedField"
      :placeholder="$t('common.table.filtering.inputs.field.placeholder')"
    />
    <UButton
      icon="i-tabler-plus"
      size="sm"
      @click="handleAdd"
      :disabled="!selectedField"
      :aria-label="$t('common.table.filtering.actions.add.label')"
    />
  </div>
</template>

<script setup lang="ts">
import { type FilterField, type Filtering } from '~/types/table/filtering';
import { FilteringUtil } from '~/util/filtering';

const props = defineProps<{
  fields: FilterField[];
}>();
const filtering = defineModel<Filtering>('filtering', { required: true });

const items = computed(() => props.fields.map((f) => ({ value: f.value, label: f.label })));

const selectedField = ref<string | undefined>(undefined);

const handleAdd = () => {
  if (!selectedField.value) return;
  if (!filtering.value.filters) filtering.value.filters = [];

  const field = props.fields.find((f) => f.value === selectedField.value);
  if (!field) return;

  const newFilter = FilteringUtil.getNewFilter(field);
  filtering.value.filters = [...filtering.value.filters, newFilter];

  selectedField.value = undefined;
};
</script>
