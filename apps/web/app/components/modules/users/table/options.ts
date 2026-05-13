import { header } from '#build/ui';
import { EnumsUserRoleSelect } from '#components';
import { useRouteQuery } from '@vueuse/router';
import { UserRole } from '~/types/api/enums/user-role';
import type { ColumnDefinition } from '~/types/table';
import { FilterFieldType, type FilterField } from '~/types/table/filtering';
import type { TableOptions } from '~/types/table/options';
import type { SortingField } from '~/types/table/sorting';

export type UsersTableRow = {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstname: string;
    lastname: string;
    avatarUrl?: string;
  };
  preferences: {
    language: string;
    timezone: string;
  };
};

export const useUsersTableOptions = (): TableOptions<UsersTableRow> => {
  const { t } = useI18n();

  const search = useRouteQuery<string>('s', '');

  const columnDefinitions = computed<ColumnDefinition<UsersTableRow>[]>(() => [
    {
      id: 'email',
      accessorKey: 'email',
      header: t('modules.users.table.columns.email'),
      enableHiding: false,
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: t('modules.users.table.columns.role'),
    },
    {
      id: 'profile.firstname',
      accessorKey: 'profile.firstname',
      header: t('modules.users.table.columns.firstName'),
    },
    {
      id: 'profile.lastname',
      accessorKey: 'profile.lastname',
      header: t('modules.users.table.columns.lastname'),
    },
    {
      id: 'language',
      accessorKey: 'preferences.language',
      header: t('modules.users.table.columns.language'),
    },
    {
      id: 'preferences.timezone',
      accessorKey: 'preferences.timezone',
      header: t('modules.users.table.columns.timezone'),
    },
  ]);

  const sortableFields = computed<SortingField[]>(() =>
    columnDefinitions.value
      .filter((col) => col.enableSorting !== false)
      .map((col) => ({
        value: col.id,
        label: col.header as string,
      })),
  );

  const filterFields = computed<FilterField[]>(() => [
    {
      value: 'role',
      type: FilterFieldType.Enum,
      label: t('modules.users.table.columns.role'),
      enumName: 'user-role',
      enum: UserRole,
      customSelect: EnumsUserRoleSelect,
    },
  ]);

  const staticFilter = computed(() => {
    const value = unref(search);
    if (!value) return undefined;

    return {
      OR: [
        { email: { contains: `%${search.value}%`, mode: 'insensitive' } },
        { profile: { firstname: { contains: `%${search.value}%`, mode: 'insensitive' } } },
        { profile: { lastname: { contains: `%${search.value}%`, mode: 'insensitive' } } },
      ],
    };
  });

  return {
    search,
    columnDefinitions,
    sortableFields,
    filterFields,
    staticFilter,
  };
};
