<template>
  <UBadge :color="color ?? roleColor" :label="label" :variant="variant" :size="size" :icon="icon" />
</template>

<script setup lang="ts">
import type { BadgeProps } from '#ui/types';
import { useUserRole } from '~/composables/enums/user-role';
import { UserRole } from '~/types/api/enums/user-role';

const props = withDefaults(
  defineProps<{
    value: UserRole;
    variant?: BadgeProps['variant'];
    size?: BadgeProps['size'];
    color?: BadgeProps['color'];
  }>(),
  {
    variant: 'subtle',
  },
);

const value = toRef(props, 'value');
const { label, color: roleColor, icon } = useUserRole(value);
</script>
