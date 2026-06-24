import pjson from '~/../package.json';
import type { AppReleaseMetadata } from '~/composables/app/releases';

export const useAppStore = defineStore('app', () => {
  const version = ref<string>(pjson.version);
  const releaseMetadata = ref<AppReleaseMetadata | null>(null);

  const hasUpdate = computed(() => releaseMetadata.value?.hasUpdate ?? false);
  const installedVersion = computed(() => releaseMetadata.value?.installedVersion ?? null);
  const latestVersion = computed(() => releaseMetadata.value?.latestVersion ?? null);
  const releases = computed(() => releaseMetadata.value?.releases ?? []);

  const setReleaseMetadata = (release: AppReleaseMetadata | null) => {
    releaseMetadata.value = release;
  };

  return {
    hasUpdate,
    installedVersion,
    latestVersion,
    releases,
    releaseMetadata,
    setReleaseMetadata,
    version,
  };
});
