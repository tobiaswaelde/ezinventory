<template>
  <UButton
    color="neutral"
    type="submit"
    icon="i-tabler:device-floppy"
    :label="$t('common.labels.save')"
    :disabled="disabled"
    :loading="loading"
    @click="$emit('click', $event)"
  />
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  loading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'click', data: MouseEvent): void;
}>();
</script>
