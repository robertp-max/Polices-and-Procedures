// Access middleware + integration adapter contract.
// See Builder/Security-Execution-Audit/00 §3 and 07.
//
// PHASE 5 — PHI Enforcement contract:
//   guard()  → authorize()  → recordPhiView()/recordPhiWrite()  → handler()
//
// Hard rules:
//   1. Unauthorized requests NEVER reach the handler.
//   2. Every denied request emits a PHI_ACCESS_DENIED audit event when the
//      target resource is PHI-classified.
//   3. PHI access is logged BEFORE the handler runs and BEFORE any data is
//      returned. A handler throw still leaves an authoritative access record.
//   4. Handler exceptions emit PHI_ACCESS_FAILED so failed access is auditable.

import type {
  ActorContext, Decision, PermissionId, ResourceRef, CeuId,
} from './types';
import { authorize } from './authorize';
import type { IdentityProvider } from './authorize';
import { recordPhiView, recordPhiWrite } from './phiAndSession';
import type { PhiReason } from './phiAndSession';
import { PERMISSION_INDEX } from './permissions';
import { emit } from './auditLog';

export interface GuardOptions {
  identity: IdentityProvider;
  permission: PermissionId;
  resource: ResourceRef;
  // For PHI obligations.
  phiReason?: PhiReason;
  // Optional content hashes for write paths so PHI_WRITE captures before/after.
  phiWriteRefs?: {
    before: { id: string; contentHash: string } | null;
    after: { id: string; contentHash: string };
  };
}

export type GuardOutcome<T> =
  | { ok: true; result: T }
  | { ok: false; reasonCode: string; needsReauth?: boolean };

function isPhi(opts: GuardOptions): boolean {
  return Boolean(opts.resource.phi || PERMISSION_INDEX[opts.permission]?.phi);
}

function isWritePermission(p: PermissionId): boolean {
  const meta = PERMISSION_INDEX[p];
  if (!meta) return false;
  return ['create', 'update', 'delete', 'write', 'sign', 'override', 'approve'].includes(meta.action);
}

// Wrap a handler with authorization and obligation handling.
export function guard<T>(
  handler: (actor: ActorContext, decision: Decision) => Promise<T>,
): (actor: ActorContext, opts: GuardOptions) => Promise<GuardOutcome<T>> {
  return async (actor, opts) => {
    // 1) authorize — emits ACCESS_DECISION inside.
    const decision = await authorize(opts.identity, actor, opts.permission, opts.resource);

    if (!decision.allow) {
      // 2) PHI denials are explicitly audited so unauthorized PHI attempts
      //    are surfaced even though no data ever leaves the boundary.
      if (isPhi(opts)) {
        await emit({
          actor: { kind: actor.kind, userId: actor.userId, integrationId: actor.integrationId },
          action: 'PHI_ACCESS_DENIED',
          category: 'phi',
          target: { kind: opts.resource.kind, id: opts.resource.id },
          context: {
            sessionId: actor.sessionId,
            requestId: actor.requestId,
            correlationId: actor.correlationId,
            ipAddress: actor.ipAddress,
            userAgent: actor.userAgent,
            phi: true,
            reasonCode: decision.reasonCode,
          },
          after: { permission: opts.permission, denied: true },
        });
      }
      const needsReauth = decision.obligations.some(o => o.code === 'require_reauth');
      return { ok: false, reasonCode: decision.reasonCode, needsReauth };
    }

    // 3) PHI obligations — log access BEFORE the handler runs.
    if (decision.obligations.some(o => o.code === 'log_phi_access')) {
      const reason = opts.phiReason ?? 'operations';
      if (isWritePermission(opts.permission) && opts.phiWriteRefs) {
        await recordPhiWrite(actor, opts.resource, opts.phiWriteRefs.before, opts.phiWriteRefs.after);
      } else {
        await recordPhiView(actor, opts.resource, reason);
      }
    }

    // 4) Run the handler. Any exception is captured as PHI_ACCESS_FAILED so
    //    we never have a silent failure on a PHI path.
    try {
      const result = await handler(actor, decision);
      return { ok: true, result };
    } catch (err) {
      if (isPhi(opts)) {
        await emit({
          actor: { kind: actor.kind, userId: actor.userId, integrationId: actor.integrationId },
          action: 'PHI_ACCESS_FAILED',
          category: 'phi',
          target: { kind: opts.resource.kind, id: opts.resource.id },
          context: {
            sessionId: actor.sessionId,
            requestId: actor.requestId,
            correlationId: actor.correlationId,
            phi: true,
            reasonCode: 'handler.exception',
            reasonText: err instanceof Error ? err.message : String(err),
          },
          after: { permission: opts.permission },
        });
      }
      throw err;
    }
  };
}

// ---------- Integration adapter contract (Doc 07 §7) ----------

export interface IntegrationContext {
  integrationId: string;
  correlationId: string;
  requestId: string;
}

export interface CeuStateChange {
  ceuId: CeuId;
  type: 'evidence_validated' | 'signature_collected' | 'state_change';
  payload: Record<string, unknown>;
}

export interface IntegrationAdapter<TInbound = unknown> {
  id: string;
  ingest(input: TInbound, ctx: IntegrationContext): Promise<CeuId[]>;
  applyCeuStateChange(change: CeuStateChange, ctx: IntegrationContext): Promise<void>;
  verifyCallback(payload: unknown, signature: string): boolean;
}

// Adapter registry for integration fan-out.
const adapters = new Map<string, IntegrationAdapter>();
export function registerAdapter(a: IntegrationAdapter): void { adapters.set(a.id, a); }
export function getAdapter(id: string): IntegrationAdapter | undefined { return adapters.get(id); }
export function listAdapters(): IntegrationAdapter[] { return [...adapters.values()]; }
