/**
 * Packet archetype registry — §9 (12 archetypes), §10 backbone modules,
 * §13.1 QAPI modules, §15 allowedSubtypes.
 * Pure data + pure functions only. Zero runtime side effects.
 */

import type {
  PacketArchetypeDefinition,
  PacketArchetypeId,
  PacketAttachmentRule,
  PacketModuleId,
} from '@/policy/packets/contracts';
import {
  QAPI_PART_I_MODULE_IDS,
  QAPI_PART_II_MODULE_IDS,
  UNIVERSAL_BACKBONE_MODULE_IDS,
} from '@/policy/packets/contracts';

const BACKBONE = UNIVERSAL_BACKBONE_MODULE_IDS;
const QAPI_PART_I = QAPI_PART_I_MODULE_IDS;
const QAPI_PART_II = QAPI_PART_II_MODULE_IDS;

/** All universal backbone modules except supporting forms (forms stay last). */
const BACKBONE_WITHOUT_FORMS: readonly PacketModuleId[] = BACKBONE.filter(
  (id) => id !== 'supporting-forms-and-evidence',
);

function evidenceAttachment(
  attachmentTypeId: string,
  title: string,
  opts?: Partial<PacketAttachmentRule>,
): PacketAttachmentRule {
  return {
    attachmentTypeId,
    title,
    required: opts?.required ?? false,
    maxCount: opts?.maxCount ?? null,
    allowedMimeTypes: opts?.allowedMimeTypes ?? [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    placement: opts?.placement ?? 'appendix',
    defaultClassification: opts?.defaultClassification ?? 'confidential',
    relatedFormIds: opts?.relatedFormIds ?? [],
  };
}

function defineArchetype(
  partial: Omit<PacketArchetypeDefinition, 'version'> & { version?: string },
): PacketArchetypeDefinition {
  return {
    version: partial.version ?? '1.0.0',
    ...partial,
  };
}

const MEETING: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'meeting',
  title: 'Meeting Packet',
  description:
    'Governing Body, Compliance, Risk, Safety, and committee meeting packets with notice, agenda, attendance, decisions, and signed minutes.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'governing-body',
    'compliance-committee',
    'risk-safety',
  ],
  defaultClassification: 'confidential',
  defaultRetentionRule: 'retain-7-years-from-meeting-date',
  signaturePolicyId: 'meeting-committee-signatures',
  approvalPolicyId: 'meeting-committee-approvals',
  lockPolicyId: 'meeting-committee-lock',
  attachmentRules: [
    evidenceAttachment('meeting-minutes', 'Signed minutes', {
      required: true,
      placement: 'body',
    }),
    evidenceAttachment('meeting-agenda', 'Agenda and notice', {
      placement: 'body',
    }),
    evidenceAttachment('meeting-attendance', 'Attendance and quorum record'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const ANALYTICAL_REPORT: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'analytical-report',
  title: 'Analytical Report Packet',
  description:
    'Monthly, quarterly, and annual QAPI analytical reports and program evaluations. Analysis, dashboards, trends, decisions, and actions appear before forms.',
  // §13.1 Part I (analysis/governance) then Part II (forms/attachments) — analysis before forms.
  requiredModules: [...QAPI_PART_I, ...QAPI_PART_II],
  // Optional universal backbone modules that remain control/attachments-only when appended after Part II.
  optionalModules: [
    'branded-cover',
    'packet-identity-and-status',
    'validation-and-lock-readiness',
    'evidence-index',
    'missing-evidence-disclosure',
    'audit-chronology',
    'final-certification-and-lock-record',
    'attachment-manifest',
  ],
  allowedSubtypes: [
    'monthly-qapi',
    'quarterly-qapi',
    'annual-qapi',
    'program-evaluation',
  ],
  defaultClassification: 'confidential',
  defaultRetentionRule: 'retain-7-years-from-reporting-period-end',
  signaturePolicyId: 'qapi-quarterly-signatures',
  approvalPolicyId: 'qapi-quarterly-approvals',
  lockPolicyId: 'qapi-quarterly-lock',
  attachmentRules: [
    evidenceAttachment('qapi-source-form', 'Completed source form', {
      required: true,
      placement: 'appendix',
    }),
    evidenceAttachment('qapi-pip-cap-rca-form', 'Generated PIP/CAP/RCA form', {
      placement: 'appendix',
    }),
    evidenceAttachment(
      'qapi-confidential-personnel-addendum',
      'Confidential personnel-review addendum',
      {
        placement: 'confidential-addendum',
        defaultClassification: 'restricted-personnel',
      },
    ),
    evidenceAttachment('qapi-workflow-package', 'Triggered workflow execution package'),
  ],
  renderingProfileId: 'qapi-analytical',
});

const PIP_CAPA: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'pip-capa',
  title: 'PIP/CAPA Packet',
  description:
    'PIP, CAP, corrective action, effectiveness, and closure packets with RCA, measures, interventions, and remeasurement.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'pip',
    'cap',
    'corrective-action',
    'effectiveness-and-closure',
  ],
  defaultClassification: 'confidential',
  defaultRetentionRule: 'retain-7-years-from-closure',
  signaturePolicyId: 'pip-capa-signatures',
  approvalPolicyId: 'pip-capa-approvals',
  lockPolicyId: 'pip-capa-lock',
  attachmentRules: [
    evidenceAttachment('pip-capa-plan', 'PIP/CAP plan form', {
      required: true,
      placement: 'body',
    }),
    evidenceAttachment('pip-capa-rca', 'Root-cause analysis', { placement: 'body' }),
    evidenceAttachment('pip-capa-evidence', 'Effectiveness evidence'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const INCIDENT_INVESTIGATION: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'incident-investigation',
  title: 'Incident/Investigation Packet',
  description:
    'Falls, medication events, hospitalizations, near misses, and RCA investigation packets with immediate protections, reportability, and closure.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'patient-safety',
    'fall',
    'medication',
    'hospitalization',
    'ed-use',
    'missed-visit',
    'device-malfunction',
    'employee-injury',
    'near-miss',
  ],
  defaultClassification: 'confidential',
  defaultRetentionRule: 'retain-7-years-from-incident-date',
  signaturePolicyId: 'incident-investigation-signatures',
  approvalPolicyId: 'incident-investigation-approvals',
  lockPolicyId: 'incident-investigation-lock',
  attachmentRules: [
    evidenceAttachment('incident-report', 'Incident report form', {
      required: true,
      placement: 'body',
    }),
    evidenceAttachment('incident-rca', 'RCA worksheet', { placement: 'body' }),
    evidenceAttachment('incident-notification', 'Notification evidence'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const SURVEY_RESPONSE: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'survey-response',
  title: 'Survey/Response Packet',
  description:
    'ACHC, CMS, CDPH, OSHA, payer audit, and Plan of Correction response packets with findings, owners, and acceptance history.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'achc',
    'cms',
    'cdph',
    'osha',
    'payer-audit',
    'plan-of-correction',
  ],
  defaultClassification: 'confidential',
  defaultRetentionRule: 'retain-7-years-from-survey-close',
  signaturePolicyId: 'survey-response-signatures',
  approvalPolicyId: 'survey-response-approvals',
  lockPolicyId: 'survey-response-lock',
  attachmentRules: [
    evidenceAttachment('survey-notice', 'Survey notice and request list', {
      required: true,
      placement: 'body',
    }),
    evidenceAttachment('plan-of-correction', 'Plan of Correction', {
      required: true,
      placement: 'body',
    }),
    evidenceAttachment('survey-completion-evidence', 'Completion evidence'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const EMPLOYEE_COMPETENCY: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'employee-competency',
  title: 'Employee Competency Packet',
  description:
    'Onboarding, competency, clearance, and annual revalidation packets assembling Journey evidence without creating a second LMS.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'onboarding',
    'competency',
    'clearance',
    'annual-revalidation',
  ],
  defaultClassification: 'restricted-personnel',
  defaultRetentionRule: 'retain-for-employment-plus-7-years',
  signaturePolicyId: 'employee-competency-signatures',
  approvalPolicyId: 'employee-competency-approvals',
  lockPolicyId: 'employee-competency-lock',
  attachmentRules: [
    evidenceAttachment('competency-assessment', 'Competency assessment', {
      required: true,
      placement: 'body',
      defaultClassification: 'restricted-personnel',
    }),
    evidenceAttachment('credential-evidence', 'Credential and clearance evidence', {
      placement: 'appendix',
      defaultClassification: 'restricted-personnel',
    }),
    evidenceAttachment('skills-validation', 'Skills validation / Appendix F', {
      defaultClassification: 'restricted-personnel',
    }),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const POLICY_LIFECYCLE: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'policy-lifecycle',
  title: 'Policy Lifecycle Packet',
  description:
    'Policy review, revision, approval, publication, and acknowledgment packets with redline, effective date, and implementation evidence.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'review',
    'revision',
    'approval',
    'publication',
    'acknowledgment',
  ],
  defaultClassification: 'internal',
  defaultRetentionRule: 'retain-permanent-superseded-archive',
  signaturePolicyId: 'policy-lifecycle-signatures',
  approvalPolicyId: 'policy-lifecycle-approvals',
  lockPolicyId: 'policy-lifecycle-lock',
  attachmentRules: [
    evidenceAttachment('policy-current-version', 'Current policy version', {
      required: true,
      placement: 'body',
      defaultClassification: 'internal',
    }),
    evidenceAttachment('policy-redline', 'Redline / proposed version', {
      placement: 'body',
      defaultClassification: 'internal',
    }),
    evidenceAttachment('policy-acknowledgment-log', 'Acknowledgment log'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const PRIVACY_BREACH: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'privacy-breach',
  title: 'Privacy/Breach Packet',
  description:
    'HIPAA/CMIA incident, breach assessment, and notification packets with four-factor assessment, mitigation, and CAPA.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'hipaa-cmia-incident',
    'breach-assessment',
    'notification',
  ],
  defaultClassification: 'restricted-personnel',
  defaultRetentionRule: 'retain-6-years-from-closure-hipaa',
  signaturePolicyId: 'privacy-breach-signatures',
  approvalPolicyId: 'privacy-breach-approvals',
  lockPolicyId: 'privacy-breach-lock',
  attachmentRules: [
    evidenceAttachment('breach-intake', 'Breach intake record', {
      required: true,
      placement: 'body',
      defaultClassification: 'restricted-personnel',
    }),
    evidenceAttachment('four-factor-assessment', 'HIPAA four-factor assessment', {
      required: true,
      placement: 'body',
      defaultClassification: 'legal-privileged',
    }),
    evidenceAttachment('notification-evidence', 'Notification evidence', {
      defaultClassification: 'restricted-personnel',
    }),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const EMERGENCY_DRILL: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'emergency-drill',
  title: 'Emergency Drill Packet',
  description:
    'Tabletop, community exercise, actual activation, and annual review packets with after-action report and improvement plan.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'tabletop',
    'community-exercise',
    'actual-activation',
    'annual-review',
  ],
  defaultClassification: 'internal',
  defaultRetentionRule: 'retain-7-years-from-drill-date',
  signaturePolicyId: 'emergency-drill-signatures',
  approvalPolicyId: 'emergency-drill-approvals',
  lockPolicyId: 'emergency-drill-lock',
  attachmentRules: [
    evidenceAttachment('drill-scenario', 'Scenario and objectives', {
      required: true,
      placement: 'body',
      defaultClassification: 'internal',
    }),
    evidenceAttachment('after-action-report', 'After-action report', {
      required: true,
      placement: 'body',
      defaultClassification: 'internal',
    }),
    evidenceAttachment('improvement-plan', 'Improvement plan and corrective evidence'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const PROGRAM_SURVEILLANCE: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'program-surveillance',
  title: 'Program Surveillance Packet',
  description:
    'Infection prevention and other recurring surveillance packets with rates/trends, thresholds, and committee review.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'infection-prevention',
    'recurring-surveillance',
  ],
  defaultClassification: 'confidential',
  defaultRetentionRule: 'retain-7-years-from-surveillance-period-end',
  signaturePolicyId: 'program-surveillance-signatures',
  approvalPolicyId: 'program-surveillance-approvals',
  lockPolicyId: 'program-surveillance-lock',
  attachmentRules: [
    evidenceAttachment('surveillance-line-list', 'Line-list summary', {
      required: true,
      placement: 'appendix',
    }),
    evidenceAttachment('surveillance-rates', 'Rates and trend tables', {
      placement: 'body',
    }),
    evidenceAttachment('surveillance-education', 'Education and corrective actions'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const AUDIT: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'audit',
  title: 'Audit Packet',
  description:
    'Personnel, credentialing, billing, claims, documentation, compliance, policy, evidence, training, and mock survey audit packets.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'personnel-credentialing',
    'billing-claims-overpayment',
    'documentation',
    'compliance',
    'policy',
    'evidence',
    'training',
    'mock-survey',
  ],
  defaultClassification: 'confidential',
  defaultRetentionRule: 'retain-7-years-from-audit-close',
  signaturePolicyId: 'audit-packet-signatures',
  approvalPolicyId: 'audit-packet-approvals',
  lockPolicyId: 'audit-packet-lock',
  attachmentRules: [
    evidenceAttachment('audit-workpapers', 'Audit workpapers', {
      required: true,
      placement: 'appendix',
    }),
    evidenceAttachment('audit-findings', 'Findings and evidence log', {
      placement: 'body',
    }),
    evidenceAttachment('audit-corrective-action', 'Corrective-action evidence'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

const CONTRACT_VENDOR: PacketArchetypeDefinition = defineArchetype({
  archetypeId: 'contract-vendor',
  title: 'Contract/Vendor Packet',
  description:
    'Vendor, BAA, contract, renewal, and due-diligence packets with exclusion screening, insurance, and PHI return/destruction.',
  requiredModules: [
    ...BACKBONE_WITHOUT_FORMS,
    'supporting-forms-and-evidence',
  ],
  optionalModules: [],
  allowedSubtypes: [
    'vendor',
    'baa',
    'contract',
    'renewal',
    'due-diligence',
  ],
  defaultClassification: 'confidential',
  defaultRetentionRule: 'retain-for-contract-term-plus-7-years',
  signaturePolicyId: 'contract-vendor-signatures',
  approvalPolicyId: 'contract-vendor-approvals',
  lockPolicyId: 'contract-vendor-lock',
  attachmentRules: [
    evidenceAttachment('vendor-contract', 'Executed contract / BAA', {
      required: true,
      placement: 'body',
    }),
    evidenceAttachment('due-diligence-packet', 'Due diligence and exclusion screening', {
      placement: 'appendix',
    }),
    evidenceAttachment('insurance-certificate', 'Insurance certificate'),
  ],
  renderingProfileId: 'care-indeed-letter',
});

/**
 * All 12 packet archetypes in §9 table order.
 * Stable array — do not reorder without updating consumers.
 */
export const ALL_ARCHETYPES: readonly PacketArchetypeDefinition[] = [
  MEETING,
  ANALYTICAL_REPORT,
  PIP_CAPA,
  INCIDENT_INVESTIGATION,
  SURVEY_RESPONSE,
  EMPLOYEE_COMPETENCY,
  POLICY_LIFECYCLE,
  PRIVACY_BREACH,
  EMERGENCY_DRILL,
  PROGRAM_SURVEILLANCE,
  AUDIT,
  CONTRACT_VENDOR,
] as const;

const ARCHETYPE_BY_ID: ReadonlyMap<PacketArchetypeId, PacketArchetypeDefinition> = new Map(
  ALL_ARCHETYPES.map((a) => [a.archetypeId, a]),
);

/** Lookup an archetype definition by id. Throws when unknown (never invents data). */
export function getArchetype(id: PacketArchetypeId): PacketArchetypeDefinition {
  const found = ARCHETYPE_BY_ID.get(id);
  if (!found) {
    throw new Error(`Unknown packet archetype id: ${id}`);
  }
  return found;
}

/** True when the archetype id is registered. */
export function hasArchetype(id: string): id is PacketArchetypeId {
  return ARCHETYPE_BY_ID.has(id as PacketArchetypeId);
}

/** Ordered list of all archetype ids (§9 table order). */
export const ALL_ARCHETYPE_IDS: readonly PacketArchetypeId[] = ALL_ARCHETYPES.map(
  (a) => a.archetypeId,
);
