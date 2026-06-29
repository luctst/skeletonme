# Task — TreeWalker auto-measure engine (v1)

Replaces the single-box stub in `src/SkeletonMe.tsx` and the measure-once stub in
`src/hooks/useMeasuredSize.ts` with the multi-block engine from
`skeletonme_docs/memory/PLAN.md` (v1 scope).

## Contract

**Engine — `src/engine/collectLeafRects.ts` (new)**

```ts
export interface LeafRect { x: number; y: number; width: number; height: number }
export function collectLeafRects(root: HTMLElement): LeafRect[]
```

- Walk with `document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)`.
- A *leaf* = element with no child elements.
- Skip zero-size leaves (`width === 0 || height === 0`).
- Coordinates are **relative to `root`**: `x = rect.left - rootRect.left`, `y = rect.top - rootRect.top`.

**Hook — `src/hooks/useSkeletonRects.ts` (new)**

```ts
export function useSkeletonRects<T extends HTMLElement>(enabled: boolean): [(node: T | null) => void, LeafRect[]]
```

- Runs `collectLeafRects` after paint; re-walks on reflow via `ResizeObserver`.
- Returns `[]` when there is no DOM / no layout (SSR, first render).

**Component — `src/SkeletonMe.tsx`**

- `showSkeleton` + rects found → render children hidden (`visibility: hidden`, present so they lay out) inside a `position: relative` wrapper, overlay one absolutely-positioned `.skeletonme` rect per leaf (`aria-hidden`).
- rects empty + `width`/`height` → existing single-box fallback.
- rects empty + no `width`/`height`/`skeleton` → keep the dev-only 0×0 `console.warn`.
- `skeleton` escape hatch and `showSkeleton={false}` paths unchanged.

## Known boundaries (by design, per PLAN.md)

Content-sized text collapses to one line; absent structure (`return null` / empty
list) can't be mirrored → `skeleton` escape hatch; data-less/SSR → `width`/`height`.

## Method

TDD (`/tdd`) + frontend-ui-engineering (`/frontend-ui-engineering`). jsdom has no
layout, so `getBoundingClientRect` is mocked in tests. Comments: minimal or none.
