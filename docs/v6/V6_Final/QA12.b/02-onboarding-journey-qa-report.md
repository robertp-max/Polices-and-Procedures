# QA12.b — Onboarding / Journey Group Design QA Report

**Date:** 2026-06-21  
**Agent:** QA reviewer (Grok subagent) for V6 design  
**Scope:** Journey / Onboarding page views and Phase 12.2.a subviews (supervised visit drawer, learner picker, signature canvas, syllabus builder, TOC active nav, module failure/retry).  
**Routes in scope (7, no more):**  
- `/journey` (journey-overview)  
- `/journey/v1-journey`  
- `/journey/module/:moduleId` (module-player)  
- `/journey/appendix-f`  
- `/journey/supervisor`  
- `/journey/admin` (journey-admin)  
- `/journey/guide` (user-guide)  

**Blueprints compared:**  
- `docs/v6/V6_PHASE_12_2A_MISSING_SUBVIEW_BLUEPRINTS.md` (Sections A1–A6 for journey)  
- `docs/v6/V6_Final/07-journey.md` (and DETAILED_CAPTIONS*.md, 00-QA-OVERVIEW.md)  
- Cross-ref: V6_TOKEN_REGISTRY.md, src/index.css (weights), routeRegistry.ts  

**Total router-mapped views:** Registry reports 54 (per `V6_ROUTES.length` in routeRegistry.ts:102 + direct node eval). Per `docs/v6/V6_Final/QA12.b/00-QA-OVERVIEW.md`, conceptual total is 56 (54 router + overlays/auth). **No new parent routes** were added for the 17 missing subviews (20 subview instances) — all are `useState`-driven drawers/modals/embedded panels/toggles **inside** the existing 7 routes. Confirmed.

**AGENTS.md compliance:** Zero `*.js` under `src/` (verified via grep + ls; `predev`/`prebuild` not triggered here but rule followed — no `tsc` invocations). Report creation explicitly requested by task.

---

## 1. Parent Screens Read + Key Files

Critical files reviewed (via `read_file` + targeted `grep`):

- `src/v6/screens/pageviews/JourneyOverviewScreen.tsx` (full; 586 lines)  
- `src/v6/screens/pageviews/JourneyV1Screen.tsx` (full; 466 lines)  
- `src/v6/screens/pageviews/SupervisorScreen.tsx` (full; 717 lines)  
- `src/v6/screens/pageviews/AppendixFScreen.tsx` (full; 774 lines)  
- `src/v6/screens/pageviews/ModulePlayerScreen.tsx` (full; 582 lines)  
- `src/v6/screens/pageviews/JourneyAdminScreen.tsx` (full; 484 lines)  
- `src/v6/screens/RepresentativeScreens.tsx` (DocsScreen for `/journey/guide` at lines 2120–2156 + routing dispatch)  
- `src/v6/routing/routeRegistry.ts` (V6_ROUTES 73–79 for journey; full 98 entries)  
- `src/v6/routing/router.tsx` (shell mapping, no direct sub-routes)  
- Components: `src/v6/components/VeilDrawer.tsx`, `VeilModal.tsx`, `tokens.ts`, `index.css` (font weights)  
- Blueprints + captions as listed above.

Grep patterns used (multiple passes): `useState|VeilDrawer|VeilModal|signature|picker|builder|TOC|toc|failure|retry|learner|Log visit|supervised|activeHash|syllabus` (scoped to `src/v6/screens` + journey globs).

---

## 2. Route Registry Confirmation (No Extra Routes)

From `src/v6/routing/routeRegistry.ts:73-79` (exact):

```ts
{ path: '/journey', hashId: 'journey-overview', ... },
{ path: '/journey/v1-journey', hashId: 'journey-v1', ... },
{ path: '/journey/module/:moduleId', hashId: 'module-player', ... },
{ path: '/journey/appendix-f', hashId: 'appendix-f', ... },
{ path: '/journey/supervisor', hashId: 'supervisor', ... },
{ path: '/journey/admin', hashId: 'journey-admin', ... },
{ path: '/journey/guide', hashId: 'user-guide', ... },
```

- Exactly 7 journey routes. Subviews use internal component state only (no new entries in V6_ROUTES, no additions to routePresentation.ts or sidebar).
- `RepresentativeScreens.tsx:1110-1131` dispatches journey cases to the *Screen components (user-guide → `DocsScreen`).
- `isRepresentativeRoute` lists the hashes (no subview hashes).
- Total: 54 (matches current registry + QA overview doc). Subviews do not increase router count. **PASS on scope requirement.**

---

## 3. Subview Implementation Status vs Phase 12.2.a Blueprints

### 3.1 Supervised Visit Logging Drawer (inside `/journey/supervisor`)
**Blueprint (PHASE_12_2A... §A1):** VeilDrawer variant, w-full max-w-[420px], header "Journey supervisor / visit logs" (300,10px) + `Log Supervised Checkoff` (500,20px), learner summary card, grid inputs (date/time, preceptor dropdown, patient/visit textarea), competency checklist table (5 rows, pass/fail toggles 300 12px), outcome segmented tabs (Pass/Requires Remediation/Incomplete), follow-up, signature attestation + CTA to canvas, footer: orange `Log & Validate Visit` (disabled), teal Cancel. Shake on fail, mobile bottom sheet.

**Actual (`SupervisorScreen.tsx`):**
- Lines 243: `const [visitDrawerOpen, setVisitDrawerOpen] = useState(false);`
- Lines 522: Button `onClick` → `setVisitDrawerOpen(true)` ("Log visit").
- Lines 602-711: `<VeilDrawer open={visitDrawerOpen} eyebrow="Journey supervisor" title="Log supervised checkoff" tone="orange" ...>`
  - Learner summary card (selectedLearner) ✓
  - Inputs for date, preceptor, context (textarea) — **but all `readOnly` + static values (not real selectors)**
  - Competency checklist (5 items, ToneBadge) — **static divs, no interactive pass/fail toggles**
  - Outcome: 3-col button grid (Pass/Remediation/Incomplete) — close but not segmented tabs
  - Attestation checkbox present
  - Footer: Cancel + `Log and validate visit` (orange) — triggers mock update on selectedLearner
- **Issues:** Layout mostly matches but missing live inputs, checklist interactivity, link to signature canvas. Uses VeilDrawer correctly (inside parent, not separate route). **PARTIAL fidelity.**

### 3.2 Learner / Employee Picker (inside `/journey/supervisor`)
**Blueprint (§A2):** Right rail/panel or popover, search (Search icon, 300 13px), filter chips (All/GAO/Clinical RN/LPN 300 11px), scrollable list (name 500 13px + role 300 11px + status + mini progress `8/11 Steps`), attention dots, context footer.

**Actual (`SupervisorScreen.tsx`):**
- Lines 243: `const [learnerPickerOpen, setLearnerPickerOpen] = useState(true);`
- Lines 418: Toggle button in selected panel.
- Lines 428-489: `{learnerPickerOpen && (<div className="mb-lg rounded-lg border...">` — embedded inside the "Selected learner" aside (not overlay/popover/rail).
  - Search input ✓ (placeholder close)
  - Filter buttons (All, GAO, Clinical RN, HHA) — note "HHA" vs blueprint LPN; uses `font-medium` on active.
  - List rows: name (text-xs font-medium), track, ToneBadge, steps. Click selects.
  - No progress circle/bar per row, no orange alert dot.
- **Issues:** Scope correct (inside supervisor), but **not "right rail panel overlay or popover"** — it's an in-flow toggleable block. Filters incomplete vs spec. **PARTIAL.**

### 3.3 Preceptor / Journey Signature Canvas (modal inside appendix-f + supervisor)
**Blueprint (§A3):** VeilModal max-w-[480px], `Verify Identity & Sign` (500 16px), metadata (name/role/timestamp), canvas h-[180px] bg-slate-bg with watermark, Clear/Reset (300 12px), legal checkbox, disabled orange `Confirm Signature`.

**Actual:**
- `AppendixFScreen.tsx:368-370`: `useState` for `isSignatureOpen`, `signatureStrokes`, `attested`.
- Lines 548-555: Button "Open signature canvas" in signoff section.
- Lines 609-699: `<VeilModal open={isSignatureOpen} ... eyebrow="Verify Identity & Sign" title="Preceptor Signature Drawing Overlay" ...>`
  - Metadata grids ✓ (font-medium on values).
  - Canvas sim: click-to-stage (lines 654-668) with PenLine + "Draw signature here" (text-h3 font-light). No real <canvas> drawing.
  - Clear/Restore buttons (font-light) ✓
  - Checkbox + attestation text (font-light) ✓
  - Footer disabled confirm (orange) ✓
- **In supervisor?** Drawer (lines 704-709) has checkbox attestation **but no CTA or state to open signature modal**. Blueprint requires "inside appendix-f + supervisor".
- **Issues:** Modal present + scoped inside appendix-f route. Title uses "Preceptor" (matches blueprint trigger) but screen is HR Director context. Canvas is placeholder (click sets flag), not interactive draw. **NOT wired from supervisor.** **PARTIAL (appendix only).**

### 3.4 Syllabus / Course Path Timeline sequencing builder (toggle/embedded inside `/journey/admin`)
**Blueprint (§A6, NEEDS_HUMAN_REVIEW):** Two-col: left (title, track, desc, SLA), right (drag-reorder modules w/ GripVertical, Required/Optional toggle, policy link dropdowns, +Add/-Remove), top Publish (orange)/Save Draft.

**Actual (`JourneyAdminScreen.tsx`):**
- No `useState` for any builder/toggle at all.
- Lines 387-400: Static "Onboarding syllabus report" + `DataTable` of `syllabusRows` (catalogId, title, trigger etc.).
- Metrics/trends/queues/gates present but **zero builder UI, no drag, no sequencing controls, no Publish**.
- `SyllabusRow` interface exists only for the report table.
- **Issues:** **MISSING entirely.** Static report only. Not present as toggle/embedded subview. **FAIL.**

### 3.5 Guide/Appendix F TOC Active Navigation State
**Blueprint (§A4):** Vertical list in left rail (status icons CheckCircle/Circle/AlertCircle), titles 300 13px (active: 500 13px + left `--brand-teal` bar), scroll-spy highlight, mobile collapse to sticky header.

**Actual:**
- `AppendixFScreen.tsx:367`: `const [activeHash, setActiveHash] = useState('#hard-stop');`
- Lines 423-443 (TOC nav): `const isActive = activeHash === item.href`; classes: active uses `bg-tone-teal-bg text-brand-teal font-medium border-brand-teal`, inactive `text-secondary font-light border-transparent`. `onClick={() => setActiveHash...}`. Icons via `getTOCIcon` (teal/orange/slate). **STRONG match.** (Note: contents array + sections with ids.)
- `RepresentativeScreens.tsx:2120` (DocsScreen for `/journey/guide`): Static `{guideEntries.map...}`. Hardcoded `index === 0 ? 'bg-tone-teal-bg text-brand-teal' : ...` (no font-medium vs light distinction on items; h2 uses font-medium, section h3 font-light). **No useState, no handlers, no scroll-spy.** Highlight never changes.
- **Issues:** Appendix good (active state + weights). Guide **static only**. **PARTIAL.**

### 3.6 Module Player Failure / Retry State
**Blueprint (§A5):** Inline card (replaces quiz), orange banner `Score: 68% - Remediation Review Required` (500 18px), supportive body (300 14px), missed list, SurfaceCard recommended reading, supervisor notified banner, Retry (teal 300), Request Preceptor Review (orange).

**Actual (`ModulePlayerScreen.tsx:253`):** `const [showQuizFailure, setShowQuizFailure] = useState(true);`
- Lines 318-372: Conditional `{showQuizFailure ? ( <div className="grid min-h-[320px]...">` with:
  - Orange bg-tone-orange-bg banner: `font-medium` "Remediation review required" + `font-light` "Score: 68%..."
  - Missed topics 3-col grid (font-light labels, font-medium values).
  - Notified box (`font-light`).
  - Buttons: "Retry quiz" + secondary "Request preceptor review" (onClick set false → shows paused player).
- **Issues:** Matches layout/tone/content closely (inline block, actions). Toggle works. **GOOD.**

---

## 4. Design Consistency, Tokens, Typography

**Typography (ONLY font-light 300 / font-medium 500 — per blueprint + index.css + V6_TOKEN_REGISTRY §4):**
- Enforced via CSS: `--weight-body: 300; --weight-title: 500;`. Tailwind `font-light`/`font-medium` map to them; overrides in v6-app-map etc.
- Journey screens:
  - Titles/h2: `text-h2 font-medium text-ink` (e.g. JourneyOverview:327, Supervisor:328, Appendix:396, Module:275, Admin:341, Docs h2:2143) — **correct (500 for headers).**
  - Bodies/descriptive: `text-sm text-muted`, `text-body font-light`, `font-light` on p/span (e.g. JourneyV1:252, Module failure 326/350, Appendix 694) — **correct.**
  - Phase/module labels sometimes use `font-medium` on h3 (JourneyOverview:380, 439) — borderline (labels vs pure body); not violation but per blueprint body copy 300.
  - Filters/pills: occasional `font-medium` on active (Supervisor picker:446) — acceptable for "active text".
  - **No violations found:** Grep for `font-(semibold|bold|[4-9]00|600|700)` in screens returned 0 matches. Good.
- Buttons/footers pass `font-light` explicitly in places (e.g. Appendix 625, Module 356) — compliant.
- Veil* components use `font-medium` only on titles.

**Tokens / Layout / Non-token:**
- Heavy use of `bg-tone-*-bg`, `text-tone-*-text`, `border-hairline`, `bg-surface`, `text-brand-teal`, `ToneBadge`, `ProgressMeter`, `SurfaceCard`, `MetricGrid`, `DataTable` — consistent.
- VeilDrawer/Modal: used for drawer (supervisor) + modal (appendix). Props match (eyebrow, title, tone, footer). Portal + backdrop good.
- Colors: No raw hex in journey screens (good). Some drawer internals use direct `bg-tone-slate-bg` (tokenized).
- Layout: desktop:grid-cols etc. match patterns. Responsive notes in blueprint not fully tested here.
- Minor: Supervisor drawer uses static readonly inputs (dev sim); canvas is div sim not `<canvas>`.
- Consistency across journey screens: Metric grids + ToneTags + learner "Maria Santos, RN" + DON "Dr. Elena Navarro" shared — strong.
- JourneyOverview / V1 / Admin / Module use similar card patterns.

**Other screens (Docs/Generic/Rep):** Consistent with docs template (TOC-like sidebar + main).

---

## 5. Flags: Missing Pieces, Wrong Layout, Violations, Scope

**Major Gaps (vs 17/20 subviews in journey group):**
1. **Syllabus builder completely absent** in JourneyAdminScreen.tsx (no toggle, no 2-col, no drag). Report table only. (Critical for Phase 12.2.a.)
2. Signature canvas **not present/wired in supervisor** (only appendix-f). Drawer attestation has no "link to Hand Signature Canvas".
3. Learner picker: embedded block (not overlay/panel/popover as specified).
4. Guide TOC (DocsScreen): static, no active nav state or interaction (unlike Appendix's good impl).
5. Supervisor drawer: missing live form controls, interactive checklist toggles, follow-up textarea wiring, real signature CTA.
6. Canvas: placeholder (click-stages text), not drawing surface. No touch/mouse handlers.
7. Module failure is present but "showQuizFailure" defaults true (demo); no retry timeout or real quiz state.
8. No shared components extracted (e.g. SignatureCanvasOverlay or EmployeePicker) despite blueprint "Shared Component Candidate".
9. Minor naming: Signature modal title "Preceptor..." in HR Appendix F context.

**Typography / Token / Styling:**
- No hard violations of 300/500 only.
- Some body h3 use `font-medium` (e.g. JourneyOverview:380 `text-body font-medium`) — could be tightened to font-light for descriptive.
- Drawer/inputs use some `text-xs font-medium` on checklist items.

**Scope/Route:**
- All subviews properly inside existing parent components/routes. **PASS.** (No registry bloat.)

**Other journey fidelity (from 07-journey.md captions + seeds):**
- Metrics, learner rail, module cards, status, supervisor roster largely match prototype descriptions.
- Phase rail, Appendix checklist (15 rows), supervisor 5 learners present.
- Gaps vs full seeds (e.g. no full 11 modules in overview).

---

## 6. Prioritized Feedback + Improvement Suggestions (5+)

**P0 (Blockers for Phase 12.2.a completeness):**
1. **Implement Syllabus / Course Path Builder toggle** in `JourneyAdminScreen.tsx` (two-col layout, drag-reorder using GripVertical or html5, module Required/Optional toggles, policy dropdowns, Publish/Save actions). Add `useState` for "builderMode". Mirror exact spec from PHASE_12_2A §A6.
2. **Wire Signature Canvas from supervisor drawer**: Add trigger (per blueprint "CTA linking to...") + shared state or context to open VeilModal (or extract `SignatureCanvasOverlay`). Duplicate current appendix impl or factor.
3. **Make learner picker a proper overlay/rail** (VeilDrawer variant or popover; align to trigger). Add mini progress bars + alert dots per spec. Expand filters to include LPN.

**P1 (Fidelity + Polish):**
4. **Enhance supervisor visit drawer** to match blueprint exactly: live (non-readOnly) date/preceptor selects, real checklist toggles (use primitives/Checkbox or segmented), outcome tabs, follow-up area, disabled logic on Log button. Add validation shake.
5. **Make Guide TOC interactive** in `DocsScreen` (add `useState` for active section, click handlers + scroll-spy simulation like AppendixFScreen:424-436; apply `font-medium` + left bar to active).
6. **Upgrade signature canvas to real drawing** (use `<canvas>` ref + mouse/touch handlers for strokes; keep Clear/Reset). Support actual stroke capture (store path or base64 for "confirm").
7. **Extract reusable subview components**: `LearnerPicker`, `SignatureCanvas`, `VisitLogForm` (per "Shared Component Candidate: YES" in blueprints). Place in `src/v6/components/`.

**P2 (Consistency / QA):**
8. Audit all journey text: standardize `text-body font-light` vs `font-medium` on h3 labels (prefer 300 for descriptive per §A). Add explicit `font-light` on more secondary text.
9. Add mobile variants (bottom sheet for drawer) + more state (e.g. module failure "Request Preceptor" should simulate notify).
10. Cross-screen: ensure signature + picker + TOC use same Veil* + Tone* + weight patterns everywhere. Add data attrs for subview states (e.g. `data-subview="visit-logger"`).
11. Update registry/docs to lock "56" language consistently (per QA overview).

**Other notes:** All subviews stay inside parents → total router views unchanged. Strong use of existing primitives (Veil*, ToneBadge, DataTable). Demo states (e.g. open by default) are helpful for review.

---

## Summary

**Journey group QA result:**  
- **Routes:** 7 canonical, 0 extra, subviews scoped correctly. (Total ~54/56 conceptual holds.)
- **Implemented subviews (good/partial):** Supervised Visit Drawer (partial), Learner Picker (partial), Signature Canvas (appendix only), TOC active (appendix good; guide missing), Module Failure/Retry (good).
- **Missing:** Syllabus/Course Path Builder (complete gap).
- **Design/typo:** High consistency with V6 tokens; 300/500 weights respected (0 violations); minor layout/input gaps vs exact blueprints.
- **Files with concrete examples:** See sections above (SupervisorScreen:243/428/602, AppendixFScreen:367/423/609/654, ModulePlayer:253/318, Representative:2127 (Docs), JourneyAdmin:387 (no builder), routeRegistry:73-79).

**Next steps recommended:** Prioritize P0 items, then run full `npm run build` + `npm run lint` + visual dev verify. Re-QA after fixes.

**Report location:** `docs/v6/V6_Final/QA12.b/02-onboarding-journey-qa-report.md` (as requested).

**End of report.**
