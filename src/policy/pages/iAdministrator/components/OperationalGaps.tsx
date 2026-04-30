/**
 * OperationalGaps + LifecycleAlerts
 *
 * Renders Phase 1 deterministic compliance gap cards below the structured
 * answer. These records are NOT LLM-generated — they come from structured
 * app state (Phase 1 seed, Phase 2+ live adapters).
 *
 * Design rules:
 * - Match existing iAdministrator card aesthetic (no new color system)
 * - Never show patient-identifiable data (PHI minimized)
 * - Always show phaseStatus disclaimer so operators know data provenance
 */

import { useState } from 'react';
import { AlertTriangle, Clock, FileX, CheckCircle2, Lock, ChevronDown, ChevronUp, Activity, BookOpen, AlertCircle } from 'lucide-react';
import type {
  GapSeverity,
  LifecycleAlert,
  LifecycleState,
  OperationalGap,
  OperationalGapType,
  PhaseStatus,
} from '../lib/responseTypes.js';
import { ReferenceLink } from './ReferenceLink';

const ACCENT = '#C8A96E';

/* ── Severity styling ─────────────────────────────────────────────── */

interface SevStyle { bg: string; border: string; text: string; dot: string }

function sevStyle(sev: GapSeverity, isLight: boolean): SevStyle {
  const styles: Record<GapSeverity, SevStyle> = {
    critical: {
      bg: isLight ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.12)',
      border: 'rgba(220,38,38,0.35)',
      text: '#DC2626',
      dot: '#DC2626',
    },
    high: {
      bg: isLight ? 'rgba(234,88,12,0.06)' : 'rgba(234,88,12,0.12)',
      border: 'rgba(234,88,12,0.35)',
      text: '#EA580C',
      dot: '#EA580C',
    },
    moderate: {
      bg: isLight ? 'rgba(200,169,110,0.08)' : 'rgba(200,169,110,0.12)',
      border: 'rgba(200,169,110,0.35)',
      text: ACCENT,
      dot: ACCENT,
    },
    low: {
      bg: isLight ? 'rgba(100,116,139,0.06)' : 'rgba(100,116,139,0.12)',
      border: 'rgba(100,116,139,0.25)',
      text: isLight ? '#64748B' : '#94A3B8',
      dot: '#64748B',
    },
  };
  return styles[sev];
}

/* ── Gap type icons ───────────────────────────────────────────────── */

function GapIcon({ type, size = 13 }: { type: OperationalGapType; size?: number }) {
  const props = { size, strokeWidth: 2 };
  switch (type) {
    case 'overdue_task': return <Clock {...props} />;
    case 'missing_artifact': return <FileX {...props} />;
    case 'unsigned_form': return <FileX {...props} />;
    case 'pending_approval': return <Lock {...props} />;
    case 'blocked_workflow': return <AlertTriangle {...props} />;
    case 'incomplete_form': return <FileX {...props} />;
    case 'overdue_event': return <Clock {...props} />;
    case 'ehr_gap': return <Activity {...props} />;
    default: return <AlertCircle {...props} />;
  }
}

/* ── Lifecycle state labels ───────────────────────────────────────── */

const LIFECYCLE_LABELS: Record<LifecycleState, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  pending_approval: 'Pending Approval',
  overdue_review: 'Overdue Review',
  approved_unpublished: 'Approved — Unpublished',
  awaiting_acknowledgment: 'Awaiting Acknowledgment',
  missing_linked_artifact: 'Missing Linked Artifact',
};

/* ── Individual gap card ──────────────────────────────────────────── */

function GapCard({ gap, isLight }: { gap: OperationalGap; isLight: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const s = sevStyle(gap.severity, isLight);
  const mono = "'JetBrains Mono', monospace";
  const textColor = isLight ? '#1F1C1B' : '#E8E4DF';
  const subColor = isLight ? '#6B6860' : '#9B9488';

  return (
    <div
      className="rounded-lg mb-2"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-2.5 p-3 text-left hover:opacity-90 transition-opacity"
      >
        <span style={{ color: s.text, flexShrink: 0, marginTop: '1px' }}>
          <GapIcon type={gap.type} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.25em] px-1.5 py-0.5 rounded"
              style={{
                color: s.text,
                background: s.border,
                fontFamily: mono,
              }}
            >
              {gap.severity}
            </span>
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: subColor, fontFamily: mono }}
            >
              {gap.type.replace(/_/g, ' ')}
            </span>
            {gap.overdueDays && (
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: '#DC2626', fontFamily: mono }}
              >
                {gap.overdueDays}d overdue
              </span>
            )}
          </div>
          <p
            className="text-[12px] font-semibold mt-0.5 leading-snug"
            style={{ color: textColor }}
          >
            {gap.title}
          </p>
          {gap.owner && (
            <p className="text-[10px] mt-0.5" style={{ color: subColor }}>
              Owner: {gap.owner}
              {gap.linkedPolicyId && (
                <>
                  {' '}
                  ·
                  {' '}
                  <ReferenceLink id={gap.linkedPolicyId} isLight={isLight}>
                    {gap.linkedPolicyId}
                  </ReferenceLink>
                </>
              )}
            </p>
          )}
        </div>
        <span style={{ color: subColor, flexShrink: 0, marginTop: '2px' }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="px-3 pb-3 text-[11px] space-y-2"
          style={{ color: subColor, borderTop: `1px solid ${s.border}` }}
        >
          <p className="pt-2" style={{ color: textColor }}>{gap.description}</p>
          <div
            className="rounded p-2 text-[10px]"
            style={{ background: isLight ? 'rgba(220,38,38,0.05)' : 'rgba(220,38,38,0.08)', color: '#DC2626' }}
          >
            <span className="font-bold uppercase tracking-[0.15em]" style={{ fontFamily: mono }}>
              Compliance Impact:{' '}
            </span>
            {gap.complianceImpact}
          </div>
          <div
            className="rounded p-2 text-[10px]"
            style={{ background: isLight ? 'rgba(200,169,110,0.08)' : 'rgba(200,169,110,0.06)', color: ACCENT }}
          >
            <span className="font-bold uppercase tracking-[0.15em]" style={{ fontFamily: mono }}>
              Next Action:{' '}
            </span>
            <span style={{ color: textColor }}>{gap.nextAction}</span>
          </div>
          {gap.linkedFormId && (
            <p className="text-[10px]" style={{ fontFamily: mono, color: subColor }}>
              Linked Form:{' '}
              <ReferenceLink id={gap.linkedFormId} isLight={isLight}>
                {gap.linkedFormId}
              </ReferenceLink>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Lifecycle alert card ─────────────────────────────────────────── */

function LifecycleCard({ alert, isLight }: { alert: LifecycleAlert; isLight: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const s = sevStyle(alert.severity, isLight);
  const mono = "'JetBrains Mono', monospace";
  const textColor = isLight ? '#1F1C1B' : '#E8E4DF';
  const subColor = isLight ? '#6B6860' : '#9B9488';

  return (
    <div
      className="rounded-lg mb-2"
      style={{ background: s.bg, border: `1px solid ${s.border}`, overflow: 'hidden' }}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-2.5 p-3 text-left hover:opacity-90 transition-opacity"
      >
        <span style={{ color: s.text, flexShrink: 0, marginTop: '1px' }}>
          <BookOpen size={13} strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.25em] px-1.5 py-0.5 rounded"
              style={{ color: s.text, background: s.border, fontFamily: mono }}
            >
              {LIFECYCLE_LABELS[alert.state] ?? alert.state.replace(/_/g, ' ')}
            </span>
            {alert.overdueDays && (
              <span className="text-[9px] font-semibold" style={{ color: '#DC2626', fontFamily: mono }}>
                {alert.overdueDays}d overdue
              </span>
            )}
          </div>
          <p className="text-[12px] font-semibold mt-0.5" style={{ color: textColor }}>
            <ReferenceLink id={alert.policyId} isLight={isLight}>
              {alert.policyId}
            </ReferenceLink>
            {' '}
            -
            {' '}
            {alert.policyTitle}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: subColor }}>
            Owner: {alert.owner}{alert.approver ? ` · Approver: ${alert.approver}` : ''}
          </p>
        </div>
        <span style={{ color: subColor, flexShrink: 0, marginTop: '2px' }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>
      {expanded && (
        <div
          className="px-3 pb-3 space-y-2"
          style={{ color: subColor, borderTop: `1px solid ${s.border}` }}
        >
          <div
            className="rounded p-2 text-[10px] mt-2"
            style={{ background: isLight ? 'rgba(200,169,110,0.08)' : 'rgba(200,169,110,0.06)', color: ACCENT }}
          >
            <span className="font-bold uppercase tracking-[0.15em]" style={{ fontFamily: mono }}>
              Next Action:{' '}
            </span>
            <span style={{ color: textColor }}>{alert.nextAction}</span>
          </div>
          {alert.blockedBy && (
            <div className="rounded p-2 text-[10px]" style={{ background: 'rgba(220,38,38,0.06)', color: '#DC2626' }}>
              <span className="font-bold uppercase tracking-[0.15em]" style={{ fontFamily: mono }}>
                Blocked By:{' '}
              </span>
              {alert.blockedBy}
            </div>
          )}
          {alert.dueDate && (
            <p className="text-[10px]" style={{ fontFamily: mono, color: subColor }}>
              Due: {alert.dueDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Phase disclaimer badge ───────────────────────────────────────── */

function PhaseDisclaimer({ phaseStatus, isLight }: { phaseStatus: PhaseStatus; isLight: boolean }) {
  const mono = "'JetBrains Mono', monospace";
  const subColor = isLight ? '#9B9488' : '#6B6860';
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {([1, 2, 3] as const).map(n => {
        const p = phaseStatus[`phase${n}` as 'phase1' | 'phase2' | 'phase3'];
        return (
          <span
            key={n}
            title={p.dataSource}
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{
              fontFamily: mono,
              color: p.available ? ACCENT : subColor,
              background: p.available
                ? (isLight ? 'rgba(200,169,110,0.12)' : 'rgba(200,169,110,0.08)')
                : (isLight ? 'rgba(100,116,139,0.08)' : 'rgba(100,116,139,0.12)'),
              border: `1px solid ${p.available ? 'rgba(200,169,110,0.3)' : 'rgba(100,116,139,0.2)'}`,
              opacity: p.available ? 1 : 0.6,
            }}
          >
            {p.available ? '●' : '○'} Phase {n}: {p.label}
          </span>
        );
      })}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────── */

export interface OperationalGapsProps {
  operationalGaps?: OperationalGap[];
  lifecycleAlerts?: LifecycleAlert[];
  phaseStatus?: PhaseStatus;
  isLight: boolean;
}

export function OperationalGaps({
  operationalGaps = [],
  lifecycleAlerts = [],
  phaseStatus,
  isLight,
}: OperationalGapsProps) {
  const [gapsOpen, setGapsOpen] = useState(true);
  const [lifecycleOpen, setLifecycleOpen] = useState(true);

  const subColor = isLight ? '#6B6860' : '#9B9488';
  const divider = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const mono = "'JetBrains Mono', monospace";

  const criticalCount = operationalGaps.filter(g => g.severity === 'critical').length;
  const highCount = operationalGaps.filter(g => g.severity === 'high').length;

  if (operationalGaps.length === 0 && lifecycleAlerts.length === 0) return null;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${divider}` }}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <Activity size={13} strokeWidth={2} style={{ color: ACCENT }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: ACCENT, fontFamily: mono }}
        >
          Operational State
        </span>
        {criticalCount > 0 && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: '#fff', background: '#DC2626', fontFamily: mono }}
          >
            {criticalCount} critical
          </span>
        )}
        {highCount > 0 && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: '#fff', background: '#EA580C', fontFamily: mono }}
          >
            {highCount} high
          </span>
        )}
      </div>

      {phaseStatus && <PhaseDisclaimer phaseStatus={phaseStatus} isLight={isLight} />}

      {/* Operational gaps */}
      {operationalGaps.length > 0 && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setGapsOpen(v => !v)}
            className="flex items-center gap-1.5 mb-2 hover:opacity-75 transition-opacity"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: subColor, fontFamily: mono }}>
              Compliance Gaps ({operationalGaps.length})
            </span>
            {gapsOpen ? <ChevronUp size={11} style={{ color: subColor }} /> : <ChevronDown size={11} style={{ color: subColor }} />}
          </button>
          {gapsOpen && operationalGaps.map(g => (
            <GapCard key={g.id} gap={g} isLight={isLight} />
          ))}
        </div>
      )}

      {/* Lifecycle alerts */}
      {lifecycleAlerts.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setLifecycleOpen(v => !v)}
            className="flex items-center gap-1.5 mb-2 hover:opacity-75 transition-opacity"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: subColor, fontFamily: mono }}>
              Policy Lifecycle ({lifecycleAlerts.length})
            </span>
            {lifecycleOpen ? <ChevronUp size={11} style={{ color: subColor }} /> : <ChevronDown size={11} style={{ color: subColor }} />}
          </button>
          {lifecycleOpen && lifecycleAlerts.map(a => (
            <LifecycleCard key={a.id} alert={a} isLight={isLight} />
          ))}
        </div>
      )}

      {/* Phase 3 notice */}
      {phaseStatus && !phaseStatus.phase3.available && (
        <div
          className="mt-3 rounded p-2 text-[10px]"
          style={{
            color: subColor,
            background: isLight ? 'rgba(100,116,139,0.06)' : 'rgba(100,116,139,0.1)',
            border: `1px solid ${divider}`,
          }}
        >
          <CheckCircle2 size={10} strokeWidth={2} style={{ display: 'inline', marginRight: '4px' }} />
          <strong>Phase 3 (EHR-Derived Assessment)</strong> is not yet integrated. EHR compliance gaps will appear here when the EHR adapter is connected.
        </div>
      )}
    </div>
  );
}
