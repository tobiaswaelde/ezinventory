<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const { initLocale, locale, setLocale, t } = useI18n();
const { theme, loadTheme, setTheme } = useTheme();

const localeOptions = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' }
] as const;

const navItems = [
  { to: '/', icon: 'i-lucide-house', label: 'Home' },
  { to: '/inventory', icon: 'i-lucide-boxes', label: 'Inventory' },
  { to: '/labels', icon: 'i-lucide-sticker', label: 'Labels' },
  { to: '/scan', icon: 'i-lucide-scan-line', label: 'Scan' },
  { to: '/settings', icon: 'i-lucide-settings', label: 'Settings' }
] as const;

onMounted(() => {
  initLocale();
  loadTheme();
});

const onLocaleChange = async (nextLocale: string): Promise<void> => {
  await setLocale(nextLocale as 'en' | 'de');
};

const isActive = (to: string): boolean => route.path === to;
</script>

<template>
  <aside class="dashboard-sidebar">
    <div class="sidebar-header">
      <p class="sidebar-kicker">Nuxt UI Dashboard</p>
      <h1>EZ Inventory</h1>
      <small>OpenAPI-driven inventory system</small>
    </div>

    <nav class="sidebar-nav">
      <UButton
        v-for="item in navItems"
        :key="item.to"
        :icon="item.icon"
        :variant="isActive(item.to) ? 'solid' : 'ghost'"
        :color="item.to === '/scan' ? 'primary' : 'neutral'"
        class="sidebar-nav-item"
        @click="router.push(item.to)"
      >
        {{ item.label }}
      </UButton>
    </nav>

    <div class="sidebar-controls">
      <div class="field">
        <label>{{ t('nav_settings') }} Language</label>
        <USelect
          :model-value="locale"
          :options="localeOptions"
          option-attribute="label"
          value-attribute="value"
          @update:model-value="onLocaleChange"
        />
      </div>

      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-palette"
        class="sidebar-nav-item"
        @click="setTheme(theme === 'light' ? 'dark' : 'light')"
      >
        Theme: {{ theme }}
      </UButton>
    </div>
  </aside>
</template>
