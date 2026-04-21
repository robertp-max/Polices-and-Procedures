import { SearchX } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   NoAnswer — explicit absence state. We NEVER fall back to a
   "best guess"; the corpus is the authority, and the UI shows
   that clearly when nothing matches.
   ═══════════════════════════════════════════════════════════════ */

export interface NoAnswerProps {
  reason: string;
  isLight: boolean;
  onRetry?: () => void;
}

export function NoAnswer({ reason, isLight, onRetry }: NoAnswerProps) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';
  const accent = isLight ? '#C74601' : '#FFC107';

  return (
    <section
      className="rounded-2xl p-6 flex flex-col items-center text-center"
      style={{
        background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)',
        border: `1px dashed ${border}`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full mb-4"
        style={{
          width: 44,
          height: 44,
          background: isLight ? '#FFF7ED' : 'rgba(255,193,7,0.05)',
          color: accent,
        }}
      >
        <SearchX size={20} strokeWidth={1.75} />
      </div>
      <div
        className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2"
        style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
      >
        No Answer Found
      </div>
      <p
        className="text-[13px] leading-relaxed max-w-[48ch]"
        style={{ color: text }}
      >
        {reason || 'The internal corpus does not support an answer to this command.'}
      </p>
      <p
        className="text-[11px] leading-relaxed mt-2 max-w-[48ch]"
        style={{ color: muted }}
      >
        Try citing a specific policy or form ID, narrowing to a domain, or asking for a related artifact.
      </p>
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
    </section>
  );
}
