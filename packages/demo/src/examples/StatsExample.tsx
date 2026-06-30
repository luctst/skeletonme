import { SkeletonMe } from 'skeletonme'
import type { ExampleProps } from './types'

const stats = [
  { label: 'Downloads', value: '12.4k' },
  { label: 'Stars', value: '1.2k' },
  { label: 'Bundle', value: '4 kB' },
]

// Grid layout: each tile's label and value are leaves, so the skeleton keeps
// the same 3-column rhythm as the real metrics.
export function StatsExample({ showSkeleton }: ExampleProps) {
  return (
    <SkeletonMe showSkeleton={showSkeleton}>
      <dl className="grid w-full grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-2">
            <dt className="block truncate text-xs text-muted-foreground">{s.label}</dt>
            <dd className="block truncate text-2xl font-semibold leading-none">{s.value}</dd>
          </div>
        ))}
      </dl>
    </SkeletonMe>
  )
}
