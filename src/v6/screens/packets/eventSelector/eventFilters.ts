/**
 * WP-1.6 — pure filter predicate builders + template↔event compatibility.
 *
 * Compatibility matches on event-family / workflow IDs from the template's
 * FR-001 compatibility lists — never title regex.
 *
 * Visible ranges are derived purely from navigation state. There is no
 * hardcoded studio date-window clamp (no forced Jan–Jun 2026).
 */

import {
  ALLOWED_TRANSITIONS,
  type PacketLifecycleStatus,
} from '@/policy/packets/contracts';
import type { EventCardModel, PacketStatusSnapshot, UnknownField } from './eventCardModel';

/**
 * Full packet lifecycle status list for the packet-status filter.
 *
 * Sourced at runtime from the contracts state-machine transition table
 * (`ALLOWED_TRANSITIONS.packet` / `PACKET_LIFECYCLE_TRANSITIONS`) — never a
 * locally retyped subset. Do not invent values here.
 */
export const PACKET_LIFECYCLE_STATUS_VALUES: readonly PacketLifecycleStatus[] =
  Object.keys(ALLOWED_TRANSITIONS.packet) as PacketLifecycleStatus[];

// ─── Template compatibility (FR-001 → FR-002 filter) ─────────────────────────

/**
 * Template selection output / compatibility filter.
 * Accepts both FR-001 snake_case and camelCase keys.
 */
export interface TemplateCompatibilityFilter {
  packet_archetype_id?: string;
  packet_template_id?: string;
  compatible_event_family_ids?: readonly string[];
  compatible_workflow_ids?: readonly string[];
  packetArchetypeId?: string;
  packetTemplateId?: string;
  compatibleEventFamilyIds?: readonly string[];
  compatibleWorkflowIds?: readonly string[];
}

/** Minimal event shape needed for compatibility matching. */
export interface CompatibilityEventRef {
  eventFamilyId?: string | null;
  eventSubType?: string | null;
  workflowId?: string | null;
}

export interface NormalizedCompatibilityLists {
  eventFamilyIds: readonly string[];
  workflowIds: readonly string[];
  packetTemplateId: string | null;
  packetArchetypeId: string | null;
}

function nonEmptyIds(list: readonly string[] | undefined): string[] {
  if (!list || list.length === 0) return [];
  return list.map((id) => id.trim()).filter((id) => id.length > 0);
}

/** Normalize snake_case / camelCase FR-001 template selection output. */
export function normalizeCompatibilityFilter(
  template: TemplateCompatibilityFilter | null | undefined,
): NormalizedCompatibilityLists | null {
  if (!template) return null;
  const eventFamilyIds = nonEmptyIds(
    template.compatibleEventFamilyIds ?? template.compatible_event_family_ids,
  );
  const workflowIds = nonEmptyIds(
    template.compatibleWorkflowIds ?? template.compatible_workflow_ids,
  );
  const packetTemplateId =
    template.packetTemplateId?.trim() ||
    template.packet_template_id?.trim() ||
    null;
  const packetArchetypeId =
    template.packetArchetypeId?.trim() ||
    template.packet_archetype_id?.trim() ||
    null;
  return { eventFamilyIds, workflowIds, packetTemplateId, packetArchetypeId };
}

/**
 * True when the event is compatible with the template's family/workflow lists.
 *
 * Rules:
 * - No template / empty lists on both dimensions → all events pass.
 * - Non-empty family list → event family (or eventSubType) must be in the list.
 * - Non-empty workflow list → event workflowId must be in the list.
 * - When both lists are non-empty, the event must satisfy BOTH (AND).
 * - Matching is exact string equality on IDs — never title regex.
 */
export function isEventCompatibleWithTemplate(
  event: CompatibilityEventRef,
  template: TemplateCompatibilityFilter | null | undefined,
): boolean {
  const lists = normalizeCompatibilityFilter(template);
  if (!lists) return true;
  const { eventFamilyIds, workflowIds } = lists;
  if (eventFamilyIds.length === 0 && workflowIds.length === 0) return true;

  const family = (event.eventFamilyId ?? event.eventSubType ?? '').trim();
  const workflow = (event.workflowId ?? '').trim();

  if (eventFamilyIds.length > 0 && workflowIds.length > 0) {
    return eventFamilyIds.includes(family) && workflowIds.includes(workflow);
  }
  if (eventFamilyIds.length > 0) {
    return eventFamilyIds.includes(family);
  }
  return workflowIds.includes(workflow);
}

export function buildCompatibilityPredicate(
  template: TemplateCompatibilityFilter | null | undefined,
): (event: CompatibilityEventRef) => boolean {
  return (event) => isEventCompatibleWithTemplate(event, template);
}

// ─── Visible range / navigation (no year clamp) ──────────────────────────────

export type CalendarViewMode = 'month' | 'week' | 'agenda';

export interface DateRange {
  /** Inclusive start YYYY-MM-DD */
  start: string;
  /** Inclusive end YYYY-MM-DD */
  end: string;
}

export interface CalendarAnchor {
  /** 1-based month */
  month: number;
  year: number;
  /** Day of month (used by week view) */
  day: number;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function clampDayToMonth(year: number, month: number, day: number): number {
  const max = daysInMonth(year, month);
  return Math.min(Math.max(1, day), max);
}

/** Build a CalendarAnchor for "today" (local calendar; no fixed studio window). */
export function anchorFromDate(date: Date = new Date()): CalendarAnchor {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

/**
 * Inclusive visible range for the current view + anchor.
 * Month → full calendar month; week → Sun–Sat containing anchor day;
 * agenda → same as month (list of the active month).
 */
export function getVisibleRange(
  view: CalendarViewMode,
  anchor: CalendarAnchor,
): DateRange {
  const year = anchor.year;
  const month = anchor.month;
  const day = clampDayToMonth(year, month, anchor.day);

  if (view === 'week') {
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay(); // 0 = Sun
    const startDate = new Date(year, month - 1, day - weekday);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + 6,
    );
    return {
      start: toIsoDate(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
      ),
      end: toIsoDate(
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate(),
      ),
    };
  }

  // month + agenda: full month of the anchor
  const last = daysInMonth(year, month);
  return {
    start: toIsoDate(year, month, 1),
    end: toIsoDate(year, month, last),
  };
}

/** Previous period for the active view (crosses year boundaries freely). */
export function navigatePrevious(
  view: CalendarViewMode,
  anchor: CalendarAnchor,
): CalendarAnchor {
  if (view === 'week') {
    const date = new Date(anchor.year, anchor.month - 1, anchor.day);
    date.setDate(date.getDate() - 7);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
  // month / agenda
  if (anchor.month === 1) {
    return {
      year: anchor.year - 1,
      month: 12,
      day: clampDayToMonth(anchor.year - 1, 12, anchor.day),
    };
  }
  return {
    year: anchor.year,
    month: anchor.month - 1,
    day: clampDayToMonth(anchor.year, anchor.month - 1, anchor.day),
  };
}

/** Next period for the active view (crosses year boundaries freely — including 2027+). */
export function navigateNext(
  view: CalendarViewMode,
  anchor: CalendarAnchor,
): CalendarAnchor {
  if (view === 'week') {
    const date = new Date(anchor.year, anchor.month - 1, anchor.day);
    date.setDate(date.getDate() + 7);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
  if (anchor.month === 12) {
    return {
      year: anchor.year + 1,
      month: 1,
      day: clampDayToMonth(anchor.year + 1, 1, anchor.day),
    };
  }
  return {
    year: anchor.year,
    month: anchor.month + 1,
    day: clampDayToMonth(anchor.year, anchor.month + 1, anchor.day),
  };
}

/** Compare ISO dates (YYYY-MM-DD). */
export function compareIsoDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function isIsoDateInRange(iso: string, range: DateRange): boolean {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return false;
  const d = iso.slice(0, 10);
  return d >= range.start && d <= range.end;
}

/**
 * Filter events to those whose eventDate falls in range.
 * Intentionally has NO year/window clamp — any navigable year (incl. 2027) works.
 */
export function filterEventsInVisibleRange<T extends { eventDate: string }>(
  events: readonly T[],
  range: DateRange,
): T[] {
  return events.filter((e) => isIsoDateInRange(e.eventDate, range));
}

// ─── FR-002 filter chips ─────────────────────────────────────────────────────

export type EventFilterChipId =
  | 'domain'
  | 'eventFamily'
  | 'workflow'
  | 'owner'
  | 'packetStatus'
  | 'workflowStatus'
  | 'eligibleOnly'
  | 'existingDraft'
  | 'signedLocked'
  | 'blocked'
  | 'pastDue'
  | 'completed'
  | 'cancelled';

/**
 * Chips that require a live packetStatusProvider — never faked.
 * Note: `blocked` and `completed` are NOT listed — when no provider is wired
 * they fall back to event-level urgency semantics (chip labeled event-level).
 */
export const PACKET_STORE_DEPENDENT_CHIPS: readonly EventFilterChipId[] = [
  'packetStatus',
  'eligibleOnly',
  'existingDraft',
  'signedLocked',
  'cancelled',
] as const;

export const PACKET_STORE_UNAVAILABLE_TOOLTIP =
  'unavailable until packet store is wired';

export function isPacketStoreDependentChip(id: EventFilterChipId): boolean {
  return (PACKET_STORE_DEPENDENT_CHIPS as readonly string[]).includes(id);
}

export interface EventFilterState {
  search: string;
  domain: string | null;
  eventFamily: string | null;
  workflow: string | null;
  owner: string | null;
  packetStatus: PacketLifecycleStatus | null;
  workflowStatus: string | null;
  eligibleOnly: boolean;
  existingDraft: boolean;
  signedLocked: boolean;
  blocked: boolean;
  pastDue: boolean;
  completed: boolean;
  cancelled: boolean;
}

export const EMPTY_EVENT_FILTER_STATE: EventFilterState = {
  search: '',
  domain: null,
  eventFamily: null,
  workflow: null,
  owner: null,
  packetStatus: null,
  workflowStatus: null,
  eligibleOnly: false,
  existingDraft: false,
  signedLocked: false,
  blocked: false,
  pastDue: false,
  completed: false,
  cancelled: false,
};

export interface FilterableEvent extends EventCardModel {
  /** Optional live packet snapshot when provider is wired. */
  packetSnapshot?: PacketStatusSnapshot | null;
}

function isUnknown(value: string | number | UnknownField | null | undefined): boolean {
  return value === 'unknown' || value === null || value === undefined;
}

/** Search predicate — title, owner, ids, family, workflow (substring, case-insensitive). */
export function matchesSearch(event: EventCardModel, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    event.eventTitle,
    event.owner,
    event.eventInstanceId,
    event.eventFamilyId ?? '',
    event.workflowId ?? '',
    event.domain ?? '',
    event.eventDate,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function buildSearchPredicate(search: string): (event: EventCardModel) => boolean {
  return (event) => matchesSearch(event, search);
}

export function buildDomainPredicate(domain: string | null): (event: EventCardModel) => boolean {
  if (!domain) return () => true;
  return (event) => (event.domain ?? '') === domain;
}

export function buildEventFamilyPredicate(
  familyId: string | null,
): (event: EventCardModel) => boolean {
  if (!familyId) return () => true;
  return (event) => (event.eventFamilyId ?? '') === familyId;
}

export function buildWorkflowPredicate(
  workflowId: string | null,
): (event: EventCardModel) => boolean {
  if (!workflowId) return () => true;
  return (event) => (event.workflowId ?? '') === workflowId;
}

export function buildOwnerPredicate(owner: string | null): (event: EventCardModel) => boolean {
  if (!owner) return () => true;
  return (event) => event.owner === owner;
}

export function buildWorkflowStatusPredicate(
  status: string | null,
): (event: EventCardModel) => boolean {
  if (!status) return () => true;
  return (event) => {
    if (isUnknown(event.workflowStatus) && isUnknown(event.eventStatus)) return false;
    return event.workflowStatus === status || event.eventStatus === status;
  };
}

export function buildPastDuePredicate(
  enabled: boolean,
  todayIso: string,
): (event: EventCardModel) => boolean {
  if (!enabled) return () => true;
  return (event) => {
    if (!/^\d{4}-\d{2}-\d{2}/.test(event.eventDate)) return false;
    return event.eventDate.slice(0, 10) < todayIso.slice(0, 10);
  };
}

/** Packet-store predicates — only meaningful when snapshot is present. */
export function buildPacketStatusPredicate(
  status: PacketLifecycleStatus | null,
): (event: FilterableEvent) => boolean {
  if (!status) return () => true;
  return (event) => {
    const snap = event.packetSnapshot?.packetStatus ?? event.packetStatus;
    if (isUnknown(snap)) return false;
    return snap === status;
  };
}

export function buildEligibleOnlyPredicate(
  enabled: boolean,
): (event: FilterableEvent) => boolean {
  if (!enabled) return () => true;
  return (event) => event.packetSnapshot?.isEligible === true;
}

export function buildExistingDraftPredicate(
  enabled: boolean,
): (event: FilterableEvent) => boolean {
  if (!enabled) return () => true;
  return (event) => event.packetSnapshot?.hasExistingDraft === true;
}

export function buildSignedLockedPredicate(
  enabled: boolean,
): (event: FilterableEvent) => boolean {
  if (!enabled) return () => true;
  return (event) => event.packetSnapshot?.isSignedOrLocked === true;
}

/**
 * Blocked filter.
 * - When `packetProviderAvailable`: ONLY provider snapshot
 *   (`event.packetSnapshot`) — never `event.packetStatus` or `event.eventStatus`.
 * - When no provider: event-level urgency only (`eventStatus === 'blocked'`).
 */
export function buildBlockedPredicate(
  enabled: boolean,
  packetProviderAvailable = false,
): (event: FilterableEvent) => boolean {
  if (!enabled) return () => true;
  if (packetProviderAvailable) {
    return (event) => {
      const snap = event.packetSnapshot;
      if (!snap) return false;
      return snap.isBlocked === true || snap.packetStatus === 'BLOCKED';
    };
  }
  return (event) => event.eventStatus === 'blocked';
}

/**
 * Completed filter.
 * - When `packetProviderAvailable`: ONLY provider snapshot (`isCompleted`).
 *   Never falls back to event.packetStatus or event.eventStatus.
 * - When no provider: event-level urgency only (`eventStatus === 'complete'`).
 */
export function buildCompletedPredicate(
  enabled: boolean,
  packetProviderAvailable = false,
): (event: FilterableEvent) => boolean {
  if (!enabled) return () => true;
  if (packetProviderAvailable) {
    return (event) => event.packetSnapshot?.isCompleted === true;
  }
  return (event) => event.eventStatus === 'complete';
}

export function buildCancelledPredicate(
  enabled: boolean,
): (event: FilterableEvent) => boolean {
  if (!enabled) return () => true;
  return (event) => event.packetSnapshot?.isCancelled === true;
}

/**
 * Compose all FR-002 filter predicates. Packet-store chips that are active
 * without a snapshot simply exclude (caller should disable those chips in UI).
 *
 * @param packetProviderAvailable When true, blocked/completed use packet-level
 *   semantics; when false they use event-level urgency only.
 */
export function applyEventFilters(
  events: readonly FilterableEvent[],
  state: EventFilterState,
  todayIso: string,
  packetProviderAvailable = false,
): FilterableEvent[] {
  const predicates: Array<(e: FilterableEvent) => boolean> = [
    buildSearchPredicate(state.search),
    buildDomainPredicate(state.domain),
    buildEventFamilyPredicate(state.eventFamily),
    buildWorkflowPredicate(state.workflow),
    buildOwnerPredicate(state.owner),
    buildPacketStatusPredicate(state.packetStatus),
    buildWorkflowStatusPredicate(state.workflowStatus),
    buildEligibleOnlyPredicate(state.eligibleOnly),
    buildExistingDraftPredicate(state.existingDraft),
    buildSignedLockedPredicate(state.signedLocked),
    buildBlockedPredicate(state.blocked, packetProviderAvailable),
    buildPastDuePredicate(state.pastDue, todayIso),
    buildCompletedPredicate(state.completed, packetProviderAvailable),
    buildCancelledPredicate(state.cancelled),
  ];
  return events.filter((event) => predicates.every((p) => p(event)));
}

/** Month label helper for UI (no hard-coded year list). */
export function getMonthLabel(month: number): string {
  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  if (month < 1 || month > 12) return `Month ${month}`;
  return labels[month - 1]!;
}
