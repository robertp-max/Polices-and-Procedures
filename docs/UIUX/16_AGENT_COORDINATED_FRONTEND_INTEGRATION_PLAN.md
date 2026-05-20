# 16-Agent Coordinated Frontend Architecture & Integration Plan

**Status:** Master Execution Plan (Deeply Coordinated, Not Siloed)  
**Version:** 1.0  
**Date:** 2026-05-18  
**Review Type:** 16-Agent Parallel Deep-Dive with Explicit Cross-Agent Contracts  
**Visual North Star:** https://pin.it/4vonRJSyY (Premium glassmorphic constrained-frame operational UI — Care Indeed calm authority language)  
**Governing Documents:** `CANONICAL_UI_SYSTEM_SPEC.md`, `UIUX_RECONSTRUCTION_MASTER_PLAN.md`, existing 16-Agent 4-Phase Plans (01–16)

---

## Executive Intent

This plan does **not** treat the 16 agents as independent specialists who each optimize their corner and throw artifacts over the wall.

Instead, the 16 agents operate as a **tightly coupled system** with:

- A single shared visual contract (Pinterest board + locked v2 Top Picks mocks + Canonical Spec §4 4-sided glass magnification rule)
- Explicit **interface contracts** between every pair of adjacent domains
- A **dependency DAG** that forces sequential handoffs at the right moments
- A **unified component promotion ladder** (raw → ad-hoc → ui/ primitive → composition → page pattern)
- 100% page/view coverage guarantee — every route, every internal state, every modal/drawer/sheet, every print surface is explicitly assigned

The output of this review is **actionable frontend architecture suggestions per domain + a single integrated rollout plan** that can be executed by the existing team without coordination thrash.

---

## 1. Exhaustive Page / View Inventory (Single Source of Truth)

Every distinct view that must receive the coordinated treatment is catalogued below. Internal states, tabs, stages, and drawers are listed because they often require distinct component treatment.

### 1.1 Public Auth Surface (6 routes, 1 shell)
- LoginPage
- RegisterPage
- CheckEmailPage
- SetupAccountPage
- ForgotPasswordPage
- ResetPasswordPage / SetNewPasswordPage

**Key internal surfaces:** AuthCard, password strength, email verification states, role selection during setup.

### 1.2 Command Center Shell (1 immutable frame, all operational pages live inside)
- ShellFrame + ShellNavRail + ShellTopbar + ShellContentFrame + ShellMobileDrawer (owned by Agent 04)
- Global overlays: GlobalTaskDrawer, GuidedTourGate, GuidedUatWidget, CesRoleReviewSwitcher, ContextualKnowledgeBulb

### 1.3 Core Operational Pages (inside ShellContentFrame — 4-sided constraint mandatory)

**Dashboard Domain**
- DashboardPage (two major modes: `agency` planner vs `planner` personal)
  - KPI row, Board columns (Critical/AtRisk/Overdue/Awaiting), My Planner toggle, event cards, action rail

**Policy & Library Domain**
- LibraryPage (grid + filters + search)
- PolicyDetailPage (multi-tab: statements, procedures, documentation, compliance, references, appendices, alerts, FAQ, amendments — plus sub-tabs inside Procedures)
- PolicyLifecyclePage (unified DRAFT → REVIEW → APPROVED workspace with status machine)
- TaxonomyPage (hierarchy + search + regulatory tags)
- FrameworkPage (hierarchy vs lifecycle tabs)
- AchcSurveyAlignmentPage (surveyor crosswalk surface)

**Compliance Execution (CES) + PM Overlay Domain**
- MasterCalendarPage (primary surface — used by CES Dashboard redirect)
  - Multiple right-panel states: TaskDetailRightPanel, WorkflowExecutionPanel, SprintTaskPanel
  - URL-driven sub-views: `/calendar?view=sprint`, `/calendar/event/:id/workflow`, `/calendar/event/:id/task/:id`, etc.
- CesBoardPage (kanban 6-state or grouped)
- CesWorkloadsPage
- CesReportsPage
- MyTasksPage (CES flavor) + MyTasksPmPage (PM flavor)
- PmDashboardPage, SprintPlanPage, SprintReviewPage, ApprovalsQueuePage
- MobileIncidentExecutionPage (5 distinct stages passed as prop: `event | workflow | task | evidence | approval`)

**Evidence & Capture Domain**
- EvidenceCenterPage (hierarchy vs files center view, heavy filter state machine, detail drawer, upload flows)
- ArtifactViewerPage (signed PDF + signature roster + append flows)
- FormViewer + eCign signing workspace (multi-step signature + PDF generation)
- FormPrintView (standalone clean pagination)

**Audit & Governance Domain**
- AuditModePage (state machine: open/ready/blocked/completed, bulk actions)
- GovernancePage
- MasterControlInventoryPage (regulatory inventory grid + linkage)

**iAdministrator / Brad Domain (highest internal complexity)**
- IAdministratorPage (Brad)
  - Internal state machine: scenario classification, response panels, chat thread, right preview, emergency banners, critical orchestration, reference cards, health strip, operational gaps
  - Multiple demo/critical paths

**Specialist & Admin Surfaces**
- FormsPage (catalog + launch)
- DemoPage (multi-tab legacy demo surface — high risk of style drift)
- HubstaffStagingPage
- WorkflowLibraryApp (full * wildcard route)
- GenericReferenceViewer (unified viewer for events/tasks/references)
- BradProposalPage (hidden executive route)

**Staffing Domain (Phase 1 read-only)**
- ClinicianListPage + ClinicianDetailPage
- PatientListPage + PatientDetailPage
- StaffingCalendarPage (Month/Week views, shift cards, filters)

**Onboarding & Competency Journey Domain (two parallel systems)**
- JourneyHomePage (catalog)
- OnboardingV1JourneyPage (very large internal router: dashboard → module-overview → lesson → test → results → certificate, plus 7+ sub-components)
- ModulePlayerPage, SupervisorPage, AdminPage, UserGuidePage, AppendixFPage, StagingM01Page (env-gated)
- OnboardingV2Layout + sub-pages:
  - OnboardingV2Dashboard, ActivationPage, BatchListPage, BatchViewPage, AuditReadinessPage, GovernancePage

**Help & Documentation Domain**
- HelpCenterPage (article browser + contextual)
- SystemDocumentationPage (sectioned executive + technical)

**Print & Surveyor Surfaces (standalone, outside main shell)**
- PrintPage, GVGBPrintDocument, GVGBAppendixPrint, FormPrintView, SurveyorPolicyViewerPage

**Security / Identity Admin (AdminRouteGuard protected)**
- UserGroupsPage, AdminRolesPage, PermissionCatalogPage, UserAssignmentsPage, AccessDeniedPage (role-aware)

**Total distinct routed + internal views: 70+** (counting every tab, stage, drawer, and print variant as a surface that must obey the contract).

---

## 2. Design Language Contract (Pinterest + Canonical)

From the Pinterest board (https://pin.it/4vonRJSyY) + all v2 Top Picks mocks + `CANONICAL_UI_SYSTEM_SPEC.md`:

**Non-negotiable visual signature on every operational page:**
- Layer 0 atmospheric backdrop (TravelightBG or soft gradient gutter) **must be visibly framing** the entire composition on all four sides.
- Layer 1 is exactly one authoritative glass surface (`ShellContentFrame`) inset by `clamp(16px, 1.6vw, 28px)` on desktop.
- Layer 2 cards inside Layer 1 use stronger definition, subtle shadow, and higher opacity — never decorative nesting >3 layers.
- Calm authority palette (Care Indeed maroon `#C74601` primary, gold accents, teal `#00A89D` secondary, orange urgency).
- Typography from locked scale (no arbitrary `text-[26px]` etc.).
- Mobile: 44px+ targets, bottom-sheet preference for details, one-handed flows.
- Task-first information hierarchy — compliance state and next action legible in <500ms scan.

Any surface that cannot achieve the visible 4-sided framing effect is considered a contract violation.

---

## 3. 16-Agent Coordinated Domain Model (Not Independent)

We keep the original 16 specializations but **re-scope their mandates** from "optimize my silo" to "**own the interface contract for my domain and guarantee handoff quality to the 3–4 adjacent domains**".

Each agent owns:
- A set of pages/views (coverage guarantee)
- A set of primitives or compositions they must promote or create
- Explicit **handoff contracts** with upstream and downstream agents
- A 4-phase plan whose exit gates include sign-off from the adjacent agents

### The 16 Coordinated Agents + Coverage + Frontend Suggestions

**Agent 01 — Glassmorphism & Layering Fidelity**  
**Coverage:** Every single operational page inside `ShellContentFrame` (100% of Dashboard, Library, Calendar, Evidence, CES, Audit, iAdmin, OnboardingV2, Staffing, etc.).  
**Frontend Mandate:** Own `GlassPanel`, `SurfaceCard`, `ShellContentFrame`, `Layer` prop system. Define the `data-layer` contract and runtime guard.  
**Suggested Architecture:** 
- `ui/GlassPanel.tsx` becomes the only place that emits `backdrop-blur` + `bg-white/5` + luminous edge.
- Add `layer: 1 | 2 | 3` prop with dev-time nesting detection.
- New `ConstrainedFrame` wrapper (used by Shell only) that enforces the 4-sided inset via CSS var + data attribute for visual regression.
- **Handoff Contract to Agent 04 & 05:** Any page that needs a "glass card" must import from `ui/` and declare its intended layer. Agent 01 signs off on every new primitive before Agent 05 (Dashboard) can use it as reference.

**Agent 02 — Four-Sided Border Contract & Inset System**  
**Coverage:** All pages that render inside the shell + mobile vs desktop differentiation.  
**Frontend Mandate:** Own the `ShellFrame` padding logic, `--ci-glass-layer1-inset-*` tokens, and the visual regression harness that proves visible Layer 0 framing.  
**Suggested Architecture:**
- Tokenize `desktopInset`, `mobileInset`, `safeAreaInset`.
- `ShellContentFrame` must never be full-bleed on desktop; mobile can kiss the edge but must still declare the frame.
- Create `useConstrainedFrame()` hook + `data-constrained-frame="true"` marker for all screenshot tests.

**Agent 03 — Token Primitive Adoption & Generation Pipeline**  
**Coverage:** Every file that currently contains raw hex, rgba, arbitrary Tailwind spacing/typography.  
**Frontend Mandate:** Own `tokens.json` → generated CSS/TS pipeline + ESLint `no-raw-values` rule.  
**Suggested Architecture:**
- Three-tier token system: `primitive/`, `semantic/`, `component/`.
- Generator that emits `--ci-color-*`, `--ci-text-*`, `--ci-space-*`, `--ci-radius-*`, `--ci-elevation-*`.
- Strict ban on `text-[#C74601]`, `bg-[#0a0f1a]`, `p-[17px]` etc. outside the token layer.

**Agent 04 — Shell & Command Center Architecture (The Immutable Frame)**  
**Coverage:** `CommandCenterLayout.tsx`, all nav items, global overlays, mobile drawer.  
**Frontend Mandate:** The shell is frozen after Phase 1. No page may emit competing frames, backgrounds, or side rails.  
**Suggested Architecture:**
- `ShellFrame`, `ShellNavRail`, `ShellTopbar`, `ShellContentFrame`, `ShellMobileDrawer` become the **only** chrome primitives.
- Nav items become data-driven from a single `NAV_ITEMS` contract (already partially true).
- **Handoff to every surface agent:** "You receive a clean `children` prop inside one glass. You may never touch outer margins or backgrounds."

**Agent 05 — Dashboard Surface (Reference Implementation)**  
**Coverage:** DashboardPage (both planner modes) + all KPI/Board/TaskCard patterns that will be replicated elsewhere.  
**Frontend Mandate:** Dashboard is the **living specification**. First surface to achieve pixel-near parity with `Desktop/v2/01_Dashboard_Desktop_v2.jpg` while obeying every contract.  
**Suggested Architecture:**
- Promote `KpiCard`, `BoardColumn`, `TaskCard`, `UrgencyLeftBorder`, `PlannerViewToggle` into `ui/`.
- Create `DashboardComposition` pattern that later surfaces (CES board, Evidence, Calendar day view) must replicate instead of reinventing.
- **Contract with Agent 01/02/03:** Dashboard may only use primitives that have passed Agent 01 layering review and Agent 03 tokenization.

**Agent 06 — CES / Compliance Execution Surfaces**  
**Coverage:** CesBoard, CesWorkloads, CesReports, MyTasks (both flavors), Sprint views, ApprovalsQueue, MobileIncidentExecution (all 5 stages).  
**Frontend Mandate:** Preserve CES navy sub-brand identity while converging on canonical glass primitives. No parallel `ces/theme.ts` design system long-term.  
**Suggested Architecture:**
- New scoped primitives: `CesGlassCard`, `CesUrgencyBar`, `CesStateChip` that internally use the canonical token + layer system but accept a `cesVariant="navy"` tint.
- Board layout becomes a `KanbanBoard` composition (owned here but built from Agent 05's `BoardColumn` primitive).
- **Handoff Contract to Agent 10 (Calendar):** Calendar is the shared substrate. CES board and Calendar day/week views must share the same task card anatomy and urgency treatment.

**Agent 07 — Evidence Center & Capture Workflows**  
**Coverage:** EvidenceCenterPage (all filter states + hierarchy/files toggle + detail drawer), ArtifactViewer, PhotoEvidenceCapture, Signature flows, PDF append, MobileIncidentExecution evidence stage.  
**Frontend Mandate:** Evidence is the **second reference surface** after Dashboard. Highest daily operator touch volume + strongest regulatory showcase.  
**Suggested Architecture:**
- `EvidenceHierarchyPanel`, `EvidenceFileGrid`, `EvidenceDetailDrawer`, `PhotoCaptureSheet`, `SignaturePad` all promoted to `ui/evidence/` or `ui/`.
- Upload + drag-drop + camera flows must be bottom-sheet first on mobile.
- **Handoff to Agent 08 (Policy) & Agent 13 (Mobile):** Evidence artifacts must render cleanly inside Policy appendices and inside MobileIncidentExecution without style forks.

**Agent 08 — Policy Library, Detail, Lifecycle & Taxonomy**  
**Coverage:** LibraryPage, PolicyDetailPage (all 9+ tabs + sub-tabs), PolicyLifecyclePage, TaxonomyPage, FrameworkPage, AchcSurveyAlignmentPage, Print surfaces, SurveyorPolicyViewer.  
**Frontend Mandate:** Policy surfaces have historically had the most visual invention. They must become the cleanest consumers of the token + primitive system.  
**Suggested Architecture:**
- `PolicyCard`, `PolicySection`, `PolicyTabBar`, `AppendixRenderer`, `CrosswalkTable` as canonical compositions.
- Lifecycle state machine UI (DRAFT/REVIEW/APPROVED) becomes a shared `LifecycleStepper` primitive usable by OnboardingV2 Audit and CES.
- Print surfaces get their own clean "print-only" token set (no glass, high contrast, pagination-safe).

**Agent 09 — Onboarding & Competency Journey (V1 + V2)**  
**Coverage:** JourneyHomePage, OnboardingV1JourneyPage (entire internal router + lesson/test/certificate states), ModulePlayer, OnboardingV2Layout + all 6 sub-pages, Supervisor/Admin pages.  
**Frontend Mandate:** Two parallel onboarding systems must converge on the same visual language and primitive set. V2 is the audit-grade future.  
**Suggested Architecture:**
- `JourneyCard`, `ModuleProgress`, `LessonPlayerChrome`, `TestRunner`, `CertificateView` as promoted primitives.
- OnboardingV2 uses the same glass + 4-sided contract as operational surfaces (it is not a "marketing" flow).
- **Critical Handoff to Agent 15 (Cross-Surface):** Onboarding must feel like a natural extension of the Command Center, not a separate product.

**Agent 10 — Calendar, Scheduling & Task Projection Surfaces**  
**Coverage:** MasterCalendarPage (all URL sub-states), StaffingCalendarPage (Month/Week), MobileIncidentExecution (as calendar consumer), Sprint calendar toggle.  
**Frontend Mandate:** Calendar is the **temporal substrate** used by CES, PM, Staffing, and MobileIncidentExecution. It must own the shared task/event card vocabulary.  
**Suggested Architecture:**
- `CalendarGrid`, `DayCell`, `EventChip`, `ShiftCard`, `TaskProjectionRow` promoted.
- Right-drawer / bottom-sheet detail pattern must be identical whether opened from Master Calendar, CES board, or Staffing calendar.
- **Handoff Contract to Agent 06 & Agent 12:** Urgency treatment and mobile sheet behavior must be identical.

**Agent 11 — Typography, Spacing & Hierarchy System**  
**Coverage:** Every text element across all 70+ views.  
**Frontend Mandate:** Own the locked scale from `design/TYPOGRAPHY_SCALE.md` turned into tokens. Kill all ad-hoc `text-[15px]`, `tracking-[0.22em]`, `leading-[1.1]`.  
**Suggested Architecture:**
- Semantic text tokens: `text-title`, `text-section`, `text-body`, `text-label`, `text-urgency`, `text-metadata`.
- Enforce via ESLint + visual regression that compares rendered sizes against the scale.

**Agent 12 — Mobile-First Responsive & Touch Interaction**  
**Coverage:** Every page at <768px, all bottom sheets, 44px targets, one-handed flows, safe-area handling.  
**Frontend Mandate:** Mobile is not "responsive degradation" — it is a first-class interaction model (bottom sheets over right drawers, FAB primary actions, etc.).  
**Suggested Architecture:**
- `BottomSheetDrawer` (already exists) becomes the default detail surface on mobile.
- All agents must implement mobile behavior using the shared `useIsMobile()` + `BottomSheet` contract rather than local `md:hidden` hacks.
- Touch target audit pass on every promoted primitive.

**Agent 13 — Accessibility (A11y) & Keyboard / Screen Reader Contract**  
**Coverage:** All pages + global nav + modals + drawers + data grids + forms.  
**Frontend Mandate:** WCAG 2.2 AA as baseline, AAA on critical compliance paths. Focus management, live regions for status changes, proper ARIA on every glass card and urgency indicator.  
**Suggested Architecture:**
- `ui/a11y/` primitives: `VisuallyHidden`, `LiveRegion`, `FocusTrap`, `SkipLink`.
- Every promoted component (KpiCard, TaskCard, Evidence row, etc.) must ship with correct roles and keyboard behavior by default.

**Agent 14 — Legacy Drift Migration & Deprecation**  
**Coverage:** All the old `.ci-premium-*`, `.glass-morphism`, inline styles, parallel CES/eCign/Journey themes, old DemoPage, GVGB surfaces, Hubstaff staging.  
**Frontend Mandate:** Own the `LEGACY_DEPRECATION_MATRIX.md` and the strangler migration that removes every violation without breaking production.  
**Suggested Architecture:**
- Create "migration components" that wrap legacy surfaces during transition.
- Every legacy file gets a tracked deprecation ticket with Agent 14 as owner.

**Agent 15 — Cross-Surface Consistency & Pattern Library**  
**Coverage:** The "glue" — ensures that a TaskCard on Dashboard looks and behaves like a TaskCard on Calendar, CES board, Evidence, PM approvals, MobileIncident, etc.  
**Frontend Mandate:** Own the **pattern library** (not just primitives). `TaskCard`, `StatusBadge`, `ActionRail`, `FilterBar`, `EmptyState`, `LoadingSkeleton` must be single implementations.  
**Suggested Architecture:**
- `patterns/` folder under `ui/` for compositions that multiple agents reuse.
- Cross-surface visual regression suite that renders the same pattern in 8 contexts and asserts pixel or perceptual equality.

**Agent 16 — Mockup Fidelity, Visual Regression & Release Gatekeeping**  
**Coverage:** Every surface that claims "done".  
**Frontend Mandate:** Own the screenshot harness, perceptual diff pipeline, and the final sign-off that a surface is truly "v2 contract complete" (not just code complete).  
**Suggested Architecture:**
- Unified capture protocol (`REFERENCE_CAPTURE_PROTOCOL.md`).
- Side-by-side + diff reports stored per agent per phase.
- The only agent allowed to flip the "Phase N Exit" bit in `PHASE1_READINESS_DASHBOARD.md` after adjacent agents have countersigned.

---

## 4. Cross-Agent Integration Contracts (The "Not Independent" Glue)

### 4.1 Primitive Promotion Ladder (All Agents Must Use)
1. Raw HTML/Tailwind → local component (allowed only in discovery)
2. Local component → `ui/` primitive (Agent 01/03/11 review)
3. Primitive → named composition (`DashboardKpiRow`, `EvidenceFileGrid`) (Agent 15 owns naming)
4. Composition → page pattern (documented in `SURFACE_CHECKLISTS/`)

No surface may skip the ladder after Phase 1.

### 4.2 Dependency DAG (Critical Path)

```
Agent 03 (Tokens) ──► Agent 01 (Glass/Layering) ──► Agent 02 (Inset) ──► Agent 04 (Shell Freeze)
                                    │
                                    ▼
Agent 05 (Dashboard Reference) ◄────┴──── Agent 15 (Patterns)
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
      Agent 06 (CES)          Agent 07 (Evidence)      Agent 08 (Policy)
            │                       │                       │
            └───────────┬───────────┴───────────┬───────────┘
                        ▼
                  Agent 10 (Calendar)
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
      Agent 09 (Journey)   Agent 12 (Mobile)   Agent 13 (A11y)
                        │
                        ▼
                  Agent 14 (Legacy Migration)
                        │
                        ▼
                  Agent 16 (Fidelity Gate) ← final sign-off
```

**Rule:** An agent may not claim Phase 2 completion until the upstream agents in its dependency chain have signed the handoff contract.

### 4.3 Shared Contracts (Explicit Files)

- `ui/index.ts` — single barrel for all promoted primitives (only Agent 15 + Agent 01 may edit without PR template)
- `tokens/tokens.json` + generator (Agent 03 owns)
- `primitives/CATALOG.md` (living) — every promoted component + its layer + owning agent
- `SURFACE_CHECKLISTS/` — one Markdown per major surface (Dashboard, Evidence, CES Board, Calendar, PolicyDetail, iAdministrator, OnboardingV2, etc.)
- `CROSS_SURFACE_PATTERN_MATRIX.md` (Agent 15) — shows which patterns are used on which 20+ surfaces

---

## 5. 4-Phase Coordinated Rollout (100% Coverage Guarantee)

**Phase 0 (Foundation — 5–7 days, parallel)**
- Agents 01, 02, 03, 04 complete token pipeline, glass primitive hardening, shell freeze, and inset contract.
- All baselines captured by Agent 16.
- `primitives/CATALOG.md` v1 published.
- **Gate:** No page changes yet. Only contracts + primitives + lint rules.

**Phase 1 (Reference Surfaces — 2–3 weeks)**
- Agent 05 delivers pixel-faithful Dashboard (the oracle).
- Agent 07 delivers Evidence Center as second reference.
- Agent 08 begins Policy surfaces using the new primitives.
- Agent 16 runs first cross-surface regression (Dashboard + Evidence + 3 other pages).
- **Gate:** Design Lead + Agent 05 + Agent 01 + Agent 16 all sign that visible 4-sided glass + token usage + layer model is real on the two reference surfaces.

**Phase 2 (High-Frequency Operational Surfaces — 3–4 weeks)**
- Agent 06 (CES + PM + MobileIncident all 5 stages)
- Agent 10 (Calendar + StaffingCalendar)
- Agent 09 (Onboarding V2 primary flows + V1 convergence)
- Agent 08 completes remaining Policy surfaces (Lifecycle, ACHC alignment, prints)
- Agent 13 (A11y pass on all Phase 1+2 surfaces)
- **Gate:** 70%+ of daily operator routes now pass Agent 16 fidelity gate + adjacent agent countersign.

**Phase 3 (Specialist, Admin, Legacy, Completion — 2–3 weeks)**
- Agent 09 finishes Journey V1/V2 unification
- Agent 11 typography scale enforcement across remaining surfaces
- Agent 14 executes strangler migration on Demo, Hubstaff, GVGB, old iAdmin internals, etc.
- Agent 12 mobile refinements on every remaining view
- Agent 16 final 100% regression sweep
- **Gate:** `PHASE1_EXIT_CHECKLIST.md` (updated) is 100% green. Every one of the 70+ views has a checklist entry with before/after + fidelity sign-off.

**Post-Phase 3:** Only maintenance + new feature surfaces (which must start at the primitive layer).

---

## 6. Task Assignment & Handoff Matrix (Actionable)

| Agent | Primary Owner | Key Files They Must Touch / Promote | Must Receive Handoff From | Must Give Handoff To | Phase 1 Exit Artifact |
|-------|---------------|-------------------------------------|---------------------------|----------------------|-----------------------|
| 01 | Glass/Layering | GlassPanel, SurfaceCard, layer prop system, nesting guard | 03 | 04, 05, 06, 07, 08, 09, 10 | Layering Violation Register + lint rule |
| 02 | Inset/Frame | ShellFrame, ShellContentFrame, inset tokens | 01, 03 | All surfaces | Constrained Frame test + visual proof |
| 03 | Tokens | tokens.json, generator, no-raw-value lint | — | 01, 11, all | Working generator + 0 raw values in new code |
| 04 | Shell | CommandCenterLayout, Nav, global overlays | 01, 02 | All pages | Shell frozen + "do not edit" doc |
| 05 | Dashboard | KpiCard, BoardColumn, TaskCard, Planner views | 01–04, 15 | 06, 10, 15 | Pixel-near v2 mock + pattern docs |
| 06 | CES/PM | CesGlassCard, KanbanBoard, MyTasks, Approvals, all 5 MobileIncident stages | 05, 10 | 10, 12 | CES board fidelity + mobile sheet parity |
| 07 | Evidence | Evidence primitives, capture sheets, detail drawer, ArtifactViewer | 01–04, 15 | 08, 10, 12 | Evidence as 2nd reference surface |
| 08 | Policy | PolicyCard, Tab system, LifecycleStepper, Appendix, Print | 07, 15 | 09, 13 | Policy surfaces using only promoted primitives |
| 09 | Journey/Onboarding | JourneyCard, ModulePlayer, OnboardingV2 pages | 08, 15 | 12, 13 | V2 surfaces + V1 convergence plan |
| 10 | Calendar | CalendarGrid, Event/Task cards, drawers/sheets | 05, 06, 15 | 06, 09, 12 | Shared task card + drawer contract |
| 11 | Typography | All text tokens + scale enforcement | 03 | All | 0 ad-hoc typography in Phase 1–2 surfaces |
| 12 | Mobile | BottomSheet system, touch targets, responsive rules | 05–10 | 13, 16 | Mobile regression on 8 key flows |
| 13 | A11y | Focus, ARIA, live regions on all promoted components | 01–12 | 16 | AA pass report + axe scan on references |
| 14 | Legacy | Deprecation matrix, migration wrappers | 04, 08, 09 | 16 | 60%+ legacy surface area migrated |
| 15 | Patterns | patterns/, CROSS_SURFACE_PATTERN_MATRIX | 05, 06, 07, 10 | All | Pattern library v1 + usage matrix |
| 16 | Fidelity | All screenshot harnesses, gates, sign-offs | Every agent | — | 100% coverage report + PHASE1_EXIT sign-off |

---

## 7. Immediate Next Actions (This Week)

1. **Kickoff Workshop (4 hours)** — All 16 agents (or their human proxies) + Design Lead + Tech Lead review this document and the Pinterest board together. Confirm visual contract.
2. **Contract Freeze** — Agent 01/02/03/04 publish the first version of the primitive + token + shell + layering contracts. No further changes without recorded decision.
3. **Dashboard as Oracle** — Agent 05 + 16 capture "before" of current Dashboard vs v2 mock. Agent 05 begins structural realignment (Phase 1 of their plan).
4. **Evidence Parallel Track** — Agent 07 begins the same "before" capture + primitive promotion for Evidence (highest ROI after Dashboard).
5. **Agent 15 stands up the Pattern Library** — Even before many primitives exist, the naming and composition taxonomy is defined so every other agent pulls in the same direction.

---

## 8. Risk Register (Coordinated View)

- **Risk:** Agents still work independently because the handoff contracts are not enforced in PR templates.  
  **Mitigation:** Add a mandatory "Adjacent Agent Sign-off" section to every surface PR template after Phase 0.
- **Risk:** Mobile and A11y are deprioritized until the end (classic trap).  
  **Mitigation:** Agent 12 and 13 are required countersigners on Agent 05 and Agent 07 Phase 1 exits.
- **Risk:** iAdministrator and DemoPage (high internal complexity) become the permanent exception.  
  **Mitigation:** Agent 14 owns a dedicated "complex surface exception process" — they must still obey layering and tokens, even if some internal panels stay custom.
- **Risk:** Print surfaces drift because they are outside the shell.  
  **Mitigation:** Agent 08 owns a "print-only" sub-system that still uses the typography and spacing tokens.

---

**This document is the single source of truth for the 16-agent coordinated frontend reconstruction.**

Every future 4-phase plan update from any agent must reference the interface contracts and dependency DAG defined here. The Pinterest visual language is now operationalized into concrete component ownership and handoff rules.

**Next deliverable:** Updated `PHASE1_EXIT_CHECKLIST.md` that lists every one of the 70+ views with the exact agent responsible and the required fidelity artifact.

---

*Prepared under the 16-Agent Coordinated Review model — deep integration, zero siloed optimization.*