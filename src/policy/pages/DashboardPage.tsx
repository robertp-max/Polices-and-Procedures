import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  ShellContentFrame,
  ActionButton,
  UtilityButton,
  CiStatusBadge,
  EmptyState,
} from '@/policy/components/ui';
import { PlannerViewToggle, type ViewMode } from '@/policy/components/dashboard/PlannerViewToggle';
import { MyPlannerView } from '@/policy/components/dashboard/MyPlannerView';

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
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1920 : window.innerWidth));
  const isMobile = viewportWidth < 768;

  // My Planner toggle (default preserves current Agency View behavior exactly)
  const [viewMode, setViewMode] = useState<ViewMode>('agency');

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
    <ShellContentFrame scrollable className="v3-dashboard-reference animate-in fade-in duration-500" data-surface="dashboard">
      <div className="flex flex-col gap-4 sm:gap-5">
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <DashboardHero
          criticalCount={criticalAndOverdue.length}
          atRiskCount={critical.atRisk.length}
          auditReadyCount={readiness.auditReady}
          totalCount={instances.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {isMobile ? (
        <section className="grid grid-cols-1 gap-3">
          {mobilePrimaryKpis.map((kpi, idx) => (
            <KpiCard key={kpi.label} {...kpi} emphasize={idx < 2 || kpi.label === 'Missing Evidence'} />
          ))}
          {kpiByLabel.get('Audit Open') ? <KpiCard {...(kpiByLabel.get('Audit Open') as KpiCardData)} /> : null}
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
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

      {/* ── VIEW MODE SWITCH: Agency Board vs My Planner Dashboard ── */}
      {viewMode === 'agency' ? (
        <>
          {/* Events (Project Events) — Agency operational board */}
          <section className="flex items-center justify-between gap-3 gap-y-3 flex-wrap px-1 py-1">
            <div>
              <h2 className="font-semibold ci-text-display-section text-[var(--v3-text-primary)]">
                Events
              </h2>
              <p className="ci-text-body-sm text-[var(--v3-text-secondary)]">
                Project events and regulatory deadlines requiring action.
              </p>
            </div>

            <div className="ci-operational-toolbar">
              <UtilityButton ariaLabel="Filter board"><Filter size={14} aria-hidden="true" /><span className="ml-2">Filter</span></UtilityButton>
              <UtilityButton ariaLabel="Sort by priority"><span>Sort by: Priority</span></UtilityButton>
            </div>
          </section>

          {/* Main Events Board */}
          <div className={`flex-1 min-h-0 pb-2 ${isMobile ? '' : '-mx-3 sm:mx-0 px-3 sm:px-0'} ${isMobile ? 'overflow-x-hidden' : 'overflow-x-auto'} p-3 sm:p-4`}>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-3 sm:gap-4 lg:min-w-0 ${isMobile ? 'min-w-0' : 'ci-min-w-board-scroll'} h-full`}>
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

          <section className="mt-6 border-t border-[var(--v3-border-subtle)] pt-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold ci-text-display-section text-[var(--v3-text-primary)]">
                  My Planner
                </h2>
                <p className="ci-text-body-sm text-[var(--v3-text-secondary)]">
                  Switch to your personal lane when you need assigned CES work and private tasks only.
                </p>
              </div>
              <ActionButton variant="ghost" size="sm" onClick={() => setViewMode('planner')}>
                Open My Planner
              </ActionButton>
            </div>
          </section>
        </>
      ) : (
        /* ── FULL MY PLANNER DASHBOARD VIEW (when toggle is on Planner) ── */
        <div className="mt-2">
          <div className="mb-4">
            <h2 className="font-semibold ci-text-display-section text-[var(--v3-text-primary)]">
              My Planner
            </h2>
            <p className="ci-text-body-sm text-[var(--v3-text-secondary)]">
              Your personal workload • CES obligations assigned to you + private tasks
            </p>
          </div>
          <MyPlannerView showHeader={true} />
        </div>
      )}

      <ToastHost />
      </div>
    </ShellContentFrame>
  );
}

function DashboardHero({
  criticalCount,
  atRiskCount,
  auditReadyCount,
  totalCount,
  viewMode,
  setViewMode,
}: {
  criticalCount: number;
  atRiskCount: number;
  auditReadyCount: number;
  totalCount: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}) {
  return (
    <section className="flex items-start sm:items-end justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="v3-command-center-tag font-semibold uppercase ci-text-eyebrow-strong">
            Command Center
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[var(--v3-teal-light)]" />
          <span className="font-medium ci-text-eyebrow-strong text-[var(--v3-text-secondary)]">
            What needs action now
          </span>
        </div>
        <h1 className="font-semibold leading-tight sm:leading-none ci-text-display-hero text-[var(--v3-text-primary)]">
          What needs action now
        </h1>
        <p className="mt-2 ci-text-body-sm text-[var(--v3-text-secondary)]">
          Executive operational narrative for compliance execution, evidence readiness, and escalation control.
        </p>
      </div>
      <div className="w-full sm:w-auto shrink-0">
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 ci-min-w-hero-stat-sm">
          <HeroStat label="Critical" value={criticalCount} tone="danger" />
          <HeroStat label="At Risk" value={atRiskCount} tone="warning" />
          <HeroStat label="Audit Ready" value={auditReadyCount} tone="success" />
          <HeroStat label="In Scope" value={totalCount} tone="default" />
        </div>
      </div>
      <div className="text-left sm:text-right shrink-0 flex flex-col items-end gap-2">
        <div className="font-semibold uppercase ci-text-eyebrow-md text-[var(--v3-text-tertiary)]">
          Today
        </div>
        <div className="font-medium ci-text-body-sm text-[var(--v3-text-primary)]">
          {TODAY_ANCHOR.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>

        {/* Toggle moved to top right of Command Center header (as per screenshot) */}
        <div className="mt-1">
          <PlannerViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>
      <p className="w-full mt-2 ci-text-body-xs text-[var(--v3-text-secondary)]">
        Prioritize critical controls, clear risk queues, and lock evidence-ready workflows.
      </p>
    </section>
  );
}

function HeroStat({ label, value, tone }: { label: string; value: number; tone: 'default' | 'success' | 'warning' | 'danger' }) {
  const styles = {
    default: 'text-[var(--v3-text-secondary)] border-transparent',
    success: 'text-[var(--v3-teal-light)] border-transparent',
    warning: 'text-[var(--v3-teal-light)] border-transparent',
    danger: 'text-[var(--v3-teal-light)] border-transparent',
  }[tone];
  return (
    <div className={`ci-hero-stat ${styles} flex items-baseline gap-2`}>
      <div className="leading-none font-semibold ci-text-stat">{value}</div>
      <div className="font-semibold uppercase ci-text-eyebrow-sm">{label}</div>
    </div>
  );
}

function KpiCard({ label, value, trend, tone = 'default', alert, onClick, emphasize = false }: KpiCardData & { emphasize?: boolean }) {
  const valueClass = {
    default: 'text-[var(--v3-text-primary)]',
    positive: 'text-[var(--v3-teal-light)]',
    warning: 'text-[var(--v3-teal-light)]',
    danger: 'text-[var(--v3-teal-light)]',
  }[tone];
  const trendClass = {
    default: 'text-[var(--v3-text-secondary)]',
    positive: 'text-[var(--v3-teal-light)]',
    warning: 'text-[var(--v3-text-secondary)]',
    danger: 'text-[var(--v3-text-secondary)]',
  }[tone];
  const baseClass = 'ci-kpi-card border-t border-[var(--v3-border-subtle)] px-1 py-3';
  const emphasizeAttr = emphasize ? 'true' : 'false';

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold uppercase ci-text-eyebrow text-[var(--v3-text-tertiary)]">
          {label}
        </span>
        {alert ? <AlertTriangle size={14} className="text-[var(--v3-teal-light)]" aria-hidden="true" /> : null}
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`leading-none font-semibold ci-text-kpi ${valueClass}`}>
          {value}
        </span>
        {trend ? (
          <span className={`font-semibold pb-1 ci-text-meta ${trendClass}`}>{trend}</span>
        ) : null}
      </div>
    </>
  );

  if (!onClick) {
    return (
      <div
        className={`${baseClass} ci-min-h-kpi`}
        data-emphasize={emphasizeAttr}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      data-emphasize={emphasizeAttr}
      className={`${baseClass} ci-min-h-kpi text-left cursor-pointer ci-subtle-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60`}
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
  const Icon = ready ? ShieldCheck : ShieldX;
  const status = ready ? 'Agency Readiness - Ready' : 'Agency Readiness - Not Ready';
  const supporting = ready
    ? 'All workflows compliant or certification-ready.'
    : `${reasons.join(' · ')}. Immediate action needed to avoid compliance risk.`;
  const accentClass = 'text-[var(--v3-teal-light)]';
  const iconShellClass = 'text-[var(--v3-teal-light)] border border-transparent';

  return (
    <div className="border-y border-[var(--v3-border-subtle)] px-1 py-3 flex items-center gap-4 flex-wrap">
      <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconShellClass}`}>
        <Icon size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold uppercase ci-text-eyebrow-md ${accentClass}`}>
          {status}
        </div>
        <p className="mt-1 ci-text-body-sm text-[var(--v3-text-secondary)]">{supporting}</p>
      </div>
      <div className="flex items-center gap-3 ml-auto flex-wrap">
        {atRisk > 0 ? <BannerChip label="At Risk" value={atRisk} tone="warning" /> : null}
        {graceWindow > 0 ? <BannerChip label="Grace" value={graceWindow} tone="warning" /> : null}
        {certifiedWithException > 0 ? <BannerChip label="Cert w/ Exc" value={certifiedWithException} tone="default" /> : null}
        {!ready ? (
          <ActionButton variant="ghost" size="sm" onClick={onClickNotReady}>
            View Readiness Report
          </ActionButton>
        ) : null}
      </div>
    </div>
  );
}

function BannerChip({ label, value, tone }: { label: string; value: number; tone: 'default' | 'warning' }) {
  return (
    <CiStatusBadge tone={tone === 'warning' ? 'warning' : 'neutral'}>
      <span className="font-semibold uppercase ci-text-eyebrow-sm">{label}</span>
      <span className="mx-1" aria-hidden="true">·</span>
      <span className="font-semibold ci-text-stat">{value}</span>
    </CiStatusBadge>
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
  const meta = {
    critical: {
      icon: AlertTriangle,
      accent: 'text-[var(--v3-teal-light)]',
      shell: 'border border-[var(--v3-border-subtle)] rounded-xl p-3 bg-transparent',
      badge: 'text-[var(--v3-text-secondary)]',
      title: 'text-[var(--v3-text-primary)]',
    },
    warning: {
      icon: Clock,
      accent: 'text-[var(--v3-teal-light)]',
      shell: 'border border-[var(--v3-border-subtle)] rounded-xl p-3 bg-transparent',
      badge: 'text-[var(--v3-text-secondary)]',
      title: 'text-[var(--v3-text-primary)]',
    },
    progress: {
      icon: Activity,
      accent: 'text-[var(--v3-teal-light)]',
      shell: 'border border-[var(--v3-border-subtle)] rounded-xl p-3 bg-transparent',
      badge: 'text-[var(--v3-text-secondary)]',
      title: 'text-[var(--v3-text-primary)]',
    },
    pending: {
      icon: FileText,
      accent: 'text-[var(--v3-text-secondary)]',
      shell: 'border border-[var(--v3-border-subtle)] rounded-xl p-3 bg-transparent',
      badge: 'text-[var(--v3-text-secondary)]',
      title: 'text-[var(--v3-text-primary)]',
    },
  } as const;
  const column = meta[tone];
  const Icon = column.icon;

  return (
    <section className={`flex flex-col min-h-0 ${column.shell}`}>
      <header className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className={column.accent} />
          <h3 className={`font-semibold truncate ci-text-stat ${column.title}`}>{title}</h3>
        </div>
        <span className={`ci-min-w-count-badge flex items-center justify-center font-semibold ci-text-body-xs ${column.badge}`}>
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
  const dueLabel = getDueLabel(event, today);
  const labelClass = 'text-[var(--v3-text-tertiary)]';
  const titleClass = 'text-[var(--v3-text-primary)]';
  const ownerClass = 'text-[var(--v3-text-secondary)]';
  const dividerClass = 'border-white/5';
  const avatarClass = 'text-[var(--v3-text-primary)] border-transparent';
  const badgeClass = {
    critical: 'text-[var(--v3-teal-light)] border-transparent',
    warning: 'text-[var(--v3-teal-light)] border-transparent',
    progress: 'text-[var(--v3-teal-light)] border-transparent',
    pending: 'text-[var(--v3-text-secondary)] border-transparent',
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
      className="w-full rounded-xl border border-[var(--v3-border-subtle)] bg-transparent p-4 text-left group cursor-pointer ci-subtle-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`font-semibold uppercase mb-1 ci-text-eyebrow-md ${labelClass}`}>
            {event.domain}
          </div>
          <h4 className={`font-semibold leading-tight ci-text-card-title ${titleClass}`}>
            {event.title}
          </h4>
        </div>
        <MoreHorizontal size={16} className="text-[var(--v3-text-tertiary)]" aria-hidden="true" />
      </div>

      <div className={`flex items-center justify-between mt-4 pt-3 border-t ${dividerClass}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold shrink-0 border ci-text-meta ${avatarClass}`}>
            {getInitials(event.owner)}
          </span>
          <span className={`font-medium truncate ci-text-body-xs ${ownerClass}`}>{event.owner}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-semibold uppercase px-2 py-1 rounded-lg border ci-text-eyebrow-sm ${badgeClass}`}>
            {dueLabel}
          </span>
          <ArrowRight size={14} className="text-[var(--v3-text-tertiary)]" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

function EmptyBoardState({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <EmptyState
      icon={<CheckCircle2 size={28} className="text-[var(--v3-teal-light)]" aria-hidden="true" />}
      title="All clear"
      description={`No ${label.toLowerCase()} items in the current queue.`}
      action={
        <ActionButton variant="ghost" size="sm" onClick={onClick}>
          Go to My Tasks
        </ActionButton>
      }
      className="ci-empty-board-state"
    />
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
