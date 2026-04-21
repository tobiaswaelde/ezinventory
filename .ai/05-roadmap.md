# 05 - Roadmap (5 Sprints)

## Sprint 1 - Foundation

- Monorepo baseline (`web`, `api`, `.ai`)
- Docker Compose (`web`, `api`, `postgres`, `rustfs`)
- NestJS + Prisma + initial migration
- Nuxt + Nuxt UI + PWA bootstrap
- Auth baseline (password + passkey, JWT, roles)
- Authorization baseline with CASL ability checks
- API docs baseline with OpenAPI + Scalar setup
- Shared validation baseline (client + server)
- Initial setup flow (first admin signup + registration mode setting)
- CI setup (lint, test, build)

## Sprint 2 - Container & Inventory Core

- CRUD for locations, containers, categories, items
- Freely nested container hierarchy
- Stock per container
- Movement booking (`IN`, `OUT`, `TRANSFER`, `ADJUSTMENT`)
- Transaction-safe booking logic

## Sprint 3 - Mobile Scanner Flows

- PWA QR scanner integration (camera)
- Persistent mobile navbar scan button across core views
- Scan -> entity resolve -> action flow
- Item quick stock-out action directly from scan result
- Mobile-first booking UX (2-3 steps)
- Offline queue for pending writes
- Offline read views for critical inventory screens

## Sprint 4 - Labels, Media, Reporting

- RustFS image uploads with validation and thumbnails
- Internal image library with tagging and search
- Stock-in image picker wired to media library assets
- QR label generator with PDF export (`A4_GRID` MVP template)
- Low-stock and movement timeline reports

## Sprint 5 - Hardening & Docs

- Audit log hardening
- Permission model finalization
- Expanded API and E2E tests
- Scalar coverage audit for all endpoints and DTOs
- Validation hardening tests for client and server paths
- VitePress docs for GitHub Pages
- Root README badges (version, coverage, workflow status)
- Backup/restore playbook
- i18n completion for initial locales (`de`, `en`)
