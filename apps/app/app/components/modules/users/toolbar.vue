<template>
  <DefineBreadcrumb>
    <UBreadcrumb :items="[{ icon: 'i-tabler-home', to: '/' }, { label: 'Users' }]" />
  </DefineBreadcrumb>

  <DefineSearch>
    <UInput v-model="search" placeholder="Search by display name or email" class="w-full sm:w-80" />
  </DefineSearch>

  <DefineOptions>
    <div class="flex items-center gap-2">
      <USelect v-model="roleFilter" :items="roleOptions" label-key="label" value-key="value" class="min-w-36" />
      <USelect v-model="sortBy" :items="sortByOptions" label-key="label" value-key="value" class="min-w-40" />
      <USelect v-model="sortDir" :items="sortDirOptions" label-key="label" value-key="value" class="min-w-36" />
      <UPopover>
        <UButton color="neutral" variant="soft" icon="i-tabler-columns-3">Columns</UButton>
        <template #content>
          <div class="flex max-w-sm flex-wrap gap-2 p-3">
            <label v-for="column in columnDefinitions" :key="column.id" class="flex items-center gap-2 text-xs">
              <UCheckbox
                :model-value="isColumnVisible(column.id)"
                @update:model-value="toggleColumn(column.id, Boolean($event))"
              />
              <span>{{ column.label }}</span>
            </label>
          </div>
        </template>
      </UPopover>
    </div>
  </DefineOptions>

  <template v-if="isSmall">
    <UDashboardToolbar :ui="{ left: 'overflow-x-auto whitespace-nowrap', right: 'shrink-0!' }">
      <template #left>
        <div class="min-w-0 overflow-x-auto whitespace-nowrap">
          <slot name="breadcrumb">
            <Breadcrumb />
          </slot>
        </div>
      </template>
      <template #right>
        <div class="shrink-0">
          <slot name="new"></slot>
        </div>
      </template>
    </UDashboardToolbar>
    <UDashboardToolbar class="scrollbar-none">
      <template #left>
        <slot name="search">
          <Search />
        </slot>
      </template>
      <template #right>
        <slot name="options">
          <Options />
        </slot>
      </template>
    </UDashboardToolbar>
  </template>

  <template v-else>
    <UDashboardToolbar>
      <template #left>
        <slot name="breadcrumb">
          <Breadcrumb />
        </slot>
      </template>
      <template #right>
        <slot name="search">
          <Search />
        </slot>
        <slot name="options">
          <Options />
        </slot>
        <slot name="new"></slot>
      </template>
    </UDashboardToolbar>
  </template>
</template>

<script setup lang="ts">
import { breakpointsTailwind, createReusableTemplate, useBreakpoints } from '@vueuse/core';

type SelectOption = {
  label: string;
  value: string;
};

type ColumnDefinition = {
  id: string;
  label: string;
};

const props = defineProps<{
  roleOptions: readonly SelectOption[];
  sortByOptions: readonly SelectOption[];
  sortDirOptions: readonly SelectOption[];
  columnDefinitions: readonly ColumnDefinition[];
  isColumnVisible: (columnId: string) => boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-column', columnId: string, visible: boolean): void;
}>();

const search = defineModel<string>('search', { required: true });
const roleFilter = defineModel<string>('roleFilter', { required: true });
const sortBy = defineModel<string>('sortBy', { required: true });
const sortDir = defineModel<string>('sortDir', { required: true });

const bp = useBreakpoints(breakpointsTailwind);
const isSmall = bp.smaller('sm');

const [DefineBreadcrumb, Breadcrumb] = createReusableTemplate();
const [DefineSearch, Search] = createReusableTemplate();
const [DefineOptions, Options] = createReusableTemplate();

const toggleColumn = (columnId: string, visible: boolean): void => {
  emit('toggle-column', columnId, visible);
};
</script>

<style scoped>
.scrollbar-none {
  scrollbar-width: none;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
