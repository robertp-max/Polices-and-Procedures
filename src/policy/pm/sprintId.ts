import { sprintForDate } from './sprintWindows';

/**
 * PM canonical sprint id for a calendar date (`YYYY-NN`, e.g. `2026-03`),
 * aligned with `sprintWindows.ts` (first Sunday of year, 26 × 14-day sprints).
 */
export function inferSprintIdFromDate(isoDate: string): string {
  const d = isoDate?.slice(0, 10);
  if (!d) return 'sprint-unknown';
  try {
    return sprintForDate(d).id;
  } catch {
    return 'sprint-unknown';
  }
}
