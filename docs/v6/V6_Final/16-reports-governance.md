# 16 - Reports, Governance, Help/User Guide, System Docs, Mobile Incident, Artifact Viewer, Generic Reference, Supervisor (16-reports-governance.png)

**View Group Coverage:** Reports/Governance (CES + v2 Onboarding), Help Center + User Guide, System Documentation (multiple sections), Mobile Incident Execution, Artifact Viewer, Generic Reference Viewer, Supervisor View.

**PNG Confirmation:** File exists at `Reference/V6/16-reports-governance.png` (96,948 bytes, timestamp 2026-06-19). 

**All 16+ PNGs Confirmed (00-16):**
- 00-main-prototype-shell.png
- 01-main-shell.png
- 02-dashboard.png
- 03-ces-kanban-board.png
- 04-ces-calendar.png
- 05-evidence-audit.png
- 06-onboarding-v2.png
- 07-journey.png
- 08-admin-roles-permissions.png
- 09-policy-library-viewer.png
- 10-forms-ecign.png
- 11-profiles-clinician-patient.png
- 12-calendars.png
- 13-framework-achc.png
- 14-iadministrator-brad.png
- 15-modals-overlays.png
- 16-reports-governance.png

All PNGs exist in `Reference/V6/`. They are static captures of the shared prototype shell (sidebar + topbar + Brad modal often visible) from http://localhost:5173/index.html served with the full JS prototype. Dynamic content (cards, tables, charts, lists) is client-rendered and captured in shell state.

**Primary Prototype Sources (read for this coverage):**
- `index.html`: `view()` registration function (starting ~1035) + `VIEW_GROUPS` definitions + specific render prototypes (ReportsPrototype, DetailPrototype, DocsPrototype, ReferenceViewerPrototype, ProfilesPrototype, etc.).
- `__components__/CareIndeedReferenceApp.jsx`: `LIVE_APP_PAGEVIEWS` (lines ~247+), `PrototypePageView` renderer (~971), `SYSTEM_DOC_SUBITEMS`, `TOP_NAV_ITEMS` (Help nav includes system docs + help), and React-specific generic cards for ces-reports, onboardingv2-governance, onboarding-supervisor, onboarding-guide, help, system-* pages.
- Related: renderTemplate switch (~4212), tones, card/metric helpers, shared SurfaceCard/MetricTile.

**Note on "Reports/Governance (already partly)":** Partial references exist in `COVERAGE_AND_QA_REPORT.md` (e.g. CES Reports `CE-R-01..03`, Governance under Onboarding v2 `GV-OV-*`, and System Documentation section listing SD-*). This MD consolidates full view() + prototype code analysis for V6.

## 1. Reports (CES + Governance)
**View Registrations (index.html):**
- `ces-reports` (group: "Compliance Execution (CES)"): label "CES Reports", route `/ces/reports`, icon `bar-chart-3`, template: `reports`.
  Description: "Executive CES reporting for sprint readiness, blockers, evidence throughput, signature aging, and survey exposure."
- `governance` (group: "System Documentation"): label "Governance", route `/governance`, icon `landmark`, template: `reports`.
  Description: "Governance command view for policy council queue, lifecycle approvals, crosswalk stewardship, and acknowledgment oversight."
- `onboarding-v2-governance` (group: "Onboarding v2"): label "Onboarding Governance", route `/onboarding-v2/governance`, icon `shield`, template: `reports`.

**Data (index.html ~529, ~647):**
```js
const cesReportCards = [
  card('Sprint readiness', 'Sprint 12 has 33 cards, 4 blockers, and 9 cards ready for certification.', 'teal', 'bar-chart-3', 84),
  card('Survey exposure', 'TB screening and board minutes carry the highest survey-facing risk this week.', 'orange', 'alert-triangle', 48),
  card('Evidence throughput', '18 locked artifacts were added this sprint with certificate and hash traceability.', 'teal', 'folder-open', 91),
];
const governanceReportCards = [
  card('Audit trail integrity', '...', 'teal', 'history', 88),
  card('Classification dictionary', '...', 'teal', 'book-marked', 82),
  card('Lifecycle stage controls', '...', 'orange', 'shield-check', 64),
];
```

**Metrics example for ces-reports:**
```js
metrics: [
  metric('Completion', '18%', 'Current sprint completion', 'orange'),
  metric('Audit readiness', '35%', 'Seeded CES posture', 'orange'),
  metric('Active blockers', '4', 'Evidence or signature gaps', 'orange'),
  metric('Signature SLA', '1 miss', 'Code-computed exception', 'teal'),
],
```

**Prototype Code (ReportsPrototype ~4104):**
```js
function ReportsPrototype({ view }) {
  // Renders bar chart (reportBars/reportLabels) in left col + SurfaceCards on right.
  // Uses view.reportTitle (e.g. 'Sprint readiness trend').
}
```
Bar rendering: dynamic height bars, teal/orange coloring based on index.

**React Coverage (CareIndeedReferenceApp.jsx ~383, ~539):**
- `'ces-reports'`: title 'Reports', metrics (Ready reports 8, Draft 3, Posture 94%), records CE-R-01/02/03 (Q2 Compliance Posture Report etc.).
- `'onboardingv2-governance'`: title 'Governance', metrics + records for overrides/attestations.
Uses generic `<PrototypePageView view={...}>` (metrics grid + record SpotlightCards).

## 2. Help Center + User Guide
**View Registrations (index.html):**
- `help-center` (group: "System Documentation"): label "Help Center", route `/help/*`, icon `help-circle`, template: `docs`.
- `user-guide` (group: "Onboarding"): label "User Guide", route `/journey/guide`, icon `book-marked`, template: `docs`.

**Docs data examples (index.html ~1737, ~1618):**
- Help Center: 14+ entries (Getting Started, Onboarding v2, Policy Lifecycle, Signing Documents, Compliance & Audit, ... Master Controls, iAdministrator (Brad)).
- User Guide: 6 entries mapping phases to /help/* links + policy refs (Appendix F, GAO, ROLE + Supervised, Clearance, Escalations, Contextual links).

**Prototype Code (DocsPrototype ~3187):**
```js
function DocsPrototype({ view }) {
  // 2-col: left "Contents" buttons list (first active teal), right detail sections with title + paragraphs.
  // Reuses view.docs as [[title, body], ...] + view.title, view.route.
}
```

**React Coverage:**
- `'help'`: title 'Help Center', metrics (Articles 42, Top eCIgn, Open 3), records HC-101/122.
- `'onboarding-guide'`: title 'User Guide', metrics (Guides 12, Updated 3, Acknowledged 89%), records UG-01/02.
- Uses `PrototypePageView`.

## 3. System Documentation
**View Registrations (index.html):**
- `system-docs` (group: "System Documentation"): route `/system-documentation/:sectionId`, template: `docs`.
- Also `governance` (see Reports above) and `help-center`.
- Data: CES Execution, Journey & Onboarding, PM & Sprints, Policy & Forms, Audit & Evidence.

**React Coverage (extensive, LIVE_APP_PAGEVIEWS ~679+):**
SYSTEM_DOC_SUBITEMS drives Help Center subnav + activePages:
- system-exec, system-arch, system-identity, system-workflow, system-training, system-audit, system-aws, system-hipaa, system-roadmap.
Each has dedicated entry e.g. `'system-exec'`, metrics + SD-EX-01 etc. records.
Rendered via PrototypePageView when `LIVE_APP_PAGEVIEWS[activePage]`.

**React Nav (~897):** Help Center top nav item aggregates help + demo + all SYSTEM_DOC_SUBITEMS.

## 4. Mobile Incident
**View Registration (index.html ~1317):**
- `mobile-incident` (group: "Compliance Execution (CES)"): label "Mobile Incident Execution", route `/calendar/event/:eventId/task/:taskId`, icon `smartphone`, template: `detail`.
- Description: "Mobile-first action surface for event context, task proof, signature, evidence capture, and approval."
- Title override: 'Mobile Incident Execution - Field Intake'

**Data:**
```js
const mobileIncidentCards = [
  card('Incident intake', 'Field user can capture event time, location, patient impact, and immediate action from mobile.', 'orange', 'smartphone', 58),
  card('Evidence capture', 'Photos, witness notes, and supervisor attestation attach directly to the workflow instance.', 'teal', 'camera', 72),
  card('Escalation path', 'Administrator and clinical manager are notified before closure or survey packet inclusion.', 'teal', 'bell', 66),
];
metrics: [
  metric('Open task', 'INC-1044', 'Field incident workflow', 'orange'),
  ...
]
```

**Prototype Code (DetailPrototype ~2660):**
```js
function DetailPrototype({ view }) {
  // Left: header (route badge + title + desc), cards grid via SurfaceCard.
  // Right: "Right panel preview" with fixed sections (Version chain, Linked forms, Evidence capture, Approval history).
  // "Advance" button present.
}
```
Used for mobile-incident, artifact-viewer, and detail views generally.

**Note:** Limited direct mirror in React LIVE_APP_PAGEVIEWS (incidents appear as records in workflows/evidence, e.g. 'WF-CE-09', 'EV-4519').

## 5. Artifact Viewer
**View Registration (index.html ~1465):**
- `artifact-viewer` (group: "Taxonomy"): label "Artifact Viewer", route `/artifacts/:artifactId`, icon `file-search`, template: `detail`.
- Description: "Read-only artifact surface for form instances, evidence, signature packets, audit packets, and evidence packages."
- Title: 'Artifact Viewer - Evidence Package Summary'

**Cards data:**
```js
cards: [
  card('Evidence package summary', 'package_ready with linked document count...', 'teal', ...),
  card('Artifact metadata', 'Event ID, task ID, requirement ID...', 'teal', ...),
  card('Status posture', 'VALIDATED, PROMOTED, EVIDENCE_LOCKED...', 'orange', ...),
]
```

Rendered with same `DetailPrototype`.

**React notes:** Artifacts heavily referenced (e.g. "Artifacts 312", EV records, evidence-center view, ces-evidence), but the specific `/artifacts/:id` viewer is index.html prototype detail.

## 6. Generic Reference (Reference Viewer)
**View Registration (index.html ~1474):**
- `generic-reference` (group: "Taxonomy"): label "Reference Viewer", route `/viewer/:referenceId`, icon `panel-right-open`, template: `reference-viewer`.
- Description: "Structured reference reader with source context, linked policies, citations, and artifact handoff."
- referenceBadge: 'Operational guide'
- Uses shared `referenceContents`, `referenceRelated`.

**Prototype Code (ReferenceViewerPrototype ~3899):**
- 6-col grid: narrow left aside (Contents nav buttons), main article (badge + title + body + section cards), right aside (Linked sources list + SurfaceCard).
- Strong emphasis on traceability (policy/form/workflow/crosswalk links).

**React Coverage:** Indirect (command palette includes 'HELP MANUAL', taxonomy/evidence links), but not a dedicated LIVE_APP_PAGEVIEW entry for generic-reference. Covered conceptually in policy library + help flows.

## 7. Supervisor View
**View Registration (index.html ~1564):**
- `supervisor` (group: "Onboarding"): label "Supervisor View", route `/journey/supervisor`, icon `user-check`, template: `profiles`.
- Description: "DON / preceptor roster. Progress by GAO/Role/Supervised/Annual, clearance gates (HR-TA-005 App B), supervised visit logging, escalations, and remediation."

**Data:**
- records table: learner roster (GAO/Role/Supervised/Esc/Status)
- metrics: Roster 14, Escalations 1, Cleared 4, ...
- cards, profileBars, selectedRecord.
- tableHeaders: ['ID', 'Learner', 'Role', 'GAO', 'Role', 'Supervised', 'Esc.', 'Status']

**Prototype:** Reuses `ProfilesPrototype` (see other profile views; shows roster table + detail panel + bars + metrics).

**React Coverage (~441):**
- `'onboarding-supervisor'`: title 'Supervisor View', metrics (Pending 3, Supervisor gates 4), records SA-01/02.
- Subnav under Onboarding: `{ label: 'Supervisor View', page: 'onboarding-supervisor' }`
- Rendered via generic PrototypePageView.

## Shared UI / Shell Notes (for 16- capture)
- All pages inherit TopBar (group ToneBadge, h2 title, description, action icons).
- Metrics grid (4-col) shown unless dashboard template.
- Cards use `SurfaceCard` (icon tile + ToneBadge + title + body + optional progress).
- Consistent tokens: brand-teal-*, brand-orange-*, shadow-soft, rounded-2xl, Inter/Montserrat.
- Sidebar groups include "Compliance Execution (CES)", "Onboarding", "System Documentation", "Taxonomy".
- In React redesign shell: similar glass topbar, workspace subnav, SpotlightCard for the generic views.

## Cross-References & V6 Good References
- index.html view defs: ~1304 (ces-reports), ~1317 (mobile-incident), ~1465 (artifact), ~1474 (generic-ref), ~1564 (supervisor), ~1618 (user-guide), ~1688 (onboarding-v2-governance), ~1728 (system-docs), ~1737 (help-center), ~1754 (governance).
- Prototypes: ~2660 (Detail), ~3187 (Docs), ~3899 (ReferenceViewer), ~4104 (Reports), ~2536 (Profiles).
- React: LIVE_APP_PAGEVIEWS ~383 (ces-reports), ~469 (onboarding-guide), ~539 (onboardingv2-gov), ~581 (help), ~679 (all system-*), ~441 (supervisor); PrototypePageView ~971; TOP_NAV ~896 (Help entry).
- Related MDs in V6/: 02-dashboard.md, 03-ces-kanban-board.md, 04-ces-calendar.md, 01-main-shell.md, my-tasks.md.
- Broader: COVERAGE_AND_QA_REPORT.md lists many SD-*, CE-R-*, UG-*, SA-*, GV-* sample IDs.
- Evidence/artifact heavy overlap with 05-evidence-audit.png coverage.

This provides consolidated coverage for batch 13-16 remaining items. The single 16-reports-governance.png visually anchors the shell state while these views are active. All V6 references are code-accurate as of the captured date.
