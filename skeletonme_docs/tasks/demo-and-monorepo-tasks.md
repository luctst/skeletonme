# Implementation Plan: Demo page + pnpm monorepo migration

> Source spec: `skeletonme_docs/specs/demo-and-monorepo.md` (approved).
> Tasks are ordered; each leaves the repo in a working, publishable state.

## Overview

Convert the flat repo to a pnpm workspace (`packages/skeletonme` + `packages/demo`),
then ship a single-page Vite demo on GitHub Pages. The published `skeletonme`
package must build/test/publish identically throughout — the migration is internal.

## Architecture Decisions

- Demo is a workspace package at `packages/demo` (glob `packages/*`), not a separate
  `examples/` tree.
- Published package keeps name `skeletonme`, version `0.0.0`, `files`, and `exports`.
- Shared root ESLint; per-package config only if needed (demo's browser globals).
- No migration changeset (artifact unchanged). Pages base `'/skeletonme/'`.
- Demo: one `ProfileCard` (avatar+name+role), one toggle, skeleton on load, caption off.

## Dependency graph

```
T1 lib move ──► T2 root/changesets ──► T3 CI/release  ─┐
                                                        ├─► (Checkpoint A: repo green)
T4 demo app ──► T5 Pages deploy ───────────────────────┘
                          │
                          └─► T6 docs/memory  ──► (Checkpoint B: complete)
```

T4 depends only on T1 (needs `skeletonme` resolvable via `workspace:*`); it can
start once T1 lands, in parallel with T2/T3.

---

## Phase 1: Workspace foundation

### Task 1: Relocate the library into `packages/skeletonme`

**Description:** Create the workspace and move the library + its build/test config
into `packages/skeletonme`, leaving the published package's content identical.

**Acceptance criteria:**
- [ ] `pnpm-workspace.yaml` exists with `packages: ['packages/*']`.
- [ ] `git mv` moves `src/`, `tsup.config.ts`, `tsconfig.json`, `vitest.config.ts`,
      `vitest.setup.ts` into `packages/skeletonme/`; paths in each config still resolve.
- [ ] `packages/skeletonme/package.json` carries the publishable fields unchanged
      (`name: skeletonme`, `version: 0.0.0`, `type`, `files: ["dist"]`, `main/module/types`,
      `exports`, `peerDependencies`, `peerDependenciesMeta`) + the lib build/test scripts
      + lib-only devDeps (tsup, vitest, testing-library, jsdom, react, react-dom, @types/*, tsup/ts).
- [ ] Built `dist/` shape (ESM/CJS/d.ts + injected styles) matches pre-migration output.

**Verification:**
- [ ] `pnpm install` links the workspace with no errors.
- [ ] `pnpm --filter skeletonme build` succeeds; diff `exports`/file list vs old `dist/`.
- [ ] `pnpm --filter skeletonme test` and `... typecheck` pass.

**Dependencies:** None.
**Files likely touched:** `pnpm-workspace.yaml`, `packages/skeletonme/**` (moved), root `.gitignore` (dist path).
**Estimated scope:** M (high-risk — verify before proceeding).

### Task 2: Reshape root as a private workspace + rewire changesets

**Description:** Turn the root `package.json` into a private workspace root with
delegating scripts and shared dev tooling; confirm changesets still targets only `skeletonme`.

**Acceptance criteria:**
- [ ] Root `package.json` is `"private": true`, keeps `packageManager`, drops publish
      fields (moved to the lib), and exposes delegating scripts (`build`/`test`/`lint`/
      `typecheck` via `pnpm -r`; `release` builds the lib then `changeset publish`).
- [ ] Shared dev tooling (prettier, eslint base + plugins, `@changesets/cli`) lives at root;
      `eslint.config.js` stays at root and lints `packages/*`.
- [ ] `.changeset/config.json` unchanged (`baseBranch: main`, `access: public`) and resolves
      only the `skeletonme` package.

**Verification:**
- [ ] `pnpm -r lint`, `pnpm -r typecheck`, `pnpm -r test` all pass.
- [ ] `pnpm changeset status` lists `skeletonme` and nothing else.
- [ ] `pnpm release` dry path (build step) succeeds without publishing.

**Dependencies:** T1.
**Files likely touched:** root `package.json`, `eslint.config.js`, `.changeset/config.json`.
**Estimated scope:** S–M.

### Task 3: Update CI + release workflows for the workspace

**Description:** Make `ci.yml` and `release.yml` operate at the workspace level.

**Acceptance criteria:**
- [ ] `ci.yml` installs the workspace and runs lint/typecheck/test/build across packages
      (`pnpm -r ...`).
- [ ] `release.yml` builds the lib via `--filter skeletonme` before `changeset publish`;
      publishes only `skeletonme`.
- [ ] Any newly referenced actions are pinned to SHAs (repo convention).

**Verification:**
- [ ] CI passes on the branch (push and observe Actions).
- [ ] `release.yml` job graph references only the lib build + changeset publish.

**Dependencies:** T2.
**Files likely touched:** `.github/workflows/ci.yml`, `.github/workflows/release.yml`.
**Estimated scope:** S.

### Checkpoint A: Foundation green
- [ ] `pnpm --filter skeletonme build` + `test` pass; `dist/` unchanged.
- [ ] `changeset status`/`publish` still target only `skeletonme`.
- [ ] CI green on the branch.
- [ ] **Review with human before building the demo.**

---

## Phase 2: Demo

### Task 4: Scaffold `packages/demo` Vite app (ProfileCard + toggle)

**Description:** Build the locked single-scenario demo: a `ProfileCard` (avatar
initials + name + role) wrapped in `<SkeletonMe>`, a toggle button, skeleton on load.
Uses houellebeck's copy from the spec.

**Acceptance criteria:**
- [ ] `packages/demo` is `"private": true`, deps `{ "skeletonme": "workspace:*", react, react-dom }`,
      devDeps `{ vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom }`.
- [ ] `vite.config.ts` sets `base: '/skeletonme/'`.
- [ ] `App.tsx`: page mounts in skeleton state; one button toggles "Show Profile" ↔
      "Show Skeleton"; `ProfileCard` renders avatar "AC" + "Alex Chen" + "Product Designer"
      (3 leaf nodes). H1 "Loading That Matches Your Layout", subhead, footer (GitHub + docs).
      Caption omitted. Imports `SkeletonMe` from `skeletonme` (styles auto-injected).
- [ ] Toggling produces no layout shift between skeleton and content.

**Verification:**
- [ ] `pnpm --filter demo dev` renders the page; skeleton shows 3 shimmer blocks on load.
- [ ] `pnpm --filter demo build` outputs `packages/demo/dist` with correct `base`.
- [ ] Manual: toggle cycles skeleton↔content; no visible reflow.

**Dependencies:** T1.
**Files likely touched:** `packages/demo/{index.html,vite.config.ts,package.json,tsconfig.json}`, `packages/demo/src/{main.tsx,App.tsx,styles.css}`.
**Estimated scope:** M.

### Task 5: GitHub Pages deploy workflow

**Description:** Add a workflow that builds the demo and deploys it to Pages on
merge to `main`.

**Acceptance criteria:**
- [ ] `.github/workflows/deploy-demo.yml` triggers on push to `main` (+ manual dispatch),
      `permissions: { pages: write, id-token: write }`, builds `--filter demo`, uploads
      `packages/demo/dist`, deploys via `actions/deploy-pages`.
- [ ] All actions pinned to SHAs.
- [ ] Concurrency guard so overlapping deploys don't race.

**Verification:**
- [ ] Workflow runs green; site loads at `https://luctst.github.io/skeletonme/` with assets
      resolving (correct `base`).
- [ ] Note: enabling Pages (source = GitHub Actions) is a one-time repo-settings step — flag to human.

**Dependencies:** T4.
**Files likely touched:** `.github/workflows/deploy-demo.yml`.
**Estimated scope:** S.

---

## Phase 3: Docs

### Task 6: Update docs + memory to reflect the reversal and the demo

**Description:** Record the flat→monorepo reversal and surface the demo.

**Acceptance criteria:**
- [ ] `skeletonme_docs/memory/PLAN.md` repo-structure decision updated (flat → workspace,
      with the "demo earned it / cheapest-now" rationale).
- [ ] Auto-memory `skeletonme-scope` updated (no longer "flat repo").
- [ ] `CONTRIBUTING.md` / `CLAUDE.md` project-structure references updated to the
      `packages/*` layout and the new commands.
- [ ] `README.md` gains a short "Demo" link to the Pages URL (no scope creep).

**Verification:**
- [ ] Grep finds no stale "flat repo" / root-`src/` claims in docs.
- [ ] README demo link resolves once Pages is live.

**Dependencies:** T5 (URL must exist for the README link).
**Files likely touched:** `skeletonme_docs/memory/PLAN.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `README.md`, auto-memory.
**Estimated scope:** S.

### Checkpoint B: Complete
- [ ] All acceptance criteria met; CI + deploy green.
- [ ] Published package verified unchanged; demo live at the Pages URL.
- [ ] Docs/memory consistent with the workspace layout.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Library move breaks build/test paths | High | T1 is isolated + verified before anything else; revert via git if `dist` diff differs. |
| changesets stops targeting the right package after restructure | High | T2 verifies `changeset status` lists only `skeletonme`; no release cut until confirmed. |
| Release workflow publishes wrong/no package | High | T3 keeps `release.yml` building only the lib; dry-run the build step. |
| Pages `base` wrong → blank page / 404 assets | Med | T4 sets `base: '/skeletonme/'`; T5 verifies assets resolve on the live URL. |
| React duplicated between lib (peer) and demo | Med | Single workspace install dedupes; lib keeps react as peer + dev only. |
| Pages not enabled in repo settings | Low | T5 flags the one-time manual enablement to the human. |

## Open Questions

_None._ All spec decisions resolved. The only out-of-band step is enabling GitHub
Pages (source: GitHub Actions) in repo settings before T5's deploy can publish.
