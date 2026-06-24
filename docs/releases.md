# Releases

This repository uses Changesets to prepare a single EZ Inventory product release stream.

The API, web app, and shared workspace package versions are intended to move together. They are not treated as three separate public release tracks.

## Release flow

1. Land a change that should affect the product release.
2. Run `pnpm changeset` and commit the generated Markdown file in `.changeset/`.
3. Repeat until the branch is ready for a product release cut.
4. Run `pnpm version-packages` to apply all pending changesets.
5. Review the generated version updates across the fixed package group.
6. Publish the corresponding GitHub Release for that product version.
7. Treat that GitHub Release as the user-facing changelog and About page source of truth.

## Version sources

- Pending release intent lives in the generated unreleased changeset entry files under `.changeset/`, excluding companion docs such as `.changeset/README.md`.
- The committed package implementation versions live in the workspace `package.json` files.
- GitHub Releases are the source of truth for the product release history and the About page changelog.
- The root `package.json` also has a version field, but the coordinated runtime package versions come from the fixed workspace package group that `changeset version` updates together.

In this workspace today, the coordinated package manifests are:

- `apps/api/package.json`
- `apps/web/package.json`
- `libs/shared/package.json`

Those three packages are expected to share the same release version after each versioning run.

## Current policy

- Changesets is configured in `.changeset/config.json`.
- The API, web, and shared packages are configured as one fixed release group.
- `baseBranch` is `main`.
- Changelog generation is disabled, so release notes should be prepared separately when needed.
- Internal dependency bumps follow Changesets' `patch` update strategy.
