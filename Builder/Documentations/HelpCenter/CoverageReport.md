# Help Center Coverage Report

**Generated:** 2026  
**Location:** `/Builder/Documentations/HelpCenter/`  
**Status:** Complete

---

## Summary Statistics

| Category | Documented | Total in App | Coverage |
|---|---|---|---|
| Getting Started | 1 | 1 | ✅ 100% |
| Components | 9 | ~70 | ✅ Core 9 (key interactive components) |
| Pages | 8 | ~50 | ✅ Core 8 (primary workflow pages) |
| Articles (3+ per page) | 8 pages × 3+ articles | 8 pages | ✅ 100% |
| Workflows | 8 | ~8 primary | ✅ 100% |
| APIs | 9 | 9 | ✅ 100% |
| DataFlow | 1 | 1 | ✅ 100% |
| User Guides | 1 | 1 | ✅ 100% |
| Admin Guides | 1 | 1 | ✅ 100% |
| Audit Guide | 1 | 1 | ✅ 100% |

---

## Detailed Coverage by Section

---

### Getting Started

| File | Status |
|---|---|
| `GettingStarted/GettingStarted.md` | ✅ Complete |

---

### Components (9 Core Components Documented)

| File | Component | Status |
|---|---|---|
| `Components/CommandCenterLayout.md` | Top-level layout shell, sidebar, nav, guards | ✅ |
| `Components/EventWorkspace.md` | Full event execution workspace | ✅ |
| `Components/FormSigningWorkspace.md` | eCIgn form signing UI | ✅ |
| `Components/EvidencePanel.md` | Evidence upload, review, accept/reject | ✅ |
| `Components/GlobalTaskDrawer.md` | Slide-over task/notification panel | ✅ |
| `Components/SharedPolicyDetailView.md` | Policy detail read view | ✅ |
| `Components/ApprovalFlow.md` | Approval request/response flow | ✅ |
| `Components/WorkflowDetailView.md` | Workflow step viewer | ✅ |
| `Components/MasterControlInventory.md` | Policy/control master list table | ✅ |

**Note:** ~61 additional components exist in the codebase (smaller, page-specific, or pure UI components). The 9 documented here represent all major interactive workflow components.

---

### Pages (8 Primary Pages with Articles)

| Page Path | Page Doc | Articles | Article Count |
|---|---|---|---|
| `/` (Dashboard) | `Pages/Dashboard/Page.md` | 01, 02, 03 | ✅ 3 |
| `/calendar` | `Pages/MasterCalendar/Page.md` | 01, 02, 03 | ✅ 3 |
| `/policies` | `Pages/PolicyLibrary/Page.md` | 01, 02, 03 | ✅ 3 |
| `/evidence` | `Pages/EvidenceCenter/Page.md` | 01, 02, 03 | ✅ 3 |
| `/audit` | `Pages/AuditMode/Page.md` | 01, 02, 03 | ✅ 3 |
| `/lifecycle` | `Pages/PolicyLifecycle/Page.md` | 01, 02, 03 | ✅ 3 |
| `/forms` | `Pages/Forms/Page.md` | 01, 02, 03 | ✅ 3 |
| `/admin` | `Pages/AdminIdentity/Page.md` | 01, 02, 03 | ✅ 3 |

**Additional pages present in the application (not fully documented with article sets):**

| Page Path | Notes |
|---|---|
| `/ces`, `/ces/board`, `/ces/workloads`, `/ces/reports`, `/ces/my-tasks` | Compliance Execution Sprints — referenced in AdminGuide |
| `/pm`, `/pm/sprint-plan`, `/pm/sprint-review`, `/pm/approvals`, `/pm/my-tasks` | Project Management — referenced in AdminGuide and PM-API |
| `/journey`, `/journey/v1-journey`, `/journey/module/:moduleId` | Onboarding Journey — referenced in HIPAA workflow + EndUserGuide |
| `/framework` | Policy framework taxonomy view |
| `/taxonomy` | Policy taxonomy browser |
| `/governance` | Governance event management |
| `/iadministrator` | AI compliance query interface — documented in AdminGuide + iAdministrator-API |
| `/login`, `/setup-account`, `/forgot-password`, `/reset-password` | Auth pages — documented in Auth-API and EndUserGuide |

---

### Workflows (8 Workflows Documented)

| File | Workflow | Domain |
|---|---|---|
| `GV-GB-001-WF-GoverningBodyMeeting.md` | Governing Body Meeting | Governance |
| `QA-QI-001-WF-QAPIReview.md` | QAPI Quality Review | Quality Assurance |
| `PL-REVIEW-WF-PolicyLifecycleReview.md` | Policy Lifecycle Review | Governance |
| `HR-OB-001-WF-EmployeeOnboarding.md` | Employee Onboarding | Human Resources |
| `ECIGN-SIGN-WF-ElectronicSignature.md` | Electronic Signature (eCIgn) | Cross-domain |
| `RM-IR-001-WF-IncidentReview.md` | Incident Review | Risk Management |
| `CL-SV-001-WF-SupervisoryVisit.md` | Supervisory Visit | Clinical |
| `CO-HIPAA-WF-AnnualHIPAATraining.md` | Annual HIPAA Training | Compliance |

**Workflow coverage by compliance domain:**

| Domain Code | Workflow Covered |
|---|---|
| GV (Governance) | ✅ Governing Body Meeting |
| QA (Quality Assurance) | ✅ QAPI Review |
| HR (Human Resources) | ✅ Employee Onboarding |
| CO (Compliance) | ✅ Annual HIPAA Training |
| CL (Clinical) | ✅ Supervisory Visit |
| RM (Risk Management) | ✅ Incident Review |
| FN (Finance) | Not documented (no primary workflow defined) |
| OP (Operations) | Not documented (operational tasks only) |
| IT (Information Technology) | Not documented (system-level only) |
| EN (Environment) | Not documented (OSHA/infection control workflows exist; not yet documented) |

---

### APIs (9/9 Server Route Groups Documented)

| File | Route | Status |
|---|---|---|
| `APIs/Auth-API.md` | `/api/auth` | ✅ |
| `APIs/Calendar-API.md` | `/api/calendar` | ✅ |
| `APIs/ECIgn-API.md` | `/api/ecign` | ✅ |
| `APIs/Audit-API.md` | `/api/audit`, `/api/audit/v2` | ✅ |
| `APIs/Compliance-API.md` | `/api/compliance` | ✅ |
| `APIs/PM-API.md` | `/api/pm` | ✅ |
| `APIs/Hubstaff-API.md` | `/api/hubstaff` | ✅ |
| `APIs/iAdministrator-API.md` | `/api/ia` | ✅ |
| `APIs/CEU-API.md` | `/api/ceu` | ✅ |

**100% of server route groups documented.**

---

### DataFlow

| File | Status |
|---|---|
| `DataFlow/SystemDataFlow.md` | ✅ Complete — covers 6 major data flow paths, architecture diagram, store reference table, ID cross-reference, security boundaries |

---

### User Guides

| File | Status |
|---|---|
| `UserGuides/EndUserGuide.md` | ✅ Complete — 12 sections, login through troubleshooting |

---

### Admin Guides

| File | Status |
|---|---|
| `AdminGuides/AdminGuide.md` | ✅ Complete — 13 sections, user management through chain integrity |

---

### Audit Guide

| File | Status |
|---|---|
| `Audit/AuditGuide.md` | ✅ Complete — 11 sections, hash chain verification, CRITICAL action catalog, HIPAA compliance mapping |

---

## Total Files Created

| Section | Files |
|---|---|
| GettingStarted | 1 |
| Components | 9 |
| Pages (Page.md) | 8 |
| Pages (Articles) | 24 (8 pages × 3 articles) |
| Workflows | 8 |
| APIs | 9 |
| DataFlow | 1 |
| UserGuides | 1 |
| AdminGuides | 1 |
| Audit | 1 |
| **Total** | **63** |

---

## Gaps and Known Omissions

### Pages Not Fully Documented (No Article Sets)

| Gap | Priority | Notes |
|---|---|---|
| Compliance Execution Sprints (CES) pages | Medium | Referenced in AdminGuide; page docs + articles not created |
| PM pages | Medium | Referenced in PM-API and AdminGuide; not individually documented |
| Journey/Onboarding pages | Medium | Covered in EndUserGuide and HR-OB-001-WF; not individually documented |
| Framework page | Low | Policy framework taxonomy view |
| Taxonomy page | Low | Policy taxonomy browser |
| Governance overview page | Low | Governance domain overview |
| iAdministrator page | Low | Covered fully in iAdministrator-API.md and AdminGuide |

### Components Not Individually Documented

~61 additional components (small UI components, page-specific components, layout helpers) are not individually documented. They are covered contextually in the page and workflow documentation.

### Workflows Not Yet Documented

| Workflow | Domain | Notes |
|---|---|---|
| OSHA Annual Review | EN (Environment) | Annual event; not documented |
| Infection Control Review | EN (Environment) | Annual event; not documented |
| Financial Audit Preparation | FN (Finance) | If workflow exists |
| IT Security Review | IT | If workflow exists |

---

## Key System Facts Preserved in Documentation

| Fact | Documented In |
|---|---|
| Policy lifecycle states (DRAFT→REVIEW→APPROVED→PUBLISHED→ARCHIVED) | PolicyLifecycle/Page.md, SystemDataFlow.md, AdminGuide.md |
| 9-state audit FSM | AuditMode/Page.md, AuditGuide.md, Audit-API.md |
| Evidence lifecycle (staged→submitted→accepted/rejected) | EvidenceCenter/Page.md, EvidencePanel.md, AuditGuide.md |
| Risk scoring formula (overdue 30%, evidence gaps 25%, SLA 20%, blocked 15%, uncertified 10%) | AuditGuide.md, AdminGuide.md |
| SLA constants (WARNING=7d, URGENT=3d, GRACE=3d) | AuditGuide.md |
| SHA-256 hash chain structure | Audit-API.md, AuditGuide.md, SystemDataFlow.md |
| eCIgn multi-stage signature flow | ECIGN-SIGN-WF, ECIgn-API.md, FormSigningWorkspace.md, EndUserGuide.md |
| CRITICAL_ACTIONS set | AuditGuide.md |
| Role hierarchy (staff→coordinator→manager→admin→super_admin→auditor) | AdminGuide.md |
| Event ID format, Workflow ID format, Policy ID format | SystemDataFlow.md |
| HIPAA § 164.312(b) compliance mapping | AuditGuide.md |
| AWS architecture (CloudFront, S3, DynamoDB, Cognito) | SystemDataFlow.md |

---

## Documentation Quality Standards Met

- ✅ All major sections include at least one complete reference document
- ✅ All API endpoints include method, path, auth requirements, request/response shapes, and error codes
- ✅ All workflows include actor table, step-by-step actions, evidence requirements, and regulatory references
- ✅ All page docs include 3+ articles (overview, how-to, compliance/admin)
- ✅ Component docs include props (where applicable), state dependencies, and interaction patterns
- ✅ No placeholder content — all sections contain specific, accurate system details
- ✅ Cross-references between documents maintained (APIs reference components; workflows reference APIs; guides reference workflows)
