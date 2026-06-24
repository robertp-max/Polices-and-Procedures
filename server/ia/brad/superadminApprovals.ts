import crypto from 'node:crypto';
import type {
  ApprovalDecision, ApprovalPreview, ApprovalRequest, BradObjectType, RiskLevel,
  SuperAdminIdentity, SuperAdminPermission,
} from './types.js';
import { hasPermission } from './superadminPolicy.js';
import { getGeneratedObjectStore } from './generatedObjects.js';
import { superAdminAudit } from './superadminAudit.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Super Admin approval workflow.
   ----------------------------------------------------------------------------
   • Write actions on protected/cloud-changing objects require explicit approval.
   • A decision is accepted ONLY when the deciding actor is a verified Super Admin
     WITH the required permission. Otherwise the write stays blocked (fail-closed).
   • Every approval AND denial is audited. Approving transitions the object to
     'approved'; denial transitions it to 'denied' (blocking any effect).
   ═══════════════════════════════════════════════════════════════════════════ */

export class ApprovalRegistry {
  private readonly pending = new Map<string, ApprovalRequest>();

  create(params: {
    objectId: string;
    objectType: BradObjectType;
    requiredPermission: SuperAdminPermission;
    requestedByUserId: string;
    sourceEventId?: string;
    protectedCoreRefs?: string[];
    riskLevel: RiskLevel;
    preview: ApprovalPreview;
  }): ApprovalRequest {
    const req: ApprovalRequest = {
      approvalId: `appr-${crypto.randomUUID()}`,
      objectId: params.objectId,
      objectType: params.objectType,
      requiredPermission: params.requiredPermission,
      requestedByUserId: params.requestedByUserId,
      sourceEventId: params.sourceEventId,
      protectedCoreRefs: params.protectedCoreRefs ?? [],
      riskLevel: params.riskLevel,
      preview: params.preview,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.pending.set(req.approvalId, req);
    superAdminAudit.record({
      type: 'approval.requested',
      actorId: params.requestedByUserId,
      objectId: params.objectId,
      objectType: params.objectType,
      permission: params.requiredPermission,
      outcome: 'recorded',
      reason: params.preview.summary,
    });
    return req;
  }

  get(approvalId: string): ApprovalRequest | undefined {
    return this.pending.get(approvalId);
  }

  listPending(): ApprovalRequest[] {
    return [...this.pending.values()].filter((r) => r.status === 'pending');
  }

  /** Decide an approval. Returns the decision, or throws on a hard failure.
      A non-Super-Admin (or one lacking the permission) yields a DENIED-equivalent
      blocked result — never an approval. */
  decide(
    approvalId: string,
    identity: SuperAdminIdentity,
    decision: 'approved' | 'denied',
    reason?: string,
  ): { decision: ApprovalDecision; allowedWrite: boolean } {
    const req = this.pending.get(approvalId);
    if (!req) throw new Error(`unknown approvalId: ${approvalId}`);

    const store = getGeneratedObjectStore();
    const authorized = identity.isSuperAdmin && hasPermission(identity, req.requiredPermission);

    // A regular user (or a Super Admin lacking the permission) can NEVER grant a write.
    const effective: 'approved' | 'denied' = authorized && decision === 'approved' ? 'approved' : 'denied';
    const allowedWrite = effective === 'approved';

    const dec: ApprovalDecision = {
      approvalId,
      objectId: req.objectId,
      decision: effective,
      decidedByUserId: identity.userId ?? 'unknown',
      decidedByDisplayName: identity.displayName ?? 'unknown',
      reason: !authorized
        ? `not authorized for ${req.requiredPermission}${reason ? ` (${reason})` : ''}`
        : reason,
      decidedAt: new Date().toISOString(),
    };

    req.status = effective;
    store.transition(req.objectId, effective, allowedWrite ? identity.userId : undefined);

    superAdminAudit.record({
      type: allowedWrite ? 'approval.granted' : 'approval.denied',
      actorId: identity.userId,
      actorDisplayName: identity.displayName,
      objectId: req.objectId,
      objectType: req.objectType,
      permission: req.requiredPermission,
      outcome: allowedWrite ? 'granted' : 'denied',
      reason: dec.reason,
    });

    return { decision: dec, allowedWrite };
  }
}

export const approvalRegistry = new ApprovalRegistry();
