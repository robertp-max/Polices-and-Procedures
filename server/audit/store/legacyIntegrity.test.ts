/**
 * P1-D Phase 2 — adversarial legacy integrity classification.
 *
 * A legacy (unversioned) event whose stored hash cannot be reproduced from
 * persisted bytes is NEVER labeled VERIFIED/benign. Because JSON-drop cannot be
 * distinguished from tampering or corruption from disk alone, all such cases
 * collapse to the conservative LEGACY_UNVERIFIABLE (hash_verified:false); a
 * suspected_reason is attached only as a non-binding diagnostic. Stored hashes
 * are never modified.
 */
import { describe, expect, it } from 'vitest';
import {
  canonicalV1, verifyChainDetailed, constructEvent, GENESIS_HEAD, sha256,
  type AuditEvent, type AuditEventInput, type ChainHead, type EventGenerators,
} from './eventModel.js';

function gens(): EventGenerators {
  let n = 0, t = 0;
  return { id: () => `ev-${++n}`, now: () => `2027-06-01T00:00:${String(++t % 60).padStart(2, '0')}.000Z` };
}
function input(stream: string, over: Partial<AuditEventInput> = {}): AuditEventInput {
  return { event_type: 'user_access', stream, actor: { type: 'user', user_id: 'u' }, action: 'a', resource: { type: 'user', id: 'r' }, ...over };
}
const only = (rep: ReturnType<typeof verifyChainDetailed>) => rep.results[0];

/** Persist a legacy (unversioned) event exactly as the old writer did: v1 hash, JSON-dropped undefined. */
function legacyOnDisk(inp: AuditEventInput, head: ChainHead, g: EventGenerators, allOptionalsSet = false): AuditEvent {
  const opt = allOptionalsSet ? {
    decision: inp.decision ?? 'permit', decision_reason: 'r', authz_policy_ver: 1, before: null, after: null,
    causation_id: 'c', session_id: 's', request_id: 'rq', trace_id: 't', span_id: 'sp',
    signature_ref: 'sig', evidence_refs: ['e'], policy_refs: [{ policy_id: 'p', version: 1, content_hash: 'h' }],
    idempotency_key: 'idem',
  } : {};
  const cand: Record<string, unknown> = {
    event_id: g.id(), event_type: inp.event_type, event_version: 1, occurred_at_utc: g.now(),
    stream: inp.stream, sequence: head.sequence + 1, prev_hash: head.last_hash,
    actor: inp.actor, action: inp.action, resource: inp.resource,
    decision: (opt as Record<string, unknown>).decision ?? inp.decision,
    decision_reason: (opt as Record<string, unknown>).decision_reason,
    authz_policy_ver: (opt as Record<string, unknown>).authz_policy_ver,
    before: (opt as Record<string, unknown>).before, after: (opt as Record<string, unknown>).after,
    correlation_id: inp.correlation_id ?? 'corr', causation_id: (opt as Record<string, unknown>).causation_id,
    session_id: (opt as Record<string, unknown>).session_id, request_id: (opt as Record<string, unknown>).request_id,
    trace_id: (opt as Record<string, unknown>).trace_id, span_id: (opt as Record<string, unknown>).span_id,
    environment: inp.environment ?? {}, severity: inp.severity ?? 'info',
    phi_flag: false, pii_flag: false, retention_class: 'standard',
    signature_ref: (opt as Record<string, unknown>).signature_ref,
    evidence_refs: (opt as Record<string, unknown>).evidence_refs,
    policy_refs: (opt as Record<string, unknown>).policy_refs,
    payload: inp.payload ?? {}, schema_version: 1,
    idempotency_key: (opt as Record<string, unknown>).idempotency_key,
    // no canon_version
  };
  const event_hash = sha256(head.last_hash + '|' + canonicalV1(cand));
  return JSON.parse(JSON.stringify({ ...cand, event_hash })) as AuditEvent;
}

describe('P1-D adversarial legacy integrity', () => {
  // 1. Valid reproducible unversioned legacy event
  it('1. reproducible legacy event → VERIFIED', () => {
    const e = legacyOnDisk(input('a'), GENESIS_HEAD, gens(), true);
    const r = only(verifyChainDetailed([e], 'a'));
    expect(r.state).toBe('VERIFIED');
    expect(r.hash_verified).toBe(true);
  });

  // 2. Legitimate old event affected by the JSON-drop defect
  it('2. JSON-drop legacy event → LEGACY_UNVERIFIABLE (never VERIFIED), suspected JSON_DROP, hash_verified false', () => {
    const e = legacyOnDisk(input('b'), GENESIS_HEAD, gens(), false);
    const r = only(verifyChainDetailed([e], 'b'));
    expect(r.state).toBe('LEGACY_UNVERIFIABLE');
    expect(r.hash_verified).toBe(false);
    expect(r.suspected_reason).toBe('JSON_DROP');
    expect(r.stored_hash_preserved).toBe(true);
  });

  // 3–6. Tampered persisted shapes must never be benign.
  const base = () => legacyOnDisk(input('c'), GENESIS_HEAD, gens(), true);
  it('3. altered event_type → not VERIFIED (conservative unverifiable/mismatch)', () => {
    const r = only(verifyChainDetailed([{ ...base(), event_type: 'evil' }], 'c'));
    expect(r.state).not.toBe('VERIFIED');
    expect(['LEGACY_UNVERIFIABLE', 'HASH_MISMATCH']).toContain(r.state);
    expect(r.hash_verified).toBe(false);
  });
  it('4. altered actor → not VERIFIED', () => {
    const r = only(verifyChainDetailed([{ ...base(), actor: { type: 'user', user_id: 'attacker' } }], 'c'));
    expect(r.state).not.toBe('VERIFIED');
    expect(r.hash_verified).toBe(false);
  });
  it('5. altered payload field → not VERIFIED', () => {
    const r = only(verifyChainDetailed([{ ...base(), payload: { injected: true } }], 'c'));
    expect(r.state).not.toBe('VERIFIED');
  });
  it('6. altered timestamp → not VERIFIED', () => {
    const r = only(verifyChainDetailed([{ ...base(), occurred_at_utc: '1999-01-01T00:00:00.000Z' }], 'c'));
    expect(r.state).not.toBe('VERIFIED');
  });

  // 7. Random invalid stored hash
  it('7. random invalid stored hash → not VERIFIED', () => {
    const r = only(verifyChainDetailed([{ ...base(), event_hash: 'f'.repeat(64) }], 'c'));
    expect(r.state).not.toBe('VERIFIED');
    expect(r.hash_verified).toBe(false);
  });

  // 8. Broken prior_hash
  it('8. broken prior_hash link → CHAIN_BREAK', () => {
    const g = gens();
    const a = legacyOnDisk(input('d'), GENESIS_HEAD, g, true);
    const b = legacyOnDisk(input('d'), { last_hash: 'wrong-prev', sequence: 1 }, g, true);
    const rep = verifyChainDetailed([a, b], 'd');
    expect(rep.results[1].state).toBe('CHAIN_BREAK');
    expect(rep.results[1].chain_link_verified).toBe(false);
  });

  // 9. Missing optional properties whose former in-memory state is unknowable
  it('9. dropped optionals (state unknowable) → LEGACY_UNVERIFIABLE, never guessed', () => {
    const r = only(verifyChainDetailed([legacyOnDisk(input('e', { decision: 'permit' }), GENESIS_HEAD, gens(), false)], 'e'));
    expect(r.state).toBe('LEGACY_UNVERIFIABLE');
  });

  // 10. Unknown legacy producer shape
  it('10. unknown legacy shape → LEGACY_UNVERIFIABLE with UNKNOWN_LEGACY_SHAPE', () => {
    const alien = { event_id: 'x1', stream: 'f', sequence: 1, prev_hash: 'GENESIS', event_hash: 'abc', foo: 'bar' } as unknown as AuditEvent;
    const r = only(verifyChainDetailed([alien], 'f'));
    expect(r.state).toBe('LEGACY_UNVERIFIABLE');
    expect(r.suspected_reason).toBe('UNKNOWN_LEGACY_SHAPE');
  });

  // 11. Malformed
  it('11. malformed event → MALFORMED_EVENT', () => {
    const bad = { event_id: 'x2', stream: 'g' } as unknown as AuditEvent;
    expect(only(verifyChainDetailed([bad], 'g')).state).toBe('MALFORMED_EVENT');
  });

  // 12. Mixed legacy + v2 chain — legacy segment never upgraded
  it('12. mixed legacy + v2 chain reports honestly (legacy stays unverifiable, v2 verifies)', () => {
    const g = gens();
    const legacy = legacyOnDisk(input('h'), GENESIS_HEAD, g, false);
    const v2 = constructEvent(input('h'), { last_hash: legacy.event_hash, sequence: legacy.sequence }, g);
    const rep = verifyChainDetailed([legacy, v2], 'h');
    expect(rep.results[0].state).toBe('LEGACY_UNVERIFIABLE');
    expect(rep.results[1].state).toBe('VERIFIED');
    expect(rep.ok).toBe(false);
  });

  // Cross-cutting: verification never mutates stored bytes/hash.
  it('never rewrites the stored hash of any event', () => {
    const e = legacyOnDisk(input('i'), GENESIS_HEAD, gens(), false);
    const before = JSON.stringify(e);
    verifyChainDetailed([e], 'i');
    expect(JSON.stringify(e)).toBe(before);
  });
});
