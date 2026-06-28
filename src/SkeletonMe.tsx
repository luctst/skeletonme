import type { CSSProperties } from 'react'
import type { SkeletonMeProps } from './SkeletonMe.types'
import { useMeasuredSize } from './useMeasuredSize'
import './skeletonme.css'

/**
 * Wrap any JSX. When `showSkeleton` is true, render an auto-sized shimmering
 * placeholder; otherwise render the children as-is.
 *
 * STUB: renders a single placeholder box sized from `width`/`height` (or the
 * last measured size). The production implementation (owned by the component
 * work) should derive a multi-block skeleton from the children's measured
 * layout and handle the SSR / data-less cases. See PLAN.md.
 */
export function SkeletonMe({
  showSkeleton,
  children,
  skeleton,
  width,
  height,
  className,
  style,
}: SkeletonMeProps) {
  const [measureRef, size] = useMeasuredSize<HTMLDivElement>()

  if (!showSkeleton) {
    return (
      <div ref={measureRef} className={className} style={style}>
        {children}
      </div>
    )
  }

  // Escape hatch: caller-provided placeholder wins.
  if (skeleton) {
    return <>{skeleton}</>
  }

  const resolvedWidth = width ?? (size.width || undefined)
  const resolvedHeight = height ?? (size.height || undefined)

  if (process.env.NODE_ENV !== 'production' && !resolvedWidth && !resolvedHeight) {
    console.warn(
      '[SkeletonMe] showSkeleton is true but the skeleton has no size. There were ' +
        'no measured children (common during SSR or before data loads). Pass `width`/' +
        '`height`, or a custom `skeleton` element, to render a visible placeholder.',
    )
  }

  const skeletonStyle: CSSProperties = { width: resolvedWidth, height: resolvedHeight, ...style }

  return (
    <div
      className={['skeletonme', className].filter(Boolean).join(' ')}
      style={skeletonStyle}
      data-skeletonme=""
      aria-hidden="true"
    />
  )
}
