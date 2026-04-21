# 01 - Product Vision & Scope

## Vision

EZ Inventory is a web-based, mobile-first inventory platform that helps teams track containers, items, and stock movements in a transparent, auditable, and efficient way.

## Open-Source Goal

The project is designed to be published as open source. That means:
- clear architecture and contribution-friendly structure
- strong documentation and onboarding guides
- predictable APIs and transparent decision records

## Target Audience

- Small to mid-sized teams (operations, IT, workshop, warehouse)
- Organizations with multiple locations and many physical storage containers

## Problem Statement

Many teams manage inventory with scattered spreadsheets or disconnected tools, leading to:
- unclear stock levels
- poor traceability of changes
- high manual effort and avoidable mistakes

## MVP Solution

- Master data for locations, containers, categories, and items
- Stock movements (IN, OUT, TRANSFER, ADJUSTMENT)
- Full movement history with actor and timestamp
- QR-based navigation and scanning workflows for containers and items
- Mobile-first UI with PWA support
- Image attachments stored in RustFS
- Label generation with PDF export for desktop printing (A4 grid as default)
- Passkey-capable authentication
- Admin bootstrap flow at first setup with configurable self-registration
- Offline support for both queued writes and read views

## Out of Scope (MVP)

- Advanced ERP/procurement integrations
- Native mobile apps
- Forecasting and advanced demand planning
