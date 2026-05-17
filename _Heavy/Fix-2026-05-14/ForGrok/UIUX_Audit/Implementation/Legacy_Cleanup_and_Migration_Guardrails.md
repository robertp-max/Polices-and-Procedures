# Legacy Cleanup and Migration Guardrails — Phase 4

**Program:** Care Indeed UI/UX Reconstruction  
**Phase:** 4 — Experience Maturity and Finalization  
**Version:** 1.0  
**Date:** 2026-05-17  
**Reference:** `LEGACY_DEPRECATION_MATRIX.md` + Phase 3 usage maps

## 1. Purpose

Document the final cleanup of remaining legacy patterns and establish permanent migration guardrails so that future development cannot reintroduce drift.

## 2. Current Legacy Inventory (Post Phase 3)

From `LEGACY_DEPRECATION_MATRIX.md` and surface audits:

**High Remaining Risk:**
- Scattered `ci-premium-*`, `ci-executive-*` utility classes still present in some Evidence and Audit views.
- A few inline `shadow-[...]` and `border-[#...]` values missed during Phase 3 sweeps (primarily in Calendar and older My Tasks components).
- Custom `TaskCard` / `EventCard` local components that duplicate `SurfaceCard` logic.

**Medium Risk:**
- Old CI-ION logo references in a handful of Calendar headers.
- Non-canonical filter bar implementations in Evidence.

## 3. Cleanup Tasks (Phase 4 Scope)

1. **Global Class Sweep**
   - Remove all `ci-premium-*`, `ci-executive-*`, `ci-maturity-*` classes.
   - Replace with equivalent `--ci-*` token + primitive combinations.

2. **Component Deprecation**
   - Delete or redirect the last local `TaskCard`, `EventCard`, and `AuditChecklistItem` implementations.
   - Promote any missing patterns to `primitives/CATALOG.md`.

3. **Logo & Branding**
   - Final purge of CI-ION assets from all operational surfaces (Calendar was the last holdout).

4. **Inline Style Audit**
   - Use automated lint + manual grep to eliminate any remaining raw visual values.

## 4. Migration Guardrails (Permanent)

**Enforcement Mechanisms (to be implemented in this phase):**

- ESLint rule: `no-raw-visual-values` (colors, shadows, spacing, typography) on files under `src/policy/`.
- PR template checkbox: “This change uses only canonical primitives and locked tokens. No new legacy patterns introduced.”
- Visual regression baseline comparison against Dashboard in every surface PR.
- `LEGACY_DEPRECATION_MATRIX.md` marked as “Phase 4 Complete — Guarded” with date.

**Future Development Rule:**
Any new surface or component must pass the same primitive + token + constrained-frame checklist that Dashboard passed in Phase 3.

## 5. Verification

- After cleanup, run full surface regression suite.
- Update `primitives/CATALOG.md` with deprecation status.
- Final sign-off in `Phase4_Final_Readiness_Package.md`.

**Status:** Plan complete. Proceeding to final deliverable.