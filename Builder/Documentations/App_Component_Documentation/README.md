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

## Method

- Source scanned: `src`, `server`, `scripts`, and relevant `Builder` artifacts.
- Routes verified from `src/App.tsx`, nested route apps, and `server/index.ts` router mounts.
- Data model references verified from type contracts and store/data loader modules.
- Ambiguities are intentionally marked as `Needs confirmation` instead of inferred.

