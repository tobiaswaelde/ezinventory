import type { ReleaseEntry } from './types';

const SEMVER_TAG_PATTERN = /^\d+\.\d+\.\d+$/;

interface GithubReleasePayload {
  body?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  tag_name?: string | null;
  name?: string | null;
  html_url?: string | null;
  published_at?: string | null;
}

interface FetchGithubReleasesOptions {
  owner: string;
  repo: string;
  token?: string;
}

const GITHUB_RELEASES_PAGE_SIZE = 100;

export function normalizeReleaseVersion(version: string | null | undefined): string | null {
  if (!version) {
    return null;
  }

  const normalizedVersion = version.trim().replace(/^[vV]/, '');

  if (!SEMVER_TAG_PATTERN.test(normalizedVersion)) {
    return null;
  }

  return normalizedVersion;
}

export function normalizeGithubRelease(release: GithubReleasePayload): ReleaseEntry | null {
  if (release.draft || release.prerelease) {
    return null;
  }

  const version = normalizeReleaseVersion(release.tag_name);
  const url = release.html_url?.trim();
  const publishedAt = release.published_at?.trim();
  const body = release.body?.trim();

  if (!version || !url || !publishedAt) {
    return null;
  }

  return {
    version,
    name: release.name?.trim() || version,
    url,
    publishedAt,
    ...(body ? { body } : {}),
  };
}

export async function fetchGithubReleases({
  owner,
  repo,
  token,
}: FetchGithubReleasesOptions): Promise<ReleaseEntry[]> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const releases: ReleaseEntry[] = [];
  let page = 1;

  while (true) {
    const currentPage = await $fetch<GithubReleasePayload[]>(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      {
        headers,
        query: {
          page,
          per_page: GITHUB_RELEASES_PAGE_SIZE,
        },
      },
    );

    releases.push(...currentPage.map(normalizeGithubRelease).filter((release): release is ReleaseEntry => release !== null));

    if (currentPage.length < GITHUB_RELEASES_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return releases;
}
