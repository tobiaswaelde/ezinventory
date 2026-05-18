<template>
  <UPageCard variant="subtle" :ui="{ header: 'mb-0' }">
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-shield-lock"
        :title="t('modules.preferences.mfa.title')"
        :description="t('modules.preferences.mfa.description')"
      />
    </template>

    <ModulesPreferencesMfaEnabled v-if="isEnabled" @disabled="authStore.getCurrentUser" />
    <ModulesPreferencesMfaDisabled v-else @enabled="authStore.getCurrentUser" />
  </UPageCard>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

const { t } = useI18n();
const authStore = useAuthStore();

const isEnabled = computed(() => authStore.currentUser?.isMfaEnabled);
</script>
