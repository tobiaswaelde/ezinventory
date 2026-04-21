# 15 - Release & Versioning Strategy

## Versioning Model

- Semantic Versioning (`MAJOR.MINOR.PATCH`)
- Git tags use `v*` (for example `v0.2.0`)

## Release Cadence

- `PATCH`: bug fixes and non-breaking maintenance
- `MINOR`: new backward-compatible features
- `MAJOR`: breaking API or behavior changes

## Release Workflow

1. Ensure CI (lint/test) is green.
2. Update changelog/release notes.
3. Create annotated tag (`v*`).
4. Push tag to trigger release image build/push.

## Deployment Artifacts

- `ghcr.io/tobiaswaelde/ezinventory-api`
- `ghcr.io/tobiaswaelde/ezinventory-app`

Release tags produce immutable deployment artifacts aligned to the release.
