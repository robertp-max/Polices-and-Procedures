import type { CesCalendarEnrichment } from './cesCalendarEventBuilder.js';
import {
  deriveCesCompletionState,
  getCesExecutionState,
  type CesExecutionDefinition,
} from './cesExecutionStateStore.js';
import { getCesMetadataStore } from './cesMetadataStore.js';
import { store as ecignStore } from './ecign/store.js';
import { getRow } from './sync/eventStore.js';

/* ═══════════════════════════════════════════════════════════════
   Deterministic CES calendar completion model.
   Weighted formula (must NOT reach 100% without full execution):
     Tasks complete ............... 35%
     Required evidence attached ... 25%
     Required forms complete ...... 15%
     eCign / signatures complete .. 15%
     Audit / certification ........ 10%
   ═══════════════════════════════════════════════════════════════ */

export const COMPLETION_WEIGHTS = {
  tasks: 35,
  evidence: 25,
  forms: 15,
  ecign: 15,
  audit: 10,
} as const;

export type EcignStatusLabel =
  | 'Not started'
  | 'Missing canonical form instance'
  | 'In progress'
  | 'Complete'
  | 'Not required';

export type CalendarAttachmentStatusLabel = 'Attached' | 'Partial' | 'Not attached' | 'Unknown';

export interface CesExecutionSnapshot {
  completionPercent: number;
  breakdown: {
    tasksScore: number;
    evidenceScore: number;
    formsScore: number;
    ecignScore: number;
    auditScore: number;
  };
  evidenceCount: number;
  evidenceAttachedCount: number;
  requiredEvidenceCount: number;
  requiredFormsCount: number;
  formsCompleteCount: number;
  tasksCompleteCount: number;
  tasksTotalCount: number;
  ecignStatus: EcignStatusLabel;
  ecignDetail: string;
  calendarAttachmentStatus: CalendarAttachmentStatusLabel;
  driveLinked: boolean;
  driveFolderId?: string;
  driveFolderUrl?: string;
  auditReadyPercent: number;
  blockers: string[];
  statusLabel: 'Complete' | 'In progress' | 'Blocked' | 'Scheduled';
  googleEventId?: string | null;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function ratioScore(ratio: number, weight: number): number {
  if (weight <= 0) return 0;
  return clampPct(Math.min(1, Math.max(0, ratio)) * weight);
}

function normalizeEvidenceName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function evidenceMatchesRequired(fileName: string, required: string): boolean {
  const f = normalizeEvidenceName(fileName);
  const r = normalizeEvidenceName(required);
  return f.includes(r) || r.includes(f);
}

async function resolveEcignStatus(
  eventId: string,
  requiredSignerRoles?: string[],
): Promise<{ status: EcignStatusLabel; detail: string; score: number }> {
  if (!requiredSignerRoles?.length) {
    return { status: 'Not required', detail: 'No signer roles configured', score: COMPLETION_WEIGHTS.ecign };
  }

  const instances = await ecignStore.listInstances();
  const linked = instances.filter(inst => {
    const payload = inst as { event_id?: string; metadata?: { eventId?: string } };
    return payload.event_id === eventId || payload.metadata?.eventId === eventId;
  });

  const canonicalPattern = new RegExp(`^${eventId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-.+-\\d{3}$`);
  const canonical = linked.find(inst => canonicalPattern.test(inst.instance_id));

  if (!canonical) {
    return {
      status: 'Missing canonical form instance',
      detail: 'canonical form instance required',
      score: 0,
    };
  }

  if (canonical.state === 'signed_locked') {
    return { status: 'Complete', detail: 'eCign package signed and locked', score: COMPLETION_WEIGHTS.ecign };
  }

  const signatures = await ecignStore.listSignatures(canonical.instance_id);
  const requiredFields = (canonical.required_signers ?? []).filter(s => s.required !== false);
  const signedFields = new Set(signatures.map(s => s.field_id));
  const signedRequired = requiredFields.filter(f => signedFields.has(f.field_id)).length;
  const ratio = requiredFields.length > 0 ? signedRequired / requiredFields.length : 0;

  if (ratio <= 0) {
    return { status: 'Not started', detail: 'canonical form instance present; signatures pending', score: 0 };
  }

  return {
    status: 'In progress',
    detail: `${signedRequired}/${requiredFields.length} required signer slots complete`,
    score: ratioScore(ratio, COMPLETION_WEIGHTS.ecign),
  };
}

function resolveCalendarAttachmentStatus(
  evidenceItems: Array<{ attachmentStatus?: string }>,
): CalendarAttachmentStatusLabel {
  if (evidenceItems.length === 0) return 'Not attached';
  const attached = evidenceItems.filter(e => e.attachmentStatus === 'attached').length;
  if (attached === 0) return 'Not attached';
  if (attached >= evidenceItems.length) return 'Attached';
  return 'Partial';
}

const QAPI_TASK_ALIASES: Record<string, string[]> = {
  'Pull metrics': ['qapi-data'],
  'Assemble packet': ['qapi-packet'],
  'Hold committee meeting': ['qapi-meeting'],
  'Finalize minutes': ['qapi-minutes'],
  'Package GB summary': ['qapi-feed'],
};

const QAPI_FORM_ALIASES: Record<string, string[]> = {
  'QAPI Agenda': ['FRM-QA-001'],
  'QAPI Metrics Report': ['FRM-QA-002'],
  'Active PIP Status': ['FRM-QA-003'],
  'QAPI Meeting Minutes': ['FRM-QA-004', 'QA-FM-001'],
};

export function buildCesExecutionDefinition(enrichment: CesCalendarEnrichment): CesExecutionDefinition {
  return {
    eventId: enrichment.eventId,
    workflowId: enrichment.workflowId,
    requiredTasks: (enrichment.requiredTasks ?? []).map(label => ({
      id: label,
      label,
      aliases: enrichment.workflowId === 'TPL-QA-MONTHLY-QAPI' ? QAPI_TASK_ALIASES[label] : undefined,
    })),
    requiredForms: (enrichment.requiredForms ?? []).map(label => ({
      id: label,
      label,
      aliases: enrichment.workflowId === 'TPL-QA-MONTHLY-QAPI' ? QAPI_FORM_ALIASES[label] : undefined,
    })),
    requiredApprovals: (enrichment.requiredApprovals ?? []).map(rule => ({
      id: rule.id,
      label: rule.targetLabel,
      targetKind: rule.targetKind,
      approverRole: rule.approverRole,
      required: rule.required,
    })),
  };
}

/**
 * Load live execution snapshot for a CES event from metadata + store state.
 * Never fabricates completion — derives only from recorded evidence/ecign/store.
 */
export async function loadCesExecutionSnapshot(
  enrichment: CesCalendarEnrichment,
): Promise<CesExecutionSnapshot> {
  const eventId = enrichment.eventId;
  const evidenceItems = await getCesMetadataStore().listEvidence(eventId);
  const attachedItems = evidenceItems.filter(e => e.attachmentStatus === 'attached');
  const requiredEvidence = enrichment.requiredEvidence ?? [];
  const executionDefinition = buildCesExecutionDefinition(enrichment);
  const executionState = await getCesExecutionState(eventId);

  const matchedRequiredEvidence = requiredEvidence.filter(req =>
    attachedItems.some(item => evidenceMatchesRequired(item.fileName, req)),
  );

  const evidenceRatio = requiredEvidence.length > 0
    ? matchedRequiredEvidence.length / requiredEvidence.length
    : (attachedItems.length > 0 ? 1 : 0);

  const execution = deriveCesCompletionState(executionDefinition, executionState);
  const formsCompleteCount = execution.formsCompleteCount;
  const formsRatio = execution.formsTotalCount > 0 ? formsCompleteCount / execution.formsTotalCount : 0;
  const tasksCompleteCount = execution.tasksCompleteCount;
  const tasksRatio = execution.tasksTotalCount > 0 ? tasksCompleteCount / execution.tasksTotalCount : 0;

  const ecign = await resolveEcignStatus(eventId, enrichment.requiredSignerRoles);

  const auditReadyPercent = execution.auditReadyPercent;
  const auditScore = ratioScore(auditReadyPercent / 100, COMPLETION_WEIGHTS.audit);

  const tasksScore = ratioScore(tasksRatio, COMPLETION_WEIGHTS.tasks);
  const evidenceScore = ratioScore(evidenceRatio, COMPLETION_WEIGHTS.evidence);
  const formsScore = ratioScore(formsRatio, COMPLETION_WEIGHTS.forms);

  const completionPercent = clampPct(
    tasksScore + evidenceScore + formsScore + ecign.score + auditScore,
  );

  const row = getRow(eventId);
  const calendarAttachmentStatus = resolveCalendarAttachmentStatus(evidenceItems);
  const driveLinked = Boolean(enrichment.driveFolderId || enrichment.driveFolderUrl);

  let statusLabel: CesExecutionSnapshot['statusLabel'] = 'Scheduled';
  if (completionPercent >= 100 && ecign.status === 'Complete') statusLabel = 'Complete';
  else if (ecign.status === 'Missing canonical form instance' || calendarAttachmentStatus === 'Not attached') {
    statusLabel = 'Blocked';
  } else if (completionPercent > 0) statusLabel = 'In progress';

  return {
    completionPercent,
    breakdown: { tasksScore, evidenceScore, formsScore, ecignScore: ecign.score, auditScore },
    evidenceCount: evidenceItems.length,
    evidenceAttachedCount: attachedItems.length,
    requiredEvidenceCount: requiredEvidence.length,
    requiredFormsCount: execution.formsTotalCount,
    formsCompleteCount,
    tasksCompleteCount,
    tasksTotalCount: execution.tasksTotalCount,
    ecignStatus: ecign.status,
    ecignDetail: ecign.detail,
    calendarAttachmentStatus,
    driveLinked,
    driveFolderId: enrichment.driveFolderId,
    driveFolderUrl: enrichment.driveFolderUrl,
    auditReadyPercent,
    blockers: execution.blockers,
    statusLabel,
    googleEventId: row?.google_event_id ?? null,
  };
}
