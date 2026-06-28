/* ════════════════════════════════════════════════════════════════
   PHASE 1 — Deterministic QAPI date-window model.

   A QAPI packet's reporting window is derived from the event date and
   the quarter, NOT hand-set. A meeting dated before quarter-end can only
   be an INTERIM packet whose data is capped at the meeting date; a
   meeting on/after quarter-end may be a FINAL packet covering the full
   quarter. Source events after the data-through date are excluded, and a
   final packet that still contains post-meeting events is INVALID.
   ════════════════════════════════════════════════════════════════ */
import type { PacketType } from './qapiTypes';

export interface QapiDateWindow {
  eventDate: string;        // YYYY-MM-DD
  quarterStart: string;     // YYYY-MM-DD
  quarterEnd: string;       // YYYY-MM-DD
  dataThroughDate: string;  // YYYY-MM-DD — inclusive cap for source events
  packetType: PacketType;
  title: string;
  quarterLabel: string;     // e.g. "Q2 2026"
}

/** Parse a possibly-messy date string to an ISO YYYY-MM-DD, or null if invalid. */
export function parseLooseDate(input: unknown): string | null {
  if (input == null) return null;
  const s = String(input).trim();
  if (!s) return null;
  let y: number, m: number, d: number;
  let mt = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(s);
  if (mt) { y = +mt[1]; m = +mt[2]; d = +mt[3]; }
  else if ((mt = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(s))) { m = +mt[1]; d = +mt[2]; y = +mt[3]; }
  else return null;
  if (m < 1 || m > 12 || d < 1) return null;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d > daysInMonth) return null;            // rejects 2026-02-29, 02/30/1950, 2026-13-02
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return iso;
}

function quarterByNum(year: number, q: number): { q: number; year: number; start: string; end: string } {
  const startM = (q - 1) * 3 + 1;
  const endM = q * 3;
  const endD = new Date(Date.UTC(year, endM, 0)).getUTCDate();
  return { q, year, start: `${year}-${String(startM).padStart(2, '0')}-01`, end: `${year}-${String(endM).padStart(2, '0')}-${endD}` };
}
function quarterOf(iso: string): { q: number; year: number; start: string; end: string } {
  const [y, m] = iso.split('-').map(Number);
  return quarterByNum(y, Math.ceil(m / 3));
}
/** Parse a review-quarter label: 'Q2-2026' | '2026-Q2' | 'Q2 2026'. */
export function parseReviewQuarter(label: string | undefined): { q: number; year: number; start: string; end: string } | null {
  if (!label) return null;
  const m = /(?:Q\s*([1-4]).*?(\d{4}))|(?:(\d{4}).*?Q\s*([1-4]))/i.exec(label);
  if (!m) return null;
  const q = Number(m[1] ?? m[4]);
  const year = Number(m[2] ?? m[3]);
  if (!q || !year) return null;
  return quarterByNum(year, q);
}

export interface DateWindowOpts {
  /** The quarter UNDER REVIEW (from the event definition). When omitted, the
   *  quarter containing the meeting date is used. Required to correctly mark a
   *  post-quarter meeting (e.g. July reviewing Q2) as FINAL. */
  reviewQuarter?: string;
  /** Latest closed source-data date before the meeting (interim cap). */
  latestClosedSourceDate?: string;
}

/** Build the canonical date window for a QAPI event. */
export function buildQapiDateWindow(eventDateInput: string, opts: DateWindowOpts = {}): QapiDateWindow {
  const eventDate = parseLooseDate(eventDateInput);
  if (!eventDate) throw new Error('INVALID_EVENT_DATE: cannot parse event date.');
  const qz = parseReviewQuarter(opts.reviewQuarter) ?? quarterOf(eventDate);
  const { q, year, start, end } = qz;
  const quarterLabel = `Q${q} ${year}`;
  const isFinal = eventDate >= end;
  if (isFinal) {
    return { eventDate, quarterStart: start, quarterEnd: end, dataThroughDate: end, packetType: 'final', title: `${quarterLabel} QAPI Review (Final)`, quarterLabel };
  }
  // interim: cap data at the meeting date (or the latest closed source date if earlier)
  let through = eventDate < start ? start : eventDate; // guard: meeting before quarter start
  const closed = opts.latestClosedSourceDate ? parseLooseDate(opts.latestClosedSourceDate) : null;
  if (closed && closed < through && closed >= start) through = closed;
  return { eventDate, quarterStart: start, quarterEnd: end, dataThroughDate: through, packetType: 'interim', title: `Interim ${quarterLabel} QAPI Review`, quarterLabel };
}

/** True if a source event date is within [quarterStart, dataThroughDate] inclusive. */
export function isWithinWindow(win: QapiDateWindow, dateInput: unknown): boolean {
  const d = parseLooseDate(dateInput);
  if (!d) return false;
  return d >= win.quarterStart && d <= win.dataThroughDate;
}

export interface DateWindowViolation { code: string; dateValue: string; sourceArtifactId?: string; reason: string }

/**
 * Validate that none of the supplied source events fall AFTER the window's
 * dataThroughDate. Returns INVALID_DATE_WINDOW violations for any that do.
 * A final quarter packet must not include source events after eventDate.
 */
export function validateDateWindow(
  win: QapiDateWindow,
  events: Array<{ id?: string; date?: unknown; kind?: string }>,
): DateWindowViolation[] {
  const out: DateWindowViolation[] = [];
  for (const ev of events) {
    const d = parseLooseDate(ev.date);
    if (!d) continue; // undated/invalid handled by data-quality extraction, not here
    if (d > win.dataThroughDate) {
      out.push({
        code: 'INVALID_DATE_WINDOW',
        dateValue: d,
        sourceArtifactId: ev.id,
        reason: `${win.packetType === 'final' ? 'final quarter' : 'interim'} packet cannot include source events after ${win.dataThroughDate} (event ${ev.kind ?? ''} ${ev.id ?? ''} dated ${d}).`,
      });
    }
  }
  return out;
}
