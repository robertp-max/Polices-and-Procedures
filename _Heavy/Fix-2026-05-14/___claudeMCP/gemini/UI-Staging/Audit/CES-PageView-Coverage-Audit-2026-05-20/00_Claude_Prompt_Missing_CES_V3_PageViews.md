# PROMPT FOR CLAUDE: Generate Missing CES Execution Page Views in Full V3 Veil Glass Style

**Date**: 2026-05-20  
**Context**: Deep page view coverage audit of the current V3 Veil Glass system. We have excellent full-V3 coverage of the core operational surfaces in the staging harness (see matrix below). The primary gaps are the **CES execution layer** — specifically the Kanban/board, Gantt, and related execution surfaces that are critical for the "70% declutter + calm authority" goal.

**Your task**: Generate the missing CES execution page views as high-fidelity, interactive V3 Veil Glass previews, exactly in the style and quality of the existing surfaces in `src/ui-staging/V3StagingApp.tsx`.

---

## 1. V3 Veil Glass Non-Negotiables (must match exactly)

- Base: `#05060A` radial gradient + subtle 24px grid overlay.
- Main content: 77.7% width glass card, `linear-gradient(135deg, rgba(32, 41, 56, 0.88) ...)` + `blur(32px) saturate(140%)` + 24px radius + strong cast shadow.
- Borders: sacred `rgba(255,255,255,0.33)` (hover to 0.45). "Invisible" surfaces use 0.08–0.15.
- Accents: Teal `#00D1C1` / `#007970` for status/highlights/active. Orange `#FFA059` / `#E07B2C` only for "Command Center" micro labels and very limited "personal workspace" elements.
- Typography: Inter, white primary, #94A3B8 secondary, #64748B tertiary. Gradient titles on headers.
- Motion: `cubic-bezier(0.16,1,0.3,1)` 0.55–0.7s for page/subview/stagger/butter-shift. View Transitions API where possible.
- Watermark: ci-angel.webp at exactly 0.33 opacity, bottom-left, fixed.
- HeaderBlock pattern: orange micro label + large gradient title + subtitle.
- Cards: `.v3-invisible-glare` hover treatment on interactive surfaces.
- Search/filter bars: glass3 background, subtle borders.
- Status: teal for positive/compliant/passed, orange for attention, appropriate variants for blocked/critical.

All generated views must feel like they live inside the same `V3StagingApp` shell (or be designed as drop-in sections that can be added to the `PageContent` switch).

---

## 2. What We Already Have (Full V3 Veil — Do Not Re-invent)

From the current `V3StagingApp.tsx` (22+ surfaces, all with full veil treatment):

- Dashboard (Agency View + My Planner toggle, priority queue, KPIs, quick jump)
- My Planner (overdue/in-flight/queued columns)
- Clinicians roster (search, status, cases, audit columns)
- Patients roster (acuity, setting, zone, ACCM, MRN)
- Calendar (May 2026 month grid with event chips, filter chips)
- Visit Schedule, Missed Visits, Referring Physicians
- Policy Library (grid of cards with lifecycle/ACHC badges, featured)
- Policy Detail (embedded real GVGBDetailView)
- Domain Library (rich cards with CMS refs, subdomains, stats, progress)
- SOP Library, Forms Library (eCIGN cards with signers, status)
- Evidence Center (tree + artifact list)
- Onboarding (gates + cohort batches with progress)
- Brad AI Copilot (chat bubbles)
- Audit Trail, Help Center, Training Materials, User Guides, Demo scenarios, etc.

These are the "all page views needed" for the core agency operations, compliance registry, evidence, onboarding, and intelligence surfaces. They are polished, interactive (where appropriate), and visually locked to the V3 spec + APP_Screenshots.pdf.

**CES execution surfaces are the clear missing layer.**

---

## 3. Missing CES Execution Page Views You Must Generate

Prioritized list (based on production reality + declutter goal):

1. **CES Sprint Execution Board / Kanban (swimlane 6-column)**  
   - 6 columns: Upcoming / Ready / In Progress / Awaiting Signature / Blocked / Completed (or exact from SprintExecutionBoard).
   - Swimlanes grouped by Event / Domain.
   - ExecutionUnitCard with drag/drop affordance, status dots, evidence count, assignee, due, enforcement indicators.
   - Header with sprint scope, filters, "Add Task".
   - Clicking a unit opens a V3-veiled WorkflowDrawer / detail (rich content: steps, evidence status, signatures, child tasks, folders).
   - Must feel calm and low-density despite being a board (use invisible glare, subtle borders, proper spacing).

2. **Gantt / Timeline View (advanced calendar execution)**  
   - SVG or canvas-based Gantt (days/weeks/months, event-grouped bars, progress fill, critical path, dependencies).
   - Drag to reschedule, link tasks, zoom.
   - Filters by domain, assignee, status.
   - Side panel or drawer for selected item (task detail with evidence folders).
   - Toggle between Month Grid (existing Calendar) ↔ Gantt.

3. **CES Board Page (full surface wrapper)**  
   - The production `CesBoardPage` + `CesLayout` experience, but in full V3 veil shell (no navy sub-brand conflict — bring it into the main dark glass language).
   - Top context bar (sprint selector, domain filters, readiness score).
   - The Kanban board as the main content.
   - Right side or drawer for selected task detail (veiled).

4. **CES Calendar / Compliance Calendar + PmViews**  
   - The full `MasterCalendarPage` experience with toggle: Calendar / Sprint Board (Kanban) / Gantt / List.
   - All four views rendered in V3 veil.
   - Right panel / drawer for task detail (veiled, with folders).

5. **My Tasks (CES / Personal Execution)**  
   - The CES version of MyTasks (obligation list + execution status + evidence linking).
   - Kanban or list + detail in veiled drawer.
   - "My Planner" style but for CES obligations with real data shapes.

6. **Workflow Execution Panel / Event Workspace (detail surfaces)**  
   - The rich execution stepper, evidence linking, signer roster, form execution — presented as a full page or large veiled modal/drawer in V3 style (with folder trees for evidence).

7. **Additional "etc" as you see fit for completeness**:
   - CesDashboard (executive view of board health, upcoming obligations, evidence momentum).
   - CesReports / Workloads (if they are distinct execution surfaces).
   - Any other high-frequency CES execution view that appears in the real app or PDF screenshots.

---

## 4. Data & Interaction Requirements

- Use realistic shapes from the real stores (`regulatoryExecutionStore`, `compliance-execution/types.ts`, `pm/taskProjection`, `eventFolders`, `SprintExecutionBoard` data patterns).
- Include **folders** (evidence folders, task folders) as the user has repeatedly emphasized — nested trees with FolderOpen icons, status, counts, drag-to-link where appropriate.
- Real enforcement / state machine behavior visible (blocked states, signature requirements, evidence age).
- Drag & drop on the Kanban (visual snap, enforcement rules shown).
- All status coloring, badges, progress, due math exactly as in production (but rendered with V3 tokens).
- Search, filters, bulk actions where they exist in the real surfaces.

---

## 5. Output Format (Match Current Staging Quality)

Please generate the new sections in the exact same style as the existing ones in `V3StagingApp.tsx`:

- Add new `SectionId` values (e.g. 'ces-board', 'ces-gantt', 'ces-execution', 'ces-my-tasks').
- Add them to the NAV_GROUPS under a new "CES EXECUTION" group or appropriate place.
- Create new page functions (`CesBoardPage`, `CesGanttPage`, `CesExecutionWorkspace`, etc.) that return full V3 veil JSX (HeaderBlock, glass cards, lists, drawers, etc.).
- For the board and Gantt, make them visually rich and interactive (use local state for filters, selection, simulated drag where possible).
- For detail surfaces, either embed a veiled `WorkflowDrawer` / `RightDrawer` with `glassVariant="v3-veil"` or show the content inline in a large glass card.
- Make sure they use the shared `V3` const or (preferably) the CSS custom properties from `ui-staging.css` and `v3Tokens.ts`.

If you prefer, you can also generate them as separate files (like the old V3*Preview*.tsx pattern) that can later be consolidated.

Include realistic mock data arrays at the top of the file (or reference the new V3_CES_SeedData when we have it).

---

## 6. Visual & PDF Reference

Match the calm, premium, low-density execution experience shown in the reference screenshots (`APP_Screenshots.pdf` pages that show board/calendar/execution flows).

The goal is that when a user opens `/ui-staging` and navigates to the new CES sections, they immediately see "this is what the production CES Kanban / Gantt / execution will look like after the V3 reskin" — exactly the same quality bar as the existing Dashboard, Policy Library, Evidence, etc.

---

**Deliver the new code sections + any supporting mock data or helper components.**

This will complete the "all page views needed" for the V3 Veil Glass design system, with special focus on the CES execution layer that is currently the biggest gap for the decluttering + calm authority initiative.

---

**Current Coverage Baseline (for your reference — do not duplicate these)**

[Insert the full matrix from the deep exploration report here when sending to Claude]

Focus your effort on the **"No" rows** for the CES execution surfaces.

Thank you — this is the final piece to make the V3 page view set complete for the entire operational footprint.