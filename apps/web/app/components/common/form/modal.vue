<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :dismissible="dismissable"
    :close="dismissable"
    :ui="{
      header: 'border-b-0',
      body: 'border-b-0',
    }"
  >
    <template #body="{ close }">
      <slot name="default" :close="close"></slot>
    </template>

    <template #footer>
      <UButton
        variant="outline"
        :icon="props.cancelIcon"
        :label="props.cancelText ?? $t('common.labels.cancel')"
        :color="props.cancelColor"
        :disabled="loading"
        @click="handleClose"
      />
      <UButton
        variant="solid"
        :icon="props.submitIcon"
        :label="props.submitText ?? $t('common.labels.save')"
        :color="props.submitColor"
        :loading="loading"
        :disabled="!isValid"
        @click="handleSubmit"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts" generic="T">
import type { ButtonProps } from '#ui/types';

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    isValid?: boolean;
    submitFn?: () => Promise<T>;
    cancelIcon?: string;
    cancelText?: string;
    cancelColor?: ButtonProps['color'];
    submitIcon?: string;
    submitText?: string;
    submitColor?: ButtonProps['color'];
    dismissable?: boolean;
  }>(),
  {
    isValid: true,
    cancelIcon: 'i-tabler-cancel',
    cancelColor: 'error',
    submitIcon: 'i-tabler-device-floppy',
    submitColor: 'primary',
  },
);
const emit = defineEmits<{
  (e: 'submit:before'): void;
  (e: 'submit:after'): void;
  (e: 'closed'): void;
  (e: 'success', data: T): void;
  (e: 'error', error: any): void;
}>();
defineSlots<{
  default: { close: () => void };
}>();

const open = defineModel<boolean>('open');
const loading = defineModel<boolean>('loading');

watch(open, (value) => {
  if (!value) {
    emit('closed');
  }
});

const handleClose = () => {
  open.value = false;
  emit('closed');
};

const handleSubmit = async () => {
  try {
    emit('submit:before');
    loading.value = true;

    if (props.submitFn) {
      const res = await props.submitFn();
      emit('success', res);
    }

    handleClose();
  } catch (err) {
    emit('error', err);
  } finally {
    loading.value = false;
    emit('submit:after');
  }
};
</script>
