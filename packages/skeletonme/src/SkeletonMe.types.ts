import type { CSSProperties, ReactNode } from 'react'

export interface SkeletonMeProps {
  /** When true, render the skeleton placeholder instead of `children`. */
  showSkeleton: boolean
  /** The real content. Measured to size the auto-generated skeleton. */
  children: ReactNode
  /**
   * Escape hatch: render your own placeholder instead of the auto-generated
   * grey box. Useful when auto-measurement can't capture your layout.
   */
  skeleton?: ReactNode
  /**
   * Explicit skeleton width. Required fallback for the data-less / SSR case,
   * where there are no rendered children to measure.
   */
  width?: number | string
  /** Explicit skeleton height. See `width`. */
  height?: number | string
  /** Forwarded to the rendered wrapper / skeleton element. */
  className?: string
  /** Forwarded to the rendered wrapper / skeleton element. */
  style?: CSSProperties
}
