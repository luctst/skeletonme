import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SkeletonMe } from './SkeletonMe'

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

let capturedResizeCallback: (() => void) | null = null

class CapturingResizeObserver {
  constructor(callback: () => void) {
    capturedResizeCallback = callback
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function mockLayout(width: number, height: number): void {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect)
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('SkeletonMe', () => {
  it('renders children when showSkeleton is false', () => {
    render(
      <SkeletonMe showSkeleton={false}>
        <span>Hello</span>
      </SkeletonMe>,
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('hides children and shows a placeholder when showSkeleton is true', () => {
    const { container } = render(
      <SkeletonMe showSkeleton width={100} height={20}>
        <span>Hello</span>
      </SkeletonMe>,
    )
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
    expect(container.querySelector('[data-skeletonme]')).toBeInTheDocument()
  })

  it('renders a custom skeleton via the escape hatch', () => {
    render(
      <SkeletonMe showSkeleton skeleton={<span>loading…</span>}>
        <span>Hello</span>
      </SkeletonMe>,
    )
    expect(screen.getByText('loading…')).toBeInTheDocument()
    expect(screen.queryByText('Hello')).not.toBeInTheDocument()
  })
})

describe('SkeletonMe auto-measured overlays', () => {
  it('renders one overlay rect per measured leaf', () => {
    mockLayout(50, 12)

    const { container } = render(
      <SkeletonMe showSkeleton>
        <div>
          <span>One</span>
          <span>Two</span>
        </div>
      </SkeletonMe>,
    )

    expect(container.querySelectorAll('[data-skeletonme]')).toHaveLength(2)
  })

  it('keeps the real content laid out but visually hidden', () => {
    mockLayout(50, 12)

    render(
      <SkeletonMe showSkeleton>
        <div>
          <span>One</span>
          <span>Two</span>
        </div>
      </SkeletonMe>,
    )

    const text = screen.getByText('One')
    expect(text).toBeInTheDocument()

    const hiddenWrapper = text.closest('[aria-hidden="true"]') as HTMLElement | null
    expect(hiddenWrapper?.style.visibility).toBe('hidden')
  })

  it('renders a single skeleton box when there is no measurable layout but width/height are set', () => {
    const { container } = render(
      <SkeletonMe showSkeleton width={100} height={20}>
        <span>Hello</span>
      </SkeletonMe>,
    )

    expect(container.querySelectorAll('[data-skeletonme]')).toHaveLength(1)
  })

  it('does not double the overlay rects when ResizeObserver re-measures', () => {
    mockLayout(50, 12)
    capturedResizeCallback = null
    vi.stubGlobal('ResizeObserver', CapturingResizeObserver)

    const { container } = render(
      <SkeletonMe showSkeleton>
        <div>
          <span>One</span>
          <span>Two</span>
          <span>Three</span>
        </div>
      </SkeletonMe>,
    )

    expect(container.querySelectorAll('[data-skeletonme]')).toHaveLength(3)

    act(() => {
      capturedResizeCallback?.()
    })

    expect(container.querySelectorAll('[data-skeletonme]')).toHaveLength(3)
  })

  it('renders the skeleton after toggling showSkeleton from false to true', () => {
    mockLayout(50, 12)

    const tree = (
      <SkeletonMe showSkeleton={false}>
        <div>
          <span>One</span>
          <span>Two</span>
          <span>Three</span>
        </div>
      </SkeletonMe>
    )

    const { container, rerender } = render(tree)
    expect(container.querySelectorAll('[data-skeletonme]')).toHaveLength(0)

    act(() => {
      rerender(
        <SkeletonMe showSkeleton>
          <div>
            <span>One</span>
            <span>Two</span>
            <span>Three</span>
          </div>
        </SkeletonMe>,
      )
    })

    expect(container.querySelectorAll('[data-skeletonme]')).toHaveLength(3)
  })

  it('keeps the width/height fallback box when a stale ResizeObserver re-measures after the node detaches', () => {
    capturedResizeCallback = null
    vi.stubGlobal('ResizeObserver', CapturingResizeObserver)

    const { container } = render(
      <SkeletonMe showSkeleton width={100} height={20}>
        <span>x</span>
      </SkeletonMe>,
    )

    expect(container.querySelectorAll('[data-skeletonme]')).toHaveLength(1)

    act(() => {
      capturedResizeCallback?.()
    })

    expect(container.querySelectorAll('[data-skeletonme]')).toHaveLength(1)
  })

  it('warns in dev when there is no layout, no width/height, and no skeleton', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <SkeletonMe showSkeleton>
        <span>Hello</span>
      </SkeletonMe>,
    )

    expect(warn).toHaveBeenCalledOnce()
  })
})
