/**
 * P1-B — canonical versioning + honest legacy verification.
 *
 * Uses isolated in-memory / temp-file stores only; never the production ledger
 * path. Proves version-2 round-trip verification, that canon_version is part of
 * the hash, and that legacy JSON-drop events are reported UNVERIFIABLE (never
 * silently VERIFIED and never rewritten).
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  canonical, canonicalV1, constructEvent, verifyChainDetailed, CANON_VERSION,
  GENESIS_HEAD, sha256,
  type AuditEvent, type AuditEventInput, type ChainHead, type EventGenerators,
} from './eventModel.js';
import { InMemoryAuditEventStore } from './inMemoryStore.js';
import { JsonlAuditEventStore } from './jsonlStore.js';

function gens(): EventGenerators {
  let n = 0, t = 0;
  return { id: () => `ev-${++n}`, now: () => `2027-05-01T00:00:${String(++t % 60).padStart(2, '0')}.000Z` };
}
function input(stream: string, over: Partial<AuditEventInput> = {}): AuditEventInput {
  return { event_type: 'user_access', stream, actor: { type: 'user', user_id: 'u' }, action: 'a', resource: { type: 'user', id: 'r' }, ...over };
}
const stateOf = (rep: ReturnType<typeof verifyChainDetailed>, id: string) => rep.results.find(r => r.event_id === id)?.state;

/** Recreate a legacy (pre-versioning) on-disk event exactly as the old writer did. */
function legacyOnDiskEvent(inp: AuditEventInput, head: ChainHead, g: EventGenerators): AuditEvent {
  const cand: Record<string, unknown> = {
    event_id: g.id(), event_type: inp.event_type, event_version: 1, occurred_at_utc: g.now(),
    stream: inp.stream, sequence: head.sequence + 1, prev_hash: head.last_hash,
    actor: inp.actor, action: inp.action, resource: inp.resource,
    decision: inp.decision, decision_reason: inp.decision_reason, authz_policy_ver: inp.authz_policy_ver,
    before: inp.before, after: inp.after, correlation_id: inp.correlation_id ?? 'corr', causation_id: inp.causation_id,
    session_id: inp.session_id, request_id: inp.request_id, trace_id: inp.trace_id, span_id: inp.span_id,
    environment: inp.environment ?? {}, severity: inp.severity ?? 'info',
    phi_flag: false, pii_flag: false, retention_class: 'standard',
    signature_ref: inp.signature_ref, evidence_refs: inp.evidence_refs, policy_refs: inp.policy_refs,
    payload: inp.payload ?? {}, schema_version: 1, idempotency_key: inp.idempotency_key,
    // NO canon_version (legacy)
  };
  const event_hash = sha256(head.last_hash + '|' + canonicalV1(cand)); // v1 hash (undefined→null)
  // Persist through JSON to drop undefined keys (the JSON-drop defect).
  return JSON.parse(JSON.stringify({ ...cand, event_hash })) as AuditEvent;
}

describe('canon versioning — new events', () => {
  it('stamps canon_version=2 and includes it in the hash', () => {
    const store = new InMemoryAuditEventStore({ generators: gens() });
    return store.append(input('v2a')).then(e => {
      expect(e.canon_version).toBe(CANON_VERSION);
      // Removing canon_version changes the recomputed hash → it is hashed content.
      const c1: Record<string, unknown> = { ...e }; delete c1.event_hash;
      const c2: Record<string, unknown> = { ...c1 }; delete c2.canon_version;
      expect(sha256(e.prev_hash + '|' + canonical(c1))).toBe(e.event_hash);
      expect(sha256(e.prev_hash + '|' + canonical(c2))).not.toBe(e.event_hash);
    });
  });

  it('v2 round-trips through JSON and verifies (missing/undefined/null/nested/array/key-order)', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'canonv-'));
    const store = new JsonlAuditEventStore({ eventsFile: path.join(dir, 'e.jsonl'), generators: gens() });
    await store.append(input('v2b', { decision: 'permit' }));                       // omitted optionals
    await store.append(input('v2b', { decision_reason: undefined }));               // explicit undefined
    await store.append(input('v2b', { before: null }));                             // explicit null
    await store.append(input('v2b', { payload: { a: 1, b: undefined, m: { y: 2, x: undefined } } })); // nested undefined
    await store.append(input('v2b', { evidence_refs: ['r1', 'r2'] }));              // array
    const rep = await store.verifyChainsDetailed('v2b');
    expect(rep.ok).toBe(true);
    expect(rep.counts.VERIFIED).toBe(5);
  });

  it('multi-event v2 chain verifies', async () => {
    const store = new InMemoryAuditEventStore({ generators: gens() });
    for (let i = 0; i < 6; i++) await store.append(input('v2c'));
    const rep = await store.verifyChainsDetailed('v2c');
    expect(rep.ok).toBe(true);
    expect(rep.counts.VERIFIED).toBe(6);
  });
});

describe('legacy verification — honest states', () => {
  it('legacy event with all optionals present remains VERIFIED (reproducible)', () => {
    const g = gens();
    const e = legacyOnDiskEvent(
      input('leg1', { decision: 'permit', decision_reason: 'ok', authz_policy_ver: 1, before: null, after: null,
        session_id: 's', request_id: 'rq', trace_id: 't', span_id: 'sp', causation_id: 'c',
        signature_ref: 'sig', evidence_refs: ['e'], policy_refs: [{ policy_id: 'p', version: 1, content_hash: 'h' }],
        severity: 'notice', payload: { x: 1 }, environment: { ip: '1.2.3.4' }, idempotency_key: 'idem-1' }),
      GENESIS_HEAD, g,
    );
    // EVERY optional field set → no undefined dropped → reproducible from disk.
    const rep = verifyChainDetailed([e], 'leg1');
    expect(stateOf(rep, e.event_id)).toBe('VERIFIED');
  });

  it('legacy event affected by JSON-drop is LEGACY_UNVERIFIABLE (never VERIFIED)', () => {
    const g = gens();
    const e = legacyOnDiskEvent(input('leg2', { decision: 'permit' }), GENESIS_HEAD, g); // many undefined optionals
    const rep = verifyChainDetailed([e], 'leg2');
    expect(stateOf(rep, e.event_id)).toBe('LEGACY_UNVERIFIABLE');
    expect(rep.ok).toBe(false);
  });

  it('mixed legacy + v2 ledger: v2 verifies, legacy segment reported unverifiable, links intact', async () => {
    const g = gens();
    const legacy = legacyOnDiskEvent(input('mix', { decision: 'permit' }), GENESIS_HEAD, g);
    // A v2 event that chains off the legacy event's STORED hash.
    const v2 = constructEvent(input('mix', { decision: 'deny' }), { last_hash: legacy.event_hash, sequence: legacy.sequence }, g);
    const rep = verifyChainDetailed([legacy, v2], 'mix');
    expect(stateOf(rep, legacy.event_id)).toBe('LEGACY_UNVERIFIABLE');
    expect(stateOf(rep, v2.event_id)).toBe('VERIFIED'); // link matched prior stored hash + own hash verified
    expect(rep.ok).toBe(false); // overall not fully verified — earlier segment unverifiable
  });
});

describe('tamper / malformed / unsupported', () => {
  it('tampered stored event hash → HASH_MISMATCH (v2)', async () => {
    const store = new InMemoryAuditEventStore({ generators: gens() });
    const e = await store.append(input('t1'));
    const tampered = { ...e, event_hash: 'deadbeef'.repeat(8) };
    expect(stateOf(verifyChainDetailed([tampered], 't1'), e.event_id)).toBe('HASH_MISMATCH');
  });

  it('tampered prior_hash link → CHAIN_BREAK', async () => {
    const g = gens();
    const a = constructEvent(input('t2'), GENESIS_HEAD, g);
    const b = constructEvent(input('t2'), { last_hash: 'not-a-real-prev', sequence: 1 }, g);
    expect(stateOf(verifyChainDetailed([a, b], 't2'), b.event_id)).toBe('CHAIN_BREAK');
  });

  it('malformed event → MALFORMED_EVENT', () => {
    const bad = { event_id: 'x', stream: 'm1' } as unknown as AuditEvent; // missing hash/seq/prev
    expect(stateOf(verifyChainDetailed([bad], 'm1'), 'x')).toBe('MALFORMED_EVENT');
  });

  it('unsupported future canon_version → UNSUPPORTED_CANON_VERSION', async () => {
    const store = new InMemoryAuditEventStore({ generators: gens() });
    const e = await store.append(input('u1'));
    const future = { ...e, canon_version: 999 };
    expect(stateOf(verifyChainDetailed([future], 'u1'), e.event_id)).toBe('UNSUPPORTED_CANON_VERSION');
  });
});

describe('no historical rewriting', () => {
  it('verification never mutates the input events', () => {
    const g = gens();
    const legacy = legacyOnDiskEvent(input('nr', { decision: 'permit' }), GENESIS_HEAD, g);
    const snapshot = JSON.stringify(legacy);
    verifyChainDetailed([legacy], 'nr');
    expect(JSON.stringify(legacy)).toBe(snapshot); // bytes, hash, seq, prev all untouched
  });
});
