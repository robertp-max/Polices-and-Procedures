# PRODUCTION SURFACE FILTER — NON-NEGOTIABLE SCOPE BOUNDARY

**Date**: 2026-05-15  
**Purpose**: This document is the single source of truth for what is IN and OUT of the mobile-first surgical reconstruction. Any work outside these boundaries is explicitly deprioritized, non-canonical, and must not pollute the primary mobile shell, navigation architecture, or implementation phases.

---

## EXCLUDED — NON-CANONICAL / NON-PRIORITY (Do Not Optimize, Do Not Include in Mobile Shell or Primary Nav)

These surfaces are treated as isolated utility/admin/developer/experimental surfaces. They may remain for internal use but must be removed from primary clinician/DON/surveyor navigation paths and are excluded from all mobile-first optimization, canonical component work, and IA reconstruction.

- **Demo surfaces**:
  - DemoPage.tsx
  - DemoPhase2.tsx
  - DemoPhase3.tsx
  - Any component containing "DemoCritical*" or "Demo" in iAdministrator/

- **Hubstaff integration**:
  - HubstaffStagingPage.tsx
  - All Hubstaff-specific workflows, notifications, and staging surfaces

- **Executive / Brad proposal surfaces**:
  - BradProposal/ (entire folder and route /brad-proposal)
  - iAdministrator/ (entire surface and route /iadministrator) — contains heavy demo/experimental components (DemoCriticalEmergencyResponse, DemoCriticalOrchestrationPanel, etc.)

- **Architecture / developer / internal diagnostic**:
  - FrameworkPage.tsx (architecture/showcase)
  - SystemDocumentationPage.tsx (internal docs)
  - TaxonomyPage.tsx and TaxonomyPage.old.tsx
  - MasterControlInventoryPage.tsx (data/admin heavy)
  - GenericReferenceViewer.tsx when used for diagnostics
  - Any architecture visualization or system diagram routes

- **Legacy / backup / experimental**:
  - DashboardPage.tsx.backup
  - MasterCalendarPage.tsx.backup
  - Any .backup or .old files in src/policy/pages/
  - Non-production exploratory UI surfaces

**Rule**: These must not appear in the primary bottom nav or "More" menu for operational users. They may live behind admin/dev feature flags or be fully deprecated if redundant.

---

## INCLUDED — CANONICAL PRODUCTION OPERATIONAL SURFACES (The Only Things That Matter)

These are the real production workflows used daily by field clinicians, DONs, surveyors, and compliance officers. These are the ONLY surfaces that drive the mobile shell design, IA reconstruction, component canonicalization, and all implementation phases.

### Core Operational Daily Use
- `/dashboard` — Operational overview for DONs/compliance (tasks, exceptions, sign-offs)
- `/library` + `/library/:policyId` + `/policies/:policyId` + PolicyDetailPage + SharedPolicyDetailView + GVGBDetailView (GV-GB-001 as honored specimen) — Real policy review and reference during visits/surveys
- `/policy-lifecycle` — Real policy governance workflow (drafts, review, approval)
- `/forms` + `/forms/:formId` (FormViewer + FormSigningWorkspace) — Real eCign signing for WAPI, acknowledgments, clinical forms (highest frequency operational signing)
- `/evidence` + `/artifacts/:artifactId` + CesEvidenceHierarchyPanel — Real evidence capture, hierarchy, signed package review
- All CES surfaces:
  - `/ces/dashboard`
  - `/ces/board`
  - `/ces/workloads`
  - `/ces/reports`
  - `/my-tasks` + `/pm/my-tasks` + `/pm/sprint-plan` + `/pm/sprint-review` + `/pm/approvals` + `/pm/dashboard` — Real task execution, sprint planning, approvals
- `/calendar` + `/calendar/event/:eventId/*` + MobileIncidentExecutionPage — Real event/task/evidence/approval drill-down (unified operational calendar)
- Onboarding V2 (real regulatory activation):
  - `/onboarding-v2/dashboard`
  - `/onboarding-v2/activate`
  - `/onboarding-v2/batches`
  - `/onboarding-v2/batches/:batchId`
  - `/onboarding-v2/audit`
  - `/onboarding-v2/governance`
- Journey real compliance training (filter pure theatrical prototype):
  - `/journey` (home for real modules)
  - `/journey/v1-journey` (real ACHC/CMS lessons)
  - `/journey/module/:moduleId` (real module player + evidence capture + supervisor sign-off)
  - `/journey/supervisor`
  - `/journey/admin` (training admin for compliance coordinators)
  - Note: `/journey/staging/m01` (Marites cinematic prototype) is borderline — treat as non-priority for mobile shell unless explicitly required for cultural competency regulatory training.
- `/audit` — Real Audit Mode for compliance officers
- `/framework/achc-survey` + AchcSurveyAlignmentPage + `/surveyor/policy/:policyId` + SurveyorPolicyViewerPage — Real ACHC/surveyor on-site workflow
- `/help/*` — Operational help and contextual knowledge for field users
- Operational staffing (clinician/patient profiles for compliance context):
  - `/clinicians` + `/clinicians/:clinicianId`
  - `/patients` + `/patients/:patientId`
  - `/staffing-calendar`
- `/governance` — If used in daily compliance governance

**Rule**: The primary mobile shell navigation (bottom nav + task context + global queue) must be designed exclusively around these surfaces. Everything else is secondary or hidden.

---

## OPERATIONAL USER PERSONAS (The Only Ones That Drive Design Decisions)

1. **Field Clinician** (RN/LVN/HHA) — In-home visits, one-handed use, high interruption, weak signal, needs fast task completion + evidence + signature.
2. **DON / Clinical Manager** — Daily sign-off queue, exception handling, audit readiness, multi-patient oversight.
3. **Surveyor / ACHC Auditor** — On-site policy review, evidence verification, finding logging, report generation under time pressure.
4. **Compliance Officer** — CES board, task assignment, evidence review, audit trail monitoring, policy lifecycle.
5. **Training Coordinator** — Real Journey/LMS assignment, progress tracking, supervisor sign-off, regulatory competency gaps.

All design decisions, IA, component behavior, and mobile ergonomics must be validated against these personas first.

---

## ENFORCEMENT

- Any new feature or surface that does not map to one of the INCLUDED operational personas or surfaces must be reviewed by the Reconstruction Governance Body and either:
  - Added to the canonical list with justification, or
  - Explicitly placed in the EXCLUDED category (admin/dev/demo only).
- Primary navigation must never be polluted by excluded surfaces.

This filter is non-negotiable for the entire reconstruction program. Violating it reintroduces the exact fragmentation the project is trying to eliminate.