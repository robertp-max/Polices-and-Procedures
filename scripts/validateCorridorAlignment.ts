/**
 * scripts/validateCorridorAlignment.ts
 * ─────────────────────────────────────────────────────────────
 * Validates the Corridor alignment metadata against canonical
 * policy and form registries.
 *
 * Checks:
 *   1. DUPLICATE policy IDs in alignment record
 *   2. ALIGNMENT COVERAGE: every framework policy ID has a record
 *   3. ORPHAN alignment records (alignment refers to non-existent policy ID)
 *   4. BROKEN cross-references (relatedPolicies → unknown ID)
 *   5. UNREGISTERED form IDs (addendum.formId not in FORMS_CATALOG)
 *
 * Run:
 *   npx tsx --tsconfig tsconfig.app.json scripts/validateCorridorAlignment.ts
 * ─────────────────────────────────────────────────────────────
 */
import { corridorAlignment } from '../src/policy/data/corridorAlignment.generated';
import { frameworkPolicies } from '../src/policy/data/frameworkSeed.generated';
import { FORMS_CATALOG } from '../src/policy/data/formsCatalog';

type Issue = { kind: string; detail: string };

const issues: Issue[] = [];

// 1. duplicate IDs in alignment object (impossible under TS object semantics
//    but verify deterministic order + count).
const alignmentIds = Object.keys(corridorAlignment);
const uniqueAlignmentIds = new Set(alignmentIds);
if (alignmentIds.length !== uniqueAlignmentIds.size) {
  issues.push({ kind: 'DUPLICATE', detail: 'corridorAlignment has duplicate keys (data corruption)' });
}

// 2 + 3. coverage / orphans
const frameworkIds = new Set(frameworkPolicies.map(p => p.id));
const missingCoverage: string[] = [];
const orphanAlignment: string[] = [];

for (const id of frameworkIds) {
  if (!corridorAlignment[id]) missingCoverage.push(id);
}
for (const id of uniqueAlignmentIds) {
  if (!frameworkIds.has(id)) orphanAlignment.push(id);
}

// 4. broken relatedPolicies refs
const brokenRefs: { policyId: string; missingRef: string }[] = [];
for (const [policyId, rec] of Object.entries(corridorAlignment)) {
  for (const ref of rec.relatedPolicies) {
    if (!frameworkIds.has(ref)) brokenRefs.push({ policyId, missingRef: ref });
  }
}

// 5. unregistered form IDs
const formIds = new Set(Object.keys(FORMS_CATALOG));
const unregisteredForms: { policyId: string; formId: string; addendumKey: string }[] = [];
for (const [policyId, rec] of Object.entries(corridorAlignment)) {
  for (const a of rec.addendums) {
    if (a.formId && !formIds.has(a.formId)) {
      unregisteredForms.push({ policyId, formId: a.formId, addendumKey: a.key });
    }
  }
}

const reviewed = Object.values(corridorAlignment).filter(r => !r.requiresReview).length;
const pending = Object.values(corridorAlignment).filter(r => r.requiresReview).length;

console.log('\n══════════════════════════════════════════════════════');
console.log('  Corridor Alignment Validation');
console.log('══════════════════════════════════════════════════════');
console.log(`  Framework policy IDs       : ${frameworkIds.size}`);
console.log(`  Alignment records          : ${uniqueAlignmentIds.size}`);
console.log(`    - reviewed (authored)    : ${reviewed}`);
console.log(`    - REQUIRES REVIEW (default): ${pending}`);
console.log(`  Missing alignment coverage : ${missingCoverage.length}`);
console.log(`  Orphan alignment records   : ${orphanAlignment.length}`);
console.log(`  Broken cross-references    : ${brokenRefs.length}`);
console.log(`  Unregistered form IDs      : ${unregisteredForms.length}`);
console.log('──────────────────────────────────────────────────────');

if (missingCoverage.length) {
  console.log('\nMISSING COVERAGE:');
  for (const id of missingCoverage) console.log(`  - ${id}`);
}
if (orphanAlignment.length) {
  console.log('\nORPHAN ALIGNMENT RECORDS (id not in framework):');
  for (const id of orphanAlignment) console.log(`  - ${id}`);
}
if (brokenRefs.length) {
  console.log('\nBROKEN CROSS-REFERENCES:');
  for (const b of brokenRefs) console.log(`  - ${b.policyId} → ${b.missingRef}`);
}
if (unregisteredForms.length) {
  console.log('\nUNREGISTERED FORM IDs (addendum.formId not in FORMS_CATALOG — register or treat as planned):');
  for (const u of unregisteredForms) console.log(`  - ${u.policyId} addendum ${u.addendumKey} → ${u.formId}`);
}

const fatal = missingCoverage.length + orphanAlignment.length + brokenRefs.length;
console.log('\n══════════════════════════════════════════════════════');
if (fatal === 0 && issues.length === 0) {
  console.log('  ✔ Alignment integrity: OK');
} else {
  console.log(`  ✖ Alignment integrity: ${fatal} fatal + ${issues.length} structural issue(s)`);
}
if (unregisteredForms.length) {
  console.log('  ! Unregistered form IDs are non-fatal (planned/future forms).');
}
console.log('══════════════════════════════════════════════════════\n');

process.exit(fatal === 0 ? 0 : 1);
