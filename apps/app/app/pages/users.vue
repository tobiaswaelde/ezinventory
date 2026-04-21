<template>
  <div class="grid gap-4">
    <UAlert
      v-if="!isAdmin"
      color="warning"
      variant="soft"
      title="Admin only"
      description="User administration is only available for admin accounts."
    />

    <template v-else>
      <ModulesUsersToolbar
        v-model:search="usersSearch"
        v-model:role-filter="usersRoleFilter"
        v-model:sort-by="usersSortBy"
        v-model:sort-dir="usersSortDir"
        :role-options="usersRoleFilterOptions"
        :sort-by-options="usersSortByOptions"
        :sort-dir-options="usersSortDirOptions"
        :column-definitions="usersTableColumnDefinition"
        :is-column-visible="isUsersTableColumnVisible"
        @toggle-column="setUserColumnVisibility"
      />

      <div class="overflow-x-auto rounded-lg border border-default">
        <ModulesUsersTable :columns="usersUiColumns" :items="managedUsers" @select="handleSelectUserRow" />
      </div>

      <div class="grid gap-2 text-sm">
        <p v-if="usersLoading">Loading users...</p>
        <p v-if="usersMessage">{{ usersMessage }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '#ui/types';
import type { ManagedUser, UserRole } from '@ezinventory/contracts';
import { useTableColumnsOptions } from '~/composables/table/use-table-columns-options';
import { useTableFieldsQuery } from '~/composables/table/use-table-fields-query';
import { useTableQueryOptions } from '~/composables/table/use-table-query-options';

const { user } = useAuth();
const { t } = useI18n();
const { listUsers } = useApiClient();

const isAdmin = computed(() => user.value?.role === 'ADMIN');

const managedUsers = ref<ManagedUser[]>([]);
const usersLoading = ref(false);
const usersMessage = ref('');

const usersSortByOptions = [
  { label: 'Created At', value: 'createdAt' },
  { label: 'Updated At', value: 'updatedAt' },
  { label: 'Display Name', value: 'displayName' },
  { label: 'Email', value: 'email' },
  { label: 'Role', value: 'role' }
] as const;
const usersSortDirOptions = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' }
] as const;
const usersRoleFilterOptions = [
  { label: 'All roles', value: 'ALL' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Staff', value: 'STAFF' },
  { label: 'Viewer', value: 'VIEWER' }
] as const;

const usersTableColumnDefinition = ref([
  { id: 'displayName', label: 'Display Name' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role' },
  { id: 'preferredLanguage', label: 'Language' },
  { id: 'policyIds', label: 'Policies' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'updatedAt', label: 'Updated At' }
]);

const { columns: usersTableColumns, isVisible: isUsersTableColumnVisible, setVisible: setUsersTableColumnVisible } = useTableColumnsOptions(
  'users-overview-table',
  usersTableColumnDefinition
);

const {
  search: usersSearch,
  roleFilter: usersRoleFilter,
  sortBy: usersSortBy,
  sortDir: usersSortDir
} = useTableQueryOptions<'displayName' | 'email' | 'createdAt' | 'updatedAt' | 'role', 'ALL' | UserRole>({
  tableName: 'users-overview-table',
  defaultSortBy: 'createdAt',
  defaultSortDir: 'asc',
  defaultRoleFilter: 'ALL'
});

const usersFieldsQuery = useTableFieldsQuery({
  columns: usersTableColumns,
  staticFields: ['id', 'displayName', 'email', 'role', 'policyIds']
});

const usersUiColumns = computed<TableColumn<ManagedUser>[]>(() =>
  usersTableColumns.value.map((column) => ({
    id: column.id,
    accessorKey: column.id,
    header: column.label
  }))
);

const setUserColumnVisibility = (columnId: string, visible: boolean): void => {
  if (!visible && usersTableColumns.value.length <= 1 && isUsersTableColumnVisible(columnId)) {
    return;
  }

  setUsersTableColumnVisible(columnId, visible);
};

const loadUsers = async (): Promise<void> => {
  if (!isAdmin.value) {
    managedUsers.value = [];
    return;
  }

  usersMessage.value = '';
  usersLoading.value = true;

  try {
    managedUsers.value = await listUsers({
      fields: usersFieldsQuery.value,
      search: usersSearch.value.trim() || undefined,
      role: usersRoleFilter.value === 'ALL' ? undefined : usersRoleFilter.value,
      sortBy: usersSortBy.value,
      sortDir: usersSortDir.value
    });
  } catch {
    usersMessage.value = t('settings_error_load_user_management_data');
  } finally {
    usersLoading.value = false;
  }
};

const handleSelectUserRow = (_row: ManagedUser): void => {
  // intentionally left blank until user detail route exists
};

onMounted(async () => {
  await loadUsers();
});

watch([usersSearch, usersRoleFilter, usersSortBy, usersSortDir, usersFieldsQuery], async () => {
  await loadUsers();
});
</script>
