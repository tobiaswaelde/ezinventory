# EZ Inventory

![Version](https://img.shields.io/github/v/release/tobiaswaelde/ezinventory)
![Coverage](https://img.shields.io/codecov/c/github/tobiaswaelde/ezinventory)
[![Lint](https://github.com/tobiaswaelde/ezinventory/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/tobiaswaelde/ezinventory/actions/workflows/lint.yml)

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
- `docs` - planning and architecture docs

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

## Notes
- IDs are UUID v4 only.
- Input validation is required both client-side and server-side.
- Scalar docs must include all endpoints and DTOs.
