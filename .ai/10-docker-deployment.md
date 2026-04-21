# 10 - Docker & Deployment Blueprint

## Target State

Containerized delivery for local development, staging, and production.

## Core Services

- `web` (Nuxt PWA)
- `api` (NestJS)
- `postgres` (database)
- `rustfs` (image/object storage)
- optional `proxy` (Nginx/Traefik)

## Environments

### Local Development
- `docker compose up` starts all services.
- Persistent volumes for PostgreSQL and RustFS.
- Hot reload for web and API containers.

### Staging
- Built images from CI.
- Isolated database and storage.
- Optional seed data for QA checks.

### Production
- Versioned image tags.
- Health checks and restart policies.
- Secret management via environment/secret store.
- Scheduled backup jobs.

## Operational Building Blocks

- Backup: PostgreSQL dumps + RustFS object backups.
- Restore drills: tested regularly.
- Observability: centralized logs + health endpoints.
- Security updates: image patching cadence documented.
