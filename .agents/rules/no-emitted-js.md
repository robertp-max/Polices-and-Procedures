---
trigger: always_on
description: Never run an emitting TypeScript compile — it writes .js into src/ that shadows .tsx and silently hides every change
---

# Never emit compiled `.js` into `src/`

This is a **Vite + TypeScript** project. `tsconfig.app.json` / `tsconfig.node.json`
set `"noEmit": true` on purpose. Vite's default module resolution tries `.js`
**before** `.tsx`, so any compiled `*.js` next to a `.tsx` is loaded **instead of**
the source — silently hiding every edit. A 24-agent UI redesign once appeared to
do nothing because **608 stale `.js` shadowed the real `.tsx`**. Do not recreate this.

## Forbidden
- ❌ `tsc <file>.tsx`, `tsc src/...`, or bare `tsc` pointed at files
  (this **ignores tsconfig and defaults to emit ON**, writing `.js` next to every source).
- ❌ `tsc --noEmit false` or anything that enables emit.

## Use instead
- Type-check (all honor `noEmit`): `npm run build` · `npx tsc -b` · `npx tsc -p tsconfig.app.json --noEmit`
- Verify a change renders: `npm run dev` · `npx vite build`

## Invariant
Zero `*.js` under `src/` that have a `.ts`/`.tsx` sibling. `predev`/`prebuild`
auto-delete them (`scripts/cleanEmittedJs.mjs`) and `src/**/*.js` is gitignored,
but the correct fix is to never run an emitting `tsc`.
