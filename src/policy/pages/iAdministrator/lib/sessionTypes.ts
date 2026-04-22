/**
 * Brad Session Types — Frontend Mirror
 * Mirrors server/ia/session/types.ts + server/ia/types.ts chat types.
 */

export type BradMode =
  | 'general'
  | 'emergency_response'
  | 'clinical_protocol'
  | 'policy_interpretation'
  | 'action_plan'
  | 'form_completion'
  | 'incident_reporting'
  | 'qapi_followup'
  | 'survey_readiness'
  | 'compliance_investigation'
  | 'context_assist';

export type BradUrgency = 'low' | 'moderate' | 'high' | 'critical';

export type IncidentType =
  | 'suspected_heart_attack'
  | 'stroke'
  | 'fall_with_injury'
  | 'medication_error'
  | 'abuse_allegation'
  | 'data_breach'
  | 'survey_event'
  | 'infection_control'
  | 'documentation_deficiency'
  | 'respiratory_emergency'
  | 'other';

export type CaseStatus = 'active' | 'resolved' | 'requires_followup' | 'closed';

export interface SessionSummary {
  threadId: string;
  mode: BradMode;
  urgency: BradUrgency;
  caseStatus: CaseStatus;
  caseTitle: string | null;
  caseSummary: string | null;
  detectedIncidentType: IncidentType | null;
  lifeSafetyFlag: boolean;
  escalationRequired: boolean;
  formsRequired: boolean;
  qapiTriggerPossible: boolean;
  immediateActions: string[];
  pendingTasks: string[];
  activePolicies: string[];
  activeForms: string[];
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatPhase1Event {
  threadId: string;
  mode: string;
  urgency: string;
  lifeSafetyFlag: boolean;
  incidentType: string | null;
  intent: string;
  chunkCount: number;
  topDocId: string | null;
}

import type { StructuredResponse } from './responseTypes.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'brad';
  content: string;
  timestamp: string;
  structuredResponse?: StructuredResponse;
}

export interface ChatRequest {
  threadId?: string;
  input: string;
  userRole?: string;
}

export interface ChatTurnResult {
  threadId: string;
  message: ChatMessage;
  sessionSummary: SessionSummary;
}

/* ── Mode display helpers ─────────────────────────────────────────── */

export const MODE_LABELS: Record<BradMode, string> = {
  general: 'General',
  emergency_response: 'Emergency Response',
  clinical_protocol: 'Clinical Protocol',
  policy_interpretation: 'Policy Interpretation',
  action_plan: 'Action Plan',
  form_completion: 'Form Completion',
  incident_reporting: 'Incident Reporting',
  qapi_followup: 'QAPI Follow-Up',
  survey_readiness: 'Survey Readiness',
  compliance_investigation: 'Compliance Investigation',
  context_assist: 'Context Assist',
};

export const URGENCY_COLORS: Record<BradUrgency, string> = {
  low: '#22C55E',
  moderate: '#C8A96E',
  high: '#EA580C',
  critical: '#DC2626',
};

export const MODE_COLORS: Record<BradMode, string> = {
  general: '#6B7280',
  emergency_response: '#DC2626',
  clinical_protocol: '#3B82F6',
  policy_interpretation: '#8B5CF6',
  action_plan: '#C8A96E',
  form_completion: '#10B981',
  incident_reporting: '#EA580C',
  qapi_followup: '#6366F1',
  survey_readiness: '#EF4444',
  compliance_investigation: '#DC2626',
  context_assist: '#0EA5E9',
};
