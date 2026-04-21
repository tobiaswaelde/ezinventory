<template>
  <USelect
    v-model="selectedLocale"
    class="w-36"
    :items="localeItems"
    label-key="label"
    value-key="value"
    size="xs"
  />
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n();

const localeItems = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' }
] as const;

const selectedLocale = computed({
  get: () => locale.value,
  set: async (value: 'en' | 'de') => {
    await setLocale(value);
  }
});
</script>
