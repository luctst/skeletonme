import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { SkeletonMe } from '../src/SkeletonMe'

// A realistic multi-leaf card: avatar + name + role + two-line bio.
function ProfileCard() {
  return (
    <div style={{ display: 'flex', gap: 12, width: 320, padding: 16, alignItems: 'flex-start' }}>
      <div
        data-leaf="avatar"
        style={{ width: 48, height: 48, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <span data-leaf="name" style={{ fontSize: 18, fontWeight: 600 }}>
          Lucas Tostée
        </span>
        <span data-leaf="role" style={{ fontSize: 14, color: '#64748b' }}>
          Senior Engineer
        </span>
        <p data-leaf="bio" style={{ fontSize: 13, lineHeight: 1.4, margin: 0 }}>
          Builds developer tools and obsesses over the first two minutes of every
          library's onboarding experience.
        </p>
      </div>
    </div>
  )
}

function Case({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ borderBottom: '1px solid #e2e8f0', padding: 24 }}>
      <h2 style={{ font: '600 14px system-ui', margin: '0 0 12px' }}>{title}</h2>
      {children}
    </section>
  )
}

function App() {
  const [loading, setLoading] = useState(false)

  return (
    <div style={{ font: '14px system-ui', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ padding: 24 }}>
        <button id="toggle" onClick={() => setLoading((v) => !v)}>
          Toggle loading (now: {String(loading)})
        </button>
      </div>

      <Case id="case-auto" title="Auto multi-block (the magic)">
        <div id="auto-host">
          <SkeletonMe showSkeleton={loading}>
            <ProfileCard />
          </SkeletonMe>
        </div>
      </Case>

      <Case id="case-fallback" title="Data-less fallback (no measurable layout → width/height box)">
        <div id="fallback-host">
          <SkeletonMe showSkeleton={loading} width={220} height={44}>
            <span style={{ display: 'none' }}>hidden, zero layout</span>
          </SkeletonMe>
        </div>
      </Case>

      <Case id="case-escape" title="Escape hatch (custom skeleton)">
        <div id="escape-host">
          <SkeletonMe showSkeleton={loading} skeleton={<div id="custom-skel">custom loading…</div>}>
            <ProfileCard />
          </SkeletonMe>
        </div>
      </Case>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
