# 12 - Calendars (master-calendar, staffing-calendar)

**View Registrations:**
- `master-calendar` (group: "Calendar")
  - Label: "Master Calendar"
  - Route: `/calendar`
  - Icon: `calendar-days`
  - Template: `calendar`
  - Description: "Daily operations calendar for SOC starts, recertification locks, staffing huddles, audits, and coverage checkpoints."
  - events: primaryOpsCalendarEvents (8 items)
  - Metrics:
    ```js
    metric('Events', '8', 'June operations focus', 'teal'),
    metric('Coverage checks', '3', 'Two need attention', 'orange'),
    metric('Clinical reviews', '4', 'Chart and recert work', 'green'),
    metric('Credential watch', '2', 'Renewal windows', 'amber'),
    ```

- `staffing-calendar` (group: "Calendar")
  - Label: "Staffing Calendar"
  - Route: `/staffing-calendar`
  - Icon: `calendar-range`
  - Template: `calendar`
  - Description: "Internal staffing preview for shift coverage, clinician availability, acuity, and visit conflicts."
  - events: staffingEvents (8 items)
  - Metrics:
    ```js
    metric('Coverage', '92%', 'Weekend pool pending', 'green'),
    metric('Visit gaps', '6', '2 high-acuity routes', 'orange'),
    metric('Available clinicians', '38', 'RN, LVN, PT, OT, MSW', 'teal'),
    metric('Swaps', '3', 'Next 7 days', 'amber'),
    ```

**PNG Confirmation:** File exists at `Reference/V6/12-calendars.png` (96,948 bytes). Visual read primarily shows shared prototype shell/sidebar (Calendar group with "Master Calendar" + "Staffing Calendar" entries) + Brad modal overlay. Calendar grid, event pills, upcoming rail, and hover details are dynamically rendered via `CalendarPrototype` (and subcomponents) in index.html.

## Layout & Structure
- **Generic shell:** 4 `MetricTile` row (when not dashboard/swimlane) + page header (group badge, title, description).
- **CalendarPrototype** (~2282-2379):
  - Uses local state `selectedEvent` (clicking events opens swimlane or hover preview).
  - Default view (no selected):
    - Filter tabs row + buttons row:
      - Segment control: Day / Week / Month (Month active: `bg-white ... text-brand-teal-600`)
      - Filter pills: `['Staff', 'Patient', 'Event Type']` (chevron-down icons)
    - Header: "June 2026" + legend "Teal events are ready; orange events need owner action."
    - **Calendar grid:** `grid grid-cols-7 ...` (Sun-Sat headers)
      - Cells: `min-h-[112px] border ... p-2 bg-white/45`
        - Day number: `text-xs font-bold text-brand-teal-600`
        - Events stack: space-y-1 inside cell
    - Right rail: "Upcoming Events" panel (`w-[320px]` on xl grid)
      - Header with `ToneBadge` count
      - List of ~7 event cards
  - If `selectedEvent`: renders full `<CalendarSwimlaneView>` (replaces main grid).
- Grid + rail: `grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_320px]`

## Calendar Events Data
**Master Calendar (primaryOpsCalendarEvents ~191-200):**
```js
[
  { day: 2, label: 'SOC coverage review', tone: 'orange', owner: 'Clinical Manager' },
  { day: 4, label: 'Clinician case conference', tone: 'teal', owner: 'Director of Nursing' },
  { day: 7, label: 'Medication reconciliation audit', tone: 'teal', owner: 'QAPI Nurse' },
  { day: 11, label: 'High-acuity staffing huddle', tone: 'orange', owner: 'Scheduler' },
  { day: 15, label: 'Recertification window lock', tone: 'amber', owner: 'Clinical Manager' },
  { day: 18, label: 'Credential renewal checkpoint', tone: 'orange', owner: 'HR Credentialing' },
  { day: 22, label: 'Visit note timeliness review', tone: 'teal', owner: 'Compliance Officer' },
  { day: 26, label: 'Weekend coverage confirmation', tone: 'blue', owner: 'Operations Lead' },
]
```
Focus: Operations events (SOC, audits, recert, credentials, huddles).

**Staffing Calendar (staffingEvents ~202-211):**
```js
[
  { day: 2, label: 'RN coverage', tone: 'teal', owner: 'Maria Delgado, RN' },
  { day: 4, label: 'PT visit cluster', tone: 'blue', owner: 'James Kwon, PT' },
  { day: 8, label: 'CHHA gap', tone: 'orange', owner: 'Scheduling Lead' },
  { day: 12, label: 'SOC start', tone: 'green', owner: 'Priya Singh, RN' },
  { day: 17, label: 'LVN swap', tone: 'amber', owner: 'Operations Lead' },
  { day: 19, label: 'Recert visit', tone: 'teal', owner: 'Clinical Manager' },
  { day: 23, label: 'Wound care route', tone: 'orange', owner: 'Aisha Rahman, OT' },
  { day: 28, label: 'Weekend pool', tone: 'blue', owner: 'Scheduler' },
]
```
Focus: Clinician-specific staffing (coverage assignments, visits, gaps, swaps). Ties directly to clinician/patient profiles (e.g. references Maria Delgado, Priya Singh, James Kwon from clinicianRecords).

Some CES events (complianceCalendarEvents) also feed into calendar template but used under CES group.

## Calendar Grid & Event Layout
- Days 1-30 rendered (static June 2026).
- Events grouped by `day` via `byDay` reducer inside prototype.
- **Event pills in cells:**
  - Button: `w-full truncate rounded-md border px-1.5 py-1 text-left text-[9px] font-bold shadow-sm`
  - Color: `pillClass(event)`:
    ```js
    (event.tone === 'orange' || event.tone === 'amber')
      ? 'border-brand-orange-400 bg-brand-orange-400 text-white'
      : 'border-brand-teal-500 bg-brand-teal-500 text-white'
    ```
  - Wrapped in `<CalendarEventItem>` (hover + click handlers).
- Dense: multiple events per day stack vertically in cell.
- Click on event → opens swimlane (or triggers hover card).

## Upcoming Events Rail
- `rounded-2xl border ... bg-white/82 p-5 shadow-soft backdrop-blur-xl`
- List of first 7 events (sorted by day):
  - Each wrapped in `CalendarEventItem`
  - Inner card: `relative rounded-xl border ... p-3 pl-4`
    - Left accent bar: `absolute left-0 ... w-1 rounded-full` (orange/amber vs teal-500)
    - Top row: `Jun {day}` + small tone pill
    - Label: `text-xs font-bold text-brand-teal-600` (button)
    - Owner: `text-[10px] text-brand-neutral-400`
    - Mini progress bar: `h-1.5 rounded-full` (width varies by tone: orange ~52-88%, teal ~62-92%)
- Tone drives accent + bar color.

## Event Hover Cards (CalendarEventItem + CalendarHoverCard ~1957-2168)
- Hover/ focus on pill or rail item → portal-rendered hover card (positioned relative to trigger).
- Positioning logic accounts for board vs upcoming rail boundaries + viewport.
- Card content (derived or from event):
  - Tone-colored header
  - Event label + date
  - Owner
  - Workflow: (staffing-calendar specific: "Staffing workflow"; else "Operations workflow")
  - Readiness / Risk / Steps
  - Detail text
  - "Open swimlane" CTA
- Mouse leave uses timeout for close.

## Calendar Swimlane View (CalendarSwimlaneView ~2169+)
- Triggered on event click (for events with extra data or default built).
- Replaces calendar UI; full-width detailed view.
- Header: ToneBadges (readiness, date, task count) + "Back to month" + "Packet preview"
- Large event title + summary
- Metrics row (MetricTiles)
- Flowchart lanes grid (auto-fit)
- Related events chips row
- Detailed task lanes: left meta panel + grid of task cards (owner, due, chips, progress)
- Similar styling: tone tiles, badges, progress bars, shadow-soft.
- Note: Default buildDefaultSwimlane used unless event.swimlane provided (QAPI example in CES has full lanes).

## Filters & Legend
- Month view always shown in prototype.
- Filter buttons are static (no real filtering implemented in JS for demo).
- Legend text explicitly: "Teal events are ready; orange events need owner action."
- Applies across both master and staffing (though staffing uses more green/blue/amber for visit states).

## Status Colors (Event Tones)
- **teal**: Ready / compliant / standard ops (e.g. case conference, audits, recert visits)
- **orange / amber**: Needs attention / urgent / gaps (coverage review, huddles, credential checkpoints, CHHA gap, swaps)
- **green**: Positive staffing outcomes (SOC start)
- **blue**: Coverage / pool / clusters (weekend pool, visit cluster)
- Consistent with global tones + pill/rail/upcoming styling.
- Cross-references profiles: orange status in clinician tables aligns with orange calendar tones.

## Key Interactions
- Hover pills/rail → detailed hover preview card (portal).
- Click event → swimlane mode (detailed workflow view).
- State broadcasts via custom event `redesign-calendar-swimlane` (affects TopBar visibility).
- Back button returns to grid.
- All events clickable for progressive disclosure.
- Ties to Profiles: Clinician names/assignments appear in staffing events and detail subtitles.

## Other Elements
- Backdrop blur / glass effects on panels (`bg-white/75`, `backdrop-blur-xl`).
- Responsive: stacks to single column; min-h cells for density.
- No day/week real rendering (tabs static).
- Progress ubiquitous (rail items).
- Related to profiles (clinician caseloads feed calendar staffing).

**Related:** ces-calendar (shares CalendarPrototype + some events), Profiles (clinician assignments), dashboard action rows (coverage themes), kanban.

**Sources:** VIEW_GROUPS ~1172-1192 (registrations), primaryOpsCalendarEvents ~191, staffingEvents ~202, CalendarPrototype ~2282, CalendarEventItem ~1957, CalendarHoverCard ~2048, CalendarSwimlaneView ~2169, pillClass/rail ~2300, tones ~129, byDay logic, renderTemplate ~4215, shell ~4594.
