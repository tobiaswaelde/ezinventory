# About Page Live Changelog Design

**Date:** 2026-06-24

**Status:** Approved for spec review

## Goal

Render the full product changelog on the admin About page from the live GitHub Releases API, highlight the currently installed version, and surface update availability in both the sidebar and About page.

## Scope

This spec covers:

- server-side retrieval and caching of GitHub release data
- frontend rendering of the complete release history on the About page
- comparison of installed versus latest version
- update indicators in the sidebar and on the About page
- initial Changesets setup for a single product version across the monorepo

This spec does not cover:

- Docker build pipeline changes to inject a shared release version into both images
- automatic update execution from the UI
- authenticated/private GitHub repositories

## Product Decisions

### Source of truth for changelog

The changelog shown in the application will come from the GitHub Releases API for the public `ezinventory` repository, not from a locally bundled `CHANGELOG.md`.

Reasons:

- GitHub Releases align naturally with Changesets output.
- The UI can link directly to the latest release page.
- The release title, tag, publish date, and notes are available in one source.

### Release model

The monorepo will use a single product release version.

- Root `package.json` version is the primary product version.
- Changesets will publish a single product version and corresponding GitHub release.
- API and frontend should converge on the same release version over time.

For the first implementation:

- API installed version is read from the existing health endpoint.
- Frontend installed version is read from the build-time package version.
- The UI will compare the installed API version against the latest GitHub release.

This preserves the existing deployment behavior while establishing the product release model needed for later CI/CD alignment.

### Caching strategy

GitHub release data will be fetched server-side in Nuxt and cached in-process.

Rules:

- cache TTL: 15 minutes
- stale-on-error: enabled
- shared cache entry for sidebar and About page consumers
- optional `GITHUB_TOKEN` support for higher rate limits
- unauthenticated mode remains supported for public repository access

Rationale:

- avoids browser-side CORS and rate-limit concerns
- keeps the UI responsive
- keeps GitHub requests well below the documented REST API limits

## User Experience

### Sidebar

The About entry in the sidebar footer will continue to show the installed version as a badge.

When the installed version is older than the latest GitHub release:

- the About item will display a red update indicator dot

When the installed version is current:

- no red update indicator is shown

### About page

The About page will show:

- installed API version
- installed frontend version
- latest available release version
- link to the GitHub releases page
- full release timeline rendered with Nuxt UI changelog components

If an update is available, the page will show a prominent alert at the top with:

- latest version number
- link to the latest GitHub release page
- a short operator-oriented update hint

Initial update hint text should be generic and safe for self-hosted deployments, for example:

1. pull the latest Docker images or update the image tag
2. restart the application stack
3. verify the deployed version in the About page or health endpoint

### Changelog rendering

The About page will render the complete release history using:

- `UChangelogVersions` for the overall timeline
- `UChangelogVersion` per release entry

The currently installed version will be visually highlighted with a yellow badge such as `Installed`.

The latest release can optionally carry a neutral or primary badge such as `Latest`, but the installed-version marker takes precedence as the most important local-state cue.

Release notes body will be rendered from GitHub release markdown into safe HTML for display inside each changelog entry.

## Data Model

The frontend server should normalize GitHub API responses into a local release model with at least:

- `tag`
- `version`
- `title`
- `publishedAt`
- `url`
- `body`
- `isLatest`
- `isInstalled`

The page-level view model should additionally expose:

- `installedApiVersion`
- `installedWebVersion`
- `latestVersion`
- `hasUpdate`
- `releases`

## Version Comparison

Version comparison should be based on semantic version tags after normalizing a leading `v`.

Rules:

- `v1.2.3` and `1.2.3` are equivalent
- prereleases should be ignored for the normal latest-release check unless the repository intentionally uses prereleases as primary releases
- invalid tags should be skipped rather than breaking the UI

For the first implementation, the comparison target is:

- installed API version from health endpoint
- latest stable GitHub release from the releases API

Frontend version is displayed for visibility but does not drive the update-warning state in this first iteration.

## Failure Handling

If GitHub release retrieval fails and no cache exists:

- About page still renders installed version information
- changelog area shows a non-fatal empty/error state
- sidebar should not show a false positive update dot

If GitHub retrieval fails but stale cache exists:

- use stale cache
- do not show a hard error to the user

If the health endpoint fails:

- About page shows release data if available
- installed API version is shown as unavailable
- update comparison falls back to unknown state instead of showing an incorrect warning

## Security and Operational Constraints

- All GitHub API requests must originate from the server.
- `GITHUB_TOKEN` must never be exposed to the browser.
- Cache storage can remain in-memory for now because this is low-frequency metadata.
- This feature must degrade gracefully when rate-limited or offline.

## Changesets Setup

Initial Changesets integration should:

- add Changesets dependencies and config
- configure a single release workflow for the monorepo product
- document the release authoring flow

The initial setup goal is repository readiness for release-note generation and versioning, not full publish automation to package registries.

## Testing Requirements

Implementation must include tests for:

- GitHub release normalization
- semantic version comparison
- cache behavior for hit, miss, and stale-on-error paths
- About-page update alert rendering
- sidebar update indicator rendering
- installed release badge rendering

## Implementation Notes

- Follow existing Nuxt server patterns for server routes or server utilities.
- Keep the GitHub integration isolated from presentation code.
- Keep the About page focused on rendering a prepared view model rather than embedding fetch and parsing logic directly in the template.

## Open Items Resolved

These questions were resolved during design:

- changelog source: GitHub Releases API
- cache model: server-side cached
- installed API version source: health endpoint
- installed frontend version source: build/package version
- release strategy: single product version with Changesets

## Success Criteria

The feature is successful when:

- the About page renders the full GitHub release history
- the installed version is clearly highlighted
- users can see when a newer version exists
- the sidebar exposes update availability without requiring navigation
- the feature remains stable when GitHub is temporarily unavailable
