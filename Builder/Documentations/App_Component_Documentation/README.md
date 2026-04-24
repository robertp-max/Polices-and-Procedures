# Application Component Documentation Package

This package is a code-verified, component-level reference for the Care Indeed application in this repository.

## Files

1. `Component_Registry.md`
   - Exhaustive registry of pages, components, layouts, modules, stores, services, generated files, utilities, and backend IA modules.
2. `Page_and_Route_Map.md`
   - Complete route map and navigation hierarchy for frontend app routing and backend API route surfaces.
3. `Component_Detail_Docs.md`
   - Deep component/module narratives for the primary product surfaces and operational systems.
4. `Data_Model_and_Files.md`
   - Data contracts, generated/static datasets, relationships, and storage/loading behavior.
5. `Brad_System_Architecture.md`
   - UI-to-backend request flow, retrieval/generation guardrails, and limitations of Brad iAdministrator.
6. `Print_System_Architecture.md`
   - Policy/form/appendix print rendering architecture, CSS enforcement, and output constraints.
7. `Workflow_and_Events_System.md`
   - Workflow library, mandated events, execution state, and compliance integration behavior.
8. `Integration_Map.md`
   - Cross-system dependency map and text diagrams.
9. `Developer_Maintenance_Guide.md`
   - Operational guidance for safely adding/changing components, data, print flows, and Brad behavior.
10. `README.md`
    - Master index and scan methodology for this package.
11. `aws-phase1-component-mapping.md` *(Added 2026-04-23)*
    - Full component-to-AWS-service mapping table, implementation priority list, gap analysis, and dependency graph for AWS Phase 1 backend planning.

## Method

- Source scanned: `src`, `server`, `scripts`, and relevant `Builder` artifacts.
- Routes verified from `src/App.tsx`, nested route apps, and `server/index.ts` router mounts.
- Data model references verified from type contracts and store/data loader modules.
- Ambiguities are intentionally marked as `Needs confirmation` instead of inferred.

---

## 2026-04-23 Full App Sweep Update

### Scope covered in this refresh

- Full sweep executed across `src`, `server`, `scripts`, `Builder`, `Builder/Policies`, `Builder/Forns`, `Builder/Policies/Workflows`, and `Builder/Documentations`.
- Route authority re-validated in `src/App.tsx`; backend mounts re-validated in `server/index.ts`.
- Existing docs were updated in place; no existing sections were removed.

### Onboarding status clarification

- The onboarding system is implemented and active under `src/policy/journey/*`.
- It is not missing. This refresh documents it as an existing operational module and identifies only true gaps.
- Key routed onboarding surfaces:
  - `/journey`
  - `/journey/appendix-f`
  - `/journey/module/:moduleId`
  - `/journey/supervisor`
  - `/journey/admin`
  - `/journey/guide`

### Where onboarding is now documented in this package

- `Component_Registry.md` (formal onboarding component/module registry and AWS planning implications)
- `Page_and_Route_Map.md` (onboarding route family and role-based navigation flow)
- `Component_Detail_Docs.md` (system-level onboarding behavior and hard-stop gates)
- `Data_Model_and_Files.md` (journey data contracts, persistence, and evidence/sign-off structures)
- `Workflow_and_Events_System.md` (onboarding annual training/drill linkage and compliance relationship)
- `Integration_Map.md` (onboarding integration and backend target architecture map)
- `Developer_Maintenance_Guide.md` (maintenance guardrails and AWS migration checklist)

### Evidence-based gap framing used in this update

1. Existing implemented functionality (UI/store/script/server behavior in repo)
2. Documentation gaps (clarity/traceability gaps in docs)
3. Backend/AWS Phase 1 gaps (not yet implemented in runtime code)
4. Future Phase 2 enhancements (not required for current release baseline)

---

## 2026-04-23 Update — Universal Navigation Controls + AWS Phase 1 Mapping

### Universal Navigation Controls (Implemented)

- `navStore` (`src/policy/stores/navStore.ts`): Centralized back/forward navigation stack — implemented.
- `navExclusions` (`src/policy/utils/navExclusions.ts`): Route exclusion patterns + active-input guard — implemented.
- `UniversalNavControls` (`src/policy/components/UniversalNavControls.tsx`): Back/Forward buttons in shell header — implemented.
- Keyboard: `ArrowLeft` = Back, `ArrowRight` = Forward (eligible routes only).
- Swipe: right = Back, left = Forward (eligible routes only, ≥60px horizontal delta).
- Excluded routes: `/library/:policyId`, `/gv-policy/:policyId`, `/forms/:formId`, `/forms/:formId/print`, `/print/*`, `/drafts/:policyId`, `/brad-proposal`.
- Disabled during active input focus and while hamburger menu is open.
- Full navigation route exclusion map added to `Page_and_Route_Map.md`.
- Maintenance guide added to `Developer_Maintenance_Guide.md`.

### AWS Phase 1 Component Mapping (Documentation Only — All Components NOT STARTED)

- New file: `aws-phase1-component-mapping.md` — full mapping table, dependency graph, gap analysis, implementation priority list.
- `Component_Registry.md` — extended with section O (nav controls).
- `Data_Model_and_Files.md` — extended with AWS Phase 1 current vs target data domain mapping.
- `Workflow_and_Events_System.md` — extended with AWS Phase 1 workflow system mapping table.
- `Integration_Map.md` — extended with full Phase 1 target integration diagram.
- `Developer_Maintenance_Guide.md` — extended with nav controls maintenance guide and Phase 1 priority notes.
