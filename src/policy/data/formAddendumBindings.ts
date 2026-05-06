/* Auto-derived form → parent-policy bindings.
 *
 * Source-of-truth: corridorAlignment.generated.ts (each addendum may carry
 * a `formId`). This module inverts that mapping so the application can
 * answer "which policy is this form an addendum of?" in O(1).
 *
 * DO NOT EDIT — re-run when corridorAlignment.generated.ts changes.
 */
import { corridorAlignment } from './corridorAlignment.generated';

export interface FormAddendumBinding {
  formId: string;
  parentPolicyId: string;
  addendumKey: string;
  label: string;
}

const bindings: Record<string, FormAddendumBinding> = (() => {
  const out: Record<string, FormAddendumBinding> = {};
  for (const [policyId, alignment] of Object.entries(corridorAlignment)) {
    for (const a of alignment.addendums) {
      if (!a.formId) continue;
      if (out[a.formId]) {
        // First binding wins; later collisions are ignored to keep mapping stable.
        continue;
      }
      out[a.formId] = {
        formId: a.formId,
        parentPolicyId: policyId,
        addendumKey: a.key,
        label: a.label,
      };
    }
  }
  return out;
})();

export function getParentPolicyForForm(formId: string): FormAddendumBinding | undefined {
  return bindings[formId];
}

export function getFormAddendumsForPolicy(policyId: string): FormAddendumBinding[] {
  const out: FormAddendumBinding[] = [];
  for (const b of Object.values(bindings)) {
    if (b.parentPolicyId === policyId) out.push(b);
  }
  return out;
}

export const formAddendumBindings = bindings;
