# Task identity and duplicate React key fix

## Summary

Calendar and workflow UI showed duplicate React keys and legacy-looking task IDs (for example `TASK-EVT-…PROCESSFLOW-…` without a clear deterministic suffix) when persisted `taskOverridesByEventId` disagreed with canonical IDs, merge paths left `mergedById` stale after a source-key merge, **`processflow:` vs `processFlow:`** casing split one logical step into two rows, **`updateTask` allowed `patch` to overwrite identity fields**, and the compliance snapshot could build **`eventPackages` twice for the same `RegulatoryEvent.id`** (seed + autogen/trigger overlap), which duplicated every CES execution unit id across the flatMap.

## Root cause (this pass)

1. **Duplicate regulatory rows in scoped CES input** — `useComplianceExecution` concatenated `REGULATORY_EVENTS`, `generatedEvents`, and `triggeredEvents` without deduping by `event.id`. Any overlap re-ran `buildEventExecutionDataflow` for the same event twice, producing **duplicate `cesExecutionUnits` entries with identical `task.id`** (108 warnings matched “every task duplicated once” patterns).

2. **Override merge bookkeeping** — After merging by `taskSourceId`, **`mergedById` was not updated** to the merged object reference, so downstream logic could keep a stale row alongside the canonical row in edge cases.

3. **Persisted `taskSourceId` casing** — Overrides saved as `processflow:stepId` did not match derived keys `processFlow:stepId`, so merge treated them as separate tasks until normalization ran late enough to collide in UI lists.

4. **`updateTask` spread** — `{ ...before, ...patch, id: canonicalTaskId }` still let **`patch.taskSourceId` / `patch.taskSourceType`** replace canonical identity.

## What changed (files)

| Area | File | Change |
|------|------|--------|
| Source id + render safety | `src/policy/compliance-execution/taskIdentity.ts` | Added **`canonicalizeTaskSourceId`**, **`normalizeAndDedupeTasksForRender`**, hardened **`mergeDerivedEventTasksWithOverrides`** (canonical keys on derived, **`mergedById` sync on source merge**, **`mergedBySource` update when merging by id**), **`buildTaskIdRemapForEventInstance`** passes canonical source ids. |
| Compliance snapshot | `src/policy/compliance-execution/complianceExecutionStore.ts` | **Dedupe `regEvents` by `id`** after scope filter so each event builds one package. |
| Store identity | `src/policy/stores/regulatoryExecutionStore.ts` | **`updateTask`** strips identity fields from `patch` before merge; persist **`version` → `4`** with **`migrate` for `version < 4`** re-running **`migrateRegExecutionV3Shape`** so v3 stores get another normalization pass without manual `localStorage` clears. |
| Barrel | `src/policy/compliance-execution/index.ts` | Export **`taskIdentity`** helpers. |
| Verification | `scripts/verifyTaskIdentity.ts` | Tests for **long prefix ids**, **`processflow:` merge**, **`canonicalizeTaskSourceId`**. |
| Browser QA | `scripts/checkCalendarTaskKeys.mjs`, `package.json` | **`npm run verify:calendar-keys`** — Playwright loads one or more routes (`ROUTES` env, default `/calendar`), listens for console duplicate-key warnings, writes JSON + screenshots under `Builder/_system/`. |

Prior work (still in force): `normalizeEventTaskIdentity`, `evidenceTaskIdMatchesTask`, `createTask` via **`buildDeterministicTaskId`**, **`mergeDerivedEventTasksWithOverrides`** pinning `id` on override merge, **`migrateRegExecutionV3Shape`** for evidence / form instance / audit remaps.

## Migration / localStorage

- Persist name remains **`reg-execution-v2`**.
- **Target version is `4`.** On rehydrate from stored versions **&lt; 4**, **`migrateRegExecutionV3Shape` runs again** (idempotent: normalize overrides, dedupe, remap evidence and form instance `taskId`s, certification snapshot tasks, task audit `entityId`).
- **localStorage is preserved**; users are not asked to clear it.

## Browser acceptance (mandatory)

| Item | Result |
|------|--------|
| Route(s) | See **§ Verification session (LOCKED audit)** below. |
| Action | Playwright per route: `networkidle`, **2.5s** settle, optional **Tasks** tab, screenshot. |
| Console | **`duplicateKeyCount`: 0** aggregate across tested routes. |
| Artifact | `Builder/_system/calendar_duplicate_key_check.json` |
| Screenshots | One PNG per route under `Builder/_system/screenshots/browser-acceptance-delta/`. |

**Note:** On Windows, Vite often serves **`localhost` only**; use `BASE_URL=http://localhost:<port>` for `verify:calendar-keys` if `127.0.0.1` returns `ERR_CONNECTION_REFUSED`.

## Commands

- `npm run verify:task-identity` — merge, casing, long-prefix id, dedupe checks (PASS in CI-style run).
- `npm run verify:calendar-keys` — requires dev server; set **`BASE_URL`** (and optional comma-separated **`ROUTES`**) if not on port 5173.

## Build note

`npm run build` (`tsc -b && vite build`) may still fail on **unrelated** TypeScript errors elsewhere in the repo (`WorkflowExecutionPanel`, `SharedPolicyDetailView`, `AuditModePage`, `EvidenceCenterPage`); this task identity change set does not touch those files.

## Acceptance criteria mapping

| Criterion | Status |
|-----------|--------|
| `/calendar` duplicate React key warnings | **0** in Playwright run above. |
| ProcessFlow task ids use deterministic builder | Unchanged contract; casing + dedupe reduce legacy leakage. |
| No duplicate `task.id` in merged calendar task arrays | Addressed by **event dedupe** + merge bookkeeping + **`normalizeAndDedupeTasksForRender`** at end of merge. |
| Survives refresh | Yes — persist v4 repair on upgrade. |
| No manual `localStorage` clear | Yes — migration v4. |
| CES redesign / feature creep | **Not done** — bugfix only. |

---

## Verification session (LOCKED audit — task identity only)

**Overall:** **PASS** for automated checks below. **Manual** checklist (hard refresh ×2, specific event that previously warned) remains for the operator in a real browser profile with production-like `localStorage`; this agent cannot substitute that session.

### 1. Static code verification

| Check | Result |
|-------|--------|
| `REGULATORY_EVENTS` + generated + triggered deduped by `event.id` before `eventPackages` | **PASS** — `complianceExecutionStore.ts`: `regEventsScoped` then `filter((e, idx, arr) => arr.findIndex(x => x.id === e.id) === idx)`. |
| `canonicalizeTaskSourceId` normalizes `processflow:` → `processFlow:` | **PASS** — `taskIdentity.ts` lines 7–20; `verify:task-identity` includes explicit check. |
| `mergeDerivedEventTasksWithOverrides` updates `mergedById` and `mergedBySource` after merges | **PASS** — source merge sets both maps (lines 188–189); id-merge sets `mergedById` and `mergedBySource` when `merged.taskSourceId` (206–207). |
| Override patches cannot overwrite identity | **PASS** — `updateTask` omits `id`, `eventId`, `taskSourceId`, `taskSourceType`, `legacyId` from `patch` before spread; pins `taskSourceId` / `taskSourceType` from `before`. **`sourceIndex`:** not present on `EventTask` in `types.ts`; N/A. |
| `normalizeAndDedupeTasksForRender` before React task arrays | **PASS** — invoked at end of `mergeDerivedEventTasksWithOverrides`; `useEventExecutionDataflow` uses that merge for `tasks` (line 102). |
| Persist migration version **4**; `version < 4` re-runs `migrateRegExecutionV3Shape` | **PASS** — `regulatoryExecutionStore.ts` `version: 4`, migrate blocks for `< 3` and `< 4`. |
| `localStorage` key **`reg-execution-v2`**; not cleared by code | **PASS** — `name: 'reg-execution-v2'` unchanged; `resetAll` is unrelated manual action. |

### 2. Script verification (executed)

```text
npm run verify:task-identity
```

**Result:** **PASS** (all checks OK, exit 0).

```powershell
$env:BASE_URL="http://localhost:5173"
$env:ROUTES="/calendar,/calendar?view=sprint,/calendar?view=kanban,/calendar?view=gantt,/audit"
npm run verify:calendar-keys
```

**Result:** **PASS** — `duplicateKeyCount`: **0** (aggregate). **Browser port:** **5173**.

**JSON output path:** `Builder/_system/calendar_duplicate_key_check.json`

**Screenshots (this run):**

- `Builder/_system/screenshots/browser-acceptance-delta/duplicate-key-check-1778266343531--calendar.png`
- `duplicate-key-check-1778266343531--calendar-view-sprint.png`
- `duplicate-key-check-1778266343531--calendar-view-kanban.png`
- `duplicate-key-check-1778266343531--calendar-view-gantt.png`
- `duplicate-key-check-1778266343531--audit.png`

### 3. Manual browser verification (operator)

Automated Playwright uses a **fresh context** each run (does not clear your disk `localStorage`; it simply has empty store until app seeds). For the **final** acceptance you requested (same profile, **hard refresh**, **no** `localStorage` clear, repeat visit to the event that produced **108** warnings):

- [ ] Hard refresh on `/calendar`
- [ ] Open that event / expand tasks / drawer / task panel / tabs as before
- [ ] Refresh again; repeat once
- [ ] Confirm DevTools console: **0** duplicate key warnings

**Claim rule:** Do not mark this final manual block **PASS** until the above is confirmed on your machine.

### 4. Cross-view regression (automated subset)

Same Playwright run as §2 covered **`/calendar`**, **`/calendar?view=sprint|kanban|gantt`**, and **`/audit`**. **PASS** (no duplicate-key console messages).

### 5. Compliance regression spot check

**Not executed** in this verification pass (no scripted harness for form gating, eCIgn, readiness score). Prior implementation still uses `evidenceTaskIdMatchesTask` in dataflow / `WorkflowExecutionPanel`; no edits were made in this session. Recommend a short manual smoke on form complete, evidence link, and audit row after manual §3.

### 6. `npm run build`

**FAIL** (exit 2) — **unrelated** TypeScript errors only:

- `WorkflowExecutionPanel.tsx` (null vs undefined)
- `SharedPolicyDetailView.tsx` (missing props / comparison)
- `AuditModePage.tsx` (unused import)
- `EvidenceCenterPage.tsx` (`EvidenceFile` shape)

These do **not** block the task-identity scripts or the Playwright duplicate-key verification while `vite` dev server runs.
