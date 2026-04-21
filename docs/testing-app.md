# App Testing

Frontend tests are split into unit tests (Vitest) and end-to-end tests (Playwright).

## Local

Install dependencies first:

```bash
pnpm install
```

Run unit tests:

```bash
pnpm --filter @ezinventory/app test:unit
```

Run unit tests with coverage:

```bash
pnpm --filter @ezinventory/app test:coverage
```

Run E2E tests:

```bash
pnpm --filter @ezinventory/app test
```

Run focused happy-path E2E:

```bash
pnpm --filter @ezinventory/app exec playwright test e2e/happy-path.spec.ts
```

Run E2E tests in headed mode:

```bash
pnpm --filter @ezinventory/app test:e2e:headed
```

## CI

Workflow: `.github/workflows/app-ci.yml`

CI sequence:

1. Install dependencies with `pnpm install --frozen-lockfile`
2. Prepare Nuxt with `pnpm --filter @ezinventory/app exec nuxt prepare`
3. Run unit tests with coverage (`test:coverage`)
4. Upload `apps/app/coverage/lcov.info` to Codecov (`flag=app`)
5. Install Playwright Chromium runtime
6. Run E2E tests (`test`)

## Coverage

Vitest coverage is configured in `apps/app/vitest.config.ts`:

- provider: `v8`
- reporters: `text`, `lcov`
- threshold target: `100%` for statements, branches, functions, lines

LCOV output for CI upload:

- `apps/app/coverage/lcov.info`
