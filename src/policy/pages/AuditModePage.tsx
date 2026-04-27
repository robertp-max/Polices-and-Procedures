import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, AlertOctagon, Download, FileJson,
  ChevronRight, Lock, Unlock, Clock, Check, X,
  ExternalLink, Search, FolderOpen, History, FileText,
  GitBranch, ListChecks, Table2, LayoutList, Filter,
  AlertCircle, CheckCircle2, BadgeCheck, FileWarning,
} from 'lucide-react';
import {
  REGULATORY_EVENTS, DOMAIN_PALETTE, formatEventDate, TODAY_ANCHOR, daysUntil,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import {
  useRegulatoryExecutionStore,
  useEventEvidence, useEventCertification,
} from '@/policy/stores/regulatoryExecutionStore';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import { useEnforcementBatch } from '@/policy/enforcement/useEnforcement';
import { HelpContextLink } from '@/policy/help/HelpContextLink';
import { computeRiskScore, summarizeAgencyRisk, type RiskScore } from '@/policy/audit/riskScoring';
import { buildAuditBundle, bundleToMarkdown, downloadBlob } from '@/policy/audit/exportReport';
import {
  classifyAuditState, buildCompletionChecklist,
  AUDIT_STATE_COLOR, AUDIT_STATE_LABEL, emptyCounts,
  type AuditState, type AuditStateCounts,
} from '@/policy/audit/auditState';
import { TEAL_PRIMARY, ACTION_COLOR } from '@/policy/components/regulatory/timelineState';
import { useToastStore, ToastHost } from '@/policy/components/regulatory/Toast';
import {
  buildAuditAggregate, presetRange,
  type AuditAggregateFilters, type AuditDateRange,
} from '@/policy/audit/auditAggregate';
import {
  buildSurveyPacket, packetToSurveyMarkdown, packetToSurveyHtml,
  rollupToSurveyMarkdown, type SurveyRollupHeader,
} from '@/policy/audit/surveyPacket';
import {
  buildWorkflowInstance, useWorkflowInstance,
} from '@/policy/audit/workflowInstance';
import {
  useComplianceExecution, selectAuditReadinessRollup, selectCriticalUnits,
} from '@/policy/compliance-execution';

/* ═══════════════════════════════════════════════════════════════
   AUDIT — Compliance Validation + Survey Readiness
   ----------------------------------------------------------------
   Four regions in one canvas:

     REGION 1  Command header — title, filter chips, search, export
     REGION 2  Audit health strip — 6 tiles, clickable
     REGION 3  Queue (grouped | matrix toggle)
     REGION 4  Detail panel — 7 tabs (Summary, Missing Items,
               Evidence, Approvals, Timeline, Dependencies, Audit Trail)

   Design rules: exact state labels, exact badge language, serious
   and premium — no playful decoration, no guesswork.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Types ────────────────────────────────────────────────── */

/** Named quick-filter presets shown as filter chips. */
type QuickFilter =
  | 'all'
  | 'july-readiness'
  | 'not-certifiable'
  | 'missing-evidence'
  | 'pending-approval'
  | 'overdue'
  | 'ready-to-certify'
  | 'certified'
  | 'governance'
  | 'qapi'
  | 'billing-critical'
  | 'survey-critical';

type QueueView = 'grouped' | 'matrix';
type DetailTab = 'summary' | 'missing-items' | 'evidence' | 'approvals' | 'timeline' | 'dependencies' | 'audit-trail';

const QUICK_FILTER_LABELS: Record<QuickFilter, string> = {
  'all':             'All',
  'july-readiness':  'July Readiness',
  'not-certifiable': 'Not Certifiable',
  'missing-evidence':'Missing Evidence',
  'pending-approval':'Pending Approval',
  'overdue':         'Overdue',
  'ready-to-certify':'Ready to Certify',
  'certified':       'Certified',
  'governance':      'Governance',
  'qapi':            'QAPI',
  'billing-critical':'Billing Critical',
  'survey-critical': 'Survey Critical',
};

/** Named grouping sections for the queue. */
const QUEUE_GROUPS: Array<{
  id:     string;
  label:  string;
  states: AuditState[];
  color:  string;
}> = [
  { id: 'immediate',        label: 'Needs Immediate Review', states: ['overdue', 'blocked', 'not-certifiable'],        color: '#EF4444' },
  { id: 'missing-evidence', label: 'Missing Evidence',       states: ['complete-missing-evidence'],                    color: '#F59E0B' },
  { id: 'pending-approval', label: 'Pending Approval',       states: ['complete-pending-approval'],                    color: '#F59E0B' },
  { id: 'ready',            label: 'Ready to Certify',       states: ['audit-ready'],                                  color: ACTION_COLOR },
  { id: 'certified',        label: 'Certified & Locked',     states: ['certified-locked'],                             color: AUDIT_STATE_COLOR['certified-locked'] },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function AuditModePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const today = TODAY_ANCHOR;

  const exec      = useRegulatoryExecutionStore();
  const generated = useAutogenStore(s => s.generatedEvents);
  const triggered = useAutogenStore(s => s.triggeredEvents);

  const allEvents: RegulatoryEvent[] = useMemo(
    () => [...REGULATORY_EVENTS, ...generated, ...triggered].filter(e => !e.isContext),
    [generated, triggered],
  );

  /* ── Classify every instance ── */
  const auditByEvent = useMemo(() => {
    const out: Record<string, AuditState> = {};
    for (const ev of allEvents) out[ev.id] = classifyAuditState(ev, today, exec);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents, today, exec.completions, exec.certifications, exec.stepStates, exec.formStates, exec.approvals, exec.minutesStates]);

  /* ── System totals (region 2 health strip counts always use all events) ── */
  const healthCounts: AuditStateCounts = useMemo(() => {
    const c = emptyCounts();
    for (const ev of allEvents) c[auditByEvent[ev.id]] += 1;
    return c;
  }, [allEvents, auditByEvent]);

  /* ── Risk scoring ── */
  const batch = useEnforcementBatch(allEvents);
  const risks: Record<string, RiskScore> = useMemo(() => {
    const out: Record<string, RiskScore> = {};
    for (const ev of allEvents) {
      const r = batch.byEventId[ev.id];
      if (r) out[ev.id] = computeRiskScore(ev, r);
    }
    return out;
  }, [allEvents, batch]);
  const agencySummary = useMemo(() => summarizeAgencyRisk(Object.values(risks)), [risks]);
  const auditLog = useEnforcementStore(s => s.auditLog);

  /* ── Filter state ── */
  const urlState = searchParams.get('state') as AuditState | null;
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(
    urlState ? (stateToQuickFilter(urlState) ?? 'all') : 'all',
  );
  const [searchTerm, setSearchTerm]       = useState('');
  const [dateRange, setDateRange]         = useState<AuditDateRange>({ startISO: '', endISO: '' });
  const [regulationFilter, setRegFilter]  = useState('');
  const [queueView, setQueueView]         = useState<QueueView>('grouped');
  const [activeId, setActiveId]           = useState<string | null>(null);
  const [detailTab, setDetailTab]         = useState<DetailTab>('summary');

  useEffect(() => {
    if (urlState) setQuickFilter(stateToQuickFilter(urlState) ?? 'all');
  }, [urlState]);

  /* ── Map quick filter → aggregate filter inputs ── */
  const aggregateFilters: AuditAggregateFilters = useMemo(
    () => quickFilterToAggregateFilters(quickFilter, searchTerm, regulationFilter, dateRange, today),
    [quickFilter, searchTerm, regulationFilter, dateRange, today],
  );

  /* Survey-critical: pre-filter events with high/critical audit risk */
  const catalogForAggregate = useMemo(() => {
    if (quickFilter === 'survey-critical')
      return allEvents.filter(e => e.complianceFlags?.auditRisk === 'critical' || e.complianceFlags?.auditRisk === 'high');
    return allEvents;
  }, [allEvents, quickFilter]);

  const aggregate = useMemo(
    () => buildAuditAggregate(catalogForAggregate, today, exec, aggregateFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalogForAggregate, today, aggregateFilters, exec.completions, exec.certifications, exec.stepStates, exec.formStates, exec.approvals, exec.minutesStates],
  );

  const filtered = useMemo(() =>
    aggregate.events.slice().sort((a, b) => {
      const ra = risks[a.id]?.score ?? 0;
      const rb = risks[b.id]?.score ?? 0;
      if (ra !== rb) return rb - ra;
      return a.date.localeCompare(b.date);
    }),
    [aggregate, risks],
  );

  const activeEvent = activeId ? allEvents.find(e => e.id === activeId) ?? null : (filtered[0] ?? null);

  const setQuickFilterAndURL = (qf: QuickFilter) => {
    setQuickFilter(qf);
    setActiveId(null);
    const sp = new URLSearchParams(searchParams);
    const st = quickFilterToState(qf);
    if (st) sp.set('state', st); else sp.delete('state');
    setSearchParams(sp, { replace: true });
  };

  const applyPreset = (preset: 'last-30' | 'last-90' | 'qtd' | 'ytd' | 'clear') => {
    if (preset === 'clear') { setDateRange({ startISO: '', endISO: '' }); return; }
    setDateRange(presetRange(preset, today));
  };

  /* ── Exports ── */
  const handleExportBundle = (fmt: 'md' | 'json') => {
    const bundle = buildAuditBundle({
      summary: agencySummary,
      events: allEvents,
      reports: batch.byEventId,
      risks,
      logsByEvent: Object.fromEntries(allEvents.map(e => [e.id, auditLog.filter(l => l.eventId === e.id)])),
    });
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    if (fmt === 'json') downloadBlob(`audit-bundle-${stamp}.json`, JSON.stringify(bundle, null, 2), 'application/json');
    else                downloadBlob(`audit-bundle-${stamp}.md`,   bundleToMarkdown(bundle), 'text/markdown');
    useToastStore.getState().push('success', 'Audit bundle exported', `${allEvents.length} instances · ${fmt.toUpperCase()}`);
  };

  const handleSurveyRollup = () => {
    const packets = filtered.map(ev => {
      const docs    = exec.evidence[ev.id] ?? [];
      const apReqs  = exec.approvals.filter(a => a.eventId === ev.id);
      const notes   = exec.notes?.[ev.id] ?? [];
      const cert    = exec.certifications[ev.id] ?? null;
      const trail   = auditLog.filter(l => l.eventId === ev.id);
      const inst = buildWorkflowInstance({
        event: ev, today, store: exec, allEvents,
        documents: docs, approvalReqs: apReqs,
        notes, auditTrail: trail, certificationRecord: cert,
      });
      return buildSurveyPacket(inst);
    });
    const descBits: string[] = [];
    if (quickFilter !== 'all')            descBits.push(QUICK_FILTER_LABELS[quickFilter]);
    if (dateRange.startISO || dateRange.endISO) descBits.push(`${dateRange.startISO || '…'}→${dateRange.endISO || '…'}`);
    if (regulationFilter)                 descBits.push(`regulation~${regulationFilter}`);

    const hdr: SurveyRollupHeader = {
      title:             'Survey Audit Rollup',
      subtitle:          'Deterministic, per-instance compliance packets — Workflow Audit Packet format',
      filterDescription: descBits.join(' · ') || 'All instances',
      total:             aggregate.summary.total,
      certified:         aggregate.summary.certified,
      auditReady:        aggregate.summary.readyToCertify,
      atRisk:            aggregate.summary.atRisk + aggregate.summary.overdue + aggregate.summary.blocked,
      complianceRate:    aggregate.summary.complianceRate,
    };
    const md = rollupToSurveyMarkdown(hdr, packets, filtered);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadBlob(`survey-rollup-${stamp}.md`, md, 'text/markdown');
    useToastStore.getState().push('success', 'Survey rollup exported', `${packets.length} instances · Markdown`);
  };

  const handleExportInstance = (ev: RegulatoryEvent) => {
    const docs   = exec.evidence[ev.id] ?? [];
    const apReqs = exec.approvals.filter(a => a.eventId === ev.id);
    const notes  = exec.notes?.[ev.id] ?? [];
    const cert   = exec.certifications[ev.id] ?? null;
    const trail  = auditLog.filter(l => l.eventId === ev.id);
    const inst   = buildWorkflowInstance({
      event: ev, today, store: exec, allEvents,
      documents: docs, approvalReqs: apReqs,
      notes, auditTrail: trail, certificationRecord: cert,
    });
    const packet = buildSurveyPacket(inst);
    const stamp  = new Date().toISOString().slice(0, 10);
    downloadBlob(`audit-packet-${ev.id}-${stamp}.html`, packetToSurveyHtml(packet),     'text/html;charset=utf-8');
    useToastStore.getState().push('success', 'Survey packet exported', `${ev.id} · HTML`);
  };

  const handleExportInstanceMd = (ev: RegulatoryEvent) => {
    const docs   = exec.evidence[ev.id] ?? [];
    const apReqs = exec.approvals.filter(a => a.eventId === ev.id);
    const notes  = exec.notes?.[ev.id] ?? [];
    const cert   = exec.certifications[ev.id] ?? null;
    const trail  = auditLog.filter(l => l.eventId === ev.id);
    const inst   = buildWorkflowInstance({
      event: ev, today, store: exec, allEvents,
      documents: docs, approvalReqs: apReqs,
      notes, auditTrail: trail, certificationRecord: cert,
    });
    const packet = buildSurveyPacket(inst);
    const stamp  = new Date().toISOString().slice(0, 10);
    downloadBlob(`audit-packet-${ev.id}-${stamp}.md`, packetToSurveyMarkdown(packet), 'text/markdown');
    useToastStore.getState().push('success', 'Survey packet exported', `${ev.id} · Markdown`);
  };

  /* ── Layout ── */
  return (
    <div className="h-full w-full flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden relative z-10 gap-0">

      {/* ─────────────────────────────────────────────────────────
          REGION 1 — Command header
          ───────────────────────────────────────────────────────── */}
      <header className="px-6 md:px-10 pt-5 pb-3 flex flex-col gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Title row */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL_PRIMARY }} />
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.28em]" style={{ color: TEAL_PRIMARY }}>
                Audit
              </span>
            </div>
            <h1 className="font-outfit font-light text-white leading-tight" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
              Compliance validation and survey readiness
            </h1>
            <div className="mt-1.5 flex items-center gap-3">
              <HelpContextLink slug="audit-trail"  label="Audit trail"   variant="pill" />
              <HelpContextLink slug="verify-chain" label="Verify chain"  variant="pill" />
              <HelpContextLink slug="survey-packet" label="Survey packet" variant="pill" />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CommandSearch value={searchTerm} onChange={setSearchTerm} />
            <DateRangeFilter
              dateRange={dateRange}
              setDateRange={setDateRange}
              onPreset={applyPreset}
              regulationFilter={regulationFilter}
              setRegulationFilter={setRegFilter}
            />
            <button
              onClick={handleSurveyRollup}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] border transition"
              style={{ background: `${TEAL_PRIMARY}1A`, color: TEAL_PRIMARY, borderColor: `${TEAL_PRIMARY}55` }}
              title="Survey rollup packet for current filter"
            >
              <ShieldCheck size={11} /> Survey Rollup
            </button>
            <button
              onClick={() => handleExportBundle('md')}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]"
            >
              <Download size={11} /> Bundle
            </button>
            <button
              onClick={() => handleExportBundle('json')}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]"
            >
              <FileJson size={11} /> JSON
            </button>
          </div>
        </div>

        {/* Quick filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.keys(QUICK_FILTER_LABELS) as QuickFilter[]).map(qf => {
            const active = quickFilter === qf;
            const color  = quickFilterColor(qf);
            return (
              <button
                key={qf}
                type="button"
                onClick={() => setQuickFilterAndURL(qf)}
                className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.13em] px-2.5 py-1 rounded-md border transition whitespace-nowrap"
                style={{
                  color:       active ? color : 'rgba(255,255,255,0.60)',
                  borderColor: active ? `${color}77` : 'rgba(255,255,255,0.10)',
                  background:  active ? `${color}18` : 'rgba(255,255,255,0.02)',
                }}
              >
                {QUICK_FILTER_LABELS[qf]}
                {qf !== 'all' && quickFilterCount(qf, healthCounts, allEvents, auditByEvent) > 0 && (
                  <span className="ml-1.5 opacity-75">
                    ({quickFilterCount(qf, healthCounts, allEvents, auditByEvent)})
                  </span>
                )}
              </button>
            );
          })}
          {/* Aggregate summary far right */}
          <div className="ml-auto flex items-center gap-2 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em]">
            <span style={{ color: TEAL_PRIMARY }}>{aggregate.summary.complianceRate}% compliant</span>
            <span className="text-white/30">·</span>
            <span style={{ color: AUDIT_STATE_COLOR['certified-locked'] }}>{aggregate.summary.certified} certified</span>
            <span className="text-white/30">·</span>
            <span style={{ color: ACTION_COLOR }}>{aggregate.summary.readyToCertify} ready to certify</span>
            <span className="text-white/30">·</span>
            <span className="text-white/50">{aggregate.summary.total} in view</span>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────
          CES Sprint Audit Snapshot — bridges the merged execution
          layer into Audit Mode (read-only).
          ───────────────────────────────────────────────────────── */}
      <CesSprintAuditStrip onOpenSprint={() => navigate('/calendar?view=sprint')} />

      {/* ─────────────────────────────────────────────────────────
          REGION 2 — Audit health strip (6 tiles)
          ───────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 py-3 grid grid-cols-6 gap-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <HealthTile
          label="Audit Ready"
          count={healthCounts['audit-ready']}
          color={AUDIT_STATE_COLOR['audit-ready']}
          icon={<ShieldCheck size={12} />}
          active={quickFilter === 'ready-to-certify' || quickFilter === 'all'}
          onClick={() => setQuickFilterAndURL(quickFilter === 'ready-to-certify' ? 'all' : 'ready-to-certify')}
          subtitle={`${healthCounts['audit-ready']} instances`}
        />
        <HealthTile
          label="Ready to Certify"
          count={healthCounts['audit-ready']}
          color={ACTION_COLOR}
          icon={<BadgeCheck size={12} />}
          active={quickFilter === 'ready-to-certify'}
          onClick={() => setQuickFilterAndURL(quickFilter === 'ready-to-certify' ? 'all' : 'ready-to-certify')}
          subtitle="Awaiting sign-off"
          actionTint
        />
        <HealthTile
          label="Not Certifiable"
          count={healthCounts['not-certifiable']}
          color={AUDIT_STATE_COLOR['not-certifiable']}
          icon={<AlertOctagon size={12} />}
          active={quickFilter === 'not-certifiable'}
          onClick={() => setQuickFilterAndURL(quickFilter === 'not-certifiable' ? 'all' : 'not-certifiable')}
          subtitle="Requires review"
          warn={healthCounts['not-certifiable'] > 0}
        />
        <HealthTile
          label="Missing Evidence"
          count={healthCounts['complete-missing-evidence']}
          color={AUDIT_STATE_COLOR['complete-missing-evidence']}
          icon={<ShieldAlert size={12} />}
          active={quickFilter === 'missing-evidence'}
          onClick={() => setQuickFilterAndURL(quickFilter === 'missing-evidence' ? 'all' : 'missing-evidence')}
          subtitle="Evidence gaps"
          warn={healthCounts['complete-missing-evidence'] > 0}
        />
        <HealthTile
          label="Pending Approval"
          count={healthCounts['complete-pending-approval']}
          color={AUDIT_STATE_COLOR['complete-pending-approval']}
          icon={<Clock size={12} />}
          active={quickFilter === 'pending-approval'}
          onClick={() => setQuickFilterAndURL(quickFilter === 'pending-approval' ? 'all' : 'pending-approval')}
          subtitle="Awaiting approver"
        />
        <HealthTile
          label="Certified & Locked"
          count={healthCounts['certified-locked']}
          color={AUDIT_STATE_COLOR['certified-locked']}
          icon={<Lock size={12} />}
          active={quickFilter === 'certified'}
          onClick={() => setQuickFilterAndURL(quickFilter === 'certified' ? 'all' : 'certified')}
          subtitle="Final audit state"
          lockIcon
        />
      </div>

      {/* ─────────────────────────────────────────────────────────
          REGION 3 (left) + REGION 4 (right)
          ───────────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-12 gap-0 min-h-0 overflow-hidden px-6 md:px-10 py-4 gap-4">

        {/* REGION 3 — Queue */}
        <section className="col-span-5 flex flex-col min-h-0 gap-2">
          {/* Queue toolbar */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-montserrat font-bold text-white/60 uppercase tracking-[0.16em]">
              {quickFilter === 'all' ? 'All instances' : QUICK_FILTER_LABELS[quickFilter]}
              <span className="ml-2 text-white/40 normal-case tracking-normal text-[10px]">
                {filtered.length}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <ViewToggleBtn
                icon={<LayoutList size={12} />}
                active={queueView === 'grouped'}
                onClick={() => setQueueView('grouped')}
                title="Grouped view"
              />
              <ViewToggleBtn
                icon={<Table2 size={12} />}
                active={queueView === 'matrix'}
                onClick={() => setQueueView('matrix')}
                title="Matrix view"
              />
            </div>
          </div>

          <div
            className="flex-1 min-h-0 rounded-xl border overflow-hidden flex flex-col"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.015)' }}
          >
            {filtered.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[11px] font-roboto text-white/40">
                No instances match this filter.
              </div>
            ) : queueView === 'grouped' ? (
              <GroupedQueue
                events={filtered}
                auditByEvent={auditByEvent}
                risks={risks}
                activeId={activeEvent?.id ?? null}
                quickFilter={quickFilter}
                onSelect={id => { setActiveId(id); setDetailTab('summary'); }}
              />
            ) : (
              <MatrixView
                events={filtered}
                auditByEvent={auditByEvent}
                risks={risks}
                activeId={activeEvent?.id ?? null}
                exec={exec}
                onSelect={id => { setActiveId(id); setDetailTab('summary'); }}
              />
            )}
          </div>
        </section>

        {/* REGION 4 — Detail panel */}
        <section className="col-span-7 flex flex-col min-h-0">
          {activeEvent ? (
            <AuditDetailPanel
              event={activeEvent}
              today={today}
              auditState={auditByEvent[activeEvent.id]}
              allEvents={allEvents}
              detailTab={detailTab}
              onTabChange={setDetailTab}
              onOpenInTimeline={() => navigate(`/calendar?event=${encodeURIComponent(activeEvent.id)}&workflow=1`)}
              onExportPdf={()  => handleExportInstance(activeEvent)}
              onExportMd={()   => handleExportInstanceMd(activeEvent)}
            />
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center rounded-xl border text-center gap-2"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <ShieldCheck size={24} style={{ color: 'rgba(255,255,255,0.15)' }} />
              <p className="text-[11px] font-roboto text-white/40">Select an instance to audit.</p>
            </div>
          )}
        </section>
      </div>

      <ToastHost />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REGION 2 — Health tile
   ═══════════════════════════════════════════════════════════════ */
function HealthTile({
  label, count, color, icon, active, onClick, subtitle, warn, actionTint, lockIcon,
}: {
  label: string; count: number; color: string; icon: React.ReactNode;
  active: boolean; onClick: () => void; subtitle?: string;
  warn?: boolean; actionTint?: boolean; lockIcon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border px-3 py-2.5 text-left transition hover:brightness-110 flex flex-col gap-1"
      style={{
        background:  active ? `${color}1C` : warn ? `${color}10` : `${color}0A`,
        borderColor: active ? `${color}AA` : warn ? `${color}66` : `${color}3A`,
      }}
    >
      <div className="flex items-center gap-1.5" style={{ color: actionTint ? color : color }}>
        {icon}
        <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.14em] truncate leading-tight">
          {label}
        </span>
        {lockIcon && <Lock size={9} />}
      </div>
      <div className="font-outfit font-light leading-none" style={{ fontSize: 24, color, letterSpacing: '-0.01em' }}>
        {count}
      </div>
      {subtitle && (
        <div className="text-[9px] font-roboto leading-snug" style={{ color: `${color}99` }}>
          {subtitle}
        </div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REGION 3 — Grouped Queue
   ═══════════════════════════════════════════════════════════════ */
function GroupedQueue({
  events, auditByEvent, risks, activeId, quickFilter, onSelect,
}: {
  events: RegulatoryEvent[];
  auditByEvent: Record<string, AuditState>;
  risks: Record<string, RiskScore>;
  activeId: string | null;
  quickFilter: QuickFilter;
  onSelect: (id: string) => void;
}) {
  // When a specific state filter is active, show only that group
  const activeStates = quickFilter !== 'all' ? quickFilterToStates(quickFilter) : null;

  const groups = QUEUE_GROUPS
    .map(grp => ({
      ...grp,
      items: events.filter(e => grp.states.includes(auditByEvent[e.id])),
    }))
    .filter(grp => {
      if (activeStates) return grp.states.some(s => activeStates.includes(s));
      return grp.items.length > 0;
    });

  if (!groups.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] font-roboto text-white/40">
        No instances in this group.
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      {groups.map(grp => (
        <QueueSection
          key={grp.id}
          label={grp.label}
          color={grp.color}
          items={grp.items}
          auditByEvent={auditByEvent}
          risks={risks}
          activeId={activeId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function QueueSection({
  label, color, items, auditByEvent, risks, activeId, onSelect,
}: {
  label: string; color: string; items: RegulatoryEvent[];
  auditByEvent: Record<string, AuditState>; risks: Record<string, RiskScore>;
  activeId: string | null; onSelect: (id: string) => void;
}) {
  return (
    <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: `${color}22`, background: `${color}0C` }}
      >
        <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.16em]" style={{ color }}>
          {label}
        </span>
        <span className="text-[9.5px] font-montserrat font-bold" style={{ color: `${color}BB` }}>
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="px-3 py-2 text-[10px] font-roboto text-white/35">No instances.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {items.map(ev => (
            <QueueRow
              key={ev.id}
              event={ev}
              state={auditByEvent[ev.id]}
              riskScore={risks[ev.id]?.score ?? 0}
              active={activeId === ev.id}
              onClick={() => onSelect(ev.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function QueueRow({
  event, state, riskScore, active, onClick,
}: {
  event: RegulatoryEvent; state: AuditState; riskScore: number; active: boolean; onClick: () => void;
}) {
  const color = AUDIT_STATE_COLOR[state];
  const dom   = DOMAIN_PALETTE[event.domain];
  const today = TODAY_ANCHOR;
  const n     = daysUntil(event.date, today);
  const dueLabel = n < 0 ? `${Math.abs(n)}d past` : n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `${n}d`;
  const isCertified = state === 'certified-locked';

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left grid grid-cols-[3px_1fr_auto] gap-0 items-stretch cursor-pointer transition-colors"
        style={{ background: active ? 'rgba(255,255,255,0.04)' : 'transparent' }}
      >
        <span className="w-[3px] self-stretch" style={{ background: color }} />
        <div className="flex items-start gap-2 py-2 px-3 min-w-0">
          {/* Risk badge */}
          <span
            className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[9.5px] font-montserrat font-bold mt-0.5"
            style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}
            title={`Risk score: ${riskScore}`}
          >
            {riskScore}
          </span>
          <div className="flex-1 min-w-0">
            {/* Domain + due */}
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span
                className="text-[8.5px] font-montserrat font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded"
                style={{ color: dom.color, background: dom.soft, border: `1px solid ${dom.border}` }}
              >
                {dom.label}
              </span>
              <span className="text-[9px] font-roboto text-white/45">Due</span>
              <span className="text-[9px] font-montserrat font-bold" style={{ color }}>
                {dueLabel}
              </span>
            </div>
            {/* Title */}
            <p className="font-montserrat font-bold text-white text-[11px] leading-tight truncate">
              {isCertified && <Lock size={9} className="inline mr-1" style={{ color: AUDIT_STATE_COLOR['certified-locked'] }} />}
              {event.title}
            </p>
            {/* ID + Owner */}
            <p className="text-[9px] font-roboto text-white/45 truncate mt-0.5">
              <span className="font-mono-jb">{event.id.replace(/^EVT-/, '')}</span>
              <span className="mx-1 text-white/25">·</span>
              <span>{event.owner}</span>
            </p>
          </div>
        </div>
        {/* Right: state badge + chevron */}
        <div className="flex items-center gap-2 pr-2.5">
          <span
            className="text-[9px] font-montserrat font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded whitespace-nowrap"
            style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}
          >
            {AUDIT_STATE_LABEL[state]}
          </span>
          <ChevronRight size={11} className="text-white/30" />
        </div>
      </button>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REGION 3 — Matrix view (compact table for power users)
   ═══════════════════════════════════════════════════════════════ */
function MatrixView({
  events, auditByEvent, risks, activeId, exec, onSelect,
}: {
  events: RegulatoryEvent[];
  auditByEvent: Record<string, AuditState>;
  risks: Record<string, RiskScore>;
  activeId: string | null;
  exec: ReturnType<typeof useRegulatoryExecutionStore.getState>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
      <table className="w-full text-[10.5px] font-roboto">
        <thead>
          <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {['Workflow', 'Domain', 'Owner', 'Due', 'Audit State', 'Risk', 'Certified'].map(h => (
              <th
                key={h}
                className="px-2 py-2 text-left font-montserrat font-bold text-white/45 text-[9px] uppercase tracking-[0.14em] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map(ev => {
            const state  = auditByEvent[ev.id];
            const color  = AUDIT_STATE_COLOR[state];
            const dom    = DOMAIN_PALETTE[ev.domain];
            const rsk    = risks[ev.id]?.score ?? 0;
            const cert   = exec.isCertified(ev.id);
            const today  = TODAY_ANCHOR;
            const n      = daysUntil(ev.date, today);
            const dueStr = n < 0 ? `${Math.abs(n)}d over` : n === 0 ? 'Today' : `${n}d`;
            const dueColor = n < 0 ? '#F87171' : n <= 7 ? '#FBBF24' : 'rgba(255,255,255,0.55)';
            return (
              <tr
                key={ev.id}
                className="border-b cursor-pointer transition-colors"
                style={{
                  borderColor: 'rgba(255,255,255,0.05)',
                  background: activeId === ev.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
                onClick={() => onSelect(ev.id)}
              >
                <td className="px-2 py-2 max-w-[160px]">
                  <div className="font-montserrat font-bold text-white text-[10.5px] truncate">{ev.title}</div>
                  <div className="font-mono-jb text-white/40 text-[9px]">{ev.id.replace(/^EVT-/, '')}</div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded"
                    style={{ color: dom.color, background: dom.soft }}>{dom.label}</span>
                </td>
                <td className="px-2 py-2 text-white/65 whitespace-nowrap">{ev.owner}</td>
                <td className="px-2 py-2 whitespace-nowrap font-montserrat font-bold text-[9.5px]" style={{ color: dueColor }}>{dueStr}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded"
                    style={{ color, background: `${color}18` }}>{AUDIT_STATE_LABEL[state]}</span>
                </td>
                <td className="px-2 py-2 text-center">
                  <span className="text-[9.5px] font-montserrat font-bold" style={{ color }}>{rsk}</span>
                </td>
                <td className="px-2 py-2 text-center">
                  {cert ? <Lock size={10} style={{ color: AUDIT_STATE_COLOR['certified-locked'] }} /> : <span className="text-white/25">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REGION 4 — Audit Detail Panel (7 tabs)
   ═══════════════════════════════════════════════════════════════ */
function AuditDetailPanel({
  event, today, auditState, allEvents, detailTab, onTabChange,
  onOpenInTimeline, onExportPdf, onExportMd,
}: {
  event: RegulatoryEvent;
  today: Date;
  auditState: AuditState;
  allEvents: RegulatoryEvent[];
  detailTab: DetailTab;
  onTabChange: (t: DetailTab) => void;
  onOpenInTimeline: () => void;
  onExportPdf: () => void;
  onExportMd: () => void;
}) {
  const store    = useRegulatoryExecutionStore();
  const instance = useWorkflowInstance(event, today);
  const cert     = useEventCertification(event.id);
  const push     = useToastStore(s => s.push);
  const color    = AUDIT_STATE_COLOR[auditState];
  const dom      = DOMAIN_PALETTE[event.domain];

  const checklist = useMemo(
    () => buildCompletionChecklist(event, today, store),
    [event, today, store],
  );

  const onCertify = () => {
    if (!checklist.allPassed) {
      push('error', 'Cannot certify', `${checklist.totalCount - checklist.passedCount} item(s) still failing.`);
      return;
    }
    const note = window.prompt('Certifier note (optional):') ?? '';
    const res  = store.certifyEventComplete(event, undefined, undefined, note || undefined);
    push(res.ok ? 'success' : 'error', res.ok ? 'Event certified complete' : 'Cannot certify', res.message);
  };

  const onRevoke = () => {
    const reason = window.prompt('Revocation reason (required):') ?? '';
    if (!reason.trim()) return;
    const res = store.revokeCertification(event.id, reason.trim());
    push(res.ok ? 'success' : 'error', res.ok ? 'Certification revoked' : 'Unable to revoke', res.message);
  };

  const TABS: Array<{ id: DetailTab; label: string; icon: React.ReactNode }> = [
    { id: 'summary',        label: 'Summary',       icon: <ListChecks size={11} /> },
    { id: 'missing-items',  label: 'Missing Items',  icon: <AlertCircle size={11} /> },
    { id: 'evidence',       label: 'Evidence',       icon: <FolderOpen size={11} /> },
    { id: 'approvals',      label: 'Approvals',      icon: <BadgeCheck size={11} /> },
    { id: 'timeline',       label: 'Timeline',       icon: <Clock size={11} /> },
    { id: 'dependencies',   label: 'Dependencies',   icon: <GitBranch size={11} /> },
    { id: 'audit-trail',    label: 'Audit Trail',    icon: <History size={11} /> },
  ];

  return (
    <div
      className="flex-1 min-h-0 flex flex-col rounded-xl border overflow-hidden"
      style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.015)' }}
    >
      {/* ── Detail header ── */}
      <header className="px-4 py-3 border-b flex flex-col gap-1.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded"
            style={{ color: dom.color, background: dom.soft, border: `1px solid ${dom.border}` }}>
            {dom.label}
          </span>
          <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded inline-flex items-center gap-1"
            style={{ color, background: `${color}1A`, border: `1px solid ${color}44` }}>
            {auditState === 'certified-locked' && <Lock size={8} />}
            {AUDIT_STATE_LABEL[auditState]}
          </span>
          <button type="button" onClick={onOpenInTimeline}
            className="ml-auto text-[9.5px] font-montserrat font-bold uppercase tracking-[0.12em] text-white/50 hover:text-white flex items-center gap-1">
            Timeline <ExternalLink size={9} />
          </button>
        </div>
        <h2 className="font-outfit font-light text-white leading-tight" style={{ fontSize: 16, letterSpacing: '-0.01em' }}>
          {event.title}
        </h2>
        <div className="text-[10px] font-roboto text-white/50 flex items-center gap-1.5 flex-wrap">
          <span className="font-mono-jb">{event.id}</span>
          <span>·</span>
          <span>{formatEventDate(event.date)}</span>
          <span>·</span>
          <span>{event.owner} ({event.ownerRole})</span>
          {event.complianceFlags?.citation && (
            <><span>·</span><span style={{ color }}>{event.complianceFlags.citation}</span></>
          )}
        </div>
      </header>

      {/* ── Tab bar ── */}
      <nav className="flex items-stretch border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {TABS.map(t => {
          const active = detailTab === t.id;
          const hasIssue =
            t.id === 'missing-items' && !checklist.allPassed ? true
            : t.id === 'dependencies' && instance?.dependencies.posture === 'hard-block' ? true
            : false;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 whitespace-nowrap text-[10px] font-montserrat font-bold uppercase tracking-[0.13em] border-b-2 transition"
              style={{
                borderColor: active ? TEAL_PRIMARY : 'transparent',
                color:       active ? TEAL_PRIMARY : hasIssue ? '#F87171' : 'rgba(255,255,255,0.50)',
                background:  active ? `${TEAL_PRIMARY}0C` : 'transparent',
              }}
            >
              {t.icon}
              {t.label}
              {hasIssue && !active && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Tab body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {detailTab === 'summary'       && <SummaryTab       event={event} today={today} instance={instance} checklist={checklist} cert={cert} />}
        {detailTab === 'missing-items' && <MissingItemsTab  instance={instance} checklist={checklist} onNavigateToTimeline={onOpenInTimeline} />}
        {detailTab === 'evidence'      && <EvidenceTab      event={event} instance={instance} />}
        {detailTab === 'approvals'     && <ApprovalsTab     instance={instance} />}
        {detailTab === 'timeline'      && <TimelineTab      instance={instance} />}
        {detailTab === 'dependencies'  && <DependenciesTab  instance={instance} allEvents={allEvents} />}
        {detailTab === 'audit-trail'   && <AuditTrailTab    instance={instance} />}
      </div>

      {/* ── Footer: export + certify/revoke ── */}
      <footer className="px-4 py-2.5 border-t flex items-center justify-between gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onExportPdf}
            className="rounded-md px-2.5 py-1.5 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.13em] border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] flex items-center gap-1.5">
            <Download size={10} /> Print / PDF
          </button>
          <button type="button" onClick={onExportMd}
            className="rounded-md px-2.5 py-1.5 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.13em] border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] flex items-center gap-1.5">
            <FileText size={10} /> Markdown
          </button>
        </div>
        {cert ? (
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.13em] flex items-center gap-1.5"
              style={{ color: AUDIT_STATE_COLOR['certified-locked'] }}>
              <Lock size={10} /> Certified · Locked
            </span>
            <button type="button" onClick={onRevoke}
              className="rounded-md px-2.5 py-1.5 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.13em] border border-white/12 text-white/60 hover:text-white hover:bg-white/[0.05] flex items-center gap-1">
              <Unlock size={10} /> Revoke
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onCertify}
            disabled={!checklist.allPassed}
            className="rounded-md px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition"
            style={{
              background: checklist.allPassed ? ACTION_COLOR : 'rgba(255,255,255,0.04)',
              color:      checklist.allPassed ? '#0A0202' : 'rgba(255,255,255,0.45)',
              border:     checklist.allPassed ? `1px solid ${ACTION_COLOR}` : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Lock size={10} />
            {checklist.allPassed ? 'Certify Event Complete' : 'Not Certifiable'}
          </button>
        )}
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Summary — pass/fail checklist with exact spec labels
   ═══════════════════════════════════════════════════════════════ */
function SummaryTab({
  event, today: _today, instance, checklist, cert,
}: {
  event: RegulatoryEvent;
  today: Date;
  instance: ReturnType<typeof useWorkflowInstance>;
  checklist: ReturnType<typeof buildCompletionChecklist>;
  cert: ReturnType<typeof useEventCertification>;
}) {
  /* Build the canonical 8-row checklist matching spec exactly. */
  const rows: Array<{ label: string; passed: boolean; detail?: string }> = [
    {
      label:  'Steps Complete',
      passed: checklist.items.find(i => i.id === 'steps')?.passed ?? false,
      detail: checklist.items.find(i => i.id === 'steps')?.detail,
    },
    {
      label:  'Forms Complete',
      passed: checklist.items.find(i => i.id === 'forms')?.passed ?? true,
      detail: checklist.items.find(i => i.id === 'forms')?.detail,
    },
    {
      label:  'Evidence Complete',
      passed: checklist.items.find(i => i.id === 'evidence')?.passed ?? true,
      detail: checklist.items.find(i => i.id === 'evidence')?.detail,
    },
    {
      label:  'Approvals Complete',
      passed: checklist.items.find(i => i.id === 'approvals')?.passed ?? true,
      detail: checklist.items.find(i => i.id === 'approvals')?.detail,
    },
    {
      label:  'Minutes Complete',
      passed: checklist.items.find(i => i.id === 'minutes')?.passed ?? (event.minutes === undefined),
      detail: checklist.items.find(i => i.id === 'minutes')?.detail ?? (event.minutes === undefined ? 'Not required' : undefined),
    },
    {
      label:  'SLA Compliant',
      passed: checklist.slaDaysPastDue === 0,
      detail: checklist.slaDaysPastDue === 0 ? 'On time' : `${checklist.slaDaysPastDue} day(s) past due`,
    },
    {
      label:  'Dependencies Satisfied',
      passed: instance ? instance.dependencies.posture !== 'hard-block' : true,
      detail: instance ? instance.dependencies.summary : 'No dependencies',
    },
    {
      label:  'Certification Eligible',
      passed: instance ? instance.readyForCertification : checklist.allPassed,
      detail: instance?.readyForCertification ? 'All conditions satisfied' : 'One or more conditions not met',
    },
  ];

  const passedCount = rows.filter(r => r.passed).length;
  const allPassed   = passedCount === rows.length;
  const bannerColor = allPassed || cert ? TEAL_PRIMARY : '#F87171';

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Banner */}
      <div
        className="rounded-lg border p-3 flex items-center justify-between gap-3"
        style={{ borderColor: `${bannerColor}55`, background: `${bannerColor}0C` }}
      >
        <div>
          <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.15em] flex items-center gap-1.5"
            style={{ color: bannerColor }}>
            {cert && <Lock size={10} />}
            {cert ? 'Certified & Locked' : allPassed ? 'Ready to Certify' : 'Not Certifiable'}
          </div>
          <p className="text-[11px] font-roboto text-white/75 mt-0.5">
            {passedCount} of {rows.length} validation checks passed
            {checklist.slaDaysPastDue > 0 && ` · ${checklist.slaDaysPastDue}d past due`}
          </p>
          {cert && (
            <p className="text-[10px] font-roboto text-white/55 mt-1 truncate">
              Certified by <span className="text-white font-semibold">{cert.certifiedBy}</span>
              {cert.certifierRole ? ` (${cert.certifierRole})` : ''}
              {' · '}
              {new Date(cert.certifiedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className="font-outfit font-light text-[26px] leading-none shrink-0" style={{ color: bannerColor }}>
          {passedCount}/{rows.length}
        </div>
      </div>

      {/* Checklist */}
      <ul className="space-y-1.5">
        {rows.map(row => (
          <li
            key={row.label}
            className="flex items-start gap-2.5 rounded-md border p-2.5"
            style={{
              borderColor: row.passed ? 'rgba(20,184,166,0.25)' : 'rgba(239,68,68,0.30)',
              background:  row.passed ? 'rgba(20,184,166,0.04)' : 'rgba(239,68,68,0.05)',
            }}
          >
            <span
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
              style={{
                background: row.passed ? 'rgba(20,184,166,0.16)' : 'rgba(239,68,68,0.16)',
                color:      row.passed ? TEAL_PRIMARY : '#F87171',
              }}
            >
              {row.passed ? <Check size={11} /> : <X size={10} />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-montserrat font-bold"
                style={{ color: row.passed ? 'rgba(255,255,255,0.90)' : '#FCA5A5' }}>
                {row.label}
              </p>
              {row.detail && (
                <p className="text-[10px] font-roboto mt-0.5"
                  style={{ color: row.passed ? 'rgba(255,255,255,0.50)' : 'rgba(252,165,165,0.70)' }}>
                  {row.passed ? row.detail : row.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Missing Items — only failures, with type + why + action
   ═══════════════════════════════════════════════════════════════ */
function MissingItemsTab({
  instance, checklist, onNavigateToTimeline,
}: {
  instance: ReturnType<typeof useWorkflowInstance>;
  checklist: ReturnType<typeof buildCompletionChecklist>;
  onNavigateToTimeline: () => void;
}) {
  type MissingItem = {
    type:         string;
    description:  string;
    whyItMatters: string;
    action:       string;
    onAction?:    () => void;
  };

  const items: MissingItem[] = [];

  for (const item of checklist.items) {
    if (item.passed) continue;
    switch (item.id) {
      case 'steps': items.push({
        type: 'Missing Form', description: item.detail || 'One or more workflow steps are not complete.',
        whyItMatters: 'Incomplete steps indicate the workflow was not fully executed per protocol.',
        action: 'Open Workflow', onAction: onNavigateToTimeline,
      }); break;
      case 'forms': items.push({
        type: 'Missing Form', description: item.detail || 'One or more required forms are not complete.',
        whyItMatters: 'Missing forms break the evidence chain required for survey compliance.',
        action: 'Complete Form',
      }); break;
      case 'evidence': items.push({
        type: 'Missing Evidence', description: item.detail || 'Required evidence artifacts are missing.',
        whyItMatters: 'Without attached evidence, the workflow cannot be verified during survey.',
        action: 'Upload Evidence',
      }); break;
      case 'approvals': items.push({
        type: 'Missing Approval', description: item.detail || 'A required approval has not been recorded.',
        whyItMatters: 'Unapproved workflows indicate governance failure.',
        action: 'Request Approval',
      }); break;
      case 'minutes': items.push({
        type: 'Missing Minutes', description: item.detail || 'Meeting minutes are not finalized.',
        whyItMatters: 'Finalized minutes are the primary evidence of meeting execution for CoP compliance.',
        action: 'Complete Form',
      }); break;
      case 'sla': items.push({
        type: 'SLA Violation', description: item.detail || 'The closure deadline has passed.',
        whyItMatters: 'Overdue workflows signal systemic compliance risk to surveyors.',
        action: 'Open Workflow', onAction: onNavigateToTimeline,
      }); break;
      case 'blockers': items.push({
        type: 'Certification Blocker', description: item.detail || 'Unresolved blockers prevent certification.',
        whyItMatters: 'Blockers must be cleared before the instance can be certified.',
        action: 'Resolve Blocker',
      }); break;
    }
  }

  if (instance?.dependencies.posture === 'hard-block') {
    items.push({
      type: 'Dependency Block',
      description: instance.dependencies.blockers[0] ?? 'A required upstream workflow is not complete.',
      whyItMatters: 'Certifying without upstream completion hides incomplete evidence chains.',
      action: 'Review Dependency',
    });
  }

  if (!items.length) {
    return (
      <div className="p-4 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 size={28} style={{ color: TEAL_PRIMARY }} />
        <p className="text-[11px] font-montserrat font-bold text-white/80 uppercase tracking-[0.14em]">
          No missing items
        </p>
        <p className="text-[10.5px] font-roboto text-white/50">
          All validation checks passed. This instance is ready to certify.
        </p>
      </div>
    );
  }

  const TYPE_COLORS: Record<string, string> = {
    'Missing Form':         '#F59E0B',
    'Missing Evidence':     '#F59E0B',
    'Missing Minutes':      '#F59E0B',
    'Missing Approval':     '#F97316',
    'SLA Violation':        '#EF4444',
    'Dependency Block':     '#EF4444',
    'Certification Blocker':'#EF4444',
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.16em]">
        {items.length} item{items.length === 1 ? '' : 's'} requiring action
      </div>
      {items.map((item, idx) => {
        const c = TYPE_COLORS[item.type] ?? '#F87171';
        return (
          <div
            key={idx}
            className="rounded-lg border p-3 flex flex-col gap-2"
            style={{ borderColor: `${c}44`, background: `${c}08` }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[9px] font-montserrat font-bold uppercase tracking-[0.13em] px-2 py-0.5 rounded"
                style={{ color: c, background: `${c}1C`, border: `1px solid ${c}44` }}
              >
                {item.type}
              </span>
              {item.onAction ? (
                <button
                  type="button"
                  onClick={item.onAction}
                  className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-md border transition hover:brightness-110"
                  style={{ color: ACTION_COLOR, background: `${ACTION_COLOR}18`, borderColor: `${ACTION_COLOR}55` }}
                >
                  {item.action}
                </button>
              ) : (
                <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  {item.action}
                </span>
              )}
            </div>
            <p className="text-[11px] font-roboto text-white/85">{item.description}</p>
            <p className="text-[10px] font-roboto text-white/50 italic">{item.whyItMatters}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Evidence — Artifact | Required | Status | Files | Last Updated | Action
   ═══════════════════════════════════════════════════════════════ */
function EvidenceTab({
  event, instance,
}: {
  event: RegulatoryEvent;
  instance: ReturnType<typeof useWorkflowInstance>;
}) {
  const docs = useEventEvidence(event.id);
  const forms = instance?.forms ?? [];

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Required forms */}
      <section>
        <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.16em] mb-2">
          Required Forms ({forms.length})
        </div>
        {forms.length === 0 ? (
          <p className="text-[10.5px] font-roboto text-white/40">No required forms for this workflow.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <table className="w-full text-[10.5px] font-roboto">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                  {['Artifact', 'Required', 'Status', 'Files', 'Last Updated'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-montserrat font-bold text-white/40 text-[9px] uppercase tracking-[0.14em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forms.map(f => {
                  const lastDoc = f.documents.sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''))[0];
                  const statusColor = f.status === 'complete' ? TEAL_PRIMARY : f.status === 'in-progress' ? '#F59E0B' : '#F87171';
                  return (
                    <tr key={f.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-3 py-2">
                        <div className="font-montserrat font-bold text-white/85 text-[11px]">{f.label}</div>
                        {f.formRef && <div className="font-mono-jb text-white/40 text-[9px]">{f.formRef}</div>}
                      </td>
                      <td className="px-3 py-2 text-white/60">Yes</td>
                      <td className="px-3 py-2">
                        <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.10em]"
                          style={{ color: statusColor }}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-montserrat font-bold text-[10.5px]"
                          style={{ color: f.documents.length > 0 ? TEAL_PRIMARY : '#F87171' }}>
                          {f.documents.length}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-white/45">
                        {lastDoc?.uploadedAt ? new Date(lastDoc.uploadedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Supporting documents */}
      <section>
        <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.16em] mb-2">
          Evidence Files ({docs.length})
        </div>
        {docs.length === 0 ? (
          <p className="text-[10.5px] font-roboto text-white/40">No evidence files uploaded.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <table className="w-full text-[10.5px] font-roboto">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                  {['Artifact', 'Kind', 'Uploaded', 'By', 'Size'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-montserrat font-bold text-white/40 text-[9px] uppercase tracking-[0.14em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <FileWarning size={11} style={{ color: TEAL_PRIMARY, flexShrink: 0 }} />
                        <span className="text-white/85 truncate">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-white/55">{d.kind}</td>
                    <td className="px-3 py-2 text-white/55">{new Date(d.uploadedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-white/55">{d.uploadedBy}</td>
                    <td className="px-3 py-2 text-white/45">{d.sizeLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Approvals — Approval Role | Scope | Required | Status | Approver | Timestamp | Action
   ═══════════════════════════════════════════════════════════════ */
function ApprovalsTab({ instance }: { instance: ReturnType<typeof useWorkflowInstance> }) {
  const approvals = instance?.approvals ?? [];

  if (!approvals.length) {
    return (
      <div className="p-4">
        <p className="text-[10.5px] font-roboto text-white/40">No approvals required for this workflow.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <table className="w-full text-[10.5px] font-roboto">
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
              {['Approval Role', 'Scope', 'Required', 'Status', 'Approver', 'Timestamp'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-montserrat font-bold text-white/40 text-[9px] uppercase tracking-[0.14em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {approvals.map((a, i) => {
              const statusColor =
                a.status === 'approved' ? TEAL_PRIMARY
                : a.status === 'rejected' ? '#EF4444'
                : '#F59E0B';
              return (
                <tr key={`${a.ruleId ?? i}`} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <td className="px-3 py-2 font-montserrat font-bold text-white/85 text-[10.5px] whitespace-nowrap">
                    {a.approverRole ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-white/60">{a.targetLabel} ({a.targetKind})</td>
                  <td className="px-3 py-2">
                    <span style={{ color: a.required ? '#F87171' : 'rgba(255,255,255,0.45)' }}>
                      {a.required ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.10em]"
                      style={{ color: statusColor }}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-white/65">{a.approver ?? '—'}</td>
                  <td className="px-3 py-2 text-white/45">
                    {a.decidedAt ? new Date(a.decidedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Timeline — chronological event log with exact labels
   ═══════════════════════════════════════════════════════════════ */
function TimelineTab({ instance }: { instance: ReturnType<typeof useWorkflowInstance> }) {
  const trail = instance?.auditTrail ?? [];

  const ACTION_LABEL: Record<string, string> = {
    'step.status.changed':   'Step Completed',
    'form.status.changed':   'Form Uploaded',
    'minutes.status.changed':'Minutes Updated',
    'evidence.uploaded':     'Evidence Added',
    'evidence.removed':      'Evidence Removed',
    'approval.requested':    'Approval Requested',
    'approval.decided':      'Approval Completed',
    'event.completed':       'Instance Closed',
    'event.reopened':        'Instance Reopened',
    'event.locked':          'Certified & Locked',
    'event.unlocked':        'Certification Revoked',
    'escalation.raised':     'Escalation Raised',
    'escalation.resolved':   'Escalation Resolved',
    'mutation.blocked':      'Certification Blocked',
  };

  const ACTION_COLOR_MAP: Record<string, string> = {
    'event.locked':    AUDIT_STATE_COLOR['certified-locked'],
    'event.completed': TEAL_PRIMARY,
    'mutation.blocked':'#EF4444',
    'escalation.raised':'#EF4444',
    'approval.decided':TEAL_PRIMARY,
    'approval.requested':'#F59E0B',
  };

  if (!trail.length) {
    return (
      <div className="p-4">
        <p className="text-[10.5px] font-roboto text-white/40">No logged activity for this instance.</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-0">
      {trail.map((entry, idx) => {
        const label = ACTION_LABEL[entry.action] ?? entry.action;
        const color = ACTION_COLOR_MAP[entry.action] ?? 'rgba(255,255,255,0.50)';
        const isLast = idx === trail.length - 1;
        return (
          <div key={entry.id} className="grid grid-cols-[auto_12px_1fr] gap-x-3 gap-y-0 relative">
            {/* Timestamp */}
            <div className="text-[9.5px] font-mono-jb text-white/40 whitespace-nowrap pt-2 pb-2 text-right" style={{ minWidth: 100 }}>
              {new Date(entry.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full mt-2.5 shrink-0" style={{ background: color, border: `2px solid ${color}66` }} />
              {!isLast && <div className="flex-1 w-px bg-white/10 mt-0.5" />}
            </div>
            {/* Content */}
            <div className="pb-3 pt-1.5">
              <p className="font-montserrat font-bold text-[11px]" style={{ color }}>
                {label}
              </p>
              <p className="text-[10px] font-roboto text-white/55 mt-0.5">
                {entry.actor && <span className="text-white/70">{entry.actor}</span>}
                {entry.targetKind && <span className="text-white/40"> · {entry.targetKind}{entry.targetId ? `:${entry.targetId}` : ''}</span>}
                {entry.reason && <span className="text-white/55"> · {entry.reason}</span>}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Dependencies — Upstream + Downstream
   ═══════════════════════════════════════════════════════════════ */
function DependenciesTab({
  instance, allEvents,
}: {
  instance: ReturnType<typeof useWorkflowInstance>;
  allEvents: RegulatoryEvent[];
}) {
  void allEvents;
  const deps = instance?.dependencies;

  if (!deps) {
    return <div className="p-4 text-[10.5px] font-roboto text-white/40">Loading dependencies…</div>;
  }

  const postureColor =
    deps.posture === 'hard-block' ? '#EF4444'
    : deps.posture === 'soft-gap'  ? '#F59E0B'
    : TEAL_PRIMARY;

  if (!deps.upstream.length && !deps.downstream.length) {
    return (
      <div className="p-4 flex flex-col gap-2">
        <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: TEAL_PRIMARY }}>
          No cross-workflow dependencies
        </div>
        <p className="text-[10.5px] font-roboto text-white/45">
          This workflow instance has no declared upstream or downstream dependencies.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Posture banner */}
      <div
        className="rounded-lg border p-3 flex items-center gap-3"
        style={{ borderColor: `${postureColor}44`, background: `${postureColor}0C` }}
      >
        <GitBranch size={16} style={{ color: postureColor, flexShrink: 0 }} />
        <div>
          <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.15em]" style={{ color: postureColor }}>
            {deps.posture === 'hard-block' ? 'Blocked Upstream'
              : deps.posture === 'soft-gap' ? 'Upstream Not Certified'
              : 'Dependencies Clear'}
          </div>
          <p className="text-[10.5px] font-roboto text-white/65 mt-0.5">{deps.summary}</p>
        </div>
      </div>

      {/* Upstream Dependencies */}
      {deps.upstream.length > 0 && (
        <section>
          <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.16em] mb-2">
            Upstream Dependencies ({deps.upstream.length})
          </div>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <table className="w-full text-[10.5px] font-roboto">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                  {['Workflow', 'Status', 'Satisfied', 'Impact'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-montserrat font-bold text-white/40 text-[9px] uppercase tracking-[0.14em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deps.upstream.map(u => {
                  const satisfied = u.isComplete;
                  const certified = u.isCertified;
                  const blocks    = u.required && !u.isComplete;
                  const rc = !satisfied ? '#EF4444' : certified ? TEAL_PRIMARY : '#F59E0B';
                  const satisfiedLabel = !satisfied ? 'Incomplete' : certified ? 'Satisfied' : 'Complete — Not Certified';
                  const impactLabel    = blocks ? 'Blocking Certification' : !certified ? 'Downstream Risk' : 'Satisfied';
                  return (
                    <tr key={u.eventId} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-3 py-2">
                        <div className="font-montserrat font-bold text-white/85 text-[10.5px] truncate">{u.title}</div>
                        <div className="font-mono-jb text-white/40 text-[9px]">{u.eventId.replace(/^EVT-/, '')}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.10em]" style={{ color: AUDIT_STATE_COLOR[u.auditState as keyof typeof AUDIT_STATE_COLOR] ?? '#888' }}>
                          {AUDIT_STATE_LABEL[u.auditState as keyof typeof AUDIT_STATE_LABEL] ?? u.auditState}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.10em]" style={{ color: rc }}>
                          {satisfiedLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.10em]"
                          style={{ color: blocks ? '#EF4444' : !certified ? '#F59E0B' : TEAL_PRIMARY }}>
                          {impactLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Downstream Impact */}
      {deps.downstream.length > 0 && (
        <section>
          <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.16em] mb-2">
            Downstream Impact ({deps.downstream.length})
          </div>
          <ul className="space-y-1.5">
            {deps.downstream.map(d => (
              <li
                key={`${d.eventId}-${d.relation}`}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="min-w-0">
                  <p className="font-montserrat font-bold text-white/80 text-[10.5px] truncate">{d.title}</p>
                  <p className="font-mono-jb text-white/40 text-[9px]">{d.eventId.replace(/^EVT-/, '')} · {d.date}</p>
                </div>
                <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded shrink-0"
                  style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  {d.relation}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Audit Trail — plain, timestamped, no decoration
   ═══════════════════════════════════════════════════════════════ */
function AuditTrailTab({ instance }: { instance: ReturnType<typeof useWorkflowInstance> }) {
  const trail = instance?.auditTrail ?? [];

  if (!trail.length) {
    return (
      <div className="p-4">
        <p className="text-[10.5px] font-roboto text-white/40">No logged activity for this instance.</p>
      </div>
    );
  }

  const ACTION_LABEL: Record<string, string> = {
    'step.status.changed':   'Step Completed',
    'form.status.changed':   'Form Uploaded',
    'minutes.status.changed':'Minutes Updated',
    'evidence.uploaded':     'Evidence Added',
    'evidence.removed':      'Evidence Removed',
    'approval.requested':    'Approval Requested',
    'approval.decided':      'Approval Completed',
    'event.completed':       'Instance Closed',
    'event.reopened':        'Instance Reopened',
    'event.locked':          'Certified & Locked',
    'event.unlocked':        'Certification Revoked',
    'escalation.raised':     'Escalation Raised',
    'escalation.resolved':   'Escalation Resolved',
    'mutation.blocked':      'Certification Blocked',
  };

  return (
    <div className="p-4">
      <ul className="space-y-0 divide-y divide-white/5">
        {trail.map(entry => {
          const label = ACTION_LABEL[entry.action] ?? entry.action;
          return (
            <li key={entry.id} className="grid grid-cols-[120px_1fr] gap-3 py-2 text-[10.5px] font-roboto">
              <span className="font-mono-jb text-white/40 pt-0.5 leading-snug">
                {new Date(entry.ts).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
              <div className="min-w-0">
                <span className="font-montserrat font-bold text-white/85">{entry.actor ?? '—'}</span>
                <span className="text-white/40 mx-1">—</span>
                <span className="text-white/75">{label}</span>
                {entry.reason && <span className="text-white/45 ml-1">— {entry.reason}</span>}
                {entry.targetKind && <span className="text-white/35 ml-1 font-mono-jb text-[9px]">· {entry.targetKind}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Utility components
   ═══════════════════════════════════════════════════════════════ */

function CommandSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center rounded-md border bg-white/[0.03] px-2.5 py-1.5 w-52"
      style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
      <Search size={12} className="text-white/40 mr-2 shrink-0" />
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search id, title, owner…"
        className="flex-1 bg-transparent outline-none text-[11px] font-roboto text-white placeholder-white/30 min-w-0"
      />
      {value && (
        <button type="button" onClick={() => onChange('')}
          className="text-white/40 hover:text-white ml-1 shrink-0">
          <X size={10} />
        </button>
      )}
    </div>
  );
}

function DateRangeFilter({
  dateRange, setDateRange, onPreset, regulationFilter, setRegulationFilter,
}: {
  dateRange: AuditDateRange;
  setDateRange: React.Dispatch<React.SetStateAction<AuditDateRange>>;
  onPreset: (p: 'last-30' | 'last-90' | 'qtd' | 'ytd' | 'clear') => void;
  regulationFilter: string;
  setRegulationFilter: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasActive = !!(dateRange.startISO || dateRange.endISO || regulationFilter);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] border transition"
        style={{
          borderColor: hasActive ? `${TEAL_PRIMARY}66` : 'rgba(255,255,255,0.10)',
          background:  hasActive ? `${TEAL_PRIMARY}14` : 'rgba(255,255,255,0.03)',
          color:       hasActive ? TEAL_PRIMARY : 'rgba(255,255,255,0.70)',
        }}
      >
        <Filter size={11} /> Filters {hasActive && '•'}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 rounded-xl border p-4 flex flex-col gap-3 w-72 shadow-2xl"
          style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.12)' }}
        >
          <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.16em]">Date Range</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['last-30', 'last-90', 'qtd', 'ytd'] as const).map(p => (
              <button key={p} type="button" onClick={() => onPreset(p)}
                className="text-[9px] font-montserrat font-bold uppercase tracking-[0.12em] px-2 py-1 rounded border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
                {p === 'last-30' ? '30d' : p === 'last-90' ? '90d' : p.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={dateRange.startISO}
              onChange={e => setDateRange(r => ({ ...r, startISO: e.target.value }))}
              className="flex-1 bg-white/[0.05] border border-white/10 rounded px-2 py-1 text-[10px] font-roboto text-white/80" />
            <span className="text-white/35 text-[10px]">→</span>
            <input type="date" value={dateRange.endISO}
              onChange={e => setDateRange(r => ({ ...r, endISO: e.target.value }))}
              className="flex-1 bg-white/[0.05] border border-white/10 rounded px-2 py-1 text-[10px] font-roboto text-white/80" />
          </div>
          <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.16em] mt-1">Regulation</div>
          <input type="text" value={regulationFilter}
            onChange={e => setRegulationFilter(e.target.value)}
            placeholder="e.g. 42 CFR § 484"
            className="bg-white/[0.05] border border-white/10 rounded px-2 py-1.5 text-[10.5px] font-roboto text-white/80" />
          {hasActive && (
            <button type="button"
              onClick={() => { onPreset('clear'); setRegulationFilter(''); }}
              className="self-start text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em] text-white/45 hover:text-white/80 border border-white/10 px-2 py-1 rounded">
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ViewToggleBtn({
  icon, active, onClick, title,
}: { icon: React.ReactNode; active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-md flex items-center justify-center border transition"
      style={{
        borderColor: active ? `${TEAL_PRIMARY}66` : 'rgba(255,255,255,0.10)',
        background:  active ? `${TEAL_PRIMARY}14` : 'rgba(255,255,255,0.03)',
        color:       active ? TEAL_PRIMARY : 'rgba(255,255,255,0.45)',
      }}
    >
      {icon}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Pure helper functions (no React)
   ═══════════════════════════════════════════════════════════════ */

function stateToQuickFilter(state: AuditState): QuickFilter | null {
  const map: Partial<Record<AuditState, QuickFilter>> = {
    'audit-ready':               'ready-to-certify',
    'not-certifiable':           'not-certifiable',
    'complete-missing-evidence': 'missing-evidence',
    'complete-pending-approval': 'pending-approval',
    'overdue':                   'overdue',
    'blocked':                   'overdue',
    'certified-locked':          'certified',
  };
  return map[state] ?? null;
}

function quickFilterToState(qf: QuickFilter): AuditState | null {
  const map: Partial<Record<QuickFilter, AuditState>> = {
    'ready-to-certify': 'audit-ready',
    'not-certifiable':  'not-certifiable',
    'missing-evidence': 'complete-missing-evidence',
    'pending-approval': 'complete-pending-approval',
    'overdue':          'overdue',
    'certified':        'certified-locked',
  };
  return map[qf] ?? null;
}

function quickFilterToStates(qf: QuickFilter): AuditState[] {
  switch (qf) {
    case 'ready-to-certify': return ['audit-ready'];
    case 'not-certifiable':  return ['not-certifiable'];
    case 'missing-evidence': return ['complete-missing-evidence'];
    case 'pending-approval': return ['complete-pending-approval'];
    case 'overdue':          return ['overdue', 'blocked'];
    case 'certified':        return ['certified-locked'];
    default:                 return [];
  }
}

function quickFilterToAggregateFilters(
  qf: QuickFilter,
  search: string,
  regulation: string,
  dateRange: AuditDateRange,
  today: Date,
): AuditAggregateFilters {
  const dr = dateRange.startISO || dateRange.endISO ? dateRange : undefined;
  const base: AuditAggregateFilters = {
    search: search || undefined,
    regulation: regulation || undefined,
    dateRange: dr,
  };
  switch (qf) {
    case 'all':              return base;
    case 'july-readiness': {
      const y = today.getFullYear();
      return { ...base, dateRange: { startISO: `${y}-07-01`, endISO: `${y}-07-31` } };
    }
    case 'not-certifiable':  return { ...base, states: ['not-certifiable'] };
    case 'missing-evidence': return { ...base, states: ['complete-missing-evidence'] };
    case 'pending-approval': return { ...base, states: ['complete-pending-approval'] };
    case 'overdue':          return { ...base, states: ['overdue', 'blocked'] };
    case 'ready-to-certify': return { ...base, states: ['audit-ready'] };
    case 'certified':        return { ...base, states: ['certified-locked'] };
    case 'governance':       return { ...base, domains: ['Governance'] };
    case 'qapi':             return { ...base, domains: ['QAPI'] };
    case 'billing-critical': return { ...base, domains: ['Finance'] };
    case 'survey-critical':  return base; // event pre-filter handled above
    default:                 return base;
  }
}

function quickFilterColor(qf: QuickFilter): string {
  switch (qf) {
    case 'all':              return TEAL_PRIMARY;
    case 'july-readiness':   return '#38BDF8';
    case 'not-certifiable':  return '#EF4444';
    case 'missing-evidence': return '#F59E0B';
    case 'pending-approval': return '#F59E0B';
    case 'overdue':          return '#EF4444';
    case 'ready-to-certify': return ACTION_COLOR;
    case 'certified':        return AUDIT_STATE_COLOR['certified-locked'];
    case 'governance':       return '#A78BFA';
    case 'qapi':             return '#34D399';
    case 'billing-critical': return '#F97316';
    case 'survey-critical':  return '#EF4444';
    default:                 return TEAL_PRIMARY;
  }
}

function quickFilterCount(
  qf: QuickFilter,
  healthCounts: AuditStateCounts,
  allEvents: RegulatoryEvent[],
  _auditByEvent: Record<string, AuditState>,
): number {
  switch (qf) {
    case 'not-certifiable':  return healthCounts['not-certifiable'];
    case 'missing-evidence': return healthCounts['complete-missing-evidence'];
    case 'pending-approval': return healthCounts['complete-pending-approval'];
    case 'overdue':          return healthCounts.overdue + healthCounts.blocked;
    case 'ready-to-certify': return healthCounts['audit-ready'];
    case 'certified':        return healthCounts['certified-locked'];
    case 'governance':       return allEvents.filter(e => e.domain === 'Governance').length;
    case 'qapi':             return allEvents.filter(e => e.domain === 'QAPI').length;
    case 'billing-critical': return allEvents.filter(e => e.domain === 'Finance').length;
    case 'survey-critical':  return allEvents.filter(e =>
      e.complianceFlags?.auditRisk === 'critical' || e.complianceFlags?.auditRisk === 'high').length;
    default: return 0;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CesSprintAuditStrip — bridge surface in Audit Mode
   --------------------------------------------------------------
   Reads CES audit-readiness rollup and critical units from the
   shared compliance-execution layer. Click jumps to the sprint
   view of the unified calendar.
   ═══════════════════════════════════════════════════════════════ */
function CesSprintAuditStrip({ onOpenSprint }: { onOpenSprint: () => void }) {
  const snap     = useComplianceExecution();
  const rollup   = useMemo(() => selectAuditReadinessRollup(snap), [snap]);
  const critical = useMemo(() => selectCriticalUnits(snap),         [snap]);
  return (
    <div
      className="px-6 md:px-10 py-2 flex items-center gap-5 border-b text-[11px] font-roboto"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
    >
      <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.2em]" style={{ color: TEAL_PRIMARY }}>
        Sprint {snap.activeSprint.label} · CES Audit
      </span>
      <span className="text-white/70">Not Ready: <strong className="text-white">{rollup.notReady}</strong></span>
      <span className="text-white/70">Partial: <strong className="text-white">{rollup.partial}</strong></span>
      <span className="text-white/70">Ready: <strong className="text-white">{rollup.ready}</strong></span>
      <span className="text-white/70">Certified: <strong className="text-white">{rollup.certified}</strong></span>
      <span className="text-white/70">Critical Units: <strong style={{ color: '#EF4444' }}>{critical.length}</strong></span>
      <button
        type="button"
        onClick={onOpenSprint}
        className="ml-auto px-2.5 py-1 rounded-md border border-white/10 hover:bg-white/[0.05] text-white/75 hover:text-white"
      >
        Open Sprint View →
      </button>
    </div>
  );
}
