<template>
  <nav class="navbar">
    <UButton color="neutral" variant="soft" size="sm" @click="$router.push('/')">{{ t('nav_home') }}</UButton>
    <UButton color="neutral" variant="soft" size="sm" @click="$router.push('/inventory')">{{ t('nav_inventory') }}</UButton>
    <UButton color="neutral" variant="soft" size="sm" @click="$router.push('/labels')">{{ t('nav_labels') }}</UButton>
    <UButton color="primary" variant="solid" size="md" @click="$router.push('/scan')">{{ t('nav_scan') }}</UButton>
    <UButton color="neutral" variant="soft" size="sm" @click="$router.push('/settings')">{{ t('nav_settings') }}</UButton>
    <USelect
      class="locale-select"
      :model-value="locale"
      :options="localeOptions"
      option-attribute="label"
      value-attribute="value"
      @update:model-value="onLocaleChange"
    />
  </nav>
</template>

<script setup lang="ts">
const { initLocale, locale, setLocale, t } = useI18n();
const localeOptions = [
  { label: 'EN', value: 'en' },
  { label: 'DE', value: 'de' }
] as const;

onMounted(() => {
  initLocale();
});

const onLocaleChange = async (nextLocale: string): Promise<void> => {
  await setLocale(nextLocale as 'en' | 'de');
};
</script>
