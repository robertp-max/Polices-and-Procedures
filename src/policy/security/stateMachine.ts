// CEU state machine + enforcement gates.
// See Builder/Security-Execution-Audit/03-Execution-State-and-Enforcement.md.
//
// ENFORCEMENT REFACTOR (Phases 1-4):
//   - State changes are EVENT-DRIVEN ONLY via applyEvent.
//   - The legacy transition() API is REMOVED.
//   - Completion REQUIRES a SIGNATURE_COMPLETED event whose payload carries
//     a verified eCIgn signature (verified === true && ecignId).
//   - signatures.collected is updated ONLY by the SIGNATURE_COMPLETED handler.
//   - Every event emits an audit entry. Cascade / SLA / blocker propagation
//     all flow through applyEvent (no silent state writes).

import type {
  ExecutionUnit, CeuId, CeuState, ActorContext, UserId,
  EvidenceArtifact, SignatureRecord, BlockReason,
} from './types';
import { getCeuRepo, deriveParentState } from './ceuStore';
import { emit } from './auditLog';

const ALLOWED: Record<CeuState, CeuState[]> = {
  NotStarted:        ['InProgress', 'Blocked', 'AtRisk', 'Failed'],
  InProgress:        ['AwaitingEvidence', 'AwaitingSignature', 'Blocked', 'AtRisk', 'Completed', 'Failed'],
  AwaitingEvidence:  ['InProgress', 'AwaitingSignature', 'Blocked', 'AtRisk', 'Failed'],
  AwaitingSignature: ['InProgress', 'Completed', 'Blocked', 'AtRisk', 'Failed'],
  Blocked:           ['NotStarted', 'InProgress', 'AtRisk', 'Failed'],
  AtRisk:            ['InProgress', 'AwaitingEvidence', 'AwaitingSignature', 'Blocked', 'Completed', 'Failed'],
  Completed:         [],
  Failed:            [],
};

// ---------- Gates ----------

export type GateName = 'field_clearance' | 'billing_clearance' | 'system_access_clearance';

export interface GateFacts {
  licenseActive?: boolean;
  onboardingComplete?: boolean;
  suspended?: boolean;
  requiredAcknowledgementsCurrent?: boolean;
  billingOnboardingComplete?: boolean;
  openBillingFailures?: number;
  phiReadGranted?: boolean;
  phiWriteGranted?: boolean;
  sessionAgeMs?: number;
  sessionMaxAgeMs?: number;
}

export interface GateContext {
  ceu: ExecutionUnit;
  actor: ActorContext;
  facts: GateFacts;
}

export type GateResult =
  | { ok: true; pass: true; name: GateName }
  | { ok: false; pass: false; name: GateName; reasonCode: string; message: string };

export function evaluateGate(name: GateName, ctx: GateContext): GateResult {
  const f = ctx.facts;
  switch (name) {
    case 'field_clearance':
      if (f.suspended) return fail(name, 'gate.suspended', 'User is suspended.');
      if (!f.licenseActive) return fail(name, 'gate.license.expired_or_missing', 'No active license on file.');
      if (!f.onboardingComplete) return fail(name, 'gate.onboarding.incomplete', 'Onboarding incomplete.');
      if (!f.requiredAcknowledgementsCurrent) return fail(name, 'gate.policy_ack.missing', 'Required policy acknowledgements missing.');
      return { ok: true, pass: true, name };
    case 'billing_clearance':
      if (!f.billingOnboardingComplete) return fail(name, 'gate.billing.onboarding_incomplete', 'Billing onboarding incomplete.');
      if ((f.openBillingFailures ?? 0) > 0) return fail(name, 'gate.billing.open_failures', 'Open billing remediation outstanding.');
      return { ok: true, pass: true, name };
    case 'system_access_clearance':
      if (!ctx.ceu.classification.phi) return { ok: true, pass: true, name };
      if (!f.phiReadGranted) return fail(name, 'gate.phi.read_denied', 'phi.read not granted in scope.');
      if (f.sessionMaxAgeMs && f.sessionAgeMs && f.sessionAgeMs > f.sessionMaxAgeMs) {
        return fail(name, 'gate.session.too_old', 'Re-authentication required.');
      }
      return { ok: true, pass: true, name };
  }
}

function fail(name: GateName, reasonCode: string, message: string): GateResult {
  return { ok: false, pass: false, name, reasonCode, message };
}

// ---------- Phase 3: External Gate Enforcement APIs ----------

export class GateDeniedError extends Error {
  readonly gate: GateName;
  readonly reasonCode: string;
  constructor(gate: GateName, reasonCode: string, message: string) {
    super(`Access denied: ${message}`);
    this.name = 'GateDeniedError';
    this.gate = gate;
    this.reasonCode = reasonCode;
  }
}

async function enforceGate(name: GateName, ctx: GateContext): Promise<true> {
  const res = evaluateGate(name, ctx);
  await emit({
    actor: { kind: ctx.actor.kind, userId: ctx.actor.userId, integrationId: ctx.actor.integrationId },
    action: 'GATE_EVALUATED',
    category: 'security',
    target: { kind: 'ceu', id: ctx.ceu.id },
    context: {
      sessionId: ctx.actor.sessionId,
      requestId: ctx.actor.requestId,
      correlationId: ctx.actor.correlationId,
      phi: ctx.ceu.classification.phi,
      reasonCode: res.ok ? `gate.${name}.pass` : res.reasonCode,
    },
    after: { gate: name, pass: res.ok, subjectId: ctx.actor.userId },
  });
  if (!res.ok) {
    await applyEvent({
      type: 'UNIT_BLOCKED',
      ceuId: ctx.ceu.id,
      actor: ctx.actor,
      reasonCode: res.reasonCode,
      payload: {
        blockReason: {
          code: res.reasonCode,
          message: res.message,
          since: new Date().toISOString(),
          clearableBy: ['Compliance'],
        },
      },
    });
    throw new GateDeniedError(name, res.reasonCode, res.message);
  }
  return true;
}

export function enforceFieldClearance(ctx: GateContext): Promise<true> {
  return enforceGate('field_clearance', ctx);
}
export function enforceBillingClearance(ctx: GateContext): Promise<true> {
  return enforceGate('billing_clearance', ctx);
}
export function enforceSystemAccess(ctx: GateContext): Promise<true> {
  return enforceGate('system_access_clearance', ctx);
}

// ---------- Phase 2: Event-driven state transitions ----------

export type UnitEventType =
  | 'UNIT_STARTED'
  | 'EVIDENCE_CAPTURED'
  | 'SIGNATURE_COMPLETED'
  | 'GATE_EVALUATED'
  | 'UNIT_BLOCKED'
  | 'UNIT_UNBLOCKED'
  | 'UNIT_COMPLETED'
  | 'PARENT_STATE_UPDATED'
  | 'SLA_BREACHED'
  | 'OVERRIDE_APPLIED';

export interface UnitEventPayload {
  evidence?: EvidenceArtifact;
  signature?: SignatureRecord;
  gate?: { name: GateName; ctx: GateContext };
  blockReason?: BlockReason;
  parentState?: CeuState;
  overrideId?: string;
  escalation?: 'L1' | 'L2' | 'L3' | 'SECURITY';
  evidenceRefs?: string[];
  signatureRefs?: string[];
}

export interface UnitEvent {
  type: UnitEventType;
  ceuId: CeuId;
  actor: ActorContext;
  reasonCode: string;
  expectedVersion?: number;
  payload?: UnitEventPayload;
}

export interface ApplyEventResult {
  ok: boolean;
  reasonCode: string;
  ceu?: ExecutionUnit;
}

export async function applyEvent(event: UnitEvent): Promise<ApplyEventResult> {
  const repo = getCeuRepo();
  const ceu = repo.get(event.ceuId);
  if (!ceu) return { ok: false, reasonCode: 'ceu.not_found' };
  if (event.expectedVersion && event.expectedVersion !== ceu.version) {
    return { ok: false, reasonCode: 'ceu.version_conflict' };
  }

  switch (event.type) {
    case 'UNIT_STARTED':         return handleStarted(ceu, event);
    case 'EVIDENCE_CAPTURED':    return handleEvidenceCaptured(ceu, event);
    case 'SIGNATURE_COMPLETED':  return handleSignatureCompleted(ceu, event);
    case 'GATE_EVALUATED':       return handleGateEvaluated(ceu, event);
    case 'UNIT_BLOCKED':         return handleBlocked(ceu, event);
    case 'UNIT_UNBLOCKED':       return handleUnblocked(ceu, event);
    case 'UNIT_COMPLETED':       return handleCompleted(ceu, event);
    case 'PARENT_STATE_UPDATED': return handleParentStateUpdated(ceu, event);
    case 'SLA_BREACHED':         return handleSlaBreached(ceu, event);
    case 'OVERRIDE_APPLIED':     return handleOverrideApplied(ceu, event);
  }
}

function assertAllowed(from: CeuState, to: CeuState): string | null {
  if (from === to) return null;
  return ALLOWED[from].includes(to) ? null : `transition.invalid:${from}->${to}`;
}

async function commit(
  prev: ExecutionUnit,
  next: ExecutionUnit,
  event: UnitEvent,
  action: string,
): Promise<ApplyEventResult> {
  const evt = await emit({
    actor: { kind: event.actor.kind, userId: event.actor.userId, integrationId: event.actor.integrationId },
    action,
    category: 'ceu',
    target: { kind: 'ceu', id: prev.id, parentId: prev.dependencies.parentId },
    context: {
      sessionId: event.actor.sessionId,
      requestId: event.actor.requestId,
      correlationId: event.actor.correlationId,
      phi: prev.classification.phi,
      reasonCode: event.reasonCode,
    },
    before: { state: prev.state, version: prev.version },
    after:  { state: next.state, version: next.version, eventType: event.type },
  });

  if (next.state !== prev.state) {
    next = {
      ...next,
      stateHistory: [
        ...prev.stateHistory,
        {
          from: prev.state, to: next.state, at: new Date().toISOString(),
          actorUserId: (event.actor.userId ?? 'system') as UserId | 'system',
          reasonCode: event.reasonCode,
          correlationId: event.actor.correlationId,
          evidenceRefs: event.payload?.evidenceRefs,
          signatureRefs: event.payload?.signatureRefs,
          auditEventId: evt.id,
        },
      ],
    };
  }
  getCeuRepo().put(next);
  await cascade(prev.id, event.actor);
  return { ok: true, reasonCode: 'ok', ceu: next };
}

// ---------- Event handlers ----------

async function handleStarted(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  if (ceu.state !== 'NotStarted') return { ok: false, reasonCode: 'start.not_in_not_started' };
  if (!ceu.ownership.assigneeUserId && !ceu.ownership.assigneeGroupId) {
    return { ok: false, reasonCode: 'start.no_assignee' };
  }
  const err = assertAllowed(ceu.state, 'InProgress');
  if (err) return { ok: false, reasonCode: err };
  const now = new Date().toISOString();
  const next: ExecutionUnit = {
    ...ceu,
    state: 'InProgress',
    schedule: { ...ceu.schedule, startedAt: ceu.schedule.startedAt ?? now },
    version: ceu.version + 1,
  };
  return commit(ceu, next, event, 'UNIT_STARTED');
}

async function handleEvidenceCaptured(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  const ev = event.payload?.evidence;
  if (!ev) return { ok: false, reasonCode: 'evidence.missing_payload' };
  const dup = ceu.evidence.submitted.find(s => s.requirementId === ev.requirementId && s.contentHash === ev.contentHash);
  const submitted = dup ? ceu.evidence.submitted : [...ceu.evidence.submitted, ev];
  const next: ExecutionUnit = {
    ...ceu,
    evidence: { ...ceu.evidence, submitted },
    version: ceu.version + 1,
  };
  return commit(ceu, next, event, 'EVIDENCE_CAPTURED');
}

// Phase 1 - the ONLY path that may add to signatures.collected.
async function handleSignatureCompleted(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  const sig = event.payload?.signature;
  if (!sig) return { ok: false, reasonCode: 'signature.missing_payload' };
  if (!sig.verified || !sig.ecignId) {
    throw new Error('Completion requires verified eCIgn signature');
  }
  const dup = ceu.signatures.collected.find(s => s.ecignId === sig.ecignId);
  const collected = dup ? ceu.signatures.collected : [...ceu.signatures.collected, sig];
  const next: ExecutionUnit = {
    ...ceu,
    signatures: { ...ceu.signatures, collected },
    version: ceu.version + 1,
  };
  return commit(ceu, next, event, 'SIGNATURE_COLLECTED');
}

async function handleGateEvaluated(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  const g = event.payload?.gate;
  if (!g) return { ok: false, reasonCode: 'gate.missing_payload' };
  const res = evaluateGate(g.name, g.ctx);
  if (res.ok) {
    await emit({
      actor: { kind: event.actor.kind, userId: event.actor.userId },
      action: 'GATE_EVALUATED',
      category: 'security',
      target: { kind: 'ceu', id: ceu.id },
      context: {
        sessionId: event.actor.sessionId, requestId: event.actor.requestId,
        correlationId: event.actor.correlationId, phi: ceu.classification.phi,
        reasonCode: `gate.${g.name}.pass`,
      },
      after: { gate: g.name, pass: true },
    });
    return { ok: true, reasonCode: 'gate.pass', ceu };
  }
  return applyEvent({
    type: 'UNIT_BLOCKED',
    ceuId: ceu.id,
    actor: event.actor,
    reasonCode: res.reasonCode,
    payload: {
      blockReason: {
        code: res.reasonCode, message: res.message,
        since: new Date().toISOString(), clearableBy: ['Compliance'],
      },
    },
  });
}

async function handleBlocked(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  const reason = event.payload?.blockReason;
  if (!reason) return { ok: false, reasonCode: 'blocked.missing_reason' };
  if (ceu.state !== 'Blocked') {
    const err = assertAllowed(ceu.state, 'Blocked');
    if (err) return { ok: false, reasonCode: err };
  }
  const next: ExecutionUnit = {
    ...ceu,
    state: 'Blocked',
    blockReasons: [...(ceu.blockReasons ?? []), reason],
    version: ceu.version + 1,
  };
  return commit(ceu, next, event, 'UNIT_BLOCKED');
}

async function handleUnblocked(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  if (ceu.state !== 'Blocked') return { ok: false, reasonCode: 'unblock.not_blocked' };
  const next: ExecutionUnit = {
    ...ceu,
    state: 'NotStarted',
    blockReasons: undefined,
    version: ceu.version + 1,
  };
  return commit(ceu, next, event, 'UNIT_UNBLOCKED');
}

// Phase 1 - eCIgn is the ONLY completion path.
async function handleCompleted(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  const repo = getCeuRepo();

  const blockers = ceu.dependencies.blockedBy
    .map(id => repo.get(id))
    .filter(b => b && b.state !== 'Completed');
  if (blockers.length > 0) return { ok: false, reasonCode: 'complete.blocked_by_dependency' };

  const evMissing = ceu.evidence.required
    .filter(r => !r.optional)
    .some(r => !ceu.evidence.submitted.find(s => s.requirementId === r.id && s.validatorResult === 'pass'));
  if (evMissing) return { ok: false, reasonCode: 'complete.evidence_missing' };

  const sigMissing = ceu.signatures.required
    .filter(r => !r.optional)
    .some(r => !ceu.signatures.collected.find(s => s.requirementId === r.id));
  if (sigMissing) return { ok: false, reasonCode: 'complete.signature_missing' };

  if (!ceu.signatures.collected.every(sig => sig.verified && sig.ecignId)) {
    throw new Error('Completion requires verified eCIgn signature');
  }

  if (ceu.ownership.requiresReviewer && !ceu.ownership.reviewerUserId) {
    return { ok: false, reasonCode: 'complete.reviewer_required' };
  }

  const err = assertAllowed(ceu.state, 'Completed');
  if (err) return { ok: false, reasonCode: err };

  const now = new Date().toISOString();
  const next: ExecutionUnit = {
    ...ceu,
    state: 'Completed',
    schedule: { ...ceu.schedule, completedAt: now },
    version: ceu.version + 1,
  };
  return commit(ceu, next, event, 'UNIT_COMPLETED');
}

async function handleParentStateUpdated(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  const target = event.payload?.parentState;
  if (!target) return { ok: false, reasonCode: 'parent.missing_state' };
  if (target === ceu.state) return { ok: true, reasonCode: 'parent.no_change', ceu };
  const next: ExecutionUnit = { ...ceu, state: target, version: ceu.version + 1 };
  return commit(ceu, next, event, 'PARENT_STATE_UPDATED');
}

async function handleSlaBreached(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  if (ceu.state === 'Completed' || ceu.state === 'Failed') {
    return { ok: false, reasonCode: 'sla.terminal_state' };
  }
  const next: ExecutionUnit = {
    ...ceu,
    state: 'AtRisk',
    escalation: event.payload?.escalation ?? 'L1',
    version: ceu.version + 1,
  };
  return commit(ceu, next, event, 'SLA_BREACHED');
}

async function handleOverrideApplied(ceu: ExecutionUnit, event: UnitEvent): Promise<ApplyEventResult> {
  const overrideId = event.payload?.overrideId;
  if (!overrideId) return { ok: false, reasonCode: 'override.missing_id' };
  const now = new Date().toISOString();
  const next: ExecutionUnit = {
    ...ceu,
    state: 'Completed',
    overrideId,
    schedule: { ...ceu.schedule, completedAt: now },
    version: ceu.version + 1,
  };
  return commit(ceu, next, event, 'OVERRIDE_APPLIED');
}

// ---------- Cascade (event-driven; no silent mutations) ----------

async function cascade(changedId: CeuId, actor: ActorContext): Promise<void> {
  const repo = getCeuRepo();
  const all = repo.list();

  const dependents = all.filter(c => c.dependencies.blockedBy.includes(changedId));
  for (const dep of dependents) {
    if (dep.state !== 'Blocked') continue;
    const stillBlocked = dep.dependencies.blockedBy.some(id => repo.get(id)?.state !== 'Completed');
    if (!stillBlocked) {
      await applyEvent({
        type: 'UNIT_UNBLOCKED',
        ceuId: dep.id,
        actor: { ...actor, kind: 'system' },
        reasonCode: 'dependency.cleared',
      });
    }
  }

  const changed = repo.get(changedId);
  if (changed?.dependencies.parentId) {
    const parent = repo.get(changed.dependencies.parentId);
    const derived = deriveParentState(repo, changed.dependencies.parentId);
    if (parent && derived && derived !== parent.state) {
      await applyEvent({
        type: 'PARENT_STATE_UPDATED',
        ceuId: parent.id,
        actor: { ...actor, kind: 'system' },
        reasonCode: 'parent.derived',
        payload: { parentState: derived },
      });
    }
  }
}

// ---------- SLA worker (emits SLA_BREACHED) ----------

export async function evaluateSla(now: Date = new Date()): Promise<void> {
  const repo = getCeuRepo();
  for (const ceu of repo.list()) {
    if (ceu.state === 'Completed' || ceu.state === 'Failed') continue;
    if (!ceu.schedule.dueAt && !ceu.schedule.slaHours) continue;

    let atRiskAt: number | null = null;
    let dueAtMs: number | null = null;
    const created = new Date(ceu.schedule.createdAt).getTime();
    if (ceu.schedule.slaHours) {
      atRiskAt = created + 0.8 * ceu.schedule.slaHours * 3600_000;
      dueAtMs = created + ceu.schedule.slaHours * 3600_000;
    }
    if (ceu.schedule.dueAt) {
      dueAtMs = new Date(ceu.schedule.dueAt).getTime();
      if (atRiskAt == null) atRiskAt = dueAtMs - 0.2 * Math.max(1, dueAtMs - created);
    }

    const t = now.getTime();
    const sysActor: ActorContext = {
      kind: 'system',
      requestId: 'sla',
      correlationId: `sla:${ceu.id}`,
    };
    if (dueAtMs && t > dueAtMs) {
      await applyEvent({
        type: 'SLA_BREACHED',
        ceuId: ceu.id,
        actor: sysActor,
        reasonCode: 'sla.past_due',
        payload: { escalation: 'L2' },
      });
    } else if (atRiskAt && t > atRiskAt && ceu.state !== 'AtRisk') {
      await applyEvent({
        type: 'SLA_BREACHED',
        ceuId: ceu.id,
        actor: sysActor,
        reasonCode: 'sla.threshold',
        payload: { escalation: 'L1' },
      });
    }
  }
}
