# CES — Compliance Execution System
## Complete Component Field ID, Label & Description Reference

**System:** Compliance Execution System (CES)  
**Application:** CI-ION Home Health Compliance Platform  
**Source path:** `src/policy/ces/`  
**Generated:** 2026-04-27

---

## 1. Navigation Shell — `CesLayout`

**File:** `src/policy/ces/layouts/CesLayout.tsx`  
**Component:** `CesLayout`  
**Route base:** `/ces/*`

### 1.1 Navigation Items (`CES_NAV`)

| Field ID (route `to`) | Label | Icon | Description |
|---|---|---|---|
| `/ces/dashboard` | Dashboard | `LayoutDashboard` | Sprint execution overview: metrics, risk heatmap, upcoming deadlines, and critical escalations. Entry point for the CES module. |
| `/calendar?view=sprint` | Calendar (Calendar/Sprint) | `CalendarRange` | Month-grid view of all regulatory workflow instances. Renders `MasterCalendarPage` with `view=sprint` query param active. Left panel = month grid; right panel = inline execution panel for the selected event. |
| `/ces/board` | Sprint Board | `Columns3` | Six-column Kanban-style execution board. Columns map to `ComplianceState`. Drag-and-drop enforces the state-machine; invalid moves snap back with an enforcement warning. |
| `/workflows` | Workflows | `Workflow` | Full workflow library. Domain-filtered catalog of all compliance workflows with detail views per workflow ID. Routes to `WorkflowLibraryApp` at `/workflows/:workflowId`. |
| `/compliance/master-controls` | Master Controls | `SlidersHorizontal` | Master Control Inventory — full table of all CTRL-NNN control items, filterable by category, domain, risk, and status. Linked to execution units. |
| `/audit` | Audit Mode | `ShieldCheck` | Four-region audit validation and survey-readiness canvas. Classifies every regulatory event by audit state. Supports export of survey packets in Markdown, JSON, and HTML. |
| `/ces/reports` | Reports | `BarChart3` | Executive sprint-over-sprint compliance trend charts. Six KPI charts rendered as pure SVG. |

### 1.2 Top Context Bar Fields

| Field ID | Label | Description |
|---|---|---|
| `activeSprint.label` | Active Sprint label | Sprint number and date range displayed in the top context bar (e.g., "Sprint 14 · May 5 – Jun 1, 2026"). |
| `escalationCount` | Escalation bell count | Count of overdue-signature + critical-blocker units. Displayed on the bell icon. |
| `PROFILE.initials` | Profile initials chip | Two-letter avatar for the current user (placeholder: `JV`). |
| `PROFILE.name` | Profile name | Full name of the current user (placeholder: `JD Vance`). |
| `PROFILE.role` | Profile role | Role title of the current user (placeholder: `Administrator Designee`). |

---

## 2. Dashboard — `CesDashboardPage` / `CesExecutiveDashboard`

**File:** `src/policy/ces/pages/CesDashboardPage.tsx`  
**Component:** `CesExecutiveDashboard`  
**Route:** `/ces/dashboard`

### 2.1 Hero Metric Cards

| Field ID (store key) | Label | Description |
|---|---|---|
| `sprintMetrics.completionRatePct` | Compliance Completion | Percentage of execution units in `completed` state for the active sprint. Target: improve vs prior sprint. |
| `sprintMetrics.auditReadinessScore` | Audit Readiness Score | Composite score 0–100. Target ≥ 85. Aggregates evidence completeness, signature SLA, and certification status. |
| `sprintMetrics.activeBlockerCount` | Active Blockers | Count of units in `blocked` state. Threshold: ≤ 2. |
| `sprintMetrics.signatureSlasMissed` | Signature SLAs Missed | Count of signature SLA violations carried over or active this sprint. |

### 2.2 Critical Risk Banner

| Field ID | Label | Description |
|---|---|---|
| `criticalUnits` | Critical execution units | Units where `complianceState === 'awaiting_signature'` AND `escalationTimer < 0` (overdue), OR `complianceState === 'blocked'` AND `workflowPhase === 'audit'`. Triggers a red banner when count > 0. Link targets `/ces/board`. |

### 2.3 Compliance Risk Heatmap (`domainRisks`)

| Field ID | Label | Description |
|---|---|---|
| `domainRisks[n].domain` | Domain | One of: `clinical`, `compliance`, `hr`, `governance`. |
| `domainRisks[n].level` | Risk level | `green` = Healthy · `yellow` = Watch · `red` = Overloaded. |
| `domainRisks[n].openUnits` | Open units | Count of non-completed execution units in this domain. |
| `domainRisks[n].blockedCount` | Blocked | Count of `blocked` units contributing to domain risk score. |
| `domainRisks[n].reason` | Reason | Short narrative text explaining the current domain risk level. |

### 2.4 Sprint Phase Distribution

| Field ID | Label | Description |
|---|---|---|
| `workflowPhase: 'preparation'` | Preparation | Units in the preparation phase (pre-event setup, packet assembly). |
| `workflowPhase: 'documentation'` | Documentation | Units actively completing required forms and process-flow steps. |
| `workflowPhase: 'review'` | Review | Units pending internal review before signature routing. |
| `workflowPhase: 'signature'` | Signature | Units in the signature queue, awaiting required signers. |
| `workflowPhase: 'audit'` | Audit | Units undergoing audit verification; highest-risk phase for blockers. |

### 2.5 Upcoming Deadlines List

| Field ID | Label | Description |
|---|---|---|
| `executionUnit.dueDate` | Due date | ISO date the execution unit must be completed. Displayed as `MMM D`. |
| `executionUnit.title` | Unit title | Title of the compliance obligation (inherited from the workflow). |
| `executionUnit.owner.name` | Owner name | Full name of the primary owner. |
| `executionUnit.workflowPhase` | Phase indicator | Current `WorkflowPhase` badge. |
| `executionUnit.complianceState` | Compliance state badge | Current `ComplianceState` chip (compact mode). |
| `executionUnit.auditReadiness` | Audit readiness tag | `not_ready` · `partial` · `ready`. |

### 2.6 Risk Indicators Panel

| Field ID | Label | Description |
|---|---|---|
| `executionUnit.blockedReason.label` | Blocked reason | Short surveyor-grade label for why the unit is blocked. |
| `executionUnit.escalationTimer` | Escalation timer | Hours to escalation; negative when overdue. Displayed in the risk indicator row. |

---

## 3. Calendar (Calendar/Sprint) — `MasterCalendarPage`

**File:** `src/policy/pages/MasterCalendarPage.tsx`  
**Component:** `MasterCalendarPage`  
**Route:** `/calendar?view=sprint`

### 3.1 URL Parameters

| Parameter | Field ID | Label | Description |
|---|---|---|---|
| `?view=` | view | View mode | `sprint` = Sprint view (CES context). Controls which panel renders on the right. |
| `?event=` | event | Active event ID | Canonical event ID (new format: `{eventSubType}-{YYYYMMDD}-{NN}`). Deep-links to a specific event on the calendar. |
| `?workflow=` | workflow | Open workflow flag | When `1`, opens the workflow execution panel for the `event` parameter immediately on load. |

### 3.2 Calendar Controls

| Field ID | Label | Description |
|---|---|---|
| `year` | Year | Four-digit calendar year. Navigated via chevron buttons. |
| `month` | Month | Calendar month (0–11 internally; displayed as full month name). |
| `activeId` | Active event | ID of the currently selected event instance. Bound to URL `?event=`. |

### 3.3 Event Instance Fields (from `RegulatoryEvent`)

| Field ID | Label | Description |
|---|---|---|
| `event.id` | Event ID | Canonical stable ID in format `{eventSubType}-{YYYYMMDD}-{NN}`. Primary key for all cross-references. |
| `event.eventSubType` | Event sub-type | Stable machine-readable category key (e.g., `qapi_meeting`, `ep_exercise`). Embedded in the event ID. |
| `event.title` | Title | Human-readable event name displayed on the calendar chip and execution panel header. |
| `event.domain` | Domain | Domain label (e.g., `QAPI`, `Clinical`, `Governance`). Drives color coding. |
| `event.date` | Date | ISO date string `YYYY-MM-DD`. Anchors the event to a calendar cell. |
| `event.time` | Start time | `HH:MM` start time. |
| `event.timeEnd` | End time | `HH:MM` end time. |
| `event.cadence` | Cadence | Recurrence label: `Monthly` · `Quarterly` · `Annual` · `Biennial` · `Triennial` · `Holiday` · `Ad-hoc`. |
| `event.urgency` | Urgency | `critical` · `due-soon` · `scheduled`. Drives red/amber/teal chip color on the timeline grid. |
| `event.owner` | Owner | Name of the primary owner responsible for execution. |
| `event.ownerRole` | Owner role | Role title of the primary owner. |
| `event.mandateType` | Mandate type | `federal-required` · `state-required` · `policy-driven`. Indicates regulatory basis. |
| `event.policyRefs` | Policy references | Array of policy IDs (format `XX-XX-NNN`) that govern this event, filtered against the framework registry. |
| `event.requiredForms` | Required forms | Array of `{ formId, label }` pairs. Forms that must be completed to satisfy this event. |
| `event.isContext` | Context flag | When `true`, event is a non-regulatory context marker (e.g., holiday) and excluded from audit queues. |
| `event.dependencies.feeds` | Feeds | Array of downstream event IDs this event feeds into. |
| `event.dependencies.dependsOn` | Depends on | Array of upstream event IDs that must complete before this event. |
| `event.sourceOfTruth` | Source of truth | `app` = managed by the application. Displayed in the technical details panel. |

---

## 4. Sprint Board — `CesBoardPage` / `SprintExecutionBoard`

**File:** `src/policy/ces/pages/CesBoardPage.tsx`  
**Component:** `SprintExecutionBoard`  
**Route:** `/ces/board`

### 4.1 Board Columns (`ComplianceState`)

| Field ID (state value) | Column Label | Description |
|---|---|---|
| `upcoming` | Upcoming | Execution units not yet in scope for the active sprint. |
| `ready` | Ready | Units confirmed in scope, all prerequisites met, work can begin. |
| `in_progress` | In Progress | Active execution: steps running, forms being completed. |
| `awaiting_signature` | Awaiting Signature | Forms complete; routing to required signers. SLA clock is active. |
| `blocked` | Blocked | Execution halted by a `BlockedReason`. Requires manual resolution. |
| `completed` | Completed | All steps, forms, signatures, and audit evidence satisfied. |

### 4.2 Execution Unit Card Fields (`ExecutionUnit`)

| Field ID | Label | Description |
|---|---|---|
| `executionUnit.id` | Unit ID | Unique execution unit identifier. |
| `executionUnit.title` | Title | Short title of the compliance obligation. |
| `executionUnit.parentEventId` | Parent event | Canonical event ID this unit belongs to. |
| `executionUnit.workflowId` | Workflow ID | ID of the workflow that generated this unit. |
| `executionUnit.workflowPhase` | Workflow phase | Current phase: `preparation` · `documentation` · `review` · `signature` · `audit`. |
| `executionUnit.complianceState` | Compliance state | Current board column state. |
| `executionUnit.auditReadiness` | Audit readiness | `not_ready` · `partial` · `ready`. |
| `executionUnit.owner.userId` | Owner user ID | Unique ID of the primary owner. |
| `executionUnit.owner.name` | Owner name | Full name. |
| `executionUnit.owner.initials` | Owner initials | Two-letter avatar initials. |
| `executionUnit.owner.role` | Owner role | Role title. |
| `executionUnit.approver.name` | Approver name | Name of the approval authority. |
| `executionUnit.signatureOwner.name` | Signature owner | Name of the final signatory. |
| `executionUnit.requiredSigners` | Required signers | Array of `RequiredSigner` objects. Each has: `userId`, `name`, `initials`, `role`, `status` (`signed`/`pending`/`overdue`), `signedAt`, `hoursToEscalation`. |
| `executionUnit.blockedReason.kind` | Blocked reason kind | `missing_signature` · `missing_form` · `dependency_incomplete` · `awaiting_external_input`. |
| `executionUnit.blockedReason.label` | Blocked reason label | Short surveyor-grade explanation of the block. |
| `executionUnit.blockedReason.resourceId` | Blocked resource ID | Optional: the form ID, user ID, or event ID causing the block. |
| `executionUnit.dueDate` | Due date | ISO date the unit must be completed. |
| `executionUnit.escalationTimer` | Escalation timer (hours) | Hours until escalation triggers; negative when overdue. |
| `executionUnit.evidenceStatus.requiredFormsTotal` | Forms required | Total required form count. |
| `executionUnit.evidenceStatus.requiredFormsComplete` | Forms complete | Count of completed required forms. |
| `executionUnit.evidenceStatus.missingFormIds` | Missing form IDs | Array of form IDs not yet submitted. |
| `executionUnit.evidenceStatus.signaturesRequired` | Signatures required | Total required signature count. |
| `executionUnit.evidenceStatus.signaturesComplete` | Signatures complete | Count of collected signatures. |
| `executionUnit.evidenceStatus.auditIndexCreated` | Audit index created | Boolean. `true` when the audit index entry has been generated. |
| `executionUnit.domain` | Domain | `clinical` · `compliance` · `hr` · `governance`. |
| `executionUnit.obligationKind` | Obligation kind | `SPRINT_TASK` (calendar event container) · `TASK` (individual execution step). |
| `executionUnit.sourceType` | Source type | `ONBOARDING` · `REGULATORY_EVENT` · `WORKFLOW` · `POLICY_LIFECYCLE` · `COMMITTEE` · `SECURITY` · `AUDIT` · `ECIGN`. |
| `executionUnit.sourcePolicyIds` | Source policy IDs | Policy IDs from the framework registry that produced this obligation. |
| `executionUnit.sourceWorkflowIds` | Source workflow IDs | Workflow IDs that generated this obligation. |
| `executionUnit.sourceFormIds` | Source form IDs | Form IDs associated with this obligation at generation time. |
| `executionUnit.sprintId` | Sprint ID | ID of the sprint window this unit belongs to. |
| `executionUnit.ownership.primaryOwnerUserId` | Primary owner user ID | Extended ownership: primary owner. |
| `executionUnit.ownership.secondaryOwnerUserId` | Secondary owner user ID | Extended ownership: secondary/backup owner. |
| `executionUnit.ownership.assignedUserIds` | Assigned user IDs | Roster of individuals assigned to this obligation. |
| `executionUnit.ownership.assignedRoleIds` | Assigned role IDs | Roles assigned to this obligation (for role-based filtering). |
| `executionUnit.ownership.committeeOwnerId` | Committee owner ID | Committee responsible for this obligation. |
| `executionUnit.ownership.visibilityScope` | Visibility scope | `self` · `role` · `committee` · `department` · `org` · `governing_body`. |
| `executionUnit.ownership.escalationPath` | Escalation path | Ordered array of user/role IDs for escalation routing. |

---

## 5. Workflows — `WorkflowLibraryApp`

**File:** `src/policy/workflows/WorkflowLibraryApp.tsx`  
**Component:** `WorkflowLibraryApp`  
**Route:** `/workflows`, `/workflows/:workflowId`

### 5.1 Library Filter Fields

| Field ID | Label | Description |
|---|---|---|
| `selectedDomain` | Domain filter | `DomainCode` or `'ALL'`. Filters the workflow catalog to a single compliance domain. |
| `savedView` | Saved view | String ID of a saved filter/view preset. |
| `compact` | Compact mode | Boolean. `true` when viewport width < 1200 px; renders a compact layout. |

### 5.2 Workflow Item Fields

| Field ID | Label | Description |
|---|---|---|
| `workflow.id` | Workflow ID | Unique workflow identifier (e.g., `QA-WF-01`). Used in URL: `/workflows/:workflowId`. |
| `workflow.eventId` | Parent event ID | Canonical event ID that triggers or owns this workflow. |
| `workflow.title` | Title | Workflow display name. |
| `workflow.requiredFormIds` | Required form IDs | Array of form IDs that must be completed to satisfy this workflow. |

---

## 6. Master Controls — `MasterControlInventoryPage` / `MasterControlInventory`

**File:** `src/policy/pages/MasterControlInventoryPage.tsx`  
**Component:** `MasterControlInventory`  
**Route:** `/compliance/master-controls`  
**Type file:** `src/policy/types/masterControlInventory.ts`

### 6.1 Filter / Search Controls

| Field ID | Label | Description |
|---|---|---|
| `search` | Search | Free-text search across `controlName`, `description`, `category`, `domain`, `regulatoryBasis`, `requiredOwner`, `evidenceRequired`, `failureRisk`. |
| `category` | Category filter | `'ALL'` or one of the 10 `MasterControlCategory` values (see §6.3). |
| `domain` | Domain filter | `'ALL'` or a domain string (e.g., `'Clinical'`, `'Compliance'`). |
| `risk` | Risk filter | `'ALL'` · `'HIGH'` · `'MATERIAL'` · `'LOW'`. |
| `status` | Status filter | `'ALL'` · `'active'` · `'deficient'` · `'unknown'`. |
| `highRiskOnly` | High-risk only toggle | Boolean. When `true`, restricts list to controls where `highRiskIfMissing === true`. |
| `groupByCategory` | Group by category | Boolean. When `true`, groups the table rows by `MasterControlCategory`. |
| `sortField` | Sort field | Active sort column: `id` · `controlName` · `category` · `domain` · `requiredOwner` · `riskLevel` · `status`. |
| `sortDirection` | Sort direction | `'asc'` · `'desc'`. |

### 6.2 Control Item Fields (`MasterControlItem`)

| Field ID | Label | Description |
|---|---|---|
| `item.id` | Control ID (numeric) | Sequential integer. Rendered as `CTRL-NNN` (zero-padded to 3 digits). |
| `item.controlName` | Control name | Short descriptive name for the compliance control. |
| `item.description` | Description | Full prose description of what the control covers and why it is required. |
| `item.category` | Category | One of the 10 `MasterControlCategory` values (see §6.3). |
| `item.domain` | Domain | Free-text domain label aligning to the agency's organizational domain structure. |
| `item.sourcePolicyIds` | Source policy IDs | Array of `XX-XX-NNN` policy IDs from the framework registry that mandate this control. |
| `item.regulatoryBasis` | Regulatory basis | Citation of the federal/state regulation or OIG guidance that requires this control (e.g., `42 CFR §484.65`). |
| `item.requiredOwner` | Required owner | Role title of the individual accountable for this control (e.g., `Compliance Officer`). |
| `item.evidenceRequired` | Evidence required | Description of the specific documentation or artifact that must exist to demonstrate compliance. |
| `item.failureRisk` | Failure risk | Prose description of what happens if this control is missing or deficient. |
| `item.riskLevel` | Risk level | `'HIGH'` · `'MATERIAL'` · `'LOW'`. Drives badge color and default sort. |
| `item.highRiskIfMissing` | High risk if missing | Boolean. `true` signals that absence of this control creates immediate survey citation risk. |
| `item.status` | Status | `'active'` = in place and verified · `'deficient'` = gap identified · `'unknown'` = not yet assessed. |
| `item.notes` | Notes | Optional free-text field for additional context, owner commentary, or remediation plans. |

### 6.3 `MasterControlCategory` Values

| Value | Description |
|---|---|
| `Patient Rights & Access` | Controls related to patient rights, informed consent, and access to records. |
| `Clinical Operations` | Controls governing direct clinical care delivery, supervision, and documentation. |
| `Safety & Risk Management` | Controls for incident reporting, risk assessment, sentinel events, and EP. |
| `Compliance & Regulatory` | OIG/CMS compliance program elements, FWA training, exclusion screening. |
| `Governance` | Governing body duties, charter compliance, conflict of interest disclosures. |
| `Workforce & HR` | Hiring, credentialing, training, competency, and HR compliance controls. |
| `IT & Security` | HIPAA security rule, vulnerability management, access controls, breach response. |
| `Financial / Billing` | Claims submission, denial management, cost reporting, and billing controls. |
| `Enterprise Policy & Records` | Policy lifecycle management, record retention, and framework review cadence. |
| `QAPI Program` | Quality Assurance and Performance Improvement committee, PIP charter, IC integration. |

### 6.4 Summary Stat Cards

| Field ID | Label | Description |
|---|---|---|
| `controls.length` | Total controls | Total count of controls in the current filtered view. |
| `controls.filter(HIGH).length` | HIGH risk controls | Count of controls with `riskLevel === 'HIGH'`. |
| `controls.filter(deficient).length` | Deficient controls | Count of controls with `status === 'deficient'`. |
| `blockedUnits.length` | Blocked execution units | Count of CES execution units currently in `blocked` state, sourced from the compliance-execution store. |

---

## 7. Audit Mode — `AuditModePage`

**File:** `src/policy/pages/AuditModePage.tsx`  
**Component:** `AuditModePage`  
**Route:** `/audit`  
**URL parameter:** `?state={AuditState}`

### 7.1 Quick Filter Chips

| Field ID (value) | Label | Description |
|---|---|---|
| `all` | All | No filter; shows all regulatory events regardless of audit state. |
| `july-readiness` | July Readiness | Events due before the July survey window; prioritizes survey-critical items. |
| `not-certifiable` | Not Certifiable | Events that cannot be certified due to missing evidence, forms, or approvals. |
| `missing-evidence` | Missing Evidence | Events in `complete-missing-evidence` audit state — process complete but document gaps remain. |
| `pending-approval` | Pending Approval | Events in `complete-pending-approval` — awaiting a required approval decision. |
| `overdue` | Overdue | Events past their due date that are not yet certified. |
| `ready-to-certify` | Ready to Certify | Events in `audit-ready` state — all evidence present, ready for administrator certification. |
| `certified` | Certified | Events in `certified-locked` state — fully certified and audit-locked. |
| `governance` | Governance | Filter to Governance domain events only. |
| `qapi` | QAPI | Filter to QAPI domain events only. |
| `billing-critical` | Billing Critical | Filter to billing-related events with high audit risk. |
| `survey-critical` | Survey Critical | Events with `complianceFlags.auditRisk === 'critical'` or `'high'`. Pre-filtered catalog used for this view. |

### 7.2 Audit State Classifications (`AuditState`)

| State value | Color | Label | Description |
|---|---|---|---|
| `overdue` | Red | Overdue | Past due date; not yet complete. Immediate action required. |
| `blocked` | Red | Blocked | Execution is halted by a `BlockedReason` (missing form, missing signature, dependency). |
| `not-certifiable` | Red | Not Certifiable | Critical evidence gaps prevent certification. |
| `complete-missing-evidence` | Amber | Missing Evidence | Steps complete but required documents have not been uploaded. |
| `complete-pending-approval` | Amber | Pending Approval | Awaiting a required approval or sign-off. |
| `audit-ready` | Teal | Audit Ready | All evidence present; eligible for administrator certification. |
| `certified-locked` | Green | Certified & Locked | Certified by the Administrator; record is audit-locked. |

### 7.3 Queue View Modes

| Field ID (value) | Label | Description |
|---|---|---|
| `grouped` | Grouped | Events organized into named risk-tier groups: Needs Immediate Review · Missing Evidence · Pending Approval · Ready to Certify · Certified & Locked. |
| `matrix` | Matrix | Flat sortable grid layout showing all events with sortable columns. |

### 7.4 Date Range / Filter Controls

| Field ID | Label | Description |
|---|---|---|
| `searchTerm` | Search | Free-text filter applied to event title, domain, and regulatory driver. |
| `dateRange.startISO` | Start date | ISO date. Lower bound of date range filter. |
| `dateRange.endISO` | End date | ISO date. Upper bound of date range filter. |
| `regulationFilter` | Regulation | Free-text filter on `regulatoryDriver` field (e.g., `42 CFR §484.65`). |
| `preset: 'last-30'` | Last 30 days | Date range preset: today − 30 days. |
| `preset: 'last-90'` | Last 90 days | Date range preset: today − 90 days. |
| `preset: 'qtd'` | Quarter to date | Date range preset: start of current quarter to today. |
| `preset: 'ytd'` | Year to date | Date range preset: Jan 1 of current year to today. |
| `preset: 'clear'` | Clear | Clears the active date range filter. |

### 7.5 Event Detail Panel — Tabs (`DetailTab`)

| Field ID (tab value) | Label | Description |
|---|---|---|
| `summary` | Summary | Risk score, audit state badge, compliance flags, and regulatory driver citation. |
| `missing-items` | Missing Items | Checklist of incomplete process-flow steps and missing form submissions. |
| `evidence` | Evidence | Uploaded document evidence linked to this event, with status badges. |
| `approvals` | Approvals | Required approval decisions — approver name, role, status, and due date. |
| `timeline` | Timeline | Chronological history of step completions, form submissions, and state changes. |
| `dependencies` | Dependencies | Upstream `dependsOn` and downstream `feeds` event relationships. |
| `audit-trail` | Audit Trail | Tamper-evident log of all system actions (enforcement store `auditLog`). |

### 7.6 Export Actions

| Field ID | Label | Description |
|---|---|---|
| `exportBundle('md')` | Export Markdown | Downloads a Markdown audit bundle covering all filtered events with risk scores and evidence checklist. |
| `exportBundle('json')` | Export JSON | Downloads a JSON audit bundle (machine-readable, same data as Markdown export). |
| `exportSurveyPacket` | Export Survey Packet | Generates a structured survey-readiness packet (Markdown + HTML) for the active event. Includes rollup header, evidence checklist, regulatory citations, and certification status. |

### 7.7 Risk Score Fields

| Field ID | Label | Description |
|---|---|---|
| `riskScore.score` | Risk score | Numeric composite risk score. Used for descending sort order in the filtered queue. |
| `complianceFlags.auditRisk` | Audit risk | `'critical'` · `'high'` · `'medium'` · `'low'`. Drives `survey-critical` pre-filter and surveyor warning badges. |
| `complianceFlags.citation` | Citation | Regulatory citation string (e.g., `42 CFR §484.65`). Displayed in the detail panel and survey packet. |
| `complianceFlags.surveyorNote` | Surveyor note | Text note written from the perspective of a CMS surveyor — describes what a surveyor would look for. |
| `complianceFlags.overdueAfterDays` | Overdue after (days) | Days past the event date before the system marks the event as overdue. `0` = immediately on due date. |
| `complianceFlags.missingEvidenceIf` | Missing evidence if | Array of `FormStatus` values (`'missing'`, `'pending'`) that trigger the missing-evidence audit state. |

---

## 8. Evidence Center — `EvidenceCenterPage`

**File:** `src/policy/pages/EvidenceCenterPage.tsx`  
**Component:** `EvidenceCenterPage`  
**Route:** `/evidence` (accessed from Audit Mode and calendar event panels)  
**Backend:** AWS Phase 1 — API Gateway + S3  
**API base:** `VITE_HHC_API_BASE` (default: `https://rtllnugat0.execute-api.us-west-1.amazonaws.com`)

### 8.1 URL Query Parameters (Deep-Link Fields)

| Parameter | Field ID | Label | Description |
|---|---|---|---|
| `?event_id=` | `qEventId` | Event ID | Canonical event ID. Pre-loads the evidence file list for that event. |
| `?evidence_id=` | `qEvidenceId` | Evidence ID | Pre-selects a specific evidence file and opens its detail panel. |
| `?form_id=` | `qFormId` | Form ID | Pre-fills the form ID filter field. |
| `?policy_id=` | `qPolicyId` | Policy ID | Pre-fills the policy ID filter field. |

### 8.2 Search and Filter Controls

| Field ID | Label | Description |
|---|---|---|
| `eventInput` | Event ID input | Text field. User types or pastes an event ID to load its evidence files. Submits on button click or Enter. |
| `search` | Search | Full-text search across `filename`, `policy_id`, `workflow_id`, `event_id`, `form_id`, `status`, `source_system`, `evidence_id`. |
| `filterFormId` | Form ID filter | Filters the file list to rows where `form_id` contains the entered value. |
| `filterEventId` | Event ID filter | Filters the file list to rows where `event_id` contains the entered value. |
| `filterPolicyId` | Policy ID filter | Filters the file list to rows where `policy_id` contains the entered value. |
| `filterEvidenceId` | Evidence ID filter | Filters the file list to rows where `evidence_id` matches exactly. Auto-selects matching file if found. |

### 8.3 Evidence File Fields (`EvidenceFile`)

| Field ID | Label | Description |
|---|---|---|
| `evidence_id` | Evidence ID | Unique UUID for this evidence record. Primary key across the evidence store. |
| `filename` | Filename | Original file name as uploaded (e.g., `QAPI-Minutes-May2026.pdf`). |
| `policy_id` | Policy ID | Policy ID this evidence is filed under (e.g., `QA-PG-001`). Part of the mandatory upload triplet. |
| `workflow_id` | Workflow ID | Workflow ID this evidence satisfies (e.g., `QA-WF-01`). Part of the mandatory upload triplet. |
| `event_id` | Event ID | Canonical event ID this evidence is attached to. Part of the mandatory upload triplet. |
| `form_id` | Form ID | Optional. Form ID (e.g., `QA-F-012`) that this document satisfies. Null if not form-specific. |
| `status` | Status | Evidence lifecycle state (see §8.4). |
| `signature_status` | Signature status | Status of any electronic signature associated with this document. Null if not applicable. |
| `source_system` | Source system | System that produced or uploaded this document (e.g., `app`, `eCIgn`, `HubStaff`). |
| `mime_type` | MIME type | File content type (e.g., `application/pdf`, `image/png`). |
| `size_bytes` | File size | File size in bytes. Displayed as human-readable (KB/MB). |
| `created_at` | Created | ISO timestamp of initial upload. |
| `updated_at` | Updated | ISO timestamp of last status change. |

### 8.4 Evidence Status Values

| Status value | Label / Badge color | Description |
|---|---|---|
| `PENDING_UPLOAD` | Pending Upload (amber) | Upload initiated; presigned PUT URL issued but file not yet received by S3. |
| `UPLOADED` | Uploaded (sky blue) | File received by S3; awaiting hash validation. |
| `VALIDATED` | Validated (indigo) | SHA-256 hash verified; file integrity confirmed. |
| `PROMOTED` | Promoted (emerald) | File moved from staging to the permanent evidence bucket. |
| `APPROVED_EVIDENCE` | Approved Evidence (emerald) | Evidence reviewed and approved by an authorized reviewer. |
| `SIGNED` | Signed (emerald) | Electronic signature applied to the document. |
| `FAILED` | Failed (rose red) | Upload or validation failed; remediation required. |

### 8.5 Audit Trail Entry Fields (`AuditEntry`)

| Field ID | Label | Description |
|---|---|---|
| `ts` | Timestamp | ISO timestamp of the audit event. |
| `action` | Action | Action type string (e.g., `UPLOAD_INIT`, `VALIDATE`, `PROMOTE`, `APPROVE`, `SIGN`). |
| `actor` | Actor | User ID or role of the person/system that performed the action. |
| `source_system` | Source system | System that recorded the audit entry. |
| `evidence_id` | Evidence ID | Evidence record affected by this audit action. |
| `upload_id` | Upload ID | Upload session ID associated with this audit event. |
| `before_status` | Before status | Evidence status before this action. |
| `after_status` | After status | Evidence status after this action. |

### 8.6 Upload Flow Fields

| Field ID | Label | Description |
|---|---|---|
| `uploadPolicy` (form field) | Policy ID | Required. Policy ID to tag the upload with. Must be a valid `XX-XX-NNN` policy ID. |
| `uploadWorkflow` (form field) | Workflow ID | Required. Workflow ID to tag the upload with. |
| `uploadFormId` (form field) | Form ID (optional) | Optional. Form ID the document satisfies. |
| `uploadActorId` | Actor ID | `x-hhc-actor-id` request header. Defaults to `demo-user`; can be set via `localStorage.hhc_actor_id`. |
| `uploadActorRole` | Actor role | `x-hhc-actor-role` request header. Defaults to `Compliance Officer`; can be set via `localStorage.hhc_actor_role`. |

### 8.7 API Endpoints

| Endpoint | Method | Field ID | Description |
|---|---|---|---|
| `/events/{event_id}/files` | `GET` | `listFiles` | Returns `{ event_id, files: EvidenceFile[], audit: AuditEntry[] }` for the given event. |
| `/files/{evidence_id}/download` | `GET` | `downloadFile` | Returns presigned S3 GET URL. Query param: `event_id`. Returns `{ presigned_get_url, expires_in_seconds, … }`. |
| `/uploads/init` | `POST` | `initUpload` | Initiates upload. Body: `{ event_id, policy_id, workflow_id, form_id?, filename, mime_type, file_size }`. Returns presigned PUT URL. |
| `/uploads/{upload_id}/validate` | `POST` | `validateUpload` | Triggers SHA-256 validation of the uploaded file. |
| `/uploads/{upload_id}/promote` | `POST` | `promoteUpload` | Moves validated file from staging to permanent evidence bucket. |

---

## 9. Reports — `CesReportsPage` / `ExecutiveReports`

**File:** `src/policy/ces/pages/CesReportsPage.tsx`  
**Component:** `ExecutiveReports`  
**Route:** `/ces/reports`

### 9.1 Chart Components and KPI Fields (`SprintTrendPoint`)

| Field ID (store key) | Chart title | Chart type | Target | Description |
|---|---|---|---|---|
| `sprintTrends[n].sprintNumber` | Sprint # (X axis) | All charts | — | Sprint number; X-axis label for all trend charts. |
| `sprintTrends[n].completionRatePct` | Compliance Completion Rate (%) | Bar | ≥ 85% | Percentage of execution units completed by sprint close. |
| `sprintTrends[n].onTimeRatePct` | On-Time Completion (%) | Bar | ≥ 80% | Percentage of units completed on or before their due date. |
| `sprintTrends[n].auditReadinessScore` | Audit Readiness Score (0–100) | Line | ≥ 85 | Composite audit readiness score. Higher is better. |
| `sprintTrends[n].signatureSlaPct` | Signature SLA Compliance (%) | Line | ≥ 90% | Percentage of signatures collected within the SLA window. |
| `sprintTrends[n].blockedResolutionHours` | Blocked Resolution Time (hours) | Bar (inverted) | Lower is better | Average hours from `blocked` state to resolution. |
| `sprintTrends[n].carryOverCount` | Carry-Over Units Across Sprints | Bar (inverted) | Lower is better | Count of units not completed in the assigned sprint, carried to the next. |

### 9.2 Chart Annotations

| Field ID | Label | Description |
|---|---|---|
| `target` (dashed line) | Target threshold | Green dashed line on the chart indicating the regulatory or internal KPI target. |
| `delta` (trend indicator) | vs prior sprint | Signed difference between the last sprint value and the previous sprint value. Green if improvement; red if regression. Inverted logic applied to `blockedResolutionHours` and `carryOverCount`. |

---

## Appendix A — Shared Type Reference

### A.1 `Owner`

| Field ID | Type | Description |
|---|---|---|
| `userId` | `string` | Unique user identifier. |
| `name` | `string` | Full display name. |
| `initials` | `string` | Two-letter avatar string. |
| `role` | `string` | Role title. |

### A.2 `OwnerAssignment` (Workload Distribution table)

| Field ID | Label | Description |
|---|---|---|
| `owner` | Owner | `Owner` object (userId, name, initials, role). |
| `allocatedUnitCount` | Allocated | Total execution units assigned to this owner in the active sprint. |
| `overdueUnitCount` | Overdue | Count of units past due date. |
| `pendingSignatureCount` | Awaiting Signature | Count of units in `awaiting_signature` state. |
| `capacityRisk` | Capacity risk | `'green'` = Healthy · `'yellow'` = Watch · `'red'` = Overloaded. |
| `blocked` *(computed)* | Blocked | Count of units in `blocked` state for this owner. Computed at render. |
| `inFlight` *(computed)* | In Flight | Count of units in `in_progress` or `awaiting_signature`. Computed at render. |

### A.3 `Sprint`

| Field ID | Label | Description |
|---|---|---|
| `id` | Sprint ID | Unique sprint identifier string. |
| `number` | Sprint number | Integer sprint sequence number. |
| `startDate` | Start date | ISO date of sprint start (inclusive). |
| `endDate` | End date | ISO date of sprint end (inclusive). |
| `label` | Label | Display label (e.g., `"Sprint 14"`). |

### A.4 `ComplianceDomain` Values

| Value | Display label | Description |
|---|---|---|
| `clinical` | Clinical | Direct patient care, IC, aide supervision, clinical record compliance. |
| `compliance` | Compliance | OIG elements, FWA, exclusion screening, effectiveness reviews. |
| `hr` | HR | Workforce training, competency validation, credentialing. |
| `governance` | Governance | Governing body, COI, strategic planning, governance packet. |

### A.5 `WorkflowPhase` Order

| Phase | Order | Label | Description |
|---|---|---|---|
| `preparation` | 1 | Preparation | Pre-event setup: packet assembly, data pulls, prerequisite review. |
| `documentation` | 2 | Documentation | Active form completion and process-flow step execution. |
| `review` | 3 | Review | Internal quality review before routing for signatures. |
| `signature` | 4 | Signature | Routing to required signers; SLA clock active. |
| `audit` | 5 | Audit | Final audit evidence verification; highest-risk phase. |

---

*End of CES Component Field Reference*
