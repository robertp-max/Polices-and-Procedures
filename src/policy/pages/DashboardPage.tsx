import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, FileWarning, Receipt, ShieldAlert, Stethoscope,
  Landmark, Activity, Briefcase, ShieldCheck, Flame,
  ArrowUpRight, ClipboardList, FilePlus2, UploadCloud, Workflow,
  BadgeCheck, User, ArrowRight, Ban, BellRing,
} from 'lucide-react';
import {
  REGULATORY_EVENTS,
  domainSummary,
  daysUntil,
  relativeLabel,
  TODAY_ANCHOR,
  DOMAIN_PALETTE,
  URGENCY_PALETTE,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { useComplianceKpis } from '@/policy/compliance';
import { KpiTile } from '@/policy/components/regulatory/KpiTile';
import {
  DomainBadge,
  UrgencyChip,
  PolicyRef,
  Panel,
} from '@/policy/components/regulatory/Primitives';
import { useRegulatoryExecutionStore, useAllPendingApprovalsCount } from '@/policy/stores/regulatoryExecutionStore';
import { ToastHost, useToastStore } from '@/policy/components/regulatory/Toast';
import { MandateBadge } from '@/policy/components/regulatory/EventSyncControl';
import { computeActiveReminder, REMINDER_COLORS } from '@/policy/utils/reminderEngine';
import { computeDependencyBlockStatus } from '@/policy/utils/nextDueDateEngine';

/* ═══════════════════════════════════════════════════════════════
   REGULATORY EXECUTION CENTER — Dashboard
   An action-oriented command surface. Surfaces: critical items,
   due-soon, missing evidence, upcoming governance, billing risk,
   and per-domain health.
   ═══════════════════════════════════════════════════════════════ */

export function DashboardPage() {
  const navigate = useNavigate();
  const today = TODAY_ANCHOR;
  // useComplianceKpis runs the full enforcement engine against live store state.
  // These numbers reflect actual form/step/approval completion — not static seed flags.
  const kpis = useComplianceKpis();
  const domains = useMemo(() => domainSummary(REGULATORY_EVENTS), []);
  const store = useRegulatoryExecutionStore();
  const pendingApprovals = useAllPendingApprovalsCount();
  const push = useToastStore(s => s.push);

  const [focusedDomain, setFocusedDomain] = useState<string | null>(null);

  const goFilter = (q: string) => navigate(`/calendar?q=${encodeURIComponent(q)}`);
  const goEvent  = (id: string) => navigate(`/calendar?event=${encodeURIComponent(id)}`);
  const startWorkflow = (id: string) => navigate(`/calendar?event=${encodeURIComponent(id)}&workflow=1`);

  /* ── Derived event streams ── */
  const actionable = REGULATORY_EVENTS.filter(e => !e.isContext)
    .map(e => ({ ...e, urgency: store.effectiveUrgency(e) }));
  const filtered = focusedDomain
    ? actionable.filter(e => e.domain === focusedDomain)
    : actionable;

  const critical = filtered
    .filter(e => e.urgency === 'overdue' || e.urgency === 'critical')
    .sort((a, b) => daysUntil(a.date, today) - daysUntil(b.date, today))
    .slice(0, 5);

  const dueSoon = filtered
    .filter(e => {
      const n = daysUntil(e.date, today);
      return n >= 0 && n <= 7 && e.urgency !== 'overdue';
    })
    .sort((a, b) => daysUntil(a.date, today) - daysUntil(b.date, today))
    .slice(0, 6);

  const missingEvidence = filtered
    .filter(e => e.requiredForms.some(f => f.status === 'missing') || e.minutes?.status === 'missing')
    .slice(0, 5);

  const upcomingGovernance = actionable
    .filter(e => (e.domain === 'Governance' || e.domain === 'Compliance' || e.domain === 'Risk') && daysUntil(e.date, today) >= 0)
    .sort((a, b) => daysUntil(a.date, today) - daysUntil(b.date, today))
    .slice(0, 4);

  const billingAtRisk = actionable
    .filter(e => e.domain === 'Finance' || e.policyRefs.some(p => p.startsWith('CL-POC')))
    .slice(0, 4);

  // Blocked events: urgency blocked OR has unmet dependsOn
  const blockedEvents = filtered.filter(e => {
    if (e.urgency === 'blocked') return true;
    const deps = e.dependencies?.dependsOn ?? [];
    if (!deps.length) return false;
    return deps.some(depId => {
      const dep = actionable.find(r => r.id === depId);
      return dep && dep.urgency !== 'complete';
    });
  }).slice(0, 5);

  return (
    <div className="h-full w-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar px-6 md:px-10 pt-6 pb-10">

      {/* ── Header ─────────────────────────────────── */}
      <ExecHeader today={today} />

      {/* ── KPI row ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        <KpiTile
          label="Scheduled Events"
          value={kpis.total}
          caption="Active regulatory calendar"
          icon={<CalendarIcon size={14} strokeWidth={1.75} />}
          accent="#FFC107"
          onClick={() => navigate('/calendar')}
        />
        <KpiTile
          label="Due This Week"
          value={kpis.dueThisWeek}
          caption="Action within 7 days"
          trend={`+${kpis.dueThisWeekTrend} vs last week`}
          trendTone="up"
          icon={<Clock size={14} strokeWidth={1.75} />}
          accent="#FBBF24"
          onClick={() => goFilter('due-week')}
        />
        <KpiTile
          label="Overdue"
          value={kpis.overdue}
          caption="Past deadline — survey risk"
          trend="Escalate & close"
          trendTone="warn"
          icon={<AlertTriangle size={14} strokeWidth={1.75} />}
          accent="#EF4444"
          urgent
          onClick={() => goFilter('overdue')}
        />
        <KpiTile
          label="Blocked"
          value={kpis.blocked}
          caption="Dependency or evidence gate unmet"
          trend="Resolve dependencies"
          trendTone="warn"
          icon={<Ban size={14} strokeWidth={1.75} />}
          accent="#F97316"
          onClick={() => goFilter('blocked')}
        />
        <KpiTile
          label="On-Time Completion"
          value={`${kpis.completedPct}%`}
          caption="Rolling 90-day closure rate"
          trend="Audit-ready trend"
          trendTone="ok"
          icon={<CheckCircle2 size={14} strokeWidth={1.75} />}
          accent="#10B981"
          onClick={() => goFilter('complete')}
        />
      </div>

      {/* ── Main 12-col grid ───────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* ── Left column (8) ─────────────────────── */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">

          {/* Immediate Attention */}
          <Panel
            title="Immediate Attention"
            icon={<Flame size={14} strokeWidth={1.75} />}
            accent={URGENCY_PALETTE.overdue.color}
            action={<DomainFilter value={focusedDomain} onChange={setFocusedDomain} />}
            dense
          >
            {critical.length === 0 ? (
              <EmptyList
                label="No overdue or critical items right now"
                hint="Posture is clean. Scan Due This Week and Missing Evidence to stay ahead."
              />
            ) : (
              <ul className="divide-y divide-white/5">
                {critical.map(e => (
                  <PriorityRow
                    key={e.id}
                    event={e}
                    onClick={() => goEvent(e.id)}
                    onStart={() => startWorkflow(e.id)}
                  />
                ))}
              </ul>
            )}
          </Panel>

          {/* Due This Week + Missing Evidence side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel
              title="Due This Week"
              icon={<Clock size={14} strokeWidth={1.75} />}
              accent="#FBBF24"
              action={<HeaderLink onClick={() => goFilter('due-week')} />}
              dense
            >
              {dueSoon.length === 0 ? (
                <EmptyList
                  label="Nothing due in the next 7 days"
                  hint="Queue is clear. Use this window to close open evidence gaps."
                />
              ) : (
                <ul className="space-y-1.5">
                  {dueSoon.map(e => <CompactRow key={e.id} event={e} onClick={() => goEvent(e.id)} />)}
                </ul>
              )}
            </Panel>

            <Panel
              title="Missing Evidence"
              icon={<FileWarning size={14} strokeWidth={1.75} />}
              accent="#F97316"
              action={<HeaderLink label="Resolve" onClick={() => goFilter('missing-evidence')} />}
              dense
            >
              {missingEvidence.length === 0 ? (
                <EmptyList
                  label="All required evidence is on file"
                  hint="Every scheduled event has its forms and minutes accounted for."
                />
              ) : (
                <ul className="space-y-2">
                  {missingEvidence.map(e => <MissingRow key={e.id} event={e} onClick={() => goEvent(e.id)} />)}
                </ul>
              )}
            </Panel>
          </div>

          {/* Domain health slices */}
          <Panel
            title="Domain Health"
            icon={<Workflow size={14} strokeWidth={1.75} />}
            accent="#FFC107"
            action={
              <button
                onClick={() => setFocusedDomain(null)}
                className="text-[10px] font-montserrat font-bold text-white/40 hover:text-[#FFC107] uppercase tracking-[0.14em]"
              >
                {focusedDomain ? 'Clear filter' : 'All domains'}
              </button>
            }
            dense
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {Object.entries(domains).map(([key, d]) => (
                <DomainCard
                  key={key}
                  domainKey={key}
                  data={d}
                  active={focusedDomain === key}
                  onClick={() => setFocusedDomain(focusedDomain === key ? null : key)}
                />
              ))}
            </div>
          </Panel>

          {/* Billing at Risk */}
          <Panel
            title="Billing at Risk"
            icon={<Receipt size={14} strokeWidth={1.75} />}
            accent={DOMAIN_PALETTE.Finance.color}
            action={<HeaderLink onClick={() => goFilter('billing-risk')} />}
            dense
          >
            <BillingRiskStrip events={billingAtRisk} onOpen={goEvent} />
          </Panel>
        </div>

        {/* ── Right column (4) ────────────────────── */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">

          <Panel
            title="Upcoming Governance"
            icon={<Landmark size={14} strokeWidth={1.75} />}
            accent={DOMAIN_PALETTE.Governance.color}
            action={<HeaderLink label="Open calendar" onClick={() => goFilter('governance')} />}
            dense
          >
            {upcomingGovernance.length === 0 ? (
              <EmptyList
                label="No governance events in the upcoming window"
                hint="The next Governing Body, Compliance, or Risk meeting will appear here as it enters the 30-day horizon."
              />
            ) : (
              <ul className="divide-y divide-white/5">
                {upcomingGovernance.map(e => <GovRow key={e.id} event={e} onClick={() => goEvent(e.id)} />)}
              </ul>
            )}
          </Panel>

          <Panel
            title="Blocked Events"
            icon={<Ban size={14} strokeWidth={1.75} />}
            accent="#F97316"
            action={<HeaderLink label="View all" onClick={() => goFilter('blocked')} />}
            dense
          >
            {blockedEvents.length === 0 ? (
              <EmptyList
                label="No blocked events"
                hint="All events have their dependencies and evidence requirements met."
              />
            ) : (
              <ul className="space-y-1.5">
                {blockedEvents.map(e => <BlockedRow key={e.id} event={e} allEvents={actionable} onClick={() => goEvent(e.id)} />)}
              </ul>
            )}
          </Panel>

          <Panel
            title="Quick Actions"
            icon={<ShieldCheck size={14} strokeWidth={1.75} />}
            accent="#FFC107"
            action={
              pendingApprovals > 0 ? (
                <span className="rounded-full bg-[#FBBF24]/15 border border-[#FBBF24]/40 text-[#FBBF24] px-2 py-0.5 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em]">
                  {pendingApprovals} pending
                </span>
              ) : null
            }
            dense
          >
            <p className="text-[10.5px] font-roboto text-white/55 leading-snug mb-2.5">
              Event-linked actions. Each one operates on the most relevant open event for the role you're in.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction
                icon={<CalendarIcon size={16} />}
                label="Schedule Event"
                description="Open the Regulatory Calendar to place a new mandated or ad-hoc event."
                onClick={() => navigate('/calendar')}
              />
              <QuickAction
                icon={<Workflow size={16} />}
                label="Start Workflow"
                description="Launch the step-by-step execution drawer on the highest-priority open event."
                onClick={() => {
                  const pick = actionable.find(e => e.urgency !== 'complete' && (e.urgency === 'critical' || e.urgency === 'overdue' || e.urgency === 'due-soon')) || actionable[0];
                  if (pick) startWorkflow(pick.id);
                }}
              />
              <QuickAction
                icon={<ClipboardList size={16} />}
                label="Create Task"
                description="Start the next step on the most urgent open event and assign it to the owner."
                onClick={() => {
                  const pick = actionable.find(e => e.urgency !== 'complete') || actionable[0];
                  if (pick) {
                    store.setStepStatus(pick.id, pick.processFlow[0]?.id || 's1', 'in-progress');
                    push('success', 'Task created', `${pick.title} — ${pick.processFlow[0]?.label || 'next step'} started`);
                  }
                }}
              />
              <QuickAction
                icon={<UploadCloud size={16} />}
                label="Upload Document"
                description="Attach supporting evidence, finalized minutes, or required documentation to an open event."
                onClick={() => {
                  const pick = actionable.find(e => e.requiredForms.some(f => f.status === 'missing')) || actionable[0];
                  if (pick) {
                    goEvent(pick.id);
                    push('info', 'Ready to upload', `Opening ${pick.title} — use the Evidence tab to attach a file.`);
                  }
                }}
              />
              <QuickAction
                icon={<FilePlus2 size={16} />}
                label="Generate Report"
                description="Generate an event-linked draft report using the current workflow context."
                onClick={() => {
                  const pick = actionable.find(e => e.domain === 'Compliance') || actionable.find(e => e.domain === 'Governance') || actionable[0];
                  if (pick) {
                    const name = `${pick.title} — Report ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.pdf`;
                    store.generateReport(pick.id, name);
                    push('success', 'Report generated', `${name} filed in evidence`);
                  }
                }}
              />
              <QuickAction
                icon={<BadgeCheck size={16} />}
                label="Request Approval"
                description="Send a sign-off request for event completion, minutes, or a report to an approver."
                onClick={() => {
                  const pick = actionable.find(e => e.domain === 'Governance') || actionable[0];
                  if (pick) {
                    store.requestApproval(pick.id, 'event', `Event completion — ${pick.title}`);
                    push('success', 'Approval requested', `${pick.title} — pending approver decision`);
                  }
                }}
              />
            </div>
          </Panel>

          <Panel
            title="Survey Readiness"
            icon={<ShieldAlert size={14} strokeWidth={1.75} />}
            accent="#10B981"
            dense
          >
            <SurveyReadinessGauge kpis={kpis} />
          </Panel>
        </div>
      </div>

      <ToastHost />
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────────── */
function ExecHeader({ today }: { today: Date }) {
  return (
    <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, rgba(var(--ci-accent-rgb), 0.20), rgba(var(--ci-accent-rgb), 0.05))',
              border: '1px solid rgba(var(--ci-accent-rgb), 0.4)',
            }}
          >
            <ShieldCheck size={14} className="text-[#FFC107]" />
          </span>
          <span className="text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.28em]">
            Regulatory Execution Center
          </span>
        </div>
        <h1 className="font-outfit font-light text-white leading-tight" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>
          Compliance · Quality · Governance · Operations
        </h1>
        <p className="text-[11px] font-roboto text-white/55 mt-1">
          What needs attention, what is due, what is missing, what is complete — traced from policy to evidence.
        </p>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-montserrat font-bold text-white/45 uppercase tracking-[0.18em]">Today</div>
        <div className="text-[13px] font-outfit text-white/90">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}

/* ─── Domain filter pill-group ──────────────────────────────── */
function DomainFilter({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const domains = Object.keys(DOMAIN_PALETTE).filter(d => d !== 'Holiday');
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-2.5 py-1 font-montserrat font-bold uppercase tracking-[0.14em] border transition-colors ${
          !value
            ? 'text-[#FFC107] border-[#FFC107]/50 bg-[#FFC107]/10'
            : 'text-white/45 border-white/10 hover:text-white/80 hover:border-white/20'
        }`}
        style={{ fontSize: 9 }}
      >
        All
      </button>
      {domains.map(d => {
        const p = DOMAIN_PALETTE[d as keyof typeof DOMAIN_PALETTE];
        const active = value === d;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className="rounded-full px-2 py-1 font-montserrat font-bold uppercase tracking-[0.14em] border transition-all flex items-center gap-1"
            style={{
              fontSize: 9,
              color: active ? p.color : 'rgba(255,255,255,0.5)',
              background: active ? p.soft : 'transparent',
              borderColor: active ? p.border : 'rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: p.color }} />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Priority row (critical/overdue) ───────────────────────── */
function PriorityRow({
  event, onClick, onStart,
}: {
  event: RegulatoryEvent;
  onClick: () => void;
  onStart?: () => void;
}) {
  const n = daysUntil(event.date);
  const reminder = computeActiveReminder(n);
  const reminderColor = reminder ? REMINDER_COLORS[reminder.urgencyLevel] : null;

  return (
    <li
      onClick={onClick}
      className="group grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center py-2.5 cursor-pointer"
    >
      <span
        className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
        style={{
          background: DOMAIN_PALETTE[event.domain].soft,
          border: `1px solid ${DOMAIN_PALETTE[event.domain].border}`,
        }}
      >
        {domainIcon(event.domain)}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <DomainBadge domain={event.domain} subtle />
          {event.mandateType && <MandateBadge mandateType={event.mandateType} />}
          {event.policyRefs[0] && <PolicyRef id={event.policyRefs[0]} />}
        </div>
        <p className="font-montserrat font-bold text-white text-[12.5px] leading-tight truncate">{event.title}</p>
        <p className="text-[10.5px] font-roboto text-white/55 truncate flex items-center gap-1.5">
          {event.owner} · {event.ownerRole}
          {n < 0 && <span className="text-[#EF4444] font-montserrat font-bold ml-1.5">{Math.abs(n)}d overdue</span>}
          {n >= 0 && reminder && (
            <span
              className="inline-flex items-center gap-0.5 px-1 rounded"
              style={{ color: reminderColor!.fg, background: reminderColor!.bg }}
            >
              <BellRing size={9} strokeWidth={2.5} />
              {reminder.label}
            </span>
          )}
          {n >= 0 && !reminder && <span className="text-white/50 ml-1.5">{relativeLabel(event.date)}</span>}
        </p>
      </div>
      <UrgencyChip urgency={event.urgency} />
      {onStart && (
        <button
          onClick={ev => { ev.stopPropagation(); onStart(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-[#FFC107]/40 bg-[#FFC107]/10 px-2 py-1 text-[9.5px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.14em] hover:bg-[#FFC107]/15"
        >
          Start
        </button>
      )}
      <ChevronRight size={14} className="text-white/35 group-hover:text-[#FFC107] transition-colors" />
    </li>
  );
}

/* ─── Compact row (due soon) ────────────────────────────────── */
function CompactRow({ event, onClick }: { event: RegulatoryEvent; onClick: () => void }) {
  const n = daysUntil(event.date);
  return (
    <li
      onClick={onClick}
      className="group grid grid-cols-[auto_1fr_auto] gap-2.5 items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-white/[0.03] transition-colors"
    >
      <span
        className="shrink-0 w-7 h-7 rounded-md flex flex-col items-center justify-center"
        style={{
          background: DOMAIN_PALETTE[event.domain].soft,
          border: `1px solid ${DOMAIN_PALETTE[event.domain].border}`,
          color: DOMAIN_PALETTE[event.domain].color,
        }}
      >
        <span className="font-outfit font-light leading-none" style={{ fontSize: 14 }}>
          {new Date(event.date + 'T00:00:00').getDate()}
        </span>
        <span className="font-montserrat font-bold uppercase tracking-wider" style={{ fontSize: 7 }}>
          {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
        </span>
      </span>
      <div className="min-w-0">
        <p className="font-montserrat font-bold text-white text-[11.5px] truncate">{event.title}</p>
        <p className="text-[10px] font-roboto text-white/50 truncate">
          {event.owner} · {n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `${n}d`}
        </p>
      </div>
      <ChevronRight size={12} className="text-white/35 group-hover:text-[#FFC107] transition-colors" />
    </li>
  );
}

/* ─── Missing evidence row ──────────────────────────────────── */
function MissingRow({ event, onClick }: { event: RegulatoryEvent; onClick: () => void }) {
  const missing = event.requiredForms.filter(f => f.status === 'missing');
  const minutesMissing = event.minutes?.status === 'missing';
  return (
    <li
      onClick={onClick}
      className="group flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-white/[0.03] transition-colors"
    >
      <FileWarning size={14} className="text-[#F97316] mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <DomainBadge domain={event.domain} subtle />
        </div>
        <p className="font-montserrat font-bold text-white text-[11.5px] truncate">{event.title}</p>
        <p className="text-[10px] font-roboto text-white/55 leading-snug">
          {minutesMissing && 'Minutes missing'}
          {minutesMissing && missing.length > 0 && ' · '}
          {missing.length > 0 && `${missing.length} form${missing.length > 1 ? 's' : ''} missing: ${missing.slice(0, 2).map(f => f.formId).join(', ')}`}
        </p>
      </div>
    </li>
  );
}

/* ─── Blocked event row ─────────────────────────────────────── */
function BlockedRow({
  event, allEvents, onClick,
}: {
  event: RegulatoryEvent;
  allEvents: RegulatoryEvent[];
  onClick: () => void;
}) {
  const blockStatus = computeDependencyBlockStatus(event, allEvents);
  const blockReason = blockStatus.isBlocked && blockStatus.blockedByTitles.length > 0
    ? `Waiting on: ${blockStatus.blockedByTitles.slice(0, 2).join(', ')}`
    : event.requiredForms.filter(f => f.status === 'missing').length > 0
      ? `${event.requiredForms.filter(f => f.status === 'missing').length} form(s) missing`
      : 'Dependency unmet';

  return (
    <li
      onClick={onClick}
      className="group flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-white/[0.03] transition-colors"
    >
      <Ban size={13} className="text-[#F97316] mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <DomainBadge domain={event.domain} subtle />
          {event.mandateType && <MandateBadge mandateType={event.mandateType} />}
        </div>
        <p className="font-montserrat font-bold text-white text-[11.5px] truncate">{event.title}</p>
        <p className="text-[9.5px] font-roboto text-[#F97316]/80 leading-snug truncate">{blockReason}</p>
      </div>
      <ChevronRight size={12} className="text-white/35 group-hover:text-[#F97316] transition-colors" />
    </li>
  );
}

/* ─── Domain health card ────────────────────────────────────── */
function DomainCard({
  data, active, onClick,
}: {
  domainKey: string;
  data: { total: number; overdue: number; dueSoon: number; missing: number; color: string; label: string };
  active?: boolean;
  onClick?: () => void;
}) {
  const health = data.overdue > 0 ? 'at-risk' : data.dueSoon > 0 || data.missing > 0 ? 'attention' : 'healthy';
  // Theme-aware status colors: swap amber/emerald for brand orange/teal in
  // light mode, keep legacy tints as dark-mode fallback via CSS vars.
  const healthColor = health === 'at-risk' ? '#B42318' : health === 'attention' ? '#C74601' : '#007970';
  const overdueColor   = '#B42318';
  const dueSoonColor   = '#C74601';
  const missingColor   = '#C74601';
  const cleanColor     = '#007970';
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-2.5 border transition-all"
      style={{
        background: active ? `${data.color}10` : 'transparent',
        // Use CI border token with subtle white-alpha fallback so this reads
        // correctly on both white cards (light mode) and dark glass panels.
        borderColor: active ? `${data.color}88` : 'var(--ci-border, rgba(255,255,255,0.08))',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: data.color, boxShadow: `0 0 8px ${data.color}66` }} />
          <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: data.color }}>
            {data.label}
          </span>
        </div>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: healthColor, boxShadow: `0 0 8px ${healthColor}66` }} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <span
          className="font-outfit font-light leading-none"
          style={{ fontSize: 22, color: 'var(--ci-text, #FFFFFF)' }}
        >
          {data.total}
        </span>
        <div className="flex flex-col text-right gap-0.5">
          {data.overdue > 0 && <span className="text-[9.5px] font-montserrat font-bold" style={{ color: overdueColor }}>{data.overdue} overdue</span>}
          {data.dueSoon > 0 && <span className="text-[9.5px] font-montserrat font-bold" style={{ color: dueSoonColor }}>{data.dueSoon} due soon</span>}
          {data.missing > 0 && <span className="text-[9.5px] font-montserrat font-bold" style={{ color: missingColor }}>{data.missing} gaps</span>}
          {data.overdue === 0 && data.dueSoon === 0 && data.missing === 0 && (
            <span className="text-[9.5px] font-montserrat font-bold" style={{ color: cleanColor }}>clean</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Governance row ────────────────────────────────────────── */
function GovRow({ event, onClick }: { event: RegulatoryEvent; onClick: () => void }) {
  return (
    <li
      onClick={onClick}
      className="group grid grid-cols-[1fr_auto] gap-2 items-center py-2 cursor-pointer"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <DomainBadge domain={event.domain} subtle />
        </div>
        <p className="font-montserrat font-bold text-white text-[12px] truncate">{event.title}</p>
        <p className="text-[10px] font-roboto text-white/55 truncate flex items-center gap-1">
          <User size={9} /> {event.owner}
          {event.policyRefs[0] && <> · <PolicyRef id={event.policyRefs[0]} /></>}
        </p>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-montserrat font-bold text-[#FFC107]">
          {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div className="text-[9.5px] font-roboto text-white/45">
          {event.allDay || !event.time ? 'All Day' : event.time}
        </div>
      </div>
    </li>
  );
}

/* ─── Billing risk strip ────────────────────────────────────── */
function BillingRiskStrip({ events, onOpen }: { events: RegulatoryEvent[]; onOpen?: (id: string) => void }) {
  const stats = {
    heldClaims: 14,
    unsignedPoc: 9,
    filingWatch: 3,
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      <RiskCard
        title="Claims on Hold"
        value={stats.heldClaims}
        caption="Missing physician signature"
        color="#EF4444"
        icon={<Receipt size={13} />}
      />
      <RiskCard
        title="Unsigned POCs"
        value={stats.unsignedPoc}
        caption="At 7 / 14 / 21 day gates"
        color="#F97316"
        icon={<Stethoscope size={13} />}
      />
      <RiskCard
        title="Timely Filing Watch"
        value={stats.filingWatch}
        caption="Approaching 300-day"
        color="#FBBF24"
        icon={<Clock size={13} />}
      />
      {events.length > 0 && (
        <div className="md:col-span-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
          {events.map(e => (
            <button
              key={e.id}
              onClick={() => onOpen?.(e.id)}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10.5px] font-roboto text-white/70 hover:text-white hover:border-[#FFC107]/40 hover:bg-[#FFC107]/5 transition-colors"
            >
              <ArrowUpRight size={10} className="text-[#FFC107]" />
              {e.title}
              <span className="text-white/40">· {relativeLabel(e.date)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RiskCard({
  title, value, caption, color, icon,
}: {
  title: string; value: number; caption: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="pl-3.5 py-1.5" style={{ borderLeft: `2px solid ${color}55` }}>
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]" style={{ color }}>
          {title}
        </span>
      </div>
      <div className="font-outfit font-light text-white leading-none mb-0.5" style={{ fontSize: 28, letterSpacing: '-0.015em' }}>
        {value}
      </div>
      <div className="text-[10px] font-roboto text-white/55">{caption}</div>
    </div>
  );
}

/* ─── Quick action tile ─────────────────────────────────────── */
function QuickAction({
  icon, label, description, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={description}
      className="group flex items-start gap-2 rounded-lg border border-white/10 bg-transparent p-2.5 text-left hover:border-[#FFC107]/40 hover:bg-[#FFC107]/5 transition-all"
    >
      <span className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-white/65 group-hover:text-[#FFC107] transition-colors border border-white/10 group-hover:border-[#FFC107]/40 bg-transparent group-hover:bg-[#FFC107]/10">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-montserrat font-bold text-white/85 group-hover:text-white uppercase tracking-[0.12em] leading-tight">
          {label}
        </span>
        {description && (
          <span className="block text-[9.5px] font-roboto text-white/50 group-hover:text-white/70 mt-0.5 leading-snug line-clamp-2">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

/* ─── Survey readiness mini-gauge ───────────────────────────── */
function SurveyReadinessGauge({
  kpis,
}: {
  kpis: { completedPct: number; overdue: number; missingEvidence: number; criticalCount: number };
}) {
  const score = Math.max(
    0,
    Math.min(100, 100 - kpis.overdue * 4 - kpis.missingEvidence * 2 - kpis.criticalCount * 2),
  );
  const tone = score >= 90 ? { color: '#10B981', label: 'Audit-Ready' } : score >= 75 ? { color: '#FBBF24', label: 'Needs Attention' } : { color: '#EF4444', label: 'At Risk' };

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="font-outfit font-light text-white leading-none" style={{ fontSize: 32 }}>{score}%</div>
          <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: tone.color }}>{tone.label}</div>
        </div>
        <BadgeCheck size={22} style={{ color: tone.color }} />
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, ${tone.color}, ${tone.color}88)` }}
        />
      </div>
      <ul className="space-y-1.5 text-[10.5px] font-roboto text-white/65">
        <li className="flex items-center justify-between"><span>Overdue items</span><span className="font-montserrat font-bold text-[#EF4444]">{kpis.overdue}</span></li>
        <li className="flex items-center justify-between"><span>Missing evidence</span><span className="font-montserrat font-bold text-[#F97316]">{kpis.missingEvidence}</span></li>
        <li className="flex items-center justify-between"><span>Critical events</span><span className="font-montserrat font-bold text-[#DC2626]">{kpis.criticalCount}</span></li>
      </ul>
    </div>
  );
}

/* ─── Header link ───────────────────────────────────────────── */
function HeaderLink({ onClick, label = 'View all' }: { onClick?: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-[10px] font-montserrat font-bold text-[#FFC107]/75 hover:text-[#FFC107] uppercase tracking-[0.14em]"
    >
      {label} <ArrowRight size={10} />
    </button>
  );
}

/* ─── Empty list ────────────────────────────────────────────── */
function EmptyList({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="py-5 text-center">
      <CheckCircle2 size={20} className="text-[#10B981]/60 mx-auto mb-1.5" />
      <p className="font-montserrat font-bold text-white/70 text-[11.5px]">{label}</p>
      {hint && <p className="text-[10px] font-roboto text-white/45 mt-1 max-w-[280px] mx-auto leading-snug">{hint}</p>}
    </div>
  );
}

/* ─── Domain icon helper ────────────────────────────────────── */
function domainIcon(domain: RegulatoryEvent['domain']) {
  const color = DOMAIN_PALETTE[domain].color;
  const common = { size: 14, strokeWidth: 1.75 as const, style: { color } };
  switch (domain) {
    case 'Governance':   return <Landmark {...common} />;
    case 'QAPI':         return <Activity {...common} />;
    case 'Clinical':     return <Stethoscope {...common} />;
    case 'Finance':      return <Receipt {...common} />;
    case 'IT/Security':  return <ShieldAlert {...common} />;
    case 'Operations':   return <Briefcase {...common} />;
    case 'Risk':         return <Flame {...common} />;
    case 'Compliance':   return <ShieldCheck {...common} />;
    default:             return <CalendarIcon {...common} />;
  }
}
