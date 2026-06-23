# Handoff — GPT takes "the rest of the app"; Claude keeps eCIgn + rest of CES

Date: 2026-06-22. Purpose: let GPT work the **rest of the V6 app in parallel** while Claude
continues **eCIgn** and the **remaining CES** work, without lane collisions.

## 0. Repo (V2 ONLY)
- Work in: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2`
- **NEVER touch the old Mock 5 repo** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures` (no commits, no dev server for V2 proof — see §6).
- Baseline branch: **`v2/designless-baseline`** @ **`8367c4a`** (current tip; in sync with origin).

## 1. Lane split (who owns what)

### GPT's lane — "rest of the app" (non-eCIgn, non-CES)
Screens/features and their data, e.g.:
- Dashboard, Clinicians/Clinician detail, Patients/Patient detail, Staffing Calendar.
- Journey/Onboarding (v1 + v2), Admin (users/roles/groups/permissions), Help Center, User Guide, System Documentation, Hubstaff, Framework.
- General V6 polish (rhythm, a11y, responsive) **outside** eCIgn/CES.
- Stage-B real-data reconnection for these screens where they are still mock (same "keep + derive conservatively, never fabricate" rule used for Policy/Forms).

Primary files: `src/v6/screens/**` and `src/v6/**` for the above, plus their pure data sources under `src/policy/data/**` **except** anything eCIgn/CES (see reserved list).

### Claude's lane — RESERVED, do NOT edit
- **eCIgn:** `src/v6/screens/pageviews/EcignWorkspaceScreen.tsx`; `src/policy/ecign/**` (including the new `src/policy/ecign/pathB/**` Phase-1 contracts); route `/forms/:formId/esign`; `server/ecign/**`, `server/googleEvidence.ts`, `googleDrive` integration.
- **CES / execution / QAPI:** CES screens + routes — `ces-calendar`, `ces-board`/Sprint Board, `master-controls`, `audit-mode`, `evidence-center`, `ces-reports`, `workflows` + `workflow-swimlane`, `events-board`, `achc-*`, `governance`, `artifact-viewer`, `surveyor-viewer`, `mobile-incident`; and CES/execution stores under `src/policy/**` (e.g. `regulatoryExecutionStore.ts`, evidence/regulatory modules).
- In-flight branch (do not touch): **`phase17/ecign-path-b-phase1-contracts-tests`** (eCIgn Path B Phase 1 contracts; approved, awaiting Phase 2).

> If GPT genuinely must edit a reserved/shared file, STOP and coordinate first — don't edit across the line.

### Already DONE on baseline (do not redo)
Policy Library (279 real), Forms Library (410 real), Policy Lifecycle + detail (real corpus), Form Viewer (real data + outer-border cleanup), Policy Detail (real content/sections), eCIgn Path A (source-grounded static model). eCIgn Path B = **plan + Phase-1 contracts only** (no runtime).

## 2. Non-negotiable guardrails (BOTH lanes)
1. **Never emit `.js` into `src/`** (AGENTS.md). Vite resolves `.js` before `.tsx` and silently shadows changes. Type-check ONLY with `npm run build`, `npx tsc -b`, or `npx tsc -p tsconfig.app.json --noEmit`. **Never** run bare `tsc <file>` / `tsc src/...` (it emits `.js`). Invariant: zero `*.js` under `src/` with a `.ts/.tsx` sibling.
2. **Designless/V6 gate must stay green:** `npm run verify:designless` (= `npm run build` + `scripts/check-designless.mjs`). No legacy colors (maroon/CI-ION/etc.), no legacy component identifiers, no CDNs, no banned fonts (Inter/Montserrat), no banned weights (600–900). Reused public route paths (`/library`, `/forms`, …) ARE allowed with V6-native components. Use design tokens only — no raw hex/rgb/hsl, no arbitrary `shadow-[...]`.
3. **Branch hygiene:** branch off `v2/designless-baseline`; integrate via **`git merge --ff-only`**; create a `backup/<phase>-<desc>-<date>-<HHmmss>` tag after each merge; **no force-push, no history rewrite, no broad merges**.
4. **Don't commit litter:** no logs (`*.log`, `build_*.txt`), screenshots (`tmp-ui-verify-screenshots/`), `.vscode/settings.json`, scratch `.txt`. Stage explicit paths — **never `git add -A`/`git add .`**.
5. **Never stage `server/ecign/data/*.jsonl`** — running the app appends runtime drift there. Restore with `git restore -- server/ecign/data/*.jsonl` before staging.

## 3. Validate before every commit
```
npm run verify:designless
npm run build
npx tsc -p tsconfig.app.json --noEmit
npm run lint            # see note
git diff --check
```
- **Lint note:** full-repo `npm run lint` currently reports ~7 pre-existing errors / ~10 warnings (e.g. `RepresentativeScreens.tsx` react-hooks) that are NOT from this work. Run targeted lint on your changed files (`npx eslint <files>`) and don't silence pre-existing errors with `ts-nocheck`/broad ignores.

## 4. Tests
- Convention: **`node:test` + `node:assert/strict`, run via `tsx`** (devDep). No vitest/jest. Do NOT add deps or a `test` script.
- Run: `npx tsx --test <files>` (e.g. `src/**/X.test.ts`). Use `it.todo(...)` for not-yet-implemented runtime specs; keep the default green.

## 5. Current branches / tags (reference)
- Baseline: `v2/designless-baseline` @ `8367c4a`.
- Claude in-flight: `phase17/ecign-path-b-phase1-contracts-tests` (reserved).
- Recent backup tags: `backup/phase15-policy-forms-reconnect-…`, `backup/phase16-form-viewer-border-cleanup-…`, `backup/phase16-ecign-path-a-v2-proof-…`.
- Suggested GPT branch prefix: `phaseX/app-<area>-<desc>` (e.g. `phase18/app-dashboard-stage-b`).

## 6. Preview gotcha (important for visual smoke)
`preview_start` is anchored to the session's primary cwd = the **OLD repo** and serves it on **port 5199** — NOT V2. Tell-tale: old Form Viewer shows "Continue Signing / Draft saved locally". To smoke **V2**, run V2's own Vite and point the browser at it (no old-repo edits):
```
"<V2>/node_modules/.bin/vite" "<V2-root>" --port 5200 --strictPort
```
then navigate the preview browser to `http://localhost:5200/...`. V2 has no `.claude/launch.json`; do not add one to the old repo.

## 7. Coordination
- Lanes are defined by file/route ownership (§1). Stay on your side.
- Integrate to baseline only via ff-only + backup tag; if baseline moved, rebase your feature branch onto it (or cherry-pick) — never broad-merge.
- Surface anything cross-cutting (shared `src/v6/components`, `tokens`, shell, router) before changing it, since both lanes depend on it.
