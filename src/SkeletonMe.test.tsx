import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkeletonMe } from './SkeletonMe'

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
