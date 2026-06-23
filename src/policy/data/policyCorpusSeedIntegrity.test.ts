/// <reference types="node" />
/**
 * Seed integrity — policy corpus (lifecycle + framework canonical foundation).
 *
 * POLICY_CORPUS is the canonical 278-policy dataset. lifecycleSeed.loadLifecycleSeed()
 * resolves its starting corpus from it (the framework `frameworkSeed.generated.ts` was
 * deprecated for lifecycle because it was mostly placeholder stubs — see lifecycleSeed.ts).
 * Validating the corpus here underpins lifecycle (#3), framework (#2), forms, and workflows,
 * all of which resolve policy refs against it.
 *
 * No screen/store wiring. Run via `npm run test:seed`.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { loadLifecycleSeed } from '@/policy/lifecycle/lifecycleSeed';

const POLICY_ID_RE = /^[A-Z]{2,3}-[A-Z0-9]{2,4}-\d{3}$/;

describe('policy corpus seed integrity', () => {
  it('is non-empty with unique, well-formed, domain-readable ids', () => {
    assert.ok(POLICY_CORPUS.length > 0);
    const ids = new Set(POLICY_CORPUS.map((p) => p.id));
    assert.equal(ids.size, POLICY_CORPUS.length, 'policy ids unique');
    const malformed = POLICY_CORPUS.filter((p) => !POLICY_ID_RE.test(p.id)).map((p) => p.id);
    assert.deepEqual(malformed, [], `malformed policy ids: ${malformed.slice(0, 15).join('; ')}`);
  });

  it('every policy carries a non-empty title', () => {
    const untitled = POLICY_CORPUS.filter((p) => !p.title || !p.title.trim()).map((p) => p.id);
    assert.deepEqual(untitled, [], `policies missing a title: ${untitled.slice(0, 15).join('; ')}`);
  });

  it('lifecycle seed resolves to the canonical corpus', () => {
    const seed = loadLifecycleSeed();
    assert.equal(seed.isEmpty, false);
    assert.equal(seed.policies.length, POLICY_CORPUS.length, 'lifecycle seed mirrors the corpus');
  });
});
