export type LifecycleStatus =
  | 'Draft'
  | 'Under Review'
  | 'Revision Requested'
  | 'Approved'
  | 'Rejected'
  | 'Published'
  | 'Archived';

export type AccessTier =
  | 'Tier 1 - Public'
  | 'Tier 2 - Restricted'
  | 'Tier 3 - Confidential'
  | 'Tier 4 - Privileged';

export interface Domain {
  code: string;
  name: string;
  ownerSteward: string;
  description: string;
}

export interface Subdomain {
  id: string;
  domainCode: string;
  code: string;
  name: string;
  ownerSteward: string;
  reviewCycle: string;
  accessTier: string;
  description: string;
}

export interface Policy {
  id: string;
  domainCode: string;
  subdomainCode: string;
  title: string;
  tier: string;
  lifecycleStatus: LifecycleStatus;
  reviewCycle: string;
  ownerSteward: string;
  accessTier: string;
  description: string;
  currentVersion: string;
  sourceType: 'markdown' | 'placeholder' | 'html';
  contentRef: string | null;
  isPublished: boolean;
  publishedVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyVersion {
  policyId: string;
  version: string;
  lifecycleStatus: LifecycleStatus;
  isLocked: boolean;
  effectiveDate: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  supersedes: string | null;
  contentRef: string | null;
  changeSummary: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyContentSection {
  id: string;
  title: string;
  level: number;
  order: number;
  body: string;
  scormChunkHint: string;
}

export interface DraftChangeLogEntry {
  id: string;
  actor: string;
  timestamp: string;
  summary: string;
}

export interface DraftWorkspace {
  policyId: string;
  version: string;
  sections: PolicyContentSection[];
  changeLog: DraftChangeLogEntry[];
  unresolvedComments: string[];
  unsavedChanges: boolean;
  validationFlags: string[];
}

export interface ReviewComment {
  id: string;
  policyId: string;
  version: string;
  reviewer: string;
  timestamp: string;
  commentType: 'General' | 'Required' | 'Suggestion';
  selectedTextRef: string | null;
  suggestedRevision: string | null;
  resolutionStatus: 'Open' | 'Resolved' | 'Dismissed';
}

export interface ApprovalDecision {
  id: string;
  policyId: string;
  version: string;
  reviewer: string;
  decision: 'Approve' | 'Reject' | 'Request Revision';
  notes: string;
  timestamp: string;
}

export interface PublishJob {
  id: string;
  policyId: string;
  version: string;
  target: 'Print' | 'Google Drive' | 'SCORM';
  status: 'Queued' | 'Running' | 'Completed' | 'Failed';
  createdAt: string;
  createdBy: string;
}

export interface CalendarTask {
  id: string;
  linkedPolicyIds: string[];
  category: string;
  task: string;
  schedule: string;
  lastEvent: string;
  nextDate: string;
  status: 'On Track' | 'Warning' | 'Escalation' | 'Completed';
  responsible: string;
  overrideHistory: string[];
}

export interface UrgentTask {
  id: string;
  linkedPolicyIds: string[];
  module: string;
  task: string;
  schedule: string;
  deadline: string;
  status: 'Critical' | 'Escalation' | 'Warning' | 'Compliant';
  responsible: string;
  action: string;
}

export interface AuditTrailEvent {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  timestamp: string;
  reason: string;
  payload: Record<string, unknown>;
}

export interface PolicyContent {
  policyId: string;
  sourceType: 'markdown' | 'placeholder' | 'html';
  sections: PolicyContentSection[];
  sourceRef: string;
}

export interface PolicyAssignment {
  id: string;
  policyId: string;
  role: 'RN' | 'LVN' | 'Admin';
  trainingModuleId: string | null;
  attestationRequired: boolean;
  status: 'Assigned' | 'Completed' | 'Waived';
}
