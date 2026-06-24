<template>
  <UAlert
    v-if="latestVersion"
    :color="hasUpdate ? 'warning' : 'success'"
    variant="subtle"
    :icon="hasUpdate ? 'i-tabler-download' : 'i-tabler-rosette-discount-check'"
    :title="hasUpdate ? `Version ${latestVersion} is available` : `Version ${latestVersion} is installed`"
    :description="description"
  >
    <template #actions>
      <UButton
        v-if="latestReleaseUrl"
        color="neutral"
        variant="soft"
        icon="i-tabler-external-link"
        :to="latestReleaseUrl"
        target="_blank"
      >
        Open release
      </UButton>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    hasUpdate?: boolean;
    latestReleaseUrl?: string | null;
    latestVersion?: string | null;
  }>(),
  {
    hasUpdate: false,
    latestReleaseUrl: null,
    latestVersion: null,
  },
);

const description = computed(() =>
  props.hasUpdate
    ? 'Review the release notes and schedule the update when the environment is ready.'
    : 'This environment is already running the latest published release.',
);
</script>
