# SkeletonMe — Project Plan (DX Review Output)

> A shareable React component. Wrap any JSX in `<SkeletonMe>`; flip one boolean to
> swap real content for an auto-sized, shimmering skeleton placeholder. Open source,
> non-commercial.

```jsx
<SkeletonMe showSkeleton={isLoading}>
  <UserCard name="Lucas" role="Senior Engineer" />
</SkeletonMe>
```

---

## Locked Decisions (from review)

| Decision | Choice | Why |
|---|---|---|
| Repo structure | **pnpm workspace** — `packages/skeletonme` (lib) + `packages/demo` (Pages site) + `packages/ui` (shadcn components) | Was a flat single repo; the demo earned a 2nd package, so converting *now* (3 small packages, lib `dist/` byte-identical) was cheaper than retrofitting later. Published `skeletonme` unchanged. |
| Target developer | **Frontend dev adding a feature** | Works in Next.js/Vite, expects TS types + SSR safety + a copy-paste example. |
| v1 API surface | `showSkeleton` + `skeleton` escape hatch + shimmer + CSS-var theming | Honest MVP: trivial default, one escape hatch so users own edge cases. |
| Build | **tsup** (dual ESM/CJS + `.d.ts`) | Zero-config, right-sized for a single-component lib. |
| React dependency | `react >=18` as a **peerDependency** | Avoids duplicate-React bugs; covers 18 + 19. |
| Measurement | `ref` + `ResizeObserver` + per-leaf `getBoundingClientRect` walk of the **rendered** children | Reads the real rendered DOM (no cloning → refs/effects/portals intact); derives a multi-block skeleton, not a single box. |

---

## Target Developer Persona

```
TARGET DEVELOPER PERSONA
========================
Who:       Frontend dev (mid-level), TypeScript + React, ships in Next.js or Vite.
Context:   Has a loading state (data fetch, lazy route). Tired of hand-building
           skeletons or hand-specifying width/height/count in react-loading-skeleton.
Tolerance: ~2 minutes / ~3 steps. If the first example doesn't render or SSR throws
           a hydration error, they uninstall and move on.
Expects:   npm install, named import, TS types out of the box, works in Next.js
           without a "use client" surprise, copy-paste example that runs as-is.
```

---

## Developer Empathy Narrative (T0)

> I have a `<ProfileCard>` that flickers blank while data loads. I search "react skeleton
> auto size" and find **SkeletonMe**. The README's first code block is literally my use case —
> wrap the component, pass `showSkeleton={isLoading}`, done. No `width`, no `height`, no `count`
> to guess at. That's the hook: *it measures my component for me.*
>
> I run `pnpm add skeletonme`, paste the 5-line example, and... it works — a shimmering
> placeholder shaped like my card, sized to it. I smile. Then I deploy to Vercel and on first server render
> the skeleton is a 0px-tall sliver because there's no DOM to measure server-side. **If the README
> didn't warn me and hand me the fix, this is where I'd rage-uninstall.** So the SSR story has to
> be on the box, not in the FAQ.

**Implication for the plan:** the SSR caveat + fix is a **Pass-1 blocker**, not a footnote.

---

## Competitive DX Benchmark

> Reference-based (no live web search this pass). The incumbent is **react-loading-skeleton**
> (~700k weekly downloads) — note its API *requires manual sizing*, which is exactly SkeletonMe's wedge.

```
Tool                    | TTHW    | Notable DX choice                          | Wedge for SkeletonMe
react-loading-skeleton  | ~2 min  | Tiny API, but YOU specify width/height/count| We auto-measure — zero sizing
MUI <Skeleton/>         | ~3 min  | variant="text|circular", manual sizing      | We derive shape from children
react-content-loader    | ~5 min  | SVG, super-customizable, steep             | We're wrap-and-go, no SVG authoring
SkeletonMe (target)     | <2 min  | Wrap real children → auto-sized skeleton    | THE differentiator
```

**Target tier: Competitive→Champion (< 2 min TTHW, ≤ 3 steps).** The auto-measurement is the
reason to switch from the incumbent — it must be the first thing in the README.

---

## Magical Moment

**The moment:** "I wrapped my component in one line and got a correctly-sized skeleton **without
specifying any dimensions**." That's the smile — and the competitive wedge against react-loading-skeleton.

**Delivery vehicle:** **Copy-paste README example + a live StackBlitz "Try it" link.**
- Low effort, high impact for a React lib; no hosted infra to maintain (fits OSS/non-commercial).
- README example must be complete and runnable (real import, real children, real `useState`).
- StackBlitz link gives zero-install try-before-you-buy.

---

## v1 Scope

**Auto-measure contract (the boundary of the magic).** v1 auto-derives a
**multi-block** skeleton by walking the children's *rendered* DOM: after they
render, a `TreeWalker` collects leaf nodes, `getBoundingClientRect` sizes each,
and one shimmer rect is overlaid per leaf. This reads the real rendered output,
so it is component-agnostic (a `<UserCard/>` and an inline `<div>` measure
identically) and needs no cloning — refs/effects/portals stay intact. It works
when the children render their **structure** during loading (every node present,
content blank), which is the normal case when layout comes from CSS or UA
defaults. Known boundaries, by design — not bugs:

- **Content-sized text collapses to one line.** An empty block has no line box,
  so UA styles give it no height; a node with any inline content is ~`line-height`
  tall. Text nodes therefore skeleton at one line, which can under-size a wrapped
  paragraph → a small layout shift when the real (taller) content arrives.
- **Absent structure can't be mirrored.** A child that `return null`s or maps an
  empty array (`items.map([])`) renders fewer/zero nodes than its loaded form.
  The walker only mirrors nodes that exist; lists/feeds that render nothing during
  load fall back to the `skeleton` escape hatch. The **template model** (TODO
  below) closes this in v1.1.
- **Data-less / SSR.** No DOM to walk server-side or before first render —
  `width`/`height` give an explicit single-box fallback.

**In v1**
- `<SkeletonMe showSkeleton>{children}</SkeletonMe>` — auto-derive a **multi-block** skeleton from the children's rendered DOM (`TreeWalker` + per-leaf `getBoundingClientRect`; `ResizeObserver` tracks reflow).
- `skeleton?: ReactNode` — escape hatch: supply your own placeholder when auto-measure won't fit.
- `width?`/`height?` — explicit-size escape hatch for the **data-less / SSR** case (no children to measure yet).
- Default **shimmer** animation, hardcoded keyframe.
- Theming via **CSS custom properties** only: `--skeletonme-base`, `--skeletonme-highlight`, `--skeletonme-radius`.
- TypeScript types, zero runtime deps (React + CSS only).
- `tsup` dual ESM/CJS build, `exports` map, `react >=18` peer dep.
- README with the magical-moment example + StackBlitz link + **SSR caveat & fix**.

**NOT in v1** (deferred, with rationale)
- ~~Monorepo / docs site / examples app~~ — **shipped post-v1** as the pnpm workspace + `packages/demo` showcase (deployed to GitHub Pages). The demo was the second package that earned the conversion.
- Animation variants (`pulse | none`) — *default shimmer is enough; adds API surface.*
- `count` / repeat sugar — *users can `.map()`; convenience, not adoption-blocking.*
- Shape presets (`variant="text|circle|rect"`) — *different philosophy (explicit vs magical); belongs to a future low-level primitive.*
- Theme provider / context — *CSS vars cover theming with zero API.*
- Fully SSR-safe auto-measurement — *v1 documents the limitation + ships explicit-size fallback; solve true SSR measurement in v1.1.*

---

## Repo Structure (pnpm workspace)

Private root delegates to packages via `pnpm -r` / `--filter`. Only
`packages/skeletonme` is published; `demo` and `ui` are `private`.

```
skeletonme/
├─ package.json            # private workspace root: delegating scripts, shared dev tooling
├─ pnpm-workspace.yaml      # packages: ['packages/*']
├─ eslint.config.js         # shared flat config; ignores **/dist
├─ .prettierrc
├─ .changeset/             # Changesets — targets only `skeletonme`
├─ .github/workflows/
│  ├─ ci.yml               # build → lint • typecheck • test (build first: demo needs the lib's dist types)
│  ├─ release.yml          # build lib → changesets → npm publish
│  └─ deploy-demo.yml       # build demo → GitHub Pages (push to main)
├─ README.md · CONTRIBUTING.md · LICENSE · CHANGELOG.md
└─ packages/
   ├─ skeletonme/           # the PUBLISHED library (name: skeletonme, react>=18 peer)
   │  ├─ package.json · tsconfig.json · tsup.config.ts · vitest.config.ts
   │  └─ src/               # index.ts, SkeletonMe.tsx, SkeletonMe.types.ts,
   │                        # engine/collectLeafRects.ts, hooks/useSkeletonRects.ts, skeletonme.css
   ├─ demo/                 # private — Vite + React Pages site (base '/skeletonme/')
   │  └─ src/               # App.tsx + extensible examples/ registry (one global toggle)
   └─ ui/                   # private — @workspace/ui: shadcn (Button/Card/Avatar) + Tailwind v4
```

---

## DX Review — Pass Findings & Fixes

**Pass 1 — Getting Started (target < 2 min):** First README block = the magical-moment example,
complete and runnable. `pnpm add skeletonme` → import → wrap. StackBlitz link for zero-install.
**Blocker fixed:** SSR caveat + `width`/`height` fallback documented up front so Next.js devs
don't hit a 0px skeleton and bail.

**Pass 2 — API design:** Matches the persona's mental model — `<SkeletonMe showSkeleton>` reads
like English. Every prop has a default; simplest call (`showSkeleton` only) is production-ready.
`skeleton` + `width`/`height` are the progressive-disclosure escape hatches.

**Pass 3 — Errors / uncertainty:** Dev-only `console.warn` when `showSkeleton` is true but children
measure to 0×0 and no `width`/`height`/`skeleton` was provided — names the SSR/data-less cause and
points to the fix prop. (No silent blank skeletons.)

**Pass 4 — Docs:** README is the docs for v1. Sections: 30-second example → SSR & Next.js →
escape hatches → theming via CSS vars → TypeScript. Every snippet copy-paste-complete.

**Pass 5 — Upgrade path:** Changesets + semver from commit #1. Pre-1.0 (`0.x`) signals API may move.

**Pass 6 — Dev environment:** TS types shipped. `"use client"` guidance for Next App Router.
Works in CI via `ci.yml` (lint/typecheck/test/build, non-interactive).

**Pass 7 — Community:** MIT license, CONTRIBUTING.md, GitHub issue templates. `pnpm i && pnpm test`
must work on a fresh clone.

**Pass 8 — Measurement:** No analytics (non-commercial). Track TTHW informally via README clarity;
GitHub issues are the feedback loop.

---

## DX Scorecard (plan-level)

```
+====================================================================+
|              DX PLAN REVIEW — SCORECARD                            |
+====================================================================+
| Dimension            | Initial  | Final  | Notes                   |
|----------------------|----------|--------|-------------------------|
| Getting Started      |  4/10    |  9/10  | SSR caveat fixed up front|
| API/CLI/SDK          |  6/10    |  9/10  | escape hatches added     |
| Error Messages       |  2/10    |  7/10  | 0×0 dev warning planned  |
| Documentation        |  3/10    |  8/10  | magical example first    |
| Upgrade Path         |  3/10    |  8/10  | changesets + semver      |
| Dev Environment      |  4/10    |  8/10  | TS + Next "use client"   |
| Community            |  4/10    |  8/10  | MIT + CONTRIBUTING + CI  |
| DX Measurement       |  2/10    |  5/10  | OSS: issues-driven       |
+--------------------------------------------------------------------+
| TTHW                 | ~5 min   | <2 min | wrap-and-go example      |
| Competitive Rank     | Competitive→Champion (auto-measure wedge)   |
| Magical Moment       | designed via README example + StackBlitz    |
| Product Type         | Library / SDK (React component)             |
| Mode                 | DX POLISH                                   |
| Overall DX           |  4/10    |  8/10  | +4                       |
+====================================================================+
```

---

## DX Implementation Checklist

```
[ ] TTHW < 2 min: README opens with the wrap-and-go example
[ ] pnpm add skeletonme → import → wrap (3 steps)
[ ] First run produces a correctly-sized shimmering skeleton
[ ] Magical moment: auto-measure (no width/height needed) is the FIRST example
[ ] StackBlitz "Try it live" link in README
[ ] SSR / Next.js caveat + width/height fallback documented up front
[ ] Dev-only warn on 0×0 measured skeleton with no fallback
[ ] showSkeleton + skeleton + width/height all typed (SkeletonMeProps)
[ ] Theming via --skeletonme-* CSS vars, documented
[ ] tsup dual ESM/CJS + .d.ts; react>=18 peer dep; exports map
[ ] sideEffects set correctly for the CSS file
[ ] MIT LICENSE + CONTRIBUTING.md + issue templates
[ ] CI: lint • typecheck • test • build on PR
[ ] Changesets wired for releases; CHANGELOG maintained
[ ] Fresh-clone `pnpm i && pnpm test` works
```

---

## What Already Exists

Nothing — greenfield empty directory. No code, no git, no docs to reuse. pnpm 10.28 / Node 22 installed.

## Open DX Debt → TODOS (proposed)

1. **True SSR-safe measurement** (v1.1) — auto-measure that doesn't render a 0px box server-side.
2. ~~**Live playground site**~~ — **done**: `packages/demo` is the hosted showcase (GitHub Pages). This was the trigger that resolved the monorepo decision (now a pnpm workspace).
3. **Animation variants** (`pulse | none`) — only if requested by real users.
4. **Template-measured skeleton** (v1.1) — `template?: ReactNode`: render a *populated* sample of the component offscreen, walk **its** DOM, and use that as the skeleton. Closes the case the v1 live-children walker structurally can't — components that `return null` or render empty lists during loading — because the template always has data (so the structure exists to measure). Needs an offscreen-render + SSR / `"use client"` story.
