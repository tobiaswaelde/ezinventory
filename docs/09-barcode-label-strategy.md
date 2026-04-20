# 09 - Barcode/QR and Label Strategy

## QR Strategy

- QR codes are required for both containers and items.
- QR values are globally unique across all supported entity types.
- QR payload should use a stable resolver key, not raw numeric IDs.

## Scanner Component

- Camera-based scanning in the PWA.
- Debounce and duplicate-read guard.
- Successful scan resolves via `/api/v1/barcode/resolve`.
- Failure path supports manual entry and recent scan history.

## Label Generator

- Backend generates PDF including QR + human-readable metadata.
- MVP template:
  - `A4_GRID` (multiple labels per page)
- Future templates (post-MVP):
  - `SINGLE_LABEL` (single large label)
- Batch export for multiple containers/items in one PDF.

## Printing Strategy

- Primary workflow: export PDF from app and print on desktop.
- Print-safe layout (high contrast, safe margins).
- PDF preview before export.

## Open-Source Note

Template definitions should be configurable in code so contributors can add custom formats without changing core movement logic.
