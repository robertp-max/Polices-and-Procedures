# Route Map

## Routing architecture

`app/page.tsx` redirects the root entry to `/journey`. Employee workspaces share the portal shell through the `(portal)` route group. GAO-001 uses the separate `(player)` route group so it is not nested inside the portal shell.

| URL | Page component | Workspace | Navigation entry |
|---|---|---|---|
| `/journey` | `app/journey/(portal)/page.tsx` | `EmployeeHome` | Home |
| `/journey/my-journey` | `app/journey/(portal)/my-journey/page.tsx` | `EmployeeJourneyTimeline` | My Journey / Journey |
| `/journey/training` | `app/journey/(portal)/training/page.tsx` | `TrainingWorkspace` | Training |
| `/journey/policies` | `app/journey/(portal)/policies/page.tsx` | `PolicyWorkspace` | Policies / More |
| `/journey/documents` | `app/journey/(portal)/documents/page.tsx` | `DocumentWorkspace` | Documents |
| `/journey/competencies` | `app/journey/(portal)/competencies/page.tsx` | `CompetencyWorkspace` | Competencies / More |
| `/journey/performance` | `app/journey/(portal)/performance/page.tsx` | `PerformanceWorkspace` | Performance / More |
| `/journey/history` | `app/journey/(portal)/history/page.tsx` | `HistoryWorkspace` | History / More |
| `/journey/support` | `app/journey/(portal)/support/page.tsx` | `SupportWorkspace` | More / support links |
| `/journey/training/gao-001` | `app/journey/(player)/training/gao-001/page.tsx` | `Gao001Preview` | Training card / Continue card |

## Shared layouts

| Layout | Responsibility |
|---|---|
| `app/journey/layout.tsx` | Supplies synthetic persona context to all journey routes |
| `app/journey/(portal)/layout.tsx` | Supplies the employee shell, desktop navigation, mobile navigation, preview toolbar, and live region |
| `(player)` route group | Keeps GAO-001 full-page and prevents a portal-modal → nested-player stack |

## URL state

The active synthetic persona is represented as `?persona=<fixture-id>`. Links preserve that parameter, so direct links, refresh, Back, and Forward retain the selected fixture without persistence.

Browser QA confirmed all ten routes render HTTP 200, contain their expected H1, have no horizontal overflow at the desktop test viewport, and use no remote required images.

