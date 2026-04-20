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
- [ ] Production-ready JWT access/refresh token flow
- [ ] Refresh token rotation/invalidation
- [ ] CASL-based fine-grained authorization
- [ ] Complete endpoint + DTO coverage in Scalar docs
- [ ] Full server-side validation coverage for all modules

## 3. App (Nuxt, Mobile-First, PWA)

- [x] Initial app shell and page structure
- [ ] Mobile-first UI pass for MVP screens
- [ ] PWA installability/offline caching finalization
- [ ] Full client-side input validation coverage
- [ ] i18n integration (`de`, `en`)
- [ ] Persist language per user profile
- [ ] Persist theme in local storage or cookies

## 4. Inventory Domain Features

- [ ] Multi-location support (end-to-end)
- [ ] Freely nested containers/locations
- [ ] Item size/portion support (e.g. freezer use case)
- [ ] Quick stock-out actions from scanned item view
- [ ] QR scanner button in navigation
- [ ] Barcode/QR label generation
- [ ] A4 grid PDF export for labels
- [ ] Desktop printer-friendly flow

## 5. Media & Assets

- [ ] RustFS integration for image storage
- [ ] Image uploads for items
- [ ] Image uploads for storage places/containers
- [ ] Personal image library for quick selection during storage
- [ ] Icon picker support (Tabler/Lucide)

## 6. Setup & User Management

- [x] Initial setup/admin bootstrap baseline
- [ ] Passkey UX flow completion in frontend
- [ ] Registration mode switch after initial setup
- [ ] Option to disable public signup and create users only via UI
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

