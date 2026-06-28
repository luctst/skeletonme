# Contributing to SkeletonMe

Thanks for your interest! SkeletonMe is open source (MIT) and non-commercial.

## Getting started

```bash
git clone https://github.com/luctst/skeletonme.git
cd skeletonme
pnpm install
pnpm test
```

Requires **Node 22+** and **pnpm 10+**.

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Build in watch mode (tsup)                    |
| `pnpm test`       | Run the test suite once (Vitest)              |
| `pnpm test:watch` | Run tests in watch mode                       |
| `pnpm typecheck`  | Type-check without emitting (tsc)             |
| `pnpm lint`       | Lint with ESLint                              |
| `pnpm format`     | Format with Prettier                          |
| `pnpm build`      | Produce the publishable `dist/` (ESM + CJS)   |

## Submitting a change

1. Branch off `main`.
2. Make your change with a test.
3. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
4. Add a changeset: `pnpm changeset` (describes the version bump for release).
5. Open a PR. CI runs lint, typecheck, test, and build.

## Reporting bugs

Open a GitHub issue with a minimal reproduction (a StackBlitz link is ideal).
