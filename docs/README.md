# EZ Inventory - Planning Documents

These documents define the project baseline for building **EZ Inventory** as an open-source inventory management platform.

## Index

1. [Product Vision & Scope](./01-product-vision.md)
2. [MVP Requirements](./02-mvp-requirements.md)
3. [Architecture](./03-architecture.md)
4. [Data Model](./04-data-model.md)
5. [Roadmap](./05-roadmap.md)
6. [Prioritized MVP Backlog](./06-mvp-backlog.md)
7. [Decision Log & Open Questions](./07-decisions-and-open-questions.md)
8. [Mobile-First UX Flows](./08-mobile-ux-flows.md)
9. [Barcode/QR and Label Strategy](./09-barcode-label-strategy.md)
10. [Docker & Deployment Blueprint](./10-docker-deployment.md)
11. [Documentation with README + VitePress](./11-documentation-vitepress.md)

## Current Direction

- Manage inventory containers (shelves, boxes, fridges, bins) across multiple locations
- Support freely nested container hierarchies
- Store images in RustFS
- Mobile-first product delivered as a PWA
- Integrated QR scanner
- Integrated QR label generator with PDF export for desktop printing
- Docker-first hosting strategy
- Open-source-ready documentation and developer onboarding

## Localization

The application and documentation should be localization-ready from day one.
Initial supported languages:
- German (`de`)
- English (`en`)
