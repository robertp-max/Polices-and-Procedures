import type { RecurrenceRule } from './types';

/* ═══════════════════════════════════════════════════════════════
   Date math + recurrence resolution.
   All functions use local-date reasoning via ISO YYYY-MM-DD strings
   to keep timezone artifacts out of the generator.
   ═══════════════════════════════════════════════════════════════ */

const DAY_MS = 86_400_000;

export function toISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function parseISO(s: string): Date {
  return new Date(s + 'T00:00:00');
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

function clampDayOfMonth(year: number, month: number, day: number): number {
  const last = new Date(year, month + 1, 0).getDate();
  return day === -1 ? last : Math.min(day, last);
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (nth - 1) * 7);
}

/* ─── Occurrence generation ──────────────────────────── */

export function occurrences(rule: RecurrenceRule, start: Date, end: Date): Date[] {
  const out: Date[] = [];

  const pushIfInRange = (d: Date) => {
    if (d >= start && d <= end) out.push(d);
  };

  switch (rule.frequency) {
    case 'weekly':
    case 'bi-weekly': {
      const step = rule.frequency === 'weekly' ? 7 : 14;
      const target = rule.dayOfWeek ?? start.getDay();
      // Seek the first matching weekday >= start
      let cursor = new Date(start);
      const shift = (target - cursor.getDay() + 7) % 7;
      cursor = addDays(cursor, shift);
      while (cursor <= end) {
        out.push(new Date(cursor));
        cursor = addDays(cursor, step);
      }
      break;
    }

    case 'monthly': {
      let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cursor <= end) {
        let date: Date;
        if (rule.dayOfWeek != null && rule.nth != null) {
          date = nthWeekdayOfMonth(cursor.getFullYear(), cursor.getMonth(), rule.dayOfWeek, rule.nth);
        } else {
          const day = clampDayOfMonth(cursor.getFullYear(), cursor.getMonth(), rule.dayOfMonth ?? 15);
          date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
        }
        pushIfInRange(date);
        cursor = addMonths(cursor, 1);
      }
      break;
    }

    case 'quarterly': {
      const months = rule.quarterMonths ?? [1, 4, 7, 10];
      for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
        for (const m of months) {
          const monthIdx = m - 1;
          let date: Date;
          if (rule.dayOfWeek != null && rule.nth != null) {
            date = nthWeekdayOfMonth(y, monthIdx, rule.dayOfWeek, rule.nth);
          } else {
            const day = clampDayOfMonth(y, monthIdx, rule.dayOfMonth ?? 15);
            date = new Date(y, monthIdx, day);
          }
          pushIfInRange(date);
        }
      }
      break;
    }

    case 'semi-annual': {
      const months = rule.quarterMonths ?? [1, 7]; // reusing quarterMonths as anchor list
      for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
        for (const m of months) {
          const monthIdx = m - 1;
          const day = clampDayOfMonth(y, monthIdx, rule.dayOfMonth ?? 15);
          pushIfInRange(new Date(y, monthIdx, day));
        }
      }
      break;
    }

    case 'annual': {
      const month = (rule.anchorMonth ?? 1) - 1;
      for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
        const day = clampDayOfMonth(y, month, rule.dayOfMonth ?? 15);
        pushIfInRange(new Date(y, month, day));
      }
      break;
    }

    case 'trigger':
      // Trigger-only templates do not produce scheduled instances.
      break;
  }

  return out.sort((a, b) => a.getTime() - b.getTime());
}
