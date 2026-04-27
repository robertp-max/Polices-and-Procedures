/**
 * taskProjectionCore — PURE projection logic.
 *
 * No React imports. No store imports. No alias imports.
 * Suitable for tsx scripts and unit verification.
 *
 * The React-bound hook lives in `taskProjection.ts`.
 *
 * ─── PROJECTION CONTRACT (single source of truth) ────────────────────
 *
 * For every event we project ONE task per `processFlow` step:
 *
 *   task_id    = "{event.id}-{NN}"  (NN = step ordinal in processFlow, 01-based)
 *   step_id    = step.id            (e.g. "s2", "qapi-gov-minutes")
 *   title      = step.label         (NEVER a form id, NEVER form.label)
 *   form_ids   = step.requiredFormIds                       (attached)
 *   packets    = packets built from those form ids          (attached)
 *   due_date   = event.date  + step.dueOffsetDays           (weekend-rolled)
 *   status     = derived from step.status, escalated to 'in_review'/'blocked'
 *                if any attached packet says so
 *
 * Forms in `event.requiredForms[]` that are NOT consumed by any step are
 * emitted as ONE orphan task each (so survey evidence is never lost).
 *
 * Events themselves are NEVER tasks.
 */

import {
  deriveEcignPacketStatus,
  derivePmTaskStatus,
  inferEcignInternalFromCesFormStatus,
} from './ecignStatusMap';
import type { PmOverlay } from './pmOverlayStore.types';
import type {
  EcignPacket,
  EcignPacketStatus,
  EcignSubmissionTask,
  NonFormCesTask,
  PacketSnapshot,
  PmTaskStatus,
  Task,
} from './types';

/* ─── Minimal external shapes used by the projector ─────────────────── */
export interface ProjectorFormState {
  status: 'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete';
}

export interface ProjectorEventForm {
  id: string;
  label: string;
  formId?: string;
  status?: 'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete';
  dueOffsetDays?: number;
}

export interface ProjectorEventStep {
  id: string;
  label: string;
  description?: string;
  instructions?: string;
  status: 'complete' | 'in-progress' | 'pending';
  /** Form IDs (matching ProjectorEventForm.id) that this step produces/consumes. */
  requiredFormIds?: string[];
  storyPoints?: 1 | 2 | 3 | 5 | 8;
  /** Days relative to event.date. Negative = before, positive = after. */
  dueOffsetDays?: number;
}

export interface ProjectorEvent {
  id: string;
  workflowId?: string;
  policyRefs?: string[];
  /** Calendar date for the event (YYYY-MM-DD). Anchor for step due-date math. */
  date?: string;
  /** Optional end date (YYYY-MM-DD). Used as fallback when `date` absent. */
  endDate?: string;
  requiredForms: ProjectorEventForm[];
  processFlow: ProjectorEventStep[];
}

export interface ProjectorInput {
  events: ProjectorEvent[];
  /** Flat key = `${eventId}::${formId}` (matches CES store). */
  formStates: Record<string, ProjectorFormState>;
  overlays: Record<string, PmOverlay>;
}

/* ─── helpers ───────────────────────────────────────────────────────── */
const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));
const formKey = (eventId: string, formId: string) => `${eventId}::${formId}`;

/** task_id format: "{event.id}-{NN}" */
function makeCesTaskId(eventId: string, ordinal: number): string {
  return `${eventId}-${pad2(ordinal)}`;
}

/**
 * Compute due date for a step.
 *
 *   anchor = event.date (or endDate fallback)
 *   raw    = anchor + offsetDays
 *   final  = raw rolled off Sat/Sun
 *
 * Roll direction: pre-event (offset < 0) rolls EARLIER (Friday); on/after
 * event (offset >= 0) rolls LATER (Monday). This preserves intent.
 */
function computeStepDueDate(
  anchorIso: string | undefined,
  offsetDays: number | undefined,
): string | undefined {
  if (!anchorIso) return undefined;
  const base = new Date(`${anchorIso}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return undefined;
  const offset = offsetDays ?? 0;
  base.setUTCDate(base.getUTCDate() + offset);
  // Roll off weekend.
  const direction = offset < 0 ? -1 : 1;
  let guard = 0;
  while ((base.getUTCDay() === 0 || base.getUTCDay() === 6) && guard++ < 7) {
    base.setUTCDate(base.getUTCDate() + direction);
  }
  return base.toISOString().slice(0, 10);
}

/**
 * Spread an array of step due-dates so that no two steps in the same event
 * land on the same calendar day. Anchored at the earliest preferred date,
 * each colliding step is pushed forward by one workday at a time. Steps
 * with `undefined` due-dates are left untouched.
 *
 * This guards against the "every task due 05/05/2026" defect that occurs
 * when upstream workflow alignment sets every step's dueOffsetDays to 0.
 */
function spreadCollisions(
  preferredDates: Array<string | undefined>,
): Array<string | undefined> {
  const taken = new Set<string>();
  const result: Array<string | undefined> = new Array(preferredDates.length);

  for (let i = 0; i < preferredDates.length; i++) {
    const seed = preferredDates[i];
    if (!seed) {
      result[i] = undefined;
      continue;
    }
    let candidate = seed;
    let guard = 0;
    while (taken.has(candidate) && guard++ < 365) {
      const d = new Date(`${candidate}T00:00:00Z`);
      do {
        d.setUTCDate(d.getUTCDate() + 1);
      } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
      candidate = d.toISOString().slice(0, 10);
    }
    result[i] = candidate;
    taken.add(candidate);
  }
  return result;
}

function snapshotFromFormState(formState: ProjectorFormState | undefined): PacketSnapshot {
  const cesStatus = formState?.status ?? 'missing';
  const internal = inferEcignInternalFromCesFormStatus(cesStatus, Boolean(formState));
  return {
    internal,
    requiredSignersCount: 1,
    signedCount: cesStatus === 'complete' ? 1 : 0,
    approvalRequired: cesStatus === 'requires-review' || cesStatus === 'complete',
    approvalDecision: cesStatus === 'complete' ? 'approved' : undefined,
    hasValidatedEvidence: cesStatus === 'complete',
  };
}

function packetFromSnapshot(formId: string, snap: PacketSnapshot): EcignPacket {
  return {
    packet_id: `pkt:${formId}`,
    form_id: formId,
    internal: snap.internal,
    packet_status: deriveEcignPacketStatus(snap),
    signers: [],
    approvals: [],
    evidence: snap.hasValidatedEvidence
      ? {
          evidence_id: `ev:${formId}`,
          status: 'validated',
          created_at: new Date().toISOString(),
        }
      : undefined,
    recent_audit_refs: [],
  };
}

/** Map step.status into PmTaskStatus. */
function pmStatusFromStep(stepStatus: ProjectorEventStep['status']): PmTaskStatus {
  if (stepStatus === 'complete') return 'done';
  if (stepStatus === 'in-progress') return 'in_progress';
  return 'todo';
}

/**
 * Combine the step-derived status with packet statuses from any attached
 * forms. The "worst" packet condition wins (returned/rejected → blocked,
 * awaiting_approval → in_review, awaiting_signature → in_progress).
 */
function reconcileStatus(
  base: PmTaskStatus,
  packetStatuses: EcignPacketStatus[],
): PmTaskStatus {
  if (base === 'done') return 'done';
  let next = base;
  for (const ps of packetStatuses) {
    if (ps === 'rejected' || ps === 'returned_for_correction') return 'blocked';
    if (ps === 'awaiting_approval' && next !== 'blocked') next = 'in_review';
    else if (
      ps === 'awaiting_signature' &&
      next !== 'in_review' &&
      next !== 'blocked'
    )
      next = 'in_progress';
    else if (ps === 'submitted' && next === 'todo') next = 'in_progress';
  }
  return next;
}

function applyOverlay<T extends EcignSubmissionTask | NonFormCesTask>(
  task: T,
  overlay: PmOverlay | undefined,
): T {
  if (!overlay) return task;
  return {
    ...task,
    assigned_user_id: overlay.assigned_user_id ?? task.assigned_user_id,
    sprint_id: overlay.sprint_id ?? task.sprint_id,
    story_points: overlay.story_points ?? task.story_points,
    due_date: overlay.due_date ?? task.due_date,
    dependencies: Array.from(
      new Set([...(task.dependencies ?? []), ...overlay.dependencies]),
    ),
    weekend_override: overlay.weekend_override ?? task.weekend_override,
  };
}

/* ─── projector ─────────────────────────────────────────────────────── */
export function projectTasks(input: ProjectorInput): Task[] {
  const tasks: Task[] = [];

  for (const event of input.events) {
    const anchor = event.date ?? event.endDate;
    let ordinal = 1;
    const consumedFormIds = new Set<string>();

    /* Pre-compute due dates for every step so we can spread collisions
       across consecutive workdays (defends against upstream data where
       every step has dueOffsetDays=0). */
    const preferredDates = event.processFlow.map((step) =>
      computeStepDueDate(anchor, step.dueOffsetDays ?? 0),
    );
    const spreadDates = spreadCollisions(preferredDates);

    /* (1) One task per processFlow step. */
    for (let stepIdx = 0; stepIdx < event.processFlow.length; stepIdx++) {
      const step = event.processFlow[stepIdx];
      const task_id = makeCesTaskId(event.id, ordinal++);
      const overlay = input.overlays[task_id];
      const stepDue = spreadDates[stepIdx];
      const stepBaseStatus = pmStatusFromStep(step.status);

      // Resolve attached forms. step.requiredFormIds[] may reference either
      // requiredForms[].id (the local item id) or requiredForms[].formId
      // (the global Forms-Library id). Match on either.
      const attachedFormIds = step.requiredFormIds ?? [];
      const attachedForms = attachedFormIds
        .map(fid => {
          const match =
            event.requiredForms.find(f => f.id === fid) ??
            event.requiredForms.find(f => f.formId === fid);
          if (match) consumedFormIds.add(match.id);
          else consumedFormIds.add(fid); // suppress orphan if data only references the global formId
          return match;
        })
        .filter((f): f is ProjectorEventForm => Boolean(f));

      if (attachedFormIds.length === 0) {
        // Pure execution step — no eCIgn packet attached.
        const base: NonFormCesTask = {
          task_id,
          source: 'ces',
          event_id: event.id,
          workflow_id: event.workflowId ?? '',
          policy_id: event.policyRefs?.[0],
          step_id: step.id,
          title: step.label,
          description: step.instructions ?? step.description,
          status: stepBaseStatus,
          story_points: step.storyPoints,
          dependencies: [],
          due_date: stepDue,
        };
        tasks.push(applyOverlay(base, overlay));
        continue;
      }

      // Step with attached forms — build packets, escalate status.
      const packets: EcignPacket[] = [];
      const packetStatuses: EcignPacketStatus[] = [];
      for (const f of attachedForms) {
        const formStateKey = f.formId ?? f.id;
        const fs =
          input.formStates[formKey(event.id, formStateKey)] ??
          (f.status ? { status: f.status } : undefined);
        const snap = snapshotFromFormState(fs);
        const pkt = packetFromSnapshot(f.formId ?? f.id, snap);
        packets.push(pkt);
        packetStatuses.push(pkt.packet_status);
      }

      const primaryFormId =
        attachedForms[0]?.formId ?? attachedForms[0]?.id ?? attachedFormIds[0];
      const reconciled = reconcileStatus(stepBaseStatus, packetStatuses);

      const base: EcignSubmissionTask = {
        task_id,
        source: 'ces',
        event_id: event.id,
        workflow_id: event.workflowId ?? '',
        policy_id: event.policyRefs?.[0],
        step_id: step.id,
        form_id: primaryFormId,
        form_ids: attachedForms.map(f => f.formId ?? f.id),
        ecign_packet_id: packets[0]?.packet_id,
        packet: packets[0],
        packets,
        title: step.label,
        description: step.instructions ?? step.description,
        status: reconciled,
        packet_status: packets[0]?.packet_status ?? 'not_started',
        required_signers: [],
        approvers: [],
        dependencies: [],
        due_date: stepDue,
        evidence_id: packets[0]?.evidence?.evidence_id,
        audit_log_refs: [],
        story_points: step.storyPoints,
      };
      tasks.push(applyOverlay(base, overlay));
    }

    /* (2) Orphan forms — required but never owned by a step. */
    for (const form of event.requiredForms) {
      if (consumedFormIds.has(form.id)) continue;
      const task_id = makeCesTaskId(event.id, ordinal++);
      const overlay = input.overlays[task_id];
      const formStateKey = form.formId ?? form.id;
      const fs =
        input.formStates[formKey(event.id, formStateKey)] ??
        (form.status ? { status: form.status } : undefined);
      const snap = snapshotFromFormState(fs);
      const pkt = packetFromSnapshot(form.formId ?? form.id, snap);
      const orphanDue = computeStepDueDate(anchor, form.dueOffsetDays);

      const base: EcignSubmissionTask = {
        task_id,
        source: 'ces',
        event_id: event.id,
        workflow_id: event.workflowId ?? '',
        policy_id: event.policyRefs?.[0],
        // step_id intentionally omitted — no owning execution step.
        form_id: form.formId ?? form.id,
        form_ids: [form.formId ?? form.id],
        ecign_packet_id: pkt.packet_id,
        packet: pkt,
        packets: [pkt],
        title: form.label,
        status: derivePmTaskStatus(snap),
        packet_status: pkt.packet_status,
        required_signers: [],
        approvers: [],
        dependencies: [],
        due_date: orphanDue,
        evidence_id: pkt.evidence?.evidence_id,
        audit_log_refs: [],
      };
      tasks.push(applyOverlay(base, overlay));
    }
  }

  const isProd =
    typeof globalThis !== 'undefined' &&
    (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
      ?.NODE_ENV === 'production';
  if (!isProd) {
    assertNoDuplicateTaskIds(tasks);
  }

  return tasks;
}

/** Dev-mode guard. Throws if any duplicate task_ids are detected. */
export function assertNoDuplicateTaskIds(tasks: ReadonlyArray<Task>): void {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const t of tasks) {
    if (seen.has(t.task_id)) dupes.push(t.task_id);
    seen.add(t.task_id);
  }
  if (dupes.length > 0) {
    throw new Error(
      `[taskProjection] Duplicate task_ids detected: ${dupes.join(', ')}. ` +
        `task_ids must be unique across all PM views.`,
    );
  }
}
