/**
 * WP-1.6 — pure projection of CES / regulatory calendar sources → EventCardModel.
 *
 * FR-002 event-card fields. Where a status is not yet derivable from the data
 * layer (packet store, evidence rollup, approvals, signatures, blockers), the
 * model uses the explicit sentinel `'unknown'` — never 0, false, or invented
 * display values.
 */

import type { CesCalendarEvent } from '@/policy/ces/cesViewProjections';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import {
  ALLOWED_TRANSITIONS,
  type PacketLifecycleStatus,
} from '@/policy/packets/contracts';

/** Explicit placeholder for fields the packet store has not yet wired. */
export type UnknownField = 'unknown';

/**
 * Snapshot returned by the optional `packetStatusProvider` callback.
 * All fields optional; absent fields project to `'unknown'` on the card.
 */
export interface PacketStatusSnapshot {
  packetStatus?: PacketLifecycleStatus | null;
  hasExistingDraft?: boolean | null;
  isEligible?: boolean | null;
  isSignedOrLocked?: boolean | null;
  isBlocked?: boolean | null;
  isCompleted?: boolean | null;
  isCancelled?: boolean | null;
  requiredFormCompletion?: number | null;
  evidenceCompleteness?: number | null;
  approvalStatus?: string | null;
  signatureStatus?: string | null;
  blockerCount?: number | null;
  workflowInstanceId?: string | null;
  workflowStatus?: string | null;
  priorPeriodPacketStatus?: string | null;
  driveDestination?: string | null;
  openDependencies?: readonly string[] | null;
  /** Optional override when provider knows required approval roles. */
  requiredApprovals?: readonly string[] | null;
  /** Optional override when provider knows required signer roles. */
  requiredSigners?: readonly string[] | null;
}

/** Full FR-002 event-card view model. */
export interface EventCardModel {
  eventTitle: string;
  eventDate: string;
  reportingPeriodStart: string | null;
  reportingPeriodEnd: string | null;
  eventFamilyId: string | null;
  eventInstanceId: string;
  workflowId: string | null;
  workflowInstanceId: string | UnknownField;
  owner: string;
  eventStatus: string | UnknownField;
  packetStatus: PacketLifecycleStatus | UnknownField;
  requiredFormCompletion: number | UnknownField;
  evidenceCompleteness: number | UnknownField;
  approvalStatus: string | UnknownField;
  signatureStatus: string | UnknownField;
  blockerCount: number | UnknownField;
  /**
   * FR-002 selection drawer: Required approvals / Required signers.
   * Derived from event/workflow definitions when present; otherwise `'unknown'`.
   */
  requiredApprovals: readonly string[] | UnknownField;
  requiredSigners: readonly string[] | UnknownField;
  /** Enrichment for filters / selection drawer (not all are FR-002 card fields). */
  domain: string | null;
  cadence: string | null;
  regulatoryDriver: string | null;
  workflowStatus: string | UnknownField;
  sourceDate: string | null;
  /** Raw calendar day/month when known (1-based month). */
  day: number | null;
  month: number | null;
  year: number | null;
}

export interface ProjectEventCardInput {
  calendarEvent: CesCalendarEvent;
  regulatoryEvent?: RegulatoryEvent | null;
  packetStatus?: PacketStatusSnapshot | null;
  /**
   * Year used when the calendar event only carries day/month (no ISO sourceDate).
   * Does not clamp the event into a fixed studio window.
   */
  fallbackYear?: number;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Resolve a YYYY-MM-DD event date without inventing calendar windows.
 * Prefer regulatory.date → calendar.sourceDate → day/month/year assembly.
 */
export function resolveEventDate(
  calendarEvent: CesCalendarEvent,
  regulatoryEvent?: RegulatoryEvent | null,
  fallbackYear?: number,
): string {
  if (regulatoryEvent?.date && /^\d{4}-\d{2}-\d{2}/.test(regulatoryEvent.date)) {
    return regulatoryEvent.date.slice(0, 10);
  }
  if (calendarEvent.sourceDate && /^\d{4}-\d{2}-\d{2}/.test(calendarEvent.sourceDate)) {
    return calendarEvent.sourceDate.slice(0, 10);
  }
  const day = calendarEvent.day;
  const month = calendarEvent.month;
  const year = fallbackYear;
  if (
    typeof day === 'number' &&
    day >= 1 &&
    typeof month === 'number' &&
    month >= 1 &&
    month <= 12 &&
    typeof year === 'number' &&
    Number.isFinite(year)
  ) {
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }
  return 'unknown';
}

function parseYmdParts(iso: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

function unknownIfBlank(value: string | null | undefined): string | UnknownField {
  if (value === null || value === undefined) return 'unknown';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : 'unknown';
}

function normalizePacketLifecycleStatus(
  value: PacketLifecycleStatus | null | undefined,
): PacketLifecycleStatus | UnknownField {
  if (value === null || value === undefined) return 'unknown';
  return Object.prototype.hasOwnProperty.call(ALLOWED_TRANSITIONS.packet, value)
    ? value
    : 'unknown';
}

function numberOrUnknown(value: number | null | undefined): number | UnknownField {
  if (value === null || value === undefined) return 'unknown';
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'unknown';
  return value;
}

/**
 * Derive a coarse form-completion ratio from regulatory requiredForms when
 * present. Returns `'unknown'` when forms are absent (does not invent 0).
 */
export function deriveRequiredFormCompletion(
  regulatoryEvent?: RegulatoryEvent | null,
): number | UnknownField {
  const forms = regulatoryEvent?.requiredForms;
  if (!forms || forms.length === 0) return 'unknown';
  const total = forms.length;
  const complete = forms.filter((f) => f.status === 'complete').length;
  return Math.round((complete / total) * 100);
}

/**
 * Required approvals from event definition (`approvals[].approverRole` where
 * required). Returns `'unknown'` when the definition does not enumerate them.
 */
export function deriveRequiredApprovals(
  regulatoryEvent?: RegulatoryEvent | null,
  packetStatus?: PacketStatusSnapshot | null,
): readonly string[] | UnknownField {
  if (packetStatus?.requiredApprovals && packetStatus.requiredApprovals.length > 0) {
    return [...packetStatus.requiredApprovals];
  }
  const rules = regulatoryEvent?.approvals;
  if (!rules || rules.length === 0) return 'unknown';
  const roles = rules
    .filter((r) => r.required)
    .map((r) => r.approverRole.trim())
    .filter((role) => role.length > 0);
  return roles.length > 0 ? roles : 'unknown';
}

/**
 * Required signers from event definition (`minutes.signOffRoles`).
 * Returns `'unknown'` when sign-off roles are not defined.
 */
export function deriveRequiredSigners(
  regulatoryEvent?: RegulatoryEvent | null,
  packetStatus?: PacketStatusSnapshot | null,
): readonly string[] | UnknownField {
  if (packetStatus?.requiredSigners && packetStatus.requiredSigners.length > 0) {
    return [...packetStatus.requiredSigners];
  }
  const roles = regulatoryEvent?.minutes?.signOffRoles;
  if (!roles || roles.length === 0) return 'unknown';
  const cleaned = roles.map((r) => r.trim()).filter((r) => r.length > 0);
  return cleaned.length > 0 ? cleaned : 'unknown';
}

/** Format required approvals/signers list or the explicit unknown sentinel. */
export function formatRequiredRoles(
  value: readonly string[] | UnknownField | null | undefined,
): string {
  if (value === null || value === undefined || value === 'unknown') return 'unknown';
  if (value.length === 0) return 'unknown';
  return value.join(', ');
}

/**
 * Pure projection: CesCalendarEvent (+ optional RegulatoryEvent / packet snapshot)
 * → EventCardModel with explicit `'unknown'` for non-derivable status fields.
 */
export function projectEventCardModel(input: ProjectEventCardInput): EventCardModel {
  const { calendarEvent, regulatoryEvent, packetStatus, fallbackYear } = input;
  const eventDate = resolveEventDate(calendarEvent, regulatoryEvent, fallbackYear);
  const parts = eventDate !== 'unknown' ? parseYmdParts(eventDate) : null;

  const eventInstanceId =
    regulatoryEvent?.id ||
    calendarEvent.sourceEventId ||
    calendarEvent.id ||
    'unknown';

  const eventFamilyId =
    regulatoryEvent?.eventSubType ??
    null;

  const workflowId =
    regulatoryEvent?.workflowId ??
    (typeof calendarEvent.workflowId === 'string' ? calendarEvent.workflowId : null) ??
    (typeof calendarEvent.workflow === 'string' ? calendarEvent.workflow : null) ??
    null;

  const owner =
    regulatoryEvent?.owner ||
    calendarEvent.owner ||
    'unknown';

  const eventStatus =
    unknownIfBlank(regulatoryEvent?.urgency) !== 'unknown'
      ? (regulatoryEvent!.urgency as string)
      : unknownIfBlank(calendarEvent.readiness);

  // Packet-derived fields: only from provider snapshot — never invent.
  const packetStatusValue = normalizePacketLifecycleStatus(
    packetStatus?.packetStatus ?? null,
  );
  const requiredFormCompletion =
    packetStatus && packetStatus.requiredFormCompletion !== undefined
      ? numberOrUnknown(packetStatus.requiredFormCompletion)
      : deriveRequiredFormCompletion(regulatoryEvent);
  const evidenceCompleteness = numberOrUnknown(packetStatus?.evidenceCompleteness);
  const approvalStatus = unknownIfBlank(packetStatus?.approvalStatus ?? null);
  const signatureStatus = unknownIfBlank(packetStatus?.signatureStatus ?? null);
  const blockerCount = numberOrUnknown(packetStatus?.blockerCount);
  const workflowInstanceId = unknownIfBlank(packetStatus?.workflowInstanceId ?? null);
  const workflowStatus =
    unknownIfBlank(packetStatus?.workflowStatus ?? null) !== 'unknown'
      ? unknownIfBlank(packetStatus?.workflowStatus ?? null)
      : unknownIfBlank(calendarEvent.readiness);

  const requiredApprovals = deriveRequiredApprovals(regulatoryEvent, packetStatus);
  const requiredSigners = deriveRequiredSigners(regulatoryEvent, packetStatus);

  return {
    eventTitle: regulatoryEvent?.title || calendarEvent.label || 'Untitled event',
    eventDate,
    reportingPeriodStart: regulatoryEvent?.reportingPeriodStart ?? null,
    reportingPeriodEnd: regulatoryEvent?.reportingPeriodEnd ?? null,
    eventFamilyId,
    eventInstanceId,
    workflowId,
    workflowInstanceId,
    owner,
    eventStatus,
    packetStatus: packetStatusValue,
    requiredFormCompletion,
    evidenceCompleteness,
    approvalStatus,
    signatureStatus,
    blockerCount,
    requiredApprovals,
    requiredSigners,
    domain: regulatoryEvent?.domain ?? null,
    cadence: regulatoryEvent?.cadence ?? null,
    regulatoryDriver: regulatoryEvent?.regulatoryDriver ?? null,
    workflowStatus,
    sourceDate: calendarEvent.sourceDate ?? regulatoryEvent?.date ?? null,
    day: parts?.day ?? calendarEvent.day ?? null,
    month: parts?.month ?? calendarEvent.month ?? null,
    year: parts?.year ?? fallbackYear ?? null,
  };
}

/** Display helper for reporting period — honest empty when both ends absent. */
export function formatReportingPeriod(
  start: string | null,
  end: string | null,
): string {
  if (start && end) return `${start} → ${end}`;
  if (start) return `${start} → …`;
  if (end) return `… → ${end}`;
  return 'unknown';
}

/** Display helper for unknown-capable fields. */
export function formatUnknownable(value: string | number | UnknownField | null | undefined): string {
  if (value === null || value === undefined) return 'unknown';
  if (value === 'unknown') return 'unknown';
  return String(value);
}
