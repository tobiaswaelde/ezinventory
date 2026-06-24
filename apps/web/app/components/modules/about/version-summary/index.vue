<template>
  <UPageCard
    variant="subtle"
    :ui="{
      body: 'grid gap-4 md:grid-cols-3',
    }"
  >
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium text-muted">Version summary</p>
        <h2 class="text-lg font-semibold text-highlighted">Installed and latest</h2>
      </div>
    </template>

    <article
      v-for="item in items"
      :key="item.label"
      class="rounded-xl border border-default/60 bg-default/40 p-4"
    >
      <p class="text-sm font-medium text-muted">{{ item.label }}</p>
      <p class="mt-2 text-xl font-semibold text-highlighted">{{ item.value }}</p>
      <p v-if="item.hint" class="mt-1 text-sm text-muted">{{ item.hint }}</p>
    </article>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    installedApiVersion?: string | null;
    installedWebVersion?: string | null;
    latestReleaseName?: string | null;
    latestVersion?: string | null;
    publishedAt?: string | null;
  }>(),
  {
    installedApiVersion: null,
    installedWebVersion: null,
    latestReleaseName: null,
    latestVersion: null,
    publishedAt: null,
  },
);

const publishedLabel = computed(() => {
  if (!props.publishedAt) {
    return null;
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(props.publishedAt));
});

const items = computed(() => [
  {
    label: 'Installed API',
    value: props.installedApiVersion ?? 'Unavailable',
    hint: 'Reported by the API health endpoint.',
  },
  {
    label: 'Installed Web',
    value: props.installedWebVersion ?? 'Unavailable',
    hint: 'Reported by the deployed web build.',
  },
  {
    label: 'Latest release',
    value: props.latestVersion ?? 'Unavailable',
    hint: props.latestReleaseName ?? publishedLabel.value,
  },
]);
</script>
