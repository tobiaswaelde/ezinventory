import { useAppStore } from '~/store/app';

export interface ReleasesResponse {
  hasUpdate?: boolean;
  installedApiVersion: string | null;
  installedVersion: string | null;
  installedWebVersion: string | null;
  latestReleaseName: string | null;
  latestReleaseUrl: string | null;
  latestVersion: string | null;
  publishedAt: string | null;
  releases: {
    body?: string;
    name: string;
    publishedAt: string;
    url: string;
    version: string;
  }[];
  updateAvailable: boolean;
}

export interface AppReleaseEntry {
  body?: string;
  isInstalled: boolean;
  isLatest: boolean;
  name: string;
  publishedAt: string;
  url: string;
  version: string;
}

export interface AppReleaseMetadata {
  hasUpdate: boolean;
  installedApiVersion: string | null;
  installedVersion: string | null;
  installedWebVersion: string | null;
  latestReleaseName: string | null;
  latestReleaseUrl: string | null;
  latestVersion: string | null;
  publishedAt: string | null;
  releases: AppReleaseEntry[];
}

interface UseAppReleasesOptions {
  immediate?: boolean;
  server?: boolean;
}

function toReleaseMetadata(response: ReleasesResponse | null): AppReleaseMetadata | null {
  if (!response) {
    return null;
  }

  return {
    hasUpdate: response.hasUpdate ?? response.updateAvailable,
    installedApiVersion: response.installedApiVersion,
    installedVersion: response.installedVersion,
    installedWebVersion: response.installedWebVersion,
    latestReleaseName: response.latestReleaseName,
    latestReleaseUrl: response.latestReleaseUrl,
    latestVersion: response.latestVersion,
    publishedAt: response.publishedAt,
    releases: response.releases.map((release) => ({
      ...release,
      isInstalled: release.version === response.installedVersion,
      isLatest: release.version === response.latestVersion,
    })),
  };
}

export const useAppReleases = (options: UseAppReleasesOptions = {}) => {
  const appStore = useAppStore();

  const releases = useFetch<ReleasesResponse>('/api/releases', {
    key: 'app-releases',
    default: () => null,
    immediate: options.immediate,
    server: options.server,
    transform: (response) => {
      appStore.setReleaseMetadata(toReleaseMetadata(response));
      return response;
    },
  });

  return {
    ...releases,
    releaseMetadata: computed(() => appStore.releaseMetadata),
    hasUpdate: computed(() => appStore.hasUpdate),
    latestVersion: computed(() => appStore.latestVersion),
    changelogReleases: computed(() => appStore.releaseMetadata?.releases ?? []),
  };
};
