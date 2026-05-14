<template>
  <UDropdownMenu v-if="authStore.currentUser" :items="items" :ui="{ content: 'w-48' }">
    <UUser
      class="cursor-pointer"
      :ui="{ name: 'truncate' }"
      :avatar="{
        text: initials,
        src: authStore.currentUser.profile?.avatarUrl,
      }"
      :name="collapsed ? undefined : name"
      :description="collapsed ? undefined : authStore.currentUser.email"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { useLocales } from '~/composables/app/locales';
import { useThemes } from '~/composables/app/themes';
import { useAuthStore } from '~/store/auth';
import { Routes } from '~/types/routes';

const { t } = useI18n();

const authStore = useAuthStore();
const { dropdownMenuItems: localesItems } = useLocales();
const { dropdownMenuItems: themeItems } = useThemes();

const bp = useBreakpoints(breakpointsTailwind);
const collapsed = computed(() => !bp.greaterOrEqual('sm').value);

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: t('core.navbar.user-menu.language.label'),
    icon: 'i-tabler-language',
    children: localesItems.value,
  },
  {
    label: t('core.navbar.user-menu.theme.label'),
    icon: 'i-tabler-palette',
    children: themeItems.value,
  },
  {
    label: t('core.navbar.user-menu.preferences.label'),
    kbds: [';'],
    icon: 'i-tabler-settings',
    to: { name: Routes.PreferencesGeneral },
  },
  { type: 'separator' },
  {
    label: t('core.navbar.user-menu.shortcuts.label'),
    kbds: ['?'],
    icon: 'i-tabler-keyboard',
    onSelect: () => {
      // useNuxtApp().$bus.emit('shortcuts:toggle');
    },
  },
  {
    label: t('core.navbar.user-menu.signout.label'),
    icon: 'i-tabler-logout',
    color: 'error',
    onSelect: () => {
      handleSignout();
    },
  },
]);

const name = computed<string | undefined>(() => {
  if (!authStore.currentUser) return undefined;
  return `${authStore.currentUser.profile?.firstname} ${authStore.currentUser.profile?.lastname}`.trim();
});

const initials = computed<string | undefined>(() => {
  if (!authStore.currentUser) return undefined;
  return `${authStore.currentUser.profile?.firstname?.charAt(0)} ${authStore.currentUser.profile?.lastname?.charAt(0)}`
    .toUpperCase()
    .trim();
});

const handleSignout = () => {
  authStore.signout();
  navigateTo({ name: Routes.Index, replace: true, force: true });
};
</script>

<style lang="css">
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  z-index: 9999;
}
::view-transition-old(root) {
  z-index: 1;
}
</style>
