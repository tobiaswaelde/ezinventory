<template>
  <div class="min-h-screen bg-default">
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { initLocale } = useI18n();
const { loadTheme } = useTheme();

onMounted(() => {
  initLocale();
  loadTheme();
});
</script>
