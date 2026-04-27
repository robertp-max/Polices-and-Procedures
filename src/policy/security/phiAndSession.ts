// PHI access tracking + session controls.
// See Builder/Security-Execution-Audit/05 §6, §8 and 06 §1.

import type { ActorContext, ResourceRef } from './types';
import { emit } from './auditLog';

export type PhiReason = 'treatment' | 'payment' | 'operations' | 'audit';

export async function recordPhiView(actor: ActorContext, resource: ResourceRef, reason: PhiReason, riskFlags?: string[]): Promise<void> {
  await emit({
    actor: { kind: actor.kind, userId: actor.userId, integrationId: actor.integrationId },
    action: 'PHI_VIEWED',
    category: 'phi',
    target: { kind: resource.kind, id: resource.id },
    context: {
      sessionId: actor.sessionId,
      requestId: actor.requestId,
      correlationId: actor.correlationId,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      phi: true,
      reasonCode: `phi.${reason}`,
      riskFlags,
    },
  });
}

export async function recordPhiWrite(actor: ActorContext, resource: ResourceRef, beforeRef: { id: string; contentHash: string } | null, afterRef: { id: string; contentHash: string }): Promise<void> {
  await emit({
    actor: { kind: actor.kind, userId: actor.userId },
    action: 'PHI_WRITE',
    category: 'phi',
    target: { kind: resource.kind, id: resource.id },
    context: {
      sessionId: actor.sessionId, requestId: actor.requestId, correlationId: actor.correlationId,
      ipAddress: actor.ipAddress, userAgent: actor.userAgent, phi: true,
    },
    before: beforeRef ?? undefined,
    after: afterRef,
  });
}

export async function recordPhiExport(actor: ActorContext, manifest: { recordIds: string[]; recipient?: string; bundleHash: string }): Promise<void> {
  await emit({
    actor: { kind: actor.kind, userId: actor.userId },
    action: 'PHI_EXPORTED',
    category: 'phi',
    target: { kind: 'phi', id: manifest.bundleHash },
    context: {
      sessionId: actor.sessionId, requestId: actor.requestId, correlationId: actor.correlationId,
      phi: true, riskFlags: ['phi_export'],
    },
    after: manifest,
  });
}

// ---------- Session controls ----------

export interface SessionPolicy {
  idleTimeoutMsPhi: number;       // 15 min
  idleTimeoutMsNonPhi: number;    // 30 min
  maxLifetimeMs: number;          // 12 h
  reauthMaxAgeMs: number;         // 5 min for sensitive
}

export const DEFAULT_SESSION_POLICY: SessionPolicy = {
  idleTimeoutMsPhi: 15 * 60 * 1000,
  idleTimeoutMsNonPhi: 30 * 60 * 1000,
  maxLifetimeMs: 12 * 3600 * 1000,
  reauthMaxAgeMs: 5 * 60 * 1000,
};

export interface SessionCheck {
  active: boolean;
  reasonCode?: string;
  needsReauth?: boolean;
}

export function checkSession(input: {
  startedAt: string;
  lastActivityAt: string;
  hasPhiAccess: boolean;
  reauthAt?: string;
  requireReauth?: boolean;
  policy?: SessionPolicy;
  now?: Date;
}): SessionCheck {
  const policy = input.policy ?? DEFAULT_SESSION_POLICY;
  const now = (input.now ?? new Date()).getTime();
  const started = new Date(input.startedAt).getTime();
  const last = new Date(input.lastActivityAt).getTime();
  if (now - started > policy.maxLifetimeMs) return { active: false, reasonCode: 'session.lifetime_exceeded' };
  const idleLimit = input.hasPhiAccess ? policy.idleTimeoutMsPhi : policy.idleTimeoutMsNonPhi;
  if (now - last > idleLimit) return { active: false, reasonCode: 'session.idle_timeout' };
  if (input.requireReauth) {
    const reauth = input.reauthAt ? new Date(input.reauthAt).getTime() : 0;
    if (now - reauth > policy.reauthMaxAgeMs) return { active: true, needsReauth: true, reasonCode: 'session.reauth_required' };
  }
  return { active: true };
}

export async function recordLogin(actor: ActorContext, ok: boolean, reasonCode = ok ? 'login.ok' : 'login.failed'): Promise<void> {
  await emit({
    actor: { kind: 'user', userId: actor.userId },
    action: ok ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    category: 'access',
    target: { kind: 'session', id: actor.sessionId ?? actor.requestId },
    context: {
      sessionId: actor.sessionId, requestId: actor.requestId, correlationId: actor.correlationId,
      ipAddress: actor.ipAddress, userAgent: actor.userAgent, phi: false, reasonCode,
    },
  });
}

export async function recordLogout(actor: ActorContext, reasonCode = 'logout.user'): Promise<void> {
  await emit({
    actor: { kind: 'user', userId: actor.userId },
    action: 'LOGOUT',
    category: 'access',
    target: { kind: 'session', id: actor.sessionId ?? actor.requestId },
    context: {
      sessionId: actor.sessionId, requestId: actor.requestId, correlationId: actor.correlationId,
      ipAddress: actor.ipAddress, userAgent: actor.userAgent, phi: false, reasonCode,
    },
  });
}
