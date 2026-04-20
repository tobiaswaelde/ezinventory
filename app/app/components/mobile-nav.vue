<template>
  <nav class="navbar">
    <UButton color="neutral" variant="soft" size="sm" @click="$router.push('/')">{{ t('nav_home') }}</UButton>
    <UButton color="neutral" variant="soft" size="sm" @click="$router.push('/inventory')">{{ t('nav_inventory') }}</UButton>
    <UButton color="neutral" variant="soft" size="sm" @click="$router.push('/labels')">{{ t('nav_labels') }}</UButton>
    <UButton color="primary" variant="solid" size="md" @click="$router.push('/scan')">{{ t('nav_scan') }}</UButton>
    <UButton color="neutral" variant="soft" size="sm" @click="$router.push('/settings')">{{ t('nav_settings') }}</UButton>
    <select v-model="locale" class="locale-select" @change="onLocaleChange">
      <option value="en">EN</option>
      <option value="de">DE</option>
    </select>
  </nav>
</template>

<script setup lang="ts">
const { initLocale, locale, setLocale, t } = useI18n();

onMounted(() => {
  initLocale();
});

const onLocaleChange = async (): Promise<void> => {
  await setLocale(locale.value);
};
</script>
