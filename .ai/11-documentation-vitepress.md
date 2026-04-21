# 11 - Documentation with README + VitePress

## Documentation Goals

- README as fast onboarding entrypoint.
- VitePress as structured product and engineering documentation.
- Public docs hosted on GitHub Pages.

## Proposed Structure

- `README.md` (quickstart, local commands, architecture snapshot)
- `docs-site/` (VitePress project)
- `docs-site/docs/`:
  - `index.md`
  - `architecture.md`
  - `data-model.md`
  - `api.md`
  - `mobile-flows.md`
  - `operations.md`
  - `i18n.md`
  - `contributing.md`

## README Minimum Content

- project purpose and scope
- status badges in root README (version, test coverage, workflow runs)
- tech stack
- local Docker development
- build and test commands
- link to Scalar API docs
- link to VitePress docs site
- open-source contribution entrypoint

## API Documentation Standard

- NestJS API is documented with Scalar.
- All endpoints must be included.
- All request/response DTOs must be included.
- API docs are generated from OpenAPI metadata and published as part of the app/docs workflow.

## Root README Badge Plan

The root `README.md` should show at least:
- Version badge
- Test coverage badge
- Workflow run status badge(s) from GitHub Actions

Example placeholder block:

```md
![Version](https://img.shields.io/github/v/release/tobiaswaelde/ezinventory)
![Coverage](https://img.shields.io/codecov/c/github/tobiaswaelde/ezinventory)
![CI](https://img.shields.io/github/actions/workflow/status/tobiaswaelde/ezinventory/ci.yml?branch=main)
```

## GitHub Pages Plan

1. Build VitePress in GitHub Actions.
2. Deploy build artifact to GitHub Pages.
3. Add docs versioning later if needed.

## Language Policy

- Source documentation default language: English.
- Product localization: German and English (`de`, `en`) from MVP.
- Chat and team communication can remain language-flexible.
