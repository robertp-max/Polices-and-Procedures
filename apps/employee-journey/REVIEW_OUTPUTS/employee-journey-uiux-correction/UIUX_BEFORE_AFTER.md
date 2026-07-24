# Employee Journey UI/UX Before & After

## Scope

This correction is front-end only. It uses deterministic synthetic fixtures and ephemeral React state. No API, database, authentication, persistence, cloud, deployment, or official employee-record behavior was added.

## Before / after summary

| Area | Uploaded source | Corrected source |
|---|---|---|
| Information architecture | One oversized root-page experience with state-driven workspace switching | Nine employee workspaces with stable URLs, plus a separate full-page GAO route |
| Browser behavior | Workspace state did not reliably survive direct links, refresh, Back, or Forward | Each workspace is route-backed; the synthetic persona remains in the query string |
| Employee navigation | Preview/admin concepts were mixed into the employee experience | Desktop contains the eight employee destinations only; mobile contains exactly Home, Journey, Training, Documents, More |
| Preview identity | Production-like identity and role-switching concepts were not clearly separated | A persistent `SYNTHETIC PERSONA PREVIEW` toolbar states that no official employee record is shown |
| Home | Large presentation treatment and diffuse priorities | Compact Continue card, four priority-ordered focus items, then stage/training/policy/document/competency/performance/annual/support summaries |
| Lifecycle | Progress was compressed into a simplified status model | Sixteen distinct phases show dates, actions, dependencies, policy/workflow basis, and next milestone |
| Training | Incomplete catalog items could appear actionable | Every card explains assignment, audience, date, duration, prerequisite, validation, progress, and availability; unpublished content is disabled |
| Policies | Large bundles and internal publication concepts reached employee-facing UI | One-policy assignments show version/change/action context; internal hold/conflict language is absent |
| Documents | Incomplete credential workflow and ambiguous completion behavior | Eleven document families, status tabs, masked identifiers, verification context, and a UI-only renewal drawer with explicit no-submission language |
| Competencies | Cadence could be read as universal | Role/assignment-specific examples and an explicit cadence caveat |
| Performance | Evaluation ownership was not sufficiently clear | Read-only reviewer decisions, separate check-in/evaluation views, and employee-limited actions |
| History | Achievement-oriented framing | `Certificates & History`, prioritizing transcript, certificates, acknowledgments, competency history, and milestones |
| Support | Backend-like success language | Preview-only explanations and `No official record was changed` announcements |
| Visual system | Broad clay-style depth across cards and chips | Warm ivory canvas, white surfaces, subtle borders, one restrained shadow tier, orange actions, and teal structure |
| Typography | Essential copy could fall below the requested minimum | No visible text below 12px in browser QA; body remains 15–16px |
| Dialog accessibility | Inconsistent modal/drawer mechanics | Shared focus trap, Escape close, focus restore, scroll lock, visible focus, and live announcements |
| GAO-001 | Nested player presentation, remote asset risk, and camera-oriented badge mechanics | One full-page route, local optimized scene art, static synthetic badge, optional local image preview, and no device-camera request |

## Design outcome

The corrected UI treats the portal as a practical employee workspace instead of a presentation surface. Status, assignment basis, due dates, and ownership are visible without turning synthetic preview actions into official records.

