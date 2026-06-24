import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearReleaseCache } from './cache';
import { fetchGithubReleases } from './github';
import { buildReleaseStatus, compareReleaseVersions, fetchReleaseStatus } from './service';

vi.mock('./github', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./github')>();

  return {
    ...actual,
    fetchGithubReleases: vi.fn(),
  };
});

const fetchGithubReleasesMock = vi.mocked(fetchGithubReleases);

describe('compareReleaseVersions', () => {
  it('treats v-prefixed and plain semver tags as equal', () => {
    expect(compareReleaseVersions('v1.2.3', '1.2.3')).toBe(0);
  });

  it('sorts semantic versions by major, minor, and patch numbers', () => {
    expect(compareReleaseVersions('1.2.4', '1.2.3')).toBe(1);
    expect(compareReleaseVersions('1.3.0', '1.9.9')).toBe(-1);
    expect(compareReleaseVersions('2.0.0', '1.99.99')).toBe(1);
  });
});

describe('buildReleaseStatus', () => {
  it('treats an invalid installed version as unknown', () => {
    expect(
      buildReleaseStatus({
        installedVersion: 'main',
        releases: [
          {
            version: '1.3.0',
            name: 'Version 1.3.0',
            url: 'https://github.com/example/repo/releases/tag/v1.3.0',
            publishedAt: '2026-06-24T12:00:00.000Z',
            body: 'Latest release body',
          },
        ],
      }),
    ).toEqual({
      installedVersion: null,
      latestVersion: '1.3.0',
      latestReleaseUrl: 'https://github.com/example/repo/releases/tag/v1.3.0',
      latestReleaseName: 'Version 1.3.0',
      publishedAt: '2026-06-24T12:00:00.000Z',
      releases: [
        {
          version: '1.3.0',
          name: 'Version 1.3.0',
          url: 'https://github.com/example/repo/releases/tag/v1.3.0',
          publishedAt: '2026-06-24T12:00:00.000Z',
          body: 'Latest release body',
        },
      ],
      updateAvailable: false,
    });
  });

  it('marks an update as available when a newer release exists', () => {
    expect(
      buildReleaseStatus({
        installedVersion: '1.2.3',
        releases: [
          {
            version: '1.3.0',
            name: 'Version 1.3.0',
            url: 'https://github.com/example/repo/releases/tag/v1.3.0',
            publishedAt: '2026-06-24T12:00:00.000Z',
            body: 'Latest release body',
          },
          {
            version: '1.2.0',
            name: 'Version 1.2.0',
            url: 'https://github.com/example/repo/releases/tag/v1.2.0',
            publishedAt: '2026-05-01T12:00:00.000Z',
            body: 'Previous release body',
          },
        ],
      }),
    ).toEqual({
      installedVersion: '1.2.3',
      latestVersion: '1.3.0',
      latestReleaseUrl: 'https://github.com/example/repo/releases/tag/v1.3.0',
      latestReleaseName: 'Version 1.3.0',
      publishedAt: '2026-06-24T12:00:00.000Z',
      releases: [
        {
          version: '1.3.0',
          name: 'Version 1.3.0',
          url: 'https://github.com/example/repo/releases/tag/v1.3.0',
          publishedAt: '2026-06-24T12:00:00.000Z',
          body: 'Latest release body',
        },
        {
          version: '1.2.0',
          name: 'Version 1.2.0',
          url: 'https://github.com/example/repo/releases/tag/v1.2.0',
          publishedAt: '2026-05-01T12:00:00.000Z',
          body: 'Previous release body',
        },
      ],
      updateAvailable: true,
    });
  });

  it('returns a safe default when no latest release is available', () => {
    expect(
      buildReleaseStatus({
        installedVersion: '1.2.3',
        releases: [],
      }),
    ).toEqual({
      installedVersion: '1.2.3',
      latestVersion: null,
      latestReleaseUrl: null,
      latestReleaseName: null,
      publishedAt: null,
      releases: [],
      updateAvailable: false,
    });
  });
});

describe('fetchReleaseStatus', () => {
  beforeEach(() => {
    clearReleaseCache();
    vi.clearAllMocks();
  });

  it('reuses cached release metadata across installed version changes', async () => {
    fetchGithubReleasesMock.mockResolvedValue([
      {
        version: '1.2.0',
        name: 'Version 1.2.0',
        url: 'https://github.com/example/repo/releases/tag/v1.2.0',
        publishedAt: '2026-06-24T12:00:00.000Z',
        body: 'Body 1.2.0',
      },
    ]);

    const firstStatus = await fetchReleaseStatus({
      installedVersion: '1.0.0',
      owner: 'example',
      repo: 'inventory',
      cacheTtlMs: 60_000,
    });
    const secondStatus = await fetchReleaseStatus({
      installedVersion: '1.2.0',
      owner: 'example',
      repo: 'inventory',
      cacheTtlMs: 60_000,
    });

    expect(firstStatus.updateAvailable).toBe(true);
    expect(secondStatus.updateAvailable).toBe(false);
    expect(fetchGithubReleasesMock).toHaveBeenCalledTimes(1);
  });

  it('uses stale cached release metadata when refresh fails after expiry', async () => {
    fetchGithubReleasesMock.mockResolvedValueOnce([
      {
        version: '1.2.0',
        name: 'Version 1.2.0',
        url: 'https://github.com/example/repo/releases/tag/v1.2.0',
        publishedAt: '2026-06-24T12:00:00.000Z',
        body: 'Body 1.2.0',
      },
    ]);

    await fetchReleaseStatus({
      installedVersion: '1.0.0',
      owner: 'example',
      repo: 'inventory-stale',
      cacheTtlMs: 0,
    });

    fetchGithubReleasesMock.mockRejectedValueOnce(new Error('GitHub unavailable'));

    await expect(
      fetchReleaseStatus({
        installedVersion: '1.2.0',
        owner: 'example',
        repo: 'inventory-stale',
        cacheTtlMs: 0,
      }),
    ).resolves.toEqual({
      installedVersion: '1.2.0',
      latestVersion: '1.2.0',
      latestReleaseName: 'Version 1.2.0',
      latestReleaseUrl: 'https://github.com/example/repo/releases/tag/v1.2.0',
      publishedAt: '2026-06-24T12:00:00.000Z',
      releases: [
        {
          version: '1.2.0',
          name: 'Version 1.2.0',
          url: 'https://github.com/example/repo/releases/tag/v1.2.0',
          publishedAt: '2026-06-24T12:00:00.000Z',
          body: 'Body 1.2.0',
        },
      ],
      updateAvailable: false,
    });
  });

  it('returns the full normalized releases array sorted newest-first', async () => {
    fetchGithubReleasesMock.mockResolvedValue([
      {
        version: '1.2.0',
        name: 'Version 1.2.0',
        url: 'https://github.com/example/repo/releases/tag/v1.2.0',
        publishedAt: '2026-05-12T12:00:00.000Z',
        body: 'Old body',
      },
      {
        version: '1.4.0',
        name: 'Version 1.4.0',
        url: 'https://github.com/example/repo/releases/tag/v1.4.0',
        publishedAt: '2026-07-01T12:00:00.000Z',
        body: 'New body',
      },
      {
        version: '1.3.0',
        name: 'Version 1.3.0',
        url: 'https://github.com/example/repo/releases/tag/v1.3.0',
        publishedAt: '2026-06-01T12:00:00.000Z',
        body: 'Middle body',
      },
    ]);

    await expect(
      fetchReleaseStatus({
        installedVersion: '1.2.0',
        owner: 'example',
        repo: 'inventory',
        cacheTtlMs: 60_000,
      }),
    ).resolves.toMatchObject({
      latestVersion: '1.4.0',
      releases: [
        { version: '1.4.0', body: 'New body' },
        { version: '1.3.0', body: 'Middle body' },
        { version: '1.2.0', body: 'Old body' },
      ],
    });
  });
});

describe('/api/releases', () => {
  beforeEach(() => {
    clearReleaseCache();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('uses the installed API version from the health endpoint when deriving release state', async () => {
    fetchGithubReleasesMock.mockResolvedValue([
      {
        version: '1.2.0',
        name: 'Version 1.2.0',
        url: 'https://github.com/example/repo/releases/tag/v1.2.0',
        publishedAt: '2026-06-24T12:00:00.000Z',
        body: 'Release body',
      },
    ]);

    vi.stubGlobal('defineEventHandler', (handler: unknown) => handler);
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        API_BASE_URL: 'https://api.example.com',
        APP_VERSION: '1.0.0',
      },
      githubRepoOwner: 'example',
      githubRepoName: 'inventory',
      githubToken: undefined,
    }));
    vi.stubGlobal(
      '$fetch',
      vi.fn().mockResolvedValue({
        version: '1.2.0',
      }),
    );

    const module = await import('../../api/releases.get');
    const response = await module.default();

    expect(response).toMatchObject({
      installedApiVersion: '1.2.0',
      installedWebVersion: '1.0.0',
      latestVersion: '1.2.0',
      releases: [
        {
          version: '1.2.0',
          body: 'Release body',
        },
      ],
      updateAvailable: false,
    });
  });
});

describe('fetchGithubReleases pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('requests additional GitHub release pages until a short page is returned', async () => {
    vi.doUnmock('./github');

    const pageOne = Array.from({ length: 100 }, (_, index) => ({
      tag_name: `v1.0.${index}`,
      name: `Version 1.0.${index}`,
      html_url: `https://github.com/example/repo/releases/tag/v1.0.${index}`,
      published_at: '2026-06-24T12:00:00.000Z',
      draft: false,
      prerelease: false,
    }));
    const pageTwo = [
      {
        tag_name: 'v2.0.0',
        name: 'Version 2.0.0',
        html_url: 'https://github.com/example/repo/releases/tag/v2.0.0',
        published_at: '2026-06-25T12:00:00.000Z',
        draft: false,
        prerelease: false,
      },
    ];

    const fetchMock = vi.fn().mockResolvedValueOnce(pageOne).mockResolvedValueOnce(pageTwo);
    vi.stubGlobal('$fetch', fetchMock);

    const { fetchGithubReleases: fetchAllGithubReleases } = await import('./github');
    const releases = await fetchAllGithubReleases({
      owner: 'example',
      repo: 'repo',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.github.com/repos/example/repo/releases',
      expect.objectContaining({
        query: {
          page: 1,
          per_page: 100,
        },
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.github.com/repos/example/repo/releases',
      expect.objectContaining({
        query: {
          page: 2,
          per_page: 100,
        },
      }),
    );
    expect(releases).toHaveLength(101);
    expect(releases.at(-1)).toMatchObject({
      version: '2.0.0',
    });
  });
});
