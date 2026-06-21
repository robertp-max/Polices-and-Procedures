# New UI Implementation Plan — Full Functional Parity + Complete UI (Not Theme Swap)
**Date:** 2026-06-19  
**Context:** Review of live app active light mode [Image #1] (ACTIVE SPRINT "Sprint 12", SPRINT % "0%", AUDIT READY "0/445", ACTION IN PROGRESS 279, 4-col Events board: Critical & Overdue | At Risk | In Progress | Awaiting Action/Evidence, AGENCY READINESS - NOT READY banner, sidebar groups PRIMARY OPERATIONS / COMPLIANCE EXECUTION / ADMINISTRATION / KNOWLEDGE, exact metrics tiles, card density, tones).  
**Goal:** Implement the *new UI* (glass/SpotlightCard/BorderGlow interactive edge glow, exact MetricTile/SurfaceCard/ToneBadge/tones/hover-lift/shadows/radii/typography from prototype + CareIndeed spec) into the live app **while retaining 100% functional parity and UX-semantic alignment** (exact labels, numbers, data derivations, click flows, sidebar structure, board columns, readiness states, navigation semantics, sprint/Evaluation logic). Not a color swap. Full structural port.

**16 Parallel Agents Deployed (exhaustive, no stone unturned):**  
Agents 01–16 dispatched in parallel (general-purpose subagents) with self-contained prompts + explicit file reads/greps/list_dir on live code (DashboardPage.tsx:343+, CommandCenterLayout, ShellNavRail, stores, regulatoryEvents, compliance-execution), prototype (index.html tones~129/MetricTile~1982/SurfaceCard~1992/eventsBoardColumns~502/VIEW_GROUPS~1159/DashboardPrototype~4273+, redesign-page.css, BorderGlow.jsx/.css, CareIndeedReferenceApp.jsx), V6/ (54 PNGs + all *.md captions), Reference/CareIndeed Production Light Mode Design Spec.md, New_UI_Implementation_Plan.md, AGENT*.md, existing ui/ (V32*, SpotlightCard, SurfaceCard, GlassPanel). All outputs synthesized here. Cross-checks performed against screenshot description + code execution semantics.

**References (exhaustively read):**
- Live screenshot [Image #1] + derived invariants (exact strings/numbers/layout)
- `src/policy/pages/DashboardPage.tsx` (kpis ~343, BoardColumn ~642, AgencyReadinessBanner, evaluations/pipeline/critical, V32* usage)
- `src/policy/components/CommandCenterLayout.tsx` + `ui/ShellNavRail.tsx` (NAV_ITEMS, primary/ces/other groups)
- `src/index.css` + `redesign-page.css` (light tokens, drifts)
- Prototype full (index.html, __components__/*, redesign-page.css)
- V6/ (README, DETAILED_CAPTIONS_PER_SCREENSHOT.md, 02-dashboard.md, 03-ces-kanban-board.md, 01-main-shell.md + all 54)
- Stores/data: regulatoryExecutionStore, compliance-execution/*, regulatoryEvents.ts, mandatedEventsExpanded.ts
- Design Spec + prior plans (New_UI_Implementation_Plan.md, AGENT15/29/33, COVERAGE_AND_QA_REPORT.md)
- All other pages (CES, PM, journey/onboarding-v2, staffing, iAdmin, workflows, admin/identity) via list_dir/grep

**Success Criteria (invariants — any violation = failure):**
- Exact labels/numbers from screenshot on dashboard (ACTIVE SPRINT "Sprint 12", SPRINT % "0%", AUDIT READY "0/445", ACTION IN PROGRESS 279, other 3 KPIs, "Events", exact 4 column titles, banner "AGENCY READINESS - NOT READY").
- Exact sidebar groups + items + active states + widths (292/88px) + filter.
- 4-col board cards expose owner/domain/due/meta/chips/progress + awaiting badges (⏳/📋) + missing + CTAs where appropriate.
- Data derivations unchanged (evaluations via evaluateAudit + store, pipeline/critical/awaiting from complianceExecutionSelectors + snap, due-sorted).
- Click flows identical (goInstance → /calendar?...&workflow=1 or specific routes).
- New UI primitives everywhere appropriate: BorderGlow (full pointer edge + angle + conic + raf + 7-shadow stack) on premium cards/overlays, exact MetricTile (10px uppercase tracking~0.18em label, 3xl value, xs note, rounded-2xl p-4/5 shadow-soft tone tile), SurfaceCard (icon shell + ToneBadge + title + body + progress), restrained glass (shells/modals/drawers only), pale #F7FEFF base + white cards, no-black enforcement, radii 8-32, Montserrat/Roboto, hover-lift, tones map.
- All >54 views (prototype VIEW_GROUPS + live routes) covered or explicitly scoped.
- Build + visual QA pass (side-by-side prototype hash views + V6 PNGs + live screenshot).

---

## Executive Summary (Synthesized from All Agents)

Current live dashboard (DashboardPage.tsx) already has strong functional structure (7 KPIs derived from snap + evaluations + pipeline, exact 4-col BoardColumn with titles "Critical & Overdue"/"At Risk"/"In Progress"/"Awaiting Action / Evidence", AgencyReadinessBanner using SpotlightCard, V32MetricTile + GlassPanel usage) and data (regulatoryExecutionStore + compliance-execution + evaluateAudit).

Current gaps (full new UI, not theme):
- Visual primitives incomplete/drifted vs prototype + spec (live SpotlightCard = simple center radial; prototype BorderGlow = true edge proximity + angle + conic + multi shadow stack).
- MetricTile / SurfaceCard / ToneBadge structure + exact typography (10px/3xl/xs tracking) + tone pastel tiles + hover-lift not uniformly applied.
- Token drifts (teal #00797D vs #007970, radii 16/24 vs 24/32, surfaces #F8F3F0 vs #F7FEFF, incomplete no-black, heavy V3 glass leaking into light, mixed shadows).
- Sidebar grouping in ShellNavRail is close ("Primary Operations", "Compliance Execution") but needs exact alignment to screenshot semantics + prototype VIEW_GROUPS + 292/88 + filter + "X Views".
- Board cards lack full density (meta/chips/progress/awaiting badges/CTAs) present in prototype eventsBoardColumns + Kanban/BoardPrototype.
- Banner + specific numbers (0/445, 279, Sprint 12 0%) are dynamic in live but visual treatment + exact top-4 emphasis need new UI polish.
- Light mode is partial/mixed (dark-heavy index.css base + partial care-indeed-light overrides); prototype + spec is the hardened target.
- Overlays/modals/drawers/command use inconsistent glass/glow (prototype has full Veil* + BorderGlow + V6 captions).
- No unified extraction; monolithic prototype still separate.

**Plan:** Component-library-first extraction (primitives → composites → pages), token centralization (redesign-page.css + index.css merge to spec), full BorderGlow promotion + usage, exact card structures ported into live BoardColumn/TaskCard/KpiCard, sidebar hardening, CES + other pages adoption, feature-flagged incremental rollout (dashboard first), rigorous side-by-side visual + functional QA against prototype + V6 + live screenshot.

**Timeline (high-level from agents 15/29 synthesis):** Phase 0 (flags + extraction) 2-4d; Phase 1 Dashboard 3-5d; Phase 2 CES + core 1w; Phase 3 remaining pages + overlays 1w; Phase 4 broad + polish 3-5d. Gated on AGENT33 visual QA per milestone.

---

## 1. Live Screenshot [Image #1] Baseline + Exact Invariants (Agent 01 + cross all)

**Exact visible elements (must match 1:1):**
- Metrics top row (emphasized first 2 + others): ACTIVE SPRINT "Sprint 12", SPRINT % "0%", AUDIT READY "0/445", ACTION IN PROGRESS 279 (+ Missing Evidence, Critical Actions, Audit Open semantics).
- 4-col Events board: "Critical & Overdue" (danger/orange), "At Risk" (warning/amber), "In Progress" (progress/teal), "Awaiting Action / Evidence" (pending). Cards: owner/domain/due + meta + chips + progress + awaiting badges (⏳ Evidence / 📋 Action) + missing indicators.
- Banner: "AGENCY READINESS - NOT READY" (orange accent, ShieldX, reasons, "View Readiness Report" danger button, chips for At Risk/Grace/etc.).
- Sidebar: grouped PRIMARY OPERATIONS / COMPLIANCE EXECUTION / ADMINISTRATION / KNOWLEDGE (uppercase tracking headers), collapsible 292/88px, filter, active dark teal bg #004142 + white, exact items + lucide icons.
- Overall: pale atmospheric #F7FEFF base, white elevated rounded-2xl cards, soft shadows/hover-lift, teal structure + orange action, no black text/borders, tight density (gap-4 grids, p-4/5 cards), "What needs action now" header.

**Live code matches (DashboardPage.tsx:343 kpis, 501 4-col, 583 banner, 642 BoardColumn, 569 KpiCard using V32MetricTile + SpotlightCard; ShellNavRail primary/ces split; evaluations/pipeline from stores + evaluateAudit).**
**Gaps:** Visuals (tiles/cards/glows/tones exact), banner full treatment, awaiting column richness, sidebar exact casing/groups, token enforcement.

**Invariants (non-negotiable):** Labels/numbers exact, derivations (snap.activeSprint, sprintMetrics, readiness.auditReady/instances, pipeline.inProgress, criticalAndOverdue, awaitingBoardItems via selectAwaitingSignatureUnits + snap + fallbacks), due-sort, click routes, tone semantics. New UI only changes wrappers + styles.

---

## 2. New UI Primitives — Full Port (Agents 02, 07, 08, 09, 12, 13)

**Prototype exact (must replicate DOM + classes + behavior):**
- tones (index.html:129): 8 entries (teal/orange/amber/green/red/slate/violet/blue) with tile/badge/dot/bar.
- MetricTile (1982): rounded-2xl border p-4/sm:p-5 shadow-soft min-h-[92px] + tone tile + 10px font-extrabold uppercase tracking-[0.18em] label + mt-3 3xl font-extrabold tracking-tight value + mt-1 xs note.
- SurfaceCard (1992): rounded-2xl border bg-white p-5 shadow-soft hover:-translate-y-0.5 hover:shadow-lift + icon h-10 w-10 rounded-xl tone shell + ToneBadge + h3 + body + optional h-2 progress (tone bar).
- ToneBadge (1973): dot + uppercase pill.
- BorderGlow.jsx + .css (full): getEdgeProximity, getCursorAngle, pointer raf, build vars (7 opacities + 7 radials + conic from angle), .border-glow-card + .edge-light + mask + inset shadow stack. Props full. Used on SpotlightCard + Veil*/premium.
- redesign-page.css: .ci-redesign-light body (F7FEFF + no-black :where overrides + scrollbar none), :root tokens (exact #00797D/#C74601, #F7FEFF, radii 8-32, --shadow-soft/lift, --glass only restrained), .metric-tile/.surface-card/.tone-*/.hover-lift/.glass-panel.

**Live current (partial adoption):**
- SpotlightCard (src/components/ui): simple radial --mouse only (no edge/angle/conic/proximity/raf/7-stack).
- V32MetricTile + GlassPanel + SurfaceCard (policy/components/ui + V32DesignSystem): close typography but drifts (tracking 0.22em, min-h/padding, tone application via spotlight wrapper not direct tile, minimal SurfaceCard, radii 16/24 base).
- index.css light: drifts (#007970, warm #F8F3F0 surfaces, incomplete no-black, heavy v3 glass leaking, radii smaller, shadows mixed).
- Some V32 usage already in Dashboard (good bridge).

**Port rules (full UI, not swap):**
- Promote BorderGlow (full) to src/policy/components/ui/BorderGlow.tsx + .css. Update SpotlightCard to support `variant="border-glow" | "simple-radial"` (default border-glow for premium). Use on cards in board/dashboard + all overlays (VeilModal/Drawer, GlobalModalShell, CommandPalette, popovers).
- Exact MetricTile/SurfaceCard/ToneBadge port (or variants on V32) into ui/RedesignPrimitives.tsx or converge V32. Consume redesign-page.css tokens + .metric-tile/.surface-card/.tone-* classes.
- Central token set (see Agent 07 output): single canonical in index.css under html[data-theme="care-indeed-light"] + .light-shell + .ci-redesign-light (unify #00797D, F7FEFF, radii 8/12/16/24/32, surfaces layered, --shadow-*, restrained --glass only for shells, full no-black :where, fonts Montserrat/Roboto via --font-*). No raw hex downstream. Merge drifts from CorePrimitives/V32.
- Typography/spacing/radii/motion (Agent 08): exact 10px/3xl/xs tracking, rounded-2xl/24-32, p-4/5, gap-3/4 + space-y-3, hover translateY(-0.5 or -2px) + lift, 0.25s ease. Shell-contained (no 128px raw inside app). Tight density.
- Glass restraint (spec + css): only shells/modals/drawers/command (milky low-blur); cards = opaque white .surface-card + optional BorderGlow edge.
- Overlays (Agent 12): port Veil*/GlassPopover/CommandPalette + captions from prototype + BorderGlow; add GlobalModalShell wrapper; evidence/sign/eCign flows through them.
- Enforcement: .light-shell on shell/content; data-theme boundary for portals; lint no-hard-hex in light paths.

**Extraction (Agent 13):** Primitives first (BorderGlow, MetricTile, SurfaceCard, ToneBadge, getTone, DataTable, glass variants). Composites (BoardColumn, KanbanBoard variants, Calendar views). Config separate (VIEW_GROUPS → src/policy/config/redesignViews.ts or per-domain seeds). Shell integration (enhance Shell* + V32). Prototype updated to import shared (co-exist). Barrel in ui/index.ts. Domain cards reuse primitives.

---

## 3. Sidebar / Nav / Shell (Agent 03)

**Target (screenshot + prototype VIEW_GROUPS + spec):**
- Groups: PRIMARY OPERATIONS (dashboard + profiles + calendars + brad), COMPLIANCE EXECUTION (CES full subs: calendar/board/events/workflows/swimlane/master/audit/evidence/reports/my-tasks + taxonomy/onboarding/lifecycle/evidence), ADMINISTRATION / KNOWLEDGE (admin-*/system-docs/help/governance/hubstaff).
- Widths: w-[292px] expanded / w-[88px] collapsed.
- Active: bg-[#004142] text-white.
- Search filter ("Filter views..."), "X Views" badge, collapse, lucide icons.
- Top: icon-only capsule + logo + global search (⌘K → CommandPalette) + avatar.
- Subnav for groups with subs.

**Live (ShellNavRail + CommandCenterLayout):** Close (primaryIds/cesIds split, ShellCommandGroup, special /calendar vs ces logic, feature/page gates). Drifts: exact casing/groups not 1:1 "PRIMARY OPERATIONS", widths, some items missing from prototype coverage, filter/search not full.

**Steps:** 
- Harden ShellNavRail + CommandCenterLayout to exact groups/labels from prototype VIEW_GROUPS + screenshot semantics (keep router + gates).
- Map icons 1:1.
- Add filter/search + badge.
- Enforce 292/88 (css var --ci-shell-navrail-width).
- Topbar + subnav parity.
- Sidebar glass restrained per spec.

---

## 4. Dashboard Metrics + 4-Col Board + Banner (Agents 01, 04, 05)

**Live already strong (kpis memo exact labels + derivations from snap + evaluations + pipeline + awaitingBoardItems; 4 BoardColumn with exact titles; Spotlight banner).**
**New UI port (keep data 100%):**
- KpiCard → use exact prototype MetricTile (or V32 enhanced) + tone mapping (danger→orange etc.).
- BoardColumn → GlassPanel + header + rich cards using SurfaceCard + BorderGlow + full fields (meta/chips/progress/awaiting badges/CTAs/missing) + prototype tones. Special awaiting subcounts + dual CTAs.
- Banner → SpotlightCard (or BorderGlow) + exact status/supporting/accent + chips + conditional button.
- Events board columns in prototype (eventsBoardColumns ~502 + comments referencing live screenshot) use same seeds as compliance data; map to live pipeline/critical.

**Data parity (Agent 05):** 279 = inProgress (or matching live count), 0/445 from readiness + instances/artifacts, Sprint 12 from snap, 0% from sprintMetrics. Sort by due. Click targets identical.

---

## 5. Views Inventory & Full Scope (>54) (Agent 06)

Prototype: VIEW_GROUPS ~1159 → 55+ views (Dashboard, Clinician/Patient Profiles+detail, Calendar+staffing, Brad, CES 11 subs incl events-board/kanban/calendar/reports/my-tasks, Taxonomy 10, Onboarding 7 + v2 6, Policy Lifecycle, Hubstaff, System Docs 3, Admin 5, Prototypes 3). V6 54 PNGs + captions + COVERAGE report.

Live: ~98 routes in App.tsx; ~40-50+ unique pages + heavy subviews (iAdmin 35 files, journey 8, onboarding-v2 7+, ces 5, staffing 5, pm 5+, workflows swimlanes, security/identity admin 5+, prints, etc.). Exceeds 54 when counting variants.

**Mapping (key):** dashboard→DashboardPage, ces-calendar/ces-board/events-board→Ces* + Dashboard analogs, clinicians/patients→staffing pages, brad→iAdministrator, workflows→WorkflowLibrary + swimlanes, admin-*/system-* → security/identity + SystemDocumentation, journey/onboarding-v2 → dedicated, etc. Gaps noted (exact /ces/events may route to workloads or new; some admin granularity).

**Strategy:** Prototype VIEW_GROUPS as source-of-truth spec for labels/routes/icons. Prioritize high-traffic (Dashboard, CES full, profiles, library/forms, journey/onb-v2, PM, Brad, workflows, admin). Port new UI surfaces into existing pages (or parallel under flag). Standalone HTMLs (ComplianceCalendar etc.) → deprecate or map. Maintain >54 coverage via V6 + prototype.

---

## 6. CES Pages (Agent 10)

Prototype seeds + KanbanPrototype (7 lanes incl dedicated Awaiting Action/Evidence with awaitingType split + subcounts + badges + CTAs), CalendarPrototype + swimlane (Q2 QAPI 21 tasks), eventsBoardColumns (4 risk per screenshot), reports, my-tasks.

Live: CesBoardPage/CesCalendarPage/Ces* + complianceExecutionStore + selectors + SprintExecutionBoard (real data).

**Plan:** 
- CesLayout + shell integration.
- Use shared BoardColumn/Kanban + Calendar views (reuse prototype logic or enhance live).
- Wire real sprint/snap/selectors (preserve 279/33/4/5/9/18/445 etc.).
- Full cards + glows + metrics + awaiting specifics.
- MyTasks/Reports/Workloads use same primitives.
- Dashboard cross-link.

---

## 7. Other Major Pages (Agent 11)

PM (kanban/sprint/approvals/burndown): SurfaceCard + MetricTile on exact pm* seeds/columns.
Journey + Onboarding v2 (modules/phases/gates/batches/audit): MetricTile grids + SurfaceCard cards + DataTable + gate tiles.
Profiles (clinician/patient + detail): metrics + records + bars + detail cards.
Brad/iAdmin: metrics + chat + SurfaceCards.
Workflows + swimlanes: matrix/board + Surface.
Admin/identity: DataTable + Surface preview + records.

**Port:** Enhance existing pages or use PrototypePageView pattern with shared primitives. Keep exact records/IDs/titles/status/owners/progress from seeds + V6 + LIVE_APP_PAGEVIEWS. Sidebar groups consistent.

---

## 8. Overlays / Modals / Drawers / Forms / Interactions (Agent 12)

Prototype: VeilModal/Drawer + GlassPopover + CommandPalette (full BorderGlow + getOverlayGlowProps + V6 captions + restrained glass + OVERLAY_Z=60) + sign (typed + attest + seal) + eCign sequence + evidence attach.

Live: GlobalModalShell (absent in some reads), Veil* (partial), Spotlight on some, FormViewer/eCign, drawers/panels.

**Port:** Full Veil* + Command + GlobalModalShell with BorderGlow + captions. Restrained glass only. Evidence/sign flows through (attach → drawer → form modal → success). Preserve exact sequences + toasts + non-blocking.

---

## 9. Component Extraction & Library (Agent 13)

**Phased extraction (primitives → composites → pages):**
1. BorderGlow (full) + enhanced SpotlightCard.
2. RedesignMetricTile / SurfaceCard / ToneBadge / DataTable (exact + variants on V32).
3. Glass/overlay primitives + getTone.
4. BoardColumn + Kanban variants.
5. Config (VIEW_GROUPS / seeds → shared ts or domain data).
6. Shell pieces + page adoption.

**Files:** ui/BorderGlow.tsx+css, ui/RedesignPrimitives.tsx (or augment Core/V32), ui/Board*.tsx, config/redesignViews.ts, domain folders reuse. Prototype imports shared. Co-exist during (feature flag or conditional).

---

## 10. Routing / State / Flags / Rollout (Agent 14 + 15/29 plans)

**Integration:** Inside existing CommandCenterLayout + react-router (no bypass). Use real navigate + stores (regulatoryExecutionStore etc.). Data bridge only.

**Flags (pm/featureFlags.ts pattern):** `src/policy/.../redesignFlags.ts` (get/set/use, localStorage, console __redesign, VITE_*). Per-area (dashboard, ces, overlays, profiles...).

**Phases:**
- 0: Flags + primitives extraction + token centralization. Baseline screenshots.
- 1: Dashboard (flag NEW_DASHBOARD). Same stores + exact kpis/board/banner. New primitives + glows.
- 2: CES full + core ops.
- 3: Remaining pages + overlays + admin.
- 4: Broad + deprecate old tree.
- Rollback: flag flip (instant). Parallel prototype always live.

**Nav:** Exact ShellNavRail grouping always. PageAccess + FeatureRouteGuard outside flags.

**Co-exist:** Conditional inside pages or parallel lazy imports under flag. URL + localStorage override for testing.

---

## 11. Implementation Phases + File Changes (Consolidated)

**Phase 0 (prep, parallel):**
- Centralize light tokens (index.css under data-theme + .light-shell; reconcile redesign-page.css; no raw hex).
- Extract/promote BorderGlow + update SpotlightCard (full edge).
- Add redesignFlags.
- Update prototype to import shared where possible.
- Baseline captures (prototype + current live).

**Phase 1 (Dashboard):**
- Enhance KpiCard / BoardColumn / TaskCard / AgencyReadinessBanner in DashboardPage.tsx (use new MetricTile/Surface + BorderGlow + awaiting richness).
- Sidebar/topbar hardening for exact groups.
- Verify exact numbers/labels/flows vs screenshot.

**Phase 2 (CES + key):**
- Ces* pages + shared kanban/calendar primitives.
- PM, journey/onb-v2, profiles, brad, workflows, admin adoption.

**Phase 3 (overlays + polish):**
- Full Veil*/Command/GlobalModalShell + BorderGlow.
- Forms/eCign/evidence/sign flows.
- All remaining + visual tightening.

**Key files to touch (exhaustive highlights):**
- src/index.css (tokens), src/policy/pages/Redesign/redesign-page.css (keep or alias).
- src/components/ui/ + src/policy/components/ui/ (BorderGlow, primitives, Veil*, Shell*, V32 updates).
- src/policy/pages/DashboardPage.tsx (main).
- src/policy/components/CommandCenterLayout.tsx + ui/ShellNavRail.tsx.
- src/policy/ces/pages/* + layouts.
- App.tsx (flags + conditional).
- New/updated: ui/RedesignPrimitives.tsx, config/redesignViews.ts, redesignFlags.ts.
- Prototype updates (non-breaking).
- Tests/QA: side-by-side scripts + AGENT33 checklist.

---

## 12. Verification & QA (Agent 33 style + all)

- **Functional:** Unit (selectors/evaluator produce 279/0/445/Sprint 12 etc.); integration (clicks, updates, sort); E2E parity (same targets as before).
- **Visual:** Side-by-side (running prototype #hash vs live route + flag). Capture vs V6 PNGs + DETAILED_CAPTIONS + live screenshot [Image #1]. AGENT33 checklist (no black, exact labels/counts/structure, glows on premium, restrained glass, density, tones, radii, typography, hover).
- **Token/Theme:** Grep no raw hex in light paths; distance test ("pale atmospheric + white + teal + orange").
- **Regression:** Old paths (flag off) identical; stores mutations visible everywhere.
- **Coverage:** All 55+ prototype views + live routes exercised.
- **Build:** npm run build clean (no new errors).

---

## 13. Risks / Mitigations / Rollout Notes (Agents 15/29/33 + all)

- Data drift (seeds vs real): mirror first, then bridge.
- Visual inconsistency: strict side-by-side + token centralization.
- Perf (glow raf): throttle + only premium.
- Adoption fatigue: dashboard-first quick win; flags granular.
- Portal/theme boundary: explicit .light-shell + data-theme.
- Rollback always available.
- Scope creep: >54 is fine (user confirmed); prioritize by impact + V6.

---

## 14. Final Exhaustive Checklist (Leave No Stone Unturned)

- [ ] Live screenshot metrics/labels/banner/4-col/sidebar exact in flagged dashboard.
- [ ] All derivations from stores/selectors/evaluateAudit unchanged.
- [ ] BorderGlow full (edge + angle + conic + raf + stack) on premium + overlays.
- [ ] MetricTile/SurfaceCard exact (DOM, classes, typography, progress, tones).
- [ ] Light tokens central + spec-compliant (#00797D, F7FEFF, radii, no-black, restrained glass).
- [ ] Sidebar groups/labels/widths/filter/active exact.
- [ ] CES board/awaiting/columns/calendar/swimlane parity + visuals.
- [ ] All other pages (PM/journey/onb/profiles/brad/workflows/admin) use primitives + data parity.
- [ ] Overlays full Veil/Command + BorderGlow + captions + sign/evidence flows.
- [ ] >54 views mapped/covered.
- [ ] Flags + parallel + rollback.
- [ ] Visual QA vs prototype + V6 54 + screenshot passed.
- [ ] Build + no regressions.
- [ ] Documentation updated (this plan + V6 captions + AGENT files).

**Immediate next (after plan approval):** Spawn implementation subagents or execute Phase 0 extraction + flags. Run prototype + live captures for baselines.

This plan is the synthesized output of 16 parallel exhaustive agents + direct code/screenshot/spec review. Functional parity + full new UI (structure + effects) guaranteed when followed.

(End of master plan.)