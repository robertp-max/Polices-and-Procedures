# Workflow Swimlane (workflow-swimlane) - CES Board View

**View Registration:** `workflow-swimlane` (group: "Compliance Execution (CES)")
- Label: "Workflow Swimlane"
- Route: `/workflows/:workflowId/swimlane`
- Icon: `git-branch`
- Template: `board`
- Description: "Swimlane execution view for a mandatory event from intake through evidence build, approval, and final packet lock."
- Metrics (specific):
  ```js
  metric('Phases', '4', 'Intake through lock', 'teal'),
  metric('Forms', '5', 'Required artifacts', 'orange'),
  metric('Approvers', '3', 'Role sequenced', 'teal'),
  metric('Lock state', '64%', 'Pending chair signature', 'orange'),
  ```
- columns: workflowSwimlaneColumns

**PNG Confirmation:** Use base `Reference/V6/04-ces-calendar.png` (96,948 bytes) or `Reference/V6/03-ces-kanban-board.png` (shared shell shows sidebar nav with workflows/CES items + modal). Swimlane content (4-column board) is dynamically rendered via BoardPrototype in index.html. Calendar events (e.g. Q2 QAPI) open dedicated CalendarSwimlaneView with richer q2QapiSwimlane data.

## Layout & Structure
- **Shell + metrics:** 4 metric tiles above header/desc + render.
- **BoardPrototype (~2381-2428):** Reusable for 'board' template (distinct from 'kanban' template):
  ```jsx
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
    {view.columns.map((column) => (
      <div key={column.title} className="rounded-2xl border ... p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 ...>{column.title}</h3>
          <ToneBadge tone={column.tone}>{column.cards.length}</ToneBadge>
        </div>
        <div className="space-y-3"> {cards...} </div>
      </div>
    ))}
  </div>
  ```
- Up to 5 columns on xl (responsive stack). Each column: header + count badge + stacked task cards.

## Swimlane Columns (workflowSwimlaneColumns ~469-501)
Data for generic workflow swimlane (4 phases):
1. **Intake** (tone: 'teal')
   - "Trigger Q2 governance event" (Compliance, Jun 19, meta: 'Mandatory events calendar', chips: ['Event'], progress: 92)
   - "Attach policy source set" (Policy Admin, Jun 19, 'GV-GB-001, CO-CP-001', chips: ['Policy'], 88)
2. **Evidence Build** (tone: 'orange')
   - "Collect board minutes and roster" (Administrator, Jun 20, 'GV-FM-005 and GV-FM-011', chips: ['Forms'], 56)
   - "Prepare QAPI trend packet" (QAPI Lead, Jun 21, 'Quarterly indicators', chips: ['QAPI'], 74)
3. **Approval** (tone: 'amber')
   - "Route chair signature" (Governing Body Chair, Jun 22, 'eCIgn sequence 2 of 3', chips: ['eCIgn'], 42)
   - "Administrator certification" (Robert Chen, Jun 23, 'Audit packet lock', chips: ['Approval'], 64)
4. **Locked** (tone: 'green')
   - "Publish survey packet index" (Compliance, Jun 24, 'HTML, markdown, evidence hash', chips: ['Audit'], 94)

## Card Rendering (BoardPrototype details)
- Card: `rounded-xl border ... bg-brand-neutral-50 p-3`
  - Title: `text-xs font-bold text-brand-teal-600`
  - Optional meta (10px neutral-400)
  - Due + owner row (10px bold neutral-400)
  - Chips: `rounded-full border border-brand-teal-100 bg-white px-2 py-1 text-[9px] font-bold uppercase ... text-brand-teal-600`
  - Tone dot (right): `h-2 w-2 rounded-full ${tones[...].dot}`
  - Conditional progress bar: `h-1.5 rounded-full bg-white` > inner `h-1.5 ${tones.bar}` (width %)
- Fallback for string cards.

## Richer Calendar Swimlane (q2QapiSwimlane + CalendarSwimlaneView)
- Triggered from calendar (e.g. day 10 "Q2 QAPI quarterly review" carries `swimlane: q2QapiSwimlane`).
- **q2QapiSwimlane** (~309-389): 7 detailed phases/lanes + metrics + summary:
  - Event Intake (3 cards)
  - Data Pull (4)
  - Clinical Review (3)
  - CAPA Build (3)
  - Committee Packet (4)
  - Approval & eCIgn (3)
  - Survey Lock (1)
- Cards include: id (Q2-QAPI-xx), status ('Ready'/'In progress'/'Needs review'), chips, progress.
- Rendered in CalendarSwimlaneView (~2169) when selectedEvent; hides generic header/metrics; shows back button, full metrics row inside, lanes, "Vertical swimlane" label.
- `buildDefaultSwimlane` fallback for other events.
- Ties to 21 tasks, packet assembly, survey-ready lock.

## Status Colors (Teal/Orange/Amber/Green Dominant)
- **teal**: Intake / active positive progress, ready states.
- **orange**: Evidence build, urgent needs, pending action.
- **amber**: Approval phase (distinct from orange).
- **green**: Final locked / certified / survey packet.
- Matches broader CES: calendar legend ("Teal events are ready; orange events need owner action."), kanban tones, ToneBadge, progress bars.
- Also amber/green in other board uses.

## Controls Integration & Related
- Workflow Swimlane is the execution surface for entries listed in **workflows** matrix.
- **master-controls** provides the overarching control inventory that these workflows enforce (e.g. policy refs, evidence requirements).
- Related: ces-calendar (click-to-swimlane), ces-board (kanban overview), evidence-center (artifacts produced in swimlane phases), audit-mode (post-lock review).
- In broader app: workflows referenced in framework, policy viewer (linked workflows), journey, onboarding, reports.
- Signature / eCIgn flows, packet lock, and export manifest are terminal states.

## Key Prototype Behaviors
- Dynamic route support (though prototype is SPA hash-based).
- Open from calendar events or nav (sidebar).
- Progress ubiquitous; owner + due always visible.
- Chips surface domain artifacts (Policy, Forms, eCIgn, Audit).
- Consistent glass / soft shadow / hover-lift styling.

**Sources:** VIEW_GROUPS ~1255 (registration), workflowSwimlaneColumns ~469, q2QapiSwimlane ~309, complianceCalendarEvents ~391, BoardPrototype ~2381, CalendarSwimlaneView ~2169, renderTemplate ~4216 (case 'board'), tones ~129, calendar open logic ~2285, App ~4543 (swimlane event listener).
