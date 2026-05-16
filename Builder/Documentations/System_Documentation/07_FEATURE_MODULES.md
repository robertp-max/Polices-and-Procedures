# 07 — Feature Modules

**Generated:** 2026-05-12

---

## Module 1: Policy Library

**Purpose:** Browse, view, and manage the agency's full policy corpus across all compliance domains.

**Routes:** `/library`, `/library/:policyId`, `/policies/:policyId`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/pages/LibraryPage.tsx` | Main library listing |
| `src/policy/pages/PolicyDetailPage.tsx` | Policy detail view |
| `src/policy/components/PolicyLibraryDocumentView.tsx` | Document view component |
| `src/policy/components/SharedPolicyDetailView.tsx` | Shared detail view |
| `src/policy/components/PolicyDetailModal.tsx` | Policy detail modal |
| `src/policy/data/policyCorpus.ts` | Static policy list |
| `src/policy/data/policyContentMap.ts` | Policy ID → content mapping |
| `src/policy/data/allPoliciesContent.generated.ts` | Generated full content |
| `src/policy/stores/policyStore.ts` | Policy Zustand store |
| `src/policy/types/types.ts` | Policy, PolicyVersion, Domain types |

**Data Used:** Static TypeScript data files (`policyCorpus.ts`, `policyContentMap.ts`). Content is markdown or placeholder. No live database reads for policy content.

**Current Functionality:** Policy browsing, domain/subdomain filtering, policy detail view, print view.

**Missing / Broken:**
- No real-time policy editing UI
- Policy content is static — edits require code changes
- Print views exist but completeness varies by policy

**Known Risks:** All policy content is bundled in the frontend — large bundle size. `allPoliciesContent.generated.ts` is likely very large.

---

## Module 2: Policy Lifecycle (Draft → Review → Approve → Publish)

**Purpose:** Manage policy version lifecycle states through a structured approval workflow.

**Routes:** `/policy-lifecycle`, `/policy-lifecycle/:policyId`

**Old Routes (redirected):** `/drafts`, `/review`, `/publish`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/pages/PolicyLifecyclePage.tsx` | Unified lifecycle page |
| `src/policy/lifecycle/lifecycleStore.ts` | Lifecycle state store |
| `src/policy/lifecycle/stateMachine.ts` | Lifecycle state machine |
| `src/policy/lifecycle/lifecycleSeed.ts` | Seed data |
| `src/policy/lifecycle/types.ts` | Lifecycle types |
| `src/policy/utils/lifecycleGuards.ts` | Guard utilities |

**Data Used:** In-memory Zustand (`lifecycleStore`), seeded from static data.

**Current Functionality:** Policy lifecycle state viewing, approval queue management.

**Missing / Broken:** No durable persistence — lifecycle state resets on refresh.

---

## Module 3: Master Calendar

**Purpose:** View and manage compliance events in a unified calendar. Supports event execution workflow from the calendar view.

**Routes:** `/calendar`, `/calendar/event/:eventId` (+ sub-stages)

**Key Files:**
| File | Role |
|---|---|
| `src/policy/pages/MasterCalendarPage.tsx` | Calendar page |
| `src/policy/pages/MobileIncidentExecutionPage.tsx` | Event execution multi-stage page |
| `src/policy/components/regulatory/MonthGrid.tsx` | Month view |
| `src/policy/components/regulatory/TimelineMonth.tsx` | Timeline view |
| `src/policy/stores/calendarStore.ts` | Calendar Zustand store |
| `src/policy/stores/calendarSyncStore.ts` | Sync state |
| `src/policy/services/calendarApi.ts` | Google Calendar API client |
| `src/policy/data/regulatoryEvents.ts` | Static regulatory events |
| `src/policy/data/multiYearEvents.ts` | Multi-year schedule |
| `server/routes/calendar.ts` | Google Calendar Express route |
| `server/googleCalendar.ts` | Google Calendar service |

**Data Used:** Static regulatory events + Google Calendar API (when configured). Sync via `scripts/pushAllEvents.ts`.

**Current Functionality:** Monthly/timeline calendar views, event drill-down with workflow/task/evidence/approval sub-stages.

**Missing / Broken:**
- Google Calendar requires credential setup (`service-account.json`, calendar ID)
- Calendar sync is a one-way push (events pushed to Google Calendar, not pulled back with real-time state)
- `.backup` file indicates recent major refactor

---

## Module 4: CES (Compliance Execution Sprint System)

**Purpose:** Run time-boxed compliance sprints — organizing regulatory events into sprint cycles with kanban boards, workload views, and audit readiness tracking.

**Routes:** `/ces/dashboard`, `/ces/board`, `/ces/workloads`, `/ces/reports`, `/my-tasks`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/ces/types.ts` | CES canonical types |
| `src/policy/ces/pages/CesDashboardPage.tsx` | Executive dashboard |
| `src/policy/ces/pages/CesBoardPage.tsx` | Sprint kanban board |
| `src/policy/ces/pages/CesWorkloadsPage.tsx` | Workload distribution |
| `src/policy/ces/pages/CesReportsPage.tsx` | Reports |
| `src/policy/ces/pages/MyTasksPage.tsx` | My tasks (CES layer) |
| `src/policy/compliance-execution/complianceExecutionStore.ts` | Main CES Zustand store |
| `src/policy/compliance-execution/complianceExecutionTypes.ts` | Merged types |
| `src/policy/compliance-execution/stateMachine.ts` | Execution state machine |
| `src/policy/compliance-execution/useEventExecutionDataflow.ts` | Primary data hook |
| `src/policy/ces/obligations/` | Obligation selectors |
| `src/policy/ces/hooks/useEvidenceTracker.ts` | Evidence tracking hook |
| `src/policy/ces/hooks/useExecutionEnforcement.ts` | Enforcement hook |

**Data Used:** Merged from static regulatory events + CES seed data + autogen events. All in-memory.

**Current Functionality:** Sprint board, KPI dashboard, workload view, reports, my tasks, role-based review layer.

**Missing / Broken:**
- State not persisted — sprint state resets on refresh
- CES calendar route (`/ces/calendar`) is redirected to master calendar — the `CesCalendarPage.tsx` exists but is not routed

**Known Risks:** Large in-memory state with no backend persistence creates data loss risk.

---

## Module 5: Evidence Center

**Purpose:** Central evidence repository showing all evidence attached to compliance events and execution units.

**Route:** `/evidence`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/pages/EvidenceCenterPage.tsx` | Main evidence center |
| `src/policy/evidence/evidenceModel.ts` | Evidence model |
| `src/policy/evidence/cesEvidenceHierarchy.ts` | CES evidence hierarchy |
| `src/policy/evidence/demoEvidenceRuntimeCache.ts` | Demo runtime cache |
| `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx` | Evidence hierarchy panel |
| `src/policy/components/regulatory/EvidencePanel.tsx` | Regulatory evidence panel |
| `src/policy/onboarding-v2/components/EvidencePanel.tsx` | Onboarding evidence panel |
| `src/policy/data/achcHhEvidenceMap.ts` | ACHC ↔ HHC evidence mapping |

**Data Used:** Evidence derived from CES execution state + eCIgn records. Demo cache used in demo mode.

**Current Functionality:** Evidence listing and hierarchy view.

**Missing / Broken:** Evidence is largely derived from in-memory state — not durably linked to real documents. `demoEvidenceRuntimeCache.ts` suggests much of this is demo scaffolding.

---

## Module 6: eCIgn (Electronic Compliance Signatures)

**Purpose:** Legally defensible electronic signature system for compliance documents. Manages form instances through a state machine: created → disclosed → verified → reviewed → attested → signed_locked.

**Routes:** Embedded within event execution workflow (not standalone route). Form signing at `/forms/:formId` + `FormSigningWorkspace`.

**Key Files:**
| File | Role |
|---|---|
| `src/policy/ecign/api.ts` | eCIgn API client |
| `src/policy/ecign/demoLocalApi.ts` | Demo mode local API |
| `src/policy/ecign/useEcignInstance.ts` | Instance hook |
| `src/policy/ecign/useEcignSession.ts` | Session hook |
| `src/policy/ecign/signerIdentity.ts` | Signer identity |
| `src/policy/ecign/pdfAppendUtil.ts` | PDF append utility |
| `src/policy/ecign/buildSignerRosterHtml.ts` | Signer roster HTML builder |
| `src/policy/ecign/hhcEvidence.ts` | HHC evidence integration |
| `src/policy/components/FormSigningWorkspace.tsx` | Signing UI |
| `src/policy/components/FormSignatureFlow.tsx` | Signature flow |
| `src/policy/components/FormSignatureContext.tsx` | Signature context |
| `server/ecign/stateMachine.ts` | Server-side state machine |
| `server/ecign/store.ts` | JSONL persistence |
| `server/ecign/pdf.ts` | PDF generation |
| `server/ecign/hashChain.ts` | Hash chain integrity |
| `server/ecign/integrity.ts` | Integrity verification |
| `server/ecign/networkMetadata.ts` | Network metadata capture |
| `server/ecign/disclosures.ts` | Disclosure management |
| `server/ecign/compliance.ts` | Compliance layer |
| `server/routes/ecign.ts` | Express route |
| `server/ecign/data/*.jsonl` | Persistence files |

**Data Used:** Server JSONL files (durable). Demo mode uses in-memory local API.

**Current Functionality:** Form instance creation, state machine transitions, signature capture, PDF generation, hash chain integrity, audit event logging.

**Missing / Broken:**
- JSONL persistence is not production-grade (no transactions, no backups)
- S3 bucket/key fields in type definition but S3 not wired in current backend
- Demo mode (`demoLocalApi.ts`) bypasses real server — risk of demo running in shared environments

---

## Module 7: Forms Library

**Purpose:** Browse and view all agency forms. Supports form print, signing, and evidence capture.

**Routes:** `/forms`, `/forms/:formId`, `/forms/:formId/print`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/pages/FormsPage.tsx` | Forms listing |
| `src/policy/components/FormViewer.tsx` | Form viewer (inline) |
| `src/policy/pages/FormPrintView.tsx` | Form print view |
| `src/policy/data/formsCatalog.ts` | Forms catalog index |
| `src/policy/data/formsLibraryContent.ts` | Form content |
| `src/policy/data/formsLibraryContentCO_More.ts` | CO/More forms |
| `src/policy/data/formsLibraryContentHR_CL.ts` | HR/CL forms |
| `src/policy/data/formsLibraryContentJD.ts` | JD forms |
| `src/policy/data/formsLibraryDataset.ts` | Dataset |
| `src/policy/data/formAddendumBindings.ts` | Addendum bindings |
| `src/policy/pm/formInstances.ts` | Form instances |
| `src/policy/pm/formInstancesCore.ts` | Form instance core |

**Data Used:** Static TypeScript content files. No live API for form content.

**Current Functionality:** Form browsing, viewing, printing. Form-to-policy links via `policyFormLinks.ts`.

**Missing / Broken:** No form editor. All form content is hardcoded in TypeScript files.

---

## Module 8: Audit Mode

**Purpose:** Simulate ACHC surveyor view — presents policies and evidence as an auditor would see them.

**Route:** `/audit`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/pages/AuditModePage.tsx` | Audit mode page |
| `src/policy/audit/auditAggregate.ts` | Audit aggregation |
| `src/policy/audit/auditState.ts` | Audit state |
| `src/policy/audit/dependencyCheck.ts` | Dependency checking |
| `src/policy/audit/exportReport.ts` | Report export |
| `src/policy/audit/riskScoring.ts` | Risk scoring |
| `src/policy/audit/surveyPacket.ts` | Survey packet builder |
| `src/policy/audit/workflowInstance.ts` | Workflow instance |
| `src/policy/stores/auditorModeStore.ts` | Auditor mode store |
| `src/policy/pages/AchcSurveyAlignmentPage.tsx` | ACHC survey alignment |
| `src/policy/pages/SurveyorPolicyViewerPage.tsx` | Surveyor view |
| `src/policy/data/achcSurveyProjection.generated.ts` | Generated survey projection |
| `src/policy/data/achcSurveyTags.generated.ts` | Generated survey tags |

**Data Used:** Static ACHC data + generated projection files.

**Current Functionality:** Surveyor view simulation, ACHC alignment display, survey packet builder.

**Known Risks:** Audit mode shows mock/generated data — may not reflect actual readiness.

---

## Module 9: iAdministrator (Brad AI Assistant)

**Purpose:** AI-powered compliance advisor. Answers natural language questions about policies, events, and compliance requirements. Powered by local Ollama RAG or mock engine.

**Route:** `/iadministrator`

*(See doc 09 for full Brad/AI architecture detail.)*

---

## Module 10: Journey / LMS Training

**Purpose:** Train employees through ACHC-required annual training modules (M01–M12). Includes pre-assessment, lessons, assessments, and post-assessment signature capture.

**Routes:** `/journey`, `/journey/module/:moduleId`, `/journey/supervisor`, `/journey/admin`, etc.

**Key Files:**
| File | Role |
|---|---|
| `src/policy/journey/pages/JourneyHomePage.tsx` | Journey home |
| `src/policy/journey/pages/ModulePlayerPage.tsx` | Module player |
| `src/policy/journey/data/modules.ts` | Module definitions (M01-M12) |
| `src/policy/journey/data/achcLessons_M01_M04.data.ts` | M01-M04 lesson content |
| `src/policy/journey/data/achcLessons_M05_M08.data.ts` | M05-M08 lesson content |
| `src/policy/journey/data/achcLessons_M09_M12.data.ts` | M09-M12 lesson content |
| `src/policy/journey/data/achcAnnualTests.data.ts` | Annual test content |
| `src/policy/journey/data/achcFinalAssessmentLessons.data.ts` | Final assessment |
| `src/policy/journey/data/employees.ts` | Employee roster |
| `src/policy/journey/stores/journeyStore.ts` | Journey progress store |
| `src/policy/journey/scorm/ScormRuntime.ts` | SCORM runtime |
| `src/policy/journey/utils/gating.ts` | Module gating logic |
| `src/policy/journey/utils/escalation.ts` | Escalation logic |
| `src/policy/journey/components/ScormPlayer.tsx` | SCORM player |
| `src/policy/journey/components/SignaturePad.tsx` | Signature capture |

**Training Modules Detected (M01-M12):**
- M01: Cultural Awareness
- M02: Emergency & Disaster
- M03: Complaints & Grievances
- M04: HIPAA
- M05: Infection Control
- M06: Communication Barriers
- M07: Workplace/Patient Safety (OSHA)
- M08: Patient Rights & Responsibilities
- M09: Corporate Compliance
- M10: Ethics
- M11: TB & Bloodborne Pathogens
- M12: Medical Device Act

**Data Used:** Static lesson content TypeScript files. Employee roster is static.

**Current Functionality:** Module listing, lesson playback, gating logic, supervisor view, admin view, SCORM integration (partial).

**Missing / Broken:**
- Journey progress is in-memory only — completion is lost on refresh
- Employee roster is static — no live HR integration
- SCORM runtime appears wired but completeness unclear
- Staging M01 (`/journey/staging/m01`) is prototype/demo

---

## Module 11: Onboarding V2 (Audit-Grade Activation Engine)

**Purpose:** Structured employee onboarding with audit-grade evidence — policy acknowledgments, training completions, batch management, and activation gates.

**Routes:** `/onboarding-v2/*`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/onboarding-v2/pages/DashboardPage.tsx` | Onboarding dashboard |
| `src/policy/onboarding-v2/pages/ActivationPage.tsx` | Activation flow |
| `src/policy/onboarding-v2/pages/BatchListPage.tsx` | Batch management |
| `src/policy/onboarding-v2/pages/BatchViewPage.tsx` | Batch detail |
| `src/policy/onboarding-v2/pages/AuditReadinessPage.tsx` | Audit readiness |
| `src/policy/onboarding-v2/engine/engine.ts` | Activation engine |
| `src/policy/onboarding-v2/engine/gates.ts` | Gate definitions |
| `src/policy/onboarding-v2/engine/audit.ts` | Audit trail |
| `src/policy/onboarding-v2/engine/reconciler.ts` | State reconciliation |
| `src/policy/onboarding-v2/store/onboardingV2Store.ts` | Onboarding V2 store |
| `src/policy/onboarding-v2/store/seed.ts` | Seed data |
| `src/policy/onboarding-v2/catalog/policies.ts` | Policy catalog |
| `src/policy/onboarding-v2/catalog/requirements.ts` | Requirement catalog |
| `src/policy/onboarding-v2/catalog/roles.ts` | Role catalog |
| `src/policy/onboarding-v2/catalog/templates.ts` | Templates |

**Data Used:** In-memory store seeded from catalog files.

**Current Functionality:** Batch creation, employee assignment, gate progression, audit readiness view, governance view.

**Missing / Broken:**
- No durable persistence for onboarding state
- Relationship with Onboarding V1 (`src/policy/onboarding/`) unclear — V1 should likely be deprecated

---

## Module 12: Workflow Library

**Purpose:** Browse and view compliance workflow templates. Linked to policies and events.

**Route:** `/workflows/*` (nested routing inside `WorkflowLibraryApp`)

**Key Files:**
| File | Role |
|---|---|
| `src/policy/workflows/WorkflowLibraryApp.tsx` | Workflow library SPA |
| `src/policy/workflows/components/LandingView.tsx` | Landing/listing |
| `src/policy/workflows/components/WorkflowCard.tsx` | Workflow card |
| `src/policy/workflows/components/WorkflowDetailView.tsx` | Detail view |
| `src/policy/workflows/components/LinkedWorkflows.tsx` | Linked workflows |
| `src/policy/data/workflows.generated.ts` | Generated workflows |
| `src/policy/data/workflowTemplates.generated.ts` | Generated templates |
| `src/policy/data/workflowGraph.generated.ts` | Generated workflow graph |

**Data Used:** Generated static workflow data.

---

## Module 13: PM Layer (Project Management)

**Purpose:** Overlay project management view over CES + eCIgn tasks. Provides sprint planning, review, approvals queue, and PM dashboard.

**Routes:** `/pm/my-tasks`, `/pm/sprint-plan`, `/pm/sprint-review`, `/pm/approvals`, `/pm/dashboard`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/pm/types.ts` | PM canonical types |
| `src/policy/pm/taskProjection.ts` | Task projection |
| `src/policy/pm/taskProjectionCore.ts` | Core projection |
| `src/policy/pm/sprintWindows.ts` | Sprint windows |
| `src/policy/pm/sprintId.ts` | Sprint ID generation |
| `src/policy/pm/featureFlags.ts` | Feature flags |
| `src/policy/pm/scheduling/sprintAllocator.ts` | Sprint allocation |
| `src/policy/pm/scheduling/dependencyGraph.ts` | Task dependencies |
| `src/policy/pm/api/pmApiClient.ts` | PM API client |
| `server/routes/pm.ts` | PM Express route |

**Data Used:** Projected from CES execution state + eCIgn form instances.

---

## Module 14: Admin / Identity Management

**Purpose:** Manage user groups, roles, permissions, and user-role assignments.

**Routes:** `/admin/user-groups`, `/admin/roles`, `/admin/permissions`, `/admin/users`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/security/identity/UserGroupsPage.tsx` | User groups |
| `src/policy/security/identity/AdminRolesPage.tsx` | Roles |
| `src/policy/security/identity/PermissionCatalogPage.tsx` | Permissions |
| `src/policy/security/identity/UserAssignmentsPage.tsx` | User assignments |
| `src/policy/security/identity/permissionCatalog.ts` | Permission definitions |
| `src/policy/security/identity/roleAssignments.ts` | Role assignment data |
| `src/policy/security/identity/userGroups.ts` | User group data |
| `src/policy/security/identity/demoUsers.ts` | Demo user definitions |
| `src/policy/security/identity/userAssignmentsStore.ts` | Assignments store |
| `src/policy/security/identity/separationOfDuties.ts` | SOD rules |
| `src/policy/security/identity/AdminRouteGuard.tsx` | Route protection |
| `server/access/pdp.ts` | Policy Decision Point |
| `server/access/pep.ts` | Policy Enforcement Point |
| `server/access/sod.ts` | Separation of duties |

**Current Functionality:** View and manage user groups, roles, permissions. SOD enforcement.

**Missing / Broken:** Assignment changes may not persist to DynamoDB — unclear if API calls are wired.

---

## Module 15: ACHC Survey Alignment

**Purpose:** Display ACHC survey standards with crosswalk to agency policies, showing alignment and gaps.

**Routes:** `/framework/achc-survey`, `/framework`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/pages/AchcSurveyAlignmentPage.tsx` | ACHC survey alignment |
| `src/policy/pages/FrameworkPage.tsx` | Framework overview |
| `src/policy/data/achcSurveyProjection.generated.ts` | Generated ACHC projection |
| `src/policy/data/achcSurveyTags.generated.ts` | ACHC tags |
| `src/policy/data/achcHhEvidenceMap.ts` | ACHC → HHC evidence map |
| `src/policy/data/achcStandardTargetResolver.ts` | Standard resolver |
| `src/policy/data/achcSupportAnchors.ts` | Support anchors |
| `src/policy/data/achcAttachmentCrosswalk.generated.ts` | Attachment crosswalk |
| `scripts/buildAchcSurveyProjection.mjs` | Projection builder script |

---

## Module 16: Governance

**Purpose:** View governing body structure, responsibilities, and related policies.

**Route:** `/governance`

**Key Files:**
- `src/policy/pages/GovernancePage.tsx`
- `src/policy/pages/GVGBDetailView.tsx`
- `src/policy/pages/GVGBPrintDocument.tsx`
- `src/policy/pages/GVGBAppendixPrint.tsx`
- `src/policy/pages/GVPolicyDetailView.tsx`

---

## Module 17: Help Center

**Purpose:** Contextual knowledge base providing help articles for each feature area.

**Route:** `/help/*`

**Key Files:**
| File | Role |
|---|---|
| `src/policy/help/HelpCenterPage.tsx` | Help center page |
| `src/policy/help/contextualArticleMap.ts` | Article routing map |
| `src/policy/help/articles/*.ts` | 15 help article content files |
| `src/policy/components/help/ContextualKnowledgeBulb.tsx` | In-page help trigger |

**Help articles available for:** audit-mode, calendar, compliance-audit, dashboard, developer-ecign, evidence-center, forms-templates, getting-started, iadministrator, master-controls, onboarding-v2, policy-lifecycle, signing-documents, workflows-events.

---

## Module 18: Master Control Inventory

**Purpose:** Display and manage the master control inventory — all ACHC/regulatory controls mapped to policies and evidence.

**Route:** `/compliance/master-controls`

**Key Files:**
- `src/policy/pages/MasterControlInventoryPage.tsx`
- `src/policy/components/MasterControlInventory.tsx`
- `src/policy/data/masterControlInventory.ts`
- `src/policy/types/masterControlInventory.ts`
- `scripts/syncMasterControlInventory.mjs` (sync script run before dev/build)

---

## Module 19: Hubstaff Integration (Staging)

**Purpose:** Time-tracking integration bridge for Hubstaff task management.

**Route:** `/hubstaff`

**Key Files:**
- `src/policy/pages/HubstaffStagingPage.tsx`
- `src/policy/data/hubstaffTasks.ts`
- `server/routes/hubstaff.ts`
- `scripts/pushToHubstaff.ts`

**Status:** Staging / partial — not production-ready.
