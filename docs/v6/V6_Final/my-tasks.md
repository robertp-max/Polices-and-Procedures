# My Tasks (my-tasks) - CES Board View

**View Registration:** `my-tasks` (under "Compliance Execution (CES)")
- Label: "My Tasks"
- Route: `/my-tasks`
- Icon: `list-checks`
- Template: `board` (note: NOT kanban; reuses BoardPrototype)
- Description: (inherited from group)
- Metrics:
  ```js
  metric('Assigned', '31', '9 due this week', 'teal'),
  metric('Blocked', '4', 'Evidence or signature missing', 'orange'),
  metric('Ready to close', '12', 'All requirements complete', 'green'),
  metric('Escalated', '2', 'Needs manager decision', 'amber'),
  ```
- columns: myTaskColumns

**PNG Confirmation:** No dedicated `xx-my-tasks.png` in V6 (CES items covered by 03-ces-kanban-board.png and 04-ces-calendar.png). File confirmed via code; PNGs in dir exist and share identical shell capture size.

## Layout & Structure
- Shell metrics row + header.
- **BoardPrototype render (~2381-2428):**
  - `grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5`
  - Per column: `rounded-2xl border border-brand-neutral-200 bg-white p-4 shadow-soft`
    - Header: title (sm font-extrabold) + ToneBadge (count)
    - Cards stack `space-y-3`

## Columns (myTaskColumns ~267-300)
1. **Today** (tone: 'orange')
   - "Confirm SOC nurse backup" (Clinical Manager, Today 3:00 PM, meta: Elena Vargas - HH-88291, chips: ['SOC','Coverage'], progress:64, orange)
   - "Route CHHA weekend pool" (Scheduler, Today 4:30 PM, ..., 'Staffing', 42, orange)
2. **Clinical Review** (tone: 'teal')
   - "Review recert visit cadence" (Maria Delgado, RN, Jun 19, Robert Hale, ['Recert'], 82, teal)
   - "Medication reconciliation audit" (QAPI Nurse, Jun 20, ..., ['Audit'], 71, teal)
3. **Blocked** (tone: 'amber')
   - "PT credential renewal packet" (HR Credentialing, Jun 22, ..., ['Credential'], 38, orange)
   - "Physician order signature follow-up" (..., ['Orders'], 55, amber)
4. **Ready** (tone: 'green')
   - "Discharge teaching checklist" (..., 94%, green)
   - "Wound photo evidence approved" (..., 88%, green)

## Card Rendering (BoardPrototype)
- Title (xs bold teal-600) + meta (10px neutral-400)
- Right dot: `h-2 w-2 rounded-full ${tones[task.tone].dot}`
- Due + owner row (10px bold neutral)
- Optional chips: `rounded-full border border-brand-teal-100 bg-white px-2 py-1 text-[9px] ...`
- **Conditional progress:**
  ```js
  {task.progress !== null && ... && (
    <div class="mt-3 h-1.5 rounded-full bg-white">
      <div class="h-1.5 rounded-full ${tones[task.tone || column.tone].bar}" style={{ width: `${task.progress}%` }}></div>
    </div>
  )}
  ```
- Falls back gracefully for string-only tasks.

## Status Colors (Teal/Orange + Amber/Green)
- Primary distinction: orange (Today/urgent), teal (Clinical Review), amber (Blocked), green (Ready).
- Matches broader prototype (tones.teal, tones.orange, tones.amber, tones.green).
- Progress bars, dots, ToneBadges all color-coordinated per column/card tone.

## Differences from CES Kanban
- 'board' template → BoardPrototype (simpler 4-col grid, vertical columns vs. 6-col kanban lanes with extra filter bar + summary header).
- my-tasks focuses personal/prioritized queue ("Today", "Clinical Review").
- ces-board (kanban) is full sprint execution with IDs, filters, "Completion" label on progress.
- Both feature heavy progress bars + chips; neither uses DataTable here.

## CTAs / Config
- cta: 'Add task'
- secondary: 'Filter queue'
- Used in render for buttons (not deeply wired in prototype shell).

**Sources:** VIEW_GROUPS ~1328, myTaskColumns ~267 (seeded for PM/Agent07), BoardPrototype ~2381, render switch ~4216, tones ~129, metrics row logic ~4594.
