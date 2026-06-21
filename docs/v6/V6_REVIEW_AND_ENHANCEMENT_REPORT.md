# V6 Review and Enhancement Report

> Authoritative review of the V6 pre-implementation corpus in `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2`. This report is deliberately blunt. The corpus is good in intent and badly under-specified in execution. Treat every P0 below as a hard STOP before fan-out.

---

## STATUS

**RESOLVED_WITH_BLOCKERS.**

Nine genuine P0 blockers survive (down from ~25 raw items after dropping speculative and duplicate findings). Every load-bearing claim was re-verified directly against `Policies_and_Procedures_V2` source. The corpus is **not yet buildable** under "the gate is law." Two cross-finding contradictions in the raw audit are reconciled here into a single ruling each (typography weight; crosswalk routing). The canonical contracts embedded in this report are authoritative; every V6 doc must be conformed to them before any worker fan-out.

**A correction to the prior adversarial pass:** that pass searched the wrong repository (`Policies_and_Procedures` instead of `Policies_and_Procedures_V2`) and therefore wrongly declared the gate script and all V6 docs "absent" or "not reproducible." Those verdicts are invalid. The original audit findings stand, re-confirmed against the correct V2 source. Do not let the adversarial pass's "absent" rulings re-enter the plan.

---

## EXECUTIVE VERDICT

**Honest assessment.** The V6 corpus is sound in *intent* and unbuildable in *current form*. It has a genuinely good architectural spine and three whole cohesion layers that are ~0% specified. If you fan out 14 parallel workers against the docs as they stand today, you will get 14 divergent solutions, a router that cannot compile past the gate, and two components fighting over one URL. This is a pre-implementation corpus that needs one hard reconciliation pass — not a rewrite, and not a green light.

**Strongest.** The component and template reuse spine is genuinely well-factored. Roughly 28 layout templates are dispatched off a single `view.template` switch, fed by a small shared kit (`MetricTile`, `SurfaceCard`, `ToneBadge`, `DataTable`) inside one `AppShell` / `Sidebar` / `Topbar` shell. Reuse is high and mostly correct — `matrix`, `evidence`, `detail`, `calendar`, `reports`, `docs`, `profiles`, `board` are each shared across 3–7 pageviews. The per-screen Stage A (static) / Stage B (reconnect) / Stage C (verify) pipeline, the gate-green-between-merges rule, no-bulk-re-include, and auth-last sequencing are all correct and worth preserving. The gate's *architecture* is right — scan compiled `dist/` as ground truth plus a source stale-`.js` guard. Only its content regexes are wrong.

**Weakest.** Three whole cohesion layers are essentially unspecified across every document:
1. **States** — interaction / empty / loading / error / permission: 0 of 54 pages specified in `V6_PAGEVIEW_INVENTORY.md`.
2. **Responsive** — 53 of 54 pages have no per-template collapse contract; only `mobile-incident` stands in.
3. **Accessibility as component contract** — no `h1`, a `div`-grid `DataTable` with no table semantics, color-only status, no focus-trapped overlays, no `prefers-reduced-motion`.

Compounding this, the two build plans (`V6_IMPLEMENTATION_PLAN.md` vs `V6_IMPLEMENTATION_SEQUENCE.md`) are genuinely unreconciled on phase order, primitive set, logic-reconnection timing, and token-file location.

**Is it cohesive enough to be the real foundation?** **Not yet — but it is one focused pass away.** The bones are correct and worth keeping. The corpus becomes a real foundation only after: (a) the designless gate stops blocking V6-native public routes; (b) the route table is made singular and collision-free; (c) one shared component catalog is ratified; (d) one token home is chosen; (e) the typography LOCK is enforced and the bold contradiction is killed; (f) CDNs are inlined; (g) the state/responsive/a11y layers are authored once per template; (h) `PLAN` is declared authoritative and `SEQUENCE` demoted. Until all nine P0s close, this is a strong draft, not a foundation.

---

## P0 — MUST FIX (blocks fan-out)

| ID | Issue | Affected | Resolution |
|----|-------|----------|------------|
| **P0-1** | Designless gate (`scripts/check-designless.mjs:26` `LEGACY_ROUTES`) unconditionally blocks the V6-native public routes `/library` and `/forms` (and `/print`, `/appendix`). `V6_APP_MAP` registers these as first-class V6 routes; the V6-1 router rewrite emits the literals into `dist/` and fails the very gate that must approve it. Under "gate is law" this is an unbuildable STOP — the single highest-priority blocker. **Verified:** line 26 = `/["'\`]\/(library\|forms\|print\|appendix)(\/\|["'\`])/`; line 57 scans `dist`; `V6_APP_MAP` lines 228/244/252/260 register `/library`, `/forms`, `/forms/:formId`, `/forms/:formId/esign`. | `scripts/check-designless.mjs` (lines 26, 57, header); `V6_DESIGN_VISUALIZATION.md` sec 6; `V6_IMPLEMENTATION_PLAN.md` V6-1 | Remove `LEGACY_ROUTES` from the dist scan, **or** convert to an allowlist that flags a reused path only when a legacy COMPONENT identifier co-occurs on the same construct. Reword `V6_DESIGN_VISUALIZATION` sec 6 from "do not restore `/library` `/forms`" to "do not import legacy `LibraryPage`/`FormViewer` COMPONENTS." Fix must land and pass on a router stub **before** V6-1 sign-off. Owner: gate-owner in V6-0. |
| **P0-2** | Route collision: `form-viewer` and `ecign-workspace` both declare `/forms/:formId`. Two React Router components cannot own one path. **Verified:** prototype `index.html` 1534 (form-viewer) & 1555 (ecign-workspace) both `/forms/:formId`; `V6_PAGEVIEW_INVENTORY.md` rows 18 & 20 both `/forms/:formId`; `V6_APP_MAP.md` line 260 uses `/forms/:formId/esign`. Docs disagree with themselves. | `src/policy/pages/Redesign/index.html` 1534/1555; `V6_PAGEVIEW_INVENTORY.md` row 18; `V6_APP_MAP.md` line 260 | Canonical: `form-viewer` = `/forms/:formId` (read/fill), `ecign-workspace` = `/forms/:formId/esign` (signing). Two distinct components — **never a mode flag**. Fix `PAGEVIEW_INVENTORY` row 18 to `/forms/:formId/esign`. Scope any eCIgn identifier rename to NEW V6 source only. Owner: composer in V6-1. |
| **P0-3** | `achc-crosswalk` is a distinct page type keyed only by `?view=crosswalk`; path/hash routing cannot reliably key on a query param. **Verified:** prototype `index.html` 1474 `/framework/achc-survey?view=crosswalk`; `V6_APP_MAP.md` line 220 same form. | `src/policy/pages/Redesign/index.html` 1474; `V6_APP_MAP.md` line 220; `V6_PAGEVIEW_INVENTORY.md` rows 01/02 | **Reconciled ruling** (resolves sub-path vs `searchParams` contradiction): promote to a distinct PATH `/framework/achc-survey/crosswalk`. Do **not** also keep a `?view=crosswalk` variant — shipping both re-creates the two-forms-one-view defect. Update prototype reference note, `APP_MAP`, `PAGEVIEW_INVENTORY`. Owner: composer in V6-1. |
| **P0-4** | No single authoritative shared-component catalog. `V6_DESIGN_VISUALIZATION` sec 5 names 14 families; `V6_IMPLEMENTATION_PLAN` V6-0 builds a generic kit (Button/Card/Input/Select/Badge/Table/Modal/Tabs); `V6_IMPLEMENTATION_SEQUENCE` Phase 2 builds only 4 (MetricTile/SurfaceCard/ToneBadge/DataTable). Three docs, three kits. `BoardLane` is required by 4 board screens but absent from the early sets — guaranteeing a duplicated one-off lane. **Verified:** DESIGN_VIZ 140–158 (14 families incl BoardLane/VeilModal/VeilDrawer/CommandPalette); PLAN 45–46 generic kit; SEQUENCE 39–42 four primitives. | `V6_DESIGN_VISUALIZATION.md` sec 5; `V6_IMPLEMENTATION_PLAN.md` V6-0; `V6_IMPLEMENTATION_SEQUENCE.md` Phase 2 | Ratify the 14-family catalog (sec 5) as the SINGLE catalog, two tiers (leaf primitives + 14 composites). Build ALL of them, named explicitly (incl `BoardLane` parameterized by column-config proven on 6/4/3/4-col variants), Opus-signed-off in V6-0 before any screen. No screen may define a catalog primitive. Owner: architect in V6-0. |
| **P0-5** | Token system has two conflicting homes and two conflicting value sources. PLAN puts tokens in `src/v6/theme/tokens.css`; SEQUENCE + DESIGN_VIZ put them in `src/index.css`. Prototype tones map (8 tones, stock-Tailwind palette) diverges from spec tone values. ~40 raw arbitrary-hex usages bypass tokens in the CES board. Status color comes from a substring regex, not a state model. **Verified:** PLAN line 43 `tokens.css` vs SEQUENCE line 24 `src/index.css`; `statusPattern` (index.html 2034) + binary `ToneBadge` (2061); `src/index.css` is a 13-line stub (refutes adversarial "5818 lines," which read the OLD repo). | `V6_IMPLEMENTATION_PLAN.md` line 43; `V6_IMPLEMENTATION_SEQUENCE.md` line 24; `V6_DESIGN_VISUALIZATION.md` sec 4/6; `src/index.css`; `index.html` 135–184, 2034, 3940–3985 | ONE token home: `src/index.css` (CSS vars); `tailwind` `theme.extend` references them; **delete** `tokens.css`. Author the full token registry incl chart/dataviz tokens for the off-palette CES hexes. Decide the canonical 8-tone set with full bg/border/text/dot/bar. Replace `statusPattern` with a typed STATUS→TONE→LABEL map (`statusTone.ts`) imported by DataTable/Kanban/Evidence/Gate, slate fallback + dev warning for unknown values. Gate fails raw-hex and stock-palette classes in source. Owner: architect in V6-0. |
| **P0-6** | Typography LOCK is violated 236× in the prototype, the loaded font cannot render the requested weights, and the raw audit contains a direct contradiction (one finding says strip all bold to 300/500; another says load Roboto 700 because reference screens look bold). The gate has zero typography enforcement. **Verified:** `index.html` `font-extrabold` ×152 + `font-bold` ×79 + `font-semibold` ×5 = 236; Roboto loaded 300;400;500 (line 64); gate has no font/weight regex. | `src/policy/pages/Redesign/index.html` (236 usages, line 64); `scripts/check-designless.mjs`; `V6_DESIGN_VISUALIZATION.md` node B1; `V6_IMPLEMENTATION_SEQUENCE.md` line 25 | **Reconciled ruling: the LOCK wins.** Load Roboto self-hosted at **300;500 only**; do **not** load 700. Strip all 236 bold/extrabold/semibold usages; build hierarchy via size/color/opacity/spacing/casing. The reference screenshots' bold look is a **prototype defect, not a target.** Add gate typography regexes (`FORBIDDEN_FONT` `Inter\|Montserrat`; `FORBIDDEN_WEIGHT` semibold/bold/extrabold/black in source class literals + `font-weight:600\|700\|800\|900` in dist CSS). Fix DESIGN_VIZ mermaid node B1 from "Page Titles & Subheadings" to "Page Titles only." eCIgn navy/orange is a palette exception only, never a weight exception. Owner: architect V6-0 + gate-owner. |
| **P0-7** | Production shell depends on prototype CDNs blocked by production CSP: Tailwind Play CDN, Google Fonts, FontAwesome (login only — a second icon system), Lucide jsdelivr, React/ReactDOM/`@babel/standalone` CDN, CloudFront logo. **Verified:** prototype loads `cdn.tailwindcss.com`, `fonts.googleapis` (line 64), FontAwesome (8 `fa-` hits), Babel-standalone CDN; `package.json` already has build-time `tailwindcss` + `lucide-react`. | `index.html` (lines 7, 62–66, 128–130, 1978/4472/4693); `V6_IMPLEMENTATION_SEQUENCE.md` Phase 0; `scripts/check-designless.mjs` | Self-host/inline everything before fan-out: build-time Tailwind (PostCSS); self-host Roboto 300;500 woff2; delete FontAwesome and migrate login `fa-*` to `lucide-react`; bundle the CareIndeed logo locally (prefer SVG); compile JSX at build time. Add the CDN/asset string ban to the gate. Owner: V6-0/V6-1. |
| **P0-8** | State/responsive/a11y layers are ~0% specified, and overlays are inert. `PAGEVIEW_INVENTORY` is 0/54 on interaction/empty/loading/error/permission; no responsive spec for 53/54 pages; no `h1`; `DataTable` is a `div` CSS-grid with no table semantics; status is color-only; overlays lack `role=dialog`/`aria-modal`/focus-trap/scroll-lock/Escape; no `prefers-reduced-motion` anywhere. **Verified:** 0 `prefers-reduced-motion`; DataTable div-grid (index.html 2029); color-only ToneBadge (2061); `@axe-core/playwright` installed but unused. | `V6_PAGEVIEW_INVENTORY.md`; `V6_DESIGN_VISUALIZATION.md`; `index.html` 2029/2034/2061 | Author a per-TEMPLATE state matrix (~28 specs covering all 56 pages) over the 6 categories, specified once per shared primitive. Make `DataTable` a semantic `<table>` (or explicit ARIA grid for editable variants), status as text+glyph. Build overlay primitives (VeilModal/VeilDrawer/CommandPalette) with portal + focus-trap + return-focus + `role=dialog` + `aria-modal` + scroll-lock + Escape + backdrop — ONE combined a11y+motion contract. Add global `@media(prefers-reduced-motion:reduce)` to `src/index.css` (animation:none on the pulse). PageHeader emits the single `h1`. Add axe + responsive gates to Stage C. Owner: architect V6-0 + V6-2 Stage C. |
| **P0-9** | Coverage gaps + plan incoherence. Registry has **56** views but `PAGEVIEW_INVENTORY` says 54; `events-board` (`/ces/events`) and `login-page` (only auth screen) have no reference PNG and no row; PLAN buckets ~20 dense screens as "(remaining V6_Final surfaces as scoped)"; PLAN and SEQUENCE contradict on build order and logic-reconnection timing. **Verified:** 56 `view()` registrations in `index.html`; `PAGEVIEW_INVENTORY` line 3 says "54"; V6_Final has 54 numbered PNGs with no events-board/login-page; SEQUENCE orders Dashboard/boards before primitives while PLAN inverts. | `V6_PAGEVIEW_INVENTORY.md` line 3; `V6_IMPLEMENTATION_PLAN.md` V6-2; `V6_IMPLEMENTATION_SEQUENCE.md` phase order; `index.html` (events-board 1334, login-page ~1959) | Produce ONE 56-row canonical matrix (= route table = coverage = state-matrix host) with reference-or-`INFERRED_FROM_V6_SYSTEM` status, owner, phase, done-flag; assert 56/56 in Definition of Done. Add `events-board` (INFERRED, 4-col BoardLane) and `login-page` (INFERRED, built in V6-3 with auth). Declare PLAN authoritative; demote SEQUENCE to a parity checklist; adopt static Stage-A then per-screen Stage-B reconnection (KEEP_MANIFEST only, no bulk include); auth last. Owner: architect/orchestrator before V6-2 fan-out. |

---

## P1 — HIGH-VALUE (do, but not a build blocker)

| ID | Enhancement | Benefit | Phase | Risk |
|----|-------------|---------|-------|------|
| **P1-1** | Hash-id is the immutable canonical key for every view; never identify a screen by route path or template name (matrix/evidence/reports/detail/board are intentionally reused across 3–7 routes). Keep hash ids stable when renaming display labels. | Stops screens being silently re-pointed when paths/labels churn; makes the coverage matrix joinable | V6-1 | Low (doc discipline) |
| **P1-2** | Guardrail against the bare greedy `/:policyId`: forbid any top-level single-segment `:param` route; `policy-lifecycle` = `/policy-lifecycle`, deep-link = `/policy-lifecycle/:policyId`. Add a router-config test that fails on a pattern exactly `/:param`. (Downgraded from P0 — not demonstrably present in the current registry.) | Prevents a future greedy route swallowing every screen | V6-1 | Low |
| **P1-3** | Prototype→production conversion mandate as explicit Stage-A checklist: delete the two duplicate `hashchange` listeners (index.html ~4863/4895), convert the `redesign-calendar-swimlane` CustomEvent and `#personal-ops-panel` magic hash to React state/context, replace `window.lucide.createIcons()` (2406/4911) with `lucide-react`. Add gate rules: no `hashchange`/`window.lucide`/`data-lucide` in V6 source. | Removes the hidden DOM-event coupling that breaks under React routing | V6-1 | Low |
| **P1-4** | Route-level code splitting (`React.lazy`+`Suspense`) per top-level area + per-route `errorElement` + root and content-region error boundaries (keep sidebar/topbar interactive, offer retry). Move error/loading out of the single V6-3 bullet into per-screen Stage C DoD. | Faster first paint; one broken route can't blank the shell | V6-1 skeleton, V6-2 per screen | Low (react-router 7 native) |
| **P1-5** | URL-backed state via `useSearchParams`/route params for calendar view-mode, board filter chips, list filters (achc crosswalk handled by the distinct path per P0-3). Wire the currently-inert Day/Week/Month and tab toggles. | Shareable/bookmarkable state; kills dead toggles | V6-2 | Low |
| **P1-6** | `useDeferredValue`/`startTransition` on the sidebar filter that drives `visibleGroups` across all 56 views and on large DataTable filters; virtualize only the documented-large lists (Policy Library ~269, Evidence ~445, Lifecycle ~279), preserving keyboard nav and accessible headers — never virtualize small admin tables. | Keeps the global filter responsive at scale without breaking a11y | V6-1 sidebar, V6-2 tables | Medium (virtualization vs a11y — scope tightly) |
| **P1-7** | Nested routes + shared layouts (`Outlet`) for list→detail pairs and the forms viewer/esign pair; route-aware breadcrumbs derived from the matched hierarchy. | Removes layout duplication; breadcrumbs come for free | V6-1/V6-2 | Low (depends on P0-2/P0-3 first) |
| **P1-8** | Canonical button hierarchy (primary teal solid, secondary teal outline, tertiary ghost; orange reserved for attention/urgency, not a generic primary). Table/form density tokens (row height, cell padding, header treatment). Single icon-size ramp. | One product decision kills per-screen button drift | V6-0 | Low-medium (one decision on orange) |
| **P1-9** | Worker-roles reconciliation (downgraded from P0 — process, not correctness): one fleet roles table; state Gemini/Codex roles or "none"; state Claude==Opus if true; define a secondary Stage-C reviewer so Opus is not a 56-screen QA SPOF; composer owns ALL route literals. | Removes the QA throughput single-point-of-failure and route-literal ambiguity | V6-0 orchestration | Low |
| **P1-10** | Self-host/inline the CareIndeed logo (full + collapsed) as optimized SVG; replace the `placehold.co` onError fallback with a local inline SVG. | Removes the last CDN dependency in the shell | V6-0 | Low |

---

## P2 — LATER (post-MVP / polish)

| ID | Item | Reason to defer |
|----|------|-----------------|
| **P2-1** | Nested help-center `/help/*` splat with article slugs; single help view suffices initially but design the splat before content grows. | Not a shell/routing blocker |
| **P2-2** | `system-docs` `/system-documentation/:sectionId` has a param but renders a static list; defer param-driven section loading until content is sourced. | Not a blocker |
| **P2-3** | Decide/delete the 3 orphan templates (`gantt`, `survey-packet`, `personal-ops`) — default to DELETE unless a registry view references them; no dead switch cases at merge. | Verify orphan status against the ported registry first |
| **P2-4** | Reconcile the mermaid Area A–K graph vs body section headers in `V6_APP_MAP.md`; fix `v6-app-map.html` to render all 56 and correct its badge. | Cosmetic doc inconsistency |
| **P2-5** | Contrast/AA audit of pastel tone tokens (9–11px uppercase ToneBadge on pale backgrounds) with axe; density toggle (comfortable vs compact) for dense admin/evidence/audit tables. | Polish after P0 tokens land |
| **P2-6** | Date/timestamp standard: `formatDate`/`formatTimestamp` utils; audit/eCIgn timestamps stored UTC/ISO-8601, displayed with explicit timezone; relative formats banned on audit surfaces. | Compliance hygiene; not a reproducible code conflict |
| **P2-7** | Consolidate the ~50 boilerplate per-screenshot captions into real per-screen descriptions or point them to the coverage matrix. | PNGs are ground truth; low priority |
| **P2-8** | Replace the calendar hover-card 1000ms close delay with ~150–200ms + re-enter intent buffer; overlaps the swimlane custom-event conversion (resolve once in P1-3). | Micro-interaction; folds into conversion mandate |

---

## APP COHESION FINDINGS

- **Shell.** One `AppShell` / `Sidebar` / `Topbar` is correct and reused across all 56 views; sidebar 292/88px expanded/collapsed. Keep it. The shell currently depends on a CloudFront logo and a `placehold.co` fallback — both must be inlined (P0-7, P1-10).
- **Nav.** Sidebar filter drives `visibleGroups` across every view (a global hot path — defer it, P1-6). Composer must own ALL route literal strings; grok renders nav as placeholders only in Stage A and must not author path strings.
- **Layout.** ~28 templates dispatched off a single `view.template` switch — the genuine strength. Reuse is correct except for the catalog being split three ways (P0-4) and `BoardLane` missing from early sets.
- **Typography.** Roboto only, 300 + 500, two weights ship. 500 permitted ONLY on page titles/h1–h2, sidebar/nav labels, status/ToneBadge text; everything else is 300. 236 prototype violations + no gate enforcement (P0-6). The bold reference look is a defect, not a target.
- **Components.** 14-family catalog (sec 5) is the right shared kit; it is just not yet ratified as the single source and not fully built in V6-0. Leaf primitives ship every state once; pages inherit.
- **States.** ~0% specified (P0-8). A pageview is not "covered" until its template's 6 state categories are specified — spec ONCE per template (~28), not per page (56).
- **Responsive.** 53/54 pages undefined (P0-8/P0-9). Per-template collapse contract is a fan-out gate, not an afterthought.
- **A11y.** No `h1`; div-grid DataTable; color-only status; inert overlays; no `prefers-reduced-motion`. Make these component contracts on the primitives, enforced by an axe Stage-C gate (`@axe-core/playwright` is already installed and unused).
- **Motion.** Single canonical motion language in `src/index.css` + `theme.extend`: `--motion-fast 120ms` (hover/press/tab/row), `--motion-base 200ms` (cards/popovers/toasts/route content), `--motion-slow 280ms` (drawers/sidebar/bottom-sheet); `--ease-standard cubic-bezier(0.2,0.8,0.2,1)` enter/move, `--ease-exit cubic-bezier(0.4,0,1,1)` leave. No enter/exit >300ms (retire the 600ms fade-in-up and 0.7s drawer). Mandatory global `prefers-reduced-motion` block (durations → ~0.01ms, `animation:none` on the pulse). One unified toast duration (3000ms), one press-scale (~0.98), hover-lift `translateY(-2px)` reserved for elevatable cards only.

---

## COMPONENT COVERAGE

- **Totals.** Registry = **56 views** = 54 router routes + 2 overlay/auth. `PAGEVIEW_INVENTORY` says 54 — off by 2 (P0-9). Templates ≈ 28; shared kit = 14 composite families + leaf primitives.
- **Uncovered pageviews (no reference PNG, no row).**
  - `events-board` (`/ces/events`) — build `INFERRED_FROM_V6_SYSTEM`, inherit 4-col `BoardLane` config from `ces-board` + LIVE dashboard 4-col baseline.
  - `login-page` (`/login`) — only auth entry; build `INFERRED`, inherit glass surface + CareIndeed logo from shell; wire in V6-3 with auth bootstrap.
  - ~20 dense screens unscheduled in PLAN's open-ended bucket: onboarding-v2 ×6, journey (`module-player`, `appendix-f`, `journey-v1`, `journey-admin`, `user-guide`), `evidence-center`, `audit-mode`, `master-controls`, `ces-reports`, `ces-calendar`, `mobile-incident`, `artifact-viewer`, `generic-reference`, `surveyor-viewer`, `hubstaff`, `governance`, admin ×4 — enumerate each as a matrix row.
- **Duplicates / risk of forks.** `BoardLane` required by 4 board screens but absent from early primitive sets → guaranteed one-off lane unless built in V6-0. Status logic forked between a substring regex and any future state model → collapse to `statusTone.ts`.
- **Missing shared primitives.** `BoardLane`, `VeilModal`, `VeilDrawer`, `CommandPalette`, `ChatThread`, `ProgressMeter`, `ChecklistTable` are named in the 14-family catalog but missing from PLAN's generic kit and SEQUENCE's 4-primitive set. All must be built and signed off in V6-0.
- **Dense screens needing per-screen sub-component + state checklists.** `form-viewer` (7 section layouts × 11 field types), `ecign` (6 ordered no-skip steps + signer states + navy/orange brand), `policy-detail` multi-pane, `policy-lifecycle` (DRAFT→REVIEW→APPROVED→PUBLISHED→ARCHIVED), `onboarding-v2` (5 gate tiles + hash-chain audit), admin RBAC permission-matrix.

---

## ROUTE & PLAN CONFLICTS

| Conflict | Resolution |
|----------|------------|
| Gate (`check-designless.mjs:26`) blocks V6-native `/library`, `/forms`, `/print`, `/appendix` that `V6_APP_MAP` registers. | Remove/allowlist `LEGACY_ROUTES`; gate bans legacy COMPONENTS + COLORS + COMPILED legacy output, not reused public PATHS. Land + pass on a router stub before V6-1 (P0-1). |
| `form-viewer` and `ecign-workspace` both claim `/forms/:formId`; INVENTORY rows 18 & 20 vs APP_MAP line 260. | `form-viewer` = `/forms/:formId`; `ecign` = `/forms/:formId/esign`. Two components, never a mode flag. Fix INVENTORY row 18 (P0-2). |
| `achc-crosswalk` keyed by `?view=crosswalk`; audit split on sub-path vs `searchParams`. | One PATH `/framework/achc-survey/crosswalk`; drop the query variant entirely (P0-3). |
| Token home: PLAN `src/v6/theme/tokens.css` vs SEQUENCE/DESIGN_VIZ `src/index.css`. | `src/index.css` is the sole token home; delete `tokens.css` (P0-5). |
| Component catalog: 14 (DESIGN_VIZ) vs 8 generic (PLAN) vs 4 (SEQUENCE). | 14-family catalog is canonical; build all in V6-0 (P0-4). |
| Typography: LOCK (strip to 300/500) vs "load Roboto 700." | LOCK wins; load 300;500 only; do not load 700 (P0-6). |
| Build order + logic-reconnection timing: PLAN vs SEQUENCE inverted. | PLAN authoritative; SEQUENCE demoted to a parity/visual-audit checklist appendix (P0-9). |
| Inventory count 54 vs registry 56. | Authoritative count is 56; add events-board + login-page (P0-9). |
| Bare greedy `/:policyId` landmine. | Forbid top-level single-segment `:param`; deep-link is `/policy-lifecycle/:policyId` only; add a router-config test (P1-2). |

---

## REACT ENHANCEMENT RECOMMENDATIONS

| Feature | Location | Benefit | Phase | Risk / Verdict |
|---------|----------|---------|-------|----------------|
| react-router 7 data routes replace hash routing; delete duplicate hashchange listeners; custom DOM event + magic hash → React state/context | Router skeleton; index.html ~4863/4895, swimlane event, `#personal-ops-panel` | Removes hidden DOM coupling; real routing | V6-1 | **Accept.** Low. |
| Route-level lazy + Suspense per area + per-route `errorElement` + root/content-region error boundaries | Router skeleton + per screen | Faster first paint; isolated route failures | V6-1/V6-2 | **Accept.** Low. |
| `useDeferredValue` on sidebar filter + large-table filters | Sidebar + DataTable | Responsive global filter at scale | V6-1/V6-2 | **Accept.** Low. |
| Virtualize only the 3–4 documented-large tables, preserve a11y | Policy Library / Evidence / Lifecycle | Render perf on long lists | V6-2 | **Accept.** Medium — scope tightly, never small tables. |
| Skeleton/empty/error states tied to Stage-B async reconnection, specified per template | Per template (~28) | Coherent loading UX, no per-page reinvention | V6-2 | **Accept.** Low. |
| Real focus-trapped overlay primitives (portal, return-focus, aria-modal, scroll-lock, Escape) | VeilModal/VeilDrawer/CommandPalette | A11y + correctness for all overlays at once | V6-0 | **Accept.** Low-medium. |
| Real Cmd/Ctrl-K command palette over the VIEW registry | CommandPalette | Power-user nav across 56 views | V6-3 | **Accept.** Low. |
| React Query / TanStack Query for server-state | — | — | deferred | **Reject (for now).** Premature; react-router loaders may suffice; revisit after Stage-B reveals fetch shape. |
| Optimistic UI broadly (signing/gate-advance/task-moves) | — | — | deferred | **Reject.** Correctness hazard for a compliance/hash-chain/dual-signature product; allow only on low-stakes interactions, never signing/evidence/audit. |
| View Transitions API for cross-route animation | — | — | rejected | **Reject.** Cosmetic; conflicts with reduced-motion for an audit audience. |
| Animated counters on compliance KPIs | — | — | rejected | **Reject.** Trivializes numbers users must read precisely; negative a11y value. |

---

## DOCUMENTS UPDATED

- `scripts/check-designless.mjs` — remove/allowlist `LEGACY_ROUTES` (26); add `\b` to `LEGACY_NAMES` (25) + run name scan on `src/**/*.tsx`; tighten `LEGACY_COLOR` (24) words to CSS-value context; add typography regexes (`Inter\|Montserrat`; weight 600–900); add CDN/asset string ban (`cdn.tailwindcss.com`, `fonts.googleapis/gstatic`, `cdnjs`, `jsdelivr`, `cloudfront.net`, `@babel/standalone`, `placehold.co`, `fa-`); add a positive-pass CI fixture; update header comment (public-path reuse is intentional).
- `docs/v6/V6_PAGEVIEW_INVENTORY.md` — correct count to 56; add events-board + login-page rows (INFERRED); fix row 18 eCIgn to `/forms/:formId/esign`; fix achc-crosswalk to `/framework/achc-survey/crosswalk`; add per-template state columns (interaction/empty/loading/error/responsive/permission).
- `docs/v6/V6_APP_MAP.md` — adopt `/framework/achc-survey/crosswalk` (drop line 220 `?view=crosswalk`); add `/admin/user-groups`,`/roles`,`/permissions`,`/users` + `/journey/appendix-f` to Area J; remove any bare `/:policyId`; reconcile mermaid area-lettering; add login-page as a numbered auth route + events-board INFERRED note.
- `docs/v6/V6_DESIGN_VISUALIZATION.md` — make sec 5 the single 14-family catalog with per-family prop/state contract + component→template map + page-specific widget list; reword sec 6 to ban legacy COMPONENTS not `/library` `/forms` PATHS; confirm `src/index.css` single token home; add Component States, Overlay Dimensions & Motion, Icons (Lucide-only), Timestamps, Density sections; fix mermaid node B1 to "Page Titles only"; mark eCIgn navy/orange as authorized exception; remove CloudFront/Google-Fonts references.
- `docs/v6/V6_IMPLEMENTATION_PLAN.md` — rewrite V6-0 to build the full 14 families (name BoardLane/VeilModal/VeilDrawer/CommandPalette/ChatThread/ProgressMeter/ChecklistTable); set `src/index.css` as sole token home (delete tokens.css); declare PLAN authoritative for order; add one-representative-page-per-template step; move error/loading states into Stage C DoD; replace the "(remaining surfaces as scoped)" bucket with the enumerated 56; add asset-inlining task; add secondary Stage-C reviewer; assert 56/56 coverage in DoD.
- `docs/v6/V6_IMPLEMENTATION_SEQUENCE.md` — add NON-AUTHORITATIVE banner pointing to PLAN; expand Phase 2 to all 14 primitives; re-order primitives+leaf before Dashboard/boards; change Section 3 logic-ban to "static during Stage A; reconnect per PLAN Stage B"; change Phase 0 to self-host Roboto 300;500 (drop Google Fonts); enumerate the dropped families; add states-present + a11y + responsive checklist items.
- `docs/v6/v6-app-map.html` — render all 56 views; fix badge to 56; regenerate to consume `src/index.css` tokens or label non-canonical (currently styles off `cdn.tailwindcss.com`, violating the sec-6 ghost-design rule).
- `src/index.css` — author the full token registry (currently a 13-line stub).

---

## DOCUMENTS CREATED

- `docs/v6/V6_REVIEW_AND_ENHANCEMENT_REPORT.md` — this report (canonical contracts + reconciled rulings + P0/P1/P2).
- **Canonical 56-row matrix** (= route table = coverage matrix = state-matrix host): columns path / hash / template / group / owner / reference-or-INFERRED / state-coverage / done. Single source for Definition of Done (assert 56/56). *(To be authored by architect/orchestrator before V6-2.)*
- `src/statusTone.ts` — typed STATUS→TONE→LABEL map replacing the substring `statusPattern`; slate fallback + dev warning on unknown. *(To be authored in V6-0.)*
- Gate **positive-pass CI fixture** — V6-canonical route strings + V6-native component names that MUST pass, so the gate can never regress to blocking valid V6 routes/names. *(V6-0.)*

---

## IMPLEMENTATION PLAN CHANGES

The canonical 18-phase order (PLAN authoritative):

1. Architecture & prototype→production conversion mandate (hash routing → react-router 7 data routes; delete duplicate hashchange listeners; `redesign-calendar-swimlane` CustomEvent + `#personal-ops-panel` magic hash → React state/context; `lucide-react` components, ban `window.lucide.createIcons`/`data-lucide`).
2. Tokens (single `src/index.css`, all categories).
3. Typography (self-host Roboto 300;500, strip bold).
4. Motion + a11y baseline on primitives (global `prefers-reduced-motion` block; `focus-visible`; ARIA).
5. Full 14-family primitive kit + leaf primitives, Opus-signed-off (BoardLane parameterized by column-config, proven on all 4 board variants).
6. Shell + routing skeleton (V6Shell, nested routes/Outlet, route-level lazy+Suspense+errorElement, root error boundary).
7. Nav/routing wired (composer owns ALL route literals; canonical route table).
8. Shared data components (DataTable as semantic table, `statusTone.ts`).
9. One representative page per template family.
10. Template QA (states + parity + a11y + responsive).
11. Remaining pages per family (data-binding only on shared template).
12. Mock-data validation (typed seed).
13. Screenshot parity sweep.
14. Responsive + a11y verification pass.
15. Logic reconnection per-screen Stage B (re-include only exact modules per KEEP_MANIFEST; never bulk-include `src/policy/**`).
16. Cohesion pass.
17. Auth/backend bootstrap (Cognito) + login-page build — **LAST**.
18. Hardening (error/loading/empty states, axe gate, perf).

Plan-level deltas: V6-0 builds all 14 families and authors `src/index.css`; `tokens.css` deleted; PLAN declared authoritative; SEQUENCE demoted to a checklist appendix; error/loading states moved into Stage C DoD; the open-ended "(remaining surfaces as scoped)" bucket replaced by the enumerated 56-row matrix; asset-inlining task added; secondary Stage-C reviewer added; Definition of Done asserts 56/56.

**Acceptance gates added to Stage C (all mandatory, machine-checkable):**
- *Ghost-design gate* (corrected per P0-1).
- *Typography gate* (`Inter\|Montserrat` forbidden; weights 600–900 forbidden in source class literals + dist CSS).
- *CDN/asset gate* (string ban on all listed CDNs; build-time Tailwind, self-hosted Roboto/Lucide/logo).
- *A11y gate* (`@axe-core/playwright`, per-route, serious+critical fail; exactly one `h1`, no skipped levels).
- *Responsive gate* (Playwright at 360/768/1024/1280/1536; assert `scrollWidth <= viewport`, 44px touch targets, tables scroll-or-card-stack, boards horizontal-scroll, calendar agenda below laptop).
- *Parity gate* (screenshot-parity + visual-audit checklist — Roboto 300/500, hairlines, two shadows, teal/orange, 292/88 sidebar) folded in alongside `verify:designless`.
- *Positive fixture* (V6-canonical routes/names that must pass, preventing gate regression).

---

## ORCHESTRATION CHANGES

- `V6_IMPLEMENTATION_PLAN.md` + `V6_ORCHESTRATION_PROMPT.md` are authoritative for order/gates/owners; `V6_IMPLEMENTATION_SEQUENCE.md` is demoted to a non-authoritative screenshot-parity/visual-audit checklist appendix (add a header banner pointing to PLAN).
- Reconcile the named fleet into ONE roles table; if Gemini/Codex have no role, state so; if Claude == Opus, state so.
- Define a **secondary Stage-C reviewer** so Opus is not a 56-screen QA throughput single-point-of-failure.
- **Composer owns ALL route literal strings** and route registration (Stage B); grok renders nav as placeholders only in Stage A and must not author path strings.
- Make ONE artifact serve as route table = coverage matrix = state-matrix host (56 rows); a test equates router-registered real-route count to is-real-route rows.
- Gate-fix (P0-1) must land and pass on a router stub **before** V6-1 sign-off; this is the gating event for the whole fan-out.

---

## REMAINING QUESTIONS

1. **Fleet identity.** Are Gemini/Codex assigned any V6 role, or none? Is Claude == Opus in this fleet? (Blocks the P1-9 roles table.)
2. **Orange semantics.** Is orange the attention/urgency tone only, or is it ever a generic primary CTA? One product decision gates P1-8 and the button hierarchy.
3. **Tone count.** Confirm the canonical 8-tone set (teal/orange/green/amber/slate + blue/violet/red). Are blue/violet/red shipping with full token sets, or dropped to 5?
4. **Orphan templates.** Do any ported registry views reference `gantt`, `survey-packet`, or `personal-ops`? If not, delete (P2-3).
5. **eCIgn rename scope.** Confirm the eCIgn/ecign identifier rename is scoped to NEW V6 source only (so the gate's word-boundaried legacy-name scan does not false-positive).
6. **Destructive-action pattern.** Dedicated destructive token or confirm-modal? Needed before primitives are signed off in V6-0.

---

## SAFETY CONFIRMATION

- Wrote exactly ONE file: `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/docs/v6/V6_REVIEW_AND_ENHANCEMENT_REPORT.md`.
- Did **not** modify `C:/AI/Git/training/HomeHealth/Policies_and_Procedures` (the live prototype repo).
- Did **not** touch runtime code, the prototype `index.html`, the gate script, or any other V6 doc — those edits are *recommended* in this report, not performed.
- No other files in V2 were created or edited.

---

## FINAL RECOMMENDATION

**Do not fan out yet. Run one reconciliation pass to close all nine P0s, then green-light.**

The corpus has a real foundation hiding inside it — the template/shell/reuse spine and the Stage A/B/C pipeline are correct and should be preserved exactly. But as written it is unbuildable: the gate rejects its own V6 routes, two components fight over one URL, the catalog is split three ways, the token home is duplicated, the typography LOCK is contradicted and unenforced, the shell depends on blocked CDNs, and the state/responsive/a11y layers are essentially empty. None of these are rewrites; each is a single decisive ruling already specified above.

**Sequence the unblock as one V6-0 work item:** (1) land + pass the corrected gate on a router stub (P0-1); (2) make the route table singular and collision-free (P0-2, P0-3, P1-2); (3) ratify the 14-family catalog and author `src/index.css` + `statusTone.ts` (P0-4, P0-5); (4) self-host fonts/assets and enforce the typography LOCK (P0-6, P0-7); (5) author the per-template state/responsive/a11y matrix and the 56-row coverage matrix (P0-8, P0-9); (6) declare PLAN authoritative and demote SEQUENCE. When the gate is green on a stub with the positive fixture passing and the 56-row matrix exists, the corpus is a real foundation and fan-out is safe — **not before.**

---

## APPLICATION STATUS (post-review — applied this pass)

| P0 | Status | What landed |
|----|--------|-------------|
| **P0-1** | ✅ APPLIED (code) | `scripts/check-designless.mjs`: removed `LEGACY_ROUTES` (reused public paths now allowed); added `\b` word boundaries to legacy component names (V6-native `FormViewerV6`/`LibraryPageV6` pass); source scan scoped to the active V6 namespace (scaffold + `src/v6`), not preserved headless code. Self-tested: `/library`+`LibraryPageV6` ALLOW, `FormViewer`/`CommandCenterLayout` BLOCK. |
| **P0-2** | ✅ RESOLVED (docs) | Canonical route table: `form-viewer=/forms/:formId`, `ecign=/forms/:formId/esign`. No router exists yet to encode — enforced at V6-1. |
| **P0-3** | ✅ RESOLVED (docs) | `achc-crosswalk` → distinct path `/framework/achc-survey/crosswalk`; no query-param variant. |
| **P0-4** | ✅ RESOLVED (docs) | 14-family catalog ratified in `V6_COMPONENT_AND_COHESION_SPEC.md`; built in V6-0. |
| **P0-5** | ✅ VERIFIED | Single token home `src/index.css`; no competing `src/v6/theme/tokens.css` present. Token registry authored in V6-0. |
| **P0-6** | ✅ APPLIED (code) | Gate now enforces typography lock: bans `Inter`/`Montserrat` font refs and `font-(semibold\|bold\|extrabold\|black)` / weights 600–900 in active source + `dist/`. Self-hosting Roboto 300;500 happens in V6-0 build. |
| **P0-7** | ✅ APPLIED (code) | Gate now bans CDN/external-asset strings (Google Fonts, Tailwind Play, FontAwesome, jsDelivr, unpkg, babel-standalone, cloudfront) in active source, `index.html`, and `dist/`. Self-hosting/inlining happens in V6-0. |
| **P0-8** | ✅ RESOLVED (docs) | States/responsive/a11y authored in `V6_UI_STATE_MATRIX.md`, `V6_COMPONENT_AND_COHESION_SPEC.md`, `V6_INTERACTION_AND_MOTION_SPEC.md`; built per template in V6-0/V6-2. |
| **P0-9** | ✅ RESOLVED (docs) | 56-row canonical matrix is the single route=coverage=state host; PLAN authoritative, SEQUENCE demoted; `events-board` + `login-page` added as INFERRED_FROM_V6_SYSTEM. |

**Net:** the 3 P0s with a concrete code surface today (gate correctness P0-1/6/7) are **applied and verified green**. The other 6 are design/route/plan decisions now embodied in the reconciled docs — they get *encoded in code* during their V6 phase (router at V6-1, tokens/typography/components/states at V6-0/V6-2), where the upgraded gate enforces them.
