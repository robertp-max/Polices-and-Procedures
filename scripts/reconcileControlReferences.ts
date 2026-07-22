/* Control-reference reconciliation (P2).
   Resolves every control's policy / form / workflow / regulation reference
   against the live registries and classifies each. Writes JSON + MD reports.
   Run: tsx --tsconfig tsconfig.app.json scripts/reconcileControlReferences.ts */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { FORM_TITLES } from '@/policy/data/formTitles.generated';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'REVIEW_OUTPUTS/master-controls-hardening');
mkdirSync(OUT, { recursive: true });

const raw = JSON.parse(readFileSync(path.join(ROOT, 'public/MASTER_CONTROL_INVENTORY_DATA_MODEL.json'), 'utf8'));
const controls: any[] = Array.isArray(raw) ? raw : (raw.controls ?? raw.inventory ?? []);

const policyIds = new Set<string>((POLICY_CORPUS as any[]).map((p) => p.id));
const formIds = new Set<string>([...(FORMS_DATASET as any[]).map((f) => f.id), ...Object.keys(FORM_TITLES)]);

let workflowIds = new Set<string>();
try {
  const W: Record<string, unknown> = await import('@/policy/data/workflows.generated');
  for (const v of Object.values(W)) {
    if (Array.isArray(v)) for (const it of v) { const id = (it as any)?.id; if (typeof id === 'string') workflowIds.add(id); }
  }
} catch { /* registry not importable → workflow refs flagged REVIEW_REQUIRED */ }

type Cls = 'EXACT' | 'MISSING' | 'EXTERNAL_RECORD' | 'REVIEW_REQUIRED';
const clsPolicy = (id: string): Cls => (policyIds.has(id) ? 'EXACT' : 'MISSING');
const clsForm = (id: string): Cls => (formIds.has(id) ? 'EXACT' : 'MISSING');
const clsWf = (id: string): Cls => (workflowIds.size ? (workflowIds.has(id) ? 'EXACT' : 'MISSING') : 'REVIEW_REQUIRED');

function extractForms(text: string): string[] {
  const out = new Set<string>(); const re = /([A-Z]{2})-FM-(\d{2,3})((?:\/\d{2,3})*)/g; let m;
  while ((m = re.exec(text))) { const pre = m[1]; out.add(`${pre}-FM-${m[2].padStart(3, '0')}`); if (m[3]) for (const n of m[3].split('/').filter(Boolean)) out.add(`${pre}-FM-${n.padStart(3, '0')}`); }
  return [...out];
}
function extractWf(text: string): string[] {
  const out = new Set<string>(); const re = /([A-Z]{2})-WF-(\d+)/g; let m;
  while ((m = re.exec(text))) out.add(`${m[1]}-WF-${m[2]}`);
  return [...out];
}

const results: any[] = [];
const summary: Record<string, number> = {};
const unresolved: any[] = [];
for (const c of controls) {
  const refs: any[] = [];
  for (const pid of (c.source_policy_ids ?? [])) {
    if (/-WF-/.test(pid)) refs.push({ kind: 'workflow', id: pid, classification: clsWf(pid) });
    else refs.push({ kind: 'policy', id: pid, classification: clsPolicy(pid) });
  }
  const ev = String(c.evidence_required ?? '');
  for (const fid of extractForms(ev)) refs.push({ kind: 'form', id: fid, classification: clsForm(fid) });
  for (const wid of extractWf(ev)) if (!refs.some((r) => r.id === wid)) refs.push({ kind: 'workflow', id: wid, classification: clsWf(wid) });
  if (c.regulatory_basis) refs.push({ kind: 'regulation', citation: String(c.regulatory_basis), classification: 'EXTERNAL_RECORD' });
  for (const r of refs) { summary[r.classification] = (summary[r.classification] ?? 0) + 1; if (r.classification === 'MISSING') unresolved.push({ control: c.id, ...r }); }
  results.push({ control: c.id, name: c.control_name, references: refs });
}

writeFileSync(path.join(OUT, 'CONTROL_REFERENCE_RECONCILIATION.json'), JSON.stringify({ generatedFrom: 'public/MASTER_CONTROL_INVENTORY_DATA_MODEL.json', controlCount: controls.length, registries: { policies: policyIds.size, forms: formIds.size, workflows: workflowIds.size }, summary, results }, null, 2));

const md = [
  '# CONTROL_REFERENCE_RECONCILIATION', '',
  `Controls: **${controls.length}** · Registries — policies ${policyIds.size}, forms ${formIds.size}, workflows ${workflowIds.size || '(unresolved import → WF refs REVIEW_REQUIRED)'}`, '',
  '## Classification totals', ...Object.entries(summary).sort().map(([k, v]) => `- ${k}: ${v}`), '',
  `## Unresolved (MISSING) references — ${unresolved.length}`,
  ...(unresolved.length ? unresolved.map((u) => `- ${u.control} → ${u.kind} \`${u.id}\``) : ['- none']),
].join('\n');
writeFileSync(path.join(OUT, 'CONTROL_REFERENCE_RECONCILIATION.md'), md + '\n');

console.log(`Reconciled ${controls.length} controls.`);
console.log('Totals:', JSON.stringify(summary));
console.log(`Unresolved (MISSING): ${unresolved.length}`);
console.log('Reports → REVIEW_OUTPUTS/master-controls-hardening/CONTROL_REFERENCE_RECONCILIATION.{json,md}');
