/* Canonical control-registry generator (P3).
   ONE source of truth: the primary public JSON + the EXTRA (CTRL-105…116) TS
   records are MERGED into it, provenance is stamped, and all duplicate public
   copies are rewritten from that single merged result. Removes the 104-JSON /
   12-TS split. Run: npm run controls:generate */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { EXTRA_MASTER_CONTROL_SOURCE_RECORDS } from '@/policy/data/masterControlDocumentation.generated';

const ROOT = process.cwd();
const CANONICAL = 'public/MASTER_CONTROL_INVENTORY_DATA_MODEL.json';
export const REGISTRY_COPIES = [
  CANONICAL,
  'public/data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
  'public/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
  'public/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
];

const source = JSON.parse(readFileSync(path.join(ROOT, CANONICAL), 'utf8')) as { meta?: Record<string, unknown>; controls: any[] };
const byId = new Map<string, any>();
for (const c of source.controls) byId.set(c.id, c);
for (const extra of EXTRA_MASTER_CONTROL_SOURCE_RECORDS as any[]) {
  if (byId.has(extra.id)) throw new Error(`Duplicate control id ${extra.id}: EXTRA record collides with a JSON control`);
  byId.set(extra.id, extra);
}
const controls = [...byId.values()];
const controlsHash = createHash('sha256').update(JSON.stringify(controls)).digest('hex').slice(0, 16);

const out = {
  meta: {
    ...(source.meta ?? {}),
    schema_version: (source.meta?.schema_version as string) ?? '1.0.0',
    total_controls: controls.length,
    canonical_source: CANONICAL,
    controls_hash: controlsHash,
    generated_note: `AUTO-GENERATED via 'npm run controls:generate' — DO NOT EDIT COPIES DIRECTLY. Single canonical source: ${CANONICAL}`,
    generated_by: 'controls:generate',
  },
  controls,
};
const text = JSON.stringify(out, null, 2) + '\n';
for (const rel of REGISTRY_COPIES) writeFileSync(path.join(ROOT, rel), text);

console.log(`controls:generate — ${controls.length} controls (was ${source.controls.length} JSON + ${(EXTRA_MASTER_CONTROL_SOURCE_RECORDS as any[]).length} extra), hash ${controlsHash}`);
console.log(`synced ${REGISTRY_COPIES.length} copies from canonical ${CANONICAL}`);
