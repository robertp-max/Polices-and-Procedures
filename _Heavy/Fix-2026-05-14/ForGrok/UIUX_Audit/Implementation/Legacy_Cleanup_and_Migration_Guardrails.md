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

**Status (2026-05-18 honesty correction):** This document **was a plan, not a delivered guardrail**. As of 2026-05-18, `eslint.config.js` had **no custom rules** enforcing the migration. The `.github/PULL_REQUEST_TEMPLATE.md` Design-System checkbox was present but honor-system-only. See `Phase4_Current_Reality_Report.md` §2.4 for the honest baseline. **Package F of the 2026-05-18 Phase 4 closure session delivers the real guardrails described in §4 above** and a v2.0 of this document supersedes this scaffold below — see appended Appendix A.

---

## Appendix A — v2.0 Delivered Guardrails (2026-05-18)

This appendix supersedes the v1.0 plan above with what was actually shipped.

### A.1 ESLint design-system rule (delivered)

File: `eslint.config.js`

A `no-restricted-syntax` rule with 4 selectors now bans new raw visual literals:
- `Literal[value=/rgba\(255\s*,\s*255\s*,\s*255\s*,/]` — raw white rgba literals.
- `Literal[value=/rgba\(0\s*,\s*0\s*,\s*0\s*,/]` — raw black rgba literals.
- `Literal[value=/(bg|text|border|ring|fill|stroke|from|to|via)-(white|black)\/\[/]` — arbitrary Tailwind opacity utilities on `white`/`black`.
- `TemplateElement[value.raw=/rgba\(255\s*,\s*255\s*,\s*255\s*,/]` — same for template literals.

**Scope (intentionally narrow):** the rule is enforced **only** on the 7 files attested as token-clean by Phase 3 v2.2 (the `PHASE3_V22_ATTESTED_FILES` array). This guarantees regression-protection of the attestation contract without surfacing the pre-existing broader-codebase debt as new errors that would block CI. Broader rollout is tracked as P4-DEBT-01 with explicit owner + scope.

**Why this scope** (documented as a header comment in `eslint.config.js`): turning on the rule for `src/policy/**/*.{ts,tsx}` produced 358 net-new errors representing legitimate-but-pre-existing patterns elsewhere in the codebase. Forcing those into the same closure window would either (a) require equivalent migration work for ~30 additional files that were not part of Phase 3 v2.2 attestation, or (b) tempt blanket `eslint-disable` comments that defeat the purpose. The chosen scope locks in the attestation contract and creates a clear, separately-prioritizable follow-on (P4-DEBT-01).

### A.2 PR template Phase 4 Closure section (delivered)

File: `.github/PULL_REQUEST_TEMPLATE.md`

A new "Phase 4 Closure Checklist (added 2026-05-18)" section appended with 5 honor-system checkboxes:
1. No new raw `rgba(`/`#hex` literals introduced in attested files.
2. No new arbitrary Tailwind opacity (`bg-white/[…]`, `text-white/[…]`, `border-white/[…]`) introduced.
3. ESLint `no-restricted-syntax` passes on all 7 attested files.
4. `tsc --noEmit --project tsconfig.app.json` exits 0.
5. `npm run build` exits 0.

### A.3 Idempotent migration script (delivered, retained as Phase 4 deliverable)

File: `scripts/phase4-migrate-workflow-execution-panel.cjs`

A one-shot, idempotent CommonJS script that performed 37 verified substitutions in `WorkflowExecutionPanel.tsx`. Each substitution is encoded as a `[needle, replacement, expectedCount, label]` tuple and aborts if the live count does not match the expected count, preventing silent over- or under-migration. The script is safe to re-run (subsequent runs find zero needles and exit cleanly) and is retained in the repo as auditable evidence of the Phase 4 token migration.

### A.4 Token utility additions (delivered)

File: `src/index.css` (lines 220–224)

Four hover-state utility classes were added to complete coverage of the patterns the attested files needed:
- `.ci-bg-overlay-faint-hover:hover`
- `.ci-bg-overlay-soft-hover:hover`
- `.ci-bg-overlay-strong-hover:hover`
- `.ci-border-overlay-hover:hover`

These resolve under existing `--ci-overlay-*` tokens already declared in all three theme blocks.

### A.5 What was NOT delivered (deferred with owners)

| Item | Why deferred | Owner | Tracker |
|---|---|---|---|
| Broader `no-restricted-syntax` rollout across `src/policy/**/*` | Out of Phase 3 v2.2 attestation contract; would require migrating ~30 additional files | Engineering | P4-DEBT-01 |
| Visual regression CI gate | Requires Playwright baseline regeneration on shared infrastructure | Engineering / QA | P4-VR-01 |
| Pre-commit `npm run verify:ui` wiring | Requires husky/lefthook setup decision | Engineering | P4-PC-01 |
| `LEGACY_DEPRECATION_MATRIX.md` final reconciliation | Requires Design Lead review of remaining legacy components | Design Lead | P4-LDM-01 |

**End of Appendix A — v2.0.**