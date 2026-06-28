/**
 * verifyBradFormRendering.ts
 * Verifies type-aware reference targets + the fillable-form path the right panel uses.
 *
 * Run: npx tsx --tsconfig tsconfig.app.json scripts/verifyBradFormRendering.ts
 */
// Minimal localStorage shim so the draft store persists during the test.
const __store = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => (__store.has(k) ? __store.get(k)! : null),
  setItem: (k: string, v: string) => { __store.set(k, v); },
  removeItem: (k: string) => { __store.delete(k); },
};

import { resolveBradReference } from '../src/policy/utils/bradReferenceResolver';
import { resolveForm, isFormSignable } from '../src/policy/utils/bradFormResolver';
import { saveDraft, loadDraft, clearDraft } from '../src/policy/services/bradFormDraftStore';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import type { FormContent } from '../src/policy/data/formsLibraryContent';

const failures: string[] = [];
let passed = 0;
const check = (cond: unknown, msg: string) => { if (cond) passed++; else failures.push(msg); };

const EDITABLE = new Set(['text', 'date', 'select', 'checkbox', 'radio', 'textarea', 'number', 'email', 'tel']);

console.log('=== Brad fillable-form rendering verification ===\n');

// ── 1) Typed targets dispatch by kind (policy/workflow/form/help/event). ──────
const sampleForm = FORMS_DATASET[0];
const formRef = resolveBradReference({ type: 'form', id: sampleForm.id, title: sampleForm.name });
check(formRef.resolvable && formRef.target?.kind === 'form', 'form reference must resolve with target.kind === "form"');
check(formRef.target?.kind === 'form' && formRef.target.formId === sampleForm.id, 'form target must carry the canonical formId');
console.log(`  form target: ${formRef.target?.kind} ${formRef.resolverKey}`);

// ── 2) Form resolves to a schema with EDITABLE controls (not raw text). ───────
const rf = resolveForm(sampleForm.id);
check(!!rf, 'resolveForm must return the operational form');
const editableFieldCount = (rf?.content.sections ?? []).reduce((n, s) => {
  const fields = (s.fields ?? []).filter((f) => EDITABLE.has(f.type)).length;
  const checklist = s.items?.length ?? 0;
  return n + fields + checklist;
}, 0);
check(editableFieldCount > 0, 'form schema must expose editable controls (fillable, not raw text)');
console.log(`  ${sampleForm.id} "${sampleForm.name}" → ${rf?.content.sections.length} sections, ${editableFieldCount} editable controls`);

// ── 3) Signability gating (eCIgn only when signable). ────────────────────────
const signableYes: FormContent = { id: 'x', title: 'x', type: 'Attestation', domainCode: 'CL', policies: [], purpose: '', instructions: '', version: '1', effectiveDate: '', revisionDate: '', orientation: 'portrait', sections: [{ title: 'Sign', layout: 'signature' }], signatures: [{ role: 'Completed By' }] };
const signableNo: FormContent = { id: 'y', title: 'y', type: 'Reference', domainCode: 'CL', policies: [], purpose: '', instructions: '', version: '1', effectiveDate: '', revisionDate: '', orientation: 'portrait', sections: [{ title: 'Info', layout: 'grid', fields: [{ label: 'Name', type: 'text' }] }] };
check(isFormSignable(signableYes) === true, 'attestation/signature schema → signable');
check(isFormSignable(signableNo) === false, 'grid-only/reference schema → NOT signable');
// At least one real form is signable (so the eCIgn button can appear in practice).
const aSignable = FORMS_DATASET.map((f) => resolveForm(f.id)).find((r) => r?.signable);
check(!!aSignable, 'at least one real form must be signable');
console.log(`  signable example: ${aSignable?.formId} "${aSignable?.record.name}"`);

// ── 4) Draft persistence (values survive close/reopen; instance is stable). ──
clearDraft(sampleForm.id);
const d1 = saveDraft(sampleForm.id, { 's0-f0': 'Jane Aide', 's0-f1': 'RN' }, 'draft');
const reopened = loadDraft(sampleForm.id);
check(!!reopened, 'saved draft must reload');
check(reopened?.values['s0-f0'] === 'Jane Aide', 'entered values must persist after reopen');
check(reopened?.instanceId === d1.instanceId, 'reopened draft keeps the same instance id');
const d2 = saveDraft(sampleForm.id, { 's0-f0': 'Jane Aide', 's0-f1': 'RN', 's1-chk0': true }, 'in_review');
check(d2.instanceId === d1.instanceId, 'updating a draft reuses the same form instance');
check(loadDraft(sampleForm.id)?.status === 'in_review', 'status update (send for review) persists');
console.log(`  draft instance: ${d1.instanceId.slice(0, 24)}… persisted + updated`);
clearDraft(sampleForm.id);

// ── 5) Missing / invalid form → unavailable (never a raw-text fallback). ─────
check(resolveForm('ZZ-FAKE-999') === null, 'unknown form id must resolve to null (Form unavailable)');
const fakeFormRef = resolveBradReference({ type: 'form', id: 'ZZ-FAKE-999', title: 'Nonexistent Imaginary Form XYZ' });
check(!fakeFormRef.resolvable && !fakeFormRef.target, 'fake form reference must be non-clickable (no target)');

// ── 6) Other families still dispatch to their own viewers. ───────────────────
const policyRef = resolveBradReference({ type: 'policy', id: 'CL-PR-001', title: 'Patient Rights & Responsibilities' });
check(policyRef.target?.kind === 'policy', 'policy reference → policy target');
console.log(`  policy target: ${policyRef.target?.kind} (${policyRef.routePath})`);

console.log(`\n=== ${passed} checks passed, ${failures.length} failed ===`);
if (failures.length) { failures.forEach((f) => console.log('  - ' + f)); process.exit(1); }
console.log('\nALL FILLABLE-FORM CHECKS PASSED.');
