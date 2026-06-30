# SkeletonMe

> Wrap any JSX and swap it for an auto-sized, shimmering skeleton with **one boolean**.

No more hand-specifying `width`, `height`, and `count` for every loading state.
Wrap your real component — SkeletonMe measures it and renders a matching placeholder.

**Zero runtime dependencies** (just React) · React 18+ · styles auto-injected, no separate CSS import.

```bash
pnpm add skeletonme   # or npm / yarn
```

## 30-second example

```jsx
import { useState } from 'react'
import { SkeletonMe } from 'skeletonme'

function Profile({ user, loading }) {
  return (
    <SkeletonMe showSkeleton={loading}>
      <div className="card">
        <strong>{user?.name}</strong>
        <p>{user?.role}</p>
      </div>
    </SkeletonMe>
  )
}
```

`showSkeleton={true}` → shimmering blocks that mirror your content's structure (avatar, heading, text lines, etc.).
`showSkeleton={false}` → your card, untouched. That's the whole API.

> **Note:** Auto-measurement requires DOM content. On the server (SSR) or before data loads, pass explicit `width`/`height` or a custom `skeleton` — see [Server-side rendering](#server-side-rendering) below.

## Server-side rendering (Next.js / Remix)

There is no DOM on the server, so SkeletonMe **cannot measure your children during
SSR** — the skeleton would render at 0×0. For server-rendered loading states, pass
an explicit size (or a custom `skeleton`):

```jsx
<SkeletonMe showSkeleton={loading} width="100%" height={120}>
  <ProfileCard user={user} />
</SkeletonMe>
```

In the Next.js App Router, render SkeletonMe in a Client Component (`'use client'`).

## Escape hatches

| Prop       | Type                  | Use it when…                                              |
| ---------- | --------------------- | -------------------------------------------------------- |
| `skeleton` | `ReactNode`           | Auto-measurement can't capture your layout — supply your own placeholder. |
| `width`    | `number \| string`    | There are no children to measure yet (SSR / pre-data).   |
| `height`   | `number \| string`    | Same as `width`.                                         |

## Theming

Override these CSS custom properties — anywhere in your CSS, no provider needed:

```css
:root {
  --skeletonme-base: #e2e8f0; /* base grey */
  --skeletonme-highlight: #f1f5f9; /* shimmer band */
  --skeletonme-radius: 4px; /* corner radius */
}
```

Respects `prefers-reduced-motion` — the shimmer is disabled automatically.

## TypeScript

Types ship with the package. Import `SkeletonMeProps` if you need it.

```ts
import type { SkeletonMeProps } from 'skeletonme'
```

## Status

Early (`0.x`) — the API may change before 1.0.

The **auto-measure engine ships today**. It walks your content's DOM tree, measures every leaf element, and renders a matched skeleton with multiple shimmer blocks shaped like your real content — not a single grey box. The skeleton re-measures on content reflow (responsive layouts work automatically).

**Caveat:** auto-measurement requires DOM content. On the server (SSR) or before data loads, pass explicit `width`/`height` or a custom `skeleton`. A dev-mode console warning will alert you if this happens.

## License

[MIT](./LICENSE) © Lucas Tostée
