# V6 Design Reconciliation Report

This report reconciles the current implementation of all 54 routes in the V6 platform with their visual design references (Gemini Canvas PNGs and detailed captions).

## 1. Route Reconciliation Registry

| Route | Hash ID | Component | Status | PNG Ref | Caption Ref | Design Status | Recommended Action | Priority |
|---|---|---|---|---|---|---|---|---|
| `/dashboard` | `dashboard` | `DashboardScreen (inline)` | **implemented** | 16-dashboard.png | 02-dashboard.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/clinicians` | `clinicians` | `ProfileListScreen (inline)` | **implemented** | 15-clinicians.png | 11-profiles-clinician-patient.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/clinicians/:clinicianId` | `clinician-detail` | `ClinicianDetailScreen (inline)` | **implemented** | 14-clinician-detail.png | 11-profiles-clinician-patient.md | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/patients` | `patients` | `ProfileListScreen (inline)` | **implemented** | 43-patients.png | 11-profiles-clinician-patient.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/patients/:patientId` | `patient-detail` | `PatientDetailScreen (inline)` | **implemented** | 42-patient-detail.png | 11-profiles-clinician-patient.md | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/calendar` | `master-calendar` | `CalendarScreen (inline)` | **implemented** | 30-master-calendar.png | 12-calendars.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/staffing-calendar` | `staffing-calendar` | `CalendarScreen (inline)` | **implemented** | 48-staffing-calendar.png | 12-calendars.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/iadministrator` | `brad` | `BradScreen (inline)` | **implemented** | 10-brad.png | 14-iadministrator-brad.md | **MATCHED_REFERENCE** | Align sidebar label (Brad -> iAdministrator); safe for seeding. | P2 |
| `/ces/calendar` | `ces-calendar` | `CalendarScreen (inline)` | **implemented** | 12-ces-calendar.png | 12-calendars.md | **MATCHED_REFERENCE** | Consider merging calendar views or keep separate under compliance; safe for seeding. | P2 |
| `/ces/board` | `ces-board` | `BoardScreen (inline)` | **implemented** | 11-ces-board.png | 03-ces-kanban-board.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/ces/events` | `events-board` | `EventsBoardScreen (imported)` | **implemented** | none | none | **GENERIC_IMPLEMENTATION_ONLY** | Create Gemini Canvas design reference to refine specific Event Board card designs; defer seeding. | P1 |
| `/workflows` | `workflows` | `WorkflowsScreen (imported)` | **implemented** | 54-workflows.png | workflows.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/workflows/:workflowId/swimlane` | `workflow-swimlane` | `WorkflowSwimlaneScreen (inline)` | **implemented** | 53-workflow-swimlane.png | workflow-swimlane.md | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/compliance/master-controls` | `master-controls` | `MasterControlsScreen (imported)` | **implemented** | 31-master-controls.png | master-controls.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/audit` | `audit-mode` | `EvidenceScreen (inline)` | **implemented** | 09-audit-mode.png | 05-evidence-audit.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/evidence` | `evidence-center` | `EvidenceScreen (inline)` | **implemented** | 19-evidence-center.png | 05-evidence-audit.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/ces/reports` | `ces-reports` | `ReportsScreen (inline)` | **implemented** | 13-ces-reports.png | 16-reports-governance.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/calendar/event/:eventId/task/:taskId` | `mobile-incident` | `MobileIncidentScreen (imported)` | **implemented** | 32-mobile-incident.png | none | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/my-tasks` | `my-tasks` | `MyTasksScreen (imported)` | **implemented** | 35-my-tasks.png | my-tasks.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/framework` | `framework` | `FrameworkScreen (imported)` | **implemented** | 22-framework.png | 13-framework-achc.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/framework/achc-survey` | `achc-survey` | `AchcScreen (inline)` | **implemented** | 02-achc-survey.png | 13-framework-achc.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/framework/achc-survey/crosswalk` | `achc-crosswalk` | `AchcScreen (inline)` | **implemented** | 01-achc-crosswalk.png | 13-framework-achc.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/library` | `policy-library` | `PolicyMatrixScreen (inline)` | **implemented** | 45-policy-library.png | 09-policy-library-viewer.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/library/:policyId` | `policy-detail` | `PolicyDetailScreen (imported)` | **implemented** | 44-policy-detail.png | 09-policy-library-viewer.md | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/forms` | `forms-library` | `FormsLibraryScreen (imported)` | **implemented** | 21-forms-library.png | 10-forms-ecign.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/forms/:formId` | `form-viewer` | `FormWorkspaceScreen (inline)` | **implemented** | 20-form-viewer.png | 10-forms-ecign.md | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/forms/:formId/esign` | `ecign-workspace` | `EcignWorkspaceScreen (imported)` | **implemented** | 18-ecign-workspace.png | 10-forms-ecign.md | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/artifacts/:artifactId` | `artifact-viewer` | `ArtifactViewerScreen (inline)` | **implemented** | 08-artifact-viewer.png | none | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/viewer/:referenceId` | `generic-reference` | `GenericReferenceScreen (imported)` | **implemented** | 23-generic-reference.png | none | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/journey` | `journey-overview` | `JourneyOverviewScreen (imported)` | **implemented** | 28-journey-overview.png | 07-journey.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/journey/v1-journey` | `journey-v1` | `JourneyV1Screen (imported)` | **implemented** | 29-journey-v1.png | 07-journey.md | **MATCHED_REFERENCE** | Merge candidate with journey-overview or keep for legacy compatibility; safe for seeding. | P2 |
| `/journey/module/:moduleId` | `module-player` | `ModulePlayerScreen (imported)` | **implemented** | 34-module-player.png | 07-journey.md | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/journey/appendix-f` | `appendix-f` | `AppendixFScreen (imported)` | **implemented** | 07-appendix-f.png | none | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/journey/supervisor` | `supervisor` | `SupervisorScreen (imported)` | **implemented** | 49-supervisor.png | 07-journey.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/journey/admin` | `journey-admin` | `JourneyAdminScreen (imported)` | **implemented** | 27-journey-admin.png | 07-journey.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/journey/guide` | `user-guide` | `DocsScreen (inline)` | **implemented** | 52-user-guide.png | none | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/onboarding-v2/dashboard` | `onboarding-v2-dashboard` | `OnboardingV2DashboardScreen (imported)` | **implemented** | 40-onboarding-v2-dashboard.png | 06-onboarding-v2.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/onboarding-v2/activate` | `onboarding-v2-activate` | `OnboardingV2ActivateScreen (imported)` | **implemented** | 36-onboarding-v2-activate.png | 06-onboarding-v2.md | **MATCHED_REFERENCE** | Hide from sidebar navigation (access via button); safe for seeding. | P2 |
| `/onboarding-v2/batches` | `onboarding-v2-batches` | `OnboardingV2BatchesScreen (imported)` | **implemented** | 39-onboarding-v2-batches.png | 06-onboarding-v2.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/onboarding-v2/batches/:batchId` | `onboarding-v2-batch` | `OnboardingV2BatchScreen (imported)` | **implemented** | 38-onboarding-v2-batch.png | 06-onboarding-v2.md | **MATCHED_REFERENCE** | Hide from sidebar navigation; safe for seeding. | P2 |
| `/onboarding-v2/audit` | `onboarding-v2-audit` | `OnboardingV2AuditScreen (imported)` | **implemented** | 37-onboarding-v2-audit.png | 06-onboarding-v2.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/onboarding-v2/governance` | `onboarding-v2-governance` | `OnboardingV2GovernanceScreen (imported)` | **implemented** | 41-onboarding-v2-governance.png | 06-onboarding-v2.md | **MATCHED_REFERENCE** | Safe for seeding. Verify 'Onboarding Overrides' display label. | P2 |
| `/policy-lifecycle` | `policy-lifecycle` | `PolicyLifecycleScreen (imported)` | **implemented** | 46-policy-lifecycle.png | none | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/hubstaff` | `hubstaff` | `HubstaffScreen (imported)` | **implemented** | 26-hubstaff.png | none | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/system-documentation/:sectionId` | `system-docs` | `SystemDocsScreen (imported)` | **implemented** | 51-system-docs.png | none | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/help/*` | `help-center` | `HelpCenterScreen (imported)` | **implemented** | 25-help-center.png | none | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/governance` | `governance` | `GovernanceScreen (imported)` | **implemented** | 24-governance.png | 16-reports-governance.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/admin/user-groups` | `admin-groups` | `AdminGroupsScreen (imported)` | **implemented** | 03-admin-groups.png | 08-admin-roles-permissions.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/admin/roles` | `admin-roles` | `AdminRolesScreen (imported)` | **implemented** | 05-admin-roles.png | 08-admin-roles-permissions.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/admin/permissions` | `admin-permissions` | `AdminPermissionsScreen (imported)` | **implemented** | 04-admin-permissions.png | 08-admin-roles-permissions.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/admin/users` | `admin-users` | `AdminUsersScreen (imported)` | **implemented** | 06-admin-users.png | 08-admin-roles-permissions.md | **MATCHED_REFERENCE** | Safe for seeding. | P2 |
| `/surveyor/policy/:policyId` | `surveyor-viewer` | `SurveyorViewerScreen (imported)` | **implemented** | 50-surveyor-viewer.png | none | **MATCHED_REFERENCE** | Hide from sidebar navigation (surveyor-only view); safe for seeding. | P2 |
| `/policy-lifecycle/:policyId` | `policy-lifecycle-detail` | `PolicyLifecycleDetailScreen (imported)` | **implemented** | none | none | **GENERIC_IMPLEMENTATION_ONLY** | Create Gemini Canvas design reference to refine specific Policy Lifecycle Detail metrics/timeline; defer seeding. | P1 |
| `/login` | `login-page` | `LoginScreen (imported)` | **implemented** | none | none | **MATCHED_REFERENCE** | Hide from sidebar navigation (rendered outside shell); safe for seeding. | P2 |

## 2. Navigation & Sidebar Reconciliation

### Current Sidebar Grouping
The left sidebar currently displays all 53 active shell routes grouped into 11 sections in [routePresentation.ts](file:///c:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/routing/routePresentation.ts). This matches the visual inventory checklist but includes several subpages, detail screens, and transactional forms that should not be visible as top-level navigation items.

### Expected Live-App Grouping (Navigation Restructuring)
To prevent navigation clutter and improve user experience, the following **14 subpages and detail views should be hidden/excluded** from the main sidebar and accessed only contextually via user actions (such as table row clicks or button triggers):

1. `/clinicians/:clinicianId` (`clinician-detail`) - Entry: Clinician Roster row click.
2. `/patients/:patientId` (`patient-detail`) - Entry: Patient Roster row click.
3. `/workflows/:workflowId/swimlane` (`workflow-swimlane`) - Entry: Workflows Library drill-down.
4. `/calendar/event/:eventId/task/:taskId` (`mobile-incident`) - Entry: Direct notification or calendar task click.
5. `/library/:policyId` (`policy-detail`) - Entry: Policy Library row click.
6. `/forms/:formId` (`form-viewer`) - Entry: Forms Library row click.
7. `/forms/:formId/esign` (`ecign-workspace`) - Entry: Form Viewer signing trigger.
8. `/artifacts/:artifactId` (`artifact-viewer`) - Entry: Links in Policy Detail or Evidence list.
9. `/viewer/:referenceId` (`generic-reference`) - Entry: ACHC Crosswalk citation click.
10. `/journey/module/:moduleId` (`module-player`) - Entry: Onboarding timeline node click.
11. `/onboarding-v2/activate` (`onboarding-v2-activate`) - Entry: 'Activate Subject' action button on Onboarding Dashboard.
12. `/onboarding-v2/batches/:batchId` (`onboarding-v2-batch`) - Entry: Batches list row click.
13. `/surveyor/policy/:policyId` (`surveyor-viewer`) - Entry: Read-only external link for surveyors.
14. `/policy-lifecycle/:policyId` (`policy-lifecycle-detail`) - Entry: Policy Lifecycle board card click.

### Missing Routes
There are **no missing routes**. All 54 routes registered in the router are accounted for in the system.

### Duplicate Nav Destinations & Overlaps
- **Multiple Calendars**: The app has `/calendar` (Master Operations), `/staffing-calendar` (Staffing), and `/ces/calendar` (CES Compliance). These are technically separate but have overlapping calendar month grid interfaces. Recommended next action: standardise calendar rendering or consolidate under a single Calendar hub with tab filters.
- **Legacy vs. V2 Journeys**: We have legacy `/journey` (Onboarding overview/v1) and `/onboarding-v2/` (Batches/Gates). Onboarding v2 is the new active activation engine. The older journeys could be merged or deprecated once onboarding v2 is fully operational.

### Mismatched Labels
- `/onboarding-v2/governance` is labeled `Onboarding Governance` in navigation, but should be labeled `Onboarding Overrides` to avoid confusion with the main `/governance` (System Governance Center).
- `/iadministrator` is labeled `Brad` in sidebar but `iAdministrator` in title header.

---

## 3. Summary & Recommended Action Plan

### List of Routes that need Gemini Canvas Design
These routes lack an official visual mock-up and were implemented as inferred/generic models. They should receive a formal Canvas design to refine layouts before logic reconnection:
1. `/ces/events` (`events-board`) - Inherits a generic 4-column kanban board layout. Needs custom event card design.
2. `/policy-lifecycle/:policyId` (`policy-lifecycle-detail`) - Uses a generic lifecycle view. Needs a specific design for timeline revision auditing.

### List of Routes Safe for Seeding Now
All **51 routes** that map exactly to a reference PNG file and caption are safe for seeding. These components use specific tables, metrics, and cards mapped directly from the prototype designs.

### List of Routes that should WAIT until Design is Created
1. `/ces/events` (`events-board`) - Wait for custom cards and columns layout alignment.
2. `/policy-lifecycle/:policyId` (`policy-lifecycle-detail`) - Wait for specific audit log timeline layout alignment.

### List of Duplicate / Merge Candidates
1. `/journey/v1-journey` (`journey-v1`) - Duplicate/older curriculum track, merge with `/journey` (Journey Overview).
2. `/ces/calendar` (`ces-calendar`) - Overlaps with `/calendar` (Master Operations Calendar). Re-evaluate if they can be unified.

### Recommendation for the Next Phase
1. **Reconcile Sidebar Navigation**: Remove the 14 subpages and detail pages from the sidebar list. Retain only primary directories to match production-grade user experience.
2. **Produce Missing Canvas Designs**: Create formal visual specs for the Event Board (`events-board`) and Policy Lifecycle Detail (`policy-lifecycle-detail`) views.
3. **Begin Seed Data Integration**: Seed the 51 safe routes with robust, typed mock records mapping directly to the data contracts in `V6_PAGEVIEW_INVENTORY.md`.