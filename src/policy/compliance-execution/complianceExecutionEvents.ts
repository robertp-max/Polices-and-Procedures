/* ═══════════════════════════════════════════════════════════════
   compliance-execution / EVENT BUS
   --------------------------------------------------------------
   Tiny in-memory pub/sub for transient cross-component signals
   that don't belong in the URL (e.g. focus a unit, flash a tile).
   Event constants are typed so consumers can't mistype them.
   ═══════════════════════════════════════════════════════════════ */

export const COMPLIANCE_EVENT = {
  /** Open the workflow execution panel for a parent event id. */
  OPEN_EVENT:          'compliance:open-event',
  /** Open the CES workflow drawer for an execution unit id. */
  OPEN_EXECUTION_UNIT: 'compliance:open-execution-unit',
  /** Switch the calendar between 'calendar' and 'sprint' views. */
  CALENDAR_VIEW:       'compliance:calendar-view',
  /** Highlight a master control row + its linked units. */
  FOCUS_CONTROL:       'compliance:focus-control',
} as const;

export type ComplianceEventName = typeof COMPLIANCE_EVENT[keyof typeof COMPLIANCE_EVENT];

export interface CompliancePayloadMap {
  [COMPLIANCE_EVENT.OPEN_EVENT]:          { eventId: string };
  [COMPLIANCE_EVENT.OPEN_EXECUTION_UNIT]: { unitId: string };
  [COMPLIANCE_EVENT.CALENDAR_VIEW]:       { view: 'calendar' | 'sprint' };
  [COMPLIANCE_EVENT.FOCUS_CONTROL]:       { controlId: string | number };
}

type Listener<E extends ComplianceEventName> = (payload: CompliancePayloadMap[E]) => void;

const subscribers = new Map<ComplianceEventName, Set<Listener<ComplianceEventName>>>();

export function subscribeCompliance<E extends ComplianceEventName>(
  name: E,
  listener: Listener<E>,
): () => void {
  let bucket = subscribers.get(name);
  if (!bucket) { bucket = new Set(); subscribers.set(name, bucket); }
  bucket.add(listener as Listener<ComplianceEventName>);
  return () => { bucket?.delete(listener as Listener<ComplianceEventName>); };
}

export function emitCompliance<E extends ComplianceEventName>(
  name: E,
  payload: CompliancePayloadMap[E],
): void {
  const bucket = subscribers.get(name);
  if (!bucket) return;
  for (const fn of bucket) {
    try { (fn as Listener<E>)(payload); } catch { /* listener errors must not break the bus */ }
  }
}
