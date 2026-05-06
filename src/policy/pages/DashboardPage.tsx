import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShellStore } from '@/policy/stores/uiStore';
import {
  AlertTriangle, Activity, ShieldCheck,
  CheckCircle2, FileText, Filter, MoreHorizontal, ArrowRight,
  Clock, ShieldX,
} from 'lucide-react';
import {
  REGULATORY_EVENTS, daysUntil, TODAY_ANCHOR, relativeLabel,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { ToastHost } from '@/policy/components/regulatory/Toast';
import { AUDIT_STATE_LABEL, evaluateAudit, isReadyToClose, type AuditEvaluation, type AuditState } from '@/policy/audit/auditState';
import { useComplianceExecution, selectAuditReadinessRollup, selectAwaitingSignatureUnits } from '@/policy/compliance-execution';

type KpiCardData = {
  label: string;
  value: string;
  trend?: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
  alert?: boolean;
  onClick?: () => void;
};

type BoardTone = 'critical' | 'warning' | 'progress' | 'pending';

type AwaitingBoardItem = {
  id: string;
  route: string;
  event: RegulatoryEvent;
};

export function DashboardPage() {
  const navigate = useNavigate();
  const today = TODAY_ANCHOR;
  const store = useRegulatoryExecutionStore();
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1920 : window.innerWidth));
  const isMobile = viewportWidth < 768;

  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const snap = useComplianceExecution();

  const eventById = useMemo(() => {
    const map = new Map<string, RegulatoryEvent>();
    for (const event of [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents]) {
      if (!event.isContext) map.set(event.id, event);
    }
    return map;
  }, [generatedEvents, triggeredEvents]);

  const goTaskFallback = () => navigate('/pm/my-tasks');
  const goInstance = (id: string) => {
    const targetExists = instances.some(event => event.id === id);
    if (!targetExists) {
      goTaskFallback();
      return;
    }
    navigate(`/calendar?event=${encodeURIComponent(id)}&workflow=1`);
  };
  const goAudit = (filter?: AuditState) => navigate(filter ? `/audit?state=${encodeURIComponent(filter)}` : '/audit');

  const instances = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents].filter(e => !e.isContext),
    [generatedEvents, triggeredEvents],
  );

  const evaluations = useMemo(() => {
    const map = new Map<string, AuditEvaluation>();
    for (const event of instances) map.set(event.id, evaluateAudit(event, today, store));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, today, store.completions, store.certifications, store.stepStates, store.formStates, store.approvals, store.minutesStates]);

  const critical = useMemo(() => {
    const blocked: RegulatoryEvent[] = [];
    const overdue: RegulatoryEvent[] = [];
    const atRisk: RegulatoryEvent[] = [];
    for (const event of instances) {
      const evaluation = evaluations.get(event.id);
      if (!evaluation) continue;
      if (evaluation.primary === 'blocked') blocked.push(event);
      else if (evaluation.primary === 'overdue') overdue.push(event);
      else if (evaluation.primary === 'at-risk') atRisk.push(event);
    }
    const byDate = (a: RegulatoryEvent, b: RegulatoryEvent) => daysUntil(a.date, today) - daysUntil(b.date, today);
    return {
      blocked: blocked.sort(byDate),
      overdue: overdue.sort(byDate),
      atRisk: atRisk.sort(byDate),
    };
  }, [instances, today, evaluations]);

  const pipeline = useMemo(() => {
    const inProgress: RegulatoryEvent[] = [];
    const awaitingApproval: RegulatoryEvent[] = [];
    const missingEvidence: RegulatoryEvent[] = [];
    const readyToClose: RegulatoryEvent[] = [];
    const readyToCertify: RegulatoryEvent[] = [];
    for (const event of instances) {
      if (store.isCertified(event.id)) continue;

      const evaluation = evaluations.get(event.id);
      if (!evaluation) continue;
      const state = evaluation.primary;
      if (state === 'audit-ready') {
        readyToCertify.push(event);
        continue;
      }
      if (!store.isEventComplete(event.id) && isReadyToClose(event, store)) {
        readyToClose.push(event);
        continue;
      }
      if (state === 'complete-pending-approval') awaitingApproval.push(event);
      else if (state === 'complete-missing-evidence') missingEvidence.push(event);
      else if (state === 'in-progress') inProgress.push(event);
    }
    const byDate = (a: RegulatoryEvent, b: RegulatoryEvent) => daysUntil(a.date, today) - daysUntil(b.date, today);
    return {
      inProgress: inProgress.sort(byDate),
      awaitingApproval: awaitingApproval.sort(byDate),
      missingEvidence: missingEvidence.sort(byDate),
      readyToClose: readyToClose.sort(byDate),
      readyToCertify: readyToCertify.sort(byDate),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, today, evaluations, store.completions, store.certifications]);

  const readiness = useMemo(() => {
    let auditReady = 0;
    let certifiedWithException = 0;
    let notCertifiable = 0;
    let atRisk = 0;
    let overdue = 0;
    let blocked = 0;
    let missingEvidence = 0;
    let pendingApproval = 0;
    let graceWindow = 0;

    for (const event of instances) {
      const evaluation = evaluations.get(event.id);
      if (!evaluation) continue;
      const state = evaluation.primary;
      if (state === 'audit-ready') auditReady += 1;
      if (state === 'complete-missing-evidence') missingEvidence += 1;
      if (state === 'complete-pending-approval') pendingApproval += 1;
      if (state === 'certified-locked') {
        const record = store.getCertification(event.id);
        if (record?.disposition === 'certified-with-exception') certifiedWithException += 1;
      }
      if (state === 'not-certifiable') notCertifiable += 1;
      if (state === 'at-risk') atRisk += 1;
      if (state === 'overdue') overdue += 1;
      if (state === 'blocked') blocked += 1;
      if (evaluation.eligibleForGraceCertification) graceWindow += 1;
    }

    const agencyReady =
      notCertifiable === 0 && overdue === 0 && blocked === 0 &&
      missingEvidence === 0 && pendingApproval === 0;
    const reasons: string[] = [];
    if (notCertifiable) reasons.push(`${notCertifiable} not-certifiable`);
    if (overdue) reasons.push(`${overdue} overdue`);
    if (blocked) reasons.push(`${blocked} blocked`);
    if (missingEvidence) reasons.push(`${missingEvidence} missing evidence`);
    if (pendingApproval) reasons.push(`${pendingApproval} pending approval`);
    if (atRisk && agencyReady) reasons.push(`Watch: ${atRisk} at-risk`);
    if (!reasons.length) reasons.push('All workflows compliant or certified');

    return {
      auditReady,
      certifiedWithException,
      atRisk,
      graceWindow,
      agencyReady,
      reasons,
    };
  }, [instances, evaluations, store]);

  const rollup = useMemo(() => selectAuditReadinessRollup(snap), [snap]);
  const awaitingSignatures = useMemo(() => selectAwaitingSignatureUnits(snap), [snap]);

  const criticalAndOverdue = useMemo(
    () => [...critical.blocked, ...critical.overdue].sort((a, b) => daysUntil(a.date, today) - daysUntil(b.date, today)),
    [critical.blocked, critical.overdue, today],
  );

  const awaitingBoardItems = useMemo<AwaitingBoardItem[]>(() => {
    const items: AwaitingBoardItem[] = [];
    const seenRoutes = new Set<string>();

    const addItem = (route: string, event: RegulatoryEvent) => {
      if (seenRoutes.has(route)) return;
      seenRoutes.add(route);
      items.push({ id: `awaiting-${items.length + 1}`, route, event });
    };

    const awaitingSignatureUnits = selectAwaitingSignatureUnits(snap);
    for (const unit of awaitingSignatureUnits) {
      const formId = unit.sourceFormIds?.[0];
      if (formId && FORM_TITLES[formId]) {
        const baseEvent = eventById.get(unit.parentEventId);
        const title = `${FORM_TITLES[formId] ?? formId} awaiting signature`;
        addItem(`/forms/${encodeURIComponent(formId)}`, {
          id: unit.parentEventId,
          title,
          domain: baseEvent?.domain ?? unit.domain,
          owner: baseEvent?.owner ?? unit.owner.name,
          date: baseEvent?.date ?? unit.dueDate,
          complianceFlags: baseEvent?.complianceFlags,
        } as RegulatoryEvent);
      } else {
        const baseEvent = eventById.get(unit.parentEventId);
        if (baseEvent) addItem(`/calendar?event=${encodeURIComponent(baseEvent.id)}&workflow=1`, baseEvent);
      }
      if (items.length >= 5) return items;
    }

    for (const unit of snap.executionUnits) {
      const missingForms = unit.evidenceStatus?.missingFormIds ?? [];
      if (!missingForms.length) continue;
      const missingFormId = missingForms[0];
      const baseEvent = eventById.get(unit.parentEventId);
      if (FORM_TITLES[missingFormId]) {
        const title = `${FORM_TITLES[missingFormId] ?? missingFormId} requires completion`;
        addItem(`/forms/${encodeURIComponent(missingFormId)}`, {
          id: unit.parentEventId,
          title,
          domain: baseEvent?.domain ?? unit.domain,
          owner: baseEvent?.owner ?? unit.owner.name,
          date: baseEvent?.date ?? unit.dueDate,
          complianceFlags: baseEvent?.complianceFlags,
        } as RegulatoryEvent);
      } else if (baseEvent) {
        addItem(`/calendar?event=${encodeURIComponent(baseEvent.id)}&workflow=1`, baseEvent);
      } else {
        addItem('/pm/my-tasks', {
          id: unit.parentEventId,
          title: `Pending evidence for ${unit.workflowId}`,
          domain: unit.domain,
          owner: unit.owner.name,
          date: unit.dueDate,
        } as unknown as RegulatoryEvent);
      }
      if (items.length >= 5) return items;
    }

    for (const event of pipeline.awaitingApproval) {
      addItem(`/calendar?event=${encodeURIComponent(event.id)}&workflow=1`, event);
      if (items.length >= 5) return items;
    }

    for (const unit of snap.executionUnits) {
      if (unit.blockedReason?.kind !== 'missing_form') continue;
      const baseEvent = eventById.get(unit.parentEventId);
      if (!baseEvent) continue;
      addItem(`/calendar?event=${encodeURIComponent(baseEvent.id)}&workflow=1`, baseEvent);
      if (items.length >= 5) return items;
    }

    if (items.length < 3) {
      const qapiEvent = [...eventById.values()].find(e => /qapi/i.test(e.title));
      const governingBodyEvent = [...eventById.values()].find(e => /governing body|governance/i.test(e.title));
      const demoDefaults: Array<{ title: string; route: string; domain: RegulatoryEvent['domain']; owner: string; date: string }> = [
        {
          title: 'Missed Visit Documentation Form awaiting signature',
          route: '/forms/CL-FM-011',
          domain: 'Clinical',
          owner: 'Clinical Manager',
          date: today.toISOString().slice(0, 10),
        },
        {
          title: 'Physician Orders pending signature',
          route: '/forms/CL-FM-006',
          domain: 'Clinical',
          owner: 'Clinical Manager',
          date: today.toISOString().slice(0, 10),
        },
        {
          title: 'QAPI meeting evidence pending upload',
          route: qapiEvent ? `/calendar?event=${encodeURIComponent(qapiEvent.id)}&workflow=1` : '/pm/my-tasks',
          domain: qapiEvent?.domain ?? 'Compliance',
          owner: qapiEvent?.owner ?? 'QAPI Coordinator',
          date: qapiEvent?.date ?? today.toISOString().slice(0, 10),
        },
        {
          title: 'Governing Body packet pending approval',
          route: governingBodyEvent ? `/calendar?event=${encodeURIComponent(governingBodyEvent.id)}&workflow=1` : '/forms/GV-FM-005',
          domain: governingBodyEvent?.domain ?? 'Governance',
          owner: governingBodyEvent?.owner ?? 'Administrator',
          date: governingBodyEvent?.date ?? today.toISOString().slice(0, 10),
        },
      ];

      for (const fallback of demoDefaults) {
        addItem(fallback.route, {
          id: `fallback-${fallback.title}`,
          title: fallback.title,
          domain: fallback.domain,
          owner: fallback.owner,
          date: fallback.date,
        } as RegulatoryEvent);
        if (items.length >= 5) break;
      }
    }

    return items.slice(0, 5);
  }, [eventById, pipeline.awaitingApproval, snap, today]);

  const openAwaitingActionItem = (id: string) => {
    const target = awaitingBoardItems.find(item => item.id === id);
    if (!target) {
      goTaskFallback();
      return;
    }
    navigate(target.route);
  };

  const kpis: KpiCardData[] = [
    {
      label: 'Active Sprint',
      value: snap.activeSprint.label,
      trend: `${snap.sprintMetrics.upcomingDeadlines48hCount} due within 48h`,
      onClick: () => navigate('/pm/dashboard'),
    },
    {
      label: 'Sprint %',
      value: `${snap.sprintMetrics.completionRatePct}%`,
      trend: `${snap.sprintMetrics.activeBlockerCount} blockers`,
      tone: snap.sprintMetrics.activeBlockerCount > 0 ? 'warning' : 'positive',
      onClick: () => goAudit('blocked'),
    },
    {
      label: 'Audit Ready',
      value: `${readiness.auditReady}/${instances.length}`,
      trend: `${snap.sprintMetrics.auditReadinessScore}/100`,
      tone: 'positive',
      onClick: () => goAudit('audit-ready'),
    },
    {
      label: 'Action In Progress',
      value: `${pipeline.inProgress.length}`,
      trend: `${pipeline.readyToClose.length} ready to close`,
      onClick: () => navigate('/pm/my-tasks'),
    },
    {
      label: 'Missing Evidence',
      value: `${pipeline.missingEvidence.length}`,
      trend: `${pipeline.awaitingApproval.length} pending approval`,
      tone: pipeline.missingEvidence.length > 0 ? 'warning' : 'default',
      onClick: () => goAudit('complete-missing-evidence'),
    },
    {
      label: 'Critical Actions',
      value: `${criticalAndOverdue.length}`,
      trend: `${critical.atRisk.length} at risk`,
      tone: criticalAndOverdue.length > 0 ? 'danger' : 'default',
      alert: criticalAndOverdue.length > 0,
      onClick: () => goAudit('overdue'),
    },
    {
      label: 'Audit Open',
      value: `${rollup.notReady + rollup.partial}`,
      trend: `${awaitingSignatures.length} awaiting sig`,
      onClick: () => goAudit(),
    },
  ];

  const kpiByLabel = useMemo(() => {
    const map = new Map<string, KpiCardData>();
    kpis.forEach(k => map.set(k.label, k));
    return map;
  }, [kpis]);

  const mobilePrimaryKpis = useMemo(() => {
    const overdueRiskCard: KpiCardData = {
      label: 'Overdue / SLA Risk',
      value: `${critical.overdue.length}`,
      trend: `${critical.atRisk.length} at risk`,
      tone: critical.overdue.length > 0 ? 'danger' : (critical.atRisk.length > 0 ? 'warning' : 'default'),
      onClick: () => goAudit('overdue'),
    };
    const ordered = [
      'Critical Actions',
      '__OVERDUE_RISK__',
      'Missing Evidence',
      'Action In Progress',
      'Active Sprint',
      'Audit Ready',
    ];
    return ordered.map(label => (label === '__OVERDUE_RISK__' ? overdueRiskCard : kpiByLabel.get(label))).filter(Boolean) as KpiCardData[];
  }, [critical.atRisk.length, critical.overdue.length, goAudit, kpiByLabel]);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className={`h-full w-full flex flex-col px-3 sm:px-5 md:px-8 py-3 sm:py-5 gap-3 sm:gap-5 overflow-x-hidden overflow-y-auto md:overflow-hidden animate-in fade-in duration-500 ${isLight ? '' : 'bg-gradient-to-b from-white/5 to-white/[0.02]'}`}>
      <DashboardHero />

      {isMobile ? (
        <section className="grid grid-cols-1 gap-2">
          {mobilePrimaryKpis.map((kpi, idx) => (
            <KpiCard key={kpi.label} {...kpi} emphasize={idx < 2 || kpi.label === 'Missing Evidence'} />
          ))}
          {kpiByLabel.get('Audit Open') ? <KpiCard {...(kpiByLabel.get('Audit Open') as KpiCardData)} /> : null}
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
          {kpis.map(kpi => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </section>
      )}

      <AgencyReadinessBanner
        ready={readiness.agencyReady}
        reasons={readiness.reasons}
        atRisk={readiness.atRisk}
        graceWindow={readiness.graceWindow}
        certifiedWithException={readiness.certifiedWithException}
        onClickNotReady={() => goAudit()}
      />

      <section className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className={`text-[26px] font-semibold tracking-[-0.02em] ${isLight ? 'text-slate-800' : 'text-slate-50'}`}>
            Action Board
          </h2>
          <p className={`text-[13px] ${isLight ? 'text-slate-500' : 'text-white/70'}`}>
            Operational triage across critical deadlines, active work, and evidence queues.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ToolbarButton icon={<Filter size={14} />} label="Filter" />
          <ToolbarButton label="Sort by: Priority" />
        </div>
      </section>

      <div className={`flex-1 min-h-0 pb-2 ${isMobile ? '' : '-mx-3 sm:mx-0 px-3 sm:px-0'} ${isMobile ? 'overflow-x-hidden' : 'overflow-x-auto'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-3 sm:gap-4 lg:min-w-0 ${isMobile ? 'min-w-0' : 'min-w-[88vw] sm:min-w-[680px]'} h-full`}>
          <BoardColumn
            title="Critical & Overdue"
            count={criticalAndOverdue.length}
            tone="critical"
            items={criticalAndOverdue}
            today={today}
            onOpen={goInstance}
            onFallback={goTaskFallback}
          />
          <BoardColumn
            title="At Risk"
            count={critical.atRisk.length}
            tone="warning"
            items={critical.atRisk}
            today={today}
            onOpen={goInstance}
            onFallback={goTaskFallback}
          />
          <BoardColumn
            title="In Progress"
            count={pipeline.inProgress.length}
            tone="progress"
            items={pipeline.inProgress}
            today={today}
            onOpen={goInstance}
            onFallback={goTaskFallback}
          />
          <BoardColumn
            title="Awaiting Action / Evidence"
            count={awaitingBoardItems.length}
            tone="pending"
            items={awaitingBoardItems.map(item => ({ ...item.event, id: item.id }))}
            today={today}
            onOpen={openAwaitingActionItem}
            onFallback={goTaskFallback}
          />
        </div>
      </div>

      <ToastHost />
    </div>
  );
}

function DashboardHero() {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  return (
    <section className="flex items-end justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-orange-500">
            Command Center
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />
          <span className={`text-[12px] font-medium ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
            What needs action now
          </span>
        </div>
        <h1 className={`text-[22px] sm:text-[28px] md:text-[34px] font-semibold tracking-[-0.03em] leading-tight sm:leading-none ${isLight ? 'text-slate-900' : 'text-slate-50'}`}>
          What needs action now
        </h1>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isLight ? 'text-slate-400' : 'text-white/50'}`}>
          Today
        </div>
        <div className={`text-[12px] sm:text-[14px] font-medium mt-1 ${isLight ? 'text-slate-700' : 'text-white/90'}`}>
          {TODAY_ANCHOR.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, trend, tone = 'default', alert, onClick, emphasize = false }: KpiCardData & { emphasize?: boolean }) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const valueClass = {
    default: isLight ? 'text-slate-900' : 'text-slate-50',
    positive: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  }[tone];
  const trendClass = {
    default: isLight ? 'text-slate-500' : 'text-white/65',
    positive: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
  }[tone];
  const shellClass = isLight
    ? `bg-white ${emphasize ? 'border-[#C74601]/30' : 'border-slate-200'} shadow-[0_8px_24px_rgba(15,23,42,0.05)]`
    : `bg-white/5 ${emphasize ? 'border-[#FFC107]/30' : 'border-white/10'}`;

  const content = (
    <>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${isLight ? 'text-slate-400' : 'text-white/55'}`}>
          {label}
        </span>
        {alert ? <AlertTriangle size={14} className="text-red-500" /> : null}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-[32px] leading-none font-semibold tracking-[-0.03em] ${valueClass}`}>
          {value}
        </span>
        {trend ? <span className={`text-[11px] font-semibold pb-1 ${trendClass}`}>{trend}</span> : null}
      </div>
    </>
  );

  if (!onClick) {
    return <div className={`rounded-2xl border px-4 py-3 min-h-[98px] ${shellClass}`}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 min-h-[98px] text-left transition cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${shellClass}`}
    >
      {content}
    </button>
  );
}

function AgencyReadinessBanner({
  ready,
  reasons,
  atRisk,
  graceWindow,
  certifiedWithException,
  onClickNotReady,
}: {
  ready: boolean;
  reasons: string[];
  atRisk: number;
  graceWindow: number;
  certifiedWithException: number;
  onClickNotReady: () => void;
}) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const Icon = ready ? ShieldCheck : ShieldX;
  const status = ready ? 'Agency Readiness - Ready' : 'Agency Readiness - Not Ready';
  const supporting = ready
    ? 'All workflows compliant or certification-ready.'
    : `${reasons.join(' · ')}. Immediate action needed to avoid compliance risk.`;
  const shellClass = ready
    ? (isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/15 border-emerald-400/30')
    : (isLight ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-400/30');
  const bodyClass = ready
    ? (isLight ? 'text-emerald-800' : 'text-white/80')
    : (isLight ? 'text-red-700' : 'text-white/80');
  const accentClass = ready ? 'text-emerald-600' : 'text-red-600';
  const iconShellClass = ready ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600';
  const buttonClass = ready
    ? 'bg-emerald-100 text-emerald-700'
    : (isLight ? 'bg-red-100 text-red-700' : 'bg-white/10 text-red-200');

  return (
    <div className={`rounded-2xl border px-4 py-3 flex items-center gap-4 flex-wrap ${shellClass}`}>
      <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconShellClass}`}>
        <Icon size={18} />
      </span>
      <div className="flex-1 min-w-[240px]">
        <div className={`text-[12px] font-semibold uppercase tracking-[0.14em] ${accentClass}`}>
          {status}
        </div>
        <p className={`text-[13px] mt-1 ${bodyClass}`}>{supporting}</p>
      </div>
      <div className="flex items-center gap-3 ml-auto flex-wrap">
        {atRisk > 0 ? <BannerChip label="At Risk" value={atRisk} tone="warning" /> : null}
        {graceWindow > 0 ? <BannerChip label="Grace" value={graceWindow} tone="warning" /> : null}
        {certifiedWithException > 0 ? <BannerChip label="Cert w/ Exc" value={certifiedWithException} tone="default" /> : null}
        {!ready ? (
          <button
            type="button"
            onClick={onClickNotReady}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition ${buttonClass}`}
          >
            View Readiness Report
          </button>
        ) : null}
      </div>
    </div>
  );
}

function BannerChip({ label, value, tone }: { label: string; value: number; tone: 'default' | 'warning' }) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const chipClass = tone === 'warning'
    ? (isLight ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-orange-500/10 border-orange-400/30 text-orange-300')
    : (isLight ? 'bg-violet-50 border-violet-200 text-violet-600' : 'bg-violet-500/10 border-violet-400/30 text-violet-300');
  return (
    <div className={`px-3 py-2 rounded-xl border text-right ${chipClass}`}>
      <div className="text-[9px] font-semibold uppercase tracking-[0.16em]">{label}</div>
      <div className="text-[18px] leading-none font-semibold mt-1">{value}</div>
    </div>
  );
}

function ToolbarButton({ icon, label }: { icon?: React.ReactNode; label: string }) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const className = isLight
    ? 'bg-white border-slate-200 text-slate-600'
    : 'bg-white/5 border-white/10 text-white/85';
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[13px] font-medium transition ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function BoardColumn({
  title,
  count,
  tone,
  items,
  today,
  onOpen,
  onFallback,
}: {
  title: string;
  count: number;
  tone: BoardTone;
  items: RegulatoryEvent[];
  today: Date;
  onOpen: (id: string) => void;
  onFallback: () => void;
}) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const meta = {
    critical: {
      icon: AlertTriangle,
      accent: 'text-red-500',
      shell: isLight ? 'bg-transparent border-transparent shadow-none p-0' : 'bg-white/5 border-white/10',
      badge: isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-200',
      title: isLight ? 'text-slate-700' : 'text-slate-50',
    },
    warning: {
      icon: Clock,
      accent: 'text-amber-500',
      shell: isLight ? 'bg-transparent border-transparent shadow-none p-0' : 'bg-white/5 border-white/10',
      badge: isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-200',
      title: isLight ? 'text-slate-700' : 'text-slate-50',
    },
    progress: {
      icon: Activity,
      accent: 'text-blue-500',
      shell: isLight ? 'bg-transparent border-transparent shadow-none p-0' : 'bg-white/5 border-white/10',
      badge: isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-200',
      title: isLight ? 'text-slate-700' : 'text-slate-50',
    },
    pending: {
      icon: FileText,
      accent: 'text-slate-500',
      shell: isLight ? 'bg-transparent border-transparent shadow-none p-0' : 'bg-white/5 border-white/10',
      badge: isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-200',
      title: isLight ? 'text-slate-700' : 'text-slate-50',
    },
  } as const;
  const column = meta[tone];
  const Icon = column.icon;

  return (
    <section className={`rounded-2xl border ${isLight ? 'p-0' : 'p-3'} flex flex-col min-h-0 ${column.shell}`}>
      <header className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className={column.accent} />
          <h3 className={`text-[18px] font-semibold truncate ${column.title}`}>{title}</h3>
        </div>
        <span className={`min-w-[28px] h-7 px-2 rounded-full flex items-center justify-center text-[12px] font-semibold ${column.badge}`}>
          {count}
        </span>
      </header>

      <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pr-1">
        {items.length > 0 ? items.map(event => (
          <TaskCard
            key={event.id}
            event={event}
            today={today}
            onClick={() => onOpen(event.id)}
            onFallback={onFallback}
            tone={tone}
          />
        )) : <EmptyBoardState label={title} onClick={onFallback} />}
      </div>
    </section>
  );
}

function TaskCard({
  event,
  today,
  onClick,
  onFallback,
  tone,
}: {
  event: RegulatoryEvent;
  today: Date;
  onClick: () => void;
  onFallback: () => void;
  tone: BoardTone;
}) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const dueLabel = getDueLabel(event, today);
  const shellClass = isLight
    ? 'bg-white border-slate-200 shadow-[0_10px_24px_rgba(15,23,42,0.04)]'
    : 'bg-white/5 border-white/10';
  const labelClass = isLight ? 'text-slate-400' : 'text-white/50';
  const titleClass = isLight ? 'text-slate-800' : 'text-slate-50';
  const ownerClass = isLight ? 'text-slate-500' : 'text-white/70';
  const dividerClass = isLight ? 'border-slate-100' : 'border-white/5';
  const avatarClass = isLight
    ? 'bg-slate-100 text-slate-500 border-slate-200'
    : 'bg-white/10 text-slate-100 border-white/10';
  const badgeClass = {
    critical: 'bg-red-50 text-red-600 border-red-200',
    warning: 'bg-orange-50 text-orange-600 border-orange-200',
    progress: 'bg-blue-50 text-blue-600 border-blue-200',
    pending: 'bg-slate-50 text-slate-600 border-slate-300',
  }[tone];

  return (
    <button
      type="button"
      onClick={() => {
        if (!event.id) {
          onFallback();
          return;
        }
        onClick();
      }}
      className={`w-full rounded-2xl border p-4 text-left transition group cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${shellClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-[10px] font-semibold uppercase tracking-[0.14em] mb-1 ${labelClass}`}>
            {event.domain}
          </div>
          <h4 className={`text-[15px] font-semibold leading-tight ${titleClass}`}>
            {event.title}
          </h4>
        </div>
        <MoreHorizontal size={16} className={isLight ? 'text-slate-300' : 'text-white/35'} />
      </div>

      <div className={`flex items-center justify-between mt-4 pt-3 border-t ${dividerClass}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 border ${avatarClass}`}>
            {getInitials(event.owner)}
          </span>
          <span className={`text-[12px] font-medium truncate ${ownerClass}`}>{event.owner}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-1 rounded-lg border ${badgeClass}`}>
            {dueLabel}
          </span>
          <ArrowRight size={14} className={isLight ? 'text-slate-400' : 'text-white/50'} />
        </div>
      </div>
    </button>
  );
}

function EmptyBoardState({ label, onClick }: { label: string; onClick: () => void }) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const shellClass = isLight ? 'bg-white border-slate-300' : 'bg-white/5 border-white/15';
  const titleClass = isLight ? 'text-slate-700' : 'text-slate-50';
  const bodyClass = isLight ? 'text-slate-500' : 'text-white/65';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border border-dashed p-6 flex flex-col items-center justify-center text-center min-h-[220px] transition cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${shellClass}`}
    >
      <CheckCircle2 size={28} className="text-emerald-500" />
      <div className={`text-[14px] font-semibold mt-3 ${titleClass}`}>All clear</div>
      <p className={`text-[12px] mt-1 ${bodyClass}`}>No {label.toLowerCase()} items in the current queue.</p>
    </button>
  );
}

function getDueLabel(event: RegulatoryEvent, today: Date) {
  const delta = daysUntil(event.date, today);
  if (delta < 0) return `${Math.abs(delta)}D PAST`;
  if (delta === 0) return 'TODAY';
  if (delta === 1) return 'TOMORROW';
  if (delta <= 14) return `${delta}D`;
  return relativeLabel(event.date, today).toUpperCase();
}

function getInitials(owner: string) {
  return owner
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'CI';
}

export { AUDIT_STATE_LABEL };
