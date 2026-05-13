<template>
  <UBadge v-if="locale" :color="color" :label="label" :variant="variant" :size="size">
    <template #leading>
      <UAvatar v-if="flag" :src="flag" :alt="label" size="3xs" />
    </template>
  </UBadge>
</template>

<script setup lang="ts">
import type { BadgeProps } from '#ui/types';
import { useLocales } from '~/composables/app/locales';
import { useUserRole } from '~/composables/enums/user-role';
import { UserRole } from '~/types/api/enums/user-role';

const props = withDefaults(
  defineProps<{
    value: string;
    variant?: BadgeProps['variant'];
    size?: BadgeProps['size'];
    color?: BadgeProps['color'];
  }>(),
  {
    variant: 'subtle',
  },
);

const value = toRef(props, 'value');

const { availableLocales } = useLocales();
const locale = computed(() => availableLocales.value.find((x) => x.code === value.value));

const label = computed(() => locale.value?.name);
const flag = computed(() => locale.value?.flag);
</script>
