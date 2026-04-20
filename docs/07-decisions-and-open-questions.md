# 07 - Decision Log

## Confirmed Decisions

1. App delivery: **PWA** (mobile-first).
2. Code format: **QR**.
3. Label output: **PDF export + desktop printing**.
4. Container hierarchy: **freely nested**.
5. Tenancy model: **single-tenant**.
6. QR coverage: **containers and items**.
7. MVP label template: **A4_GRID**.
8. Movement reason is required for **OUT** and **ADJUSTMENT**.
9. Offline support includes **queued writes and offline read views**.
10. Auth includes **passkeys (WebAuthn)**.
11. Initial admin signup is open during first setup only.
12. After setup, admin controls whether registration stays open or is admin-only.
13. Mobile navbar includes a **persistent scan button** on core screens.
14. Scan result for items exposes **immediate stock-out** as primary action.
15. Items support **size metadata** including optional servings.
16. MVP includes an internal **image library** for reusable inventory photos.
17. `Stock In` flow can select images directly from the image library.
18. Authorization uses **fine-grained CASL abilities** instead of role-only checks.
19. Language preference is persisted per user profile.
20. Theme preference is persisted client-side (local storage, cookie fallback).
21. Images can be attached to storage locations and containers.
22. Icon selection is available across key entities.
23. Icon sources are Tabler and Lucide.
24. API documentation uses Scalar with full endpoint and DTO coverage.
25. Input validation is mandatory on both client and server.
26. All IDs are UUID v4 only.

## Confirmed Technical Direction

1. Images are stored in RustFS; metadata is stored in PostgreSQL.
2. Deployment is fully containerized with Docker.
3. Product docs live in repo README + VitePress on GitHub Pages.
4. Product must be open-source-ready (clear docs, contributor onboarding).
5. UI must support i18n with initial locales: `de`, `en`.
