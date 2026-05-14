<template>
  <UPageCard variant="subtle" :ui="{ header: 'mb-0' }">
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-language"
        :title="$t('modules.preferences.language.title')"
        :description="$t('modules.preferences.language.description')"
      />
    </template>

    <CommonInputsSelectLanguage :disabled="loading" v-model="value" class="w-full sm:w-56" />
  </UPageCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
}>();
const value = defineModel<string>();
</script>
