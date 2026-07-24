// The 14 Governing Body workflows this simulation must exercise across a
// year of quarterly cases plus the FY2026 capstone. Each entry names the
// trigger condition and the governance forms that workflow produces/uses —
// this is the matrix engine/workflowTriggerEngine.ts and the results screen
// both key off of.

import type { GvWorkflowId, Quarter } from '../engine/caseTypes';
import { ALL_GV_WORKFLOW_IDS } from '../engine/caseTypes';

export interface GvWorkflowDef {
  id: GvWorkflowId;
  name: string;
  trigger: string;
  forms: string[];
}

export const GV_WORKFLOWS: GvWorkflowDef[] = [
  {
    id: 'GV-WF-01',
    name: 'Board Roster & Composition Change',
    trigger: 'A director/community-member seat changes, term expires, or the required composition mix is at risk.',
    forms: ['GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT'],
  },
  {
    id: 'GV-WF-02',
    name: 'Conflict of Interest Disclosure & Recusal',
    trigger: 'A member discloses a financial or personal interest in a matter before the Board.',
    forms: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
  },
  {
    id: 'GV-WF-03',
    name: 'Administrator Appointment or Change',
    trigger: 'The Administrator role changes hands or a vacancy must be filled.',
    forms: ['GB-FORM-ADMINISTRATOR-CHANGE'],
  },
  {
    id: 'GV-WF-04',
    name: 'Clinical Manager Appointment or Change',
    trigger: 'The Clinical Manager role changes hands or a vacancy must be filled.',
    forms: ['GB-FORM-CLINICAL-MANAGER-CHANGE'],
  },
  {
    id: 'GV-WF-05',
    name: 'Quarterly QAPI Packet Review & Decision',
    trigger: 'A quarter\'s normalized QAPI packet is ready to convene for Board decision.',
    forms: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PACKET-READINESS'],
  },
  {
    id: 'GV-WF-06',
    name: 'PIP Authorization, Sustainability Review & Closure',
    trigger: 'A performance-improvement project is proposed, reviewed for sustainability, or presented for closure.',
    forms: ['GB-FORM-PIP-AUTHORIZATION', 'GB-FORM-PIP-CLOSURE'],
  },
  {
    id: 'GV-WF-07',
    name: 'Corrective Action Plan & Budget/Resource Authorization',
    trigger: 'A CAP requires Board-authorized resources (staffing, budget, or systems) or a resourcing decision is otherwise due.',
    forms: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
  },
  {
    id: 'GV-WF-08',
    name: 'Adverse Event Root-Cause Escalation',
    trigger: 'An adverse event with a systemic root cause is escalated to the Board.',
    forms: ['GB-FORM-RCA-ESCALATION'],
  },
  {
    id: 'GV-WF-09',
    name: 'Restricted Personnel Matter (Executive Session)',
    trigger: 'A patient-safety-linked personnel matter requires executive-session review.',
    forms: ['GB-FORM-RESTRICTED-MATTER', 'GB-FORM-EXEC-SESSION-MINUTES', 'GB-FORM-PUBLIC-MINUTES'],
  },
  {
    id: 'GV-WF-10',
    name: 'Scope of Services Change',
    trigger: 'A proposed change to the agency\'s licensed scope of services is presented for approval.',
    forms: ['GB-FORM-SCOPE-CHANGE'],
  },
  {
    id: 'GV-WF-11',
    name: 'Licensure & Accreditation Renewal',
    trigger: 'A licensure or accreditation renewal is due, at risk, or lapsed.',
    forms: ['GB-FORM-LICENSURE-RENEWAL'],
  },
  {
    id: 'GV-WF-12',
    name: 'Change of Ownership (CHOW) Notification',
    trigger: 'A change of ownership transaction requires Board review and regulatory notification.',
    forms: ['GB-FORM-CHOW-NOTIFICATION'],
  },
  {
    id: 'GV-WF-13',
    name: 'Media / Public Incident & Privacy Breach Response',
    trigger: 'A media/public-relations incident or a PHI privacy/security incident requires Board-level response.',
    forms: ['GB-FORM-MEDIA-INCIDENT', 'GB-FORM-BREACH-RESPONSE', 'GB-FORM-VENDOR-BAA'],
  },
  {
    id: 'GV-WF-14',
    name: 'Annual Governance Training & Attestation',
    trigger: 'The annual Board training/attestation cycle is due or a new member requires onboarding.',
    forms: ['GB-FORM-TRAINING-ATTESTATION'],
  },
];

export const GV_WORKFLOW_BY_ID: Record<GvWorkflowId, GvWorkflowDef> = Object.fromEntries(
  GV_WORKFLOWS.map((w) => [w.id, w]),
) as Record<GvWorkflowId, GvWorkflowDef>;

/** Core recurring QAPI-linked workflows every quarterly case must exercise. */
export const QUARTERLY_CORE_WORKFLOWS: GvWorkflowId[] = ['GV-WF-05', 'GV-WF-06', 'GV-WF-07', 'GV-WF-08', 'GV-WF-09'];

/** Workflows a quarterly case must be able to exercise (core, plus any applicable triggered ones are added by the case author). */
export function requiredForQuarter(_quarter: Quarter): GvWorkflowId[] {
  return QUARTERLY_CORE_WORKFLOWS;
}

/** The annual/FY2026 capstone must exercise all 14 workflows. */
export function requiredForAnnual(): GvWorkflowId[] {
  return [...ALL_GV_WORKFLOW_IDS];
}

export interface CoverageAssertion {
  covered: boolean;
  missing: GvWorkflowId[];
}

/** Asserts that every required workflow appears in the activated set. */
export function assertWorkflowCoverage(activated: readonly GvWorkflowId[], required: readonly GvWorkflowId[]): CoverageAssertion {
  const activatedSet = new Set(activated);
  const missing = required.filter((w) => !activatedSet.has(w));
  return { covered: missing.length === 0, missing };
}
