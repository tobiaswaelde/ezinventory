export interface ReleaseEntry {
  body?: string;
  name: string;
  publishedAt: string;
  url: string;
  version: string;
}

export interface ReleaseStatus {
  installedVersion: string | null;
  latestVersion: string | null;
  latestReleaseName: string | null;
  latestReleaseUrl: string | null;
  publishedAt: string | null;
  releases: ReleaseEntry[];
  updateAvailable: boolean;
}
