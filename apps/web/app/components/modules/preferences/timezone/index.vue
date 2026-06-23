<template>
  <UPageCard variant="subtle" :ui="{ header: 'mb-0' }">
    <template #header>
      <LayoutPageCardHeader
        icon="i-tabler-world"
        :title="$t('modules.preferences.timezone.title')"
        :description="$t('modules.preferences.timezone.description')"
      />
    </template>

    <CommonInputsSelectTimezone :disabled="loading" v-model="value" class="w-full sm:w-72" />
  </UPageCard>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();

const value = defineModel<string | undefined>();
</script>
