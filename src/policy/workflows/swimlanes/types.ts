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
  phaseId: string;
  laneId: string;
  title: string;
  shortDescription: string;
  ownerRole: string;
  status: SwimlaneStatus;
  requiredForms: string[];
  requiredEvidence: string[];
  signerRole?: string;
  reviewerRole?: string;
  dependencies: string[];
  nextNodeIds: string[];
  auditPurpose: string;
  policyRefs?: string[];
  regulatoryRefs?: string[];
  sourceType: SwimlaneSourceType;
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
