<template>
  <UPopover
    :modal="false"
    v-model:open="open"
    :content="{ align: 'start', side: 'bottom', sideOffset: 8 }"
    :ui="{ content: 'px-2.5 py-2.5 min-w-120' }"
    arrow
  >
    <UTooltip :text="$t('common.table.filtering.title')">
      <UButton icon="i-tabler-filter" variant="ghost" :color="hasFiltering ? 'primary' : 'neutral'" />
    </UTooltip>

    <template #content>
      <CommonTableFilteringHeader v-model:filtering="filtering" />

      <div class="flex flex-col gap-2">
        <ul v-if="hasFiltering" class="flex flex-col gap-2">
          <template v-for="filter in filtering.filters" :key="filter.id">
            <CommonTableFilteringItem
              :filter="filter"
              :field="fields.find((f) => f.value === filter.field)!"
              v-model:filtering="filtering"
            />
          </template>
        </ul>
        <USeparator v-if="hasFiltering" />
        <CommonTableFilteringAdd :fields="fields" v-model:filtering="filtering" />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { FilterField, Filtering } from '~/types/table/filtering';

const props = defineProps<{
  fields: FilterField[];
}>();
const filtering = defineModel<Filtering>('filtering', { required: true });

const hasFiltering = computed(() => filtering.value.filters.length > 0);

const open = ref<boolean>(false);
defineShortcuts({
  shift_f: () => {
    open.value = !open.value;
  },
});
</script>
