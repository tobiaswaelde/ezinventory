<template>
  <div class="inline-block" ref="wrapperRef">
    <UTooltip :text="confirmed && confirmTooltip ? confirmTooltip : undefined" :disabled="disabled" :open="confirmed">
      <UButton
        :size="size"
        :disabled="disabled"
        :color="confirmed ? (confirmColor ?? color) : color"
        :variant="confirmed ? (confirmVariant ?? variant) : variant"
        :label="confirmed ? (confirmLabel ?? label) : label"
        :icon="confirmed ? confirmIcon : icon"
        @click="handleClick"
      />
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
import type { ButtonProps } from '#ui/types';
import { onClickOutside, useTimeoutFn } from '@vueuse/core';

const props = withDefaults(
  defineProps<{
    color?: ButtonProps['color'];
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
    disabled?: boolean;
    label?: string;
    icon?: string;
    confirmIcon?: string;
    confirmColor?: ButtonProps['color'];
    confirmVariant?: ButtonProps['variant'];
    confirmTooltip?: string;
    confirmLabel?: string;
    timeout?: number;
    onClick?: (e: MouseEvent) => Promise<void> | void;
  }>(),
  {
    confirmIcon: 'i-tabler-check',
    timeout: 2000,
  },
);
const emit = defineEmits<{
  (e: 'click', data: MouseEvent): void;
}>();

const confirmed = ref<boolean>(false);
const wrapperRef = useTemplateRef('wrapperRef');

const { start, stop } = useTimeoutFn(
  () => {
    confirmed.value = false;
  },
  props.timeout,
  { immediate: false },
);

const handleClick = async (e: MouseEvent) => {
  if (confirmed.value) {
    // stop();
    emit('click', e);
    confirmed.value = false;
  } else {
    confirmed.value = true;
    start();
  }
};

onClickOutside(wrapperRef, () => {
  console.log('click outside');
  confirmed.value = false;
  stop();
});
</script>
