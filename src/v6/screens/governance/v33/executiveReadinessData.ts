import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import { WORKFLOW_TEMPLATES } from '@/policy/data/workflowTemplates.generated';
import { allPoliciesContent } from './policies/allPoliciesContent.generated';
import type { GbReferenceDocId } from './references/referenceDocs';

export type DecisionTone = 'attention' | 'ready' | 'hold' | 'private' | 'positive';

export interface ReadinessDecision {
  id: string;
  title: string;
  domain: string;
  due: string;
  status: string;
  summary: string;
  purpose: string;
  recommendation: string;
  requiredElements: string[];
  evidence: string[];
  authority: string;
  owner: string;
  tone: DecisionTone;
  workflowIds: string[];
  formIds: string[];
  suggestedMotion: string;
  agendaStatus: string;
  readinessImpact: string;
  returnToBoardDate: string;
  effectivenessMeasure: string;
  currentState?: string;
  referenceMaterials?: Array<{
    label: string;
    /**
     * Reference DESCRIPTOR resolved by the in-portal GbReferenceViewer
     * (blocker 6): controlled documents are never linked at a public static
     * URL — they render only inside the authenticated Governing Body portal.
     */
    docId: GbReferenceDocId;
    detail: string;
    posture: string;
  }>;
  revisionContext?: {
    heading: string;
    summary: string[];
    sections: Array<{
      title: string;
      items: string[];
    }>;
  };
}

export interface PolicyDocketItem {
  policyId: string;
  title: string;
  version: string;
  effectiveDate: string;
  owner: string;
  recommendation: string;
  materialChanges: string;
  regulatoryDriver: string;
  linkedForms: string;
  workforceImpact: string;
  trainingImpact: string;
  evidenceStatus: string;
  approvalStatus: string;
  reacknowledgment: string;
  agendaStatus: string;
}

export interface WorkflowInstance {
  instanceId: string;
  workflowId: string;
  title: string;
  tab: 'due' | 'blockers' | 'scheduled' | 'event' | 'completed' | 'library';
  whyTriggered: string;
  readinessImpact: 'Blocks readiness' | 'At risk' | 'Informational';
  currentStage: string;
  owner: string;
  nextAction: string;
  due: string;
  agendaStatus: string;
  requiredForms: string[];
  evidenceCompleteness: string;
  currentEvent: string;
  sourcePosture: 'LIVE' | 'SYNTHETIC UAT' | 'PREVIEW' | 'DISCONNECTED';
  processOverview: string;
  authority: string;
  failureConditions: string;
  auditRequirements: string;
}

export interface QapiPreviewQuarter {
  id: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual';
  label: string;
  source: string;
  changed: string;
  improved: string;
  worsened: string;
  unresolved: string;
  boardDecision: string;
  kpis: Array<{
    name: string;
    value: string;
    threshold: string;
    numerator: string;
    denominator: string;
    trend: string;
    priorQuarter: string;
    subgroup: string;
    sourceDate: string;
    posture: string;
  }>;
  lifecycle: Array<{
    type: 'PIP' | 'CAP' | 'RCA';
    title: string;
    owner: string;
    due: string;
    evidence: string;
    boardReturn: string;
  }>;
  dataIssues: string[];
}

export interface EvidencePackage {
  evidenceId: string;
  title: string;
  packageType: string;
  canonicalId: string;
  status: string;
  cesPath: string;
  drivePackage: string;
  access: string;
  chain: string[];
}

export interface AnnualAttestation {
  id: string;
  title: string;
  status: string;
  due: string;
  evidence: string;
  readinessImpact: string;
}

export const BRAD_NOLAN_CURRENT_STATE =
  'Current state: Brad remains local. Vertex transfer is proposed and requires Governing Body approval before implementation.';

export const DECISION_TO_AGENDA_ACTIONS = [
  'Add to agenda',
  'Schedule ad hoc meeting',
  'Open workflow',
  'Open required forms',
  'Open evidence in CES',
  'Open linked Google Drive package',
  'Assign owner',
  'Set due date',
  'Set return-to-Board date',
] as const;

const vertexDecisionElements = [
  'approved target architecture',
  'applicable BAA confirmation',
  'approved Google Cloud project(s)',
  'separate service accounts and trust zones',
  'Brad/Nolan role separation',
  'approved models',
  'reasoning configuration',
  'PHI and PII handling rules',
  'Nolan public-research limitation',
  'no silent fallback',
  'fail-closed behavior',
  'logging and monitoring',
  'human approval gates',
  'cybersecurity review',
  'vendor and subcontractor review',
  'validation plan',
  'rollback plan',
  'accountable owner',
  'implementation deadline',
  'return-to-Board date',
  'effectiveness measure',
  'CES/Drive evidence links',
];

export const READINESS_DECISIONS: ReadinessDecision[] = [
  {
    id: 'GB-READINESS-001',
    title: 'Approve the future transfer of Brad and Nolan to Vertex AI under the approved BAA and security architecture',
    domain: 'AI architecture and security',
    due: 'Before any production transfer work begins',
    status: 'Implementation gated',
    summary: 'Brad remains local. The Board must decide whether to authorize a future Vertex AI production architecture before any migration, runtime replacement, or production activation occurs.',
    purpose: 'The Governing Body must decide whether to authorize the planned migration of Brad and Nolan from the current local architecture to an approved Vertex AI production architecture.',
    recommendation: 'Review the target architecture, BAA coverage, trust zones, model configuration, PHI/PII boundaries, audit logging, fail-closed behavior, testing, rollback, owner, due date, return date, and CES/Drive evidence package before authorizing implementation.',
    requiredElements: vertexDecisionElements,
    evidence: [
      'AI architecture decision dossier',
      'BAA coverage confirmation',
      'service-account and trust-zone design',
      'model and reasoning configuration record',
      'cybersecurity review',
      'preproduction validation plan',
      'rollback plan',
      'CES and Google Drive evidence package',
    ],
    authority: 'GV-WF-01 · GV-WF-11 · HIPAA Security Rule · Board AI architecture control',
    owner: 'Administrator / IT / Compliance',
    tone: 'attention',
    workflowIds: ['GV-WF-01', 'GV-WF-11', 'IT-WF-11', 'CO-WF-06'].filter((id) => WORKFLOWS[id]),
    formIds: ['GV-FM-005', 'GV-FM-018', 'CO-FM-010', 'CO-FM-011'],
    suggestedMotion:
      'Approve the planned transfer of Brad and Nolan to the Board-approved Vertex AI architecture under the applicable BAA, subject to separate identities and trust zones, validated privacy and security controls, approved model configuration, fail-closed behavior, complete audit logging, successful preproduction testing, documented rollback capability, and Governing Body review of implementation evidence before production activation.',
    agendaStatus: 'Must be Decision Item #1 on the readiness docket',
    readinessImpact: 'Blocks production AI architecture readiness',
    returnToBoardDate: 'Next regular meeting after preproduction validation',
    effectivenessMeasure: 'No production activation until controls, logs, BAA scope, rollback, and model configuration pass evidence review.',
    currentState: BRAD_NOLAN_CURRENT_STATE,
  },
  {
    id: 'GB-READINESS-002',
    title: 'Set the Agency Readiness Date',
    domain: 'Readiness plan',
    due: 'Next readiness meeting',
    status: 'Decision required',
    summary: 'The selected date is a target only. It is not achieved until every required gate remains compliant for the required sustained period.',
    purpose: 'The Governing Body must select the target Agency Readiness Date and record blockers, gates, owner, evidence, and return date.',
    recommendation: 'Set a target date only after confirming the earliest eligible date, blockers, readiness gates, 30-day sustained-compliance requirement, owner, due date, return date, and activation evidence.',
    requiredElements: ['proposed date', 'earliest eligible date', 'current blockers', 'required readiness gates', '30-day sustained-compliance requirement', 'owner', 'due date', 'return-to-Board date', 'evidence needed before activation'],
    evidence: ['Readiness gate register', '30-day streak audit log', 'critical exception register', 'CES evidence completeness report'],
    authority: 'GV-WF-01 · GV-WF-05 · Agency readiness control',
    owner: 'Administrator / Governing Body Chair',
    tone: 'attention',
    workflowIds: ['GV-WF-01', 'GV-WF-05'],
    formIds: ['GV-FM-005', 'GV-FM-023'],
    suggestedMotion: 'Set the target Agency Readiness Date subject to completion and sustained compliance of all required readiness gates, with no unresolved critical exception and with activation evidence returned to the Governing Body before the date is treated as achieved.',
    agendaStatus: 'Add to readiness agenda',
    readinessImpact: 'Blocks readiness activation if not set and monitored',
    returnToBoardDate: 'Every regular readiness review until activated',
    effectivenessMeasure: 'Earliest eligible date remains accurate after all gate events and exception resets.',
  },
  {
    id: 'GB-READINESS-003',
    title: 'Require at least one successful month of full A-to-Z compliance before the Agency Readiness Date',
    domain: 'Sustained compliance gate',
    due: 'Before readiness date approval',
    status: 'Decision required',
    summary: 'This is a Board-adopted internal readiness standard unless a specific external authority is cited. Any critical failure resets the readiness streak and creates an auditable event.',
    purpose: 'The Governing Body must approve the 30-day sustained-compliance readiness standard and define the clock, reset conditions, monitoring owner, evidence source, reporting frequency, Board return date, and effectiveness test.',
    recommendation: 'Adopt the 30-day standard across governance, P&Ps, handbook, training, tabletop exercises, QAPI, PIPs, CAPs, RCAs, licensure, meetings, AI architecture, admission packet controls, CES evidence completeness, and critical exceptions.',
    requiredElements: ['approved start date', 'reset conditions', 'monitoring owner', 'evidence source', 'reporting frequency', 'Board return date', 'final effectiveness test'],
    evidence: ['Readiness streak ledger', 'critical-failure reset log', 'CES evidence completeness report', 'Board return reports'],
    authority: 'Board-adopted internal readiness standard',
    owner: 'Compliance Officer / Administrator',
    tone: 'hold',
    workflowIds: ['GV-WF-01', 'CO-WF-22', 'QA-WF-03'].filter((id) => WORKFLOWS[id]),
    formIds: ['GV-FM-023', 'EN-FM-034', 'QA-FM-005'],
    suggestedMotion: 'Adopt the 30-day sustained-compliance readiness standard and require any critical failure to reset the readiness streak with an auditable event, owner, corrective action, and return-to-Board evidence.',
    agendaStatus: 'Add to readiness agenda',
    readinessImpact: 'Blocks Agency Readiness Date achievement',
    returnToBoardDate: 'At each readiness review until 30 consecutive days are proven',
    effectivenessMeasure: 'All required gates remain compliant for 30 consecutive calendar days without unresolved critical exception.',
  },
  {
    id: 'GB-READINESS-004',
    title: 'Review and approve the required Policies and Procedures',
    domain: 'Policies and Procedures',
    due: 'Before readiness activation',
    status: 'Decision required',
    summary: 'The Board must approve the mapped controlled policies required for governance and agency readiness using the controlled source, actual policy IDs, and linked form/evidence status.',
    purpose: 'The Governing Body must review and approve the mapped policies and procedures required for governance and agency readiness.',
    recommendation: 'Approve only actual controlled policies and linked forms. Do not create invented policies, forms, appendices, approvals, or evidence to close this gate.',
    requiredElements: ['policy ID', 'title', 'version', 'effective date', 'owner', 'recommendation', 'material changes', 'legal/regulatory driver', 'linked forms', 'workforce impact', 'training impact', 'evidence status', 'approval status', 're-acknowledgment requirement', 'agenda status'],
    evidence: ['Controlled policy corpus', 'policy lifecycle records', 'linked forms register', 'training impact register', 'CES policy approval package'],
    authority: 'GV-PM-001 · GV-PM-002 · EN-LC-001',
    owner: 'Compliance Officer / Policy owners',
    tone: 'attention',
    workflowIds: ['GV-WF-01', 'GV-WF-13'],
    formIds: ['GV-FM-005', 'GV-FM-024', 'EN-FM-001'],
    suggestedMotion: 'Approve the required controlled Policies and Procedures listed in the Board docket, subject to linked-form verification, workforce impact review, training or re-acknowledgment routing, and CES evidence package completion.',
    agendaStatus: 'Add as controlled P&P approval docket',
    readinessImpact: 'Blocks readiness until required P&Ps are approved and evidence is complete',
    returnToBoardDate: 'Next regular meeting or ad hoc approval meeting',
    effectivenessMeasure: 'All required policy approvals have controlled version, owner, forms, training impact, and CES evidence.',
  },
  {
    id: 'GB-READINESS-005',
    title: 'URGENT — Review and approve the recommended Employee and Field Workforce Handbook',
    domain: 'Handbook and employment compliance',
    due: 'Urgent Board review',
    status: 'Urgent Board action',
    summary: 'The current handbook contains unresolved compliance and legal-risk findings and must not be treated as approved for readiness until reviewed, corrected, and formally adopted.',
    purpose: 'The Governing Body must urgently review the current handbook posture, documented legal/compliance risks, source of each finding, replacement or revision path, employment-law review status, California-specific requirements, field workforce applicability, acknowledgment plan, communication plan, implementation date, owner, return date, and evidence.',
    recommendation: 'Keep the handbook at highest urgency until legal/compliance review, correction, Board adoption, distribution, acknowledgment, and evidence are complete.',
    requiredElements: ['current handbook version', 'identified legal and compliance risks', 'source of each finding', 'recommended replacement or revision', 'employment-law review status', 'California-specific requirements', 'field workforce applicability', 'employee acknowledgment plan', 'training/communication plan', 'implementation date', 'owner', 'return-to-Board date', 'required evidence', 'agenda status'],
    evidence: ['Handbook review findings', 'counsel-review status', 'California requirement crosswalk', 'acknowledgment plan', 'training communication plan', 'CES handbook approval package'],
    authority: 'HR governance · California employment compliance · Board readiness control',
    owner: 'HR Director / Legal / Compliance',
    tone: 'attention',
    workflowIds: ['HR-WF-08', 'GV-WF-01'].filter((id) => WORKFLOWS[id]),
    formIds: ['GV-FM-005', 'HR-FM-016', 'EN-FM-001'],
    suggestedMotion: 'Direct urgent legal and compliance review of the current handbook, authorize preparation of the recommended corrected version, and require Board return with counsel status, California-specific requirements, field workforce applicability, acknowledgment plan, training plan, implementation date, and CES evidence before readiness approval.',
    agendaStatus: 'Highest urgency until closed',
    readinessImpact: 'Blocks readiness until corrected and formally adopted',
    returnToBoardDate: 'Ad hoc meeting or next regular meeting, whichever is sooner',
    effectivenessMeasure: 'Published controlled handbook is effective and acknowledgments are tracked without treating the prior handbook as retired prematurely.',
    referenceMaterials: [
      {
        label: 'Employee & Field Workforce Handbook 2026',
        docId: 'handbook-2026-counsel-review-draft',
        detail: 'Counsel-review draft reference for Board review and adoption decision; not effective until formally approved.',
        posture: 'BOARD APPROVAL REFERENCE · COUNSEL-REVIEW DRAFT',
      },
    ],
    revisionContext: {
      heading: 'Why the 2022 Field Employee Handbook must be retired',
      summary: [
        'The current Field Employee Handbook is a 2022 document and no longer reflects the agency\'s present policy architecture, current role assignments, controlled workflow system, evidence requirements, training model, or 2026 compliance program.',
        'Continuing to use it creates material risk that employees will rely on outdated instructions, inconsistent disciplinary standards, incomplete California-specific requirements, and language that no longer matches the agency\'s approved policies and operational controls.',
        'The handbook should be formally retired, archived, and marked "SUPERSEDED — NOT FOR USE" once the replacement handbook is approved, active, distributed, and supported by new acknowledgments.',
        'Amendment is not sufficient because the defects are structural: a line-by-line repair would require extensive rewriting, reorganization, policy reconciliation, legal review, new acknowledgment controls, updated cross-references, and replacement of multiple employment, safety, privacy, training, and field-practice sections.',
      ],
      sections: [
        {
          title: 'Clear Compliance Problems',
          items: [
            'Paid sick leave is outdated and incorrect: page 26 limits annual use to 24 hours/three days and carryover to 48 hours/six days, while California generally requires at least 40 hours/five days of use and an accrual cap of at least 80 hours/ten days under an accrual system as of January 1, 2024.',
            'Meal-and-rest-break language is unsafe: page 18 says breaks are taken only "when appropriate," limits an eight-hour shift to two ten-minute breaks, restricts employees from leaving the client household during paid breaks, and treats meal breaks mainly as a facility issue.',
            'Lactation policy is incomplete: page 32 does not clearly include the request process, employer response obligation, employee complaint right to the Labor Commissioner, or written-response requirement when compliant space or time cannot be provided.',
            'Cannabis and drug-testing language is too broad: page 14 treats medical marijuana as an illegal drug and broadly permits screening despite California limits on discrimination based on lawful off-duty cannabis use and tests detecting nonpsychoactive cannabis metabolites, subject to statutory exceptions.',
          ],
        },
        {
          title: 'Serious Legal-Risk Language',
          items: [
            'At-will and just-cause terms conflict: page 7 says employment may end with or without cause or notice, while page 8 says employees are terminated for just cause and that no employee may be dismissed without sufficient cause.',
            'The immediate-termination list contains a dangerous drafting error by listing "Giving confidential information pursuant to California Law" as a termination ground, which could punish lawful disclosures or protected reporting if read literally.',
            'Sick-call rules conflict with protected sick-leave use: page 8 requires 24 hours notice, forbids voicemail, and warns of discipline, while page 27 says unforeseeable sick leave requires notice only as soon as practical.',
            'The overtime example is misleading: page 19 suggests an 8:00 p.m. to 6:00 a.m. shift may be split at midnight to avoid daily overtime, but California overtime depends on the employer\'s fixed, regularly recurring workday and the handbook omits double-time and seventh-day rules.',
          ],
        },
        {
          title: 'Material Omissions Or Insufficient Treatment',
          items: [
            'California Family Rights Act coverage distinct from federal FMLA is not adequately operationalized.',
            'Bereavement leave and reproductive-loss leave are not adequately addressed as distinct job-protected leave categories.',
            'Current violence-related leave protections, pregnancy-disability leave, and the interactive-process procedure need complete operational policy treatment.',
            'Generic language saying the agency follows state law is not a strong substitute for eligibility rules, notice procedures, anti-retaliation protections, and field-ready workflow controls.',
          ],
        },
        {
          title: 'Additional Counsel-Review Concerns',
          items: [
            'Employee-monitoring language is extremely broad and says employees have no privacy expectation in voice, email, text, internet searches, or browsing.',
            'Personnel-file language may not accurately state current inspection, copying, timing, and cost rules.',
            'The temporary-employee three-month limit appears arbitrary and may conflict with actual employment relationships.',
            'The harassment policy may not contain every California-required element, notice, reporting channel, investigation standard, and supervisor-reporting duty.',
            'Editing residue such as "vacation or sick leave (remove)" on page 33 shows the handbook was not publication-ready.',
            'The acknowledgment says management may change policies at any time without notice, which is too broad for policies whose changes legally require notice, acknowledgment, or prospective implementation.',
          ],
        },
        {
          title: 'Board Approval Guardrails',
          items: [
            'Approve retirement only after confirming the replacement handbook is active, all regulatory and operational coverage has been preserved, affected employees have been notified, and new acknowledgments have been collected.',
            'Do not keep the 2022 handbook in active use without California employment-counsel review.',
            'Retain the 2022 handbook only as an archived superseded record after the controlled 2026 replacement is approved and distributed.',
          ],
        },
      ],
    },
  },
  {
    id: 'GB-READINESS-006',
    title: 'Complete all required Governing Body training modules and quizzes',
    domain: 'Governing Body compliance',
    due: 'Before readiness activation',
    status: 'Evidence hold',
    summary: 'Failed, incomplete, preview-only, locally stored, or disconnected-evidence results do not count as complete.',
    purpose: 'The Governing Body must require every assigned member to complete all assigned training modules, quizzes, remediation, attestations, and official evidence recording.',
    recommendation: 'Track member, assigned modules, completions, quiz status, remediation, due date, blockers, official evidence, readiness impact, and agenda action.',
    requiredElements: ['member', 'assigned modules', 'completed modules', 'quiz status', 'remediation status', 'due date', 'blocker', 'official evidence status', 'readiness impact', 'add-to-agenda action'],
    evidence: ['Governing Body assignment catalog', 'official completion records', 'quiz outcomes', 'remediation records', 'attestations'],
    authority: 'GV-WF-13 · GB Academy requirement catalog',
    owner: 'Compliance Officer / Board Secretary',
    tone: 'hold',
    workflowIds: ['GV-WF-13'],
    formIds: ['GV-FM-024', 'EN-FM-001'],
    suggestedMotion: 'Require completion of all assigned Governing Body training modules, required quizzes, remediation, attestations, and official evidence recording before individual or global readiness completion is recognized.',
    agendaStatus: 'Add overdue or incomplete assignments to agenda',
    readinessImpact: 'Blocks personal and global readiness',
    returnToBoardDate: 'Each readiness review until all assignments are complete',
    effectivenessMeasure: 'Every assigned member has official evidence with pass status, attestation, source version, and no critical unresolved remediation.',
  },
  {
    id: 'GB-READINESS-007',
    title: 'Complete the Governing Body tabletop exercises using the 2026 synthetic QAPI records',
    domain: 'QAPI tabletop readiness',
    due: 'Before readiness activation',
    status: 'Evidence hold',
    summary: 'Required Governing Body readiness exercise using the 2026 synthetic QAPI record. Official completion is recorded through My Compliance.',
    purpose: 'The Governing Body must require Q1, Q2, Q3, Q4, and Annual 2026 tabletop exercises in assigned solo or facilitated group mode.',
    recommendation: 'Completion requires passing score, zero critical errors, required remediation, official attestation, official evidence save, and readiness gate update.',
    requiredElements: ['assigned exercise', 'attempts', 'score', 'critical errors', 'remediation', 'completion', 'evidence status', 'readiness impact', 'agenda action'],
    evidence: ['Q1 2026 tabletop record', 'Q2 2026 tabletop record', 'Q3 2026 tabletop record', 'Q4 2026 tabletop record', 'Annual 2026 tabletop record', 'official evidence records'],
    authority: '42 CFR 484.65 · QA-WF-03 · GV-WF-13',
    owner: 'QAPI Lead / Compliance Officer',
    tone: 'hold',
    workflowIds: ['QA-WF-03', 'GV-WF-13'].filter((id) => WORKFLOWS[id]),
    formIds: ['QA-FM-001', 'GV-FM-024', 'GV-FM-005'],
    suggestedMotion: 'Require completion of the Q1, Q2, Q3, Q4, and Annual 2026 synthetic QAPI tabletop exercises with passing scores, zero critical errors, remediation where required, official attestations, official evidence save, and readiness gate update.',
    agendaStatus: 'Add incomplete or failed packs to agenda',
    readinessImpact: 'Blocks tabletop readiness gate',
    returnToBoardDate: 'Each readiness review until all assigned packs are complete',
    effectivenessMeasure: 'All assigned packs have official completion evidence and no unresolved critical-error remediation.',
  },
  {
    id: 'GB-READINESS-008',
    title: 'Approve the automated Patient Admission Packet template and controlled generation registry',
    domain: 'Patient admission packet controls',
    due: 'Before production packet generation',
    status: 'Decision required',
    summary: 'The template governs what the generated admission packet contains and how it is assembled. The registry records every generated instance, provenance, status, version, and evidence trail.',
    purpose: 'The Governing Body shall review and approve the canonical automated Patient Admission Packet template, including section order, conditional content rules, disclosures, service-specific forms, payer/private-pay logic, signatures, version controls, and final PDF output.',
    recommendation: 'Approve the canonical template and controlled registry only after server-side deterministic rendering, source-to-output traceability, preproduction comparison, accessibility/print QA, signature/eCIgn validation, package hash, immutable publish record, exception reporting, rollback, and CES/Drive evidence are complete.',
    requiredElements: ['approved canonical template and version', 'validated conditional-generation rules', 'no blank or placeholder pages', 'no client-side-only generation for the official packet', 'server-side deterministic rendering', 'exact source-to-output traceability', 'preproduction comparison against approved forms', 'accessibility and print QA', 'private-pay and payer-specific gating validation', 'service-specific section validation', 'required disclosure validation', 'signature and eCIgn routing validation', 'final package hash', 'immutable publish record', 'superseded-version control', 'exception reporting', 'rollback to prior approved version', 'CES and Google Drive evidence links'],
    evidence: ['Patient Admission Packet template', 'generation registry design', 'validation sample record', 'eCIgn routing validation', 'final package hash evidence', 'CES and Google Drive evidence links'],
    authority: 'Packet Studio controls · patient rights disclosure control · eCIgn signature routing',
    owner: 'Administrator / Compliance / Packet owner',
    tone: 'attention',
    workflowIds: ['OP-WF-01', 'GV-WF-01'].filter((id) => WORKFLOWS[id]),
    formIds: ['GV-FM-005', 'CL-FM-001', 'CO-FM-010'],
    suggestedMotion: 'Approve the canonical automated Patient Admission Packet generation template and its controlled registry for production use, subject to successful validation of conditional content, required disclosures, signatures, source traceability, final-package integrity, exception reporting, and a 30-packet or 30-day effectiveness review before final sustained approval.',
    agendaStatus: 'Add to readiness agenda',
    readinessImpact: 'Blocks production packet automation readiness',
    returnToBoardDate: 'After first 30 production packets or 30 days, whichever occurs first',
    effectivenessMeasure: 'First 30 packets or first 30 days show no material template, rule, form, disclosure, data-mapping, rendering, evidence, or signature exception above threshold.',
    referenceMaterials: [
      {
        label: 'Patient Admission Packet · Letter Form',
        docId: 'patient-admission-packet-letter-form',
        detail: 'Template reference for the Governing Body approval task covering packet contents, conditional sections, disclosures, signatures, and production-readiness controls.',
        posture: 'BOARD APPROVAL REFERENCE · TEMPLATE SOURCE',
      },
    ],
  },
];

export const SOURCE_DERIVED_QAPI_DECISIONS: ReadinessDecision[] = [
  {
    id: 'GB-QAPI-2026-Q2-001',
    title: 'Q2 2026 synthetic QAPI source conflicts require Board direction before reliance',
    domain: 'Synthetic QAPI preview',
    due: 'Q2 synthetic tabletop review',
    status: 'Synthetic source-derived',
    summary: 'A quarter-specific synthetic QAPI decision derived from the 2026 tabletop record. It is subordinate to the readiness docket and cannot replace production QAPI evidence.',
    purpose: 'Practice source-cutoff and evidence-reliance judgment using the 2026 synthetic QAPI record.',
    recommendation: 'Use only as UAT preview and route official exercise completion through My Compliance.',
    requiredElements: ['source link', 'synthetic label', 'quarter specificity', 'case-derived evidence'],
    evidence: ['tabletop2026/data/q2Case.ts', 'synthetic QAPI source posture'],
    authority: 'Synthetic UAT preview · QA-WF-03',
    owner: 'QAPI Lead',
    tone: 'private',
    workflowIds: ['QA-WF-03'].filter((id) => WORKFLOWS[id]),
    formIds: ['QA-FM-001'],
    suggestedMotion: 'Do not treat the synthetic QAPI preview as production evidence; use it for required readiness exercise completion and record any source-reliance lessons in the training evidence record.',
    agendaStatus: 'Subordinate synthetic item',
    readinessImpact: 'Informs tabletop completion only',
    returnToBoardDate: 'After exercise completion',
    effectivenessMeasure: 'Participant correctly distinguishes synthetic preview evidence from production evidence.',
  },
];

const policyTitle = (policyId: string): string => {
  const policy = allPoliciesContent.find((candidate) => candidate.policyId === policyId);
  return policy?.sections.find((section) => section.level === 1)?.title ?? policyId;
};

export const POLICY_APPROVAL_DOCKET: PolicyDocketItem[] = [
  'GV-GB-001',
  'GV-GB-002',
  'GV-GB-003',
  'GV-PM-001',
  'GV-PM-002',
  'QA-PG-001',
  'QA-PG-002',
  'CO-CP-001',
  'CO-HP-001',
  'HR-TD-001',
].map((policyId) => ({
  policyId,
  title: policyTitle(policyId),
  version: 'Controlled source version',
  effectiveDate: 'Use controlled policy effective date',
  owner: policyId.startsWith('GV') ? 'Administrator / Governing Body' : policyId.startsWith('QA') ? 'QAPI Coordinator' : policyId.startsWith('HR') ? 'HR Director' : 'Compliance Officer',
  recommendation: 'Board review required before readiness reliance',
  materialChanges: 'Open controlled policy lifecycle record',
  regulatoryDriver: policyId.startsWith('GV') ? '42 CFR 484.105' : policyId.startsWith('QA') ? '42 CFR 484.65' : 'Compliance readiness control',
  linkedForms: 'Open linked forms from policy/form registry',
  workforceImpact: 'Requires communication and role-scoped acknowledgment where applicable',
  trainingImpact: 'Feeds My Compliance assigned policy reading and quiz gates',
  evidenceStatus: 'CES package required',
  approvalStatus: 'Board review pending',
  reacknowledgment: 'Required after Board-approved effective version',
  agendaStatus: 'Add to P&P approval docket',
}));

const workflowInstanceSeed = [
  {
    instanceId: 'GB-WI-READINESS-001',
    workflowId: 'GV-WF-01',
    tab: 'due' as const,
    whyTriggered: 'Agency readiness docket requires a governed meeting and minutes path.',
    readinessImpact: 'Blocks readiness' as const,
    currentStage: 'Agenda build',
    owner: 'Board Secretary',
    nextAction: 'Add readiness decisions and evidence status to the agenda',
    due: 'Next readiness meeting',
    agendaStatus: 'Agenda item required',
    evidenceCompleteness: '2 of 7 required evidence links connected',
    currentEvent: 'Readiness operating-system review',
    sourcePosture: 'PREVIEW' as const,
  },
  {
    instanceId: 'GB-WI-READINESS-002',
    workflowId: 'GV-WF-13',
    tab: 'blockers' as const,
    whyTriggered: 'Governing Body training, quizzes, and tabletop completion are required for readiness.',
    readinessImpact: 'Blocks readiness' as const,
    currentStage: 'Official evidence pending',
    owner: 'Compliance Officer',
    nextAction: 'Route overdue or disconnected completion records to agenda',
    due: 'Before readiness activation',
    agendaStatus: 'Agenda-ready blocker',
    evidenceCompleteness: 'Preview only; production evidence disconnected',
    currentEvent: 'Governing Body compliance gate',
    sourcePosture: 'DISCONNECTED' as const,
  },
  {
    instanceId: 'GB-WI-READINESS-003',
    workflowId: 'QA-WF-03',
    tab: 'event' as const,
    whyTriggered: '2026 synthetic QAPI quarters and Annual review require Board exercise and source-cutoff judgment.',
    readinessImpact: 'At risk' as const,
    currentStage: 'Synthetic preview',
    owner: 'QAPI Lead',
    nextAction: 'Complete required tabletop packs through My Compliance',
    due: 'Before readiness activation',
    agendaStatus: 'Add failed or incomplete packs',
    evidenceCompleteness: '0 of 5 official tabletop evidence records connected',
    currentEvent: '2026 synthetic QAPI tabletop',
    sourcePosture: 'SYNTHETIC UAT' as const,
  },
  {
    instanceId: 'GB-WI-READINESS-004',
    workflowId: 'GV-WF-11',
    tab: 'scheduled' as const,
    whyTriggered: 'Future Brad/Nolan Vertex transfer is a vendor/security architecture decision before implementation.',
    readinessImpact: 'Blocks readiness' as const,
    currentStage: 'Architecture dossier needed',
    owner: 'Administrator / IT / Compliance',
    nextAction: 'Open Decision #1 dossier and attach BAA/security evidence',
    due: 'Before migration task',
    agendaStatus: 'Decision Item #1',
    evidenceCompleteness: 'Target architecture and BAA confirmation pending',
    currentEvent: 'AI architecture governance',
    sourcePosture: 'PREVIEW' as const,
  },
];

export const WORKFLOW_INSTANCES: WorkflowInstance[] = workflowInstanceSeed.map((seed) => {
  const workflow = WORKFLOWS[seed.workflowId];
  const template = WORKFLOW_TEMPLATES.find((candidate) => candidate.workflowId === seed.workflowId);
  return {
    ...seed,
    title: workflow?.title ?? seed.workflowId,
    requiredForms: workflow?.requiredForms.slice(0, 6) ?? template?.requiredForms.slice(0, 6) ?? [],
    processOverview: workflow?.processOverview ?? 'Workflow source is not connected in this build.',
    authority: workflow?.regulatoryAnchors.join(' · ') || workflow?.policyRefs.join(' · ') || 'Workflow source pending',
    failureConditions: workflow?.failureConditions ?? 'Open the workflow source to inspect failure conditions.',
    auditRequirements: workflow?.auditRequirements ?? 'Open the workflow source to inspect audit requirements.',
  };
});

export const WORKFLOW_LIBRARY_SUMMARY = {
  total: WORKFLOW_GRAPH.kpis.total,
  requiresGoverningBody: WORKFLOW_GRAPH.kpis.requiresGoverningBody,
  highRisk: WORKFLOW_GRAPH.kpis.highRisk,
  source: 'src/policy/data/workflows.generated.ts',
};

export const QAPI_PREVIEW_QUARTERS: QapiPreviewQuarter[] = [
  {
    id: 'Q1',
    label: 'Q1 2026',
    source: 'tabletop2026/data/q1Case.ts',
    changed: 'Baseline controls established, but recovered records create source-cutoff pressure.',
    improved: 'Quarterly meeting control and Board-book assembly are visible earlier in the process.',
    worsened: 'Evidence conflicts remain unresolved until the participant records reliance decisions.',
    unresolved: 'Recovered records and supplemental source posture require Board reasoning.',
    boardDecision: 'Decide whether the packet can be relied on for affected matters.',
    kpis: [
      { name: 'Timely QAPI packet assembly', value: '3 / 5', threshold: '5 / 5', numerator: '3', denominator: '5', trend: 'Below target', priorQuarter: 'New baseline', subgroup: 'Board packet controls', sourceDate: 'Q1 2026', posture: 'Synthetic UAT' },
      { name: 'Critical evidence conflicts resolved', value: '0 / 3', threshold: '3 / 3', numerator: '0', denominator: '3', trend: 'Open', priorQuarter: 'New baseline', subgroup: 'Source reliance', sourceDate: 'Q1 2026', posture: 'Synthetic UAT' },
    ],
    lifecycle: [
      { type: 'RCA', title: 'Recovered-record chronology conflict', owner: 'Board Secretary', due: 'During tabletop', evidence: 'Conflict-group determination', boardReturn: 'Exercise result' },
    ],
    dataIssues: ['after-cutoff records', 'supplemental source posture', 'unsigned/provisional packet elements'],
  },
  {
    id: 'Q2',
    label: 'Q2 2026',
    source: 'tabletop2026/data/q2Case.ts',
    changed: 'Synthetic quality and complaint signals require explicit Board action posture.',
    improved: 'PIP/CAP/RCA distinctions are exposed to the participant.',
    worsened: 'A fragile subgroup signal remains below threshold.',
    unresolved: 'Data-quality and cutoff conflicts must be resolved before reliance.',
    boardDecision: 'Hold or condition reliance on affected QAPI matters.',
    kpis: [
      { name: 'QAPI action closure', value: '4 / 7', threshold: '7 / 7', numerator: '4', denominator: '7', trend: 'At risk', priorQuarter: 'Down by 2', subgroup: 'Open action register', sourceDate: 'Q2 2026', posture: 'Synthetic UAT' },
      { name: 'Critical error avoidance', value: '0 critical', threshold: '0 critical', numerator: '0', denominator: '1', trend: 'Controlled if decisions are sound', priorQuarter: 'Flat', subgroup: 'Tabletop scoring', sourceDate: 'Q2 2026', posture: 'Synthetic UAT' },
    ],
    lifecycle: [
      { type: 'PIP', title: 'Fragile subgroup quality trend', owner: 'QAPI Lead', due: 'Q2 Board review', evidence: 'Synthetic KPI dashboard', boardReturn: 'Next quarter or failed sustainability test' },
      { type: 'CAP', title: 'Packet evidence completion gap', owner: 'Board Secretary', due: 'Before lock', evidence: 'Packet readiness gate', boardReturn: 'Exercise result' },
    ],
    dataIssues: ['denominator conflict', 'source timing issue', 'provisional record status'],
  },
  {
    id: 'Q3',
    label: 'Q3 2026',
    source: 'tabletop2026/data/q3Case.ts',
    changed: 'Live-inject pressure adds meeting-process and confidentiality decisions.',
    improved: 'Participant can practice agenda, motion, vote, and owner deadlines.',
    worsened: 'Executive-session handling risk increases.',
    unresolved: 'Recusal, confidentiality, and public/minutes boundaries require precision.',
    boardDecision: 'Record the narrowest complete action without over-disclosing restricted content.',
    kpis: [
      { name: 'Executive-session boundary', value: 'Pending', threshold: 'No public disclosure error', numerator: '0', denominator: '1', trend: 'Untested', priorQuarter: 'New inject', subgroup: 'Restricted matters', sourceDate: 'Q3 2026', posture: 'Synthetic UAT' },
      { name: 'Owner/deadline capture', value: '2 / 4', threshold: '4 / 4', numerator: '2', denominator: '4', trend: 'At risk', priorQuarter: 'Flat', subgroup: 'Board action record', sourceDate: 'Q3 2026', posture: 'Synthetic UAT' },
    ],
    lifecycle: [
      { type: 'RCA', title: 'Executive-session record boundary', owner: 'Chair / Counsel', due: 'During session', evidence: 'Separate public/confidential minutes', boardReturn: 'Exercise result' },
    ],
    dataIssues: ['restricted evidence access', 'possible identity collision', 'confidential record separation'],
  },
  {
    id: 'Q4',
    label: 'Q4 2026',
    source: 'tabletop2026/data/q4Case.ts',
    changed: 'Year-end close pressure tests closure eligibility and sustained-effectiveness evidence.',
    improved: 'The exercise requires effectiveness language after successful actions.',
    worsened: 'Closure decisions can overreach if sustainability criteria are unmet.',
    unresolved: 'PIP closure eligibility and return-to-Board dates need evidence.',
    boardDecision: 'Approve, condition, or hold closure based on stated sustainability criteria.',
    kpis: [
      { name: 'Sustainability criteria met', value: '1 / 3', threshold: '3 / 3', numerator: '1', denominator: '3', trend: 'Below target', priorQuarter: 'Up by 1', subgroup: 'Open PIPs', sourceDate: 'Q4 2026', posture: 'Synthetic UAT' },
      { name: 'Return-to-Board dates captured', value: '3 / 5', threshold: '5 / 5', numerator: '3', denominator: '5', trend: 'At risk', priorQuarter: 'Flat', subgroup: 'Action register', sourceDate: 'Q4 2026', posture: 'Synthetic UAT' },
    ],
    lifecycle: [
      { type: 'PIP', title: 'Sustainability test not fully met', owner: 'QAPI Lead', due: 'Q4 review', evidence: 'Synthetic sustainability dashboard', boardReturn: 'Annual review' },
    ],
    dataIssues: ['closure eligibility ambiguity', 'missing effectiveness evidence', 'return-date gaps'],
  },
  {
    id: 'Annual',
    label: 'Annual 2026',
    source: 'tabletop2026/data/annualCase.ts',
    changed: 'Annual capstone requires all fourteen Governing Body workflow families to be exercised soundly.',
    improved: 'Full workflow coverage is visible across the exercise result.',
    worsened: 'Any missed workflow family prevents annual completion.',
    unresolved: 'Human moderated validation remains required before release confidence can be claimed.',
    boardDecision: 'Accept completion only with official evidence and zero critical failures.',
    kpis: [
      { name: 'Workflow coverage', value: '14 required', threshold: '14 / 14', numerator: '14', denominator: '14', trend: 'Exercise-controlled', priorQuarter: 'Annual only', subgroup: 'GV workflow families', sourceDate: 'FY2026', posture: 'Synthetic UAT' },
      { name: 'Human validation gate', value: '0 / 3', threshold: '3 / 3', numerator: '0', denominator: '3', trend: 'Not started', priorQuarter: 'No human gate', subgroup: 'First-time users', sourceDate: 'FY2026', posture: 'Disconnected' },
    ],
    lifecycle: [
      { type: 'CAP', title: 'Human moderated release gate', owner: 'Product / Compliance', due: 'Before release', evidence: 'Moderated study packet', boardReturn: 'Release readiness decision' },
    ],
    dataIssues: ['no observed human validation', 'screen-reader session not complete', 'production evidence disconnected'],
  },
];

export const EVIDENCE_PACKAGES: EvidencePackage[] = [
  {
    evidenceId: 'GB-EV-DECISION-001',
    title: 'Brad/Nolan future Vertex transfer decision package',
    packageType: 'Decision package',
    canonicalId: 'decision_id:GB-READINESS-001',
    status: 'Evidence package required',
    cesPath: '/ces?scope=governing-body&decision_id=GB-READINESS-001',
    drivePackage: 'Google Drive package link required',
    access: 'Board / Compliance / IT',
    chain: ['Requirement', 'Workflow', 'Decision', 'Agenda item', 'Meeting event', 'Motion and vote', 'Action', 'Evidence', 'Effectiveness', 'Closure'],
  },
  {
    evidenceId: 'GB-EV-POLICY-001',
    title: 'Controlled Policies and Procedures approval package',
    packageType: 'Policy approval package',
    canonicalId: 'policy_id:GV-PM-001',
    status: 'Board review pending',
    cesPath: '/ces?scope=governing-body&package=policy-approval',
    drivePackage: 'Google Drive package link required',
    access: 'Board / Compliance',
    chain: ['Policy', 'Linked forms', 'Training impact', 'Agenda item', 'Motion and vote', 'CES evidence'],
  },
  {
    evidenceId: 'GB-EV-TABLETOP-2026',
    title: '2026 synthetic QAPI tabletop completion evidence',
    packageType: 'Training/compliance completion',
    canonicalId: 'workflow_id:QA-WF-03',
    status: 'Production evidence disconnected',
    cesPath: '/ces?scope=governing-body&workflow_id=QA-WF-03',
    drivePackage: 'Google Drive package link required',
    access: 'Board / Compliance / QAPI',
    chain: ['Assignment', 'Attempt', 'Score', 'Critical errors', 'Remediation', 'Attestation', 'Official evidence'],
  },
  {
    evidenceId: 'GB-EV-ADMISSION-PACKET',
    title: 'Automated Patient Admission Packet template and registry package',
    packageType: 'Template/control package',
    canonicalId: 'form_id:patient-admission-packet',
    status: 'Validation pending',
    cesPath: '/ces?scope=governing-body&form_id=patient-admission-packet',
    drivePackage: 'Google Drive package link required',
    access: 'Board / Compliance / Operations',
    chain: ['Template', 'Rule validation', 'Generated packet', 'Hash', 'Registry index', 'Evidence link', 'Effectiveness review'],
  },
];

export const ANNUAL_ATTESTATIONS: AnnualAttestation[] = [
  {
    id: 'GB-ANN-COI',
    title: 'Annual conflict-of-interest disclosure',
    status: 'Required',
    due: 'Before annual readiness approval',
    evidence: 'GV-FM-006 or controlled successor in CES',
    readinessImpact: 'Blocks readiness if missing or unresolved',
  },
  {
    id: 'GB-ANN-CONF',
    title: 'Executive-session confidentiality attestation',
    status: 'Required',
    due: 'Before restricted records access',
    evidence: 'Controlled confidentiality attestation in CES',
    readinessImpact: 'Blocks executive-session evidence access',
  },
  {
    id: 'GB-ANN-GOV',
    title: 'Governing Body annual governance refresh attestation',
    status: 'Required',
    due: 'Annual governance cycle',
    evidence: 'Training completion and attestation record',
    readinessImpact: 'Blocks personal compliance completion',
  },
];
