import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { ExampleFrame } from './components/ExampleFrame'
import { examples } from './examples'

export function App() {
  // Mount in the skeleton state — the shimmer is what the visitor lands on.
  const [showSkeleton, setShowSkeleton] = useState(true)

  return (
    <div className="flex min-h-screen flex-col px-6">
      <header className="mx-auto w-full max-w-3xl pt-16 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Loading That Matches Your Layout
        </h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
          Auto-measures your content. Zero sizing config. One boolean.
        </p>
        <Button
          className="mt-8"
          aria-pressed={!showSkeleton}
          onClick={() => setShowSkeleton((prev) => !prev)}
        >
          {showSkeleton ? 'Show Content' : 'Show Skeletons'}
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">
          Flip every example below between its skeleton and the real thing — no layout shift.
        </p>
      </header>

      <main className="mx-auto mt-12 grid w-full max-w-3xl flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {examples.map((example) => (
          <ExampleFrame
            key={example.id}
            title={example.title}
            description={example.description}
            className={example.className}
          >
            <example.Component showSkeleton={showSkeleton} />
          </ExampleFrame>
        ))}
      </main>

      <footer className="mx-auto mt-16 w-full max-w-3xl pb-8 text-center text-sm text-muted-foreground">
        <a
          href="https://github.com/luctst/skeletonme"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          View on GitHub
        </a>
        <span className="mx-2" aria-hidden="true">
          &middot;
        </span>
        <a
          href="https://github.com/luctst/skeletonme#readme"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Read the docs
        </a>
      </footer>
    </div>
  )
}
