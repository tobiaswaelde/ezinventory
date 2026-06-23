<template>
  <UContainer class="flex flex-col items-stretch gap-8">
    <ModulesPreferencesTheme />
    <ModulesPreferencesLanguage :model-value="locale" @update:model-value="handleUpdateLocale" />
    <ModulesPreferencesTimezone
      v-model="timezone"
      :loading="loadingTimezone"
      @update:model-value="handleUpdateTimezone"
    />
  </UContainer>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/api/api';
import { useLocales } from '~/composables/app/locales';
import { useToasts } from '~/composables/app/toasts';
import { useAuthStore } from '~/store/auth';
import { buildTitle } from '~/util/app';

const { t } = useI18n();
const authStore = useAuthStore();

useHead({
  title: buildTitle(t('modules.preferences.navigation.general.label'), t('core.navbar.user-menu.preferences.label')),
});

const { locale, handleSelectLocale } = useLocales();
const toasts = useToasts();

const loadingLocale = ref<boolean>(false);
const loadingTimezone = ref<boolean>(false);
const timezone = ref<string | undefined>(authStore.currentUser?.preferences?.timezone);

watch(
  () => authStore.currentUser?.preferences?.timezone,
  (value) => {
    timezone.value = value;
  },
  { immediate: true },
);

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

const handleUpdateTimezone = async (value?: string) => {
  if (!value || value === authStore.currentUser?.preferences?.timezone) return;

  const previousTimezone = timezone.value;

  try {
    loadingTimezone.value = true;

    await useApi().patch('/users/me/preferences', { timezone: value });
    await authStore.getCurrentUser();

    toasts.success(t('modules.preferences.timezone.actions.submission.success'));
  } catch (err) {
    timezone.value = previousTimezone;
    toasts.error(t('modules.preferences.timezone.actions.submission.failure'));
  } finally {
    loadingTimezone.value = false;
  }
};
</script>
