import { Compass } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   NoAnswer — explicit "no direct corpus match" state.

   We never fabricate an answer, but we also never leave the
   administrator staring at a red dead-end. When no policy matches
   literally, this banner softens the message and hands off to the
   ScenarioResponse card (rendered alongside) for compliance
   guidance derived from the scenario taxonomy.
   ═══════════════════════════════════════════════════════════════ */

export interface NoAnswerProps {
  reason: string;
  isLight: boolean;
  /** Set when a scenario mapping is rendered right next to this card. */
  hasScenarioMapping?: boolean;
  onRetry?: () => void;
}

export function NoAnswer({ reason, isLight, hasScenarioMapping, onRetry }: NoAnswerProps) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';
  const accent = isLight ? '#C74601' : '#FFC107';

  const headline = hasScenarioMapping
    ? 'No Exact Policy Match'
    : 'No Direct Corpus Match';

  const subline = hasScenarioMapping
    ? 'This input did not return a literal policy citation. Brad has applied the closest regulatory scenario mapping below — review and proceed with the workflow guidance.'
    : (reason || 'The corpus did not return a literal match for this command. Brad will not fabricate an answer.');

  return (
    <section
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{
        background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)',
        border: `1px dashed ${border}`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{
          width: 40,
          height: 40,
          background: isLight ? '#FFF7ED' : 'rgba(255,193,7,0.05)',
          color: accent,
        }}
      >
        <Compass size={18} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1"
          style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {headline}
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: text }}>
          {subline}
        </p>
        {!hasScenarioMapping && (
          <p className="text-[11px] leading-relaxed mt-2" style={{ color: muted }}>
            Try citing a specific policy or form ID, narrowing to a domain, or asking for a related artifact.
          </p>
        )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: isLight ? '#FFFFFF' : '#0A0202',
            background: isLight ? '#C74601' : 'linear-gradient(to bottom,#FFC107,#D9A406)',
            border: 'none',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Retry
        </button>
      )}
      </div>
    </section>
  );
}
