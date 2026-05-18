<template>
  <UAlert
    color="success"
    variant="subtle"
    icon="i-tabler-shield-check"
    :title="t('modules.preferences.mfa.enabled.alert.title')"
  />

  <div class="flex justify-end">
    <UButton
      color="error"
      variant="outline"
      icon="i-tabler-shield-off"
      :label="t('modules.preferences.mfa.enabled.actions.disable')"
      :loading="loading"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import { useOtpModal } from '~/components/common/modals/otp/use-otp-modal';
import { useApi } from '~/composables/api/api';
import { useErrors } from '~/composables/api/errors';
import { useToasts } from '~/composables/app/toasts';

const { t } = useI18n();
const errors = useErrors();
const toasts = useToasts();

const emit = defineEmits<{
  (e: 'disabled'): void;
}>();

const loading = ref<boolean>(false);

const handleClick = async () => {
  try {
    loading.value = true;

    const totp = await useOtpModal();

    await useApi().post('/auth/mfa/disable', {
      totp: totp,
    });

    toasts.success(t('modules.preferences.mfa.enabled.actions.success'));
    emit('disabled');
  } catch (err) {
    const msg = t('modules.preferences.mfa.enabled.actions.error');
    errors.handleError(err, msg);
  } finally {
    loading.value = false;
  }
};
</script>
