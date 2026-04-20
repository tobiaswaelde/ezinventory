# Implementation Checklist

Last updated: 2026-04-20

## 1. Foundation

- [x] Monorepo setup with `api`, `app`, `docs`
- [x] Docker compose setup (`compose.yaml`)
- [x] CI lint workflows for API and App
- [x] Import alias convention with `~/...` in API and App
- [x] Prisma upgraded and split into multiple schema files
- [x] UUID v4-only IDs in data model

## 2. API (NestJS)

- [x] Basic module structure (`health`, `setup`, `auth`, `items`, `categories`)
- [x] Env validation with `envalid`
- [x] Scalar/OpenAPI base integration
- [x] Passkey base flow (register/login options + verify)
- [x] Production-ready JWT access/refresh token flow
- [x] Refresh token rotation/invalidation
- [x] Access-token guard + authenticated `/auth/me` endpoint
- [x] CASL-based fine-grained authorization baseline
- [ ] Complete endpoint + DTO coverage in Scalar docs
- [ ] Full server-side validation coverage for all modules

## 3. App (Nuxt, Mobile-First, PWA)

- [x] Initial app shell and page structure
- [x] Frontend auth baseline (login, refresh, logout, persisted session)
- [ ] Mobile-first UI pass for MVP screens
- [ ] PWA installability/offline caching finalization
- [ ] Full client-side input validation coverage
- [ ] i18n integration (`de`, `en`)
- [ ] Persist language per user profile
- [ ] Persist theme in local storage or cookies

## 4. Inventory Domain Features

- [x] Multi-location support (end-to-end baseline)
- [x] Freely nested containers/locations (baseline)
- [x] Item size/portion support (e.g. freezer use case)
- [x] Quick stock-out actions from scanned item view (baseline)
- [x] QR scanner button in navigation
- [x] Barcode/QR label generation (baseline)
- [x] A4 grid PDF export for labels (print-to-PDF baseline)
- [x] Desktop printer-friendly flow (A4 print stylesheet baseline)

## 5. Media & Assets

- [ ] RustFS integration for image storage
- [ ] Image uploads for items
- [ ] Image uploads for storage places/containers
- [ ] Personal image library for quick selection during storage
- [ ] Icon picker support (Tabler/Lucide)

## 6. Setup & User Management

- [x] Initial setup/admin bootstrap baseline
- [x] Passkey UX flow completion in frontend (baseline implemented)
- [ ] Registration mode switch after initial setup
- [x] Option to disable public signup (API-enforced via registration mode)
- [x] Create users via dedicated admin UI flow (baseline in settings)
- [ ] User management UI with fine-grained permissions

## 7. Documentation & Open Source Readiness

- [x] Core planning docs in English
- [ ] Root README badges finalized (version, coverage, workflow status)
- [ ] VitePress docs site setup and publishing via GitHub Pages
- [ ] Contributor guide (`CONTRIBUTING.md`)
- [ ] Security policy and issue templates
- [ ] License and release/versioning strategy

## 8. Testing & Quality

- [ ] API unit tests
- [ ] API integration tests
- [ ] App component/unit tests
- [ ] End-to-end happy path tests (setup, login, scan, stock-out)
- [ ] Coverage reporting in CI
