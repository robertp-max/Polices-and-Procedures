import { Quote } from 'lucide-react';
import type { Citation } from '../lib/responseTypes';
import { ReferenceLink } from './ReferenceLink';
import { ReferenceText } from './ReferenceText';

export interface CitationChipsProps {
  citations: Citation[];
  isLight: boolean;
  onOpenReference: (_policyId: string) => void;
}

export function CitationChips({ citations, isLight, onOpenReference: _onOpenReference }: CitationChipsProps) {
  if (citations.length === 0) return null;

  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';
  const accent = isLight ? '#C74601' : '#FFC107';

  return (
    <section
      className="rounded-2xl p-5"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Quote size={14} strokeWidth={1.75} style={{ color: accent }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
        >
          Reference Material
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
        >
          · {citations.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {citations.map(c => {
          const isPrimary = c.relevance === 'primary';
          return (
            <div
              key={c.id}
              className="group text-left flex items-start gap-3 rounded-xl p-3 transition-colors"
              style={{
                background: isLight ? '#FAFAFA' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isPrimary ? (isLight ? '#FFD5BF' : 'rgba(255,193,7,0.28)') : border}`,
              }}
            >
              <div
                className="shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-md"
                style={{
                  color: isPrimary ? (isLight ? '#FFFFFF' : '#0A0202') : (isLight ? '#52404B' : 'rgba(255,255,255,0.65)'),
                  background: isPrimary
                    ? (isLight ? '#C74601' : 'linear-gradient(to bottom,#FFC107,#D9A406)')
                    : (isLight ? '#F0EFEE' : 'rgba(255,255,255,0.04)'),
                  fontFamily: "'JetBrains Mono', monospace",
                  minWidth: 64,
                  textAlign: 'center',
                }}
              >
                {isPrimary ? 'PRIMARY' : 'SUPPORT'}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[12px] font-semibold mb-0.5"
                  style={{
                    color: text,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <ReferenceLink id={c.policyId} isLight={isLight}>
                    {c.policyId}
                  </ReferenceLink>
                  {' '}
                  ·
                  {' '}
                  {c.title}
                </div>
                <div
                  className="text-[11px] mb-1.5"
                  style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {c.section}
                </div>
                <div
                  className="text-[13px] leading-relaxed italic"
                  style={{ color: text }}
                >
                  “<ReferenceText text={c.excerpt} isLight={isLight} />”
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
