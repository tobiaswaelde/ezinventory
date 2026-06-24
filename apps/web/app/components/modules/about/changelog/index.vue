<template>
  <UPageCard
    variant="subtle"
    :ui="{
      body: 'space-y-6',
    }"
  >
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium text-muted">Release timeline</p>
        <h2 class="text-lg font-semibold text-highlighted">Recent versions</h2>
      </div>
    </template>

    <UChangelogVersions :indicator="versions.length > 1">
      <UChangelogVersion
        v-for="version in versions"
        :key="version.version"
        :title="version.name"
        :date="version.publishedAt"
        :badge="version.version"
        :to="version.url"
        target="_blank"
      >
        <template #body>
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-if="version.isInstalled"
                label="Installed"
                color="warning"
                variant="soft"
              />
              <UBadge
                v-if="version.isLatest"
                label="Latest"
                color="neutral"
                variant="soft"
              />
            </div>

            <div
              v-if="version.body"
              class="prose prose-sm max-w-none text-default dark:prose-invert"
              v-html="renderBody(version.body)"
            />
          </div>
        </template>
      </UChangelogVersion>
    </UChangelogVersions>
  </UPageCard>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import type { AppReleaseEntry } from '~/composables/app/releases';

const props = withDefaults(
  defineProps<{
    versions?: AppReleaseEntry[];
  }>(),
  {
    versions: () => [],
  },
);

const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
});

const renderBody = (body: string) => markdown.render(body);
</script>
