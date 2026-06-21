# V6 Pageview Inventory

**Status:** RECONCILED to canonical synthesis (P0-2, P0-3, P0-8, P0-9, docFixes).
**Count:** 56 views = 54 router routes + 2 overlay/auth contexts. (Corrected from the prior "54"; the prior count hid `events-board` and `login-page`.)

This document is the per-screen companion to the canonical route table. **Every screen is identified by its stable hash-id (canonical key), never by path or template** — templates (`matrix`/`evidence`/`reports`/`detail`/`board`/`calendar`) are intentionally reused across 3–7 routes (P1-1). Reference PNGs live in `Reference/V6_Final`; two screens have no PNG and are marked `INFERRED_FROM_V6_SYSTEM`.

## Canonical rules baked into this inventory

- **Routing:** one path = one component; no query-string routing; no bare top-level `/:param`.
  - `achc-crosswalk` is a distinct **PATH** `/framework/achc-survey/crosswalk` — **NOT** `?view=crosswalk` (P0-3).
  - `form-viewer` = `/forms/:formId` (read/fill); `ecign-workspace` = `/forms/:formId/esign` (signing). Two distinct components, never a mode flag (P0-2).
  - `policy-lifecycle` = `/policy-lifecycle`; deep-link only `/policy-lifecycle/:policyId` — no bare `/:policyId` (P1-2).
- **Typography LOCK:** Roboto self-hosted at **300;500 only** (no 400, no 700, no Inter/Montserrat, no Google Fonts CDN). Weight 500 (`font-medium`) is permitted ONLY on page titles/h1–h2, sidebar/nav labels, and status/ToneBadge text. Everything else is 300 (`font-light`). All 236 prototype bold/semibold/extrabold usages are stripped; hierarchy comes from size/color/opacity/spacing/casing.
- **Tokens:** single home `src/index.css` (CSS custom properties); no raw hex, no stock-Tailwind palette classes in component code. Status via typed `STATUS→TONE→LABEL` map (`statusTone.ts`), never a substring regex; UNKNOWN → slate + dev warning.
- **Components:** the V6_DESIGN_VISUALIZATION sec 5 **14-family catalog** is the single shared kit (AppShell, Sidebar, Topbar/PageHeader, MetricTile, SurfaceCard, ToneBadge, DataTable, BoardLane, VeilModal, VeilDrawer, CommandPalette, ChatThread, ProgressMeter, ChecklistTable) + leaf primitives (Button/Input/Select/Badge). All built and Opus-signed-off in V6-0 before screen fan-out. No screen forks a catalog primitive. **V6-native names only** — banned legacy identifiers (CommandCenterLayout, PolicyViewer32, PolicyDetailPage, LibraryPage, FormViewer, FormPrintView, SharedPolicyDetailView, etc.) must never reappear.
- **Icons:** lucide-react app-wide. FontAwesome / `fa-` banned.
- **Motion:** durations `--motion-fast 120ms` / `--motion-base 200ms` / `--motion-slow 280ms`; easings `--ease-standard` (enter/move) / `--ease-exit` (leave). No enter/exit > 300ms. Global `@media (prefers-reduced-motion: reduce)` collapses durations and stops the pulse.
- **eCIgn brand exception:** navy `#1A3778` / orange `#F04B22` is an authorized **tokenized palette** exception only — it does NOT change the weight rule and must not be flagged off-palette by QA, nor recolored to app teal.

---

## State coverage model — specify ONCE per template (~28 specs cover all 56 pages)

A pageview is **not covered** until its template's six state categories are specified. These are authored once on the shared template/primitive and inherited by every page using it (P0-8). The per-page rows below reference the template; the template's six-category contract follows in the next section.

The six categories: **Interaction · Empty · Loading · Error · Responsive · Permission.**

---

## Complete Pageview Registry (56)

| # | Hash-id (canonical key) | Pageview Label | Reference | Path | Template | Group | Major Components | State Spec (template) |
|---|---|---|---|---|---|---|---|---|
| 01 | `dashboard` | Command Center Dashboard | `16-dashboard.png` | `/dashboard` | `dashboard` | Overview | 4× MetricTile (Census/Visits/Coverage/Acuity); left Primary-Ops DataTable; right Signals panel + 3× SurfaceCard | → `dashboard` |
| 02 | `clinicians` | Clinician Profiles | `15-clinicians.png` | `/clinicians` | `profiles` | Overview | MetricTile row; roster DataTable; right profile summary + ProgressMeter bars (credential/training) | → `profiles` |
| 03 | `clinician-detail` | Clinician Detail | `14-clinician-detail.png` | `/clinicians/:clinicianId` | `detail` | Overview | PageHeader; left profile stats SurfaceCards (RN license, TB test, files); right assigned caseload DataTable | → `detail` |
| 04 | `patients` | Patient Profiles | `43-patients.png` | `/patients` | `profiles` | Overview | MetricTile row; roster DataTable; right profile detail + ProgressMeter bars | → `profiles` |
| 05 | `patient-detail` | Patient Detail | `42-patient-detail.png` | `/patients/:patientId` | `detail` | Overview | PageHeader; left care-plan metrics + doctor-order ChecklistTable; right case-status SurfaceCards | → `detail` |
| 06 | `master-calendar` | Master Operations Calendar | `30-master-calendar.png` | `/calendar` | `calendar` | Overview | MetricTile row; month grid (operations checkpoints); right upcoming-events rail | → `calendar` |
| 07 | `staffing-calendar` | Staffing Calendar | `48-staffing-calendar.png` | `/staffing-calendar` | `calendar` | Overview | MetricTile row; staffing-schedule grid; right shift-gaps queue | → `calendar` |
| 08 | `brad` | iAdministrator (Brad) | `10-brad.png` | `/iadministrator` | `chat` | Overview | MetricTile row; ChatThread (alternating bubbles); right SurfaceCards (citations/context); mission pills; Grounded lock | → `chat` |
| 09 | `ces-calendar` | CES Calendar | `12-ces-calendar.png` | `/ces/calendar` | `calendar` | CES | MetricTile row; month grid (events/reviews/locks); right upcoming-events rail | → `calendar` |
| 10 | `ces-board` | CES Kanban Board | `11-ces-board.png` | `/ces/board` | `board` | CES | MetricTile row; filter chips; 6× BoardLane (Upcoming/Ready/In&nbsp;Progress/Awaiting&nbsp;Sig/Blocked/Completed) | → `board` |
| 11 | `events-board` | CES Events Board | *none* — **INFERRED_FROM_V6_SYSTEM** | `/ces/events` | `board` | CES | MetricTile row; filter chips; **4× BoardLane** (inherit 4-col config from `ces-board` + LIVE dashboard 4-col baseline) | → `board` |
| 12 | `workflows` | Workflows Library | `54-workflows.png` | `/workflows` | `matrix` | CES | MetricTile row; left workflows DataTable; right swimlane SurfaceCards | → `matrix` |
| 13 | `workflow-swimlane` | Workflow Swimlane | `53-workflow-swimlane.png` | `/workflows/:workflowId/swimlane` | `board` | CES | MetricTile row; 4× BoardLane (execution phases); task cards | → `board` |
| 14 | `master-controls` | Master Controls Catalog | `31-master-controls.png` | `/compliance/master-controls` | `matrix` | CES | MetricTile row; left master-control inventory DataTable; right SurfaceCards | → `matrix` |
| 15 | `audit-mode` | Audit Mode | `09-audit-mode.png` | `/audit` | `evidence` | CES | MetricTile row (ready/missing/pending); left audit-readiness DataTable; right Audit-Packet SurfaceCard + Generate-Packet Button | → `evidence` |
| 16 | `evidence-center` | Evidence Center | `19-evidence-center.png` | `/evidence` | `evidence` | CES | MetricTile row; left evidence repository DataTable (~445 rows, **virtualized**); right archive-stats SurfaceCards | → `evidence` |
| 17 | `ces-reports` | CES Reports | `13-ces-reports.png` | `/ces/reports` | `reports` | CES | MetricTile row; left SVG bar chart (chart/dataviz tokens); right SurfaceCards | → `reports` |
| 18 | `mobile-incident` | Mobile Incident Intake | `32-mobile-incident.png` | `/calendar/event/:eventId/task/:taskId` | `detail` | CES | Mobile-first PageHeader; incident detail SurfaceCards; file-attachment slots | → `detail` (mobile-primary) |
| 19 | `my-tasks` | My Tasks | `35-my-tasks.png` | `/my-tasks` | `board` | CES | MetricTile row; 3× BoardLane (Todo/In&nbsp;Progress/Done) | → `board` |
| 20 | `framework` | Framework Domains | `22-framework.png` | `/framework` | `framework` | Taxonomy | MetricTile row; domains tree/grid (Admin/Clinical/Operations) | → `framework` |
| 21 | `achc-survey` | ACHC Survey Alignment | `02-achc-survey.png` | `/framework/achc-survey` | `achc-survey` | Taxonomy | MetricTile row; left standard-checklist DataTable w/ compliance ToneBadges; right prompt inputs + action ChecklistTable | → `achc-survey` |
| 22 | `achc-crosswalk` | ACHC Crosswalk | `01-achc-crosswalk.png` | `/framework/achc-survey/crosswalk` | `achc-crosswalk` | Taxonomy | Left DataTable (CMS refs, Standard refs, support levels); right SurfaceCards (policy council) + export Button. **Distinct PATH, not a query param** | → `achc-crosswalk` |
| 23 | `policy-library` | Policy Library | `45-policy-library.png` | `/library` | `matrix` | Taxonomy | MetricTile row; left policy DataTable (~269 rows, **virtualized**); right stewardship SurfaceCards | → `matrix` |
| 24 | `policy-detail` | Policy Detail Viewer | `44-policy-detail.png` | `/library/:policyId` | `detail` | Taxonomy | Multi-pane: left policy text; right meta list, linked forms, ACHC links (PageHeader emits single h1) | → `detail` |
| 25 | `forms-library` | Forms Library | `21-forms-library.png` | `/forms` | `matrix` | Taxonomy | MetricTile row; left forms DataTable; right SurfaceCards (filters/counts) | → `matrix` |
| 26 | `form-viewer` | Form Viewer | `20-form-viewer.png` | `/forms/:formId` | `form-viewer` | Taxonomy | Left form fields (7 section layouts × 11 field types, **read/fill ONLY**); right linked-policy SurfaceCards | → `form-viewer` |
| 27 | `ecign-workspace` | eCIgn Workspace | `18-ecign-workspace.png` | `/forms/:formId/esign` | `ecign` | Taxonomy | Left eCIgn reader + signature box (typed/hand) + attestation; right certificate metadata. **6 ordered no-skip steps**; navy/orange brand | → `ecign` |
| 28 | `artifact-viewer` | Artifact Viewer | `08-artifact-viewer.png` | `/artifacts/:artifactId` | `reference-viewer` | Taxonomy | PageHeader; left metadata/document-info SurfaceCard; right verification status + download Button | → `reference-viewer` |
| 29 | `generic-reference` | Reference Viewer | `23-generic-reference.png` | `/viewer/:referenceId` | `reference-viewer` | Taxonomy | MetricTile row; left cite details; right related sources | → `reference-viewer` |
| 30 | `journey-overview` | Journey Overview | `28-journey-overview.png` | `/journey` | `journey` | Onboarding | MetricTile row; left GAO/role checklist nodes; right onboarding-phase rail ProgressMeter | → `journey` |
| 31 | `journey-v1` | Journey Legacy (v1) | `29-journey-v1.png` | `/journey/v1-journey` | `journey` | Onboarding | Left onboarding lesson-path list; right details | → `journey` |
| 32 | `module-player` | Module Player | `34-module-player.png` | `/journey/module/:moduleId` | `module-player` | Onboarding | Quiz / skills ChecklistTable checkoff frame; ProgressMeter | → `module-player` |
| 33 | `appendix-f` | Appendix F Checklist | `07-appendix-f.png` | `/journey/appendix-f` | `docs` | Onboarding | MetricTile row; hard-stop ChecklistTable (Background/OIG/SAM/Licensure/offer letter); warning SurfaceCards | → `docs` |
| 34 | `supervisor` | Supervisor Onboarding | `49-supervisor.png` | `/journey/supervisor` | `journey` | Onboarding | MetricTile row; left learner DataTable; right profile panel + clearance ChecklistTable | → `journey` |
| 35 | `journey-admin` | Journey Admin | `27-journey-admin.png` | `/journey/admin` | `reports` | Onboarding | MetricTile row; left onboarding-syllabus DataTable; right mapped regulatory refs | → `reports` |
| 36 | `user-guide` | User Guide | `52-user-guide.png` | `/journey/guide` | `docs` | Onboarding | Left interactive training guide; right support links | → `docs` |
| 37 | `onboarding-v2-dashboard` | Onboarding v2 Dashboard | `40-onboarding-v2-dashboard.png` | `/onboarding-v2/dashboard` | `dashboard` | Onboarding v2 | 5× MetricTile; left activation-queue DataTable; right 5× gate tiles + SurfaceCards | → `dashboard` |
| 38 | `onboarding-v2-activate` | Onboarding v2 Activation | `36-onboarding-v2-activate.png` | `/onboarding-v2/activate` | `detail` | Onboarding v2 | Form sections (Subject/Trigger/Roles/Reconciliation Preview) within detail layout | → `detail` |
| 39 | `onboarding-v2-batches` | Onboarding v2 Batches | `39-onboarding-v2-batches.png` | `/onboarding-v2/batches` | `matrix` | Onboarding v2 | MetricTile row; left batch DataTable; right stats SurfaceCards | → `matrix` |
| 40 | `onboarding-v2-batch` | Onboarding v2 Batch Detail | `38-onboarding-v2-batch.png` | `/onboarding-v2/batches/:batchId` | `detail` | Onboarding v2 | Roster DataTable; **5 fixed gate tiles**; phase ProgressMeter; hash-chain audit timeline | → `detail` |
| 41 | `onboarding-v2-audit` | Onboarding v2 Audit | `37-onboarding-v2-audit.png` | `/onboarding-v2/audit` | `evidence` | Onboarding v2 | MetricTile row; left subject-verification + hash-chain DataTable; right overrides | → `evidence` |
| 42 | `onboarding-v2-governance` | Onboarding Overrides | `41-onboarding-v2-governance.png` | `/onboarding-v2/governance` | `reports` | Onboarding v2 | MetricTile row; left active-overrides DataTable; right audits. **Display label "Onboarding Overrides"** to disambiguate from `/governance` | → `reports` |
| 43 | `policy-lifecycle` | Policy Lifecycle States | `46-policy-lifecycle.png` | `/policy-lifecycle` | `lifecycle` | System | MetricTile row; left horizontal stage board (DRAFT→REVIEW→APPROVED→PUBLISHED→ARCHIVED); right action SurfaceCards (~279 rows, **virtualized**). Deep-link only `/policy-lifecycle/:policyId` | → `lifecycle` |
| 44 | `hubstaff` | Hubstaff Integration | `26-hubstaff.png` | `/hubstaff` | `reports` | System | MetricTile row; left logs-integration DataTable; right SurfaceCards (timeliness/mileage) | → `reports` |
| 45 | `system-docs` | System Documentation Index | `51-system-docs.png` | `/system-documentation/:sectionId` | `docs` | System | Left system-docs index DataTable; right sidebar | → `docs` |
| 46 | `help-center` | Help Center | `25-help-center.png` | `/help/*` | `docs` | System | Left categorized help-guide list; right search + metadata | → `docs` |
| 47 | `governance` | Governance Center | `24-governance.png` | `/governance` | `reports` | System | MetricTile row; left SVG bar charts (chart/dataviz tokens); right SurfaceCards (drafts review) | → `reports` |
| 48 | `admin-groups` | Admin User Groups | `03-admin-groups.png` | `/admin/user-groups` | `matrix` | Admin | Left user-groups DataTable; right SurfaceCards (group permission scopes) | → `matrix` |
| 49 | `admin-roles` | Admin Roles | `05-admin-roles.png` | `/admin/roles` | `matrix` | Admin | Left platform-roles DataTable; right scope-summary SurfaceCards | → `matrix` |
| 50 | `admin-permissions` | Permission Catalog | `04-admin-permissions.png` | `/admin/permissions` | `matrix` | Admin | Left permission-list DataTable; right detail SurfaceCards (roles/constraints) | → `matrix` |
| 51 | `admin-users` | User Assignments | `06-admin-users.png` | `/admin/users` | `matrix` | Admin | Left user-profile DataTable (Name/Role/Assignments); right detail SurfaceCards | → `matrix` |
| 52 | `surveyor-viewer` | Surveyor Policy Viewer | `50-surveyor-viewer.png` | `/surveyor/policy/:policyId` | `detail` | Admin | Left read-only policy text; right deficiency ChecklistTable panels | → `detail` |
| 53 | `login-page` | Login | *none* — **INFERRED_FROM_V6_SYSTEM** | `/login` | `login` | Auth | Glass SurfaceCard + CareIndeed logo (inherit from shell); Input/Button leaf primitives; **only auth entry**; wired in V6-3 with auth bootstrap | → `login` |
| 54 | `modal-system` | Modal System (VeilModal) | `33-modal-system.png` | *overlay primitive* | `overlay` | System overlay | Centered blocking VeilModal (dual sign-off, signature, override templates) | → `overlay` |
| 55 | `drawer-system` | Drawer System (VeilDrawer) | `17-drawer-system.png` | *overlay primitive* | `overlay` | System overlay | Backdrop + right VeilDrawer (workflow detail, audit check). Also hosts PersonalOpsDrawer | → `overlay` |
| 56 | `popover-system` | Popover & Command Palette | `47-popover-system.png` | *overlay primitive* | `overlay` | System overlay | CommandPalette (Cmd/Ctrl-K over VIEW registry); hover Popover menus; toasts | → `overlay` |

> **Overlays note:** `modal-system` / `drawer-system` / `popover-system` are **primitive contexts, not routes** (VeilModal / VeilDrawer / CommandPalette+Popover). `personal-ops` is drawer open/close state hosted in `drawer-system`, **NOT a route**. They are counted in the 56 as the 2 overlay/auth context bucket together with `login-page`.

---

## Per-template state matrix (the six categories, specified once)

Each template's row is inherited by every pageview mapped to it above. DataTable/BoardLane/overlay states are inherited from the catalog primitives (P0-8); template rows below add only template-specific behavior.

### Shared primitive baseline (inherited by ALL templates)
- **Interaction:** focus-visible ring on every control (no `outline-none`); accessible names on icon-only buttons; skip link; hover cards also open on focus; min-h-44 touch targets; press-scale ~0.98 token; hover-lift translateY(-2px) on elevatable cards only.
- **Empty:** DataTable empty row, BoardLane empty-lane placeholder, "no results" SurfaceCard copy.
- **Loading:** route-level Suspense skeleton; DataTable skeleton rows; MetricTile shimmer; never layout-shift on resolve.
- **Error:** per-route `errorElement` + content-region error boundary that keeps Sidebar/Topbar interactive and offers retry; DataTable error row.
- **Responsive:** body `scrollWidth ≤ viewport` (no horizontal scroll); breakpoints 360/768/1024/1280/1536; context rails engage at `lg` not `xl`.
- **Permission:** RBAC-gated nav items hidden/disabled; route guard redirects unauthorized to a 403 surface; permission-denied SurfaceCard inside content region (Sidebar stays).

| Template | Interaction | Empty | Loading | Error | Responsive | Permission |
|---|---|---|---|---|---|---|
| `dashboard` | MetricTile drill-through; Primary-Ops row click → detail; Signals dismiss | "No active signals" / "Queue clear" SurfaceCards | KPI shimmer + table skeleton | KPI fetch failure → inline retry tile | MetricTiles 4→2→1 col; right Signals panel → below at tablet → drawer at mobile | KPIs scoped to role; hide ops queue if no `ops.read` |
| `profiles` | Roster row select → right summary; ProgressMeter tooltips on focus | "No clinicians/patients match" | Roster skeleton + bar placeholders | Roster error row + retry | Two-pane → stacked at tablet; summary as drawer at mobile | Hide PII columns without `pii.read`; redact in summary |
| `detail` | Tab/section switch via `useSearchParams`; multi-pane sticky headers; ChecklistTable toggles | "No linked items" per pane | Pane-level skeletons | Pane error isolates (other panes render) | 3-pane → 2 at laptop → stacked at tablet → accordion mobile | Edit affordances gated by `*.write`; read-only fallback otherwise |
| `calendar` | Day/Week/Month via `useSearchParams` view-mode (wire inert toggles); event hover card (close ≤200ms, focus-openable) | "No events this period" | Grid skeleton cells | Event-load error banner + retry | 7-col grid at laptop+; **single-column date-grouped agenda below laptop** | Hide schedule-edit unless `schedule.write` |
| `chat` | Send/stop; suggested mission pills; citation hover→focus; Grounded lock state | "Start a conversation" empty thread | Streaming indicator; thread skeleton | Send failure → retry on message; grounded-source error toast | ChatThread full-width mobile; citations panel → drawer at mobile | Hide if no `assistant.access` |
| `board` | dnd-kit drag-reorder w/ **keyboard sensor**; filter chips via `useSearchParams`; lane collapse | Per-lane empty-lane placeholder | Lane skeleton cards | Lane fetch error isolates | **Horizontal-scroll fixed-min-width lane track** (flex overflow-x-auto), one column only at mobile — never `md:grid-cols-2` wrap | Hide move/assign actions without `task.write` |
| `matrix` | Sortable headers; row select → right SurfaceCards; sidebar filter via `useDeferredValue`; virtualize large lists preserving a11y | "No records match filter" | Skeleton rows | Error row + retry; preserve filter state | DataTable below laptop: `overflow-x-auto` + min-width (keep ID/title/status); below tablet stacked card-list — never `overflow-hidden` | Hide admin/RBAC rows + edit without `admin.*`; surveyor read-only |
| `evidence` | Row expand → hash detail; Generate-Packet action; upload affordance | "No evidence on file" | Skeleton + hash-verify spinner | Hash-verify failure → flagged row, not crash; retry | Dense table scroll-or-card-stack; right archive stats → below at tablet | Audit surfaces read-mostly; gate uploads by `evidence.write`; **timestamps UTC/ISO, no relative formats on audit** |
| `reports` | Chart hover tooltips (text+value, not color-only); export Button; range filter | "No data for range" empty chart state | Chart skeleton + axis placeholders | Chart data error → fallback table + retry | Charts reflow full-width; SurfaceCards stack below at tablet | Hide export/governance actions without `governance.read` |
| `framework` | Domain node expand/collapse (keyboard-operable tree); node → drill | "No domains configured" | Tree skeleton | Node-load error isolates branch | Tree → single-column accordion at tablet | Read-only unless `framework.write` |
| `achc-survey` | Checklist row toggle; prompt inputs; compliance ToneBadge (text+glyph) | "No standards loaded" | Checklist skeleton | Save/prompt error inline | Two-pane → stacked at tablet | Edit gated by `survey.write` |
| `achc-crosswalk` | Sortable crosswalk DataTable; support-level ToneBadge; export Button | "No crosswalk rows" | Skeleton rows | Export error toast; load error row | Wide table `overflow-x-auto` keeping CMS-ref/Standard-ref/level; right cards below at tablet | Read-mostly; export gated by `survey.export` |
| `form-viewer` | 11 field types: validation/dirty/error/disabled states; section nav; **read/fill only, no submit-to-sign** | "No fields in section" | Form skeleton | Field-load error inline; save-draft error toast | 3-col field/policy layout → stacked at tablet; right policy cards → below | Fill gated by `forms.fill`; otherwise read-only |
| `ecign` | **6 ordered no-skip steps** (step-locked until prior complete); signer states; typed/hand signature; attestation checkbox; navy/orange brand tokens | n/a (always a document) | Document-load skeleton; signature-submit spinner | Signature/attestation failure → block advance + clear error; **never optimistic** | Reader/signature/cert 3-col → stacked at tablet; signature box full-width mobile | Sign gated by `esign.sign`; viewer-only sees disabled signature box |
| `reference-viewer` | Download Button; verification-status ToneBadge; source links | "No metadata available" | Metadata skeleton | Verify/download error inline + retry | Metadata/sources → stacked at tablet | Download gated by `reference.read` |
| `journey` | Phase-rail navigation; node → module-player; ProgressMeter | "No modules assigned" | Rail + node skeleton | Module-load error isolates node | Rail + content → stacked at tablet; rail → top progress bar mobile | Learner sees own journey; supervisor sees cohort via `journey.supervise` |
| `module-player` | Quiz answer select; ChecklistTable checkoff; next/prev step-gated; ProgressMeter | "No content in module" | Player skeleton | Submit error → retain answers + retry | Single-column player mobile-first; side rail collapses | Complete gated by `journey.complete`; supervisor view read-only |
| `docs` | Article search; category list select; ToC nav; `/help/*` splat slugs (post-MVP) | "No articles found" | List + article skeleton | Article-load error + retry | List + article → stacked at tablet; ToC → top accordion mobile | Public docs open; gated sections by `docs.read` |
| `lifecycle` | Stage-board horizontal scroll; stage filter; action SurfaceCards; deep-link `/:policyId` | "No policies in lifecycle" | Stage board skeleton | Stage-data error per stage | Horizontal stage scroll on mobile; action cards stack below | Transition actions gated by lifecycle role; read-only otherwise |
| `login` | Email/password Inputs (validation/error); submit Button (loading/disabled); Cognito new-password-required + MFA flows | n/a | Submit spinner; disable form during auth | Auth error message (no enumeration); lockout state | Centered glass card, full-width on mobile, max-width on desktop | Pre-auth only; authed users redirected to `/dashboard` |
| `overlay` (VeilModal / VeilDrawer / CommandPalette) | Portal to `document.body`; **focus-trap + return-focus**; `role="dialog"` + `aria-modal`; body scroll-lock; close on Escape + backdrop; background `inert`/`aria-hidden`; CommandPalette = Cmd/Ctrl-K over VIEW registry | Empty palette → "No commands match"; empty drawer → placeholder | Drawer/modal content skeleton | Action error inside overlay (does not dismiss) | Modal centered all sizes; **VeilDrawer = right drawer desktop, bottom-sheet mobile**; PersonalOpsDrawer same pattern | Commands/actions filtered by permission; hide unauthorized palette entries |

---

## Detailed Data Dependency Matrix

1. **Roster Lists (`clinicians`, `patients`, `supervisor`)**
   - `clinicianRecords`: caseload capacity, licensing dates, verification hash, profile stats.
   - `patientRecords`: case managers, physician orders, medication reconciliation, risk indicators.
   - `learnerRecords`: supervised-visit log, GAO progress, clearance sign-off gates.

2. **Compliance Logs (`evidence-center`, `audit-mode`, `onboarding-v2-audit`)**
   - `auditEvidenceRows`: subject details, hash validity, verification state.
   - `evidenceCenterRows`: content hash, retention rule, uploaded-documents index.

3. **Batches & Gates (`onboarding-v2-dashboard`, `onboarding-v2-batch`)**
   - `onboardingV2Batches`: batch identifiers, subjects, triggers, roles, status tags.
   - `onboardingV2Gates`: outcome rules mapping triggers to passing criteria for 5 clearance states.

4. **Status / Tone (ALL status-bearing screens)**
   - `statusTone.ts`: typed `STATUS→TONE→LABEL` map. Tone vocabulary — teal=ready/complete, orange=attention/blocked, green=pass/certified, amber=awaiting/pending, slate=upcoming/backlog (blue/violet/red only with full token sets). UNKNOWN → slate + dev warning. Tone always conveyed by text+glyph, never color alone.

---

## INFERRED screens (no reference PNG)

| Hash-id | Inference basis |
|---|---|
| `events-board` (`/ces/events`) | Inherits 4-col BoardLane config from `ces-board` + the LIVE dashboard 4-col baseline. Build in V6-2 board family. |
| `login-page` (`/login`) | Inherits glass SurfaceCard + CareIndeed logo from the shell; sole auth entry; built/wired in **V6-3** with the Cognito auth bootstrap (auth is LAST). |

## Reconciliation log (what changed from the prior inventory)

- Count corrected 54 → **56**; added `events-board` and `login-page` rows (both INFERRED).
- `ecign-workspace` path corrected `/forms/:formId` → **`/forms/:formId/esign`** (P0-2); now a distinct component from `form-viewer`.
- `achc-crosswalk` path corrected `?view=crosswalk` → **`/framework/achc-survey/crosswalk`** (P0-3).
- Every row re-keyed to its **hash-id** as the canonical identifier; paths/templates de-emphasized.
- Added the **six-category per-template state matrix** (interaction/empty/loading/error/responsive/permission) — previously 0/54 (P0-8).
- Template names aligned to canonical: `kanban`→`board`, `admin`→`matrix`, `policy-viewer`→`detail`, `surveyor-policy`→`detail`, `form`→`detail`, `overlays`→`overlay`; `appendix-f` retemplated `matrix`→`docs`, `journey-admin` `admin`→`reports`, `supervisor` `profiles`→`journey`, `artifact-viewer` `detail`→`reference-viewer`, `onboarding-v2-activate` `form`→`detail` per canonical route table.
- Overlay systems clarified as **primitive contexts, not routes**; `personal-ops` is drawer state, not a route.
- Removed all legacy component identifiers; mapped components to the 14-family catalog + leaf primitives.
- Typography LOCK, token, motion, icon, and eCIgn-exception rules stated as binding constraints on every row.
