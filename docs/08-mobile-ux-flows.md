# 08 - Mobile-First UX Flows

## Design Principles

- One-hand usage with large touch targets and bottom actions.
- Scan-first entry from the home screen.
- Persistent scan button in the mobile navbar.
- Core tasks completed in 3 steps or less.
- Resilient behavior on unstable mobile connectivity.

## Core Flow 1 - Scan and Act

1. User taps `Scan`.
2. PWA opens camera and reads QR.
3. App resolves and displays the linked entity.
4. For items, `Stock Out` is shown as the primary action for immediate removal.
5. User can still choose secondary actions (view stock, stock in, transfer).

## Core Flow 1b - Quick Stock Out From Scan

1. User scans an item QR code from the navbar button.
2. App opens item quick-action sheet with quantity prefilled to last-used default.
3. User confirms `Stock Out` with required reason.
4. System stores movement and returns updated stock feedback.

## Core Flow 2 - Mobile Movement Booking

1. User starts from container or item detail.
2. User enters quantity and required reason for `OUT` and `ADJUSTMENT`.
3. User confirms and sees before/after stock feedback.
4. If offline, action is queued and synced later.

## Core Flow 2b - Stock In With Image Library

1. User starts `Stock In` from item detail or scan result.
2. User enters quantity.
3. User opens image picker and selects one or more images from the internal media library.
4. User confirms stock-in; movement stores links to selected media assets.

## Core Flow 4 - Offline Read + Sync

1. User opens key screens (container detail, item detail, recent movements) without connectivity.
2. App serves cached read data and clearly marks stale timestamps.
3. User submits movement actions into an offline queue.
4. App syncs queued actions automatically once connectivity returns.

## Core Flow 3 - Generate Label

1. User selects container or item.
2. User selects label template.
3. System generates PDF.
4. User opens or shares PDF for desktop printing.

## UX Quality Checks

- Scanner fallback when camera access fails (manual code input).
- Short, clear, actionable error messages.
- Phone-first layouts with graceful tablet/desktop adaptation.
- Localized copy for `de` and `en` from the first public release.
