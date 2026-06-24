import { FORMS_DATASET } from '../data/formsLibraryDataset';
import { POLICY_CORPUS } from '../data/policyCorpus';
import { WORKFLOWS } from '../data/workflows.generated';

export type ComplianceScenarioId =
  | 'clinical_emergency'
  | 'incident_report'
  | 'complaint_grievance'
  | 'infection_control_exposure'
  | 'missed_visit'
  | 'medication_issue'
  | 'fall_event'
  | 'wound_change'
  | 'documentation_gap'
  | 'suspected_abuse_neglect'
  | 'data_security_incident';
// Note: additional human-first staff distress categories (STAFF_SEXUAL_BOUNDARY_VIOLATION etc.) are handled
// via the early router in mockBradEngine and synthetic classification in the frontend classifyScenario lib.
// They bypass the full COMPLIANCE_ACTION_MAP for clean human supervisor output.

export type ComplianceEscalationLevel = 'immediate' | 'urgent' | 'high' | 'routine';
export type MappingStatus = 'verified' | 'needs_mapping';
export type ScenarioArtifactType = 'policy' | 'form' | 'workflow';
export type ActionPriority = 'critical' | 'high' | 'medium' | 'routine';
export type ActionType = 'emergency' | 'notify' | 'document' | 'form' | 'workflow' | 'evidence' | 'escalation';
export type RoleScope = 'caregiver' | 'clinician' | 'rn' | 'supervisor' | 'admin' | 'compliance' | 'all';

export interface ComplianceRequiredAction {
  text: string;
  priority: ActionPriority;
  actionType: ActionType;
  required: boolean;
  roleScope: RoleScope;
}

export interface ScenarioArtifactLink {
  id: string;
  title: string;
  type: ScenarioArtifactType;
  status: MappingStatus;
}

export interface ComplianceActionDefinition {
  id: ComplianceScenarioId;
  label: string;
  escalationLevel: ComplianceEscalationLevel;
  triggerTerms: string[];
  emergencyTriggers: string[];
  escalationTriggers: string[];
  exclusionTerms: string[];
  relatedPolicyIds: string[];
  relatedFormIds: string[];
  relatedWorkflowIds: string[];
  requiredActions: ComplianceRequiredAction[];
  recommendedTasks: string[];
  evidenceToCapture: string[];
  needsMappings?: Array<{
    id: string;
    title: string;
    type: ScenarioArtifactType;
  }>;
}

export interface ResolvedComplianceActionDefinition extends ComplianceActionDefinition {
  relatedPolicies: ScenarioArtifactLink[];
  relatedForms: ScenarioArtifactLink[];
  relatedWorkflows: ScenarioArtifactLink[];
  needsMapping: ScenarioArtifactLink[];
}

const policyTitleById = new Map(POLICY_CORPUS.map(policy => [policy.id, policy.title]));
const formTitleById = new Map(FORMS_DATASET.map(form => [form.id, form.name]));
const workflowTitleById = new Map(Object.values(WORKFLOWS).map(workflow => [workflow.id, workflow.title]));

const PRIORITY_ORDER: Record<ActionPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  routine: 3,
};

function resolveLinks(ids: string[], type: ScenarioArtifactType): ScenarioArtifactLink[] {
  const titleById =
    type === 'policy'
      ? policyTitleById
      : type === 'form'
        ? formTitleById
        : workflowTitleById;

  return ids.map((id) => {
    const title = titleById.get(id);
    if (title) {
      return { id, title, type, status: 'verified' as const };
    }
    return {
      id,
      title: `Missing registry artifact: ${id}`,
      type,
      status: 'needs_mapping' as const,
    };
  });
}

function resolveNeedsMappings(
  items: ComplianceActionDefinition['needsMappings'],
): ScenarioArtifactLink[] {
  return (items ?? []).map(item => ({
    ...item,
    status: 'needs_mapping' as const,
  }));
}

export const COMPLIANCE_ACTION_MAP: Record<ComplianceScenarioId, ComplianceActionDefinition> = {
  clinical_emergency: {
    id: 'clinical_emergency',
    label: 'Clinical Emergency',
    escalationLevel: 'immediate',
    triggerTerms: [
      'vomiting blood',
      'blood in vomit',
      'coughing blood',
      'uncontrolled bleeding',
      'not breathing',
      'unconscious',
      'unresponsive',
      'injury',
      'injured',
      'accident',
      'chest pain',
      'trouble breathing',
      'confusion',
      'weakness',
      'fainting',
      'altered mental status',
      'severe distress',
      'hematemesis',
      'difficulty breathing',
      'active bleeding',
      'emergency',
    ],
    emergencyTriggers: [
      'vomiting blood',
      'blood in vomit',
      'coughing blood',
      'uncontrolled bleeding',
      'not breathing',
      'unconscious',
      'unresponsive',
      'chest pain',
      'trouble breathing',
      'fainting',
      'altered mental status',
      'severe distress',
    ],
    escalationTriggers: [
      'confusion',
      'weakness',
      'injury',
      'injured',
      'unstable condition',
      'call 911',
      'difficulty breathing',
    ],
    exclusionTerms: [
      'policy training only',
      'documentation example only',
    ],
    relatedPolicyIds: ['CL-PR-005', 'CL-CD-001', 'OP-SL-002'],
    relatedFormIds: ['CL-FM-043', 'OP-FM-020'],
    relatedWorkflowIds: ['CL-WF-07', 'CL-WF-34'],
    requiredActions: [
      {
        text: 'Tell caregiver to call 911 immediately if bleeding is active, severe, or patient has distress, weakness, confusion, chest pain, difficulty breathing, fainting, or unstable condition.',
        priority: 'critical',
        actionType: 'emergency',
        required: true,
        roleScope: 'caregiver',
      },
      {
        text: 'Notify RN/supervisor immediately and escalate the symptom report as emergency change in condition.',
        priority: 'critical',
        actionType: 'notify',
        required: true,
        roleScope: 'all',
      },
      {
        text: 'Instruct caregiver not to provide clinical advice or treatment outside scope while emergency response is in progress.',
        priority: 'high',
        actionType: 'escalation',
        required: true,
        roleScope: 'caregiver',
      },
      {
        text: 'Document the call, reported symptoms, time, caller, instructions given, and escalation notifications on the same day.',
        priority: 'high',
        actionType: 'document',
        required: true,
        roleScope: 'clinician',
      },
      {
        text: 'Complete incident or clinical escalation documentation when EMS transfer, ED visit, hospitalization, or significant event occurred.',
        priority: 'medium',
        actionType: 'form',
        required: true,
        roleScope: 'clinician',
      },
      {
        text: 'Capture evidence and task notes for timeline defensibility and downstream review.',
        priority: 'routine',
        actionType: 'evidence',
        required: true,
        roleScope: 'all',
      },
    ],
    recommendedTasks: [
      'Open the emergency/change-in-condition policy and review the escalation steps.',
      'Open the after-hours on-call log and record the call details.',
      'Review physician order workflow if a new order or follow-up direction is needed after the event.',
      'If the patient is transferred out, start post-event review and follow-up tracking.',
    ],
    evidenceToCapture: [
      'Time of the call and identity of the caregiver or caller',
      'Symptoms described, including any mention of blood, weakness, confusion, breathing difficulty, or distress',
      'Whether 911 or EMS was advised and whether emergency transport occurred',
      'RN / supervisor / physician notifications and response times',
      'Same-day charting or after-hours log entry with actions taken',
    ],
    needsMappings: [
      {
        id: 'CLINICAL-INCIDENT-REPORT-FORM',
        title: 'Clinical Incident Report Form',
        type: 'form',
      },
      {
        id: 'CLINICAL-ESCALATION-WORKFLOW',
        title: 'Clinical Escalation Workflow',
        type: 'workflow',
      },
      {
        id: 'EMERGENCY-CHANGE-IN-CONDITION-WORKFLOW',
        title: 'Emergency Change-in-Condition Workflow',
        type: 'workflow',
      },
    ],
  },
  incident_report: {
    id: 'incident_report',
    label: 'Incident Report',
    escalationLevel: 'urgent',
    triggerTerms: ['incident', 'fell', 'fall', 'injury', 'accident', 'near miss', 'event report'],
    emergencyTriggers: [],
    escalationTriggers: ['fell', 'injury', 'incident report'],
    exclusionTerms: [],
    relatedPolicyIds: ['RM-ER-001', 'RM-ER-002'],
    relatedFormIds: ['RM-FM-010'],
    relatedWorkflowIds: ['RM-WF-01'],
    requiredActions: [
      { text: 'Secure the scene and ensure immediate safety of patient and others.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'caregiver' },
      { text: 'Notify supervisor / on-call immediately.', priority: 'critical', actionType: 'notify', required: true, roleScope: 'all' },
      { text: 'Complete incident report form same day with objective facts only.', priority: 'high', actionType: 'form', required: true, roleScope: 'clinician' },
      { text: 'Document notifications, observations, and any witness statements.', priority: 'high', actionType: 'document', required: true, roleScope: 'clinician' },
    ],
    recommendedTasks: [
      'Open the incident report form and begin factual entry.',
      'Route completed report for supervisor review.',
      'Log in event calendar if applicable.',
    ],
    evidenceToCapture: [
      'Date/time/location of incident',
      'Persons involved and witnesses',
      'Objective description of what occurred',
      'Immediate actions taken and notifications',
    ],
  },
  complaint_grievance: {
    id: 'complaint_grievance',
    label: 'Complaint or Grievance',
    escalationLevel: 'urgent',
    triggerTerms: ['complaint', 'grievance', 'unhappy', 'dissatisfied', 'file a complaint', 'upset with care'],
    emergencyTriggers: [],
    escalationTriggers: ['complaint', 'grievance'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-PR-001', 'GV-GB-004'],
    relatedFormIds: ['CL-FM-020'],
    relatedWorkflowIds: ['CL-WF-05'],
    requiredActions: [
      { text: 'Acknowledge receipt to complainant within 24-48 hours.', priority: 'high', actionType: 'notify', required: true, roleScope: 'supervisor' },
      { text: 'Log grievance in tracking system with date and nature.', priority: 'high', actionType: 'document', required: true, roleScope: 'compliance' },
      { text: 'Investigate and respond per policy timeline (usually 7-10 days).', priority: 'high', actionType: 'workflow', required: true, roleScope: 'supervisor' },
    ],
    recommendedTasks: [
      'Open grievance log and record intake.',
      'Assign investigator and due date.',
      'Prepare written response for approval.',
    ],
    evidenceToCapture: [
      'Intake date and complainant contact',
      'Nature and details of complaint',
      'Investigation steps and resolution',
      'Final response copy and confirmation of delivery',
    ],
  },
  infection_control_exposure: {
    id: 'infection_control_exposure',
    label: 'Infection Control / Exposure',
    escalationLevel: 'urgent',
    triggerTerms: ['exposure', 'bloodborne', 'needle stick', 'tb', 'infection', 'ppe breach', 'body fluid'],
    emergencyTriggers: [],
    escalationTriggers: ['exposure', 'needle', 'blood'],
    exclusionTerms: [],
    relatedPolicyIds: ['CO-IR-101', 'CL-DC-101'],
    relatedFormIds: ['EN-FM-001'],
    relatedWorkflowIds: ['CL-WF-15'],
    requiredActions: [
      { text: 'Administer first aid for exposure site immediately.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'caregiver' },
      { text: 'Report exposure to supervisor and occupational health same shift.', priority: 'critical', actionType: 'notify', required: true, roleScope: 'all' },
      { text: 'Complete exposure incident report and follow testing protocol.', priority: 'high', actionType: 'form', required: true, roleScope: 'clinician' },
    ],
    recommendedTasks: [
      'Initiate post-exposure prophylaxis evaluation if indicated.',
      'Document source patient testing consent and results.',
    ],
    evidenceToCapture: [
      'Type of exposure and body fluid involved',
      'Time of exposure and PPE status',
      'Source patient info if known',
      'Follow-up testing and prophylaxis decisions',
    ],
  },
  missed_visit: {
    id: 'missed_visit',
    label: 'Missed Visit',
    escalationLevel: 'high',
    triggerTerms: ['missed visit', 'no show', 'did not arrive', 'failed to visit', 'visit skipped'],
    emergencyTriggers: [],
    escalationTriggers: ['missed', 'no show'],
    exclusionTerms: [],
    relatedPolicyIds: ['OP-SL-003', 'CL-PR-003'],
    relatedFormIds: ['OP-FM-015'],
    relatedWorkflowIds: ['OP-WF-12'],
    requiredActions: [
      { text: 'Attempt to contact patient/caregiver immediately and document attempts.', priority: 'high', actionType: 'notify', required: true, roleScope: 'clinician' },
      { text: 'Notify supervisor/scheduler within 1 hour of missed window.', priority: 'high', actionType: 'notify', required: true, roleScope: 'caregiver' },
      { text: 'Reschedule visit per protocol and complete missed visit report.', priority: 'medium', actionType: 'workflow', required: true, roleScope: 'clinician' },
    ],
    recommendedTasks: [
      'Update scheduling system with reason code.',
      'Review if pattern indicates need for care plan update.',
    ],
    evidenceToCapture: [
      'Scheduled vs actual time',
      'Contact attempts and outcomes',
      'Patient status on discovery',
      'Rescheduled appointment confirmation',
    ],
  },
  medication_issue: {
    id: 'medication_issue',
    label: 'Medication Issue',
    escalationLevel: 'urgent',
    triggerTerms: ['med error', 'wrong med', 'missed med', 'medication error', 'wrong dose', 'allergic reaction to med'],
    emergencyTriggers: ['allergic reaction', 'anaphylaxis'],
    escalationTriggers: ['med error', 'wrong med', 'missed med'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-DC-101', 'CO-IR-101'],
    relatedFormIds: ['EN-FM-001'],
    relatedWorkflowIds: ['CL-WF-09'],
    requiredActions: [
      { text: 'Assess patient immediately and call 911 if adverse reaction severe.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'caregiver' },
      { text: 'Notify RN, physician, and pharmacy as required.', priority: 'critical', actionType: 'notify', required: true, roleScope: 'clinician' },
      { text: 'Complete medication error report and hold further doses if indicated.', priority: 'high', actionType: 'form', required: true, roleScope: 'clinician' },
    ],
    recommendedTasks: [
      'Review MAR for accuracy and reconcile.',
      'Initiate QAPI medication review if recurrent.',
    ],
    evidenceToCapture: [
      'Drug name, dose, route, time ordered vs given',
      'Patient assessment and vital signs post error',
      'Notifications and orders received',
      'Corrective actions and patient outcome',
    ],
  },
  fall_event: {
    id: 'fall_event',
    label: 'Fall Event',
    escalationLevel: 'urgent',
    triggerTerms: ['fell', 'fall', 'found on floor', 'slipped', 'trip', 'unwitnessed fall'],
    emergencyTriggers: [],
    escalationTriggers: ['fell', 'fall'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-PR-004', 'RM-ER-001'],
    relatedFormIds: ['CL-FM-040'],
    relatedWorkflowIds: ['CL-WF-15'],
    requiredActions: [
      { text: 'Do not move patient if injury suspected. Assess ABCs and call 911 if needed.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'caregiver' },
      { text: 'Notify supervisor and physician immediately.', priority: 'critical', actionType: 'notify', required: true, roleScope: 'all' },
      { text: 'Complete post-fall assessment and incident report same shift.', priority: 'high', actionType: 'form', required: true, roleScope: 'clinician' },
      { text: 'Initiate fall precautions review and update care plan.', priority: 'high', actionType: 'workflow', required: true, roleScope: 'rn' },
    ],
    recommendedTasks: [
      'Complete neuro checks per protocol.',
      'Document environmental factors.',
    ],
    evidenceToCapture: [
      'Pre-fall activity and location',
      'Witness status and patient statements',
      'Injuries observed and neuro/vital findings',
      'Interventions and follow-up orders',
    ],
  },
  wound_change: {
    id: 'wound_change',
    label: 'Wound Change / Deterioration',
    escalationLevel: 'high',
    triggerTerms: ['wound worse', 'increased drainage', 'new odor', 'redness spreading', 'wound deterioration', 'stage increase'],
    emergencyTriggers: [],
    escalationTriggers: ['wound', 'drainage', 'infection sign'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-DC-101', 'CL-OA-101'],
    relatedFormIds: ['EN-FM-001'],
    relatedWorkflowIds: ['CL-WF-15'],
    requiredActions: [
      { text: 'Photograph wound with scale and date (per policy consent).', priority: 'high', actionType: 'document', required: true, roleScope: 'clinician' },
      { text: 'Notify physician and wound nurse of change.', priority: 'high', actionType: 'notify', required: true, roleScope: 'rn' },
      { text: 'Update wound care orders and document measurements.', priority: 'medium', actionType: 'workflow', required: true, roleScope: 'clinician' },
    ],
    recommendedTasks: [
      'Reassess dressing type and frequency.',
      'Enter wound as QAPI indicator if threshold met.',
    ],
    evidenceToCapture: [
      'Current vs prior measurements and appearance',
      'Drainage character and odor',
      'Surrounding skin and pain report',
      'New orders and care adjustments',
    ],
  },
  documentation_gap: {
    id: 'documentation_gap',
    label: 'Documentation Gap',
    escalationLevel: 'high',
    triggerTerms: ['missing note', 'not charted', 'no documentation', 'late entry', 'unsigned note'],
    emergencyTriggers: [],
    escalationTriggers: ['missing', 'gap', 'not documented'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-DC-101', 'CO-HP-101'],
    relatedFormIds: [],
    relatedWorkflowIds: ['CL-WF-15'],
    requiredActions: [
      { text: 'Locate source data and complete late entry per policy.', priority: 'high', actionType: 'document', required: true, roleScope: 'clinician' },
      { text: 'Flag for supervisor review if regulatory window at risk.', priority: 'medium', actionType: 'escalation', required: true, roleScope: 'supervisor' },
    ],
    recommendedTasks: [
      'Audit recent visits for similar gaps.',
      'Reinforce same-day documentation expectation.',
    ],
    evidenceToCapture: [
      'Gap description and dates affected',
      'Late entry correction with rationale',
      'Supervisor sign-off if required',
    ],
  },
  suspected_abuse_neglect: {
    id: 'suspected_abuse_neglect',
    label: 'Suspected Abuse or Neglect',
    escalationLevel: 'immediate',
    triggerTerms: ['abuse', 'neglect', 'bruising unexplained', 'patient says hit', 'unsafe environment', 'exploitation'],
    emergencyTriggers: ['immediate danger', 'active abuse'],
    escalationTriggers: ['abuse', 'neglect', 'suspected'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-PR-006', 'CL-PR-001', 'OP-PA-001'],
    relatedFormIds: ['CL-FM-030', 'CL-FM-053'],
    relatedWorkflowIds: ['CL-WF-22'],
    requiredActions: [
      { text: 'If patient is in immediate danger, call 911 and secure safety first.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'all' },
      { text: 'Notify supervisor immediately and follow mandatory reporting timelines.', priority: 'critical', actionType: 'notify', required: true, roleScope: 'clinician' },
      { text: 'Document objective findings and reporting actions without independent confrontation.', priority: 'high', actionType: 'document', required: true, roleScope: 'compliance' },
    ],
    recommendedTasks: [
      'Open abuse / neglect incident report.',
      'Start abuse / neglect reporting workflow.',
      'Document safety-plan and multidisciplinary follow-up notes.',
    ],
    evidenceToCapture: [
      'Objective observations and patient statements',
      'Immediate safety actions and whether 911 was called',
      'Supervisor, APS/CPS/law-enforcement, and physician notifications',
      'Safety plan and agency submission confirmations',
    ],
  },
  data_security_incident: {
    id: 'data_security_incident',
    label: 'Data Security Incident',
    escalationLevel: 'immediate',
    triggerTerms: ['security incident', 'breach', 'ransomware', 'phishing', 'malware', 'lost laptop', 'stolen laptop', 'unauthorized access', 'wrong email', 'sent phi', 'hack', 'cyber'],
    emergencyTriggers: ['ransomware', 'unauthorized access', 'sent phi'],
    escalationTriggers: ['security incident', 'breach', 'phishing'],
    exclusionTerms: [],
    relatedPolicyIds: ['IT-DR-005', 'CO-HP-003', 'CO-CA-001'],
    relatedFormIds: ['IT-FM-009', 'CO-FM-014', 'CO-FM-015', 'IT-FM-032'],
    relatedWorkflowIds: ['IT-WF-09'],
    requiredActions: [
      { text: 'Contain incident immediately by isolating affected systems or accounts.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'admin' },
      { text: 'Notify Security Officer, Privacy Officer, or incident lead immediately.', priority: 'critical', actionType: 'notify', required: true, roleScope: 'compliance' },
      { text: 'Document timeline, potential data impact, containment, and breach follow-up.', priority: 'high', actionType: 'document', required: true, roleScope: 'compliance' },
    ],
    recommendedTasks: [
      'Open IT security incident report form.',
      'Start IT security incident response workflow.',
      'Complete breach risk assessment if PHI may be involved.',
    ],
    evidenceToCapture: [
      'Incident timeline and detection source',
      'Affected system, account, or device',
      'Containment and eradication steps',
      'Potential PHI exposure, breach-risk assessment, and notification actions',
    ],
  },
};

export function getComplianceActionDefinition(
  scenarioId: ComplianceScenarioId,
): ResolvedComplianceActionDefinition {
  const definition = COMPLIANCE_ACTION_MAP[scenarioId];
  const relatedPolicies = resolveLinks(definition.relatedPolicyIds, 'policy');
  const relatedForms = resolveLinks(definition.relatedFormIds, 'form');
  const relatedWorkflows = resolveLinks(definition.relatedWorkflowIds, 'workflow');
  const inferredMissingMappings = [
    ...relatedPolicies.filter((item) => item.status === 'needs_mapping'),
    ...relatedForms.filter((item) => item.status === 'needs_mapping'),
    ...relatedWorkflows.filter((item) => item.status === 'needs_mapping'),
  ];
  const requiredActions = [...definition.requiredActions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  return {
    ...definition,
    requiredActions,
    relatedPolicies: relatedPolicies.filter((item) => item.status === 'verified'),
    relatedForms: relatedForms.filter((item) => item.status === 'verified'),
    relatedWorkflows: relatedWorkflows.filter((item) => item.status === 'verified'),
    needsMapping: [...inferredMissingMappings, ...resolveNeedsMappings(definition.needsMappings)],
  };
}
