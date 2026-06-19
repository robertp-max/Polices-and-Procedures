import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Activity, ShieldCheck,
  CheckCircle2, FileText, MoreHorizontal, ArrowRight,
  Clock, ShieldX,
} from 'lucide-react';
import {
  REGULATORY_EVENTS, daysUntil, relativeLabel,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { ToastHost } from '@/policy/components/regulatory/Toast';
import { AUDIT_STATE_LABEL, evaluateAudit, isReadyToClose, type AuditEvaluation, type AuditState } from '@/policy/audit/auditState';
import { useComplianceExecution, selectAuditReadinessRollup, selectAwaitingSignatureUnits } from '@/policy/compliance-execution';
import {
  SpotlightCard,
  StatusPill,
  V32ActionButton,
  V32EmptyState,
  V32GlassPanel as GlassPanel,
  V32MetricTile,
  V32PageHeader,
  V32SectionHeader,
} from '@/policy/components/ui';
import { PlannerViewToggle, type ViewMode } from '@/policy/components/dashboard/PlannerViewToggle';
import { MyPlannerView } from '@/policy/components/dashboard/MyPlannerView';
import { formatCaliforniaDateTime, getCaliforniaNow, toCaliforniaISODate } from '@/policy/utils/californiaTime';

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
  const [clockNow, setClockNow] = useState(() => new Date());
  const today = useMemo(() => getCaliforniaNow(clockNow), [clockNow]);
  const todayIso = useMemo(() => toCaliforniaISODate(clockNow), [clockNow]);
  const todayLabel = useMemo(() => formatCaliforniaDateTime(clockNow), [clockNow]);
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
  const goAudit = useCallback((filter?: AuditState) => {
    navigate(filter ? `/audit?state=${encodeURIComponent(filter)}` : '/audit');
  }, [navigate]);

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
      const defaultAwaiting: Array<{ title: string; route: string; domain: RegulatoryEvent['domain']; owner: string; date: string }> = [
        {
          title: 'Missed Visit Documentation Form awaiting signature',
          route: '/forms/CL-FM-011',
          domain: 'Clinical',
          owner: 'Clinical Manager',
          date: todayIso,
        },
        {
          title: 'Physician Orders pending signature',
          route: '/forms/CL-FM-006',
          domain: 'Clinical',
          owner: 'Clinical Manager',
          date: todayIso,
        },
        {
          title: 'QAPI meeting evidence pending upload',
          route: qapiEvent ? `/calendar?event=${encodeURIComponent(qapiEvent.id)}&workflow=1` : '/pm/my-tasks',
          domain: qapiEvent?.domain ?? 'Compliance',
          owner: qapiEvent?.owner ?? 'QAPI Coordinator',
          date: qapiEvent?.date ?? todayIso,
        },
        {
          title: 'Governing Body packet pending approval',
          route: governingBodyEvent ? `/calendar?event=${encodeURIComponent(governingBodyEvent.id)}&workflow=1` : '/forms/GV-FM-005',
          domain: governingBodyEvent?.domain ?? 'Governance',
          owner: governingBodyEvent?.owner ?? 'Administrator',
          date: governingBodyEvent?.date ?? todayIso,
        },
      ];

      for (const fallback of defaultAwaiting) {
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
  }, [eventById, pipeline.awaitingApproval, snap, todayIso]);

  const openAwaitingActionItem = (id: string) => {
    const target = awaitingBoardItems.find(item => item.id === id);
    if (!target) {
      goTaskFallback();
      return;
    }
    navigate(target.route);
  };

  const kpis = useMemo<KpiCardData[]>(() => [
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
  ], [
    awaitingSignatures.length,
    critical.atRisk.length,
    criticalAndOverdue.length,
    goAudit,
    instances.length,
    navigate,
    pipeline.awaitingApproval.length,
    pipeline.inProgress.length,
    pipeline.missingEvidence.length,
    pipeline.readyToClose.length,
    readiness.auditReady,
    rollup.notReady,
    rollup.partial,
    snap.activeSprint.label,
    snap.sprintMetrics.activeBlockerCount,
    snap.sprintMetrics.auditReadinessScore,
    snap.sprintMetrics.completionRatePct,
    snap.sprintMetrics.upcomingDeadlines48hCount,
  ]);

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

  useEffect(() => {
    const interval = window.setInterval(() => setClockNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const dashboardKpis = isMobile
    ? [
        ...mobilePrimaryKpis,
        ...(kpiByLabel.get('Audit Open') ? [kpiByLabel.get('Audit Open') as KpiCardData] : []),
      ]
    : kpis;

  return (
    <div className="min-h-full bg-transparent text-[var(--v3-text-primary)]" data-surface="dashboard">
      <div className="mx-auto flex w-full w-full flex-col gap-6 px-6 py-6 lg:px-8">
        <V32PageHeader
          eyebrow="COMMAND CENTER"
          title="What needs action now"
          description="Executive view. Prioritize critical controls, clear risk, lock evidence-ready workflows."
          meta={
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="text-left sm:text-right">
                <div className="font-montserrat text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--v3-text-tertiary)]">Today</div>
                <div className="mt-1 text-sm font-semibold">{todayLabel}</div>
              </div>
              <PlannerViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          }
        />

        <section className={isMobile ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7'}>
          {dashboardKpis.map((kpi, idx) => (
            <KpiCard key={`${kpi.label}-${idx}`} {...kpi} emphasize={idx < 2 || kpi.label === 'Missing Evidence'} />
          ))}
        </section>

        <AgencyReadinessBanner
          ready={readiness.agencyReady}
          reasons={readiness.reasons}
          atRisk={readiness.atRisk}
          graceWindow={readiness.graceWindow}
          certifiedWithException={readiness.certifiedWithException}
          onClickNotReady={() => goAudit()}
        />

        {viewMode === 'agency' ? (
          <>
            <V32SectionHeader
              title="Events"
              description="Project events and regulatory deadlines requiring action."
              actions={
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <StatusPill tone="muted">Sort: Priority</StatusPill>
                  <StatusPill tone="muted">Live workload</StatusPill>
                </div>
              }
            />

            <div className={isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 gap-4 xl:grid-cols-4'}>
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

            <GlassPanel className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2 className="font-montserrat text-xl font-semibold tracking-[-0.03em] text-[var(--v3-heading-primary)]">My Planner</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Switch to your personal lane when you need assigned CES work and private tasks only.
                </p>
              </div>
              <V32ActionButton variant="secondary" onClick={() => setViewMode('planner')}>
                Open My Planner
              </V32ActionButton>
            </GlassPanel>
          </>
        ) : (
          <GlassPanel className="p-5">
            <V32SectionHeader
              title="My Planner"
              description="Your personal workload across assigned CES obligations and private tasks."
              className="mb-4"
            />
            <MyPlannerView showHeader={true} />
          </GlassPanel>
        )}

        <ToastHost />
      </div>
    </div>
  );
}

function KpiCard({ label, value, trend, tone = 'default', alert, onClick, emphasize = false }: KpiCardData & { emphasize?: boolean }) {
  return (
    <V32MetricTile
      label={label}
      value={value}
      trend={trend}
      tone={tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : tone === 'positive' ? 'teal' : emphasize ? 'teal' : 'neutral'}
      icon={alert ? <AlertTriangle size={16} aria-hidden="true" /> : undefined}
      onClick={onClick}
      className={emphasize ? 'border-brand-teal/40' : undefined}
    />
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
  const accentClass = ready ? 'text-brand-teal' : 'text-brand-orange';
  const iconShellClass = ready ? 'text-brand-teal' : 'text-brand-orange';

  return (
    <SpotlightCard
      className="flex flex-wrap items-center gap-4 p-5"
      spotlightColor={ready ? 'rgba(0, 121, 112, 0.20)' : 'rgba(199, 70, 0, 0.22)'}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconShellClass}`}>
        <Icon size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <div className={`font-montserrat text-[10px] font-bold uppercase tracking-[0.20em] ${accentClass}`}>
          {status}
        </div>
        <p className="mt-1 text-sm text-text-secondary">{supporting}</p>
      </div>
      <div className="flex items-center gap-3 ml-auto flex-wrap">
        {atRisk > 0 ? <BannerChip label="At Risk" value={atRisk} tone="warning" /> : null}
        {graceWindow > 0 ? <BannerChip label="Grace" value={graceWindow} tone="warning" /> : null}
        {certifiedWithException > 0 ? <BannerChip label="Cert w/ Exc" value={certifiedWithException} tone="default" /> : null}
        {!ready ? (
          <V32ActionButton variant="danger" onClick={onClickNotReady}>
            View Readiness Report
          </V32ActionButton>
        ) : null}
      </div>
    </SpotlightCard>
  );
}

function BannerChip({ label, value, tone }: { label: string; value: number; tone: 'default' | 'warning' }) {
  return (
    <StatusPill tone={tone === 'warning' ? 'warning' : 'neutral'}>
      {label}: {value}
    </StatusPill>
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
      accent: 'text-brand-orange',
      spotlight: 'rgba(199, 70, 0, 0.22)',
      badge: 'danger' as const,
    },
    warning: {
      icon: Clock,
      accent: 'text-brand-orange',
      spotlight: 'rgba(199, 70, 0, 0.18)',
      badge: 'warning' as const,
    },
    progress: {
      icon: Activity,
      accent: 'text-brand-teal',
      spotlight: 'rgba(0, 121, 112, 0.18)',
      badge: 'teal' as const,
    },
    pending: {
      icon: FileText,
      accent: 'text-text-muted',
      spotlight: 'rgba(226, 232, 240, 0.10)',
      badge: 'muted' as const,
    },
  } as const;
  const column = meta[tone];
  const Icon = column.icon;

  return (
    <GlassPanel className="flex min-h-[520px] flex-col p-3">
      <header className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className={column.accent} />
          <h3 className="truncate font-montserrat text-sm font-semibold text-text-primary">{title}</h3>
        </div>
        <StatusPill tone={column.badge}>{count}</StatusPill>
      </header>

      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {items.length > 0 ? items.map(event => (
          <TaskCard
            key={event.id}
            event={event}
            today={today}
            onClick={() => onOpen(event.id)}
            onFallback={onFallback}
            tone={tone}
            spotlightColor={column.spotlight}
          />
        )) : <EmptyBoardState label={title} onClick={onFallback} />}
      </div>
    </GlassPanel>
  );
}

function TaskCard({
  event,
  today,
  onClick,
  onFallback,
  tone,
  spotlightColor,
}: {
  event: RegulatoryEvent;
  today: Date;
  onClick: () => void;
  onFallback: () => void;
  tone: BoardTone;
  spotlightColor: string;
}) {
  const dueLabel = getDueLabel(event, today);
  const badgeTone = {
    critical: 'danger',
    warning: 'warning',
    progress: 'teal',
    pending: 'muted',
  } as const;
  const dueTone = badgeTone[tone];

  return (
    <SpotlightCard className="group p-4" spotlightColor={spotlightColor}>
      <button
        type="button"
        onClick={() => {
          if (!event.id) {
            onFallback();
            return;
          }
          onClick();
        }}
        className="absolute inset-0 z-20 rounded-[inherit] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/70"
        aria-label={`Open ${event.title}`}
      />
      <div className="pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 font-montserrat text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted">
              {event.domain}
            </div>
            <h4 className="font-montserrat text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand-teal">
              {event.title}
            </h4>
          </div>
          <MoreHorizontal size={16} className="text-text-disabled opacity-70" aria-hidden="true" />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-hover bg-background font-montserrat text-[9px] font-bold text-text-secondary">
              {getInitials(event.owner)}
            </span>
            <span className="truncate text-xs font-medium text-text-muted">{event.owner}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <StatusPill tone={dueTone}>{dueLabel}</StatusPill>
            <ArrowRight size={14} className="text-text-disabled" aria-hidden="true" />
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

function EmptyBoardState({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <V32EmptyState
      icon={<CheckCircle2 size={28} className="text-[var(--v3-teal-light)]" aria-hidden="true" />}
      title="All clear"
      description={`No ${label.toLowerCase()} items in the current queue.`}
      action={
        <V32ActionButton variant="secondary" onClick={onClick}>
          Go to My Tasks
        </V32ActionButton>
      }
      className="border-border bg-background/35"
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
