<template>
  <UPageCard variant="subtle" :ui="{ body: 'space-y-4', footer: 'flex justify-end w-full' }">
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-shield-lock"
        :title="t('modules.users.security.mfa.title')"
        :description="t('modules.users.security.mfa.description')"
      />
    </template>

    <template #body>
      <UAlert
        :color="isEnabled ? 'success' : 'neutral'"
        variant="subtle"
        :icon="isEnabled ? 'i-tabler-shield-check' : 'i-tabler-shield-off'"
        :title="
          isEnabled
            ? t('modules.users.security.mfa.enabled.alert.title')
            : t('modules.users.security.mfa.disabled.alert.title')
        "
        :description="
          isEnabled
            ? t('modules.users.security.mfa.enabled.alert.description')
            : t('modules.users.security.mfa.disabled.alert.description')
        "
      />
    </template>

    <template #footer>
      <UButton
        v-if="isEnabled"
        color="error"
        variant="outline"
        icon="i-tabler-shield-off"
        :label="t('modules.users.security.mfa.enabled.actions.disable')"
        :loading="loading"
        @click="handleDisable"
      />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/api/api';
import { useErrors } from '~/composables/api/errors';
import { useToasts } from '~/composables/app/toasts';
import { UserContextKey } from '~/types/symbols/user';
import { injectStrict } from '~/util/inject-strict';

const props = defineProps<{
  userId: string;
  isEnabled?: boolean;
}>();

const { t } = useI18n();
const errors = useErrors();
const toasts = useToasts();
const { refresh } = injectStrict(UserContextKey);

const loading = ref<boolean>(false);

const handleDisable = async () => {
  try {
    loading.value = true;

    await useApi().post(`/users/${props.userId}/mfa/disable`);
    await refresh();

    toasts.success(t('modules.users.security.mfa.enabled.actions.success'));
  } catch (err) {
    errors.handleError(err, t('modules.users.security.mfa.enabled.actions.error'));
  } finally {
    loading.value = false;
  }
};
</script>
