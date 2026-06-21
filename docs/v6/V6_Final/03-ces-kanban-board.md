# 03 - CES Kanban Board (ces-board)

**View Registration:** `ces-board` (group: "Compliance Execution (CES)")
- Label: "Kanban Board"
- Route: `/ces/board`
- Icon: `columns-3`
- Template: `kanban`
- Description: "Operational Kanban board for sprint execution, blockers, evidence, signatures, and owner handoffs."
- kanbanSummary: "Sprint 12 - 33 cards - 4 blocked"
- Metrics (shown above in generic row for non-dashboard):
  ```js
  metric('Upcoming', '6', 'Not yet opened', 'slate'),
  metric('Ready', '7', 'Can start now', 'green'),
  metric('Blocked', '4', 'Evidence/signature gaps', 'orange'),
  metric('Certified', '9', 'Completed and locked', 'green'),
  ```

**PNG Confirmation:** File exists at `Reference/V6/03-ces-kanban-board.png` (96,948 bytes, timestamp 2026-06-19). Static PNG primarily depicts shared prototype shell + Brad modal (per read_file visual); full Kanban lanes + cards are dynamically rendered by KanbanPrototype in index.html.

## Layout & Structure
- **Generic shell applies:** Top metrics grid (4 tiles), page header with group badge "Compliance Execution (CES)".
- **KanbanPrototype render (lines ~2430-2534):**
  1. Filter bar row: `rounded-2xl border ... bg-white p-4`
     - Buttons for `kanbanFilters` (defaults: ['All work', 'Mine', 'Blocked', 'Missing evidence', 'Awaiting signature'])
     - First ("All work") active with `bg-brand-teal-500 text-white`.
     - Right: icon + `kanbanSummary`.
  2. Lane grid: `grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-6`
     - Each lane: `section rounded-2xl border ... bg-white p-4 shadow-soft`
       - Header: title + count text + `ToneBadge`
       - Cards stack in `space-y-3`
  - Cards: `article rounded-2xl border border-brand-neutral-100 bg-brand-neutral-50 p-4` (hover lift)

## Kanban Lanes (from complianceBoardColumns)
Data seeded at ~403-458 (6 columns):
1. **Upcoming** (tone: 'slate', count:6)
   - CEU-1201 "Validate governing body roster" (Compliance Officer, May 20, chips: ['Prep','GV-GB-001'], progress:18, teal)
   - CEU-1204 "Queue annual policy manual review" (DON, May 22, ..., 24, slate)
2. **Ready** (tone: 'green', count:7)
   - CEU-1241 "Emergency drill after-action report" (..., 88%, green)
   - CEU-1243 "HIPAA training completion sweep" (..., 72%, teal)
3. **In Progress** (tone: 'teal', count:12)
   - CEU-1218 "QAPI indicator data - Q2 aggregate report" (Maria Gonzalez, RN, 72%, teal)
   - CEU-1220 "60-day care plan recertification reviews" (..., 54%, teal)
4. **Awaiting Signature** (tone: 'amber', count:5)
   - CEU-1230 "Q2 Governing Body pre-read packet" (..., 62%, orange)
   - CEU-1231 "Incident reporting procedure approval" (..., 68%, amber)
5. **Blocked** (tone: 'orange', count:4)
   - CEU-1232 "TB screening documentation..." (progress:28, orange)
   - CEU-1234 "Background check results..." (22%, orange)
6. **Completed** (tone: 'green', count:9)
   - CEU-1240 "Personnel file completeness audit..." (100%, green)
   - CEU-1242 "Medication reconciliation accuracy audit" (100%, green)

(Exact cards limited in seed; prototype renders provided.)

## Card UI Details
- Top: `ToneBadge` for ID (e.g. CEU-12xx) + more-horizontal button.
- Bold title.
- Owner (teal-600) + due date.
- Chips row: small `rounded-full border border-brand-teal-100 bg-white px-2 py-1 text-[9px] ... text-brand-teal-600`
- Progress section:
  ```html
  <div class="mb-1 flex justify-between text-[10px] ...">
    <span>Completion</span><span>{progress}%</span>
  </div>
  <div class="h-2 rounded-full bg-white">
    <div class="h-2 rounded-full ${tones[card.tone].bar}" style="width: XX%"></div>
  </div>
  ```
- Tone drives badge/dot/bar color.

## Status Colors (Teal / Orange Emphasis + Others)
- **teal**: Active / In Progress work (primary positive state).
- **orange**: Blocked / urgent / awaiting (high visibility).
- **green**: Ready / Completed / Certified.
- **amber**: Awaiting Signature (distinct warning).
- **slate**: Upcoming / backlog.
- Consistent with global `tones` map (used for tiles, badges, dots, progress bars across prototype).
- Calendar notes: "Teal events are ready; orange events need owner action."

## Filters, Summary, CTAs
- Configurable via view.kanbanFilters / kanbanSummary.
- View CTAs: "Create card", "Board filters".
- No full data table (unlike workflows or master-controls); pure card/kanban visualization.

## Key Visual/Prototype Elements
- Multi-column responsive Kanban (up to 6 cols on 2xl).
- Shadow-soft, hover effects on cards.
- Upper metrics row (generic, before Kanban content).
- Progress bars ubiquitous (h-2 on cards).
- No swimlane here (separate workflow-swimlane view uses board template with different render).

**Related:** ces-board kanbanLanes passed from complianceBoardColumns. Compare to my-tasks which uses 'board' template (BoardPrototype, fewer columns).

**Source Sections:** VIEW_GROUPS registration ~1227, complianceBoardColumns ~403, KanbanPrototype ~2430 (lanes, filters, cards), tones ~129, renderTemplate ~4217, Metric row ~4594, general shell ~4590.
