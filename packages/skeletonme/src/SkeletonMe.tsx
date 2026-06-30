import type { CSSProperties } from 'react'
import type { SkeletonMeProps } from './SkeletonMe.types'
import { useSkeletonRects } from './hooks/useSkeletonRects'
import './skeletonme.css'

const hiddenChildrenStyle: CSSProperties = { visibility: 'hidden' }

/**
 * Wrap any JSX. When `showSkeleton` is true, measure the rendered children and
 * overlay one shimmer rect per leaf; otherwise render the children as-is.
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
  const auto = showSkeleton && !skeleton
  const [setRef, rects] = useSkeletonRects<HTMLDivElement>(auto)

  if (!showSkeleton) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  if (skeleton) {
    return <>{skeleton}</>
  }

  // Not measured yet: keep children mounted but hidden so the engine can measure them.
  if (rects === null) {
    return (
      <div ref={setRef} aria-hidden="true" style={{ ...style, ...hiddenChildrenStyle }}>
        {children}
      </div>
    )
  }

  if (rects.length > 0) {
    return (
      <div className={className} style={{ position: 'relative', ...style }}>
        <div ref={setRef} aria-hidden="true" style={hiddenChildrenStyle}>
          {children}
        </div>
        {rects.map((rect, i) => (
          <div
            key={i}
            className="skeletonme"
            data-skeletonme=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
            }}
          />
        ))}
      </div>
    )
  }

  // No measurable leaves (data-less / SSR): fall back to an explicit box.
  if (width || height) {
    return (
      <div
        className={['skeletonme', className].filter(Boolean).join(' ')}
        style={{ width, height, ...style }}
        data-skeletonme=""
        aria-hidden="true"
      />
    )
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[SkeletonMe] showSkeleton is true but the skeleton has no size. There were ' +
        'no measured children (common during SSR or before data loads). Pass `width`/' +
        '`height`, or a custom `skeleton` element, to render a visible placeholder.',
    )
  }

  return null
}
