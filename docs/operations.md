# Operations

## CI

- API lint/test workflows
- App lint/test workflows
- Coverage upload to Codecov

## Container Images

- `ghcr.io/tobiaswaelde/ezinventory-api`
- `ghcr.io/tobiaswaelde/ezinventory-app`

Images are built and pushed via:

- `.github/workflows/deploy-ghcr.yml`
- GHCR deployment manifest: `compose.ghcr.yaml`
- Deployment env template: `.env.deploy.example`

## Rollout / Rollback

See runbook:

- `.ai/14-deployment-runbook.md`

## Releases

- Release and versioning process: `/release-strategy`
