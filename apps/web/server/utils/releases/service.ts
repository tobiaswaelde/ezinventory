import { fetchGithubReleases, normalizeReleaseVersion } from './github';
import { getCachedValue, getStaleCachedValue, setCachedValue } from './cache';
import type { ReleaseEntry, ReleaseStatus } from './types';

const DEFAULT_RELEASES_CACHE_TTL_MS = 5 * 60 * 1000;

interface BuildReleaseStatusOptions {
  installedVersion: string | null;
  releases: ReleaseEntry[];
}

interface FetchReleaseStatusOptions {
  installedVersion: string | null;
  owner: string;
  repo: string;
  token?: string;
  cacheTtlMs?: number;
}

function toSemverParts(version: string | null | undefined): [number, number, number] | null {
  const normalizedVersion = normalizeReleaseVersion(version);

  if (!normalizedVersion) {
    return null;
  }

  const parts = normalizedVersion.split('.').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function getLatestRelease(releases: ReleaseEntry[]): ReleaseEntry | null {
  return [...releases].sort((left, right) => compareReleaseVersions(right.version, left.version))[0] ?? null;
}

function sortReleases(releases: ReleaseEntry[]): ReleaseEntry[] {
  return [...releases].sort((left, right) => compareReleaseVersions(right.version, left.version));
}

function createCacheKey({ owner, repo }: Pick<FetchReleaseStatusOptions, 'owner' | 'repo'>): string {
  return ['github-release-status', owner, repo].join(':');
}

export function compareReleaseVersions(left: string | null | undefined, right: string | null | undefined): number {
  const leftParts = toSemverParts(left);
  const rightParts = toSemverParts(right);

  if (!leftParts && !rightParts) {
    return 0;
  }

  if (!leftParts) {
    return -1;
  }

  if (!rightParts) {
    return 1;
  }

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) {
      return 1;
    }

    if (leftParts[index] < rightParts[index]) {
      return -1;
    }
  }

  return 0;
}

export function buildReleaseStatus({ installedVersion, releases }: BuildReleaseStatusOptions): ReleaseStatus {
  const sortedReleases = sortReleases(releases);
  const latestRelease = getLatestRelease(sortedReleases);
  const normalizedInstalledVersion = normalizeReleaseVersion(installedVersion);

  if (!latestRelease) {
    return {
      installedVersion: normalizedInstalledVersion,
      latestVersion: null,
      latestReleaseName: null,
      latestReleaseUrl: null,
      publishedAt: null,
      releases: sortedReleases,
      updateAvailable: false,
    };
  }

  return {
    installedVersion: normalizedInstalledVersion,
    latestVersion: latestRelease.version,
    latestReleaseName: latestRelease.name,
    latestReleaseUrl: latestRelease.url,
    publishedAt: latestRelease.publishedAt,
    releases: sortedReleases,
    updateAvailable:
      normalizedInstalledVersion !== null && compareReleaseVersions(latestRelease.version, normalizedInstalledVersion) > 0,
  };
}

export async function fetchReleaseStatus(options: FetchReleaseStatusOptions): Promise<ReleaseStatus> {
  const cacheKey = createCacheKey(options);
  const cachedReleases = getCachedValue<ReleaseEntry[]>(cacheKey);

  if (cachedReleases !== null) {
    return buildReleaseStatus({
      installedVersion: options.installedVersion,
      releases: cachedReleases,
    });
  }

  try {
    const releases = await fetchGithubReleases({
      owner: options.owner,
      repo: options.repo,
      token: options.token,
    });
    const sortedReleases = sortReleases(releases);

    setCachedValue(cacheKey, sortedReleases, options.cacheTtlMs ?? DEFAULT_RELEASES_CACHE_TTL_MS);

    return buildReleaseStatus({
      installedVersion: options.installedVersion,
      releases: sortedReleases,
    });
  } catch (error) {
    const staleReleases = getStaleCachedValue<ReleaseEntry[]>(cacheKey);

    if (staleReleases !== null) {
      return buildReleaseStatus({
        installedVersion: options.installedVersion,
        releases: staleReleases,
      });
    }

    throw error;
  }
}
