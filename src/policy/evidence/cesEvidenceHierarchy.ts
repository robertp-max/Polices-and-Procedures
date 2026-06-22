import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EventExecutionAuditEvent } from '@/policy/compliance-execution/types';
import type { Task } from '@/policy/pm/types';
import type { ApprovalRequest, EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { isCesFutureLockedDate } from '@/policy/ces/cesExecutionMode';

export type ExecutionRequirementType =
  | 'FORM_COMPLETION'
  | 'SUPPORTING_EVIDENCE_UPLOAD'
  | 'SIGNATURE_REQUIRED'
  | 'REVIEW_REQUIRED'
  | 'CERTIFICATION_REQUIRED'
  | 'LOCK_REQUIRED';

export type ExecutionRequirementStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export type EvidencePackageState =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'PARTIAL_CERTIFICATION'
  | 'CERTIFIED'
  | 'LOCKED'
  | 'SUPERSEDED'
  | 'EXPIRED'
  | 'REJECTED';

export interface CesExecutionRequirement {
  requirement_id: string;
  task_id: string;
  event_id: string;
  policy_id: string;
  workflow_id: string;
  form_id?: string;
  form_instance_id?: string;
  evidence_id?: string;
  signer_id?: string;
  signature_id?: string;
  title: string;
  type: ExecutionRequirementType;
  status: ExecutionRequirementStatus;
  completionPercentage: number;
  weightPercentage: number;
  storyPoints?: number;
  assignedTo?: string;
  assignedRole?: string;
  dueDate?: string;
  auditTrailReferences: string[];
  actionNeeded: string;
}

export interface CesTaskWithExecutionRequirements {
  task: Task;
  storyPoints: number;
  weightedCompletionPercentage: number;
  auditReadinessPercentage: number;
  status: Task['status'];
  packageState: EvidencePackageState;
  isBlocked: boolean;
  requirements: CesExecutionRequirement[];
  linkedEvidence: EvidenceDoc[];
  orphanEvidence: EvidenceDoc[];
  pendingSignatures: number;
}

export interface HierarchyMetrics {
  totalEvents: number;
  totalTasks: number;
  totalExecutionRequirements: number;
  completedTasks: number;
  completedRequirements: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  completionPercentage: number;
  auditReadinessPercentage: number;
  requiredEvidenceCount: number;
  certifiedEvidenceCount: number;
  missingEvidenceCount: number;
  lockedEvidenceCount: number;
  pendingSignatureCount: number;
  blockedTaskCount: number;
}

export interface EventHierarchyNode {
  eventId: string;
  event: RegulatoryEvent | null;
  date: string;
  year: number;
  quarter: `Q1` | `Q2` | `Q3` | `Q4`;
  month: number;
  /**
   * True when the event falls in the future-locked window (Jul 2026+).
   * Future-locked nodes are still included in the hierarchy for display,
   * but their metrics are excluded from month/quarter/year rollups.
   */
  isFutureLocked: boolean;
  tasks: CesTaskWithExecutionRequirements[];
  orphanEvidence: EvidenceDoc[];
  metrics: HierarchyMetrics;
}

export interface MonthHierarchyNode {
  month: number;
  label: string;
  events: EventHierarchyNode[];
  metrics: HierarchyMetrics;
}

export interface QuarterHierarchyNode {
  quarter: `Q1` | `Q2` | `Q3` | `Q4`;
  months: MonthHierarchyNode[];
  metrics: HierarchyMetrics;
}

export interface YearHierarchyNode {
  year: number;
  quarters: QuarterHierarchyNode[];
  metrics: HierarchyMetrics;
}

export interface LeaderboardEntry {
  key: string;
  userOrRole: string;
  roleOrTeam?: string;
  storyPointsCompleted: number;
  evidencePackagesCertified: number;
  onTimeCompletionPercentage: number;
  overdueItems: number;
  rejectedEvidenceCount: number;
  auditPerfectEvents: number;
  performanceScore: number;
}

export interface CesHierarchyBuildResult {
  years: YearHierarchyNode[];
  orphanEvidenceGlobal: EvidenceDoc[];
  leaderboard: LeaderboardEntry[];
}

interface BuildInput {
  events: RegulatoryEvent[];
  tasks: Task[];
  evidenceByEvent: Record<string, EvidenceDoc[]>;
  approvals: ApprovalRequest[];
  auditByEvent: Record<string, EventExecutionAuditEvent[]>;
  nowISO?: string;
}

const REQUIREMENT_WEIGHTS: Record<ExecutionRequirementType, number> = {
  FORM_COMPLETION: 30,
  SUPPORTING_EVIDENCE_UPLOAD: 25,
  SIGNATURE_REQUIRED: 25,
  REVIEW_REQUIRED: 10,
  CERTIFICATION_REQUIRED: 10,
  LOCK_REQUIRED: 0,
};

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });

function safeDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function quarterForMonth(month: number): `Q1` | `Q2` | `Q3` | `Q4` {
  if (month <= 2) return 'Q1';
  if (month <= 5) return 'Q2';
  if (month <= 8) return 'Q3';
  return 'Q4';
}

function taskStoryPoints(task: Task): number {
  const points = typeof task.story_points === 'number' && task.story_points > 0 ? task.story_points : 1;
  return points;
}

function isEvidenceUsableForCompletion(doc: EvidenceDoc): boolean {
  return !['REJECTED', 'SUPERSEDED', 'RETAINED'].includes(doc.status);
}

/** Exclude e-signature system artifacts from the generic "supporting upload" slot so OPEN ARTIFACT binds to the real upload row. */
function isSupportingEvidenceAttachment(doc: EvidenceDoc): boolean {
  if (!isEvidenceUsableForCompletion(doc)) return false;
  if (doc.artifactType === 'signed_form_instance' || doc.artifactType === 'signed_certificate' || doc.artifactType === 'signed_package') {
    return false;
  }
  if (doc.kind === 'signed_form_instance' || doc.kind === 'signed_certificate' || doc.kind === 'signed_package') {
    return false;
  }
  return true;
}

function countApprovedSignatures(eventId: string, task: Task, approvals: ApprovalRequest[], linkedEvidence?: EvidenceDoc[]): number {
  const formId = 'form_id' in task ? task.form_id : undefined;
  const approvalCount = approvals.filter(ap =>
    ap.eventId === eventId
    && ap.status === 'approved'
    && (
      (formId && ap.targetKind === 'form' && ap.targetId === formId)
      || ap.targetKind === 'event'
      || ap.targetKind === 'report'
      || ap.targetKind === 'minutes'
    )
  ).length;
  const ecignSignatureCount = (linkedEvidence ?? []).filter(doc =>
    (doc.artifactType === 'signed_package' || doc.kind === 'signed_package')
    && doc.status === 'EVIDENCE_LOCKED'
    && (!formId || doc.linkedFormId === formId || (doc.formIds ?? []).includes(formId))
  ).length > 0 ? 1 : 0;
  return Math.max(approvalCount, ecignSignatureCount);
}

function requiredSignerTarget(task: Task): number {
  if ('required_signers' in task && Array.isArray(task.required_signers) && task.required_signers.length > 0) {
    return task.required_signers.length;
  }
  if ('form_id' in task && task.form_id) return 2;
  return 1;
}

function requirementStatusForCompletion(value: number, blocked = false): ExecutionRequirementStatus {
  if (blocked) return 'BLOCKED';
  if (value >= 100) return 'COMPLETED';
  if (value > 0) return 'IN_PROGRESS';
  return 'PENDING';
}

function weightedCompletion(requirements: CesExecutionRequirement[]): number {
  const sumWeights = requirements.reduce((acc, req) => acc + req.weightPercentage, 0) || 1;
  const completion = requirements.reduce((acc, req) => acc + ((req.completionPercentage / 100) * req.weightPercentage), 0);
  return Math.round((completion / sumWeights) * 100);
}

function packageStateForTask(
  requirements: CesExecutionRequirement[],
  linkedEvidence: EvidenceDoc[],
  hasRejectedEvidence: boolean,
): EvidencePackageState {
  if (hasRejectedEvidence) return 'REJECTED';
  if (linkedEvidence.some(doc => doc.status === 'SUPERSEDED')) return 'SUPERSEDED';
  if (linkedEvidence.some(doc => doc.status === 'EVIDENCE_LOCKED')) return 'LOCKED';
  const allComplete = requirements.every(req => req.completionPercentage >= 100);
  const anyProgress = requirements.some(req => req.completionPercentage > 0);
  const signatures = requirements.filter(req => req.type === 'SIGNATURE_REQUIRED');
  const signatureProgress = signatures.length > 0 && signatures.some(req => req.completionPercentage > 0 && req.completionPercentage < 100);
  if (allComplete) return 'CERTIFIED';
  if (signatureProgress) return 'PARTIAL_CERTIFICATION';
  if (anyProgress) return 'IN_PROGRESS';
  return 'DRAFT';
}

function sumMetrics(metricsList: HierarchyMetrics[]): HierarchyMetrics {
  const initial: HierarchyMetrics = {
    totalEvents: 0,
    totalTasks: 0,
    totalExecutionRequirements: 0,
    completedTasks: 0,
    completedRequirements: 0,
    totalStoryPoints: 0,
    completedStoryPoints: 0,
    completionPercentage: 0,
    auditReadinessPercentage: 0,
    requiredEvidenceCount: 0,
    certifiedEvidenceCount: 0,
    missingEvidenceCount: 0,
    lockedEvidenceCount: 0,
    pendingSignatureCount: 0,
    blockedTaskCount: 0,
  };
  const summed = metricsList.reduce((acc, item) => ({
    totalEvents: acc.totalEvents + item.totalEvents,
    totalTasks: acc.totalTasks + item.totalTasks,
    totalExecutionRequirements: acc.totalExecutionRequirements + item.totalExecutionRequirements,
    completedTasks: acc.completedTasks + item.completedTasks,
    completedRequirements: acc.completedRequirements + item.completedRequirements,
    totalStoryPoints: acc.totalStoryPoints + item.totalStoryPoints,
    completedStoryPoints: acc.completedStoryPoints + item.completedStoryPoints,
    completionPercentage: 0,
    auditReadinessPercentage: 0,
    requiredEvidenceCount: acc.requiredEvidenceCount + item.requiredEvidenceCount,
    certifiedEvidenceCount: acc.certifiedEvidenceCount + item.certifiedEvidenceCount,
    missingEvidenceCount: acc.missingEvidenceCount + item.missingEvidenceCount,
    lockedEvidenceCount: acc.lockedEvidenceCount + item.lockedEvidenceCount,
    pendingSignatureCount: acc.pendingSignatureCount + item.pendingSignatureCount,
    blockedTaskCount: acc.blockedTaskCount + item.blockedTaskCount,
  }), initial);
  summed.completionPercentage = summed.totalStoryPoints > 0
    ? Math.round((summed.completedStoryPoints / summed.totalStoryPoints) * 100)
    : 0;
  summed.auditReadinessPercentage = summed.totalExecutionRequirements > 0
    ? Math.round((summed.completedRequirements / summed.totalExecutionRequirements) * 100)
    : 0;
  return summed;
}

export function buildCesTaskRequirements(
  task: Task,
  eventId: string,
  policyId: string,
  workflowId: string,
  dueDate: string | undefined,
  linkedEvidence: EvidenceDoc[],
  approvals: ApprovalRequest[],
  auditRefs: string[],
): CesTaskWithExecutionRequirements {
  const storyPoints = taskStoryPoints(task);
  const reqs: CesExecutionRequirement[] = [];
  const addRequirement = (input: Omit<CesExecutionRequirement, 'requirement_id' | 'task_id' | 'event_id' | 'policy_id' | 'workflow_id' | 'auditTrailReferences'> & { suffix: string }) => {
    reqs.push({
      requirement_id: `${task.task_id}::${input.suffix}`,
      task_id: task.task_id,
      event_id: eventId,
      policy_id: policyId,
      workflow_id: workflowId,
      form_id: input.form_id,
      form_instance_id: input.form_instance_id,
      evidence_id: input.evidence_id,
      signer_id: input.signer_id,
      signature_id: input.signature_id,
      title: input.title,
      type: input.type,
      status: input.status,
      completionPercentage: input.completionPercentage,
      weightPercentage: input.weightPercentage,
      storyPoints,
      assignedTo: task.assignee || task.owner,
      assignedRole: task.owner,
      dueDate,
      auditTrailReferences: auditRefs,
      actionNeeded: input.actionNeeded,
    });
  };

  const formId = 'form_id' in task ? task.form_id : undefined;
  const formInstanceId = task.generated_form_instance_ids?.[0];
  const formCompletion = task.status === 'done'
    ? 100
    : (task.status === 'in_progress' || task.status === 'in_review' ? 50 : 0);
  if (formId) {
    addRequirement({
      suffix: 'form',
      title: `Complete required form ${formId}`,
      type: 'FORM_COMPLETION',
      status: requirementStatusForCompletion(formCompletion),
      completionPercentage: formCompletion,
      weightPercentage: REQUIREMENT_WEIGHTS.FORM_COMPLETION,
      form_id: formId,
      form_instance_id: formInstanceId,
      actionNeeded: formCompletion >= 100 ? 'No action needed' : (formInstanceId ? 'Open existing form instance and complete required fields' : 'Open form and complete required fields'),
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
   * SUPPORTING_EVIDENCE_UPLOAD — ONLY for non-form tasks.
   *
   * If the task has a form_id, the signed/locked form instance IS the
   * evidence. We DO NOT generate a redundant "upload supporting evidence"
   * requirement because:
   *   1. There is nothing to upload — the form is completed inside CES.
   *   2. It creates a fake task that says "missing evidence" forever.
   *   3. It blocks readiness scoring permanently for form-only tasks.
   *
   * For non-form tasks (e.g. meeting attachments, photo of facility) the
   * upload row is still required and supplies the canonical evidence.
   * ───────────────────────────────────────────────────────────────────── */
  const supportingPool = linkedEvidence.filter(isSupportingEvidenceAttachment);
  const supportingEvidenceId = supportingPool.find(d => d.kind === 'attachment' || d.kind === 'report')?.id
    ?? supportingPool[0]?.id;
  if (!formId) {
    const evidenceCompletion = supportingPool.length > 0 ? 100 : 0;
    addRequirement({
      suffix: 'evidence',
      title: 'Upload supporting evidence',
      type: 'SUPPORTING_EVIDENCE_UPLOAD',
      status: requirementStatusForCompletion(evidenceCompletion),
      completionPercentage: evidenceCompletion,
      weightPercentage: REQUIREMENT_WEIGHTS.SUPPORTING_EVIDENCE_UPLOAD,
      evidence_id: supportingEvidenceId,
      form_id: undefined,
      actionNeeded: evidenceCompletion >= 100 ? 'No action needed' : 'Upload required supporting evidence',
    });
  }

  const signerTarget = requiredSignerTarget(task);
  const signed = Math.min(signerTarget, countApprovedSignatures(eventId, task, approvals, linkedEvidence));
  const signatureCompletion = Math.round((signed / Math.max(1, signerTarget)) * 100);
  const signatureApprovalForRow = approvals.find(ap =>
    ap.eventId === eventId
    && ap.status !== 'approved'
    && (
      (formId && ap.targetKind === 'form' && ap.targetId === formId)
      || (ap.note?.includes(task.task_id) ?? false)
    ),
  ) ?? approvals.find(ap =>
    ap.eventId === eventId
    && formId
    && ap.targetKind === 'form'
    && ap.targetId === formId,
  );
  addRequirement({
    suffix: 'signature',
    title: signerTarget > 1 ? `Collect ${signerTarget} required signatures` : 'Collect required signature',
    type: 'SIGNATURE_REQUIRED',
    status: requirementStatusForCompletion(signatureCompletion),
    completionPercentage: signatureCompletion,
    weightPercentage: REQUIREMENT_WEIGHTS.SIGNATURE_REQUIRED,
    form_id: formId,
    signature_id: signatureApprovalForRow?.id,
    actionNeeded: signatureCompletion >= 100 ? 'No action needed' : 'Request missing signatures',
  });

  if (task.task_type === 'form_review' || task.task_type === 'approval') {
    const reviewCompletion = task.status === 'done' || task.status === 'in_review' ? 100 : 0;
    addRequirement({
      suffix: 'review',
      title: 'Review and approve submission',
      type: 'REVIEW_REQUIRED',
      status: requirementStatusForCompletion(reviewCompletion, task.status === 'blocked'),
      completionPercentage: reviewCompletion,
      weightPercentage: REQUIREMENT_WEIGHTS.REVIEW_REQUIRED,
      actionNeeded: reviewCompletion >= 100 ? 'No action needed' : 'Complete reviewer action',
    });
  }

  if (task.task_type === 'certification') {
    const certCompletion = task.status === 'done' ? 100 : 0;
    addRequirement({
      suffix: 'certification',
      title: 'Certification required',
      type: 'CERTIFICATION_REQUIRED',
      status: requirementStatusForCompletion(certCompletion, task.status === 'blocked'),
      completionPercentage: certCompletion,
      weightPercentage: REQUIREMENT_WEIGHTS.CERTIFICATION_REQUIRED,
      actionNeeded: certCompletion >= 100 ? 'No action needed' : 'Complete certification step',
    });
  }

  const usableEvidence = linkedEvidence.filter(isEvidenceUsableForCompletion);

  // Normalize weights to 100 for task-specific requirement set.
  const totalWeight = reqs.reduce((acc, req) => acc + req.weightPercentage, 0) || 1;
  const normalizedReqs = reqs.map(req => ({ ...req, weightPercentage: Math.round((req.weightPercentage / totalWeight) * 100) }));
  const completion = weightedCompletion(normalizedReqs);

  // Audit readiness excludes pure operational form progress and focuses on review/evidence/signatures/certification/lock.
  const readinessReqs = normalizedReqs.filter(req => req.type !== 'FORM_COMPLETION');
  const auditReadiness = readinessReqs.length > 0 ? weightedCompletion(readinessReqs) : completion;
  const hasRejectedEvidence = linkedEvidence.some(doc => doc.status === 'REJECTED');
  const packageState = packageStateForTask(normalizedReqs, linkedEvidence, hasRejectedEvidence);
  const isBlocked = task.status === 'blocked' || normalizedReqs.some(req => req.status === 'BLOCKED');
  const pendingSignatures = Math.max(0, signerTarget - signed);

  return {
    task,
    storyPoints,
    weightedCompletionPercentage: completion,
    auditReadinessPercentage: auditReadiness,
    status: task.status,
    packageState,
    isBlocked,
    requirements: normalizedReqs,
    linkedEvidence: usableEvidence,
    orphanEvidence: [],
    pendingSignatures,
  };
}

function eventMetrics(tasks: CesTaskWithExecutionRequirements[], orphanEvidence: EvidenceDoc[]): HierarchyMetrics {
  const totalStoryPoints = tasks.reduce((acc, task) => acc + task.storyPoints, 0);
  const completedStoryPoints = tasks.reduce((acc, task) => acc + ((task.weightedCompletionPercentage / 100) * task.storyPoints), 0);
  const totalRequirements = tasks.reduce((acc, task) => acc + task.requirements.length, 0);
  const completedRequirements = tasks.reduce((acc, task) => acc + task.requirements.filter(req => req.completionPercentage >= 100).length, 0);
  const requiredEvidenceCount = tasks.reduce((acc, task) => acc + task.requirements.filter(req => req.type === 'SUPPORTING_EVIDENCE_UPLOAD').length, 0);
  const certifiedEvidenceCount = tasks.filter(task => task.packageState === 'CERTIFIED' || task.packageState === 'LOCKED').length;
  const missingEvidenceCount = tasks.reduce((acc, task) => acc + task.requirements.filter(req => req.type === 'SUPPORTING_EVIDENCE_UPLOAD' && req.completionPercentage < 100).length, 0);
  const lockedEvidenceCount = tasks.reduce((acc, task) => acc + task.linkedEvidence.filter(doc => doc.status === 'EVIDENCE_LOCKED').length, 0);
  const pendingSignatureCount = tasks.reduce((acc, task) => acc + task.pendingSignatures, 0);
  const blockedTaskCount = tasks.filter(task => task.isBlocked).length;
  const completionPercentage = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;
  const auditReadinessPercentage = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;
  return {
    totalEvents: 1,
    totalTasks: tasks.length,
    totalExecutionRequirements: totalRequirements,
    completedTasks: tasks.filter(task => task.weightedCompletionPercentage >= 100).length,
    completedRequirements,
    totalStoryPoints,
    completedStoryPoints: Math.round(completedStoryPoints),
    completionPercentage,
    auditReadinessPercentage,
    requiredEvidenceCount,
    certifiedEvidenceCount,
    missingEvidenceCount,
    lockedEvidenceCount,
    pendingSignatureCount,
    blockedTaskCount: blockedTaskCount + orphanEvidence.length,
  };
}

function leaderboardFromEvents(events: EventHierarchyNode[], now: Date): LeaderboardEntry[] {
  const byOwner = new Map<string, LeaderboardEntry & { completedCount: number; totalCount: number }>();
  for (const eventNode of events) {
    for (const task of eventNode.tasks) {
      const owner = task.task.assignee
        || task.task.owner
        || ('assigned_user_id' in task.task ? task.task.assigned_user_id : undefined)
        || 'Unassigned';
      const key = owner;
      const current = byOwner.get(key) ?? {
        key,
        userOrRole: owner,
        roleOrTeam: task.task.owner,
        storyPointsCompleted: 0,
        evidencePackagesCertified: 0,
        onTimeCompletionPercentage: 0,
        overdueItems: 0,
        rejectedEvidenceCount: 0,
        auditPerfectEvents: 0,
        performanceScore: 0,
        completedCount: 0,
        totalCount: 0,
      };
      current.totalCount += 1;
      const due = safeDate(task.task.due_date);
      const onTime = task.weightedCompletionPercentage >= 100 && due && due.getTime() >= now.getTime();
      if (task.weightedCompletionPercentage >= 100) {
        current.storyPointsCompleted += task.storyPoints;
        current.completedCount += 1;
      }
      if (onTime) current.onTimeCompletionPercentage += 1;
      if (due && due.getTime() < now.getTime() && task.weightedCompletionPercentage < 100) current.overdueItems += 1;
      if (task.packageState === 'CERTIFIED' || task.packageState === 'LOCKED') current.evidencePackagesCertified += 1;
      if (task.packageState === 'REJECTED') current.rejectedEvidenceCount += 1;
      if (eventNode.metrics.auditReadinessPercentage >= 100 && eventNode.metrics.missingEvidenceCount === 0) {
        current.auditPerfectEvents += 1;
      }
      byOwner.set(key, current);
    }
  }
  return Array.from(byOwner.values()).map(entry => {
    const onTimeCompletionPercentage = entry.completedCount > 0
      ? Math.round((entry.onTimeCompletionPercentage / entry.completedCount) * 100)
      : 0;
    const certificationBonus = entry.evidencePackagesCertified * 3;
    const zeroDefectBonus = entry.rejectedEvidenceCount === 0 ? 5 : 0;
    const onTimeBonus = Math.round(onTimeCompletionPercentage / 10);
    const overduePenalty = entry.overdueItems * 2;
    const rejectedEvidencePenalty = entry.rejectedEvidenceCount * 3;
    const performanceScore =
      entry.storyPointsCompleted
      + certificationBonus
      + zeroDefectBonus
      + onTimeBonus
      - overduePenalty
      - rejectedEvidencePenalty;
    return {
      key: entry.key,
      userOrRole: entry.userOrRole,
      roleOrTeam: entry.roleOrTeam,
      storyPointsCompleted: entry.storyPointsCompleted,
      evidencePackagesCertified: entry.evidencePackagesCertified,
      onTimeCompletionPercentage,
      overdueItems: entry.overdueItems,
      rejectedEvidenceCount: entry.rejectedEvidenceCount,
      auditPerfectEvents: entry.auditPerfectEvents,
      performanceScore,
    };
  }).sort((a, b) => b.performanceScore - a.performanceScore);
}

export function buildCesEvidenceHierarchy(input: BuildInput): CesHierarchyBuildResult {
  const now = safeDate(input.nowISO) ?? new Date();
  const eventsById = new Map(input.events.map(event => [event.id, event]));
  const eventTaskMap = new Map<string, Task[]>();
  for (const task of input.tasks) {
    if (task.source !== 'CES' && task.source !== 'ces') continue;
    const list = eventTaskMap.get(task.event_id) ?? [];
    list.push(task);
    eventTaskMap.set(task.event_id, list);
  }

  const eventNodes: EventHierarchyNode[] = [];
  const globalOrphans: EvidenceDoc[] = [];

  for (const [eventId, tasks] of eventTaskMap.entries()) {
    const event = eventsById.get(eventId) ?? null;
    const dateFromEvent = safeDate(event?.date || tasks[0]?.due_date || now.toISOString()) ?? now;
    const year = dateFromEvent.getFullYear();
    const month = dateFromEvent.getMonth();
    const quarter = quarterForMonth(month);
    const eventEvidence = input.evidenceByEvent[eventId] ?? [];
    const taskIds = new Set(tasks.map(task => task.task_id));
    const policyDefault = event?.policyRefs?.[0] || tasks[0]?.policy_id || '';
    const workflowDefault = event?.workflowId || tasks[0]?.workflow_id || '';
    const auditRefs = (input.auditByEvent[eventId] ?? []).slice(0, 10).map(a => a.auditId);
    const orphanEvidence = eventEvidence.filter(doc => !doc.taskId || !taskIds.has(doc.taskId));
    globalOrphans.push(...orphanEvidence);

    const extendedTasks = tasks.map(task => {
      const linkedEvidence = eventEvidence.filter(doc => doc.taskId === task.task_id);
      const policyId = task.policy_id || policyDefault;
      const workflowId = task.workflow_id || workflowDefault;
      return buildCesTaskRequirements(
        task,
        eventId,
        policyId,
        workflowId,
        task.due_date,
        linkedEvidence,
        input.approvals,
        auditRefs,
      );
    });

    const isFutureLocked = isCesFutureLockedDate(dateFromEvent.toISOString());
    const metrics = eventMetrics(extendedTasks, orphanEvidence);
    eventNodes.push({
      eventId,
      event,
      date: dateFromEvent.toISOString(),
      year,
      quarter,
      month,
      isFutureLocked,
      tasks: extendedTasks,
      orphanEvidence,
      metrics,
    });
  }

  // Include events with evidence but no CES tasks, still tracked as orphan bucket.
  for (const [eventId, evidence] of Object.entries(input.evidenceByEvent)) {
    if (eventTaskMap.has(eventId)) continue;
    if (evidence.length === 0) continue;
    const event = eventsById.get(eventId) ?? null;
    const dateFromEvent = safeDate(event?.date || now.toISOString()) ?? now;
    const isFutureLocked = isCesFutureLockedDate(dateFromEvent.toISOString());
    const year = dateFromEvent.getFullYear();
    const month = dateFromEvent.getMonth();
    const quarter = quarterForMonth(month);
    const metrics: HierarchyMetrics = {
      totalEvents: 1,
      totalTasks: 0,
      totalExecutionRequirements: 0,
      completedTasks: 0,
      completedRequirements: 0,
      totalStoryPoints: 0,
      completedStoryPoints: 0,
      completionPercentage: 0,
      auditReadinessPercentage: 0,
      requiredEvidenceCount: 0,
      certifiedEvidenceCount: 0,
      missingEvidenceCount: 0,
      lockedEvidenceCount: evidence.filter(doc => doc.status === 'EVIDENCE_LOCKED').length,
      pendingSignatureCount: 0,
      blockedTaskCount: evidence.length,
    };
    eventNodes.push({
      eventId,
      event,
      date: dateFromEvent.toISOString(),
      year,
      quarter,
      month,
      isFutureLocked,
      tasks: [],
      orphanEvidence: evidence,
      metrics,
    });
    globalOrphans.push(...evidence);
  }

  const yearsMap = new Map<number, YearHierarchyNode>();
  for (const eventNode of eventNodes) {
    if (!yearsMap.has(eventNode.year)) {
      yearsMap.set(eventNode.year, { year: eventNode.year, quarters: [], metrics: sumMetrics([]) });
    }
    const yearNode = yearsMap.get(eventNode.year)!;
    const quarterNode: QuarterHierarchyNode = yearNode.quarters.find(q => q.quarter === eventNode.quarter) || (() => {
      const q: QuarterHierarchyNode = { quarter: eventNode.quarter, months: [], metrics: sumMetrics([]) };
      yearNode.quarters.push(q);
      return q;
    })();
    const monthNode: MonthHierarchyNode = quarterNode.months.find(month => month.month === eventNode.month) || (() => {
      const monthLabel = monthFormatter.format(new Date(eventNode.year, eventNode.month, 1));
      const m: MonthHierarchyNode = { month: eventNode.month, label: monthLabel, events: [], metrics: sumMetrics([]) };
      quarterNode.months.push(m);
      return m;
    })();
    monthNode.events.push(eventNode);
  }

  const years = Array.from(yearsMap.values())
    .sort((a, b) => a.year - b.year)
    .map(yearNode => {
      yearNode.quarters = yearNode.quarters
        .sort((a, b) => a.quarter.localeCompare(b.quarter))
        .map(quarterNode => {
          quarterNode.months = quarterNode.months
            .sort((a, b) => a.month - b.month)
            .map(monthNode => {
              monthNode.events = monthNode.events.sort((a, b) => a.date.localeCompare(b.date));
              // Exclude future-locked events from metric rollups; they remain in .events for display.
              const activeEvents = monthNode.events.filter(e => !e.isFutureLocked);
              monthNode.metrics = sumMetrics(activeEvents.map(event => event.metrics));
              return monthNode;
            });
          quarterNode.metrics = sumMetrics(quarterNode.months.map(month => month.metrics));
          return quarterNode;
        });
      yearNode.metrics = sumMetrics(yearNode.quarters.map(quarter => quarter.metrics));
      return yearNode;
    });

  const leaderboard = leaderboardFromEvents(eventNodes, now);
  return {
    years,
    orphanEvidenceGlobal: globalOrphans,
    leaderboard,
  };
}
