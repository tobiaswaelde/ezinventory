# AGENT.md

## Purpose
This file captures project-specific guardrails for future coding agents working on EZ Inventory.

## Product Context
- Open-source inventory management platform.
- Mobile-first PWA with QR-first workflows.
- Single-tenant MVP.

## Core Stack
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Nuxt 3 + Nuxt UI (PWA)
- Media storage: RustFS
- API docs: Scalar (must include all endpoints and all DTOs)

## Hard Requirements
- All primary and foreign keys are UUID v4.
- Authorization is fine-grained via CASL (not role-only checks).
- Input validation is mandatory on both client and server.
- Language preference is stored per user profile.
- Theme preference is client-side (localStorage, cookie fallback).
- Support images for locations, containers, items, and movements.
- Support icon selection for key entities using Tabler/Lucide sets.

## Implementation Priorities
1. Foundation: monorepo layout (`apps/api`, `apps/app`, `packages`), Docker, CI basics.
2. API baseline: auth, validation pipe, Scalar integration, Prisma schema.
3. UI baseline: mobile shell with persistent scan button.
4. Core inventory domain: locations, containers, items, stock, movements.

## Documentation Expectations
- Keep root `README.md` updated.
- Maintain planning docs under `.ai/`.
- Keep architecture and data model docs aligned with implementation changes.
