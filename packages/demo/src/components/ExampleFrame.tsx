import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

interface ExampleFrameProps {
  title: string
  description: string
  className?: string
  children: ReactNode
}

// The labeled surface around a single live demo. The frame is the card, so
// examples render their content directly (no nested bordered card).
export function ExampleFrame({ title, description, className, children }: ExampleFrameProps) {
  return (
    <section className={cn('flex flex-col gap-5 rounded-xl border bg-card p-6', className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-1 items-center">{children}</div>
    </section>
  )
}
