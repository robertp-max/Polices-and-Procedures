# V6 Implementation Plan — Canonical (Authoritative)

> **Authority:** This document, together with `V6_ORCHESTRATION_PROMPT.md`, is **authoritative**
> for build order, gates, and owners. `V6_IMPLEMENTATION_SEQUENCE.md` is **DEMOTED** to a
> non-authoritative screenshot-parity / visual-audit checklist appendix — where it disagrees with
> this plan on phase order, primitive set, logic-reconnection timing, or token-file location,
> **this plan wins.**
>
> **Repo:** All V6 artifacts live in `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2`
> (`docs/v6/`, `scripts/check-designless.mjs`, `src/index.css`, `tailwind.config.js`).
> The live prototype reference is
> `C:/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pages/Redesign/index.html`
> (read-only reference; never modified by V6 work).

---

## 0. Starting point & goal

**Starting point:** `v2/designless-baseline` — neutral scaffold (`main.tsx → App.tsx →
_scaffold/ScaffoldPage.tsx`), 13-line stub `src/index.css`, neutral `tailwind.config`, build green,
designless gate passing. ~299 CES/process-logic files preserved **headless** (on disk, excluded from
`tsconfig.app.json` include, unreachable from runtime).

**Goal:** Build the V6 **light** design on top — its own shell, tokens, CSS, components, routes —
**foundations first, screens second, logic reconnected last, screen by screen**, with **zero
old-design bleed** enforced by `npm run verify:designless` (plus typography, CDN, a11y, responsive,
and parity gates) at every step.

**Conversion mandate (prototype → production):** The prototype is a single CDN-driven HTML file with
hash routing. V6 is a real React-Router-7 app. This conversion is in-scope from step 1:
- hash routing → react-router 7 data routes; **delete the two duplicate `hashchange` listeners**
  (prototype `index.html` ~4863/4895);
- custom `'redesign-calendar-swimlane'` DOM event and `'#personal-ops-panel'` magic hash →
  React state/context;
- `window.lucide.createIcons()` / `data-lucide` (prototype 2406/4911) → `lucide-react` components;
- build-time Tailwind; self-hosted Roboto + Lucide + logo (no CDNs — CSP-blocked).

---

## 1. Non-negotiable guardrails (anti-bleed)

1. **V6 brings its own everything.** New shell, tokens, CSS, components, routes. The old UI was
   physically deleted — it cannot be imported. Preserved **logic** (`.ts` stores/services/types/data)
   *may* be wired, per-screen, in Stage B only.
2. **Use NEW V6-native component names.** Never reuse banned legacy identifiers:
   `CommandCenterLayout`, `PolicyViewer32`, `PolicyDetailPage`, `LibraryPage`, `FormViewer`,
   `FormPrintView`, `PrintPage`, `GVGBPrintDocument`, `GVGBAppendixPrint`, `TravelightBG`, `DotGrid`,
   `GlobalDotBackground`, `v3Tokens`, `SharedPolicyDetailView`, `PolicyLibraryDocumentView`.
   V6-native names (`FormViewerV6`, `LibraryPageV6`, `V6Shell`) are legal once the gate adds word
   boundaries. The gate bans legacy **components + colors + compiled legacy output** — **not** reused
   public **paths** (`/library`, `/forms`, `/print`, `/appendix` are intentionally reused with new V6
   implementations).
3. **Gate-green between every merge.** `npm run verify:designless` plus the peer gates (typography,
   CDN/asset, a11y/axe, responsive, parity) must pass before any screen merges. A red gate never gets
   stacked on.
4. **No bulk re-include.** Re-include preserved logic into `tsconfig.app.json` **only as a screen
   actually wires it** (Stage B, exact modules per `CES_PROCESS_KEEP_MANIFEST`) — never broaden to all
   of `src/policy/**` at once.
5. **No pages before foundations; no early logic reconnect.** Tokens → typography → motion/a11y →
   primitives → shell → routing → shared components come first. Screens are static (Stage A) until
   their foundations are signed off; logic reconnection is Stage B, after the template family is QA'd.

---

## 2. Reference inputs

- **Live prototype (read-only ground truth):** `…/Policies_and_Procedures/src/policy/pages/Redesign/index.html`
- **Reference screenshots:** `docs/v6/.../V6_Final/*` (54 numbered PNGs; **events-board** and
  **login-page** have no PNG and are built `INFERRED_FROM_V6_SYSTEM`).
- **Component catalog authority:** `V6_DESIGN_VISUALIZATION.md` sec 5 (14-family catalog).
- **Route/coverage/state authority:** the single 56-row canonical matrix (section 6 below).
- **Preserved-logic worklist:** `CES_PROCESS_KEEP_MANIFEST.txt`.

> **Reference-screenshot caveat:** the prototype's **bold** look is a defect, not a target. Build
> hierarchy with size/color/opacity/spacing/casing, never with banned weights (see §4).

---

## 3. The canonical 18-step sequence

Foundations are sequential and must each be Opus-signed-off before the next. Screens fan out only
after step 8. **No page is built before step 9; no logic is reconnected before step 15.**

| # | Step | Owner | Gate to pass |
|---|---|---|---|
| **1** | **Architecture & prototype→production conversion** — react-router 7 data routes; delete duplicate `hashchange` listeners; custom DOM event + magic hash → React state/context; `lucide-react` components (ban `window.lucide.createIcons`/`data-lucide`). | Opus / architect | Conversion mandate documented; gate rules added (no `hashchange`/`window.lucide`/`data-lucide` in V6 source) |
| **2** | **Tokens** — single `src/index.css` (CSS custom properties), all categories; `tailwind.config` `theme.extend` references the vars. Delete the PLAN's old `src/v6/theme/tokens.css` alternate. | Opus / architect | No raw hex / stock-palette classes in source; token registry complete (incl chart/dataviz tokens) |
| **3** | **Typography** — self-host Roboto **300;500 only**; strip all 236 bold/semibold/extrabold usages. | Opus / architect + gate-owner | Typography gate green (no Inter/Montserrat; no weight 600–900) |
| **4** | **Motion + a11y baseline on primitives** — global `@media (prefers-reduced-motion: reduce)` in `src/index.css`; motion token registry (durations/easings); `focus-visible`; ARIA scaffolding. | Opus / architect | Reduced-motion block present; motion tokens sole timing source |
| **5** | **Full primitive kit** — all leaf primitives (Button/Input/Select/Badge) + all **14 composite families** (AppShell, Sidebar, Topbar/PageHeader, MetricTile, SurfaceCard, ToneBadge, DataTable, BoardLane, VeilModal, VeilDrawer, CommandPalette, ChatThread, ProgressMeter, ChecklistTable). **BoardLane parameterized by column-config, proven on all 4 board variants.** | Opus / architect | Every primitive ships its 6-category state set; Opus sign-off; **no screen may define a catalog primitive** |
| **6** | **Shell + routing skeleton** — `V6Shell` (AppShell/Sidebar/Topbar), nested routes/`Outlet`, route-level `lazy`+`Suspense`+`errorElement`, root error boundary. | composer + Opus | Shell renders light theme; route skeleton resolves; no legacy names/colors in `dist/` |
| **7** | **Nav/routing wired** — composer owns **all** route literal strings + registration, per the canonical route table; nav placeholders never dead-end. | composer | Route literals match canonical table exactly; positive-pass CI fixture green |
| **8** | **Shared data components** — `DataTable` as **semantic `<table>`**, `statusTone.ts` typed `STATUS→TONE→LABEL` map (no substring regex; UNKNOWN → slate + dev warning). | composer + Opus | DataTable a11y-correct; status from typed map only |
| **9** | **One representative page per template family** — build exactly one page for each of the ~28 templates as the canonical exemplar. | grok (Stage A) | Renders static with typed mock data on shared primitives |
| **10** | **Template QA** — for each representative page, specify+verify the 6 state categories (interaction/empty/loading/error/responsive/permission), parity, a11y, responsive — **once per template**. | Opus QA (+ secondary reviewer) | State matrix complete per template; parity + axe + responsive gates green |
| **11** | **Remaining pages in each family** — data-binding only on the already-QA'd shared template; no new template logic. | grok (Stage A) | Each page matches its template; gate-green |
| **12** | **Mock-data validation** — typed seed data across all 56 views. | composer | Typed seed compiles; all views render with mock data |
| **13** | **Screenshot parity sweep** — full pass vs reference PNGs (or `INFERRED` baseline). | Opus QA | Parity checklist (Roboto 300/500, hairlines, two shadows, teal/orange, 292/88 sidebar) green |
| **14** | **Responsive + a11y verification pass** — full app at 360/768/1024/1280/1536. | Opus QA | Responsive gate (no body h-scroll, 44px targets, tables scroll/stack, boards scroll, calendar agenda) + axe serious/critical = 0 |
| **15** | **Logic reconnection — per-screen Stage B** — re-include **only** the exact modules each screen needs per `CES_PROCESS_KEEP_MANIFEST`; replace mock selectors with real ones; fix inert broken imports. **Never bulk-include `src/policy/**`.** | composer | Per-screen: gate-green; CES chain intact; no legacy imports |
| **16** | **Cohesion pass** — enforce the cohesion rules (one token source, one tone vocabulary, one icon family, one DataTable/density, button hierarchy, overlay/motion registry, date utils). | Opus / architect | Cohesion checklist (§8) green app-wide |
| **17** | **Auth/backend bootstrap (Cognito) + login-page build — LAST** — re-enable auth in `main.tsx`; build the `INFERRED` login-page (glass surface + CareIndeed logo); wire CommandPalette over the VIEW registry. | composer + Opus | Auth flow works; login-page parity; gate-green |
| **18** | **Hardening** — error/loading/empty states finalized; axe gate in CI; perf (lazy/Suspense, deferred filters, scoped virtualization); README; final full-app sweep. | Opus + composer | Full-app gate + parity sweep; **56/56 coverage asserted** |

---

## 4. Typography LOCK (canonical)

**Roboto ONLY**, self-hosted at `wght 300;500` (drop 400; **no Google Fonts CDN** — CSP-blocked).
Exactly two weights ship.

- **Weight 500 (`font-medium`)** permitted ONLY on: page titles / `h1`–`h2` headers, sidebar/nav
  labels, status / `ToneBadge` text.
- **Everything else** (body, tables, KPI numbers, card titles, subheadings, chips) is
  **300 (`font-light`)**.
- **BANNED:** `font-semibold` / `font-bold` / `font-extrabold` / `font-black`;
  `font-weight: 600/700/800/900`.

**Reconciled ruling (resolves the LOCK-vs-load-700 contradiction):** the **LOCK governs**. Strip all
236 prototype bold usages; **do NOT load Roboto 700.** Build hierarchy via size/color/opacity/
spacing/casing. The reference screenshots' bold look is a prototype defect, not a target.

**eCIgn brand exception:** navy `#1A3778` / orange `#F04B22` is an authorized **palette** exception
(tokenized, never raw hex), but does **not** change the weight rule.

> Fix `V6_DESIGN_VISUALIZATION.md` mermaid node **B1** from "Page Titles & Subheadings" to
> "Page Titles only."

---

## 5. Tokens (canonical)

**One token home: `src/index.css`** (CSS custom properties). `tailwind.config` `theme.extend`
references those vars. **Delete** the PLAN's old `src/v6/theme/tokens.css` alternate. (V2
`src/index.css` is currently a 13-line stub — it must be authored.)

**Categories:** color (brand teal/orange/neutral); tones (canonical 8-tone set — teal/orange/green/
amber/slate + blue/violet/red — each with full bg/border/text/dot/bar); chart/dataviz
(`--chart-grid`, `--chart-teal-line`, `--chart-orange` — replaces the ~40 raw CES-board hexes);
surface/glass; text; border (hairline `#004142/10`, card `#E5E4E3`); shadow (**exactly two**: rest,
hover); radius (**8/12/16/24/32 only**); spacing; typography (family / weight 300+500 / size /
tracking); motion (durations + easings, see §7); z-index; breakpoint/container (292/88px sidebar);
icon-size ramp; density; focus-ring.

**Token rules:**
- No raw hex (`bg-[#..]`/`text-[#..]`) in component code.
- No stock-Tailwind palette classes (`emerald-`/`amber-`/`slate-`/`violet-`/`blue-`/`red-`/`gray-`)
  for semantic state — use tone tokens.
- Status via the typed `STATUS→TONE→LABEL` map (`statusTone.ts`), never the substring regex.
- UNKNOWN status → slate + dev warning.

---

## 6. Single canonical matrix — route table = coverage = state-matrix host

**ONE artifact**: route table = coverage matrix = state-matrix host. **56 views = 54 router routes +
2 overlay/auth.** Identify every screen by its **stable hash-id** (canonical key) — never by path or
template (templates like matrix/evidence/reports/detail/board are intentionally reused across 3–7
routes). One path = one component; no query-string routing; no bare top-level `/:param`.

Each row carries: path · hash · template · group · reference-or-`INFERRED` · owner · phase ·
state-coverage · done. **Definition of Done asserts 56/56 green**, and a test equates the
router-registered real-route count to the count of is-real-route rows.

### Real routes (54)

| # | Path | Hash | Template | Group |
|---|---|---|---|---|
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
| 11 | `/ces/events` | events-board | board | CES — **INFERRED** (no PNG; inherit 4-col BoardLane from ces-board + LIVE dashboard 4-col baseline) |
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
| 26 | `/forms/:formId` | form-viewer | form-viewer | Taxonomy — read/fill ONLY |
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
| 42 | `/onboarding-v2/governance` | onboarding-v2-governance | reports | Onboarding v2 — display label **"Onboarding Overrides"** (disambiguate from `/governance`) |
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
| 54 | `/login` | login-page | login | Auth — **INFERRED** (no PNG; inherit glass surface + CareIndeed logo from shell; only auth entry; wired in step 17) |

### Overlays / non-route (2 of the 56 = overlay+auth host)

- `modal-system (VeilModal)`
- `drawer-system (VeilDrawer)`
- `popover-system (CommandPalette/Popover)`
- `personal-ops` — drawer open/close **state**, NOT a route.

> Replaces the old open-ended "(remaining V6_Final surfaces as scoped)" bucket: every dense screen
> (onboarding-v2 ×6, journey module-player/appendix-f/journey-v1/journey-admin/user-guide,
> evidence-center, audit-mode, master-controls, ces-reports, ces-calendar, mobile-incident,
> artifact-viewer, generic-reference, surveyor-viewer, hubstaff, governance, admin ×4) is enumerated
> above.

---

## 7. Motion (canonical registry)

Single motion language in `src/index.css` (CSS vars) + `tailwind theme.extend`; referenced by every
transition (no raw ms, no ad-hoc `duration-[n]`, no new cubic-beziers in screen code).

- **Durations:** `--motion-fast 120ms` (hover/press/tab/row); `--motion-base 200ms`
  (cards/popovers/toasts/route content); `--motion-slow 280ms` (drawers/sidebar width/bottom-sheet).
- **Easings:** `--ease-standard cubic-bezier(0.2,0.8,0.2,1)` (enter/move);
  `--ease-exit cubic-bezier(0.4,0,1,1)` (leave).
- **Fast ceiling:** no enter/exit > 300ms (retire the prototype 600ms fade-in-up and 0.7s drawer;
  hover-card close ≤ 200ms with intent buffer).
- **Mandatory:** global `@media (prefers-reduced-motion: reduce)` collapsing durations to ~0.01ms and
  `animation: none` on the pulse. Reduced-motion is a Stage-C axe gate.
- **Overlays** use a presence wrapper animating exit before unmount: backdrop fade 200ms; drawer
  slide-in 280ms ease-standard / out 200ms ease-exit; modal fade+scale 0.98→1 200ms; popover/palette
  fade+translateY(4px) 120ms.
- **Hover-lift** `translateY(-2px)` reserved for elevatable cards only (never active nav / full-width
  panels); one press-scale token ~0.98. Toast 3000ms unified.

---

## 8. Cohesion rules (enforced at step 16, gate-checked throughout)

1. One token source of truth: `src/index.css` CSS vars; tailwind `theme.extend` references them; no
   raw hex or stock-Tailwind palette classes in component code (gate-enforced on source).
2. Status semantics from `statusTone.ts` (`STATUS→TONE→LABEL`), never a substring regex; unknown →
   slate + dev warning; tone conveyed by text+glyph, not color alone.
3. Fixed tone vocabulary: teal = ready/complete; orange = attention/blocked; green = pass/certified;
   amber = awaiting/pending; slate = upcoming/backlog; blue/violet/red only if added with full token
   sets. No screen invents a tone.
4. One icon family app-wide: `lucide-react`; FontAwesome/`fa-` banned and gate-listed.
5. Radius only from 8/12/16/24/32; card shadows exactly two tokens (rest, hover); arbitrary
   `box-shadow` banned.
6. Every interactive primitive ships the full state set (hover/focus-visible/active/disabled,
   +selected/loading/success/empty where applicable); destructive uses a ratified pattern (dedicated
   destructive token OR confirm-modal), never bare orange.
7. Overlay widths/radii and open/close/toast timings from the single overlay+motion registry; no
   per-component magic numbers.
8. Dates/timestamps via `formatDate`/`formatTimestamp`; audit/eCIgn store UTC/ISO-8601, display with
   explicit timezone; relative formats banned on audit surfaces.
9. One `DataTable` + one density token set; matrix/admin/profiles/forms reuse them.
10. Primary/secondary button roles fixed (primary teal solid, secondary teal outline, tertiary
    ghost); **orange reserved for attention/urgency**, not a generic primary.
11. Shared primitives built once in step 5 and imported; screens never fork a catalog primitive.
12. eCIgn brand (navy `#1A3778` / orange `#F04B22`) is an authorized tokenized palette exception; QA
    must not flag it off-palette and builders must not recolor it to app teal.

---

## 9. Acceptance gates

- **Ghost-design gate** (`scripts/check-designless.mjs`, CORRECTED): remove/allowlist `LEGACY_ROUTES`
  (line 26) so reused public paths `/library`,`/forms`,`/print`,`/appendix` pass; flag a reused path
  only when a legacy **component** identifier co-occurs. Add `\b` word boundaries to `LEGACY_NAMES`
  (line 25) and run the name scan on **source** `src/**/*.tsx` (minifiers mangle dist identifiers);
  keep color/route/stale-js on `dist`. Tighten `LEGACY_COLOR` (line 24) words (maroon|burgundy|wine|
  ci-ion) to CSS-value/token context. Update the header comment: public-path reuse is intentional —
  the gate bans legacy components + colors + compiled legacy output, not reused public paths.
  **Must land and pass on a router stub before step 7 (V6-1) sign-off.**
- **Typography gate:** `FORBIDDEN_FONT /Inter|Montserrat/`; `FORBIDDEN_WEIGHT`
  `font-(semibold|bold|extrabold|black)` in source class literals + `font-weight:600|700|800|900` in
  dist CSS. Fail on any.
- **CDN/asset gate:** fail dist on `cdn.tailwindcss.com`, `fonts.googleapis.com`, `fonts.gstatic.com`,
  `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`, `cloudfront.net`, `@babel/standalone`, `placehold.co`,
  `fa-`/font-awesome. Build-time Tailwind; self-hosted Roboto/Lucide/logo.
- **a11y gate:** `@axe-core/playwright` (already installed) as a peer to `verify:designless`;
  per-route; serious+critical violations fail; assert exactly one `h1`/route, no skipped levels.
- **Responsive gate:** Playwright screenshots at 360/768/1024/1280/1536; machine-checkable —
  `document.scrollWidth <= viewport` (no h-scroll), 44px touch targets, tables scroll-or-card-stack,
  boards horizontal-scroll, calendar agenda below laptop.
- **Parity gate:** SEQUENCE screenshot-parity + visual-audit checklist (Roboto 300/500, hairlines,
  two shadows, teal/orange, 292/88 sidebar) folded into Stage C **alongside** `verify:designless` —
  both mandatory.
- **Positive fixture:** CI fixture of V6-canonical route strings + V6-native names that MUST pass the
  gate, so it can never regress to blocking valid V6 routes/names.

---

## 10. Per-screen pipeline (Stage A / B / C)

Within the fan-out (steps 9–15), each screen runs the same pipeline. **Stage A is static; logic
reconnects only at Stage B; Stage C is the gated verify.**

| Stage | Owner | Work |
|---|---|---|
| **A — Build UI** | grok | Build the V6 screen + sub-components from its reference, on V6 tokens/primitives. **Static**, typed mock data only. grok renders nav as placeholders — **must not author path strings.** |
| **B — Reconnect logic** | composer | Re-include the **exact** preserved stores/services/types/data the screen needs (`tsconfig.app` + imports per `CES_PROCESS_KEEP_MANIFEST`); replace mock data with real selectors; fix inert broken imports. Composer owns **all** route literals + registration. |
| **C — Verify** | Opus QA (+ secondary reviewer) | `verify:designless` + typography + CDN + axe + responsive + parity all green · route resolves under V6 shell · no legacy imports/names/colors · CES process intact. |

---

## 11. Definition of done

- **56/56** canonical-matrix rows green (state-coverage complete; `INFERRED` screens built).
- A test equates router-registered real-route count to is-real-route rows.
- Every designed screen renders in V6 light theme with parity to its reference (or `INFERRED`
  baseline), in Roboto 300/500 only.
- `verify:designless` + typography + CDN + axe + responsive + parity all green in CI; **no** legacy
  color/component/route/stale-`.js`; no banned font weight; no CDN asset.
- CES process chain wired and functional (event→task→form→signature→evidence→audit).
- Auth/login built last and working; no old shell/theme/viewer code anywhere in `dist/`.

---

## 12. Fleet roles

| Model | Role |
|---|---|
| **gpt — orchestrator** | Sequences the 18 steps; gates foundations (1–8) before fan-out; runs the per-screen A→B→C pipeline; enforces gate-green + no-bulk-re-include between merges |
| **grok — build workers** | Stage A: static V6 screens/components from references (parallel per screen); placeholders only for nav, never authors path strings |
| **composer — workers** | Steps 2/5/8 tokens & primitives & shared components, Stage B logic reconnection, **all** route literals + registration |
| **Opus — architect/primary QA** | Steps 1–5 architecture/tokens/typography/motion/primitives sign-off; Stage C parity + anti-bleed + a11y/responsive QA; reconnection correctness |
| **Secondary Stage-C reviewer** | Backstops Opus on the 56-screen QA queue so Opus is not a throughput SPOF (P1-9) |

> **P1-9 (process):** reconcile any named fleet into this single table. If Gemini/Codex have no role,
> state so; if Claude == Opus, state so. Gate-script ownership in step 1/9 sits with the gate-owner
> (Codex/gate-owner in V6-0).
