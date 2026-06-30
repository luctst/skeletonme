# Design brief: SkeletonMe demo page

> Status: **DESIGN**. The visual/interaction layer for the one-page demo.
> **Copy + scenario scope are canonical in** `skeletonme_docs/specs/demo-and-monorepo.md`
> ("Demo content" section). This file does not re-lock copy — it specifies layout,
> type, spacing, the toggle interaction, and the exact shadcn components to add.
> Where copy is shown below it is mirrored for convenience; the spec wins on conflict.

## The one job

A visitor lands, sees a shimmer where a profile card should be, hits one button,
and watches the *same* card snap into real content with **zero layout shift**.
That swap-in-place is the entire product argument. Everything on the page exists
to frame that one moment — so the page is mostly empty, and the card is the hero.

This is a Claude/ChatGPT-style restraint problem: one interaction that matters,
no chrome competing with it. If an element doesn't help the visitor notice the
swap, it's cut.

## Page layout (top → bottom)

Single centered column. `min-h-screen flex flex-col`, content vertically centered,
footer pinned to the bottom. Horizontal padding `px-6` so it breathes on mobile.

```
┌───────────────────────────────────────┐
│                                        │
│            (vertical center)           │
│   H1   Loading That Matches Your Layout│   ← hero
│   sub  Auto-measures your content.      │
│        Zero sizing config.             │
│                                        │
│        ┌──────────────────────┐        │
│        │  ●   ▦▦▦▦▦▦           │        │   ← demo card
│        │      ▦▦▦              │        │     (skeleton on mount)
│        └──────────────────────┘        │
│                                        │
│            [ Show Profile ]            │   ← toggle, directly under card
│                                        │
│                                        │
│   View on GitHub   ·   Read the docs   │   ← footer, pinned bottom
└───────────────────────────────────────┘
```

- **Content column max-width:** `max-w-md` (~28rem / 448px). The hero text and the
  card share this column so the eye travels a single vertical axis to the button.
- **Card width:** fills the column (`w-full`) — a fixed, intrinsic width so neither
  state can reflow it.
- **Vertical rhythm:** hero block → `mt-10` → card → `mt-6` → toggle. Generous,
  not cramped; the whitespace is what signals "this is the thing."

## Hero

- **H1:** `text-4xl sm:text-5xl font-semibold tracking-tight text-balance`,
  centered. Copy: *Loading That Matches Your Layout*.
- **Subhead:** `mt-3 text-lg text-muted-foreground`, centered, `max-w-sm mx-auto`
  so it wraps to two tidy lines. Copy: *Auto-measures your content. Zero sizing config.*

Two elements, no eyebrow label, no logo lockup. The headline is the pitch.

## The demo card (ProfileCard)

Composition — leaf count is load-bearing: the engine renders **one shimmer rect
per leaf node**, so the card must resolve to exactly **3 leaves** (avatar, name,
role). Card/CardContent/flex wrappers are containers, not leaves.

```
Card  (shadcn)  → border, rounded-lg, shadow-sm
  CardContent   → flex items-center gap-4, p-6
    Avatar          (shadcn)  h-12 w-12         ← leaf 1: fallback "AC"
      AvatarFallback "AC"      bg-muted, text-sm font-medium
    div  flex flex-col gap-1
      span  "Alex Chen"        text-base font-medium leading-none   ← leaf 2
      span  "Product Designer" text-sm  text-muted-foreground       ← leaf 3
```

- Data (mirrored from canonical): **Alex Chen** / **Product Designer** / initials
  **AC**. No image — initials keep it to 3 clean leaves and remove a network dep.
- Avatar is `rounded-full`. **Design risk to verify with the engine:** if shimmer
  rects don't inherit `border-radius`, the avatar skeleton renders as a *square*,
  which quietly weakens the "matches your layout" claim on the one shape people
  look at first. Confirm the engine carries border-radius onto the shimmer block;
  if it can't, that's the highest-value engine tweak for this demo. (Everything
  else — name/role lines — reads fine as rects.)

## The toggle interaction

- **Component:** shadcn `Button`, default variant (primary), default size.
- **Placement:** centered, directly below the card (`mt-6`). It must read as
  "this controls the card above it" — same column, close coupling, nothing between.
- **Label states** (mirrored): page mounts in **skeleton** state, so the button
  first reads **"Show Profile"**. After the swap it reads **"Show Skeleton"**.
  The label always names the *destination*, so the user always knows what the
  click will do.
- **What the visitor sees:** on click the shimmer blocks are replaced in place by
  the real avatar/name/role at the identical positions and sizes — **no jump, no
  reflow, no spinner**. The card's box never changes dimension between states.
  That stillness is the proof; protect it (fixed avatar size, fixed line-heights,
  no conditional padding).
- No auto-cycle, no transition flourish beyond the engine's built-in shimmer.

## Footer

- Pinned to bottom (`mt-auto`), `pb-8`, centered, `text-sm text-muted-foreground`.
- Two links, middot-separated: **View on GitHub** · **Read the docs** (→ README).
- `underline-offset-4 hover:underline hover:text-foreground` — quiet until hovered.
- No npm badge (package is unpublished at 0.0.0).

## Visual direction

Default shadcn neutral palette (zinc/slate) — no custom accent. The product is
the swap, not a brand.

- **Background:** `bg-background`. The card lifts off it with `border + shadow-sm`;
  no gradients, no patterns.
- **Type scale:** H1 `text-4xl/5xl` semibold · subhead `text-lg` muted · card name
  `text-base` medium · role/footer `text-sm` muted. Three steps, clear hierarchy.
- **Radius/shadow:** shadcn defaults (`rounded-lg`, `shadow-sm`). Nothing heavier —
  a heavy shadow would compete with the shimmer for attention.
- **Color used sparingly:** the primary Button is the only saturated element on the
  page. It pulls the eye straight to the one thing to do.

## shadcn components to add (exactly these)

- `Button`
- `Card` (use `Card` + `CardContent` only)
- `Avatar` (use `Avatar` + `AvatarFallback`)

No others. (Tailwind utilities cover everything else.)

## Scope guard — do NOT add

- No code snippet / syntax-highlighted block.
- No side-by-side "before/after" or comparison with other skeleton libs.
- No second card, tabs, list, or grid of scenarios.
- No dark-mode toggle, theme switcher, or CSS-var controls.
- No avatar image / external asset.
- No transitions, fades, or animations beyond the engine's built-in shimmer.
- No spinner or loading text — the shimmer *is* the loading state.
- No hero illustration, logo, nav bar, or eyebrow label.
- No install instructions, SSR section, or caption (caption ships off, per spec).

If a change isn't the headline, the card, the button, or the footer — it's creep.
