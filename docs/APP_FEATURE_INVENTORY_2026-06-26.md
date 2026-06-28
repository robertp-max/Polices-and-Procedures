# App Feature Inventory — 2026-06-26

**Source of truth:** Live source code audit of `src/App.tsx`, `src/v6/routing/routeRegistry.ts`, `src/v6/routing/navigationManifest.ts`, `src/v6/shell/V6Shell.tsx`, `src/v6/screens/pageviews/`, `src/policy/data/`, `src/v6/screens/brad/`, `src/v6/guided/`, etc.

**Rules applied:**
- Only document live, implemented, user-facing features.
- Mark partial, demo-only, hidden, planned clearly.
- Routes from V6_ROUTES + nav.
- Help Center at /help/* (HelpCenterScreen + HELP_ARTICLES).
- Personal Ops panel in V6Shell.
- Brad is iAdministrator at /iadministrator (BradWorkspace).
- No PHI in any docs/screenshots.

## Inventory Table

| Feature Name | Route/Path | Component File(s) | Audience/Role | Status | Documentation Status | Priority | Screenshot Required | Guided Tour Candidate |
|--------------|------------|-------------------|---------------|--------|----------------------|----------|---------------------|-----------------------|
| Dashboard | /dashboard | RepresentativeScreens / dashboard view | All staff | Live | Stale (in old docs) | P1 | Yes | No |
| Clinicians Roster | /clinicians | src/v6/screens/pageviews (profile list) | All, Admin | Live (hidden from sidebar) | Missing | P2 | Yes | No |
| Clinician Detail | /clinicians/:clinicianId | detail template | Clinicians, Admin | Live | Missing | P2 | Yes | No |
| Patients Roster | /patients | profile list | All, Admin | Live (hidden) | Missing | P2 | Yes | No |
| Patient Detail | /patients/:patientId | detail | Clinicians | Live | Missing | P2 | Yes | No |
| Master Calendar | /calendar | calendar template | All staff | Live | Partial | P1 | Yes | No |
| Staffing Calendar | /staffing-calendar | calendar | Ops | Live (hidden) | Missing | P2 | Yes | No |
| iAdministrator (Brad) | /iadministrator | src/v6/screens/brad/BradWorkspace.tsx | All staff | Live | Partial (old KB) | P0 | Yes | Yes |
| Brad Builder | /brad/builder | BradWorkspace (builder mode) | Super Admin | Live (demo-only for some) | Missing | P1 | Yes | No |
| CES Calendar | /ces/calendar | calendar + ces projections | Compliance, QAPI | Live | Partial (CES docs) | P0 | Yes | Yes |
| CES Board | /ces/board | board template, BoardScreen | Compliance teams | Live | Partial | P0 | Yes | Yes |
| Events Board | /ces/events | board (events) | All | Live | Missing | P1 | Yes | No |
| Workflows Library | /workflows | matrix, WorkflowsScreen | All | Live | Stale | P1 | Yes | No |
| Workflow Detail | /workflows/:workflowId | detail | All | Live | Missing | P1 | Yes | No |
| Workflow Swimlane | /workflows/:workflowId/swimlane , /events/:eventId/swimlane | board swimlane | All | Live | Partial | P0 | Yes | Yes |
| Master Controls | /compliance/master-controls | matrix | Compliance | Live | Missing | P1 | Yes | No |
| Audit Mode | /audit | evidence template (read-only) | Auditors, Admin | Live | Partial | P0 | Yes | Yes |
| Evidence Center | /evidence | evidence template | All | Live | Partial | P0 | Yes | Yes |
| Brad Evidence Intake | /evidence/intake | inside Evidence | Compliance | Live | Missing | P0 | Yes | Yes |
| Evidence Packet Studio | /evidence/packet-studio | inside Evidence | QAPI, Compliance | Live | Missing | P0 | Yes | Yes |
| CES Reports | /ces/reports | reports | Compliance | Live | Missing | P1 | Yes | No |
| My Tasks | /my-tasks | board | All staff | Live | Missing | P1 | Yes | No |
| PM My Tasks etc. | /pm/* | various | PM roles | Live (V1 parity) | Missing | P2 | Yes | No |
| Framework / Taxonomy | /framework , /taxonomy | framework template | All | Live | Partial | P1 | Yes | No |
| ACHC Survey | /framework/achc-survey | achc-survey | Compliance | Live | Missing | P1 | Yes | No |
| ACHC Crosswalk | /framework/achc-survey/crosswalk | achc-crosswalk | Compliance | Live | Missing | P1 | Yes | No |
| Policy Library | /library | matrix | All | Live | Partial | P0 | Yes | Yes |
| Policy Detail | /library/:policyId , /policy-lifecycle/:policyId | detail | All | Live | Partial | P0 | Yes | Yes |
| Policy Approvals | /policy-approvals | board | Admin | Live | Missing | P1 | Yes | No |
| Policy Print | /library/:policyId/print , /print/:policyId | detail (print mode) | All | Live | Missing | P1 | Yes | No |
| Forms Library | /forms | matrix | All | Live | Partial | P0 | Yes | Yes |
| Form Workspace | /forms/:formId | form-viewer | All | Live | Partial | P0 | Yes | Yes |
| Form Print | /forms/:formId/print | form-viewer | All | Live | Missing | P1 | Yes | No |
| eCIgn Signing Workspace | /forms/:formId/esign | ecign | All | Live | Partial | P0 | Yes | Yes |
| Artifact / Reference Viewer | /artifacts/:artifactId , /viewer/:referenceId | reference-viewer | All | Live | Missing | P2 | Yes | No |
| Journey Overview | /journey | journey template | All staff | Live | Partial | P0 | Yes | Yes |
| New Hire Portal | /journey/new-hire | journey | New hires | Live | Missing | P1 | Yes | No |
| Orientation Module | /journey/module/m0 | module-player | All | Live | Missing | P1 | Yes | Yes |
| Module Player | /journey/module/:moduleId | module-player | All | Live | Partial (old) | P0 | Yes | Yes |
| Lesson Player | /journey/module/:moduleId/lesson/:lessonId | module-player | All | Live | Missing | P1 | Yes | Yes |
| Assessment / Quiz | /journey/.../assessment* | module-player | All | Live | Missing | P1 | Yes | No |
| Appendix F | /journey/appendix-f | docs | All | Live | Partial | P0 | Yes | Yes |
| Supervisor View | /journey/supervisor | journey | Supervisors | Live | Missing | P1 | Yes | No |
| Journey Admin | /journey/admin | reports | Admin | Live | Missing | P1 | Yes | No |
| User Guide | /journey/guide | docs | All | Live | Stale | P1 | Yes | No |
| Onboarding v2 Dashboard | /onboarding-v2/dashboard | dashboard | Admin | Live (demo) | Missing | P2 | Yes | No |
| Onboarding v2 Batches etc. | /onboarding-v2/* | various | Admin | Live (demo) | Missing | P2 | Yes | No |
| Policy Lifecycle | /policy-lifecycle | lifecycle | Admin | Live | Missing | P1 | Yes | No |
| Hubstaff | /hubstaff | reports | Ops | Live (demo) | Missing | P2 | Yes | No |
| System Documentation | /system-documentation/* | docs | Internal | Live (hidden nav) | Stale | P3 | No | No |
| Help Center | /help/* | HelpCenterScreen + articles | All | Live | Stale / Partial | P0 | Yes | Yes |
| Governance | /governance | reports | Admin | Live | Missing | P2 | Yes | No |
| Admin User Groups | /admin/user-groups | matrix | Admin | Live | Missing | P1 | Yes | No |
| Admin Roles | /admin/roles | matrix | Admin | Live | Missing | P1 | Yes | No |
| Admin Permissions | /admin/permissions | matrix | Admin | Live | Missing | P1 | Yes | No |
| Admin Users | /admin/users | matrix | Admin | Live | Partial (description header) | P1 | Yes | No |
| Surveyor Viewer | /surveyor/policy/:policyId | detail | Auditors | Live (external) | Missing | P2 | Yes | No |
| Sign In | /login | LoginScreen | Auth | Live | Stale | P2 | Yes | No |
| Personal Ops Panel | (toggle in top bar) | PersonalOpsPanel.tsx in V6Shell | All | Live | Missing | P0 | Yes | No |
| Guided Tours (Brad) | In Brad / various | src/v6/guided/ , build*Tour | All | Live (partial) | Missing | P0 | Yes | Yes (core) |
| Evidence Upload / Studio | Inside Evidence | Evidence flows | All | Live | Partial | P0 | Yes | Yes |
| eCIgn Signing | /forms/:formId/esign | EcignWorkspaceScreen | All | Live | Partial | P0 | Yes | Yes |
| QAPI Packet Gen / Export | In CES / reports / packet studio | QAPI flows | QAPI | Live | Partial | P0 | Yes | Yes |
| Admission Packet flows | In journey / forms | Admission related | All | Live (partial) | Missing | P1 | Yes | No |

**Notes on Status:**
- Many "hidden from sidebar" routes are live via direct URL or links (profiles, some calendars).
- Brad Builder, PM tools, Onboarding v2, Hubstaff are marked demo / V1 parity / partial.
- Help Center exists but articles are incomplete/stale compared to current routes (e.g., no visual for Evidence Studio, Packet Studio, guided tours full).
- Personal Ops, community features (threads, feature requests) appear limited or not fully routed in V6 nav; marked accordingly.
- No live "Community feed", "DMs" as full features from routes; partial in policy data or old docs.
- iAdministrator is the main Brad surface (not old iAdmin paths).

**Total Live Routes (non-auth):** ~80+ from registry.

**Highest Impact P0 to start:** Brad, CES surfaces, Evidence, eCIgn, QAPI, Forms/Policies, Journey/Appendix F, Help Center, Personal Panel, Guided Tours.

**Help Refresh 2026-06-26 Status:**
- Created `src/v6/help/types/helpArticle.ts` and `VisualHelpArticleTemplate.tsx` + supporting components (Hero, StepCard, AnnotatedScreenshot, QuickActionCard).
- Added `src/policy/data/visualHelpArticles.ts` with P0 visual articles (Brad, Evidence Packet) following visual-first style (short text, hero + steps + screenshots).
- Updated `HelpCenterScreen.tsx` to render visual template for matching articles, added visual category cards matching the 18 required categories, lists both legacy + new visual articles.
- Generated 2 new illustrations (brad-hero.jpg, packet-studio-hero.jpg) via image tool, copied to public/assets/media/.
- Cleaned PageHeader descriptions in admin pageviews to remove space-wasting text headers.
- Inventory created with live routes from source (84+), marked demo/partial clearly.
- All P0 prioritized first: Brad, CES/Evidence, eCIgn, QAPI, Forms/Policies, Journey, Help, Personal Panel.

**Next:** Expand more articles in visualHelpArticles.ts, add screenshots via capture scripts or gen, wire guided tours and buttons in template, update existing HELP_ARTICLES to new model.

**Screenshots/Illustrations:** Use /assets/media/ + tmp-screenshots/. All demo data. No PHI.

This is live source verified 2026-06-26.