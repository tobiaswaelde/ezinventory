<template>
  <USelect
    v-model="value"
    :items="items"
    virtualize
    value-key="value"
    label-key="label"
    :required="required"
    :disabled="disabled"
    :placeholder="placeholder ?? $t('common.inputs.select-user-role.placeholder')"
    :clear="!required"
  />
</template>

<script setup lang="ts">
import { useUserRole } from '~/composables/enums/user-role';
import { UserRole } from '~/types/api/enums/user-role';

const props = defineProps<{
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}>();
const value = defineModel<UserRole | undefined>({ default: undefined });
const { getLabel, getIcon } = useUserRole();

const items = computed(() =>
  Object.values(UserRole).map((v) => ({
    value: v,
    label: getLabel(v),
    icon: getIcon(v),
  })),
);
</script>
