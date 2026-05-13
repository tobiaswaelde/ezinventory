<template>
  <div class="flex flex-row gap-2">
    <USelect
      class="w-full"
      size="sm"
      autofocus
      :items="availableFields"
      v-model="selectedField"
      :placeholder="$t('common.table.sorting.inputs.field.placeholder')"
    />
    <UButton
      size="sm"
      icon="i-tabler-plus"
      @click="handleAdd"
      :disabled="!selectedField"
      :aria-label="$t('common.table.sorting.actions.add.label')"
    />
  </div>
</template>

<script setup lang="ts">
import { type SortingState } from '@tanstack/table-core';
import type { SortingField } from '~/types/table/sorting';

const props = defineProps<{
  availableFields: SortingField[];
}>();
const sorting = defineModel<SortingState>('sorting', { required: true });

const selectedField = ref<string | undefined>(undefined);

const handleAdd = () => {
  if (!selectedField.value) return;
  if (!sorting.value) sorting.value = [];

  const newItem = { id: selectedField.value, desc: false };
  sorting.value = [...sorting.value, newItem];

  selectedField.value = undefined;
};
</script>
