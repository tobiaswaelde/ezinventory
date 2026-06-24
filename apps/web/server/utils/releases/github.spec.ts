import { describe, expect, it } from 'vitest';

import { normalizeGithubRelease } from './github';

describe('normalizeGithubRelease', () => {
  it('normalizes a published GitHub release with a semver tag', () => {
    expect(
      normalizeGithubRelease({
        tag_name: 'v1.2.3',
        name: 'Version 1.2.3',
        html_url: 'https://github.com/example/repo/releases/tag/v1.2.3',
        published_at: '2026-06-24T12:00:00.000Z',
        draft: false,
        prerelease: false,
      }),
    ).toEqual({
      version: '1.2.3',
      name: 'Version 1.2.3',
      url: 'https://github.com/example/repo/releases/tag/v1.2.3',
      publishedAt: '2026-06-24T12:00:00.000Z',
    });
  });

  it('skips draft and prerelease entries', () => {
    expect(
      normalizeGithubRelease({
        tag_name: 'v1.2.3',
        name: 'Draft release',
        html_url: 'https://github.com/example/repo/releases/tag/v1.2.3',
        published_at: '2026-06-24T12:00:00.000Z',
        draft: true,
        prerelease: false,
      }),
    ).toBeNull();

    expect(
      normalizeGithubRelease({
        tag_name: 'v1.2.3-beta.1',
        name: 'Beta release',
        html_url: 'https://github.com/example/repo/releases/tag/v1.2.3-beta.1',
        published_at: '2026-06-24T12:00:00.000Z',
        draft: false,
        prerelease: true,
      }),
    ).toBeNull();
  });

  it('skips releases with invalid version tags', () => {
    expect(
      normalizeGithubRelease({
        tag_name: 'release-2026-06-24',
        name: 'Release 2026-06-24',
        html_url: 'https://github.com/example/repo/releases/tag/release-2026-06-24',
        published_at: '2026-06-24T12:00:00.000Z',
        draft: false,
        prerelease: false,
      }),
    ).toBeNull();
  });
});
