<template>
  <UInput
    ref="inputRef"
    type="text"
    leading-icon="i-tabler-search"
    :placeholder="placeholder ?? $t('common.search.placeholder')"
    :disabled="disabled"
    v-model="value"
    class="max-w-32 sm:max-w-40 md:max-w-none"
  >
    <template #trailing>
      <UButton
        v-if="value && value.length > 0"
        variant="link"
        icon="i-tabler-x"
        color="error"
        @click.stop.prevent="value = undefined"
      />
      <div v-else class="hidden sm:flex gap-0.5">
        <UKbd value="/" variant="subtle" />
      </div>
    </template>
  </UInput>
</template>

<script setup lang="ts">
const props = defineProps<{
  placeholder?: string;
  disabled?: boolean;
}>();
const value = defineModel<string>();

const inputRef = useTemplateRef('inputRef');

defineShortcuts({
  '/': () => {
    inputRef.value?.inputRef?.focus();
  },
  'shift_/': () => {
    inputRef.value?.inputRef?.focus();
  },
});
</script>
