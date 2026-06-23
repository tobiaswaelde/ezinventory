<template>
  <UContainer class="flex flex-col items-stretch gap-8">
    <ModulesUsersSecurityPassword :user-id="userId" />
    <ModulesUsersSecurityMfa :is-enabled="user.isMfaEnabled" :user-id="userId" />
  </UContainer>
</template>

<script setup lang="ts">
import { useRouteParams } from '@vueuse/router';
import { UserContextKey } from '~/types/symbols/user';
import { buildTitle } from '~/util/app';
import { injectStrict } from '~/util/inject-strict';

const { t } = useI18n();
const userId = useRouteParams<string>('id');
const { user } = injectStrict(UserContextKey);

useHead({
  title: buildTitle(t('modules.users.details.navigation.security'), t('modules.users.details.navigation.title')),
});
</script>
