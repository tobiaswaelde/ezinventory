# Architecture (Reference)

This is a lightweight architecture reference for admins and contributors.

## Monorepo Structure

- `apps/api`: NestJS API
- `apps/app`: Nuxt web app (PWA)
- `packages/contracts`: generated OpenAPI contracts
- `docs`: VitePress docs

## Runtime Components

- `app`: frontend service
- `api`: backend service
- `postgres`: primary relational database
- `rustfs`: media/object storage

## API Contracts

OpenAPI is exported by the API and consumed by the app through shared contracts.

## Deployment Shapes

- Local/dev: `compose.yaml`
- GHCR deployment: `compose.ghcr.yaml`

## Security-Relevant Areas

- JWT access/refresh token flow
- registration mode control (`OPEN` / `ADMIN_ONLY`)
- passkey support (WebAuthn)
- CASL-based permission model
