# Complete Tagged List of Page Views

**Source of truth:** `src/policy/security/identity/pageRegistry.ts` (COMPONENT_GROUPS + PAGE_REGISTRY)

This document consolidates the full inventory of page views across the application, tagged by their system:

- **[PAGE_REGISTRY]** — Controllable via the Page View Access matrix (the admin tool for Marites/Robert)
- **[FEATURE]** — Gated via FeatureRouteGuard / feature catalog
- **[ROUTE]** — Defined as a React Router `<Route>` in `src/App.tsx`
- **[NAV]** — Appears in the main sidebar / mobile navigation (CommandCenterLayout)

Generated from code inspection on 2026-06-10.

---

## Component Groups (the 11 modules in the Page View Access matrix)

| componentId            | Label                              | Default | Order |
|------------------------|------------------------------------|---------|-------|
| cmp-dashboard          | Dashboard / Command Center         | read    | 10    |
| cmp-policy-library     | Policy Library                     | read    | 20    |
| cmp-forms              | Forms                              | read    | 30    |
| cmp-ces                | CES / Compliance Execution         | read    | 40    |
| cmp-calendar           | Calendar                           | read    | 50    |
| cmp-evidence           | Evidence Center                    | read    | 60    |
| cmp-audit              | Audit Mode                         | read    | 70    |
| cmp-journey            | Journey / Training                 | read    | 80    |
| cmp-staffing           | Staffing / Clinical                | read    | 90    |
| cmp-iadministrator     | iAdministrator                     | read    | 100   |
| cmp-user-management    | User Management / Identity Admin   | none    | 110   |
| cmp-system             | System / Settings                  | read    | 120   |

---

## Page Views Master Table — [PAGE_REGISTRY] entries (with cross-tags)

| pageId                  | Label                          | Route Pattern                     | Component Group       | Default Access | Fallback Feature           | Tags                                      | Nav Presence          |
|-------------------------|--------------------------------|-----------------------------------|-----------------------|----------------|----------------------------|-------------------------------------------|-----------------------|
| page.dashboard          | Dashboard                      | /dashboard                        | cmp-dashboard         | read           | dashboard.view             | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Primary)        |
| page.library            | Policy Library                 | /library                          | cmp-policy-library    | read           | policyLibrary.view         | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (via Taxonomy)   |
| page.policy-detail      | Policy Detail                  | /library/:policyId                | cmp-policy-library    | read           | policyLibrary.view         | [PAGE_REGISTRY] [FEATURE] [ROUTE]         | Detail only          |
| page.policy-lifecycle   | Policy Lifecycle               | /policy-lifecycle                 | cmp-policy-library    | read           | policyLifecycle.view       | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.framework          | Framework                      | /framework                        | cmp-policy-library    | read           | frameworkTaxonomy.view     | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (via Taxonomy)   |
| page.taxonomy           | Taxonomy                       | /taxonomy                         | cmp-policy-library    | read           | frameworkTaxonomy.view     | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.achc-survey        | ACHC Survey Alignment          | /framework/achc-survey            | cmp-policy-library    | read           | surveyor.view              | [PAGE_REGISTRY] [FEATURE] [ROUTE]         | No                   |
| page.forms              | Forms Library                  | /forms                            | cmp-forms             | read           | forms.view                 | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (via Taxonomy)   |
| page.form-viewer        | Form Viewer / Sign             | /forms/:formId                    | cmp-forms             | read           | ecign.view                 | [PAGE_REGISTRY] [FEATURE] [ROUTE]         | Detail only          |
| page.ces-calendar       | CES Calendar                   | /ces/calendar                     | cmp-ces               | read           | ces.view                   | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (CES sub)        |
| page.ces-board          | CES Sprint Board               | /ces/board                        | cmp-ces               | read           | ces.view                   | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (CES sub)        |
| page.ces-workloads      | CES Workloads                  | /ces/workloads                    | cmp-ces               | read           | ces.view                   | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (CES sub)        |
| page.ces-reports        | CES Reports                    | /ces/reports                      | cmp-ces               | read           | ces.view                   | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (CES sub)        |
| page.my-tasks           | My Tasks                       | /my-tasks                         | cmp-ces               | read           | pmTasks.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct + Mobile)|
| page.workflows          | Workflows Library              | /workflows                        | cmp-ces               | read           | workflows.view             | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (CES sub)        |
| page.master-controls    | Master Control Inventory       | /compliance/master-controls       | cmp-ces               | read           | masterControlInventory.view| [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (CES sub)        |
| page.pm-tasks           | PM — My Tasks                  | /pm/my-tasks                      | cmp-ces               | read           | pmTasks.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (PM nav)         |
| page.pm-sprint-plan     | PM — Sprint Plan               | /pm/sprint-plan                   | cmp-ces               | read           | pmTasks.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (PM nav)         |
| page.pm-sprint-review   | PM — Sprint Review             | /pm/sprint-review                 | cmp-ces               | read           | pmTasks.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (PM nav)         |
| page.pm-approvals       | PM — Approvals                 | /pm/approvals                     | cmp-ces               | read           | pmTasks.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (PM nav)         |
| page.pm-dashboard       | PM — Dashboard                 | /pm/dashboard                     | cmp-ces               | read           | pmTasks.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (PM nav)         |
| page.calendar           | Master Calendar                | /calendar                         | cmp-calendar          | read           | calendar.view              | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Mobile + indirect) |
| page.evidence           | Evidence Center                | /evidence                         | cmp-evidence          | read           | evidence.view              | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct + CES)   |
| page.audit              | Audit Mode                     | /audit                            | cmp-audit             | read           | audit.view                 | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (CES sub)        |
| page.journey-home       | Journey Home                   | /journey                          | cmp-journey           | read           | journey.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.journey-v1         | Journey v1                     | /journey/v1-journey               | cmp-journey           | read           | journey.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Onboarding sub) |
| page.journey-appendix-f | Journey — Appendix F           | /journey/appendix-f               | cmp-journey           | read           | journey.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Onboarding sub) |
| page.journey-module     | Journey Module Player          | /journey/module/:moduleId         | cmp-journey           | read           | journey.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE]         | Detail only          |
| page.journey-supervisor | Journey Supervisor View        | /journey/supervisor               | cmp-journey           | read           | journey.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Onboarding sub) |
| page.journey-admin      | Journey Admin                  | /journey/admin                    | cmp-journey           | read           | journey.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Onboarding sub) |
| page.journey-guide      | Journey User Guide             | /journey/guide                    | cmp-journey           | read           | journey.view               | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Onboarding sub) |
| page.onboarding-v2      | Onboarding v2                  | /onboarding-v2                    | cmp-journey           | read           | onboardingV2.view          | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.clinicians         | Clinician Profiles             | /clinicians                       | cmp-staffing          | read           | clinicians.view            | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.clinician-detail   | Clinician Detail               | /clinicians/:clinicianId          | cmp-staffing          | read           | clinicians.view            | [PAGE_REGISTRY] [FEATURE] [ROUTE]         | Detail only          |
| page.patients           | Patient Profiles               | /patients                         | cmp-staffing          | read           | patients.view              | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.patient-detail     | Patient Detail               | /patients/:patientId              | cmp-staffing          | read           | patients.view              | [PAGE_REGISTRY] [FEATURE] [ROUTE]         | Detail only          |
| page.staffing-calendar  | Staffing Calendar              | /staffing-calendar                | cmp-staffing          | read           | staffing.calendar.view     | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.iadministrator     | iAdministrator (Brad)          | /iadministrator                   | cmp-iadministrator    | read           | brad.view                  | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.user-assignments   | User Assignments               | /admin/users                      | cmp-user-management   | none           | admin.users.view           | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Admin sub)      |
| page.user-groups        | User Groups                    | /admin/user-groups                | cmp-user-management   | none           | admin.userGroups.view      | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Admin sub)      |
| page.admin-roles        | Roles                          | /admin/roles                      | cmp-user-management   | none           | admin.roles.view           | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Admin sub)      |
| page.admin-permissions  | Permissions                    | /admin/permissions                | cmp-user-management   | none           | admin.permissions.view     | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Admin sub)      |
| page.page-access        | Page View Access               | /admin/users#page-access          | cmp-user-management   | none           | (none)                     | [PAGE_REGISTRY] [ROUTE]                   | Admin only           |
| page.help-center        | Help Center                    | /help                             | cmp-system            | read           | helpCenter.view            | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.system-documentation | System Documentation         | /system-documentation             | cmp-system            | read           | systemDocumentation.view   | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct + subs)  |
| page.demo               | Demo Page                      | /demo                             | cmp-system            | read           | demo.view                  | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |
| page.hubstaff           | Hubstaff Staging               | /hubstaff                         | cmp-system            | read           | hubstaff.view              | [PAGE_REGISTRY] [FEATURE] [ROUTE] [NAV]   | Yes (Direct)         |

---

## Additional Surfaces (Not individually registered in [PAGE_REGISTRY])

These routes/features exist but are not separately controllable in the Page View Access matrix (they inherit from parents).

| Key / Identifier                  | Label                              | Route Pattern                          | Feature ID                    | Tags                              | Nav Presence             | Notes |
|-----------------------------------|------------------------------------|----------------------------------------|-------------------------------|-----------------------------------|--------------------------|-------|
| mobileIncidentExecution.view      | Mobile Incident Execution (all states) | /calendar/event/:eventId/*            | mobileIncidentExecution.view  | [FEATURE] [ROUTE]                 | Partial (via /calendar)  | Multiple sub-stages |
| bradProposal.view                 | Brad Proposal                      | /brad-proposal                         | bradProposal.view             | [FEATURE] [ROUTE]                 | No (hidden)              | Executive-only |
| governance                        | Governance Page                    | /governance                            | (RoleGate)                    | [ROUTE]                           | No                       | RoleGate only |
| artifacts / viewer                | Artifact & Generic Viewers         | /artifacts/:id, /viewer/:ref, /events/:, /tasks/: | —                    | [ROUTE]                           | No                       | Detail viewers |
| print                             | Print Views                        | /print/* , /forms/:id/print , /surveyor/policy/:id | —                    | [ROUTE]                           | No                       | Standalone (outside shell) |
| ui-staging*                       | Visual Lab / Staging               | /ui-staging*                           | —                             | [ROUTE]                           | No                       | Dev/staging only |
| onboarding-v2/* (nested)          | Onboarding v2 children             | /onboarding-v2/*                       | onboardingV2.view             | [FEATURE] [ROUTE]                 | Yes (parent)             | Covered by page.onboarding-v2 |
| journey/staging/m01               | Staging M01 (env-gated)            | /journey/staging/m01                   | journey.view                  | [FEATURE] [ROUTE]                 | Conditional              | VITE_STAGING_M01 only |
| admin redirects                   | Admin alias redirects              | /admin , /security/identity/*          | various admin.*               | [ROUTE]                           | N/A                      | Redirects only |

---

**Legend**

- **[PAGE_REGISTRY]** = Can be toggled per-user in the Page View Access matrix (`/admin/users` → Page View Access tab)
- **[FEATURE]** = Controlled by role/feature permissions in `src/policy/security/features/catalog.ts`
- **[ROUTE]** = Actual React Router definition in `src/App.tsx`
- **[NAV]** = Visible in the Command Center sidebar or mobile tabs

**Notes**
- Most detail/sub-routes (e.g. `/library/:policyId`, `/forms/:formId`, `/journey/module/:moduleId`, all `/calendar/event/*`) inherit access from their parent page.
- User Management pages default to `none` (must be explicitly granted).
- The real matrix UI and guards live in `src/policy/security/identity/PageAccessMatrix.tsx`, `pageAccess.ts`, `PageAccessRouteGuard.tsx`, and `pageRegistry.ts`.

---

**How this table was generated**
- Extracted directly from `src/policy/security/identity/pageRegistry.ts`
- Cross-referenced with `src/App.tsx` (routes + FeatureRouteGuard + PageAccessRouteGuard)
- Cross-referenced with `src/policy/components/CommandCenterLayout.tsx` (NAV_ITEMS)
- Cross-referenced with `src/policy/security/features/catalog.ts`

Last updated: 2026-06-10 (derived from running codebase inspection). Re-generate by inspecting the registry file after future changes.