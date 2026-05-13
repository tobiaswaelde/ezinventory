<template>
  <USelectMenu
    v-model="value"
    class="w-full"
    :avatar="selectMenuItems.find((x) => x.value === value)?.avatar"
    :items="selectMenuItems"
    :value-key="'value'"
    :placeholder="placeholder ?? $t('common.inputs.select-language.placeholder')"
    :required="required"
    :disabled="disabled"
    :icon="icon"
    virtualize
  />
</template>

<script setup lang="ts">
import { useLocales } from '~/composables/app/locales';

const props = defineProps<{
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: any;
}>();
const value = defineModel<string>();

const { selectMenuItems } = useLocales();
</script>
