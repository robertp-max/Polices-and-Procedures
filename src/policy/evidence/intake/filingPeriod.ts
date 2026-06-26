/**
 * Filing-period derivation (Section 3A + Section 6).
 *
 * The evidence FILING month/quarter is derived from the resolved
 * source-system *created* date, interpreted in the agency timezone. This is
 * the single place that converts an ISO instant into a calendar period so the
 * created-date invariant ("file by the date the record was created in the
 * source system, never by occurrence/service/upload date") is enforced
 * consistently across resolver, Drive folders, and packet membership.
 *
 * Timezone handling uses `Intl.DateTimeFormat` (available in Node + browser),
 * so no timezone dependency is added. Default agency timezone is
 * America/Los_Angeles, overridable via configuration.
 */

export const DEFAULT_AGENCY_TIMEZONE = 'America/Los_Angeles';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export interface FilingPeriod {
  /** Four-digit calendar year in the agency timezone. */
  createdYear: number;
  /** 1-12 calendar month in the agency timezone. */
  createdMonth: number;
  createdMonthName: string;
  /** 1-4. */
  createdQuarter: number;
  /** e.g. "2026-03". */
  filingPeriodKey: string;
  /** e.g. "2026-Q1". */
  filingQuarterKey: string;
  /** The timezone used to derive the above. */
  timezone: string;
}

/** Extract year/month/day in a specific IANA timezone without a tz library. */
export function calendarPartsInTimeZone(
  iso: string,
  timezone: string = DEFAULT_AGENCY_TIMEZONE,
): { year: number; month: number; day: number } | null {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  const date = new Date(ms);
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = fmt.formatToParts(date);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    const year = get('year');
    const month = get('month');
    const day = get('day');
    if (!year || !month || !day) return null;
    return { year, month, day };
  } catch {
    // Invalid timezone → fall back to UTC parts (still deterministic).
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  }
}

/**
 * Derive the filing period for a resolved created-date instant.
 * Returns null when the input cannot be parsed (caller treats as
 * needs_date_review — never guesses a period).
 */
export function deriveFilingPeriod(
  resolvedCreatedAtIso: string | null | undefined,
  timezone: string = DEFAULT_AGENCY_TIMEZONE,
): FilingPeriod | null {
  if (!resolvedCreatedAtIso) return null;
  const parts = calendarPartsInTimeZone(resolvedCreatedAtIso, timezone);
  if (!parts) return null;
  const { year, month } = parts;
  const quarter = Math.floor((month - 1) / 3) + 1;
  return {
    createdYear: year,
    createdMonth: month,
    createdMonthName: MONTH_NAMES[month - 1] ?? 'Unknown',
    createdQuarter: quarter,
    filingPeriodKey: `${year}-${String(month).padStart(2, '0')}`,
    filingQuarterKey: `${year}-Q${quarter}`,
    timezone,
  };
}

/** True when a filing period belongs to the given monthly key (e.g. "2026-03"). */
export function periodMatchesMonth(period: FilingPeriod, filingPeriodKey: string): boolean {
  return period.filingPeriodKey === filingPeriodKey;
}

/** True when a filing period belongs to the given quarter key (e.g. "2026-Q1"). */
export function periodMatchesQuarter(period: FilingPeriod, filingQuarterKey: string): boolean {
  return period.filingQuarterKey === filingQuarterKey;
}
