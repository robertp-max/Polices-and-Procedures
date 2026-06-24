import type { EgressScanResult, EgressFinding, PhiCategory } from './types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   PHI Egress Guard
   ----------------------------------------------------------------------------
   Inspects any text Brad proposes to send through the relay to Nolan. The
   DEFAULT ACTION IS BLOCK: a request is allowed only when zero critical/high
   PHI/identifier findings remain after normalization. Obfuscation (zero-width
   characters) is stripped and base64 blobs are decoded before scanning so
   encoded PHI cannot slip through. This is enforced in code, not via prompt.
   (Pattern reuse: the PHI-regex + fiction-exception approach from the CNA "Nia"
   guardrails was adapted; heuristic regex, not a classifier — block-by-default
   compensates for recall limits.)
   ═══════════════════════════════════════════════════════════════════════════ */

const ZERO_WIDTH = /[​‌‍⁠﻿­‎‏]/g;

function redact(s: string): string {
  const t = s.trim().replace(/\s+/g, ' ');
  return t.length <= 12 ? '***' : `${t.slice(0, 4)}…${t.slice(-2)}`;
}

interface Detector {
  category: PhiCategory;
  severity: EgressFinding['severity'];
  re: RegExp;
}

/* High-confidence structural identifiers (block immediately). */
const DETECTORS: Detector[] = [
  { category: 'ssn', severity: 'critical', re: /\b\d{3}[-.\s]\d{2}[-.\s]\d{4}\b/ },
  { category: 'dob', severity: 'critical', re: /\b(d\.?o\.?b\.?|date of birth|born)\b/i },
  { category: 'identifying-date', severity: 'high', re: /\b(0?[1-9]|1[0-2])[/\-.](0?[1-9]|[12]\d|3[01])[/\-.](19|20)\d{2}\b/ },
  { category: 'identifying-date', severity: 'high', re: /\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/ }, // ISO YYYY-MM-DD
  { category: 'address', severity: 'high', re: /\b\d{1,6}\s+(?:[A-Z][a-zA-Z]+\s+){0,3}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl|Terrace|Circle|Cir|Highway|Hwy)\b\.?/i },
  { category: 'email', severity: 'high', re: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i },
  { category: 'phone', severity: 'high', re: /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/ },
  { category: 'phone', severity: 'high', re: /\+\d{1,3}[\s.-]?(?:\d[\s.-]?){6,}\d/ }, // international/E.164
  { category: 'account-number', severity: 'high', re: /\b(?:\d[ .\-]?){9,}/ },         // 9+ digit run (bare SSN/MRN/PAN/phone)
  { category: 'ip-address', severity: 'high', re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/ },
  { category: 'mrn', severity: 'critical', re: /\b(mrn|medical record (?:number|no\.?|#)|patient (?:id|number))\b/i },
  { category: 'account-number', severity: 'high', re: /\b(account (?:number|no\.?|#)|acct\s*#?\s*\d{4,})\b/i },
  { category: 'salesforce-id', severity: 'critical', re: /\b(00[1-9DTQ][0-9A-Za-z]{12,15}|003[0-9A-Za-z]{12,15})\b/ },
  { category: 'drive-id', severity: 'critical', re: /\b0A[A-Za-z0-9_-]{12,}\b/ },
  { category: 'internal-user-id', severity: 'critical', re: /\b(EMAIL#|USER#|user[_-]?id\s*[:=]|cognito(?:Username|Sub)|authSubject)\b/i },
  { category: 'license-cert', severity: 'high', re: /\b(RN|LVN|LPN|CNA|HHA|license|cert(?:ificate)?)\s*#?\s*\d{3,}\b/i },
  { category: 'device-id', severity: 'medium', re: /\b(imei|serial(?:\s*(?:number|no\.?|#))|device(?:\s*id))\b/i },
  { category: 'identifying-url', severity: 'high', re: /https?:\/\/[^\s]*?(?:patient|mrn|client|clinician|\bid=|\/0[A-Za-z0-9]{13,})/i },
  { category: 'image-biometric', severity: 'critical', re: /\bdata:image\/[a-z]+;base64,|\b(biometric|fingerprint|face\s*scan)\b/i },
  { category: 'raw-patient-json', severity: 'critical', re: /"(?:firstName|lastName|patientName|clinicianName|dob|dateOfBirth|mrn|ssn|medicalRecordNumber|address|sfOrgId|salesforceId)"\s*:/i },
  { category: 'event-packet', severity: 'critical', re: /\b(event[_\s-]?packet|signed[_\s-]?form|signature[_\s-]?image|evidence[_\s-]?(?:file|attachment)|poc[_\s-]?signature)\b/i },
];

/* Clinical free-text + named-person heuristics (block when a person is implied). */
const CLINICAL_TERMS = /\b(diagnos\w+|prognos\w+|medication\w*|wound|vitals?|admitt?\w*|discharg\w+|hospice|symptom\w*|hospitaliz\w+|comorbid\w*|assessment|care plan|plan of care|oasis)\b/i;
const NAMED_PERSON = /\b[A-Z][a-z]{1,}\s+[A-Z][a-z]{1,}\b/; // "First Last"
const FICTION_HINT = /\b(fictional|example|hypothetical|sample|john doe|jane doe|test patient)\b/i;
const PERSON_CONTEXT = /\b(patient|client|clinician|resident|member|caregiver|aide|nurse|employee|staff)\b/i;

function decodeCandidates(text: string): string[] {
  const out: string[] = [];
  // base64 + base64url blobs (length >= 16 to catch short encoded identifiers).
  const blobs = text.match(/[A-Za-z0-9+/_-]{16,}={0,2}/g) ?? [];
  for (const m of blobs) {
    for (const variant of [m, m.replace(/-/g, '+').replace(/_/g, '/')]) {
      try {
        const decoded = Buffer.from(variant, 'base64').toString('utf8');
        if (/[ -~]/.test(decoded) && /[a-zA-Z]{3,}/.test(decoded)) out.push(decoded);
      } catch { /* not valid base64 */ }
    }
  }
  // percent-encoded content (a model would routinely URL-decode this).
  if (/%[0-9A-Fa-f]{2}/.test(text)) {
    try { const dec = decodeURIComponent(text); if (dec !== text) out.push(dec); } catch { /* invalid */ }
  }
  return out;
}

export function scanForPhiEgress(input: string): EgressScanResult {
  const findings: EgressFinding[] = [];
  const removed: PhiCategory[] = [];

  const hadObfuscation = ZERO_WIDTH.test(input);
  ZERO_WIDTH.lastIndex = 0;
  const normalized = input.replace(ZERO_WIDTH, '');
  if (hadObfuscation) {
    findings.push({ category: 'obfuscation', evidence: 'zero-width/bidi characters', severity: 'high' });
    removed.push('obfuscation');
  }

  // Scan normalized text + any decoded base64 payloads.
  const decoded = decodeCandidates(normalized);
  if (decoded.length > 0) {
    findings.push({ category: 'encoded-content', evidence: `${decoded.length} encoded blob(s)`, severity: 'high' });
  }
  const haystacks = [normalized, ...decoded];

  for (const hay of haystacks) {
    for (const d of DETECTORS) {
      const m = hay.match(d.re);
      if (m) findings.push({ category: d.category, evidence: redact(m[0]), severity: d.severity });
    }
    // Named person near clinical OR person-context (patient/client/clinician/...).
    const personContext = CLINICAL_TERMS.test(hay) || PERSON_CONTEXT.test(hay);
    if (NAMED_PERSON.test(hay) && personContext && !FICTION_HINT.test(hay)) {
      const nm = hay.match(NAMED_PERSON);
      findings.push({ category: 'person-name', evidence: nm ? redact(nm[0]) : 'name+context', severity: 'critical' });
    } else if (CLINICAL_TERMS.test(hay) && PERSON_CONTEXT.test(hay) && !FICTION_HINT.test(hay)) {
      findings.push({ category: 'clinical-note', evidence: 'clinical free-text about a person', severity: 'high' });
    }
  }

  // De-duplicate by category (keep highest severity).
  const bySeverity = { critical: 3, high: 2, medium: 1 } as const;
  const byCat = new Map<PhiCategory, EgressFinding>();
  for (const f of findings) {
    const prev = byCat.get(f.category);
    if (!prev || bySeverity[f.severity] > bySeverity[prev.severity]) byCat.set(f.category, f);
  }
  const deduped = [...byCat.values()];

  // DEFAULT BLOCK: allowed only when no critical/high findings remain.
  const blocking = deduped.filter(f => f.severity === 'critical' || f.severity === 'high');
  return {
    allowed: blocking.length === 0,
    findings: deduped,
    removedCategories: removed,
    normalizedQuery: normalized.trim(),
  };
}
