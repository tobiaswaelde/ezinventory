<template>
  <USelectMenu
    class="w-40"
    :items="items"
    :value-key="'value'"
    :model-value="locale"
    @update:model-value="handleSelectLocale"
  >
    <template #leading="{ modelValue }">
      <img
        :src="availableLocales.find((x) => x.code === modelValue)!.flag"
        alt=""
        class="size-5 object-cover rounded-full"
      />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
import type { SelectMenuItem } from '#ui/types';
import { useLocales } from '~/composables/app/locales';

const { availableLocales, locale, handleSelectLocale } = useLocales();

const items = computed<SelectMenuItem[]>(() =>
  availableLocales.value.map((x) => ({
    value: x.code,
    label: x.name,
    avatar: x.flag ? { src: x.flag, alt: `${x.name} flag` } : undefined,
  })),
);
</script>
