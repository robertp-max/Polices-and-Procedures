# Master Consolidated Issues & Gaps Analysis
**Source:** 16 Independent Specialized Subagent Audits (May 2026)
**Date:** 2026-05-18
**Scope:** Full platform vs. Canonical UI System Spec + Top Picks / v2 Mock Visual Contract

---

## Executive Summary

Sixteen independent expert lenses (glassmorphism, 4-sided contract, tokens/primitives, shell, major surfaces, typography, mobile, accessibility, legacy, and cross-surface consistency) performed deep audits of the live application against the locked visual contract.

**Core Finding:**  
The platform has excellent *governance artifacts* and a correct architectural shell, but **implementation fidelity is low (estimated 35–45% overall)**. The product currently consists of multiple competing visual dialects rather than one unified "calm authority" glassmorphic system. Partial reconstruction has produced "glass islands" that promise unity while delivering fractured depth perception.

The single most damaging pattern is **systematic violation of the Constrained Page View Contract** (4-sided breathing room) combined with **parallel visual dialects** (especially CES Navy and Onboarding V2 rail) that destroy the perceptual mechanism that makes glassmorphism work.

---

## 1. Foundational / Systemic Issues (Affect Most or All Surfaces)

### 1.1 Unenforced Shell & 4-Sided Constrained Page View Contract (Highest Impact)
- **Agents:** 02 (primary), 01, 04, 05, 15, 08, 10, 06
- The outer `ShellFrame`/`ShellContentFrame` provides the correct inset and Layer 0 backdrop in many places, but **inner page containers universally override it**.
- Common violations: `h-full w-full`, self-nested `ShellContentFrame` (Dashboard), `-mx-3`, `bg-ci-bg` fills, custom rails, and special layouts (CES, Onboarding V2).
- **Result:** The visible Layer 0 backdrop framing the primary glass composition — the explicit mechanism required to make blur, translucency, edge glow, and depth legible — is destroyed on the majority of surfaces.
- Dashboard, Evidence, Policy Detail, Calendar, CES, and Onboarding are all confirmed violators.

### 1.2 Multiple Parallel Visual Dialects (Fractured Product Identity)
- **Agents:** 15 (primary), 06, 09, 08, 04, 07, 14
- At least six distinct visual languages are actively shipping:
  1. **CI-ION One-Glass Command Center** (Dashboard is the best example)
  2. **CES Navy Canvas Sub-Brand** (full parallel token system + `CesCard`/`CesLayout` + opaque canvas)
  3. **Onboarding V2 Light Professional Rail** (260px white/80 backdrop-blur rail + ces-navy accents)
  4. **Legacy Wave Glass-Lib** (`.glass-interactive-lib`, `.glass-panel-lib`, `ci-premium-*` classes)
  5. **eCign Paper Signing** (separate palette and treatment)
  6. **Cinematic Journey** (theatrical carousels and absolute positioning)
- These are not minor styling differences; they destroy the single perceptual illusion required by the Canonical Spec.

### 1.3 Low Adoption of Canonical Primitives & Tokens
- **Agents:** 03 (primary), 14, 15, 07, 08, 06
- Only ~12–18% real usage of `ui/` primitives (`GlassPanel`, `SurfaceCard`, `DataGrid`, etc.) on operational surfaces outside the shell.
- Massive raw value usage (2,000+ instances documented): hex colors, arbitrary spacing, local card components (`CesCard`, `SCard`, custom `KpiTile`, `GateTile`, etc.).
- Generated authoritative `tokens.json` pipeline was never wired into the running application.

### 1.4 Legacy Debt Not Being Retired (Parallel Universe Drift)
- **Agents:** 14 (primary), 03, 15, 07
- New canonical layer was successfully *added*, but almost nothing was *removed*.
- Dozens of legacy families (`CesCard`, `SCard`/`GenericSectionPanel`, `PmTaskCard`, custom tabs, `StatusBadge`, entire `iAdministrator/` subtree, backup `.old` files, etc.) still dominate production.
- This is the root cause of the repeated "Phase 2/3 code complete but no visible changes" reality reports.

### 1.5 Glassmorphism Implementation & Perceptual Failures
- **Agents:** 01, 13, 15, 02
- Decorative inner `backdrop-blur-sm` + `ci-premium-*` layers inside the main glass (violates strict 3-layer model).
- `TravelightBG` animated canvas ignores `prefers-reduced-motion`.
- Blur + moving light streaks create time-varying contrast and softened text that frequently fails 4.5:1.
- Focus rings lose definition over blur + animation.

---

## 2. Surface-Specific Severe Issues

| Surface / Area              | Primary Agents | Severity | Key Problems |
|-----------------------------|----------------|----------|--------------|
| **CES (Board, MyTasks, Hierarchy, Layout)** | 06, 07, 15, 14 | Critical | Full parallel navy system, opaque canvas, no 4-sided frame, `CesCard` + raw colors, 6-col fixed Kanban on mobile |
| **Evidence Center + Capture + Hierarchy** | 07, 01, 13, 15 | High | Legacy dense tables, raw dark `CesEvidenceHierarchyPanel`, custom `ci-premium-hero`, minimal primitive use |
| **Onboarding V2**           | 09, 15, 04     | High | Excellent engine, very poor visuals (flat white + ces-navy), 260px competing rail, low glass fidelity (~20-25%) |
| **Dashboard**               | 05, 01, 02, 03 | Medium-High | Still contains nested `ShellContentFrame` + `-mx-3` hacks, ad-hoc cards, incomplete urgency hierarchy |
| **Policy Library / Detail / Search** | 08, 15, 02 | High | Solid white `bg-white` cards and `h-full` containers kill the glass effect on the highest-frequency reading surface |
| **Calendar**                | 10, 15, 02     | Medium | Hard `grid-cols-7 gap-px` checkerboard patterns fight glass; full-bleed roots |
| **Mobile Experience**       | 12, 15         | High | Mostly shrunken desktop. CES, Onboarding, Policy, Evidence all fail v2 mobile mock patterns (bottom sheets, vertical stacks, thumb-first) |
| **Typography & Content Density** | 11, 13 | Medium | Micro-text (9–12 px) inside glass cards creates high cognitive load and destroys "calm authority" |
| **Accessibility (Glass-amplified)** | 13 | High | Missing focus traps in drawers/modals, reduced-motion violations, contrast failures over animated blur, insufficient live regions |

---

## 3. Cross-Cutting Gaps

- **No Mechanical Enforcement:** Almost every agent noted that the shell, 4-sided contract, primitives, and tokens are "correct but porous." There are no strong lint gates, PR checks, or visual regression requirements that actually block violations.
- **Visual Language Police does not exist:** No ongoing cross-surface screenshot gallery process against Top Picks mocks.
- **Image-Driven Gates Missing:** Progress is measured by checklists and token counts rather than side-by-side fidelity to the actual approved mockups.
- **Mobile Treated as Afterthought:** Despite strong claims, only the shell has reasonable mobile scaffolding. Most operational surfaces were never rebuilt for portrait glassmorphic use.
- **A11y Hardening Deferred:** Focus traps, live regions, and glass-specific contrast/motion fixes are not sequenced early enough.

---

## 4. Root Cause Summary

The dominant root cause across all 16 lenses is:

**"Parallel-universe drift enabled by lack of enforcement."**

A correct canonical system (shell + tokens + primitives + 3-layer model + 4-sided contract) was built and documented at a high level of quality. However, the organization allowed sub-domains (CES, Onboarding, regulatory, etc.) and legacy code to continue shipping competing solutions without mechanical consequences. Partial adoption created the illusion of progress while the perceptual contract that makes the entire design system valuable was widely violated.

Until the program shifts from "add canonical layer" to "**enforce single perceptual contract + retire everything else**," visible fidelity to the Top Picks and v2 mocks will remain low.

---

## 5. Program-Level Gaps (Added 2026-05-17 — Architect Review)

The 16 agent reports diagnose the *technical* state correctly. The following **execution-readiness gaps** were missing from the original synthesis and are equally severe because they are the mechanism by which the diagnosed drift will recur:

### 5.1 No Named Owners or Decision Authority
"Visual Language Police," "Design Lead," "Engineering Lead," "A11y Lead," and "Program Owner" are referenced but unstaffed. An unstaffed governance body in a 6-dialect codebase is decoration. **Without merge-veto authority vested in a named individual, every enforcement rule will be worked around.**

### 5.2 CES Decision Is the Hidden Phase 0 Blocker
The CES (a) migrate vs. (b) bound decision is currently scheduled for Phase 2. This is too late — enforcement infrastructure (lint rules, runtime assertions, visual regression baselines) built in Phase 1 will be born already compromised by an unresolved exception. **The CES decision must be a Phase 0 entry gate, not a Phase 2 workstream.**

### 5.3 Onboarding Engine vs. Visuals Split Is Unprotected
Agent 09 flagged a strong engine + weak visuals. The plan treats Onboarding as a visual rebuild and does not protect the engine contract during rail/card replacement. No engine contract test suite is named. Mid-flight engine regression is a likely program-derailment event.

### 5.4 eCign Is Essentially Absent
Mentioned once as a dialect, once as a Phase 3 surface. eCign is a regulated signature surface with legal implications. It needs an explicit workstream and a compliance sign-off gate before any visual change ships.

### 5.5 No Rollback / Feature-Flag Strategy
Surface-by-surface reconstruction in a live regulated product needs per-surface flags, dark deploys, and documented rollback. The plan never mentions any of these. A single failed Dashboard cut-over could stall the program.

### 5.6 Mechanical Enforcement Is Named But Not Designed
"ESLint ERROR on raw values and legacy imports" is a one-liner covering significant subprojects. Missing specifics:
- The 4-sided contract is a *runtime layout* concern, not statically lintable. No runtime dev-mode shell-frame assertion is specified.
- No visual regression tool selection (Chromatic / Percy / Playwright), baseline location, or flake-triage ownership.
- No `no-restricted-imports` boundary rule on `CesCard`, `SCard`, `ci-premium-*`, `iAdministrator/*`.
- No codemod strategy for the 2,000+ raw-value instances.

### 5.7 Tokens Pipeline Is Underscoped
"Wire `tokens.json` into the running app" is itself a 2–3 week subproject (Style Dictionary configuration, Tailwind theme generation, CSS variable emission, dark-mode duals, contrast pairings, consumer migration). It is currently a single bullet.

### 5.8 No Drift-Prevention for New Surfaces
The plan addresses existing drift but not the *next* CES — i.e., how a future domain team will be prevented from inventing a 7th dialect. A "new-surface intake template" + design-partner review is missing.

### 5.9 Mobile Deferred to Phase 3 Despite Mobile-First Mocks
The Top Picks corpus is dominated by portrait mockups (CES Board, Policy Detail, Evidence Capture). Treating mobile as a Phase 3 concern guarantees 3–4 months of desktop-only fixes that will need rework.

### 5.10 Success Metric "35% Legacy Reduction" Is Unfalsifiable
No baseline measurement, no inventory script, no published count. Without a Phase 0 baseline commit, the metric is fiction.

### 5.11 No Exception Registry
Real-world enforcement requires a documented, dated, owned exception list. The plan mentions an "exception registry" in passing under Phase 1 governance but does not specify format, owner, or re-justification cadence.

### 5.12 Timelines Are Aspirational
Original totals (~22–29 weeks) for a codebase at 12–18% primitive adoption with 6 active dialects, 2,000+ raw values, and an entire `iAdministrator/` subtree to retire are implausible. Honest range: **9–12 months**. Aspirational timelines are the #1 cause of "checkbox complete, visually unchanged" outcomes.

---

*End of Master Consolidated Issues & Gaps Analysis*