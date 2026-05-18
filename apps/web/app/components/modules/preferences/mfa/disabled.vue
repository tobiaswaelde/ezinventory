<template>
  <LayoutPageSettingsSectionEmpty
    class="bg-error/10! border-error/20!"
    highlight
    highlight-color="error"
    icon="i-tabler-shield-off"
    variant="naked"
    button-icon="i-tabler-shield"
    :title="t('modules.preferences.mfa.disabled.alert.title')"
    :description="t('modules.preferences.mfa.disabled.alert.description')"
    :button="t('modules.preferences.mfa.disabled.actions.enable.label')"
    :button-loading="!!setupData"
    @btn-click="handleRequestSecret"
  />

  <UModal
    v-if="setupData"
    :close="false"
    :title="t('modules.preferences.mfa.disabled.actions.enable.label')"
    :open="!!setupData"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <p class="text-muted text-[15px] leading-normal">
        {{ t('modules.preferences.mfa.disabled.setup.alert.title') }}
      </p>

      <div class="my-6 flex flex-row justify-center">
        <img alt="MFA QR Code" class="max-w-xs rounded-xl" :src="setupData.dataUrl" />
      </div>

      <UFormField class="group mt-3" :label="t('modules.preferences.mfa.disabled.setup.fields.secret.label')">
        <UInput :model-value="setupData.secret" readonly>
          <template #trailing>
            <CommonInputsCopyToClipboard :value="setupData.secret" hover />
          </template>
        </UInput>
      </UFormField>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton
          color="error"
          icon="i-tabler-cancel"
          variant="outline"
          :label="t('common.labels.cancel')"
          @click="handleCancel"
        />
        <UButton
          icon="i-tabler-shield-check"
          :label="t('modules.preferences.mfa.disabled.actions.verify')"
          @click="handleEnableMfa"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useOtpModal } from '~/components/common/modals/otp/use-otp-modal';
import { useApi } from '~/composables/api/api';
import { useErrors } from '~/composables/api/errors';
import { useToasts } from '~/composables/app/toasts';
import type { MfaSetupDTO } from '~/types/api/modules/auth';

const { t } = useI18n();
const errors = useErrors();
const toasts = useToasts();

const emit = defineEmits<{
  (e: 'enabled'): void;
}>();

const setupData = ref<MfaSetupDTO | null>(null);
const loading = ref<boolean>(false);

const handleRequestSecret = async () => {
  try {
    loading.value = true;

    const res = await useApi().get<MfaSetupDTO>('/auth/mfa');
    setupData.value = res.data;
  } catch (err) {
    const msg = t('modules.preferences.mfa.disabled.actions.request.error');
    errors.handleError(err, msg);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  setupData.value = null;
};

const handleEnableMfa = async () => {
  try {
    loading.value = true;

    const totp = await useOtpModal();

    await useApi().post('/auth/mfa/enable', {
      secret: setupData.value?.secret,
      totp: totp,
    });

    toasts.success(t('modules.preferences.mfa.disabled.actions.enable.success'));
    emit('enabled');
  } catch (err) {
    const msg = t('modules.preferences.mfa.disabled.actions.enable.error');
    errors.handleError(err, msg);
  } finally {
    loading.value = false;
  }
};
</script>
