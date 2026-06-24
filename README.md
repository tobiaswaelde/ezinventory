# EZ Inventory

## API Docker deployment

For the API, the recommended Docker setup is:

- build a small production image that only runs the API
- run database migrations separately during deployment
- do not run migrations automatically every time the API container starts

This keeps the runtime image smaller and avoids a common deployment problem: if multiple API containers start at the same time, they could all try to run the same migration job.

Recommended deployment flow:

1. Build and publish the API image.
2. Run `pnpm prisma migrate deploy` once as a separate deployment step or one-off container.
3. Start the API containers normally.

In practice, that means the API container should focus on one responsibility only: serving the application. Schema changes should be handled by CI/CD or a dedicated migration command.

Example:

```bash
docker build -f apps/api/Dockerfile --target runner -t ezinventory-api .
docker build -f apps/api/Dockerfile --target migrator -t ezinventory-api-migrator .

docker run --rm ezinventory-api-migrator
docker run -d -p 3001:3001 ezinventory-api
```

If you use Docker Compose instead of a separate migrator image, run the migration as a one-off command before starting the API service:

```bash
docker compose run --rm api pnpm prisma migrate deploy
docker compose up -d api
```

## Required environment variables

### API

These variables should be set for the API container:

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | yes | `production` | Runs the API in production mode |
| `PORT` | no | `3001` | Internal API port. Defaults to `3001` |
| `DATABASE_URL` | yes | `postgresql://postgres:postgres@db:5432/ezinventory?schema=public` | Main PostgreSQL connection |
| `SHADOW_DATABASE_URL` | yes | `postgresql://postgres:postgres@db:5432/ezinventory?schema=prisma` | Shadow database or schema for Prisma migrations |
| `S3_ENDPOINT` | yes | `http://rustfs:9000` | Object storage endpoint for file uploads |
| `S3_ACCESS_KEY_ID` | yes | `admin` | Object storage access key |
| `S3_SECRET_KEY` | yes | `admin` | Object storage secret key |
| `AUTH_JWT_SECRET` | yes | `change-this-to-a-long-random-secret` | Secret used to sign JWTs |
| `AUTH_JWT_ISSUER` | no | `ezinventory-api` | JWT issuer. Helpful to set explicitly in production |
| `AUTH_JWT_EXPIRATION` | no | `7d` | JWT lifetime. Defaults to `7d` |
| `AUTH_BCRYPT_ROUNDS` | no | `12` | Password hashing cost. Defaults to `12` |
| `AUTH_RP_NAME` | no | `EZ Inventory` | Display name used for passkey / WebAuthn flows |
| `CORS_ORIGIN` | yes | `http://localhost:3000` | Allowed frontend origin |
| `API_BASE_URL` | yes | `http://localhost:3001` | Public base URL of the API |
| `APP_BASE_URL` | yes | `http://localhost:3000` | Public base URL of the web app |
| `INIT_ADMIN_EMAIL` | yes | `admin@example.com` | Initial admin account email |
| `INIT_ADMIN_PASSWORD` | yes | `change-me` | Initial admin account password |

Notes:

- `DATABASE_URL` and `SHADOW_DATABASE_URL` should point to separate databases in production.
- `INIT_ADMIN_EMAIL` and `INIT_ADMIN_PASSWORD` are used to bootstrap the first admin user.
- `AUTH_JWT_SECRET` should be a long random secret and must not stay at a development default.

### Web

These variables are relevant for the web container:

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `NUXT_PUBLIC_API_BASE_URL` | yes | `http://localhost:3001` | Public base URL used by the frontend to call the API |
| `NUXT_PUBLIC_APP_BASE_URL` | recommended | `http://localhost:3000` | Public base URL of the web app |
| `APP_VERSION` | no | `1.2.3` | Shown in the app. Falls back to package version |
| `GITHUB_TOKEN` or `NUXT_GITHUB_TOKEN` | optional | `ghp_...` | Enables authenticated GitHub API access for release/changelog data |
| `GITHUB_REPO_OWNER` or `NUXT_GITHUB_REPO_OWNER` | no | `tobiaswaelde` | GitHub repository owner |
| `GITHUB_REPO_NAME` or `NUXT_GITHUB_REPO_NAME` | no | `ezinventory` | GitHub repository name |
| `NUXT_UI_PRO_LICENSE` | optional | `<license>` | Build-time license for Nuxt UI Pro, if used |

Notes:

- The web app needs `NUXT_PUBLIC_API_BASE_URL` to talk to the API.
- GitHub variables are only needed for features that load release information from GitHub.
- `NUXT_UI_PRO_LICENSE` is a build argument for the current web Docker image, not a normal runtime requirement.

## Example compose.yaml

This is a minimal example that starts PostgreSQL, RustFS, the API, and the web app together:

```yaml
name: ezinventory

services:
  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  rustfs:
    image: rustfs/rustfs:latest
    restart: unless-stopped
    environment:
      RUSTFS_ACCESS_KEY: admin
      RUSTFS_SECRET_KEY: admin
    volumes:
      - rustfs-data:/data
      - rustfs-logs:/app/logs
    ports:
      - "9000:9000"

  api-migrator:
    image: ezinventory-api-migrator:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:postgres@db:5432/ezinventory?schema=public
      SHADOW_DATABASE_URL: postgresql://postgres:postgres@db:5432/ezinventory?schema=prisma
    depends_on:
      - db
    profiles:
      - tools

  api:
    image: ezinventory-api:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://postgres:postgres@db:5432/ezinventory?schema=public
      SHADOW_DATABASE_URL: postgresql://postgres:postgres@db:5432/ezinventory?schema=prisma
      S3_ENDPOINT: http://rustfs:9000
      S3_ACCESS_KEY_ID: admin
      S3_SECRET_KEY: admin
      AUTH_JWT_SECRET: change-this-to-a-long-random-secret
      AUTH_JWT_ISSUER: ezinventory-api
      AUTH_JWT_EXPIRATION: 7d
      AUTH_BCRYPT_ROUNDS: 12
      AUTH_RP_NAME: EZ Inventory
      CORS_ORIGIN: http://localhost:3000
      API_BASE_URL: http://localhost:3001
      APP_BASE_URL: http://localhost:3000
      INIT_ADMIN_EMAIL: admin@example.com
      INIT_ADMIN_PASSWORD: change-me
    depends_on:
      - db
      - rustfs
    ports:
      - "3001:3001"

  web:
    image: ezinventory-web:latest
    restart: unless-stopped
    environment:
      NUXT_PUBLIC_API_BASE_URL: http://localhost:3001
      NUXT_PUBLIC_APP_BASE_URL: http://localhost:3000
      GITHUB_REPO_OWNER: tobiaswaelde
      GITHUB_REPO_NAME: ezinventory
    depends_on:
      - api
    ports:
      - "3000:3000"

volumes:
  postgres-data:
  rustfs-data:
  rustfs-logs:
```

Suggested startup flow:

```bash
docker compose --profile tools run --rm api-migrator
docker compose up -d
```

For the `web` service, replace `ezinventory-web:latest` with your published image or local build tag.
Do the same for `ezinventory-api:latest` and `ezinventory-api-migrator:latest` if you use different tags in your registry or local environment.

## Settings
- main usage type (changes i18n placeholders, texts, and behavior of the app)
  - warehouse
  - home management
    - disable receive/dispatch status
    - allow store/retrieve without confirmation
- import/export only with delivery note

## Models

### User
- users can signin with email and password
- optional enable MFA

### Warehouses
- warehouses divide the inventory into multiple locations
- meta
  - name (unique, e.g. "home")
  - description
  - icon
  - color
  - location (address)
  - image
  - type (warehouse, home)
- warehouses can have multiple users with different roles
  - admin: full access
  - manager: can manage warehouse storages
  - member: can read details about the warehouse

### Storages
- storages devide the inventory into multiple shelfs
- relations
  - warehouse
- meta
  - name (unique, e.g. "fridge")
  - description
  - icon
  - color
  - type (e.g. Box, Fridge, Cabinet, ...)
  - location (e.g. room, level)
  - image
- storages can have multiple users with different roles
  - admin: full access
  - manager: can manage the storage and shelf places
  - member: can read details about the storage

### Shelf place
- shelf places are the actual places where items are stored
- relations
  - storage
- meta
  - name (unique, e.g. "drawer 1")
  - description
  - icon
  - color
  - type (e.b. box, drawer, shelf place)
  - image

### Inventory Items
- these are the actual items in the inventory
- relations
  - warehouse
  - storage
  - shelf place
- meta  
  - status (ordered, incoming/receive, outgoing/dispatch, in stock)
  - type (single item, mass item)
  - name
  - description
  - article number
  - image
  - amount (number of items for mass articles)
