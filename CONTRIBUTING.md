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

## Project structure

This is a **pnpm workspace**. Only `packages/skeletonme` is published.

```
packages/
  skeletonme/   the published library (the npm package)
  demo/         private — the GitHub Pages demo (Vite + React)
  ui/           private — @workspace/ui: shadcn components used by the demo
```

The root scripts below delegate across packages (`pnpm -r`). To act on one
package, filter it: `pnpm --filter skeletonme test`, `pnpm --filter demo dev`.

## Scripts

Run from the repo root:

| Command          | What it does                                                      |
| ---------------- | ---------------------------------------------------------------- |
| `pnpm build`     | Build every package (`pnpm -r build`) — the lib's `dist/` first  |
| `pnpm test`      | Run all test suites (Vitest)                                      |
| `pnpm typecheck` | Type-check every package (tsc) — run **after** `build`            |
| `pnpm lint`      | Lint with ESLint                                                  |
| `pnpm format`    | Format with Prettier                                             |
| `pnpm dev`       | Build the lib in watch mode (`--filter skeletonme dev`, tsup)     |

> Run `pnpm build` before `pnpm typecheck`: the demo type-checks against the
> library's emitted `dist/*.d.ts`, which doesn't exist until the lib is built.

## Submitting a change

1. Branch off `main`.
2. Make your change with a test.
3. Run `pnpm build && pnpm lint && pnpm typecheck && pnpm test`.
4. Add a changeset: `pnpm changeset` (describes the version bump for release).
5. Open a PR. CI runs build, then lint, typecheck, and test.

## Reporting bugs

Open a GitHub issue with a minimal reproduction (a StackBlitz link is ideal).
