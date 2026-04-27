// Override workflow (dual-signature, time-bound).
// See Builder/Security-Execution-Audit/01 §5.3 and 03 §7.

import type {
  OverrideRequest, OverrideApproval, ActorContext, CeuId, UserId, GroupId,
} from './types';
import { OVERRIDE_ROLE_PAIRS } from './permissions';
import { emit } from './auditLog';
import { uuidv7 } from './hash';
import { getCeuRepo } from './ceuStore';
import { applyEvent } from './stateMachine';

const DEFAULT_TTL_MS = 24 * 3600 * 1000;

export interface OverrideStore {
  put(o: OverrideRequest): void;
  get(id: string): OverrideRequest | undefined;
  list(): OverrideRequest[];
}

export class InMemoryOverrideStore implements OverrideStore {
  private map = new Map<string, OverrideRequest>();
  put(o: OverrideRequest) { this.map.set(o.id, o); }
  get(id: string) { return this.map.get(id); }
  list() { return [...this.map.values()]; }
}

let _store: OverrideStore = new InMemoryOverrideStore();
export function getOverrideStore(): OverrideStore { return _store; }
export function setOverrideStore(s: OverrideStore): void { _store = s; }

export async function requestOverride(input: {
  actor: ActorContext;
  scope: 'override.policy' | 'override.signature' | 'override.access';
  targetCeuId: CeuId;
  reasonCode: string;
  reasonText: string;
  ttlMs?: number;
}): Promise<OverrideRequest> {
  if (!input.actor.userId) throw new Error('override.requires_authenticated_user');
  const pair = OVERRIDE_ROLE_PAIRS[input.scope];
  if (!pair) throw new Error(`override.unknown_scope:${input.scope}`);
  const now = Date.now();
  const o: OverrideRequest = {
    id: uuidv7(),
    targetCeuId: input.targetCeuId,
    requestedByUserId: input.actor.userId,
    requestedAt: new Date(now).toISOString(),
    reasonCode: input.reasonCode,
    reasonText: input.reasonText,
    requiredApproverGroups: pair,
    approvals: [],
    expiresAt: new Date(now + (input.ttlMs ?? DEFAULT_TTL_MS)).toISOString(),
    status: 'pending',
  };
  getOverrideStore().put(o);
  await emit({
    actor: { kind: input.actor.kind, userId: input.actor.userId },
    action: 'OVERRIDE_REQUESTED',
    category: 'security',
    target: { kind: 'override', id: o.id, parentId: input.targetCeuId },
    context: {
      sessionId: input.actor.sessionId,
      requestId: input.actor.requestId,
      correlationId: input.actor.correlationId,
      phi: false,
      reasonCode: input.reasonCode,
      reasonText: input.reasonText,
    },
    after: { scope: input.scope, requiredApproverGroups: pair },
  });
  return o;
}

export async function approveOverride(input: {
  overrideId: string;
  actor: ActorContext;
  approverGroupId: GroupId;
  ecignSignatureId: string;
}): Promise<{ ok: boolean; reasonCode: string; override?: OverrideRequest }> {
  if (!input.actor.userId) return { ok: false, reasonCode: 'override.unauthenticated' };
  const o = getOverrideStore().get(input.overrideId);
  if (!o) return { ok: false, reasonCode: 'override.not_found' };
  if (o.status !== 'pending') return { ok: false, reasonCode: `override.${o.status}` };
  if (Date.now() > new Date(o.expiresAt).getTime()) {
    o.status = 'expired';
    getOverrideStore().put(o);
    await emit({
      actor: { kind: 'system' },
      action: 'OVERRIDE_EXPIRED',
      category: 'security',
      target: { kind: 'override', id: o.id, parentId: o.targetCeuId },
      context: { requestId: 'system', correlationId: `override:${o.id}`, phi: false },
    });
    return { ok: false, reasonCode: 'override.expired' };
  }
  if (!o.requiredApproverGroups.includes(input.approverGroupId)) {
    return { ok: false, reasonCode: 'override.role_not_eligible' };
  }
  if (o.approvals.some(a => a.approverUserId === input.actor.userId)) {
    return { ok: false, reasonCode: 'override.duplicate_approver' };
  }
  if (o.approvals.some(a => a.approverGroupId === input.approverGroupId)) {
    return { ok: false, reasonCode: 'override.group_already_approved' };
  }
  if (input.actor.userId === o.requestedByUserId && o.approvals.length === 0) {
    // Requester may approve only as the second approver (still must be distinct group).
    return { ok: false, reasonCode: 'override.requester_cannot_self_approve_first' };
  }
  const approval: OverrideApproval = {
    approverUserId: input.actor.userId,
    approverGroupId: input.approverGroupId,
    ecignSignatureId: input.ecignSignatureId,
    approvedAt: new Date().toISOString(),
  };
  o.approvals.push(approval);

  const isFinal = o.approvals.length >= 2;
  o.status = isFinal ? 'approved' : 'pending';
  getOverrideStore().put(o);

  await emit({
    actor: { kind: input.actor.kind, userId: input.actor.userId },
    action: 'OVERRIDE_APPROVED',
    category: 'security',
    target: { kind: 'override', id: o.id, parentId: o.targetCeuId },
    context: {
      sessionId: input.actor.sessionId,
      requestId: input.actor.requestId,
      correlationId: input.actor.correlationId,
      phi: false,
      reasonCode: isFinal ? 'override.final' : 'override.partial',
    },
    after: { approvals: o.approvals.length, isFinal },
  });

  if (isFinal) {
    // Apply override to target CEU via the event system (Phase 4 — no silent
    // mutations). The OVERRIDE_APPLIED handler emits the audit entry and
    // performs the state write.
    const repo = getCeuRepo();
    const ceu = repo.get(o.targetCeuId);
    if (ceu) {
      await applyEvent({
        type: 'OVERRIDE_APPLIED',
        ceuId: ceu.id,
        actor: { ...input.actor, kind: 'system' },
        reasonCode: o.reasonCode,
        payload: { overrideId: o.id },
      });
      await emit({
        actor: { kind: 'system' },
        action: 'CEU_OVERRIDDEN',
        category: 'ceu',
        target: { kind: 'ceu', id: ceu.id },
        context: { requestId: 'system', correlationId: `override:${o.id}`, phi: ceu.classification.phi, reasonCode: o.reasonCode, reasonText: o.reasonText },
        before: { state: ceu.state }, after: { state: 'Completed', overrideId: o.id },
      });
    }
  }

  return { ok: true, reasonCode: isFinal ? 'override.applied' : 'override.partial', override: o };
}

// Sweep expired overrides — call from a scheduled job.
export async function expireOverrides(): Promise<number> {
  const now = Date.now();
  let n = 0;
  for (const o of getOverrideStore().list()) {
    if (o.status !== 'pending') continue;
    if (now > new Date(o.expiresAt).getTime()) {
      o.status = 'expired';
      getOverrideStore().put(o);
      await emit({
        actor: { kind: 'system' },
        action: 'OVERRIDE_EXPIRED',
        category: 'security',
        target: { kind: 'override', id: o.id, parentId: o.targetCeuId },
        context: { requestId: 'system', correlationId: `override:${o.id}`, phi: false },
      });
      n++;
    }
  }
  return n;
}
// Suppress unused-import warning for UserId in declaration files.
export type _UserIdRef = UserId;
