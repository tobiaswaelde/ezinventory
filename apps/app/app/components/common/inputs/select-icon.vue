<template>
  <USelectMenu
    v-model="value"
    :items="items"
    virtualize
    value-key="value"
    label-key="label"
    :icon="value"
    :required="required"
    :disabled="disabled"
    :placeholder="placeholder"
    :clear="!required"
  >
    <template #item-leading="{ item }">
      <UIcon
        v-if="item.icon"
        :name="item.icon"
        class="size-5 shrink-0 text-dimmed group-data-highlighted:not-group-data-disabled:text-default transition-colors"
      />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import { icons } from '@iconify-json/tabler';

const props = withDefaults(
  defineProps<{
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    required: false,
    placeholder: 'Select icon',
    disabled: false
  }
);

const value = defineModel<string | undefined>({ default: undefined });

type Item = {
  value: string;
  icon: string;
  label: string;
};

const iconNames = Object.keys(icons.icons).toSorted();

const items = computed<Item[]>(() =>
  iconNames.map((iconName) => ({
    value: `i-tabler-${iconName}`,
    icon: `i-tabler-${iconName}`,
    label: iconName
  }))
);
</script>
