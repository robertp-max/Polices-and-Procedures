export type EventTaskSource = 'processFlow' | 'requiredForm' | 'approval' | 'manual' | 'generated';
export type EventTaskSourceType = EventTaskSource | 'minutes';

export type EventTaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'awaiting_signature'
  | 'completed'
  | 'cancelled';

export interface EventInstance {
  eventId: string;
  sourceEventId: string;
  scheduledDate: string;
  generatedFrom: 'mandated' | 'manual' | 'workflow' | 'user' | 'system';
  status: 'scheduled' | 'in_progress' | 'completed' | 'certified' | 'cancelled';
  lockState: 'unlocked' | 'locked' | 'certified';
  certificationState?: {
    certifiedAt?: string;
    certifiedBy?: string;
    certificationId?: string;
  };
  certificationSnapshot?: {
    tasks: EventTask[];
    forms: Array<{ formId: string; status: string }>;
    evidence: Array<{ evidenceId: string; taskId: string; objectPath: string; checksum: string }>;
    timestamp: string;
  };
  folderPath: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface EventTask {
  id: string;
  eventId: string;
  taskSourceId: string;
  taskSourceType: EventTaskSourceType;
  isRequired: boolean;
  requirementSource: 'policy' | 'workflow' | 'regulation' | 'system';
  workflowId?: string;
  policyIds: string[];
  formIds: string[];
  title: string;
  description?: string;
  source: EventTaskSource;
  status: EventTaskStatus;
  ownerRole?: string;
  ownerUserId?: string;
  dueDate?: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
  blockedReason?: string;
  completionBlockedReason?: string;
  evidenceIds?: string[];
  evidenceCount?: number;
  requiredEvidenceSatisfied?: boolean;
  requiredFormsSatisfied?: boolean;
}

export interface EventExecutionAuditEvent {
  auditId: string;
  eventId: string;
  entityType: 'eventInstance' | 'task' | 'formInstance' | 'evidence' | 'approval';
  entityId: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  timestamp: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  recordVersion: number;
  prevHash?: string;
  currentHash?: string;
}

export type FormInstanceStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SIGNATURE_REQUESTED'
  | 'SIGNED'
  | 'LOCKED'
  | 'SUPERSEDED';

export interface EventFormInstance {
  /** Stable ID: FI-{eventId}-{formId}-{padded_sequence} */
  id: string;
  eventId: string;
  formId: string;
  taskId?: string;
  requirementId?: string;
  policyIds: string[];
  workflowId?: string;
  folderPath: string;
  status: FormInstanceStatus;
  sequence: number;
  createdAt: string;
  updatedAt?: string;
}
