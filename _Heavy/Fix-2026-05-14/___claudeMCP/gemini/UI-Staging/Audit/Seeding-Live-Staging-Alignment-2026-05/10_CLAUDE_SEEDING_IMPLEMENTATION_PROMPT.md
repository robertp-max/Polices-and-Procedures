# Claude Task Prompt: V3 CES Seeding + Live/Harness Alignment (Seeding Execution)

**Date**: 2026-05-22  
**Role**: You are an expert full-stack engineer + frontend architect specializing in data seeding, React hook injection, realistic preview harnesses, **and V3 glass design adaptation** when real production components cannot be mounted directly.  
**Mission**: Execute the V3 seeding work so that the UI-Staging harness (`src/ui-staging/V3StagingApp.tsx`) can render **real (or high-fidelity harness-adapted) production CES surfaces** (especially the Calendar and Board) populated with rich, realistic V3 seed data, following the V3 glass language even when direct component mounting requires design adaptation. Align the harness with the live app under a single "Seeded Mode" toggle.

**Single Source of Truth** (read first, obey strictly):
- `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/UI-Staging/Audit/Seeding-Live-Staging-Alignment-2026-05/00_MASTER_ISSUES_FOR_CLAUDE.md`

All other Agent reports in the same folder (Agent_01 through Agent_09) provide detailed diagnostics, line numbers, and prior recommendations. Treat them as authoritative context.

You must also internalize the **current verified state** (as of latest exploration) documented below.

---

## Verified Current State (Do Not Re-Discover Everything)

### Live Production App (Already Largely Compliant)
- **One Dashboard rule is enforced**:
  - Only `/dashboard` (home) is the true Dashboard.
  - `/ces/calendar` is the official CES entry point and renders `<MasterCalendarPage />` via the thin `CesCalendarPage` wrapper.
  - `/ces/dashboard` is a redirect shim to `/ces/calendar`.
- `src/policy/ces/pages/CesDashboardPage.tsx` is a pure deprecated alias (`export const CesDashboardPage = CesCalendarPage`).
- `CommandCenterLayout.tsx` correctly labels the CES nav group "Compliance Execution (CES)" with first sub-item **"Calendar"**.
- Real components (`SprintExecutionBoard`, `CesLayout`, many drawers, `useComplianceExecution` consumers) already exist and are the target.

### Seeding Infrastructure (Already Exists — Build On It)
- `src/policy/compliance-execution/seededMode.tsx` — `SeededModeProvider` + `useSeededMode` + `useSeededSnapshot`.
- `src/policy/compliance-execution/complianceExecutionStore.ts:266` — `if (seededSnapshot) return seededSnapshot;` (the single injection point).
- `src/policy/ces/data/V3_CES_SnapshotBuilder.ts` + `V3_CES_SeedData.ts` — already produces a `ComplianceExecutionSnapshot` from V3 seeds and is wired into the harness root via `<SeededModeProvider buildSnapshot={buildV3SeededSnapshot}>`.
- Harness (`V3StagingApp.tsx`) already mounts the provider at the shell level and has a working `useV3Seeds` toggle surfaced via `useSeededMode`.
- For **ces-board**: when seeds are on, it already renders the real `<RealCesBoardPage />` (imported production `CesBoardPage`) in one code path (with a "Real Component" banner).
- **ces-calendar** is the current weak point: `CesCalendarPageStaging()` still renders a fully custom toy list (even when `useV3Seeds` is true). It does **not** yet delegate to real data/hooks or `MasterCalendarPage`.

### Critical Gaps (Your Primary Targets)
1. **Calendar in harness is still toy** — even with seeds enabled it does not show rich regulatory timeline, Gantt, sprint windows, or execution units the way production `MasterCalendarPage` + `WorkflowExecutionPanel` + `SprintTaskPanel` would.
2. **Seed data resolution** — `V3_REGULATORY_EVENTS` inside the SnapshotBuilder + `V3_ExecutionUnitsSeed` use synthetic IDs (`evt-gb-q2-2026`, `wf-...`). Many real projections (`regulatoryEventOverlapsSprint`, task projection, calendar month filtering, autogen, regulatoryExecutionStore form/step states) return empty or fall back because the synthetic data does not participate in the canonical `REGULATORY_EVENTS` / `WORKFLOWS` / store graphs.
3. **Other stores for Calendar fidelity** — `MasterCalendarPage` reads `useRegulatoryExecutionStore`, `useAutogenStore`, `usePmViewSprintStore`, `useSelectedTaskStore`, etc. The current `ComplianceExecutionSnapshot` override is insufficient by itself for a full rich calendar render.
4. **Harness still contains local toy models** (`CesBoardTask`, `PmTaskStatus`, `mapToLocalUnit` remnants, hardcoded board tasks) that should be retired in favor of real components + seeded snapshot.
5. **Minor hygiene**:
   - `CesDashboardPage.tsx` file can be deleted.
   - `/ces/dashboard` redirect can be removed (or kept with deprecation).
   - Stale comment in `CesLayout.tsx:3`.
   - Role permission strings in harness still say "CES Dashboard".
   - Orphan `CesExecutiveDashboard.tsx` (never imported).

---

## Core Principles (Never Violate)
- **Only one Dashboard** — the home screen. Never re-introduce or expose anything called "CES Dashboard".
- **Calendar is the CES default** — both in live routes and in the harness nav.
- **Prefer real production components** (`MasterCalendarPage`, `SprintExecutionBoard`, `WorkflowDrawer`, `SprintTaskPanel`, `CesLayout`, real hooks) over writing more toy surfaces in `V3StagingApp.tsx`.
- **Use the existing injection** — extend `buildV3SeededSnapshot` / `V3_CES_SeedData` rather than creating parallel override systems. The `SeededModeProvider` + early return in the store is the blessed path.
- **Dev-only / tree-shake safe** — everything you add must be guarded so it disappears from production bundles.
- **Harness must stay useful for design testing** — when the user toggles "V3 Seeds ON" under CES → Calendar or CES Board, the surface must immediately look and behave like the real production experience (rich data + production visual language and interaction patterns). No empty states, no toy lists, no low-fidelity approximations in seeded mode.
- **Sustainable** — any new seeding work should make the next domain (Evidence, Audit, etc.) easier, not harder. Consider light extraction (registry) if it helps, but do not turn this into a giant refactor unless it unblocks seeding.
- **Visual language** — keep V3 glass tokens (`v3Tokens.ts`) where the harness shell is concerned; real components should feel at home inside the glass shell.
- **Design responsibility for harness surfaces** — When a real production component cannot be mounted directly inside the harness shell without breaking layout, glass language, responsiveness, or right-panel behavior (this is expected for the CES Calendar), you are **required** to design and implement a high-fidelity V3-glass equivalent. This adapted surface must use real hooks/selectors + seeded data, match the production intent and visual hierarchy of `MasterCalendarPage` (timeline, month/Gantt/sprint views, panel/drawer interactions), and follow the canonical V3 glass system. Creating a new low-fidelity toy is forbidden; creating a production-faithful harness-specific version is mandatory when needed. If design decisions are non-trivial, add a short note in this folder documenting the harness treatment.

---

## Exact Work Breakdown (Execute in This Order)

### Phase 1 — IA Hygiene & Concept Kill (Small, High-Confidence, Do First)
1. Delete `src/policy/ces/pages/CesDashboardPage.tsx`.
2. Remove (or mark deprecated + add dev warning) the `/ces/dashboard` redirect in `src/App.tsx`.
3. Clean strings:
   - In `V3StagingApp.tsx` role definitions, replace remaining "CES Dashboard" references with "CES Calendar".
   - Update the outdated comment in `CesLayout.tsx`.
4. Delete the unused `src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx` (and folder if empty) after confirming it has zero imports.
5. Verify `CommandCenterLayout.tsx` and harness nav are still correct (they should be).
6. Run a global search for "ces.?dashboard" / "CesDashboard" and leave only historical notes.

**Verification**: `grep -r "CesDashboardPage" src --include="*.ts" --include="*.tsx"` returns only the now-deleted file or nothing. No nav item or route still uses the old name.

### Phase 2 — Seed Data Expansion + Calendar Surface in Harness (Core Seeding Deliverable)
Goal: Toggling seeds in the harness CES Calendar section produces a rich, realistic, non-empty compliance timeline that exercises real data shapes and (ideally) real logic.

**Sub-steps**:
1. **Expand the seed graph** (primary technical work, per Agent_05 and master issues §3.4):
   - In `V3_CES_SeedData.ts` (or a new `V3_CES_FullSeed.ts` sibling), add or extend:
     - A richer set of `RegulatoryEvent`-shaped objects that **resolve** against the adapters in `complianceExecutionAdapters.ts` and `useEventExecutionDataflow.ts`.
     - Minimal seeded `formStates`, `stepStates`, `signerTasks`, `evidence`, `approvals` that the regulatoryExecutionStore shape expects (you may need a lightweight dev-only seed injector for `regulatoryExecutionStore` or pass them through the snapshot).
     - Correct `sprintId` / window values that satisfy both CES `buildSprintWindow` and PM `regulatoryEventOverlapsSprint` (note the 12-day vs 14-day model difference).
     - Workflow alignments (`workflowId` values that exist in `eventWorkflowAlignment` or a seeded subset of `WORKFLOWS`).
   - Update `V3_CES_SnapshotBuilder.ts` to incorporate the expanded data so `events`, `executionUnits`, `workflows`, `sprintMetrics`, `domainRisks`, etc. are all populated and realistic for the target sprint window (e.g., May 2026 Sprint 9/10).
   - Goal: when `buildV3SeededSnapshot()` runs, the returned snapshot has 15–30+ meaningful events + units with varied states, owners, evidence, signers, and audit readiness.

2. **Make the harness Calendar real(istic) — Design + Implementation**:
   - Refactor or replace `CesCalendarPageStaging()` so that when `useV3Seeds` is true it renders a **high-fidelity V3-glass CES Calendar surface**.
   - Primary path: Try to mount the real `<MasterCalendarPage />` (or a thin wrapper) inside the harness shell, suppressing or adapting any chrome that conflicts with the fixed glass container.
   - If direct mounting creates layout, glass-layering, right-panel, or responsiveness problems (highly likely), you **must design and build** a harness-adapted but production-faithful version. This version must:
     - Use real data from the seeded `useComplianceExecution()` / snapshot (plus any minimal additional store seeds required).
     - Reproduce the essential production behavior and visual hierarchy: month/grid/timeline/Gantt/sprint views, regulatory events + execution units, state coloring, sprint scope, right-side execution panel or drawer behavior, selection → detail flow.
     - Strictly follow the V3 glass visual language (tokens, borders, veils, layering, typography, teal/orange/red state colors, etc.).
   - Low-fidelity toy lists or simplified cards are **not acceptable** for the seeded state. The Calendar must look and feel like the real production surface for design testing to be valid.
   - Add clear UI affordances: "Seeded with V3 data — production surface: MasterCalendarPage + useComplianceExecution" label + a "Switch to toy" toggle for comparison.
   - Retire all remaining local toy date/unit mapping code for the calendar.

3. **Bonus for Board (finish what is already started)**:
   - Ensure the `if (useV3Seeds)` branch for ces-board is the primary path.
   - Remove or guard all remaining hardcoded `boardTasks` / toy `CesBoardTask` arrays so that seeds are the only data source when the toggle is on.
   - Verify clicking a card opens real drawers (`WorkflowDrawer`, `SprintTaskPanel`, evidence panels) populated from the seeded snapshot.

**Verification (must do manually in browser)**:
- Start the dev server, navigate to the UI-Staging harness (`/ui-staging` or however it is mounted).
- Go to CES → Calendar, toggle "V3 Seeds ON".
- Confirm the surface is **visually and behaviorally realistic**: it should feel like the production MasterCalendarPage (or a faithful harness-adapted version) — proper timeline/month/Gantt/sprint views, rich event + unit cards, state coloring, right-panel or drawer interactions on selection, sprint context, no toy-list appearance. The seeded data must drive a production-grade experience, not just "some data is present".
- Switch to CES Board, confirm real `SprintExecutionBoard` renders with seeded cards in correct columns, drag/drop works at least in read mode, right panels open with real data.
- Toggle off and confirm graceful fallback (no crashes).

### Phase 3 — Any Minimal Additional Injection Points
If, during Phase 2, you discover that `MasterCalendarPage` (or its subcomponents) still shows empty data because it bypasses `useComplianceExecution` and reads `REGULATORY_EVENTS`, `useAutogenStore`, `useRegulatoryExecutionStore` directly, then:

- Propose and implement the **smallest possible** additional dev-only seeding path (e.g., a parallel `useSeededRegulatoryEvents()` or a dev-only branch in `regulatoryExecutionStore` that the harness can activate).
- Keep it behind the same `SeededModeProvider` / `import.meta.env.DEV` guard.
- Document the new injection point clearly so future domains can follow the pattern.

If no additional injection is needed (the snapshot + adapters are sufficient for the harness surfaces), explicitly state this and why.

---

## Non-Goals / Explicit "Do Not"
- Do **not** re-invent a new global seeding system — extend the existing `SeededModeProvider` + snapshot builder.
- Do **not** create low-fidelity toy page functions in `V3StagingApp.tsx` for Calendar or Board. High-fidelity harness-adapted versions of production surfaces (when direct mounting of the real component is impractical) are required and explicitly allowed.
- Do **not** expose any "CES Dashboard" route, component, or nav label.
- Do **not** perform large unrelated refactors of the harness monolith unless they are the minimal change required to make seeding sustainable (light extraction of the section switcher into a registry is acceptable if it simplifies wiring real components).
- Do **not** touch production data paths or remove the `import.meta.env.DEV` guards.
- Do **not** break the live `/ces/calendar` route or the real `MasterCalendarPage` usage.

---

## File & Import Hygiene
- All new seed data should live under `src/policy/ces/data/` (or a new `seeds/` subfolder if you want to future-proof).
- Harness changes stay in `src/ui-staging/V3StagingApp.tsx` (or extract small page components only if it makes the monolith obviously cleaner).
- Prefer importing real production components (e.g., `import { MasterCalendarPage } from '@/policy/pages/MasterCalendarPage'`) and wrapping them lightly.
- Update any JSDoc / comments that still refer to the old "CES Dashboard" concept.

---

## Deliverables Expected From You
1. **Phase 1 hygiene PR / commit** (or clear list of deleted/edited files).
2. Expanded, resolving V3 seed data + updated `buildV3SeededSnapshot` that produces a rich, realistic `ComplianceExecutionSnapshot` for a target sprint.
3. Working high-fidelity CES Calendar surface in the harness (replaces `CesCalendarPageStaging`) that, when seeds are on, delivers a realistic production-like experience (either via the real `MasterCalendarPage` or a properly designed V3-glass harness-adapted version) using real seeded data and hooks.
4. Board fully on real component path with seeds.
5. A short `SEEDING_STATUS.md` (or update to the master issues folder) describing:
   - What is now seeded and injectable.
   - Any remaining gaps for full `MasterCalendarPage` fidelity in the harness.
   - How a future engineer would add seeds for Evidence Center or Audit Trail.
6. Manual verification notes + screenshots (or descriptions) showing the harness Calendar and Board with seeds ON vs OFF.

---

## Suggested Starting Commands (for you)
```bash
# After reading this prompt + the master doc + the 5 Agent reports
cd /path/to/Policies_and_Procedures
# Explore key files (you already know the paths from this prompt)
# Then begin Phase 1 deletes + renames
```

---

**You have full context, the architecture is already 70% there, and the injection point is proven.**  
Your job is to finish the data side, close the Calendar fidelity gap, and (where needed) perform the design adaptation work so the harness becomes a genuinely useful **design testing + seeding validation** tool with rich V3 data on realistic surfaces.

Begin with Phase 1 (quick confidence builder), then drive Phase 2 relentlessly until the harness Calendar looks realistically populated with V3 data when the toggle is flipped.

When you are done, reply with a concise summary of changes + the status document.

Good luck — this is the highest-leverage remaining piece of the V3 alignment effort.