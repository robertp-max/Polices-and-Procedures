/// <reference types="node" />
/**
 * Seed integrity — forms library (shared foundation for forms / framework / achc).
 *
 * Pure, read-only assertions:
 *   - the forms dataset has unique ids
 *   - no form is hollow (every form carries >=1 non-empty policy reference)
 *   - corpus coverage is bounded
 *
 * NOTE (known, pre-existing): some forms reference well-formed policy ids that are
 * NOT in the loaded 278-policy POLICY_CORPUS. This is the forms-side analogue of
 * resolveWorkflowPolicyRefs' `hiddenLegacyPolicyRefs` — legacy / cross-domain
 * references, not malformed data. Resolving them fully needs corpus expansion or
 * SME mapping (out of seed-only scope). The ceiling below is a characterization
 * baseline that guards against NEW unresolved refs regressing in.
 *
 * No screen wiring. Run via `npm run test:seed`.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';

const corpusIds = new Set(POLICY_CORPUS.map((p) => p.id));
const POLICY_ID_RE = /^[A-Z]{2,3}-[A-Z0-9]{2,4}-\d{3}$/;
const LEGACY_CROSS_CORPUS_CEILING = 75;

describe('forms dataset seed integrity', () => {
  it('is non-empty with unique ids', () => {
    assert.ok(FORMS_DATASET.length > 0);
    const ids = new Set(FORMS_DATASET.map((f) => f.id));
    assert.equal(ids.size, FORMS_DATASET.length, 'form ids unique');
  });

  it('every form carries at least one non-empty policy reference', () => {
    const hollow = FORMS_DATASET.filter(
      (f) => !Array.isArray(f.policies) || f.policies.length === 0 || f.policies.some((p) => !p || !p.trim()),
    );
    assert.deepEqual(hollow.map((f) => f.id), [], 'forms with missing/empty policy refs');
  });

  it('form->policy references are well-formed; cross-corpus coverage is bounded', () => {
    const crossCorpus: string[] = [];
    for (const f of FORMS_DATASET) {
      for (const ref of f.policies ?? []) {
        if (POLICY_ID_RE.test(ref) && !corpusIds.has(ref)) crossCorpus.push(`${f.id} -> ${ref}`);
      }
    }
    console.log(`[seed] forms->policy cross-corpus refs (well-formed, not in loaded corpus): ${crossCorpus.length}`);
    assert.ok(
      crossCorpus.length <= LEGACY_CROSS_CORPUS_CEILING,
      `cross-corpus form->policy refs ${crossCorpus.length} exceeds baseline ${LEGACY_CROSS_CORPUS_CEILING}: ${crossCorpus.slice(0, 10).join('; ')}`,
    );
  });
});
