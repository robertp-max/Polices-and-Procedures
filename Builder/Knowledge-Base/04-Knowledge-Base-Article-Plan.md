# 04 — Knowledge Base Article Plan

> **Location:** `Builder/Knowledge-Base/04-Knowledge-Base-Article-Plan.md`
> **Status:** Authoritative article registry plan. Every Help Center article that must exist on day-1 of the new IA, with audience, purpose, source, related artifacts, and contextual placement.

> **Format:** each row is one article. Fields map to the `HelpArticle` schema in `02-Knowledge-Base-Architecture.md` § 4.

---

## Category 1 — Getting Started (`getting-started`)

| Slug | Title | Audience | Purpose | Sources | Related (workflows / policies) | Contextual placement |
|---|---|---|---|---|---|---|
| `welcome` | Welcome to CI-App | all | Orient any new user to CI-App: CES is the operating system, eCIgn is the signature subsystem, Forms / Audit / Calendar are supporting surfaces. | `Compliance-Execution-Sprints/00-README.md`, `eCIgn/README.md` | n/a | `/dashboard` |
| `roles-and-tiers` | Roles, Tiers & Permissions | all | Define Tier 1–4, who can do what, who can request second signature, who can void. | `eCIgn/03-Audit-and-Compliance-Model.md`, current `getting-started.ts` | EN-CM-001 | `/dashboard` (header) |
| `navigation` | Navigation & Workspace Layout | all | Two-panel shell, command rail, route map. | current `getting-started.ts`, `App_Component_Documentation/Universal_Navigation_System.md` | n/a | All routes |
| `your-first-sprint` | Your First Sprint | staff, workflow-owner | Walk a brand-new user through opening the board, finding their assignments, working a unit. | `02-Sprint-Structure.md`, `06-Sprint-Board-and-States.md`, `UIUX/03-Board-Operation-In-Use.md` | QA-WF-01 | `/ces/board` |
| `where-to-find-help` | Where To Find Help | all | Help Center map, contextual `?` icons, escalation. | this doc | n/a | `/help` |

---

## Category 2 — Compliance Execution Sprints (`ces`)

| Slug | Title | Audience | Purpose | Sources | Related | Placement |
|---|---|---|---|---|---|---|
| `board-overview` | The Sprint Execution Board | compliance-officer, workflow-owner, staff | Read the board: columns, states, what each card means. | `06-Sprint-Board-and-States.md`, `UIUX/03-Board-Operation-In-Use.md` | All workflows | `/ces/board` |
| `sprint-cadence` | Sprint Cadence & Boundaries | compliance-officer, administrator | 2-week sprints, naming, fixed boundaries, what cannot move. | `02-Sprint-Structure.md`, `09-Calendar-Integration.md` | n/a | `/ces/board` (header), `/ces/calendar` |
| `working-an-execution-unit` | Working an Execution Unit | staff, workflow-owner | Open a card, complete steps in order, attach evidence, request signature, mark complete. | `03-Workflow-Based-Execution.md`, `04-Assignment-Model.md`, `UIUX/01-UI-to-Execution-Mapping.md` | All workflows | `/ces/board` → ExecutionUnitCard |
| `assignment-and-handoff` | Assignment, Handoff & Reassignment | compliance-officer, workflow-owner | Owner / Role / Approver / Signer; how to reassign; required gates. | `04-Assignment-Model.md` | EN-CM-001 | `/ces/board` → assignment popover |
| `bundling-strategy` | Work Bundling for Efficiency | compliance-officer | When to bundle (QAPI worked example), when not to. | `05-Work-Bundling-Strategy.md` | QA-WF-01 | `/ces/workloads` |
| `recurring-execution` | Recurring Execution Items | compliance-officer | Mandatory items present every sprint and how the system inserts them. | `07-Recurring-Execution.md` | All recurring workflows | `/ces/board` |
| `calendar-primacy` | Why the Calendar Always Wins | compliance-officer, administrator | Calendar primacy and the system's response when a sprint conflicts. | `09-Calendar-Integration.md`, `01-Execution-Model.md` | n/a | `/ces/calendar` |
| `closing-a-sprint` | Closing a Sprint | compliance-officer | Closure gate: evidence filed, signatures captured, state → completed. | `06-Sprint-Board-and-States.md`, `10-Enforcement-and-Rules.md` | n/a | `/ces/board` (close action) |
| `monthly-retrospective` | Monthly Retrospective | compliance-officer, administrator | Retrospective rules in the last sprint of the month. | `08-Monthly-Retrospective.md` | n/a | `/ces/board` (retro tab) |
| `enforcement-rules` | Enforcement & Gating Rules | compliance-officer | What blocks, what late-flags, what hard-stops. | `10-Enforcement-and-Rules.md`, `UIUX/02-Enforcement-Implementation.md` | n/a | `/ces/board` |

---

## Category 3 — Workflows & Evidence (`workflows-evidence`)

| Slug | Title | Audience | Purpose | Sources | Related | Placement |
|---|---|---|---|---|---|---|
| `workflow-lifecycle` | Workflow Lifecycle | workflow-owner, staff | Prep → Doc → Review → Sign → Audit. Sequence is enforced. | `03-Workflow-Based-Execution.md`, `App_Component_Documentation/Workflow_and_Events_System.md` | All workflows | `/ces/board` → WorkflowDrawer |
| `capturing-evidence` | Capturing Evidence | staff, workflow-owner | What counts as evidence; how to attach; where it goes. | `Documentation/08-Audit-and-Evidence-Model.md` | n/a | WorkflowDrawer → Evidence panel |
| `evidence-rollup` | How Evidence Rolls Up | compliance-officer | Execution-unit evidence → sprint → audit aggregate. | `Documentation/08-Audit-and-Evidence-Model.md`, `src/policy/audit/auditAggregate.ts` | n/a | `/audit` |
| `blocked-items` | Blocked Items & Gating | staff, workflow-owner | Why an item is blocked, how to clear it, when to escalate. | `10-Enforcement-and-Rules.md` | n/a | ExecutionUnitCard (blocked badge) |
| `delegation` | Delegation & Coverage | compliance-officer, workflow-owner | When and how delegation is allowed without breaking the assignment model. | `04-Assignment-Model.md` | EN-CM-001 | WorkflowDrawer → assign |

---

## Category 4 — Forms Library (`forms-library`)

| Slug | Title | Audience | Purpose | Sources | Related | Placement |
|---|---|---|---|---|---|---|
| `browsing-forms` | Browsing & Searching Forms | all | Use the forms library, filters, taxonomy. | `FormsLibraryFindal.html`, `src/policy/pages/FormsPage.tsx` | EN-TG-001 | `/forms` |
| `filling-a-form` | Filling a Form | staff | Open a form, fill required fields, draft vs submit. | `src/policy/pages/FormPrintView.tsx`, `FormSigningWorkspace.tsx` | n/a | `/forms/:id` |
| `form-versioning` | Form Versioning & Drafts | compliance-officer | How drafts are tracked; when a new version is required. | `EN-LC-001.md` | EN-LC-001 | `/forms/:id` (draft banner) |
| `form-print-view` | Form Print View | all | What the printable layout shows; why nothing moves. | `eCIgn/06-Outputs-Templates-Watermarks.md`, `FormPrintView.tsx` | n/a | `/forms/:id/print` |
| `linking-forms-to-workflows` | Linking Forms to Workflows & Policies | compliance-officer | How a form participates in a workflow execution unit. | `WORKFLOW_LIBRARY_ARCHITECTURE.md`, `03-Workflow-Based-Execution.md` | All form-bearing workflows | `/forms/:id` (workflow chip) |

---

## Category 5 — Signatures & eCIgn (`signatures-ecign`)

| Slug | Title | Audience | Purpose | Sources | Related | Placement |
|---|---|---|---|---|---|---|
| `single-signature` | Single Signature Flow | signer | Disclosure → Identity → Review → Signature → Attestation → Lock. | `eCIgn/02-Signature-Workflow.md` | n/a | `/forms/:id` |
| `multi-signature` | Multi-Signature Flow | signer, approver, compliance-officer | Roster, sequencing, second-sig request rules (tier strictly above). | `eCIgn/09-Multi-Signature-Flow.md` | n/a | `/forms/:id` (multi-signer banner) |
| `decline-and-reissue` | Decline & Re-issue | signer, compliance-officer | Decline reasons; what re-issue does to the audit trail. | `eCIgn/09-Multi-Signature-Flow.md`, `eCIgn/05-Failure-Prevention.md` | n/a | Signer banner |
| `void-a-signed-document` | Voiding a Signed Document | administrator, compliance-officer | Tier ≤ 2 only; server-enforced; what evidence is generated. | `eCIgn/07-Data-Models-and-API.md` (`POST /api/ecign/instances/:id/void`) | n/a | `/audit` (instance detail) |
| `audit-trail` | Reading the Audit Trail | compliance-officer, auditor | The 4 appended pages and how to read them. | `eCIgn/06-Outputs-Templates-Watermarks.md`, `eCIgn/03-Audit-and-Compliance-Model.md` | n/a | `/audit` (instance) |
| `template-preservation` | Why Nothing Moves on the Template | all | The byte-identical template contract and why prints get rejected. | `eCIgn/06-Outputs-Templates-Watermarks.md` | n/a | `/forms/:id/print` (rejection toast) |
| `defensibility` | Legal & Audit Defensibility | compliance-officer, administrator, auditor | The Legal Binding Eligibility certificate and what it covers. | `eCIgn/08-Validation-and-Defensibility.md` | EN-CM-001 | `/audit` (header) |

---

## Category 6 — Audit & Reporting (`audit-reporting`)

| Slug | Title | Audience | Purpose | Sources | Related | Placement |
|---|---|---|---|---|---|---|
| `audit-mode-walkthrough` | Audit Mode Walkthrough | compliance-officer, auditor | What Audit Mode shows and how to use it during a survey. | `src/policy/pages/AuditModePage.tsx`, `Documentation/08-Audit-and-Evidence-Model.md` | n/a | `/audit` |
| `survey-packet` | Generating a Survey Packet | compliance-officer | Build a packet ZIP for a CMS surveyor. | `src/policy/audit/surveyPacket.ts`, `Survey-Simulation/01..06` | n/a | `/audit` (survey tab) |
| `executive-reports` | Executive Reports | administrator | What metrics are reported, how to interpret. | `11-Metrics-and-Reporting.md`, `src/policy/ces/components/reports/ExecutiveReports.tsx` | n/a | `/ces/reports` |
| `compliance-metrics` | Compliance Metrics | compliance-officer, administrator | On-time, blocked, audit-readiness — definitions and thresholds. | `11-Metrics-and-Reporting.md` | n/a | `/ces/reports` |
| `workload-distribution` | Workload Distribution | compliance-officer | View load by owner / role; rebalance. | `WorkloadDistribution.tsx`, `04-Assignment-Model.md` | n/a | `/ces/workloads` |
| `compliance-calendar` | The Compliance Calendar | compliance-officer | View, navigate, and reschedule (rules apply) calendar events. | `09-Calendar-Integration.md`, `ComplianceCalendar.tsx` | n/a | `/ces/calendar` |

---

## Category 7 — Administration (`administration`)

| Slug | Title | Audience | Purpose | Sources | Related | Placement |
|---|---|---|---|---|---|---|
| `tier-and-approver-config` | Configuring Tiers & Approvers | administrator | Set Tier 1–4, approver assignments. | current `roles-and-tiers` content + `EN-CM-001` | EN-CM-001 | `/admin/users` (planned) |
| `regulatory-calendar-management` | Managing the Regulatory Calendar | administrator, compliance-officer | Source events, recurrences, blackout windows. | `09-Calendar-Integration.md`, `ChatGPTmandatedEvents.md` | n/a | `/ces/calendar` (admin) |
| `policy-lifecycle` | Policy Lifecycle (EN-LC-001) | compliance-officer | Draft → Review → Approve → Publish → Amend. | `EN-LC-001.md` | EN-LC-001 | `/library`, `/draft` |
| `amendment-register` | Amendment Register | compliance-officer | Read and update the register. | `PP_AMENDMENT_REGISTER.md` | EN-LC-001 | `/library` (amendments) |
| `iadministrator-overview` | iAdministrator Overview | administrator | Map of the iAdministrator surface. | `iAdministrator-Manual.md`, `iAdministrator-OperatorGuide.md` | n/a | `/iAdministrator` |
| `governance-exceptions` | Governance Exceptions | administrator | When and how to request a written exception. | `Compliance-Execution-Sprints/00-README.md` § 5.2 | n/a | `/admin/governance` (planned) |

---

## Category 8 — Troubleshooting (`troubleshooting`)

| Slug | Title | Audience | Purpose | Sources | Related | Placement |
|---|---|---|---|---|---|---|
| `why-blocked` | Why Is My Sprint Item Blocked? | staff, workflow-owner | Common gating reasons and clearing paths. | `10-Enforcement-and-Rules.md` | n/a | ExecutionUnitCard |
| `why-wont-it-sign` | Why Won't This Document Sign? | signer | 6-step lifecycle failures and how to recover. | `eCIgn/05-Failure-Prevention.md`, `eCIgn/02-Signature-Workflow.md` | n/a | `/forms/:id` |
| `print-rejected` | "Print rejected — template integrity" | staff, signer | The print engine refused to mutate the template; how to fix. | `eCIgn/06-Outputs-Templates-Watermarks.md` | n/a | `/forms/:id/print` |
| `calendar-drift` | Calendar Drift / Event Missed | compliance-officer | Detect, explain, remediate. | `09-Calendar-Integration.md`, `Documentation/10-Risk-and-Escalation-Model.md` | n/a | `/ces/calendar` |
| `access-denied` | Access Denied (Tier Check Failed) | all | What the tier model rejected and why. | `eCIgn/03-Audit-and-Compliance-Model.md` | EN-CM-001 | Inline toast |
| `evidence-missing` | Missing or Invalid Evidence | staff, workflow-owner | Evidence checks and remediation. | `Documentation/08-Audit-and-Evidence-Model.md` | n/a | WorkflowDrawer → Evidence |

---

## Category 9 — Developer Reference (`developer-reference`)

> Developer-Reference articles are **stubs** that point at canonical files under `Developer-Reference/` and `Architecture/`. They keep the Help Center category populated for in-app developer help while preventing duplication.

| Slug | Title | Audience | Sources |
|---|---|---|---|
| `architecture-index` | Architecture Index | developer | `Builder/Knowledge-Base/Architecture/` |
| `data-model-index` | Data Model Index | developer | `System/Data-Model/Index.md` |
| `routes-and-pages` | Routes & Pages | developer | `System/Routes/Map.md`, `Page_and_Route_Map.md` |
| `component-registry` | Component Registry | developer | `Component_Registry.md`, `Component_Detail_Docs.md` |
| `api-ces` | CES API Surface | developer | `Documentation/02-Architecture-and-Data-Model.md`, `server/routes/` |
| `api-ecign` | eCIgn API Surface | developer | `eCIgn/07-Data-Models-and-API.md`, `server/ecign/` |
| `api-audit` | Audit & Survey API | developer | `src/policy/audit/`, `surveyPacket.ts` |
| `scripts-and-runbooks` | Scripts & Runbooks | developer | `scripts/*.ts`, `Developer-Reference/Scripts/` |
| `infrastructure` | Infrastructure | developer | `R2_STORAGE_ARCHITECTURE.md`, `AWS_Phase1_*` |

---

## Article counts (day-1 KB)

| Category | Articles |
|---|---|
| 1. Getting Started | 5 |
| 2. CES | 10 |
| 3. Workflows & Evidence | 5 |
| 4. Forms Library | 5 |
| 5. Signatures & eCIgn | 7 |
| 6. Audit & Reporting | 6 |
| 7. Administration | 6 |
| 8. Troubleshooting | 6 |
| 9. Developer Reference | 9 |
| **Total** | **59** |

> CES + Workflows + Audit + Administration + Troubleshooting = **33 articles** (56%). Signatures & eCIgn = **7 articles** (12%). The Help Center is no longer eCIgn-led.

---

## Authoring rules

1. Article Markdown lives at `KB-Articles/<NN>-<category>/<slug>.md`.
2. Frontmatter mirrors the `HelpArticle` schema exactly.
3. Body: ≤ 400 words; ≤ 7 numbered steps; one screenshot reference max.
4. Every cross-link uses a relative path; no hard-coded `/Builder/...` outside the `related.architecture` field.
5. No article duplicates a paragraph from any architecture doc; quote at most 3 sentences and link.
6. Every article is reviewed by Compliance Officer before publish.
