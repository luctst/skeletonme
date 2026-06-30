# SkeletonMe

> Wrap any JSX and swap it for an auto-sized, shimmering skeleton with **one boolean**.

No more hand-specifying `width`, `height`, and box counts for every loading state.
Wrap your real component — SkeletonMe measures it and renders a matching placeholder.

**Zero runtime dependencies** (just React) · React 18+ · styles auto-injected, no separate CSS import · early `0.x`, API may change before 1.0.

**[Live demo →](https://luctst.github.io/skeletonme/)** — toggle real content ↔ auto-generated skeletons across a few layouts.

```bash
pnpm add skeletonme   # or npm / yarn
```

## 30-second example

```jsx
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

## Props

Wrap your real content as nested children (the JSX between the tags, as in the example above) — that's what SkeletonMe measures. The props below configure the rest:

| Prop           | Type                 | Default      | Description                                                                                          |
| -------------- | -------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `showSkeleton` | `boolean`            | _(required)_ | When `true`, render the skeleton placeholder. When `false`, render your content untouched.          |
| `skeleton`     | `ReactNode`          | `undefined`  | **Escape hatch.** Render your own placeholder instead of the auto-generated one — use when auto-measurement can't capture your layout. |
| `width`        | `number \| string`   | `undefined`  | **Escape hatch.** Explicit skeleton width, used when there's nothing to measure (SSR / before data loads). |
| `height`       | `number \| string`   | `undefined`  | **Escape hatch.** Explicit skeleton height. See `width`.                                            |
| `className`    | `string`             | `undefined`  | Forwarded to the rendered wrapper / skeleton element.                                               |
| `style`        | `CSSProperties`      | `undefined`  | Forwarded to the rendered wrapper / skeleton element.                                               |

The three escape hatches (`skeleton`, `width`, `height`) exist for the cases auto-measurement can't handle — a layout it can't capture, or no DOM to measure (SSR / pre-data).

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

## License

[MIT](./LICENSE) © Lucas Tostée
