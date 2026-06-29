import type { CSSProperties } from 'react'
import type { SkeletonMeProps } from './SkeletonMe.types'
import { useMeasuredSize } from './hooks/useMeasuredSize'
import './skeletonme.css'

/**
 * Wrap any JSX. When `showSkeleton` is true, render an auto-sized shimmering
 * placeholder; otherwise render the children as-is.
 *
 * STUB: renders a single placeholder box sized from `width`/`height` (or the
 * last measured size). The production implementation (owned by the component
 * work) should derive a multi-block skeleton from the children's measured
 * layout and handle the SSR / data-less cases.
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

  // NOTE: still the single-box stub. v1 replaces this with the multi-block
  // engine — walk the rendered children (TreeWalker + per-leaf
  // getBoundingClientRect) and overlay one shimmer rect per leaf. Boundaries:
  // content-sized text skeletons at one line; children that render null / empty
  // lists during load fall back to the `skeleton` prop (the template model
  // closes that in v1.1).
  return (
    <div
      className={['skeletonme', className].filter(Boolean).join(' ')}
      style={skeletonStyle}
      data-skeletonme=""
      aria-hidden="true"
    />
  )
}
