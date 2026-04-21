import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════
   Compliance Classification Helpers
   ----------------------------------------------------------------
   These helpers project a RegulatoryEvent onto the calendar-sync
   contract shape:
     - A coarse compliance category (QAPI / GOVERNING_BODY / RISK /
       COMPLIANCE / OPERATIONS), used as a visible tag on the sync
       surface and as a future pivot for dashboard roll-ups.
     - A boolean `required` flag that gates the sync UI's hard-fail
       behavior (required events cannot fail silently — they force
       a visible error state + retry button).

   The category is derived from the event's regulatory domain with
   a small number of title-based refinements. The required flag is
   conservative: audit risk of 'high' or 'critical' is considered
   regulatorily required.
   ═══════════════════════════════════════════════════════════════ */

export type ComplianceCategory =
  | 'QAPI'
  | 'GOVERNING_BODY'
  | 'RISK'
  | 'COMPLIANCE'
  | 'OPERATIONS';

/** Derive a calendar-sync compliance category for an event. */
export function complianceCategory(ev: RegulatoryEvent): ComplianceCategory {
  const title = (ev.title ?? '').toLowerCase();
  if (title.includes('governing body')) return 'GOVERNING_BODY';
  if (title.includes('qapi'))           return 'QAPI';

  switch (ev.domain) {
    case 'QAPI':       return 'QAPI';
    case 'Governance': return 'GOVERNING_BODY';
    case 'Risk':       return 'RISK';
    case 'Compliance': return 'COMPLIANCE';
    default:           return 'OPERATIONS';
  }
}

/** Whether the sync path must treat this event as a regulatory must. */
export function isComplianceRequired(ev: RegulatoryEvent): boolean {
  const risk = ev.complianceFlags?.auditRisk;
  if (risk === 'critical' || risk === 'high') return true;
  // Governing Body and QAPI are required by regulation regardless of risk tag.
  const cat = complianceCategory(ev);
  return cat === 'GOVERNING_BODY' || cat === 'QAPI';
}

/** Surveyor-facing label for a category. */
export function categoryLabel(c: ComplianceCategory): string {
  switch (c) {
    case 'QAPI':           return 'QAPI';
    case 'GOVERNING_BODY': return 'Governing Body';
    case 'RISK':           return 'Risk Management';
    case 'COMPLIANCE':     return 'Compliance';
    case 'OPERATIONS':     return 'Operations';
  }
}
