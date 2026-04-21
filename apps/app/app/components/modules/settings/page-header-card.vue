<template>
  <UCard>
    <template #header>
      <h1 class="text-lg font-semibold">Settings</h1>
    </template>

    <p>Authenticated as: <strong>{{ email }}</strong> ({{ role }})</p>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  email: string;
  role: string;
}>();
</script>
