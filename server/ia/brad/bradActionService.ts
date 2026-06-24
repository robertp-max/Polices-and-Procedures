import type {
  ApprovalRequest, BradGeneratedObject, BradObjectType, EventMetadataPatch,
  EventMetadataUpdateResult, SuperAdminIdentity, SuperAdminPermission, CloudChangeOp,
  CloudChangeSetPlan, CloudApplyResult, RiskLevel,
} from './types.js';
import { readHarnessConfig } from '../harness/config.js';
import type { HarnessConfig } from '../harness/types.js';
import { getGeneratedObjectStore } from './generatedObjects.js';
import { applyEventMetadata, guardDirectMutation, type CoreObjectRef } from './protectedCore.js';
import { approvalRegistry } from './superadminApprovals.js';
import { superAdminAudit } from './superadminAudit.js';
import { hasPermission } from './superadminPolicy.js';
import { planCloudChangeSet, applyCloudChangeSet } from './cloudChangeSets.js';
import { snapshotHash, type BradSourceSnapshot } from './sourceSnapshot.js';
import {
  generateEventReadinessReport, generateQapiPacketReport, buildBradActionReport,
} from './reports.js';
import {
  generateGeneralEventPacket, generateQapiEventPacket, generateQapiMinutesDraft,
} from './eventPackets.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad guarded-action orchestrator.
   ----------------------------------------------------------------------------
   • Append-only artifacts (reports, packets, minutes, checklists, plans, notes,
     task recs) are CREATE-only and committed immediately — no Super Admin
     approval needed to generate a read-only artifact, and they never touch core.
   • Change sets (core-mutating) and cloud change-set APPLY require an approved
     Super Admin with the right permission (fail-closed).
   • Event updates are limited to the append-only metadata allowlist; anything
     else must become a BradGeneratedChangeSet.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ActorContext {
  userId: string;
}

function provenance(cfg: HarnessConfig) {
  return {
    runtimeMode: cfg.brad.runtimeMode,
    modelProvider: cfg.brad.provider,
    modelId: cfg.brad.modelId,
    promptVersion: cfg.brad.promptVersion,
  };
}

export class BradActionService {
  constructor(private readonly cfg: HarnessConfig = readHarnessConfig()) {}

  private store = getGeneratedObjectStore();

  // ── Reports (append-only, committed) ─────────────────────────────────────
  runEventReadinessReport(snapshot: BradSourceSnapshot, actor: ActorContext): BradGeneratedObject {
    const content = generateEventReadinessReport(snapshot);
    return this.commit('BradGeneratedReport', content, snapshot, actor);
  }

  runQapiPacketReport(snapshot: BradSourceSnapshot, actor: ActorContext): BradGeneratedObject {
    const content = generateQapiPacketReport(snapshot);
    return this.commit('BradGeneratedReport', content, snapshot, actor);
  }

  // ── Event packets (append-only) + allowed event metadata append ───────────
  generateEventPacket(
    snapshot: BradSourceSnapshot,
    actor: ActorContext,
    kind: 'general' | 'qapi',
  ): { object: BradGeneratedObject; eventUpdate: EventMetadataUpdateResult } {
    const content = kind === 'qapi' ? generateQapiEventPacket(snapshot) : generateGeneralEventPacket(snapshot);
    const object = this.commit('BradGeneratedEventPacket', content, snapshot, actor);
    const eventUpdate = this.appendEventMetadata(snapshot.eventId, {
      generated_packet_object_id: object.metadata.object_id,
      brad_last_action_at: object.metadata.generated_at,
      brad_last_action_type: `generate-${kind}-packet`,
      packet_generation_status: 'generated',
      pending_review: true,
    });
    return { object, eventUpdate };
  }

  generateQapiMinutesDraft(
    snapshot: BradSourceSnapshot,
    actor: ActorContext,
  ): { object: BradGeneratedObject; eventUpdate: EventMetadataUpdateResult } {
    const content = generateQapiMinutesDraft(snapshot);
    const object = this.commit('BradGeneratedQapiMinutes', content, snapshot, actor);
    const eventUpdate = this.appendEventMetadata(snapshot.eventId, {
      generated_minutes_object_id: object.metadata.object_id,
      brad_last_action_at: object.metadata.generated_at,
      brad_last_action_type: 'generate-qapi-minutes-draft',
      minutes_generation_status: 'draft',
      pending_review: true,
      pending_signature: true,
    });
    return { object, eventUpdate };
  }

  // ── Append-only event metadata (allowlist enforced) ───────────────────────
  appendEventMetadata(eventId: string, patch: EventMetadataPatch & Record<string, unknown>): EventMetadataUpdateResult {
    const { result } = applyEventMetadata(eventId, patch);
    superAdminAudit.record({
      type: result.requiresChangeSet ? 'event.metadata.rejected' : 'event.metadata.appended',
      eventId,
      outcome: result.requiresChangeSet ? 'blocked' : 'allowed',
      reason: result.requiresChangeSet ? result.reason : `appended: ${result.appliedFields.join(', ')}`,
    });
    return result;
  }

  // ── Direct core mutation is ALWAYS blocked (must use a changeset) ──────────
  attemptDirectCoreMutation(ref: CoreObjectRef): { blocked: true; reason: string; requiresChangeSet: boolean } {
    const guard = guardDirectMutation(ref);
    superAdminAudit.record({
      type: 'action.blocked',
      objectId: ref.id,
      outcome: 'blocked',
      reason: guard.reason,
    });
    return { blocked: true, reason: guard.reason, requiresChangeSet: guard.requiresChangeSet };
  }

  // ── Change set proposing a core change (pending Super Admin approval) ──────
  proposeChangeSet(params: {
    actor: ActorContext;
    snapshot: BradSourceSnapshot;
    target: CoreObjectRef;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    summary: string;
    requiredPermission: SuperAdminPermission;
    riskLevel?: RiskLevel;
  }): { object: BradGeneratedObject; approval: ApprovalRequest } {
    const object = this.commit(
      'BradGeneratedChangeSet',
      { kind: 'core-change', target: params.target, before: params.before, after: params.after, summary: params.summary },
      params.snapshot,
      params.actor,
      'pending-approval',
    );
    const approval = approvalRegistry.create({
      objectId: object.metadata.object_id,
      objectType: 'BradGeneratedChangeSet',
      requiredPermission: params.requiredPermission,
      requestedByUserId: params.actor.userId,
      sourceEventId: params.snapshot.eventId,
      protectedCoreRefs: [params.target.id],
      riskLevel: params.riskLevel ?? 'high',
      preview: { kind: 'before-after-diff', before: params.before, after: params.after, summary: params.summary },
    });
    return { object, approval };
  }

  // ── Cloud change set: dry-run plan now; apply only after approval ──────────
  proposeCloudChangeSet(params: {
    actor: ActorContext;
    snapshot: BradSourceSnapshot;
    ops: CloudChangeOp[];
    requiredPermission: SuperAdminPermission;
  }): { object: BradGeneratedObject; plan: CloudChangeSetPlan; approval?: ApprovalRequest } {
    const plan = planCloudChangeSet(params.ops);   // safe dry-run; no mutation
    const object = this.commit(
      'BradGeneratedCloudChangeSet',
      { kind: 'cloud-change', plan },
      params.snapshot,
      params.actor,
      plan.allowlistValid ? 'pending-approval' : 'blocked',
    );
    if (!plan.allowlistValid) {
      superAdminAudit.record({
        type: 'cloud.blocked',
        objectId: object.metadata.object_id,
        outcome: 'blocked',
        reason: plan.disallowedReasons.join(' | '),
      });
      return { object, plan };
    }
    const approval = approvalRegistry.create({
      objectId: object.metadata.object_id,
      objectType: 'BradGeneratedCloudChangeSet',
      requiredPermission: params.requiredPermission,
      requestedByUserId: params.actor.userId,
      sourceEventId: params.snapshot.eventId,
      protectedCoreRefs: params.ops.map((o) => o.resource),
      riskLevel: plan.riskLevel,
      preview: { kind: 'before-after-diff', summary: plan.dryRunSummary.join('\n') },
    });
    return { object, plan, approval };
  }

  /** Attempt to apply an approved cloud change set. Fail-closed. */
  applyApprovedCloudChangeSet(objectId: string, identity: SuperAdminIdentity, plan: CloudChangeSetPlan): CloudApplyResult {
    const obj = this.store.get(objectId);
    const approved =
      obj?.metadata.write_status === 'approved' &&
      identity.isSuperAdmin &&
      (hasPermission(identity, 'approve.cloud_change.low_risk') || hasPermission(identity, 'approve.cloud_change.deploy'));
    const result = applyCloudChangeSet(plan, { approved: !!approved, approverId: identity.userId });
    if (result.applied) this.store.transition(objectId, 'applied', identity.userId);
    return result;
  }

  // ── Brad Action Report (records everything Brad did) ──────────────────────
  writeActionReport(
    actor: ActorContext,
    snapshot: BradSourceSnapshot,
    params: {
      inspected: string[]; generated: string[]; updated: string[];
      refusedToUpdate: string[]; blockedWriteReasons: string[];
      objectIdsCreated: string[]; eventIdsAffected: string[]; approverId?: string;
    },
  ): BradGeneratedObject {
    const content = buildBradActionReport({
      ...params,
      runtimeMode: this.cfg.brad.runtimeMode,
      actorId: actor.userId,
    });
    return this.commit('BradGeneratedReport', content, snapshot, actor);
  }

  // ── internal: commit an append-only object with full provenance ───────────
  private commit(
    objectType: BradObjectType,
    content: unknown,
    snapshot: BradSourceSnapshot,
    actor: ActorContext,
    initialWriteStatus: 'committed' | 'pending-approval' | 'blocked' = 'committed',
  ): BradGeneratedObject {
    const p = provenance(this.cfg);
    const object = this.store.create({
      objectType,
      requestedByUserId: actor.userId,
      content,
      runtimeMode: p.runtimeMode,
      modelProvider: p.modelProvider,
      modelId: p.modelId,
      promptVersion: p.promptVersion,
      sourceSnapshotHash: snapshotHash(snapshot),
      initialWriteStatus,
      sourceEventId: snapshot.eventId,
      sourceWorkflowId: snapshot.workflowId,
      sourcePolicyIds: snapshot.policyIds,
      sourceFormIds: snapshot.requiredFormIds,
    });
    superAdminAudit.record({
      type: 'object.created',
      actorId: actor.userId,
      objectId: object.metadata.object_id,
      objectType,
      eventId: snapshot.eventId,
      outcome: 'recorded',
      reason: `write_status=${initialWriteStatus}`,
    });
    return object;
  }
}

export function getBradActionService(): BradActionService {
  return new BradActionService();
}
