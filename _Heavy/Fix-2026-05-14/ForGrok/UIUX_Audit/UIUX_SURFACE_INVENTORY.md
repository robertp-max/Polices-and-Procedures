# UI/UX Surface Inventory
**Date**: 2026-05-15  
**Method**: 16-agent parallel exploration + main auditor route mapping from App.tsx + CommandCenterLayout + all pages/components

---

## Major UI Surfaces

| Route/Path | Primary Component/Page Owner | Design Family | Visual Quality (1-10) | Mobile Readiness (1-10) | Accessibility Risk | Redesign Priority | Notes / Canonical Owner Candidate |
|------------|--------------------------------|---------------|-----------------------|-------------------------|--------------------|-------------------|-----------------------------------|
| `/dashboard` | DashboardPage.tsx | Command Center (one-glass + SurfaceCard mix) | 7 | 6 | Medium (dense widgets, some icon-only) | High | Mix of ci- tokens + slate + arbitrary shadows. Strongest shell integration. |
| `/library` | LibraryPage.tsx | Command Center + custom .glass-interactive-lib | 7.5 | 6 | Medium | High | Good search/filter; some hardcoded gold/teal. |
| `/library/:policyId` (most) | PolicyDetailPage + SharedPolicyDetailView | Normalized QA-PG-001 (SurfaceCard + teal rules, metadata grid) | 8 | 6 | Medium (long content, tabs) | Medium | **Canonical policy detail** per LAYOUT_NORMALIZATION. Good after alignment. |
| `/library/GV-GB-001` | GVGBDetailView.tsx (special cased in PolicyDetailPage) | Special specimen (compact sticky header, custom transitions, keyboard nav) | 8.5 | 5 | Low-Medium | Low (preserve) | Honored special case; own refinements (sticky on non-overview, gvgb-enter keyframes). Do not normalize away. |
| `/policies/:policyId` (alias) | Same as library | — | — | — | — | — | Redirect |
| `/policy-lifecycle` / `/:policyId` | PolicyLifecyclePage.tsx | Command Center | 7 | 6 | Medium | High | Unified drafts/review/publish; less polished than detail. |
| `/forms` | FormsPage.tsx | Command Center | 7 | 6 | Medium | High | Grid of form cards; entry to eCign. |
| `/forms/:formId` | FormViewer.tsx (embedded mode) + FormSigningWorkspace.tsx | eCign paper + signing modal (navy/orange + FormBody paper) | 7.5 | 5 | **High** (prior deep audit flagged uncontrolled inputs, labeling in dynamic sections, multi-signer) | **Critical** | Core of eCign flow. getPrintableFormHtml + packet builder. signed_locked Options is key friction. |
| `/forms/:formId/print` | FormPrintView.tsx | Standalone print (FormBody only) | 8 | 7 | Low | Medium | Clean for forms. |
| `/artifacts/:artifactId` | ArtifactViewerPage.tsx | Evidence/artifact (iframe for HTML packets or preview) | 7 | 5 | Medium-High | High | Signed package viewer. Fidelity depends on packet HTML. |
| `/evidence` | EvidenceCenterPage.tsx + CesEvidenceHierarchyPanel | Command Center + evidence hierarchy | 6.5 | 5 | High (tree navigation, status) | High | CES evidence surface. |
| `/ces/dashboard` | CesDashboardPage.tsx | CES (parallel navy/orange theme via ces/theme.ts + CesCard) | 6 | 5 | Medium-High | **Critical** | Parallel design system. |
| `/ces/board` | CesBoardPage.tsx + board/ components | CES | 6.5 | 4 | High (kanban drag?, tab order, dense) | **Critical** | Visual weight differs from shell. |
| `/ces/workloads` / `/reports` | Ces*Page | CES | 6 | 5 | Medium | High | Reporting tables. |
| `/my-tasks` / `/pm/*` | MyTasksPage + pm/ (MyTasksPmPage, SprintPlanPage, ApprovalsQueuePage, etc.) | PM overlay (heavy inline, some glass) | 6.5 | 5 | Medium | High | Overlay on CES/eCign. Dense. |
| `/calendar` (unified + ?view=sprint) | MasterCalendarPage.tsx | Command Center + calendar/ | 7.5 | 6 | Medium | Medium | Strong unified view (events/tasks/sprints/evidence). MobileIncidentExecutionPage drill-downs. |
| `/journey` | JourneyHomePage.tsx | Journey cinematic dark glass | 8 | 5 | Medium | High | PhaseRail, ModuleCard, GateBanner. Good but mobile weak. |
| `/journey/v1-journey` | OnboardingV1JourneyPage.tsx | Journey (dense lesson catalog) | 7 | 4 | Medium | High | ACHC lessons, quizzes, pre-assess. Heavy. |
| `/journey/module/:moduleId` | ModulePlayerPage.tsx + ScormPlayer / EvidenceCapture | Journey | 7.5 | 5 | Medium | Medium | SCORM or built-in + dual-sig evidence. |
| `/journey/staging/m01` | StagingM01Page.tsx | Cinematic prototype (absolute 5-slot carousel, video, tints, HUD) | 9 (visual) / 5 (mobile) | 3 | Medium (complex transforms, keyboard hints md+) | High (mobile) | Standout engagement; fragile on phone. |
| `/onboarding-v2/*` (dashboard, activate, batches/:id, audit, governance) | OnboardingV2Layout (260px light rail + white main) + V2 pages (KpiTile, StatusPill, GateTile, UnitDrawer, AuditTimeline) | Onboarding V2 light professional audit-grade | 8.5 | 4 | Medium | High (mobile + unification) | **Strongest modern UX** (reconciliation preview, gates, hash-chain). Stark drift from Journey V1. |
| `/help/*` | HelpCenterPage + ContextualKnowledgeBulb | Shell + help | 7 | 6 | Low | Low | Good integration. |
| `/system-documentation/:sectionId` | SystemDocumentationPage | Shell | 6.5 | 6 | Low | Low | Content heavy. |
| `/iadministrator` | IAdministratorPage + RightPanelPreview | iAdmin (Brad) | 7 | 5 | Medium | Medium | Brad proposal + tour. |
| `/admin/*` (user-groups, roles, permissions, users) | Admin* pages + AdminRouteGuard | Admin identity | 6 | 6 | Medium | Medium | Lighter treatment. |
| `/workflows/*` | WorkflowLibraryApp.tsx | Workflow | 6.5 | 5 | Medium | Medium | Separate app surface. |
| `/clinicians` / `/:id` , `/patients` / `/:id` , `/staffing-calendar` | Staffing pages + components (ClinicianCard, PatientCard, ShiftNeedCard) | Staffing (SurfaceCard + some glass) | 7 | 6 | Medium | Medium | Newer; uses primitives better. |
| `/taxonomy` / `/framework` / `/framework/achc-survey` | TaxonomyPage, FrameworkPage, AchcSurveyAlignmentPage | Framework / ACHC | 6.5 | 5 | Medium-High (tables, alignment) | High | Surveyor surface. |
| `/audit` | AuditModePage.tsx | Audit | 7 | 6 | Medium | Medium | Dependency/risk views. |
| `/governance` | GovernancePage.tsx | Shell | 6.5 | 6 | Low | Low | Basic. |
| `/master-control-inventory` | MasterControlInventoryPage + MasterControlInventory.tsx | Inventory | 7 | 6 | Medium | Medium | Data-heavy. |
| `/hubstaff` | HubstaffStagingPage | Staging | 6 | 5 | Low | Low | Internal. |
| `/demo` / `/brad-proposal` | DemoPage, BradProposalPage | Demo / Hidden | 7 | 6 | Low | Low | Executive. |
| Standalone prints (`/print/GV-GB-001`, `/print/:policyId`, `/print/GV-GB-001/appendix/:id`, `/forms/:formId/print`) | GVGBPrintDocument, GVGBAppendixPrint, PrintPage, FormPrintView | Dedicated print | 7.5-8.5 | 7 | Low | Medium | Vector fidelity good; visual consistency across systems is the gap. |
| Auth pages (`/login`, `/register`, etc.) | Auth pages + AuthCard | Auth (simple card) | 7 | 8 | Low | Low | Clean, outside shell. |

**Notes**:
- **Canonical Owners (emerging)**: CommandCenterLayout + ui/* (shell + primitives); PolicyDetailPage + SharedPolicyDetailView (policy detail, GVGB special); FormViewer + FormSigningWorkspace (eCign signed packets); OnboardingV2 engine/layout (activation); MasterCalendar (time); V2 StatusPill/KpiTile/GateTile (semantic status).
- **Duplicates/Drift Candidates**: 3+ policy detail renderers; 2+ onboarding systems (cinematic vs audit); CES parallel theme + primitives; multiple Tabs impl; StatusBadge legacy vs CiStatusBadge vs domain chips; 4+ print builders; many raw cards vs SurfaceCard/GlassPanel.
- **Visual Quality average ~7**; **Mobile average ~5** (field users penalized).
- **Highest Redesign Priority**: Forms/eCign signing (legal risk + friction), CES surfaces (parallel system), Onboarding unification, mobile pass on training/execution, token enforcement in GVGB/Dashboard/Library.

**Total Major Surfaces Audited**: 35+ routes + nested (CES sub, onboarding-v2 nested, journey variants, admin sub, pm overlays).

See UIUX_PAGE_BY_PAGE_FINDINGS.md for per-surface deep findings and UIUX_DRIFT_AND_REDUNDANCY_REPORT.md for duplicate mapping.