<template>
  <UContainer class="flex flex-col items-stretch gap-8">
    <ModulesUsersPreferencesProfile v-if="user.profile" :profile="user.profile" :user-id="userId" />
    <ModulesUsersPreferencesAvatar v-if="user.profile" :profile="user.profile" :user-id="userId" />
  </UContainer>
</template>

<script setup lang="ts">
import { useRouteParams } from '@vueuse/router';
import { UserContextKey } from '~/types/symbols/user';
import { injectStrict } from '~/util/inject-strict';

const userId = useRouteParams<string>('id');
const { user } = injectStrict(UserContextKey);
</script>
