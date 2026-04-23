/* ═══════════════════════════════════════════════════════════════════════
   POLICY COVERAGE VERIFIER
   For each target policy: confirm (a) it's in the policy catalog,
   (b) all Forms Library artifacts linked to it exist,
   (c) any appendices cited in the policy map to Library forms or are
       internal-only, and (d) any missing artifacts are surfaced.
   ═══════════════════════════════════════════════════════════════════════ */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset.ts';
import { frameworkPolicies } from '../src/policy/data/frameworkSeed.generated.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const TARGET_POLICIES = [
  { id: 'EN-LC-001', file: 'EN-LC-001.md' },
  { id: 'CO-CA-001', file: 'CO-CA-001.md' },
  { id: 'EN-CM-001', file: 'EN-CM-001.md' },
  { id: 'EN-TG-001', file: 'EN-TG-001.md' },
  { id: 'RM-EP-001', file: 'RM-EP-001.md' },
  { id: 'RM-OS-001', file: 'RM-OS-001.md' },
  { id: 'RM-OS-002', file: 'RM-OS-002.md' },
  { id: 'RM-OS-003', file: 'RM-OS-003.md' },
  { id: 'RM-OS-004', file: 'RM-OS-004.md' },
];

const catalogIds = new Set(
  (frameworkPolicies as Array<{ id: string }>).map((p) => p.id),
);
const catalogById = new Map(
  (frameworkPolicies as Array<{ id: string; title?: string; domainCode?: string }>)
    .map((p) => [p.id, p]),
);

const formsById = new Map(FORMS_DATASET.map((f) => [f.id, f]));

// Build policy → forms reverse index
const policyToForms = new Map<string, string[]>();
for (const f of FORMS_DATASET) {
  for (const pol of f.policies) {
    if (!/^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/.test(pol)) continue;
    if (!policyToForms.has(pol)) policyToForms.set(pol, []);
    policyToForms.get(pol)!.push(f.id);
  }
}

interface CoverageResult {
  policyId: string;
  policyFile: string;
  inCatalog: boolean;
  catalogTitle?: string;
  linkedFormsFromLibrary: Array<{ id: string; name: string; type: string }>;
  referencedFormIDsInText: string[];
  referencedFormsFound: Array<{ id: string; name: string }>;
  referencedFormsMissing: string[];
  appendicesDeclared: string[];
  crossReferencedPolicies: string[];
  crossReferencedPoliciesMissing: string[];
  trainingFormRefs: string[];
  documentationRequirements: string[];
  gaps: string[];
}

const results: CoverageResult[] = [];

for (const tp of TARGET_POLICIES) {
  const filePath = path.join(ROOT, 'Builder', 'Documentations', tp.file);
  const text = fs.readFileSync(filePath, 'utf8');

  // Extract all policy IDs mentioned
  const policyRefs = Array.from(
    new Set(text.match(/\b[A-Z]{2,3}-[A-Z]{2}-\d{3}\b/g) || []),
  )
    .filter((id) => id !== tp.id)
    .sort();

  // Extract all form IDs (XX-FM-### or HR-JD-###)
  const formRefs = Array.from(
    new Set(text.match(/\b[A-Z]{2,3}-(FM|JD)-\d{3}\b/g) || []),
  ).sort();

  // Extract appendix declarations
  const appendices = Array.from(
    new Set(
      (text.match(/Appendix\s+[A-Z](?:\s*[—–-]\s*[^)\n|]+)?/gi) || []).map((s) =>
        s.trim().replace(/\s+/g, ' '),
      ),
    ),
  ).sort();

  // Extract Section 7 — Documentation Requirements (rough)
  const section7 = text.match(/##\s*7\.\s*Documentation Requirements([\s\S]*?)(?=\n##\s*8\.|\n---)/);
  const docReqs: string[] = [];
  if (section7) {
    const rows = section7[1].match(/^\|\s*[^|]+\|\s*[^|]+\|/gm) || [];
    for (const r of rows) {
      const firstCol = r.split('|')[1]?.trim();
      if (firstCol && !/^[-:\s]+$/.test(firstCol) && firstCol !== 'Requirement') {
        docReqs.push(firstCol);
      }
    }
  }

  const linkedFormsFromLibrary = (policyToForms.get(tp.id) || [])
    .sort()
    .map((fid) => {
      const rec = formsById.get(fid);
      return rec
        ? { id: rec.id, name: rec.name, type: rec.type }
        : { id: fid, name: '(unknown)', type: '?' };
    });

  const referencedFormsFound: Array<{ id: string; name: string }> = [];
  const referencedFormsMissing: string[] = [];
  for (const fid of formRefs) {
    const rec = formsById.get(fid);
    if (rec) referencedFormsFound.push({ id: fid, name: rec.name });
    else referencedFormsMissing.push(fid);
  }

  const crossRefMissing = policyRefs.filter((p) => !catalogIds.has(p));

  // Identify gaps
  const gaps: string[] = [];
  if (!catalogIds.has(tp.id)) gaps.push(`Policy ${tp.id} NOT in catalog`);
  if (linkedFormsFromLibrary.length === 0) gaps.push(`No forms in Library link to ${tp.id}`);
  if (referencedFormsMissing.length)
    gaps.push(`Form IDs cited in text but missing from Library: ${referencedFormsMissing.join(', ')}`);

  results.push({
    policyId: tp.id,
    policyFile: tp.file,
    inCatalog: catalogIds.has(tp.id),
    catalogTitle: catalogById.get(tp.id)?.title,
    linkedFormsFromLibrary,
    referencedFormIDsInText: formRefs,
    referencedFormsFound,
    referencedFormsMissing,
    appendicesDeclared: appendices,
    crossReferencedPolicies: policyRefs,
    crossReferencedPoliciesMissing: crossRefMissing,
    trainingFormRefs: [],
    documentationRequirements: docReqs,
    gaps,
  });
}

// Console summary
console.log('\n════════════════════════════════════════════════════════════════');
console.log(' POLICY COVERAGE VERIFICATION — 9 Target Policies');
console.log('════════════════════════════════════════════════════════════════\n');

for (const r of results) {
  console.log(`━━━ ${r.policyId} — ${r.catalogTitle || '(not in catalog)'}`);
  console.log(`  In catalog: ${r.inCatalog ? 'YES' : 'NO'}`);
  console.log(`  Forms in Library linked to this policy: ${r.linkedFormsFromLibrary.length}`);
  for (const f of r.linkedFormsFromLibrary) {
    console.log(`    ✓ ${f.id.padEnd(12)} ${f.type.padEnd(18)} ${f.name}`);
  }
  console.log(`  Form IDs cited in policy text: ${r.referencedFormIDsInText.length}`);
  console.log(`    found in library  : ${r.referencedFormsFound.length}`);
  console.log(`    missing           : ${r.referencedFormsMissing.length} ${r.referencedFormsMissing.length ? '(' + r.referencedFormsMissing.join(', ') + ')' : ''}`);
  console.log(`  Appendices declared in policy (internal): ${r.appendicesDeclared.length}`);
  console.log(`  Cross-referenced policies missing from catalog: ${r.crossReferencedPoliciesMissing.length}`);
  if (r.crossReferencedPoliciesMissing.length) {
    console.log('    ' + r.crossReferencedPoliciesMissing.join(', '));
  }
  if (r.gaps.length) {
    console.log(`  GAPS:`);
    for (const g of r.gaps) console.log(`    ! ${g}`);
  } else {
    console.log(`  GAPS: none`);
  }
  console.log('');
}

// Aggregate summary
const overall = {
  total: results.length,
  policiesInCatalog: results.filter((r) => r.inCatalog).length,
  policiesMissingFromCatalog: results.filter((r) => !r.inCatalog).map((r) => r.policyId),
  policiesWithNoLinkedForms: results.filter((r) => r.linkedFormsFromLibrary.length === 0).map((r) => r.policyId),
  totalReferencedFormsFound: results.reduce((s, r) => s + r.referencedFormsFound.length, 0),
  totalReferencedFormsMissing: results.reduce((s, r) => s + r.referencedFormsMissing.length, 0),
  missingFormIds: Array.from(
    new Set(results.flatMap((r) => r.referencedFormsMissing)),
  ).sort(),
  missingXrefPolicies: Array.from(
    new Set(results.flatMap((r) => r.crossReferencedPoliciesMissing)),
  ).sort(),
};

console.log('══════════════ OVERALL ══════════════');
console.log(JSON.stringify(overall, null, 2));

// Write raw JSON for downstream report
const outPath = path.join(ROOT, '.cache', 'forms-build', 'policy-coverage-9.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ overall, results }, null, 2));
console.log(`\nWrote ${outPath}`);
