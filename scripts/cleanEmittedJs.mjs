// Removes stale TypeScript emit (*.js) accidentally written into src/.
//
// This is a Vite + TypeScript project with `"noEmit": true`. Vite's default
// module resolution tries `.js` BEFORE `.tsx`, so any compiled `*.js` sitting
// next to a `.ts`/`.tsx` source is loaded INSTEAD of the source and silently
// hides real changes. These files come from running an *emitting* `tsc`
// (e.g. `tsc <file>` or `--noEmit false`), which ignores tsconfig's noEmit.
//
// Runs automatically before `npm run dev` and `npm run build`. Safe & idempotent:
// only deletes a `.js` when a `.ts` or `.tsx` sibling exists. A genuine `.js`
// with no TS sibling (none today) is left untouched.
import { readdir, rm, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function* walk(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) yield* walk(full);
      else if (e.isFile() && e.name.endsWith('.js')) yield full;
    }
  } catch { return; }
}

let removed = 0;
const kept = [];
for await (const js of walk(SRC)) {
  const base = js.slice(0, -3); // strip ".js"
  if ((await exists(base + '.ts')) || (await exists(base + '.tsx'))) {
    await rm(js);
    removed++;
  } else {
    kept.push(js); // genuine hand-written .js (no TS sibling) — leave it
  }
}

if (removed > 0) {
  console.log(`[clean-emitted-js] Removed ${removed} stale .js shadow(s) from src/ — these were hiding your .tsx changes.`);
}
if (kept.length > 0) {
  console.log(`[clean-emitted-js] Left ${kept.length} genuine .js file(s) with no TS sibling:`);
  for (const k of kept) console.log(`  - ${k}`);
}
