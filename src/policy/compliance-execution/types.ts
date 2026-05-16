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
  /** Persisted pre-normalization id (debug / evidence remap). */
  legacyId?: string;
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
  /** Canonical CES form instance ids (aligned with `regulatoryExecutionStore` + PM projection). */
  generated_form_instance_ids?: string[];

  /* ─── CES Role Assignment (canonical — never null on new tasks) ─── */
  /** Authorized CES role responsible for executing this task. */
  assignedRole?: string;
  /** Ultimately accountable role (may differ from assignedRole). */
  accountableRole?: string;
  /** Role responsible for reviewing task quality/completeness. */
  reviewerRole?: string;
  /** Role authorized to approve / certify completion. */
  approverRole?: string;
  /** Roles that may mark this task complete. */
  canCompleteRoles?: readonly string[];
  /** Roles that may review this task. */
  canReviewRoles?: readonly string[];
  /** Roles that may approve / certify this task. */
  canApproveRoles?: readonly string[];
  /** Role that receives escalation when this task is overdue. */
  escalationRole?: string;

  /* ─── Signer task fields ─────────────────────────────────────── */
  /** When true, this task is a signer task generated from a required form. */
  isSignerTask?: boolean;
  /** The CES role assigned to sign (signer tasks only). */
  signerRole?: string;
  /** Parent form task ID (signer tasks only). */
  parentFormTaskId?: string;
  /** True when this task cannot complete until all signer tasks are signed. */
  blocksOnSignerTasks?: boolean;
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

  /* ─── MVP-P1-AUDIT-001 — top-level target dual-write (one release) ──
   * Per MVP plan L1208 ("AUDIT-001: dual-write `after.*` + top-level one
   * release"), audit consumers expect `targetKind` / `targetId` at the top
   * level of each audit row in addition to whatever lives under `after.*`.
   *
   * Wave 2 strategy:
   *   - Both fields are OPTIONAL so existing rows (persisted v4) remain valid.
   *   - `appendTaskAuditEvent` derives sane defaults from `entityType` /
   *     `entityId` (or from `opts.after.targetKind` / `opts.after.targetId`
   *     when present, e.g. SIGNATURE_REQUESTED) and writes BOTH places.
   *   - The hash chain is INTENTIONALLY NOT changed in this release: the
   *     canonicalization in `appendExecutionAudit` continues to omit these
   *     new fields so existing chains stay verifiable. Hash-schema bump to
   *     include them is a separate ticket (AUDIT-001 v2 — deferred).
   *   - Callers can still pass `after.targetKind` / `after.targetId` directly;
   *     when they do, the top-level fields mirror those values exactly.
   */
  targetKind?: string;
  targetId?: string;
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
  /** Stable ID: {eventId}-{formId}-{padded_sequence} */
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

  /* ─── MVP-P0-ECIGN-001 — supersede chain (Wave 3) ─────────────────
   * Form-instance supersede metadata. Written ONLY by the
   * `supersedeFormInstance` store action in regulatoryExecutionStore.ts
   * (single orchestrator-owned mutation path).
   *
   * Invariants:
   *   - A canonical (head-of-chain) instance: status !== 'SUPERSEDED'
   *     AND supersededBy === undefined.
   *   - A superseded instance: status === 'SUPERSEDED', supersededBy
   *     points to the row that replaced it, supersededAt set to ISO
   *     timestamp. Original row is NEVER deleted (audit defensibility).
   *   - The replacement row (newly created) has supersedes pointing
   *     back to the original row's id.
   *
   * Per MVP plan L1208 ("ECIGN-001 — legacy artifact fallback resolver
   * retained one release"): callers should prefer canonical-successor
   * resolution via `src/policy/compliance-execution/supersedeChain.ts`
   * helpers, falling back to legacy heuristics for rows missing chain
   * metadata.
   */
  /** Id of the instance this one replaces (filled when this row is a successor). */
  supersedes?: string;
  /** Id of the instance that replaced this one (filled when this row was superseded). */
  supersededBy?: string;
  /** ISO timestamp when this row was superseded. */
  supersededAt?: string;
}
