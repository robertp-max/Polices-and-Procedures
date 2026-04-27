import type { RegulatoryEvent } from './regulatoryEvents';
import { normalizeEventLevelProcessFlow } from './eventWorkflowAlignment';

export type AlignmentClassification =
  | 'legitimate_event_level_execution'
  | 'missing_workflow_link'
  | 'context_marker_only'
  | 'needs_manual_review';

interface EventAlignmentPolicy {
  classification: AlignmentClassification;
  workflowId?: string;
  alignmentExceptionReason?: string;
}

const missingWorkflowLink = (workflowId: string): EventAlignmentPolicy => ({
  classification: 'missing_workflow_link',
  workflowId,
});

const EVENT_ALIGNMENT_POLICY: Record<string, EventAlignmentPolicy> = {
  agency_holiday: {
    classification: 'context_marker_only',
    alignmentExceptionReason: 'Non-executable holiday/context marker.',
  },

  bbp_training:                    missingWorkflowLink('HR-WF-07'),
  billing_hold_review:             missingWorkflowLink('CO-WF-25'),
  claims_submission:               missingWorkflowLink('FN-WF-04'),
  clinical_record_audit:           missingWorkflowLink('CL-WF-29'),
  coi_disclosure:                  missingWorkflowLink('GV-WF-08'),
  competency_validation:           missingWorkflowLink('HR-WF-19'),
  competency_validation_biennial:  missingWorkflowLink('CL-WF-25'),
  complaint_investigation:         missingWorkflowLink('CL-WF-23'),
  compliance_comprehensive_review: missingWorkflowLink('QA-WF-11'),
  compliance_effectiveness_biennial: missingWorkflowLink('QA-WF-11'),
  compliance_effectiveness_review: missingWorkflowLink('CO-WF-01'),
  compliance_report_monthly:       missingWorkflowLink('CO-WF-20'),
  denial_management_review:        missingWorkflowLink('FN-WF-05'),
  employee_compliance_training:    missingWorkflowLink('HR-WF-07'),
  enterprise_risk_assessment:      missingWorkflowLink('RM-WF-15'),
  ep_exercise:                     missingWorkflowLink('RM-WF-05'),
  ep_plan_review:                  missingWorkflowLink('RM-WF-03'),
  ep_staff_training:               missingWorkflowLink('RM-WF-04'),
  episode_review:                  missingWorkflowLink('CL-WF-30'),
  external_compliance_review:      missingWorkflowLink('QA-WF-11'),
  governance_packet_review:        missingWorkflowLink('GV-WF-01'),
  governing_body_meeting:          missingWorkflowLink('GV-WF-01'),
  governing_body_minutes:          missingWorkflowLink('GV-WF-01'),
  governing_body_prep:             missingWorkflowLink('GV-WF-01'),
  hha_aide_inservice:              missingWorkflowLink('CL-WF-11'),
  hha_aide_observation:            missingWorkflowLink('HR-WF-19'),
  hha_skill_observation:           missingWorkflowLink('HR-WF-19'),
  hhcahps_filing:                  missingWorkflowLink('QA-WF-08'),
  hipaa_training:                  missingWorkflowLink('CO-WF-09'),
  incident_report:                 missingWorkflowLink('QA-WF-05'),
  infection_control_review:        missingWorkflowLink('QA-WF-06'),
  infection_control_review_quarterly: missingWorkflowLink('QA-WF-06'),
  oig_sam_exclusion_check:         missingWorkflowLink('CO-WF-15'),
  physician_signatures:            missingWorkflowLink('CL-WF-06'),
  policy_framework_review:         missingWorkflowLink('EN-WF-02'),
  policy_review_annual:            missingWorkflowLink('EN-WF-02'),
  qapi_annual_eval:                missingWorkflowLink('QA-WF-10'),
  qapi_dashboard_refresh:          missingWorkflowLink('QA-WF-02'),
  qapi_meeting:                    missingWorkflowLink('QA-WF-03'),
  risk_management_committee:       missingWorkflowLink('RM-WF-01'),
  security_incidents_review:       missingWorkflowLink('IT-WF-09'),
  security_risk_analysis:          missingWorkflowLink('IT-WF-01'),
  sentinel_event_rca:              missingWorkflowLink('QA-WF-05'),
  survey_activation:               missingWorkflowLink('CO-WF-05'),
  system_activity_review:          missingWorkflowLink('IT-WF-24'),
  vulnerability_scan:              missingWorkflowLink('IT-WF-13'),

  compliance_report_weekly: {
    classification: 'legitimate_event_level_execution',
    alignmentExceptionReason: 'Weekly ops snapshot event is not represented as a single canonical workflow.',
  },
  oig_workplan_review: {
    classification: 'legitimate_event_level_execution',
    alignmentExceptionReason: 'Composite governance checkpoint spanning CO-WF-15, CO-WF-16, and CO-WF-08.',
  },
  risk_mitigation_plan: {
    classification: 'legitimate_event_level_execution',
    alignmentExceptionReason: 'Cross-workflow mitigation checkpoint (risk + infection + compliance) with no 1:1 workflow.',
  },
  strategic_assessment: {
    classification: 'legitimate_event_level_execution',
    alignmentExceptionReason: 'Board-level strategic synthesis event aggregates multiple governance/compliance workflows.',
  },
};

export function applyEventAlignmentPolicy(event: RegulatoryEvent): RegulatoryEvent {
  const policy = event.eventSubType
    ? EVENT_ALIGNMENT_POLICY[event.eventSubType]
    : undefined;

  const next: RegulatoryEvent = { ...event };

  if (policy?.workflowId && !next.workflowId) {
    next.workflowId = policy.workflowId;
    next.alignmentClassification = 'missing_workflow_link';
  } else if (policy?.classification) {
    next.alignmentClassification = policy.classification;
  }

  if (!next.workflowId) {
    const isContextMarker = next.isContext === true
      || policy?.classification === 'context_marker_only';

    if (isContextMarker) {
      next.alignmentException = true;
      next.alignmentClassification = 'context_marker_only';
      next.alignmentExceptionReason =
        policy?.alignmentExceptionReason
        || 'Context marker only; no executable workflow required.';
    } else if (policy?.classification === 'legitimate_event_level_execution') {
      next.alignmentException = true;
      next.alignmentExceptionReason =
        policy.alignmentExceptionReason
        || 'Legitimate event-level execution; no canonical 1:1 workflow available.';
    } else if (!next.alignmentClassification) {
      next.alignmentClassification = 'needs_manual_review';
    }

    if (next.alignmentException && next.processFlow.length > 0) {
      next.processFlow = normalizeEventLevelProcessFlow(
        next.id,
        next.processFlow,
        next.ownerRole || next.owner || '',
      );
    }
  }

  return next;
}

export function getEventAlignmentPolicy(
  eventSubType?: string,
): EventAlignmentPolicy | undefined {
  if (!eventSubType) return undefined;
  return EVENT_ALIGNMENT_POLICY[eventSubType];
}
