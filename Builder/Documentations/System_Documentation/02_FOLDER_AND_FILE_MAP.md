# 02 — Folder and File Map

**Generated:** 2026-05-12

---

## Root-Level Structure

```
c:\AI\Git\training\HomeHealth\Policies_and_Procedures\
│
├── src/                          Frontend React application
├── server/                       Express backend API
├── Builder/                      Planning docs, architecture docs, training blueprints
├── public/                       Static assets served by Vite
├── infra/                        AWS CDK infrastructure code
├── scripts/                      ~46 utility / verification scripts
├── migrations/                   Database migration files
├── dist/                         Built frontend output (generated, gitignored in dev)
├── node_modules/                 NPM dependencies (gitignored)
├── .cache/                       IA index cache (gitignored)
├── .vercel/                      Vercel deployment config
├── .venv/                        Python virtual environment (Journey blueprint scripts)
├── .vscode/                      VSCode workspace settings
│
├── package.json                  Project manifest, all scripts
├── vite.config.ts                Vite build + dev proxy config
├── tsconfig.json                 Root TypeScript config (references)
├── tsconfig.app.json             Frontend TypeScript config
├── tsconfig.node.json            Node/server TypeScript config
├── tailwind.config.js            Tailwind CSS config
├── postcss.config.js             PostCSS config
├── eslint.config.js              ESLint flat config
├── playwright.config.ts          E2E test config
├── vercel.json                   Vercel deployment config
├── index.html                    Vite HTML entry point
├── README.md                     Project readme
├── .env.example                  Environment variable template (safe to commit)
├── .env                          ⚠️ Local env values (gitignored — should never commit)
├── .env.local                    ⚠️ Local overrides (gitignored)
├── .env.production               ⚠️ Production env (gitignored)
├── .gitignore                    Git ignore rules
│
│ ── TEMP / STAGING FILES (root) ── [⚠️ should be cleaned up]
├── tmp-*.json / tmp-*.log        ~20 temp/debug output files
├── tmp-all-modules-list.csv/.txt Temp module listing
├── _inject_wf101.cjs             Temp/utility CJS script
├── _rewrite_demo.cjs             Temp/utility CJS script
├── HUBSTAFF_USER_MANUAL.html     Staging reference file
├── Launch-CI-ION.bat             Windows launcher batch script
│
│ ── PLANNING FOLDERS (root-adjacent) ──
├── Business Risk & Analytics Director Brad.pi/   Project Intelligence folder
├── Business_Risk_&_Analytics_Director/           Business risk docs
├── Project_Intelligence/                         Project intelligence files
├── tmp-ui-verify-screenshots/                    UI verification screenshots (temp)
```

---

## `/src/` — Frontend Source

```
src/
├── App.tsx                       ★ Main app, BrowserRouter + ALL routes (289 lines)
├── main.tsx                      React DOM render root
├── index.css                     Global CSS
├── vite-env.d.ts                 Vite type declarations
│
├── assets/                       Static images
│   ├── brad-tour-hero.png        Brad AI tour hero image
│   ├── brad-tour.png             Brad AI tour image
│   ├── ci-ion-logo.png           CI ION logo
│   ├── ci-logo-gray.png          CI logo variant
│   ├── ci-logo-white.png         CI logo variant
│   ├── eCIgn.png                 eCIgn signature branding
│   └── hero.png                  Hero image
│
├── auth/                         Authentication layer
│   ├── api.ts                    Auth API calls (Cognito)
│   ├── AuthProvider.tsx          ★ Auth context, session management, demo bypass
│   ├── ProtectedRoute.tsx        Route guard component
│   ├── components/
│   │   └── AuthCard.tsx          Auth card UI wrapper
│   └── pages/
│       ├── LoginPage.tsx
│       ├── RegisterPage.tsx
│       ├── CheckEmailPage.tsx
│       ├── ForgotPasswordPage.tsx
│       ├── ResetPasswordPage.tsx
│       ├── SetNewPasswordPage.tsx
│       └── SetupAccountPage.tsx
│
├── components/                   Top-level shared components
│   └── TravelightBG.tsx          Background component
│
├── policy/                       ★ Main application domain (see below)
│
└── services/                     Top-level services
    ├── bradAppContext.ts          Brad context builder (policy corpus, events, tasks)
    └── mockBradEngine.ts         ★ Mock Brad AI engine (used when Ollama unavailable)
```

---

## `/src/policy/` — Application Domain (Deep Map)

```
policy/
├── PolicyCommandCenterApp.tsx    Alternate entry (referenced but may not be in active routes)
├── PolicyDesign(light).html      [⚠️ invalid filename with parens] HTML design reference
│
├── adapters/
│   └── frameworkSeedAdapter.ts   Adapts framework seed data
│
├── artifacts/
│   └── artifactRoute.ts          Artifact routing utility
│
├── audit/                        Policy-layer audit utilities
│   ├── auditAggregate.ts
│   ├── auditState.ts
│   ├── dependencyCheck.ts
│   ├── exportReport.ts
│   ├── riskScoring.ts
│   ├── surveyPacket.ts
│   └── workflowInstance.ts
│
├── autogen/                      Auto-generation engine
│   ├── annualGenerator.ts
│   ├── conflictResolver.ts
│   ├── dependencyResolver.ts
│   ├── scheduler.ts
│   ├── templateRegistry.ts
│   ├── triggerEngine.ts
│   └── types.ts
│
├── brad/                         Brad workflow (policy-layer)
│   ├── useBradWorkflow.ts
│   ├── workflowKnowledge.ts
│   ├── workflowRuntime.ts
│   └── workflowSchedule.ts
│
├── ces/                          ★ Compliance Execution Sprint System
│   ├── cesExecutionMode.ts
│   ├── cesReviewMode.ts
│   ├── cesRoles.ts
│   ├── signerTaskFactory.ts
│   ├── theme.ts
│   ├── types.ts                  ★ CES canonical type definitions
│   ├── components/
│   │   ├── primitives.tsx
│   │   ├── board/
│   │   │   ├── ExecutionUnitCard.tsx
│   │   │   └── SprintExecutionBoard.tsx
│   │   ├── calendar/
│   │   │   └── ComplianceCalendar.tsx
│   │   ├── dashboard/
│   │   │   └── CesExecutiveDashboard.tsx
│   │   ├── details/
│   │   │   ├── SprintTaskPanel.tsx
│   │   │   └── WorkflowDrawer.tsx
│   │   ├── reports/
│   │   │   └── ExecutiveReports.tsx
│   │   ├── review/
│   │   │   ├── CesRoleReviewSwitcher.tsx
│   │   │   └── RobertCesReviewLayer.tsx
│   │   └── workloads/
│   │       └── WorkloadDistribution.tsx
│   ├── hooks/
│   │   ├── useEvidenceTracker.ts
│   │   └── useExecutionEnforcement.ts
│   ├── layouts/
│   │   └── CesLayout.tsx
│   ├── obligations/
│   │   ├── index.ts
│   │   ├── obligationSelectors.ts
│   │   └── useObligations.ts
│   └── pages/
│       ├── CesBoardPage.tsx
│       ├── CesCalendarPage.tsx
│       ├── CesDashboardPage.tsx
│       ├── CesReportsPage.tsx
│       ├── CesWorkloadsPage.tsx
│       └── MyTasksPage.tsx
│
├── compliance/                   Compliance evaluation engine
│   ├── complianceEngine.ts
│   ├── evaluateEvent.ts
│   ├── index.ts
│   └── useComplianceMap.ts
│
├── compliance-execution/         ★ Merged CES + Command Center execution types
│   ├── cesFormInstanceId.ts
│   ├── complianceExecutionAdapters.ts
│   ├── complianceExecutionEvents.ts
│   ├── complianceExecutionSelectors.ts
│   ├── complianceExecutionStore.ts ★ Main CES Zustand store
│   ├── complianceExecutionTypes.ts ★ Re-exports + extended types
│   ├── eventFolders.ts
│   ├── eventInstanceId.ts
│   ├── eventStateEvaluator.ts
│   ├── eventTaskAdapter.ts
│   ├── index.ts
│   ├── stateMachine.ts
│   ├── taskIdentity.ts
│   ├── types.ts
│   └── useEventExecutionDataflow.ts
│
├── components/                   Shared UI components
│   ├── CommandCenterLayout.tsx   ★ Main layout shell (sidebar + header)
│   ├── DraftBanner.tsx
│   ├── FormSignatureContext.tsx
│   ├── FormSignatureFlow.tsx
│   ├── FormSigningWorkspace.tsx
│   ├── FormViewer.tsx
│   ├── FrameworkShowcase.css
│   ├── FrameworkShowcase.tsx
│   ├── MasterControlInventory.tsx
│   ├── PolicyAppendicesPanel.tsx
│   ├── PolicyDetailModal.tsx
│   ├── PolicyLibraryDocumentView.tsx
│   ├── PolicyLinkSelector.tsx
│   ├── SharedPolicyDetailView.tsx
│   ├── StatusBadge.tsx
│   ├── UniversalNavControls.tsx
│   ├── evidence/
│   │   └── CesEvidenceHierarchyPanel.tsx
│   ├── help/
│   │   └── ContextualKnowledgeBulb.tsx
│   ├── onboarding/               Onboarding tour components
│   │   ├── BradTourAvatar.tsx
│   │   ├── GuidedTourGate.tsx
│   │   ├── GuidedTourOverlay.tsx
│   │   ├── loginCounter.ts
│   │   ├── missionHandoff.ts
│   │   ├── MissionPromptOverlay.tsx
│   │   └── tourCards.ts
│   ├── pm/                       PM layer views
│   │   ├── ApprovalsQueuePage.tsx
│   │   ├── EntityLink.tsx
│   │   ├── EventTaskList.tsx
│   │   ├── GlobalTaskDrawer.tsx
│   │   ├── MyTasksPmPage.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── PmDashboardPage.tsx
│   │   ├── PmFilterBar.tsx
│   │   ├── PmTaskCard.tsx
│   │   ├── PmViews.tsx
│   │   ├── SprintPlanPage.tsx
│   │   ├── SprintReviewPage.tsx
│   │   ├── SprintScopeToolbar.tsx
│   │   └── TaskDetailRightPanel.tsx
│   ├── regulatory/               Regulatory compliance components
│   │   ├── ApprovalFlow.tsx
│   │   ├── BlockerPanel.tsx
│   │   ├── displayText.ts
│   │   ├── EventChip.tsx
│   │   ├── EventSyncControl.tsx
│   │   ├── EventWorkspace.tsx
│   │   ├── EvidencePanel.tsx
│   │   ├── HelpArticleView.tsx
│   │   ├── KpiTile.tsx
│   │   ├── LockBadge.tsx
│   │   ├── ModalShell.tsx
│   │   ├── MonthGrid.tsx
│   │   ├── Primitives.tsx
│   │   ├── TimelineMonth.tsx
│   │   ├── timelineState.ts
│   │   ├── Toast.tsx
│   │   ├── WorkflowDrawer.tsx      [⚠️ same name as ces/components/details/WorkflowDrawer.tsx]
│   │   └── WorkflowExecutionPanel.tsx
│   └── ui/                       Primitive UI components
│       ├── ActionButton.tsx
│       ├── CiStatusBadge.tsx
│       ├── DataGrid.tsx
│       ├── EmptyState.tsx
│       ├── GlassPanel.tsx
│       ├── index.ts
│       ├── PageHeader.tsx
│       ├── RightDrawer.tsx
│       ├── SearchField.tsx
│       ├── SectionHeader.tsx
│       ├── SurfaceCard.tsx
│       ├── Tabs.tsx
│       ├── ThemeModeToggle.tsx
│       └── UtilityButton.tsx
│
├── data/                         ★ Static / generated data files
│   ├── achcAttachmentCrosswalk.generated.ts
│   ├── achcHhEvidenceMap.ts
│   ├── achcPrintCrosswalk.generated.ts
│   ├── achcStandardTargetResolver.ts
│   ├── achcSupportAnchors.ts
│   ├── achcSurveyProjection.generated.ts
│   ├── achcSurveyTags.generated.ts
│   ├── allPoliciesContent.generated.ts  [⚠️ large generated file]
│   ├── auditRegulatoryEvents.ts
│   ├── corridorAlignment.generated.ts
│   ├── eventAlignmentPolicy.ts
│   ├── eventDisplayModel.ts
│   ├── eventWorkflowAlignment.ts
│   ├── extractedSeedArrays.ts
│   ├── formAddendumBindings.ts
│   ├── formsCatalog.ts
│   ├── formsLibraryContent.ts
│   ├── formsLibraryContentCO_More.ts
│   ├── formsLibraryContentHR_CL.ts
│   ├── formsLibraryContentJD.ts
│   ├── formsLibraryDataset.ts
│   ├── formTitles.generated.ts
│   ├── frameworkSeed.generated.ts
│   ├── frameworkSeedData.ts
│   ├── helpArticles.ts
│   ├── hubstaffTasks.ts
│   ├── mandatedEventsExpanded.ts
│   ├── masterControlInventory.ts
│   ├── multiYearEvents.ts
│   ├── policyContentMap.ts
│   ├── policyCorpus.ts
│   ├── regulatoryEvents.ts
│   ├── specimenContent.generated.ts
│   ├── workflowGraph.generated.ts
│   ├── workflows.generated.ts
│   └── workflowTemplates.generated.ts
│
├── ecign/                        Electronic signature client layer
│   ├── api.ts                    eCIgn API client
│   ├── buildSignerRosterHtml.ts
│   ├── demoLocalApi.ts           [⚠️ demo mode local API]
│   ├── hhcEvidence.ts
│   ├── pdfAppendUtil.ts
│   ├── signerIdentity.ts
│   ├── useEcignInstance.ts
│   └── useEcignSession.ts
│
├── enforcement/                  Enforcement / escalation engine
│   ├── enforcementEngine.ts
│   ├── escalationEngine.ts
│   ├── roleHierarchy.ts
│   ├── types.ts
│   └── useEnforcement.ts
│
├── evidence/                     Evidence model and cache
│   ├── cesEvidenceHierarchy.ts
│   ├── demoEvidenceRuntimeCache.ts [⚠️ demo runtime cache]
│   └── evidenceModel.ts
│
├── help/                         Help Center
│   ├── contextualArticleMap.ts
│   ├── HelpCenterPage.tsx
│   ├── HelpContextLink.tsx
│   └── articles/
│       ├── audit-mode.ts, calendar.ts, compliance-audit.ts, dashboard.ts
│       ├── developer-ecign.ts, evidence-center.ts, forms-templates.ts
│       ├── getting-started.ts, iadministrator.ts, index.ts
│       ├── master-controls.ts, onboarding-v2.ts, policy-lifecycle.ts
│       ├── signing-documents.ts, workflows-events.ts
│
├── journey/                      ★ Training / LMS module system
│   ├── components/
│   │   ├── EmployeePicker.tsx
│   │   ├── EvidenceCapture.tsx
│   │   ├── GateBanner.tsx
│   │   ├── ModuleCard.tsx
│   │   ├── PhaseRail.tsx
│   │   ├── ScormPlayer.tsx
│   │   ├── SignaturePad.tsx
│   │   └── StatusChip.tsx
│   ├── data/                     Module content data files
│   │   ├── achcAnnualTests.data.ts
│   │   ├── achcContentTypes.ts
│   │   ├── achcFinalAssessmentLessons.data.ts
│   │   ├── achcLessons_M01_M04.data.ts
│   │   ├── achcLessons_M05_M08.data.ts
│   │   ├── achcLessons_M09_M12.data.ts
│   │   ├── achcModuleIntroPatch.data.ts
│   │   ├── achcPreAssessDebriefPatch.ts
│   │   ├── appendices.ts
│   │   ├── employees.ts
│   │   ├── modules.ts
│   │   ├── stagingM01Slides.ts
│   │   └── trainingContent.gao.*.ts (4 files)
│   ├── pages/
│   │   ├── AdminPage.tsx
│   │   ├── AppendixFPage.tsx
│   │   ├── JourneyHomePage.tsx
│   │   ├── ModulePlayerPage.tsx
│   │   ├── OnboardingV1JourneyPage.tsx
│   │   ├── StagingM01Page.tsx
│   │   ├── SupervisorPage.tsx
│   │   └── UserGuidePage.tsx
│   ├── scorm/
│   │   └── ScormRuntime.ts
│   ├── stores/
│   │   └── journeyStore.ts
│   ├── types/
│   │   └── journey.ts
│   └── utils/
│       ├── escalation.ts
│       └── gating.ts
│
├── lifecycle/                    Policy lifecycle state machine
│   ├── index.ts
│   ├── lifecycleSeed.ts
│   ├── lifecycleStore.ts
│   ├── stateMachine.ts
│   └── types.ts
│
├── onboarding/                   [⚠️ Onboarding V1 — legacy]
│   ├── onboardingEvents.ts
│   └── onboardingExecutionEngine.ts
│
├── onboarding-v2/                ★ Onboarding V2 (audit-grade)
│   ├── index.ts
│   ├── types.ts
│   ├── catalog/
│   │   ├── policies.ts
│   │   ├── requirements.ts
│   │   ├── roles.ts
│   │   └── templates.ts
│   ├── components/
│   │   ├── AuditTimeline.tsx
│   │   ├── EvidencePanel.tsx
│   │   ├── GateTile.tsx
│   │   ├── KpiTile.tsx
│   │   ├── PolicyVersionLink.tsx
│   │   ├── SignerStrip.tsx
│   │   ├── StatusPill.tsx
│   │   └── UnitDrawer.tsx
│   ├── engine/
│   │   ├── audit.ts
│   │   ├── engine.ts
│   │   ├── gates.ts
│   │   ├── hash.ts
│   │   └── reconciler.ts
│   ├── pages/
│   │   ├── ActivationPage.tsx
│   │   ├── AuditReadinessPage.tsx
│   │   ├── batchHelpers.ts
│   │   ├── BatchListPage.tsx
│   │   ├── BatchViewPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── GovernancePage.tsx
│   │   └── OnboardingV2Layout.tsx
│   └── store/
│       ├── onboardingV2Store.ts
│       └── seed.ts
│
├── pages/                        Top-level page components
│   ├── AchcSurveyAlignmentPage.tsx
│   ├── ArtifactViewerPage.tsx
│   ├── AuditModePage.tsx
│   ├── CLPolicyDetailView.tsx
│   ├── DashboardPage.tsx
│   ├── DashboardPage.tsx.backup  [⚠️ orphaned backup]
│   ├── DemoPage.tsx              [demo]
│   ├── DemoPhase2.tsx            [demo]
│   ├── DemoPhase3.tsx            [demo]
│   ├── EvidenceCenterPage.tsx
│   ├── FormPrintView.tsx
│   ├── FormsPage.tsx
│   ├── FrameworkPage.tsx
│   ├── GenericReferenceViewer.tsx
│   ├── GovernancePage.tsx
│   ├── GVGBAppendixPrint.tsx
│   ├── GVGBDetailView.tsx
│   ├── GVGBPrintDocument.tsx
│   ├── GVPolicyDetailView.tsx
│   ├── HubstaffStagingPage.tsx   [staging]
│   ├── LibraryPage.tsx
│   ├── MasterCalendarPage.tsx
│   ├── MasterCalendarPage.tsx.backup [⚠️ orphaned backup]
│   ├── MasterControlInventoryPage.tsx
│   ├── MobileIncidentExecutionPage.tsx
│   ├── PolicyDetailPage.tsx
│   ├── PolicyLifecyclePage.tsx
│   ├── PrintPage.tsx
│   ├── SurveyorPolicyViewerPage.tsx
│   ├── SystemDocumentationPage.tsx
│   ├── TaxonomyPage.old.tsx      [⚠️ deprecated old version]
│   ├── TaxonomyPage.tsx
│   ├── BradProposal/
│   │   └── index.tsx             [executive demo, hidden route]
│   └── iAdministrator/           ★ Brad AI assistant UI
│       ├── index.tsx
│       ├── components/ (18 component files)
│       └── lib/ (7 library files)
│
├── pm/                           PM layer stores and types
│   ├── currentUser.ts
│   ├── ecignStatusMap.ts
│   ├── featureFlags.ts
│   ├── formInstances.ts
│   ├── formInstancesCore.ts
│   ├── notificationStore.ts
│   ├── notificationTicker.ts
│   ├── personalStore.ts
│   ├── pmOverlayStore.ts
│   ├── pmOverlayStore.types.ts
│   ├── pmViewSprintStore.ts
│   ├── selectedTaskStore.ts
│   ├── sprintId.ts
│   ├── sprintWindows.ts
│   ├── taskProjection.ts
│   ├── taskProjectionCore.ts
│   ├── types.ts                  ★ PM canonical types (PmTask, EcignPacket, etc.)
│   ├── weekendRule.ts
│   ├── api/
│   │   └── pmApiClient.ts
│   ├── notifications/
│   │   └── decider.ts
│   └── scheduling/
│       ├── dependencyGraph.ts
│       └── sprintAllocator.ts
│
├── security/                     Auth, permissions, roles
│   ├── auditLog.ts
│   ├── authorize.ts
│   ├── ceuStore.ts
│   ├── hash.ts
│   ├── index.ts
│   ├── middleware.ts
│   ├── override.ts
│   ├── permissions.ts
│   ├── phiAndSession.ts
│   ├── stateMachine.ts
│   ├── types.ts
│   └── identity/
│       ├── access.ts, AccessDeniedPage.tsx, AdminRolesPage.tsx
│       ├── AdminRouteGuard.tsx, authorize.ts, demoUsers.ts
│       ├── index.ts, permissionCatalog.ts, PermissionCatalogPage.tsx
│       ├── roleAssignments.ts, separationOfDuties.ts, types.ts
│       ├── UserAssignmentsPage.tsx, userAssignmentsStore.ts
│       ├── userGroups.ts, UserGroupsPage.tsx
│
├── services/                     (policy-layer) API service clients
│   ├── calendarApi.ts
│   ├── complianceExecutionApi.ts
│   ├── hhcFormEvidence.ts
│   ├── hhcWorkflowCompletion.ts
│   └── policyLinkService.ts
│
├── stores/                       Zustand stores
│   ├── auditorModeStore.ts
│   ├── autogenStore.ts
│   ├── calendarStore.ts
│   ├── calendarSyncStore.ts
│   ├── ciModeStore.ts
│   ├── dashboardStore.ts
│   ├── enforcementStore.ts
│   ├── frameworkStore.ts
│   ├── navStore.ts
│   ├── policyStore.ts
│   ├── regulatoryExecutionStore.ts
│   └── reviewStore.ts
│   [Note: uiStore.ts also present]
│
├── types/
│   ├── index.ts
│   ├── masterControlInventory.ts
│   ├── types.ts                  ★ Core domain types (Policy, PolicyVersion, Domain, etc.)
│   └── workflow.ts
│
├── utils/
│   ├── appInitializer.ts
│   ├── complianceClassification.ts
│   ├── lifecycleGuards.ts
│   ├── lightColorRemap.ts
│   ├── navExclusions.ts
│   ├── nextDueDateEngine.ts
│   ├── openPolicyPrintRoute.ts
│   ├── policyFormLinks.ts
│   ├── printForm.ts
│   ├── reminderEngine.ts
│   └── selectors.ts
│
└── workflows/                    Workflow Library module
    ├── brand.ts
    ├── WorkflowLibraryApp.tsx
    └── components/
        ├── BrandRail.tsx
        ├── LandingView.tsx
        ├── LinkedWorkflows.tsx
        ├── WorkflowCard.tsx
        └── WorkflowDetailView.tsx
```

---

## `/server/` — Backend API

```
server/
├── index.ts                      ★ Express app entry point, all routers mounted
├── env.ts                        Environment variable parsing
├── errors.ts                     ApiError class
├── googleCalendar.ts             Google Calendar client
├── logger.ts                     Logging utility
├── mappers.ts                    Data mappers
├── tsconfig.json                 Server-specific TypeScript config
│
├── access/                       Access control (ABAC)
│   ├── attributes.ts, bundles.ts, index.ts, pdp.ts, pep.ts, sod.ts
│
├── audit/                        Audit logging (v2)
│   ├── anomaly.ts                Anomaly scheduler
│   ├── projections.ts
│   ├── routes.ts
│   └── writer.ts
│
├── auth/                         Cognito auth service
│   ├── service.ts
│   └── types.ts
│
├── ceu/                          CEU (Continuing Education Units) management
│   ├── registry.ts, routes.ts, types.ts
│
├── cli/
│   └── build-index.ts            CLI: build the local IA corpus index
│
├── credentials/                  [⚠️ HIGH RISK]
│   ├── .gitkeep
│   ├── README.md
│   └── service-account.json      ⚠️ Google service account key — IN REPO DIRECTORY
│
├── ecign/                        eCIgn signature lifecycle
│   ├── compliance.ts, disclosures.ts, hashChain.ts
│   ├── integrity.ts, networkMetadata.ts, pdf.ts
│   ├── stateMachine.ts, store.ts
│   └── data/                     ★ JSONL persistence files
│       ├── audit_events.jsonl    Audit events (append-only log)
│       ├── consents.jsonl        User consents
│       ├── document_versions.jsonl
│       ├── form_instances.jsonl  Form instances and state
│       └── signatures.jsonl      Signature records
│
├── ia/                           ★ iAdministrator RAG engine
│   ├── ollama.ts                 Ollama API client
│   ├── prompt.ts                 Prompt templates
│   ├── README.md
│   ├── responder.ts              Response assembly
│   ├── retrieval.ts              RAG retrieval
│   ├── routes.ts                 /api/ia/* endpoints
│   ├── scenarioClassifier.ts
│   ├── service.ts                ★ IaService main class
│   ├── types.ts
│   ├── index/
│   │   ├── embeddings.ts, search.ts, store.ts
│   ├── ingest/
│   │   ├── chunker.ts, index.ts, metadata.ts, normalize.ts, parsers.ts, sources.ts
│   ├── operational/
│   │   └── seed.ts, service.ts
│   ├── regulatory/
│   │   └── feed.ts, matcher.ts
│   └── session/
│       ├── audit.ts, classifier.ts, envelope.ts, manager.ts, store.ts, types.ts
│
├── identity/                     Request identity middleware
│   ├── middleware.ts
│   └── session.ts
│
├── routes/                       Express route handlers
│   ├── audit.ts                  GET/POST audit log
│   ├── auth.ts                   Auth routes (login, register, refresh, logout)
│   ├── calendar.ts               Google Calendar bridge
│   ├── compliance.ts             Compliance data routes
│   ├── ecign.ts                  eCIgn signature routes
│   ├── hubstaff.ts               Hubstaff time-tracking proxy
│   └── pm.ts                     PM layer routes
│
└── sync/                         Background sync services
    ├── auditLog.ts
    ├── bradNotifier.ts           Brad notification service
    ├── eventStore.ts
    └── eventSync.ts              Event synchronization
```

---

## `/Builder/` — Planning and Documentation Tree (Abbreviated)

```
Builder/
├── AWS-Architecture/             AWS architecture markdown docs
├── Brad2-Business-Risk-Architecture/  Business risk analysis docs (BRA series)
├── Compliance-Execution-Sprints/ CES planning docs, PM audit
├── Documentations/               Reference docs, migration records
│   ├── DataCleanup/              [new] Data cleanup inventory
│   ├── DesignInventory/          [new] Document design inventory
│   ├── MigratedRepoRoot/         Migrated business risk docs
│   ├── Policy-HH-Map/            [new] Policy-to-HH section mapping
│   ├── Survey-Simulation/        Survey simulation planning
│   └── System_Documentation/    ★ THIS folder (being created)
├── Journey/                      Training blueprint files
│   ├── ACHC_Required_Annual_Training/
│   │   ├── Blueprint/            M01-M12 module blueprints (Marites/Tess journey)
│   │   └── ComfyUI-Pipeline/     Image generation pipeline for training visuals
└── UserProfiles/                 User profile architecture docs
```

---

## Key Files Summary

| File | Category | Notes |
|---|---|---|
| `src/App.tsx` | Routing | All 60+ routes defined here |
| `src/auth/AuthProvider.tsx` | Auth | Cognito + demo bypass logic |
| `src/policy/ces/types.ts` | Types | CES canonical types |
| `src/policy/pm/types.ts` | Types | PM/eCIgn canonical types |
| `src/policy/types/types.ts` | Types | Core domain (Policy, PolicyVersion) |
| `src/policy/compliance-execution/complianceExecutionStore.ts` | State | Main CES Zustand store |
| `src/policy/components/CommandCenterLayout.tsx` | Layout | App shell (sidebar + header) |
| `server/index.ts` | Backend | Express entry, all routes |
| `server/ia/service.ts` | AI | IaService (Ollama RAG) |
| `server/ecign/data/*.jsonl` | Persistence | JSONL signature/form store |
| `.env.example` | Config | Environment variable reference |
| `vite.config.ts` | Build | Vite + proxy config |
| `server/credentials/service-account.json` | ⚠️ Security | Google credential — should not be in repo tree |

---

## Deprecated / Backup / Duplicate Files

| File | Issue |
|---|---|
| `src/policy/pages/DashboardPage.tsx.backup` | Orphaned backup |
| `src/policy/pages/MasterCalendarPage.tsx.backup` | Orphaned backup |
| `src/policy/pages/TaxonomyPage.old.tsx` | Old version |
| `src/policy/onboarding/` | Legacy V1 (V2 exists) |
| `src/policy/components/regulatory/WorkflowDrawer.tsx` | Duplicate name as `ces/components/details/WorkflowDrawer.tsx` |
| `src/policy/components/regulatory/EvidencePanel.tsx` | Duplicate name as `onboarding-v2/components/EvidencePanel.tsx` |
| `src/policy/components/regulatory/KpiTile.tsx` | Duplicate name as `onboarding-v2/components/KpiTile.tsx` |
| `tmp-*.json/log` (root, ~20 files) | Temp/debug files in root |
| `src/policy/PolicyDesign(light).html` | Invalid filename (parentheses) |
