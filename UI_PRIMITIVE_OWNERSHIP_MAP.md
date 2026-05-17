# UI Primitive Ownership Map (Phase 1 Lock)

## Purpose

Define canonical primitive ownership, allowed usage, and reconstruction priorities for operational UI architecture.

---

## 1. Canonical Primitive Domains

## Shell Primitives (new canonical ownership set)

- `ShellSurface`
- `ShellTopbar`
- `ShellNavPrimary`
- `ShellSubnav`
- `ShellCommandRail`
- `ShellContentFrame`
- `ShellMobileCommandBar`

Owner: UI Architecture / Design System

---

## 2. Existing Shared UI Primitives (`src/policy/components/ui`)

Current reusable primitives include:
- `ActionButton`
- `SurfaceCard`
- `GlassPanel`
- `Tabs`
- `LoadingState`
- `EmptyState`
- `BottomSheetDrawer`
- `RightDrawer`
- `CiStatusBadge`
- `PageHeader`
- `SectionHeader`
- `SearchField`
- `StalenessBanner`
- `AriaLiveRegion`
- `ThemeModeToggle`

Owner: Design System + Frontend Platform  
Directive: these become canonical baseline; route-local equivalents are deprecated.

---

## 3. Primitive Adoption Rules

Required for reconstructed surfaces:
- Dashboard/Evidence/Audit/Calendar/MyTasks must compose from canonical primitives.
- Route-local handcrafted components may remain only where no primitive exists yet.
- New primitive creation requires design-system approval and ownership assignment.

Disallowed:
- creating duplicate button/card/status/tab variants in page folders
- inventing route-local drawer/sheet systems
- local status color logic that bypasses semantic primitives

---

## 4. Ownership by Surface (Target Reconstruction)

- `CommandCenterLayout`: Shell primitive domain owner
- `DashboardPage`: command narrative + KPI + board primitives
- `EvidenceCenterPage`: evidence command bar + table/list density primitives
- `AuditModePage`: readiness strip + filter rail primitives
- `MasterCalendarPage`: timeline header + command cluster primitives
- `MyTasksPage`: task list card + filter rail primitives

Shared owner matrix:
- Design System: primitive API + visual behavior
- Frontend Platform: implementation quality + reuse enforcement
- Surface team: orchestration using primitives only

---

## 5. Rebuild vs Refine Classification

Rebuild now:
- shell/navigation primitives
- command rail primitives
- standardized status/urgency primitives
- canonical header + section composition primitives

Refine later:
- tertiary copy components
- low-priority utility wrappers

Do not rebuild:
- backend-bound workflow engines
- task identity/evidence architecture internals

---

## 6. Primitive Gap Backlog (Phase 1 Definition)

Missing or underdefined canonical primitives to define before Phase 2 implementation:
- `CommandStrip` (standardized command zone layout)
- `OperationalKpiTile` (uniform KPI semantics)
- `StatusPill` (semantic state display with accessibility contract)
- `ResponsiveStack` (breakpoint-aware section orchestration helper)
- `SurfaceFrame` (enforces constrained page-view contract)

---

## 7. Enforcement + Governance

PR requirements on target surfaces:
- primitive usage list included
- any local UI structure justified with deprecation plan
- no duplicate primitive pattern introduced

Metrics:
- primitive adoption % per target surface
- duplicate component count trend
- route-local UI overrides count trend

---

## 8. Exit Criteria (Phase 1 Primitive Lock)

- ownership map approved
- shell primitive set finalized
- gap backlog prioritized
- adoption rules activated for Phase 2 execution
- deprecation targets listed for local handcrafted variants
