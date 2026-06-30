import { SkeletonMe } from 'skeletonme'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import type { ExampleProps } from './types'

// Basic auto-measure: 3 leaf nodes (avatar, name, role) → 3 shimmer rects.
export function ProfileExample({ showSkeleton }: ExampleProps) {
  return (
    <SkeletonMe showSkeleton={showSkeleton}>
      <div className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback className="font-medium">AC</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium leading-none">Alex Chen</span>
          <span className="text-sm text-muted-foreground">Product Designer</span>
        </div>
      </div>
    </SkeletonMe>
  )
}
