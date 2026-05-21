# Review 12 Analysis: Legacy Migration Non-Execution

**Role:** Review 12 — Migration, Rollout & Change Management specialist  
**Date:** 2026-05-17 (current workspace state)  
**Scope:** Audit of LEGACY_DEPRECATION_MATRIX.md adherence for removal of wave classes (`ci-premium-*`, `ci-maturity-*`, `ci-executive-*`) and handcrafted patterns; evaluation of migration strategy (Strangler vs. big-bang); root cause of persistent legacy in production output (esp. Dashboard); Phase 3 violations; cleanup sprint failures; and accountability assignment.  

**Primary Sources Audited (absolute paths):**
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\LEGACY_DEPRECATION_MATRIX.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\Legacy_Cleanup_and_Migration_Guardrails.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\Phase3_Exit_Criteria_Checklist.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\Phase3_Implementation_Spec.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\MASTER_UIUX_IMPLEMENTATION.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\Phase3_Double_Check_Verification_Report.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\SURFACE_CHECKLISTS\Dashboard.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\docs\UIUX\UIUX_RECONSTRUCTION_MASTER_PLAN.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\docs\UIUX\CANONICAL_UI_SYSTEM_SPEC.md`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\index.css`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\DashboardPage.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\AuditModePage.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\EvidenceCenterPage.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\MasterCalendarPage.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\pages\MyTasksPage.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\CommandCenterLayout.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\SurfaceCard.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\GlassPanel.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\ShellCommandGroup.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\index.ts`

**Method:** Full-text reads + targeted ripgrep across `src/` (tsx/ts/css) and `_Heavy/.../Implementation/` + `docs/UIUX/`. All findings cite exact lines/paths.

---

## Executive Summary

The legacy wave class families (`ci-premium-*`, `ci-maturity-*`, `ci-executive-*` and related `ci-shell-command-group`, `ci-command-rail`, `ci-hero-stat`, etc.) were **never systematically deprecated or removed**. 

- The reference surface (Dashboard) and all major operational surfaces continue to ship mixed legacy + "new" token utilities, with heavy stacking (e.g., `ci-shell-command-group ci-command-rail ci-maturity-section`).
- The intended **Strangler migration** (documented in MASTER_PLAN) degenerated into **scattered ad-hoc edits + parallel "wave" layering**.
- Phase 3 exit documentation (checklists, sign-offs) falsely claims completion while `grep` on the live codebase shows the exact forbidden patterns the Canonical Spec and deprecation rules banned.
- Cleanup sprints and Phase 4 guardrails documents themselves admit "High Remaining Risk" and "ball dropped."
- **Root cause:** Incomplete LEGACY_DEPRECATION_MATRIX.md (never listed the wave CSS families), authors who expanded wave utilities in `index.css` under "visible delta" banners, and approvers who certified Phase 3 without verification greps against the explicit bans in CANONICAL_UI_SYSTEM_SPEC.md §10/12 and the "no incremental wave-only styling" rule.

**Current live evidence (2026-05-17 workspace):** 6+ source files still emit the legacy wave classes; `src/index.css` still defines them with "Wave 12 visible delta" and "Wave 10 convergence" comments; no global removal script or PR sweep was ever applied to them (contrast with the narrow Phase 4 script for `WorkflowExecutionPanel.tsx`).

---

## 1) Was LEGACY_DEPRECATION_MATRIX.md followed for removing wave classes (ci-premium-*, ci-maturity-*, ci-executive-*) and handcrafted patterns?

**No. The matrix was never followed for the wave classes because it never listed them.**

**File:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/LEGACY_DEPRECATION_MATRIX.md` (full content, 45 lines)

```markdown
## Card / Surface Families
| Legacy Family | ... | Canonical Replacement | Deprecation Target | Status | Notes |
|---------------|-----|-----------------------|--------------------|--------|-------|
| GVGB Card ... | ... | `SurfaceCard` + `GlassPanel` | Phase 2 | Open | ...
... (only component families; zero rows for CSS wave utilities)
```

**Key gaps:**
- No entries for `ci-premium-hero`, `ci-premium-panel`, `ci-premium-divider`, `ci-premium-topbar`, `ci-executive-shell`, `ci-maturity-toolbar`, `ci-maturity-eyebrow`, `ci-maturity-caption`, `ci-maturity-section`, `ci-shell-command-group`, `ci-command-rail`, `ci-hero-stat`, `ci-operational-card`, etc.
- Status for listed families remains "Open".
- Later documents (Legacy_Cleanup...md) retroactively call out the wave classes as "High Remaining Risk" and prescribe "Global Class Sweep — Remove all `ci-premium-*`, `ci-executive-*`, `ci-maturity-*` classes. Replace with equivalent `--ci-*` token + primitive combinations." (lines 28-30). This was planned for **Phase 4**, proving Phase 3 never executed it.

**Cross-reference:** Phase3_Implementation_Spec.md:66 explicitly requires "Remove legacy families per `LEGACY_DEPRECATION_MATRIX.md`". Since the matrix omitted the wave families, the removal step was never triggered for the dominant handcrafted patterns actually present in the pages.

**Verdict:** Matrix not followed; it was an incomplete artifact that failed to drive the required cleanup.

---

## 2) Strangler migration or big-bang? Any evidence of systematic replacement vs scattered edits?

**Intended: Strangler migration (gradual, per-surface, primitives-first). Executed: Neither — scattered edits + creation of a parallel wave styling system.**

**Evidence from plans (intended Strangler):**
- `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md:25`: "**Phased rollout strategy (strangler migration, high-frequency workflows first)**"
- `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md:243`: "No incremental wave-only styling dependencies required"
- `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md:41`: "phased migration model was replaced by visual wave-based interpretation." (this is a recorded drift admission)
- `Phase3_Implementation_Spec.md:63-66`: Per-surface process: Audit → Define Target (using canonical primitive mapping) → "Refactor using only canonical primitives + tokens" → "Remove legacy families"

**Actual execution (scattered + parallel system):**
- No evidence of a master replacement plan, codemod, or per-surface migration script applied to wave classes (only one narrow idempotent script existed for WorkflowExecutionPanel in Phase 4: `scripts/phase4-migrate-workflow-execution-panel.cjs`).
- Instead, "Wave N" layers were **added** to `index.css` on top of the canonical tokens:
  - Line 1321: `/* Wave 10 convergence: consistent premium operational surfaces */` → `.ci-operational-card`, `.ci-operational-toolbar`
  - Line 1386: `/* Wave 12 visible delta: high-visibility premium composition */` → `.ci-premium-hero`, `.ci-premium-panel`, etc.
- Usages are manual string concatenation in JSX `className` props across independent files — classic scattered edits with no single source of truth or deprecation path.
- Canonical primitives (`SurfaceCard`, `GlassPanel`, `ShellCommandGroup`) see minimal adoption outside nav rail and a handful of empty-state cards (grep count: 47 occurrences across only 10 files, mostly definitions + staffing cards + 2 empty states in MasterCalendar).

**Dashboard (the "reference surface") example of non-systematic mixing (src/policy/pages/DashboardPage.tsx):**
```tsx
// Line 413
<ShellContentFrame ...>
  <div className="flex flex-col gap-4 sm:gap-5">
    <div className="ci-premium-hero px-4 sm:px-6 py-4 sm:py-6">   {/* legacy wave */}
      <DashboardHero ... />
    ...
    <section className="... ci-shell-command-group ci-command-rail ci-maturity-section ...">  {/* stacked legacy */}
    ...
    <div className={`... ci-premium-panel p-3 sm:p-4`}>   {/* legacy wave */}
```

Imports include `ShellContentFrame` (new) but no `SurfaceCard`/`GlassPanel`/`ShellCommandGroup` for content surfaces. The wave classes provide the visual "premium" treatment that the primitives were supposed to standardize.

**Verdict:** Strangler was documented policy; execution produced a **parallel competing styling system** ("wave utilities") with ad-hoc per-file edits. No systematic replacement occurred.

---

## 3) Why still seeing legacy in output (Dashboard uses ci-premium-hero, ci-premium-panel, ci-shell-command-group mixed with new)

**Because the reference implementation itself (Dashboard) was never migrated, and the same pattern was copy-pasted to every other surface. The "new" token utilities and shell wrapper were layered **on top of** the old wave classes rather than replacing them.**

**Live Dashboard usage (src/policy/pages/DashboardPage.tsx — multiple sites):**
- 415: `className="ci-premium-hero ..."`
- 448: `ci-shell-command-group ci-command-rail ci-maturity-section`
- 463: `ci-premium-panel`
- 557: `ci-command-rail ci-maturity-section`
- 558: `ci-maturity-eyebrow`
- 573: `ci-hero-stat`
- 632, 825, etc.: more `ci-command-rail`, `ci-subtle-hover`, `ci-min-h-kpi`, etc.

**Other surfaces (identical pattern):**
- `src/policy/pages/AuditModePage.tsx:327`: `ci-premium-hero ci-command-rail`
- `src/policy/pages/AuditModePage.tsx:430`: `ci-shell-command-group ci-premium-panel ci-command-rail ci-maturity-section`
- `src/policy/pages/EvidenceCenterPage.tsx:658`: `ci-premium-hero`
- `src/policy/pages/MasterCalendarPage.tsx:559`: `ci-shell-command-group ci-premium-hero ci-command-rail ci-maturity-section`
- `src/policy/ces/pages/MyTasksPage.tsx:310`: `ci-shell-command-group ci-premium-panel ci-command-rail ... ci-maturity-toolbar`
- `src/policy/ces/pages/MyTasksPage.tsx:380`: `ci-premium-hero ci-command-rail ci-maturity-section`
- `src/policy/components/CommandCenterLayout.tsx:436,869`: `ci-shell-command-group` on account menu + mobile nav

**index.css still ships the full legacy surface (lines 1386-1470 excerpt):**
```css
/* Wave 12 visible delta: high-visibility premium composition */
.ci-premium-hero { ... linear-gradient + box-shadow ... }
.ci-premium-panel { ... }
.ci-premium-divider { ... }
.ci-premium-topbar { ... }
.ci-executive-shell { ... ::after overlay ... }
.ci-maturity-toolbar { ... }
.ci-maturity-eyebrow { ... }
.ci-maturity-caption { ... }
.ci-maturity-section { ... }
.ci-shell-command-group { ... }   /* also used directly outside the <ShellCommandGroup> primitive */
```

The CSS authors created "premium" and "maturity" and "executive" variants as visible deltas for successive polish waves. These were never mapped in the deprecation matrix nor removed during the "reference surface" reconstruction.

**Why Dashboard specifically?** It was the template. All subsequent surfaces (Evidence, Audit, Calendar, MyTasks) emulated its className patterns. The Phase 3 checklists accepted `ci-operational-card` and deferred `SurfaceCard` (Dashboard.md:37: "full `SurfaceCard` wrap deferred to P3-DA-01"), giving cover for continued wave usage.

**Result in rendered output:** Every dashboard, audit timeline, evidence header, calendar toolbar, and task card still carries the legacy wave visual language mixed with token classes and a thin ShellContentFrame wrapper.

---

## 4) Violated: Phase 3 "Remove legacy surface families", "no incremental wave-only styling"

**Direct violations of locked contracts.**

**CANONICAL_UI_SYSTEM_SPEC.md (authoritative, lines 160, 241, 16):**
```markdown
No “ci-premium-*”, “ci-executive-*”, or wave-based utility classes may be used to tune density by feel.
...
No route-level overrides, wave-specific class layers, or “temporary” full-bleed exceptions are permitted...
Everything in this spec supersedes previous wave-based styling, ad-hoc classes, and local interpretations.
```

**UIUX_RECONSTRUCTION_MASTER_PLAN.md (lines 41, 45, 243, 281):**
- "phased migration model was replaced by visual wave-based interpretation."
- "Repeated wave-specific class layers (`ci-premium-*`, `ci-executive-*`, `ci-maturity-*`) created a parallel styling system."
- "No incremental wave-only styling dependencies required"
- "No additional 'premiumization' waves outside this phase model."

**Phase3_Implementation_Spec.md:66 + MASTER_UIUX_IMPLEMENTATION.md:106:**
- "Remove legacy families per `LEGACY_DEPRECATION_MATRIX.md`"
- "Remove legacy surface families listed in deprecation matrix for targeted scope."

**Violations in the reference surface + checklist acceptance:**
- Dashboard checklist (SURFACE_CHECKLISTS/Dashboard.md:36-37) accepted `ci-operational-card` utility and deferred SurfaceCard while the page (and its checklist sign-off) still contained `ci-premium-*` and `ci-maturity-*` (which current grep confirms remain).
- Phase3_Exit_Criteria_Checklist.md v2.2/v2.3 claims "Phase 3 is functionally and code-complete" and "100% canonical primitive usage" for Dashboard/MyTasks while the concrete classNames contradict the spec.
- The wave classes continue to exist in `index.css` (the single source of styling truth) with explicit "Wave 12" provenance — directly contradicting "no incremental wave-only styling."

**Phase 4 guardrails doc itself admits the failure** (Legacy_Cleanup_and_Migration_Guardrails.md:18-19, 29):
> "Scattered `ci-premium-*`, `ci-executive-*` utility classes still present in some Evidence and Audit views."
> "Remove all `ci-premium-*`, `ci-executive-*`, `ci-maturity-*` classes."

The Phase 3 gate was passed without ever closing the legacy surface family removal item.

---

## 5) Ball dropped in cleanup sprints; docs updated claiming migration done (Phase3 checklist) while grep shows remnants + new nesting

**Yes — classic documentation vs. reality divergence.**

**Phase3_Exit_Criteria_Checklist.md (v2.2 2026-05-17 + v2.3 2026-05-18 addendum):**
- Multiple `[x]` for "100% canonical primitive usage", "Zero raw visual values", "Phase 3 is functionally and code-complete as of v2.2"
- Engineering Lead attestation based on incomplete greps (later corrected in v2.3 for some raw values, but **never for the wave class families**).
- No item explicitly tracking "ci-premium / ci-maturity / ci-executive removal."

**Reality (live grep results):**
- Remnants in **every** Phase 3 surface (Dashboard, Evidence, Audit, Calendar, MyTasks, CommandCenterLayout).
- **New nesting** (stacked classes): `ci-shell-command-group ci-premium-panel ci-command-rail ci-maturity-section` — exactly the "parallel styling system" the master plan warned against.
- Phase3_Double_Check_Verification_Report.md:14 openly states: "The subsequent Pass 2 cleanup work **was never executed** in the source."
- Legacy_Cleanup_and_Migration_Guardrails.md (Phase 4 doc) treats the wave removal as future Phase 4 work and notes the guardrails were "a plan, not a delivered" item at the time of writing.

**Cleanup sprints failure modes:**
- No automated enforcement (ESLint rule was narrowly scoped in Phase 4 only to 7 attested files for raw literals, not wave class names).
- No update to LEGACY_DEPRECATION_MATRIX.md to include the dominant CSS families.
- Surface checklists and exit gates accepted partial token wins while ignoring the explicit "remove legacy surface families" and "no wave-based" rules.
- Visual regression baselines were captured against the mixed state, locking in the debt.

**Result:** Documentation (checklists, completion sign-off package references, Phase 3 claims) asserts success; `git grep` and rendered UI prove non-execution.

---

## 6) Responsible: migration lead, authors of ci- wave utilities in index.css, approvers who didn't verify deprecation

**Accountability chain (roles, not individuals unless named in artifacts):**

1. **Migration Lead (primary owner of deprecation execution)**
   - Failed to expand LEGACY_DEPRECATION_MATRIX.md with the actual wave CSS families discovered in audits.
   - Failed to produce or execute a systematic removal plan/script for `ci-premium-*` etc. across the 6+ files.
   - Allowed "per `LEGACY_DEPRECATION_MATRIX.md`" step in Phase3_Implementation_Spec to become a no-op.

2. **Authors of ci- wave utilities in src/index.css**
   - Introduced/expanded the parallel system under "Wave 10 convergence" (line 1321) and "Wave 12 visible delta" (line 1386) comments.
   - Created `.ci-premium-hero`, `.ci-premium-panel`, `.ci-executive-shell`, `.ci-maturity-*`, `.ci-shell-command-group` (and their dark-mode overrides) as "high-visibility premium composition" instead of extending the canonical `.ci-card` / `.ci-glass-panel` / `SurfaceCard` / `GlassPanel` primitives.
   - These additions made the "no incremental wave-only styling" rule impossible to satisfy without a later destructive cleanup that never occurred.

3. **Approvers / Signatories who did not verify deprecation (Engineering Lead, Design Lead, Product Owner, checklist certifiers)**
   - Phase3_Exit_Criteria_Checklist.md:140 — Engineering Lead "✅ Approved (all code gates green)" on 2026-05-17 without a comprehensive grep for the wave patterns explicitly banned in CANONICAL_UI_SYSTEM_SPEC.md:160.
   - SURFACE_CHECKLISTS/Dashboard.md sign-off accepted `ci-operational-card` + deferred SurfaceCard while premium wave classes were live in the reference implementation.
   - Phase3_Completion claims in multiple artifacts (including references in PHASE1_COMPLETION_SIGNOFF_PACKAGE.md and MASTER plan drift notes) were accepted without requiring evidence that LEGACY_DEPRECATION_MATRIX items were actually closed in code.
   - Later Phase 4 docs (Legacy_Cleanup..., Phase3_Double_Check_Verification_Report) had to retroactively document the missed items — proving the prior gates were not enforced.

**Contributing factors:**
- Narrow ESLint scope in Phase 4 (only protected the 7 attested files for raw literals; wave class names were never linted).
- No PR template or pre-commit hook that grepped for `ci-premium|ci-maturity|ci-executive`.
- Visual "delta" work (Wave 12) was prioritized over migration hygiene.

---

## Recommendations (for Phase 4 closure or subsequent audit)

1. **Immediate:** Add the full list of wave families to LEGACY_DEPRECATION_MATRIX.md with "Phase 4 — Remove" target and update status to "In Progress".
2. **Enforcement:** Extend the `no-restricted-syntax` ESLint rule (or add a custom rule) to ban `className` containing `ci-premium|ci-maturity|ci-executive` (except inside the index.css definition block itself).
3. **Replacement:** Map each wave class to a canonical primitive + token combination (e.g., `ci-premium-hero` → `<SurfaceCard className="ci-glass-panel">` or new `PremiumHero` variant if justified).
4. **Verification:** Run full-repo grep + Playwright visual diff after removal; require Design + Migration Lead sign-off before any further Phase 4 claims.
5. **Process:** Update PR template with explicit checkbox: "No `ci-premium-*`, `ci-maturity-*`, `ci-executive-*`, or other wave-specific classes introduced or retained."
6. **Ownership:** Assign a named Migration Lead + Design Systems owner for the remaining P4-DEBT items listed in Legacy_Cleanup_and_Migration_Guardrails.md Appendix.

---

**Conclusion:** Legacy migration for the wave surface families was never executed. Phase 3 delivered documentation theater and partial token wins while leaving the dominant handcrafted "premium / maturity / executive" styling system intact on every operational surface, including the sacred reference Dashboard. The Strangler approach collapsed into wave layering. The responsible parties are the migration lead (incomplete matrix + no sweep), the CSS authors (parallel wave system), and the approvers (unchecked sign-offs).

This report is self-contained, cites only audited files/lines, and stands as the authoritative record for Review 12.

**End of Review 12 Analysis**