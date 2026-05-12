<template>
  <UNavigationMenu orientation="vertical" tooltip popover :collapsed="collapsed" :items="items" />
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { useAppStore } from '~/store/app';
import { Routes } from '~/types/routes';

const GITHUB_URL = 'https://github.com/tobiaswaelde/ezinventory';
const REPORT_BUG_URL = 'https://github.com/tobiaswaelde/ezinventory/issues';

const appStore = useAppStore();
const { t } = useI18n();

const props = defineProps<{
  collapsed?: boolean;
}>();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('core.sidebar.footer.about.label'),
    icon: 'i-tabler-info-circle',
    to: { name: Routes.About },
    badge: {
      label: appStore.version,
      color: 'neutral',
    },
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
