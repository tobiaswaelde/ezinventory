<template>
  <UContainer class="flex flex-col items-stretch gap-8">
    <ModulesUsersPreferencesProfile v-if="user.profile" :profile="user.profile" />
    users -> profile
    <pre>{{ user }}</pre>
  </UContainer>
</template>

<script setup lang="ts">
import { UserContextKey } from '~/types/symbols/user';
import { injectStrict } from '~/util/inject-strict';

const { user } = injectStrict(UserContextKey);
</script>
