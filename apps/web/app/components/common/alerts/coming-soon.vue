<template>
  <UAlert
    :variant="variant"
    :color="color"
    :icon="icon"
    :title="title ?? t('common.alerts.coming-soon.title')"
    :description="description ?? t('common.alerts.coming-soon.description')"
  />
</template>

<script setup lang="ts">
import type { AlertProps } from '#ui/types';

const { t } = useI18n();

withDefaults(
  defineProps<{
    variant?: AlertProps['variant'];
    color?: AlertProps['color'];
    icon?: string;
    title?: string;
    description?: string;
  }>(),
  {
    icon: 'i-tabler-rocket',
    variant: 'subtle',
    color: 'warning',
  },
);
</script>
