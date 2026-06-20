// Neutral placeholder. Intentionally plain — not the old app, not V6.
// Exists only to prove the baseline runs. Replaced by V6 shell later.
export function ScaffoldPage() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          Care Indeed — Clean Baseline
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.75rem', lineHeight: 1.5 }}>
          Designless scaffold. No UI design implemented yet. The V6 design
          system, shell, and routes will be built on top of this baseline.
        </p>
      </div>
    </main>
  )
}
