/* ═══════════════════════════════════════════════════════════════
   CES — Shared UI primitives (cards, badges)
   ═══════════════════════════════════════════════════════════════ */

import { type ReactNode } from 'react';
import { CES_TOKENS } from '../theme';
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
  return (
    <section
      className="rounded-xl shadow-sm"
      style={{ background: CES_TOKENS.white, border: `1px solid ${CES_TOKENS.border}` }}
    >
      {title && (
        <header
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1px solid ${CES_TOKENS.border}` }}
        >
          <h3 className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: CES_TOKENS.navy }}>
            {title}
          </h3>
          {action}
        </header>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

/* ── ComplianceStateBadge ───────────────────────────────── */
const STATE_STYLE: Record<ComplianceState, { bg: string; fg: string; bd: string }> = {
  upcoming:           { bg: CES_TOKENS.canvas,    fg: CES_TOKENS.muted,  bd: CES_TOKENS.border },
  ready:              { bg: CES_TOKENS.navySoft,  fg: CES_TOKENS.navy,   bd: CES_TOKENS.navy + '33' },
  in_progress:        { bg: CES_TOKENS.navySoft,  fg: CES_TOKENS.navy,   bd: CES_TOKENS.navy + '55' },
  awaiting_signature: { bg: CES_TOKENS.orangeSoft,fg: CES_TOKENS.orange, bd: CES_TOKENS.orange + '55' },
  blocked:            { bg: CES_TOKENS.redSoft,   fg: CES_TOKENS.red,    bd: CES_TOKENS.red + '55' },
  completed:          { bg: CES_TOKENS.greenSoft, fg: CES_TOKENS.green,  bd: CES_TOKENS.green + '55' },
};

export function ComplianceStateBadge({ state, compact = false }: { state: ComplianceState; compact?: boolean }) {
  const s = STATE_STYLE[state];
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
  return (
    <span
      className="inline-flex items-center rounded-md font-semibold uppercase tracking-[0.1em]"
      style={{
        background: CES_TOKENS.paper,
        color:      CES_TOKENS.navy,
        border:    `1px solid ${CES_TOKENS.border}`,
        padding:   '2px 7px',
        fontSize:   9.5,
      }}
    >
      {WORKFLOW_PHASE_LABEL[phase]}
    </span>
  );
}

/* ── AuditReadinessTag ──────────────────────────────────── */
const READY_STYLE: Record<AuditReadiness, { bg: string; fg: string }> = {
  not_ready: { bg: CES_TOKENS.redSoft,   fg: CES_TOKENS.red },
  partial:   { bg: CES_TOKENS.amberSoft, fg: CES_TOKENS.amber },
  ready:     { bg: CES_TOKENS.greenSoft, fg: CES_TOKENS.green },
};

export function AuditReadinessTag({ readiness }: { readiness: AuditReadiness }) {
  const s = READY_STYLE[readiness];
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
  const fg = level === 'red' ? CES_TOKENS.red : level === 'yellow' ? CES_TOKENS.amber : CES_TOKENS.green;
  return <span aria-label={level} className="inline-block rounded-full" style={{ width: size, height: size, background: fg }} />;
}

/* ── UserAvatar ─────────────────────────────────────────── */
export function UserAvatar({ initials, size = 28, status }: {
  initials: string; size?: number; status?: SignerStatus;
}) {
  const ringColor =
    status === 'signed'  ? CES_TOKENS.green :
    status === 'overdue' ? CES_TOKENS.red :
    status === 'pending' ? CES_TOKENS.orange :
    CES_TOKENS.border;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-bold"
      style={{
        width: size, height: size,
        background: CES_TOKENS.navySoft, color: CES_TOKENS.navy,
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
  const overdue = hours < 0;
  const days    = Math.round(Math.abs(hours) / 24 * 10) / 10;
  const label   = overdue
    ? `Overdue by ${days < 1 ? `${Math.abs(hours)}h` : `${days}d`}`
    : `Escalates in ${days < 1 ? `${hours}h` : `${days}d`}`;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md font-semibold"
      style={{
        background: overdue ? CES_TOKENS.redSoft : CES_TOKENS.orangeSoft,
        color:      overdue ? CES_TOKENS.red     : CES_TOKENS.orange,
        padding: '2px 7px', fontSize: 10,
      }}
    >
      {label}
    </span>
  );
}

/* ── KV row ────────────────────────────────────────────── */
export function KV({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: CES_TOKENS.muted }}>{label}</span>
      <span className="text-[12.5px] font-medium" style={{ color: CES_TOKENS.ink }}>{value}</span>
    </div>
  );
}
