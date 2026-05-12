<template>
  <ModulesAuthSigninForm />
</template>

<script setup lang="ts">
const { t } = useI18n();

useHead({ title: t('pages.auth.signin.title') });
</script>
