<template>
  <UDropdownMenu v-if="isAuthenticated" :items="items" :ui="{ content: 'w-56' }">
    <UUser
      class="cursor-pointer"
      :ui="{ name: 'truncate' }"
      :name="userName"
      :description="user?.email"
      :avatar="{ text: initials }"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types';

const { t, locale, setLocale } = useI18n();
const { theme, setTheme } = useTheme();
const { user, logout, isAuthenticated } = useAuth();

const localeItems = computed<DropdownMenuItem[]>(() => [
  {
    type: 'checkbox',
    label: 'English',
    icon: 'i-tabler-language',
    checked: locale.value === 'en',
    onSelect: async (event) => {
      event.preventDefault();
      await setLocale('en');
    }
  },
  {
    type: 'checkbox',
    label: 'Deutsch',
    icon: 'i-tabler-language',
    checked: locale.value === 'de',
    onSelect: async (event) => {
      event.preventDefault();
      await setLocale('de');
    }
  }
]);

const themeItems = computed<DropdownMenuItem[]>(() => [
  {
    type: 'checkbox',
    label: 'Light',
    icon: 'i-tabler-sun',
    checked: theme.value === 'light',
    onSelect: (event) => {
      event.preventDefault();
      setTheme('light');
    }
  },
  {
    type: 'checkbox',
    label: 'Dark',
    icon: 'i-tabler-moon',
    checked: theme.value === 'dark',
    onSelect: (event) => {
      event.preventDefault();
      setTheme('dark');
    }
  }
]);

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: 'Language',
    icon: 'i-tabler-language',
    children: localeItems.value
  },
  {
    label: 'Theme',
    icon: 'i-tabler-palette',
    children: themeItems.value
  },
  {
    label: t('nav_settings'),
    icon: 'i-tabler-settings',
    to: '/settings'
  },
  { type: 'separator' },
  {
    label: 'Sign out',
    icon: 'i-tabler-logout',
    color: 'error',
    onSelect: async () => {
      await logout();
      await navigateTo('/auth/signin');
    }
  }
]);

const userName = computed(() => user.value?.displayName || user.value?.email || 'User');

const initials = computed(() => {
  const name = userName.value;
  if (!name) return 'U';

  const parts = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '');

  if (parts.length === 0) {
    return name.charAt(0).toUpperCase();
  }

  return parts.join('');
});
</script>
