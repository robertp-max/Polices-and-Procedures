/**
 * Account-lifecycle orchestration service (ADR-0002 Phase 2C).
 *
 * This is the service that ACTUALLY makes suspension a global deny — the fix for
 * the two-plane defect where canonical-only suspend left Cognito + the DynamoDB
 * registration untouched, so a "suspended" user could still authenticate.
 *
 * The ordering is safety-first:
 *   1. beginTransition (active→suspending) — the durable IMMEDIATE global deny,
 *      committed BEFORE any provider call. From this point the lifecycle record
 *      is the authority the auth routes consult (Phase 2E), so access is denied
 *      even before Cognito disable propagates.
 *   2. project the canonical plane to a denied state (business routes deny),
 *   3. AdminDisableUser (Cognito account disabled),
 *   4. AdminUserGlobalSignOut (all provider sessions revoked),
 *   5. project the registration plane to disabled (login/refresh/me deny),
 *   6. project the canonical plane to its final state,
 *   7. audit the transition-ready evidence,
 *   8. completeTransition (→ suspended) — the final durable commit.
 * Reactivation is the mirror (AdminEnableUser; final canonical/registration →
 * active). reactivation restores ACCESS, never privilege.
 *
 * Every side effect is gated: a failure AFTER the durable global deny marks the
 * operation `reconciliation_required` (the account stays reserved AND denied) and
 * rethrows — it NEVER reports a false success and NEVER silently half-applies.
 * All side-effect seams are injected, so this service and its tests never touch
 * live AWS / DynamoDB. It carries no PHI, tokens, or provider subjects.
 */
import { ApiError } from '../../errors.js';
import { stepOrderForAction, type SemanticLifecycleStep } from './semantics.js';
import type { AccountLifecycleStatus, LifecycleAction, LifecycleOperationRecord } from './types.js';
import {
  assertLifecycleMutationAvailable, validateReason, validateIdempotencyKey,
  type AccountLifecycleStore,
} from './store.js';

/* ── injected side-effect seams ───────────────────────────────────────────── */

/** Cognito admin operations. Implementations MUST be idempotent (a retry after a
 *  crash re-runs completed steps): disabling an already-disabled user, enabling
 *  an already-enabled user, and repeated global sign-out are all no-op successes. */
export interface LifecycleProviderClient {
  disableUser(input: LifecycleProviderTarget): Promise<void>;
  enableUser(input: LifecycleProviderTarget): Promise<void>;
  globalSignOut(input: LifecycleProviderTarget): Promise<void>;
}
export interface LifecycleProviderTarget {
  canonicalUserId: string;
  providerUsername: string;
  correlationId: string;
}

/** Projections that keep the two legacy planes consistent with the durable
 *  lifecycle. Idempotent: projecting the same status twice is a no-op success. */
export interface LifecycleProjections {
  /** Canonical registry (business-route enforcement plane). `denied` true → the
   *  principal is denied; false → access restored. */
  projectCanonicalStatus(input: {
    canonicalUserId: string; providerUsername: string; denied: boolean; correlationId: string;
  }): Promise<void>;
  /** DynamoDB registration (login/refresh/`/me` gate plane). */
  projectRegistrationStatus(input: {
    canonicalUserId: string; providerUsername: string; disabled: boolean; correlationId: string;
  }): Promise<void>;
}

export type LifecycleAuditPhase = 'transition_ready' | 'completed';
export interface LifecycleAuditEvent {
  phase: LifecycleAuditPhase;
  action: LifecycleAction;
  canonicalUserId: string;
  operationId: string;
  actorUserId: string;
  /** Audit SNAPSHOT of the actor's email — never treated as actor identity. */
  actorEmailSnapshot: string;
  correlationId: string;
  finalStatus: AccountLifecycleStatus;
}
export interface LifecycleAuditSink {
  record(event: LifecycleAuditEvent): Promise<void>;
}

export interface LifecycleServiceDeps {
  store: AccountLifecycleStore;
  provider: LifecycleProviderClient;
  projections: LifecycleProjections;
  audit: LifecycleAuditSink;
  /** Deterministic seams so tests never depend on wall-clock / randomness. */
  newOperationId: () => string;
  newCorrelationId: () => string;
}

/* ── request + result shapes ──────────────────────────────────────────────── */

export interface LifecycleTransitionRequest {
  canonicalUserId: string;
  actorUserId: string;
  actorEmailSnapshot: string;
  reason: string;
  /** Opaque client idempotency key — a retry with the same key resumes the same
   *  operation rather than starting a second one. */
  idempotencyKey: string;
}

export interface LifecycleTransitionResult {
  action: LifecycleAction;
  canonicalUserId: string;
  finalStatus: AccountLifecycleStatus;
  operationId: string;
  /** True when the durable operation already existed for this idempotency key
   *  (crash-resume or a duplicate click). */
  resumed: boolean;
  /** The transition itself is durably committed regardless; this reports only
   *  whether the best-effort post-commit audit succeeded. */
  postCommitAudit: 'completed' | 'failed';
}

/* ── typed errors ─────────────────────────────────────────────────────────── */

function svcError(code: string, message: string, status: number, details?: unknown): ApiError {
  return new ApiError(code, message, status, details);
}

interface TransitionShape {
  action: LifecycleAction;
  transitional: AccountLifecycleStatus;
  desired: AccountLifecycleStatus;
}
const SUSPEND_SHAPE: TransitionShape = { action: 'suspend', transitional: 'suspending', desired: 'suspended' };
const REACTIVATE_SHAPE: TransitionShape = { action: 'reactivate', transitional: 'reactivating', desired: 'active' };

/** Steps beginTransition commits itself; the drive loop never re-runs them. */
const BEGIN_STEPS: ReadonlySet<SemanticLifecycleStep> = new Set(['intent_recorded', 'global_deny_committed']);

export class AccountLifecycleService {
  constructor(private readonly deps: LifecycleServiceDeps) {}

  /** Suspend a user: durable global deny → Cognito disable + global sign-out →
   *  plane projections → complete. Idempotent + resumable. */
  suspend(req: LifecycleTransitionRequest): Promise<LifecycleTransitionResult> {
    return this.run(SUSPEND_SHAPE, req);
  }

  /** Reactivate a suspended user. Restores ACCESS only (never privilege). */
  reactivate(req: LifecycleTransitionRequest): Promise<LifecycleTransitionResult> {
    return this.run(REACTIVATE_SHAPE, req);
  }

  private async run(shape: TransitionShape, req: LifecycleTransitionRequest): Promise<LifecycleTransitionResult> {
    const { store } = this.deps;
    // Fail closed if this runtime cannot perform durable, multi-instance-safe CAS.
    assertLifecycleMutationAvailable(store);
    const canonicalUserId = String(req.canonicalUserId ?? '').trim();
    if (!canonicalUserId) throw svcError('validation_error', 'canonicalUserId is required.', 400);
    validateReason(req.reason);
    validateIdempotencyKey(req.idempotencyKey);
    if (!String(req.actorUserId ?? '').trim()) throw svcError('validation_error', 'actorUserId is required.', 400);

    const life = await store.getLifecycle(canonicalUserId);
    if (!life) throw svcError('ACCOUNT_LIFECYCLE_NOT_FOUND', 'No durable lifecycle record for this user; reconciliation is required before a lifecycle transition.', 409);

    // Already in the desired terminal state with no operation in flight → nothing
    // to do. Idempotent success (a second suspend of a suspended user, etc.).
    if (life.status === shape.desired && !life.currentOperationId) {
      return {
        action: shape.action, canonicalUserId, finalStatus: shape.desired,
        operationId: life.lastCompletedOperationId ?? '', resumed: true, postCommitAudit: 'completed',
      };
    }

    // Resume an in-flight operation reserved on the record.
    if (life.currentOperationId) {
      const op = await store.getOperation(canonicalUserId, life.currentOperationId);
      if (!op) throw svcError('ACCOUNT_LIFECYCLE_VERSION_CONFLICT', 'Reserved operation could not be read; retry.', 409);
      if (op.action !== shape.action) {
        throw svcError('ACCOUNT_LIFECYCLE_OPERATION_IN_PROGRESS', `A ${op.action} operation is already in progress for this user.`, 409);
      }
      if (op.status === 'completed') {
        return { action: shape.action, canonicalUserId, finalStatus: shape.desired, operationId: op.operationId, resumed: true, postCommitAudit: 'completed' };
      }
      if (op.status === 'reconciliation_required') {
        // Recovery from a reconciliation-required record (re-arm + complete) is
        // Phase 2D. Never guess here — the account stays reserved AND denied.
        throw svcError('ACCOUNT_LIFECYCLE_RECONCILIATION_REQUIRED',
          'This account has a lifecycle operation awaiting manual reconciliation.', 409,
          { failedStep: op.failedStep, failureCode: op.failureCode });
      }
      return this.drive(shape, op, life.version, life.providerUsername, req, /* resumed */ true);
    }

    // Fresh transition. The expected "from" is the record's actual current status
    // (active for suspend; suspended or reconciliation_required for reactivate).
    const begin = await store.beginTransition({
      canonicalUserId,
      action: shape.action,
      expectedFromStatus: life.status,
      transitionalStatus: shape.transitional,
      desiredFinalStatus: shape.desired,
      expectedLifecycleVersion: life.version,
      idempotencyKey: req.idempotencyKey,
      operationId: this.deps.newOperationId(),
      actorUserId: req.actorUserId,
      actorEmailSnapshot: req.actorEmailSnapshot,
      reason: req.reason,
      correlationId: this.deps.newCorrelationId(),
    });
    // A concurrent duplicate (same idempotency key) may have already progressed.
    if (begin.idempotentReplay) {
      const op = begin.operation;
      if (op.status === 'completed') {
        return { action: shape.action, canonicalUserId, finalStatus: shape.desired, operationId: op.operationId, resumed: true, postCommitAudit: 'completed' };
      }
      if (op.status === 'reconciliation_required') {
        throw svcError('ACCOUNT_LIFECYCLE_RECONCILIATION_REQUIRED',
          'This account has a lifecycle operation awaiting manual reconciliation.', 409,
          { failedStep: op.failedStep, failureCode: op.failureCode });
      }
      return this.drive(shape, op, begin.lifecycle.version, begin.lifecycle.providerUsername, req, true);
    }
    return this.drive(shape, begin.operation, begin.lifecycle.version, begin.lifecycle.providerUsername, req, false);
  }

  /**
   * Advance every remaining side-effect step (each gated), then complete. The
   * lifecycle version is constant across advances — only begin/reconcile/complete
   * bump it — so the reservation version passed to each advance is `lifeVersion`.
   */
  private async drive(
    shape: TransitionShape,
    startOp: LifecycleOperationRecord,
    lifeVersion: number,
    providerUsername: string,
    req: LifecycleTransitionRequest,
    resumed: boolean,
  ): Promise<LifecycleTransitionResult> {
    const { store } = this.deps;
    const canonicalUserId = startOp.targetUserId;
    const correlationId = startOp.correlationId;
    let op = startOp;

    const advanceable = stepOrderForAction(shape.action)
      .filter((s) => !BEGIN_STEPS.has(s) && s !== 'final_state_committed');

    for (const step of advanceable) {
      if (op.completedSteps.includes(step)) continue; // resume: skip already-done work
      try {
        await this.performSideEffect(shape.action, step, {
          canonicalUserId, providerUsername, correlationId,
          operationId: op.operationId, actorUserId: op.actorUserId, actorEmailSnapshot: op.actorEmailSnapshot,
        });
      } catch (e) {
        await this.reconcile(op, lifeVersion, step, failureCodeOf(e, step));
        throw svcError('ACCOUNT_LIFECYCLE_RECONCILIATION_REQUIRED',
          `Lifecycle ${shape.action} halted at '${step}'; the account is denied and reserved for reconciliation.`,
          409, { failedStep: step, cause: safeMessage(e) });
      }
      op = await store.advanceOperation({
        canonicalUserId, operationId: op.operationId,
        expectedOperationVersion: op.operationVersion, expectedLifecycleVersion: lifeVersion, step,
      });
    }

    const completed = await store.completeTransition({
      canonicalUserId, operationId: op.operationId,
      expectedOperationVersion: op.operationVersion, expectedLifecycleVersion: lifeVersion,
      finalStatus: shape.desired,
    });

    // Post-commit audit is best-effort: the transition is already durably
    // committed and the account is in its final (denied/allowed) state. A failed
    // post-commit audit must never reopen or falsify that outcome.
    let postCommitAudit: 'completed' | 'failed' = 'completed';
    try {
      await this.deps.audit.record({
        phase: 'completed', action: shape.action, canonicalUserId,
        operationId: op.operationId, actorUserId: req.actorUserId,
        actorEmailSnapshot: req.actorEmailSnapshot, correlationId, finalStatus: completed.lifecycle.status,
      });
    } catch {
      postCommitAudit = 'failed';
    }

    return {
      action: shape.action, canonicalUserId, finalStatus: completed.lifecycle.status,
      operationId: op.operationId, resumed, postCommitAudit,
    };
  }

  private async reconcile(op: LifecycleOperationRecord, lifeVersion: number, failedStep: SemanticLifecycleStep, failureCode: string): Promise<void> {
    try {
      await this.deps.store.markReconciliationRequired({
        canonicalUserId: op.targetUserId, operationId: op.operationId,
        expectedOperationVersion: op.operationVersion, expectedLifecycleVersion: lifeVersion,
        failedStep, failureCode,
      });
    } catch {
      // Even if marking fails, the durable record is still in its transitional
      // (denied) state with the reservation held — never a false success. The
      // thrown reconciliation error below is the caller's signal.
    }
  }

  private async performSideEffect(
    action: LifecycleAction,
    step: SemanticLifecycleStep,
    ctx: { canonicalUserId: string; providerUsername: string; correlationId: string; operationId: string; actorUserId: string; actorEmailSnapshot: string },
  ): Promise<void> {
    const { provider, projections, audit } = this.deps;
    const target = { canonicalUserId: ctx.canonicalUserId, providerUsername: ctx.providerUsername, correlationId: ctx.correlationId };
    switch (step) {
      case 'canonical_transition_projected':
        // Deny on the business-route plane immediately (suspend), or hold the
        // existing deny during a reactivation transition.
        await projections.projectCanonicalStatus({ ...target, denied: true });
        return;
      case 'provider_disabled':
        await provider.disableUser(target);
        return;
      case 'provider_sessions_revoked':
        await provider.globalSignOut(target);
        return;
      case 'provider_enabled':
        await provider.enableUser(target);
        return;
      case 'registration_projected':
        await projections.projectRegistrationStatus({ ...target, disabled: action === 'suspend' });
        return;
      case 'canonical_final_projected':
        await projections.projectCanonicalStatus({ ...target, denied: action === 'suspend' });
        return;
      case 'transition_ready_audited':
        await audit.record({
          phase: 'transition_ready', action, canonicalUserId: ctx.canonicalUserId,
          operationId: ctx.operationId, actorUserId: ctx.actorUserId, actorEmailSnapshot: ctx.actorEmailSnapshot,
          correlationId: ctx.correlationId, finalStatus: action === 'suspend' ? 'suspended' : 'active',
        });
        return;
      default:
        // intent_recorded / global_deny_committed / final_state_committed are
        // store-committed boundary steps and are never driven here.
        throw svcError('LIFECYCLE_STEP_ILLEGAL', `Step '${step}' is not a drivable side effect.`, 500);
    }
  }
}

/** Derive a bounded, non-sensitive failure code for the journal. Never embeds
 *  the raw error message (which could carry provider/user detail). */
function failureCodeOf(e: unknown, step: SemanticLifecycleStep): string {
  const name = (e as { name?: string })?.name;
  const base = typeof name === 'string' && name.length > 0 && name.length <= 80 ? name : 'SIDE_EFFECT_FAILED';
  return `${step}:${base}`.slice(0, 200);
}

/** A short, non-sensitive message for the thrown error's details. */
function safeMessage(e: unknown): string {
  const name = (e as { name?: string })?.name;
  return typeof name === 'string' && name.length > 0 ? name : 'side effect failed';
}
