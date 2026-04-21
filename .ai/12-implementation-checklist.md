# Implementation Checklist

Last updated: 2026-04-21

## 1. Foundation

- [x] Monorepo setup with `api`, `app`, `.ai`
- [x] Docker compose setup (`compose.yaml`)
- [x] CI lint workflows for API and App
- [x] GHCR image pipeline for App/API (workflow + container images)
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
- [x] Core controllers enriched with operation + error response OpenAPI metadata
- [x] Required DTO fields hardened with `IsNotEmpty` across auth/setup/core domain payloads

## 3. App (Nuxt, Mobile-First, PWA)

- [x] Initial app shell and page structure
- [x] Frontend auth baseline (login, refresh, logout, persisted session)
- [x] Mobile-first UI pass for MVP screens
- [x] PWA installability/offline caching finalization
- [ ] Full client-side input validation coverage
- [x] Auth form validation extracted into shared client validation utilities + unit tests
- [x] i18n integration (`de`, `en`) (baseline)
- [x] Persist language per user profile (baseline)
- [x] Persist theme in local storage or cookies

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

- [x] RustFS integration baseline (API storage health + config wiring)
- [ ] Image uploads for items
- [ ] Image uploads for storage places/containers
- [ ] Personal image library for quick selection during storage
- [ ] Icon picker support (Tabler/Lucide)

## 6. Setup & User Management

- [x] Initial setup/admin bootstrap baseline
- [x] Passkey UX flow completion in frontend (baseline implemented)
- [x] Registration mode switch after initial setup
- [x] Option to disable public signup (API-enforced via registration mode)
- [x] Create users via dedicated admin UI flow (baseline in settings)
- [x] User management UI with fine-grained permissions (CASL policy baseline)

## 7. Documentation & Open Source Readiness

- [x] Core planning docs in English
- [x] Root README badges finalized (version, coverage, workflow status)
- [x] VitePress docs site setup and publishing via GitHub Pages
- [x] Contributor guide (`CONTRIBUTING.md`)
- [x] Security policy and issue templates
- [x] License and release/versioning strategy

## 8. Testing & Quality

- [x] API unit tests
- [ ] API integration tests
- [x] App component/unit tests
- [x] End-to-end happy path tests (setup, login, scan, stock-out)
- [x] Coverage reporting in CI
- [x] Coverage gates enforced in CI test runs
