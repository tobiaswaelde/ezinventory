<template>
  <UTooltip :text="$t('common.inputs.copy-to-clipboard.tooltip')">
    <UButton
      variant="link"
      size="sm"
      :aria-label="$t('common.inputs.copy-to-clipboard.tooltip')"
      :color="copied ? 'success' : 'neutral'"
      :trailing-icon="copied ? 'i-tabler-copy-check' : 'i-tabler-copy'"
      :class="{
        'opacity-0 transition-all duration-200 group-hover:opacity-100': hover,
        'opacity-100': copied,
      }"
      @click="copy(value)"
      :label="label"
    />
  </UTooltip>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core';

defineProps<{ value: string; label?: string; hover?: boolean }>();

const { copy, copied } = useClipboard();
</script>
