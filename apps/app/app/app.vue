<template>
  <NuxtPwaManifest />

  <UApp :toaster="{ position: 'top-center' }">
    <NuxtLoadingIndicator />

    <UMain class="min-h-screen bg-default" @contextmenu.prevent>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>

<script setup lang="ts">
const { initLocale } = useI18n();
const { loadTheme } = useTheme();

onMounted(() => {
  initLocale();
  loadTheme();
});
</script>
