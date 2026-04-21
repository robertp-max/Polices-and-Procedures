import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { RequirementSnapshotItem } from '../lib/responseTypes';

/* ═══════════════════════════════════════════════════════════════
   RequirementsSnapshot — compact rows that feel like a survey
   prep checklist. Matches the `requirementsSnapshot` shape of the
   response contract.
   ═══════════════════════════════════════════════════════════════ */

export interface RequirementsSnapshotProps {
  items: RequirementSnapshotItem[];
  isLight: boolean;
  onOpenReference: (policyId: string) => void;
}

export function RequirementsSnapshot({ items, isLight, onOpenReference }: RequirementsSnapshotProps) {
  if (items.length === 0) return null;

  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';
  const accent = isLight ? '#C74601' : '#FFC107';

  return (
    <section
      className="rounded-2xl"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      <header className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
        >
          Requirements Snapshot
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </header>
      <ul className="divide-y" style={{ borderColor: border }}>
        {items.map((it, idx) => (
          <li
            key={`${it.sourcePolicyId}-${idx}`}
            className="px-5 py-3 flex items-center gap-3"
            style={{ borderTop: idx === 0 ? 'none' : `1px solid ${border}` }}
          >
            <StatusIcon status={it.status} isLight={isLight} />
            <div className="flex-1 min-w-0">
              <div className="text-sm" style={{ color: text }}>{it.label}</div>
              {(it.sourcePolicyId || it.sourceSection) && (
                <div
                  className="text-[11px] mt-0.5"
                  style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {it.sourcePolicyId && (
                    <button
                      type="button"
                      onClick={() => it.sourcePolicyId && onOpenReference(it.sourcePolicyId)}
                      className="hover:underline"
                      style={{ color: isLight ? '#52404B' : 'rgba(255,255,255,0.65)' }}
                    >
                      {it.sourcePolicyId}
                    </button>
                  )}
                  {it.sourcePolicyId && it.sourceSection && ' · '}
                  {it.sourceSection}
                </div>
              )}
            </div>
            <StatusChip status={it.status} isLight={isLight} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusIcon({ status, isLight }: { status: RequirementSnapshotItem['status']; isLight: boolean }) {
  const size = 16;
  if (status === 'warning') {
    return <AlertTriangle size={size} strokeWidth={1.75} style={{ color: isLight ? '#B45309' : '#FCD34D' }} />;
  }
  if (status === 'required') {
    return <CheckCircle2 size={size} strokeWidth={1.75} style={{ color: isLight ? '#047857' : '#6EE7B7' }} />;
  }
  return <Info size={size} strokeWidth={1.75} style={{ color: isLight ? '#2563EB' : '#93C5FD' }} />;
}

function StatusChip({ status, isLight }: { status: RequirementSnapshotItem['status']; isLight: boolean }) {
  const cfg = status === 'warning'
    ? { bg: isLight ? '#FFF7ED' : 'rgba(252,211,77,0.08)', text: isLight ? '#B45309' : '#FCD34D', label: 'WARNING' }
    : status === 'required'
      ? { bg: isLight ? '#ECFDF5' : 'rgba(110,231,183,0.08)', text: isLight ? '#047857' : '#6EE7B7', label: 'REQUIRED' }
      : { bg: isLight ? '#EFF6FF' : 'rgba(147,197,253,0.08)', text: isLight ? '#1D4ED8' : '#93C5FD', label: 'RECOMMENDED' };
  return (
    <span
      className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
      style={{
        color: cfg.text,
        background: cfg.bg,
        letterSpacing: '0.18em',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {cfg.label}
    </span>
  );
}
