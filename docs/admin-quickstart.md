# Admin Quickstart (Docker)

This guide is for administrators who want to run EZ Inventory on a server using Docker Compose.

## Prerequisites

- Docker Engine installed
- Docker Compose plugin installed
- A host with open ports `3000` (app) and `3001` (api)

## 1. Start EZ Inventory

```bash
git clone https://github.com/tobiaswaelde/ezinventory.git
cd ezinventory
cp .env.example .env
docker compose up -d --build
```

Check status:

```bash
docker compose ps
```

Expected services:
- `app` (Nuxt frontend)
- `api` (NestJS backend)
- `postgres`
- `rustfs`

## 2. Open URLs

- App: `http://localhost:3000`
- API docs: `http://localhost:3001/api/docs`
- Health check: `http://localhost:3001/api/v1/health`

## 3. Complete First-Time Admin Setup

1. Open `/auth/signup` and create the first account.
2. Sign in and open `Settings`.
3. Set `Registration Mode` to `ADMIN_ONLY`.
4. Create team members in `Create User (Admin)`.
5. Optionally register a passkey in `Profile Security`.

## 4. Core Admin Configuration

### Required environment settings

For production-like setups, review these values:

- `DATABASE_URL`
- `AUTH_ACCESS_TOKEN_SECRET`
- `AUTH_REFRESH_TOKEN_SECRET`
- `AUTH_PASSKEY_RP_ID`
- `AUTH_PASSKEY_ORIGIN`
- `CORS_ORIGIN`

Template files:
- `.env.example`
- `apps/api/.env.example`
- `.env.deploy.example`

## 5. Daily Admin Commands

Update and redeploy:

```bash
git pull
docker compose up -d --build
```

Read logs:

```bash
docker compose logs -f app
docker compose logs -f api
```

Stop everything:

```bash
docker compose down
```

## 6. Next Step

Continue with [Admin Feature Tour](/admin-feature-tour) for screenshots and detailed explanations of each function.
