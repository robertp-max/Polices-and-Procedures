/* ════════════════════════════════════════════════════════════════
   PHASE 4 — Confidential HR/Compliance Personnel Action Addendum.

   Derives one personnel-action review per disciplinary trigger found in
   the clinician source data, classifies the required immediate actions by
   trigger category, and produces a SEALED, access-restricted addendum.

   The MAIN QAPI packet must NOT expose personnel details — it only gets a
   reference summary (id, hash, counts, status) via buildAddendumReference().

   Outcomes are NEVER fabricated: status defaults to "Personnel Action
   Review Required / opened" unless the source explicitly supports a final
   disposition (e.g. confirmed termination or falsification).
   ════════════════════════════════════════════════════════════════ */
import type { ClinicalDump, SourceClinician, ClinicianTrigger, Severity } from './qapiTypes';

export const ADDENDUM_ACCESS_ROLES = [
  'Administrator', 'DON / Clinical Manager', 'Compliance Officer', 'HR Director',
  'Governing Body Chair (or authorized GB reviewer)', 'Legal Counsel (if applicable)',
] as const;

export interface PersonnelAction {
  personnelActionId: string;
  sourceClinicianId: string;
  staffName: string;                  // "staff ID" used if name not authoritative
  role: string;
  clientId?: string;
  eventTrigger: string;
  triggerCategory: string;
  riskLevel: Severity | string;
  requiredImmediateAction: string[];
  assignedOwner: string;
  dueDate: string;
  investigationStatus: string;        // never a fabricated final outcome
  patientImpactReviewRequired: boolean;
  billingClaimsReviewRequired: boolean;
  credentialingReviewRequired: boolean;
  reportabilityReviewRequired: boolean;
  linkedPolicyIds: string[];
  linkedEvidenceIds: string[];
  recommendedHrActionType: string;
  finalHrDisposition: string;         // blank unless source supports it
}

export interface PersonnelAddendum {
  documentId: string;                 // QAPI-HR-ADDENDUM-2026-Q2
  documentName: string;
  confidential: true;
  accessRoles: readonly string[];
  quarterLabel: string;
  generatedFromQuarter: string;
  actions: PersonnelAction[];
  countByCategory: Record<string, number>;
  hash: string;                       // stable content hash (non-crypto, deterministic)
}

export interface AddendumReference {
  addendumId: string;
  hash: string;
  personnelActionReviewsOpened: number;
  countByCategory: Record<string, number>;
  statusSummary: string;
  confidentialityStatement: string;
}

/* ── trigger → required actions / review flags (per mission rules) ── */
interface Rule {
  actions: string[];
  patientImpact: boolean; billing: boolean; credentialing: boolean; reportability: boolean;
  recommendedHrActionType: string;
  policyIds: string[];
}
const RULES: Record<string, Rule> = {
  expired_license: {
    actions: ['Immediate removal from patient care', 'Credentialing audit', 'Patient-impact audit', 'Claims/billing review for affected visits', 'HR investigation', 'Governing body / compliance notification'],
    patientImpact: true, billing: true, credentialing: true, reportability: true,
    recommendedHrActionType: 'Suspension pending investigation', policyIds: ['HR-CR-001', 'CL-PR-001'],
  },
  beyond_scope: {
    actions: ['Immediate scope-of-practice review', 'Remove from prohibited task type', 'Supervisor review', 'Competency review', 'Patient-impact audit'],
    patientImpact: true, billing: false, credentialing: true, reportability: false,
    recommendedHrActionType: 'Corrective action + supervised practice', policyIds: ['CL-SC-002', 'HR-CR-001'],
  },
  falsified_visits: {
    actions: ['Immediate HR/compliance investigation', 'Suspend affected visit billing pending audit', 'Claims/refund review', 'Possible termination recommendation (not final until confirmed)'],
    patientImpact: true, billing: true, credentialing: false, reportability: true,
    recommendedHrActionType: 'Investigation; termination review', policyIds: ['CO-FR-001', 'OP-BI-003'],
  },
  failed_pip_pending_termination: {
    actions: ['Assignment restriction review', 'Supervision plan', 'Management accountability review'],
    patientImpact: true, billing: false, credentialing: false, reportability: false,
    recommendedHrActionType: 'Assignment restriction + supervision', policyIds: ['HR-PM-004'],
  },
  unreported_critical_labs: {
    actions: ['Disciplinary review', 'Reporting-policy retraining', 'RCA', 'Physician-notification audit'],
    patientImpact: true, billing: false, credentialing: false, reportability: true,
    recommendedHrActionType: 'Disciplinary review + retraining', policyIds: ['CL-CM-007', 'CL-PR-006'],
  },
  unreported_falls: {
    actions: ['Disciplinary review', 'Reporting-policy retraining', 'RCA', 'Physician-notification audit'],
    patientImpact: true, billing: false, credentialing: false, reportability: true,
    recommendedHrActionType: 'Disciplinary review + retraining', policyIds: ['RM-IN-002', 'CL-PR-006'],
  },
  hha_no_supervision: {
    actions: ['Aide supervision corrective action plan (CAP)', 'Supervisor accountability review', 'Task authorization audit'],
    patientImpact: true, billing: false, credentialing: false, reportability: false,
    recommendedHrActionType: 'Supervision CAP', policyIds: ['CL-HA-003'],
  },
  unauthorized_tasks: {
    actions: ['Aide supervision corrective action plan (CAP)', 'Supervisor accountability review', 'Task authorization audit'],
    patientImpact: true, billing: false, credentialing: false, reportability: false,
    recommendedHrActionType: 'Supervision CAP + task-authorization review', policyIds: ['CL-HA-003'],
  },
  expired_cpr: {
    actions: ['Credentialing/competency remediation', 'Temporary restriction where clinically necessary'],
    patientImpact: false, billing: false, credentialing: true, reportability: false,
    recommendedHrActionType: 'Credentialing remediation', policyIds: ['HR-CR-002'],
  },
  missing_competency: {
    actions: ['Credentialing/competency remediation', 'Temporary restriction where clinically necessary'],
    patientImpact: false, billing: false, credentialing: true, reportability: false,
    recommendedHrActionType: 'Competency remediation', policyIds: ['HR-CR-002'],
  },
  late_documentation: {
    actions: ['Progressive discipline review', 'Chart audit expansion', 'Coaching (only if low severity, no harm/reportability)'],
    patientImpact: false, billing: false, credentialing: false, reportability: false,
    recommendedHrActionType: 'Progressive discipline / coaching', policyIds: ['CL-DC-101'],
  },
};
const DEFAULT_RULE: Rule = { actions: ['Personnel action review'], patientImpact: true, billing: false, credentialing: false, reportability: false, recommendedHrActionType: 'Personnel action review', policyIds: [] };

// Deterministic non-crypto content hash (stable across runs for identical input).
function stableHash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return 'h' + (h >>> 0).toString(16).padStart(8, '0');
}

function dueDateFor(risk: string): string {
  // relative business guidance, not a fabricated calendar date
  if (risk === 'critical' || risk === 'blocker') return 'IMMEDIATE (same business day)';
  if (risk === 'high') return 'Within 3 business days';
  if (risk === 'medium') return 'Within 7 business days';
  return 'Within 14 business days';
}

function statusFor(t: ClinicianTrigger): string {
  // Never fabricate a final outcome. Only escalate language the source supports.
  if (t.category === 'falsified_visits') return 'Under investigation — termination review';
  if (t.category === 'failed_pip_pending_termination') return 'Open — pending HR determination';
  if (t.category === 'expired_license') return 'Open — suspension pending investigation';
  return 'Personnel Action Review Required — opened';
}

export function buildPersonnelAddendum(dump: ClinicalDump, opts: { quarterLabel?: string; quarter?: string } = {}): PersonnelAddendum {
  const quarterLabel = opts.quarterLabel ?? dump.meta?.quarter ?? 'Q2 2026';
  const quarter = opts.quarter ?? dump.meta?.quarter ?? '2026-Q2';
  const actions: PersonnelAction[] = [];
  const clinicians = Array.isArray(dump.clinicians) ? dump.clinicians : [];
  let seq = 0;
  for (const c of clinicians) {
    for (const t of (c.triggers ?? [])) {
      seq++;
      const rule = RULES[t.category] ?? DEFAULT_RULE;
      const staffName = nameOrId(c);
      actions.push({
        personnelActionId: `PA-${quarter}-${String(seq).padStart(3, '0')}`,
        sourceClinicianId: c.clinician_id,
        staffName,
        role: c.role ?? 'unknown',
        clientId: t.client_id || undefined,
        eventTrigger: t.detail,
        triggerCategory: t.category,
        riskLevel: (t.risk_level as Severity) || 'high',
        requiredImmediateAction: rule.actions,
        assignedOwner: ownerFor(t.category),
        dueDate: dueDateFor(String(t.risk_level || 'high')),
        investigationStatus: statusFor(t),
        patientImpactReviewRequired: rule.patientImpact,
        billingClaimsReviewRequired: rule.billing,
        credentialingReviewRequired: rule.credentialing || /license|cpr|competency/.test(t.category),
        reportabilityReviewRequired: rule.reportability,
        linkedPolicyIds: rule.policyIds,
        linkedEvidenceIds: t.client_id ? [`evidence:${t.client_id}`] : [],
        recommendedHrActionType: rule.recommendedHrActionType,
        finalHrDisposition: '', // blank — never fabricated
      });
    }
  }
  const countByCategory: Record<string, number> = {};
  for (const a of actions) countByCategory[a.triggerCategory] = (countByCategory[a.triggerCategory] ?? 0) + 1;
  const hash = stableHash(JSON.stringify(actions.map((a) => [a.personnelActionId, a.sourceClinicianId, a.triggerCategory, a.investigationStatus])));
  return {
    documentId: `QAPI-HR-ADDENDUM-${quarter}`,
    documentName: `QAPI-HR-ADDENDUM-${quarter} — Confidential Personnel Action Summary`,
    confidential: true,
    accessRoles: ADDENDUM_ACCESS_ROLES,
    quarterLabel,
    generatedFromQuarter: quarter,
    actions,
    countByCategory,
    hash,
  };
}

/** The ONLY thing the main packet may show — no personnel details. */
export function buildAddendumReference(addendum: PersonnelAddendum): AddendumReference {
  const opened = addendum.actions.length;
  return {
    addendumId: addendum.documentId,
    hash: addendum.hash,
    personnelActionReviewsOpened: opened,
    countByCategory: addendum.countByCategory,
    statusSummary: opened ? `${opened} personnel-action review(s) opened across ${Object.keys(addendum.countByCategory).length} categories; details sealed.` : 'No personnel-action reviews this period.',
    confidentialityStatement: 'Confidential personnel details retained in restricted HR/Compliance addendum.',
  };
}

function nameOrId(c: SourceClinician): string {
  const n = String(c.name ?? '').trim();
  return n ? n : `Staff ${c.clinician_id}`; // staff ID when name is not authoritative
}
function ownerFor(category: string): string {
  if (/license|cpr|competency/.test(category)) return 'Credentialing / HR Director';
  if (/falsified|billing|unauthorized/.test(category)) return 'Compliance Officer';
  if (/supervision|hha/.test(category)) return 'DON / Clinical Manager';
  return 'DON / HR Director';
}

/* ── Render the sealed addendum as standalone HTML (restricted document) ── */
export function renderPersonnelAddendumHtml(addendum: PersonnelAddendum): string {
  const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
  const rows = addendum.actions.map((a) => `
    <tr>
      <td>${esc(a.personnelActionId)}</td>
      <td>${esc(a.staffName)}<br><span class="muted">${esc(a.role)} · ${esc(a.sourceClinicianId)}</span></td>
      <td>${esc(a.triggerCategory)}<br><span class="muted">${esc(a.eventTrigger)}</span></td>
      <td><span class="risk risk-${esc(a.riskLevel)}">${esc(a.riskLevel)}</span></td>
      <td><ul>${a.requiredImmediateAction.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></td>
      <td>${esc(a.assignedOwner)}<br><span class="muted">Due: ${esc(a.dueDate)}</span></td>
      <td>${esc(a.investigationStatus)}</td>
      <td>${flag(a.patientImpactReviewRequired)} PI · ${flag(a.billingClaimsReviewRequired)} Bill · ${flag(a.credentialingReviewRequired)} Cred · ${flag(a.reportabilityReviewRequired)} Report</td>
      <td>${esc(a.linkedPolicyIds.join(', ') || '—')}</td>
      <td>${esc(a.finalHrDisposition || '(blank — pending HR determination)')}</td>
    </tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(addendum.documentName)}</title>
  <style>
    body{font:12px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#1f1c1b;margin:0;padding:28px 36px;}
    .seal{background:#7a0c0c;color:#fff;padding:10px 16px;border-radius:8px;font-weight:700;letter-spacing:.04em;display:flex;justify-content:space-between;}
    h1{font-size:20px;color:#7a0c0c;margin:18px 0 4px;} .muted{color:#7a7470;font-size:10px;}
    .access{background:#fbe6e6;border:1px solid #e6b3b3;border-radius:6px;padding:10px 14px;margin:12px 0;font-size:11px;}
    table{width:100%;border-collapse:collapse;font-size:10px;margin-top:12px;}
    th,td{border:1px solid #e3dede;padding:6px 8px;text-align:left;vertical-align:top;}
    th{background:#f4eaea;color:#7a0c0c;} ul{margin:0;padding-left:14px;}
    .risk{padding:1px 6px;border-radius:3px;font-weight:700;font-size:9px;text-transform:uppercase;}
    .risk-critical,.risk-blocker{background:#fbe6e6;color:#b00;} .risk-high{background:#fff3e0;color:#b35200;}
    .risk-medium{background:#fffbe6;color:#8a6d00;} .risk-low{background:#eef7ee;color:#2e7d32;}
    .foot{margin-top:18px;font-size:9px;color:#7a7470;border-top:1px solid #e3dede;padding-top:8px;}
  </style></head><body>
    <div class="seal"><span>🔒 CONFIDENTIAL — RESTRICTED HR / COMPLIANCE</span><span>${esc(addendum.documentId)} · ${esc(addendum.hash)}</span></div>
    <h1>${esc(addendum.documentName)}</h1>
    <div class="muted">Quarter ${esc(addendum.quarterLabel)} · ${addendum.actions.length} personnel-action review(s) · NOT FOR DISTRIBUTION WITH THE MAIN QAPI PACKET</div>
    <div class="access"><strong>Authorized access only:</strong> ${addendum.accessRoles.map(esc).join(' · ')}.</div>
    <table>
      <thead><tr><th>Action ID</th><th>Staff</th><th>Trigger</th><th>Risk</th><th>Required immediate action</th><th>Owner / Due</th><th>Status</th><th>Reviews</th><th>Policies</th><th>Final HR disposition</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="10">No personnel-action reviews this period.</td></tr>'}</tbody>
    </table>
    <div class="foot">Outcomes are not final unless explicitly determined by HR/Compliance. Statuses reflect workflow state at generation. Care Indeed Home Health · Confidential personnel record.</div>
  </body></html>`;
  function flag(b: boolean) { return b ? '✓' : '—'; }
}
