import { useCallback, useState } from 'react'

export interface Size {
  width: number
  height: number
}

/**
 * Measures the rendered size of an element via a callback ref.
 *
 * STUB: reads `getBoundingClientRect` once on mount. The production version
 * (owned by the component implementation) should use a `ResizeObserver` for
 * live updates and handle first-paint flash + the SSR (no-DOM) case.
 */
export function useMeasuredSize<T extends HTMLElement>(): [(node: T | null) => void, Size] {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  const ref = useCallback((node: T | null) => {
    if (!node) return
    const rect = node.getBoundingClientRect()
    setSize({ width: rect.width, height: rect.height })
  }, [])

  return [ref, size]
}
