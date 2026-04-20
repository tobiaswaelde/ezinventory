# Nx Evaluation for EZ Inventory

Last updated: 2026-04-20

## Current State

- Monorepo with 2 apps (`api`, `app`)
- Package manager: `pnpm`
- Root scripts use recursive execution (`pnpm -r`)
- CI currently has separate lint workflows for API and App

## Is Nx useful here?

### Short answer

Yes, but it is **not mandatory yet** at the current project size.

### Why it can help later

- Task graph awareness (`affected`) for faster CI
- Local + remote caching for build/lint/test
- Better scalability when adding shared libs, e2e apps, docs apps, workers
- Consistent code generation and workspace conventions

### Why it is optional now

- Only 2 projects so far
- Current `pnpm` setup is simple and already works well
- Nx adds tooling/config complexity before the bigger scale benefits are fully felt

## Recommendation

- Keep current setup for now.
- Re-evaluate Nx when one of these happens:
  - 3+ runnable projects (e.g. docs app, worker, e2e app)
  - shared internal libraries are introduced
  - CI times become a pain point
  - remote caching becomes a clear productivity win

## Migration Paths

## Path A: Adopt Nx now (lightweight)

Goal: minimal disruption, keep current scripts, add Nx incrementally.

1. Initialize Nx in existing workspace (`pnpm dlx nx@latest init`)
2. Enable inferred tasks (Project Crystal) for `api` and `app`
3. Add root targets:
   - `nx run-many -t lint`
   - `nx run-many -t build`
   - `nx run-many -t test`
4. Update CI:
   - replace separate job commands with `nx affected -t lint`
   - optionally add `build`/`test` affected jobs
5. Add remote cache (Nx Cloud) once CI usage is stable

## Path B: Defer Nx (recommended now)

Goal: avoid extra complexity until it provides clear value.

1. Keep `pnpm -r` scripts
2. Continue per-app workflows
3. Add shared libs first when needed (`packages/` or `libs/`)
4. Introduce Nx right before/when:
   - shared libs + cross-project dependency graph matter
   - affected-only CI would save meaningful minutes

## Suggested Decision

- **Now:** stay on `pnpm` only
- **Later trigger:** migrate to Nx when MVP expands beyond `api` + `app`
