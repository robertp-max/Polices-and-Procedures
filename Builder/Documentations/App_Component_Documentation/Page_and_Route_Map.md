# Page and Route Map

## Frontend Routing Authority

- Primary runtime router: `src/App.tsx`
- Bootstrap file: `src/main.tsx`
- Alternate router (non-primary): `src/policy/PolicyCommandCenterApp.tsx` (`Needs confirmation`)

---

## Route Hierarchy (Frontend)

### Standalone routes (outside `CommandCenterLayout`)

| Route Path | Component | Purpose | Entry Points | Downstream Navigation |
|---|---|---|---|---|
| `/print/GV-GB-001/appendix/:appendixId` | `GVGBAppendixPrint` | Appendix-only print output | Direct URL, print actions | None (print surface) |
| `/print/GV-GB-001` | `GVGBPrintDocument` | Full GV-GB document print | Direct URL, print actions | Appendix links/sections |
| `/print/:policyId` | `PrintPage` | Generic policy print view | Print buttons from policy views | None (print surface) |
| `/forms/:formId/print` | `FormPrintView` | Standalone form print/PDF | `printForm()` helper + direct URL | None (print surface) |
| `/brad-proposal` | `BradProposalPage` | Executive proposal page | Hidden trigger/direct URL | None |

### In-shell routes (inside `CommandCenterLayout`)

| Route Path | Component | Purpose | Entry Points | Downstream Navigation |
|---|---|---|---|---|
| `/` | Redirect to `/dashboard` | Root redirect | App load | `/dashboard` |
| `/dashboard` | `DashboardPage` | KPI and compliance dashboard | Main nav/home redirect | calendar, workflow drilldown |
| `/calendar` | `MasterCalendarPage` | Calendar timeline and execution | Nav / dashboard links | event workflow drawer |
| `/audit` | `AuditModePage` | Survey/audit operations | Nav | exports, packets, workflow validation |
| `/library` | `LibraryPage` | Policy library listing | Nav | `/library/:policyId` |
| `/library/:policyId` | `PolicyDetailPage` | Policy detail and lifecycle context | Library row click | print, related views |
| `/drafts` | `DraftsPage` | Draft list | Nav | `/drafts/:policyId` |
| `/drafts/:policyId` | `DraftPolicyPage` | Draft editing/review staging | Drafts row click | review/publish stages |
| `/review` | `ReviewPage` | Review/approval stage | Nav or draft lifecycle | publish |
| `/publish` | `PublishPage` | Publication stage | Nav/lifecycle flow | library |
| `/taxonomy` | `TaxonomyPage` | Taxonomy framework visualization | Nav | framework views |
| `/framework` | `FrameworkPage` | Framework domain page | Nav | related governance/library |
| `/forms` | `FormsPage` | Forms library | Nav | `/forms/:formId` |
| `/forms/:formId` | `FormViewer` | Form interactive view | Forms table row click | print route |
| `/governance` | `GovernancePage` | Governance metrics and analysis | Nav | policy/governance references |
| `/demo` | `DemoPage` | Demo/presentation entry | Nav/direct URL | presentation sections |
| `/iadministrator` | `IAdministratorPage` | Brad iAdministrator | Nav | IA references, sessions, actions |
| `/gv-policy/:policyId` | `GVPolicyDetailView` | Governance-specific policy detail | Internal policy links | print/detail views |
| `/workflows/*` | `WorkflowLibraryApp` | Workflow library app | Nav | nested routes below |
| `/compliance/master-controls` | `MasterControlInventoryPage` | Master control inventory | Nav/compliance links | control detail filtering |
| `/hubstaff` | `HubstaffStagingPage` | Hubstaff staging | Nav/direct | hubstaff API task operations |
| `/journey` | `JourneyHomePage` | Journey home | Nav/direct | journey module/supervisor/admin |
| `/journey/appendix-f` | `AppendixFPage` | Journey appendix workflow | Journey nav | signatures/completions |
| `/journey/module/:moduleId` | `ModulePlayerPage` | Learning module playback | Journey cards | supervisor/admin progression |
| `/journey/supervisor` | `SupervisorPage` | Supervisor workflow | Journey nav | approvals/signatures |
| `/journey/admin` | `AdminPage` | Journey admin governance | Journey nav | status/escalation |
| `/journey/guide` | `UserGuidePage` | Journey user guide | Journey nav | none |
| `*` | Redirect to `/dashboard` | Catch-all redirect | Unknown routes | `/dashboard` |

### Nested routes under `/workflows/*`

| Nested Path | Full Path | Component | Purpose |
|---|---|---|---|
| `index` | `/workflows` | `LandingView` | Workflow catalog landing |
| `:workflowId` | `/workflows/:workflowId` | `WorkflowDetailView` | Single workflow detail |

---

## Navigation Flow (Frontend)

1. `main.tsx` mounts `App` under `BrowserRouter`.
2. `App` handles print/proposal routes outside shell.
3. Remaining routes render inside `CommandCenterLayout`.
4. Users branch from dashboard to:
   - policy lifecycle (`library`/`drafts`/`review`/`publish`)
   - calendar/audit operations (`calendar`/`audit`)
   - forms (`forms`)
   - workflows (`workflows/*`)
   - Brad (`iadministrator`)
   - compliance inventory (`compliance/master-controls`)
5. Journey is a parallel route family under `/journey/*`.

---

## Backend Route Surfaces (API)

Runtime mount file: `server/index.ts`

| Base | Mounted Router | Purpose |
|---|---|---|
| `/api/calendar` | `calendarRouter` | Regulatory calendar synchronization/events |
| `/api/hubstaff` | `hubstaffRouter` | Hubstaff integration endpoints |
| `/api/ia` | `createIaRouter(iaService)` | Brad iAdministrator (health/query/chat/references/sessions) |

### `/api/ia` endpoints

- `GET /health`
- `POST /query`
- `GET /references`
- `GET /references/:id`
- `POST /index/rebuild`
- `POST /chat`
- `GET /sessions`
- `GET /sessions/:threadId`
- `DELETE /sessions/:threadId`
- `POST /sessions/:threadId/resolve`
- `GET /audit/recent`
- `GET /operational/summary`
- `GET /operational/gaps`
- `GET /operational/lifecycle`
- `GET /regulatory/updates`
- `GET /regulatory/updates/:id`
- `GET /regulatory/policy/:policyId`

### `/api/calendar` endpoints

- `GET /events`
- `GET /events/by-app/:eventId`
- `POST /events`
- `PUT /events/:eventId`
- `DELETE /events/:eventId`
- `POST /sync`
- `POST /cleanup`
- `GET /audit`
- `GET /notifications`
- `GET /store`
- `GET /healthz`

### `/api/hubstaff` endpoints

- `GET /auth`
- `GET /projects/:id/tasks`
- `POST /projects`
- `POST /projects/:id/tasks`

---

## Needs Confirmation

1. Whether `src/policy/PolicyCommandCenterApp.tsx` should be kept as an alternate runtime app or retired.
2. Whether all legacy/deprecated pages should remain in route-adjacent directories (`TaxonomyPage.old.tsx`).

