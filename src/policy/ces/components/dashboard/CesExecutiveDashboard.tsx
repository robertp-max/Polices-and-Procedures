/* ═══════════════════════════════════════════════════════════════
   CES Executive Dashboard
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { AlertTriangle, ChevronRight, Clock, ShieldCheck, FileWarning, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CES_TOKENS } from '../../theme';
import { useComplianceExecution } from '@/policy/compliance-execution';
import {
  CesCard, ComplianceStateBadge, PhaseIndicator, AuditReadinessTag,
  DomainRiskDot, UserAvatar, EscalationTimer,
} from '../primitives';
import {
  COMPLIANCE_DOMAIN_LABEL, WORKFLOW_PHASE_ORDER, WORKFLOW_PHASE_LABEL,
} from '../../types';

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CesExecutiveDashboard() {
  const snap = useComplianceExecution();
  const EXECUTION_UNITS = snap.executionUnits;
  const DOMAIN_RISKS    = snap.domainRisks;
  const SPRINT_METRICS  = snap.sprintMetrics;
  const ACTIVE_SPRINT   = snap.activeSprint;
  const SPRINT_TRENDS   = snap.sprintTrends;
  const getEvent = (id: string) => snap.events.find(e => e.id === id);

  /* ── Critical risk: any awaiting_signature overdue OR blocked at audit phase ── */
  const criticalUnits = useMemo(
    () => EXECUTION_UNITS.filter(u =>
      (u.complianceState === 'awaiting_signature' && (u.escalationTimer ?? 0) < 0) ||
      (u.complianceState === 'blocked' && u.workflowPhase === 'audit'),
    ),
    [EXECUTION_UNITS],
  );

  const upcomingDeadlines = useMemo(() => {
    const now    = new Date(ACTIVE_SPRINT.startDate).getTime();
    const limit  = now + 1000 * 60 * 60 * 24 * 30; // wide window for demo
    return EXECUTION_UNITS
      .filter(u => u.complianceState !== 'completed')
      .filter(u => {
        const t = new Date(u.dueDate).getTime();
        return t >= now && t <= limit;
      })
      .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
      .slice(0, 6);
  }, [EXECUTION_UNITS, ACTIVE_SPRINT.startDate]);

  /* ── Phase volume distribution ── */
  const phaseVolumes = useMemo(() => {
    const counts = WORKFLOW_PHASE_ORDER.map(p => ({
      phase: p,
      count: EXECUTION_UNITS.filter(u => u.workflowPhase === p && u.complianceState !== 'completed').length,
    }));
    const max = Math.max(1, ...counts.map(c => c.count));
    return counts.map(c => ({ ...c, pct: (c.count / max) * 100 }));
  }, [EXECUTION_UNITS]);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-[22px] font-bold" style={{ color: CES_TOKENS.navy }}>
          Sprint Execution Overview
        </h1>
        <p className="text-[13px] mt-1" style={{ color: CES_TOKENS.muted }}>
          Calendar-driven, sequential compliance execution. Every metric below is a regulatory commitment.
        </p>
      </div>

      {/* ── Critical Risk Banner ───────────────────────── */}
      {criticalUnits.length > 0 && (
        <div
          className="rounded-xl px-5 py-4 flex items-center gap-4"
          style={{ background: CES_TOKENS.redSoft, border: `1px solid ${CES_TOKENS.red}55` }}
        >
          <AlertTriangle size={22} style={{ color: CES_TOKENS.red }} />
          <div className="flex-1">
            <div className="text-[13px] font-bold" style={{ color: CES_TOKENS.red }}>
              {criticalUnits.length} critical execution unit{criticalUnits.length === 1 ? '' : 's'} require immediate attention
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: CES_TOKENS.ink }}>
              {criticalUnits.slice(0, 2).map(u => u.title).join(' · ')}
              {criticalUnits.length > 2 && ` · +${criticalUnits.length - 2} more`}
            </div>
          </div>
          <Link
            to="/ces/board"
            className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-2 rounded-lg"
            style={{ background: CES_TOKENS.red, color: 'white' }}
          >
            Open Sprint Board <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Hero Metrics ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<ShieldCheck size={16} />}
          label="Compliance Completion"
          value={`${SPRINT_METRICS.completionRatePct}%`}
          trend={`+${SPRINT_METRICS.completionRatePct - SPRINT_TRENDS[SPRINT_TRENDS.length - 2].completionRatePct}% vs Sprint 13`}
          trendKind="negative"
        />
        <MetricCard
          icon={<ShieldCheck size={16} />}
          label="Audit Readiness Score"
          value={`${SPRINT_METRICS.auditReadinessScore} / 100`}
          trend="Target ≥ 85"
          trendKind="warn"
        />
        <MetricCard
          icon={<FileWarning size={16} />}
          label="Active Blockers"
          value={`${SPRINT_METRICS.activeBlockerCount}`}
          trend={`${SPRINT_METRICS.activeBlockerCount > 2 ? 'Above' : 'Within'} threshold`}
          trendKind={SPRINT_METRICS.activeBlockerCount > 2 ? 'negative' : 'positive'}
        />
        <MetricCard
          icon={<PenLine size={16} />}
          label="Signature SLAs Missed"
          value={`${SPRINT_METRICS.signatureSlasMissed}`}
          trend="Carry-over from Sprint 13"
          trendKind={SPRINT_METRICS.signatureSlasMissed > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* ── Two-column grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk heatmap */}
        <div className="lg:col-span-2">
          <CesCard title="Compliance Risk Heatmap">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DOMAIN_RISKS.map(r => {
                const tone =
                  r.level === 'red'    ? { bg: CES_TOKENS.redSoft,   bd: CES_TOKENS.red,    fg: CES_TOKENS.red } :
                  r.level === 'yellow' ? { bg: CES_TOKENS.amberSoft, bd: CES_TOKENS.amber,  fg: CES_TOKENS.amber } :
                                         { bg: CES_TOKENS.greenSoft, bd: CES_TOKENS.green,  fg: CES_TOKENS.green };
                return (
                  <div
                    key={r.domain}
                    className="rounded-lg p-4"
                    style={{ background: tone.bg, border: `1px solid ${tone.bd}55` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: tone.fg }}>
                        {COMPLIANCE_DOMAIN_LABEL[r.domain]}
                      </span>
                      <DomainRiskDot level={r.level} />
                    </div>
                    <div className="mt-2 text-[20px] font-bold" style={{ color: CES_TOKENS.ink }}>
                      {r.openUnits}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: CES_TOKENS.muted }}>
                      open units · {r.blockedCount} blocked
                    </div>
                    <div className="mt-2 text-[11.5px] leading-snug" style={{ color: CES_TOKENS.ink }}>
                      {r.reason}
                    </div>
                  </div>
                );
              })}
            </div>
          </CesCard>
        </div>

        {/* Sprint progress flow */}
        <CesCard title="Sprint Phase Distribution">
          <div className="space-y-3">
            {phaseVolumes.map(p => (
              <div key={p.phase}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold" style={{ color: CES_TOKENS.ink }}>
                    {WORKFLOW_PHASE_LABEL[p.phase]}
                  </span>
                  <span className="font-mono" style={{ color: CES_TOKENS.muted }}>{p.count} units</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: CES_TOKENS.canvas }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${p.pct}%`, background: CES_TOKENS.navy }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CesCard>
      </div>

      {/* ── Upcoming + Risk indicators ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CesCard title="Upcoming Deadlines (next 48h+)">
          <ul className="divide-y" style={{ borderColor: CES_TOKENS.border }}>
            {upcomingDeadlines.map(u => {
              const ev = getEvent(u.parentEventId);
              return (
                <li key={u.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                  <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono" style={{ color: CES_TOKENS.navy }}>
                    <Clock size={12} />
                    {fmtDateShort(u.dueDate)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: CES_TOKENS.ink }}>{u.title}</div>
                    <div className="text-[11px]" style={{ color: CES_TOKENS.muted }}>
                      {ev?.title ?? '—'} · {u.owner.name}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                      <PhaseIndicator phase={u.workflowPhase} />
                      <ComplianceStateBadge state={u.complianceState} compact />
                      <AuditReadinessTag readiness={u.auditReadiness} />
                    </div>
                  </div>
                  <UserAvatar initials={u.owner.initials} size={26} />
                </li>
              );
            })}
          </ul>
        </CesCard>

        <CesCard title="Risk Indicators — High Compliance Exposure">
          <ul className="space-y-3">
            {EXECUTION_UNITS
              .filter(u => u.complianceState === 'blocked' || (u.escalationTimer ?? 1) < 0)
              .slice(0, 6)
              .map(u => (
                <li
                  key={u.id}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: CES_TOKENS.redSoft, border: `1px solid ${CES_TOKENS.red}33` }}
                >
                  <AlertTriangle size={16} style={{ color: CES_TOKENS.red }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold" style={{ color: CES_TOKENS.ink }}>
                      {u.title}
                    </div>
                    <div className="text-[11px]" style={{ color: CES_TOKENS.muted }}>
                      Owner: {u.owner.name} · Due {fmtDateShort(u.dueDate)}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                      {u.blockedReason && (
                        <span
                          className="text-[10px] font-semibold rounded-md px-2 py-0.5"
                          style={{ background: 'white', color: CES_TOKENS.red, border: `1px solid ${CES_TOKENS.red}55` }}
                        >
                          {u.blockedReason.label}
                        </span>
                      )}
                      {(u.escalationTimer ?? 0) < 0 && <EscalationTimer hours={u.escalationTimer!} />}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </CesCard>
      </div>
    </div>
  );
}

/* ── MetricCard (local) ─────────────────────────────────── */
function MetricCard({ icon, label, value, trend, trendKind }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendKind: 'positive' | 'negative' | 'warn';
}) {
  const trendColor =
    trendKind === 'positive' ? CES_TOKENS.green :
    trendKind === 'warn'     ? CES_TOKENS.amber : CES_TOKENS.red;
  return (
    <div
      className="rounded-xl p-5 shadow-sm"
      style={{ background: CES_TOKENS.white, border: `1px solid ${CES_TOKENS.border}` }}
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: CES_TOKENS.muted }}>
        <span style={{ color: CES_TOKENS.navy }}>{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-[28px] font-bold leading-none" style={{ color: CES_TOKENS.navy }}>
        {value}
      </div>
      <div className="mt-2 text-[11px] font-medium" style={{ color: trendColor }}>
        {trend}
      </div>
    </div>
  );
}
