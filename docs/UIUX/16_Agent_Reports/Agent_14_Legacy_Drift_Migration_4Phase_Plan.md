# Agent 14: Legacy Code Debt, Drift & Migration — 4-Phase Aggressive Gated Sunsetting Plan

**Subagent:** 14 — Legacy Code Debt, Drift & Migration Progress Specialist  
**Mandate:** Produce a 4-phase program with an **aggressive, gated legacy sunsetting** core. Phase 4 is **not complete** until a measurable percentage of legacy code paths (files, LOC, import references) have been **physically removed** from the `src/` tree — not merely hidden behind flags, marked `@deprecated`, or wrapped.  
**Governing Principle (Legacy Lens):** Every phase must produce a verifiable contraction of the legacy surface area. Addition of new canonical code without corresponding deletion of old families is explicitly forbidden as a completion criterion.  
**References:** `LEGACY_DEPRECATION_MATRIX.md`, `Legacy_Cleanup_and_Migration_Guardrails.md`, `UI_PRIMITIVE_OWNERSHIP_MAP.md`, `Phases_234_Catchup_Reality_Report.md`, `eslint.config.js`, current debt inventory in sibling `Agent_14_Legacy_Drift_Migration_Analysis.md`.  
**Date:** 2026-05-17  
**Target:** Reduce legacy UI family surface area by ≥35% (files) / ≥40% (relevant LOC + import sites) by end of Phase 4; zero new legacy family introductions; permanent guardrails that make re-introduction impossible.

---

## Phase 0 — Pre-Work (Immediate, 1–2 days, non-blocking for Phase 1 entry)

**Goal:** Lock the current debt inventory and prevent further growth.

**Deliverables:**
- Run and commit `scripts/legacy-inventory.ts` (new) that:
  - Counts exact references to each family in `LEGACY_DEPRECATION_MATRIX.md` + the expanded list from Analysis §1.1.
  - Produces `docs/UIUX/LEGACY_DEBT_SNAPSHOT_YYYY-MM-DD.json` + markdown table (ref counts, LOC, files touched).
  - Identifies all `import` sites of `StatusBadge` (old), `CesCard`, `SCard`, `PmTaskCard`, `TabButton` (local), `DomainBadge`, etc.
- Update `LEGACY_DEPRECATION_MATRIX.md` v2 with precise counts, owners, and "files that must be deleted" column.
- Add root-level `.github/PULL_REQUEST_TEMPLATE.md` checkbox (or strengthen existing): "No new usage of any legacy family listed in LEGACY_DEPRECATION_MATRIX (verified via `npm run legacy:check`)" — **enforced by CI**.
- Extend `eslint.config.js` with a new `no-restricted-imports` or custom rule block that **errors** on any import of the core legacy families from any file not explicitly grandfathered (initial grandfather list = the 7 attested + known high-traffic pages during transition).

**Gate to Phase 1:** Inventory snapshot committed + CI check passes on main (no new legacy imports in fresh code). `TaxonomyPage.old.tsx` and the two `.backup` files are added to an explicit `LEGACY_ORPHANS` deletion list.

**Risk Mitigation:** Grandfather list is time-bounded (auto-expire after Phase 2).

---

## Phase 1 — Inventory Lock, New-Use Ban & Orphan Purge (Gated — 3–5 days)

**Goal:** Stop the bleeding and physically remove the lowest-risk orphans. Establish "no new legacy" as the irreversible rule.

**Key Workstreams:**
1. **Physical Orphan Deletion (mandatory first win)**
   - Delete `src/policy/pages/DashboardPage.tsx.backup`
   - Delete `src/policy/pages/MasterCalendarPage.tsx.backup`
   - Delete `src/policy/pages/TaxonomyPage.old.tsx` (after confirming zero route references and updating verifier exempt lists + any docs).
   - Delete `vercel.json.bak` (root).
   - Update all referencing documentation (`Builder/`, `docs/`, `_Heavy/`, `Bin-` indexes) to remove references or mark "deleted in P1".
   - **Verification:** `git ls-files src/policy/pages/ | grep -E '\.(backup|old)'` returns empty; build + tests green; `npm run verify:ui` no longer lists the old file.

2. **Permanent New-Use Ban**
   - Finalize and land the ESLint `no-restricted-imports` + custom rule for the 8–10 core legacy families (CesCard, SCard/GenericSectionPanel, PmTaskCard, local TabButton, old StatusBadge, regulatory/Primitives exports, etc.).
   - Grandfather only the files that will be actively migrated in Phase 2/3 (time-boxed).
   - Add a `legacy:check` script (or integrate into `verify:ui`) that fails CI on any new reference.

3. **Deprecation Annotations & Warning Layer**
   - Add `@deprecated` JSDoc + runtime console warnings (in dev only) to every legacy family definition.
   - Update `primitives/CATALOG.md` with "Legacy → Canonical Mapping" table and "Deletion Target Date".
   - Produce "Migration Cookbook" doc for each family (one-pager with before/after examples using `SurfaceCard`, `Tabs`, `CiStatusBadge`).

4. **Non-Production Surface Decision**
   - Explicitly gate or deprecate: `/demo*`, `/iadministrator`, `/brad-proposal`, `/framework`, `/hubstaff`, `/system-documentation`, `/master-control-inventory`, Journey V1 routes behind a single `feature.devSurface` (default OFF for non-super-admins) or remove entirely if consensus is archive.
   - iAdministrator subtree: decision recorded — either permanent dev-only archive (with deletion scheduled Phase 3) or kept but excluded from all primitive adoption metrics.

**Exit Gate (must pass before Phase 2 work begins):**
- Zero `.backup`/`.old.tsx` remain in `src/`.
- ESLint + `npm run legacy:check` errors on any new legacy family usage (main branch clean).
- Inventory snapshot shows exact baseline (e.g., "CesCard: 47 refs across 9 files").
- All docs referencing the deleted orphans updated.
- **Measurable removal achieved:** At least 4 files physically deleted.

**Unique Phase 1 Rule:** No PR that adds new canonical primitives is merged unless it also deletes or deprecates at least one legacy family reference.

---

## Phase 2 — High-Traffic Surface Migration + Family Wrapping (Gated — 10–14 days)

**Goal:** Migrate the visible, high-traffic surfaces (Dashboard, Evidence, Audit, Calendar, Master Tasks/MyTasks, CES top views, Library/PolicyDetail) to compose exclusively from `ui/` primitives. Wrap or replace the first 2–3 families so deletion becomes possible.

**Prioritized Surfaces (from ownership map + traffic):**
- DashboardPage (remove local TaskCard)
- EvidenceCenterPage + AuditModePage + WorkflowExecutionPanel (remove TabButton, raw styles, regulatory primitives)
- MasterCalendarPage + CES calendar/workload views (CesCard → SurfaceCard)
- MyTasks / Pm task surfaces (PmTaskCard migration)
- Library / PolicyDetail / SharedPolicyDetailView (eliminate SCard/GenericSectionPanel usage)
- FormsPage, Governance, etc. for consistency

**Tactics per Family:**
- For each family: PR(s) that (a) introduce the canonical replacement on the target surface, (b) leave the legacy definition in place but with deprecation warning, (c) add a temporary feature flag only if rollback risk is extreme (default ON, remove by end of Phase 3).
- At the end of every family migration sprint: run the inventory script; if ref count for that family drops to zero outside grandfathered test/demo files → **delete the legacy definition file** in the same PR or immediate follow-up.

**Guardrails Activated:**
- Every surface PR must include before/after `npm run legacy:inventory` diff showing contraction.
- Visual regression (Playwright) baseline update required on any migrated surface.
- Token hygiene: any migrated file must pass the full ERROR-level no-raw-visual rule (expanding the attested set progressively).

**Exit Gate (strict — Phase 3 does not start until met):**
- At least 3 legacy families have **zero active production references** (or only in explicitly grandfathered non-prod surfaces).
- At least 1 legacy family definition file has been **physically deleted** from `src/`.
- Measurable contraction: ≥15% reduction in total legacy family reference count vs Phase 0 baseline.
- All high-traffic operational surfaces (Dashboard, Evidence, Audit, Calendar, MyTasks, Library) now import and primarily compose from `ui/` primitives (measured by import + usage grep).
- `LEGACY_DEPRECATION_MATRIX.md` updated with "Phase 2 — 3 families deleted / wrapped" status and new ref counts.

**Failure Mode to Block:** Any "migration" PR that only adds new wrappers without removing old usage sites or deleting files is rejected.

---

## Phase 3 — Family-by-Family Aggressive Sunsetting Sprints (Gated — 3–4 weeks)

**Goal:** Systematically eliminate remaining families across the entire codebase (CES, PM, regulatory, staffing, journey, secondary pages, iAdministrator if not already archived).

**Structure:**
- 5–7 dedicated "Sunset Sprint" cycles, one primary family per cycle (or batch of related):
  1. CesCard + CES primitives family
  2. PmTaskCard + PM local cards
  3. Regulatory Primitives (Domain/Urgency/etc.)
  4. Staffing badge/card ecosystem (consolidate to canonical + local wrappers deleted)
  5. Remaining tabs, drawers, KpiTile/EventChip duplicates in regulatory/ces/journey
  6. iAdministrator subtree (archive or full delete decision executed)
  7. Journey V1 + Demo surfaces (final purge)
- Each sprint ends with a **Deletion Gate PR**:
  - All references removed or moved to non-prod.
  - Legacy definition file(s) deleted.
  - Inventory script run in CI shows delta.
  - `primitives/CATALOG.md` and `LEGACY_DEPRECATION_MATRIX.md` updated.
  - Changelog entry: "Legacy family X physically removed (N files, M LOC, K references)."

**Enforcement Escalation:**
- After 2 sprints, any remaining legacy usage outside non-prod surfaces triggers WARN → ERROR in the broad ESLint rule (phased rollout of P4-DEBT-01 completed here).
- Introduce a `legacy-purge` script that can be run locally/CI to auto-suggest or perform safe renames where mechanical.

**Exit Gate to Phase 4:**
- ≥60% reduction in legacy family reference counts vs baseline.
- At least 6–8 legacy family definition files or major modules physically deleted.
- iAdministrator, Demo*, Framework*, Hubstaff*, SystemDocumentation*, BradProposal*, Journey V1, GVGB* specialized legacy either deleted or permanently archived behind a single non-default flag with documented removal date.
- No production route (except explicit devSurface) loads a pre-canonical heavy component as its primary UI.
- All remaining grandfathered files have explicit "Deletion Target: Phase 4" annotations.

**Measurable Target:** By end of Phase 3, the legacy surface area (as measured by the inventory script) must be ≤40% of the Phase 0 baseline.

---

## Phase 4 — Physical Purge, Zero-Debt Lock & Permanent Guardrails (Gated — Completion Criteria)

**Goal:** Execute the final purges, verify zero regression, and lock the system so legacy debt cannot return. **Phase 4 is declared complete only after the physical removal metric is met and verified.**

**Non-Negotiable Completion Criteria (all must be true):**
1. **Physical Removal Metric:** ≥35% of the files identified in the initial debt inventory (Analysis §3 + Phase 0 snapshot) have been **physically deleted** from the `src/` tree (not commented, not moved to comments, not behind a runtime flag that still ships the code). Target example: 40+ files / major modules removed. Verified by `git ls-files` + inventory script diff.
2. **Zero Active Legacy Imports:** `npm run legacy:check` (or equivalent) reports 0 errors on the production `src/policy/**/*` glob (excluding only explicitly archived non-prod directories that are also excluded from the production bundle).
3. **Final ESLint & Token Lock:** The broad `no-restricted-syntax` / import rules are now ERROR across **all** `src/policy/**/*.{ts,tsx}` (except archived non-prod). The narrow attested set is no longer special.
4. **Guardrails Permanent & Enforced:**
   - CI fails any PR that would re-introduce a legacy family pattern or raw visual value.
   - PR template + pre-commit hook (or husky) runs the legacy inventory check.
   - Visual regression suite covers all primary surfaces and fails on drift toward old patterns.
   - `LEGACY_DEPRECATION_MATRIX.md` marked "Phase 4 Complete — All listed families physically removed or archived with deletion date. No remaining production references."
5. **Documentation & Ownership Update:**
   - `UI_PRIMITIVE_OWNERSHIP_MAP.md` updated to "Legacy debt retired".
   - `primitives/CATALOG.md` shows only canonical entries.
   - All reality reports, catch-up docs, and this plan archived with "Executed" status and final metrics.
6. **Verification Artifacts:**
   - Final inventory snapshot vs baseline (JSON + markdown) showing exact % removal.
   - Before/after `npm run build` + `npm run lint` + `npm run verify:ui` + Playwright suite results.
   - Signed-off by Design System Owner + Frontend Platform Owner + Engineering Lead.

**Phase 4 Workstreams (only after gates above are achievable):**
- Execute any remaining low-risk deletions (old print variants, dead journey components, etc.).
- Run a final "big bang" purge script for any mechanical cleanups.
- Expand test coverage for the now-smaller surface area.
- Produce "Legacy Debt Retirement Certificate" (short md) with exact numbers: "X families, Y files, Z LOC removed. Surface area reduced from A% to B%."
- Optional: Move any truly valuable historical code (e.g., TaxonomyPage.old content) to an `archive/legacy-ui/` directory outside `src/` if rollback safety is required (but the production `src/` must be clean).

**Failure Mode:** If the physical deletion % cannot be met (e.g., due to hidden dependencies), Phase 4 is **extended** — no "complete" declaration is allowed. The program does not exit until the metric is satisfied.

---

## Overall Program Metrics & Tracking

**Primary Success Metric (the only one that matters for this lens):**
- Legacy UI family reference count reduction: Phase 0 baseline → Phase 4 target ≤65% of baseline (ideally ≤50%).
- Physical files deleted from legacy families / orphans: tracked weekly.

**Secondary:**
- % of operational surfaces whose primary composition is canonical primitives (target 100% for prod routes).
- Raw visual violation count (target 0 outside archived non-prod).
- New legacy family introductions: 0 after Phase 1.

**Cadence & Ownership (suggested):**
- Weekly legacy inventory report in standup (Engineering + Design System owner).
- Phase gates reviewed in a dedicated "Debt Retirement" working group.
- One named owner per family (e.g., "CesCard Sunset Owner: CES Lead").

**Tooling to Build (minimal but mandatory):**
- `scripts/legacy-inventory.ts` (or .mjs)
- `npm run legacy:check`
- Extension of `verify:ui` or new `verify:legacy-purge`
- CI job that fails on legacy family usage post-Phase 1

---

## Why This Plan Is Different (Legacy Lens)

Previous phases and docs described the desired end state and added protective layers. This plan **requires contraction at every gate** and withholds "complete" status from Phase 4 until deletion has occurred at scale. It directly attacks the root cause of the Phase 2 invisibility and catch-up reality reports: the codebase was allowed to declare victory while the old code continued to dominate the tree.

**Phase 4 Sunset Rule (engraved):**  
"Phase 4 is complete only when a human can `git rm` the last legacy family file, run the inventory script, see the % reduction, and have CI stay green — with no remaining production code paths exercising pre-canonical UI."

---

**End of Agent 14 4-Phase Legacy Sunsetting Plan**  
Unique insight delivered: Measure success by what is gone, not what was added. The future is only real when the past is physically removed.