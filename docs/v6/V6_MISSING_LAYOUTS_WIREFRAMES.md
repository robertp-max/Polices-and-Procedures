# V6 Missing Layouts Visual Wireframes

This document provides the visual wireframe layout specifications for the two routes that previously lacked visual design references, completing the 56-view visual design set.

---

## 1. Events Board (`/ces/events`)

### Visual Reference
![Events Board Wireframe Mockup](file:///c:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/docs/v6/V6_Final/55-events-board.png)

### Layout & Component Structure
- **Group**: Compliance Execution (CES)
- **Template**: `board` (4-column configuration)
- **Topbar Header**:
  - Eyebrow: `Compliance Execution (CES)`
  - Title: `Events Board`
  - Description: `Track overdue, critical, and at-risk operational events and compliance milestones.`
  - Action buttons: Filter chips and range selectors.
- **Top Metrics Row**:
  - `MetricTile`: `Total At-Risk` (Value: 5, Tone: orange)
  - `MetricTile`: `Overdue Events` (Value: 2, Tone: orange)
  - `MetricTile`: `Awaiting Action` (Value: 8, Tone: amber)
  - `MetricTile`: `Cleared Today` (Value: 12, Tone: green)
- **Board Lanes (4 vertical lanes)**:
  1. **Overdue** (orange dot): For events past their SLA due dates.
  2. **Critical** (orange dot): High-acuity or surveyor-exposed events requiring immediate response.
  3. **At-Risk** (amber dot): Looming deadlines within 48 hours.
  4. **Standard** (teal dot): Regular schedule events under normal progress.
- **Card Elements**:
  - Event ID (e.g. `EVT-1002`, bold teal)
  - Title/Type of event (e.g. `QAPI Review Lock`, `Governing Body Sweep`)
  - Owner / Assignee profile indicator
  - Small progress bar tracking unit completion %
  - Target Due Date label

### State Specifications (Template: `board`)
- **Interaction**: Drag-and-drop card movement (dnd-kit keyboard/mouse sensor), click card → open Task Details right drawer.
- **Empty**: Renders a dotted empty state card placeholder with helper text ("No active events in this lane").
- **Loading**: Lane skeletons representing card grids.
- **Error**: Lane isolate fails gracefully with retry button without crashing the shell.

---

## 2. Policy Lifecycle Detail (`/policy-lifecycle/:policyId`)

### Visual Reference
![Policy Lifecycle Detail Wireframe Mockup](file:///c:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/docs/v6/V6_Final/56-policy-lifecycle-detail.png)

### Layout & Component Structure
- **Group**: System
- **Template**: `lifecycle`
- **Topbar Header**:
  - Eyebrow: `System`
  - Title: `ADM-HR-004 - Staffing Qualifications`
  - Description: `Audit trail, revision logs, and lifecycle stages for agency policy records.`
  - Stepper indicator: Horizontal indicator tracking progress phases (`Draft` -> `Review` -> `Approved` -> `Published` -> `Archived`).
- **Main Columns (Left: 8 cols, Right: 4 cols split)**:
  - **Left Pane (Policy Preview, SurfaceCard style)**:
    - Displays objective, scope, and CMS regulatory anchors (e.g., `42 CFR 484.105(a)`).
    - Policy draft raw body text scroll block.
  - **Right Pane (Audit Log & Metadata)**:
    - **Metadata SurfaceCard**: Shows owner, version history index (`v2.4`), and active regulatory crosswalks.
    - **Chronological Audit Timeline**: Vertical timeline showing state change events (e.g., `Background sweep completed`, `Override requested by Administrator`, `Approved by Committee`) with precise UTC timestamps and actor profiles.

### State Specifications (Template: `lifecycle`)
- **Interaction**: Phase step navigation links, expand timeline log details.
- **Empty**: Default fallback state showing empty details if policy ID is not found.
- **Loading**: Left text skeleton bars + right timeline pulse shimmers.
- **Error**: Error boundary panel offering redirection back to `/policy-lifecycle` index.
