# Agent 11: Typography, Visual Hierarchy & Content Density Analysis

**Subagent:** 11 — Typography, Visual Hierarchy & Content Density Specialist  
**Date:** 2026-05-17  
**Primary Lens:** TYPOGRAPHY_SCALE.md + CONTENT_MICROCOPY_GUIDELINES.md + TASK_URGENCY_HIERARCHY_SPEC.md + live token/CSS usage  
**Scope:** Full audit of current type ramp across all surfaces in `src/`, identification of density/ hierarchy failures inside glass cards and operational panels.

---

## Executive Summary

The live application exhibits **severe micro-text creep** and **hierarchy collapse** that directly contradicts the calm-authority premium intention of the one-glass CI-ION system. While design references (TYPOGRAPHY_SCALE.md, tokens.json) specify a clinical-grade, breathing modular scale with 15–16 px body text, 1.5+ line-heights, and Montserrat/Inter stacks, the implementation is dominated by 9–13 px hardcoded or near-hardcoded sizes, tight or absent line-heights, and excessive small-caps uppercase labels packed into glass cards.

This creates noisy, cramped surfaces that fight scannability in the critical first 500 ms — exactly the opposite of the intended "professional but calm" voice for high-stakes healthcare compliance users.

**Core Finding:** Legacy operational density (CES boards, evidence forms, onboarding rails, dashboard task cards) was never reconciled with the v2 glass philosophy. Small text was used as a crutch for information volume instead of ruthlessly editing content and enforcing breathing room.

---

## 1. Current Type Ramp vs. Canonical References

### Live Implementation (src/index.css + components)
- Primary body font: `Outfit` (via `font-family: 'Outfit', 'Roboto', sans-serif;`)
- Heading-capable: `Montserrat` imported but under-used; many titles fall back to `font-semibold` on body stack
- Custom tokens (Phase 3):
  - `--ci-font-size-display-hero`: 42px
  - `--ci-font-size-display-section`: 26px
  - `--ci-font-size-kpi-value`: 36px
  - `--ci-font-size-card-title`: 15px
  - `--ci-font-size-body-sm`: 13px
  - `--ci-font-size-body-xs`: 12px
  - `--ci-font-size-meta`: 11px
  - `--ci-font-size-eyebrow`: 10px
  - `--ci-font-size-eyebrow-xs`: **9px**
- Utility classes: `.ci-text-eyebrow-sm`, `.ci-text-card-title`, `.ci-text-body-xs`, etc. (no line-height tokens)
- Widespread **hardcoded** values: `text-[10px]`, `text-[11px]`, `text-[12.5px]`, `text-[13px]`, `text-xs`, `text-sm`, `text-[26px]`

### Design Reference (TYPOGRAPHY_SCALE.md — Mobile/Desktop)
- Body: 15px mobile / 16px desktop (Inter 400/500), line-height **1.5 / 1.55**
- Body-sm: 13px / 14px, lh 1.45–1.5
- Label: 12px / 13px, weight 600
- Caption: 11px / 12px
- Card/subtitle titles: 20px / 22px (600)
- Explicit recommendation: **Never below 11px**
- Font stack: Montserrat 600/700 headings, Inter body, JetBrains Mono for IDs

### Generated Tokens (tokens.json in audit/Implementation)
- Matches live CSS vars closely (card-title 15px, body-sm 12px, eyebrow 10px, meta 11px)
- Font families: **Montserrat heading**, **Inter body** (not Outfit)
- **No line-height tokens defined** — major gap

**Gap:** Live app is ~1–2 px too small on body text, 1–2 px too small on secondary, uses wrong primary font family, and has no enforced line-heights. The 9 px eyebrow-xs and 10 px meta directly violate the "never below 11 px" rule.

---

## 2. Hierarchy Collapse & Density Problems (Glass Cards & Panels)

### Dashboard — TaskCard (src/policy/pages/DashboardPage.tsx:825)
```tsx
<button className="... rounded-2xl border p-4 ...">
  <div className="font-semibold uppercase mb-1 ci-text-eyebrow-md"> {domain} </div>
  <h4 className="font-semibold leading-tight ci-text-card-title"> {title} </h4>
  ...
  <span className="... ci-text-body-xs"> {owner} </span>
  <span className="... ci-text-eyebrow-sm"> {dueLabel} </span>  {/* 9px */}
</button>
```
- **Issues:** 10 px domain (uppercase), 15 px title (good), 12 px owner, **9 px badge**. Due labels for urgency (TODAY / 3D PAST) rendered at illegal size. Packed with avatar + divider + arrow. First-scan triage difficult.

### CES ExecutionUnitCard (src/policy/ces/components/board/ExecutionUnitCard.tsx:61)
```tsx
<h4 className="text-[12.5px] font-semibold leading-snug"> {title} </h4>
... Phase/Compliance/Audit badges ...
<div className="... text-[11px] ..."> {blockedReason} </div>
<span className="text-[10.5px]"> signatures </span>
<div className="text-[10px]"> Audit readiness score: XX% </div>
<span className="text-[11px]"> {owner} </span>
<span className="text-[11px] font-mono"> {date} </span>
```
- **Severe density:** 6–8 distinct text elements at 10–12.5 px inside a single p-3 card with space-y-2 and 1.5 px gaps. Top bar + 3 status chips + blocked block + signers + footer. Cramped, low breathing room. Directly fights premium glass intention.

### Evidence Center Forms & Filters (src/policy/pages/EvidenceCenterPage.tsx)
- Dozens of `text-xs` / `text-[11px]` / `text-[10px]` labels (`Event ID`, `Policy`, `Workflow`, filter chips, helper text, error states).
- Form fields use `text-sm` but surrounding metadata is tiny uppercase tracking-wider.
- High information density in narrow side panels and upload zones.

### Onboarding V2 Rails & Timeline (src/policy/onboarding-v2/pages/OnboardingV2Layout.tsx, AuditTimeline.tsx)
- Header meta: `text-[10px]`
- Phase items: `text-[12px]`, sub `text-[10px]`
- Timeline events: `text-xs`, `text-[11px]`, `text-[10px]` pre/code blocks
- Excessive small text for "v2 · Audit-grade..." descriptors.

### CommandCenterLayout Nav / Account Menu (src/policy/components/CommandCenterLayout.tsx:449)
- Menu items and role display: repeated `text-[13px]`
- Sub-role: `text-[11px]`
- Hardcoded everywhere instead of ci-text-* tokens.

### Additional Surfaces
- KPI cards: eyebrow 10 px + kpi 36 px (good contrast) but trend/meta 11 px.
- Status pills, BannerChips, urgency badges: frequently use 9–11 px + high tracking.
- Library / Taxonomy / Policy Detail: mix of Tailwind `text-sm` / `text-xs` + some ci- classes.
- AuthCard and modals: occasional `text-[13px] leading-[1.55]` (better) but inconsistent.

**Line-height crisis:** Almost no body elements declare `leading-[1.5]` or equivalent. `leading-tight` / `leading-none` dominate titles and values. Results in visually dense blocks even when font size is marginally acceptable.

---

## 3. Urgency Hierarchy & Microcopy Issues

Per TASK_URGENCY_HIERARCHY_SPEC.md:
- Level 2/3/4 should use clear badges + borders + bolder due text.
- Current: due labels often rendered at 9–11 px uppercase (`ci-text-eyebrow-sm`, `ci-text-eyebrow-md`).
- Overdue "3D PAST" and "TODAY" compete visually with domain eyebrows.
- Blocked reasons in CES cards use 11 px but are the only high-signal text — still feels cramped.

Microcopy (CONTENT_MICROCOPY_GUIDELINES.md):
- Many instances still use vague or legacy phrasing inside tiny text blocks.
- Form labels often "Event ID" without sufficient helper context (violates "explain why" rule).
- Empty states and status language are decent in some places (Dashboard EmptyBoardState) but overwhelmed by surrounding tiny typography.

---

## 4. First 500 ms Scan Legibility Assessment

**Failing surfaces (in priority order):**
1. CES ExecutionUnitCard — too many 10–12 px elements; eye cannot triage compliance state + owner + due + blockers in one glance.
2. Dashboard TaskCard list — 9 px due badges + 10 px domain + 15 px title in tight p-4; urgency signals lost.
3. Evidence filter/metadata panels — wall of 11–12 px uppercase labels.
4. Onboarding phase rails & timelines — 10 px meta drowns the hierarchy.
5. Account menus and secondary nav — 11–13 px feels "UI chrome" rather than premium.

**Passing (barely):** Hero KPI values (large), main page titles using ci-text-display-* (when used).

Result: Users under time pressure (clinicians, DONs) experience increased cognitive load instead of calm authority. The glass surface magnifies the problem because translucency + small text = reduced contrast at small sizes.

---

## 5. Root Cause & Legacy Debt

- Pre-v2 data-heavy dashboards and CES boards carried forward small-text patterns for "maximum information."
- Token contract (UI_TOKEN_CONTRACT_SPEC.md) was only partially enforced; many components never migrated from raw `text-xs` / arbitrary sizes.
- No line-height scale or "minimum text size" lint.
- Typography hardening was deferred in favor of visual glass / color / shell work (evident in Phase 3/4 reports).
- Outfit font (slightly condensed) + tight leading compounds the cramped perception vs. recommended Inter.

---

## 6. Unique Typography Lens Insight

**"The typography problem is not merely size — it is a betrayal of the glass contract."**

The single translucent deep-maroon glass layer was designed to feel like a **magnifying, calm, authoritative canvas**. When that canvas is filled with 9–12 px undifferentiated micro-text, dense rows of badges, and zero breathing room, the optical effect reverses: the glass no longer elevates the content — it **amplifies the noise**. Every extra pixel of tracking on a 10 px uppercase label or every missing 0.2 of line-height on a card title makes the premium surface feel cheaper and more stressful than a flat white legacy table would have.

The fix is not "make everything 2 px bigger." It is a **content-density reduction + typography hardening** that restores the intended hierarchy so the glass can do its job: make the most important signals (titles, urgency badges, due dates, blocked reasons) optically dominant while everything else recedes into calm, readable supporting texture. Only then does the UI deliver the "calm-authority" promise required for regulatory work under time pressure.

This lens reveals that typography is the single highest-leverage remaining lever for emotional premiumization and operational safety.

---

## Surfaces Prioritized for Remediation (Density Score)

| Surface                        | Primary Issues                          | Text Density Level | Urgency Scan Risk | Priority |
|--------------------------------|-----------------------------------------|--------------------|-------------------|----------|
| CES ExecutionUnitCard          | 10–12.5 px multi-element packing        | Extreme            | High              | 1        |
| Dashboard TaskCard + Board     | 9 px badges, 10 px eyebrows             | High               | High              | 1        |
| EvidenceCenter filters/forms   | text-xs labels + metadata walls         | High               | Medium            | 2        |
| Onboarding V2 rails/timeline   | 10 px meta everywhere                   | High               | Medium            | 2        |
| CommandCenter nav/menus        | Hardcoded 11–13 px                      | Medium             | Low               | 3        |
| KPI + Banner surfaces          | Mixed but mostly tokenized              | Medium             | Low               | 3        |
| Policy Library / Detail        | Inconsistent mix                        | Medium             | Low               | 4        |

---

**References Cross-Checked:**
- `TYPOGRAPHY_SCALE.md`
- `CONTENT_MICROCOPY_GUIDELINES.md`
- `TASK_URGENCY_HIERARCHY_SPEC.md`
- `src/index.css` (full typography block + utilities)
- `tailwind.config.js`
- `DashboardPage.tsx`, `CommandCenterLayout.tsx`, `ExecutionUnitCard.tsx`, `EvidenceCenterPage.tsx`, `OnboardingV2Layout.tsx`, `primitives.tsx`
- `tokens.json` (audit implementation)
- Multiple v2 mockup references (Desktop/Mobile glass panels)

---

*End of Analysis — see 4-Phase Plan for remediation path.*