<template>
  <div class="flex flex-col h-full flex-1 items-center justify-center gap-4 p-4">
    <div class="mt-40">
      <UButton
        color="neutral"
        variant="ghost"
        :avatar="{ src: logo, size: 'lg' }"
        label="OpenCRM"
        class="w-full p-2"
        :to="{ name: Routes.Index }"
      />
    </div>

    <UPageCard class="w-full max-w-md">
      <slot></slot>
    </UPageCard>

    <p class="text-muted text-sm">
      {{ t('common.labels.copyright', { year: currentYear }) }}
    </p>

    <ModulesAuthLanguageSelect />
  </div>
</template>

<script setup lang="ts">
import { Routes } from '~/types/routes';
import logo from '~/assets/icon/logo.svg';

const { t } = useI18n();

const currentYear = new Date().getFullYear();
</script>
