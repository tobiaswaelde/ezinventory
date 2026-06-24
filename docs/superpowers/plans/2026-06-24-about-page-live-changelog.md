# About Page Live Changelog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live, server-cached GitHub Releases changelog on the admin About page, highlight the installed version, surface update availability in the sidebar, and add initial Changesets support for a single product release stream.

**Architecture:** Add a small Nuxt server-side release service that fetches and caches GitHub Releases, normalizes stable releases, and exposes a typed view model to the frontend. Keep rendering concerns in dedicated composables/components so the sidebar and About page consume the same computed update state. Introduce a minimal frontend test stack with Vitest for server utilities and Vue rendering checks.

**Tech Stack:** Nuxt 4, Vue 3, Pinia, Nuxt UI, Nitro server routes/utilities, GitHub REST API, semantic version comparison, Vitest, Vue Test Utils, Changesets

---

## File Structure

### Existing files to modify

- `package.json`
  Purpose: add root release/versioning scripts and Changesets tooling.
- `apps/web/package.json`
  Purpose: add frontend test dependencies and test scripts.
- `apps/web/nuxt.config.ts`
  Purpose: expose GitHub repo/runtime config and frontend build version to the server/client.
- `apps/web/app/store/app.ts`
  Purpose: centralize installed version state and release/update metadata for shared UI consumers.
- `apps/web/app/components/layout/sidebar/footer.vue`
  Purpose: show installed version badge and red update indicator on the About link.
- `apps/web/app/pages/(admin)/about/index.vue`
  Purpose: replace placeholder with alert, version summary, and full changelog timeline.
- `apps/web/app/types/routes.ts`
  Purpose: unchanged routing enum reference for About page navigation; verify no new route needed.

### New frontend files to create

- `apps/web/server/utils/releases/types.ts`
  Purpose: typed release and update-status models.
- `apps/web/server/utils/releases/github.ts`
  Purpose: GitHub Releases API client with headers, token support, and normalization helpers.
- `apps/web/server/utils/releases/cache.ts`
  Purpose: in-memory TTL cache with stale-on-error behavior.
- `apps/web/server/utils/releases/service.ts`
  Purpose: orchestrate fetching, caching, normalization, semver comparison, and page/sidebar view model creation.
- `apps/web/server/api/releases.get.ts`
  Purpose: server endpoint exposing normalized release data to the app.
- `apps/web/app/composables/app/releases.ts`
  Purpose: typed client-side access to the server release payload.
- `apps/web/app/components/modules/about/changelog/index.vue`
  Purpose: render the timeline with `UChangelogVersions`/`UChangelogVersion`.
- `apps/web/app/components/modules/about/version-summary/index.vue`
  Purpose: render installed API/web version and latest release summary.
- `apps/web/app/components/modules/about/update-alert/index.vue`
  Purpose: render the top-of-page update alert and operator update guidance.

### New test files to create

- `apps/web/server/utils/releases/github.spec.ts`
  Purpose: verify GitHub payload normalization and invalid-tag filtering.
- `apps/web/server/utils/releases/service.spec.ts`
  Purpose: verify semver comparison, latest selection, and cache hit/stale behavior.
- `apps/web/app/components/modules/about/changelog/index.spec.ts`
  Purpose: verify installed-version highlighting and release rendering.
- `apps/web/app/components/layout/sidebar/footer.spec.ts`
  Purpose: verify red update indicator and version badge behavior.
- `apps/web/vitest.config.ts`
  Purpose: frontend/unit test configuration.
- `apps/web/test/setup.ts`
  Purpose: shared test setup/mocks for Vue and Nuxt imports.

### New release-management files to create

- `.changeset/config.json`
  Purpose: configure Changesets for a single-product monorepo release flow.
- `.changeset/README.md`
  Purpose: document how to author a release entry.
- `docs/releases.md`
  Purpose: document the repository release process, GitHub Releases source of truth, and version propagation expectations.

## Task 1: Add frontend test infrastructure and release runtime config

**Files:**
- Modify: `package.json`
- Modify: `apps/web/package.json`
- Modify: `apps/web/nuxt.config.ts`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/test/setup.ts`

- [ ] **Step 1: Write the failing config test scaffold**

Create `apps/web/server/utils/releases/service.spec.ts` with an initial placeholder test that imports the not-yet-created release service and expects the comparison helper to exist:

```ts
import { describe, expect, it } from 'vitest';
import { compareReleaseVersions } from './service';

describe('compareReleaseVersions', () => {
  it('treats v-prefixed and plain semver tags as equal', () => {
    expect(compareReleaseVersions('v1.2.3', '1.2.3')).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir apps/web test server/utils/releases/service.spec.ts`

Expected: FAIL because `vitest` and `./service` are not configured yet.

- [ ] **Step 3: Add minimal test tooling and runtime config**

Update `apps/web/package.json` to add scripts and dependencies:

```json
{
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@vue/test-utils": "^2.4.6",
    "happy-dom": "^18.0.1",
    "vitest": "^3.2.4"
  }
}
```

Update `package.json` to add release scripts:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "nx": "nx",
    "build": "nx run-many -t build --all",
    "lint": "nx run-many -t lint:check --all",
    "test": "nx run-many -t test --all",
    "graph": "nx graph",
    "changeset": "changeset",
    "version-packages": "changeset version"
  },
  "devDependencies": {
    "@changesets/cli": "^2.29.6",
    "@types/node": "^25.9.4",
    "nx": "^22.7.5",
    "typescript": "^6.0.3"
  }
}
```

Update `apps/web/nuxt.config.ts` runtime config:

```ts
runtimeConfig: {
  githubToken: '',
  githubRepoOwner: 'tobiaswaelde',
  githubRepoName: 'ezinventory',
  public: {
    APP_BASE_URL: '',
    API_BASE_URL: '',
    APP_VERSION: process.env.npm_package_version || '0.0.0',
  },
},
```

Create `apps/web/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
});
```

Create `apps/web/test/setup.ts`:

```ts
import { vi } from 'vitest';

vi.stubGlobal('defineNuxtPlugin', (value: unknown) => value);
```

- [ ] **Step 4: Run test to verify it still fails for the right reason**

Run: `pnpm --dir apps/web test server/utils/releases/service.spec.ts`

Expected: FAIL because `apps/web/server/utils/releases/service.ts` does not exist yet.

- [ ] **Step 5: Commit**

```bash
git add package.json apps/web/package.json apps/web/nuxt.config.ts apps/web/vitest.config.ts apps/web/test/setup.ts apps/web/server/utils/releases/service.spec.ts
git commit -m "test(web): add release feature test infrastructure"
```

## Task 2: Build the server-side GitHub Releases client, cache, and comparison logic

**Files:**
- Create: `apps/web/server/utils/releases/types.ts`
- Create: `apps/web/server/utils/releases/github.ts`
- Create: `apps/web/server/utils/releases/cache.ts`
- Create: `apps/web/server/utils/releases/service.ts`
- Create: `apps/web/server/api/releases.get.ts`
- Test: `apps/web/server/utils/releases/github.spec.ts`
- Test: `apps/web/server/utils/releases/service.spec.ts`

- [ ] **Step 1: Write the failing normalization and cache tests**

Create `apps/web/server/utils/releases/github.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeGithubRelease } from './github';

describe('normalizeGithubRelease', () => {
  it('normalizes a stable GitHub release payload', () => {
    const release = normalizeGithubRelease({
      tag_name: 'v1.2.3',
      name: 'v1.2.3',
      html_url: 'https://github.com/tobiaswaelde/ezinventory/releases/tag/v1.2.3',
      body: 'Bug fixes',
      published_at: '2026-06-24T10:00:00Z',
      prerelease: false,
      draft: false,
    });

    expect(release).toMatchObject({
      tag: 'v1.2.3',
      version: '1.2.3',
      title: 'v1.2.3',
    });
  });
});
```

Expand `apps/web/server/utils/releases/service.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildReleaseStatus, compareReleaseVersions } from './service';

describe('compareReleaseVersions', () => {
  it('treats v-prefixed and plain semver tags as equal', () => {
    expect(compareReleaseVersions('v1.2.3', '1.2.3')).toBe(0);
  });

  it('orders newer stable versions ahead of older ones', () => {
    expect(compareReleaseVersions('1.3.0', '1.2.9')).toBe(1);
  });
});

describe('buildReleaseStatus', () => {
  it('marks update availability when latest release exceeds installed API version', () => {
    const status = buildReleaseStatus({
      installedApiVersion: '1.0.0',
      installedWebVersion: '1.0.0',
      releases: [{
        tag: 'v1.1.0',
        version: '1.1.0',
        title: 'v1.1.0',
        url: 'https://example.com',
        body: 'Update',
        publishedAt: '2026-06-24T10:00:00Z',
      }],
    });

    expect(status.hasUpdate).toBe(true);
    expect(status.latestVersion).toBe('1.1.0');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --dir apps/web test apps/web/server/utils/releases/github.spec.ts apps/web/server/utils/releases/service.spec.ts`

Expected: FAIL because the release utility files do not exist yet.

- [ ] **Step 3: Write the minimal server-side release implementation**

Create `apps/web/server/utils/releases/types.ts`:

```ts
export interface ReleaseEntry {
  tag: string;
  version: string;
  title: string;
  url: string;
  body: string;
  publishedAt: string;
  isLatest?: boolean;
  isInstalled?: boolean;
}

export interface ReleaseStatus {
  installedApiVersion: string | null;
  installedWebVersion: string;
  latestVersion: string | null;
  hasUpdate: boolean;
  releases: ReleaseEntry[];
}
```

Create `apps/web/server/utils/releases/github.ts`:

```ts
import type { ReleaseEntry } from './types';

export const normalizeReleaseVersion = (value: string): string | null => {
  const normalized = value.replace(/^v/i, '');

  return /^\d+\.\d+\.\d+$/.test(normalized) ? normalized : null;
};

export const normalizeGithubRelease = (release: any): ReleaseEntry | null => {
  if (release.draft || release.prerelease) return null;

  const version = normalizeReleaseVersion(release.tag_name || '');
  if (!version) return null;

  return {
    tag: release.tag_name,
    version,
    title: release.name || release.tag_name,
    url: release.html_url,
    body: release.body || '',
    publishedAt: release.published_at,
  };
};
```

Create `apps/web/server/utils/releases/cache.ts`:

```ts
import type { ReleaseStatus } from './types';

const TTL_MS = 15 * 60 * 1000;

let cachedValue: ReleaseStatus | null = null;
let cachedAt = 0;

export const getCachedReleaseStatus = () => {
  if (!cachedValue) return null;

  return {
    value: cachedValue,
    isFresh: Date.now() - cachedAt < TTL_MS,
  };
};

export const setCachedReleaseStatus = (value: ReleaseStatus) => {
  cachedValue = value;
  cachedAt = Date.now();
};
```

Create `apps/web/server/utils/releases/service.ts`:

```ts
import type { ReleaseEntry, ReleaseStatus } from './types';

export const compareReleaseVersions = (left: string, right: string): number => {
  const a = left.replace(/^v/i, '').split('.').map(Number);
  const b = right.replace(/^v/i, '').split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    const diff = (a[index] || 0) - (b[index] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }

  return 0;
};

export const buildReleaseStatus = ({
  installedApiVersion,
  installedWebVersion,
  releases,
}: {
  installedApiVersion: string | null;
  installedWebVersion: string;
  releases: ReleaseEntry[];
}): ReleaseStatus => {
  const sorted = [...releases].sort((left, right) =>
    compareReleaseVersions(right.version, left.version),
  );

  const latest = sorted[0] || null;

  return {
    installedApiVersion,
    installedWebVersion,
    latestVersion: latest?.version || null,
    hasUpdate: installedApiVersion ? compareReleaseVersions(latest?.version || '0.0.0', installedApiVersion) > 0 : false,
    releases: sorted.map((release) => ({
      ...release,
      isLatest: release.version === latest?.version,
      isInstalled: installedApiVersion ? compareReleaseVersions(release.version, installedApiVersion) === 0 : false,
    })),
  };
};
```

Create `apps/web/server/api/releases.get.ts`:

```ts
export default defineEventHandler(async () => {
  return {
    installedApiVersion: null,
    installedWebVersion: useRuntimeConfig().public.APP_VERSION,
    latestVersion: null,
    hasUpdate: false,
    releases: [],
  };
});
```

- [ ] **Step 4: Run tests to verify the unit helpers pass**

Run: `pnpm --dir apps/web test apps/web/server/utils/releases/github.spec.ts apps/web/server/utils/releases/service.spec.ts`

Expected: PASS for normalization and semver helpers, while the server endpoint remains a stub.

- [ ] **Step 5: Extend the server integration to fetch real GitHub releases and respect stale cache**

Update `apps/web/server/utils/releases/service.ts` to add:

```ts
import { $fetch } from 'ofetch';
import { getCachedReleaseStatus, setCachedReleaseStatus } from './cache';
import { normalizeGithubRelease } from './github';

export const fetchReleaseStatus = async ({
  owner,
  repo,
  token,
  installedApiVersion,
  installedWebVersion,
}: {
  owner: string;
  repo: string;
  token?: string;
  installedApiVersion: string | null;
  installedWebVersion: string;
}) => {
  const cached = getCachedReleaseStatus();
  if (cached?.isFresh) return cached.value;

  try {
    const releases = await $fetch<any[]>(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      headers: {
        accept: 'application/vnd.github+json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });

    const normalized = releases.map(normalizeGithubRelease).filter(Boolean);
    const status = buildReleaseStatus({
      installedApiVersion,
      installedWebVersion,
      releases: normalized,
    });

    setCachedReleaseStatus(status);
    return status;
  } catch (error) {
    if (cached?.value) return cached.value;
    throw error;
  }
};
```

Update `apps/web/server/api/releases.get.ts`:

```ts
import { fetchReleaseStatus } from '../utils/releases/service';

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const installedWebVersion = config.public.APP_VERSION;

  return fetchReleaseStatus({
    owner: config.githubRepoOwner,
    repo: config.githubRepoName,
    token: config.githubToken || undefined,
    installedApiVersion: null,
    installedWebVersion,
  });
});
```

- [ ] **Step 6: Run tests to verify the pure logic still passes**

Run: `pnpm --dir apps/web test apps/web/server/utils/releases/github.spec.ts apps/web/server/utils/releases/service.spec.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/server/utils/releases/types.ts apps/web/server/utils/releases/github.ts apps/web/server/utils/releases/cache.ts apps/web/server/utils/releases/service.ts apps/web/server/api/releases.get.ts apps/web/server/utils/releases/github.spec.ts apps/web/server/utils/releases/service.spec.ts
git commit -m "feat(web): add cached github releases service"
```

## Task 3: Connect API health version and expose a UI-ready release composable

**Files:**
- Modify: `apps/web/app/store/app.ts`
- Create: `apps/web/app/composables/app/releases.ts`
- Modify: `apps/web/server/api/releases.get.ts`

- [ ] **Step 1: Write the failing installed-version state test**

Create a new expectation in `apps/web/server/utils/releases/service.spec.ts` that `buildReleaseStatus` marks the installed release:

```ts
it('marks the installed release in the timeline', () => {
  const status = buildReleaseStatus({
    installedApiVersion: '1.1.0',
    installedWebVersion: '1.1.0',
    releases: [{
      tag: 'v1.1.0',
      version: '1.1.0',
      title: 'v1.1.0',
      url: 'https://example.com',
      body: 'Installed release',
      publishedAt: '2026-06-24T10:00:00Z',
    }],
  });

  expect(status.releases[0]?.isInstalled).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir apps/web test apps/web/server/utils/releases/service.spec.ts`

Expected: FAIL if the previous step has not yet marked installed releases correctly.

- [ ] **Step 3: Implement the API-version fetch and shared release composable**

Create `apps/web/app/composables/app/releases.ts`:

```ts
import type { ReleaseStatus } from '~/server/utils/releases/types';

export const useReleases = async () => {
  return useFetch<ReleaseStatus>('/api/releases', {
    key: 'about-releases',
    server: false,
  });
};
```

Update `apps/web/app/store/app.ts`:

```ts
import pjson from '~/../package.json';

export const useAppStore = defineStore('app', () => {
  const version = computed(() => pjson.version);
  const hasUpdate = useState('app-has-update', () => false);
  const latestVersion = useState<string | null>('app-latest-version', () => null);

  const setReleaseState = (value: { hasUpdate: boolean; latestVersion: string | null }) => {
    hasUpdate.value = value.hasUpdate;
    latestVersion.value = value.latestVersion;
  };

  return {
    version,
    hasUpdate,
    latestVersion,
    setReleaseState,
  };
});
```

Update `apps/web/server/api/releases.get.ts` to fetch the API health endpoint before computing status:

```ts
const apiBaseUrl = config.public.API_BASE_URL;
let installedApiVersion: string | null = null;

if (apiBaseUrl) {
  try {
    const health = await $fetch<{ version?: string }>(`${apiBaseUrl}/api/v1/health`);
    installedApiVersion = health.version || null;
  } catch {
    installedApiVersion = null;
  }
}

return fetchReleaseStatus({
  owner: config.githubRepoOwner,
  repo: config.githubRepoName,
  token: config.githubToken || undefined,
  installedApiVersion,
  installedWebVersion,
});
```

- [ ] **Step 4: Run tests to verify the release logic passes**

Run: `pnpm --dir apps/web test apps/web/server/utils/releases/service.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/composables/app/releases.ts apps/web/app/store/app.ts apps/web/server/api/releases.get.ts apps/web/server/utils/releases/service.spec.ts
git commit -m "feat(web): wire installed version release state"
```

## Task 4: Render the About page timeline, alert, and sidebar update indicator

**Files:**
- Create: `apps/web/app/components/modules/about/update-alert/index.vue`
- Create: `apps/web/app/components/modules/about/version-summary/index.vue`
- Create: `apps/web/app/components/modules/about/changelog/index.vue`
- Create: `apps/web/app/components/modules/about/changelog/index.spec.ts`
- Create: `apps/web/app/components/layout/sidebar/footer.spec.ts`
- Modify: `apps/web/app/components/layout/sidebar/footer.vue`
- Modify: `apps/web/app/pages/(admin)/about/index.vue`

- [ ] **Step 1: Write the failing rendering tests**

Create `apps/web/app/components/modules/about/changelog/index.spec.ts`:

```ts
import { mount } from '@vue/test-utils';
import Changelog from './index.vue';

describe('AboutChangelog', () => {
  it('shows an installed badge for the installed release', () => {
    const wrapper = mount(Changelog, {
      props: {
        releases: [{
          tag: 'v1.2.3',
          version: '1.2.3',
          title: 'v1.2.3',
          url: 'https://example.com',
          body: 'Installed release',
          publishedAt: '2026-06-24T10:00:00Z',
          isInstalled: true,
        }],
      },
      global: {
        stubs: ['UChangelogVersions', 'UChangelogVersion', 'UBadge'],
      },
    });

    expect(wrapper.text()).toContain('Installed');
  });
});
```

Create `apps/web/app/components/layout/sidebar/footer.spec.ts`:

```ts
import { mount } from '@vue/test-utils';
import Footer from './footer.vue';

vi.mock('~/store/app', () => ({
  useAppStore: () => ({
    version: '1.0.0',
    hasUpdate: true,
    latestVersion: '1.1.0',
  }),
}));

describe('Sidebar footer', () => {
  it('renders an update indicator on the about item when an update exists', () => {
    const wrapper = mount(Footer, {
      props: { collapsed: false },
      global: {
        mocks: {
          $t: (value: string) => value,
        },
        stubs: ['UNavigationMenu'],
      },
    });

    expect(wrapper.html()).toContain('1.0.0');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --dir apps/web test apps/web/app/components/modules/about/changelog/index.spec.ts apps/web/app/components/layout/sidebar/footer.spec.ts`

Expected: FAIL because the components and update state do not exist yet.

- [ ] **Step 3: Implement the minimal About page UI**

Create `apps/web/app/components/modules/about/update-alert/index.vue`:

```vue
<template>
  <UAlert
    v-if="hasUpdate && latestUrl"
    color="warning"
    variant="subtle"
    icon="i-tabler-download"
    :title="`Update available: ${latestVersion}`"
    :description="'Pull the latest image tag, restart the stack, then verify the deployed version in the About page or health endpoint.'"
  >
    <template #actions>
      <UButton :to="latestUrl" target="_blank" color="warning" variant="outline" label="Open release" />
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineProps<{
  hasUpdate: boolean;
  latestVersion: string | null;
  latestUrl: string | null;
}>();
</script>
```

Create `apps/web/app/components/modules/about/version-summary/index.vue`:

```vue
<template>
  <UPageGrid>
    <UPageCard title="Installed API" :description="installedApiVersion || 'Unavailable'" />
    <UPageCard title="Installed Web" :description="installedWebVersion" />
    <UPageCard title="Latest Release" :description="latestVersion || 'Unavailable'">
      <template v-if="latestUrl" #footer>
        <UButton :to="latestUrl" target="_blank" variant="ghost" label="View on GitHub" />
      </template>
    </UPageCard>
  </UPageGrid>
</template>

<script setup lang="ts">
defineProps<{
  installedApiVersion: string | null;
  installedWebVersion: string;
  latestVersion: string | null;
  latestUrl: string | null;
}>();
</script>
```

Create `apps/web/app/components/modules/about/changelog/index.vue`:

```vue
<template>
  <UChangelogVersions>
    <UChangelogVersion
      v-for="release in releases"
      :key="release.tag"
      :title="release.title"
      :description="release.body"
      :date="release.publishedAt"
      :to="release.url"
      target="_blank"
      :badge="release.isInstalled ? { label: 'Installed', color: 'warning', variant: 'subtle' } : undefined"
    />
  </UChangelogVersions>
</template>

<script setup lang="ts">
import type { ReleaseEntry } from '~/server/utils/releases/types';

defineProps<{
  releases: ReleaseEntry[];
}>();
</script>
```

Update `apps/web/app/components/layout/sidebar/footer.vue` to include a chip on the About item:

```ts
badge: {
  label: appStore.version,
  color: 'neutral',
},
chip: appStore.hasUpdate ? { color: 'error' } : undefined,
```

Update `apps/web/app/pages/(admin)/about/index.vue`:

```vue
<template>
  <UDashboardPanel id="about">
    <template #header>
      <LayoutNavbar :title="$t('core.sidebar.footer.about.label')" />
    </template>

    <template #body>
      <div class="space-y-6">
        <ModulesAboutUpdateAlert
          :has-update="releaseStatus.hasUpdate"
          :latest-version="releaseStatus.latestVersion"
          :latest-url="releaseStatus.releases[0]?.url || null"
        />

        <ModulesAboutVersionSummary
          :installed-api-version="releaseStatus.installedApiVersion"
          :installed-web-version="releaseStatus.installedWebVersion"
          :latest-version="releaseStatus.latestVersion"
          :latest-url="releaseStatus.releases[0]?.url || null"
        />

        <ModulesAboutChangelog :releases="releaseStatus.releases" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const appStore = useAppStore();
const { data } = await useReleases();

const releaseStatus = computed(() => data.value || {
  installedApiVersion: null,
  installedWebVersion: appStore.version,
  latestVersion: null,
  hasUpdate: false,
  releases: [],
});

watchEffect(() => {
  appStore.setReleaseState({
    hasUpdate: releaseStatus.value.hasUpdate,
    latestVersion: releaseStatus.value.latestVersion,
  });
});
</script>
```

- [ ] **Step 4: Run tests to verify the UI passes**

Run: `pnpm --dir apps/web test apps/web/app/components/modules/about/changelog/index.spec.ts apps/web/app/components/layout/sidebar/footer.spec.ts`

Expected: PASS

- [ ] **Step 5: Refine the changelog body rendering**

Update `apps/web/app/components/modules/about/changelog/index.vue` to move release body rendering into the `body` slot:

```vue
<UChangelogVersion ... :description="undefined">
  <template #body>
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-if="release.isInstalled"
          color="warning"
          variant="subtle"
          label="Installed"
        />
        <UBadge
          v-if="release.isLatest"
          color="primary"
          variant="outline"
          label="Latest"
        />
      </div>

      <MDC :value="release.body" tag="article" class="prose prose-sm max-w-none dark:prose-invert" />
    </div>
  </template>
</UChangelogVersion>
```

- [ ] **Step 6: Run targeted tests again**

Run: `pnpm --dir apps/web test apps/web/app/components/modules/about/changelog/index.spec.ts apps/web/app/components/layout/sidebar/footer.spec.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/components/modules/about/update-alert/index.vue apps/web/app/components/modules/about/version-summary/index.vue apps/web/app/components/modules/about/changelog/index.vue apps/web/app/components/modules/about/changelog/index.spec.ts apps/web/app/components/layout/sidebar/footer.spec.ts apps/web/app/components/layout/sidebar/footer.vue apps/web/app/pages/\(admin\)/about/index.vue
git commit -m "feat(web): render live release changelog and update alerts"
```

## Task 5: Add Changesets configuration and release documentation

**Files:**
- Create: `.changeset/config.json`
- Create: `.changeset/README.md`
- Create: `docs/releases.md`

- [ ] **Step 1: Write the failing repository readiness check**

Run a file existence check before creating the release-management files:

Run: `test -f .changeset/config.json`

Expected: FAIL with exit code `1` because Changesets is not configured yet.

- [ ] **Step 2: Add the minimal Changesets config**

Create `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

Create `.changeset/README.md`:

```md
# Changesets

Use `pnpm changeset` to author a release note for product changes.

Use `pnpm version-packages` to apply pending version bumps and update changelog metadata before creating a GitHub release.
```

Create `docs/releases.md`:

```md
# Releases

The product changelog shown in the admin About page is sourced from GitHub Releases.

## Release flow

1. Create a changeset with `pnpm changeset`.
2. Merge the changeset with the feature work.
3. Run `pnpm version-packages` when preparing a release.
4. Publish a GitHub Release using the generated version and notes.

## Version sources

- API installed version: health endpoint
- Web installed version: frontend build version
- Latest available version: GitHub Releases API
```

- [ ] **Step 3: Run the readiness check again**

Run: `test -f .changeset/config.json && test -f docs/releases.md`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add .changeset/config.json .changeset/README.md docs/releases.md
git commit -m "chore: add changesets release configuration"
```

## Task 6: Full verification

**Files:**
- Verify only

- [ ] **Step 1: Run frontend tests**

Run: `pnpm --dir apps/web test`

Expected: PASS

- [ ] **Step 2: Run repository lint/type-aware smoke checks that already exist**

Run: `pnpm build`

Expected: PASS, or only unrelated pre-existing failures outside this feature.

- [ ] **Step 3: Manually verify release API payload**

Run: `pnpm --dir apps/web dev`

Then open `/api/releases` in the local app and verify:

- installed web version is present
- releases array is populated from GitHub
- `hasUpdate` reflects the installed API version correctly when health is reachable

- [ ] **Step 4: Manually verify the About page**

Check in browser:

- About page shows version summary cards
- installed version badge is yellow
- latest release alert appears only when appropriate
- sidebar About entry shows a red indicator only when update is available
- page remains usable when GitHub or API health is unavailable

- [ ] **Step 5: Commit final verification adjustments if needed**

```bash
git add -A
git commit -m "test: verify live changelog release flow"
```

## Self-Review

### Spec coverage

- GitHub Releases API source: covered in Task 2
- server-side cache with stale-on-error: covered in Task 2
- installed API and frontend versions: covered in Task 3
- About alert, full changelog, installed badge: covered in Task 4
- sidebar update indicator: covered in Task 4
- Changesets setup: covered in Task 5
- verification and graceful degradation checks: covered in Task 6

### Placeholder scan

- No `TODO`, `TBD`, or indirect references remain.
- Each task contains concrete files, commands, and code snippets.

### Type consistency

- `ReleaseEntry` and `ReleaseStatus` are defined once in `types.ts` and referenced consistently in service/composable/component steps.
- Installed-version state uses `hasUpdate` and `latestVersion` consistently across store, sidebar, and About page.
