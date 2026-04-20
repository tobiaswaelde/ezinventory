# 03 - Architecture

## Selected Stack

- **Backend:** NestJS
- **Frontend:** Nuxt 3 + Nuxt UI (PWA)
- **File service:** RustFS (image uploads/downloads)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Documentation:** README + VitePress (GitHub Pages)

## High-Level Design

1. The Nuxt PWA consumes the NestJS API.
2. NestJS handles auth, business logic, and database access through Prisma.
3. Image files are stored in RustFS, while metadata is stored in PostgreSQL.
4. PostgreSQL is the source of truth for inventory data, movements, and audits.
5. The label service generates PDF output server-side for download/printing.
6. Auth supports password and passkey (WebAuthn) sign-in.
7. A setup mode allows initial admin bootstrap and sets registration policy.
8. User language preference is persisted in the user profile and loaded on sign-in.
9. Theme preference is persisted client-side via local storage (cookie fallback).
10. Icon metadata for entities is persisted in PostgreSQL and rendered through a shared icon registry.

## Architecture Principles

- Mobile-first: all core workflows optimized for phone usage.
- API-first: all product capabilities exposed through versioned API endpoints.
- Validation-first: all write paths validated on client and server.
- Transaction safety: movement + audit consistency guaranteed.
- Modular growth: scanner and labels isolated as dedicated modules.
- Open-source friendly: maintainable folder structure and docs.
- i18n-ready frontend: text resources managed via locale files (`de`, `en`).

## Suggested Backend Modules

- `auth` (password + passkey/WebAuthn, JWT, refresh tokens)
- `authorization` (CASL ability builder, policy checks, permission guards)
- `setup` (first-admin bootstrap, registration policy)
- `users` (user administration)
- `locations`
- `containers` (freely nested hierarchy)
- `items`
- `stock`
- `movements` (IN/OUT/TRANSFER/ADJUSTMENT)
- `attachments` (RustFS integration + metadata)
- `media-library` (curated image catalog, tagging, search, picker support)
- `icon-registry` (allowed icon set validation, icon metadata normalization)
- `barcode` (QR generation, parse, resolve)
- `labels` (PDF templates, batch export)
- `reports` (low stock, movement timeline, inventory variance)
- `audit` (central audit events)
- `api-docs` (OpenAPI generation + Scalar UI publication)
- `validation` (global request validation pipeline and shared validation rules)

## Suggested Frontend Modules

- `mobile-shell` (bottom navigation, persistent scan button, connectivity hints)
- `auth` (password login, passkey enrollment/login)
- `scan` (camera scanner + manual fallback + result action shortcuts)
- `inventory` (container tree, stock views, search)
- `icon-picker` (search and select Tabler/Lucide icons for supported entities)
- `movement` (2-3 step transaction flows)
- `media-library` (image gallery, filters, picker modal during stock-in)
- `labels` (template selection, batch export)
- `settings` (users, roles, base data)
- `preferences` (language selector synced with user profile, theme selector stored locally)
- `permissions` (ability matrix editor, role/user policy assignment)
- `setup` (initial admin signup and registration mode toggle)
- `i18n` (locale switching, translation keys)

## Mobile Navigation Baseline

- A persistent QR scan button is available in the mobile navbar on key app views.
- Scan result pages for items expose a primary `Stock Out` action.
- Additional actions (`Stock In`, `Transfer`, `View History`) remain available as secondary actions.
- Stock-in flow includes a quick image picker from the internal image library.

## API Guidelines

- Versioning via `/api/v1`
- Consistent error response structure
- DTO validation via `class-validator`
- ID format standard: UUID v4 for all resource identifiers
- Cursor pagination for list endpoints
- Idempotency keys for critical write operations
- OpenAPI spec as single source of truth, rendered via Scalar
- Full documentation coverage for all endpoints and all DTOs
- Server-side validation via global NestJS validation pipes
- Client-side form/input validation before request submission

## Persistence Conventions

- Prisma models use UUID v4 as the only ID strategy for primary and foreign keys.

## Security Baseline

- Password hashing via `argon2`
- Passkey support via WebAuthn
- JWT access + refresh token flow
- CASL-based fine-grained authorization guards in NestJS
- Rate limiting on auth and scan endpoints
- Upload validation (MIME type, file size, extension checks)
