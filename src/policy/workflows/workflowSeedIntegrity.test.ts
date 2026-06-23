/// <reference types="node" />
/**
 * Seed integrity — workflows (ces-workflows foundation).
 *
 * Pure, read-only assertions over the generated WORKFLOWS registry + the existing
 * resolveWorkflowPolicyRefs projection, so later waves can wire the workflow library
 * screen against data whose policy references are known-resolvable and deterministic:
 *   - registry keyed by workflow id; readable XX-WF-NN ids; title/domain/steps present
 *   - policy-ref resolution is deterministic (pure)
 *   - every RESOLVED effective policy ref exists in POLICY_CORPUS
 *
 * No screen wiring. Run via `npm run test:seed`.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import {
  resolveWorkflowPolicyRefs,
  summarizeWorkflowPolicyResolutions,
} from '@/policy/workflows/utils/resolveWorkflowPolicyRefs';

const workflows = Object.values(WORKFLOWS);
const corpusIds = new Set(POLICY_CORPUS.map((p) => p.id));

describe('workflow seed integrity', () => {
  it('registry is non-empty and keyed by workflow id with readable ids', () => {
    assert.ok(workflows.length > 0);
    for (const [key, wf] of Object.entries(WORKFLOWS)) {
      assert.equal(key, wf.id, `registry key ${key} matches wf.id`);
      assert.match(wf.id, /^[A-Z]{2,3}-WF-\d+$/, `workflow id ${wf.id}`);
      assert.ok(wf.title && wf.title.length > 0, `${wf.id} has a title`);
      assert.ok(wf.domain && wf.domain.length > 0, `${wf.id} has a domain`);
      assert.ok(Array.isArray(wf.steps) && wf.steps.length > 0, `${wf.id} has steps`);
    }
  });

  it('policy-ref resolution is deterministic (pure projection)', () => {
    const wf = workflows[0];
    assert.deepEqual(resolveWorkflowPolicyRefs(wf), resolveWorkflowPolicyRefs(wf));
  });

  it('every resolved effective policy ref exists in the policy corpus', () => {
    const bad: string[] = [];
    for (const wf of workflows) {
      for (const ref of resolveWorkflowPolicyRefs(wf).effectivePolicyRefs) {
        if (!corpusIds.has(ref.policyId)) bad.push(`${wf.id} -> ${ref.policyId}`);
      }
    }
    assert.deepEqual(bad, [], `resolved refs not in corpus: ${bad.slice(0, 10).join('; ')}`);
  });

  it('aggregate resolution summary is sane', () => {
    const summary = summarizeWorkflowPolicyResolutions(workflows);
    assert.equal(summary.workflowsScanned, workflows.length);
    assert.ok(summary.finalEffectiveRefs > 0, 'at least some effective policy refs resolve');
  });
});
