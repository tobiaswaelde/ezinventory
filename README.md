# EZ Inventory

![Version](https://img.shields.io/github/v/release/tobiaswaelde/ezinventory)
[![API CI](https://github.com/tobiaswaelde/ezinventory/actions/workflows/api-ci.yml/badge.svg?branch=main)](https://github.com/tobiaswaelde/ezinventory/actions/workflows/api-ci.yml)
[![App CI](https://github.com/tobiaswaelde/ezinventory/actions/workflows/app-ci.yml/badge.svg?branch=main)](https://github.com/tobiaswaelde/ezinventory/actions/workflows/app-ci.yml)
[![API Coverage](https://codecov.io/gh/tobiaswaelde/ezinventory/graph/badge.svg?flag=api)](https://codecov.io/gh/tobiaswaelde/ezinventory?flag=api)
[![App Coverage](https://codecov.io/gh/tobiaswaelde/ezinventory/graph/badge.svg?flag=app)](https://codecov.io/gh/tobiaswaelde/ezinventory?flag=app)

Mobile-first, open-source inventory management with QR-first workflows.

## Stack
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Nuxt 3 (PWA)
- Media: RustFS
- API docs: Scalar

## Monorepo Layout
- `apps/api` - NestJS API
- `apps/app` - Nuxt frontend
- `packages` - shared workspace packages
- `.ai` - planning and architecture docs (internal project docs)

## Quick Start
```bash
pnpm install
pnpm contracts:generate
pnpm dev
```

API endpoints during local dev:
- API base: `http://localhost:3001/api/v1`
- Scalar docs: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/openapi.json`

## Docker
```bash
docker compose up --build
```

## Docs (VitePress)
- Local docs dev server: `pnpm docs:dev`
- Build docs: `pnpm docs:build`
- Published docs (GitHub Pages): `https://tobiaswaelde.github.io/ezinventory/`
- Release strategy: `docs/release-strategy.md`

## Deployment Images (GHCR)
- API image: `ghcr.io/tobiaswaelde/ezinventory-api`
- App image: `ghcr.io/tobiaswaelde/ezinventory-app`
- Build & push workflow: `.github/workflows/deploy-ghcr.yml`
- Deployment runbook: `.ai/14-deployment-runbook.md`

## Notes
- IDs are UUID v4 only.
- Input validation is required both client-side and server-side.
- Scalar docs must include all endpoints and DTOs.

## Community
- Contributing guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- License: `LICENSE`
