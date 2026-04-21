import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon, AlertTriangle, CheckCircle2, Clock,
  ChevronLeft, ChevronRight, Filter, ShieldCheck,
  ClipboardList, FilePlus2, UploadCloud, Workflow, BadgeCheck,
  LayoutList, Columns3, ArrowRight, PlayCircle, X,
} from 'lucide-react';
import {
  REGULATORY_EVENTS,
  computeKpis,
  daysUntil,
  TODAY_ANCHOR,
  DOMAIN_PALETTE,
  type RegulatoryDomain,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { KpiTile } from '@/policy/components/regulatory/KpiTile';
import {
  DomainBadge, PolicyRef, UrgencyChip, Panel,
} from '@/policy/components/regulatory/Primitives';
import { MonthGrid } from '@/policy/components/regulatory/MonthGrid';
import { EventWorkspace } from '@/policy/components/regulatory/EventWorkspace';
import { WorkflowDrawer } from '@/policy/components/regulatory/WorkflowDrawer';
import { ToastHost, useToastStore } from '@/policy/components/regulatory/Toast';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useCalendarSyncStore } from '@/policy/stores/calendarSyncStore';
import { useAutogenStore } from '@/policy/stores/autogenStore';

/* ═══════════════════════════════════════════════════════════════
   MASTER CALENDAR — Regulatory Planner
   Month grid + filters + right rail (upcoming / quick actions /
   help) + Event Workspace (bottom) that animates in on selection.
   ═══════════════════════════════════════════════════════════════ */

type ViewMode = 'month' | 'agenda' | 'swimlane';

/* URL query filters driven from the Dashboard (e.g. ?q=overdue) */
type QueryFilter =
  | null
  | 'overdue'
  | 'due-week'
  | 'missing-evidence'
  | 'billing-risk'
  | 'governance'
  | 'complete';

const FILTER_LABELS: Record<Exclude<QueryFilter, null>, string> = {
  'overdue':          'Overdue',
  'due-week':         'Due This Week',
  'missing-evidence': 'Missing Evidence',
  'billing-risk':     'Billing At Risk',
  'governance':       'Governance',
  'complete':         'Completed',
};

export function MasterCalendarPage() {
  const today = TODAY_ANCHOR;
  const kpis = useMemo(() => computeKpis(REGULATORY_EVENTS, today), [today]);
  const [searchParams, setSearchParams] = useSearchParams();
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);

  const qParam = (searchParams.get('q') as QueryFilter) || null;
  const eventParam = searchParams.get('event');
  const workflowParam = searchParams.get('workflow');

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<ViewMode>('month');
  const [domainFilter, setDomainFilter] = useState<RegulatoryDomain | 'All'>('All');
  const [activeEventId, setActiveEventId] = useState<string | null>(eventParam || 'EVT-QAPI-MAY-001');

  /* ── React to URL changes from dashboard ── */
  useEffect(() => {
    if (eventParam && eventParam !== activeEventId) {
      setActiveEventId(eventParam);
      const target = REGULATORY_EVENTS.find(e => e.id === eventParam);
      if (target) {
        const d = new Date(target.date + 'T00:00:00');
        setYear(d.getFullYear());
        setMonth(d.getMonth());
      }
    }
  }, [eventParam]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (workflowParam === '1' && eventParam) {
      store.openWorkflow(eventParam);
      const next = new URLSearchParams(searchParams);
      next.delete('workflow');
      setSearchParams(next, { replace: true });
    }
  }, [workflowParam, eventParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearQuery = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
  };

  /* ── Apply domain + query filters (with store-aware urgency) ──
     Source = base catalog ∪ auto-generated events ∪ triggered events. */
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const allEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents],
    [generatedEvents, triggeredEvents],
  );
  const eventsWithEffectiveUrgency = useMemo(
    () => allEvents.map(e => ({ ...e, urgency: store.effectiveUrgency(e) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allEvents, store.completions],
  );

  const filteredEvents = useMemo(() => {
    let list = eventsWithEffectiveUrgency.filter(e => domainFilter === 'All' || e.domain === domainFilter);
    if (qParam === 'overdue')          list = list.filter(e => e.urgency === 'overdue' || e.urgency === 'critical');
    if (qParam === 'due-week')         list = list.filter(e => { const n = daysUntil(e.date, today); return n >= 0 && n <= 7 && e.urgency !== 'complete'; });
    if (qParam === 'missing-evidence') list = list.filter(e => e.requiredForms.some(f => store.effectiveFormStatus(e, f.id) === 'missing') || store.effectiveMinutesStatus(e) === 'missing');
    if (qParam === 'billing-risk')     list = list.filter(e => e.domain === 'Finance' || e.policyRefs.some(p => p.startsWith('CL-POC') || p.startsWith('FN-')));
    if (qParam === 'governance')       list = list.filter(e => e.domain === 'Governance' || e.domain === 'Compliance' || e.domain === 'Risk');
    if (qParam === 'complete')         list = list.filter(e => e.urgency === 'complete');
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsWithEffectiveUrgency, domainFilter, qParam, today, store.formStates, store.minutesStates]);

  const eventsThisMonth = useMemo(
    () =>
      filteredEvents.filter(e => {
        const d = new Date(e.date + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
      }),
    [filteredEvents, year, month],
  );

  const upcoming30 = useMemo(
    () =>
      REGULATORY_EVENTS.filter(e => {
        if (e.isContext) return false;
        const n = daysUntil(e.date, today);
        return n >= 0 && n <= 30;
      })
        .sort((a, b) => daysUntil(a.date, today) - daysUntil(b.date, today))
        .slice(0, 8),
    [today],
  );

  const activeEvent = useMemo(
    () => REGULATORY_EVENTS.find(e => e.id === activeEventId) || REGULATORY_EVENTS[0],
    [activeEventId],
  );

  const selectEvent = (id: string) => {
    setActiveEventId(id);
    const next = new URLSearchParams(searchParams);
    next.set('event', id);
    setSearchParams(next, { replace: true });
  };

  const startWorkflowOnActive = () => {
    if (activeEvent) {
      store.openWorkflow(activeEvent.id);
      push('info', 'Workflow started', activeEvent.title);
    }
  };

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  return (
    <div className="h-full w-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar px-6 md:px-10 pt-6 pb-10">

      {/* ── Header ────────────────────────────── */}
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
              Regulatory Execution Center · Master Calendar
            </span>
          </div>
          <h1 className="font-outfit font-light text-white leading-tight" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>
            Regulatory Planner
          </h1>
          <p className="text-[11px] font-roboto text-white/50 mt-1">
            Mandated events · trigger-based actions · required evidence · audit trail
          </p>
        </div>
        <div className="text-right flex items-start gap-3">
          <AutogenControl />
          <GoogleCalendarSyncControl />
          <div>
            <div className="text-[10px] font-montserrat font-bold text-white/45 uppercase tracking-[0.18em]">Today</div>
            <div className="text-[13px] font-outfit text-white/90">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Total Events" value={kpis.total} caption="All scheduled" icon={<CalendarIcon size={14} strokeWidth={1.75} />} accent="#FFC107" onClick={clearQuery} />
        <KpiTile label="Due This Week" value={kpis.dueThisWeek} caption="Next 7 days" trend={`+${kpis.dueThisWeekTrend} vs prior`} trendTone="up" icon={<Clock size={14} strokeWidth={1.75} />} accent="#FBBF24" onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.set('q', 'due-week'); return n; }, { replace: true })} />
        <KpiTile label="Overdue" value={kpis.overdue} caption="Requires attention" trend="Action needed" trendTone="warn" icon={<AlertTriangle size={14} strokeWidth={1.75} />} accent="#EF4444" urgent onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.set('q', 'overdue'); return n; }, { replace: true })} />
        <KpiTile label="Completed" value={`${kpis.completedPct}%`} caption="On-time completion" trend="Audit ready" trendTone="ok" icon={<CheckCircle2 size={14} strokeWidth={1.75} />} accent="#10B981" onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.set('q', 'complete'); return n; }, { replace: true })} />
      </div>

      {/* ── Active filter chip ─────────────────────── */}
      {qParam && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-montserrat font-bold text-white/45 uppercase tracking-[0.18em]">Filtered:</span>
          <button
            onClick={clearQuery}
            className="flex items-center gap-1.5 rounded-full border border-[#FFC107]/50 bg-[#FFC107]/10 px-2.5 py-1 text-[10.5px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.14em] hover:bg-[#FFC107]/15"
          >
            {FILTER_LABELS[qParam]} <X size={11} />
          </button>
          <span className="text-[10.5px] font-roboto text-white/50">{filteredEvents.length} events match</span>
        </div>
      )}

      {/* ── Main grid: Calendar + Right rail ── */}
      <div className="grid grid-cols-12 gap-4 mb-4">

        {/* Calendar panel */}
        <div className="col-span-12 xl:col-span-8 flex flex-col min-h-[640px]">
          <Panel
            accent="#FFC107"
            dense
            className="flex-1 flex flex-col"
          >
            <CalendarToolbar
              monthLabel={monthLabel}
              view={view}
              onView={setView}
              onPrev={() => shiftMonth(-1)}
              onNext={() => shiftMonth(+1)}
              onToday={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
              domainFilter={domainFilter}
              onDomainFilter={setDomainFilter}
            />
            <DomainLegend activeDomain={domainFilter} onChange={setDomainFilter} />

            <div className="mt-3 flex-1 min-h-[480px] flex">
              {view === 'month' && (
                <MonthGrid
                  year={year}
                  month={month}
                  events={eventsThisMonth}
                  activeEventId={activeEventId ?? undefined}
                  onEventClick={e => selectEvent(e.id)}
                  today={today}
                />
              )}
              {view === 'agenda' && (
                <AgendaView
                  events={qParam ? filteredEvents : eventsThisMonth}
                  activeId={activeEventId}
                  onSelect={selectEvent}
                  onStartWorkflow={id => { store.openWorkflow(id); push('info', 'Workflow started', REGULATORY_EVENTS.find(e => e.id === id)?.title || ''); }}
                />
              )}
              {view === 'swimlane' && (
                <SwimlaneView events={qParam ? filteredEvents : eventsThisMonth} activeId={activeEventId} onSelect={selectEvent} />
              )}
            </div>
          </Panel>
        </div>

        {/* Right rail */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">

          <Panel
            title={`Upcoming (Next 30 Days)`}
            icon={<CalendarIcon size={14} strokeWidth={1.75} />}
            accent="#FFC107"
            action={<HeaderLink label="View all" onClick={clearQuery} />}
            dense
          >
            <ul className="divide-y divide-white/5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              {upcoming30.map(e => (
                <UpcomingRow
                  key={e.id}
                  event={e}
                  active={e.id === activeEventId}
                  onClick={() => selectEvent(e.id)}
                  onStart={() => { store.openWorkflow(e.id); push('info', 'Workflow started', e.title); }}
                />
              ))}
              {upcoming30.length === 0 && (
                <li className="py-6 text-center">
                  <p className="font-montserrat font-bold text-white/70 text-[11.5px]">No events in the next 30 days</p>
                  <p className="text-[10px] font-roboto text-white/45 mt-1 max-w-[280px] mx-auto leading-snug">
                    The calendar is clear. Use this window to close open evidence gaps or schedule ad-hoc reviews.
                  </p>
                </li>
              )}
            </ul>
          </Panel>

          <Panel
            title="Quick Actions"
            icon={<ShieldCheck size={14} strokeWidth={1.75} />}
            accent="#FFC107"
            action={
              <span className="text-[10px] font-montserrat font-bold text-white/45 uppercase tracking-[0.14em]">
                On: {activeEvent?.title.slice(0, 20) || '—'}{(activeEvent?.title.length || 0) > 20 ? '…' : ''}
              </span>
            }
            dense
          >
            <p className="text-[10.5px] font-roboto text-white/55 leading-snug mb-2.5">
              Actions apply to the selected event ({activeEvent?.title || 'no event selected'}). Pick an event on the left to target it.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction
                icon={<CalendarIcon size={16} />}
                label="Schedule Event"
                description="Place a new mandated or ad-hoc event on the regulatory calendar."
                onClick={() => push('info', 'Schedule Event', 'Event scheduler opening…')}
              />
              <QuickAction
                icon={<Workflow size={16} />}
                label="Start Workflow"
                description="Launch the step-by-step execution drawer on this event."
                onClick={startWorkflowOnActive}
              />
              <QuickAction
                icon={<ClipboardList size={16} />}
                label="Create Task"
                description="Move the next step on this event into In Progress and notify the owner."
                onClick={() => {
                  if (!activeEvent) return;
                  const firstPending = activeEvent.processFlow.find(s => store.effectiveStepStatus(activeEvent, s.id) !== 'complete');
                  if (firstPending) {
                    store.setStepStatus(activeEvent.id, firstPending.id, 'in-progress');
                    push('success', 'Task created', `${activeEvent.title} — ${firstPending.label} started`);
                  } else {
                    push('info', 'All tasks complete', activeEvent.title);
                  }
                }}
              />
              <QuickAction
                icon={<UploadCloud size={16} />}
                label="Upload Document"
                description="Attach supporting evidence, signed forms, or finalized minutes to this event."
                onClick={() => {
                  if (!activeEvent) return;
                  const name = `${activeEvent.id}_document_${Date.now().toString().slice(-6)}.pdf`;
                  store.uploadEvidence(activeEvent.id, { name, kind: 'attachment', sizeLabel: '1.1 MB' });
                  push('success', 'Document uploaded', `${name} attached to ${activeEvent.title}`);
                }}
              />
              <QuickAction
                icon={<FilePlus2 size={16} />}
                label="Generate Report"
                description="Produce a draft event-linked report from the current workflow context."
                onClick={() => {
                  if (!activeEvent) return;
                  const name = `${activeEvent.title} — Report ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.pdf`;
                  store.generateReport(activeEvent.id, name);
                  push('success', 'Report generated', `${name} filed in evidence`);
                }}
              />
              <QuickAction
                icon={<BadgeCheck size={16} />}
                label="Request Approval"
                description="Send a sign-off request tied to this event's completion or a specific deliverable."
                onClick={() => {
                  if (!activeEvent) return;
                  store.requestApproval(activeEvent.id, 'event', `Event completion — ${activeEvent.title}`);
                  push('success', 'Approval requested', `${activeEvent.title} — pending approver decision`);
                }}
              />
            </div>
          </Panel>
        </div>
      </div>

      {/* ── Event Workspace ──────────────────── */}
      <EventWorkspace event={activeEvent} onNavigateToEvent={selectEvent} />

      <footer className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] font-roboto text-white/40">
        <span>Framework v6.0</span>
        <span>Last updated: {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </footer>

      <WorkflowDrawer event={activeEvent} />
      <ToastHost />
    </div>
  );
}

/* ─── Calendar toolbar ──────────────────────────────────── */
function CalendarToolbar({
  monthLabel, view, onView, onPrev, onNext, onToday,
  domainFilter, onDomainFilter,
}: {
  monthLabel: string;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  domainFilter: RegulatoryDomain | 'All';
  onDomainFilter: (d: RegulatoryDomain | 'All') => void;
}) {
  const views: { id: ViewMode; icon: typeof CalendarIcon; label: string }[] = [
    { id: 'month',    icon: CalendarIcon, label: 'Month' },
    { id: 'agenda',   icon: LayoutList,   label: 'Agenda' },
    { id: 'swimlane', icon: Columns3,     label: 'Swimlane' },
  ];

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
      <div className="flex items-center gap-3">
        <h3 className="font-outfit font-light text-white leading-none" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
          Master Calendar
        </h3>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
          {views.map(v => {
            const active = view === v.id;
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => onView(v.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-montserrat font-bold uppercase tracking-[0.14em] transition-colors ${
                  active ? 'bg-[#FFC107]/15 text-[#FFC107]' : 'text-white/55 hover:text-white/80'
                }`}
                style={{ fontSize: 10 }}
              >
                <Icon size={11} strokeWidth={1.75} />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05]">
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={onToday}
          className="text-[11px] font-outfit text-white/90 px-3 py-1 rounded-md border border-white/10 hover:border-[#FFC107]/40 hover:bg-white/[0.04] transition-colors"
        >
          {monthLabel}
        </button>
        <button onClick={onNext} className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05]">
          <ChevronRight size={14} />
        </button>

        <div className="h-5 w-px bg-white/10 mx-1" />

        <select
          value={domainFilter}
          onChange={e => onDomainFilter(e.target.value as RegulatoryDomain | 'All')}
          className="bg-transparent border border-white/10 rounded-md px-2 py-1 text-[11px] font-montserrat text-white/80 uppercase tracking-[0.1em] outline-none hover:border-[#FFC107]/40"
          style={{ fontSize: 10 }}
        >
          <option value="All" className="bg-[#310707] text-white">All Domains</option>
          {Object.keys(DOMAIN_PALETTE).filter(d => d !== 'Holiday').map(d => (
            <option key={d} value={d} className="bg-[#310707] text-white">{DOMAIN_PALETTE[d as RegulatoryDomain].label}</option>
          ))}
        </select>

        <button className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-white/65 hover:text-white hover:bg-white/[0.05]">
          <Filter size={11} />
          <span className="font-montserrat font-bold uppercase tracking-[0.14em]" style={{ fontSize: 10 }}>Filters</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Domain legend ────────────────────────────────────── */
function DomainLegend({
  activeDomain,
  onChange,
}: {
  activeDomain: RegulatoryDomain | 'All';
  onChange: (d: RegulatoryDomain | 'All') => void;
}) {
  const domains = Object.keys(DOMAIN_PALETTE).filter(d => d !== 'Holiday') as RegulatoryDomain[];
  return (
    <div className="flex items-center gap-3 flex-wrap mt-3 pt-3 border-t border-white/5">
      {domains.map(d => {
        const p = DOMAIN_PALETTE[d];
        const active = activeDomain === d;
        const dim = activeDomain !== 'All' && !active;
        return (
          <button
            key={d}
            onClick={() => onChange(active ? 'All' : d)}
            className="flex items-center gap-1.5 transition-opacity"
            style={{ opacity: dim ? 0.35 : 1 }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}88` }} />
            <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: active ? p.color : 'rgba(255,255,255,0.55)' }}>
              {p.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Upcoming row ────────────────────────────────────── */
function UpcomingRow({
  event, active, onClick, onStart,
}: {
  event: RegulatoryEvent;
  active?: boolean;
  onClick?: () => void;
  onStart?: () => void;
}) {
  const dom = DOMAIN_PALETTE[event.domain];
  const d = new Date(event.date + 'T00:00:00');
  return (
    <li
      onClick={onClick}
      className="group grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center py-2 pr-1 pl-1 rounded-md cursor-pointer hover:bg-white/[0.03] transition-colors"
      style={{
        background: active ? `${dom.color}14` : 'transparent',
        borderLeft: active ? `2px solid ${dom.color}` : '2px solid transparent',
      }}
    >
      <span
        className="shrink-0 w-1 h-full rounded-full min-h-[28px]"
        style={{ background: dom.color, boxShadow: `0 0 10px ${dom.color}88` }}
      />
      <div className="min-w-0">
        <p className="font-montserrat font-bold text-white text-[11.5px] leading-tight truncate">{event.title}</p>
        <p className="text-[10px] font-roboto text-white/55 truncate">
          {event.policyRefs[0] || 'CAL-' + event.id.slice(-3)} · <span style={{ color: dom.color }}>{dom.label}</span>
        </p>
      </div>
      <div className="text-right">
        <div className="text-[10.5px] font-montserrat font-bold text-[#FFC107]">
          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div className="text-[9.5px] font-roboto text-white/45">
          {event.allDay || !event.time ? 'All Day' : event.time}
        </div>
      </div>
      {onStart && (
        <button
          onClick={ev => { ev.stopPropagation(); onStart(); }}
          aria-label="Start workflow"
          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md border border-[#FFC107]/40 bg-[#FFC107]/10 flex items-center justify-center text-[#FFC107] hover:bg-[#FFC107]/20"
        >
          <PlayCircle size={12} />
        </button>
      )}
    </li>
  );
}

/* ─── Agenda view (list) ──────────────────────────────── */
function AgendaView({
  events, activeId, onSelect, onStartWorkflow,
}: {
  events: RegulatoryEvent[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onStartWorkflow?: (id: string) => void;
}) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const byDay = sorted.reduce<Record<string, RegulatoryEvent[]>>((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});
  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 min-h-0">
      {Object.keys(byDay).length === 0 && (
        <div className="flex-1 flex items-center justify-center text-[11px] font-roboto text-white/45">
          No events in this month for the selected filter.
        </div>
      )}
      {Object.entries(byDay).map(([date, list]) => {
        const d = new Date(date + 'T00:00:00');
        return (
          <div key={date} className="grid grid-cols-[72px_1fr] gap-3">
            <div className="pt-1">
              <div className="font-outfit font-light text-white leading-none" style={{ fontSize: 22 }}>
                {d.getDate()}
              </div>
              <div className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.18em] text-white/50 mt-0.5">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {list.map(e => (
                <div
                  key={e.id}
                  onClick={() => onSelect(e.id)}
                  className="group cursor-pointer rounded-lg border border-white/10 bg-transparent p-2 hover:bg-white/[0.03] transition-colors"
                  style={{ outline: activeId === e.id ? '1px solid rgba(var(--ci-accent-rgb),0.5)' : 'none' }}
                >
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <DomainBadge domain={e.domain} />
                    <UrgencyChip urgency={e.urgency} compact />
                    {e.policyRefs[0] && <PolicyRef id={e.policyRefs[0]} />}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-montserrat font-bold text-white text-[12px] truncate">{e.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10.5px] font-roboto text-white/55 whitespace-nowrap">
                        {e.allDay || !e.time ? 'All Day' : e.timeEnd ? `${e.time}–${e.timeEnd}` : e.time}
                      </span>
                      {onStartWorkflow && (
                        <button
                          onClick={ev => { ev.stopPropagation(); onStartWorkflow(e.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 rounded-md border border-[#FFC107]/40 bg-[#FFC107]/10 px-1.5 py-0.5 text-[9.5px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.14em] hover:bg-[#FFC107]/20"
                        >
                          <PlayCircle size={10} /> Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Swimlane view (domain x day) ────────────────────── */
function SwimlaneView({
  events, activeId, onSelect,
}: {
  events: RegulatoryEvent[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const domains = Object.keys(DOMAIN_PALETTE).filter(d => d !== 'Holiday') as RegulatoryDomain[];
  const domainEvents = domains.map(d => ({
    domain: d,
    list: events.filter(e => e.domain === d).sort((a, b) => a.date.localeCompare(b.date)),
  }));
  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar min-h-0 pr-2">
      {domainEvents.map(({ domain, list }) => {
        const p = DOMAIN_PALETTE[domain];
        return (
          <div key={domain} className="grid grid-cols-[110px_1fr] gap-3 py-1.5 border-b border-white/5 last:border-b-0">
            <div className="flex items-center gap-1.5">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}88` }} />
              <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: p.color }}>
                {p.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {list.length === 0 && <span className="text-[10px] font-roboto text-white/30">—</span>}
              {list.map(e => {
                const d = new Date(e.date + 'T00:00:00');
                return (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e.id)}
                    className="text-left rounded-md border px-2 py-1 hover:translate-y-[-1px] transition-transform"
                    style={{
                      background: p.soft,
                      borderColor: activeId === e.id ? p.color : p.border,
                    }}
                  >
                    <div className="text-[9px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: p.color }}>
                      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="font-montserrat font-bold text-white text-[11px] leading-tight truncate max-w-[180px]">
                      {e.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Quick action ────────────────────────────────────── */
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

/* ─── Google Calendar sync control (backend-mediated) ─────────────
   Surfaces the reachability status of the backend /api/calendar/*
   layer and lets an operator push the current in-app event set to
   Google Calendar. All calls go through the backend — this component
   NEVER touches Google directly. */
function GoogleCalendarSyncControl() {
  const status      = useCalendarSyncStore(s => s.status);
  const lastSync    = useCalendarSyncStore(s => s.lastSync);
  const lastError   = useCalendarSyncStore(s => s.lastError);
  const checkHealth = useCalendarSyncStore(s => s.checkHealth);
  const syncAll     = useCalendarSyncStore(s => s.syncAll);
  const push        = useToastStore(s => s.push);

  // Initial health check ONLY — NEVER a sync. The manual-sync contract
  // prohibits any sync-on-mount / sync-on-load side effects.
  useEffect(() => { void checkHealth(); }, [checkHealth]);

  const dotColor =
    status === 'ok'            ? '#10B981'
    : status === 'syncing'     ? '#FBBF24'
    : status === 'error'       ? '#EF4444'
    : status === 'unconfigured'? '#94A3B8'
    : '#94A3B8';

  const statusLabel =
    status === 'ok'            ? 'Google Calendar · Linked'
    : status === 'syncing'     ? 'Syncing…'
    : status === 'error'       ? `Sync error: ${lastError?.code ?? 'unknown'}`
    : status === 'unconfigured'? 'Backend unreachable'
    : 'Idle';

  const onSync = async () => {
    const ok = await checkHealth();
    if (!ok) {
      push('error', 'Google Calendar backend unreachable',
        'Start the API (npm run dev) and confirm the service-account JSON is in place.');
      return;
    }
    const r = await syncAll(REGULATORY_EVENTS);
    const failedRequired = r.failedRequired.length;
    if (r.failed === 0) {
      push('success', 'Compliance calendar synced',
        `${r.created} created · ${r.updated} updated.`);
    } else if (failedRequired > 0) {
      push('error', `${failedRequired} REQUIRED event${failedRequired === 1 ? '' : 's'} failed`,
        `${r.created} created · ${r.updated} updated · ${r.failed} failed. Review required-event errors below.`);
    } else {
      push('warn', 'Calendar partially synced',
        `${r.created} created · ${r.updated} updated · ${r.failed} failed.`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">
        <span className="block w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
        <span className="text-[9.5px] font-montserrat font-bold text-white/70 uppercase tracking-[0.14em]">
          {statusLabel}
        </span>
      </span>
      <button
        onClick={onSync}
        disabled={status === 'syncing'}
        className="rounded-md border border-[#FFC107]/40 bg-[#FFC107]/10 hover:bg-[#FFC107]/15 disabled:opacity-50 px-2.5 py-1 text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.14em]"
        title="Push all compliance events to Google Calendar. This is the only way events are synced — there is no auto-sync."
      >
        {status === 'syncing' ? 'Syncing…' : 'Sync All Compliance Events'}
      </button>
      {lastSync && (
        <div
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[9.5px] font-roboto ${
            lastSync.failedRequired.length > 0
              ? 'border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#FCA5A5]'
              : lastSync.failed > 0
                ? 'border border-[#FBBF24]/35 bg-[#FBBF24]/10 text-[#FCD34D]'
                : 'border border-white/10 bg-white/[0.03] text-white/55'
          }`}
          title={
            `Last bulk sync: ${new Date(lastSync.at).toLocaleString()}\n` +
            `${lastSync.created} created · ${lastSync.updated} updated · ${lastSync.failed} failed` +
            (lastSync.failedRequired.length > 0
              ? `\nREQUIRED failures: ${lastSync.failedRequired.join(', ')}`
              : '')
          }
        >
          <span className="font-montserrat font-bold uppercase tracking-[0.14em] text-[9px] opacity-75">Last Sync</span>
          <span>+{lastSync.created}</span>
          <span className="opacity-70">↻{lastSync.updated}</span>
          {lastSync.failed > 0 && <span>✗{lastSync.failed}</span>}
        </div>
      )}
    </div>
  );
}

/* ─── Autogen control — generate a full year of required events ───
   Executes the deterministic auto-generation engine, which produces
   the canonical regulatory calendar from the template registry.
   De-duplicates against whatever is already in the planner. */
function AutogenControl() {
  const generateYear = useAutogenStore(s => s.generateYear);
  const lastResult   = useAutogenStore(s => s.lastResult);
  const lastAt       = useAutogenStore(s => s.lastGeneratedAt);
  const clearGen     = useAutogenStore(s => s.clearGenerated);
  const push         = useToastStore(s => s.push);

  const onGenerate = () => {
    const year = TODAY_ANCHOR.getFullYear();
    const r = generateYear(year);
    push(
      r.summary.totalEmitted > 0 ? 'success' : 'warn',
      `Autogen · ${year}`,
      `${r.summary.totalEmitted} emitted · ${r.summary.totalSkipped} skipped · ${r.summary.totalConflicts} shifted.`,
    );
  };

  const count = lastResult?.summary.totalEmitted ?? 0;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onGenerate}
        className="rounded-md border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 px-2.5 py-1 text-[10px] font-montserrat font-bold text-[#C4B5FD] uppercase tracking-[0.14em]"
        title="Generate the full required event calendar for the current year from the template registry."
      >
        Generate Year
      </button>
      {count > 0 && (
        <button
          onClick={clearGen}
          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9.5px] font-montserrat text-white/60 hover:text-white/90"
          title="Remove all auto-generated events"
        >
          Clear Generated
        </button>
      )}
      {lastAt && (
        <span className="text-[9.5px] font-roboto text-white/45">
          {count} generated · {new Date(lastAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}
