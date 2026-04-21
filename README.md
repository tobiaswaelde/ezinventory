# EZ Inventory

![Version](https://img.shields.io/github/v/release/tobiaswaelde/ezinventory)
[![API CI](https://github.com/tobiaswaelde/ezinventory/actions/workflows/api-ci.yml/badge.svg?branch=main)](https://github.com/tobiaswaelde/ezinventory/actions/workflows/api-ci.yml)
[![App CI](https://github.com/tobiaswaelde/ezinventory/actions/workflows/app-ci.yml/badge.svg?branch=main)](https://github.com/tobiaswaelde/ezinventory/actions/workflows/app-ci.yml)
[![API Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/tobiaswaelde/ezinventory/main/.github/badges/api-coverage.json)](https://github.com/tobiaswaelde/ezinventory/actions/workflows/api-ci.yml)
[![App Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/tobiaswaelde/ezinventory/main/.github/badges/app-coverage.json)](https://github.com/tobiaswaelde/ezinventory/actions/workflows/app-ci.yml)

EZ Inventory is a mobile-first, open-source inventory system with QR workflows.

This README is written for admins who want to run EZ Inventory with Docker.

## 1) Quickstart (Docker)

Requirements:
- Docker Engine + Docker Compose plugin

Start locally:

```bash
git clone https://github.com/tobiaswaelde/ezinventory.git
cd ezinventory
cp .env.example .env
docker compose up -d --build
```

Open the app:
- App: `http://localhost:3000`
- API health: `http://localhost:3001/api/v1/health`
- API docs (Scalar): `http://localhost:3001/api/docs`

Stop services:

```bash
docker compose down
```

## 2) First Admin Login and Setup

1. Open `http://localhost:3000`.
2. Create your first account at `/auth/signup`.
3. Go to `Settings` and switch `Registration Mode` to `ADMIN_ONLY` for production.
4. Create additional users in `Settings` > `Create User (Admin)`.
5. Register your passkey in `Settings` > `Profile Security`.

## 3) What You Can Do in the App

- `Dashboard`: quick links to scanning, inventory structure, and label printing
- `Inventory`: create locations and nested containers
- `Scan`: scan/lookup item codes and run quick stock actions
- `Labels`: generate QR + barcode labels and print A4 sheets
- `Settings`: admin controls (registration mode, users, permissions, passkeys)

Full feature docs with screenshots:
- https://tobiaswaelde.github.io/ezinventory/admin-feature-tour

## 4) Environment Variables (Admin Essentials)

Main variables used in Docker setup:
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGIN`: CORS allowed origin(s), `*` for local dev
- `NUXT_PUBLIC_API_BASE_URL`: app -> API URL
- `AUTH_ACCESS_TOKEN_SECRET`: JWT access secret
- `AUTH_REFRESH_TOKEN_SECRET`: JWT refresh secret
- `AUTH_PASSKEY_RP_ID`: passkey relying party id
- `AUTH_PASSKEY_ORIGIN`: passkey origin URL

Templates:
- Root: `.env.example`
- API: `apps/api/.env.example`
- Deployment: `.env.deploy.example`

## 5) Documentation for Admins

- Docs landing page: `docs/index.md`
- Admin quickstart: `docs/admin-quickstart.md`
- Feature tour with screenshots: `docs/admin-feature-tour.md`
- Operations runbook: `docs/operations.md`
- Architecture reference: `docs/architecture.md`

Run docs locally:

```bash
pnpm install
pnpm docs:dev
```

## 6) Useful Admin Commands

Rebuild and restart after updates:

```bash
git pull
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f api
docker compose logs -f app
```

Run screenshot generator for docs:

```bash
pnpm docs:screenshots
```

## 7) Project Structure

- `apps/api` - NestJS API
- `apps/app` - Nuxt app (PWA)
- `packages/contracts` - generated OpenAPI contracts
- `docs` - VitePress documentation

## Community

- Contributing: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- License: `LICENSE`
