# Spec: Demo page + pnpm monorepo migration

> Status: **SPECIFY** (awaiting human review before PLAN). Reverses the locked
> "flat repo" decision in `skeletonme_docs/memory/PLAN.md` — see Open Questions.

## Objective

Ship a live, single-page demo of SkeletonMe on GitHub Pages so a frontend dev
evaluating it (likely a react-loading-skeleton user) can *see* the wedge in
seconds: the skeleton auto-derives its shape from real content, with zero sizing
config.

To host a demo that imports the library by its real package name (not a path
hack) and to leave room for a future docs site, convert the repo from a flat
single package to a **pnpm workspace monorepo**. The published `skeletonme`
package must build, test, and publish **identically** to today — the migration is
internal restructuring, not an API change.

**Users:**
- *Demo visitor* — frontend dev, lands from README/GitHub, wants visual proof.
- *Maintainer/contributor* — gains a local playground (`pnpm dev` in the demo).

**Success looks like:** a public Pages URL showing the ProfileCard skeleton on
load, a one-button toggle to the real card, and an unchanged published package.

## Tech Stack

- **Workspace:** pnpm@10.28.2 workspaces (already the package manager).
- **Library (`packages/skeletonme`):** React (peer `>=18`), TypeScript 5.7, tsup
  (ESM+CJS+dts, `injectStyle`), vitest + Testing Library + jsdom. Unchanged.
- **Demo (`examples/playground`):** Vite + `@vitejs/plugin-react`, React 19, imports
  `skeletonme` via `workspace:*`.
- **Release:** changesets (config stays at root `.changeset/`).
- **CI/Deploy:** GitHub Actions; Pages deploy via `actions/deploy-pages`
  (actions pinned to SHAs, per repo convention).

## Commands

Run from repo root unless noted.

```
Install:        pnpm install
Build lib:      pnpm --filter skeletonme build
Test lib:       pnpm --filter skeletonme test
Lint (all):     pnpm -r lint
Typecheck:      pnpm -r typecheck
Demo dev:       pnpm --filter demo dev
Demo build:     pnpm --filter demo build   # vite, base '/skeletonme/'
Release:        pnpm --filter skeletonme build && changeset publish
```

Root convenience scripts (`build`, `test`, `lint`) delegate via `pnpm -r`.

## Project Structure

```
skeletonme/                       ← private workspace root (no publish)
├── pnpm-workspace.yaml           ← packages: packages/*
├── package.json                  ← { "private": true }, shared dev tooling + delegating scripts
├── .changeset/                   ← stays at root; detects packages/* automatically
├── eslint.config.js              ← shared root config (lints all packages)
└── packages/
    ├── skeletonme/               ← the published package (name stays "skeletonme")
    │   ├── src/                  ← moved from repo-root src/
    │   ├── tsup.config.ts        ← moved, unchanged
    │   ├── tsconfig.json         ← moved
    │   ├── vitest.config.ts + vitest.setup.ts  ← moved
    │   └── package.json          ← version 0.0.0, files:["dist"], exports map (unchanged content)
    └── demo/                     ← Vite demo, { "private": true, "name": "demo" }
        ├── index.html
        ├── vite.config.ts        ← base: '/skeletonme/'  (repo-name project page)
        ├── src/main.tsx
        ├── src/App.tsx           ← toggle + <ProfileCard>
        └── package.json          ← deps: { "skeletonme": "workspace:*", react, react-dom }
```

ESLint: a single shared `eslint.config.js` at the root lints all packages. A
package may add its own `eslint.config.js` only if it has genuinely different
needs (e.g. the demo's Vite/browser globals); prefer the shared config otherwise.

## Demo content (locked by PM + houellebeck)

**Scope — one scenario, one interaction. Do not add more.**

- **Single demo:** a `ProfileCard` = avatar (circle) + name + role → exactly 3
  leaf nodes → 3 shimmer blocks. No bio, no extra fields.
- **Single interaction:** one toggle button. No auto-cycle.
- **Page loads in skeleton state** (shimmer visible before any interaction).

**Copy:**
- `<title>`: `SkeletonMe Demo`
- Meta description: *Skeleton loading that auto-measures your content's shape. Zero config.*
- H1: **Loading That Matches Your Layout**
- Subhead: *Auto-measures your content. Zero sizing config.*
- Toggle button: reads **"Show Profile"** while skeleton is shown; **"Show Skeleton"** while content is shown.
- ProfileCard data: name **Alex Chen**, role **Product Designer**, avatar = initials **"AC"** in a circle (no external image dep; keeps it to 3 clean leaf nodes).
- Optional caption (≤12 words, off by default): *Skeleton auto-matched three shapes: avatar circle, name line, role line.*
- Footer links: **View on GitHub** + **Read the docs** (→ README). No npm link (unpublished at 0.0.0).

**Explicitly out of scope (PM):** code-snippet display, theming/CSS-var controls,
side-by-side vs react-loading-skeleton, SSR section, install instructions,
multiple cards/tabs, dark-mode toggle.

## Code Style

Match existing conventions (no semicolons, single quotes, 2-space indent, named
exports, typed props). Demo example, illustrative:

```tsx
function ProfileCard({ user }: { user: User }) {
  return (
    <div className="card">
      <span className="avatar">{user.initials}</span>
      <strong>{user.name}</strong>
      <p>{user.role}</p>
    </div>
  )
}

// in App:
<SkeletonMe showSkeleton={loading}>
  <ProfileCard user={alex} />
</SkeletonMe>
```

## Testing Strategy

- **Library:** vitest suite moves with the package and must pass unchanged
  (`pnpm --filter skeletonme test`). No behavior change ⇒ no test changes expected.
- **Demo:** no unit tests (it's a static showcase). Verification is the manual
  visual checklist in Success Criteria. A Playwright smoke test is **out of scope**
  for v0 (note in Open Questions if wanted later).
- **Migration safety net:** `pnpm --filter skeletonme build` must emit the same
  `dist/` artifact shape (ESM/CJS/d.ts) as before; diff the built `exports`.

## Boundaries

- **Always:** keep the published `skeletonme` package's name, version, `files`,
  and `exports` identical; run lib build + tests after each migration step; pin
  GitHub Actions to SHAs.
- **Ask first:** adding any dependency beyond Vite/plugin-react to the demo;
  changing changesets config or release semantics; adding a second demo scenario;
  enabling the optional caption.
- **Never:** publish the `demo` package to npm; bundle React into the lib; commit
  secrets; expand the demo beyond the locked one-card/one-toggle scope.

## Success Criteria

Demo (from PM):
1. Skeleton (shimmer, 3 blocks) is visible on page load with no interaction.
2. A visitor can articulate "it figured out the shape on its own" with all copy
   hidden — the aha is purely visual.
3. The toggle cycle (skeleton → content → skeleton) produces **zero layout shift**.
4. Cold load < 2s on a standard connection.
5. Demo is reachable at the public Pages URL (`https://luctst.github.io/skeletonme/`)
   and deploys automatically on merge to `main`.

Migration:
6. `pnpm --filter skeletonme build` + `test` pass; built artifact unchanged.
7. `changeset publish` still targets only the `skeletonme` package.
8. Existing `ci.yml` / `release.yml` pass against the workspace.

## Resolved Decisions

1. **Reverses the locked "flat repo" decision** — confirmed. Implementation updates
   `PLAN.md` and the auto-memory.
2. **Layout:** demo is a workspace package at `packages/demo` (not a separate
   `examples/` tree); workspace glob is `packages/*`. **Pages URL base** stays
   `'/skeletonme/'` (repo-name project page) — pending only a custom-domain note.
3. **ESLint:** shared root config; per-package config only if genuinely needed.
4. **Migration changeset:** none — the published artifact is unchanged.
5. **Optional caption:** ship **off** by default (PM: the aha should land visually).
6. **Playwright smoke test:** deferred (not in v0).

## Open Questions

_None — all resolved._ Caption ships **off**. No custom domain: Pages base is
`'/skeletonme/'` (`luctst.github.io/skeletonme`).
```
