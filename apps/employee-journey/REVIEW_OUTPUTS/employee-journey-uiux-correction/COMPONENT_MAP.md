# Component Map

## Application composition

| Component / module | Responsibility |
|---|---|
| `EmployeePortalShell` | Desktop sidebar, exact five-item mobile navigation, support entry, selected persona summary, and route-active state |
| `EmployeePreviewToolbar` | Clearly separated synthetic persona selector and no-official-record disclosure |
| `PreviewContext` | Query-backed persona selection, persona-aware links, ephemeral live-region messages |
| `EmployeeHome` | Ordered employee summary and priority focus list |
| `EmployeeJourneyTimeline` | Sixteen-phase lifecycle with independent workstream detail |
| `TrainingWorkspace` | Assignment filters, complete requirement cards, unavailable-content state |
| `PolicyWorkspace` | Learner-facing policy assignments and policy summary modal |
| `DocumentWorkspace` | Document status tabs, eleven document families, renewal drawer |
| `CompetencyWorkspace` | Role/assignment-specific supervised-practice and competency examples |
| `PerformanceWorkspace` | Read-only check-ins, evaluations, goals, coaching, plans, and follow-up |
| `HistoryWorkspace` | Transcript, certificates, acknowledgments, competency history, milestones |
| `SupportWorkspace` | Nolan explanation and preview-only support choices |
| `StatusBadge` | Icon + text state treatment; state is never color-only |
| `RequirementCard` | Canonical assignment/requirement card structure |
| `MilestoneCard` | Lifecycle phase structure and accessible phase label |
| `PreviewDrawer` | UI-only document renewal preview |
| `WorkspaceTabs` | ARIA tab semantics and Arrow/Home/End keyboard navigation |
| `Modal` / `Drawer` | Shared focus trap, Escape close, focus restore, and scroll lock |
| `MoreSheet` | Mobile-only Policies, Competencies, Performance, History, and Support sheet |
| `LiveRegion` | Polite, atomic preview-action announcements |
| `Gao001Preview` | Full-page player header and synthetic completion disclosure |
| `GAO001Scene01WelcomeDesk` | Preserved approved scene content with local art and synthetic badge behavior |
| `GAO001SharedOverlay` | Shared GAO hotspot/knowledge-check overlay with truthful preview completion copy |

## CSS layers

| File | Scope |
|---|---|
| `tokens.css` | Brand colors, surfaces, border, shadow, radii, and layout tokens |
| `base.css` | Reset, typography, focus, buttons, skip link, reduced motion |
| `shell.css` | Desktop/mobile shell and preview toolbar |
| `components.css` | Cards, status, tabs, dialogs, drawers, live region |
| `workspaces.css` | Home, lifecycle, documents, performance, history, support, GAO route |
| `responsive.css` | Breakpoint composition, compact 320px treatment, safe-area navigation |

## Boundary statement

No component imports or calls an employee-record API. Preview actions update in-memory component state or announce a truthful preview message only.

