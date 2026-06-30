import { SkeletonMe } from 'skeletonme'
import type { ExampleProps } from './types'

// Text-heavy layout: each line is its own leaf, so the skeleton becomes a
// stack of bars at the real line widths. truncate keeps every line a single row
// (one measurable rect) and guarantees zero shift between states.
export function ArticleExample({ showSkeleton }: ExampleProps) {
  return (
    <SkeletonMe showSkeleton={showSkeleton}>
      <article className="flex w-full flex-col gap-3">
        <span className="block truncate text-base font-semibold leading-none">
          Designing graceful loading states
        </span>
        <span className="block w-full truncate text-sm text-muted-foreground">
          Skeleton screens cut perceived wait by mirroring the layout to come.
        </span>
        <span className="block w-11/12 truncate text-sm text-muted-foreground">
          No spinners, no jump — just the shape of the content, then the content.
        </span>
        <span className="block w-3/4 truncate text-sm text-muted-foreground">
          One boolean flips the whole thing.
        </span>
        <span className="block w-24 truncate text-xs text-muted-foreground">5 min read</span>
      </article>
    </SkeletonMe>
  )
}
