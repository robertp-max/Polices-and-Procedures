/**
 * verifyBradReferenceResolver.ts
 * Verifies Brad's internal references resolve to real, openable documents and
 * that missing references degrade gracefully (no blank/clickable dead links).
 *
 * Run: npx tsx --tsconfig tsconfig.app.json scripts/verifyBradReferenceResolver.ts
 */
import { resolveBradReference, type BradReferenceInput } from '../src/policy/utils/bradReferenceResolver';
import { POLICY_CORPUS } from '../src/policy/data/policyCorpus';
import { WORKFLOWS } from '../src/policy/data/workflows.generated';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import { HELP_ARTICLES } from '../src/policy/data/helpArticles';
import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';

const failures: string[] = [];
let passed = 0;
function check(cond: unknown, msg: string) { if (cond) passed++; else failures.push(msg); }

// ── 1) Each document family opens in the right panel with a correct route. ──
const samplePolicy = POLICY_CORPUS[0];
const sampleWfId = Object.keys(WORKFLOWS)[0];
const sampleWf = (WORKFLOWS as Record<string, { title?: string }>)[sampleWfId];
const sampleForm = FORMS_DATASET[0];
const sampleHelpId = Object.keys(HELP_ARTICLES)[0];
const sampleHelp = (HELP_ARTICLES as Record<string, { title?: string }>)[sampleHelpId];
const sampleEvent = (REGULATORY_EVENTS as ReadonlyArray<{ id: string; title: string }>)[0];

const familyCases: Array<{ label: string; input: BradReferenceInput; routePrefix: string }> = [
  { label: 'policy', input: { type: 'policy', id: samplePolicy.id, title: samplePolicy.title }, routePrefix: '/library/' },
  { label: 'workflow', input: { type: 'workflow', id: sampleWfId, title: sampleWf?.title ?? sampleWfId }, routePrefix: '/workflows/' },
  { label: 'form', input: { type: 'form', id: sampleForm.id, title: sampleForm.name }, routePrefix: '/forms/' },
  { label: 'help', input: { type: 'help', id: sampleHelpId, title: sampleHelp?.title ?? sampleHelpId }, routePrefix: '/help/' },
  { label: 'event', input: { type: 'event', id: sampleEvent.id, title: sampleEvent.title }, routePrefix: '/ces/events' },
];

console.log('=== Brad reference resolver verification ===\n');
console.log('Document-family resolution (opens correct viewer in right panel):');
for (const c of familyCases) {
  const r = resolveBradReference(c.input);
  check(r.resolvable, `${c.label}: sample reference should resolve (${c.input.id})`);
  check(r.type === c.label, `${c.label}: resolved type mismatch (${r.type})`);
  check(!!r.routePath && r.routePath.startsWith(c.routePrefix), `${c.label}: route should start ${c.routePrefix} (got ${r.routePath})`);
  check(r.resolverKey === `${r.type}:${r.id}`, `${c.label}: resolverKey malformed (${r.resolverKey})`);
  check(r.preview.lines.length > 0, `${c.label}: preview must not be blank`);
  console.log(`  ${c.label.padEnd(9)} ${r.resolvable ? 'OPEN' : 'n/a '} ${r.routePath ?? ''}  (${r.matchKind})`);
}

// ── 2) Brad's emitted references map to real documents (exact or title). ─────
console.log('\nBrad playbook references → real documents:');
const bradRefs: BradReferenceInput[] = [
  { type: 'policy', id: 'CL-PR-001', title: 'Patient Rights & Responsibilities' },
  { type: 'policy', id: 'CL-PR-006', title: 'Abuse, Neglect & Exploitation Reporting' },
  { type: 'policy', id: 'OP-PA-001', title: 'Patient Complaint & Grievance Resolution' },
  { type: 'policy', id: 'RM-INC-001', title: 'Incident / Adverse Event Reporting' },
  { type: 'policy', id: 'QA-QAPI-001', title: 'QAPI / Corrective Action' },
  { type: 'policy', id: 'CL-DOC-001', title: 'Documentation Requirements' },
  { type: 'policy', id: 'CL-MR-001', title: 'Mandatory Reporting' },
];
let resolvedCount = 0;
for (const ref of bradRefs) {
  const r = resolveBradReference(ref);
  if (r.resolvable) resolvedCount++;
  console.log(`  ${ref.title.padEnd(42)} → ${r.resolvable ? `${r.type}:${r.id} (${r.matchKind})` : 'UNAVAILABLE'}`);
}
// Core rights/abuse/grievance references must resolve exactly.
for (const id of ['CL-PR-001', 'CL-PR-006', 'OP-PA-001']) {
  const r = resolveBradReference(bradRefs.find((b) => b.id === id)!);
  check(r.resolvable && r.matchKind === 'exact-id', `core reference ${id} must resolve by exact id`);
}
check(resolvedCount >= 6, `expected ≥6/7 Brad references to resolve, got ${resolvedCount}`);

// ── 3) Missing references degrade gracefully (no blank/clickable dead link). ─
console.log('\nMissing-reference handling:');
const fake: BradReferenceInput = { type: 'policy', id: 'ZZ-FAKE-999', title: 'Quantum Teleportation Compliance Directive' };
const fr = resolveBradReference(fake);
check(!fr.resolvable, 'fake reference must be unresolvable');
check(!fr.routePath, 'unresolvable reference must NOT carry a route (no dead link)');
check(fr.matchKind === 'none', 'fake reference matchKind should be none');
check(fr.preview.lines.length > 0, 'unresolvable reference must still have a non-blank panel message');
console.log(`  ${fake.title} → resolvable=${fr.resolvable} route=${fr.routePath ?? 'none'} panel="${fr.preview.lines[0]}"`);

console.log(`\n=== ${passed} checks passed, ${failures.length} failed ===`);
if (failures.length) { failures.forEach((f) => console.log('  - ' + f)); process.exit(1); }
console.log('\nALL REFERENCE-RESOLVER CHECKS PASSED.');
