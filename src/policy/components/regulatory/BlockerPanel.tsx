import { useMemo } from 'react';
import type { EnforcementReport, Blocker, BlockerSeverity, EnforcementRiskLevel } from '@/policy/enforcement/types';

/* ═══════════════════════════════════════════════════════════════
   BlockerPanel — surfaces everything preventing event completion.

   Rendering priorities:
     1. Lock banner (if locked)
     2. Risk chip + headline
     3. Timeline issues (overdue / approaching / minutes past-due)
     4. Approval gaps (grouped by role)
     5. Blockers list (by kind)
     6. Warnings
   ═══════════════════════════════════════════════════════════════ */

const RISK_STYLE: Record<EnforcementRiskLevel, { label: string; bg: string; border: string; color: string }> = {
  'immediate-jeopardy': { label: 'IMMEDIATE JEOPARDY', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.55)', color: '#FCA5A5' },
  'high':               { label: 'HIGH RISK',         bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)', color: '#F87171' },
  'medium':             { label: 'MEDIUM RISK',       bg: 'rgba(255,193,7,0.12)', border: 'rgba(255,193,7,0.35)', color: '#FCD34D' },
  'low':                { label: 'LOW RISK',          bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.35)', color: '#34D399' },
};

const SEVERITY_STYLE: Record<BlockerSeverity, { color: string; bg: string; border: string; dot: string }> = {
  critical: { color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', dot: '#EF4444' },
  high:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)', dot: '#F59E0B' },
  medium:   { color: '#FDE68A', bg: 'rgba(253,230,138,0.08)', border: 'rgba(253,230,138,0.25)', dot: '#FDE68A' },
  low:      { color: '#A7F3D0', bg: 'rgba(167,243,208,0.08)', border: 'rgba(167,243,208,0.20)', dot: '#A7F3D0' },
};

const KIND_LABEL: Record<Blocker['kind'], string> = {
  'step':             'Workflow',
  'form':             'Forms',
  'minutes':          'Minutes',
  'minutes-section':  'Minutes',
  'approval':         'Approvals',
  'evidence':         'Evidence',
  'timeline':         'Timeline',
  'dependency':       'Dependency',
  'lock':             'Lock',
};

export interface BlockerPanelProps {
  report: EnforcementReport;
  onUnlock?: () => void;
  compact?: boolean;
}

export function BlockerPanel({ report, onUnlock, compact }: BlockerPanelProps) {
  const grouped = useMemo(() => {
    const m = new Map<string, Blocker[]>();
    for (const b of report.blockers) {
      const key = KIND_LABEL[b.kind];
      m.set(key, [...(m.get(key) ?? []), b]);
    }
    return Array.from(m.entries());
  }, [report.blockers]);

  const risk = RISK_STYLE[report.riskLevel];

  return (
    <div className="flex flex-col gap-2">
      {/* ── Headline ────────────── */}
      <div
        className="rounded-md px-2.5 py-2 flex items-start gap-2"
        style={{ background: risk.bg, border: `1px solid ${risk.border}` }}
      >
        <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: risk.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-semibold tracking-[0.1em]" style={{ color: risk.color }}>
              {risk.label}
            </span>
            {report.isLocked && (
              <span className="text-[9px] font-semibold tracking-[0.1em] px-1.5 py-0.5 rounded"
                style={{ color: '#C4B5FD', background: 'rgba(167,139,250,0.14)', border: '1px solid rgba(167,139,250,0.32)' }}>
                LOCKED
              </span>
            )}
          </div>
          <p className="text-[10.5px] font-roboto leading-snug" style={{ color: 'rgba(255,255,255,0.80)' }}>
            {report.summary}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9.5px] font-roboto" style={{ color: 'rgba(255,255,255,0.50)' }}>
            <span>Steps {report.progress.stepsComplete}/{report.progress.stepsTotal}</span>
            <span>·</span>
            <span>Forms {report.progress.formsComplete}/{report.progress.formsTotal}</span>
            <span>·</span>
            <span>Evidence {report.progress.evidenceCount}</span>
            {report.progress.minutesRequired && (
              <>
                <span>·</span>
                <span>Minutes {report.progress.minutesFinalized ? 'finalized' : 'pending'}</span>
              </>
            )}
          </div>
        </div>
        {report.isLocked && onUnlock && (
          <button
            onClick={onUnlock}
            className="shrink-0 text-[9.5px] font-roboto font-semibold px-2 py-1 rounded transition"
            style={{ color: '#C4B5FD', background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.28)' }}
          >
            Request Unlock
          </button>
        )}
      </div>

      {/* ── Timeline issues ─────────────── */}
      {report.timelineIssues.length > 0 && !compact && (
        <section className="flex flex-col gap-1">
          {report.timelineIssues.map(t => {
            const s = SEVERITY_STYLE[t.severity];
            return (
              <div key={t.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span className="text-[9px] font-semibold tracking-[0.08em]" style={{ color: s.color }}>
                  {t.kind.replace(/-/g, ' ').toUpperCase()}
                </span>
                <span className="text-[10px] font-roboto flex-1" style={{ color: 'rgba(255,255,255,0.80)' }}>
                  {t.label}
                </span>
              </div>
            );
          })}
        </section>
      )}

      {/* ── Approval gaps ──────────────── */}
      {report.approvalGaps.length > 0 && !compact && (
        <section className="rounded-md border px-2.5 py-2"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-[9px] font-semibold tracking-[0.12em] mb-1.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
            APPROVAL GAPS · {report.approvalGaps.length}
          </div>
          <ul className="flex flex-col gap-1">
            {report.approvalGaps.map(g => (
              <li key={g.id} className="flex items-start gap-2 text-[10px] font-roboto">
                <span className="shrink-0 mt-0.5 w-1 h-1 rounded-full"
                  style={{ background: g.status === 'missing' ? '#EF4444' : '#F59E0B' }} />
                <span className="flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>{g.targetLabel}</span>
                  {' · '}
                  <span>{g.approverRole}</span>
                  {g.escalateToRole && (
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {' → '}escalates to {g.escalateToRole}
                      {g.escalationDueDays != null && ` after ${g.escalationDueDays}d`}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Blockers grouped ───────────── */}
      {grouped.length > 0 && !compact && (
        <section className="flex flex-col gap-1.5">
          {grouped.map(([group, items]) => (
            <div key={group} className="rounded-md border px-2.5 py-2"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-semibold tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  {group.toUpperCase()}
                </span>
                <span className="text-[9px] font-roboto" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {items.length}
                </span>
              </div>
              <ul className="flex flex-col gap-1">
                {items.map(b => {
                  const s = SEVERITY_STYLE[b.severity];
                  return (
                    <li key={b.id} className="flex items-start gap-2">
                      <span className="shrink-0 mt-1 w-1 h-1 rounded-full" style={{ background: s.dot }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-roboto font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                          {b.label}
                        </div>
                        <div className="text-[9.5px] font-roboto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {b.remediation}
                        </div>
                        {b.citation && (
                          <div className="text-[9px] font-roboto mt-0.5" style={{ color: 'rgba(196,181,253,0.7)' }}>
                            {b.citation}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ── Warnings ──────────────────── */}
      {report.warnings.length > 0 && !compact && (
        <section className="rounded-md border px-2.5 py-1.5"
          style={{ background: 'rgba(250,204,21,0.04)', borderColor: 'rgba(250,204,21,0.18)' }}>
          <div className="text-[9px] font-semibold tracking-[0.12em] mb-1" style={{ color: '#FDE68A' }}>
            WARNINGS · {report.warnings.length}
          </div>
          <ul className="flex flex-col gap-0.5">
            {report.warnings.map(w => (
              <li key={w.id} className="text-[10px] font-roboto" style={{ color: 'rgba(255,255,255,0.70)' }}>
                <span className="font-semibold">{w.label}</span>{' · '}
                <span style={{ color: 'rgba(255,255,255,0.50)' }}>{w.remediation}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
