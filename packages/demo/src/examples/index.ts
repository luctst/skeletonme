import type { Example } from './types'
import { ProfileExample } from './ProfileExample'
import { ArticleExample } from './ArticleExample'
import { CommentsExample } from './CommentsExample'
import { StatsExample } from './StatsExample'
import { CustomSkeletonExample } from './CustomSkeletonExample'

// Add a use case by writing an example component and appending it here.
export const examples: Example[] = [
  {
    id: 'profile',
    title: 'Profile card',
    description: 'Auto-measure: one shimmer rect per leaf node.',
    Component: ProfileExample,
  },
  {
    id: 'custom-skeleton',
    title: 'Custom skeleton',
    description: 'Escape hatch: supply your own shape — e.g. a circular avatar.',
    Component: CustomSkeletonExample,
  },
  {
    id: 'article',
    title: 'Article preview',
    description: 'Text blocks become bars at the real line widths.',
    className: 'sm:col-span-2',
    Component: ArticleExample,
  },
  {
    id: 'comments',
    title: 'Comment feed',
    description: 'Repeated rows: the whole list is mirrored.',
    Component: CommentsExample,
  },
  {
    id: 'stats',
    title: 'Stat grid',
    description: 'Grids keep their column rhythm while loading.',
    className: 'sm:col-span-2',
    Component: StatsExample,
  },
]
