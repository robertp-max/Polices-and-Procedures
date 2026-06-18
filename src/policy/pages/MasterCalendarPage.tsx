import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarRange,
  CloudUpload, Filter, X,
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
  STATE_COLOR, STATE_LABEL, STATE_SOFT, classifyInstance,
} from '@/policy/components/regulatory/timelineState';
import { SprintTaskPanel } from '@/policy/ces/components/details/SprintTaskPanel';
import { regulatoryEventOverlapsSprint } from '@/policy/pm/sprintWindows';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import { SprintScopeToolbar } from '@/policy/components/pm/SprintScopeToolbar';
import { SprintBoardView, KanbanView, GanttView } from '@/policy/components/pm/PmViews';
import { V3TaskDetailPanel } from '@/policy/components/pm/V3TaskDetailPanel';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { useCalendarSyncStore } from '@/policy/stores/calendarSyncStore';
import { SurfaceCard, EmptyState, PageHeader, ActionButton } from '@/policy/components/ui';
import { VeilDrawer } from '@/policy/components/ui/VeilDrawer';
import { useIsLightMode } from '@/policy/stores/uiStore';
import {
  CesEventPreviewModal,
  CesInteractionStyles,
  useCesInfiniteZoom,
} from '@/policy/ces/components/calendar/CesEventInteraction';
import { getSwimlaneRegistryEntry, getLiveEventDisplay } from '@/policy/workflows/swimlanes/swimlaneRegistry';

export type PmView = 'calendar' | 'sprint' | 'kanban' | 'gantt';

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

function normalizeRoleForFilter(value?: string | null) {
  // Title case (or exact casing) per #4 CES design for clean corporate filters. Use live data casing.
  return normalizeRoleLabel(value);
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 1920 : window.innerWidth,
  );
  const isMobileLayout = viewportWidth < 640; // agenda primary on small screens, no bleed from grids
  const isLightMode = useIsLightMode(); // audited via useShellStore helper (isLight / isLightMode)
  // Light fix: button text uses isLightMode to avoid text-white/85 low contrast on light surface. Targeted to calendar page controls.

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
          .map(event => normalizeRoleForFilter(event.ownerRole))
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
      selectedRoles.includes(normalizeRoleForFilter(event.ownerRole)),
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

  // Live REGULATORY + design display model (ensures calendar events use canonical non-mock content matching panels)
  const activeDisplay = useMemo(() => (activeInstance ? getLiveEventDisplay(activeInstance.id) : null), [activeInstance]);

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

  // Live rollup header: TODAY label always references the authoritative TODAY_ANCHOR (June 2026) for clean corporate header per #4 CES
  const todayMonthLabel = new Date(today.getFullYear(), today.getMonth(), 1)
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
  const filteredRollup = useMemo(() => countByState(filteredMonthInstances, today, store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredMonthInstances, today, store.completions, store.stepStates],
  );

  // Live rollup total (for header / upcoming) — authoritative execution state rollup
  const liveRollupTotal = filteredRollup.overdue + filteredRollup.blocked + filteredRollup.dueSoon + filteredRollup.onTrack + filteredRollup.complete;

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

  // Enforce calendar (agenda primary) on <640 to match #4 responsive + staffing calendar; prevents any grid bleed from kanban/gantt/sprint columns on small screens.
  useEffect(() => {
    if (viewportWidth < 640 && view !== 'calendar') {
      setView('calendar');
    }
  }, [viewportWidth, view]);

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
    <div className="flex flex-col h-full w-full font-sans">
      <CesInteractionStyles />

      <div className="px-3 sm:px-5 pt-3 sm:pt-5 pb-2 sm:pb-3 overflow-hidden">
        <PageHeader
          eyebrow="COMPLIANCE EXECUTION"
          title={view === 'sprint' ? 'Sprint Execution' : view === 'gantt' ? 'Project Gantt · CES projected tasks' : view === 'kanban' ? 'Kanban · CES tasks' : 'Master Calendar'}
          description="Mandated regulatory events and CES execution control surface. Filter by role, switch views, drill into workflows."
          actions={
            <ActionButton
              variant="secondary"
              size="sm"
              leftIcon={<CloudUpload size={14} className={bulkSyncPending ? 'animate-pulse' : ''} />}
              onClick={handleBulkSync}
              disabled={bulkSyncPending}
            >
              {bulkSyncPending ? 'SYNCING…' : 'SYNC ALL EVENTS'}
            </ActionButton>
          }
        />
      </div>

      {/* View tabs Calendar/Kanban/Gantt + assignee filter pills — premium clean, no bleed per design #4. Full width for occupy entire card. */}
      <div className="px-0 sm:px-0 pb-2 sm:pb-3 flex flex-col gap-2 sm:gap-2.5 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 overflow-hidden max-w-full">
          <div
            className="inline-flex items-center p-0.5"
            style={{ background: 'transparent', border: 'none' }}
            role="tablist"
            aria-label="View mode"
          >
            <ViewToggleButton active={view === 'calendar'} onClick={() => setView('calendar')}>
              Calendar
            </ViewToggleButton>
            <ViewToggleButton active={view === 'kanban'} onClick={() => setView('kanban')}>
              Kanban
            </ViewToggleButton>
            <ViewToggleButton active={view === 'gantt'} onClick={() => setView('gantt')}>
              Gantt
            </ViewToggleButton>
            {view === 'sprint' && (
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--v3-orange)', background: 'rgba(224,123,44,0.1)' }}>
                <CalendarRange size={13} /> Sprint
              </span>
            )}
          </div>

          {/* State legend (exact design #4 / img4 stats) + count — clean no bleed/borders/edges */}
          {(view === 'calendar' || view === 'gantt' || view === 'kanban') && (
            <div className="flex items-center gap-2 ces-state-legend" data-design-legend="state" style={{ border: 'none', background: 'transparent' }}>
              <StateLegend rollup={filteredRollup} />
              <span
                className="text-[9px] font-mono px-1.5 py-px rounded tabular-nums"
                style={{ background: isLightMode ? 'var(--ces-canvas)' : 'rgba(255,255,255,0.015)', color: 'var(--v3-text-tertiary)', border: 'none' }}
                aria-label="Filtered events shown"
              >
                {filteredMonthInstances.length} / {monthInstances.length}
              </span>
            </div>
          )}

          <div className="flex-1" />

          {/* Header + TODAY label exactly like #4 CES: "TODAY, June 2026" prominent clean, no extra borders */}
          {view === 'calendar' && (
            <div className="ces-date-nav">
              <button onClick={() => shiftMonth(-1)} aria-label="Previous month" className="px-1 py-0.5 text-[var(--v3-text-secondary)]" style={{ border: 'none', background: 'transparent' }}><ChevronLeft size={15} /></button>
              <span
                onClick={goToday}
                className="px-3 py-0.5 text-[13px] font-bold tracking-[0.02em] whitespace-nowrap cursor-pointer select-none"
                style={{ color: 'var(--v3-text-primary)', border: 'none', fontWeight: 700 }}
                aria-label="Jump to today"
              >
                TODAY, {todayMonthLabel}
              </span>
              <button onClick={() => shiftMonth(+1)} aria-label="Next month" className="px-1 py-0.5 text-[var(--v3-text-secondary)]" style={{ border: 'none', background: 'transparent' }}><ChevronRight size={15} /></button>
            </div>
          )}
        </div>

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
          <div className="rounded-xl" style={{ border: 'none', background: isLightMode ? 'var(--ces-canvas)' : 'rgba(255,255,255,0.012)' }}>
            <SprintScopeToolbar />
          </div>
        )}
      </div>

      {/* Main content — full bleed (Agent 13 / coord Agent 5): main calendar + subviews occupy ENTIRE screen (h-full w-full, no borders, no padding). Grid/canvas fills available area per designs. */}
      <div className="flex-1 min-h-0 w-full h-full overflow-hidden overflow-x-hidden overflow-y-hidden" style={{ background: isLightMode ? 'var(--ces-canvas)' : 'transparent', border: 'none', borderRadius: 0, padding: 0 }}>
        <div className="h-full w-full overflow-hidden overflow-x-hidden overflow-y-hidden max-w-full" style={{ background: isLightMode ? 'var(--ces-canvas)' : 'transparent', border: 'none', borderRadius: 0, padding: 0 }}>
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
              /* Desktop split: full-bleed left monthly grid + right upcoming panel (live data) matching Image #4 CES desktop mockup */
              <div className="flex h-full w-full overflow-hidden overflow-x-hidden" data-ces-calendar data-live-regulatory={activeDisplay ? 'true' : 'false'} style={{ padding: 0, margin: 0, border: 'none', background: isLightMode ? 'var(--ces-canvas)' : 'transparent' }}>
                <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden custom-scrollbar overflow-hidden" style={{ border: 'none', background: 'inherit' }}>
                  <div className="h-full w-full min-w-[720px] overflow-hidden">
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
                {/* Right upcoming panel — clean corporate light, live regulatory, NO borders/edges/z bleed per Image #4 CES */}
                <div className="hidden lg:flex w-72 flex-col overflow-y-auto custom-scrollbar flex-shrink-0" style={{ border: 'none', background: isLightMode ? '#FFFFFF' : 'transparent', boxShadow: 'none' }}>
                  <div className="px-3 py-2 text-[9px] font-montserrat font-bold tracking-[0.16em] text-[var(--v3-text-tertiary)] sticky top-0 bg-inherit" style={{ zIndex: 1, border: 'none' }}>Upcoming · {liveRollupTotal}</div>
                  {filteredMonthInstances.slice(0, 6).map(ev => (
                    <button key={ev.id} onClick={() => selectInstance(ev)} className="text-left px-3 py-1.5 text-[11px] hover:bg-[var(--v3-teal)]/5 truncate" style={{ border: 'none', color: 'var(--v3-text-primary)', borderBottom: 'none', background: 'transparent' }}>
                      {new Date(ev.date).toLocaleDateString('en-US', {month:'short',day:'numeric'})} — {ev.title}
                    </button>
                  ))}
                  {filteredMonthInstances.length === 0 && <div className="px-3 py-2 text-[10px] text-[var(--v3-text-tertiary)]">No events this month.</div>}
                </div>
              </div>
            )
          ) : view === 'sprint' ? (
            <div className="h-full w-full overflow-hidden" style={{ background: 'transparent', padding: 0 }}>
              <SprintBoardView onSelect={selectTask} selectedEventId={activeInstance?.id ?? null} />
            </div>
          ) : view === 'kanban' ? (
            <div className="h-full w-full overflow-hidden overflow-x-hidden" style={{ background: 'transparent', border: 'none', borderRadius: 0, padding: 0 }} data-ces-calendar>
              <KanbanView onSelect={selectTask} selectedEventId={activeInstance?.id ?? null} />
            </div>
          ) : (
            <div className="h-full w-full overflow-hidden overflow-x-hidden" style={{ background: 'transparent', border: 'none', borderRadius: 0, padding: 0 }} data-ces-calendar>
              <GanttView onSelect={selectTask} selectedEventId={activeInstance?.id ?? null} />
            </div>
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
              className="ci-touch-target rounded-md border px-3 py-1.5 text-[11px] font-montserrat font-bold uppercase tracking-[0.14em] disabled:opacity-45"
              style={{ borderColor: 'var(--ci-overlay-active-border)', background: 'var(--ci-overlay-border)', color: isLightMode ? '#1F1C1B' : 'rgba(255,255,255,0.85)' }}
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

function ViewToggleButton({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  // Premium corporate segment button — tuned for tight clean bar with date + filters
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[9px] font-semibold tracking-[0.1em] transition-all focus:outline-none focus-visible:ring-1"
      style={{
        background: active ? 'rgba(0, 209, 193, 0.12)' : 'transparent',
        color: active ? 'var(--v3-teal-light)' : 'var(--v3-text-secondary)',
        border: 'none',
        height: '20px',
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
  // Premium clean assignee/role filter pills (Image #4 CES): rounded, title-case labels, teal active, orange clear, no borders/edges, clean light grid friendly
  return (
    <div className="ces-premium-filter-bar" role="group" aria-label="Assignee / role filters">
      <div className="ces-filter-label">
        <Filter size={11} /> Assignee
      </div>

      {roles.slice(0, 9).map(role => {
        const active = selectedRoles.includes(role);
        return (
          <button
            key={role}
            type="button"
            onClick={() => onToggle(role)}
            className={`ces-filter-pill ${active ? 'active' : ''}`}
            aria-pressed={active}
            aria-label={role}
            // title= removed (was causing native hover tooltip on chip); aria-label kept
          >
            {role}
          </button>
        );
      })}

      {selectedRoles.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="ces-filter-clear"
          aria-label="Clear all assignee filters"
        >
          <X size={9} /> CLEAR
        </button>
      )}
    </div>
  );
}

/* ─── State legend using live rollup (countByState) — exact match to design #4 / img4 stats, clean no borders/edges ────────────── */
function StateLegend({
  rollup,
}: {
  rollup: { overdue: number; blocked: number; dueSoon: number; onTrack: number; complete: number };
}) {
  const red = rollup.overdue + rollup.blocked;
  const amber = rollup.dueSoon;
  const teal = rollup.onTrack + rollup.complete;
  return (
    <div className="ces-state-legend flex gap-2 text-[10px] font-bold tracking-wider">
      <LegendPill color="#BE123C" label="BLOCK" value={red} />
      <LegendPill color="#E07B2C" label="DUE" value={amber} />
      <LegendPill color="#00D1C1" label="TRACK" value={teal} />
    </div>
  );
}

function LegendPill({ color, label, value }: { color: string; label: string; value: number }) {
  // Exact replica of design #4 / img4 — rounded pills, uppercase labels, NO borders/edges, clean light grid friendly
  return (
    <div
      className="ces-legend-pill px-2 py-0.5 rounded flex gap-2 overflow-hidden"
      style={{
        border: 'none',
        background: 'transparent',
        color,
      }}
    >
      <span className="opacity-60 text-[9px] tracking-[0.1em]">{label}</span> <span className="font-semibold tabular-nums">{value}</span>
    </div>
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
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full max-w-full overflow-x-hidden overflow-hidden">
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
            className="flex w-full items-start justify-between gap-2 sm:gap-3 border-b px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-1 overflow-hidden"
            style={{
              borderColor: 'var(--v3-border-subtle)',
              background: isActive ? 'rgba(0,209,193,0.06)' : 'transparent',
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-montserrat font-bold uppercase tracking-[0.14em] text-[var(--v3-text-tertiary)] truncate">{dateLabel}</p>
              <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px] font-semibold text-[var(--v3-text-primary)] truncate">{event.title}</p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] truncate" style={{ color: 'var(--v3-text-secondary)' }}>
                {event.ownerRole} · {event.time ? `${event.time}${event.timeEnd ? ` - ${event.timeEnd}` : ''}` : 'All day'} · {event.cadence}
              </p>
            </div>
            <span
              className="mt-0.5 sm:mt-1 inline-flex shrink-0 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.14em] overflow-hidden"
              style={{
                background: certified ? 'rgba(0,121,112,0.12)' : STATE_SOFT[state],
                color: certified ? 'var(--v3-teal, #007970)' : STATE_COLOR[state],
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
