<template>
  <UPageHeader
    :title="title"
    :description="description"
    :ui="{
      root: 'py-4 border-none ',
      container: 'flex flex-col items-center ',
      title: 'text-xl sm:text-2xl text-pretty font-semibold text-highlighted text-center',
      description: 'text-base text-center text-muted text-pretty',
    }"
  />
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>
