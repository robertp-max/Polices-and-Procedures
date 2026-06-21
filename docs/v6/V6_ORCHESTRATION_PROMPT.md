# V6 Orchestration Prompt — paste into the orchestrator

> **Authority:** This file + `docs/v6/V6_IMPLEMENTATION_PLAN.md` are authoritative for order,
> gates, and owners. `docs/v6/V6_IMPLEMENTATION_SEQUENCE.md` is **DEMOTED** to a
> non-authoritative screenshot-parity / visual-audit checklist appendix (it carries a banner
> pointing here).
>
> **Repo (single source of truth):** ALL V6 artifacts live in
> `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2`
> (`docs/v6/`, `scripts/check-designless.mjs`, `src/index.css`, `tailwind.config.js`).
> The live prototype **reference** is
> `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\Redesign\index.html`
> — read-only reference, never a build target. Work on a branch off `v2/designless-baseline`.
> Never touch the original repo, copies, or Drive snapshots.

---

## MISSION
Build the V6 **light** design on top of the designless baseline. Bring V6's OWN shell, tokens,
CSS, components, and routes. Reconnect the preserved CES/process logic
(`CES_PROCESS_KEEP_MANIFEST.txt`) screen by screen, statically first (Stage A) then per-screen
reconnection (Stage B). No old-design bleed — ever.

**One artifact rules them all.** The 56-row canonical route table below *is* the coverage
matrix *is* the state-matrix host. Definition of Done asserts **56/56 green**. A test equates
router-registered real-route count to the count of `is-real-route` rows (54).

---

## CANONICAL WORKER ROLES

One fleet. Non-overlapping responsibilities. No two workers ever own the same artifact at the
same time.

| Role | Worker | Owns | Never does |
| --- | --- | --- | --- |
| **Orchestrator** | **GPT-5.5** | Sequencing, fan-out gating, assigning one screen per worker, enforcing "gate green between merges", reconciling reports. | Writes no component/route code. |
| **Architect / Primary QA** | **Claude** (Opus) | V6-0 sign-off (14-family catalog + tokens + typography), V6-1 sign-off (shell+routing), Stage-C primary review. Authors `src/index.css` token registry, `statusTone.ts`, primitive state contracts. | Does not author the 56 screens or route literals. |
| **Stage-A screen builder** | **Grok** | Static Stage-A screen + sub-components from the prototype reference, using V6 tokens/primitives + typed mock data. Renders nav as **placeholders only** in Stage A. | **Must not author any path/route literal strings** (composer owns those). Does not reconnect logic. |
| **Routing / Stage-B reconnection** | **Composer** | Owns **ALL route literal strings** + route registration (react-router 7 data routes). Stage-B: re-includes the exact preserved modules per `CES_PROCESS_KEEP_MANIFEST.txt`, swaps mock→real selectors, fixes inert imports. | Does not invent new screen layouts; does not bulk-include `src/policy/**`. |
| **Secondary Stage-C reviewer** | **Gemini** | Second QA pass on Stage-C (parity + a11y + responsive + states) so Claude is **not a 56-screen QA throughput SPOF**. Runs the axe/responsive gates and reports. | Does not merge unilaterally; defers architecture rulings to Claude. |
| **Gate / tooling owner** | **Codex** | `scripts/check-designless.mjs` corrections + the positive-pass CI fixture; asset-inlining (Tailwind build-time, self-host Roboto/Lucide/logo); CI wiring. | Does not author screens or design tokens. |

Notes: **Claude == Opus** (same worker, two labels in older docs — unified here). Gemini and
Codex have explicit roles above (no longer "unassigned"). If a worker is idle in a phase, the
orchestrator says so explicitly rather than letting roles overlap.

---

## HARD CONSTRAINTS (enforce on every worker, every merge)

1. **Gate is law.** After every change `npm run verify:designless` must pass (build +
   `scripts/check-designless.mjs`). A red gate blocks the merge. No exceptions, no workarounds.
   Surface anything that would require importing old UI as a **STOP**.

2. **Block legacy COMPONENTS + COLORS + COMPILED legacy output — NOT reused public PATHS.**
   - **BANNED component identifiers** (exact, with `\b` word boundaries): `CommandCenterLayout`,
     `PolicyViewer32`, `PolicyDetailPage`, `LibraryPage`, `FormViewer`, `FormPrintView`,
     `PrintPage`, `GVGBPrintDocument`, `GVGBAppendixPrint`, `TravelightBG`, `DotGrid`,
     `GlobalDotBackground`, `v3Tokens`, `SharedPolicyDetailView`, `PolicyLibraryDocumentView`.
     V6-native names (`FormViewerV6`, `LibraryPageV6`, …) **pass** once word boundaries land.
   - **ALLOWED reused public routes.** `/library`, `/forms`, `/print`, `/appendix` are
     intentionally reused public route names with **new V6 implementations**. They **must
     pass** the gate. The gate may flag a reused path ONLY when a banned legacy COMPONENT
     identifier co-occurs on the same construct.
   - **Block compiled legacy output** in `dist/` (legacy colors, CDN strings, stale `.js`).

3. **No bulk re-include.** Re-include preserved logic into `tsconfig.app.json` ONLY the exact
   modules a screen wires (per `CES_PROCESS_KEEP_MANIFEST.txt`). Never broaden to all of
   `src/policy/**`. Inert imports to deleted UI files get removed/stubbed — never resurrected.

4. **Light only, tokens only.** All color/spacing/type from the V6 token set in
   **`src/index.css`** (CSS custom properties; tailwind `theme.extend` references them).
   No raw hex (`bg-[#..]`/`text-[#..]`), no stock-Tailwind palette classes
   (`emerald-`/`amber-`/`slate-`/`violet-`/`blue-`/`red-`/`gray-`) for semantic state.
   The PLAN's alternate `src/v6/theme/tokens.css` is **DELETED** — one token home only.

5. **Typography LOCK (the LOCK wins).** Self-host Roboto at **wght 300;500 only** — drop 400,
   **do NOT load 700**, no Google Fonts CDN (CSP-blocked). Exactly two weights ship.
   Weight **500** (`font-medium`) permitted ONLY on: page titles / h1–h2 headers,
   sidebar/nav labels, status/ToneBadge text. **Everything else is 300** (`font-light`):
   body, tables, KPI numbers, card titles, subheadings, chips. BANNED:
   `font-semibold`/`font-bold`/`font-extrabold`/`font-black`, weights 600/700/800/900,
   and fonts `Inter`/`Montserrat`. Strip all 236 prototype bold usages; build hierarchy via
   size/color/opacity/spacing/casing. The reference screenshots' bold look is a **prototype
   defect**, not a target. eCIgn navy `#1A3778` / orange `#F04B22` is an authorized
   **tokenized palette exception** — it does NOT change the weight rule.

6. **Foundations gate the fan-out.** Do NOT start any screen until V6-0 (full 14-family
   catalog + tokens + typography + motion/a11y baseline) AND V6-1 (shell + routing skeleton)
   are built and **Claude-approved, gate-green**.

7. **No simultaneous shared-component edits.** Catalog primitives are built ONCE in V6-0 and
   signed off. No screen may define, fork, or edit a catalog primitive. Two workers never edit
   the same shared component concurrently — the orchestrator serializes any shared-primitive
   change through Claude.

8. **No pages before foundations, no per-page design systems.** One shared 14-family catalog;
   one token home; one motion registry; one `statusTone.ts`. A screen that needs a new
   primitive STOPs and routes back to V6-0 — it does not invent its own.

9. **No raw `tsc` emit into `src/`.** Build-time Tailwind (PostCSS) + bundler only. Compiled
   `.js` shadowing `.tsx` is gate-failed (stale-js guard on `src/**`).

10. **No completion claims without evidence.** "Done" requires a **screenshot + a green
    `verify:designless` build log** attached to the report. Claims without both are rejected.

---

## ACCEPTANCE GATES (`scripts/check-designless.mjs` + peers)

The gate's architecture is correct in **where** it looks (scan compiled `dist/` as ground truth
for colors/routes/CDN; stale-`.js` guard + name scan on **source** `src/**/*.tsx` because
minifiers mangle dist identifiers). Only its content regexes need correction.

- **Ghost-design gate (P0-1 fix — highest priority).**
  Remove `LEGACY_ROUTES` (line 26) from the dist scan, OR convert it to an explicit allowlist
  that flags a reused path ONLY when a legacy COMPONENT identifier co-occurs on the same
  construct. Add `\b` word boundaries to `LEGACY_NAMES` (line 25) and run the name scan on
  `src/**/*.tsx`. Tighten `LEGACY_COLOR` (line 24): keep the hex list (matches anywhere) but
  require CSS-value/token context for the words `maroon|burgundy|wine|ci-ion`. Update the header
  comment: **public-path reuse is intentional; the gate bans legacy COMPONENTS + COLORS +
  COMPILED legacy output, not reused public PATHS.** This fix MUST land and pass on a router
  stub **before V6-1 sign-off**.
- **Typography gate.** `FORBIDDEN_FONT /Inter|Montserrat/`; `FORBIDDEN_WEIGHT`
  `font-(semibold|bold|extrabold|black)` in SOURCE class literals + `font-weight:600|700|800|900`
  in dist CSS. Fail on any.
- **CDN/asset gate.** Fail dist on `cdn.tailwindcss.com`, `fonts.googleapis.com`,
  `fonts.gstatic.com`, `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `cloudfront.net`,
  `@babel/standalone`, `placehold.co`, `fa-`/`font-awesome`. Build-time Tailwind; self-hosted
  Roboto/Lucide/logo only.
- **a11y gate.** `@axe-core/playwright` (already installed) as a peer to `verify:designless`;
  per-route; serious+critical violations fail; assert exactly one `h1`/route, no skipped levels.
- **Responsive gate.** Playwright screenshots at 360/768/1024/1280/1536; machine-checkable:
  `document.scrollWidth <= viewport` (no h-scroll), 44px touch targets, tables scroll-or-card,
  boards horizontal-scroll, calendar agenda below laptop.
- **Parity gate.** SEQUENCE screenshot-parity + visual-audit checklist (Roboto 300/500,
  hairlines, two shadows, teal/orange, 292/88 sidebar) folded into Stage C alongside
  `verify:designless` — both mandatory.
- **Positive fixture (anti-regression).** A CI fixture of V6-canonical route strings + V6-native
  names that MUST pass the gate, so it can never regress to blocking valid V6 routes/names.

---

## EXECUTION ORDER — 18 implementation phases

Foundations (1–8) before any screen. Screens fan out (9–14). Logic reconnection (15–16).
Auth **last** (17). Hardening (18).

1. **Architecture & conversion mandate.** Hash routing → react-router 7 data routes; delete the
   two duplicate `hashchange` listeners; convert the `redesign-calendar-swimlane` CustomEvent
   and `#personal-ops-panel` magic hash → React state/context; `lucide-react` components, ban
   `window.lucide.createIcons` / `data-lucide`.
2. **Tokens.** Single `src/index.css`, all categories (color, 8-tone set, chart/dataviz,
   surface/glass, text, border, two shadows, radius 8/12/16/24/32, spacing, typography, motion,
   z-index, breakpoint/container 292/88, icon ramp, density, focus-ring).
3. **Typography.** Self-host Roboto 300;500, strip all bold (see LOCK).
4. **Motion + a11y baseline on primitives.** Global `@media(prefers-reduced-motion:reduce)`;
   `focus-visible`; ARIA.
5. **Full 14-family primitive kit + leaf primitives, Claude-signed-off.** BoardLane
   parameterized by column-config, proven on all 4 board variants (6/4/3/4-col).
6. **Shell + routing skeleton.** `V6Shell`, nested routes/`Outlet`, route-level
   lazy+Suspense+`errorElement`, root error boundary.
7. **Nav/routing wired.** Composer owns ALL route literals; canonical route table below.
8. **Shared data components.** `DataTable` as a semantic `<table>`; `statusTone.ts` map.
9. **One representative page per template family.**
10. **Template QA** (states + parity + a11y + responsive).
11. **Remaining pages per family** (data-binding only on the shared template).
12. **Mock-data validation** (typed seed).
13. **Screenshot parity sweep.**
14. **Responsive + a11y verification pass.**
15. **Logic reconnection — per-screen Stage B** (re-include only the exact modules per
    `CES_PROCESS_KEEP_MANIFEST.txt`; never bulk-include `src/policy/**`).
16. **Cohesion pass.**
17. **Auth/backend bootstrap (Cognito) + login-page build — LAST.**
18. **Hardening** (error/loading/empty states, axe gate, perf).

### Per-screen pipeline (phases 9–16)
- **Stage A — Grok:** static V6 screen + sub-components from the prototype reference, V6
  tokens/primitives, typed mock data, nav as placeholders. **No route literals.** Return diff.
- **Stage B — Composer:** register canonical route literal(s); re-include + wire the specific
  preserved stores/services/types/data; swap mock → real selectors; fix inert imports.
- **Stage C — Claude (primary) + Gemini (secondary):** gate green · parity vs reference ·
  route resolves in V6 shell · no legacy imports/names/colors · a11y + responsive + the 6 state
  categories satisfied · CES chain intact. **Screenshot + green build log required.** Only then merge.

---

## CANONICAL ROUTE TABLE (= coverage matrix = state-matrix host)

**56 views = 54 router routes + 2 overlay/auth.** Identify every screen by its stable
**hash-id** (the canonical key) — never by path or template. One path = one component; no
query-string routing; no bare top-level `/:param`. Templates (`matrix`/`evidence`/`reports`/
`detail`/`board`/`calendar`/`docs`/`profiles`) are intentionally reused across 3–7 routes; that
is why the hash-id, not the template, is the identity.

### Real routes (54)

| # | Path | Hash-id | Template | Group |
| --- | --- | --- | --- | --- |
| 1 | `/dashboard` | dashboard | dashboard | Overview |
| 2 | `/clinicians` | clinicians | profiles | Overview |
| 3 | `/clinicians/:clinicianId` | clinician-detail | detail | Overview |
| 4 | `/patients` | patients | profiles | Overview |
| 5 | `/patients/:patientId` | patient-detail | detail | Overview |
| 6 | `/calendar` | master-calendar | calendar | Overview |
| 7 | `/staffing-calendar` | staffing-calendar | calendar | Overview |
| 8 | `/iadministrator` | brad | chat | Overview |
| 9 | `/ces/calendar` | ces-calendar | calendar | CES |
| 10 | `/ces/board` | ces-board | board | CES |
| 11 | `/ces/events` | events-board | board | CES — **INFERRED_FROM_V6_SYSTEM** (no PNG; inherit 4-col BoardLane from ces-board + LIVE dashboard 4-col baseline) |
| 12 | `/workflows` | workflows | matrix | CES |
| 13 | `/workflows/:workflowId/swimlane` | workflow-swimlane | board | CES |
| 14 | `/compliance/master-controls` | master-controls | matrix | CES |
| 15 | `/audit` | audit-mode | evidence | CES |
| 16 | `/evidence` | evidence-center | evidence | CES |
| 17 | `/ces/reports` | ces-reports | reports | CES |
| 18 | `/calendar/event/:eventId/task/:taskId` | mobile-incident | detail | CES |
| 19 | `/my-tasks` | my-tasks | board | CES |
| 20 | `/framework` | framework | framework | Taxonomy |
| 21 | `/framework/achc-survey` | achc-survey | achc-survey | Taxonomy |
| 22 | `/framework/achc-survey/crosswalk` | achc-crosswalk | achc-crosswalk | Taxonomy — **CANONICAL distinct sub-PATH, NOT `?view=crosswalk`** |
| 23 | `/library` | policy-library | matrix | Taxonomy |
| 24 | `/library/:policyId` | policy-detail | detail | Taxonomy |
| 25 | `/forms` | forms-library | matrix | Taxonomy |
| 26 | `/forms/:formId` | form-viewer | form-viewer | Taxonomy — **read/fill ONLY** |
| 27 | `/forms/:formId/esign` | ecign-workspace | ecign | Taxonomy — **CANONICAL signing path; distinct component; never a mode flag** |
| 28 | `/artifacts/:artifactId` | artifact-viewer | reference-viewer | Taxonomy |
| 29 | `/viewer/:referenceId` | generic-reference | reference-viewer | Taxonomy |
| 30 | `/journey` | journey-overview | journey | Onboarding |
| 31 | `/journey/v1-journey` | journey-v1 | journey | Onboarding |
| 32 | `/journey/module/:moduleId` | module-player | module-player | Onboarding |
| 33 | `/journey/appendix-f` | appendix-f | docs | Onboarding |
| 34 | `/journey/supervisor` | supervisor | journey | Onboarding |
| 35 | `/journey/admin` | journey-admin | reports | Onboarding |
| 36 | `/journey/guide` | user-guide | docs | Onboarding |
| 37 | `/onboarding-v2/dashboard` | onboarding-v2-dashboard | dashboard | Onboarding v2 |
| 38 | `/onboarding-v2/activate` | onboarding-v2-activate | detail | Onboarding v2 |
| 39 | `/onboarding-v2/batches` | onboarding-v2-batches | matrix | Onboarding v2 |
| 40 | `/onboarding-v2/batches/:batchId` | onboarding-v2-batch | detail | Onboarding v2 |
| 41 | `/onboarding-v2/audit` | onboarding-v2-audit | evidence | Onboarding v2 |
| 42 | `/onboarding-v2/governance` | onboarding-v2-governance | reports | Onboarding v2 — display label **"Onboarding Overrides"** to disambiguate from `/governance` |
| 43 | `/policy-lifecycle` | policy-lifecycle | lifecycle | System — **NO bare `/:policyId`; deep-link is `/policy-lifecycle/:policyId` only** |
| 44 | `/hubstaff` | hubstaff | reports | System |
| 45 | `/system-documentation/:sectionId` | system-docs | docs | System |
| 46 | `/help/*` | help-center | docs | System |
| 47 | `/governance` | governance | reports | System |
| 48 | `/admin/user-groups` | admin-groups | matrix | Admin |
| 49 | `/admin/roles` | admin-roles | matrix | Admin |
| 50 | `/admin/permissions` | admin-permissions | matrix | Admin |
| 51 | `/admin/users` | admin-users | matrix | Admin |
| 52 | `/surveyor/policy/:policyId` | surveyor-viewer | detail | Admin |
| 53 | `/policy-lifecycle/:policyId` | policy-lifecycle-detail | lifecycle | System — deep-link form of #43 |
| 54 | `/login` | login-page | login | Auth — **INFERRED_FROM_V6_SYSTEM** (no PNG; inherit glass surface + CareIndeed logo from shell; only auth entry; wired in V6 phase 17) |

### Overlays (not routes)
`modal-system (VeilModal)` · `drawer-system (VeilDrawer)` · `popover-system
(CommandPalette/Popover)` · `personal-ops` (drawer open/close **state**, NOT a route).

### Six state categories (specify ONCE per template, ~28 specs cover all 56 pages)
`interaction` · `empty` · `loading` · `error` · `responsive` · `permission`. A pageview is not
"covered" until its template's six categories are specified. Spec per **template**, not per page.

---

## COMPONENT CATALOG (single shared catalog — build all in V6-0)

`V6_DESIGN_VISUALIZATION.md` sec 5 14-family catalog is the SINGLE shared catalog. Two tiers:
- **Leaf primitives:** Button, Input, Select, Badge.
- **14 composite families:** AppShell, Sidebar, Topbar/PageHeader, MetricTile, SurfaceCard,
  ToneBadge, DataTable, BoardLane, VeilModal, VeilDrawer, CommandPalette, ChatThread,
  ProgressMeter, ChecklistTable.

All built and Claude-signed-off in V6-0 before any screen fan-out. **No screen may define a
catalog primitive.** Naming: V6-native only; never reuse a banned legacy identifier.

**States on primitives.** Every primitive ships empty/loading/error/disabled/focus once; pages
inherit. DataTable empty/loading/error rows; BoardLane empty-lane; form-field
validation/dirty/error/disabled; eCIgn step-locked.

---

## COHESION RULES (gate-enforced where machine-checkable)
- One token source: `src/index.css` CSS custom properties; no raw hex / stock-palette classes in
  component code.
- Status semantics from a single typed `STATUS→TONE→LABEL` map (`statusTone.ts`), never a
  substring regex; unknown → slate + dev warning; tone by **text+glyph**, not color alone.
- Fixed tone vocabulary: teal=ready/complete, orange=attention/blocked, green=pass/certified,
  amber=awaiting/pending, slate=upcoming/backlog; blue/violet/red only if added with full token
  sets. No screen invents a tone.
- One icon family: `lucide-react`; FontAwesome/`fa-` banned and gate-listed.
- Radius only 8/12/16/24/32; card shadows exactly two tokens (rest, hover); arbitrary
  box-shadow banned.
- Single motion registry in `src/index.css`: `--motion-fast 120ms`, `--motion-base 200ms`,
  `--motion-slow 280ms`; `--ease-standard cubic-bezier(0.2,0.8,0.2,1)` (enter/move),
  `--ease-exit cubic-bezier(0.4,0,1,1)` (leave). No enter/exit > 300ms. No raw ms or ad-hoc
  `duration-[n]` in screen code. Reduced-motion is a Stage-C axe gate.
- Overlays portal to `document.body`, trap focus, return focus on close, `role=dialog` +
  `aria-modal`, scroll-lock, Escape + backdrop close — built once on VeilModal/VeilDrawer/
  CommandPalette.
- Dates/timestamps via `formatDate`/`formatTimestamp`; audit/eCIgn store UTC/ISO, display with
  timezone; no relative formats on audit surfaces.
- Primary/secondary button roles fixed; orange reserved for attention/urgency, never a generic
  primary.
- eCIgn navy/orange is an authorized tokenized exception; QA must not flag it off-palette and
  builders must not recolor it to app teal.

---

## REPORTING (after each screen)
Report: files added; `verify:designless` result (**attach the green build log**); **attach a
screenshot** at the relevant breakpoints; preserved modules re-included (exact paths); any inert
import fixed; parity notes vs the prototype reference; a11y + responsive + 6-state status.
Anything requiring old UI is a **STOP**, never a workaround.

## DEFINITION OF DONE
- **56/56** rows in the canonical matrix green (a test equates router-registered real-route count
  to the 54 `is-real-route` rows; the 2 overlay/auth views accounted for).
- Every screen renders in V6 light with reference parity; `verify:designless` green in CI;
  typography LOCK + a11y + responsive gates pass; CES process chain wired and working;
  zero legacy design/components/CDN in `dist/`.
- No completion is accepted without screenshot + green build log evidence.
