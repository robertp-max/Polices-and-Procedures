# Component Detail Docs

This file documents major components/modules by UI responsibility, business logic responsibility, and data flow.

---

## Dashboard (`DashboardPage`)

- **Purpose**
  - Central command center for compliance posture and execution health.
- **UI responsibility**
  - Displays KPI tiles, urgency/state summaries, and quick operational visibility.
- **Business logic responsibility**
  - Merges seed events with execution store and autogen state.
  - Applies timeline state classification logic.
- **Data flow**
  - Inputs: `regulatoryEvents`, `regulatoryExecutionStore`, `autogenStore`.
  - Outputs: computed status chips/cards and workflow launch points.
- **Key states**
  - event urgency, completion status, evidence/approval readiness.
- **Key interactions**
  - open workflow drawers/panels, navigate to calendar/audit.
- **Edge cases handled**
  - missing execution overrides fallback to seed event status.
- **Known limitations**
  - relies on local persisted execution state (single-browser scope).

---

## Policy Library (`LibraryPage`)

- **Purpose**
  - Lists policy corpus and opens detailed policy views.
- **UI responsibility**
  - Search/sort/filter list and render summary metadata.
- **Business logic responsibility**
  - Uses shell/detail mode toggles and policy content retrieval handoff.
- **Data flow**
  - Inputs: framework/policy seed-backed stores.
  - Outputs: route transition to policy detail.
- **Key states**
  - selected policy, query/filter state.
- **Edge cases handled**
  - unknown policy IDs are redirected or rendered with fallback content state.
- **Known limitations**
  - content coverage depends on generated `policyContentMap`.

---

## Policy Detail View (`PolicyDetailPage`, `GVPolicyDetailView`, `CLPolicyDetailView`, `GVGBDetailView`, `SharedPolicyDetailView`)

- **Purpose**
  - Shows policy body, metadata, lifecycle status, and print/reporting entry points.
- **UI responsibility**
  - Domain-specific detail rendering for governance/clinical variants.
- **Business logic responsibility**
  - Chooses correct renderer based on policy ID family.
  - Integrates lifecycle status indicators and draft/review context.
- **Data flow**
  - Inputs: route `policyId`, `policyStore`, `policyContentMap`.
  - Outputs: print route links, draft/review workflow transitions.
- **Key states**
  - lifecycle status, current/published version, lock status.
- **Edge cases handled**
  - missing body content path returns null-safe rendering.
- **Known limitations**
  - currently mapped content appears narrow in `policyContentMap` (single specimen source map pattern).

---

## Forms Library (`FormsPage`)

- **Purpose**
  - Enterprise forms catalog browsing and open/print launching.
- **UI responsibility**
  - Presents form metadata with policy links and action controls.
- **Business logic responsibility**
  - Bridges form dataset with `FormViewer` and print helper.
- **Data flow**
  - Inputs: `FORMS_DATASET`.
  - Outputs: route to `/forms/:formId`, print calls to `printForm(formId)`.
- **Key states**
  - selected form/filter text.
- **Edge cases handled**
  - unknown IDs are handled downstream by `FormViewer`.
- **Known limitations**
  - dataset/build mismatch can create stale link references.

---

## Form Viewer (`FormViewer`, `FormBody`, `FormPrintView`)

- **Purpose**
  - Render complete form definitions as interactive and printable artifacts.
- **UI responsibility**
  - Display sections, fields, org chart special section, and action bar.
- **Business logic responsibility**
  - Build full form content from dataset + override templates.
  - Handle embedded mode vs standalone mode.
- **Data flow**
  - Inputs: `FORMS_DATASET`, `buildFormContent`, route/prop `formId`.
  - Outputs: browser print flow and HTML download action.
- **Key states**
  - embedded/standalone mode, resolved content, orientation.
- **Key interactions**
  - print action, close/back navigation, inline field entry.
- **Edge cases handled**
  - missing `formId` and missing form record fallback.
  - embedded print mode suppresses duplicate auto-print.
- **Known limitations**
  - client-side HTML download captures current DOM (not authoritative PDF pipeline).

---

## Print Views (Policy + Form + Appendix)

- **Purpose**
  - Produce print-ready policy and form outputs with pagination-safe CSS.
- **UI responsibility**
  - Clean print surface without shell chrome.
- **Business logic responsibility**
  - Route precedence to ensure specialized GV-GB routes are not shadowed.
  - iframe-based print orchestration via `printForm`.
- **Data flow**
  - Inputs: `policyId` / `formId` route params and mapped content.
  - Outputs: browser print dialog and PDF naming conventions via route context.
- **Key states**
  - form orientation and page style constraints.
- **Edge cases handled**
  - `afterprint` cleanup fallback timeout.
- **Known limitations**
  - browser print engine differences can still affect exact pagination.

---

## Workflows (`WorkflowLibraryApp` and workflow components)

- **Purpose**
  - Browse and inspect compiled operational workflows by domain.
- **UI responsibility**
  - Domain rail, workflow cards, workflow detail, linked workflow graph.
- **Business logic responsibility**
  - Uses generated workflow graph and typed workflow model.
  - Preserves authored step order and references.
- **Data flow**
  - Inputs: `workflows.generated`, `workflowGraph.generated`, `formTitles.generated`.
  - Outputs: workflow detail views and linked traversal.
- **Key states**
  - selected domain, selected workflow, compact mode.
- **Edge cases handled**
  - absent workflow IDs route to landing/fallback behavior.
- **Known limitations**
  - `workflowTemplates.generated` integration appears incomplete (`Needs confirmation`).

---

## Mandated Events Calendar (`MasterCalendarPage`, `TimelineMonth`, `WorkflowExecutionPanel`)

- **Purpose**
  - Operational calendar of mandated/regulatory events.
- **UI responsibility**
  - Visual timeline + event details + execution progress.
- **Business logic responsibility**
  - Merge static event model with persisted execution overrides and enforcement locks.
- **Data flow**
  - Inputs: `regulatoryEvents`, `autogenStore`, `regulatoryExecutionStore`.
  - Outputs: status changes, evidence/approval updates, completion/certification.
- **Key states**
  - urgency, completion, lock, missing evidence, pending approvals.
- **Edge cases handled**
  - lock guard blocks mutation and logs enforcement events.
- **Known limitations**
  - localStorage persistence means no multi-user reconciliation by default.

---

## Master Control Inventory (`MasterControlInventoryPage`, `MasterControlInventory`, `masterControlInventory.ts`)

- **Purpose**
  - Compliance control inventory mapped to source policies and evidence obligations.
- **UI responsibility**
  - Control list filter/view with status/risk dimensions.
- **Business logic responsibility**
  - Normalize source JSON payload into typed control records.
- **Data flow**
  - Inputs: `/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`.
  - Outputs: mapped `MasterControlItem[]` for rendering.
- **Key states**
  - control category, status, risk.
- **Edge cases handled**
  - fetch failure returns fallback empty controls.
- **Known limitations**
  - runtime dependency on static serving of `Builder` path (`Needs confirmation`).

---

## Brad iAdministrator (UI + backend)

### UI layer (`iAdministrator` page + components + hooks)
- **Purpose**
  - Ask compliance questions, run chat mode, inspect references, and trigger artifacts.
- **Key logic**
  - Uses SSE (`queryStream`, `chatStream`) with phase-1 retrieval preview then completion payload.
  - Distinguishes backend mode (`available`, `index_not_built`, `static_deploy`, etc.).
- **States**
  - query loading/retrieving, chat thread, session summary, selected reference.

### Backend layer (`server/ia/*`)
- **Purpose**
  - Local RAG and structured response engine for compliance assistant.
- **Key logic**
  - retrieval classification + search + responder guardrails + scenario normalization.
  - session management and audit logging.
- **Edge cases**
  - index missing, ollama failure, no-hit scenario with high-stakes fallback.
- **Known limitation**
  - deterministic frontend Brad workflow modules not wired to this UI path (`Needs confirmation`).

---

## Documentation / Reports Area

- **Purpose**
  - Store generated and authored audit/security/compliance documentation artifacts.
- **Primary locations**
  - `Builder/Documentations/*`
  - `documentation/*`
  - `.cache/forms-build/*` (build/reconciliation outputs)
  - `.cache/ia-index/*` (Brad index artifacts)
- **Business logic responsibility**
  - Not interactive UI components by default; used as build/runtime references and operational artifacts.
- **Known limitations**
  - multiple duplicated report files exist across folders (`Needs confirmation`: source-of-truth location).

