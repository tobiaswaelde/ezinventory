# Contributing

Thanks for contributing to EZ Inventory.

## Development Setup
1. Install dependencies: `pnpm install`
2. Generate contracts: `pnpm contracts:generate`
3. Start dev mode: `pnpm dev`

## Project Structure
- `apps/api` NestJS API
- `apps/app` Nuxt frontend
- `packages/contracts` shared contract/types package
- `.ai` planning and architecture docs

## Branching and Commits
- Use short, scoped branches per task.
- Keep commits focused and atomic.
- Prefer conventional commit prefixes (for example: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `ci:`).

## Pull Requests
- Fill out the PR template completely.
- Link related issue(s).
- Include screenshots for UI changes.
- Ensure CI is green before requesting review.

## Code Style and Quality
- Run lint/tests for affected areas before pushing.
- Keep type safety intact; avoid `any` unless justified.
- Add or adjust tests when behavior changes.

## Reporting Bugs and Requesting Features
Use GitHub issue templates:
- Bug Report
- Feature Request

## Security
Please do not open public issues for vulnerabilities.
See [SECURITY.md](./SECURITY.md).
