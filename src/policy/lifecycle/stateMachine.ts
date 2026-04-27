/* ═══════════════════════════════════════════════════════════════
   Policy Lifecycle State Machine
   Pure module — no I/O, no store reads. Given (envelope, intent,
   context) returns either a new envelope + history event or a
   structured rejection. UI / store invokes this and persists the
   result. All mutation paths flow through here.
   ═══════════════════════════════════════════════════════════════ */

import type {
  LifecycleActor,
  LifecycleHistoryEntry,
  LifecycleIntent,
  LifecycleRejectionCode,
  LifecycleState,
  LifecycleTransitionResult,
  PolicyLifecycleEnvelope,
} from './types';

/** Allowed transitions table. Anything not listed is forbidden. */
const ALLOWED: Record<LifecycleState, Partial<Record<LifecycleIntent, LifecycleState>>> = {
  DRAFT: {
    submitForReview: 'REVIEW',
    archive:         'ARCHIVED',
  },
  REVIEW: {
    requestRevision: 'DRAFT',
    reject:          'DRAFT',
    approve:         'APPROVED',
    archive:         'ARCHIVED',
  },
  APPROVED: {
    publish:         'PUBLISHED',
    requestRevision: 'DRAFT',
    archive:         'ARCHIVED',
  },
  PUBLISHED: {
    reopenForRevision: 'DRAFT',
    archive:           'ARCHIVED',
  },
  ARCHIVED: {
    // terminal — no exits
  },
};

/** Intents that REQUIRE a non-empty rationale string. */
const REQUIRES_RATIONALE: ReadonlySet<LifecycleIntent> = new Set([
  'requestRevision',
  'reject',
  'archive',
  'reopenForRevision',
]);

/** Intents that REQUIRE the actor to differ from the policy creator. */
const FORBIDS_SELF_ACTION: ReadonlySet<LifecycleIntent> = new Set([
  'approve',
]);

export interface TransitionContext {
  intent:     LifecycleIntent;
  actor:      LifecycleActor;
  rationale?: string;
  /** Reference to an eCIgn signature record, when the intent required signing. */
  signatureRef?: string | null;
  /** Auditor-mode flag. When true, the machine refuses any transition. */
  auditorMode?: boolean;
  /** Caller-supplied UTC timestamp (test-friendly). Defaults to now(). */
  now?:       () => string;
  /** Caller-supplied id generator (test-friendly). */
  idGen?:     () => string;
  /** Caller-supplied hash function (test-friendly). */
  hash?:      (input: string) => string;
}

function defaultNow(): string {
  return new Date().toISOString();
}

function defaultId(): string {
  // Short ULID-ish id; collision-resistant enough for the in-browser store.
  // Real persistence layer rewrites with the server-generated id.
  return `LCY-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

/** Lightweight non-cryptographic hash for client-side chain visualization. */
function defaultHash(input: string): string {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < input.length; i++) {
    h = (h ^ BigInt(input.charCodeAt(i))) * prime & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, '0');
}

function reject(code: LifecycleRejectionCode, message: string): LifecycleTransitionResult {
  return { ok: false, code, message };
}

/**
 * Pure transition. Returns either a new envelope + appended history
 * event or a typed rejection. Never mutates the input envelope.
 */
export function transition(
  envelope: PolicyLifecycleEnvelope,
  ctx: TransitionContext,
): LifecycleTransitionResult {
  if (ctx.auditorMode) {
    return reject('AUDITOR_MODE_BLOCK', 'All transitions are blocked while Auditor Mode is on.');
  }

  const next = ALLOWED[envelope.state][ctx.intent];
  if (!next) {
    if (envelope.state === 'ARCHIVED') {
      return reject('ALREADY_TERMINAL', 'Policy is archived; no further transitions are permitted.');
    }
    return reject(
      'INVALID_TRANSITION',
      `Transition "${ctx.intent}" is not allowed from ${envelope.state}.`,
    );
  }

  if (REQUIRES_RATIONALE.has(ctx.intent) && !(ctx.rationale && ctx.rationale.trim().length >= 8)) {
    return reject('MISSING_RATIONALE', 'A rationale of at least 8 characters is required for this action.');
  }

  if (FORBIDS_SELF_ACTION.has(ctx.intent) && ctx.actor.userId === envelope.createdBy.userId) {
    return reject('SELF_APPROVAL_FORBIDDEN', 'The original author cannot approve their own policy.');
  }

  const now   = (ctx.now   ?? defaultNow)();
  const id    = (ctx.idGen ?? defaultId)();
  const hash  = (ctx.hash  ?? defaultHash);

  const priorChain = envelope.lastTransition?.chainHash ?? '';
  const event: LifecycleHistoryEntry = {
    id,
    policyId:     envelope.policyId,
    fromState:    envelope.state,
    toState:      next,
    intent:       ctx.intent,
    actor:        ctx.actor,
    rationale:    (ctx.rationale ?? '').trim(),
    timestamp:    now,
    chainHash:    hash(`${priorChain}|${envelope.policyId}|${envelope.state}->${next}|${ctx.actor.userId}|${now}`),
    signatureRef: ctx.signatureRef ?? null,
  };

  const nextEnvelope: PolicyLifecycleEnvelope = {
    ...envelope,
    state:           next,
    lastTransition:  event,
    history:         [...envelope.history, event],
  };

  return { ok: true, next: nextEnvelope, event };
}

/** Construct the initial envelope (state=DRAFT) for a brand-new policy. */
export function createEnvelope(
  policyId: string,
  createdBy: LifecycleActor,
  now: () => string = defaultNow,
  idGen: () => string = defaultId,
  hash: (i: string) => string = defaultHash,
): PolicyLifecycleEnvelope {
  const ts    = now();
  const event: LifecycleHistoryEntry = {
    id:        idGen(),
    policyId,
    fromState: null,
    toState:   'DRAFT',
    intent:    'created',
    actor:     createdBy,
    rationale: 'Policy created.',
    timestamp: ts,
    chainHash: hash(`|${policyId}|null->DRAFT|${createdBy.userId}|${ts}`),
  };
  return {
    policyId,
    state:          'DRAFT',
    createdBy,
    createdAt:      ts,
    lastTransition: event,
    history:        [event],
  };
}

/** Returns the set of intents currently legal for this envelope. */
export function legalIntents(envelope: PolicyLifecycleEnvelope): LifecycleIntent[] {
  return Object.keys(ALLOWED[envelope.state]) as LifecycleIntent[];
}

/** Public table for UI introspection (read-only mirror of ALLOWED). */
export const TRANSITIONS = ALLOWED;
