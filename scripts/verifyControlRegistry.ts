/* Control-registry drift gate (P3). Fails (exit 1) when the canonical registry
   and its public copies drift, the count metadata is stale, duplicate control
   IDs exist, or the loader re-introduces a split source.
   Run: npm run controls:verify */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = process.cwd();
const COPIES = [
  'public/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
  'public/data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
  'public/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
  'public/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
];
const sha = (s: string): string => createHash('sha256').update(s).digest('hex').slice(0, 16);
const pass: string[] = []; const fail: string[] = [];
const chk = (l: string, c: boolean): void => { (c ? pass : fail).push(l); };

const texts = COPIES.map((rel) => { try { return readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return null; } });
chk('canonical registry present', texts[0] != null);
const hashes = texts.map((t) => (t == null ? 'MISSING' : sha(t)));
chk('all 4 registry copies byte-identical', new Set(hashes).size === 1 && hashes[0] !== 'MISSING');

let j: any;
try { j = texts[0] ? JSON.parse(texts[0]) : null; } catch { j = null; }
chk('canonical registry parses', !!j);
if (j) {
  const controls: any[] = j.controls ?? [];
  const ids = controls.map((c) => c.id);
  chk('meta.total_controls === controls.length', j.meta?.total_controls === controls.length);
  chk('no duplicate control IDs', new Set(ids).size === ids.length);
  chk('meta.controls_hash matches controls array', j.meta?.controls_hash === sha(JSON.stringify(controls)));
  chk('meta carries canonical provenance', typeof j.meta?.generated_note === 'string' && /AUTO-GENERATED/.test(j.meta.generated_note));
}
const loader = (() => { try { return readFileSync(path.join(ROOT, 'src/policy/data/masterControlInventory.ts'), 'utf8'); } catch { return ''; } })();
chk('loader does NOT re-append a split EXTRA source', !/\.\.\.\s*EXTRA_MASTER_CONTROL_SOURCE_RECORDS/.test(loader));

console.log(`\nControl-registry drift gate — ${pass.length} passed, ${fail.length} failed\n`);
for (const p of pass) console.log(`  ✓ ${p}`);
if (fail.length) { console.log('\nFAILED:'); for (const f of fail) console.log(`  ✗ ${f}`); process.exit(1); }
console.log('\n✅ One canonical registry; copies in sync; count + IDs consistent.\n');
