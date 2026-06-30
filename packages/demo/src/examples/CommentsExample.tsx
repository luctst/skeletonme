import { SkeletonMe } from 'skeletonme'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import type { ExampleProps } from './types'

const comments = [
  { initials: 'MR', name: 'Maya Rivera', text: 'This is exactly what our loading states needed.' },
  { initials: 'TK', name: 'Tomás Klein', text: 'Dropped it in, deleted 200 lines of placeholders.' },
  { initials: 'SP', name: 'Sana Patel', text: 'The zero layout shift is the part that sells it.' },
]

// Repeated rows: the engine measures every leaf across the list, so the
// skeleton mirrors the whole feed (3 rows × avatar + name + line = 9 rects).
export function CommentsExample({ showSkeleton }: ExampleProps) {
  return (
    <SkeletonMe showSkeleton={showSkeleton}>
      <ul className="flex w-full flex-col gap-4">
        {comments.map((c) => (
          <li key={c.initials} className="flex items-start gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-medium">{c.initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="block truncate text-sm font-medium leading-none">{c.name}</span>
              <span className="block truncate text-sm text-muted-foreground">{c.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </SkeletonMe>
  )
}
