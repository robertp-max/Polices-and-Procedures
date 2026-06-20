import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import {
  ACHC_BUNDLE_ID,
  ACHC_BUNDLE_NAME,
  ACHC_REQUIRED_MODULE_IDS,
  calculateAchcBundleSummary,
  calculateAchcEmployeeStatus,
  isDirectCareRole,
} from '@/policy/journey/utils/achcTrainingCalculations';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
// SurfaceCard in onboarding uses legacy padding children (metrics/sections); prototype exact structure (shell/ToneBadge/h3/h-2) used in dashboard/CES.
import { StatusPill } from '../components/StatusPill'; // domain-specialized pill for status mapping
import { AUDIT_LABEL } from '../engine/audit';
import { PHASE_LABEL } from '../types';
import { batchRoleIds, batchEffective } from './batchHelpers';

type Tab = 'all' | 'inflight' | 'blocked' | 'awaiting' | 'completed';

export function DashboardPage() {
  const snap = useOnboardingV2Store(s => s.snap);
  const journeyEmployees = useJourneyStore(s => s.employees);
  const journeyAttempts = useJourneyStore(s => s.attempts);
  const journeyEvidence = useJourneyStore(s => s.evidence);
  const [tab, _setTab] = useState<Tab>('inflight');

  const kpis = useMemo(() => {
    const open = snap.batches.filter(b => b.status !== 'Completed' && b.status !== 'Withdrawn');
    const blocked = snap.units.filter(u => u.status === 'Blocked');
    const awaitingSig = snap.units.filter(u => u.status === 'AwaitingSignature');
    const awaitingEv = snap.units.filter(u => u.status === 'AwaitingEvidence');
    const overdue = snap.units.filter(u => u.dueAt && new Date(u.dueAt) < new Date() && u.status !== 'Completed');
    return { open: open.length, blocked: blocked.length, awaitingSig: awaitingSig.length, awaitingEv: awaitingEv.length, overdue: overdue.length };
  }, [snap]);

  const filtered = useMemo(() => {
    return snap.batches.filter(b => {
      switch (tab) {
        case 'all':       return true;
        case 'inflight':  return b.status === 'InProgress' || b.status === 'AtRisk';
        case 'blocked':   return b.status === 'Blocked';
        case 'awaiting':  return b.status === 'AwaitingEvidence' || b.status === 'AwaitingSignature';
        case 'completed': return b.status === 'Completed';
      }
    });
  }, [snap.batches, tab]);

  const recentAudit = useMemo(() => snap.audit.slice(-15).reverse(), [snap.audit]);
  const achcSummary = useMemo(() => {
    const directCare = journeyEmployees.filter(employee => isDirectCareRole(employee.role));
    const statuses = directCare.map(employee => calculateAchcEmployeeStatus({
      employee,
      attempts: journeyAttempts,
      evidence: journeyEvidence,
    }));
    const compliant = statuses.filter(status => calculateAchcBundleSummary(status).bundle_passed).length;
    const overdue = statuses.filter(status => status.bundle_status === 'overdue').length;
    const inProgress = statuses.filter(status => status.bundle_status === 'in_progress').length;
    const evidenceMissing = statuses.filter(status => {
      const bundle = calculateAchcBundleSummary(status);
      return status.passed_modules_count > 0 && bundle.personnel_file_evidence_status !== 'complete';
    }).length;
    return { directCare: directCare.length, compliant, overdue, inProgress, evidenceMissing };
  }, [journeyEmployees, journeyAttempts, journeyEvidence]);

  return (
    <div className="p-5 md:p-6 space-y-5 overflow-y-auto h-full">
      <PageHeader
        eyebrow="ONBOARDING V2"
        title="Compliance Activation Dashboard"
        description="Audit-grade view of every active subject, gate, and outstanding evidence requirement. Every state change is hash-chained and surveyor-defensible."
        actions={
          <Link
            to="/onboarding-v2/activate"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--v3-border-subtle)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[var(--v3-surface-elevated)] transition"
          >
            <Sparkles size={14} /> Activate Subject
          </Link>
        }
      />

      {/* KPI strip — using surface cards for premium corporate hierarchy/spacing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Open batches', value: kpis.open, hint: 'Active, not completed/withdrawn' },
          { label: 'Blocked units', value: kpis.blocked, hint: 'Pre-conditions or override gating', tone: kpis.blocked ? 'danger' : 'default' },
          { label: 'Awaiting signature', value: kpis.awaitingSig, hint: 'eCIgn envelopes pending', tone: kpis.awaitingSig ? 'warning' : 'default' },
          { label: 'Awaiting evidence', value: kpis.awaitingEv, hint: 'Forms / uploads needed', tone: kpis.awaitingEv ? 'warning' : 'default' },
          { label: 'Overdue units', value: kpis.overdue, hint: 'Past SLA dueAt', tone: kpis.overdue ? 'danger' : 'default' },
        ].map((k, i) => (
          <SurfaceCard key={i} padding="sm" className="min-h-[84px]">
            <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.18em] text-[var(--v3-text-tertiary)]">{k.label}</div>
            <div className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-[var(--v3-text-primary)]">{k.value}</div>
            <div className="mt-0.5 text-[10px] text-[var(--v3-text-tertiary)]">{k.hint}</div>
          </SurfaceCard>
        ))}
      </div>

      {/* ACHC Bundle — premium card */}
      <SurfaceCard padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.18em] text-[var(--brand-primary,#00797D)]">{ACHC_BUNDLE_ID}</div>
            <div className="text-[15px] font-semibold text-[var(--v3-text-primary)] mt-0.5">{ACHC_BUNDLE_NAME}</div>
            <p className="text-[12px] text-[var(--v3-text-secondary)] mt-1 max-w-prose">
              Canonical annual direct-care bundle: {ACHC_REQUIRED_MODULE_IDS.length} required modules assigned on hire and annually. Completion is UAT-only until backend personnel/evidence persistence is implemented.
            </p>
          </div>
          <StatusPill status={achcSummary.overdue ? 'RevalidationDue' : achcSummary.compliant === achcSummary.directCare && achcSummary.directCare > 0 ? 'Completed' : 'InProgress'} size="md" />
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { l: 'Direct-care', v: achcSummary.directCare },
            { l: 'Bundle compliant', v: achcSummary.compliant },
            { l: 'In progress', v: achcSummary.inProgress },
            { l: 'Overdue', v: achcSummary.overdue },
            { l: 'Evidence gaps', v: achcSummary.evidenceMissing },
          ].map((k, idx) => (
            <div key={idx} className="text-center border border-[var(--v3-border-subtle)] rounded p-2">
              <div className="text-xl font-semibold">{k.v}</div>
              <div className="text-[10px] text-[var(--v3-text-tertiary)]">{k.l}</div>
            </div>
          ))}
        </div>
      </SurfaceCard>

      {/* Batches list with premium card + filters (already have tabs/search above) */}
      <SurfaceCard padding="lg">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={15} className="text-[var(--brand-primary,#00797D)]" />
          <div className="font-montserrat text-sm font-semibold tracking-tight">Active Batches</div>
        </div>
        <ul className="divide-y divide-[var(--v3-border-subtle)]">
          {filtered.length === 0 && (
            <li className="px-2 py-8 text-sm text-[var(--v3-text-tertiary)] text-center">No batches in this view.</li>
          )}
          {filtered.map(b => {
            const subject = snap.workforce.find(w => w.id === b.subjectId)
                         ?? snap.vendors.find(v => v.id === b.subjectId);
            const subjectName = (subject as { legalName?: string } | undefined)?.legalName ?? b.subjectId;
            const total = snap.units.filter(u => u.batchId === b.id).length;
            const done = snap.units.filter(u => u.batchId === b.id && u.status === 'Completed').length;
            return (
              <li key={b.id}>
                <Link to={`/onboarding-v2/batches/${b.id}`} className="flex items-center gap-3 px-2 py-3 rounded hover:bg-[var(--v3-surface-elevated)] transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-[13px] font-semibold text-[var(--v3-text-primary)]">{subjectName}</div>
                      <span className="text-[10px] text-[var(--v3-text-tertiary)] tabular-nums">{b.id}</span>
                    </div>
                    <div className="text-[11px] text-[var(--v3-text-secondary)] mt-0.5">
                      {batchRoleIds(b).join(', ') || '—'} · trigger <span className="font-mono">{b.triggerType}</span>
                      {batchEffective(b) && <> · effective {new Date(batchEffective(b) as string).toLocaleDateString()}</>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusPill status={b.status} />
                    <div className="text-[10px] tabular-nums text-[var(--v3-text-tertiary)]">{done}/{total} units</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </SurfaceCard>

      {/* Phase distribution + audit feed — premium 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <SurfaceCard padding="lg" className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={15} className="text-[var(--brand-primary,#00797D)]" />
            <div className="font-montserrat text-sm font-semibold tracking-tight">Open Units by Phase</div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {Object.entries(PHASE_LABEL).map(([phase, label]) => {
              const n = snap.units.filter(u => u.phase === phase && u.status !== 'Completed' && u.status !== 'Suppressed').length;
              return (
                <div key={phase} className="border border-[var(--v3-border-subtle)] rounded-md p-2.5 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-[var(--v3-text-tertiary)] truncate" title={label}>{label}</div>
                  <div className="text-2xl font-semibold tabular-nums text-[var(--v3-text-primary)]">{n}</div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <SurfaceCard padding="lg" className="lg:col-span-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-[var(--brand-primary,#00797D)]" />
            <div className="font-montserrat text-sm font-semibold tracking-tight">Live Audit Feed</div>
          </div>
          <ul className="divide-y divide-[var(--v3-border-subtle)] max-h-[260px] overflow-y-auto text-sm">
            {recentAudit.map(ev => (
              <li key={ev.id} className="py-2">
                <div className="text-[10px] uppercase tracking-wider text-[var(--v3-text-tertiary)] tabular-nums">
                  #{ev.sequence} · {new Date(ev.createdAt).toLocaleTimeString()}
                </div>
                <div className="text-[12px] font-semibold text-[var(--v3-text-primary)]">{AUDIT_LABEL[ev.eventType]}</div>
                <div className="text-[10px] text-[var(--v3-text-secondary)]">subject {ev.subjectId ?? '—'}</div>
              </li>
            ))}
            {recentAudit.length === 0 && (
              <li className="py-6 text-xs text-[var(--v3-text-tertiary)] text-center">No audit events yet.</li>
            )}
          </ul>
        </SurfaceCard>
      </div>
    </div>
  );
}
