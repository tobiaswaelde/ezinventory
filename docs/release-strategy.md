# Release Strategy

## Versioning

EZ Inventory follows [Semantic Versioning](https://semver.org/):

- `MAJOR`: breaking API or behavior changes
- `MINOR`: backward-compatible features
- `PATCH`: backward-compatible fixes

Version source of truth is the root `package.json` (`version`).

## Release Cadence

- `main` is always releasable
- releases are cut on demand after merged, green CI changes
- critical fixes may be released immediately as patch versions

## Release Process

1. Ensure `main` is green (`api-ci`, `app-ci`, lint workflows).
2. Update changelog/release notes from merged PRs.
3. Create an annotated git tag `vX.Y.Z` on `main`.
4. Publish a GitHub Release based on that tag.
5. Trigger container build/push (`deploy-ghcr.yml`) for deployment artifacts.

## Release Notes Convention

Release notes are grouped by:

- Features
- Fixes
- Docs
- CI/Build/Chore

Each entry should reference the PR number and affected area (`api`, `app`, `docs`, `ops`).

## Compatibility Policy

- Active support target: latest `main` and latest tagged release
- security fixes are applied to latest maintained release line
- older release tags may remain available without active support
