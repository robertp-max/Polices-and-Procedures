const DAY_MS = 24 * 60 * 60 * 1000;
const EPOCH_MONDAY_UTC = new Date(Date.UTC(2026, 0, 5));

function toUtcDateOnly(isoDate: string): Date | null {
  if (!isoDate) return null;
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function startOfMondayUTC(date: Date): Date {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const out = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  out.setUTCDate(out.getUTCDate() + diff);
  return out;
}

export function inferSprintIdFromDate(isoDate: string): string {
  const d = toUtcDateOnly(isoDate);
  if (!d) return 'sprint-unknown';
  const monday = startOfMondayUTC(d);
  const weeksFromEpoch = Math.floor((monday.getTime() - EPOCH_MONDAY_UTC.getTime()) / (7 * DAY_MS));
  const sprintNum = Math.floor(weeksFromEpoch / 2) + 1;
  return `sprint-${Math.max(1, sprintNum)}`;
}
