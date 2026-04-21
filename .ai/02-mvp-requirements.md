# 02 - MVP Requirements

## Functional Requirements

1. Users can sign in and use the system based on fine-grained permissions.
2. Users can sign in with passkeys (WebAuthn) in addition to password login.
3. Initial system setup allows admin signup when no admin exists.
4. After initial setup, admins can choose whether self-registration remains enabled or users are only created via admin UI.
5. Admins can manage fine-grained permissions (abilities) for roles and selected users.
6. Users can create and manage locations.
7. Users can create and manage freely nested containers (shelf, box, fridge, bin, custom).
8. Users can create and edit items with SKU, category, and metadata.
9. The system shows stock per item and container.
10. Users can record stock movements:
   - IN (stock in)
   - OUT (stock out)
   - TRANSFER (between containers)
   - ADJUSTMENT (manual correction)
11. Movement reason is required for `ADJUSTMENT` and `OUT`.
12. Every movement is stored with full audit context (who, when, why).
13. Users can search and filter items, containers, and movements.
14. Users can attach images to locations/containers/items/movements (stored in RustFS).
15. Users can scan QR codes and directly resolve both container and item entities.
16. The mobile navigation includes a persistent scan button for fast QR access.
17. After scanning, the resolved item view provides direct stock-out actions without extra navigation.
18. Items can store size information (e.g. package size) and optional serving count metadata.
19. The system provides an internal image library where uploaded images can be browsed and selected during stock-in.
20. Users can generate QR labels as PDF files for desktop printing using `A4_GRID` as MVP default.
21. The system provides basic reports (low stock, movement history).
22. Users can store their preferred UI language on their user profile.
23. Users can store selected UI theme client-side (local storage, with cookie fallback).
24. Users can select icons for key entities (location, container, category, item).
25. Icon picker supports Tabler and Lucide icon sets.
26. API documentation covers all endpoints and all DTOs via Scalar.
27. Input validation is enforced on both client and server.

## Non-Functional Requirements

- UI approach: Mobile-first PWA
- API design: REST (versioned, e.g. `/api/v1`)
- API documentation: Scalar with complete endpoint and DTO coverage
- Security: JWT + refresh tokens, CASL-based ability authorization
- Data integrity: transaction safety for stock movements
- Performance: responsive mobile workflows for core actions
- Observability: structured logs, request IDs, error tracking readiness
- Deployment: Docker-based
- Documentation: repository README + VitePress on GitHub Pages
- Internationalization: i18n-ready with initial locales `de` and `en`
- Language preference persistence: stored per user account
- Theme preference persistence: stored client-side (local storage, cookie fallback)
- Tenancy model: single-tenant for MVP
- Validation strategy: client-side form validation plus server-side DTO/payload validation
- Identifier strategy: all entity IDs use UUID v4 only

## MVP Acceptance Criteria

- Core workflows (container management, QR scan, stock booking, history view) are stable on mobile devices.
- The scan action is available from the mobile navbar on all core screens.
- Scan result screens allow immediate stock-out for resolved items.
- Stock-in flow supports selecting images from the internal image library.
- Images can be attached to locations and containers in addition to items and movements.
- Role permissions prevent unauthorized actions.
- Fine-grained permission rules are enforceable and test-covered in API and UI.
- Movement history is complete and traceable.
- Passkey login is available and usable for supported devices.
- Initial admin bootstrap is only available before first admin creation.
- Registration mode can be configured by admins after setup.
- PDF label export is practical for desktop printing with `A4_GRID`.
- QR flows work for both containers and items.
- Item forms and detail pages support size metadata (e.g. "Spaghetti sauce, 3 servings").
- Offline behavior supports queued writes and offline read views.
- Smoke tests and core API tests pass in CI.
- Scalar docs expose all API endpoints and DTO schemas without gaps.
- Invalid input is blocked both in UI forms and server request validation.
- UI text can be switched between German and English.
- Selected language persists per user across devices and sessions.
- Selected theme persists locally for returning sessions on the same device/browser.
- Entity icon selection is available and persisted for supported entities.
- All API-exposed IDs are UUID v4 values.
