<template>
  <UContainer class="flex flex-col items-stretch gap-8">
    <ModulesPreferencesTheme />
    <ModulesPreferencesLanguage :model-value="locale" @update:model-value="handleUpdateLocale" />
  </UContainer>
</template>

<script setup lang="ts">
import { useLocales } from '~/composables/app/locales';
import { useToasts } from '~/composables/app/toasts';
import { buildTitle } from '~/util/app';

const { t } = useI18n();

useHead({
  title: buildTitle(t('modules.preferences.navigation.general.label'), t('core.navbar.user-menu.preferences.label')),
});

const { locale, handleSelectLocale } = useLocales();
const toasts = useToasts();

const loadingLocale = ref<boolean>(false);

const handleUpdateLocale = async (locale?: string) => {
  if (!locale) return;

  try {
    loadingLocale.value = true;
    await handleSelectLocale(locale);

    toasts.success(t('modules.preferences.language.actions.submission.success'));
  } catch (err) {
    toasts.error(t('modules.preferences.language.actions.submission.failure'));
  } finally {
    loadingLocale.value = false;
  }
};
</script>
