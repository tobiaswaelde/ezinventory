<template>
  <UDashboardPanel id="user">
    <template #header>
      <LayoutNavbar :title="$t('modules.users.details.navigation.title')" />

      <UDashboardToolbar>
        <UBreadcrumb
          :items="[
            { icon: 'i-tabler-home', to: { name: Routes.Dashboard } },
            { label: t('core.navigation.administration.users'), to: { name: Routes.AdminUsers } },
            { label: name },
          ]"
        />
      </UDashboardToolbar>
      <UDashboardToolbar>
        <template #left>
          <UNavigationMenu class="-mx-1 flex-1" :items="navItems" highlight />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useRouteParams } from '@vueuse/router';
import { useModuleApi } from '~/composables/api/module-api';
import { Routes } from '~/types/routes';

const { t } = useI18n();

useHead({
  title: t('core.navigation.administration.users'),
});

const id = useRouteParams<string>('id');

const { data, refresh } = useAsyncData(
  async () => {
    const res = await useModuleApi('users').get(id.value, {
      include: {
        preferences: true,
        profile: true,
      },
    });
    return res.data;
  },
  { watch: [id], immediate: true },
);

const name = computed(() => {
  if (!data.value) return undefined;
  return [data.value.profile?.firstname, data.value.profile?.lastname].filter(Boolean).join(' ');
});

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    icon: 'i-tabler-user',
    label: t('modules.users.details.navigation.profile'),
    to: { name: Routes.AdminUsersUserProfile, params: { id: id.value } },
    exact: true,
  },
  {
    icon: 'i-tabler-settings',
    label: t('modules.users.details.navigation.preferences'),
    to: { name: Routes.AdminUsersUserPreferences, params: { id: id.value } },
    exact: true,
  },
  {
    icon: 'i-tabler-shield',
    label: t('modules.users.details.navigation.security'),
    to: { name: Routes.AdminUsersUserSecurity, params: { id: id.value } },
    exact: true,
  },
]);
</script>
