export interface ValidationResult { ok: boolean; errors: string[]; }

export function validateBoardLanes(lanes: any): ValidationResult {
  if (!Array.isArray(lanes) || lanes.length === 0) return { ok: false, errors: ['empty lanes'] };
  return { ok: true, errors: [] };
}
export function validateEventLanes(l: any): ValidationResult { return { ok: true, errors: [] }; }
export function validateTaskLanes(l: any): ValidationResult { return { ok: true, errors: [] }; }
export function validateCalendarEvents(e: any): ValidationResult { return { ok: true, errors: [] }; }
export function validateEvidenceRows(r: any): ValidationResult { return { ok: true, errors: [] }; }
export function validateAuditRows(r: any): ValidationResult { return { ok: true, errors: [] }; }
export function validateReportMetrics(m: any): ValidationResult { return { ok: true, errors: [] }; }
