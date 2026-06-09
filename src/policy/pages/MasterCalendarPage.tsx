import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarDays, CalendarRange,
  Columns3, GitBranch, CloudUpload, Filter, X,
} from 'lucide-react';
import {
  REGULATORY_EVENTS, TODAY_ANCHOR, type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { ToastHost } from '@/policy/components/regulatory/Toast';
import { useToastStore } from '@/policy/components/regulatory/Toast';
import { TimelineMonth } from '@/policy/components/regulatory/TimelineMonth';
import { WorkflowExecutionPanel } from '@/policy/components/regulatory/WorkflowExecutionPanel';
import {
  STATE_COLOR, STATE_LABEL, classifyInstance,
} from '@/policy/components/regulatory/timelineState';
import { SprintTaskPanel } from '@/policy/ces/components/details/SprintTaskPanel';
import { regulatoryEventOverlapsSprint } from '@/policy/pm/sprintWindows';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import { SprintScopeToolbar } from '@/policy/components/pm/SprintScopeToolbar';
import { SprintBoardView } from '@/policy/components/pm/PmViews';
import { V3TaskDetailPanel } from '@/policy/components/pm/V3TaskDetailPanel';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { useCalendarSyncStore, type BulkSyncSummary } from '@/policy/stores/calendarSyncStore';
import { SurfaceCard, EmptyState } from '@/policy/components/ui';
import { VeilDrawer } from '@/policy/components/ui/VeilDrawer';
import { AriaLiveRegion } from '@/policy/components/ui';
import {
  CesEventPreviewModal,
  CesInteractionStyles,
  useCesInfiniteZoom,
} from '@/policy/ces/components/calendar/CesEventInteraction';
import { getSwimlaneRegistryEntry } from '@/policy/workflows/swimlanes/swimlaneRegistry';

export type PmView = 'calendar' | 'sprint' | 'kanban' | 'gantt';

const CES_V32_COLORS = {
  shell: '#0B0F15',
  surface: '#0F131A',
  card: '#141A23',
  border: '#1C2433',
  borderStrong: '#243043',
  teal: '#007970',
  tealDeep: '#004142',
  orange: '#C74600',
  text: '#F8FAFC',
  slate: '#A0ABC0',
  muted: '#6E7C93',
};

const CES_ROLE_FALLBACK = [
  'QAPI Lead / Chair',
  'Data Analyst / Quality Source',
  'Clinical Manager',
  'Compliance Officer',
  'Infection Preventionist',
  'Committee / Voting Members',
  'Scribe',
  'Governing Body',
];

function normalizeRoleLabel(value?: string | null) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

type CesDisplayState = 'block' | 'due' | 'track';

function getCesDisplayState(
  event: RegulatoryEvent,
  today: Date,
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>,
): CesDisplayState {
  const state = classifyInstance(event, today, store);
  if (state === 'overdue' || state === 'blocked') return 'block';
  if (state === 'due-soon') return 'due';
  return 'track';
}

function getCesReferenceTone(displayState: CesDisplayState) {
  if (displayState === 'block') {
    return { bg: '#FFE4E6', fg: '#BE123C', border: '#FDA4AF', dot: '#BE123C' };
  }
  if (displayState === 'due') {
    return { bg: '#854D0E', fg: '#FFF7ED', border: '#A16207', dot: '#D97706' };
  }
  return { bg: '#0F766E', fg: '#ECFEFF', border: '#115E59', dot: '#0F766E' };
}

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const store = useRegulatoryExecutionStore();
  const {
    zoomState,
    openPreview,
    closeZoom,
  } = useCesInfiniteZoom();

  const eventParam = searchParams.get('event');
  const workflowParam = searchParams.get('workflow');

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [activeId, setActiveId] = useState<string | null>(eventParam);
  const [bulkSyncPending, setBulkSyncPending] = useState(false);
  const [lastBulkSync, setLastBulkSync] = useState<BulkSyncSummary | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 1920 : window.innerWidth,
  );
  const isMobileLayout = viewportWidth < 768;

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

  const calendarRoleOptions = useMemo(() => {
    const liveRoles = Array.from(
      new Set(
        monthInstances
          .map(event => normalizeRoleLabel(event.ownerRole))
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return liveRoles.length > 0 ? liveRoles : CES_ROLE_FALLBACK;
  }, [monthInstances]);

  useEffect(() => {
    setSelectedRoles(prev => prev.filter(role => calendarRoleOptions.includes(role)));
  }, [calendarRoleOptions]);

  const filteredMonthInstances = useMemo(() => {
    if (selectedRoles.length === 0) return monthInstances;
    return monthInstances.filter(event =>
      selectedRoles.includes(normalizeRoleLabel(event.ownerRole)),
    );
  }, [monthInstances, selectedRoles]);

  /* ── Active instance resolution ── */
  const activeInstance: RegulatoryEvent | null = useMemo(() => {
    if (activeId) {
      const match = allInstances.find(e => e.id === activeId);
      if (match) return match;
    }
    return filteredMonthInstances[0] ?? null;
  }, [activeId, allInstances, filteredMonthInstances]);

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

  const openEventSwimlane = (event: RegulatoryEvent, taskId?: string) => {
    const registryEntry = getSwimlaneRegistryEntry({
      workflowId: event.workflowId,
      eventId: event.id,
      taskId,
    });
    navigate(registryEntry.route);
  };

  const selectInstance = (e: RegulatoryEvent) => {
    setActiveId(e.id);
    const next = new URLSearchParams(searchParams);
    next.set('event', e.id);
    setSearchParams(next, { replace: true });

    if (view !== 'calendar') {
      store.openWorkflow(e.id);
      setDetailsOpen(true);
      return;
    }

    if (isMobileLayout) {
      if (zoomState.event?.id === e.id && zoomState.level === 'preview') {
        openEventSwimlane(e);
        return;
      }
      openPreview(e);
      return;
    }

    openEventSwimlane(e);
  };

  const clearSelection = () => {
    setActiveId(null);
    const next = new URLSearchParams(searchParams);
    next.delete('event');
    setSearchParams(next, { replace: true });
    store.closeWorkflow();
  };

  const closeEventZoom = () => {
    closeZoom();
    clearSelection();
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
  const filteredRollup = useMemo(() => countByState(filteredMonthInstances, today, store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredMonthInstances, today, store.completions, store.stepStates],
  );

  /* ── View toggle: 4-option PM switcher ── */
  const rawView = searchParams.get('view');
  const view: PmView =
    rawView === 'sprint' || rawView === 'kanban' || rawView === 'gantt'
      ? rawView
      : 'calendar';
  const setView = (next: PmView) => {
    const p = new URLSearchParams(searchParams);
    if (next === 'calendar') p.delete('view');
    else p.set('view', next);
    setSearchParams(p, { replace: true });
  };

  /* ── Active PM task (drives shared TaskDetailRightPanel) ──
     Sourced from the global selectedTaskStore so opening a task from
     ANY view (Calendar/Gantt/Kanban/Sprint/MyTasks) shows it everywhere. */
  const activeTaskId = useSelectedTaskStore(s => s.taskId);
  const openTask = useSelectedTaskStore(s => s.openTask);
  const closeTask = useSelectedTaskStore(s => s.closeTask);
  const setActiveTaskId = (id: string | null) => (id ? openTask(id, view as 'calendar' | 'gantt' | 'kanban' | 'sprint') : closeTask());
  const syncAllEvents = useCalendarSyncStore(s => s.syncAll);
  const pushToast = useToastStore(s => s.push);

  const handleBulkSync = async () => {
    setBulkSyncPending(true);
    try {
      const summary = await syncAllEvents(allInstances);
      setLastBulkSync(summary);
      if (summary.failed > 0) {
        pushToast(
          'warn',
          'Google Calendar sync completed with failures',
          `Created ${summary.created}, updated ${summary.updated}, skipped ${summary.skipped}, failed ${summary.failed}`,
        );
      } else {
        pushToast(
          'success',
          'All events synced to Google Calendar',
          `Created ${summary.created}, updated ${summary.updated}, skipped ${summary.skipped}`,
        );
      }
    } finally {
      setBulkSyncPending(false);
    }
  };

  const sprintWindow = usePmViewSprintStore(s => s.window);

  /* ── Sprint calendar shell: events overlapping selected PM sprint ── */
  const sprintInstances = useMemo(() => {
    if (view !== 'sprint') return [];
    return allInstances.filter(e => {
      if (!regulatoryEventOverlapsSprint(e, sprintWindow)) return false;
      const cad = (e.cadence ?? '').toString().toLowerCase();
      if (cad === 'onboarding' || cad === 'personal') return false;
      return true;
    });
  }, [view, allInstances, sprintWindow]);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selectTask = (id: string | null) => {
    setActiveTaskId(id);
    if (id) setDetailsOpen(true);
  };

  const hasDetailContext = view === 'calendar'
    ? false
    : view === 'kanban' || view === 'gantt'
    ? Boolean(activeTaskId)
    : Boolean(activeInstance || activeTaskId);

  return (
    <div className="ci-page-container v3-calendar-surface h-full w-full min-h-0 overflow-hidden font-sans relative z-10">
      <CesInteractionStyles />
      <div
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border"
        style={{
          background: `linear-gradient(180deg, ${CES_V32_COLORS.surface} 0%, ${CES_V32_COLORS.shell} 100%)`,
          borderColor: CES_V32_COLORS.border,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.34)',
        }}
      >
        <TimelineHeader
          monthLabel={monthLabel}
          today={today}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(+1)}
          onToday={goToday}
          onSyncAll={handleBulkSync}
          syncAllPending={bulkSyncPending}
          lastBulkSync={lastBulkSync}
          rollup={view === 'calendar' ? filteredRollup : rollup}
          view={view}
          onViewChange={setView}
        />

        {(view === 'calendar' || view === 'kanban' || view === 'gantt') && (
          <RoleFilterBar
            roles={calendarRoleOptions}
            selectedRoles={selectedRoles}
            onToggle={(role) => {
              setSelectedRoles(prev =>
                prev.includes(role)
                  ? prev.filter(current => current !== role)
                  : [...prev, role],
              );
            }}
            onClear={() => setSelectedRoles([])}
          />
        )}

        {view === 'sprint' && (
          <div
            className="shrink-0 border-b px-4 py-3"
            style={{ borderColor: CES_V32_COLORS.border, background: 'rgba(20, 26, 35, 0.72)' }}
          >
            <SprintScopeToolbar />
          </div>
        )}

        <div data-ces-calendar className="min-h-0 flex-1 overflow-hidden bg-[#0B0F15]">
          {view === 'calendar' ? (
            isMobileLayout ? (
              <MobileAgendaList
                events={filteredMonthInstances}
                activeId={activeId}
                onSelect={selectInstance}
                today={today}
                store={store}
              />
            ) : (
              <div className="h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
                <div className="min-h-full min-w-[1080px]">
                  <TimelineMonth
                    year={year}
                    month={month}
                    events={filteredMonthInstances}
                    activeId={activeId}
                    onSelect={selectInstance}
                    onOpenSwimlane={openEventSwimlane}
                    today={today}
                  />
                </div>
              </div>
            )
          ) : view === 'sprint' ? (
            <div className="h-full p-4">
              <SprintBoardView onSelect={selectTask} selectedEventId={activeInstance?.id ?? null} />
            </div>
          ) : view === 'kanban' ? (
            <CesV32KanbanView
              events={filteredMonthInstances}
              today={today}
              store={store}
              onSelect={selectInstance}
            />
          ) : (
            <CesV32GanttView
              events={filteredMonthInstances}
              today={today}
              store={store}
              onSelect={selectInstance}
            />
          )}
        </div>
      </div>

      {hasDetailContext && (
        <>
          {!detailsOpen && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              disabled={!hasDetailContext}
              className="ci-touch-target rounded-md border px-3 py-1.5 text-[11px] font-montserrat font-bold uppercase tracking-[0.14em] text-white/85 disabled:opacity-45"
              style={{ borderColor: 'var(--ci-overlay-active-border)', background: 'var(--ci-overlay-border)' }}
            >
              Open Details
            </button>
          </div>
          )}
          <VeilDrawer
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            layer={activeTaskId ? 2 : 1}
            width={activeTaskId ? 'lg' : 'md'}
            eyebrow={activeTaskId ? activeTaskId : activeInstance?.domain}
            title={activeTaskId ? 'Task detail' : 'Tasks'}
          >
              <div className="h-full min-h-0">
                {view === 'calendar' ? (
                  activeTaskId ? (
                    <V3TaskDetailPanel
                      taskId={activeTaskId}
                      onClose={() => {
                        setActiveTaskId(null);
                        setDetailsOpen(false);
                      }}
                    />
                  ) : (
                    <WorkflowExecutionPanel
                      event={activeInstance}
                      onClear={activeInstance ? clearSelection : undefined}
                      today={today}
                      onSelectTask={(taskId) => selectTask(taskId)}
                    />
                  )
                ) : view === 'sprint' ? (
                  activeTaskId ? (
                    <V3TaskDetailPanel
                      taskId={activeTaskId}
                      onClose={() => {
                        setActiveTaskId(null);
                        setDetailsOpen(false);
                      }}
                    />
                  ) : (
                    <SprintTaskPanel
                      event={
                        activeInstance && sprintInstances.some(e => e.id === activeInstance.id)
                          ? activeInstance
                          : sprintInstances[0] ?? null
                      }
                      onClear={activeInstance ? clearSelection : undefined}
                      today={today}
                    />
                  )
                ) : activeTaskId ? (
                  <V3TaskDetailPanel
                    taskId={activeTaskId}
                    onClose={() => {
                      setActiveTaskId(null);
                      setDetailsOpen(false);
                    }}
                  />
                ) : (
                  <EmptyRightPanel label="Select a task to see details." />
                )}
              </div>
          </VeilDrawer>
        </>
      )}

      {view === 'calendar' && zoomState.event && zoomState.level === 'preview' && (
        <CesEventPreviewModal
          event={zoomState.event}
          today={today}
          onClose={closeEventZoom}
          onOpenSwimlane={() => {
            if (zoomState.event) openEventSwimlane(zoomState.event);
          }}
        />
      )}

      <ToastHost />
    </div>
  );
}

function EmptyRightPanel({ label }: { label: string }) {
  return (
    <SurfaceCard className="flex-1 flex items-center justify-center" padding="md">
      <EmptyState title={label} description="Select a task from Kanban, Gantt, or the workflow panel to open the shared detail panel." />
    </SurfaceCard>
  );
}

function CesV32KanbanView({
  events,
  today,
  store,
  onSelect,
}: {
  events: RegulatoryEvent[];
  today: Date;
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>;
  onSelect: (event: RegulatoryEvent) => void;
}) {
  const columns = [
    { id: 'todo', title: 'TO DO', states: ['due'] as CesDisplayState[] },
    { id: 'progress', title: 'IN PROGRESS', states: ['track'] as CesDisplayState[] },
    { id: 'review', title: 'IN REVIEW', states: [] as CesDisplayState[] },
    { id: 'blocked', title: 'BLOCKED', states: ['block'] as CesDisplayState[] },
  ];

  const byColumn = columns.map(column => {
    const items = events.filter(event => {
      const displayState = getCesDisplayState(event, today, store);
      if (column.id === 'review') return store.isCertified(event.id);
      if (column.id === 'blocked') return displayState === 'block';
      if (column.id === 'todo') return displayState === 'due' && !store.isCertified(event.id);
      return displayState === 'track' && !store.isCertified(event.id);
    });
    return { ...column, items };
  });

  return (
    <div data-ces-calendar className="h-full overflow-x-auto custom-scrollbar bg-[#0B0F15] px-6 py-6">
      <div className="flex min-h-full min-w-[1040px] gap-6">
        {byColumn.map(column => (
          <section key={column.id} className="flex w-[320px] shrink-0 flex-col">
            <header className="mb-4 flex items-center justify-between px-1">
              <h3 className="text-[11px] font-montserrat font-bold uppercase tracking-[0.22em] text-white">
                {column.title}
              </h3>
              <span className="text-[10px] font-mono text-[#5E6A7F]">{column.items.length}</span>
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto custom-scrollbar">
              {column.items.map(event => {
                const displayState = getCesDisplayState(event, today, store);
                const tone = getCesReferenceTone(displayState);
                const date = new Date(`${event.date}T00:00:00`);
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onSelect(event)}
                    className="w-full rounded-lg border bg-[#141A23] px-4 py-4 text-left transition-colors hover:border-[#2A3441] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007970]"
                    style={{ borderColor: '#1C2433' }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: tone.dot }} />
                      <span className="truncate text-[9px] font-montserrat font-bold uppercase tracking-[0.18em] text-[#8A94A6]">
                        {normalizeRoleLabel(event.ownerRole) || event.domain}
                      </span>
                    </div>
                    <h4 className="text-[14px] font-outfit font-semibold leading-snug text-white">
                      {event.title}
                    </h4>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-mono">
                      <span className="rounded bg-[#007970]/10 px-2 py-0.5 text-[#007970]">CES</span>
                      <span className="uppercase text-[#5E6A7F]">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                );
              })}
              {column.items.length === 0 && (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[#1C2433] text-xs text-[#5E6A7F]">
                  No events
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CesV32GanttView({
  events,
  today,
  store,
  onSelect,
}: {
  events: RegulatoryEvent[];
  today: Date;
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>;
  onSelect: (event: RegulatoryEvent) => void;
}) {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  const laneWidth = 40;
  const leftWidth = 390;

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div data-ces-calendar className="h-full overflow-auto custom-scrollbar bg-[#0B0F15] p-6">
      <div
        data-ces-calendar
        className="flex min-h-full min-w-[1320px] overflow-hidden rounded-xl border bg-[#0F131A]"
        style={{ borderColor: '#1C2433' }}
      >
        <div className="shrink-0 border-r bg-[#141A23]" style={{ width: leftWidth, borderColor: '#1C2433' }}>
          <div className="flex h-[50px] items-center border-b bg-[#0B0F15] px-4 text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-[#5E6A7F]" style={{ borderColor: '#1C2433' }}>
            Event Pipeline
          </div>
          <div>
            {sortedEvents.map(event => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect(event)}
                className="flex h-[68px] w-full flex-col justify-center border-b px-4 text-left transition-colors hover:bg-[#1C2433]/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007970]"
                style={{ borderColor: '#1C2433' }}
              >
                <span className="truncate text-[13px] font-outfit font-semibold text-white">{event.title}</span>
                <span className="mt-1 truncate text-[10px] font-roboto uppercase tracking-[0.06em] text-[#8A94A6]">
                  Assignee: {normalizeRoleLabel(event.ownerRole) || event.owner}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto custom-scrollbar">
          <div className="h-[50px] border-b bg-[#0B0F15]" style={{ borderColor: '#1C2433', width: days.length * laneWidth }}>
            <div className="flex h-full">
              {days.map(day => (
                <div
                  key={day}
                  className="flex shrink-0 items-center justify-center border-r text-[10px] font-mono text-[#5E6A7F]"
                  style={{ width: laneWidth, borderColor: 'rgba(28, 36, 51, 0.72)' }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="relative" style={{ width: days.length * laneWidth }}>
            <div className="pointer-events-none absolute inset-0 flex">
              {days.map(day => (
                <div
                  key={day}
                  className="shrink-0 border-r"
                  style={{ width: laneWidth, borderColor: 'rgba(28, 36, 51, 0.42)' }}
                />
              ))}
            </div>
            {sortedEvents.map(event => {
              const day = new Date(`${event.date}T00:00:00`).getDate();
              const endDay = event.endDate ? new Date(`${event.endDate}T00:00:00`).getDate() : day;
              const span = Math.max(1, Math.min(31, endDay) - Math.max(1, day) + 1);
              const displayState = getCesDisplayState(event, today, store);
              const tone = getCesReferenceTone(displayState);
              return (
                <div
                  key={event.id}
                  className="relative h-[68px] border-b"
                  style={{ borderColor: '#1C2433' }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(event)}
                    className="absolute top-[21px] flex h-[26px] items-center overflow-hidden rounded-md px-2 text-left text-[9px] font-montserrat font-bold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007970]"
                    style={{
                      left: (Math.max(1, day) - 1) * laneWidth + 4,
                      width: Math.max(28, span * laneWidth - 8),
                      background: tone.bg,
                      color: tone.fg,
                      border: `1px solid ${tone.border}`,
                    }}
                    title={event.title}
                  >
                    {span > 1 ? event.title : ''}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Header (month nav + state roll-up) ─────────────── */
function TimelineHeader({
  monthLabel, today, onPrev, onNext, onToday, onSyncAll, syncAllPending, lastBulkSync, rollup, view, onViewChange,
}: {
  monthLabel: string;
  today: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSyncAll: () => void;
  syncAllPending: boolean;
  lastBulkSync: BulkSyncSummary | null;
  rollup: { overdue: number; blocked: number; dueSoon: number; onTrack: number; complete: number };
  view: PmView;
  onViewChange: (v: PmView) => void;
}) {
  return (
    <div className="shrink-0 border-b" style={{ borderColor: CES_V32_COLORS.border, background: CES_V32_COLORS.surface }}>
      <div className="px-5 py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: CES_V32_COLORS.teal }} />
              <span
                className="text-[10px] font-montserrat font-bold uppercase tracking-[0.28em]"
                style={{ color: CES_V32_COLORS.teal }}
              >
                {view === 'sprint'
                  ? 'CES Sprint Route'
                  : view === 'kanban'
                    ? 'PM Kanban'
                    : view === 'gantt'
                      ? 'PM Gantt'
                      : 'Event Calendar'}
              </span>
            </div>
            <h1
              className="font-outfit font-light leading-tight"
              style={{ fontSize: 34, letterSpacing: '-0.02em', color: CES_V32_COLORS.text }}
            >
              {view === 'sprint'
                ? 'Sprint execution workspace'
                : view === 'kanban'
                  ? 'Project CES projected tasks'
                  : view === 'gantt'
                    ? 'Project CES projected tasks'
                    : `Regulatory events · ${monthLabel}`}
            </h1>
            <p className="mt-2 max-w-3xl text-[12px] leading-relaxed" style={{ color: CES_V32_COLORS.slate }}>
              A single CES control surface for mandated calendar execution, drill-in workflow review, and polished role-based scanning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {view === 'calendar' && <StateLegend rollup={rollup} />}

            <div
              className="flex max-w-full items-center gap-1 overflow-x-auto rounded-[16px] border p-1"
              aria-label="PM view"
              style={{ borderColor: CES_V32_COLORS.borderStrong, background: CES_V32_COLORS.card }}
            >
              <ViewToggleButton active={view === 'calendar'} onClick={() => onViewChange('calendar')}>
                <CalendarDays size={12} />
                Calendar
              </ViewToggleButton>
              <ViewToggleButton active={view === 'kanban'} onClick={() => onViewChange('kanban')}>
                <Columns3 size={12} />
                Kanban
              </ViewToggleButton>
              <ViewToggleButton active={view === 'gantt'} onClick={() => onViewChange('gantt')}>
                <GitBranch size={12} />
                Gantt
              </ViewToggleButton>
              {view === 'sprint' && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-[12px] px-3 py-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.18em]"
                  style={{ color: '#FBBF24', background: 'rgba(251, 191, 36, 0.12)' }}
                >
                  <CalendarRange size={12} />
                  Sprint Route
                </span>
              )}
            </div>

            <div
              className="flex items-center rounded-[16px] border p-1"
              style={{ borderColor: CES_V32_COLORS.borderStrong, background: CES_V32_COLORS.card }}
            >
              <NavBtn onClick={onPrev} ariaLabel="Previous month"><ChevronLeft size={14} /></NavBtn>
              <button
                onClick={onToday}
                className="ci-touch-target inline-flex items-center gap-1.5 rounded-[12px] px-3 py-2 text-[11px] font-outfit transition-colors"
                style={{ color: CES_V32_COLORS.text }}
                title={`Today · ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              >
                <CalendarDays size={12} style={{ color: CES_V32_COLORS.slate }} />
                Today
              </button>
              <span className="px-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.18em]" style={{ color: CES_V32_COLORS.slate }}>
                {monthLabel}
              </span>
              <NavBtn onClick={onNext} ariaLabel="Next month"><ChevronRight size={14} /></NavBtn>
            </div>

            <button
              type="button"
              onClick={onSyncAll}
              disabled={syncAllPending}
              className="ci-touch-target inline-flex items-center gap-2 rounded-[16px] border px-4 py-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] disabled:opacity-60 whitespace-nowrap"
              style={{
                borderColor: 'rgba(0, 121, 112, 0.46)',
                background: 'linear-gradient(180deg, rgba(0, 121, 112, 0.22), rgba(0, 65, 66, 0.82))',
                color: CES_V32_COLORS.text,
              }}
              title="Sync all in-scope compliance events to Google Calendar"
            >
              <CloudUpload size={12} className={syncAllPending ? 'animate-pulse' : ''} />
              {syncAllPending ? 'Syncing…' : 'Sync All Events'}
            </button>
          </div>
        </div>
      </div>

      <AriaLiveRegion politeness="polite" message={lastBulkSync ? `Last bulk sync: Created ${lastBulkSync.created} · Updated ${lastBulkSync.updated} · Skipped ${lastBulkSync.skipped} · Failed ${lastBulkSync.failed}` : ''} visuallyHidden />
    </div>
  );
}

function ViewToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ci-touch-target inline-flex items-center gap-1.5 whitespace-nowrap rounded-[12px] px-3 py-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] transition-colors focus:outline-none focus-visible:ring-2"
      style={{
        background: active ? 'rgba(0, 121, 112, 0.20)' : 'transparent',
        color: active ? CES_V32_COLORS.text : CES_V32_COLORS.slate,
        border: `1px solid ${active ? 'rgba(0, 121, 112, 0.44)' : 'transparent'}`,
      }}
    >
      {children}
    </button>
  );
}

function RoleFilterBar({
  roles,
  selectedRoles,
  onToggle,
  onClear,
}: {
  roles: string[];
  selectedRoles: string[];
  onToggle: (role: string) => void;
  onClear: () => void;
}) {
  return (
    <div
      className="shrink-0 border-b px-5 py-3"
      style={{ borderColor: CES_V32_COLORS.border, background: 'rgba(20, 26, 35, 0.72)' }}
    >
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
        <div
          className="flex items-center gap-2 whitespace-nowrap text-[10px] font-montserrat font-bold uppercase tracking-[0.18em]"
          style={{ color: CES_V32_COLORS.muted }}
        >
          <Filter size={12} />
          Assignee
        </div>

        {roles.map(role => {
          const active = selectedRoles.includes(role);
          return (
            <button
              key={role}
              type="button"
              onClick={() => onToggle(role)}
              className="ci-touch-target whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] transition-colors focus:outline-none focus-visible:ring-2"
              style={{
                borderColor: active ? 'rgba(0, 121, 112, 0.44)' : CES_V32_COLORS.borderStrong,
                background: active ? 'rgba(0, 121, 112, 0.18)' : CES_V32_COLORS.card,
                color: active ? CES_V32_COLORS.text : CES_V32_COLORS.slate,
              }}
            >
              {role}
            </button>
          );
        })}

        {selectedRoles.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="ci-touch-target inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]"
            style={{
              borderColor: 'rgba(199, 70, 0, 0.42)',
              background: 'rgba(199, 70, 0, 0.10)',
              color: '#FFB08B',
            }}
          >
            <X size={11} />
            Clear
          </button>
        )}
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
      className="ci-touch-target flex h-9 w-9 items-center justify-center rounded-[12px] transition-colors focus:outline-none focus-visible:ring-2"
      style={{ color: CES_V32_COLORS.slate }}
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
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{ borderColor: `${color}40`, background: `${color}10`, color }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      <span className="text-[9.5px] font-montserrat font-bold uppercase tracking-[0.16em]">
        {label}
      </span>
      <span className="text-[10px] font-outfit leading-none">{value}</span>
    </span>
  );
}

function MobileAgendaList({
  events,
  activeId,
  onSelect,
  today,
  store,
}: {
  events: RegulatoryEvent[];
  activeId: string | null;
  onSelect: (event: RegulatoryEvent) => void;
  today: Date;
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>;
}) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) {
    return (
      <SurfaceCard className="flex-1 flex items-center justify-center" padding="md">
        <EmptyState title="No events in this month." description="Try another month or switch to Sprint/Kanban/Gantt views." />
      </SurfaceCard>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      {sorted.map(event => {
        const isActive = event.id === activeId;
        const state = classifyInstance(event, today, store);
        const certified = store.isCertified(event.id);
        const dateLabel = new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        return (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event)}
            className="flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2"
            style={{
              borderColor: CES_V32_COLORS.border,
              background: isActive ? 'rgba(0, 121, 112, 0.10)' : 'transparent',
            }}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: CES_V32_COLORS.muted }}>{dateLabel}</p>
              <p className="mt-1 text-[14px] font-outfit text-white">{event.title}</p>
              <p className="mt-1 text-[11px] font-roboto" style={{ color: CES_V32_COLORS.slate }}>
                {event.ownerRole} · {event.time ? `${event.time}${event.timeEnd ? ` - ${event.timeEnd}` : ''}` : 'All day'} · {event.cadence}
              </p>
            </div>
            <span
              className="mt-1 inline-flex shrink-0 rounded-full px-2 py-1 text-[9px] font-montserrat font-bold uppercase tracking-[0.14em]"
              style={{
                background: `${certified ? '#A78BFA' : STATE_COLOR[state]}18`,
                color: certified ? '#C4B5FD' : STATE_COLOR[state],
              }}
            >
              {certified ? 'Certified' : STATE_LABEL[state]}
            </span>
          </button>
        );
      })}
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
