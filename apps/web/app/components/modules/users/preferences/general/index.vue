<template>
  <UPageCard
    variant="subtle"
    :ui="{
      footer: 'flex flex-row justify-end w-full',
      body: 'w-full',
    }"
  >
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-settings"
        :title="$t('modules.users.preferences.general.title')"
        :description="$t('modules.users.preferences.general.description')"
      />
    </template>

    <template #body>
      <UForm ref="formRef" :schema="updateUserPreferencesSchema" :state="data" class="grid gap-4 md:grid-cols-2">
        <UFormField name="language" :label="$t('modules.users.fields.preferences.language')">
          <CommonInputsSelectLanguage v-model="data.language" />
        </UFormField>

        <UFormField name="timezone" :label="$t('modules.users.fields.preferences.timezone')">
          <CommonInputsSelectTimezone v-model="data.timezone" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <CommonButtonsSave :disabled="!isValid || !dirty" :loading="loading" @click="handleSave" />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/api/api';
import { useSchema } from '~/composables/api/schema';
import { useToasts } from '~/composables/app/toasts';
import { useFormDirty } from '~/composables/helpers/form-dirty';
import { usePreventLeave } from '~/composables/helpers/prevent-leave';
import {
  updateUserPreferencesSchema,
  type UserPreferencesDTO,
} from '~/types/api/modules/user-preferences';
import { UserContextKey } from '~/types/symbols/user';
import { injectStrict } from '~/util/inject-strict';

const props = defineProps<{
  userId: string;
  preferences: UserPreferencesDTO;
}>();

const { t } = useI18n();
const toasts = useToasts();
const { refresh } = injectStrict(UserContextKey);

const formRef = useTemplateRef('formRef');
const dirty = ref<boolean>(false);
useFormDirty(formRef, dirty);
usePreventLeave(dirty);

const loading = ref<boolean>(false);
const { data, isValid } = useSchema(updateUserPreferencesSchema, () => ({
  language: props.preferences.language,
  timezone: props.preferences.timezone,
}));

const handleSave = async () => {
  if (!data.value) return;

  try {
    loading.value = true;

    await useApi().patch(`/users/${props.userId}/preferences`, data.value);
    await refresh();

    data.value = updateUserPreferencesSchema.parse({
      language: props.preferences.language,
      timezone: props.preferences.timezone,
    });
    dirty.value = false;

    toasts.success(t('modules.users.preferences.general.form.actions.success'));
  } catch (err) {
    toasts.error(t('modules.users.preferences.general.form.actions.error'));
  } finally {
    loading.value = false;
  }
};
</script>
