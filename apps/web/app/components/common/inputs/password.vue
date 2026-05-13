<template>
  <UInput
    v-model:model-value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :loading="loading"
    :autofocus="autofocus"
    :autocomplete="autocomplete"
    :type="inputType"
    :ui="{ trailing: 'pe-1' }"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="showPassword ? 'i-tabler-eye-off' : 'i-tabler-eye'"
        :aria-label="showPassword ? $t('common.inputs.password.hide') : $t('common.inputs.password.show')"
        :aria-pressed="showPassword"
        aria-controls="password"
        @click="showPassword = !showPassword"
        tabindex="-1"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
const props = defineProps<{
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  autofocus?: boolean;
  autocomplete?: string;
  minlength?: number;
  maxlength?: number;
}>();
const value = defineModel<string>();

const showPassword = ref<boolean>(false);
const inputType = computed(() => (showPassword.value ? 'text' : 'password'));
</script>

<style>
/* Hide the password reveal button in Edge */
::-ms-reveal {
  display: none;
}
</style>
