<template>
  <UTooltip>
    <template #default>
      <UButton :label="label" icon="i-tabler-plus" :to="to" @click="$emit('click', $event)" />
    </template>
    <template #content> <UKbd value="shift" /> + <UKbd value="N" /> </template>
  </UTooltip>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import type { RouteLocationRaw } from 'vue-router';

const { t } = useI18n();

const props = defineProps<{
  disabled?: boolean;
  to?: RouteLocationRaw;
}>();
const emit = defineEmits<{
  (e: 'click', value?: MouseEvent): void;
}>();

defineShortcuts({
  shift_n: () => {
    emit('click');

    if (props.to) {
      navigateTo(props.to);
    }
  },
});

const bp = useBreakpoints(breakpointsTailwind);

const label = computed<string | undefined>(() => {
  if (bp.greaterOrEqual('sm').value) {
    return t('common.labels.new');
  }
  return undefined;
});
</script>
