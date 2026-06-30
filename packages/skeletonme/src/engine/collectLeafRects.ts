/** A leaf element's box, positioned relative to the walked root. */
export interface LeafRect {
  x: number
  y: number
  width: number
  height: number
}

export function collectLeafRects(root: HTMLElement): LeafRect[] {
  const rootRect = root.getBoundingClientRect()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  const rects: LeafRect[] = []

  let node = walker.nextNode() as HTMLElement | null
  while (node) {
    if (node.firstElementChild === null) {
      const rect = node.getBoundingClientRect()
      if (rect.width !== 0 && rect.height !== 0) {
        rects.push({
          x: rect.left - rootRect.left,
          y: rect.top - rootRect.top,
          width: rect.width,
          height: rect.height,
        })
      }
    }
    node = walker.nextNode() as HTMLElement | null
  }

  return rects
}
