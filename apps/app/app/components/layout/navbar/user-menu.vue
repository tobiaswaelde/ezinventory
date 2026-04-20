<template>
  <div class="flex items-center gap-2">
    <USelect
      :model-value="locale"
      :items="localeOptions"
      label-key="label"
      value-key="value"
      class="w-28"
      @update:model-value="(value) => setLocale(value as 'en' | 'de')"
    />

    <UDropdownMenu :items="themeItems">
      <UButton color="neutral" variant="ghost" icon="i-tabler-palette" />
    </UDropdownMenu>

    <UButton
      v-if="isAuthenticated"
      color="neutral"
      variant="ghost"
      icon="i-tabler-logout"
      @click="onLogout"
    >
      <span class="hidden md:inline">{{ user?.displayName || t('nav_settings') }}</span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale, t } = useI18n();
const { theme, setTheme } = useTheme();
const { user, logout, isAuthenticated } = useAuth();

const localeOptions = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' }
] as const;

const themeItems = computed(() => [
  {
    label: theme.value === 'light' ? 'Switch to dark' : 'Switch to light',
    icon: theme.value === 'light' ? 'i-tabler-moon' : 'i-tabler-sun',
    onSelect: () => setTheme(theme.value === 'light' ? 'dark' : 'light')
  }
]);

const onLogout = async (): Promise<void> => {
  await logout();
  await navigateTo('/');
};
</script>

