<template>
  <div class="mb-4 text-center">
    <h1 class="text-xl font-semibold text-highlighted">{{ title }}</h1>
    <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
  }>(),
  {
    description: ''
  }
);
</script>
