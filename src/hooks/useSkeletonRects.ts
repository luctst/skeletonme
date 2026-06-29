import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { LeafRect } from '../engine/collectLeafRects'
import { collectLeafRects } from '../engine/collectLeafRects'

export function useSkeletonRects<T extends HTMLElement>(
  enabled: boolean,
): [(node: T | null) => void, LeafRect[] | null] {
  // null = not measured yet; [] = measured, nothing to overlay.
  const [rects, setRects] = useState<LeafRect[] | null>(null)
  const nodeRef = useRef<T | null>(null)

  const measure = useCallback(() => {
    if (!enabled) {
      setRects(null)
      return
    }
    const node = nodeRef.current
    // No-clobber: node detached (stale ResizeObserver tick) — keep last rects, don't oscillate.
    if (!node) return
    setRects(collectLeafRects(node))
  }, [enabled])

  const setRef = useCallback((node: T | null) => {
    nodeRef.current = node
  }, [])

  useLayoutEffect(() => {
    measure()

    const node = nodeRef.current
    if (!enabled || !node || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => measure())
    observer.observe(node)
    return () => observer.disconnect()
  }, [measure])

  return [setRef, rects]
}
