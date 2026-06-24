<template>
  <UNavigationMenu orientation="vertical" tooltip popover :collapsed="collapsed" :items="items" />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAppReleases } from '~/composables/app/releases';
import type { NavigationMenuItem } from '@nuxt/ui';
import { useAppStore } from '~/store/app';
import { Routes } from '~/types/routes';

const GITHUB_URL = 'https://github.com/tobiaswaelde/ezinventory';
const REPORT_BUG_URL = 'https://github.com/tobiaswaelde/ezinventory/issues';

const appStore = useAppStore();
const { execute } = useAppReleases({
  immediate: false,
  server: false,
});
const { t } = useI18n();

const props = defineProps<{
  collapsed?: boolean;
}>();

onMounted(() => {
  if (!appStore.releaseMetadata) {
    void execute();
  }
});

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('core.sidebar.footer.about.label'),
    icon: 'i-tabler-info-circle',
    to: { name: Routes.About },
    badge: {
      label: appStore.installedVersion ?? appStore.version,
      color: 'neutral',
    },
    chip: appStore.hasUpdate ? { color: 'error' } : undefined,
  },
  {
    label: t('core.sidebar.footer.github.label'),
    icon: 'i-tabler-brand-github',
    href: GITHUB_URL,
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  {
    label: t('core.sidebar.footer.report-bug.label'),
    icon: 'i-tabler-bug',
    href: REPORT_BUG_URL,
    target: '_blank',
    rel: 'noopener noreferrer',
  },
]);
</script>
