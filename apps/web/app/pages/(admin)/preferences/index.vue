<template>
  <UDashboardPanel id="preferences">
    <template #header>
      <LayoutNavbar :title="$t('core.navbar.user-menu.preferences.label')" />

      <UDashboardToolbar>
        <UNavigationMenu class="-mx-1 flex-1" :items="navItems" highlight />
      </UDashboardToolbar>
    </template>

    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useAuthStore } from '~/store/auth';
import { Routes } from '~/types/routes';

const { t } = useI18n();
const auth = useAuthStore();

const isMfaEnabled = computed(() => auth.currentUser?.isMfaEnabled);

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: t('modules.preferences.navigation.general.label'),
    icon: 'i-tabler-settings',
    to: { name: Routes.PreferencesGeneral },
  },
  {
    label: t('modules.preferences.navigation.profile.label'),
    icon: 'i-tabler-user',
    to: { name: Routes.PreferencesProfile },
    exact: true,
  },
  {
    label: t('modules.preferences.navigation.security.label'),
    icon: 'i-tabler-shield',
    to: { name: Routes.PreferencesSecurity },
    chip: isMfaEnabled.value ? undefined : { color: 'error' },
  },
]);
</script>
