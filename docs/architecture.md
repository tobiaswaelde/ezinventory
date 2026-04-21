# Architecture

## Monorepo Structure

- `apps/api` NestJS API
- `apps/app` Nuxt frontend
- `packages/contracts` generated OpenAPI type contracts
- `.ai` internal planning and architecture notes

## Runtime Components

- API service
- App service
- PostgreSQL
- RustFS for media/object storage

## Contracts

OpenAPI is exported by API and consumed in `packages/contracts` for shared typing between app and API.
