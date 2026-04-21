# 14 - Deployment Runbook (GHCR)

## Scope

This runbook documents image build/push and rollout basics for:

- `ghcr.io/tobiaswaelde/ezinventory-api`
- `ghcr.io/tobiaswaelde/ezinventory-app`

Workflow: `.github/workflows/deploy-ghcr.yml`

Deployment manifest (GHCR images): `compose.ghcr.yaml`
Environment template: `.env.deploy.example`

## Image Tagging Strategy

- `main`: latest build from `main`
- `sha-<shortsha>`: immutable commit snapshot
- `v*` tag: release image when pushing semantic tags

## Required GitHub Permissions

- `packages: write` for workflow token
- repository must allow GHCR package publishing

## Runtime Secrets / Env

### API

- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `AUTH_ACCESS_TOKEN_SECRET`
- `AUTH_REFRESH_TOKEN_SECRET`
- `AUTH_ACCESS_TOKEN_TTL`
- `AUTH_REFRESH_TOKEN_TTL`
- `AUTH_PASSKEY_RP_ID`
- `AUTH_PASSKEY_RP_NAME`
- `AUTH_PASSKEY_ORIGIN`

### App

- `NUXT_PUBLIC_API_BASE_URL`

## Compose Deployment (GHCR)

1. Copy env template:
   - `cp .env.deploy.example .env.deploy`
2. Set production secrets and endpoints in `.env.deploy`.
3. Deploy pinned image tag:
   - `EZINV_IMAGE_TAG=sha-<shortsha> docker compose --env-file .env.deploy -f compose.ghcr.yaml pull`
   - `EZINV_IMAGE_TAG=sha-<shortsha> docker compose --env-file .env.deploy -f compose.ghcr.yaml up -d`
4. Verify health:
   - `docker compose -f compose.ghcr.yaml ps`
   - `curl http://<host>:3001/api/v1/health`

## Rollout Strategy

1. Select immutable image tag (`sha-*` or release tag).
2. Deploy API first.
3. Run health check: `/api/v1/health`.
4. Deploy app with matching API base URL.
5. Verify login, auth refresh, and core inventory paths.

## Rollback Strategy

1. Keep previous known-good `sha-*` tag for both images.
2. If regression occurs:
   - roll back API to previous tag
   - roll back app to previous tag
3. Re-run smoke checks:
   - `/api/v1/health`
   - sign-in flow
   - create/read inventory entities
4. Rollback command (example):
   - `EZINV_IMAGE_TAG=sha-<previous> docker compose --env-file .env.deploy -f compose.ghcr.yaml up -d`

## Notes

- Prefer immutable `sha-*` tags for production rollouts.
- Use `main` only for non-critical or staging-like environments.
