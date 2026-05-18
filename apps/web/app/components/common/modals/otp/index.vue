<template>
  <UModal
    v-model:open="modalOpen"
    :title="title ?? $t('common.modals.otp.title')"
    :description="description ?? $t('common.modals.otp.description')"
    :close="false"
    :dismissible="false"
  >
    <template #body>
      <div class="flex items-center justify-center">
        <UInput
          v-model="value"
          autocomplete="one-time-code"
          :placeholder="$t('common.modals.otp.fields.otp.placeholder')"
        />
      </div>
    </template>
    <template #footer>
      <UButton
        color="error"
        icon="i-tabler-cancel"
        variant="outline"
        :label="$t('common.labels.close')"
        @click="handleClose"
      />
      <UButton icon="i-tabler-check" :label="$t('common.labels.submit')" :disabled="!isValid" @click="handleSubmit" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { OtpModalOptions } from './use-otp-modal';

const props = withDefaults(defineProps<OtpModalOptions>(), {
  length: 6,
  autoSubmit: true,
});
const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'submit', value: string): void;
}>();

const modalOpen = ref<boolean>(true);
const model = defineModel<boolean>({ default: true });

const value = ref<string>('');

const isValid = computed(() => value.value.length === props.length && /^\d+$/.test(value.value));

const handleClose = () => {
  modalOpen.value = false;
  emit('cancel');
};
const handleSubmit = () => {
  if (!isValid.value) return;
  modalOpen.value = false;
  emit('submit', value.value);
};
</script>
