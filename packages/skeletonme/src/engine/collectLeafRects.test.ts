import { describe, expect, it, vi } from 'vitest'
import { collectLeafRects } from './collectLeafRects'

function setRect(
  el: HTMLElement,
  rect: { left: number; top: number; width: number; height: number },
): void {
  const value: DOMRect = {
    x: rect.left,
    y: rect.top,
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    width: rect.width,
    height: rect.height,
    toJSON: () => ({}),
  }
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(value)
}

describe('collectLeafRects', () => {
  it('returns one rect per leaf element that has a non-zero size', () => {
    const root = document.createElement('div')
    setRect(root, { left: 0, top: 0, width: 200, height: 100 })

    const first = document.createElement('span')
    setRect(first, { left: 0, top: 0, width: 80, height: 20 })
    root.appendChild(first)

    const second = document.createElement('span')
    setRect(second, { left: 0, top: 30, width: 120, height: 20 })
    root.appendChild(second)

    expect(collectLeafRects(root)).toStrictEqual([
      { x: 0, y: 0, width: 80, height: 20 },
      { x: 0, y: 30, width: 120, height: 20 },
    ])
  })

  it('skips container elements that have child elements', () => {
    const root = document.createElement('div')
    setRect(root, { left: 0, top: 0, width: 200, height: 100 })

    const container = document.createElement('div')
    setRect(container, { left: 0, top: 0, width: 200, height: 50 })
    root.appendChild(container)

    const leaf = document.createElement('span')
    setRect(leaf, { left: 5, top: 5, width: 50, height: 10 })
    container.appendChild(leaf)

    expect(collectLeafRects(root)).toStrictEqual([{ x: 5, y: 5, width: 50, height: 10 }])
  })

  it('skips zero-size leaves', () => {
    const root = document.createElement('div')
    setRect(root, { left: 0, top: 0, width: 200, height: 100 })

    const zeroWidth = document.createElement('span')
    setRect(zeroWidth, { left: 0, top: 0, width: 0, height: 20 })
    root.appendChild(zeroWidth)

    const zeroHeight = document.createElement('span')
    setRect(zeroHeight, { left: 0, top: 0, width: 40, height: 0 })
    root.appendChild(zeroHeight)

    const real = document.createElement('span')
    setRect(real, { left: 0, top: 0, width: 40, height: 20 })
    root.appendChild(real)

    expect(collectLeafRects(root)).toStrictEqual([{ x: 0, y: 0, width: 40, height: 20 }])
  })

  it('returns coordinates relative to the root', () => {
    const root = document.createElement('div')
    setRect(root, { left: 10, top: 20, width: 300, height: 200 })

    const leaf = document.createElement('span')
    setRect(leaf, { left: 30, top: 50, width: 100, height: 40 })
    root.appendChild(leaf)

    expect(collectLeafRects(root)).toStrictEqual([{ x: 20, y: 30, width: 100, height: 40 }])
  })
})
