import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { Workflow } from '@/policy/types/workflow';
import type { SwimlanePhase } from './types';

const GENERIC = ['Preparation', 'Execution', 'Review', 'Approval / Signature', 'Evidence', 'Lock / Report'];
const QAPI = ['Pre-Meeting Preparation', 'Data / Packet Validation', 'Committee Review', 'Vote & Actions', 'Minutes & Signatures', 'Governing Body', 'Locked Package'];
const GOVERNANCE = ['Preparation', 'Committee / Board Review', 'Decision', 'Documentation', 'Approval / Signature', 'Evidence Lock'];
const CLINICAL = ['Clinical Trigger', 'Assessment / Review', 'Care Planning', 'Documentation', 'Clinical Manager Review', 'Evidence Lock'];
const COMPLIANCE = ['Regulatory Trigger', 'Document Review', 'Risk Review', 'Findings / Decision', 'Approval', 'Evidence Lock'];
const HR = ['Assignment / Trigger', 'Documentation', 'Review', 'Competency / Sign-off', 'Approval', 'Evidence Lock'];
const FINANCE = ['Preparation', 'Data / Report Review', 'Validation', 'Approval', 'Filing / Board Reporting', 'Evidence Lock'];
const OPERATIONS = ['Intake / Trigger', 'Operational Review', 'Execution', 'Supervisor Review', 'Documentation', 'Evidence Lock'];
const IT = ['Trigger / Request', 'Technical Review', 'Implementation', 'Validation', 'Approval', 'Audit Evidence'];
const RISK = ['Risk Trigger', 'Investigation / Assessment', 'RCA / CAP', 'Review', 'Approval', 'Closure / Evidence Lock'];
const ENTERPRISE = ['Trigger', 'Review', 'Control Update', 'Approval', 'Communication / Acknowledgment', 'Evidence Lock'];
const POLICY = ['Review Trigger', 'Draft / Update', 'Stakeholder Review', 'Approval', 'Acknowledgment', 'Evidence Lock'];
const EMERGENCY = ['Drill Preparation', 'Notification', 'Execution', 'After-Action Review', 'Corrective Action', 'Evidence Lock'];
const EVIDENCE = ['Requirement Identified', 'Evidence Collection', 'Validation', 'Review', 'Lock'];
const CAP = ['Issue Identified', 'RCA', 'CAP Plan', 'Implementation', 'Verification', 'Closure / Lock'];

function toPhases(titles: string[]): SwimlanePhase[] {
  return titles.map((title, index) => ({ id: `phase-${index + 1}`, title, order: index + 1 }));
}

export function inferPhaseTemplate(input: { event?: RegulatoryEvent; workflow?: Workflow }): SwimlanePhase[] {
  const event = input.event;
  const workflow = input.workflow;
  const haystack = [
    event?.title,
    event?.domain,
    event?.category,
    event?.eventSubType,
    event?.summary,
    workflow?.title,
    workflow?.workflowType,
    workflow?.processOverview,
  ].filter(Boolean).join(' ').toLowerCase();

  if (workflow?.domain === 'GV') return toPhases(GOVERNANCE);
  if (workflow?.domain === 'QA') return toPhases(QAPI);
  if (workflow?.domain === 'CL') return toPhases(CLINICAL);
  if (workflow?.domain === 'CO') return toPhases(COMPLIANCE);
  if (workflow?.domain === 'HR') return toPhases(HR);
  if (workflow?.domain === 'FN') return toPhases(FINANCE);
  if (workflow?.domain === 'OP') return toPhases(OPERATIONS);
  if (workflow?.domain === 'IT') return toPhases(IT);
  if (workflow?.domain === 'RM') return toPhases(RISK);
  if (workflow?.domain === 'EN') return toPhases(ENTERPRISE);
  if (/qapi|committee|govern|board|meeting/.test(haystack)) return toPhases(QAPI);
  if (/clinical|audit|record review|chart|oasis|clinical record/.test(haystack)) return toPhases(CLINICAL);
  if (/training|competenc|orientation|education/.test(haystack)) return toPhases(HR);
  if (/policy|acknowledg|revision|draft/.test(haystack)) return toPhases(POLICY);
  if (/emergency|drill|preparedness|after-action/.test(haystack)) return toPhases(EMERGENCY);
  if (/filing|submission|submit|reporting|claim|finance|billing|revenue/.test(haystack)) return toPhases(FINANCE);
  if (/evidence|artifact|package/.test(haystack)) return toPhases(EVIDENCE);
  if (/corrective|cap|root cause|rca|remediation/.test(haystack)) return toPhases(CAP);
  if (/compliance|regulatory|risk|hipaa|osha/.test(haystack)) return toPhases(COMPLIANCE);
  return toPhases(GENERIC);
}
