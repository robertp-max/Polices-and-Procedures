/**
 * WP-1.6 — Packaged Event-Selector Calendar (reusable FR-002 component).
 *
 * Views: month grid, week, agenda/list; prev/next; Today; search.
 * Filter chips per FR-002. Packet-store chips are disabled with an honest
 * tooltip when `packetStatusProvider` is not supplied — no fake data.
 *
 * READ ONLY replication of v6 calendar styling idioms (CalendarScreen /
 * EventsBoard). No route registration; integration is a later package.
 */

import { useMemo, useState, type ReactNode } from 'react';
import {
  buildCalendarEvents,
  type CesCalendarEvent,
} from '@/policy/ces/cesViewProjections';
import {
  REGULATORY_EVENTS,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { toCaliforniaISODate } from '@/policy/utils/californiaTime';
import { VeilDrawer } from '@/v6/components';
import { cx } from '@/v6/utils/classNames';
import {
  formatReportingPeriod,
  formatRequiredRoles,
  formatUnknownable,
  projectEventCardModel,
  type EventCardModel,
  type PacketStatusSnapshot,
} from './eventCardModel';
import {
  applyEventFilters,
  EMPTY_EVENT_FILTER_STATE,
  filterEventsInVisibleRange,
  getMonthLabel,
  getVisibleRange,
  isEventCompatibleWithTemplate,
  isPacketStoreDependentChip,
  navigateNext,
  navigatePrevious,
  PACKET_LIFECYCLE_STATUS_VALUES,
  PACKET_STORE_UNAVAILABLE_TOOLTIP,
  type CalendarAnchor,
  type CalendarViewMode,
  type EventFilterChipId,
  type EventFilterState,
  type FilterableEvent,
  type TemplateCompatibilityFilter,
  anchorFromDate,
  daysInMonth,
  toIsoDate,
} from './eventFilters';

// ─── Public props ────────────────────────────────────────────────────────────

export type { TemplateCompatibilityFilter };

export interface EventSelectorCalendarProps {
  /**
   * FR-001 template selection output or a reduced compatibility filter.
   * Feeds the calendar's compatible-event filter (family / workflow IDs).
   */
  selectedTemplate?: TemplateCompatibilityFilter | null;
  /** Explicit alias for selectedTemplate (either may be provided). */
  compatibilityFilter?: TemplateCompatibilityFilter | null;
  /** Called when the operator selects an event occurrence. */
  onSelectEvent: (eventCardModel: EventCardModel) => void;
  /**
   * Optional live packet-status lookup. When omitted, packet-dependent filter
   * chips render disabled with PACKET_STORE_UNAVAILABLE_TOOLTIP.
   */
  packetStatusProvider?: (
    eventInstanceId: string,
  ) => PacketStatusSnapshot | null | undefined;
  /** Optional injected calendar events (defaults to buildCalendarEvents()). */
  calendarEvents?: readonly CesCalendarEvent[];
  /** Optional injected regulatory events (defaults to REGULATORY_EVENTS). */
  regulatoryEvents?: readonly RegulatoryEvent[];
  /** Optional agency label for the selection drawer. */
  agencyLabel?: string;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function indexRegulatoryById(
  events: readonly RegulatoryEvent[],
): Map<string, RegulatoryEvent> {
  const map = new Map<string, RegulatoryEvent>();
  for (const e of events) {
    map.set(e.id, e);
  }
  return map;
}

function resolveRegulatory(
  calendarEvent: CesCalendarEvent,
  byId: Map<string, RegulatoryEvent>,
): RegulatoryEvent | null {
  const keys = [
    calendarEvent.sourceEventId,
    calendarEvent.id,
  ].filter((k): k is string => typeof k === 'string' && k.length > 0);
  for (const key of keys) {
    const found = byId.get(key);
    if (found) return found;
  }
  return null;
}

const VIEW_OPTIONS: readonly { id: CalendarViewMode; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'agenda', label: 'Agenda' },
];

const TOGGLE_CHIPS: readonly {
  id: EventFilterChipId;
  /** Base label; blocked/completed are rewritten to event-level when no provider. */
  label: string;
  key: keyof Pick<
    EventFilterState,
    | 'eligibleOnly'
    | 'existingDraft'
    | 'signedLocked'
    | 'blocked'
    | 'pastDue'
    | 'completed'
    | 'cancelled'
  >;
}[] = [
  { id: 'eligibleOnly', label: 'Eligible only', key: 'eligibleOnly' },
  { id: 'existingDraft', label: 'Existing draft', key: 'existingDraft' },
  { id: 'signedLocked', label: 'Signed/locked', key: 'signedLocked' },
  { id: 'blocked', label: 'Blocked', key: 'blocked' },
  { id: 'pastDue', label: 'Past due', key: 'pastDue' },
  { id: 'completed', label: 'Completed', key: 'completed' },
  { id: 'cancelled', label: 'Cancelled', key: 'cancelled' },
];

/** Chip label: blocked/completed are event-level when packet store is not wired. */
function toggleChipLabel(
  chip: (typeof TOGGLE_CHIPS)[number],
  packetStoreWired: boolean,
): string {
  if (!packetStoreWired && (chip.id === 'blocked' || chip.id === 'completed')) {
    return `${chip.label} (event-level)`;
  }
  return chip.label;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function uniqueSorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function ChipButton({
  active,
  disabled,
  label,
  onClick,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  title?: string;
}): ReactNode {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      aria-pressed={active ? true : false}
      onClick={onClick}
      className={cx(
        'min-h-tap rounded-md border px-md py-xs text-xs font-medium transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
        disabled
          ? 'cursor-not-allowed border-hairline bg-surface-glass text-muted opacity-60'
          : active
            ? 'border-brand-teal bg-brand-teal text-on-brand shadow-rest'
            : 'border-hairline bg-surface-glass text-brand-teal hover:bg-surface-hover',
      )}
    >
      {label}
    </button>
  );
}

function FieldRow({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-sm border-b border-hairline py-sm text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className={cx('font-medium', value === 'unknown' ? 'text-muted italic' : 'text-ink')}>
        {value}
      </dd>
    </div>
  );
}

function toPacketStatusFilterValue(value: string): EventFilterState['packetStatus'] {
  if (value.length === 0) return null;
  return (PACKET_LIFECYCLE_STATUS_VALUES as readonly string[]).includes(value)
    ? (value as NonNullable<EventFilterState['packetStatus']>)
    : null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EventSelectorCalendar({
  selectedTemplate = null,
  compatibilityFilter = null,
  onSelectEvent,
  packetStatusProvider,
  calendarEvents,
  regulatoryEvents,
  agencyLabel = 'Agency',
  className,
}: EventSelectorCalendarProps) {
  const templateFilter = compatibilityFilter ?? selectedTemplate ?? null;
  const packetStoreWired = typeof packetStatusProvider === 'function';

  const [view, setView] = useState<CalendarViewMode>('month');
  const [anchor, setAnchor] = useState<CalendarAnchor>(() => anchorFromDate(new Date()));
  const [filters, setFilters] = useState<EventFilterState>(EMPTY_EVENT_FILTER_STATE);
  const [drawerEvent, setDrawerEvent] = useState<FilterableEvent | null>(null);

  const todayIso = useMemo(() => toCaliforniaISODate(new Date()), []);

  const regById = useMemo(
    () => indexRegulatoryById(regulatoryEvents ?? REGULATORY_EVENTS),
    [regulatoryEvents],
  );

  const sourceCalendarEvents = useMemo(
    () => calendarEvents ?? buildCalendarEvents(),
    [calendarEvents],
  );

  /** Project all source events to card models (no date-window clamp). */
  const allCards: FilterableEvent[] = useMemo(() => {
    const fromCalendar = sourceCalendarEvents.map((ces) => {
      const reg = resolveRegulatory(ces, regById);
      const fallbackYear =
        ces.sourceDate && /^\d{4}/.test(ces.sourceDate)
          ? Number(ces.sourceDate.slice(0, 4))
          : anchor.year;
      const projected = projectEventCardModel({
        calendarEvent: ces,
        regulatoryEvent: reg,
        fallbackYear,
      });
      // Compatibility + status attach after base projection
      return projected;
    });

    // Include regulatory occurrences that may not appear in CES projection
    // (still no date clamp — navigation decides visibility).
    const seen = new Set(fromCalendar.map((c) => c.eventInstanceId));
    const regOnly: EventCardModel[] = [];
    for (const reg of regById.values()) {
      if (reg.isContext) continue;
      if (seen.has(reg.id)) continue;
      const { day, month, year } = (() => {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(reg.date);
        if (!m) return { day: 1, month: 1, year: anchor.year };
        return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
      })();
      const synthetic: CesCalendarEvent = {
        id: reg.id,
        label: reg.title,
        day,
        month,
        owner: reg.owner,
        progress: 0,
        tone: 'teal',
        sourceEventId: reg.id,
        sourceDate: reg.date,
        sourceKind: 'v3-regulatory-event',
        workflowId: reg.workflowId as CesCalendarEvent['workflowId'],
        workflow: reg.workflowId,
      };
      regOnly.push(
        projectEventCardModel({
          calendarEvent: synthetic,
          regulatoryEvent: reg,
          fallbackYear: year,
        }),
      );
    }

    const combined = [...fromCalendar, ...regOnly];

    return combined
      .filter((card) =>
        isEventCompatibleWithTemplate(
          {
            eventFamilyId: card.eventFamilyId,
            eventSubType: card.eventFamilyId,
            workflowId: card.workflowId,
          },
          templateFilter,
        ),
      )
      .map((card) => {
        const snap = packetStatusProvider?.(card.eventInstanceId) ?? null;
        if (!snap) return card as FilterableEvent;
        // Re-project with packet snapshot so card fields pick up known statuses.
        const ces: CesCalendarEvent = {
          id: card.eventInstanceId,
          label: card.eventTitle,
          day: card.day ?? 1,
          month: card.month ?? 1,
          owner: card.owner,
          progress: 0,
          tone: 'teal',
          sourceEventId: card.eventInstanceId,
          sourceDate: card.eventDate !== 'unknown' ? card.eventDate : undefined,
          workflow: card.workflowId ?? undefined,
        };
        const reg = regById.get(card.eventInstanceId) ?? null;
        const projected = projectEventCardModel({
          calendarEvent: ces,
          regulatoryEvent: reg,
          packetStatus: snap,
          fallbackYear: card.year ?? anchor.year,
        });
        return { ...projected, packetSnapshot: snap } satisfies FilterableEvent;
      });
  }, [
    sourceCalendarEvents,
    regById,
    templateFilter,
    packetStatusProvider,
    anchor.year,
  ]);

  const visibleRange = useMemo(() => getVisibleRange(view, anchor), [view, anchor]);

  const rangedCards = useMemo(
    () => filterEventsInVisibleRange(allCards, visibleRange),
    [allCards, visibleRange],
  );

  const filteredCards = useMemo(
    () => applyEventFilters(rangedCards, filters, todayIso, packetStoreWired),
    [rangedCards, filters, todayIso, packetStoreWired],
  );

  const domainOptions = useMemo(
    () => uniqueSorted(allCards.map((c) => c.domain ?? '').filter(Boolean)),
    [allCards],
  );
  const familyOptions = useMemo(
    () => uniqueSorted(allCards.map((c) => c.eventFamilyId ?? '').filter(Boolean)),
    [allCards],
  );
  const workflowOptions = useMemo(
    () => uniqueSorted(allCards.map((c) => c.workflowId ?? '').filter(Boolean)),
    [allCards],
  );
  const ownerOptions = useMemo(
    () => uniqueSorted(allCards.map((c) => c.owner).filter((o) => o && o !== 'unknown')),
    [allCards],
  );

  const periodLabel = useMemo(() => {
    if (view === 'week') {
      return `${visibleRange.start} – ${visibleRange.end}`;
    }
    return `${getMonthLabel(anchor.month)} ${anchor.year}`;
  }, [view, visibleRange, anchor.month, anchor.year]);

  const goToday = () => {
    setAnchor(anchorFromDate(new Date()));
  };

  const openDrawer = (event: FilterableEvent) => {
    setDrawerEvent(event);
  };

  const confirmSelect = (event: FilterableEvent) => {
    onSelectEvent(event);
    setDrawerEvent(null);
  };

  const setToggle = (
    key: (typeof TOGGLE_CHIPS)[number]['key'],
    id: EventFilterChipId,
  ) => {
    if (isPacketStoreDependentChip(id) && !packetStoreWired) return;
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Month / week grid cells ──────────────────────────────────────────────
  const gridCells = useMemo(() => {
    if (view === 'agenda') return null;

    if (view === 'week') {
      const start = new Date(
        Number(visibleRange.start.slice(0, 4)),
        Number(visibleRange.start.slice(5, 7)) - 1,
        Number(visibleRange.start.slice(8, 10)),
      );
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const iso = toIsoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
        return { iso, day: d.getDate(), inMonth: true };
      });
    }

    // month grid
    const firstWeekday = new Date(anchor.year, anchor.month - 1, 1).getDay();
    const totalDays = daysInMonth(anchor.year, anchor.month);
    const cells: Array<{ iso: string; day: number; inMonth: boolean } | null> = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({
        iso: toIsoDate(anchor.year, anchor.month, day),
        day,
        inMonth: true,
      });
    }
    return cells;
  }, [view, anchor, visibleRange]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, FilterableEvent[]>();
    for (const event of filteredCards) {
      if (!/^\d{4}-\d{2}-\d{2}/.test(event.eventDate)) continue;
      const key = event.eventDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [filteredCards]);

  return (
    <section
      className={cx(
        'relative rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset shadow-rest p-2xl',
        className,
      )}
      data-wp="WP-1.6"
      data-component="EventSelectorCalendar"
    >
      {/* Header: title + view switcher + period nav */}
      <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
        <div>
          <div className="flex flex-wrap items-center gap-sm">
            <h2 className="text-h3 font-medium text-ink">Event Selector</h2>
            <span className="rounded-full border border-hairline bg-surface-glass px-sm py-[2px] text-xs font-medium text-brand-teal-deep">
              {periodLabel}
            </span>
          </div>
          <p className="mt-xs text-xs text-muted">
            Select a mandated-event occurrence for the packet. Compatible with the selected template.
          </p>
        </div>

        <div className="flex flex-col items-end gap-md">
          <div className="inline-flex rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xs">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={cx(
                  'min-h-tap rounded-md px-lg text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                  view === opt.id
                    ? 'bg-brand-teal text-on-brand shadow-rest'
                    : 'text-secondary hover:bg-surface-hover',
                )}
                onClick={() => setView(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-xs">
            <button
              type="button"
              className="min-h-tap rounded-md border border-hairline bg-surface-glass px-md text-xs font-medium text-brand-teal hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
              onClick={() => setAnchor((a) => navigatePrevious(view, a))}
            >
              Previous
            </button>
            <button
              type="button"
              className="min-h-tap rounded-md border border-brand-teal bg-brand-teal px-md text-xs font-medium text-on-brand shadow-rest hover:shadow-hover focus-visible:outline-none focus-visible:shadow-focus"
              onClick={goToday}
            >
              Today
            </button>
            <button
              type="button"
              className="min-h-tap rounded-md border border-hairline bg-surface-glass px-md text-xs font-medium text-brand-teal hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
              onClick={() => setAnchor((a) => navigateNext(view, a))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-lg">
        <label className="block text-xs font-medium uppercase tracking-tag text-muted" htmlFor="event-selector-search">
          Search
        </label>
        <input
          id="event-selector-search"
          type="search"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Title, owner, family, workflow, id…"
          className="mt-xs w-full max-w-xl rounded-md border border-hairline bg-surface-glass px-md py-sm text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:shadow-focus"
        />
      </div>

      {/* Filter chips */}
      <div className="mb-xl flex flex-wrap gap-sm" role="group" aria-label="Event filters">
        <label className="sr-only" htmlFor="esc-domain">Domain</label>
        <select
          id="esc-domain"
          className="min-h-tap rounded-md border border-hairline bg-surface-glass px-md text-xs text-brand-teal"
          value={filters.domain ?? ''}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              domain: e.target.value || null,
            }))
          }
        >
          <option value="">Domain: all</option>
          {domainOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          aria-label="Event family"
          className="min-h-tap rounded-md border border-hairline bg-surface-glass px-md text-xs text-brand-teal"
          value={filters.eventFamily ?? ''}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              eventFamily: e.target.value || null,
            }))
          }
        >
          <option value="">Event family: all</option>
          {familyOptions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          aria-label="Workflow"
          className="min-h-tap rounded-md border border-hairline bg-surface-glass px-md text-xs text-brand-teal"
          value={filters.workflow ?? ''}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              workflow: e.target.value || null,
            }))
          }
        >
          <option value="">Workflow: all</option>
          {workflowOptions.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        <select
          aria-label="Owner"
          className="min-h-tap rounded-md border border-hairline bg-surface-glass px-md text-xs text-brand-teal"
          value={filters.owner ?? ''}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              owner: e.target.value || null,
            }))
          }
        >
          <option value="">Owner: all</option>
          {ownerOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <select
          aria-label="Packet status"
          data-testid="packet-status-filter"
          className="min-h-tap rounded-md border border-hairline bg-surface-glass px-md text-xs text-brand-teal disabled:cursor-not-allowed disabled:opacity-60"
          value={filters.packetStatus ?? ''}
          disabled={!packetStoreWired}
          title={packetStoreWired ? undefined : PACKET_STORE_UNAVAILABLE_TOOLTIP}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              packetStatus: toPacketStatusFilterValue(e.target.value),
            }))
          }
        >
          <option value="">Packet status: all</option>
          {/* Full PacketLifecycleStatus union — never a reduced subset. */}
          {PACKET_LIFECYCLE_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          aria-label="Workflow status"
          className="min-h-tap rounded-md border border-hairline bg-surface-glass px-md text-xs text-brand-teal"
          value={filters.workflowStatus ?? ''}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              workflowStatus: e.target.value || null,
            }))
          }
        >
          <option value="">Workflow status: all</option>
          <option value="overdue">overdue</option>
          <option value="critical">critical</option>
          <option value="due-soon">due-soon</option>
          <option value="on-track">on-track</option>
          <option value="scheduled">scheduled</option>
          <option value="complete">complete</option>
          <option value="blocked">blocked</option>
        </select>

        {TOGGLE_CHIPS.map((chip) => {
          const needsStore = isPacketStoreDependentChip(chip.id);
          const disabled = needsStore && !packetStoreWired;
          return (
            <ChipButton
              key={chip.id}
              label={toggleChipLabel(chip, packetStoreWired)}
              active={Boolean(filters[chip.key])}
              disabled={disabled}
              title={disabled ? PACKET_STORE_UNAVAILABLE_TOOLTIP : undefined}
              onClick={() => setToggle(chip.key, chip.id)}
            />
          );
        })}
      </div>

      {/* Views */}
      {view === 'agenda' ? (
        <AgendaList
          events={filteredCards}
          title={periodLabel}
          onOpen={openDrawer}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-hairline bg-surface-glass shadow-glass-inset">
          <div className="grid grid-cols-7 text-xs">
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                className="border border-hairline bg-tone-teal-bg/45 p-md text-center text-tag uppercase tracking-tag text-brand-teal"
              >
                {day}
              </div>
            ))}
            {(gridCells ?? []).map((cell, index) =>
              cell === null ? (
                <div
                  aria-hidden="true"
                  className="min-h-[120px] border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset"
                  key={`blank-${index}`}
                />
              ) : (
                <div
                  className="relative min-h-[120px] min-w-0 overflow-visible border border-hairline bg-surface-glass backdrop-blur-md p-md !shadow-none"
                  key={cell.iso}
                >
                  <p className="mb-md text-base font-medium text-brand-teal">{cell.day}</p>
                  <div className="grid gap-xs">
                    {(eventsByDate.get(cell.iso) ?? []).map((event) => (
                      <EventPill
                        key={event.eventInstanceId}
                        event={event}
                        onOpen={openDrawer}
                      />
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      <p className="mt-md text-xs text-muted">
        Showing {filteredCards.length} event{filteredCards.length === 1 ? '' : 's'}
        {' '}in {visibleRange.start} → {visibleRange.end}
        {templateFilter ? ' · template compatibility filter active' : ''}
      </p>

      <SelectionDrawer
        open={Boolean(drawerEvent)}
        event={drawerEvent}
        agencyLabel={agencyLabel}
        template={templateFilter}
        onClose={() => setDrawerEvent(null)}
        onSelect={confirmSelect}
      />
    </section>
  );
}

// ─── Subviews ────────────────────────────────────────────────────────────────

function EventPill({
  event,
  onOpen,
}: {
  event: FilterableEvent;
  onOpen: (event: FilterableEvent) => void;
}): ReactNode {
  const urgent =
    event.eventStatus === 'overdue' ||
    event.eventStatus === 'critical' ||
    event.eventStatus === 'blocked';
  return (
    <button
      type="button"
      className={cx(
        'block min-w-0 max-w-full w-full truncate rounded-md px-md py-sm text-left text-xs font-medium text-on-brand border border-transparent focus-visible:outline-none focus-visible:shadow-focus',
        urgent ? 'bg-brand-orange' : 'bg-brand-teal',
      )}
      onClick={() => onOpen(event)}
      aria-label={`${event.eventTitle}, ${event.eventDate}. Open selection drawer.`}
    >
      {event.eventTitle}
    </button>
  );
}

function AgendaList({
  events,
  title,
  onOpen,
}: {
  events: readonly FilterableEvent[];
  title: string;
  onOpen: (event: FilterableEvent) => void;
}): ReactNode {
  const sorted = [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  return (
    <div className="rounded-lg border border-hairline bg-surface-glass p-lg">
      <h3 className="mb-md text-sm font-medium text-ink">{title} — Agenda</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No events in this period for the current filters.</p>
      ) : (
        <ul className="grid gap-md">
          {sorted.map((event) => (
            <li key={event.eventInstanceId}>
              <button
                type="button"
                onClick={() => onOpen(event)}
                className="w-full rounded-lg border border-card bg-surface-glass p-md text-left shadow-glass-inset focus-visible:outline-none focus-visible:shadow-focus hover:bg-surface-hover"
              >
                <p className="text-xs text-brand-teal">{event.eventDate}</p>
                <h4 className="mt-xs text-sm font-medium text-brand-teal-deep">{event.eventTitle}</h4>
                <p className="mt-xs text-xs text-muted">
                  {event.owner}
                  {event.eventFamilyId ? ` · ${event.eventFamilyId}` : ''}
                  {event.workflowId ? ` · ${event.workflowId}` : ''}
                </p>
                <dl className="mt-sm grid grid-cols-2 gap-xs text-[11px] text-muted">
                  <div>Event-family ID: {event.eventFamilyId ?? 'unknown'}</div>
                  <div>Event-instance ID: {event.eventInstanceId}</div>
                  <div>Workflow-instance ID: {formatUnknownable(event.workflowInstanceId)}</div>
                  <div>Packet status: {formatUnknownable(event.packetStatus)}</div>
                  <div>Evidence completeness: {formatUnknownable(event.evidenceCompleteness)}</div>
                  <div>Approval status: {formatUnknownable(event.approvalStatus)}</div>
                  <div>Signature status: {formatUnknownable(event.signatureStatus)}</div>
                  <div>Blocker count: {formatUnknownable(event.blockerCount)}</div>
                  <div>
                    Required-form completion:{' '}
                    {typeof event.requiredFormCompletion === 'number'
                      ? `${event.requiredFormCompletion}%`
                      : 'unknown'}
                  </div>
                </dl>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SelectionDrawer({
  open,
  event,
  agencyLabel,
  template,
  onClose,
  onSelect,
}: {
  open: boolean;
  event: FilterableEvent | null;
  agencyLabel: string;
  template: TemplateCompatibilityFilter | null;
  onClose: () => void;
  onSelect: (event: FilterableEvent) => void;
}): ReactNode {
  if (!event) {
    return (
      <VeilDrawer open={false} onClose={onClose} eyebrow="Event" title="Select an event">
        {null}
      </VeilDrawer>
    );
  }

  const snap = event.packetSnapshot;
  const templateId =
    template?.packetTemplateId ??
    template?.packet_template_id ??
    'unknown';
  const compatible =
    isEventCompatibleWithTemplate(
      {
        eventFamilyId: event.eventFamilyId,
        eventSubType: event.eventFamilyId,
        workflowId: event.workflowId,
      },
      template,
    );

  const hasDraft = snap?.hasExistingDraft === true;
  const signedOrLocked = snap?.isSignedOrLocked === true;
  const packetKnown = Boolean(snap);

  return (
    <VeilDrawer
      open={open}
      onClose={onClose}
      eyebrow="Event selection"
      title={event.eventTitle}
      tone="teal"
      footer={
        <div className="flex flex-wrap gap-sm">
          <button
            type="button"
            className="min-h-tap rounded-md border border-brand-teal bg-brand-teal px-md text-sm font-medium text-on-brand shadow-rest"
            onClick={() => onSelect(event)}
          >
            {hasDraft ? 'Open existing draft' : 'Generate new packet'}
          </button>
          <ActionButton label="Continue review" disabled={!packetKnown} />
          <ActionButton label="Track signatures" disabled={!packetKnown} />
          <ActionButton label="View signed packet" disabled={!signedOrLocked} />
          <ActionButton label="Open in Google Drive" disabled={!snap?.driveDestination} />
          <ActionButton label="Create amendment" disabled={!signedOrLocked} />
          <ActionButton label="Create superseding version" disabled={!signedOrLocked} />
          <ActionButton label="Cancel" onClick={onClose} />
        </div>
      }
    >
      <dl className="grid gap-0" data-testid="event-selection-drawer-fields">
        <FieldRow label="Agency" value={agencyLabel} />
        <FieldRow label="Event title" value={event.eventTitle} />
        <FieldRow label="Event date" value={event.eventDate} />
        <FieldRow
          label="Reporting period"
          value={formatReportingPeriod(event.reportingPeriodStart, event.reportingPeriodEnd)}
        />
        <FieldRow label="Event-family ID" value={event.eventFamilyId ?? 'unknown'} />
        <FieldRow label="Event-instance ID" value={event.eventInstanceId} />
        <FieldRow label="Workflow ID" value={event.workflowId ?? 'unknown'} />
        <FieldRow label="Workflow-instance ID" value={formatUnknownable(event.workflowInstanceId)} />
        <FieldRow label="Owner" value={event.owner} />
        <FieldRow label="Event status" value={formatUnknownable(event.eventStatus)} />
        <FieldRow label="Cadence" value={event.cadence ?? 'unknown'} />
        <FieldRow label="Regulatory driver" value={event.regulatoryDriver ?? 'unknown'} />
        <FieldRow label="Packet template" value={templateId} />
        <FieldRow label="Template compatible" value={compatible ? 'yes' : 'no'} />
        <FieldRow label="Packet status" value={formatUnknownable(event.packetStatus)} />
        <FieldRow
          label="Prior-period packet status"
          value={formatUnknownable(snap?.priorPeriodPacketStatus ?? 'unknown')}
        />
        <FieldRow
          label="Required-form completion"
          value={
            typeof event.requiredFormCompletion === 'number'
              ? `${event.requiredFormCompletion}%`
              : 'unknown'
          }
        />
        <FieldRow
          label="Evidence completeness"
          value={formatUnknownable(event.evidenceCompleteness)}
        />
        <FieldRow label="Approval status" value={formatUnknownable(event.approvalStatus)} />
        <FieldRow label="Signature status" value={formatUnknownable(event.signatureStatus)} />
        <FieldRow label="Blocker count" value={formatUnknownable(event.blockerCount)} />
        <FieldRow
          label="Required approvals"
          value={formatRequiredRoles(event.requiredApprovals)}
        />
        <FieldRow
          label="Required signers"
          value={formatRequiredRoles(event.requiredSigners)}
        />
        <FieldRow
          label="Open dependencies"
          value={
            snap?.openDependencies && snap.openDependencies.length > 0
              ? snap.openDependencies.join(', ')
              : 'unknown'
          }
        />
        <FieldRow
          label="Trend-comparison readiness"
          value="unknown"
        />
        <FieldRow
          label="Drive destination"
          value={formatUnknownable(snap?.driveDestination ?? 'unknown')}
        />
      </dl>
    </VeilDrawer>
  );
}

function ActionButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? PACKET_STORE_UNAVAILABLE_TOOLTIP : undefined}
      onClick={onClick}
      className={cx(
        'min-h-tap rounded-md border px-md text-xs font-medium focus-visible:outline-none focus-visible:shadow-focus',
        disabled
          ? 'cursor-not-allowed border-hairline text-muted opacity-60'
          : 'border-hairline bg-surface-glass text-brand-teal hover:bg-surface-hover',
      )}
    >
      {label}
    </button>
  );
}

export default EventSelectorCalendar;
