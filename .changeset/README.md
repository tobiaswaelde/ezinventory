# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) to prepare one product release stream across the main workspace packages.

The intended model is a single EZ Inventory product version. The API, web app, and shared package versions move together even if only one package carried the user-facing change.

## Create a changeset

After a user-facing change lands, run:

```bash
pnpm changeset
```

Select the package or packages affected by the change, choose the appropriate bump type, and write a short summary. This creates a Markdown file in `.changeset/` that becomes the source input for the next version step.

Because the core packages are configured as a fixed release group, `changeset version` will move them together as one product release:

- `@ezinventory/api`
- `@ezinventory/web`
- `@ezinventory/shared`

## Version packages

When the queued changesets are ready to release, run:

```bash
pnpm version-packages
```

That command reads the generated unreleased changeset entry files in `.changeset/` and updates the fixed package group together. This refers to the per-change entry files created by `pnpm changeset`, not companion docs such as `.changeset/README.md`. Review the resulting `package.json` version changes before committing.

The package manifests are an implementation detail of the product release. For user-facing release history and the About page changelog, GitHub Releases are the source of truth.

## Notes

- Keep each changeset focused on one logical change.
- Prefer plain language summaries; they explain why the next product release version moved.
- Do not edit `config.json` as part of routine release work unless the release policy itself changes.
