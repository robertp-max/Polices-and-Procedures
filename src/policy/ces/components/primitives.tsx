/* ═══════════════════════════════════════════════════════════════
   CES — Shared UI primitives (cards, badges)
   ═══════════════════════════════════════════════════════════════ */

import { type ReactNode } from 'react';
import { type CesTokens } from '../theme';
import {
  type ComplianceState, type WorkflowPhase, type AuditReadiness,
  type DomainRiskLevel, type SignerStatus,
  COMPLIANCE_STATE_LABEL, WORKFLOW_PHASE_LABEL, AUDIT_READINESS_LABEL,
} from '../types';

/* ── SectionCard — clean corporate, explicit subtle bg to prevent bleed ─────────────────────────────────────────── */
export function CesCard({ title, action, children, padding = true }: {
  title?:   ReactNode;
  action?:  ReactNode;
  children: ReactNode;
  padding?: boolean;
}) {
  return (
    <section
      className="rounded-xl"
      style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--v3-border-subtle)' }}
    >
      {title && (
        <header
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--v3-border-subtle)' }}
        >
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--v3-teal-light)' }}>
            {title}
          </h3>
          {action}
        </header>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

/* ── V3 flat section — clean corporate ─────────────────────────────────────── */
export function V3Section({
  label,
  trailing,
  children,
  divided = true,
}: {
  label?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  divided?: boolean;
}) {
  return (
    <section
      className="flex flex-col gap-2.5"
      style={divided ? { borderTop: '1px solid var(--v3-border-subtle)', paddingTop: 12 } : undefined}
    >
      {(label || trailing) && (
        <div className="flex items-center justify-between gap-3">
          {label && (
            <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--v3-text-tertiary)' }}>
              {label}
            </div>
          )}
          {trailing}
        </div>
      )}
      {children}
    </section>
  );
}

/* ── Flat drawer metadata row ─ clean ────────────────────────────── */
export function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-baseline gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--v3-text-tertiary)' }}>
        {label}
      </span>
      <span className="min-w-0 text-[12px] leading-relaxed" style={{ color: 'var(--v3-text-secondary)' }}>
        {children}
      </span>
    </div>
  );
}

/* ── Inline secondary row metadata — clean ───────────────────────── */
export function MetadataLine({ items }: { items: Array<ReactNode | null | undefined | false> }) {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]" style={{ color: 'var(--v3-text-tertiary)' }}>
      {visible.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </div>
  );
}

/* ── Inline metric, not a boxed stat card ────────────────── */
export function InlineMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[11px] font-semibold" style={{ color: tone ?? 'var(--v3-teal-light)' }}>
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--v3-text-tertiary)' }}>
        {label}
      </span>
    </span>
  );
}

/* ── ComplianceStateBadge — clean corporate, subtle non-bleed bgs matching V3 palette ───────────────────────────────── */
function stateStyle(_t: CesTokens): Record<ComplianceState, { bg: string; fg: string; bd: string }> {
  return {
    upcoming:           { bg: 'rgba(255,255,255,0.02)', fg: 'var(--v3-text-secondary)', bd: 'var(--v3-border-subtle)' },
    ready:              { bg: 'rgba(0,209,193,0.08)',   fg: 'var(--v3-teal-light)',     bd: 'rgba(0,209,193,0.25)' },
    in_progress:        { bg: 'rgba(0,209,193,0.12)',   fg: 'var(--v3-teal-light)',     bd: 'rgba(0,209,193,0.35)' },
    awaiting_signature: { bg: 'rgba(224,123,44,0.10)',  fg: 'var(--v3-orange-light)',   bd: 'rgba(224,123,44,0.3)' },
    blocked:            { bg: 'rgba(239,68,68,0.10)',   fg: '#fecaca',                  bd: 'rgba(239,68,68,0.3)' },
    completed:          { bg: 'rgba(16,185,129,0.08)',  fg: '#4ade80',                  bd: 'rgba(16,185,129,0.25)' },
  };
}

export function ComplianceStateBadge({ state, compact = false }: { state: ComplianceState; compact?: boolean }) {
  const s = stateStyle({} as CesTokens)[state];
  return (
    <span
      className="inline-flex items-center gap-1 rounded font-semibold uppercase tracking-[0.08em]"
      style={{
        background: s.bg, color: s.fg, border: `1px solid ${s.bd}`,
        padding: compact ? '1px 5px' : '2px 6px',
        fontSize: compact ? 8 : 9,
      }}
    >
      {COMPLIANCE_STATE_LABEL[state]}
    </span>
  );
}

/* ── PhaseIndicator ─────────────────────────────────────── */
export function PhaseIndicator({ phase }: { phase: WorkflowPhase }) {
  return (
    <span
      className="inline-flex items-center rounded-md font-semibold uppercase tracking-[0.1em]"
      style={{
        background: 'rgba(255,255,255,0.015)',
        color:      'var(--v3-teal-light)',
        border:    '1px solid var(--v3-border-subtle)',
        padding:   '1px 6px',
        fontSize:   8.5,
      }}
    >
      {WORKFLOW_PHASE_LABEL[phase]}
    </span>
  );
}

/* ── AuditReadinessTag — clean non-bleed ──────────────────────────────────── */
function readyStyle(_t: CesTokens): Record<AuditReadiness, { bg: string; fg: string }> {
  return {
    not_ready: { bg: 'rgba(239,68,68,0.08)',   fg: '#fca5a5' },
    partial:   { bg: 'rgba(224,123,44,0.08)', fg: 'var(--v3-orange-light)' },
    ready:     { bg: 'rgba(16,185,129,0.08)', fg: '#4ade80' },
  };
}

export function AuditReadinessTag({ readiness }: { readiness: AuditReadiness }) {
  const s = readyStyle({} as CesTokens)[readiness]; // values now hardcoded clean below
  return (
    <span
      className="inline-flex items-center gap-1 rounded font-semibold"
      style={{
        background: s.bg, color: s.fg,
        padding: '1px 5px', fontSize: 8.5,
      }}
      title={`Audit readiness: ${AUDIT_READINESS_LABEL[readiness]}`}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: s.fg }} />
      {AUDIT_READINESS_LABEL[readiness]}
    </span>
  );
}

/* ── DomainRiskDot ──────────────────────────────────────── */
export function DomainRiskDot({ level, size = 10 }: { level: DomainRiskLevel; size?: number }) {
  const fg = level === 'red' ? '#fca5a5' : level === 'yellow' ? 'var(--v3-orange-light)' : '#4ade80';
  return <span aria-label={level} className="inline-block rounded-full" style={{ width: size, height: size, background: fg }} />;
}

/* ── UserAvatar ─────────────────────────────────────────── */
export function UserAvatar({ initials, size = 28, status }: {
  initials: string; size?: number; status?: SignerStatus;
}) {
  const ringColor =
    status === 'signed'  ? '#4ade80' :
    status === 'overdue' ? '#fca5a5' :
    status === 'pending' ? 'var(--v3-orange-light)' :
    'var(--v3-border-subtle)';
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold"
      style={{
        width: size, height: size,
        background: 'rgba(255,255,255,0.06)',
        color: 'var(--v3-teal-light)',
        border: `1px solid ${ringColor}`,
        fontSize: Math.max(8, size * 0.32),
      }}
    >
      {initials}
    </span>
  );
}

/* ── EscalationTimer ────────────────────────────────────── */
export function EscalationTimer({ hours }: { hours: number }) {
  const overdue = hours < 0;
  const days    = Math.round(Math.abs(hours) / 24 * 10) / 10;
  const label   = overdue
    ? `Overdue by ${days < 1 ? `${Math.abs(hours)}h` : `${days}d`}`
    : `Escalates in ${days < 1 ? `${hours}h` : `${days}d`}`;
  return (
    <span
      className="inline-flex items-center gap-1 rounded font-semibold"
      style={{
        background: overdue ? 'rgba(239,68,68,0.08)' : 'rgba(224,123,44,0.08)',
        color:      overdue ? '#fecaca' : 'var(--v3-orange-light)',
        padding: '1px 5px', fontSize: 8.5,
      }}
    >
      {label}
    </span>
  );
}

/* ── KV row ────────────────────────────────────────────── */
export function KV({ label, value }: { label: string; value: ReactNode }) {
  return <DetailField label={label}>{value}</DetailField>;
}
