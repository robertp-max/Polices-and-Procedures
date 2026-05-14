import { DEMO_DISCLAIMER } from '../data/disclaimer';

export function DemoBanner() {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide"
      style={{
        background: 'var(--ci-info-bg, #e8f0fe)',
        borderBottom: '1px solid var(--ci-border)',
        color: 'var(--ci-text-muted-2, #4b5563)',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.1em',
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: '#6b7280' }}
        aria-hidden="true"
      />
      DEMO — {DEMO_DISCLAIMER}
    </div>
  );
}
