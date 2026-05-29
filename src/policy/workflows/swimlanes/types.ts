import type { SignatureRequirement, SignatureTaskRecord } from '@/policy/ecign/types';

export type SwimlaneStatus =
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'needs_evidence'
  | 'needs_signature'
  | 'awaiting_reviewer'
  | 'board_ready'
  | 'complete'
  | 'locked'
  | 'blocked'
  | 'unavailable';

export type SwimlaneSourceType = 'custom' | 'workflow' | 'event' | 'generated' | 'fallback';
export type SwimlaneMode = 'template' | 'event_execution';

export interface SwimlanePhase {
  id: string;
  title: string;
  order: number;
}

export interface SwimlaneLane {
  id: string;
  title: string;
  roleKey?: string;
  order: number;
}

export interface SwimlaneNode {
  nodeId: string;
  taskId: string;
  workflowId?: string;
  eventId?: string;
  sourceStepId?: string;
  processFlowStepId?: string;
  phaseId: string;
  laneId: string;
  title: string;
  shortDescription: string;
  ownerRole: string;
  status: SwimlaneStatus;
  requiredForms: string[];
  formInstances?: SwimlaneFormInstance[];
  requiredEvidence: string[];
  supportingDocumentationTasks: SwimlaneSupportingDocumentationTask[];
  instructions: string[];
  signatureRequirements?: SignatureRequirement[];
  signatureTasks?: SignatureTaskRecord[];
  signerRole?: string;
  reviewerRole?: string;
  reviewerRoles?: string[];
  finalApproverRoles?: string[];
  governingBodyRequired?: boolean;
  artifactBlockedReasons?: string[];
  dependencies: string[];
  nextNodeIds: string[];
  auditPurpose: string;
  policyRefs?: string[];
  regulatoryRefs?: string[];
  sourceType: SwimlaneSourceType;
}

export interface SwimlaneSupportingDocumentationTask {
  id: string;
  supportTaskId: string;
  title: string;
  description: string;
  evidenceRequirementId: string;
  eventId?: string;
  parentTaskId: string;
  workflowId?: string;
  formId: string;
  formInstanceId?: string;
  status: SwimlaneStatus;
  required: boolean;
  artifactId?: string;
}

export interface SwimlaneFormInstance {
  formId: string;
  formTitle: string;
  formInstanceId?: string;
  status: SwimlaneStatus;
  missing: boolean;
  requiredAdditionalDocumentation: boolean;
  supportingDocumentation: SwimlaneSupportingDocumentationTask[];
}

export interface SwimlaneEdge {
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  route: 'orthogonal';
}

export interface SwimlaneModel {
  id: string;
  workflowId?: string;
  eventId?: string;
  title: string;
  description?: string;
  sourceType: SwimlaneSourceType;
  mode: SwimlaneMode;
  phases: SwimlanePhase[];
  lanes: SwimlaneLane[];
  nodes: SwimlaneNode[];
  edges: SwimlaneEdge[];
  requiredForms: string[];
  policyRefs: string[];
  evidenceRequirements: string[];
  missingContext?: string[];
  routePath?: string;
}

export interface SwimlaneBuildContext {
  eventId?: string;
  taskId?: string;
  mode?: SwimlaneMode;
}
