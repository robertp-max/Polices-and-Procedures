export interface FormSignerSlot {
  field_id: string;
  role: string;
  tier: number;
  required: boolean;
  resolver: string | { role_id: string };
  sequence_group: number;
}

/* ═══════════════════════════════════════════════════════════════
   ENTERPRISE FORMS LIBRARY — 281 ARTIFACTS · FULL CONTENT
   -----------------------------------------------------------------
   Canonical reference: GV-GB-001 appendices.
   Care Indeed branding (teal #007970 / orange #C74601 accents).
   Every form below is fully populated with:
     • Purpose        • Instructions
     • Linked policy IDs
     • Structured sections with fields / columns / checklist items
     • Signatures / attestations where applicable
     • Version footer (version, effective, revision date)
   Forms are both fillable (inputs) and printable.
   ═══════════════════════════════════════════════════════════════ */

// ────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────

export type FieldType =
  | 'text' | 'date' | 'select' | 'checkbox' | 'radio'
  | 'textarea' | 'number' | 'signature' | 'email' | 'tel';

export interface FormField {
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  col?: 1 | 2 | 3 | 4;         // grid column span (of 4)
  placeholder?: string;
  help?: string;
}

export type SectionLayout =
  | 'grid'       // key/value form fields
  | 'table'      // tabular log with column headers
  | 'checklist'  // bulleted checklist with checkboxes
  | 'attestation'// intro + numbered acknowledgments + signature
  | 'narrative'  // long textarea block
  | 'matrix'     // row × column matrix
  | 'signature'; // standalone signature block

export interface FormSection {
  title: string;
  description?: string;
  layout: SectionLayout;
  fields?: FormField[];
  columns?: string[];
  rowCount?: number;
  items?: string[];
  body?: string;
  acknowledgments?: string[];
  matrixRows?: string[];
  matrixCols?: string[];
  /**
   * When true, renders a single section-level acknowledgment row
   * (one checkbox + one initials field) at the bottom of a checklist
   * section instead of per-line date/initials/notes fields.
   * Use only for sections that require discrete section-level sign-off
   * (e.g. competency validation, corrective action items).
   */
  sectionAck?: boolean;
}

export interface SignatureBlock {
  role: string;
  includeName?: boolean;
  includeTitle?: boolean;
  includeDate?: boolean;
}

export interface FormContent {
  id: string;
  title: string;
  type: string;
  domainCode: string;
  policies: string[];
  purpose: string;
  instructions: string;
  version: string;
  effectiveDate: string;
  revisionDate: string;
  orientation: 'portrait' | 'landscape';
  sections: FormSection[];
  signatures?: SignatureBlock[];
  signerSlots?: FormSignerSlot[];
  footerNotes?: string[];
}

// ────────────────────────────────────────────────────────────────
// TYPE TEMPLATE GENERATORS
// Provide default section structure for every form TYPE so that
// a form with minimal override still renders a complete, usable
// document aligned with the gold standard.
// ────────────────────────────────────────────────────────────────

const identityBlock = (): FormSection => ({
  title: 'Section 1 — Identification',
  layout: 'grid',
  fields: [
    { label: 'Form Completed By (Full Name)', type: 'text', required: true, col: 2 },
    { label: 'Title / Role', type: 'text', required: true, col: 2 },
    { label: 'Department / Branch', type: 'text', col: 2 },
    { label: 'Date Completed', type: 'date', required: true, col: 2 },
  ],
});

const signatureSection = (roles: string[]): FormSection => ({
  title: `Section — Signatures & Attestation`,
  layout: 'signature',
  fields: roles.flatMap(r => ([
    { label: `${r} — Printed Name`, type: 'text' as FieldType, col: 2 },
    { label: `${r} — Signature`, type: 'signature' as FieldType, col: 1 },
    { label: `${r} — Date`, type: 'date' as FieldType, col: 1 },
  ])),
});

const logTable = (title: string, columns: string[], rows = 12): FormSection => ({
  title,
  layout: 'table',
  columns,
  rowCount: rows,
});

const checklist = (title: string, items: string[]): FormSection => ({
  title,
  layout: 'checklist',
  items,
});

// ────────────────────────────────────────────────────────────────
// ATTESTATION BUILDER
// ────────────────────────────────────────────────────────────────
const attestationSection = (body: string, ack: string[]): FormSection => ({
  title: 'Section 2 — Attestation',
  layout: 'attestation',
  body,
  acknowledgments: ack,
});

// ────────────────────────────────────────────────────────────────
// VERSION / FOOTER DEFAULTS
// ────────────────────────────────────────────────────────────────
const VERSION = '6.0';
const EFFECTIVE_DATE = '2025-07-10';
const REVISION_DATE = '2026-07-10';

// ────────────────────────────────────────────────────────────────
// PER-FORM NARRATIVE & STRUCTURE OVERRIDES
// Every form gets: purpose, instructions, and (where needed) extra
// sections beyond the type template. The default type template
// fills in a full section set when no custom sections are given.
// ────────────────────────────────────────────────────────────────

interface FormOverride {
  p: string;                 // purpose
  i: string;                 // instructions
  orient?: 'portrait' | 'landscape';
  cols?: string[];           // custom table columns (for Log / Tracking Tool / Matrix)
  rows?: number;             // number of pre-filled blank rows
  items?: string[];          // custom checklist items
  ack?: string[];            // custom attestation bullets
  ackIntro?: string;         // attestation intro text
  fields?: FormField[];      // custom fields for "Form" type
  signers?: string[];        // custom signer roles
  signerSlots?: FormSignerSlot[]; // multi-signer eCIgn slot definitions
  extra?: FormSection[];     // extra bespoke sections
}

export const FORM_OVERRIDES: Record<string, FormOverride> = {
  // ══════════════════ ENTERPRISE CONTROL (EN) ══════════════════
  'EN-FM-001': {
    p: 'Establishes a single enterprise-wide record that every workforce member has received, read, understood, and agreed to abide by an assigned policy, in satisfaction of 42 CFR § 484.105 and the agency Compliance Program.',
    i: 'The assigned workforce member shall complete this form within 30 calendar days of policy issuance or revision. Submitted acknowledgments are retained in the personnel file for seven (7) years. A monthly exception report is generated for any workforce member with outstanding acknowledgments.',
    ackIntro: 'I, the undersigned, hereby certify that:',
    ack: [
      'I have received, read, and reviewed the policy identified below in its entirety.',
      'I understand the content, obligations, and expected behaviors described in the policy as they apply to my role.',
      'I have had the opportunity to ask questions and received satisfactory clarification on any items I did not understand.',
      'I agree to comply with this policy, related procedures, and all referenced regulations at all times during my engagement with Care Indeed Home Health Care, Inc.',
      'I understand that failure to comply may result in corrective or disciplinary action up to and including termination.',
    ],
    fields: [
      { label: 'Policy ID', type: 'text', required: true, col: 2 },
      { label: 'Policy Title', type: 'text', required: true, col: 2 },
      { label: 'Policy Version', type: 'text', col: 2 },
      { label: 'Policy Effective Date', type: 'date', col: 2 },
    ],
    signers: ['Workforce Member'],
    signerSlots: [
      { field_id: 'sig_workforce_member', role: 'Workforce Member', tier: 5, required: true, resolver: 'self', sequence_group: 1 },
      { field_id: 'sig_administrator', role: 'Administrator', tier: 1, required: true, resolver: { role_id: 'administrator' }, sequence_group: 2 },
    ],
  },
  'EN-FM-002': {
    p: 'Canonical master index of every policy in the enterprise taxonomy, including policy ID, title, domain, subdomain, owner, version, effective/revision dates, status, and CoP/regulatory crosswalk.',
    i: 'Maintained by the Policy Administrator on an ongoing basis. Updated at every policy lifecycle event (create, revise, retire). Verified quarterly against the live Policy Library and Compliance Dashboard.',
    cols: ['Policy ID', 'Title', 'Domain', 'Subdomain', 'Owner', 'Version', 'Effective Date', 'Next Review', 'Status', 'Regulatory Ref'],
    rows: 15,
  },
  'EN-FM-003': {
    p: 'Three-tier classification matrix (Tier 1 Enterprise Critical / Tier 2 Operational Standard / Tier 3 Supporting) assigned to every policy to drive review cadence, approval routing, and acknowledgment frequency.',
    i: 'Completed during initial policy authoring and re-validated annually or upon any change in regulatory exposure, patient-safety impact, or financial risk of the subject policy.',
    cols: ['Policy ID', 'Current Tier', 'Proposed Tier', 'Regulatory Driver', 'Patient-Safety Driver', 'Financial Driver', 'Approver', 'Decision Date'],
    rows: 12,
  },
  'EN-FM-004': {
    p: 'Documents the assigned Domain Owner (executive accountable) and Domain Steward (operational lead) for each of the ten enterprise domains; drives escalation paths and policy authoring ownership.',
    i: 'Reviewed by the Compliance Officer at each quarterly Compliance Committee meeting and updated within 5 business days of any personnel change.',
    cols: ['Domain Code', 'Domain Name', 'Executive Owner (Name/Title)', 'Operational Steward (Name/Title)', 'Effective Date', 'Backup Designee', 'Last Verified'],
    rows: 10,
  },
  'EN-FM-005': {
    p: 'Standardized crosswalk template mapping Care Indeed policies to federal (42 CFR § 484, HIPAA, OIG), state (Title 22, California HSC), and accreditation standards (CHAP/ACHC).',
    i: 'Completed during initial authoring of every policy and re-verified annually or whenever a regulatory change alert is issued.',
    cols: ['Regulation Citation', 'Regulation Title', 'Regulation Excerpt', 'Care Indeed Policy ID', 'Policy Section Reference', 'Coverage (Full/Partial/Gap)', 'Evidence Document'],
    rows: 12,
  },
  'EN-FM-006': {
    p: 'Captures identified gaps between current Care Indeed policy/practice and federal or state regulatory requirements, with owner, corrective action, target date, and verification evidence.',
    i: 'Completed during annual Compliance Risk Assessment and at any regulatory change event. Open gaps are tracked to closure by the Compliance Officer and reported to the Governing Body.',
    cols: ['Gap ID', 'Regulation', 'Gap Description', 'Risk Rating (H/M/L)', 'Owner', 'Corrective Action', 'Target Date', 'Status', 'Evidence of Closure'],
    rows: 15,
  },
  'EN-FM-007': {
    p: 'Standardized authoring template ensuring every new or revised policy follows the gold-standard ten-section structure (Purpose, Scope, Definitions, Policy Statements, Procedures, Roles, Documentation, Compliance, References, Appendices).',
    i: 'Used by any workforce member developing or revising a policy. Draft is routed via the Policy Approval Routing Form (EN-FM-008) for formal review and approval prior to publication.',
    fields: [
      { label: 'Proposed Policy ID', type: 'text', required: true, col: 2 },
      { label: 'Proposed Title', type: 'text', required: true, col: 2 },
      { label: 'Policy Tier (1/2/3)', type: 'select', options: ['Tier 1 — Enterprise Critical', 'Tier 2 — Operational Standard', 'Tier 3 — Supporting'], col: 2 },
      { label: 'Domain / Subdomain', type: 'text', col: 2 },
      { label: 'Policy Owner', type: 'text', col: 2 },
      { label: 'Target Effective Date', type: 'date', col: 2 },
      { label: 'Purpose Statement', type: 'textarea', col: 4 },
      { label: 'Scope', type: 'textarea', col: 4 },
      { label: 'Regulatory References', type: 'textarea', col: 4 },
      { label: 'Summary of Changes (if revision)', type: 'textarea', col: 4 },
    ],
    signers: ['Author', 'Domain Steward'],
  },
  'EN-FM-008': {
    p: 'Controls the formal review, approval, and publication of every policy draft through the mandatory approval chain (Author → Domain Steward → Compliance Officer → Administrator → Governing Body as required).',
    i: 'Initiated upon completion of EN-FM-007. Each approver shall document review date, decision (Approve / Approve with Revisions / Reject), and signature within 10 business days.',
    cols: ['Reviewer Role', 'Reviewer Name', 'Received Date', 'Review Comments', 'Decision', 'Signature', 'Date Signed'],
    rows: 6,
  },
  'EN-FM-009': {
    p: 'Immutable version-control log for every published policy — records each version, effective date, approver, and summary of changes for permanent audit retention.',
    i: 'Automatically appended by the Policy Administrator at each approved revision. Entries are never deleted; superseded entries are marked as "Archived."',
    cols: ['Policy ID', 'Version', 'Revision Type (Major/Minor)', 'Effective Date', 'Summary of Changes', 'Approved By', 'Archive Reference'],
    rows: 15,
  },
  'EN-FM-010': {
    p: 'Master schedule documenting the mandatory annual review cycle for every policy in the taxonomy, including lookahead triggers and escalation on overdue items.',
    i: 'Maintained by the Policy Administrator. Overdue reviews (>30 days past target date) are escalated to the Compliance Committee and reported on the Compliance Dashboard.',
    cols: ['Policy ID', 'Title', 'Last Reviewed', 'Review Cycle', 'Next Review Due', 'Owner', 'Status', 'Days Overdue'],
    rows: 15,
  },
  'EN-FM-011': {
    p: 'Documents a request for a temporary, documented, time-limited exception or waiver from full compliance with a policy where business or clinical circumstances warrant.',
    i: 'Submitted by the requester to the Domain Owner and Compliance Officer. Exceptions may not exceed 180 calendar days without re-approval. All exceptions are logged on EN-FM-012.',
    fields: [
      { label: 'Requester Name / Title', type: 'text', required: true, col: 2 },
      { label: 'Policy ID Subject to Waiver', type: 'text', required: true, col: 2 },
      { label: 'Specific Provision(s) Affected', type: 'textarea', col: 4 },
      { label: 'Business / Clinical Justification', type: 'textarea', required: true, col: 4 },
      { label: 'Compensating Controls', type: 'textarea', col: 4 },
      { label: 'Requested Start Date', type: 'date', col: 2 },
      { label: 'Requested End Date', type: 'date', col: 2 },
      { label: 'Risk Level (High/Medium/Low)', type: 'select', options: ['High', 'Medium', 'Low'], col: 2 },
      { label: 'Regulatory Impact Assessment', type: 'textarea', col: 4 },
    ],
    signers: ['Requester', 'Domain Owner', 'Compliance Officer', 'Administrator'],
    signerSlots: [
      { field_id: 'sig_requester', role: 'Requester', tier: 5, required: true, resolver: 'self', sequence_group: 1 },
      { field_id: 'sig_domain_owner', role: 'Domain Owner', tier: 3, required: true, resolver: { role_id: 'domain_owner' }, sequence_group: 2 },
      { field_id: 'sig_compliance_officer', role: 'Compliance Officer', tier: 2, required: true, resolver: { role_id: 'compliance_officer' }, sequence_group: 3 },
      { field_id: 'sig_administrator', role: 'Administrator', tier: 1, required: true, resolver: { role_id: 'administrator' }, sequence_group: 3 },
    ],
  },
  'EN-FM-012': {
    p: 'Running log of every policy exception and waiver granted, active, expired, or rescinded, for audit traceability and trend analysis.',
    i: 'Updated within one business day of any approval, renewal, or rescission. Reviewed quarterly by the Compliance Committee for pattern analysis.',
    cols: ['Waiver ID', 'Policy ID', 'Requester', 'Justification Summary', 'Start Date', 'End Date', 'Risk Level', 'Status', 'Reviewer'],
    rows: 15,
  },
  'EN-FM-013': {
    p: 'Cross-reference matrix identifying which policies apply to each workforce role (Governing Body, Admin, Clinical, HHA, HR, IT, Contractor, Volunteer) to drive role-based acknowledgment assignment.',
    i: 'Completed at policy issuance and re-validated at annual policy review. Policy Administrator generates per-role acknowledgment packets from this matrix.',
    cols: ['Policy ID', 'Governing Body', 'Admin/Leadership', 'Clinical (RN/PT/OT/SLP/MSW)', 'HHA', 'HR', 'IT', 'Contractor', 'Volunteer'],
    rows: 15,
  },
  'EN-FM-014': {
    p: 'Tracks which workforce members have completed the Universal Policy Acknowledgment (EN-FM-001) for each assigned policy, with date, outstanding list, and escalation triggers.',
    i: 'Updated in real time as acknowledgments are submitted. Individuals with outstanding acknowledgments beyond 30 days are reported to their supervisor and the Compliance Officer.',
    cols: ['Workforce ID', 'Employee Name', 'Role', 'Policy ID', 'Policy Version', 'Assigned Date', 'Acknowledged Date', 'Status', 'Days Outstanding'],
    rows: 15,
  },
  'EN-FM-015': {
    p: 'Requests the formal retirement, sunset, or consolidation of an obsolete or superseded policy.',
    i: 'Completed by the policy owner; routed through Domain Owner, Compliance Officer, and Administrator. Retired policies remain in the Archive for seven (7) years.',
    fields: [
      { label: 'Policy ID to Retire', type: 'text', required: true, col: 2 },
      { label: 'Policy Title', type: 'text', required: true, col: 2 },
      { label: 'Reason for Retirement', type: 'textarea', required: true, col: 4 },
      { label: 'Replacement Policy (if any)', type: 'text', col: 2 },
      { label: 'Effective Retirement Date', type: 'date', required: true, col: 2 },
      { label: 'Communication Plan to Affected Workforce', type: 'textarea', col: 4 },
    ],
    signers: ['Policy Owner', 'Compliance Officer', 'Administrator'],
  },
  'EN-FM-016': {
    p: 'Evaluates the regulatory, operational, clinical, and workforce impact of retiring, consolidating, or replacing a policy.',
    i: 'Completed in parallel with EN-FM-015. Findings drive the final go/no-go retirement decision and inform mitigation planning.',
    fields: [
      { label: 'Policy Being Retired', type: 'text', required: true, col: 2 },
      { label: 'Assessor Name / Role', type: 'text', required: true, col: 2 },
      { label: 'Regulatory Impact Summary', type: 'textarea', col: 4 },
      { label: 'Clinical Impact Summary', type: 'textarea', col: 4 },
      { label: 'Workforce Impact Summary', type: 'textarea', col: 4 },
      { label: 'Financial Impact Summary', type: 'textarea', col: 4 },
      { label: 'Recommended Go/No-Go Decision', type: 'select', options: ['Proceed with Retirement', 'Defer — Mitigation Required', 'Do Not Retire'], col: 4 },
      { label: 'Required Mitigation Actions', type: 'textarea', col: 4 },
    ],
    signers: ['Assessor', 'Compliance Officer'],
  },
  'EN-FM-017': {
    p: 'Canonical dashboard template consolidating enterprise compliance KPIs (policy coverage, acknowledgment %, audit findings, training completion, incident trend).',
    i: 'Generated monthly by the Compliance Officer and presented to the Administrator, QAPI Committee, and Governing Body.',
    cols: ['KPI', 'Target', 'Current Value', 'Trend (vs. Prior Month)', 'Status (G/A/R)', 'Owner', 'Mitigation Plan'],
    rows: 12,
  },
  'EN-FM-018': {
    p: 'Standardized reporting form used by each department to submit quarterly KPI data to the Compliance Officer for enterprise roll-up.',
    i: 'Due within 10 business days after quarter-end. Late submissions are reported on the Compliance Dashboard.',
    fields: [
      { label: 'Department / Domain', type: 'text', required: true, col: 2 },
      { label: 'Reporting Quarter (e.g., Q2 2026)', type: 'text', required: true, col: 2 },
      { label: 'Submitted By', type: 'text', required: true, col: 2 },
      { label: 'KPI 1 — Name / Value / Target', type: 'textarea', col: 4 },
      { label: 'KPI 2 — Name / Value / Target', type: 'textarea', col: 4 },
      { label: 'KPI 3 — Name / Value / Target', type: 'textarea', col: 4 },
      { label: 'Narrative / Highlights / Risks', type: 'textarea', col: 4 },
    ],
    signers: ['Department Lead'],
  },
  'EN-FM-019': {
    p: 'Documents remediation actions and timelines for any identified non-compliance finding from internal audit, survey, or self-assessment.',
    i: 'Completed within 10 business days of finding. Open actions are tracked weekly until verified closure by the Compliance Officer.',
    fields: [
      { label: 'Finding ID / Source', type: 'text', required: true, col: 2 },
      { label: 'Date Identified', type: 'date', required: true, col: 2 },
      { label: 'Finding Description', type: 'textarea', required: true, col: 4 },
      { label: 'Root Cause', type: 'textarea', col: 4 },
      { label: 'Corrective Action Plan', type: 'textarea', required: true, col: 4 },
      { label: 'Responsible Owner', type: 'text', col: 2 },
      { label: 'Target Closure Date', type: 'date', col: 2 },
      { label: 'Verification Evidence', type: 'textarea', col: 4 },
    ],
    signers: ['Owner', 'Compliance Officer'],
  },
  'EN-FM-020': {
    p: 'Submitted when two or more policies appear to conflict with each other in obligation, timing, or scope; used to request formal resolution.',
    i: 'Filed by any workforce member to the Compliance Officer. Resolution is tracked on EN-FM-023 and typically completed within 30 days.',
    fields: [
      { label: 'Submitter Name / Role', type: 'text', required: true, col: 2 },
      { label: 'Policy ID A', type: 'text', required: true, col: 1 },
      { label: 'Policy ID B', type: 'text', required: true, col: 1 },
      { label: 'Conflict Description', type: 'textarea', required: true, col: 4 },
      { label: 'Operational Impact', type: 'textarea', col: 4 },
      { label: 'Proposed Resolution', type: 'textarea', col: 4 },
    ],
    signers: ['Submitter', 'Compliance Officer'],
  },
  'EN-FM-021': {
    p: 'Standardized template for Inter-Domain Coordination meeting minutes, documenting attendees, decisions, action items, and cross-domain commitments.',
    i: 'Used at every inter-domain coordination session. Minutes finalized within 5 business days and filed in the Governance record.',
    fields: [
      { label: 'Meeting Date / Time', type: 'text', required: true, col: 2 },
      { label: 'Location / Modality', type: 'text', col: 2 },
      { label: 'Facilitator', type: 'text', col: 2 },
      { label: 'Recorder', type: 'text', col: 2 },
      { label: 'Attendees (Name / Domain)', type: 'textarea', col: 4 },
      { label: 'Agenda Items Reviewed', type: 'textarea', col: 4 },
      { label: 'Decisions Made', type: 'textarea', col: 4 },
      { label: 'Action Items (Owner / Due Date)', type: 'textarea', col: 4 },
      { label: 'Next Meeting Date', type: 'date', col: 2 },
    ],
    signers: ['Facilitator', 'Recorder'],
  },
  'EN-FM-022': {
    p: 'Enterprise policy compliance scorecard aggregating each domain\'s adherence metrics into a single quarterly board-level view.',
    i: 'Prepared by the Compliance Officer at quarter-end for presentation to the QAPI Committee and Governing Body.',
    cols: ['Domain', '# Policies', '% Current Review', '% Acknowledgment', '% Audit Findings Closed', 'Composite Score', 'Trend'],
    rows: 10,
  },
  'EN-FM-023': {
    p: 'Tracks all submitted cross-domain policy conflicts from identification through resolution.',
    i: 'Updated by the Compliance Officer upon receipt of any EN-FM-020. Entries remain open until resolution is signed off and policy revisions (if any) are published.',
    cols: ['Conflict ID', 'Policy A', 'Policy B', 'Identified By', 'Opened', 'Resolution', 'Closed Date'],
    rows: 10,
  },
  'EN-FM-024': {
    p: 'Alternate exception/waiver form used when a policy-level exception also triggers a compensating regulatory disclosure.',
    i: 'Routed simultaneously to Compliance Officer and Legal Counsel. Maintained in the waiver register alongside EN-FM-011.',
    fields: [
      { label: 'Waiver ID (auto)', type: 'text', col: 2 },
      { label: 'Originating Policy', type: 'text', required: true, col: 2 },
      { label: 'Nature of Exception', type: 'textarea', col: 4 },
      { label: 'Regulatory Disclosure Needed? (Y/N)', type: 'select', options: ['Yes', 'No'], col: 2 },
      { label: 'Disclosure Agency / Date', type: 'text', col: 2 },
    ],
    signers: ['Requester', 'Compliance Officer', 'Legal Counsel'],
  },
  'EN-FM-025': {
    p: 'Checklist confirming that every retirement/obsolescence step was completed prior to final policy sunset (archival, communication, replacement mapping, training update).',
    i: 'Completed by the Policy Administrator concurrent with EN-FM-015 and signed off by the Compliance Officer.',
    items: [
      'Superseding or consolidating policy identified (if applicable)',
      'Impact assessment (EN-FM-016) completed and approved',
      'Final version of retiring policy archived with metadata',
      'Communication issued to all affected workforce',
      'Training module updated or retired',
      'Acknowledgment registry retired for the policy',
      'References to the retired policy audited and updated across all policies',
      'Retirement entry appended to EN-FM-009 Version Control Log',
      'Regulatory mapping / crosswalk updated',
      'Retirement date confirmed with Governing Body',
    ],
  },
  'EN-FM-026': {
    p: 'Matrix indicating applicability of each policy by role grouping for recruiting, onboarding, and role-change workflows.',
    i: 'Reviewed annually by HR, Compliance, and Domain Owners. Used to auto-provision onboarding policy packets.',
    cols: ['Policy ID', 'Title', 'Executive', 'Admin', 'RN/Clinician', 'HHA', 'Intake', 'Billing', 'IT', 'HR', 'Contractor'],
    rows: 15,
  },
  'EN-FM-027': {
    p: 'Annual tracking report summarizing workforce policy acknowledgment completion rates by role and domain.',
    i: 'Generated by the Compliance Officer each January for the prior calendar year. Presented to the Governing Body.',
    cols: ['Role Group', '# Policies Assigned', '# Acknowledged', '% Completion', 'Outstanding > 30 Days', 'Action Plan'],
    rows: 10,
  },
  'EN-FM-028': {
    p: 'Audit worksheet evaluating the accuracy and completeness of policy-to-regulation mappings in the enterprise crosswalk.',
    i: 'Performed annually by the Compliance Officer or designee. Findings feed EN-FM-006 Gap Analysis.',
    cols: ['Regulation', 'Mapped Policy', 'Mapping Accurate? (Y/N)', 'Comment', 'Corrective Action'],
    rows: 15,
  },
  'EN-FM-029': {
    p: 'Release-notes template documenting each published version of the enterprise policy taxonomy.',
    i: 'Issued with every taxonomy version release. Distributed to all Domain Owners and published in the Policy Library.',
    fields: [
      { label: 'Taxonomy Version', type: 'text', required: true, col: 2 },
      { label: 'Release Date', type: 'date', required: true, col: 2 },
      { label: 'Summary of Changes', type: 'textarea', col: 4 },
      { label: 'New Policies Added', type: 'textarea', col: 4 },
      { label: 'Policies Revised', type: 'textarea', col: 4 },
      { label: 'Policies Retired', type: 'textarea', col: 4 },
      { label: 'Impact to Workforce', type: 'textarea', col: 4 },
    ],
    signers: ['Policy Administrator', 'Compliance Officer'],
  },

  // ══════════════════ GOVERNANCE (GV) ══════════════════
  'GV-FM-001': {
    p: 'Control checklist governing the orderly closure, sale, merger, or change of ownership of Care Indeed Home Health Care, Inc., ensuring patient continuity-of-care, record retention, and regulatory notifications.',
    i: 'Initiated at least 90 calendar days prior to any closure or change-of-ownership event. Each task shall be dated and initialed by the responsible leader.',
    items: [
      'Governing Body resolution approving closure / CHOW',
      'Notice filed with CDPH Licensing & Certification ≥ 30 days in advance',
      'CMS Form 855A/855R submitted to MAC',
      'State Medicaid agency notified in writing',
      'All active patients given ≥ 15 day written notice and continuity-of-care plan',
      'Transferring agency identified for all active episodes',
      'Medical records transfer / retention plan executed',
      'OASIS transmission final run completed',
      'Final claim submission cycle closed',
      'Workforce separation notices issued per WARN Act if applicable',
      'IRS / SSA / state tax filings finalized',
      'Business Associate Agreements terminated or transferred',
      'Bank accounts, credit lines, and vendor contracts closed',
      'Physical records secured; electronic records archived for 7 years (HIPAA)',
      'Final report submitted to Governing Body and filed in Governance record',
    ],
    signers: ['Administrator', 'Compliance Officer', 'Governing Body Chair'],
  },
  'GV-FM-002': {
    p: 'Master register of every agency-level credential and licensure (CMS certification, CDPH license, state business licenses, DEA, accreditation, NPI, tax IDs) with number, issue/expiry dates, and renewal ownership.',
    i: 'Maintained by the Administrator. Expirations within 120 days trigger a renewal work order. Verified at each quarterly Compliance Committee meeting.',
    cols: ['Credential Type', 'Issuing Authority', 'Number', 'Issue Date', 'Expiry Date', 'Renewal Owner', 'Status', 'Evidence File'],
    rows: 12,
  },
  'GV-FM-003': {
    p: 'Official agency organizational chart establishing reporting relationships from the Governing Body through senior clinical and administrative leadership as required by 42 CFR § 484.105.',
    i: 'Updated within 7 calendar days of any reorganization or leadership change. Posted in the Administrator\'s office and included in every surveyor packet.',
    fields: [
      { label: 'Organizational Chart Version', type: 'text', required: true, col: 2 },
      { label: 'Effective Date', type: 'date', required: true, col: 2 },
      { label: 'Governing Body Chair', type: 'text', col: 2 },
      { label: 'Administrator', type: 'text', col: 2 },
      { label: 'Clinical Manager / DON', type: 'text', col: 2 },
      { label: 'Compliance Officer', type: 'text', col: 2 },
      { label: 'Reporting Lines Narrative', type: 'textarea', col: 4 },
    ],
    signers: ['Administrator', 'Governing Body Chair'],
  },
  'GV-FM-004': {
    p: 'Standardized agenda template for all Governing Body meetings ensuring coverage of statutory topics (QAPI report, compliance report, clinical outcomes, finances, risk, administrator report).',
    i: 'Distributed to all Governing Body members at least 5 business days in advance of each meeting. Final agenda archived with meeting minutes.',
    fields: [
      { label: 'Meeting Date / Time / Location', type: 'text', required: true, col: 4 },
      { label: 'Meeting Type (Regular / Special / Executive)', type: 'select', options: ['Regular', 'Special', 'Executive Session'], col: 2 },
      { label: 'Chair', type: 'text', col: 2 },
      { label: 'Invited Attendees', type: 'textarea', col: 4 },
      { label: 'Agenda Item 1', type: 'text', col: 4 },
      { label: 'Agenda Item 2', type: 'text', col: 4 },
      { label: 'Agenda Item 3', type: 'text', col: 4 },
      { label: 'Agenda Item 4', type: 'text', col: 4 },
      { label: 'Agenda Item 5', type: 'text', col: 4 },
      { label: 'Additional Items', type: 'textarea', col: 4 },
    ],
    signers: ['Chair'],
  },
  'GV-FM-005': {
    p: 'Meeting minutes template capturing attendees, discussions, decisions, motions, votes, and action items for every Governing Body meeting, retained permanently.',
    i: 'Recorder produces a draft within 5 business days; approved at the next meeting. Minutes are maintained in the Governance record.',
    fields: [
      { label: 'Meeting Date', type: 'date', required: true, col: 2 },
      { label: 'Recorder', type: 'text', required: true, col: 2 },
      { label: 'Members Present', type: 'textarea', col: 4 },
      { label: 'Members Absent', type: 'textarea', col: 4 },
      { label: 'Quorum Confirmed? (Y/N)', type: 'select', options: ['Yes', 'No'], col: 2 },
      { label: 'Approval of Prior Minutes', type: 'textarea', col: 4 },
      { label: 'Discussion Summary', type: 'textarea', col: 4 },
      { label: 'Motions / Votes', type: 'textarea', col: 4 },
      { label: 'Action Items (Owner / Due)', type: 'textarea', col: 4 },
      { label: 'Adjournment Time', type: 'text', col: 2 },
    ],
    signers: ['Chair', 'Recorder'],
  },
  'GV-FM-006': {
    p: 'Conflict of interest disclosure completed by every Governing Body member, officer, and senior leader to identify and manage actual, potential, or perceived conflicts.',
    i: 'Completed at appointment, annually, and within 7 days of any change in circumstances. Disclosed conflicts are reviewed by the Governance & Audit Committee.',
    fields: [
      { label: 'Full Legal Name', type: 'text', required: true, col: 2 },
      { label: 'Title / Role', type: 'text', required: true, col: 2 },
      { label: 'Date of Appointment', type: 'date', col: 2 },
      { label: 'Disclosure Type', type: 'select', options: ['Initial', 'Annual', 'Change in Circumstances'], col: 2 },
      { label: 'Do you or immediate family have a financial interest in any vendor, contractor, or competitor of the Agency? (Describe)', type: 'textarea', col: 4 },
      { label: 'Do you hold any outside employment, board seat, or advisory role that could conflict with Agency duties? (Describe)', type: 'textarea', col: 4 },
      { label: 'Have you received any gift, gratuity, or benefit valued > $50 from any Agency-related party in the past 12 months? (Describe)', type: 'textarea', col: 4 },
      { label: 'Other potential or perceived conflicts', type: 'textarea', col: 4 },
    ],
    ackIntro: 'I hereby certify that:',
    ack: [
      'The information provided is true, complete, and accurate to the best of my knowledge.',
      'I understand my ongoing obligation to disclose any new conflict within 7 calendar days of becoming aware.',
      'I will recuse myself from any deliberation or vote on matters in which I have a disclosed conflict.',
      'I have read and agree to abide by the Code of Conduct and Conflict of Interest Policy.',
    ],
    signers: ['Disclosing Party'],
  },
  'GV-FM-007': {
    p: 'Formal written delegation of specific operational authorities from the Governing Body or Administrator to a designated individual, with effective date, scope, duration, and revocation provisions.',
    i: 'Executed for any delegation lasting more than 10 business days. Retained in the Governance record and referenced on GV-FM-017 Delegation Log.',
    fields: [
      { label: 'Delegating Authority (Role)', type: 'text', required: true, col: 2 },
      { label: 'Delegate (Name / Role)', type: 'text', required: true, col: 2 },
      { label: 'Effective Start Date', type: 'date', required: true, col: 2 },
      { label: 'Effective End Date', type: 'date', col: 2 },
      { label: 'Specific Authorities Delegated', type: 'textarea', required: true, col: 4 },
      { label: 'Limitations on Delegated Authority', type: 'textarea', col: 4 },
      { label: 'Reporting Expectations', type: 'textarea', col: 4 },
      { label: 'Revocation Conditions', type: 'textarea', col: 4 },
    ],
    signers: ['Delegating Authority', 'Delegate', 'Witness'],
  },
  'GV-FM-008': {
    p: 'Annual self-assessment tool used by the Governing Body to evaluate its own effectiveness, composition, knowledge, and statutory performance.',
    i: 'Administered to each member at least annually. Results are aggregated by the Chair and reviewed in a dedicated session; action plan documented.',
    cols: ['Performance Area', 'Self-Rating 1-5', 'Evidence / Comments'],
    rows: 12,
  },
  'GV-FM-009': {
    p: 'Documentation of the agency\'s annual strategic planning process, including mission/vision review, SWOT analysis, goals, KPIs, and resource allocation.',
    i: 'Completed annually by the Governing Body with input from senior leadership. Approved goals cascade to QAPI and operational plans.',
    fields: [
      { label: 'Planning Year', type: 'text', required: true, col: 2 },
      { label: 'Facilitator', type: 'text', col: 2 },
      { label: 'Mission / Vision Review Notes', type: 'textarea', col: 4 },
      { label: 'Strengths', type: 'textarea', col: 4 },
      { label: 'Weaknesses', type: 'textarea', col: 4 },
      { label: 'Opportunities', type: 'textarea', col: 4 },
      { label: 'Threats', type: 'textarea', col: 4 },
      { label: 'Top 3-5 Strategic Goals', type: 'textarea', col: 4 },
      { label: 'Key KPIs & Targets', type: 'textarea', col: 4 },
      { label: 'Resource / Budget Commitments', type: 'textarea', col: 4 },
    ],
    signers: ['Chair', 'Administrator'],
  },
  'GV-FM-010': {
    p: 'Authorizes the engagement of external legal counsel for a specific matter, documenting scope, budget, and conflict check.',
    i: 'Completed by the Administrator for any non-routine legal engagement. Approved by the Governing Body for engagements > $25,000.',
    fields: [
      { label: 'Matter / Engagement Title', type: 'text', required: true, col: 4 },
      { label: 'Law Firm / Attorney', type: 'text', required: true, col: 2 },
      { label: 'Proposed Fee Structure', type: 'text', col: 2 },
      { label: 'Scope of Work', type: 'textarea', col: 4 },
      { label: 'Conflict Check Completed? (Y/N)', type: 'select', options: ['Yes', 'No'], col: 2 },
      { label: 'Estimated Budget', type: 'text', col: 2 },
    ],
    signers: ['Administrator', 'Governing Body Chair'],
  },
  'GV-FM-011': {
    p: 'Contact matrix and roster of every current Governing Body member, including preferred contact information, emergency contact, and competency areas.',
    i: 'Maintained by the Chair\'s office. Used for emergency convening, voting actions, and surveyor reference. Updated within 3 business days of any change.',
    cols: ['Member Name', 'Role', 'Voting Status', 'Primary Phone', 'Email', 'Emergency Contact', 'Competency Area'],
    rows: 10,
  },
  'GV-FM-012': {
    p: 'Confidentiality acknowledgment executed prior to any Executive Session of the Governing Body, binding attendees to non-disclosure of executive-session deliberations.',
    i: 'Signed by each attendee at the start of every Executive Session. Retained with the Executive Session minutes.',
    ackIntro: 'Prior to participating in this Executive Session, I acknowledge and agree that:',
    ack: [
      'The matters discussed in this Executive Session are confidential and privileged.',
      'I shall not disclose the substance of the discussion to any person who is not an authorized participant, except as required by law.',
      'I shall not use any information obtained in this Session for personal benefit or to the detriment of the Agency.',
      'My obligation of confidentiality continues after my term, role, or relationship with the Agency ends.',
      'A breach of this agreement may result in removal, legal action, and/or termination of my relationship with the Agency.',
    ],
    signers: ['Executive Session Attendee'],
  },
  'GV-FM-013': {
    p: 'Documented Administrator succession plan ensuring continuity of leadership in the event of planned or unplanned Administrator absence or departure.',
    i: 'Reviewed and updated annually by the Governing Body. Primary and secondary successors identified with readiness assessment.',
    fields: [
      { label: 'Current Administrator', type: 'text', required: true, col: 2 },
      { label: 'Plan Version / Date', type: 'text', required: true, col: 2 },
      { label: 'Primary Successor (Name / Role)', type: 'text', col: 2 },
      { label: 'Secondary Successor', type: 'text', col: 2 },
      { label: 'Readiness Assessment (Primary)', type: 'textarea', col: 4 },
      { label: 'Development Plan for Primary Successor', type: 'textarea', col: 4 },
      { label: 'Trigger Events Activating Plan', type: 'textarea', col: 4 },
      { label: 'Communication Plan', type: 'textarea', col: 4 },
    ],
    signers: ['Governing Body Chair', 'Administrator'],
  },
  'GV-FM-014': {
    p: 'Checklist verifying that the Administrator candidate meets every qualification mandated by 42 CFR § 484.105(b) and California state regulation prior to appointment.',
    i: 'Completed by the Governing Body or designee at time of appointment. Original retained in personnel file.',
    items: [
      'Bachelor\'s degree or higher from accredited institution (verified)',
      'Minimum 1 year of health service administration experience (verified)',
      'Knowledge of Medicare Conditions of Participation demonstrated',
      'Prior operational management experience documented',
      'OIG / SAM / GSA exclusion check completed — not excluded',
      'State-level administrator or HHA licensure (if applicable)',
      'Professional references verified (minimum 3)',
      'Background check completed and acceptable',
      'Letters of appointment issued and signed by Governing Body',
      'Orientation to agency policies and procedures completed within 30 days',
    ],
    signers: ['Governing Body Chair'],
  },
  'GV-FM-015': {
    p: 'Checklist verifying Clinical Manager / DON qualifications per 42 CFR § 484.105(c) and California Title 22 requirements prior to designation.',
    i: 'Completed by the Administrator at time of appointment. Original retained in personnel file. Re-verified at each Clinical Manager change.',
    items: [
      'Current, unrestricted California RN license (verified via primary source)',
      'Minimum 1 year supervisory experience in home health or related setting',
      'Knowledge of Medicare home health CoPs demonstrated',
      'Documented clinical competency in home health scope',
      'OIG / SAM / GSA exclusion check completed — not excluded',
      'Current CPR/BLS certification',
      'Professional references verified (minimum 3)',
      'Background check completed and acceptable',
      'Letter of designation signed by Administrator and Governing Body',
      'Orientation to clinical policies completed within 30 days',
    ],
    signers: ['Administrator', 'Governing Body Chair'],
  },
  'GV-FM-016': {
    p: 'Definition matrix describing the scope of services provided by the agency, including disciplines, geographic coverage, payer mix, and any excluded populations or conditions.',
    i: 'Reviewed annually by the Governing Body and updated immediately upon any service-line change. Filed with CDPH as required.',
    cols: ['Service Line', 'Included? (Y/N)', 'Discipline', 'Geographic Area', 'Payer Sources', 'Age Range', 'Exclusions / Limitations'],
    rows: 12,
  },
  'GV-FM-017': {
    p: 'Running log of every delegation of authority (DOA) executed, amended, or rescinded, for audit traceability.',
    i: 'Updated by the Chair\'s office within 1 business day of any change. Referenced during every internal audit and CMS survey.',
    cols: ['DOA ID', 'Delegator', 'Delegate', 'Authority Delegated', 'Effective Date', 'End Date', 'Status', 'Reference Document'],
    rows: 12,
  },
  'GV-FM-018': {
    p: 'Register of every active interagency agreement, service contract, and transfer agreement entered into by Care Indeed.',
    i: 'Maintained by the Administrator. Contracts expiring within 120 days trigger renewal workflow. Quarterly compliance check against BAA and payer requirements.',
    cols: ['Contract #', 'Counterparty', 'Contract Type', 'Start Date', 'End Date', 'Value / Term', 'Owner', 'BAA Attached?', 'Status'],
    rows: 12,
  },
  'GV-FM-019': {
    p: 'Tracking log for every agency-level license, certification, accreditation, and registration with expiration date and renewal ownership.',
    i: 'Updated as renewals occur. Items within 90 days of expiration are flagged Red on the Compliance Dashboard.',
    cols: ['License / Certification', 'Authority', 'Number', 'Issue Date', 'Expiry Date', 'Owner', 'Status', 'Renewal Started'],
    rows: 12,
  },
  'GV-FM-020': {
    p: 'Controls the review and approval of any external communication (media, PR, social, public statement) representing Care Indeed.',
    i: 'Submitted by the requester to the Administrator at least 5 business days before intended release; legal review required for statements touching regulatory or litigation matters.',
    fields: [
      { label: 'Requester Name / Role', type: 'text', required: true, col: 2 },
      { label: 'Intended Release Date', type: 'date', required: true, col: 2 },
      { label: 'Media / Channel', type: 'text', col: 2 },
      { label: 'Topic', type: 'text', col: 2 },
      { label: 'Proposed Content (attach if long)', type: 'textarea', col: 4 },
      { label: 'Involves Patient Info? (Y/N)', type: 'select', options: ['Yes', 'No'], col: 2 },
      { label: 'Legal Review Needed? (Y/N)', type: 'select', options: ['Yes', 'No'], col: 2 },
    ],
    signers: ['Requester', 'Administrator', 'Legal (if required)'],
  },
  'GV-FM-021': {
    p: 'Official record of every Governing Body member appointment, reappointment, and resignation, for permanent retention.',
    i: 'Completed at each appointment or resignation event. Filed with the Governance Record; referenced in GV-FM-011 Roster.',
    fields: [
      { label: 'Member Name', type: 'text', required: true, col: 2 },
      { label: 'Action', type: 'select', options: ['Appointment', 'Reappointment', 'Resignation', 'Removal'], required: true, col: 2 },
      { label: 'Effective Date', type: 'date', required: true, col: 2 },
      { label: 'Term End Date (if applicable)', type: 'date', col: 2 },
      { label: 'Reason (for resignation / removal)', type: 'textarea', col: 4 },
    ],
    signers: ['Governing Body Chair'],
  },
  'GV-FM-022': {
    p: 'Specialized minutes template for Executive Sessions of the Governing Body, with enhanced confidentiality and restricted distribution.',
    i: 'Used exclusively for Executive Sessions. Stored separately from regular minutes. Accessible only to attendees, Legal Counsel, and authorized regulators.',
    fields: [
      { label: 'Executive Session Date', type: 'date', required: true, col: 2 },
      { label: 'Recorder', type: 'text', required: true, col: 2 },
      { label: 'Attendees', type: 'textarea', col: 4 },
      { label: 'Purpose of Executive Session', type: 'textarea', required: true, col: 4 },
      { label: 'Confidentiality Agreements Signed? (Y/N)', type: 'select', options: ['Yes', 'No'], col: 2 },
      { label: 'Discussion Summary', type: 'textarea', col: 4 },
      { label: 'Decisions / Motions', type: 'textarea', col: 4 },
      { label: 'Action Items', type: 'textarea', col: 4 },
    ],
    signers: ['Chair', 'Recorder'],
  },
  'GV-FM-023': {
    p: 'Annual compliance report prepared by the Compliance Officer for the Governing Body, covering compliance program effectiveness, findings, corrective actions, and risk outlook.',
    i: 'Presented at the first Governing Body meeting of each calendar year covering the prior year; archived in the Governance Record permanently.',
    fields: [
      { label: 'Reporting Year', type: 'text', required: true, col: 2 },
      { label: 'Submitted By (Compliance Officer)', type: 'text', required: true, col: 2 },
      { label: 'Compliance Program Summary', type: 'textarea', col: 4 },
      { label: 'Key Findings & Trends', type: 'textarea', col: 4 },
      { label: 'Corrective Actions Taken', type: 'textarea', col: 4 },
      { label: 'Outstanding Risks', type: 'textarea', col: 4 },
      { label: 'Regulatory / Survey Activity', type: 'textarea', col: 4 },
      { label: 'Recommendations for Coming Year', type: 'textarea', col: 4 },
    ],
    signers: ['Compliance Officer', 'Administrator'],
  },
  'GV-FM-024': {
    p: 'Training and education completion log for Governing Body members, documenting regulatory, fiduciary, and role-specific education.',
    i: 'Updated as trainings are completed. Reviewed at annual self-assessment. Minimum 4 training hours per member per year.',
    cols: ['Member Name', 'Training Title', 'Provider', 'Date Completed', 'Hours', 'Evidence'],
    rows: 12,
  },
  'GV-FM-025': {
    p: 'Log capturing every stakeholder grievance or feedback item (patients, families, staff, partners, payers) received by the Administrator or Compliance Hotline, with disposition.',
    i: 'Updated within 1 business day of receipt. Disposition completed within 30 days. Aggregate trends reviewed quarterly by QAPI.',
    cols: ['Date Received', 'Source', 'Nature of Feedback', 'Severity', 'Owner', 'Target Resolution', 'Actual Resolution', 'Status'],
    rows: 12,
  },
};

// ────────────────────────────────────────────────────────────────
// ADDITIONAL OVERRIDES (HR, CL, CO, QA, FN, IT, OP, RM)
// Imported from external file to keep per-domain content modular.
// ────────────────────────────────────────────────────────────────

import { FORM_OVERRIDES_EXT } from './formsLibraryContentHR_CL';
import { FORM_OVERRIDES_EXT2 } from './formsLibraryContentCO_More';
import { FORM_OVERRIDES_JD } from './formsLibraryContentJD';

Object.assign(FORM_OVERRIDES, FORM_OVERRIDES_EXT, FORM_OVERRIDES_EXT2, FORM_OVERRIDES_JD);

// ────────────────────────────────────────────────────────────────
// GENERIC TEMPLATE GENERATION FOR FORMS WITHOUT RICH OVERRIDES
// ────────────────────────────────────────────────────────────────

const GENERIC_LOG_COLS = (name: string): string[] => [
  '#', 'Date', 'Entry / Subject', `${name} Details`, 'Responsible Person', 'Status', 'Follow-Up Action', 'Verified By',
];

const GENERIC_CHECKLIST_ITEMS = (name: string): string[] => [
  `${name} — Regulatory requirement reviewed and understood`,
  `${name} — Applicable policy section located and re-read`,
  `${name} — Required documentation identified and accessible`,
  `${name} — All data fields confirmed complete and accurate`,
  `${name} — Signatures / attestations obtained from required parties`,
  `${name} — Copy filed in the appropriate record per retention schedule`,
  `${name} — Completion entered in tracking log / dashboard`,
  `${name} — Any deficiencies escalated to supervisor / Compliance Officer`,
  `${name} — Corrective action documented and tracked to closure`,
  `${name} — Annual review date set and added to calendar`,
];

const GENERIC_ATTESTATION_ACK = (_name: string): string[] => [
  `I have read, reviewed, and understood the requirements of this form.`,
  `The information I have provided is accurate, complete, and truthful to the best of my knowledge.`,
  'I understand my obligation to report any changes in the information provided within 7 calendar days.',
  'I understand that false statements may result in corrective action up to and including termination.',
  'I agree to comply with all applicable Care Indeed policies, procedures, and regulatory requirements.',
];

const DEFAULT_PURPOSE = (name: string, type: string) =>
  `Standardized ${type.toLowerCase()} capturing the required data elements for ${name}, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).`;

const DEFAULT_INSTRUCTIONS = (_name: string, frequency?: string) =>
  `Completed by the responsible workforce member ${frequency ? `(${frequency.toLowerCase()})` : 'per policy'}. All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.`;

// ────────────────────────────────────────────────────────────────
// CONTENT GETTER — merges type template + override into FormContent
// ────────────────────────────────────────────────────────────────

export interface FormRecord {
  id: string; name: string; type: string; policies: string[];
  domainCode: string; usage: string; frequency: string; classifications: string[];
}

export function buildFormContent(rec: FormRecord): FormContent {
  const o = FORM_OVERRIDES[rec.id];
  const purpose = o?.p ?? DEFAULT_PURPOSE(rec.name, rec.type);
  const instructions = o?.i ?? DEFAULT_INSTRUCTIONS(rec.name, rec.frequency);
  const orientation = o?.orient ?? (rec.type === 'Log' || rec.type === 'Matrix' || rec.type === 'Tracking Tool' ? 'landscape' : 'portrait');

  const sections: FormSection[] = [];
  const signers = o?.signers ?? ['Completed By', 'Supervisor / Reviewer'];

  // Identification block for all forms
  sections.push(identityBlock());

  switch (rec.type.toLowerCase()) {
    case 'log':
    case 'tracking tool':
    case 'matrix': {
      sections.push(logTable(
        rec.type === 'Matrix' ? 'Section 2 — Matrix' : `Section 2 — ${rec.type} Entries`,
        o?.cols ?? GENERIC_LOG_COLS(rec.name),
        o?.rows ?? 15,
      ));
      break;
    }
    case 'checklist': {
      sections.push(checklist(`Section 2 — ${rec.name} Checklist`, o?.items ?? GENERIC_CHECKLIST_ITEMS(rec.name)));
      break;
    }
    case 'attestation': {
      sections.push(attestationSection(
        o?.ackIntro ?? `By signing below, I hereby certify and attest that:`,
        o?.ack ?? GENERIC_ATTESTATION_ACK(rec.name),
      ));
      break;
    }
    case 'assessment': {
      sections.push({
        title: 'Section 2 — Assessment Responses',
        layout: 'grid',
        fields: o?.fields ?? [
          { label: 'Subject / Patient / Area Assessed', type: 'text', col: 4 },
          { label: 'Assessment Date', type: 'date', col: 2 },
          { label: 'Overall Risk Rating', type: 'select', options: ['Low', 'Moderate', 'High'], col: 2 },
          { label: 'Findings Summary', type: 'textarea', col: 4 },
          { label: 'Strengths Identified', type: 'textarea', col: 4 },
          { label: 'Opportunities for Improvement', type: 'textarea', col: 4 },
          { label: 'Recommended Action Plan', type: 'textarea', col: 4 },
          { label: 'Follow-Up Date', type: 'date', col: 2 },
        ],
      });
      break;
    }
    case 'worksheet': {
      sections.push({
        title: 'Section 2 — Worksheet',
        layout: 'grid',
        fields: o?.fields ?? [
          { label: 'Situation / Scope', type: 'textarea', col: 4 },
          { label: 'Data / Evidence Reviewed', type: 'textarea', col: 4 },
          { label: 'Analysis', type: 'textarea', col: 4 },
          { label: 'Findings', type: 'textarea', col: 4 },
          { label: 'Recommendations', type: 'textarea', col: 4 },
          { label: 'Next Steps / Owner / Due Date', type: 'textarea', col: 4 },
        ],
      });
      break;
    }
    case 'template': {
      sections.push({
        title: 'Section 2 — Content',
        layout: 'grid',
        fields: o?.fields ?? [
          { label: 'Title / Subject', type: 'text', col: 4 },
          { label: 'Date', type: 'date', col: 2 },
          { label: 'Prepared By', type: 'text', col: 2 },
          { label: 'Body / Narrative', type: 'textarea', col: 4 },
          { label: 'Attachments / References', type: 'textarea', col: 4 },
        ],
      });
      break;
    }
    case 'reference': {
      sections.push({
        title: 'Section 2 — Reference Content',
        layout: 'grid',
        fields: o?.fields ?? [
          { label: 'Reference Title', type: 'text', col: 4 },
          { label: 'Version / Date', type: 'text', col: 2 },
          { label: 'Owner', type: 'text', col: 2 },
          { label: 'Reference Body', type: 'textarea', col: 4 },
        ],
      });
      break;
    }
    case 'job description': {
      sections.push({
        title: 'Section 2 — Position Information',
        layout: 'grid',
        fields: o?.fields ?? [
          { label: 'Position Title', type: 'text', required: true, col: 2 },
          { label: 'Department', type: 'text', required: true, col: 2 },
          { label: 'Reports To', type: 'text', required: true, col: 2 },
          { label: 'Supervises', type: 'text', col: 2 },
          { label: 'FLSA Classification', type: 'text', col: 2 },
          { label: 'Review Cycle', type: 'text', col: 2 },
        ],
      });
      break;
    }
    case 'form':
    default: {
      sections.push({
        title: 'Section 2 — Data Capture',
        layout: 'grid',
        fields: o?.fields ?? [
          { label: 'Subject of Form', type: 'text', col: 4 },
          { label: 'Related Reference / ID', type: 'text', col: 2 },
          { label: 'Date of Event', type: 'date', col: 2 },
          { label: 'Description / Narrative', type: 'textarea', col: 4 },
          { label: 'Outcome / Decision', type: 'textarea', col: 4 },
          { label: 'Follow-Up Required (Y/N)', type: 'select', options: ['Yes', 'No'], col: 2 },
          { label: 'Follow-Up Owner', type: 'text', col: 2 },
        ],
      });
    }
  }

  if (o?.extra) sections.push(...o.extra);

  // Always end with a signature section if signers defined
  sections.push(signatureSection(signers));

  return {
    id: rec.id,
    title: rec.name,
    type: rec.type,
    domainCode: rec.domainCode,
    policies: rec.policies,
    purpose,
    instructions,
    version: VERSION,
    effectiveDate: EFFECTIVE_DATE,
    revisionDate: REVISION_DATE,
    orientation,
    sections,
    signatures: signers.map(r => ({ role: r, includeName: true, includeTitle: true, includeDate: true })),
    signerSlots: o?.signerSlots,
    footerNotes: [
      `Care Indeed Home Health Care, Inc. · Form ${rec.id} · Version ${VERSION} · Effective ${EFFECTIVE_DATE} · Next Review ${REVISION_DATE}`,
      `Linked Policies: ${rec.policies.join(', ')}`,
    ],
  };
}
