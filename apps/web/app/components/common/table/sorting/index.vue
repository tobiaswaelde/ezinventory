<template>
  <UPopover
    v-model:open="open"
    :modal="false"
    :content="{ align: 'start', side: 'bottom', sideOffset: 8 }"
    :ui="{ content: 'px-2.5 py-2.5 w-80' }"
    arrow
  >
    <UButton icon="i-tabler-arrows-sort" variant="ghost" :color="hasSorting ? 'primary' : 'neutral'" />

    <template #content>
      <CommonTableSortingHeader v-model:sorting="sorting" />
      <div class="flex flex-col gap-2">
        <CommonTableSortingItems v-if="hasSorting" :fields="fields" v-model:sorting="sorting" />
        <USeparator v-if="hasSorting && hasAvailableFields" />
        <CommonTableSortingAdd
          v-if="hasAvailableFields"
          :available-fields="availableFields"
          v-model:sorting="sorting"
        />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { type SortingState } from '@tanstack/table-core';
import type { SortingField } from '~/types/table/sorting';

const props = defineProps<{
  fields: SortingField[];
}>();
const sorting = defineModel<SortingState>('sorting', { required: true });

const availableFields = computed(() => {
  return props.fields.filter((f) => !sorting.value?.find((v) => v.id === f.value));
});

const hasSorting = computed(() => sorting.value && sorting.value.length > 0);
const hasAvailableFields = computed(() => availableFields.value.length > 0);

const open = ref<boolean>(false);
defineShortcuts({
  shift_s: () => {
    open.value = !open.value;
  },
});
</script>
