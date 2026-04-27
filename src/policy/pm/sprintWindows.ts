/**
 * sprintWindows — PM canonical sprint calendar.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Data-Model.md §6
 *       Builder/Compliance-Execution-Sprints/PM-Sprint-Board-Design.md §2
 *
 * Rules:
 *   - Week:               Sunday → Saturday
 *   - Sprint length:      14 calendar days
 *   - Sprint 01:          starts on the FIRST Sunday of the calendar year
 *   - Sprint IDs:         "{YYYY}-{NN}" with NN ∈ 01..26
 *   - Year edges:         Jan 1 .. (firstSunday-1)  → previous year's Sprint 26
 *                         (sprint26End+1) .. Dec 31 → current year's Sprint 26
 *
 * This is independent of the legacy CES sprint cadence in
 * complianceExecutionStore.buildSprintWindow (Mon–Fri 12-day epoch-anchored).
 * PM views must use THIS function; CES projector unchanged.
 */

const DAY_MS = 86400000;
const SPRINT_LEN_DAYS = 14;
const SPRINT_COUNT = 26;

export interface SprintWindow {
  /** "{YYYY}-{NN}" — NN 01..26 */
  id: string;
  /** 1..26 */
  number: number;
  /** YYYY-MM-DD (Sunday) inclusive */
  startDate: string;
  /** YYYY-MM-DD (Saturday 13 days later) inclusive */
  endDate: string;
  /** Owning year (matches id prefix) */
  year: number;
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const isoDateUTC = (d: Date): string =>
  `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;

const parseISO = (s: string): Date => {
  const [y, m, day] = s.split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, day ?? 1));
};

/** First Sunday on/after Jan 1 of the given year (UTC). */
export function firstSundayOfYear(year: number): Date {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const dow = jan1.getUTCDay(); // 0=Sun
  const offset = (7 - dow) % 7;
  return new Date(jan1.getTime() + offset * DAY_MS);
}

/** All 26 sprint windows for a year. */
export function sprintWindowsForYear(year: number): SprintWindow[] {
  const start = firstSundayOfYear(year);
  const out: SprintWindow[] = [];
  for (let i = 0; i < SPRINT_COUNT; i++) {
    const s = new Date(start.getTime() + i * SPRINT_LEN_DAYS * DAY_MS);
    const e = new Date(s.getTime() + (SPRINT_LEN_DAYS - 1) * DAY_MS);
    const num = i + 1;
    out.push({
      id: `${year}-${pad2(num)}`,
      number: num,
      startDate: isoDateUTC(s),
      endDate: isoDateUTC(e),
      year,
    });
  }
  return out;
}

/**
 * Resolve which sprint a given calendar date belongs to. Handles year-edges:
 *   - Jan 1..(firstSunday-1) of year Y  → year Y-1, Sprint 26 (extension)
 *   - (sprint26End+1)..Dec 31 of year Y → year Y,   Sprint 26 (tail extension)
 */
export function sprintForDate(isoDate: string): SprintWindow {
  const d = parseISO(isoDate);
  const y = d.getUTCFullYear();
  const windows = sprintWindowsForYear(y);
  const dMs = d.getTime();

  // Pre-first-Sunday: belongs to previous year's last sprint
  const firstStart = parseISO(windows[0].startDate).getTime();
  if (dMs < firstStart) {
    const prev = sprintWindowsForYear(y - 1);
    return prev[prev.length - 1];
  }

  // Inside the year's 26 windows
  for (const w of windows) {
    const s = parseISO(w.startDate).getTime();
    const e = parseISO(w.endDate).getTime() + DAY_MS - 1;
    if (dMs >= s && dMs <= e) return w;
  }

  // Past sprint 26 end: tail-extends into current year's last sprint
  return windows[windows.length - 1];
}

/** Convenience: sprint covering "today" in UTC. */
export function currentSprint(now: Date = new Date()): SprintWindow {
  return sprintForDate(isoDateUTC(now));
}

/** Convenience: next/prev sprint relative to a sprint id (handles year wrap). */
export function neighbourSprint(id: string, delta: -1 | 1): SprintWindow {
  const [yStr, nStr] = id.split('-');
  const y = Number(yStr);
  const n = Number(nStr);
  let nextN = n + delta;
  let nextY = y;
  if (nextN < 1) {
    nextY = y - 1;
    nextN = SPRINT_COUNT;
  } else if (nextN > SPRINT_COUNT) {
    nextY = y + 1;
    nextN = 1;
  }
  return sprintWindowsForYear(nextY)[nextN - 1];
}

/** True when the date (YYYY-MM-DD) falls on Sat or Sun (UTC). */
export function isWeekendDate(isoDate: string): boolean {
  const dow = parseISO(isoDate).getUTCDay();
  return dow === 0 || dow === 6;
}

/** Inclusive list of YYYY-MM-DD strings for a sprint window. */
export function sprintDays(window: SprintWindow): string[] {
  const start = parseISO(window.startDate).getTime();
  const out: string[] = [];
  for (let i = 0; i < SPRINT_LEN_DAYS; i++) {
    out.push(isoDateUTC(new Date(start + i * DAY_MS)));
  }
  return out;
}
