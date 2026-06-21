# Workflows Library (workflows) - CES Matrix View

**View Registration:** `workflows` (group: "Compliance Execution (CES)")
- Label: "Workflows Library"
- Route: `/workflows`
- Icon: `workflow`
- Template: `matrix`
- Description: "Workflows Library prototype for the active app route /workflows."
- Metrics (specific):
  ```js
  metric('Workflows', '42', 'Active library entries', 'teal'),
  metric('Event-backed', '18', 'Mandatory calendar links', 'green'),
  metric('Needs review', '6', 'Owner or evidence gaps', 'orange'),
  metric('Automated', '71%', 'Evidence and signatures', 'teal'),
  ```
- Table headers: ['Workflow ID', 'Workflow title', 'Domain / owner', 'Status']
- Cards: 3 contextual SurfaceCards (QAPI, Incident, Governance)

**PNG Confirmation:** Use base shell `Reference/V6/04-ces-calendar.png` (96,948 bytes, timestamp 2026-06-19) or `Reference/V6/03-ces-kanban-board.png`. Static PNG captures shared prototype shell + sidebar (showing "Workflows" under COMPLIANCE EXECUTION (CES) nav) + Brad modal; dynamic content (DataTable matrix + right cards + top metrics) rendered via React-in-HTML (MatrixPrototype + DataTable) in index.html.

## Layout & Structure
- **Generic CES shell applies:** Top metrics grid (4 tiles via MetricCard/MetricTile), page header with group badge "Compliance Execution (CES)", title "Workflows Library", description.
- **MatrixPrototype render (~4203-4210):**
  ```jsx
  <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
    <div className="xl:col-span-3"><DataTable view={view} /></div>
    <div className="xl:col-span-2 space-y-4">{view.cards.map((item) => <SurfaceCard key={item.title} item={item} />)}</div>
  </div>
  ```
- Left/main: DataTable (wide table view).
- Right: 2-col span of SurfaceCards (context cards).

## Matrix View (DataTable + Cards)
- **DataTable (~1911-1955):** Renders as CSS grid table (no native <table>).
  - Header row: `grid ... bg-brand-neutral-50 ... uppercase tracking-widest`
  - Rows: hover:bg-brand-teal-50/40; ID cell bold teal-500, title teal-600, status last-col uses ToneBadge (orange if status-like term, else teal).
- **Records (workflowRecords ~460-467):**
  ```js
  [
    ['QA-WF-03', 'QAPI Committee Review', 'Governance / QAPI', 'Active'],
    ['CO-WF-02', 'Incident response and escalation', 'Compliance', 'Active'],
    ['GV-WF-01', 'Quarterly Governing Body Packet', 'Governance', 'Ready'],
    ['HR-WF-05', 'Competency validation and license review', 'Human Resources', 'Review'],
    ['RM-WF-04', 'Emergency drill after-action workflow', 'Risk Management', 'Ready'],
    ['CL-WF-08', 'Clinical chart audit and care plan review', 'Clinical Ops', 'Active'],
  ]
  ```
- **SurfaceCards (via card() helper ~1031):** Right rail shows key workflow archetypes:
  - 'QAPI committee packet' (teal, 'workflow' icon, 78%) — "Agenda, attendance, minutes, action tracker, and dashboard move together through packet lock."
  - 'Incident escalation' (orange, 'git-branch', 62%) — "Mobile incident intake routes evidence, supervisor review, and administrator notification in one swimlane."
  - 'Governance cadence' (teal, 'landmark', 84%) — "Quarterly governing body packet links calendar, policy, forms, minutes, and eCIgn certificate."
- CTAs from default or view: 'Open workspace' / 'Export view'.

## Board vs Matrix Distinction
- 'matrix' (default for table-heavy views like workflows, master-controls): Table left + cards right.
- 'board' (for workflow-swimlane, my-tasks): Vertical column lanes via BoardPrototype (see workflow-swimlane.md).
- Kanban is separate specialized 'kanban' template (ces-board).

## Status Colors (Teal / Orange / Amber / Green + Slate)
From global `tones` object (~129-159):
- **teal**: Primary active/ready (e.g. most workflows, 71% automated).
- **orange**: Needs review, high-visibility gaps, incident.
- **amber**: Review / awaiting states.
- **green**: Ready, event-backed, certified.
- **slate**: Backlog/upcoming (used elsewhere).
- ToneBadge: dot + uppercase pill; status logic detects keywords like 'review' → orange badge.
- Consistent with calendar (teal=ready, orange=action), kanban, board cards, progress bars.

## Related CES Views & Cross-Links
- **workflow-swimlane** (/workflows/:id/swimlane): Board template execution drill-down (phases Intake → Evidence Build → Approval → Locked); linked from calendar events and library.
- **ces-board** (kanban): Full sprint KanbanPrototype for cards (different from board template).
- **ces-calendar**: Events clickable to swimlane (Q2 QAPI uses detailed q2QapiSwimlane with 7 lanes).
- **master-controls**: Sibling matrix view (see master-controls.md).
- **audit-mode** / **evidence-center**: Post-workflow states.
- **my-tasks**: Personal board view.
- Framework / policy links mention workflows (e.g. "tied to policies, forms, workflows").
- In swimlane contexts (calendar, QAPI): 21-task packets, eCIgn signatures, packet lock.

## Key UI Elements
- Metrics row above (4 tiles): always shown for non-dashboard.
- Progress bars in SurfaceCards (h-2).
- Responsive grid: collapses to single col; xl uses 3+2 split for matrix.
- Sidebar nav includes direct "Workflows" item under CES group.
- Icons via lucide (workflow, git-branch, shield-check for related).

**Sources:** VIEW_GROUPS ~1240 (registration), workflowRecords ~460, view() helper ~1035, MatrixPrototype ~4203, DataTable ~1911, SurfaceCard ~1885, MetricTile ~1875, tones ~129, renderTemplate ~4240, App render ~4599, calendar swimlane integration ~2119+.
