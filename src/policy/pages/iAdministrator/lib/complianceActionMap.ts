import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { WORKFLOWS } from '@/policy/data/workflows.generated';

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
    triggerTerms: ['incident report', 'event report', 'adverse event', 'report an incident', 'incident'],
    emergencyTriggers: ['serious incident', 'critical event'],
    escalationTriggers: ['report an incident', 'event report'],
    exclusionTerms: [],
    relatedPolicyIds: ['QA-AE-001', 'CL-CD-001'],
    relatedFormIds: [],
    relatedWorkflowIds: [],
    requiredActions: [
      { text: 'Capture objective incident facts immediately.', priority: 'high', actionType: 'document', required: true, roleScope: 'all' },
      { text: 'Notify supervisor and determine patient, employee, or compliance escalation pathway.', priority: 'high', actionType: 'notify', required: true, roleScope: 'supervisor' },
      { text: 'Document immediate containment and follow-up actions.', priority: 'medium', actionType: 'evidence', required: true, roleScope: 'all' },
    ],
    recommendedTasks: [
      'Open the adverse event reporting policy.',
      'Determine whether this incident also triggers complaint, abuse, fall, medication, or security workflows.',
    ],
    evidenceToCapture: [
      'Date and time of incident',
      'Who observed or reported it',
      'Immediate patient or staff impact',
      'Notifications and follow-up actions',
    ],
    needsMappings: [
      {
        id: 'PATIENT-INCIDENT-REPORT',
        title: 'Patient Incident Report',
        type: 'form',
      },
      {
        id: 'INCIDENT-REVIEW-WORKFLOW',
        title: 'Incident Review Workflow',
        type: 'workflow',
      },
    ],
  },
  complaint_grievance: {
    id: 'complaint_grievance',
    label: 'Complaint / Grievance',
    escalationLevel: 'high',
    triggerTerms: ['complaint', 'grievance', 'dissatisfied', 'patient rights', 'resolution letter', 'escalate complaint'],
    emergencyTriggers: [],
    escalationTriggers: ['grievance', 'escalate complaint'],
    exclusionTerms: [],
    relatedPolicyIds: ['OP-PA-001', 'CL-PR-001', 'GV-PM-005'],
    relatedFormIds: ['CL-FM-049', 'GV-FM-025'],
    relatedWorkflowIds: ['CL-WF-23'],
    requiredActions: [
      { text: 'Log complaint or grievance within intake timeframe.', priority: 'high', actionType: 'document', required: true, roleScope: 'all' },
      { text: 'Acknowledge receipt and route to grievance owner.', priority: 'high', actionType: 'notify', required: true, roleScope: 'supervisor' },
      { text: 'Investigate findings and document corrective action and resolution.', priority: 'medium', actionType: 'workflow', required: true, roleScope: 'compliance' },
    ],
    recommendedTasks: [
      'Open the patient complaint documentation form.',
      'Start the patient complaint / grievance handling workflow.',
      'Track closure timing and written resolution requirements.',
    ],
    evidenceToCapture: [
      'Complainant name and contact method',
      'Detailed statement of issue and affected service dates',
      'Investigation notes and staff statements',
      'Written acknowledgment and final resolution',
    ],
  },
  infection_control_exposure: {
    id: 'infection_control_exposure',
    label: 'Infection Control / Exposure',
    escalationLevel: 'high',
    triggerTerms: ['infection exposure', 'blood exposure', 'needle stick', 'needlestick', 'ppe', 'mrsa', 'c diff', 'exposure incident', 'infection control', 'bloodborne', 'contagious'],
    emergencyTriggers: ['blood exposure', 'needlestick'],
    escalationTriggers: ['infection exposure', 'contagious'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-SD-016', 'CL-CD-001'],
    relatedFormIds: ['CL-FM-021', 'QA-FM-006', 'HR-FM-014'],
    relatedWorkflowIds: ['CL-WF-14', 'CL-WF-32'],
    requiredActions: [
      { text: 'Apply immediate exposure precautions and point-of-care protocol.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'clinician' },
      { text: 'Notify Infection Preventionist or supervisor promptly.', priority: 'high', actionType: 'notify', required: true, roleScope: 'clinician' },
      { text: 'Log exposure event and document follow-up actions.', priority: 'medium', actionType: 'document', required: true, roleScope: 'clinician' },
    ],
    recommendedTasks: [
      'Open the infection precautions checklist.',
      'Open the surveillance log if the case is reportable or trending.',
      'Review exposure-response audit steps if cluster or repeated events are emerging.',
    ],
    evidenceToCapture: [
      'Exposure date, route, and people involved',
      'Precautions implemented and PPE used',
      'Supervisor or Infection Preventionist notification',
      'Follow-up monitoring, line list, or occupational health documentation',
    ],
  },
  missed_visit: {
    id: 'missed_visit',
    label: 'Missed Visit',
    escalationLevel: 'high',
    triggerTerms: ['missed visit', 'patient not home', 'not home', 'refused visit', 'unable to reach patient', 'lupa', 'visit frequency'],
    emergencyTriggers: [],
    escalationTriggers: ['missed visit', 'unable to reach patient'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-SD-024', 'FN-CM-005', 'CL-CD-001'],
    relatedFormIds: ['CL-FM-011', 'CL-FM-048', 'CL-FM-053'],
    relatedWorkflowIds: ['CL-WF-20', 'CL-WF-36'],
    requiredActions: [
      { text: 'Document missed visit and reason same day.', priority: 'high', actionType: 'document', required: true, roleScope: 'clinician' },
      { text: 'Notify case manager or physician when clinically material.', priority: 'high', actionType: 'notify', required: true, roleScope: 'rn' },
      { text: 'Reschedule and assess utilization or LUPA risk.', priority: 'medium', actionType: 'workflow', required: true, roleScope: 'admin' },
    ],
    recommendedTasks: [
      'Open the missed visit documentation form.',
      'Start missed visit management workflow.',
      'Review utilization audit if there is a pattern or billing exposure.',
    ],
    evidenceToCapture: [
      'Reason for missed visit',
      'Reschedule efforts and outcome',
      'Physician or case-manager notification',
      'Any billing or LUPA risk follow-up',
    ],
  },
  medication_issue: {
    id: 'medication_issue',
    label: 'Medication Issue',
    escalationLevel: 'high',
    triggerTerms: ['medication error', 'wrong dose', 'medication issue', 'med reconciliation', 'reconciliation', 'adverse drug', 'medication change', 'missed medication', 'drug reaction', 'mar'],
    emergencyTriggers: ['adverse drug', 'wrong dose'],
    escalationTriggers: ['medication error', 'drug reaction'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-SD-012', 'CL-SD-013', 'CL-CD-001'],
    relatedFormIds: ['CL-FM-018', 'CL-FM-019', 'CL-FM-022'],
    relatedWorkflowIds: ['CL-WF-07', 'CL-WF-12', 'CL-WF-31'],
    requiredActions: [
      { text: 'Reconcile medication issue against current orders and administration reality.', priority: 'high', actionType: 'document', required: true, roleScope: 'rn' },
      { text: 'Notify physician immediately for urgent discrepancy or adverse effects.', priority: 'critical', actionType: 'notify', required: true, roleScope: 'rn' },
      { text: 'Document communication, follow-up, and caregiver education.', priority: 'medium', actionType: 'evidence', required: true, roleScope: 'clinician' },
    ],
    recommendedTasks: [
      'Open the medication reconciliation worksheet.',
      'Start medication management workflow.',
      'Review physician orders workflow if an order change is needed.',
    ],
    evidenceToCapture: [
      'Medication name, dose, route, and issue identified',
      'Patient symptoms, vitals, and assessment findings',
      'Physician communication and orders received',
      'Education given to patient or caregiver',
    ],
  },
  fall_event: {
    id: 'fall_event',
    label: 'Fall Event',
    escalationLevel: 'high',
    triggerTerms: ['fall', 'fell', 'slipped', 'found on floor', 'post fall', 'head strike', 'patient fell', 'client had a fall', 'client slipped in bathroom', 'slipped in bathroom'],
    emergencyTriggers: ['head strike', 'loss of consciousness'],
    escalationTriggers: ['fall', 'post fall'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-SD-015', 'QA-AE-001', 'CL-CD-001'],
    relatedFormIds: ['CL-FM-020'],
    relatedWorkflowIds: ['CL-WF-34'],
    requiredActions: [
      { text: 'Assess patient immediately for injury and transport need.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'clinician' },
      { text: 'Call 911 for unstable or high-risk post-fall findings.', priority: 'critical', actionType: 'emergency', required: true, roleScope: 'clinician' },
      { text: 'Notify physician and document event with follow-up.', priority: 'high', actionType: 'notify', required: true, roleScope: 'rn' },
    ],
    recommendedTasks: [
      'Open fall risk assessment tool.',
      'Review post-event hospitalization or ED follow-up if transfer occurred.',
      'Document the event and reassess fall-prevention controls.',
    ],
    evidenceToCapture: [
      'Date, time, and circumstances of the fall',
      'Immediate injury assessment and vital signs',
      'Whether 911, physician, or supervisor were notified',
      'Post-fall plan, diagnostics, or care changes',
    ],
    needsMappings: [
      {
        id: 'PATIENT-FALL-INCIDENT-REPORT',
        title: 'Patient Fall Incident Report',
        type: 'form',
      },
      {
        id: 'POST-FALL-REVIEW-WORKFLOW',
        title: 'Post-Fall Review Workflow',
        type: 'workflow',
      },
    ],
  },
  wound_change: {
    id: 'wound_change',
    label: 'Wound Change',
    escalationLevel: 'high',
    triggerTerms: ['wound', 'ulcer', 'pressure injury', 'drainage', 'non healing', 'deterioration', 'wound change'],
    emergencyTriggers: ['sepsis', 'necrosis'],
    escalationTriggers: ['non healing', 'deterioration', 'drainage'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-SD-011', 'CL-CD-001'],
    relatedFormIds: ['CL-FM-017'],
    relatedWorkflowIds: ['CL-WF-13'],
    requiredActions: [
      { text: 'Assess and document objective wound status change.', priority: 'high', actionType: 'document', required: true, roleScope: 'clinician' },
      { text: 'Escalate concerning deterioration to physician or supervisor promptly.', priority: 'high', actionType: 'notify', required: true, roleScope: 'rn' },
      { text: 'Document interventions, photos where consented, and follow-up plan.', priority: 'medium', actionType: 'evidence', required: true, roleScope: 'clinician' },
    ],
    recommendedTasks: [
      'Open the wound assessment flow sheet.',
      'Start wound care workflow review.',
      'Update specialty care documentation and physician communication.',
    ],
    evidenceToCapture: [
      'Wound measurements and change from baseline',
      'Drainage, odor, tissue appearance, and pain findings',
      'Physician communication and any new orders',
      'Photos or supporting visit documentation when available',
    ],
  },
  documentation_gap: {
    id: 'documentation_gap',
    label: 'Documentation Gap',
    escalationLevel: 'high',
    triggerTerms: ['missing documentation', 'documentation gap', 'late entry', 'unsigned', 'missing note', 'incomplete chart', 'documentation deficiency', 'charting issue'],
    emergencyTriggers: [],
    escalationTriggers: ['documentation gap', 'missing documentation', 'incomplete chart'],
    exclusionTerms: [],
    relatedPolicyIds: ['CL-CD-001', 'CO-DC-002', 'CO-DC-003'],
    relatedFormIds: ['CL-FM-033', 'CO-FM-021', 'CO-FM-023'],
    relatedWorkflowIds: ['CL-WF-09', 'CL-WF-28', 'CO-WF-14'],
    requiredActions: [
      { text: 'Identify missing, late, unsigned, or misaligned documentation scope.', priority: 'high', actionType: 'document', required: true, roleScope: 'clinician' },
      { text: 'Correct record through approved amendment/deficiency process only.', priority: 'high', actionType: 'workflow', required: true, roleScope: 'clinician' },
      { text: 'Escalate billing-impacting or systemic gaps to compliance review.', priority: 'medium', actionType: 'escalation', required: true, roleScope: 'compliance' },
    ],
    recommendedTasks: [
      'Open late entry / amendment form.',
      'Open documentation alignment audit tool.',
      'Review documentation workflow and corrective audit steps.',
    ],
    evidenceToCapture: [
      'Missing or defective document list',
      'Amendment or late-entry record',
      'Deficiency tracker entries',
      'Billing, compliance, or clinician follow-up actions',
    ],
  },
  suspected_abuse_neglect: {
    id: 'suspected_abuse_neglect',
    label: 'Suspected Abuse / Neglect',
    escalationLevel: 'immediate',
    triggerTerms: ['abuse', 'neglect', 'exploitation', 'unsafe caregiver', 'caregiver hurt', 'mandatory report', 'aps', 'cps', 'unsafe', 'threat', 'threatening', 'weapons', 'weapon'],
    emergencyTriggers: ['immediate danger', 'assault'],
    escalationTriggers: ['abuse', 'neglect', 'mandatory report'],
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