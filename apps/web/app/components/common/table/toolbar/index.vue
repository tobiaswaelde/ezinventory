<template>
  <DefineBreadcrumb>
    <UBreadcrumb
      v-if="breadcrumbItems"
      :items="[{ icon: 'i-tabler-home', to: { name: Routes.Dashboard } }, ...breadcrumbItems]"
    />
  </DefineBreadcrumb>

  <DefineSearch>
    <CommonInputsSearch v-if="search !== undefined" v-model="search" />
  </DefineSearch>

  <DefineOptions>
    <CommonTableSorting
      v-if="sortableFields && sortableFields.length > 0 && sorting"
      :fields="sortableFields"
      v-model:sorting="sorting"
    />
    <CommonTableFiltering
      v-if="filterFields && filterFields.length > 0 && filtering"
      :fields="filterFields"
      v-model:filtering="filtering"
    />
    <CommonTableOptions
      v-if="columnDefinitions && columnDefinitions.length > 0 && columnOrder && columnVisibility && columnPinning"
      :column-definitions="columnDefinitions"
      v-model:column-order="columnOrder"
      v-model:invisible-columns="columnVisibility"
      v-model:column-pinning="columnPinning"
    />
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
import type { BreadcrumbItem } from '#ui/types';
import type { ColumnPinningState, SortingState } from '@tanstack/table-core';
import { breakpointsTailwind, createReusableTemplate, useBreakpoints } from '@vueuse/core';
import { Routes } from '~/types/routes';
import type { ColumnDefinition } from '~/types/table';
import type { FilterField, Filtering } from '~/types/table/filtering';
import type { SortingField } from '~/types/table/sorting';

const bp = useBreakpoints(breakpointsTailwind);
const isSmall = bp.smaller('sm');

const [DefineBreadcrumb, Breadcrumb] = createReusableTemplate();
const [DefineSearch, Search] = createReusableTemplate();
const [DefineOptions, Options] = createReusableTemplate();

const props = defineProps<{
  breadcrumbItems?: BreadcrumbItem[];
  sortableFields?: SortingField[];
  filterFields?: FilterField[];
  columnDefinitions?: ColumnDefinition<any>[];
}>();
const search = defineModel<string | undefined>('search', { required: false, default: undefined });
const sorting = defineModel<SortingState>('sorting', { required: false });
const filtering = defineModel<Filtering>('filtering', { required: false });
const columnOrder = defineModel<string[]>('columnOrder', { required: false });
const columnVisibility = defineModel<string[]>('columnVisibility', { required: false });
const columnPinning = defineModel<ColumnPinningState>('columnPinning', { required: false });
</script>

<style lang="scss">
.scrollbar-none {
  scrollbar-width: none; /* Firefox */
}
.scrollbar-none::-webkit-scrollbar {
  display: none; /* Chrome / Safari */
}
</style>
