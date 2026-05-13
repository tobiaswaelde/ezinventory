<template>
  <UDashboardPanel id="users" :ui="{ body: 'p-0!' }">
    <template #header>
      <LayoutNavbar :title="$t('core.navigation.administration.users')" />
      <CommonTableToolbar
        :breadcrumb-items="[{ label: $t('core.navigation.administration.users') }]"
        :sortable-fields="sortableFields"
        :filter-fields="filterFields"
        :column-definitions="columnDefinitions"
        v-model:search="search"
        v-model:sorting="sorting"
        v-model:filtering="filtering"
        v-model:column-order="columnOrder"
        v-model:column-visibility="columnVisibility"
        v-model:column-pinning="columnPinning"
      />
    </template>

    <template #body>
      <ModulesUsersTable
        :columns="columns"
        :items="items"
        :loading="loading"
        :page="page"
        :items-per-page="itemsPerPage"
      />
    </template>

    <template #footer>
      <LayoutTablePanelFooter :total-items="totalItems" v-model:items-per-page="itemsPerPage" v-model:page="page" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useUsersTableOptions, type UsersTableRow } from '~/components/modules/users/table/options';
import { useTable } from '~/composables/api/table';

const { t } = useI18n();

useHead({
  title: t('core.navigation.administration.users'),
});

const { search, columnDefinitions, sortableFields, filterFields, staticFilter } = useUsersTableOptions();

const {
  items,
  loading,
  page,
  itemsPerPage,
  totalItems,
  refresh,
  initialize,
  sorting,
  filtering,
  columns,
  columnOrder,
  columnVisibility,
  columnPinning,
} = useTable<'users', UsersTableRow>({
  name: 'users',
  endpoint: 'users',
  staticFields: ['id'],
  staticFilter,
  columnDefinition: columnDefinitions,
});

onMounted(() => {
  initialize();
});
</script>
