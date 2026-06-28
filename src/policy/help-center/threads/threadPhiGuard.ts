/* ═══════════════════════════════════════════════════════════════════════════
   PHI guard for Help Center threads.
   ----------------------------------------------------------------------------
   Threads are operational help/product discussion only. They must NEVER store
   PHI. This module runs a heuristic detector over thread titles/bodies before
   they are saved, returns the findings, and can produce a sanitized version
   that redacts the offending spans.

   This is a best-effort client-side guard (not a HIPAA-grade DLP). When it
   trips, the UI must warn the user, offer to sanitize, and refuse to save the
   raw content by default. High-sensitivity matches (MRN, SSN, member ID,
   diagnosis tied to a patient) should route to a secure workflow instead.
   ═══════════════════════════════════════════════════════════════════════════ */

export type PhiCategory =
  | 'mrn'
  | 'ssn'
  | 'dob'
  | 'phone'
  | 'address'
  | 'email'
  | 'member_id'
  | 'diagnosis'
  | 'medication'
  | 'patient_name'
  | 'wound_or_visit_detail';

export type PhiFinding = {
  category: PhiCategory;
  /** The matched substring (for redaction + UI highlighting). */
  match: string;
  index: number;
  /** high = block + route to secure workflow; medium = warn + sanitize. */
  severity: 'high' | 'medium';
};

export type PhiScanResult = {
  hasPhi: boolean;
  findings: PhiFinding[];
  /** True when any finding is high-severity (route to secure workflow). */
  requiresSecureWorkflow: boolean;
};

type Rule = {
  category: PhiCategory;
  severity: 'high' | 'medium';
  re: RegExp;
};

// NOTE: order matters only for readability; all rules run. Each `re` must be
// global so matchAll yields every occurrence.
const RULES: Rule[] = [
  // SSN: 123-45-6789 (also 123 45 6789)
  { category: 'ssn', severity: 'high', re: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g },
  // MRN / member id: explicit label followed by an alphanumeric id
  { category: 'mrn', severity: 'high', re: /\b(?:mrn|medical\s*record\s*(?:no|number|#)?)\s*[:#]?\s*[a-z0-9-]{4,}\b/gi },
  { category: 'member_id', severity: 'high', re: /\b(?:member|subscriber|policy|payer)\s*(?:id|no|number|#)\s*[:#]?\s*[a-z0-9-]{4,}\b/gi },
  // DOB: labeled date or bare date
  { category: 'dob', severity: 'high', re: /\b(?:dob|date\s*of\s*birth|d\.o\.b\.?)\s*[:#]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi },
  { category: 'dob', severity: 'medium', re: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g },
  // Phone: (415) 555-1234 / 415-555-1234 / 415.555.1234
  { category: 'phone', severity: 'medium', re: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g },
  // Email
  { category: 'email', severity: 'medium', re: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi },
  // Street address
  { category: 'address', severity: 'medium', re: /\b\d{1,6}\s+[a-z0-9.'\- ]{2,40}\s+(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|ct|court|way|pl|place|apt|suite|ste)\b\.?/gi },
  // Patient-context name: "patient John Smith" / "pt. Jane Doe" / "Mr. Smith"
  { category: 'patient_name', severity: 'high', re: /\b(?:patient|pt\.?|resident|client|member|mr|mrs|ms|dr)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g },
  // Diagnosis / ICD-10 code
  { category: 'diagnosis', severity: 'high', re: /\b(?:dx|diagnos(?:is|ed)|icd[-\s]?10)\b[^.!?\n]{0,60}/gi },
  { category: 'diagnosis', severity: 'high', re: /\b[A-TV-Z]\d{2}(?:\.\d{1,4})?\b/g }, // ICD-10 pattern
  // Medication context
  { category: 'medication', severity: 'medium', re: /\b(?:mg|mcg|ml)\b\s*(?:po|iv|prn|bid|tid|qid|daily)?/gi },
  // Wound / visit detail tied to a patient
  { category: 'wound_or_visit_detail', severity: 'medium', re: /\b(?:wound|pressure\s*ulcer|stage\s*[1-4iv]+|visit\s*note|home\s*visit)\b[^.!?\n]{0,60}/gi },
];

/** Scan text for PHI-like content. Pure + deterministic. */
export function scanForPhi(text: string): PhiScanResult {
  const raw = text ?? '';
  const findings: PhiFinding[] = [];

  for (const rule of RULES) {
    for (const m of raw.matchAll(rule.re)) {
      if (m.index === undefined) continue;
      const match = m[0];
      if (!match.trim()) continue;
      findings.push({
        category: rule.category,
        match,
        index: m.index,
        severity: rule.severity,
      });
    }
  }

  // Sort by position so redaction is left-to-right and stable.
  findings.sort((a, b) => a.index - b.index);

  return {
    hasPhi: findings.length > 0,
    findings,
    requiresSecureWorkflow: findings.some(f => f.severity === 'high'),
  };
}

/** Convenience boolean wrapper. */
export function containsPhi(text: string): boolean {
  return scanForPhi(text).hasPhi;
}

const REDACTION = '[redacted]';

/**
 * Produce a sanitized copy of `text` with every PHI finding replaced by
 * `[redacted]`. Overlapping/adjacent matches are merged so we never emit
 * partial fragments of a redacted span.
 */
export function sanitizePhi(text: string): string {
  const raw = text ?? '';
  const { findings } = scanForPhi(raw);
  if (findings.length === 0) return raw;

  // Merge spans.
  const spans = findings
    .map(f => ({ start: f.index, end: f.index + f.match.length }))
    .sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.start <= last.end) {
      last.end = Math.max(last.end, s.end);
    } else {
      merged.push({ ...s });
    }
  }

  let out = '';
  let cursor = 0;
  for (const span of merged) {
    out += raw.slice(cursor, span.start) + REDACTION;
    cursor = span.end;
  }
  out += raw.slice(cursor);
  return out;
}

export const PHI_WARNING_MESSAGE =
  'This looks like it may include PHI or patient-specific information. Threads are not ' +
  'for patient chart content. Please remove patient identifiers or open the appropriate ' +
  'secure workflow.';

export const PHI_FIELD_WARNING =
  'Do not include patient names, MRNs, dates of birth, addresses, diagnoses, phone numbers, ' +
  'or other PHI.';
