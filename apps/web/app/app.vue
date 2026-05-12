<template>
  <NuxtPwaManifest />

  <UApp :locale="appLocale" :toaster="{ position: 'top-center' }">
    <NuxtLoadingIndicator />

    <UMain @contextmenu.prevent>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>

<script setup lang="ts">
import * as locales from '@nuxt/ui/locale';
import { z } from 'zod/v4';
import { useLocales } from '~/composables/app/locales';
import { useAuthStore } from '~/store/auth';
import { updateDayjsLocale } from '~/util/dayjs';

const { locale } = useI18n();

/** 2-digit lowercase language code */
const lang = computed<string>(() => locale.value.substring(0, 2).toLowerCase());

const appLocale = computed(() => (locales as any)[lang.value] ?? locales['en']);

const updateZodLocale = (locale: string) => {
  // check if locale exists in available zod locales
  if (Object.keys(z.locales).includes(locale)) {
    const l = locale as keyof typeof z.core.locales; // case lang to valid zod locale
    z.config(z.locales[l]());
  } else {
    z.config(z.locales.en());
  }
};

const { handleSelectLocale } = useLocales();
const authStore = useAuthStore();
const currentUser = computed(() => authStore.currentUser);
watch(
  currentUser,
  async () => {
    if (authStore.currentUser) {
      await handleSelectLocale(authStore.currentUser.preferences?.language);
    }
  },
  {
    immediate: true,
  },
);

watch(
  lang,
  () => {
    updateZodLocale(lang.value);
    updateDayjsLocale(lang.value);
  },
  { immediate: true },
);
</script>
