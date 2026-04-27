import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Zap, Sparkles,
} from 'lucide-react';
import {
  REGULATORY_EVENTS, TODAY_ANCHOR, type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useAutogenStore, type SchedulingPreview } from '@/policy/stores/autogenStore';
import { ToastHost } from '@/policy/components/regulatory/Toast';
import { useToastStore } from '@/policy/components/regulatory/Toast';
import { TimelineMonth } from '@/policy/components/regulatory/TimelineMonth';
import { WorkflowExecutionPanel } from '@/policy/components/regulatory/WorkflowExecutionPanel';
import {
  TEAL_PRIMARY, ACTION_COLOR, STATE_COLOR, classifyInstance,
} from '@/policy/components/regulatory/timelineState';
import { SprintTaskPanel } from '@/policy/ces/components/details/SprintTaskPanel';
import { useComplianceExecution } from '@/policy/compliance-execution';

/* ═══════════════════════════════════════════════════════════════
   EXECUTION TIMELINE
   --------------------------------------------------------------
   Not a calendar. A control surface over the workflow system.
   Every item on the grid is a projection of a workflow instance:

     { workflowId, currentStep, status, SLA, formsRequired,
       approvals, riskLevel }

   Layout:
     left  (70%) — month grid of workflow instances
     right (30%) — execution panel bound to the active instance

   Color ONLY encodes state: red · amber · teal. Clicking an
   instance opens its execution panel inline.
   ═══════════════════════════════════════════════════════════════ */

export function MasterCalendarPage() {
  const today = TODAY_ANCHOR;
  const [searchParams, setSearchParams] = useSearchParams();
  const store = useRegulatoryExecutionStore();

  const eventParam = searchParams.get('event');
  const workflowParam = searchParams.get('workflow');

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [activeId, setActiveId] = useState<string | null>(eventParam);

  /* ── All workflow instances (base + autogen + triggered) ── */
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const allInstances = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents]
      .filter(e => !e.isContext),
    [generatedEvents, triggeredEvents],
  );

  /* ── Scope to current month view ── */
  const monthInstances = useMemo(
    () => allInstances.filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [allInstances, year, month],
  );

  /* ── Active instance resolution ── */
  const activeInstance: RegulatoryEvent | null = useMemo(() => {
    if (activeId) {
      const match = allInstances.find(e => e.id === activeId);
      if (match) return match;
    }
    // Prefer an instance in the visible month; otherwise first overall.
    return monthInstances[0] ?? allInstances[0] ?? null;
  }, [activeId, allInstances, monthInstances]);

  /* ── React to URL (Dashboard → Timeline deep link) ── */
  useEffect(() => {
    if (eventParam && eventParam !== activeId) {
      setActiveId(eventParam);
      const target = allInstances.find(e => e.id === eventParam);
      if (target) {
        const d = new Date(target.date + 'T00:00:00');
        setYear(d.getFullYear());
        setMonth(d.getMonth());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventParam]);

  useEffect(() => {
    if (workflowParam === '1' && eventParam) {
      store.openWorkflow(eventParam);
      const next = new URLSearchParams(searchParams);
      next.delete('workflow');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowParam, eventParam]);

  const selectInstance = (e: RegulatoryEvent) => {
    setActiveId(e.id);
    const next = new URLSearchParams(searchParams);
    next.set('event', e.id);
    setSearchParams(next, { replace: true });
    // The inline panel is always visible, but mark the workflow active
    // so any enforcement log / audit signals that execution has started.
    store.openWorkflow(e.id);
  };

  const clearSelection = () => {
    setActiveId(null);
    const next = new URLSearchParams(searchParams);
    next.delete('event');
    setSearchParams(next, { replace: true });
    store.closeWorkflow();
  };

  const monthLabel = new Date(year, month, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  /* ── Roll-up counters by state (drives the color legend) ── */
  const rollup = useMemo(() => countByState(monthInstances, today, store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthInstances, today, store.completions, store.stepStates],
  );

  /* ── View toggle: 'calendar' (default) | 'sprint' (CES 14-day) ── */
  const view = (searchParams.get('view') === 'sprint') ? 'sprint' : 'calendar';
  const setView = (next: 'calendar' | 'sprint') => {
    const p = new URLSearchParams(searchParams);
    if (next === 'sprint') p.set('view', 'sprint'); else p.delete('view');
    setSearchParams(p, { replace: true });
  };

  /* ── Sprint window scoping (Mon week 1 → Fri week 2) ──
     In sprint mode the calendar shell is the SAME as Events mode, but
     the dataset is filtered to the active sprint window and limited to
     mandated/recurring obligations (no per-clinician onboarding). */
  const ces = useComplianceExecution();
  const sprintInstances = useMemo(() => {
    if (view !== 'sprint') return [];
    const startMs = new Date(ces.activeSprint.startDate + 'T00:00:00').getTime();
    const endMs   = new Date(ces.activeSprint.endDate   + 'T23:59:59').getTime();
    return allInstances.filter(e => {
      const t = new Date(e.date + 'T00:00:00').getTime();
      if (t < startMs || t > endMs) return false;
      // Strip per-employee onboarding tasks; keep mandated/recurring/etc.
      const cad = (e.cadence ?? '').toString().toLowerCase();
      if (cad === 'onboarding' || cad === 'personal') return false;
      return true;
    });
  }, [view, allInstances, ces.activeSprint.startDate, ces.activeSprint.endDate]);

  // In sprint mode, jump the visible month to the sprint's anchor month
  // so the calendar shell shows the sprint days first.
  useEffect(() => {
    if (view !== 'sprint') return;
    const d = new Date(ces.activeSprint.startDate + 'T00:00:00');
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }, [view, ces.activeSprint.startDate]);

  return (
    <div className="h-full w-full flex flex-col font-sans animate-in fade-in duration-500 px-6 md:px-10 py-5 gap-4 overflow-hidden relative z-10">

      <TimelineHeader
        monthLabel={monthLabel}
        today={today}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(+1)}
        onToday={goToday}
        rollup={rollup}
        view={view}
        onViewChange={setView}
      />

      {view === 'calendar' && <JulyReadinessBanner today={today} />}

      {view === 'calendar' ? (
        /* ── 70 / 30 split (Events View — image 1 layout) ── */
        <div className="flex-1 grid grid-cols-10 gap-4 min-h-0 overflow-hidden">
          <div className="col-span-7 flex flex-col min-h-0">
            <TimelineMonth
              year={year}
              month={month}
              events={monthInstances}
              activeId={activeInstance?.id ?? null}
              onSelect={selectInstance}
              today={today}
            />
          </div>
          <div className="col-span-3 flex flex-col min-h-0">
            <WorkflowExecutionPanel
              event={activeInstance}
              onClear={activeInstance ? clearSelection : undefined}
              today={today}
            />
          </div>
        </div>
      ) : (
        /* ── Sprint View — same calendar shell, sprint-scoped data, sprint task panel ── */
        <div className="flex-1 grid grid-cols-10 gap-4 min-h-0 overflow-hidden">
          <div className="col-span-7 flex flex-col min-h-0">
            <TimelineMonth
              year={year}
              month={month}
              events={sprintInstances}
              activeId={activeInstance?.id ?? null}
              onSelect={selectInstance}
              today={today}
            />
          </div>
          <div className="col-span-3 flex flex-col min-h-0">
            <SprintTaskPanel
              event={
                // Prefer an event that is actually in this sprint window;
                // otherwise show empty state.
                activeInstance && sprintInstances.some(e => e.id === activeInstance.id)
                  ? activeInstance
                  : sprintInstances[0] ?? null
              }
              onClear={activeInstance ? clearSelection : undefined}
              today={today}
            />
          </div>
        </div>
      )}

      <ToastHost />
    </div>
  );
}

/* ─── Header (month nav + state roll-up) ─────────────── */
function TimelineHeader({
  monthLabel, today, onPrev, onNext, onToday, rollup, view, onViewChange,
}: {
  monthLabel: string;
  today: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  rollup: { overdue: number; blocked: number; dueSoon: number; onTrack: number; complete: number };
  view: 'calendar' | 'sprint';
  onViewChange: (v: 'calendar' | 'sprint') => void;
}) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL_PRIMARY }} />
          <span
            className="text-[10px] font-montserrat font-bold uppercase tracking-[0.28em]"
            style={{ color: TEAL_PRIMARY }}
          >
            {view === 'sprint' ? 'CES Sprint Window' : 'Event Calendar'}
          </span>
        </div>
        <h1
          className="font-outfit font-light text-white leading-tight"
          style={{ fontSize: 24, letterSpacing: '-0.01em' }}
        >
          {view === 'sprint'
            ? 'Sprint execution · Mon–Fri 2-week window'
            : `Regulatory events · ${monthLabel}`}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {view === 'calendar' && <StateLegend rollup={rollup} />}

        {/* View toggle: Calendar ↔ Sprint */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5" role="tablist" aria-label="Calendar view">
          <button
            role="tab"
            aria-selected={view === 'calendar' ? 'true' : 'false'}
            onClick={() => onViewChange('calendar')}
            className="text-[11px] font-outfit px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors"
            style={{
              background: view === 'calendar' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color:      view === 'calendar' ? '#fff' : 'rgba(255,255,255,0.65)',
            }}
          >
            <CalendarDays size={11} />
            Calendar
          </button>
          <button
            role="tab"
            aria-selected={view === 'sprint' ? 'true' : 'false'}
            onClick={() => onViewChange('sprint')}
            className="text-[11px] font-outfit px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors"
            style={{
              background: view === 'sprint' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color:      view === 'sprint' ? '#fff' : 'rgba(255,255,255,0.65)',
            }}
          >
            <CalendarRange size={11} />
            Sprint
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
          <NavBtn onClick={onPrev} ariaLabel="Previous month"><ChevronLeft size={14} /></NavBtn>
          <button
            onClick={onToday}
            className="text-[11px] font-outfit text-white/90 px-3 py-1 rounded-md hover:bg-white/[0.05] transition-colors flex items-center gap-1.5"
            title={`Today · ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          >
            <CalendarDays size={11} className="text-white/65" />
            Today
          </button>
          <NavBtn onClick={onNext} ariaLabel="Next month"><ChevronRight size={14} /></NavBtn>
        </div>
      </div>
    </div>
  );
}

function NavBtn({
  onClick, children, ariaLabel,
}: { onClick: () => void; children: React.ReactNode; ariaLabel: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-7 h-7 rounded-md flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05]"
    >
      {children}
    </button>
  );
}

/* ─── State legend (roll-up colors only) ────────────── */
function StateLegend({
  rollup,
}: {
  rollup: { overdue: number; blocked: number; dueSoon: number; onTrack: number; complete: number };
}) {
  const red = rollup.overdue + rollup.blocked;
  const amber = rollup.dueSoon;
  const teal = rollup.onTrack + rollup.complete;
  return (
    <div className="flex items-center gap-2">
      <LegendPill color={STATE_COLOR.overdue} label="Block" value={red} />
      <LegendPill color={STATE_COLOR['due-soon']} label="Due" value={amber} />
      <LegendPill color={STATE_COLOR['on-track']} label="Track" value={teal} />
    </div>
  );
}

function LegendPill({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 border"
      style={{ borderColor: `${color}55`, background: `${color}12` }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.16em]" style={{ color }}>
        {label}
      </span>
      <span className="text-[10px] font-outfit text-white/80 leading-none">{value}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   JULY READINESS BANNER
   --------------------------------------------------------------
   Surfaces the "readiness rollout" action defined in the spec:
   one click previews the 12-month non-triggered schedule (domain ×
   cadence matrix), a second click commits it to the calendar.
   Triggered workflows are excluded — they materialize only when
   their trigger fires.
   ═══════════════════════════════════════════════════════════════ */
function JulyReadinessBanner({ today }: { today: Date }) {
  const generatedCount = useAutogenStore(s => s.generatedEvents.length);
  const previewJuly     = useAutogenStore(s => s.previewJulyReadiness);
  const generateJuly    = useAutogenStore(s => s.generateJulyReadiness);
  const push            = useToastStore(s => s.push);

  const [preview, setPreview] = useState<SchedulingPreview | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Heuristic: only show when the autogen pool is small — avoids nagging
  // once the rollout has already been executed.
  const shouldShow = generatedCount < 12 && !dismissed;
  if (!shouldShow) return null;

  const readinessYear = today.getFullYear() < 2026 ? 2026 : today.getFullYear();

  const runPreview = () => {
    const p = previewJuly(readinessYear);
    setPreview(p);
  };

  const runCommit = () => {
    const res = generateJuly(readinessYear);
    push(
      'success',
      'July readiness schedule generated',
      `${res.summary.totalEmitted} events across ${Object.keys(res.summary.byDomain).length} domains. ${res.summary.totalConflicts} shifted, ${res.summary.totalSkipped} skipped.`,
    );
    setPreview(null);
    setDismissed(true);
  };

  return (
    <div
      className="rounded-xl border p-3 flex flex-col gap-3"
      style={{ borderColor: `${ACTION_COLOR}55`, background: `${ACTION_COLOR}0C` }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2 min-w-0">
          <CalendarRange size={16} style={{ color: ACTION_COLOR, marginTop: 2 }} />
          <div className="min-w-0">
            <div
              className="text-[10.5px] font-montserrat font-bold uppercase tracking-[0.18em]"
              style={{ color: ACTION_COLOR }}
            >
              July Readiness Rollout
            </div>
            <p className="text-[11px] font-roboto text-white/75 mt-0.5 leading-snug">
              Project all non-triggered workflows into the calendar for the 12-month window starting <span className="font-semibold text-white">{readinessYear}-07-01</span>. Triggered workflows (incidents, complaints, sentinel events) are excluded and will materialize only when their trigger fires.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!preview ? (
            <button
              type="button"
              onClick={runPreview}
              className="rounded-md border px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center gap-1.5 transition hover:brightness-110"
              style={{ borderColor: `${ACTION_COLOR}66`, color: ACTION_COLOR, background: `${ACTION_COLOR}1A` }}
            >
              <Sparkles size={11} />
              Preview Schedule
            </button>
          ) : (
            <button
              type="button"
              onClick={runCommit}
              className="rounded-md px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.14em] flex items-center gap-1.5 transition"
              style={{ background: ACTION_COLOR, color: '#0A0202', border: `1px solid ${ACTION_COLOR}` }}
            >
              <Zap size={11} />
              Commit · {preview.totals.totalEmitted} events
            </button>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-[9.5px] font-montserrat font-bold text-white/45 hover:text-white/80 uppercase tracking-[0.14em]"
          >
            Dismiss
          </button>
        </div>
      </div>

      {preview && <PreviewMatrix preview={preview} />}
    </div>
  );
}

function PreviewMatrix({ preview }: { preview: SchedulingPreview }) {
  const domains = Array.from(new Set(preview.matrix.map(m => m.domain))).sort();
  const cadences = Array.from(new Set(preview.matrix.map(m => m.cadence))).sort();
  const get = (d: string, c: string) =>
    preview.matrix.find(m => m.domain === d && m.cadence === c)?.count ?? 0;

  return (
    <div className="rounded-lg border bg-white/[0.02] overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-[9.5px] font-montserrat font-bold text-white/60 uppercase tracking-[0.14em]">
          Schedule preview · {preview.rangeStart} → {preview.rangeEnd}
        </span>
        <span className="text-[9.5px] font-roboto text-white/50">
          {preview.totals.totalEmitted} emitted · {preview.totals.totalConflicts} shifted · {preview.totals.totalSkipped} skipped · {preview.triggerOnlyTemplates.length} trigger-only excluded
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] font-roboto">
          <thead>
            <tr className="text-white/55">
              <th className="text-left px-3 py-1.5 font-montserrat font-bold uppercase tracking-[0.14em] text-[9.5px]">Domain</th>
              {cadences.map(c => (
                <th key={c} className="px-2 py-1.5 text-right font-montserrat font-bold uppercase tracking-[0.14em] text-[9.5px]">
                  {c}
                </th>
              ))}
              <th className="px-3 py-1.5 text-right font-montserrat font-bold uppercase tracking-[0.14em] text-[9.5px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {domains.map(d => {
              const rowTotal = cadences.reduce((acc, c) => acc + get(d, c), 0);
              return (
                <tr key={d} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <td className="px-3 py-1.5 text-white/80 font-semibold">{d}</td>
                  {cadences.map(c => {
                    const v = get(d, c);
                    return (
                      <td key={c} className="px-2 py-1.5 text-right" style={{ color: v > 0 ? TEAL_PRIMARY : 'rgba(255,255,255,0.30)' }}>
                        {v || '—'}
                      </td>
                    );
                  })}
                  <td className="px-3 py-1.5 text-right text-white font-semibold">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── State roll-up (used for the header legend) ────── */
function countByState(
  instances: RegulatoryEvent[],
  today: Date,
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>,
) {
  const out = { overdue: 0, blocked: 0, dueSoon: 0, onTrack: 0, complete: 0 };
  for (const e of instances) {
    const s = classifyInstance(e, today, store);
    if (s === 'overdue') out.overdue++;
    else if (s === 'blocked') out.blocked++;
    else if (s === 'due-soon') out.dueSoon++;
    else if (s === 'on-track') out.onTrack++;
    else out.complete++;
  }
  return out;
}
