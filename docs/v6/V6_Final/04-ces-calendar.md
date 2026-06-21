# 04 - CES Calendar (ces-calendar)

**View Registration:** `ces-calendar` (under "Compliance Execution (CES)")
- Label: "CES Calendar"
- Route: `/ces/calendar`
- Icon: `calendar-check`
- Template: `calendar`
- Description: "Sprint compliance calendar for mandatory events, evidence windows, signature cutoffs, and survey packet milestones."
- Events: complianceCalendarEvents (9 items)
- Metrics:
  ```js
  metric('Sprint cards', '33', 'Sprint 12 execution units', 'teal'),
  metric('Blocked', '4', 'Signature or evidence gaps', 'orange'),
  metric('Ready to certify', '9', 'Awaiting final lock', 'green'),
  metric('Survey critical', '3', 'Needs owner action', 'orange'),
  ```

**PNG Confirmation:** File exists at `Reference/V6/04-ces-calendar.png` (96,948 bytes). Visual read shows shared shell/sidebar + Brad modal; calendar grid/events are JS-rendered via CalendarPrototype.

## Layout & Structure
- Shell + top metrics (4 tiles) + header/desc.
- **CalendarPrototype (~2282-2379):**
  - If selectedEvent: shows CalendarSwimlaneView (detailed for QAPI etc.).
  - Default:
    - Filter tabs row + buttons (Day/Week/Month active "Month").
    - Header: "June 2026" + legend "Teal events are ready; orange events need owner action."
    - **Calendar grid:** 7-col (Sun-Sat), 30 days, each `min-h-[112px] border ... p-2`
      - Day number (teal-600).
      - Events as colored pill buttons inside: `rounded-md border px-1.5 py-1 text-[9px] font-bold shadow-sm`
    - Right rail: "Upcoming Events" panel (w/ ToneBadge count), list of ~7 event cards with left accent bar + mini progress bar.

## Events (complianceCalendarEvents ~391-401)
```js
[
  { day: 3, label: 'Governing Body pre-read packet', tone: 'orange', owner: 'Maria Gonzalez, RN' },
  { day: 5, label: 'QAPI aggregate report review', tone: 'teal', owner: 'DON' },
  ...
  { day: 10, label: 'Q2 QAPI quarterly review', tone: 'orange', ... swimlane: q2QapiSwimlane },
  ...
]
```
- Some events (esp. Q2 QAPI) have extra: workflow, readiness, risk, steps, detail, swimlane data.
- Clickable → opens swimlane detail (QAPI phases with cards).

## Event Styling & Colors
- `pillClass`: orange/amber → `border-brand-orange-400 bg-brand-orange-400 text-white`; else teal-500 white.
- In upcoming rail:
  - Left colored bar: orange/amber = `bg-brand-orange-400`; else `bg-brand-teal-500`.
  - Small pill indicator same color.
  - Mini progress bar (h-1.5) also orange vs teal.
- Legend explicitly documents teal=ready / orange=needs action.

## Right Rail (Upcoming)
- Cards with date, accent, label (clickable), owner, progress bar.
- `CalendarEventItem` wrapper.

## Status Colors (Teal / Orange Dominant)
- Teal: ready/compliant events, positive indicators.
- Orange: critical, needs owner, blocked/signature gaps.
- Green: ready to certify, completed drill, etc.
- Integrated with global tones + ToneBadge.
- In swimlane drill-down (for QAPI): lanes use teal/orange/amber/green with progress + status chips.

## Other Elements
- No traditional table (calendar + cards).
- Progress bars on rail items (variable width based on tone).
- Full-month view with visual density for sprint execution.
- Special interaction: calendarSwimlaneOpen state hides generic header/metrics; uses dedicated view for QAPI packet assembly etc. (21 tasks across phases like Event Intake, Data Pull, ..., Survey Lock).

**Related CES Views:** ces-board (kanban), my-tasks (board), workflows (matrix + swimlane).

**Sources:** VIEW_GROUPS ~1217, complianceCalendarEvents ~391, CalendarPrototype ~2282, pillClass/rail ~2300, tones ~129, App effect for swimlane ~4543.
