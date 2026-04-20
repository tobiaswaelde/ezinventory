<template>
  <nav class="navbar">
    <button class="nav-btn" @click="$router.push('/')">{{ t('nav_home') }}</button>
    <button class="nav-btn" @click="$router.push('/inventory')">{{ t('nav_inventory') }}</button>
    <button class="nav-btn" @click="$router.push('/labels')">{{ t('nav_labels') }}</button>
    <button class="scan-btn" @click="$router.push('/scan')">{{ t('nav_scan') }}</button>
    <button class="nav-btn" @click="$router.push('/settings')">{{ t('nav_settings') }}</button>
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
