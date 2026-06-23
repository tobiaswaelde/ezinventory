<template>
  <div class="grid gap-8">
    <UPageCard
      variant="subtle"
      :ui="{
        footer: 'flex flex-row justify-end w-full',
        body: 'w-full',
      }"
    >
      <template #header>
        <LayoutPageCardHeader
          icon="i-tabler-language"
          :title="$t('modules.preferences.language.title')"
          :description="$t('modules.preferences.language.description')"
        />
      </template>

      <template #body>
        <UFormField name="language" :label="$t('modules.users.fields.preferences.language')">
          <CommonInputsSelectLanguage v-model="language" class="w-full sm:w-72" />
        </UFormField>
      </template>

      <template #footer>
        <CommonButtonsSave :disabled="!languageDirty" :loading="loadingLanguage" @click="handleSaveLanguage" />
      </template>
    </UPageCard>

    <UPageCard
      variant="subtle"
      :ui="{
        footer: 'flex flex-row justify-end w-full',
        body: 'w-full',
      }"
    >
      <template #header>
        <LayoutPageCardHeader
          icon="i-tabler-world"
          :title="$t('modules.preferences.timezone.title')"
          :description="$t('modules.preferences.timezone.description')"
        />
      </template>

      <template #body>
        <UFormField name="timezone" :label="$t('modules.users.fields.preferences.timezone')">
          <CommonInputsSelectTimezone v-model="timezone" class="w-full sm:w-72" />
        </UFormField>
      </template>

      <template #footer>
        <CommonButtonsSave :disabled="!timezoneDirty" :loading="loadingTimezone" @click="handleSaveTimezone" />
      </template>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/api/api';
import { useToasts } from '~/composables/app/toasts';
import type { UserPreferencesDTO } from '~/types/api/modules/user-preferences';
import { UserContextKey } from '~/types/symbols/user';
import { injectStrict } from '~/util/inject-strict';

const props = defineProps<{
  userId: string;
  preferences: UserPreferencesDTO;
}>();

const { t } = useI18n();
const toasts = useToasts();
const { refresh } = injectStrict(UserContextKey);

const language = ref<string>(props.preferences.language);
const timezone = ref<string | undefined>(props.preferences.timezone);
const loadingLanguage = ref<boolean>(false);
const loadingTimezone = ref<boolean>(false);

watch(
  () => props.preferences,
  (value) => {
    language.value = value.language;
    timezone.value = value.timezone;
  },
  { immediate: true, deep: true },
);

const languageDirty = computed(() => language.value !== props.preferences.language);
const timezoneDirty = computed(() => timezone.value !== props.preferences.timezone);

const handleSaveLanguage = async () => {
  if (!languageDirty.value) return;

  try {
    loadingLanguage.value = true;

    await useApi().patch(`/users/${props.userId}/preferences`, { language: language.value });
    await refresh();

    toasts.success(t('modules.users.preferences.general.form.actions.success'));
  } catch (err) {
    toasts.error(t('modules.users.preferences.general.form.actions.error'));
  } finally {
    loadingLanguage.value = false;
  }
};

const handleSaveTimezone = async () => {
  if (!timezoneDirty.value) return;

  try {
    loadingTimezone.value = true;

    await useApi().patch(`/users/${props.userId}/preferences`, { timezone: timezone.value });
    await refresh();

    toasts.success(t('modules.users.preferences.general.form.actions.success'));
  } catch (err) {
    toasts.error(t('modules.users.preferences.general.form.actions.error'));
  } finally {
    loadingTimezone.value = false;
  }
};
</script>
