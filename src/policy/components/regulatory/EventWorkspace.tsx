import { useState } from 'react';
import {
  GitBranch, FileText, ClipboardCheck, BookOpen, ChevronRight,
  MapPin, User, Calendar as CalendarIcon, Clock, CheckCircle2,
  Circle, ExternalLink, ShieldCheck, Loader2, FileWarning,
  Workflow, Stamp, Paperclip, AlertTriangle, PlayCircle,
  Unlock, BadgeCheck, ArrowRight, BellRing, CalendarCheck, Ban,
} from 'lucide-react';
import {
  DOMAIN_PALETTE, URGENCY_PALETTE, formatEventDate, daysUntil, TODAY_ANCHOR,
  type RegulatoryEvent,
  REGULATORY_EVENTS,
} from '@/policy/data/regulatoryEvents';
import { computeNextDueDateFromCompletion, computeDependencyBlockStatus } from '@/policy/utils/nextDueDateEngine';
import { computeActiveReminder, REMINDER_COLORS } from '@/policy/utils/reminderEngine';
import {
  useRegulatoryExecutionStore, useEventApprovals, useEventEvidence,
  type FormStatus, type ValidationReport,
} from '@/policy/stores/regulatoryExecutionStore';
import { DomainBadge, UrgencyChip, PolicyRef, Panel } from './Primitives';
import { FormExecutionRow } from './WorkflowDrawer';
import { EvidencePanel } from './EvidencePanel';
import { ApprovalFlow } from './ApprovalFlow';
import { HelpArticleInline } from './HelpArticleView';
import { HELP_ARTICLES } from '@/policy/data/helpArticles';
import { useToastStore } from './Toast';
import { BlockerPanel } from './BlockerPanel';
import { LockBadge } from './LockBadge';
import { useEnforcementReport } from '@/policy/enforcement/useEnforcement';
import { EventSyncBadge, EventSyncControl, MandateBadge } from './EventSyncControl';

/* ═══════════════════════════════════════════════════════════════
   EventWorkspace — rich event detail surface (EXTENDED).
   Three-column layout:
     1. Event summary + completion validator + Start Workflow (left)
     2. Tabs: Flow / Forms / Minutes / Evidence / Help (center)
     3. Forms Required + Help article teaser + Approvals (right)
   ═══════════════════════════════════════════════════════════════ */

type TabId = 'flow' | 'forms' | 'minutes' | 'evidence' | 'help';

const TABS: { id: TabId; label: string; icon: typeof GitBranch }[] = [
  { id: 'flow',     label: 'Process Flow',    icon: GitBranch },
  { id: 'forms',    label: 'Forms',           icon: FileText },
  { id: 'minutes',  label: 'Meeting Minutes', icon: ClipboardCheck },
  { id: 'evidence', label: 'Evidence',        icon: Paperclip },
  { id: 'help',     label: 'Help Center',     icon: BookOpen },
];

export interface EventWorkspaceProps {
  event: RegulatoryEvent;
  layout?: 'row' | 'stack';
  onNavigateToEvent?: (id: string) => void;
}

export function EventWorkspace({ event, layout = 'row', onNavigateToEvent }: EventWorkspaceProps) {
  const [tab, setTab] = useState<TabId>('flow');
  const dom = DOMAIN_PALETTE[event.domain];
  const evidenceCount = useEventEvidence(event.id).length;
  const approvalsCount = useEventApprovals(event.id).length;

  return (
    <div className={`grid ${layout === 'row' ? 'grid-cols-12' : 'grid-cols-1'} gap-4`}>
      {/* ── Event summary + validator ── */}
      <div className={layout === 'row' ? 'col-span-3' : ''}>
        <div className="flex flex-col gap-4">
          <EventSummary event={event} />
          <EventSyncControl event={event} />
          <CompletionValidatorCard event={event} />
          <EnforcementBlockerCard event={event} />
        </div>
      </div>

      {/* ── Process-flow tabs ── */}
      <div className={layout === 'row' ? 'col-span-5' : ''}>
        <Panel accent={dom.color} dense>
          <div className="flex items-center gap-1 border-b border-white/10 pb-2 mb-3 overflow-x-auto scrollbar-none">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              const count =
                t.id === 'forms'    ? event.requiredForms.length :
                t.id === 'minutes'  ? (event.minutes ? 1 : 0) :
                t.id === 'flow'     ? event.processFlow.length :
                t.id === 'evidence' ? evidenceCount :
                                      1;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap ${
                    active ? 'text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                  style={{ background: active ? 'rgba(var(--ci-accent-rgb),0.10)' : 'transparent' }}
                >
                  <Icon size={13} strokeWidth={1.75} />
                  <span className="font-montserrat font-bold uppercase tracking-[0.12em]" style={{ fontSize: 10.5 }}>
                    {t.label}
                  </span>
                  {count > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 font-montserrat font-bold"
                      style={{
                        fontSize: 9,
                        background: active ? 'rgba(var(--ci-accent-rgb),0.2)' : 'rgba(255,255,255,0.06)',
                        color: active ? '#FFC107' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-2 -bottom-[9px] h-[2px] rounded-t"
                      style={{ background: 'var(--ci-gold)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="min-h-[240px]">
            {tab === 'flow'     && <ProcessFlowView event={event} />}
            {tab === 'forms'    && <FormsView event={event} />}
            {tab === 'minutes'  && <MinutesView event={event} />}
            {tab === 'evidence' && <EvidencePanel event={event} />}
            {tab === 'help'     && <HelpArticleInline event={event} onNavigateToEvent={onNavigateToEvent} />}
          </div>
        </Panel>
      </div>

      {/* ── Forms required + Help article + Approvals ── */}
      <div className={layout === 'row' ? 'col-span-4 flex flex-col gap-4' : 'flex flex-col gap-4'}>
        <FormsRequired event={event} />
        {event.helpArticle && <HelpCard event={event} />}
        <Panel
          title="Approvals"
          icon={<Stamp size={14} strokeWidth={1.75} />}
          accent="#FFC107"
          action={
            approvalsCount > 0 ? (
              <span className="text-[10px] font-montserrat font-bold text-white/45 uppercase tracking-[0.14em]">{approvalsCount} total</span>
            ) : null
          }
          dense
        >
          <ApprovalFlow event={event} compact />
        </Panel>
      </div>
    </div>
  );
}

/* ─── Event summary panel (extended) ────────────────── */
function EventSummary({ event }: { event: RegulatoryEvent }) {
  const dom = DOMAIN_PALETTE[event.domain];
  const store = useRegulatoryExecutionStore();
  const effectiveUrgency = store.effectiveUrgency(event);
  const completion = store.completions[event.id];

  // Next due date — computed from completion date or event date
  const nextDue = computeNextDueDateFromCompletion(event, completion?.completedAt ?? null);

  // Active reminder window
  const daysAway = daysUntil(event.date, TODAY_ANCHOR);
  const reminder = computeActiveReminder(daysAway);
  const reminderColor = reminder ? REMINDER_COLORS[reminder.urgencyLevel] : null;

  // Dependency block status
  const blockStatus = computeDependencyBlockStatus(event, REGULATORY_EVENTS);

  const rows: { label: string; value: React.ReactNode; icon?: React.ReactNode }[] = [
    { label: 'Date',      value: <>{formatEventDate(event.date)}{event.endDate && ` – ${formatEventDate(event.endDate)}`}</>, icon: <CalendarIcon size={11} /> },
    { label: 'Time',      value: event.allDay || !event.time ? 'All Day' : (event.timeEnd ? `${event.time} – ${event.timeEnd}` : event.time), icon: <Clock size={11} /> },
    { label: 'Frequency', value: event.cadence },
    ...(event.location ? [{ label: 'Location',  value: event.location, icon: <MapPin size={11} /> }] : []),
    { label: 'Owner',     value: <>{event.owner}<span className="text-white/40"> · {event.ownerRole}</span></>, icon: <User size={11} /> },
    { label: 'Policy',    value: (
        <div className="flex flex-wrap gap-1">
          {event.policyRefs.length > 0
            ? event.policyRefs.map(p => <PolicyRef key={p} id={p} />)
            : <span className="text-white/35">—</span>}
        </div>
      )},
    // Next due date row — only for recurring events
    ...(nextDue ? [{
      label: 'Next Due',
      value: (
        <span className="flex items-center gap-1 text-[#10B981]">
          <CalendarCheck size={10} />
          {nextDue.label}
        </span>
      ),
      icon: <CalendarCheck size={11} />,
    }] : []),
  ];

  return (
    <Panel accent={dom.color} dense>
      {/* Reminder banner — shown when event is within 60-day window */}
      {reminder && reminderColor && (
        <div
          className="flex items-start gap-2 px-2.5 py-2 rounded-md mb-3 text-[10.5px] font-roboto leading-snug"
          style={{
            background: reminderColor.bg,
            border: `1px solid ${reminderColor.border}`,
            color: reminderColor.fg,
          }}
        >
          <BellRing size={12} className="shrink-0 mt-0.5" style={{ color: reminderColor.fg }} />
          <div>
            <span className="font-montserrat font-bold">{reminder.label}</span>
            <span className="text-white/60 ml-1.5">{reminder.message}</span>
          </div>
        </div>
      )}

      {/* Dependency block banner */}
      {blockStatus.isBlocked && (
        <div className="flex items-start gap-2 px-2.5 py-2 rounded-md mb-3 text-[10.5px] font-roboto leading-snug"
          style={{
            background: 'rgba(249,115,22,0.08)',
            border: '1px solid rgba(249,115,22,0.30)',
            color: '#F97316',
          }}
        >
          <Ban size={12} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-montserrat font-bold">Blocked</span>
            <span className="text-white/60 ml-1.5">
              Waiting on: {blockStatus.blockedByTitles.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: dom.soft, border: `1px solid ${dom.border}` }}
        >
          <CalendarIcon size={16} style={{ color: dom.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <DomainBadge domain={event.domain} />
            <MandateBadge mandateType={event.mandateType} />
            <LockBadge eventId={event.id} />
            <EventSyncBadge event={event} />
          </div>
          <h4 className="font-montserrat font-bold text-white text-[14px] leading-tight truncate">
            {event.title}
          </h4>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-white/10">
        {rows.map(r => (
          <div key={r.label} className="grid grid-cols-[70px_1fr] gap-2 items-start">
            <span className="flex items-center gap-1 text-[10px] font-montserrat font-bold text-white/40 uppercase tracking-[0.14em] pt-0.5">
              {r.icon && <span className="text-white/35">{r.icon}</span>}
              {r.label}
            </span>
            <span className="text-[11.5px] font-roboto text-white/80 leading-snug">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] font-montserrat font-bold text-white/40 uppercase tracking-[0.14em]">Status</span>
        <UrgencyChip urgency={effectiveUrgency} />
      </div>

      {completion?.completedAt && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-roboto text-[#10B981]">
          <BadgeCheck size={11} />
          Completed {new Date(completion.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} by {completion.completedBy}
        </div>
      )}

      {/* Success state: next due date after completion */}
      {completion?.completedAt && nextDue && (
        <div className="mt-2 p-2 rounded-md flex items-center gap-1.5 text-[10px] font-roboto"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
        >
          <CalendarCheck size={11} />
          <span>
            <span className="font-montserrat font-bold">Next due: </span>
            {nextDue.label}
          </span>
        </div>
      )}

      {event.regulatoryDriver && (
        <div className="mt-3 p-2.5 rounded-md border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck size={10} className="text-[#FFC107]" />
            <span className="text-[9px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.16em]">Regulatory Driver</span>
          </div>
          <p className="text-[10.5px] font-roboto text-white/60 leading-snug">{event.regulatoryDriver}</p>
        </div>
      )}
    </Panel>
  );
}

/* ─── Completion validator card (NEW) ────────────────── */
function CompletionValidatorCard({ event }: { event: RegulatoryEvent }) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const report = store.validateEvent(event);
  const complete = store.isEventComplete(event.id);
  const progressPct = Math.round(
    ((report.progress.stepsComplete + report.progress.formsComplete + (report.progress.minutesRequired ? (report.progress.minutesFinalized ? 1 : 0) : 0)) /
      Math.max(1, report.progress.stepsTotal + report.progress.formsTotal + (report.progress.minutesRequired ? 1 : 0))) * 100,
  );

  return (
    <Panel
      accent={complete ? '#10B981' : report.canComplete ? '#FFC107' : '#EF4444'}
      dense
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 group">
          <Workflow size={12} className="text-[#FFC107] icon-interactive" />
          <h4 className="font-montserrat font-bold text-white text-[11.5px] uppercase tracking-[0.14em] icon-interactive">
            Workflow
          </h4>
        </div>
        <span className="text-[10px] font-montserrat font-bold text-white/60 uppercase tracking-[0.14em]">
          {progressPct}%
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: complete
              ? 'linear-gradient(90deg, #10B981, #10B98188)'
              : 'linear-gradient(90deg, rgba(var(--ci-accent-rgb), 1), rgba(var(--ci-accent-rgb), 0.55))',
          }}
        />
      </div>

      <ul className="space-y-1 mb-3">
        <ValidatorItem ok={report.progress.stepsComplete === report.progress.stepsTotal && report.progress.stepsTotal > 0} label={`${report.progress.stepsComplete}/${report.progress.stepsTotal} workflow steps`} />
        <ValidatorItem ok={report.progress.formsComplete === report.progress.formsTotal} label={`${report.progress.formsComplete}/${report.progress.formsTotal} required forms`} />
        <ValidatorItem ok={!report.progress.minutesRequired || report.progress.minutesFinalized} label={report.progress.minutesRequired ? 'Meeting minutes finalized' : 'Minutes not required'} />
        <ValidatorItem ok={!report.blockers.some(b => b.kind === 'approval')} label="No pending approvals" />
      </ul>

      {!complete && (
        <p className="text-[10px] font-roboto leading-snug mb-2.5" style={{ color: report.canComplete ? '#10B981' : 'rgba(255,255,255,0.55)' }}>
          {report.canComplete
            ? 'All required workflow steps, forms, and evidence are complete. This event is ready to be marked complete and filed for audit review.'
            : humanBlockerMessage(report)}
        </p>
      )}

      {complete && (
        <p className="text-[10px] font-roboto text-[#10B981]/90 leading-snug mb-2.5">
          This event is fully documented and ready for audit review.
        </p>
      )}

      {!complete ? (
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => store.openWorkflow(event.id)}
            className="w-full rounded-md border border-[#FFC107]/50 bg-[#FFC107]/15 text-[#FFC107] hover:bg-[#FFC107]/25 py-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5"
          >
            <PlayCircle size={12} /> Start Workflow
          </button>
          <button
            disabled={!report.canComplete}
            onClick={() => {
              const r = store.markEventComplete(event);
              r.ok ? push('success', 'Event completed', event.title) : push('error', 'Cannot complete', r.message);
            }}
            className="w-full rounded-md border py-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-colors disabled:cursor-not-allowed"
            style={{
              borderColor: report.canComplete ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.10)',
              background: report.canComplete ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
              color: report.canComplete ? '#10B981' : 'rgba(255,255,255,0.35)',
            }}
          >
            <CheckCircle2 size={12} />
            {report.canComplete ? 'Mark Event Complete' : `${report.blockers.length} blocker${report.blockers.length === 1 ? '' : 's'}`}
          </button>
        </div>
      ) : (
        <button
          onClick={() => { store.reopenEvent(event.id); push('warn', 'Event reopened', event.title); }}
          className="w-full rounded-md border border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FBBF24] hover:bg-[#FBBF24]/15 py-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5"
        >
          <Unlock size={12} /> Reopen Event
        </button>
      )}
    </Panel>
  );
}

/* ─── Enforcement / blocker panel ─────────────────────── */
function EnforcementBlockerCard({ event }: { event: RegulatoryEvent }) {
  const report = useEnforcementReport(event);
  const push = useToastStore(s => s.push);
  // Hide when there is literally nothing to show AND the event is already ready.
  if (
    report.canComplete &&
    report.blockers.length === 0 &&
    report.warnings.length === 0 &&
    report.timelineIssues.length === 0 &&
    !report.isLocked
  ) {
    return null;
  }
  return (
    <Panel accent="#EF4444" dense>
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle size={12} className="text-[#EF4444]" />
        <h4 className="font-montserrat font-bold text-white text-[11.5px] uppercase tracking-[0.14em]">
          Enforcement Check
        </h4>
      </div>
      <BlockerPanel
        report={report}
        onUnlock={() => push('warn', 'Unlock requires elevated role', `This event can only be unlocked by ${report.isLocked ? 'an administrator' : 'an authorized role'}.`)}
      />
    </Panel>
  );
}

function humanBlockerMessage(report: ValidationReport): string {
  const parts: string[] = [];
  const stepsOpen = report.progress.stepsTotal - report.progress.stepsComplete;
  const formsOpen = report.progress.formsTotal - report.progress.formsComplete;
  if (stepsOpen > 0)  parts.push(`${stepsOpen} workflow step${stepsOpen > 1 ? 's' : ''} remain${stepsOpen === 1 ? 's' : ''} incomplete`);
  if (formsOpen > 0)  parts.push(`${formsOpen} required form${formsOpen > 1 ? 's' : ''} must be completed`);
  if (report.progress.minutesRequired && !report.progress.minutesFinalized) parts.push('meeting minutes are still missing');
  const pending = report.blockers.filter(b => b.kind === 'approval').length;
  if (pending > 0) parts.push(`${pending} approval request${pending > 1 ? 's are' : ' is'} still pending`);
  if (parts.length === 0) return 'Resolve the items above before closing this event.';
  return parts.join(' · ') + '.';
}

function ValidatorItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-[10.5px] font-roboto">
      {ok
        ? <CheckCircle2 size={10} className="text-[#10B981] shrink-0" />
        : <Circle size={10} className="text-[#EF4444] shrink-0" />}
      <span className={ok ? 'text-white/80' : 'text-white/55'}>{label}</span>
    </li>
  );
}

/* ─── Process flow (interactive) ─────────────────────── */
function ProcessFlowView({ event }: { event: RegulatoryEvent }) {
  const store = useRegulatoryExecutionStore();
  const locked = store.isEventComplete(event.id);
  const push = useToastStore(s => s.push);

  if (event.processFlow.length === 0) {
    return (
      <EmptyState
        icon={<GitBranch size={18} />}
        label="No step-by-step workflow defined"
        hint="This event type doesn't ship a structured workflow yet. Use the Forms and Evidence tabs to capture required artifacts for audit readiness."
      />
    );
  }
  const completed = event.processFlow.filter(s => store.effectiveStepStatus(event, s.id) === 'complete').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-montserrat font-bold text-white text-[12.5px] uppercase tracking-[0.14em]">
          {event.title} Workflow
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-montserrat font-bold text-white/40 uppercase tracking-[0.14em]">
            {completed} / {event.processFlow.length} Complete
          </span>
          {!locked && (
            <button
              onClick={() => store.openWorkflow(event.id)}
              className="flex items-center gap-1 rounded-md border border-[#FFC107]/40 bg-[#FFC107]/10 px-2 py-0.5 text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.14em] hover:bg-[#FFC107]/15"
            >
              <PlayCircle size={10} /> Run
            </button>
          )}
        </div>
      </div>
      <ol className="space-y-2">
        {event.processFlow.map((step, idx) => {
          const status = store.effectiveStepStatus(event, step.id);
          const dueDate = new Date(new Date(event.date + 'T00:00:00').getTime() + step.dueOffsetDays * 86_400_000);
          const dueLabel = step.dueOffsetDays === 0 ? `Due: ${formatEventDate(event.date)}` : `Due: ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          const chip =
            status === 'complete'    ? { color: '#10B981', label: 'Completed',   icon: <CheckCircle2 size={11} /> } :
            status === 'in-progress' ? { color: '#FBBF24', label: 'In Progress', icon: <Loader2 size={11} className="animate-spin" /> } :
                                       { color: 'rgba(255,255,255,0.4)', label: 'Pending', icon: <Circle size={11} /> };

          return (
            <li key={step.id} className="flex gap-2.5 p-2.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <button
                onClick={() => {
                  if (locked) return;
                  const next = status === 'complete' ? 'in-progress' : status === 'in-progress' ? 'complete' : 'in-progress';
                  store.setStepStatus(event.id, step.id, next);
                  push('success', next === 'complete' ? 'Step completed' : next === 'in-progress' ? 'Step started' : 'Step reopened', step.label);
                }}
                aria-label={status === 'complete' ? 'Reopen step' : 'Complete step'}
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-montserrat font-bold transition-transform hover:scale-105"
                style={{
                  background: status === 'complete' ? 'rgba(16,185,129,0.18)' : status === 'in-progress' ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${status === 'complete' ? 'rgba(16,185,129,0.45)' : status === 'in-progress' ? 'rgba(251,191,36,0.45)' : 'rgba(255,255,255,0.14)'}`,
                  color: status === 'complete' ? '#10B981' : status === 'in-progress' ? '#FBBF24' : 'rgba(255,255,255,0.55)',
                  fontSize: 10,
                }}
              >
                {status === 'complete' ? <CheckCircle2 size={12} /> : idx + 1}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-montserrat font-bold text-white text-[12px] leading-tight mb-0.5">{step.label}</p>
                    <p className="font-roboto text-white/55 text-[10.5px] leading-snug">{step.description}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-roboto text-white/45 whitespace-nowrap">{dueLabel}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[9.5px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: chip.color }}>
                  {chip.icon}
                  {chip.label}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ─── Forms view (interactive) ───────────────────────── */
function FormsView({ event }: { event: RegulatoryEvent }) {
  if (event.requiredForms.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={18} />}
        label="No required forms for this event"
        hint="If this event produced any artifact (signed memo, completed checklist, external report), attach it on the Evidence tab so it stays with the audit record."
      />
    );
  }
  return (
    <div>
      <p className="text-[10.5px] font-roboto text-white/55 leading-snug mb-2">
        Open, upload, or finalize each required form. Each row links to the form's purpose and completion status.
      </p>
      <ul className="space-y-1.5">
        {event.requiredForms.map(f => <FormExecutionRow key={f.id} event={event} formId={f.id} label={f.label} formRefId={f.formId} />)}
      </ul>
    </div>
  );
}

/* ─── Minutes view (interactive) ─────────────────────── */
function MinutesView({ event }: { event: RegulatoryEvent }) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const status = store.effectiveMinutesStatus(event);
  const locked = store.isEventComplete(event.id);

  if (!event.minutes || !status) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={18} />}
        label="No meeting minutes required"
        hint="This event doesn't require formal minutes. If a decision record exists, upload it as evidence instead."
      />
    );
  }

  const tone =
    status === 'finalized' ? URGENCY_PALETTE.complete :
    status === 'draft'     ? URGENCY_PALETTE['due-soon'] :
                             URGENCY_PALETTE.overdue;

  return (
    <div className="p-3 rounded-lg border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-montserrat font-bold text-white text-[12.5px] uppercase tracking-[0.14em]">Meeting Minutes</h4>
        <span
          className="rounded-full px-2 py-0.5 font-montserrat font-bold uppercase tracking-[0.14em]"
          style={{ fontSize: 10, background: `${tone.color}1f`, color: tone.color, border: `1px solid ${tone.color}55` }}
        >
          {status === 'missing' ? 'Missing' : status === 'draft' ? 'Draft In Progress' : 'Finalized'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px] font-roboto text-white/70 mb-3">
        <div>
          <div className="text-[10px] font-montserrat font-bold text-white/40 uppercase tracking-[0.14em] mb-1">Draft Due</div>
          <div>Within 7 calendar days of event</div>
        </div>
        <div>
          <div className="text-[10px] font-montserrat font-bold text-white/40 uppercase tracking-[0.14em] mb-1">Assignee</div>
          <div>{event.minutes.assignee || '—'}</div>
        </div>
      </div>

      {status === 'missing' && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[10.5px] text-red-300">
          <FileWarning size={12} />
          Missing minutes creates a survey-ready gap. Initiate draft within the 7-day window.
        </div>
      )}

      {!locked && (
        <div className="flex gap-1.5 flex-wrap">
          <ActionBtn active={status === 'draft'}     color="#FBBF24" onClick={() => { store.setMinutesStatus(event.id, 'draft'); push('success', 'Minutes draft started'); }}>
            Start Draft
          </ActionBtn>
          <ActionBtn active={status === 'finalized'} color="#10B981" onClick={() => { store.setMinutesStatus(event.id, 'finalized'); push('success', 'Minutes finalized'); }}>
            Finalize
          </ActionBtn>
          <ActionBtn active={status === 'missing'}   color="#EF4444" onClick={() => { store.setMinutesStatus(event.id, 'missing'); push('warn', 'Minutes flagged missing'); }}>
            Flag Missing
          </ActionBtn>
          <ActionBtn color="#FFC107" onClick={() => {
            const name = `${event.title} – Minutes ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.pdf`;
            store.uploadEvidence(event.id, { name, kind: 'minutes', sizeLabel: '420 KB' });
            store.setMinutesStatus(event.id, 'finalized');
            push('success', 'Minutes uploaded & finalized', name);
          }}>
            Upload Minutes
          </ActionBtn>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ children, color, active, onClick }: { children: React.ReactNode; color: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-[0.12em] border transition-colors"
      style={{
        color: active ? color : 'rgba(255,255,255,0.75)',
        borderColor: active ? `${color}99` : 'rgba(255,255,255,0.12)',
        background: active ? `${color}18` : 'transparent',
      }}
    >
      {children}
    </button>
  );
}

/* ─── Forms Required side card (interactive) ────────── */
function FormsRequired({ event }: { event: RegulatoryEvent }) {
  const store = useRegulatoryExecutionStore();
  const total = event.requiredForms.length;
  const complete = event.requiredForms.filter(f => store.effectiveFormStatus(event, f.id) === 'complete').length;
  return (
    <Panel
      title="Forms Required"
      icon={<FileText size={14} strokeWidth={1.75} />}
      accent="#FFC107"
      action={
        <span className="text-[10px] font-montserrat font-bold text-white/45 uppercase tracking-[0.14em]">
          {complete} / {total}
        </span>
      }
      dense
    >
      {total === 0 ? (
        <EmptyState
          icon={<FileText size={16} />}
          label="No forms required"
          hint="Upload any supporting artifact on the Evidence tab."
        />
      ) : (
        <ul className="space-y-1.5">
          {event.requiredForms.map(f => <FormExecutionRow key={f.id} event={event} formId={f.id} label={f.label} formRefId={f.formId} />)}
        </ul>
      )}
    </Panel>
  );
}

/* ─── Help side card ──────────────────────────────── */
function HelpCard({ event }: { event: RegulatoryEvent }) {
  const h = event.helpArticle!;
  // Use the rich structured article if we ship one, otherwise fall back to event.helpArticle meta.
  const rich = h?.id ? HELP_ARTICLES[h.id] : undefined;
  return (
    <Panel
      title="Knowledge Article"
      icon={<BookOpen size={14} strokeWidth={1.75} />}
      accent="#FFC107"
      action={
        <span className="text-[10px] font-montserrat font-bold text-[#FFC107]/70 uppercase tracking-[0.14em] flex items-center gap-1">
          Help Center <ExternalLink size={10} />
        </span>
      }
      dense
    >
      <div>
        <p className="font-montserrat font-bold text-white text-[12.5px] mb-1">{rich?.title || h.title}</p>
        {rich?.subtitle && <p className="text-[10px] font-roboto text-white/55 mb-1.5">{rich.subtitle}</p>}
        {event.policyRefs[0] && (
          <p className="text-[10px] font-roboto text-white/55 mb-2 flex items-center gap-1">
            Policy <PolicyRef id={event.policyRefs[0]} />
          </p>
        )}
        <p className="text-[10.5px] font-roboto text-white/60 leading-snug mb-2.5">
          {rich?.purpose
            || `Operating reference for running this ${event.domain} event consistently — preparation, execution, documentation, and audit evidence.`}
        </p>
        <div className="text-[9.5px] font-montserrat font-bold text-white/40 uppercase tracking-[0.14em] mb-1.5">What you'll find in the full article</div>
        <ul className="space-y-1">
          {(rich
            ? [
                'Purpose and when this process is required',
                'Who is responsible and the step sequence',
                'Forms and outputs required for each step',
                'Common mistakes to avoid',
                'Audit tips and related policies',
              ]
            : h.topics.slice(0, 5)
          ).map(t => (
            <li key={t} className="flex items-start gap-1.5 text-[11px] font-roboto text-white/75">
              <CheckCircle2 size={10} className="text-[#10B981] shrink-0 mt-0.5" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* ─── Empty state ───────────────────────────────── */
function EmptyState({ icon, label, hint }: { icon: React.ReactNode; label: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="text-white/25 mb-2">{icon}</span>
      <p className="text-[11px] font-roboto text-white/60 font-montserrat font-bold">{label}</p>
      {hint && <p className="text-[10px] font-roboto text-white/40 mt-1 max-w-[260px] leading-snug">{hint}</p>}
    </div>
  );
}

/* silence unused types if introduced later */
void ChevronRight; void AlertTriangle; void ArrowRight;
export type { FormStatus };
