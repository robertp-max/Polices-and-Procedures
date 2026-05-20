# Pull Request

## Summary
<!-- 1–3 sentences. What does this PR change and why? Reference the wave / task ID
     (e.g. MVP P0-ECIGN-001, Stabilization R-03) if applicable. -->

## Surfaces Touched
<!-- Check each box that applies. If a Protected Subsystem box is checked, an
     owner from the listed group MUST approve this PR. See MVP §C6 + §3
     (eCign + Evidence + CES identity). -->

- [ ] Shell / Navigation (`CommandCenterLayout.tsx`, `App.tsx`, navigation utils)
- [ ] Design System primitives (`src/policy/components/ui/*`)
- [ ] **Protected: eCign** (`FormSigningWorkspace.tsx`, `FormViewer.tsx`, `src/policy/ecign/*`) — **Architecture + Compliance owner approval required**
- [ ] **Protected: Evidence Center** (`src/policy/evidence/*`, `EvidenceCenterPage.tsx`, `localDemoAdapter.ts`) — **Architecture + Compliance owner approval required**
- [ ] **Protected: CES identity / form_instance routing** (`cesFormInstanceId.ts`, projector, audit) — **Architecture owner approval required**
- [ ] Onboarding V2 (`src/policy/onboarding-v2/*`)
- [ ] CES (`src/policy/ces/*`)
- [ ] Calendar / Master Calendar
- [ ] Mobile shell / bottom-sheet drawer / SignaturePad
- [ ] Print / PDF builders
- [ ] Audit log / regulatory store
- [ ] Other (specify):

## Validation

### Required (every PR)

- [ ] `npm run build` passes locally
- [ ] `npm run lint` passes locally
- [ ] `npm run verify:ui` passes locally (or new warnings explained below)

### Required if surface above is checked

- [ ] **Shell / Navigation:** browser Back/Forward manually tested on at least 4 affected flows
- [ ] **Design System primitives:** visual regression performed (Playwright baseline diff or manual side-by-side screenshot attached)
- [ ] **Protected eCign:** `npm run check:ecign-routes` and `npm run check:ecign-demo-local` pass; signing flow manually tested end-to-end (sign → review → options); signed PDF rendered correctly with brand header, cert ID, and signer metadata on every page
- [ ] **Protected Evidence:** `npm run check:evidence-phase15` `phase21` `phase22` `phase23` `phase235` pass; capture + retrieval verified after browser refresh
- [ ] **Protected CES identity:** `npm run verify:task-identity`, `verify:alignment`, `verify:pm-unified` pass; before/after projector snapshot on canonical event
- [ ] **Mobile changes:** real-device test on at least 1 iOS Safari + 1 Android Chrome (or explicit deferral note)
- [ ] **Audit log changes:** dual-write window honored (top-level `targetKind` + `targetId` and `after.*` for one release per MVP §13)

## Visual Regression
<!-- Required for any change to ui/ primitives or major operational surfaces.
     Attach side-by-side screenshots OR cite the Playwright baseline diff path. -->

- Surface(s) covered:
- Baseline path or screenshot links:
- Result: [ ] No visual regression  [ ] Intentional change (note below)

## Design System Compliance

- [ ] No new raw hex / `rgb()` / `rgba()` literals in `className` or inline `style` — all colors via `var(--ci-*)` tokens
- [ ] No new glass surfaces beyond MVP §C1 (max 3 layers; Layer 3 portal-only for elevated modals)
- [ ] No new instances of legacy parallel component families (CesCard, local TabButton, local SectionTitle) — use `ui/` primitives
- [ ] CTA orange uses canonical `#C74601` only (per MVP §C2)
- [ ] Touch targets ≥48 px on primary CTAs, ≥44 px floor elsewhere

### Phase 4 Closure Checklist (added 2026-05-18, refined 2026-05-19)

Required for any PR touching `src/policy/**/*.{ts,tsx}`:

- [ ] `npm run lint` is green. **No new `no-restricted-syntax` ERRORS** for the Phase 4 design-system guardrails (raw `rgba(255,255,255,...)`, `rgba(0,0,0,...)`, or `*-white/[...]` Tailwind utilities). See `eslint.config.js` `DESIGN_SYSTEM_GUARDRAIL_RULES` and `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/Phases_234_Catchup_Reality_Report.md` §4–§6.
- [ ] **WARN count for the same selectors does NOT increase** on touched files (see `Phases_234_Catchup_Reality_Report.md` Appendix A baseline of 326 / 57 files). PRs that reduce the WARN count on a touched file should note the delta.
- [ ] If a guardrail violation is intentional and unavoidable (legitimate runtime alpha composition, sub-brand source-of-truth, etc.), the line carries a `// eslint-disable-next-line no-restricted-syntax -- <justification>` comment.
- [ ] No new arbitrary Tailwind opacity utilities (`bg-white/[0.0X]`, `text-white/[0.X]`, `border-white/1X`). Use canonical utilities: `ci-bg-overlay-faint|soft|strong`, `ci-border-overlay|overlay-strong`, `ci-text-surface-strong|soft|muted|faint|ghost|quiet` (declared in `src/index.css`).
- [ ] Operational surface PRs (Evidence / Audit / Calendar / My Tasks / CES) compose inside `<ShellContentFrame>` or document a justified exception in the PR description.
- [ ] If the change is visible on the Audit drawer (`WorkflowExecutionPanel.tsx`), the PR description states whether the change is an addition, a token migration, or a runtime-composition exception.

If a `verify:ui` warning is acceptable for this PR (e.g. brand-owned exempt file), explain here:

## Rollback Plan

- This change is on its own feature branch
- Rollback = `git revert` of merge commit
- If a Protected Subsystem above is checked, rollback owner must be confirmed before merge (see `_Stabilization(SuperGrokHeavy)/STABILIZATION_ROLLBACK_PLAYBOOK.md` §3)

## Issue / Wave Reference
<!-- e.g. Closes #123, MVP Wave 0 P0-ECIGN-001, Stabilization R-03 -->
