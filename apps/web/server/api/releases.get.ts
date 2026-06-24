import { buildReleaseStatus, fetchReleaseStatus } from '../utils/releases/service';

interface ApiHealthPayload {
  version?: string | null;
}

async function fetchInstalledApiVersion(apiBaseUrl: string | null | undefined): Promise<string | null> {
  if (!apiBaseUrl) {
    return null;
  }

  try {
    const health = await $fetch<ApiHealthPayload>('/api/v1/health', {
      baseURL: apiBaseUrl,
    });

    return typeof health?.version === 'string' && health.version.trim() ? health.version.trim() : null;
  } catch {
    return null;
  }
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const installedWebVersion = config.public.APP_VERSION || null;
  const installedApiVersion = await fetchInstalledApiVersion(config.public.API_BASE_URL);

  try {
    const status = await fetchReleaseStatus({
      installedVersion: installedApiVersion,
      owner: config.githubRepoOwner,
      repo: config.githubRepoName,
      token: config.githubToken,
    });

    return {
      ...status,
      hasUpdate: status.updateAvailable,
      installedApiVersion,
      installedWebVersion,
    };
  } catch {
    const status = buildReleaseStatus({
      installedVersion: installedApiVersion,
      releases: [],
    });

    return {
      ...status,
      hasUpdate: status.updateAvailable,
      installedApiVersion,
      installedWebVersion,
    };
  }
});
