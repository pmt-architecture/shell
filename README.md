## fe-shell

Workspace root for the **MFE Shell Framework** — FE_STANDARDS §4.1c canonical Caso c exception with three coupled publishable packages:

- [`packages/contracts/`](packages/contracts/) — `@-label-/contracts` (foundation types, type-only)
- [`packages/shell-core/`](packages/shell-core/) — `@-label-/shell-core` (zustand store + slice API)
- [`packages/shell-hooks/`](packages/shell-hooks/) — `@-label-/shell-hooks` (React hooks + context provider)

Internal cross-deps stay `workspace:*` within this repo. External consumers (apps and MFEs) consume the published versions from the registry.

## Workflow

Standard FE_STANDARDS Caso c — see each package's README for usage details.

## Scripts

```bash
pnpm install
pnpm run lint:all
pnpm run test:all
pnpm run prettier:check
pnpm run changeset
pnpm run version:packages
pnpm run publish:packages
```
