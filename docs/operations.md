# Operations (Admin)

This page is the practical runbook for admins operating EZ Inventory with Docker.

## Service Health

Check if services are up:

```bash
docker compose ps
```

Check API health endpoint:

```bash
curl -s http://localhost:3001/api/v1/health
```

## Logs

Follow app/API logs:

```bash
docker compose logs -f app
docker compose logs -f api
```

## Updates and Rollouts

Pull latest changes and redeploy:

```bash
git pull
docker compose up -d --build
```

## Rollback

Use your previous Git commit/tag and redeploy:

```bash
git checkout <tag-or-commit>
docker compose up -d --build
```

## Environment Management

Review these files before deployment:
- `.env.deploy.example`
- `compose.ghcr.yaml`

Common sensitive values to set securely:
- `AUTH_ACCESS_TOKEN_SECRET`
- `AUTH_REFRESH_TOKEN_SECRET`
- database credentials

## Backups

At minimum, back up:
- PostgreSQL data volume
- RustFS storage data
- `.env` files and deployment manifests

## References

- Release strategy: [/release-strategy](/release-strategy)
- Architecture reference: [/architecture](/architecture)
