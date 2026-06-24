/* ═══════════════════════════════════════════════════════════════
   CES — View-model validators (Phase 2 — Task 2.3)
   ═══════════════════════════════════════════════════════════════
   Each validator takes the OUTPUT of the matching `build*` projection
   in cesViewProjections.ts and returns { ok, errors }. This mirrors the
   invariant intent of `validateCesControlAuditView` (cesMasterControlAudit.ts)
   — that one throws; these return a result so callers can choose dev-warn
   vs hard-fail.

   Inputs are typed `unknown` and narrowed at runtime on purpose: the whole
   point of a defensive validator is to catch a projection that returns []
   or a malformed row, so we must not assume the input is already well-typed.
   No `any`.
   ═══════════════════════════════════════════════════════════════ */

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function toResult(errors: string[]): ValidationResult {
  return { ok: errors.length === 0, errors };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** Tone is a small string union in @/v6/tokens. We validate structurally
 *  (present, non-empty string) so the validator does not go stale if the
 *  palette grows. */
function isTone(v: unknown): boolean {
  return isNonEmptyString(v);
}

function inRange(v: unknown, lo: number, hi: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
}

function asArray(v: unknown): readonly unknown[] | null {
  return Array.isArray(v) ? (v as readonly unknown[]) : null;
}

// ── Lanes — board / events / tasks all use BoardLaneData ──────────────────
function validateLanes(label: string, value: unknown): ValidationResult {
  const errors: string[] = [];
  const lanes = asArray(value);
  if (!lanes || lanes.length === 0) {
    return toResult([`${label}: expected a non-empty array of lanes`]);
  }

  lanes.forEach((laneRaw, i) => {
    if (!isObject(laneRaw)) {
      errors.push(`${label}[${i}]: lane is not an object`);
      return;
    }
    const lane = laneRaw;
    const where = `${label}[${i}]${isNonEmptyString(lane.title) ? ` (${lane.title})` : ''}`;
    if (!isNonEmptyString(lane.title)) errors.push(`${label}[${i}]: missing title`);
    if (!isTone(lane.tone)) errors.push(`${where}: invalid/empty tone`);
    if (typeof lane.count !== 'number' || lane.count < 0) {
      errors.push(`${where}: count must be a non-negative number`);
    }

    const cards = asArray(lane.cards);
    if (!cards) {
      errors.push(`${where}: cards must be an array`);
      return;
    }
    cards.forEach((cardRaw, j) => {
      if (!isObject(cardRaw)) {
        errors.push(`${where}.cards[${j}]: not an object`);
        return;
      }
      const card = cardRaw;
      if (!isNonEmptyString(card.id)) errors.push(`${where}.cards[${j}]: missing id`);
      if (!isNonEmptyString(card.title)) errors.push(`${where}.cards[${j}]: missing title`);
      if (!inRange(card.progress, 0, 100)) errors.push(`${where}.cards[${j}]: progress must be 0-100`);
      if (!isTone(card.tone)) errors.push(`${where}.cards[${j}]: invalid/empty tone`);
    });
  });
  return toResult(errors);
}

export function validateBoardLanes(value: unknown): ValidationResult {
  return validateLanes('boardLanes', value);
}
export function validateEventLanes(value: unknown): ValidationResult {
  return validateLanes('eventLanes', value);
}
export function validateTaskLanes(value: unknown): ValidationResult {
  return validateLanes('taskLanes', value);
}

// ── Calendar events ───────────────────────────────────────────────────────
export function validateCalendarEvents(value: unknown): ValidationResult {
  const errors: string[] = [];
  const events = asArray(value);
  if (!events || events.length === 0) {
    return toResult(['calendarEvents: expected a non-empty array']);
  }
  events.forEach((evRaw, i) => {
    if (!isObject(evRaw)) {
      errors.push(`calendarEvents[${i}]: not an object`);
      return;
    }
    const ev = evRaw;
    if (!inRange(ev.day, 1, 31)) errors.push(`calendarEvents[${i}]: day must be 1-31`);
    if (!isNonEmptyString(ev.label)) errors.push(`calendarEvents[${i}]: missing label`);
    if (!isNonEmptyString(ev.owner)) errors.push(`calendarEvents[${i}]: missing owner`);
    if (!inRange(ev.progress, 0, 100)) errors.push(`calendarEvents[${i}]: progress must be 0-100`);
    if (!isTone(ev.tone)) errors.push(`calendarEvents[${i}]: invalid/empty tone`);
  });
  return toResult(errors);
}

// ── Evidence / Audit rows — 4-tuple [name, ref, status, tone] ─────────────
function validateRows(label: string, value: unknown): ValidationResult {
  const errors: string[] = [];
  const rows = asArray(value);
  if (!rows || rows.length === 0) {
    return toResult([`${label}: expected a non-empty array of rows`]);
  }
  rows.forEach((rowRaw, i) => {
    const row = asArray(rowRaw);
    if (!row || row.length !== 4) {
      errors.push(`${label}[${i}]: expected a 4-tuple [name, ref, status, tone]`);
      return;
    }
    if (!isNonEmptyString(row[0])) errors.push(`${label}[${i}]: missing name (col 0)`);
    if (!isNonEmptyString(row[1])) errors.push(`${label}[${i}]: missing ref (col 1)`);
    if (!isNonEmptyString(row[2])) errors.push(`${label}[${i}]: missing status (col 2)`);
    if (!isTone(row[3])) errors.push(`${label}[${i}]: invalid/empty tone (col 3)`);
  });
  return toResult(errors);
}

export function validateEvidenceRows(value: unknown): ValidationResult {
  return validateRows('evidenceRows', value);
}
export function validateAuditRows(value: unknown): ValidationResult {
  return validateRows('auditRows', value);
}

// ── Report metric tiles ───────────────────────────────────────────────────
export function validateReportMetrics(value: unknown): ValidationResult {
  const errors: string[] = [];
  const tiles = asArray(value);
  if (!tiles || tiles.length === 0) {
    return toResult(['reportMetrics: expected a non-empty array']);
  }
  tiles.forEach((tileRaw, i) => {
    if (!isObject(tileRaw)) {
      errors.push(`reportMetrics[${i}]: not an object`);
      return;
    }
    const tile = tileRaw;
    if (!isNonEmptyString(tile.label)) errors.push(`reportMetrics[${i}]: missing label`);
    if (!isNonEmptyString(tile.value)) errors.push(`reportMetrics[${i}]: missing value`);
    if (!isTone(tile.tone)) errors.push(`reportMetrics[${i}]: invalid/empty tone`);
  });
  return toResult(errors);
}
