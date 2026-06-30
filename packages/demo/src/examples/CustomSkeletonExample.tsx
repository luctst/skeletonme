import { SkeletonMe } from 'skeletonme'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import type { ExampleProps } from './types'

// Escape hatch: auto-measure emits rectangles, so a round avatar would shimmer
// as a square. Pass your own `skeleton` when you need a different shape — here a
// circle via the .skeletonme class with --skeletonme-radius overridden.
export function CustomSkeletonExample({ showSkeleton }: ExampleProps) {
  return (
    <SkeletonMe
      showSkeleton={showSkeleton}
      skeleton={
        <div aria-hidden="true" className="flex items-center gap-4">
          <div className="skeletonme size-12 [--skeletonme-radius:9999px]" />
          <div className="flex flex-col gap-2">
            <div className="skeletonme h-4 w-28 rounded" />
            <div className="skeletonme h-3 w-20 rounded" />
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback className="font-medium">JD</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium leading-none">Jordan Diaz</span>
          <span className="text-sm text-muted-foreground">@jordan</span>
        </div>
      </div>
    </SkeletonMe>
  )
}
