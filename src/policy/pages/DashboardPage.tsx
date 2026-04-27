import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ChevronRight, Activity, ShieldCheck,
  FileWarning, BadgeCheck, Workflow, CheckCircle2, Lock, CircleAlert,
  ShieldX,
} from 'lucide-react';
import {
  REGULATORY_EVENTS, daysUntil, TODAY_ANCHOR, relativeLabel,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { ToastHost } from '@/policy/components/regulatory/Toast';
import { HelpContextLink } from '@/policy/help/HelpContextLink';
import {
  STATE_COLOR, TEAL_PRIMARY, ACTION_COLOR,
} from '@/policy/components/regulatory/timelineState';
import {
  evaluateAudit, isReadyToClose,
  AUDIT_STATE_COLOR, AUDIT_STATE_LABEL, type AuditState,
  type AuditEvaluation,
} from '@/policy/audit/auditState';
import {
  useComplianceExecution, selectAuditReadinessRollup,
  selectCriticalUnits, selectAwaitingSignatureUnits,
} from '@/policy/compliance-execution';

/* ═══════════════════════════════════════════════════════════════
   COMMAND CENTER — Dashboard
   --------------------------------------------------------------
   Three sections only:

     1. CRITICAL ACTIONS
        Blocked · Overdue · At Risk (due ≤ 7d with open blockers)

     2. EXECUTION PIPELINE
        In Progress · Awaiting Approval · Missing Evidence
        · Ready to Close

     3. COMPLETION + AUDIT READINESS
        Completed this period · Audit Ready · Incomplete Evidence
        · Certified & Locked

   Every counter is clickable and drills into the Execution
   Timeline or Audit queue focused on that slice. Orange is
   reserved for action; red/amber/teal/violet come from the
   shared audit-state palette.
   ═══════════════════════════════════════════════════════════════ */

export function DashboardPage() {
  const navigate = useNavigate();
  const today = TODAY_ANCHOR;
  const store = useRegulatoryExecutionStore();

  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);

  const goInstance = (id: string) =>
    navigate(`/calendar?event=${encodeURIComponent(id)}`);
  const goAudit = (filter?: AuditState) =>
    navigate(filter ? `/audit?state=${encodeURIComponent(filter)}` : '/audit');

  /* ── Derive workflow instances (base + autogen + triggered) ── */
  const instances = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents].filter(e => !e.isContext),
    [generatedEvents, triggeredEvents],
  );

  /* ── Single pass: evaluate every instance once + build buckets ── */
  const evaluations = useMemo(() => {
    const map = new Map<string, AuditEvaluation>();
    for (const e of instances) map.set(e.id, evaluateAudit(e, today, store));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, today, store.completions, store.certifications, store.stepStates, store.formStates, store.approvals, store.minutesStates]);

  /* ── 1. CRITICAL ACTIONS ── */
  const critical = useMemo(() => {
    const blocked: RegulatoryEvent[] = [];
    const overdue: RegulatoryEvent[] = [];
    const atRisk: RegulatoryEvent[] = [];
    for (const e of instances) {
      const ev = evaluations.get(e.id);
      if (!ev) continue;
      if (ev.primary === 'blocked') blocked.push(e);
      else if (ev.primary === 'overdue') overdue.push(e);
      else if (ev.primary === 'at-risk') atRisk.push(e);
    }
    const byDate = (a: RegulatoryEvent, b: RegulatoryEvent) =>
      daysUntil(a.date, today) - daysUntil(b.date, today);
    return {
      blocked: blocked.sort(byDate),
      overdue: overdue.sort(byDate),
      atRisk:  atRisk.sort(byDate),
    };
  }, [instances, today, evaluations]);

  /* ── 2. EXECUTION PIPELINE ── */
  const pipeline = useMemo(() => {
    const inProgress: RegulatoryEvent[] = [];
    const awaitingApproval: RegulatoryEvent[] = [];
    const missingEvidence: RegulatoryEvent[] = [];
    const readyToClose: RegulatoryEvent[] = [];
    /* Ready-to-Certify — the operational finish line.
       Instance is marked complete AND every validation item passes,
       but nobody has signed the certification yet. This is the
       bucket a surveyor-grade team watches because every item here
       is one click from Certified & Locked. */
    const readyToCertify: RegulatoryEvent[] = [];
    for (const e of instances) {
      if (store.isCertified(e.id)) continue;

      const ev = evaluations.get(e.id);
      if (!ev) continue;
      const s = ev.primary;
      if (s === 'audit-ready') { readyToCertify.push(e); continue; }

      // Ready-to-close short-circuits: validates cleanly, not complete yet.
      if (!store.isEventComplete(e.id) && isReadyToClose(e, store)) {
        readyToClose.push(e);
        continue;
      }

      if (s === 'complete-pending-approval') awaitingApproval.push(e);
      else if (s === 'complete-missing-evidence') missingEvidence.push(e);
      else if (s === 'in-progress') inProgress.push(e);
      // at-risk / blocked / overdue / not-certifiable / certified-locked
      // surface in other sections.
    }
    const byDate = (a: RegulatoryEvent, b: RegulatoryEvent) =>
      daysUntil(a.date, today) - daysUntil(b.date, today);
    return {
      inProgress:       inProgress.sort(byDate),
      awaitingApproval: awaitingApproval.sort(byDate),
      missingEvidence:  missingEvidence.sort(byDate),
      readyToClose:     readyToClose.sort(byDate),
      readyToCertify:   readyToCertify.sort(byDate),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, today, evaluations, store.completions, store.certifications]);

  /* ── 3. COMPLETION + AUDIT READINESS ── */
  const readiness = useMemo(() => {
    let completedThisPeriod = 0;
    let auditReady = 0;
    let incompleteEvidence = 0;
    let certifiedLocked = 0;
    let certifiedWithException = 0;
    let notCertifiable = 0;
    let atRisk = 0;
    let overdue = 0;
    let blocked = 0;
    let missingEvidence = 0;
    let pendingApproval = 0;
    let graceWindow = 0;

    // "This period" = 30-day rolling window ending at `today`.
    const periodStartMs = today.getTime() - 30 * 24 * 60 * 60 * 1000;

    for (const e of instances) {
      const ev = evaluations.get(e.id);
      if (!ev) continue;
      const s = ev.primary;
      if (s === 'audit-ready') auditReady += 1;
      if (s === 'complete-missing-evidence' || s === 'complete-pending-approval') incompleteEvidence += 1;
      if (s === 'complete-missing-evidence') missingEvidence += 1;
      if (s === 'complete-pending-approval') pendingApproval += 1;
      if (s === 'certified-locked') {
        certifiedLocked += 1;
        const rec = store.getCertification(e.id);
        if (rec?.disposition === 'certified-with-exception') certifiedWithException += 1;
      }
      if (s === 'not-certifiable') notCertifiable += 1;
      if (s === 'at-risk') atRisk += 1;
      if (s === 'overdue') overdue += 1;
      if (s === 'blocked') blocked += 1;
      if (ev.eligibleForGraceCertification) graceWindow += 1;

      const completion = store.completions[e.id];
      if (completion?.status === 'complete' && completion.completedAt) {
        if (new Date(completion.completedAt).getTime() >= periodStartMs) completedThisPeriod += 1;
      }
    }

    const agencyReady =
      notCertifiable === 0 && overdue === 0 && blocked === 0 &&
      missingEvidence === 0 && pendingApproval === 0;
    const reasons: string[] = [];
    if (notCertifiable)  reasons.push(`${notCertifiable} not-certifiable`);
    if (overdue)         reasons.push(`${overdue} overdue`);
    if (blocked)         reasons.push(`${blocked} blocked`);
    if (missingEvidence) reasons.push(`${missingEvidence} missing evidence`);
    if (pendingApproval) reasons.push(`${pendingApproval} pending approval`);
    if (atRisk && agencyReady) reasons.push(`Watch: ${atRisk} at-risk`);
    if (!reasons.length) reasons.push('All workflows compliant or certified');

    return {
      completedThisPeriod, auditReady, incompleteEvidence,
      certifiedLocked, certifiedWithException, notCertifiable,
      atRisk, overdue, blocked, missingEvidence, pendingApproval, graceWindow,
      agencyReady,
      reasons,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, today, evaluations, store.completions, store.certifications]);

  return (
    <div className="h-full w-full flex flex-col font-sans animate-in fade-in duration-500 px-6 md:px-10 py-5 gap-4 overflow-hidden relative z-10">

      <CommandHeader today={today} />

      <SprintSnapshotStrip onOpen={() => navigate('/calendar?view=sprint')} />

      <AgencyReadinessBanner
        ready={readiness.agencyReady}
        reasons={readiness.reasons}
        atRisk={readiness.atRisk}
        graceWindow={readiness.graceWindow}
        certifiedWithException={readiness.certifiedWithException}
        onClickNotReady={() => goAudit()}
      />

      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">

        {/* ── 1. CRITICAL ACTIONS ── */}
        <SectionShell
          title="Critical Actions"
          hint="What demands action first"
          icon={<AlertTriangle size={12} />}
          headerExtra={<HelpContextLink slug="overview" label="How this works" />}
        >
          <div className="grid grid-cols-3 gap-4 min-h-0">
            <CriticalColumn
              label="Blocked"
              color={STATE_COLOR.blocked}
              items={critical.blocked}
              today={today}
              onOpen={goInstance}
            />
            <CriticalColumn
              label="Overdue"
              color={STATE_COLOR.overdue}
              items={critical.overdue}
              today={today}
              onOpen={goInstance}
            />
            <CriticalColumn
              label="At Risk"
              color={STATE_COLOR['due-soon']}
              items={critical.atRisk}
              today={today}
              onOpen={goInstance}
              subtitle="Due ≤ 7d w/ open blockers"
            />
          </div>
        </SectionShell>

        {/* ── 2. EXECUTION PIPELINE ── */}
        <SectionShell
          title="Execution Pipeline"
          hint="Workflow lifecycle state · Ready to Certify = finish line"
          icon={<Activity size={12} />}
        >
          <div className="grid grid-cols-5 gap-3 min-h-0">
            <PipelineColumn
              label="In Progress"
              icon={<Workflow size={11} />}
              color={AUDIT_STATE_COLOR['in-progress']}
              items={pipeline.inProgress}
              today={today}
              onOpen={goInstance}
            />
            <PipelineColumn
              label="Awaiting Approval"
              icon={<BadgeCheck size={11} />}
              color={AUDIT_STATE_COLOR['complete-pending-approval']}
              items={pipeline.awaitingApproval}
              today={today}
              onOpen={goInstance}
            />
            <PipelineColumn
              label="Missing Evidence"
              icon={<FileWarning size={11} />}
              color={AUDIT_STATE_COLOR['complete-missing-evidence']}
              items={pipeline.missingEvidence}
              today={today}
              onOpen={goInstance}
            />
            <PipelineColumn
              label="Ready to Close"
              icon={<CheckCircle2 size={11} />}
              color={AUDIT_STATE_COLOR['audit-ready']}
              items={pipeline.readyToClose}
              today={today}
              onOpen={goInstance}
            />
            <PipelineColumn
              label="Ready to Certify"
              icon={<ShieldCheck size={11} />}
              color={ACTION_COLOR}
              items={pipeline.readyToCertify}
              today={today}
              onOpen={goInstance}
              actionTint
            />
          </div>
        </SectionShell>

        {/* ── 3. COMPLETION + AUDIT READINESS ── */}
        <SectionShell
          title="Completion + Audit Readiness"
          hint="Surveyor view"
          icon={<ShieldCheck size={12} />}
          dense
        >
          <div className="grid grid-cols-4 gap-3">
            <ReadinessTile
              label="Completed (30d)"
              value={readiness.completedThisPeriod}
              color={TEAL_PRIMARY}
              icon={<CheckCircle2 size={14} />}
              onClick={() => goAudit()}
            />
            <ReadinessTile
              label="Audit Ready"
              value={readiness.auditReady}
              color={AUDIT_STATE_COLOR['audit-ready']}
              icon={<ShieldCheck size={14} />}
              onClick={() => goAudit('audit-ready')}
            />
            <ReadinessTile
              label="Incomplete Evidence"
              value={readiness.incompleteEvidence}
              color={AUDIT_STATE_COLOR['complete-missing-evidence']}
              icon={<FileWarning size={14} />}
              onClick={() => goAudit('complete-missing-evidence')}
              warn={readiness.incompleteEvidence > 0}
            />
            <ReadinessTile
              label="Certified & Locked"
              value={readiness.certifiedLocked}
              color={AUDIT_STATE_COLOR['certified-locked']}
              icon={<Lock size={14} />}
              onClick={() => goAudit('certified-locked')}
            />
          </div>
          {readiness.notCertifiable > 0 && (
            <button
              onClick={() => goAudit('not-certifiable')}
              className="mt-2 self-start flex items-center gap-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-md border transition hover:brightness-110"
              style={{
                color: AUDIT_STATE_COLOR['not-certifiable'],
                background: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.35)',
              }}
            >
              <CircleAlert size={11} />
              {readiness.notCertifiable} not certifiable — requires review
              <ChevronRight size={11} />
            </button>
          )}
        </SectionShell>
      </div>

      <ToastHost />
    </div>
  );
}

/* ─── Header ──────────────────────────────────────────── */
/* ─── Agency Readiness banner (Part 2 hardening) ─────
   Top-level Ready / Not Ready signal with the reasons the
   simulation said we needed to surface. Clicking jumps to the
   Audit queue so operators can triage the backlog. */
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
  const accent = ready ? TEAL_PRIMARY : '#F97316';
  const Icon  = ready ? ShieldCheck : ShieldX;
  const label = ready ? 'Agency Readiness · Ready' : 'Agency Readiness · Not Ready';

  return (
    <button
      type="button"
      onClick={ready ? undefined : onClickNotReady}
      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-left transition-colors ${ready ? 'cursor-default' : 'cursor-pointer hover:bg-white/5'}`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${accent}55`,
        boxShadow: ready ? undefined : `0 0 0 1px ${accent}22, 0 10px 24px -14px ${accent}66`,
      }}
    >
      <span
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{ width: 34, height: 34, background: `${accent}20`, color: accent }}
      >
        <Icon size={16} strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div
          className="text-[10px] font-montserrat font-bold uppercase tracking-[0.24em] mb-0.5"
          style={{ color: accent }}
        >
          {label}
        </div>
        <div className="text-[12px] font-roboto text-white/80 truncate">
          {reasons.join(' · ')}
        </div>
      </div>
      <div className="flex items-center gap-4 text-right pr-1">
        {atRisk > 0 && (
          <ReadinessChip label="At Risk" value={atRisk} color="#F97316" />
        )}
        {graceWindow > 0 && (
          <ReadinessChip label="Grace" value={graceWindow} color="#F59E0B" />
        )}
        {certifiedWithException > 0 && (
          <ReadinessChip label="Cert w/ Exc" value={certifiedWithException} color="#A78BFA" />
        )}
      </div>
    </button>
  );
}

function ReadinessChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-end">
      <span
        className="text-[9px] font-montserrat font-bold uppercase tracking-[0.2em]"
        style={{ color: `${color}cc` }}
      >
        {label}
      </span>
      <span
        className="text-[16px] font-outfit font-semibold leading-none mt-0.5"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function CommandHeader({ today }: { today: Date }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL_PRIMARY }} />
          <span
            className="text-[10px] font-montserrat font-bold uppercase tracking-[0.28em]"
            style={{ color: TEAL_PRIMARY }}
          >
            Command Center
          </span>
        </div>
        <h1
          className="font-outfit font-light text-white leading-tight"
          style={{ fontSize: 24, letterSpacing: '-0.01em' }}
        >
          What needs action now
        </h1>
      </div>
      <div className="text-right">
        <div className="text-[9.5px] font-montserrat font-bold text-white/45 uppercase tracking-[0.18em]">Today</div>
        <div className="text-[12px] font-outfit text-white/85">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}

/* ─── Section shell ─────────────────────────────────── */
function SectionShell({
  title, hint, icon, children, dense, headerExtra,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  dense?: boolean;
  headerExtra?: React.ReactNode;
}) {
  return (
    <section className={`flex flex-col min-h-0 ${dense ? '' : 'flex-1'} gap-2`}>
      <header className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <span style={{ color: TEAL_PRIMARY }}>{icon}</span>
          <h3 className="font-montserrat font-bold text-white text-[12px] uppercase tracking-[0.18em]">
            {title}
          </h3>
          {hint && (
            <span className="text-[10px] font-roboto text-white/40">
              · {hint}
            </span>
          )}
        </div>
        {headerExtra}
      </header>
      <div className={`${dense ? '' : 'flex-1'} min-h-0`}>{children}</div>
    </section>
  );
}

/* ─── Critical / Pipeline columns share the same shell ─── */
function ColumnShell({
  label, subtitle, color, count, actionTint, children,
}: {
  label: string;
  subtitle?: string;
  color: string;
  count: number;
  actionTint?: boolean;
  children: React.ReactNode;
}) {
  const bg = actionTint ? `${color}18` : `${color}14`;
  const border = actionTint ? `${color}77` : `${color}55`;
  return (
    <div
      className="flex flex-col min-h-0 rounded-xl border overflow-hidden"
      style={{ borderColor: border }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: `${color}33`, background: bg }}
      >
        <div className="flex flex-col leading-tight">
          <span
            className="font-montserrat font-bold uppercase tracking-[0.16em]"
            style={{ fontSize: 10.5, color }}
          >
            {label}
          </span>
          {subtitle && (
            <span className="text-[8.5px] font-roboto text-white/45 normal-case tracking-normal">
              {subtitle}
            </span>
          )}
        </div>
        <span
          className="font-outfit font-light"
          style={{ fontSize: 20, color, lineHeight: 1 }}
        >
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function CriticalColumn({
  label, color, items, today, onOpen, subtitle,
}: {
  label: string;
  color: string;
  items: RegulatoryEvent[];
  today: Date;
  onOpen: (id: string) => void;
  subtitle?: string;
}) {
  return (
    <ColumnShell label={label} subtitle={subtitle} color={color} count={items.length}>
      <ul className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-white/5">
        {items.length === 0 ? (
          <EmptyRow label={label} />
        ) : (
          items.map(e => (
            <InstanceRow
              key={e.id}
              event={e}
              stateColor={color}
              today={today}
              onClick={() => onOpen(e.id)}
            />
          ))
        )}
      </ul>
    </ColumnShell>
  );
}

function PipelineColumn({
  label, icon, color, items, today, onOpen, actionTint,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  items: RegulatoryEvent[];
  today: Date;
  onOpen: (id: string) => void;
  actionTint?: boolean;
}) {
  return (
    <div
      className="flex flex-col min-h-0 rounded-xl border overflow-hidden"
      style={{ borderColor: actionTint ? `${color}77` : `${color}44` }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: `${color}22`, background: actionTint ? `${color}18` : `${color}0E` }}
      >
        <span
          className="flex items-center gap-1.5 font-montserrat font-bold uppercase tracking-[0.16em]"
          style={{ fontSize: 10.5, color }}
        >
          <span>{icon}</span>{label}
        </span>
        <span
          className="font-outfit font-light"
          style={{ fontSize: 18, color, lineHeight: 1 }}
        >
          {items.length}
        </span>
      </div>
      <ul className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-white/5">
        {items.length === 0 ? (
          <EmptyRow label={label} />
        ) : (
          items.map(e => (
            <InstanceRow
              key={e.id}
              event={e}
              stateColor={color}
              today={today}
              onClick={() => onOpen(e.id)}
            />
          ))
        )}
      </ul>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <li className="py-5 text-center">
      <p className="text-[10.5px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em]">
        No {label.toLowerCase()} instances
      </p>
    </li>
  );
}

/* ─── Instance row (shared) ─────────────────────────── */
function InstanceRow({
  event, stateColor, today, onClick, certified,
}: {
  event: RegulatoryEvent;
  stateColor: string;
  today: Date;
  onClick: () => void;
  certified?: boolean;
}) {
  const n = daysUntil(event.date, today);
  const whenLabel =
    n < 0 ? `${Math.abs(n)}d past` :
    n === 0 ? 'Today' :
    n === 1 ? 'Tomorrow' :
    n <= 14 ? `${n}d` :
    relativeLabel(event.date, today);

  return (
    <li
      onClick={onClick}
      className="group grid grid-cols-[3px_1fr_auto_auto] gap-2 items-center py-2 pl-0 pr-2.5 cursor-pointer transition-colors hover:bg-white/[0.03]"
    >
      <span className="self-stretch" style={{ background: stateColor }} />
      <div className="min-w-0 pl-2">
        <p className="font-montserrat font-bold text-white text-[11.5px] leading-tight truncate flex items-center gap-1.5">
          {certified && (
            <Lock size={10} style={{ color: AUDIT_STATE_COLOR['certified-locked'] }} />
          )}
          <span className="truncate">{event.title}</span>
        </p>
        <p className="text-[9.5px] font-roboto text-white/50 truncate flex items-center gap-1.5">
          <span className="font-mono-jb" style={{ color: `${stateColor}CC` }}>
            {event.id.replace(/^EVT-/, '')}
          </span>
          <span className="text-white/30">·</span>
          <span className="truncate">{event.owner}</span>
        </p>
      </div>
      <span
        className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em] whitespace-nowrap"
        style={{ color: stateColor }}
      >
        {whenLabel}
      </span>
      <ChevronRight size={13} className="text-white/35 group-hover:text-white transition-colors" />
    </li>
  );
}

/* ─── Readiness tile (audit-readiness section) ─────── */
function ReadinessTile({
  label, value, color, icon, onClick, warn,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
  warn?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left transition hover:brightness-110"
      style={{
        borderColor: warn ? `${color}55` : 'rgba(255,255,255,0.08)',
        background: warn ? `${color}10` : 'transparent',
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span style={{ color }}>{icon}</span>
          <span className="text-[9.5px] font-montserrat font-bold text-white/55 uppercase tracking-[0.18em] truncate">
            {label}
          </span>
        </div>
        <div
          className="font-outfit font-light leading-none mt-1 flex items-center gap-1.5"
          style={{ fontSize: 24, color, letterSpacing: '-0.01em' }}
        >
          {value}
        </div>
      </div>
      <ChevronRight size={13} className="text-white/35" />
    </button>
  );
}

/* Re-export AUDIT_STATE_LABEL so any caller importing from this file
   keeps working if the legacy export-from-dashboard pattern was used
   elsewhere. */
export { AUDIT_STATE_LABEL };

/* ═══════════════════════════════════════════════════════════════
   SprintSnapshotStrip — Command Center ↔ CES bridge
   --------------------------------------------------------------
   Reads sprint-level metrics from the shared compliance-execution
   layer so the Command Center dashboard stays a single pane of
   glass without duplicating the CES dashboard.
   ═══════════════════════════════════════════════════════════════ */
function SprintSnapshotStrip({ onOpen }: { onOpen: () => void }) {
  const snap     = useComplianceExecution();
  const rollup   = useMemo(() => selectAuditReadinessRollup(snap), [snap]);
  const critical = useMemo(() => selectCriticalUnits(snap),        [snap]);
  const sigQueue = useMemo(() => selectAwaitingSignatureUnits(snap), [snap]);
  const m = snap.sprintMetrics;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors px-4 py-3 flex items-center gap-5"
      title="Open Compliance Calendar (Sprint view)"
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.2em]"
          style={{ color: TEAL_PRIMARY }}
        >
          Active Sprint · {snap.activeSprint.label}
        </span>
      </div>
      <SnapStat label="Completion"        value={`${m.completionRatePct}%`}            color={ACTION_COLOR} />
      <SnapStat label="Audit Ready"       value={`${m.auditReadinessScore} / 100`}     color={TEAL_PRIMARY} />
      <SnapStat label="Active Blockers"   value={`${m.activeBlockerCount}`}            color={STATE_COLOR.blocked} />
      <SnapStat label="Sig SLAs Missed"   value={`${m.signatureSlasMissed}`}           color={STATE_COLOR.blocked} />
      <SnapStat label="Awaiting Sig"      value={`${sigQueue.length}`}                 color={'#F97316'} />
      <SnapStat label="Critical Units"    value={`${critical.length}`}                 color={STATE_COLOR.blocked} />
      <SnapStat label="Audit Open"        value={`${rollup.notReady + rollup.partial}`} color={'#F59E0B'} />
      <div className="ml-auto flex items-center gap-1 text-[11px] text-white/65">
        Open Sprint <ChevronRight size={12} />
      </div>
    </button>
  );
}

function SnapStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col leading-tight">
      <span
        className="text-[9px] font-montserrat font-bold uppercase tracking-[0.16em] text-white/55"
      >
        {label}
      </span>
      <span className="text-[14px] font-outfit font-light" style={{ color }}>{value}</span>
    </div>
  );
}
