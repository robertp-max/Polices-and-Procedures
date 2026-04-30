// Auto-injection script for EN-WF-101 workflow-enforcement update (2026-04-29)
// Injects (a) workflow/evidence sections into 6 existing 101 policies, and
// (b) 5 new full policy entries at the end of allPoliciesContent.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'src', 'policy', 'data', 'allPoliciesContent.generated.ts');
let src = fs.readFileSync(FILE, 'utf8');
// Normalize CRLF → LF for reliable pattern matching; we'll let Git/editors restore EOLs on save.
const ORIGINAL_HAD_CRLF = src.includes('\r\n');
if (ORIGINAL_HAD_CRLF) src = src.replace(/\r\n/g, '\n');

// ── Helpers ──────────────────────────────────────────────────────
const GLOBAL_CLAUSE = "Execution of this policy shall generate auditable evidence within the system. All actions must be recorded with policy_id, workflow_id, and event_id. Actions not supported by system-generated evidence shall be considered non-compliant.";

function wfSection(slug, order, title, body) {
  return `      {
        id: ${JSON.stringify(slug)},
        title: ${JSON.stringify(title)},
        level: 2,
        order: ${order},
        body: ${JSON.stringify(body)},
        scormChunkHint: "module",
      },
`;
}

// ── 1. Append workflow-enforcement section to 6 existing 101 policies ──
// Each is bounded by `    ],\n  },\n  // <NextPolicyComment>`.
// We add ONE section just before the closing `    ],` of each policy.
// We locate by the NEXT policy's marker comment (unique).
const upgrades = [
  {
    target: 'CO-DG-101',
    nextMarker: '// CO-FA-001 — Anti-Kickback & Stark Law Compliance',
    sectionId: '50-workflow-enforcement-evidence',
    title: '12\\. Workflow Enforcement & Evidence Traceability (Added 2026-04-29)',
    body:
      'This policy is governed by EN-WF-101. ' + GLOBAL_CLAUSE + '\n\n' +
      '12.1 PHI Lifecycle Tagging: All PHI lifecycle actions (create, access, modify, export, archive, destroy) shall be persisted to the Evidence Repository with policy_id = CO-DG-101, workflow_id (e.g., phi.access.read, phi.export.bulk, phi.destroy), event_id, user_id, role, subject_id, timestamp, and chain_hash.\n' +
      '12.2 Minimum-Necessary Enforcement Trace: Each access decision against the Role-Based Access Profile (§4.2) shall emit an `event_id = access.profile.evaluation` capturing role, requested data class, decision (allow/deny), and rationale.\n' +
      '12.3 Bulk Export Approval Trace: Bulk exports (≥ 50 records, §4.4) require pre-execution supervisory approval recorded as `event_id = phi.export.approval`; the export itself emits `event_id = phi.export.execute` linked to the approval.\n' +
      '12.4 Shadow-System Detection Trace: Any DLP / endpoint-scan finding (§6.4) emits `event_id = shadow.system.detected` and auto-opens a CO-IR-101 incident with the linked evidence chain.\n' +
      '12.5 Audit Retrieval: All CO-DG-101 evidence is retrievable end-to-end for any patient, role, or system within ≤ 5 minutes per EN-WF-101 §3.5.\n' +
      '\n---',
  },
  {
    target: 'CO-FW-101',
    nextMarker: '// CO-HP-001 — HIPAA Privacy Program',
    sectionId: '50-workflow-enforcement-evidence',
    title: '12\\. Workflow Enforcement & Evidence Traceability (Added 2026-04-29)',
    body:
      'This policy is governed by EN-WF-101. ' + GLOBAL_CLAUSE + '\n\n' +
      '12.1 Documentation-Integrity Linkage: This policy is operationally fused with CL-DC-101. Any documentation-integrity audit trigger that substantiates fabrication, copy/paste fraud, or templated documentation without patient-specific support shall auto-open an FWA investigation under this policy with workflow_id = fwa.investigation.\n' +
      '12.2 Audit-Based Fraud Detection: Quarterly billing-pattern analysis (§6.1.3) and the FWA Indicator Monitoring Checklist shall execute as system jobs emitting events: `fwa.indicator.scan`, `fwa.indicator.flag`, `fwa.investigation.open`, `fwa.investigation.close`, `fwa.overpayment.identified`, `fwa.overpayment.refund`. Each event captures `policy_id = CO-FW-101`, `workflow_id`, `event_id`, `claim_id`/`patient_id`, `user_id`, `timestamp`, and `chain_hash`.\n' +
      '12.3 60-Day Rule Trace: Identification → quantification → refund timeline is enforced by system-generated evidence; failure to refund within 60 calendar days triggers an automatic escalation event to the Compliance Officer and Governing Body.\n' +
      '12.4 Cross-Reference: All CO-FW-101 actions linked to documentation integrity must reference the originating CL-DC-101 evidence chain.\n' +
      '12.5 Surveyor Defensibility: Compliance Officer shall be able to produce, on demand, the full evidence chain for any FWA indicator, investigation, or refund event under EN-WF-101 §5.3.\n' +
      '\n---',
  },
  {
    target: 'CO-HP-101',
    nextMarker: '// CO-IR-101 — Security Incident Response & Breach Notification',
    sectionId: '50-workflow-enforcement-evidence',
    title: '12\\. Workflow Enforcement & Evidence Traceability (Added 2026-04-29)',
    body:
      'This policy is governed by EN-WF-101. ' + GLOBAL_CLAUSE + '\n\n' +
      '12.1 PHI Access Audit Logging: Every read, write, copy, print, export, transmit, and destroy operation against PHI shall emit a system-generated audit event: `phi.access.read`, `phi.access.write`, `phi.access.copy`, `phi.access.print`, `phi.access.export`, `phi.access.transmit`, `phi.access.destroy`. Each event records `policy_id = CO-HP-101`, `workflow_id`, `event_id`, `user_id`, `role`, `patient_id`, `data_class`, `timestamp`, and `chain_hash` per EN-WF-101 §3.2.\n' +
      '12.2 Traceable Access Events: The audit log shall be sufficient to reconstruct, for any PHI artifact and any patient, the complete chain of who accessed what, when, from where, for what purpose. The Privacy Officer shall be able to produce this chain to a CMS or OCR investigator within 60 minutes.\n' +
      '12.3 Workflow / Event Linkage: All PHI workflows (treatment, payment, healthcare operations, disclosure with authorization, disclosure required by law) shall be registered in the Workflow Registry; PHI operations executed outside a registered workflow are non-compliant.\n' +
      '12.4 HIPAA Audit Controls Alignment: This policy operationalizes 45 CFR § 164.312(b) (Audit Controls) and § 164.308(a)(1)(ii)(D) (Information System Activity Review) through the EN-WF-101 Evidence Repository.\n' +
      '12.5 Tamper Evidence: PHI audit logs are immutable, hash-chained, and verified weekly; chain breaks are an automatic CO-IR-101 incident.\n' +
      '\n---',
  },
  {
    target: 'CO-IR-101',
    nextMarker: '// CO-AI-001 ',
    sectionId: '50-workflow-enforcement-evidence',
    title: '12\\. Workflow Enforcement & Evidence Traceability (Added 2026-04-29)',
    body:
      'This policy is governed by EN-WF-101. ' + GLOBAL_CLAUSE + '\n\n' +
      '12.1 Incident Tracking → event_id: Every reported security or privacy incident shall be assigned a unique `event_id` upon intake (`event_id = incident.intake`). Subsequent lifecycle stages emit additional events: `incident.triage`, `incident.investigation.open`, `incident.containment`, `incident.eradication`, `incident.recovery`, `incident.notification.individual`, `incident.notification.hhs`, `incident.notification.media`, `incident.closure`. Each event captures `policy_id = CO-IR-101`, `workflow_id = incident.response`, `event_id`, `user_id`, `timestamp`, `subject_refs`, and `chain_hash`.\n' +
      '12.2 Audit Chain Requirement: All incident-related actions, decisions, communications, and timestamps shall form a single, immutable, hash-chained timeline retrievable in ≤ 5 minutes per EN-WF-101 §3.5.\n' +
      '12.3 Evidence Repository Linkage: Forensic artifacts (logs, screenshots, system extracts, witness statements, BAA notifications, OCR/HHS correspondence) shall be ingested into the Evidence Repository with full intake provenance and linked to the parent `incident.intake` event.\n' +
      '12.4 Breach Notification Trace: The 60-day individual / HHS / media notification clocks are enforced via system-generated evidence and automatic deadline alerts.\n' +
      '12.5 Surveyor / OCR Defensibility: The Privacy Officer shall produce an end-to-end incident evidence pack for any CMS surveyor or OCR investigator within 60 minutes.\n' +
      '\n---',
  },
  {
    target: 'HR-TR-101',
    // Need next policy marker; we'll use a generic forward search
    nextMarker: null, // resolved below
    sectionId: '50-workflow-enforcement-evidence',
    title: '12\\. Workflow Enforcement & Evidence Traceability (Added 2026-04-29)',
    body:
      'This policy is governed by EN-WF-101. ' + GLOBAL_CLAUSE + '\n\n' +
      '12.1 Real-World Competency Validation: Competency shall be validated through observable, real-world performance — not classroom completion alone. For each competency, the assessor shall record an evaluation event (`event_id = competency.observation`) tied to the actual workflow performed (e.g., `oasis.lock` for OASIS competency, `clinical.note.attest` for documentation competency, `phi.access.read` for HIPAA competency).\n' +
      '12.2 Training → Task Linkage: Every required training module shall be mapped in the Training-Workflow Map to the specific tasks and workflow_ids it qualifies a learner to perform. Performance of a workflow without a current qualifying training record is a non-compliant action under EN-WF-101 and HR-TR-101.\n' +
      '12.3 LMS → Execution Event Linkage: The LMS shall publish completion events (`event_id = training.completion`) into the Evidence Repository with `policy_id = HR-TR-101`, `workflow_id = training.module`, `module_id`, `learner_id`, `score`, `attestation`, `timestamp`. The system shall enforce qualification gating: workflow execution checks for a current `training.completion` event before allowing the action (e.g., OASIS lock blocked without current OASIS-E1 competency).\n' +
      '12.4 Job-Performance Evidence: For every clinical, financial, IT, and compliance role, the agency shall maintain a Job-Performance Evidence Set linking training records to actual workflow event evidence demonstrating competent execution.\n' +
      '12.5 Remediation: Audit-driven remediation (e.g., from CL-OA-101, CL-DC-101) shall create a targeted training assignment with completion enforced and tracked end-to-end.\n' +
      '\n---',
  },
  {
    target: 'RM-OS-101',
    nextMarker: null,
    sectionId: '50-workflow-enforcement-evidence',
    title: '12\\. Workflow Enforcement & Evidence Traceability (Added 2026-04-29)',
    body:
      'This policy is governed by EN-WF-101. ' + GLOBAL_CLAUSE + '\n\n' +
      '12.1 Safety Incident → Workflow Event: Every safety incident (injury, near-miss, exposure, ergonomic event, workplace violence event) shall generate an immediate evidence event (`event_id = safety.incident.report`) with `policy_id = RM-OS-101`, `workflow_id = safety.incident`, `event_id`, `user_id`, `incident_type`, `location`, `timestamp`, `chain_hash`.\n' +
      '12.2 Lifecycle Events: Subsequent stages emit: `safety.incident.investigation`, `safety.root.cause`, `safety.corrective.action`, `safety.osha.recordable.evaluation`, `safety.cal_osha.report` (where applicable), `safety.incident.closure`.\n' +
      '12.3 Required Documentation Evidence: For every safety event the system shall require — and the Evidence Repository shall hold — the IIPP corrective action plan, OSHA 300/300A/301 disposition (where applicable), Cal/OSHA Form 5020 disposition, employee training/retraining linkage (HR-TR-101), and PPE/equipment provisioning evidence.\n' +
      '12.4 Trend & QAPI Linkage: Aggregated safety-event evidence feeds the QAPI safety dashboard and any HHVBP-relevant adverse event analyses (QA-VBP-101).\n' +
      '12.5 Surveyor Defensibility: Safety Officer shall produce, on demand, the complete evidence chain for any incident, IIPP corrective action, or OSHA recordable.\n' +
      '\n---',
  },
];

function appendSectionToPolicy(src, policyId, sectionTs) {
  // Find the policy block start
  const policyStart = src.indexOf(`policyId: "${policyId}"`);
  if (policyStart === -1) throw new Error('Policy not found: ' + policyId);
  // From there, find the next occurrence of `    ],\n  },` which closes that policy's sections array & object
  // Pattern: end of last section is `      },\n    ],\n  },`
  const closeIdx = src.indexOf('\n    ],\n  },', policyStart);
  if (closeIdx === -1) throw new Error('Close pattern not found for: ' + policyId);
  // Insert sectionTs immediately before `    ],`
  const insertAt = closeIdx + 1; // after the `\n`
  return src.slice(0, insertAt) + sectionTs + src.slice(insertAt);
}

for (const u of upgrades) {
  const sec = wfSection(u.sectionId, 50, u.title, u.body);
  src = appendSectionToPolicy(src, u.target, sec);
  console.log(`Injected workflow-enforcement section into ${u.target}`);
}

// ── 2. Build 5 new policy entries and append before final `];` ──
function policyHeaderRow(id, title, domainLabel, subdomainLabel, owner, regTags) {
  return "| Field | Value |\n| :---- | :---- |\n" +
    `| Policy ID | ${id} |\n| Policy Title | ${title} |\n| Domain | ${domainLabel} |\n| Subdomain | ${subdomainLabel} |\n` +
    `| Classification Tier | REQUIRED |\n| Version | 1.0 |\n| Effective Date | 2026-04-29 |\n| Status | ACTIVE |\n| Review Cycle | Annual |\n| Access Tier | Tier 2 — Restricted |\n` +
    `| Policy Owner / Steward | ${owner} |\n| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |\n| Last Reviewed | 2026-04-29 |\n| Next Review Date | 2027-04-29 |\n| Supersedes | N/A (Initial Version) |\n` +
    `| Regulatory Tags | ${regTags} |\n\n---`;
}

function makeSection(id, title, level, order, body, hint = 'module') {
  return {
    id, title, level, order, body, scormChunkHint: hint,
  };
}

function newPolicyTs(p) {
  const sectionsTs = p.sections.map(s =>
`      {
        id: ${JSON.stringify(s.id)},
        title: ${JSON.stringify(s.title)},
        level: ${s.level},
        order: ${s.order},
        body: ${JSON.stringify(s.body)},
        scormChunkHint: ${JSON.stringify(s.scormChunkHint)},
      },`).join('\n');
  return `  // ${p.policyId} — ${p.title} (Added 2026-04-29 — see EN-WF-101)
  {
    policyId: ${JSON.stringify(p.policyId)},
    sourceType: "markdown",
    sourceRef: "extracted_full",
    sections: [
${sectionsTs}
    ],
  },
`;
}

const newPolicies = [
  {
    policyId: 'CL-OA-101',
    title: 'OASIS Data Accuracy, Validation & Submission Integrity',
    sections: [
      makeSection('1-oasis-data-accuracy-validation-submission-integrity', 'OASIS Data Accuracy, Validation & Submission Integrity', 1, 1, '---'),
      makeSection('2-policy-header', '1\\. Policy Header', 2, 2, policyHeaderRow('CL-OA-101', 'OASIS Data Accuracy, Validation & Submission Integrity', 'CL — Clinical Operations', 'OA — OASIS Assessment', 'Director of Nursing / OASIS Coordinator', '42 CFR § 484.45, 42 CFR § 484.55, OASIS-E1, HHVBP, HHQRP')),
      makeSection('3-purpose', '2\\. Purpose', 2, 3,
        'This policy establishes mandatory controls governing the collection, reconciliation, validation, correction, and submission of all OASIS data elements. It ensures every OASIS-E1 item submitted to CMS through iQIES is supported by contemporaneous, attributable clinical evidence; reconciled against the comprehensive assessment, physician orders, and visit documentation; and backed by a system-generated, auditable evidence chain that maps policy_id → workflow_id → event_id → user_id → timestamp for every assessment, edit, lock, transmission, correction, and resubmission event. Inaccurate, unsupported, or fabricated OASIS responses materially distort case-mix, payment, HHQRP public reporting, HHVBP scoring, and outcome measurement, and constitute False Claims Act exposure (cross-reference CO-FW-101).\n\n---'),
      makeSection('4-scope', '3\\. Scope', 2, 4,
        'Applies to all RNs, PTs, OTs, and SLPs qualified to complete OASIS per 42 CFR § 484.55(a)(2); the OASIS Coordinator / QAPI Director responsible for pre-submission validation; and all assessment time points (SOC, ROC, RECERT, OFU, TRN, DC, Death at Home).\n\n---'),
      makeSection('5-policy-statements', '4\\. Policy Statements', 2, 5,
        '4.1 Every OASIS data element shall be supported by source evidence in the comprehensive assessment, visit notes, physician orders, medication profile, or directly observed encounter. Unsupported answers are prohibited and constitute documentation fraud (CO-FW-101, CL-DC-101).\n' +
        '4.2 OASIS items shall be completed by the qualified clinician who performed the in-person assessment within regulatory timeframes (SOC 5d, ROC 2d, RECERT last 5d of cert period, DC 2d).\n' +
        '4.3 OASIS responses shall be reconciled against the patient-specific Plan of Care (CMS-485) and physician orders. Divergences shall be resolved before assessment lock.\n' +
        '4.4 No OASIS shall be transmitted to iQIES until pre-submission validation has been completed and digitally attested. The validation event shall be recorded with event_id, user_id, policy_id = CL-OA-101, workflow_id = oasis.validation.\n' +
        '4.5 The agency shall conduct a minimum 10% audit sample of all submitted OASIS assessments per quarter, stratified by clinician and assessment type, evaluating documentation support and HHVBP-impacting items.\n' +
        '4.6 OASIS corrections (modify, inactivate) shall be permitted only per the CMS OASIS Submissions User Guide. Every correction shall capture original value, corrected value, rationale, supporting evidence reference, requesting clinician, approving reviewer, and timestamp.\n' +
        '4.7 OASIS data shall feed and align with the comprehensive assessment (CL-CA-001), Plan of Care, HHQRP/HHVBP outcome measures (QA-VBP-101), discharge planning, and QAPI dashboards.\n' +
        '4.8 ' + GLOBAL_CLAUSE + '\n\n---'),
      makeSection('6-definitions', '5\\. Definitions', 2, 6,
        '| Term | Definition |\n| :---- | :---- |\n| OASIS-E1 | CMS Outcome and Assessment Information Set, version E1, effective 2025-01-01, including SDOH and Transfer of Health Information items. |\n| Pre-Submission Validation | Mandatory clinical and technical review of a locked OASIS prior to iQIES transmission. |\n| HHVBP-Impacting Item | An OASIS item contributing to the HHVBP Total Performance Score. |\n| Inter-Rater Reliability | Degree to which two qualified clinicians independently assigned the same response to the same item. |\n| Audit Sample | Statistically defensible subset of OASIS records selected for retrospective accuracy review. |\n\n---'),
      makeSection('7-procedures', '6\\. Procedures', 2, 7, ''),
      makeSection('8-assessment-capture', 'Assessment Capture', 3, 8,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.1.1 | Assessing Clinician | Complete OASIS at the residence based on direct observation and patient/caregiver interview. Do not pre-populate from prior episodes. | At the assessment time point. |\n| 6.1.2 | Assessing Clinician | Lock the OASIS in the EHR with digital attestation that responses reflect the actual encounter (event_id = oasis.lock). | Within 24 hours of in-person visit. |\n| 6.1.3 | Assessing Clinician | Resolve all system-flagged warnings before lock. | Before lock. |\n\n---', 'lesson'),
      makeSection('9-reconciliation', 'Reconciliation', 3, 9,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.2.1 | Assessing Clinician | Reconcile responses against medication list, comprehensive assessment, physician orders, and hospital discharge summary. | Before lock. |\n| 6.2.2 | Clinical Manager | Review SOC/ROC OASIS for clinical congruence with Plan of Care and physician orders. | Within 24 hours of lock. |\n\n---', 'lesson'),
      makeSection('10-pre-submission-validation', 'Pre-Submission Validation', 3, 10,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.3.1 | OASIS Coordinator | Complete validation checklist: ICD-10 sequencing, M-item evidence support, HHVBP-impacting item review, SDOH item completeness, cross-item logic. | Before transmission; within 7 calendar days of OASIS completion. |\n| 6.3.2 | OASIS Coordinator | Digitally attest validation (event_id = oasis.validation). Return to clinician where evidence insufficient. | Same business day. |\n| 6.3.3 | EDI / iQIES Submitter | Transmit validated OASIS; capture submission acknowledgment and Final Validation Report (event_id = oasis.transmission, oasis.acknowledgment). | Within 30 calendar days of M0090 (42 CFR § 484.45). |\n\n---', 'lesson'),
      makeSection('11-audit-sampling', 'Audit Sampling', 3, 11,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.4.1 | OASIS Coordinator | Select ≥10% sample per quarter, stratified by clinician and assessment type. | Quarterly. |\n| 6.4.2 | OASIS Coordinator | Score each item Supported / Unsupported / Cannot Determine using CMS-aligned tool. | Within 30 days of quarter close. |\n| 6.4.3 | QAPI Director | Trend results; clinician scores below 90% support rate trigger remediation per HR-TR-101. | Quarterly. |\n\n---', 'lesson'),
      makeSection('12-correction-resubmission', 'Correction & Resubmission', 3, 12,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.5.1 | Clinician / OASIS Coordinator | Identify error; determine eligibility for Modification or Inactivation per CMS OASIS Submissions User Guide. | Upon identification. |\n| 6.5.2 | OASIS Coordinator | Document original value, corrected value, source evidence, and rationale; obtain clinician sign-off; submit corrected record (event_id = oasis.correction). | Within 30 calendar days of error identification. |\n\n---', 'lesson'),
      makeSection('13-evidence-traceability', 'Evidence & Traceability (per EN-WF-101)', 3, 13,
        'Every event in the OASIS lifecycle persists to the Evidence Repository with: policy_id, workflow_id (oasis.assessment, oasis.lock, oasis.validation, oasis.transmission, oasis.correction, oasis.audit), event_id, patient_id, episode_id, user_id, clinician_role, timestamp (UTC ISO 8601), device/IP attribution, source_doc_refs, chain_hash. Evidence is immutable, tamper-evident, and surveyor-retrievable in ≤ 5 minutes per EN-WF-101 §3.5.\n\n---', 'lesson'),
      makeSection('19-documentation-requirements', '7\\. Documentation Requirements', 2, 19,
        '| Record | Retention | Source |\n| :---- | :---- | :---- |\n| OASIS submission file (XML) | 7 years (42 CFR § 484.110) | iQIES / EHR |\n| Final Validation Report | 7 years | iQIES |\n| Pre-submission validation attestation | 7 years | Evidence Repository |\n| Audit sample worksheets and trend reports | 7 years | QAPI |\n| Correction/Inactivation records | 7 years | Evidence Repository |\n| Clinician remediation evidence | 7 years | LMS (HR-TR-101) |\n\n---'),
      makeSection('20-compliance-measurement', '8\\. Compliance Measurement', 2, 20,
        '| Indicator | Target |\n| :---- | :---- |\n| OASIS submitted within 30 days of M0090 | ≥ 99% |\n| Pre-submission validation completed before transmission | 100% |\n| Quarterly audit sample completed (≥10%) | 100% |\n| Documentation-support rate | ≥ 95% |\n| Inter-rater reliability (kappa) on HHVBP-impacting items | ≥ 0.75 |\n| Corrections submitted within 30 days of identification | 100% |\n\n---'),
      makeSection('24-references', '9\\. References', 2, 24,
        '| Citation | Relevance |\n| :---- | :---- |\n| 42 CFR § 484.45 | Reporting OASIS Information |\n| 42 CFR § 484.55 | Comprehensive Assessment |\n| 42 CFR § 484.60 | Care Planning, Coordination, Quality |\n| CMS OASIS-E1 Guidance Manual | Item-level guidance |\n| CMS OASIS Submissions User Guide | Submission/correction rules |\n| HHQRP Specifications Manual | Public reporting |\n| HHVBP Final Rule & Technical Specifications | Payment adjustment |\n\n### Cross-Referenced Policies\nCL-CA-001, CL-DC-101, CL-CC-101, QA-VBP-101, EN-WF-101, CO-FW-101, HR-TR-101, EN-LC-001.\n\n## 10–11. Training Requirements & Version Control\nOASIS-qualified clinicians complete OASIS-E1 baseline competency within 14 days of assignment; annual refresher; targeted remediation tied to audit findings. Version control per EN-LC-001.\n\n---'),
    ],
  },
  {
    policyId: 'CL-DC-101',
    title: 'Clinical Documentation Integrity & Authenticity',
    sections: [
      makeSection('1-clinical-documentation-integrity-authenticity', 'Clinical Documentation Integrity & Authenticity', 1, 1, '---'),
      makeSection('2-policy-header', '1\\. Policy Header', 2, 2, policyHeaderRow('CL-DC-101', 'Clinical Documentation Integrity & Authenticity', 'CL — Clinical Operations', 'DC — Documentation & Clinical Records', 'Director of Nursing / Compliance Officer', '42 CFR § 484.110, 42 CFR § 484.55, FCA, HIPAA, OIG HHA Guidance')),
      makeSection('3-purpose', '2\\. Purpose', 2, 3,
        'Establishes mandatory standards for clinical documentation integrity — prohibiting copy/paste misuse, unsupported templated documentation, and any clinical entry not reflecting an actual patient encounter. Defines clinician attestation, documentation audit triggers, AI-assisted documentation controls, and direct linkage between documentation fraud and the FWA program (CO-FW-101).\n\n---'),
      makeSection('4-scope', '3\\. Scope', 2, 4,
        'Applies to all clinical documentation in any modality (EHR, paper, voice-to-text, AI-assisted) created by RNs, LVNs, PT/PTA, OT/COTA, SLP, MSW, HHA, and any contracted clinician.\n\n---'),
      makeSection('5-policy-statements', '4\\. Policy Statements', 2, 5,
        '4.1 All clinical documentation shall reflect care actually performed during a documented patient encounter. Documentation of services not rendered is potential FCA violation per CO-FW-101 / CO-FA-002.\n' +
        '4.2 Copy-Forward Restrictions: Copy-forward is prohibited except for objective, time-invariant elements. Forwarded content shall be visually flagged, re-validated, and updated. Wholesale duplication of subjective assessment, vitals, response to treatment, or skilled-need narrative is prohibited.\n' +
        '4.3 Templated Documentation: Templates and SmartText shall not be used without patient-specific validation. Identical clinical phrases across multiple patients on the same date are a per-se audit trigger.\n' +
        '4.4 Clinician Attestation: Every clinical note shall be electronically signed with: "I attest that this documentation reflects services I personally performed during a patient encounter on the date and time recorded." (event_id = clinical.note.attest).\n' +
        '4.5 Late Entries / Amendments: Late entries (>24h) shall be marked "Late Entry" with rationale; amendments use the EHR amendment function preserving prior values.\n' +
        '4.6 AI-Assisted Documentation: Permitted only with AI Governance Committee approval (CO-AI-101), per-note clinician review/edit/attest, mandatory ai_assist_flag and model/version capture in audit log, BAA-covered PHI handling. AI may never fabricate clinical findings.\n' +
        '4.7 Documentation Audit Triggers: Two notes same date with identical narrative; clinician >10 visits/day with full narrative <5 min/visit; third-party billing flag; patient/caregiver complaint; OASIS audit unsupported items; HHVBP outcome anomaly.\n' +
        '4.8 Sanctions: Confirmed documentation fraud is Class-1 sanctionable — termination, exclusion list reporting, licensing-board referral, law-enforcement referral as appropriate.\n' +
        '4.9 ' + GLOBAL_CLAUSE + '\n\n---'),
      makeSection('6-definitions', '5\\. Definitions', 2, 6,
        '| Term | Definition |\n| :---- | :---- |\n| Documentation Integrity | Accuracy, completeness, consistency, and authenticity of clinical entries. |\n| Copy-Forward | Replication of prior textual content into a current note. |\n| Templated Documentation | Use of structured templates / SmartText as primary content. |\n| Clinician Attestation | Electronic signature affirming the note reflects the encounter. |\n| AI-Assisted Documentation | Any note in which a generative or summarization AI tool produced ≥10% of textual content. |\n\n---'),
      makeSection('7-procedures', '6\\. Procedures', 2, 7, ''),
      makeSection('8-encounter-documentation', 'Encounter Documentation', 3, 8,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.1.1 | Visit Clinician | Document contemporaneously: GPS-stamped visit start/end (where supported), patient-specific assessment, skilled interventions, response, care coordination. | At point of care. |\n| 6.1.2 | Visit Clinician | Apply electronic signature with attestation (event_id = clinical.note.attest). | Within 24 hours. |\n\n---', 'lesson'),
      makeSection('9-copy-forward-controls', 'Copy-Forward Controls', 3, 9,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.2.1 | EHR Administrator | Configure EHR to mark copy-forwarded text, log source note ID and percentage forwarded, require per-section confirmation. | Continuous. |\n| 6.2.2 | QAPI Director | Run weekly copy-forward exception report; investigate notes with >40% copy-forward score. | Weekly. |\n\n---', 'lesson'),
      makeSection('10-audit-investigation', 'Audit & Investigation', 3, 10,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.3.1 | QAPI / Compliance | On audit trigger (§4.7), open documentation-integrity investigation (workflow_id = doc.integrity.investigation). | Within 5 business days. |\n| 6.3.2 | Compliance Officer | If fraud substantiated, escalate to CO-FW-101; sanction per HR-ER-002; quantify overpayment per CO-FA-002 60-day rule. | Per CO-FW-101. |\n\n---', 'lesson'),
      makeSection('11-ai-governance', 'AI Governance Coordination', 3, 11,
        'Per CO-AI-101: AI documentation tools must be enrolled in the AI Tool Registry, BAA-covered, model-version pinned, reviewed quarterly for hallucination, bias, and PHI leakage. Clinicians may not bypass the registered tool list.\n\n---', 'lesson'),
      makeSection('13-evidence-traceability', 'Evidence & Traceability (per EN-WF-101)', 3, 13,
        'Every clinical note creation, edit, attestation, copy-forward action, AI-assist event, late entry, and amendment persists to the Evidence Repository with policy_id = CL-DC-101, workflow_id, event_id, patient_id, episode_id, visit_id, user_id, clinician_role, timestamp, device/ip, ai_assist_flag, ai_model_id (where applicable), copy_forward_source_ids, attestation_hash. Evidence is immutable and surveyor-retrievable.\n\n---', 'lesson'),
      makeSection('19-documentation-requirements', '7\\. Documentation Requirements', 2, 19,
        '| Record | Retention |\n| :---- | :---- |\n| Clinical visit notes | 7 years post-discharge (42 CFR § 484.110, CA H&S § 123145) |\n| Attestation hash log | 7 years |\n| Copy-forward audit reports | 7 years |\n| AI-assist audit logs | 7 years |\n| Documentation integrity investigations | 10 years (CO-FW-101) |\n\n---'),
      makeSection('20-compliance-measurement', '8\\. Compliance Measurement', 2, 20,
        '| Indicator | Target |\n| :---- | :---- |\n| Notes signed within 24 hours | ≥ 98% |\n| Copy-forward exception investigations resolved | 100% |\n| Audit-triggered investigations completed within 30 days | 100% |\n| Substantiated documentation fraud per FTE | 0 |\n| AI-assisted notes with attestation | 100% |\n\n---'),
      makeSection('24-references', '9\\. References', 2, 24,
        '| Citation | Relevance |\n| :---- | :---- |\n| 42 CFR § 484.110 | Clinical Records |\n| 42 CFR § 484.55 | Comprehensive Assessment |\n| 42 CFR § 484.60(b) | Plan of Care signed |\n| 31 U.S.C. §§ 3729–3733 | False Claims Act |\n| 42 U.S.C. § 1320a-7k(d) | 60-day overpayment rule |\n| OIG Compliance Program Guidance for HHAs | Documentation controls |\n| AHIMA Ethical Standards | Documentation integrity |\n\n### Cross-Referenced Policies\nCL-OA-101, CL-CC-101, CL-CA-001, CO-FW-101, CO-FA-002, CO-AI-101, CO-HP-101, EN-WF-101, HR-TR-101, HR-ER-002.\n\n## 10–11. Training & Version Control\nDocumentation-integrity training within 14 days of hire; annually. AI users complete additional CO-AI-101 module before activation. Version control per EN-LC-001.\n\n---'),
    ],
  },
  {
    policyId: 'CL-CC-101',
    title: 'Care Coordination & SDOH Management',
    sections: [
      makeSection('1-care-coordination-sdoh-management', 'Care Coordination & SDOH Management', 1, 1, '---'),
      makeSection('2-policy-header', '1\\. Policy Header', 2, 2, policyHeaderRow('CL-CC-101', 'Care Coordination & SDOH Management', 'CL — Clinical Operations', 'CC — Care Coordination', 'Director of Nursing', '42 CFR § 484.60, OASIS-E1 SDOH items, 42 CFR § 484.50, HHVBP')),
      makeSection('3-purpose', '2\\. Purpose', 2, 3,
        'Establishes the agency\'s program for interdisciplinary care coordination, SDOH screening and documentation per OASIS-E1 standardized SDOH items, referral tracking, escalation of unmet health-related social needs, and follow-up. Operationalizes 42 CFR § 484.60 and aligns with HHVBP outcome objectives (QA-VBP-101).\n\n---'),
      makeSection('4-scope', '3\\. Scope', 2, 4,
        'Applies to all patients admitted to home health services and to all clinicians (RN, PT, OT, SLP, MSW, HHA) and care coordination personnel.\n\n---'),
      makeSection('5-policy-statements', '4\\. Policy Statements', 2, 5,
        '4.1 Every patient shall be screened at SOC for SDOH using OASIS-E1 standardized items: ethnicity (A1005), race (A1010), preferred language (A1110A), need for interpreter (A1110B), transportation (A1250), social isolation (D0700), health literacy (B1300). Reconciled with comprehensive assessment per CL-OA-101.\n' +
        '4.2 Identified unmet social needs (food, housing, transportation, caregiver absence, financial barriers) shall be documented in the Plan of Care and trigger structured referral, MSW consultation, or escalation.\n' +
        '4.3 The agency shall maintain a Community Resource Directory updated semi-annually with attribution and currency verification recorded as evidence.\n' +
        '4.4 Interdisciplinary communication shall occur at SOC and ROC; at each case conference (≤2 weeks for active episodes); on change in condition; at recertification; at discharge. All communications documented in EHR.\n' +
        '4.5 Escalation workflows activate when: referral unfilled within 14 days; patient declines needed service; caregiver capacity compromised; M1033 ≥ 4; safety risk identified.\n' +
        '4.6 Post-discharge follow-up: 48-hour post-DC phone call; coordination with receiving providers per Transfer of Health Information OASIS items; closure of open referrals.\n' +
        '4.7 Care-coordination performance feeds HHVBP-impacting measures (Discharged to Community, ACH, ED Use); monitored through QA-VBP-101.\n' +
        '4.8 ' + GLOBAL_CLAUSE + '\n\n---'),
      makeSection('6-definitions', '5\\. Definitions', 2, 6,
        '| Term | Definition |\n| :---- | :---- |\n| SDOH | Non-medical factors influencing health outcomes. |\n| HRSN | Individual-level adverse social conditions affecting health. |\n| Care Coordination | Deliberate organization of patient care activities and information sharing. |\n| IDG | Interdisciplinary group jointly responsible for plan of care. |\n| Closed-Loop Referral | Referral whose receipt, scheduling, and outcome are confirmed and documented. |\n\n---'),
      makeSection('7-procedures', '6\\. Procedures', 2, 7, ''),
      makeSection('8-sdoh-screening', 'SDOH Screening & Documentation', 3, 8,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.1.1 | SOC Clinician | Complete OASIS-E1 SDOH items at SOC and ROC; reconcile with patient/caregiver interview (event_id = sdoh.screen). | At SOC / ROC. |\n| 6.1.2 | SOC Clinician | For positive screens, document HRSN in comprehensive assessment and Plan of Care; create referral record. | Within 24 hours. |\n\n---', 'lesson'),
      makeSection('9-referral-tracking', 'Referral Tracking', 3, 9,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.2.1 | Care Coordinator / MSW | Issue referral via EHR; capture metadata (event_id = referral.open). | Same day. |\n| 6.2.2 | Care Coordinator | Confirm receipt by referral target within 7 days; close loop with outcome (event_id = referral.close). | Within 14 days. |\n\n---', 'lesson'),
      makeSection('10-idg-communication', 'Interdisciplinary Communication', 3, 10,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.3.1 | Case Manager | Convene biweekly case conference; record participants, decisions, follow-up (event_id = idg.case.conference). | Every 2 weeks. |\n| 6.3.2 | Visit Clinician | Communicate change-in-condition to physician within 24 hours; document order changes (event_id = clinical.coc). | Within 24 hours. |\n\n---', 'lesson'),
      makeSection('11-escalation', 'Escalation', 3, 11,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.4.1 | Care Coordinator | On trigger (§4.5), notify Clinical Manager and (if applicable) MSW (event_id = care.escalation). | 1 business day. |\n| 6.4.2 | Clinical Manager | Document resolution; update Plan of Care. | Within 5 business days. |\n\n---', 'lesson'),
      makeSection('12-discharge-follow-up', 'Discharge Follow-Up', 3, 12,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.5.1 | Care Coordinator | 48-hour post-DC phone call; document outcome (event_id = discharge.followup). | 48 hours post-DC. |\n| 6.5.2 | Discharging Clinician | Complete OASIS Transfer of Health Information items; transmit to receiving provider. | At DC. |\n\n---', 'lesson'),
      makeSection('13-evidence-traceability', 'Evidence & Traceability (per EN-WF-101)', 3, 13,
        'All SDOH screens, referrals, IDG conferences, escalations, and follow-up calls persist to the Evidence Repository with policy_id = CL-CC-101, workflow_id, event_id, patient_id, episode_id, screen_results, referral_id, closure_status, user_id, timestamp.\n\n---', 'lesson'),
      makeSection('19-documentation-requirements', '7\\. Documentation Requirements', 2, 19,
        '| Record | Retention |\n| :---- | :---- |\n| SDOH screening results | 7 years (clinical record) |\n| Referral records (open + closed) | 7 years |\n| Case conference minutes | 7 years |\n| 48-hour follow-up call logs | 7 years |\n| Community Resource Directory (versioned) | 7 years |\n\n---'),
      makeSection('20-compliance-measurement', '8\\. Compliance Measurement', 2, 20,
        '| Indicator | Target |\n| :---- | :---- |\n| SDOH screened at SOC | 100% |\n| Closed-loop referrals within 14 days | ≥ 90% |\n| Biweekly case conferences held | 100% per active episode |\n| 48-hour post-DC call completed | ≥ 95% |\n| Escalations resolved within 5 business days | ≥ 90% |\n\n---'),
      makeSection('24-references', '9\\. References', 2, 24,
        '| Citation | Relevance |\n| :---- | :---- |\n| 42 CFR § 484.60 | Care Planning, Coordination, Quality |\n| 42 CFR § 484.50 | Patient Rights |\n| 42 CFR § 484.55 | Comprehensive Assessment |\n| OASIS-E1 SDOH Standardized Items | Screening basis |\n| CMS Framework for Health Equity 2022–2032 | Strategic alignment |\n\n### Cross-Referenced Policies\nCL-OA-101, CL-DC-101, CL-CA-001, QA-VBP-101, EN-WF-101, CO-HP-101.\n\n## 10–11. Training & Version Control\nField clinicians complete SDOH and trauma-informed care training within 14 days of hire and annually. Care Coordinators / MSWs complete advanced HRSN-resource navigation annually. Version control per EN-LC-001.\n\n---'),
    ],
  },
  {
    policyId: 'QA-VBP-101',
    title: 'HHVBP Performance & Outcomes Management',
    sections: [
      makeSection('1-hhvbp-performance-outcomes-management', 'HHVBP Performance & Outcomes Management', 1, 1, '---'),
      makeSection('2-policy-header', '1\\. Policy Header', 2, 2, policyHeaderRow('QA-VBP-101', 'HHVBP Performance & Outcomes Management', 'QA — Quality Assurance & Performance Improvement', 'VBP — Value-Based Purchasing', 'QAPI Director', 'HHVBP, HHQRP, 42 CFR § 484.65, 42 CFR Part 484 Subpart F')),
      makeSection('3-purpose', '2\\. Purpose', 2, 3,
        'Operationalizes compliance with the expanded Home Health Value-Based Purchasing Model (42 CFR Part 484, Subpart F), integrating performance measurement, monitoring, corrective action, and reimbursement-impact governance with the QAPI program. Ensures every measure component contributing to TPS — OASIS-based, claims-based, and HHCAHPS — is monitored, defended with evidence, and actively improved.\n\n---'),
      makeSection('4-scope', '3\\. Scope', 2, 4,
        'Applies to all clinical, administrative, billing, and patient-experience operations contributing to HHVBP-impacting measures: TNC Self-Care, TNC Mobility, Discharged to Community, ACH, ED Use, HHCAHPS composites, and any future CMS-published HHVBP measure.\n\n---'),
      makeSection('5-policy-statements', '4\\. Policy Statements', 2, 5,
        '4.1 The agency shall maintain an HHVBP Performance Program monitoring all CMS-published HHVBP measures monthly using interim Care Compare and HHVBP iQIES Performance Reports.\n' +
        '4.2 Patient experience (HHCAHPS) shall be monitored via the contracted CAHPS vendor monthly composite reports and integrated into QAPI per QA-PG-002.\n' +
        '4.3 Performance score thresholds shall trigger mandatory corrective action: drop ≥10 percentile points QoQ; below cohort 25th percentile two consecutive quarters; projected TPS in bottom payment-adjustment band.\n' +
        '4.4 HHVBP performance shall be a standing agenda item: QAPI Committee monthly, Compliance Committee quarterly, Governing Body quarterly.\n' +
        '4.5 Reimbursement-impact projections (estimated payment adjustment from rolling TPS) shall be calculated quarterly by Finance with QAPI and reported to Governing Body.\n' +
        '4.6 Clinical Improvement Plans (CIPs) for under-performing measures shall use PDSA methodology, accountable owner, evidence-tracked closure.\n' +
        '4.7 Underlying data integrity shall be governed by CL-OA-101 (OASIS), CL-DC-101 (clinical documentation), and CO-FW-101 §6.1.3 (billing accuracy).\n' +
        '4.8 ' + GLOBAL_CLAUSE + '\n\n---'),
      makeSection('6-definitions', '5\\. Definitions', 2, 6,
        '| Term | Definition |\n| :---- | :---- |\n| HHVBP | CMS payment model adjusting Medicare FFS payments based on quality. |\n| TPS | Total Performance Score driving annual payment adjustment. |\n| Achievement Threshold | Median of national performance during baseline year. |\n| Benchmark | Mean of top decile of national performance during baseline year. |\n| HHCAHPS | Patient experience survey. |\n| CIP | Clinical Improvement Plan (PDSA-structured). |\n\n---'),
      makeSection('7-procedures', '6\\. Procedures', 2, 7, ''),
      makeSection('8-measure-monitoring', 'Measure Monitoring', 3, 8,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.1.1 | QAPI Director | Pull monthly HHVBP iQIES Performance Report and Care Compare measure refresh; reconcile with internal claims/OASIS extracts. | Monthly. |\n| 6.1.2 | QAPI Director | Update HHVBP Dashboard (achievement / improvement / TPS projection); post to QAPI Committee (event_id = vbp.dashboard.publish). | Monthly. |\n| 6.1.3 | CAHPS Vendor + QAPI | Receive HHCAHPS composite data; integrate into dashboard. | Monthly. |\n\n---', 'lesson'),
      makeSection('9-threshold-corrective-action', 'Threshold Detection & Corrective Action', 3, 9,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.2.1 | QAPI Director | On threshold breach (§4.3), open CIP (workflow_id = vbp.cip.open). | Within 7 days. |\n| 6.2.2 | CIP Owner | Conduct PDSA cycle; capture interventions, metrics, outcome evidence. | Initial PDSA in 30 days. |\n| 6.2.3 | QAPI Committee | Review CIP progress monthly until measure stabilizes ≥ achievement threshold. | Monthly. |\n\n---', 'lesson'),
      makeSection('10-reimbursement-impact', 'Reimbursement Impact', 3, 10,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.3.1 | CFO + QAPI Director | Calculate projected payment adjustment using current rolling TPS. | Quarterly. |\n| 6.3.2 | CFO | Report projected impact to Governing Body. | Quarterly. |\n\n---', 'lesson'),
      makeSection('11-data-integrity', 'Data Integrity Linkage', 3, 11,
        'OASIS-based measures depend on CL-OA-101 audit results; claims-based measures depend on CO-FW-101 §6.1.3 billing audits; HHCAHPS depends on patient roster accuracy and survey vendor controls. Any data-integrity finding pauses CIP closure until root cause is corrected.\n\n---', 'lesson'),
      makeSection('13-evidence-traceability', 'Evidence & Traceability (per EN-WF-101)', 3, 13,
        'All HHVBP monitoring, CIP, and reporting events persist to the Evidence Repository with policy_id = QA-VBP-101, workflow_id, event_id, measure_id, period, score_value, cohort_percentile, tps_projection, user_id, timestamp.\n\n---', 'lesson'),
      makeSection('19-documentation-requirements', '7\\. Documentation Requirements', 2, 19,
        '| Record | Retention |\n| :---- | :---- |\n| Monthly HHVBP dashboards | 7 years |\n| CIP records (charter, PDSA logs, closure) | 7 years |\n| HHCAHPS vendor reports | 7 years |\n| Governing Body minutes referencing TPS | Permanent (GV-GB-001) |\n| Reimbursement impact analyses | 7 years |\n\n---'),
      makeSection('20-compliance-measurement', '8\\. Compliance Measurement', 2, 20,
        '| Indicator | Target |\n| :---- | :---- |\n| Monthly HHVBP dashboard published | 100% on time |\n| CIPs opened within 7 days of breach | 100% |\n| Measures meeting/exceeding achievement threshold | ≥ 70% |\n| Projected TPS payment adjustment band | Neutral or positive |\n| HHCAHPS response rate | ≥ national median |\n\n---'),
      makeSection('24-references', '9\\. References', 2, 24,
        '| Citation | Relevance |\n| :---- | :---- |\n| 42 CFR Part 484, Subpart F | Expanded HHVBP Model |\n| 42 CFR § 484.65 | QAPI |\n| 42 CFR § 484.245 | HHQRP |\n| CY 2024–2026 HH PPS Final Rules | Measure set updates |\n| HHVBP Technical Specifications | Scoring methodology |\n| HHCAHPS Protocols & Guidelines | Survey administration |\n\n### Cross-Referenced Policies\nQA-PG-001, QA-PG-002, QA-AE-003, QA-SM-004, CL-OA-101, CL-DC-101, CL-CC-101, CO-FW-101, EN-WF-101, GV-GB-001, FN-FP-007.\n\n## 10–11. Training & Version Control\nQAPI staff: HHVBP measure-specification training annually. Field clinicians: 60-minute HHVBP-impact orientation at hire and annually. Version control per EN-LC-001.\n\n---'),
    ],
  },
  {
    policyId: 'EN-WF-101',
    title: 'Policy Execution, Workflow Enforcement & Evidence Traceability',
    sections: [
      makeSection('1-policy-execution-workflow-enforcement-evidence-traceability', 'Policy Execution, Workflow Enforcement & Evidence Traceability', 1, 1, '---'),
      makeSection('2-policy-header', '1\\. Policy Header', 2, 2, policyHeaderRow('EN-WF-101', 'Policy Execution, Workflow Enforcement & Evidence Traceability', 'EN — Enterprise Governance', 'WF — Workflow & Evidence', 'Compliance Officer + IT Director (joint)', '42 CFR § 484.65 (QAPI), 42 CFR § 484.110, HIPAA 45 CFR § 164.312(b), FCA, OIG HHA Guidance, CMS Program Integrity')),
      makeSection('3-purpose', '2\\. Purpose', 2, 3,
        'This is the FOUNDATIONAL enterprise policy that defines how every other policy of Care Indeed Home Health Care, Inc. produces auditable evidence. It binds policy intent to executable workflow and requires that every action governed by any agency policy generate immutable, attributable, time-stamped evidence retrievable by the Compliance Officer, QAPI Director, Governing Body, or any duly authorized federal/state surveyor without delay. This policy is non-derogable.\n\n---'),
      makeSection('4-scope', '3\\. Scope', 2, 4,
        'Applies enterprise-wide: every policy in the library; every clinical, operational, financial, HR, IT, compliance, risk-management, governance workflow; every system that creates, edits, transmits, stores, or destroys agency data; every workforce member, contractor, business associate, and AI/automation agent.\n\n---'),
      makeSection('5-policy-statements', '4\\. Policy Statements', 2, 5,
        '4.1 Policy → Workflow → Event → Evidence Model: Every policy shall be implemented through one or more named workflows. Every workflow shall produce one or more named events. Every event shall produce evidence persisted to the Evidence Repository.\n' +
        '4.2 Required Metadata for Every Evidence Record: policy_id, workflow_id, event_id, event_type, user_id, actor_role, subject_id, timestamp (UTC ISO 8601, NTP-synchronized), device_attribution, source_refs, outcome, chain_hash. The Repository shall reject events lacking required metadata.\n' +
        '4.3 System-Generated Evidence Requirement: Evidence shall be system-generated at the moment of action. Manually transcribed after-the-fact entries are not acceptable substitutes. Out-of-band actions (paper, voice, fax) shall be ingested with intake_provenance metadata.\n' +
        '4.4 Prohibition of Undocumented Actions: Any policy-governed action without a corresponding evidence record is non-compliant; treated as not having occurred for survey defense; logged as a control gap; investigated when material; intentional bypass is sanctionable under HR-ER-002.\n' +
        '4.5 Audit Retrieval Requirement: Repository shall retrieve any event chain in ≤ 5 minutes by policy_id, workflow_id, event_id, subject_id, user_id, or timestamp range, including hash-chain proof and human-readable timeline. End-to-end evidence trails for any patient, episode, claim, or compliance event shall be producible on surveyor demand.\n' +
        '4.6 Immutability & Tamper Evidence: Records are append-only. Chain hash links each record to its predecessor for the same subject. Weekly chain-integrity verification job; chain breaks are immediate CO-IR-101 incidents.\n' +
        '4.7 Retention: Evidence records retained for the longer of: underlying record-class retention; open litigation hold; 10 years.\n' +
        '4.8 Mandatory Insertion Clause: Every policy shall include verbatim the clause: "' + GLOBAL_CLAUSE + '"\n\n---'),
      makeSection('6-definitions', '5\\. Definitions', 2, 6,
        '| Term | Definition |\n| :---- | :---- |\n| Workflow | Named, repeatable sequence of activities required to execute a policy. |\n| Event | Discrete action within a workflow that produces evidence. |\n| Evidence Repository | Append-only, hash-chained system of record for compliance evidence. |\n| Hash Chain | Cryptographic linkage between sequential records for the same subject. |\n| Intake Provenance | Metadata describing how an out-of-band action entered the digital system. |\n\n---'),
      makeSection('7-procedures', '6\\. Procedures', 2, 7, ''),
      makeSection('8-policy-workflow-registration', 'Policy → Workflow Registration', 3, 8,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.1.1 | Policy Owner | At policy approval, register workflow IDs and event IDs in the Workflow Registry. | Before publication. |\n| 6.1.2 | IT Director | Configure event emitters for each registered event in affected systems. | Before publication. |\n| 6.1.3 | Compliance Officer | Verify Workflow Registry coverage as part of EN-LC-001 lifecycle gates. | Before approval. |\n\n---', 'lesson'),
      makeSection('9-evidence-repository-operations', 'Evidence Repository Operations', 3, 9,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.2.1 | IT Director | Operate the Evidence Repository: append-only storage, hash chaining, role-based access, audit trail. | Continuous. |\n| 6.2.2 | IT Director | Run weekly chain-integrity verification job; alert on break. | Weekly. |\n| 6.2.3 | Compliance Officer | Quarterly evidence-coverage audit: sample 20 workflows, verify event emission, metadata completeness, retrieval performance. | Quarterly. |\n\n---', 'lesson'),
      makeSection('10-survey-readiness', 'Survey Readiness', 3, 10,
        '| Step | Responsible Party | Action | Timeframe |\n| :---- | :---- | :---- | :---- |\n| 6.3.1 | Compliance Officer | Maintain Surveyor Evidence Pack template enabling end-to-end trace of any patient, claim, complaint, or incident in ≤ 60 minutes. | Continuous. |\n| 6.3.2 | Compliance Officer | Conduct semi-annual mock-survey evidence-pull drills. | Semi-annually. |\n\n---', 'lesson'),
      makeSection('11-controls-enforcement', 'Controls & Enforcement', 3, 11,
        'Drafting Gate: EN-LC-001 lifecycle reviewer rejects any new/revised policy lacking the §4.8 clause or workflow/event identifiers.\n' +
        'System Gate: Event emitters reject actions missing required metadata; failures produce a control-gap incident.\n' +
        'Survey Gate: Quarterly mock surveys validate end-to-end retrievability.\n' +
        'Disciplinary Gate: Intentional bypass of evidence emission is sanctionable under HR-ER-002.\n\n---', 'lesson'),
      makeSection('19-documentation-requirements', '7\\. Documentation Requirements', 2, 19,
        '| Record | Retention |\n| :---- | :---- |\n| Workflow Registry (versioned) | Permanent |\n| Evidence records (all classes) | ≥ 10 years |\n| Chain-integrity verification reports | 7 years |\n| Quarterly evidence-coverage audits | 7 years |\n| Mock-survey drill reports | 7 years |\n\n---'),
      makeSection('20-compliance-measurement', '8\\. Compliance Measurement', 2, 20,
        '| Indicator | Target |\n| :---- | :---- |\n| Policies with §4.8 clause embedded | 100% |\n| Workflows registered for each REQUIRED policy | 100% |\n| Weekly chain-integrity verification | 100% on time |\n| Quarterly evidence-coverage audit completed | 100% |\n| Surveyor Evidence Pack assembly time | ≤ 60 minutes |\n| Control-gap incidents resolved within 30 days | 100% |\n\n---'),
      makeSection('24-references', '9\\. References', 2, 24,
        '| Citation | Relevance |\n| :---- | :---- |\n| 42 CFR § 484.110 | Clinical Records (HHA) |\n| 42 CFR § 484.65 | QAPI |\n| 45 CFR § 164.312(b) | HIPAA Audit Controls |\n| 45 CFR § 164.308(a)(1)(ii)(D) | Information System Activity Review |\n| OIG Compliance Program Guidance for HHAs | Audit controls |\n| CMS State Operations Manual Appendix B | Survey expectations |\n| 31 U.S.C. §§ 3729–3733 | False Claims Act |\n\n### Cross-Referenced Policies\nEN-LC-001, EN-TG-001, EN-CM-001, CO-DG-101, CO-HP-101, CO-IR-101, CO-FW-101, CL-OA-101, CL-DC-101, CL-CC-101, QA-VBP-101, HR-TR-101, RM-OS-101, GV-GB-001.\n\n## 10–11. Training & Version Control\nAll workforce members: orientation module on workflow/evidence model within 14 days of hire; annual refresher. Policy Owners and IT staff: advanced training on Workflow Registry maintenance. Version control per EN-LC-001.\n\n---'),
    ],
  },
];

// Append new policies before the final `];`
const closingMarker = '\n];\n\nexport const allPoliciesContentMap';
const idx = src.indexOf(closingMarker);
if (idx === -1) throw new Error('Final closing marker not found');
const insertion = newPolicies.map(newPolicyTs).join('');
src = src.slice(0, idx) + insertion + src.slice(idx);
console.log(`Appended ${newPolicies.length} new policy entries.`);

// ── Write back ──
if (ORIGINAL_HAD_CRLF) src = src.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, src);
console.log('Done.');
