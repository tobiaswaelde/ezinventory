<template>
  <UDashboardPanel id="about">
    <template #header>
      <LayoutNavbar :title="$t('core.sidebar.footer.about.label')" />
    </template>

    <template #body>
      <div class="space-y-6">
        <ModulesAboutUpdateAlert
          :has-update="Boolean(releaseMetadata?.hasUpdate)"
          :latest-release-url="releaseMetadata?.latestReleaseUrl"
          :latest-version="releaseMetadata?.latestVersion"
        />

        <ModulesAboutVersionSummary
          :installed-api-version="releaseMetadata?.installedApiVersion"
          :installed-web-version="releaseMetadata?.installedWebVersion"
          :latest-release-name="releaseMetadata?.latestReleaseName"
          :latest-version="releaseMetadata?.latestVersion"
          :published-at="releaseMetadata?.publishedAt"
        />

        <ModulesAboutChangelog
          :versions="releaseMetadata?.releases ?? []"
        />

        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-tabler-alert-circle"
          title="Release metadata is unavailable"
          description="The About page could not load the current release status."
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppReleases } from '~/composables/app/releases';

const { error, releaseMetadata } = useAppReleases();
</script>
