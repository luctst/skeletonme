import type { ReactNode } from 'react'

/** Every example receives the global skeleton state and owns its own
 *  `<SkeletonMe>` wrapper, so each can show a different capability
 *  (auto-measure, lists, grids, the `skeleton` escape hatch, …). */
export interface ExampleProps {
  showSkeleton: boolean
}

export interface Example {
  id: string
  /** Short heading shown above the live demo. */
  title: string
  /** One line on which SkeletonMe capability this demonstrates. */
  description: string
  /** Optional grid-span utilities (e.g. wide examples span two columns). */
  className?: string
  Component: (props: ExampleProps) => ReactNode
}
