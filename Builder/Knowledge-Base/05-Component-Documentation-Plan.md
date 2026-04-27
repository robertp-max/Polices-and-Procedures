# 05 — Component Documentation Plan

> **Location:** `Builder/Knowledge-Base/05-Component-Documentation-Plan.md`
> **Status:** Authoritative documentation plan for major UI components. Each entry is a contract: purpose, data inputs, interactions, compliance behavior, enforcement rules, and the Help Center articles that surface from the component.

> **Target folder:** `Builder/Knowledge-Base/Developer-Reference/Components/<ComponentName>.md`. The plan below is the spec each MD file must implement.

---

## Standard component-doc template

Every component doc has these sections (no exceptions):

1. **Purpose** — one paragraph; what business problem it solves.
2. **Source** — file path(s) under `src/`.
3. **Routes that mount it** — list.
4. **Props / data inputs** — props table; data sources (stores, hooks, API).
5. **User interactions** — what the user can do; visible affordances.
6. **State & derived data** — what state is local vs lifted vs persisted.
7. **Compliance behavior** — what the component is responsible for from a compliance standpoint (evidence, audit events, gating).
8. **Enforcement rules** — what the component blocks, late-flags, hides, or refuses to render.
9. **Failure modes** — error states and what they mean to the user.
10. **Related Help Center articles** — slugs.
11. **Architecture refs** — links into `Architecture/`.

---

## 1. CES Dashboard — `CesExecutiveDashboard`

| Field | Spec |
|---|---|
| Source | [src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx](../../src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx), [pages/CesDashboardPage.tsx](../../src/policy/ces/pages/CesDashboardPage.tsx) |
| Routes | `/ces`, `/ces/dashboard` |
| Purpose | Top-of-funnel view: current sprint health, on-time %, blocked count, audit-readiness, upcoming calendar pressure. |
| Data inputs | Sprint store, calendar service, audit aggregate, workload service. |
| Interactions | Drill into board, calendar, workloads, reports. |
| Compliance behavior | Surfaces compliance-readiness metric to Tier 1/2; does not mutate state. |
| Enforcement | Read-only. Does not allow re-prioritization (calendar primacy). |
| Failure modes | Stale metric badge if last rollup > 24 h. |
| Related articles | `ces/board-overview`, `audit-reporting/compliance-metrics`, `audit-reporting/executive-reports` |
| Architecture refs | `Architecture/CES/`, `Architecture/Audit/Evidence-Model.md` |

## 2. Sprint Execution Board — `SprintExecutionBoard`

| Field | Spec |
|---|---|
| Source | [src/policy/ces/components/board/SprintExecutionBoard.tsx](../../src/policy/ces/components/board/SprintExecutionBoard.tsx) |
| Routes | `/ces/board` |
| Purpose | Workflow-organized columns over the 2-week sprint; the operational surface of CES. |
| Data inputs | Sprint, workflows, execution units, assignees, signature instances. |
| Interactions | Open card → drawer; reassign (gated); mark step complete; trigger signature; close sprint. |
| Compliance behavior | Enforces sequence; refuses out-of-order completion; emits audit events on every transition. |
| Enforcement | Closure gate: cannot close until evidence + signatures complete. Late-flag past calendar due date. Blocked badge if dependency unmet. |
| Failure modes | "Cannot complete: prior step pending"; "Cannot reassign: tier mismatch". |
| Related articles | `ces/board-overview`, `ces/working-an-execution-unit`, `ces/closing-a-sprint`, `ces/enforcement-rules`, `troubleshooting/why-blocked` |
| Architecture refs | `Architecture/CES/06-Sprint-Board-and-States.md`, `Architecture/CES/10-Enforcement-and-Rules.md`, `UIUX/CES/03-Board-Operation-In-Use.md` |

## 3. Execution Unit (Card) — `ExecutionUnitCard`

| Field | Spec |
|---|---|
| Source | [src/policy/ces/components/board/ExecutionUnitCard.tsx](../../src/policy/ces/components/board/ExecutionUnitCard.tsx) |
| Routes | rendered inside `/ces/board` |
| Purpose | Single executable unit of work tied to a workflow step. |
| Data inputs | Execution unit (workflow id, step id, owner, role, approver, signer, evidence refs, due date, state). |
| Interactions | Open drawer; quick-assign; quick-complete; attach evidence shortcut. |
| Compliance behavior | Visualizes assignment, due date, signature requirement, blocked reason. |
| Enforcement | Disables actions the current user is not authorized for (tier check). |
| Failure modes | "Blocked: prerequisite X"; "Late by N days"; "Awaiting signature". |
| Related articles | `ces/working-an-execution-unit`, `workflows-evidence/blocked-items`, `workflows-evidence/capturing-evidence` |
| Architecture refs | `Architecture/CES/03-Workflow-Based-Execution.md`, `04-Assignment-Model.md` |

## 4. Workflow Drawer — `WorkflowDrawer`

| Field | Spec |
|---|---|
| Source | [src/policy/ces/components/details/WorkflowDrawer.tsx](../../src/policy/ces/components/details/WorkflowDrawer.tsx) |
| Routes | overlay on `/ces/board` |
| Purpose | Detailed workflow view: full step list, evidence panel, signers, audit timeline. |
| Data inputs | Workflow definition, instance state, evidence list, signature instances, audit events. |
| Interactions | Step transitions; attach/remove evidence; request signature; reassign. |
| Compliance behavior | Drives evidence capture; orchestrates signature handoff to eCIgn. |
| Enforcement | Sequence enforcement; cannot skip; cannot remove evidence after lock; reassignment requires Compliance Officer. |
| Failure modes | "Step locked"; "Evidence required"; "Signer unavailable — assign delegate". |
| Related articles | `workflows-evidence/workflow-lifecycle`, `workflows-evidence/capturing-evidence`, `workflows-evidence/delegation`, `signatures-ecign/single-signature` |
| Architecture refs | `Architecture/CES/03-Workflow-Based-Execution.md`, `Architecture/Workflows/System.md`, `Architecture/Integrations/CES-eCIgn.md` |

## 5. Evidence Status Panel — sub-component of WorkflowDrawer

| Field | Spec |
|---|---|
| Source | within [WorkflowDrawer.tsx](../../src/policy/ces/components/details/WorkflowDrawer.tsx) (extract to `EvidenceStatusPanel.tsx` recommended) |
| Routes | inside WorkflowDrawer |
| Purpose | Show evidence-by-step state; missing, partial, complete, locked. |
| Data inputs | Evidence aggregate from `auditAggregate.ts`. |
| Interactions | Attach, replace (if not locked), view. |
| Compliance behavior | Source of truth for "evidence complete" gate. |
| Enforcement | After lock: read-only. Replace requires governance exception. |
| Failure modes | "Evidence type mismatch"; "Hash invalid"; "File rejected — template mutation detected". |
| Related articles | `workflows-evidence/capturing-evidence`, `workflows-evidence/evidence-rollup`, `troubleshooting/evidence-missing` |
| Architecture refs | `Architecture/Audit/Evidence-Model.md` |

## 6. Compliance Calendar — `ComplianceCalendar`

| Field | Spec |
|---|---|
| Source | [src/policy/ces/components/calendar/ComplianceCalendar.tsx](../../src/policy/ces/components/calendar/ComplianceCalendar.tsx), [pages/CesCalendarPage.tsx](../../src/policy/ces/pages/CesCalendarPage.tsx) |
| Routes | `/ces/calendar`, `/calendar` |
| Purpose | Authoritative calendar of mandated events; the source of work for CES. |
| Data inputs | Mandated events, multi-year events, sprint mapping, Google Calendar sync. |
| Interactions | View, filter, drill into event → workflow instance. |
| Compliance behavior | Drives sprint content; never demoted. |
| Enforcement | Cannot delete a mandated event from the UI; reschedules require Administrator + governance reason. |
| Failure modes | Sync failure banner; calendar drift warning. |
| Related articles | `ces/calendar-primacy`, `audit-reporting/compliance-calendar`, `troubleshooting/calendar-drift`, `administration/regulatory-calendar-management` |
| Architecture refs | `Architecture/CES/09-Calendar-Integration.md`, `Architecture/Regulatory-Planner/Mandated-Events.md` |

## 7. Workload Distribution View — `WorkloadDistribution`

| Field | Spec |
|---|---|
| Source | [src/policy/ces/components/workloads/WorkloadDistribution.tsx](../../src/policy/ces/components/workloads/WorkloadDistribution.tsx), [pages/CesWorkloadsPage.tsx](../../src/policy/ces/pages/CesWorkloadsPage.tsx) |
| Routes | `/ces/workloads` |
| Purpose | View load by owner / role / workflow; identify imbalance. |
| Data inputs | Sprint assignments, role registry. |
| Interactions | Filter by sprint, role, workflow; drill to assignee detail. |
| Compliance behavior | Read-only analytics. |
| Enforcement | n/a (no mutations). |
| Failure modes | n/a. |
| Related articles | `audit-reporting/workload-distribution`, `ces/bundling-strategy` |
| Architecture refs | `Architecture/CES/04-Assignment-Model.md`, `Architecture/CES/05-Work-Bundling-Strategy.md` |

## 8. Executive Reports — `ExecutiveReports`

| Field | Spec |
|---|---|
| Source | [src/policy/ces/components/reports/ExecutiveReports.tsx](../../src/policy/ces/components/reports/ExecutiveReports.tsx), [pages/CesReportsPage.tsx](../../src/policy/ces/pages/CesReportsPage.tsx) |
| Routes | `/ces/reports` |
| Purpose | On-time, blocked, audit-readiness, sprint completion %; export. |
| Data inputs | Metric aggregator. |
| Interactions | Date range, sprint selector, export PDF/CSV. |
| Compliance behavior | Reports are evidence; export is logged. |
| Enforcement | Tier 1/2 only. |
| Failure modes | "Aggregator stale"; "Export blocked — missing signatures". |
| Related articles | `audit-reporting/executive-reports`, `audit-reporting/compliance-metrics` |
| Architecture refs | `Architecture/CES/11-Metrics-and-Reporting.md` |

## 9. eCIgn Signing Workspace — `FormSigningWorkspace`

| Field | Spec |
|---|---|
| Source | [src/policy/components/FormSigningWorkspace.tsx](../../src/policy/components/FormSigningWorkspace.tsx), [FormSignatureContext.tsx](../../src/policy/components/FormSignatureContext.tsx), [FormSignatureFlow.tsx](../../src/policy/components/FormSignatureFlow.tsx) |
| Routes | `/forms/:formId` |
| Purpose | The 6-step signing surface for one signer on one form. |
| Data inputs | Form template, signer identity, geo / device info, eCIgn instance. |
| Interactions | Disclosure ack, identity confirmation, review, signature capture (canvas / camera), attestation, lock. |
| Compliance behavior | Emits audit events at every step; binds geo + device + timestamp. |
| Enforcement | Cannot proceed out of order; cannot edit template; cannot lock without identity + signature; tier check on second-signature requests. |
| Failure modes | "Identity rejected"; "Camera blocked"; "Hash mismatch — re-sign required". |
| Related articles | `signatures-ecign/single-signature`, `signatures-ecign/audit-trail`, `troubleshooting/why-wont-it-sign` |
| Architecture refs | `Architecture/eCIgn/02-Signature-Workflow.md`, `Architecture/eCIgn/03-Audit-and-Compliance-Model.md`, `Architecture/eCIgn/05-Failure-Prevention.md` |

## 10. eCIgn Multi-Signature Flow — `FormSignatureFlow.SecondSignatureModal`

| Field | Spec |
|---|---|
| Source | [src/policy/components/FormSignatureFlow.tsx](../../src/policy/components/FormSignatureFlow.tsx) |
| Routes | overlay on `/forms/:formId` |
| Purpose | Roster, sequencing, second-sig request, decline & re-issue. |
| Data inputs | Roster (signers, tiers, status), instance state. |
| Interactions | Add signer (tier strictly above), reorder (if rules allow), decline, re-issue. |
| Compliance behavior | Server validates tier; logs `access.denied` on rejection. |
| Enforcement | Tier strictly above; no self-approval; no skipping a required signer. |
| Failure modes | "Tier mismatch"; "Signer not assignable"; "Decline reason required". |
| Related articles | `signatures-ecign/multi-signature`, `signatures-ecign/decline-and-reissue`, `troubleshooting/access-denied` |
| Architecture refs | `Architecture/eCIgn/09-Multi-Signature-Flow.md` |

## 11. Form Viewer — `FormViewer`

| Field | Spec |
|---|---|
| Source | [src/policy/components/FormViewer.tsx](../../src/policy/components/FormViewer.tsx) |
| Routes | `/forms`, `/forms/:formId` (preview pane) |
| Purpose | Render form template for browsing and review. |
| Data inputs | Form template definition. |
| Interactions | Scroll, zoom, navigate sections. |
| Compliance behavior | Read-only; never mutates template geometry. |
| Enforcement | Refuses to render if template hash mismatches registry. |
| Failure modes | "Template integrity check failed". |
| Related articles | `forms-library/browsing-forms`, `forms-library/form-print-view` |
| Architecture refs | `Architecture/eCIgn/06-Outputs-Templates-Watermarks.md` |

## 12. Form Print View — `FormPrintView`

| Field | Spec |
|---|---|
| Source | [src/policy/pages/FormPrintView.tsx](../../src/policy/pages/FormPrintView.tsx) |
| Routes | `/forms/:formId/print` |
| Purpose | Byte-identical print of the template plus appended evidence pages. |
| Data inputs | Form, signature instance, audit events, identity / device evidence. |
| Interactions | Print, download PDF. |
| Compliance behavior | Appends Certificate, Identity & Device, Audit Trail Timeline, Signers Roster pages. |
| Enforcement | Rejects job rather than mutate template. |
| Failure modes | "Print rejected — template integrity"; "Missing signers"; "Audit trail incomplete". |
| Related articles | `forms-library/form-print-view`, `signatures-ecign/template-preservation`, `troubleshooting/print-rejected` |
| Architecture refs | `Architecture/eCIgn/06-Outputs-Templates-Watermarks.md`, `Architecture/Print/System.md` |

## 13. Audit Mode — `AuditModePage`

| Field | Spec |
|---|---|
| Source | [src/policy/pages/AuditModePage.tsx](../../src/policy/pages/AuditModePage.tsx), [src/policy/audit/](../../src/policy/audit/) |
| Routes | `/audit` |
| Purpose | The surveyor / auditor view of the platform. |
| Data inputs | Audit aggregate, survey packet builder, signature instances, sprint history. |
| Interactions | Filter by date / workflow / signer, open instance detail, generate survey packet. |
| Compliance behavior | Read-only; surfaces evidence as it would appear to a surveyor. |
| Enforcement | Tier 1–3 only; export logged; void requires Tier ≤ 2. |
| Failure modes | "Aggregate stale"; "Packet build failed — missing signature". |
| Related articles | `audit-reporting/audit-mode-walkthrough`, `audit-reporting/survey-packet`, `signatures-ecign/audit-trail`, `signatures-ecign/void-a-signed-document` |
| Architecture refs | `Architecture/Audit/Evidence-Model.md`, `Architecture/Survey-Simulation/`, `Architecture/eCIgn/03-Audit-and-Compliance-Model.md` |

## 14. Help Center — `HelpCenterPage` + `HelpContextLink`

| Field | Spec |
|---|---|
| Source | [src/policy/help/HelpCenterPage.tsx](../../src/policy/help/HelpCenterPage.tsx), [HelpContextLink.tsx](../../src/policy/help/HelpContextLink.tsx), [articles/](../../src/policy/help/articles/) |
| Routes | `/help`, `/help/:category`, `/help/:category/:slug` |
| Purpose | The KB renderer: categories, search, contextual deep-links. |
| Data inputs | `ARTICLES` registry, category list. |
| Interactions | Browse, search, filter by audience, follow related links. |
| Compliance behavior | Surfaces the operational rules; not itself a control. |
| Enforcement | n/a (read-only). |
| Failure modes | Article not found → 404 view with category fallback. |
| Related articles | `getting-started/where-to-find-help` |
| Architecture refs | `Builder/Knowledge-Base/02-Knowledge-Base-Architecture.md`, `04-Knowledge-Base-Article-Plan.md` |

---

## Cross-cutting components (recommended docs, not in the original list but tightly coupled)

| Component | Source | Why it matters |
|---|---|---|
| `CommandCenterLayout` | [src/policy/components/CommandCenterLayout.tsx](../../src/policy/components/CommandCenterLayout.tsx) | Shell for every screen; defines nav contract |
| `UniversalNavControls` | [src/policy/components/UniversalNavControls.tsx](../../src/policy/components/UniversalNavControls.tsx) | Global nav + role-aware menu |
| `StatusBadge` | [src/policy/components/StatusBadge.tsx](../../src/policy/components/StatusBadge.tsx) | Compliance state visual contract |
| `DraftBanner` | [src/policy/components/DraftBanner.tsx](../../src/policy/components/DraftBanner.tsx) | Draft visibility + lifecycle gating |
| `MasterControlInventory` | [src/policy/components/MasterControlInventory.tsx](../../src/policy/components/MasterControlInventory.tsx) | Master control inventory surface |
| `PolicyDetailModal` | [src/policy/components/PolicyDetailModal.tsx](../../src/policy/components/PolicyDetailModal.tsx) | Policy detail UX |
| `SharedPolicyDetailView` | [src/policy/components/SharedPolicyDetailView.tsx](../../src/policy/components/SharedPolicyDetailView.tsx) | Shared policy view |

> Each cross-cutting component should follow the same template (purpose / source / props / interactions / compliance behavior / enforcement / failure modes / related articles / architecture refs).

---

## Authoring rules

1. One MD file per component, under `Developer-Reference/Components/`.
2. File name = PascalCase of component class.
3. Source paths must be live links (validated by CI).
4. Every component doc must list at least one related Help Center article. If none exists, file a gap in `04-Knowledge-Base-Article-Plan.md`.
5. Component docs do not contain screenshots > 200 KB.
6. Component docs are reviewed by both engineering (technical) and compliance officer (enforcement / behavior sections).
