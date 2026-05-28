/* ═══════════════════════════════════════════════════════════════
   CES — Shared UI primitives (cards, badges)
   ═══════════════════════════════════════════════════════════════ */

import { type ReactNode } from 'react';
import { useCesTokens, type CesTokens } from '../theme';
import {
  type ComplianceState, type WorkflowPhase, type AuditReadiness,
  type DomainRiskLevel, type SignerStatus,
  COMPLIANCE_STATE_LABEL, WORKFLOW_PHASE_LABEL, AUDIT_READINESS_LABEL,
} from '../types';

/* ── SectionCard ─────────────────────────────────────────── */
export function CesCard({ title, action, children, padding = true }: {
  title?:   ReactNode;
  action?:  ReactNode;
  children: ReactNode;
  padding?: boolean;
}) {
  const t = useCesTokens();
  return (
    <section
      className="rounded-xl"
      style={{ background: t.white, border: `1px solid ${t.borderSoft}` }}
    >
      {title && (
        <header
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1px solid ${t.border}` }}
        >
          <h3 className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: t.navy }}>
            {title}
          </h3>
          {action}
        </header>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

/* ── V3 flat section ─────────────────────────────────────── */
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
  const t = useCesTokens();
  return (
    <section
      className="flex flex-col gap-2.5"
      style={divided ? { borderTop: `1px solid var(--v3-border-subtle, ${t.borderSoft})`, paddingTop: 12 } : undefined}
    >
      {(label || trailing) && (
        <div className="flex items-center justify-between gap-3">
          {label && (
            <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: `var(--v3-text-tertiary, ${t.muted})` }}>
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

/* ── Flat drawer metadata row ────────────────────────────── */
export function DetailField({ label, children }: { label: string; children: ReactNode }) {
  const t = useCesTokens();
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-baseline gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: `var(--v3-text-tertiary, ${t.muted})` }}>
        {label}
      </span>
      <span className="min-w-0 text-[12px] leading-relaxed" style={{ color: `var(--v3-text-secondary, ${t.ink})` }}>
        {children}
      </span>
    </div>
  );
}

/* ── Inline secondary row metadata ───────────────────────── */
export function MetadataLine({ items }: { items: Array<ReactNode | null | undefined | false> }) {
  const t = useCesTokens();
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]" style={{ color: `var(--v3-text-tertiary, ${t.muted})` }}>
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
  const t = useCesTokens();
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[12px] font-semibold" style={{ color: tone ?? `var(--v3-teal-light, ${t.navy})` }}>
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: `var(--v3-text-tertiary, ${t.muted})` }}>
        {label}
      </span>
    </span>
  );
}

/* ── ComplianceStateBadge ───────────────────────────────── */
function stateStyle(t: CesTokens): Record<ComplianceState, { bg: string; fg: string; bd: string }> {
  return {
    upcoming:           { bg: t.canvas,     fg: t.muted,  bd: t.border },
    ready:              { bg: t.navySoft,   fg: t.navy,   bd: t.navy + '33' },
    in_progress:        { bg: t.navySoft,   fg: t.navy,   bd: t.navy + '55' },
    awaiting_signature: { bg: t.orangeSoft, fg: t.orange, bd: t.orange + '55' },
    blocked:            { bg: t.redSoft,    fg: t.red,    bd: t.red + '55' },
    completed:          { bg: t.greenSoft,  fg: t.green,  bd: t.green + '55' },
  };
}

export function ComplianceStateBadge({ state, compact = false }: { state: ComplianceState; compact?: boolean }) {
  const t = useCesTokens();
  const s = stateStyle(t)[state];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-[0.1em]"
      style={{
        background: s.bg, color: s.fg, border: `1px solid ${s.bd}`,
        padding: compact ? '2px 7px' : '3px 9px',
        fontSize: compact ? 9.5 : 10,
      }}
    >
      {COMPLIANCE_STATE_LABEL[state]}
    </span>
  );
}

/* ── PhaseIndicator ─────────────────────────────────────── */
export function PhaseIndicator({ phase }: { phase: WorkflowPhase }) {
  const t = useCesTokens();
  return (
    <span
      className="inline-flex items-center rounded-md font-semibold uppercase tracking-[0.1em]"
      style={{
        background: t.paper,
        color:      t.navy,
        border:    `1px solid ${t.border}`,
        padding:   '2px 7px',
        fontSize:   9.5,
      }}
    >
      {WORKFLOW_PHASE_LABEL[phase]}
    </span>
  );
}

/* ── AuditReadinessTag ──────────────────────────────────── */
function readyStyle(t: CesTokens): Record<AuditReadiness, { bg: string; fg: string }> {
  return {
    not_ready: { bg: t.redSoft,   fg: t.red },
    partial:   { bg: t.amberSoft, fg: t.amber },
    ready:     { bg: t.greenSoft, fg: t.green },
  };
}

export function AuditReadinessTag({ readiness }: { readiness: AuditReadiness }) {
  const t = useCesTokens();
  const s = readyStyle(t)[readiness];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md font-semibold"
      style={{
        background: s.bg, color: s.fg,
        padding: '2px 7px', fontSize: 10,
      }}
      title={`Audit readiness: ${AUDIT_READINESS_LABEL[readiness]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fg }} />
      {AUDIT_READINESS_LABEL[readiness]}
    </span>
  );
}

/* ── DomainRiskDot ──────────────────────────────────────── */
export function DomainRiskDot({ level, size = 10 }: { level: DomainRiskLevel; size?: number }) {
  const t = useCesTokens();
  const fg = level === 'red' ? t.red : level === 'yellow' ? t.amber : t.green;
  return <span aria-label={level} className="inline-block rounded-full" style={{ width: size, height: size, background: fg }} />;
}

/* ── UserAvatar ─────────────────────────────────────────── */
export function UserAvatar({ initials, size = 28, status }: {
  initials: string; size?: number; status?: SignerStatus;
}) {
  const t = useCesTokens();
  const ringColor =
    status === 'signed'  ? t.green :
    status === 'overdue' ? t.red :
    status === 'pending' ? t.orange :
    t.border;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold"
      style={{
        width: size, height: size,
        background: t.navySoft, color: t.navy,
        border: `2px solid ${ringColor}`,
        fontSize: Math.max(9, size * 0.35),
      }}
    >
      {initials}
    </span>
  );
}

/* ── EscalationTimer ────────────────────────────────────── */
export function EscalationTimer({ hours }: { hours: number }) {
  const t = useCesTokens();
  const overdue = hours < 0;
  const days    = Math.round(Math.abs(hours) / 24 * 10) / 10;
  const label   = overdue
    ? `Overdue by ${days < 1 ? `${Math.abs(hours)}h` : `${days}d`}`
    : `Escalates in ${days < 1 ? `${hours}h` : `${days}d`}`;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md font-semibold"
      style={{
        background: overdue ? t.redSoft : t.orangeSoft,
        color:      overdue ? t.red     : t.orange,
        padding: '2px 7px', fontSize: 10,
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
