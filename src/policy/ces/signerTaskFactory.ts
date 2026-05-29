/* ═══════════════════════════════════════════════════════════════
   CES Signer Task Factory
   ---------------------------------------------------------------
   Generates deterministic signer tasks for every required form
   that has one or more required signers.

   Signer Task ID format:
     [EVENT_ID]::[FORM_ID]::SIGNER::[SIGNER_ROLE]

   Example:
     EVT-QAPI-2026-01::QA-FM-001::SIGNER::DON
     EVT-QAPI-2026-01::QA-FM-001::SIGNER::Administrator

   Rules:
   - IDs are deterministic and unique per (eventId + formId + signerRole).
   - No duplicate signer tasks for same event + form + signer role.
   - Parent form task cannot complete until all signer tasks are completed.
   - Event cannot be certified until all signer tasks are completed.
   ═══════════════════════════════════════════════════════════════ */

import type { CesRole } from './cesRoles';
import { buildCesRoleAssignment, resolveCesRole } from './cesRoles';
import type { EventTask } from '@/policy/compliance-execution/types';
import { resolveCanonicalSignaturePath } from '@/policy/ecign/signaturePathResolver';
import { buildDeterministicSignatureTaskId } from '@/policy/ecign/signatureTaskBuilder';

/* ─── Signer Task metadata ────────────────────────────────── */

export interface CesSignerTask {
  /** Deterministic ID: [eventId]::[formId]::SIGNER::[signerRole] */
  id:                string;
  kind:              'SIGNER_TASK';
  eventId:           string;
  formId:            string;
  workflowId?:       string;
  sprintId?:         string;
  /** The parent form task this signer task belongs to. */
  parentFormTaskId:  string;
  signerRole:        CesRole;
  /** Display title shown in My Tasks, Sprint Board, etc. */
  title:             string;
  status:            'pending' | 'signed' | 'overdue';
  signedAt?:         string;
  dueDate?:          string;
  /** Full role assignment block (inherits from parent form task context). */
  roleAssignment:    {
    assignedRole:     CesRole;
    accountableRole:  CesRole;
    reviewerRole:     CesRole;
    approverRole:     CesRole;
    canCompleteRoles: readonly CesRole[];
    canReviewRoles:   readonly CesRole[];
    canApproveRoles:  readonly CesRole[];
    escalationRole:   CesRole;
  };
  /** Evidence requirement: form is not satisfied until this signer signs. */
  blocksFormCompletion: true;
  /** Event cannot be certified until this is signed. */
  blocksEventCertification: true;
  createdAt: string;
  updatedAt: string;
}

/* ─── Deterministic ID builder ───────────────────────────── */

/** Builds the canonical signer task ID. Never use any other format. */
export function buildSignerTaskId(
  eventId: string,
  workflowId: string | undefined,
  parentTaskId: string,
  formId: string,
  signerRole: string,
  signatureSlot = 'primary-signature',
): string {
  return buildDeterministicSignatureTaskId({
    eventId,
    workflowId,
    parentTaskId,
    formId,
    signatureSlot,
    signerRole: resolveCesRole(signerRole),
  });
}

/* ─── Signer role list per form / default signers ───────── */

/**
 * Default required signers when a form doesn't specify them explicitly.
 * Override by providing `requiredSignerRoles` on the form config.
 */
const DEFAULT_SIGNER_ROLES: CesRole[] = ['DON', 'Administrator'];

/** Roles that always require a signature on approval-type forms. */
const APPROVAL_SIGNER_ROLES: CesRole[] = ['Administrator', 'Governing Body'];

/** Governance-domain forms require Governing Body signature. */
const GOVERNANCE_SIGNER_ROLES: CesRole[] = ['Governing Body', 'Administrator'];

export function resolveSignerRoles(
  formId:     string,
  taskSourceType: string,
  domain?:    string,
  explicitRoles?: readonly string[],
): CesRole[] {
  if (explicitRoles && explicitRoles.length > 0) {
    return explicitRoles.map(r => resolveCesRole(r));
  }
  if (taskSourceType === 'approval') return APPROVAL_SIGNER_ROLES;
  if (domain === 'governance')       return GOVERNANCE_SIGNER_ROLES;

  // Finance/billing forms
  const fid = formId.toLowerCase();
  if (fid.includes('fin') || fid.includes('bill') || fid.includes('payroll')) {
    return ['Accounting', 'Administrator'];
  }

  return DEFAULT_SIGNER_ROLES;
}

/* ─── Signer task generator ──────────────────────────────── */

export interface SignerTaskInput {
  eventId:        string;
  formId:         string;
  parentFormTask: EventTask;
  domain?:        string;
  workflowId?:    string;
  sprintId?:      string;
  /** Explicit signer roles from the form definition. */
  explicitSignerRoles?: readonly string[];
}

/**
 * Generates all signer tasks for a single form+event combination.
 * Returns an empty array if no form ID is provided.
 * Deduplication by (eventId + formId + signerRole) is guaranteed by deterministic IDs.
 */
export function generateSignerTasksForForm(input: SignerTaskInput): CesSignerTask[] {
  const { eventId, formId, parentFormTask, domain, workflowId, sprintId, explicitSignerRoles } = input;
  if (!formId || !eventId) return [];
  const path = resolveCanonicalSignaturePath({
    domain,
    workflowId,
    eventId,
    parentTaskId: parentFormTask.id,
    title: parentFormTask.title,
    description: parentFormTask.description,
    ownerRole: parentFormTask.ownerRole,
    forms: [{ formId, formInstanceId: parentFormTask.generated_form_instance_ids?.[0] }],
    approvals: [],
  });
  const signerRoles = path.signatureTasks.length > 0
    ? path.signatureTasks.map(task => resolveCesRole(task.signerRole))
    : resolveSignerRoles(
        formId,
        parentFormTask.taskSourceType,
        domain,
        explicitSignerRoles,
      );

  const now = new Date().toISOString();

  return signerRoles.map((signerRole, index) => {
    const matchedTask = path.signatureTasks[index];
    const id = buildSignerTaskId(
      eventId,
      workflowId,
      parentFormTask.id,
      formId,
      signerRole,
      matchedTask?.signatureSlot ?? `slot-${index + 1}`,
    );
    const ra = buildCesRoleAssignment({
      domain,
      taskSourceType: 'requiredForm',
      ownerRole:      signerRole,
    });

    return {
      id,
      kind:                   'SIGNER_TASK' as const,
      eventId,
      formId,
      workflowId,
      sprintId,
      parentFormTaskId:        parentFormTask.id,
      signerRole,
      title:                   `Sign: ${parentFormTask.title} — ${signerRole}`,
      status:                  matchedTask?.status === 'signed' ? 'signed' as const : 'pending' as const,
      dueDate:                 parentFormTask.dueDate,
      roleAssignment:          ra,
      blocksFormCompletion:    true as const,
      blocksEventCertification: true as const,
      createdAt:               now,
      updatedAt:               now,
    };
  });
}

/**
 * Generates all signer tasks for a batch of form tasks.
 * Only operates on tasks with taskSourceType === 'requiredForm' or tasks with formIds.
 * Deduplicates by deterministic ID.
 */
export function generateAllSignerTasks(
  formTasks:   EventTask[],
  domain?:     string,
  sprintId?:   string,
): CesSignerTask[] {
  const seen  = new Set<string>();
  const tasks: CesSignerTask[] = [];

  for (const task of formTasks) {
    const formIds = task.formIds ?? [];
    if (formIds.length === 0 && task.taskSourceType !== 'requiredForm') continue;

    const effectiveFormIds = formIds.length > 0 ? formIds : [task.taskSourceId];
    for (const formId of effectiveFormIds) {
      const signerTasks = generateSignerTasksForForm({
        eventId:       task.eventId,
        formId,
        parentFormTask: task,
        domain,
        workflowId:    task.workflowId,
        sprintId,
      });

      for (const st of signerTasks) {
        if (!seen.has(st.id)) {
          seen.add(st.id);
          tasks.push(st);
        }
      }
    }
  }

  return tasks;
}

/* ─── Completion gate helpers ────────────────────────────── */

/**
 * Returns true when all signer tasks for a given form task are signed.
 * Used to gate form task completion.
 */
export function areAllSignerTasksComplete(
  formTaskId:  string,
  signerTasks: readonly CesSignerTask[],
): boolean {
  const related = signerTasks.filter(st => st.parentFormTaskId === formTaskId);
  if (related.length === 0) return true; // no signers required
  return related.every(st => st.status === 'signed');
}

/**
 * Returns true when all signer tasks for a given event are signed.
 * Used to gate event certification.
 */
export function areAllEventSignerTasksComplete(
  eventId:     string,
  signerTasks: readonly CesSignerTask[],
): boolean {
  const related = signerTasks.filter(st => st.eventId === eventId);
  if (related.length === 0) return true;
  return related.every(st => st.status === 'signed');
}
