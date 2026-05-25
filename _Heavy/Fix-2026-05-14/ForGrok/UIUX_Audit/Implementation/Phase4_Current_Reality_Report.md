# Phase 4 — Current Reality Report (Honest Baseline)

**Program:** Care Indeed Home Health UI/UX Reconstruction  
**Phase:** 4 — Experience Maturity and Finalization  
**Version:** 1.0  
**Date:** 2026-05-18  
**Author:** Phase 4 closer (code-level verification)  
**Branch at audit:** `backup/phase3-audit-2026-05-18` @ `0d59590` (working tree clean)  
**Purpose:** Replace the over-claims previously embedded in `Phase4_Final_Readiness_Package.md` v1.0 and the optimistic "Status: Complete" lines in the Phase 4 sibling documents. This is the ground truth as observed in `src/` on 2026-05-18.

---

## 1. Why this document exists

`Phase4_Final_Readiness_Package.md` v1.0 declared the entire program complete. v1.1 retracted that to a "scaffold" admission. The five sibling Phase 4 deliverables (`Cross_Surface_Consistency_Report.md`, `Accessibility_Edge_Cases_Fix_Plan.md`, `Responsive_Parity_Validation.md`, `Motion_and_Theme_Parity_Report.md`, `Legacy_Cleanup_and_Migration_Guardrails.md`) **were never honestly downgraded** — each still closes with a "Status: complete" / "Status: Report complete" / "Status: Plan complete" line that overstates reality. Each is a planning narrative authored without underlying code-level verification or evidence capture.

In parallel, `Phase3_Exit_Criteria_Checklist.md` v2.2 asserted "zero raw-color matches" across all five named operational surfaces. Code-level greps performed on 2026-05-18 disprove this for two of them.

This report establishes a single, accurate baseline so all subsequent Phase 4 work proceeds from truth.

## 2. Verified Ground Truth (2026-05-18)

### 2.1 Phase 2 shell visibility — VERIFIED COMPLETE
- `--ci-color-glass-main/detail/border/blur/shadow` + `--ci-color-shell-topbar-bg/navrail-bg` + `--ci-color-border-subtle` declared in all three theme blocks of `src/index.css`.
- `CommandCenterLayout.tsx` no longer applies inline-style overrides on `<ShellContentFrame>`.
- `ShellTopbar.tsx`, `ShellNavRail.tsx`, `ShellContentFrame.tsx` paint from CSS vars only.
- `--ci-overlay-faint/soft/strong/border/border-strong/active-bg/active-border` family + `--ci-text-on-surface-strong/soft/muted/faint/ghost/quiet` family **are declared** in all three theme blocks (lines 933–945, 996–1008, 1116–1128).
- `.ci-bg-overlay-*`, `.ci-border-overlay*`, `.ci-text-surface-*` utility classes exist (lines 208–219).

### 2.2 Phase 3 Pass 2 token migration — PARTIALLY COMPLETE

| Surface / File | Phase 3 v2.2 Claim | 2026-05-18 Reality | Hits |
|---|---|---|---|
| `EvidenceCenterPage.tsx` | "zero raw-color matches" | **CONFIRMED TRUE** | 0 |
| `RobertCesReviewLayer.tsx` | "zero raw-hex" | TRUE (1 cosmetic `boxShadow` rgba retained as design intent) | 1 |
| `CesRoleReviewSwitcher.tsx` | "zero raw-hex" | **CONFIRMED TRUE** | 0 |
| `ComplianceCalendar.tsx` | "retro tints migrated" | **CONFIRMED TRUE** | 0 |
| `MasterCalendarPage.tsx` | "zero raw-color matches" | **OVERSTATED** — 3 leftover Tailwind opacity utilities at lines 624, 670, 815 | 3 |
| `AuditModePage.tsx` | "zero raw-color matches" | **FALSE** — 35 hits: `bg-white/[0.0X]`, `border-white/1X`, `text-white/Xx`, status hex `#EF4444`, `#F87171`, `#F97316`, `#38BDF8`, `#34D399`, `#A78BFA`, `#0A0202` in lookup tables and inline styles | 35 |
| `WorkflowExecutionPanel.tsx` (Audit drawer — dependent of Audit Mode) | (not explicitly claimed in v2.2 but implied complete) | **CATASTROPHIC GAP** — 91 hits across 3,934 lines: pervasive `style={{ borderColor: 'rgba(255,255,255,0.0X)' }}` and `background: 'rgba(255,255,255,0.0X)'`, raw hex (`#0d1a2d` drawer surface, `#C4B5FD`, `#FCD34D`, `#FCA5A5`, `#475569`), arbitrary Tailwind (`text-slate-/cyan-/emerald-`) on static decorative prose | 91 |

**Result:** Phase 3 v2.2 must be downgraded to v2.3 once `MasterCalendarPage.tsx`, `AuditModePage.tsx`, and `WorkflowExecutionPanel.tsx` migrations are completed in this Phase 4 session. The v2.2 self-attestation "Engineering Lead — ✅ Approved (all code gates green)" was based on an incomplete grep that missed both arbitrary Tailwind opacity patterns and the dependent drawer component.

### 2.3 Phase 4 deliverables — SCAFFOLD ONLY

| Deliverable | Current state | Evidence underlying it |
|---|---|---|
| `Phase4_Implementation_Spec.md` | Plan document | None — pure plan |
| `Cross_Surface_Consistency_Report.md` | Narrative claiming surface-by-surface "Pass" verdicts | **None** — no screenshots, no automated comparison, no measured tokens |
| `Accessibility_Edge_Cases_Fix_Plan.md` | Plan with H1/H2/H3/M1/M2/M3 items | **None** — no axe re-runs, no manual NVDA/VoiceOver evidence, no PR diffs |
| `Responsive_Parity_Validation.md` | Narrative claiming per-surface pass/minor verdicts at every breakpoint | **None** — no Playwright runs, no per-breakpoint screenshots |
| `Motion_and_Theme_Parity_Report.md` | Narrative claiming "3/5 surfaces have gaps" | **None** — no reduced-motion validation runs |
| `Legacy_Cleanup_and_Migration_Guardrails.md` | Plan describing ESLint + PR template + visual regression gate | **None** — ESLint config has zero custom rules; PR template has the right checkbox but no Phase 4 closure section |
| `Phase4_Final_Readiness_Package.md` v1.1 | Scope-corrected scaffold | Honest about its own incompleteness ✅ |

### 2.4 Permanent guardrails — NOT IN PLACE

- `eslint.config.js` is the minimal default `js + tseslint + react-hooks + react-refresh` set — **no `no-restricted-syntax`, no `react/forbid-dom-props`, no design-system custom rules**.
- `.github/PULL_REQUEST_TEMPLATE.md` has a "Design System Compliance" section with the right checkbox ("No new raw hex / rgb() / rgba() literals…") but the checkbox is **honor-system only**. No automated enforcement.
- `npm run verify:ui` (`scripts/verifyUiDesignSystem.ts`) exists but is not wired into pre-commit or CI gates.

## 3. Scope Reset for This Session

What this Phase 4 closure session **will** deliver:

1. **Real code remediation** of the three files where Phase 3 claimed completion but code disproves it:
   - `MasterCalendarPage.tsx` — 3 trivial Tailwind opacity replacements.
   - `AuditModePage.tsx` — full migration of `white/[0.0X]` arbitrary Tailwind to `ci-bg-overlay-*`/`ci-border-overlay*`/`ci-text-surface-*` utility classes; raw status hex in lookup tables replaced with `var(--ci-danger-fg)`, `var(--ci-warning-fg)`, `var(--ci-state-on-track)`, etc.
   - `WorkflowExecutionPanel.tsx` — migration of all 1:1-mappable inline `rgba(255,255,255,0.0X)` styles to `var(--ci-overlay-*)` tokens; static decorative `text-slate-/cyan-/emerald-` arbitrary Tailwind to `ci-text-surface-*` utilities where the intent is glass-on-glass prose. Runtime alpha-composition patterns (`${stateColor}55`, `${accent}1a`, etc.) are **preserved as legitimate design intent** and documented as a scoped exception.
2. **Permanent enforcement guardrails** (Package F, executed early in the session so subsequent edits are validated):
   - ESLint `no-restricted-syntax` rule banning new raw `rgba(`/`#[0-9A-Fa-f]{6}`/`bg-white/[`/`text-white/[`/`border-white/[` patterns in `src/policy/**/*.{ts,tsx}` (with file-level exception list for files that have legitimate runtime composition).
   - `.github/PULL_REQUEST_TEMPLATE.md` Phase 4 Closure section added.
3. **Honest documentation rewrites** of all six Phase 4 sibling deliverables — each "Status: Complete" line replaced with an accurate per-item status (✅ code-complete in this session / 🟡 partial / ⏳ pending human / ❌ deferred-out-of-scope-with-owner-and-date).
4. **Build + TypeScript verification** at the end (`tsc --noEmit --project tsconfig.app.json` + `npm run build` both exit 0).

What this Phase 4 closure session **will NOT** falsely claim to deliver (explicitly deferred to humans):

| Deferred item | Owner role | Why deferred |
|---|---|---|
| Playwright regression baseline regeneration after the new Phase 4 code shifts | Engineering / QA | Requires running dev server + Playwright suite with `--update-snapshots`; cannot be guaranteed from a non-interactive coding session. Procedure already documented in `Phase2_Exit_Criteria_Checklist.md` Appendix A. |
| Manual axe + NVDA + VoiceOver re-runs on 6 surfaces | Accessibility Lead | Requires assistive-tech hardware/software. |
| Per-breakpoint manual visual review at 375 / 768 / 1024 / 1440 / 1600 against Top Picks mocks | Design Lead | Requires human design judgment. |
| Reduced-motion + light/dark + CI-mode orthogonal manual validation across all surfaces | Design + A11y Leads | Requires browser session + judgment. |
| Final program sign-off in `Phase4_Final_Readiness_Package.md` §6 | Design Lead, Engineering Lead, Accessibility Lead, Product Owner | Human-only. |
| `BottomSheetDrawer` full WAI focus-trap (Phase 2 Appendix B item 1) | UI Primitives team | Substantial primitive enhancement; not a Phase 4 token-discipline issue. Tracked as P3-SO-03. |

## 4. Documents Affected by This Report

The following documents will be edited in this session to remove over-claims and align with this baseline:

- `Phase4_Final_Readiness_Package.md` → bumped to v2.0, replaces v1.1 scaffold with accurate code-state report and explicit deferred-to-human list.
- `Cross_Surface_Consistency_Report.md` → "Status: Report complete" downgraded to honest per-item status; fictitious "Pass" verdicts replaced with "Not yet validated by automated regression / human review".
- `Accessibility_Edge_Cases_Fix_Plan.md` → "Status: Plan complete" downgraded; H1/H2/H3/M1/M2/M3 items keep their analysis but each gains a real "Verification evidence" row that is honestly blank where blank.
- `Responsive_Parity_Validation.md` → fictitious per-surface "Pass" verdicts replaced with "Pending — Playwright regression required" rows.
- `Motion_and_Theme_Parity_Report.md` → narrative claims replaced with honest "Pending — manual validation required" rows; in-code reduced-motion guards on shell are documented honestly where they actually exist.
- `Legacy_Cleanup_and_Migration_Guardrails.md` → bumped to v2.0 reflecting the actual ESLint rule + PR template additions delivered in Package F.
- `Phase3_Exit_Criteria_Checklist.md` → bumped to v2.3 after the three code migrations land, replacing the v2.2 "Engineering Lead — ✅ Approved" assertion with an honest one based on a complete grep that includes arbitrary Tailwind opacity patterns + the dependent `WorkflowExecutionPanel.tsx`.

## 5. Execution Order

This session's execution order (for traceability):

1. **Package A** — this report (✅ in progress)
2. **Package F** — ESLint guardrail + PR template (early, so it gates subsequent edits)
3. **Package B-1** — `MasterCalendarPage.tsx` (3 fixes)
4. **Package B-2** — `AuditModePage.tsx` (35 fixes)
5. **Package B-3** — `WorkflowExecutionPanel.tsx` (~70+ token-safe fixes, ~20 deferred runtime-composition retained as design intent)
6. **Packages C / D / E** — honest doc rewrites (no fake validation)
7. **Verification** — `npm run lint` + `tsc --noEmit` + `npm run build`
8. **Package G** — final honest `Phase4_Final_Readiness_Package.md` v2.0 + `Phase3_Exit_Criteria_Checklist.md` v2.3

## 6. What "Phase 4 Closed — Evidence-Backed" Means Under This Report

When this session concludes, Phase 4 is **code-complete and guardrail-complete** but **not human-sign-off-complete**. The five human-only items in §3 above remain genuinely open. Anyone reading `Phase4_Final_Readiness_Package.md` v2.0 will see exactly what is delivered, exactly what is pending, and exactly who is responsible — no false "COMPLETE" badge.

---

**End of Phase 4 Current Reality Report**
