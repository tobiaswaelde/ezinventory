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
        icon="i-tabler-lock"
        :title="$t('modules.preferences.update-password.title')"
        :description="$t('modules.preferences.update-password.description')"
      />
    </template>

    <template #body>
      <UForm ref="formRef" class="grid gap-4 w-full" :schema="updatePasswordSchema" :state="data">
        <UFormField
          name="currentPassword"
          :label="$t('modules.preferences.update-password.fields.current-password.label')"
          required
          class="w-full"
        >
          <CommonInputsPassword v-model="data.currentPassword" autocomplete="current-password" />
        </UFormField>

        <UFormField
          name="newPassword"
          :label="$t('modules.preferences.update-password.fields.new-password.label')"
          required
        >
          <CommonInputsPassword v-model="data.newPassword" autocomplete="new-password" />
        </UFormField>

        <UFormField
          name="confirmPassword"
          :label="$t('modules.preferences.update-password.fields.confirm-password.label')"
          required
        >
          <CommonInputsPassword v-model="data.confirmPassword" autocomplete="new-password" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <CommonButtonsSave :disabled="!isValid || !dirty" :loading="loading" @click="handleSubmit" />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { useOtpModal } from '~/components/common/modals/otp/use-otp-modal';
import { useApi } from '~/composables/api/api';
import { useErrors } from '~/composables/api/errors';
import { useSchema } from '~/composables/api/schema';
import { useToasts } from '~/composables/app/toasts';
import { useFormDirty } from '~/composables/helpers/form-dirty';
import { usePreventLeave } from '~/composables/helpers/prevent-leave';
import { useAuthStore } from '~/store/auth';
import { updatePasswordSchema } from '~/types/api/modules/auth';

const { t } = useI18n();
const errors = useErrors();
const toasts = useToasts();
const authStore = useAuthStore();

const formRef = useTemplateRef('formRef');

const dirty = ref<boolean>(false);
const { data, isValid } = useSchema(updatePasswordSchema);
useFormDirty(formRef, dirty);
usePreventLeave(dirty);

const loading = ref<boolean>(false);
const handleSubmit = async () => {
  try {
    loading.value = true;

    let totp: string | undefined = undefined;
    if (authStore.currentUser?.isMfaEnabled) {
      totp = await useOtpModal();
    }

    const res = await useApi().post('/auth/password/update', {
      currentPassword: data.value.currentPassword,
      newPassword: data.value.newPassword,
      totp: totp,
    });

    toasts.success(t('modules.preferences.update-password.actions.success'));
    dirty.value = false;
  } catch (err) {
    errors.handleError(err, t('modules.preferences.update-password.actions.error'));
  } finally {
    loading.value = false;
  }
};
</script>
