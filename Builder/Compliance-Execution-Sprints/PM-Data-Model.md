# PM-Data-Model

**Phase:** Architecture only.
**Cross-refs:** `PM-Layer-Architecture.md`, `PM-Task-System.md`, `PM-Sprint-Board-Design.md`.

---

## 1. Purpose

Define every data structure the PM layer needs without touching CES schemas. PM data is **additive overlay + projection**, never authoritative for compliance.

---

## 2. Identity Rules

### 2.1 Task ID
- **Compliance task:** `task_id = execution_unit_id = "{event.id}-{NN}"` where NN is the zero-padded ordinal of the execution unit within the event (e.g. `qapi_meeting-20260507-08`).
- **Personal task:** `task_id = "personal:{uuid-v4}"`.
- IDs are immutable. Renaming an event must NOT change task_ids of already-projected units.

### 2.2 Sprint ID
- Format: `"{YYYY}-{NN}"` where NN ∈ 01..26.
- Sprint 01 starts on the first Sunday of the calendar year.
- Sprint length = 14 days.
- A given calendar date maps to exactly one sprint (or to a year-boundary edge sprint — see §6.4).

### 2.3 User ID
- Reuse existing app user identity. PM does not invent identities.

---

## 3. Canonical Entities

### 3.1 Task (projection + overlay merged)
```ts
type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'done';
type TaskSource = 'ces' | 'personal';

interface Task {
  id: string;
  source: TaskSource;
  event_id?: string;
  step_id?: string;
  form_ids?: string[];
  title: string;
  description?: string;
  status: TaskStatus;            // derived for ces, direct for personal
  ces_status_raw?: string;       // present for ces only; never written by PM
  due_date?: string;             // ISO date
  start_date?: string;           // for Gantt
  sprint_id?: string;
  assignees: string[];
  watchers: string[];
  story_points?: number;
  labels?: string[];
  dependencies: string[];        // task_ids this task depends on
  evidence_refs?: { id: string; kind: string; url?: string }[];
  approval_refs?: { id: string; status: string; signer?: string }[];
  is_personal_weekend_ok?: boolean;
  created_at: string;
  updated_at: string;
}
```

### 3.2 PM Overlay record (persisted)
Only the assignment/scheduling/labelling overlay is persisted; everything else is projected on read.

```ts
interface PmOverlayTask {
  task_id: string;            // PK; references projected ces task or personal task
  assignees: string[];
  watchers: string[];
  story_points?: number;
  sprint_id?: string;
  labels?: string[];
  start_date?: string;
  due_date?: string;          // overlay can override CES suggested due date
  weekend_override?: boolean; // for compliance tasks on Sat/Sun
  updated_at: string;
  updated_by: string;
}
```

### 3.3 Personal Task
```ts
interface PmPersonalTask {
  id: string;                 // 'personal:<uuid>'
  owner: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  sprint_id?: string;
  story_points?: number;
  labels?: string[];
  is_weekend_ok?: boolean;    // personal tasks on weekends require explicit opt-in
  linked_event_id?: string;   // optional later-link to a CES event
  created_at: string;
  updated_at: string;
}
```

### 3.4 Dependency
```ts
interface PmDependency {
  id: string;
  from_task_id: string;
  to_task_id: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  created_by: string;
  created_at: string;
}
```

### 3.5 Notification
```ts
interface PmNotification {
  id: string;
  user_id: string;
  task_id: string;
  kind: 'assigned' | 'mention' | 'due_soon' | 'overdue' | 'blocked' | 'approval_required' | 'evidence_added';
  scheduled_at: string;
  sent_at?: string;
  read_at?: string;
  payload?: Record<string, unknown>;
}
```

### 3.6 Audit Entry (append-only)
```ts
interface PmAudit {
  id: string;
  actor: string;
  task_id: string;
  action: string;            // e.g. 'assign', 'set_points', 'add_dependency', 'pin_to_sprint'
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ts: string;
}
```

---

## 4. CES → PM Status Mapping

| CES condition | PM status |
|---|---|
| Step not started, no forms in progress | `todo` |
| Any required form in progress / partially complete | `in_progress` |
| Required form awaiting approval | `in_review` |
| Step has unmet dependency or unresolved blocker | `blocked` |
| All required forms approved AND step validated | `done` |

`done` for a CES task can ONLY be the result of CES validation. The PM Kanban "Done" column is read-only for CES tasks.

---

## 5. Projection Algorithm (deterministic)

```
for each active event in CES:
  units = enumerateExecutionUnits(event)            // ordered
  for index, unit in units:
    NN = pad2(index + 1)
    task_id = `${event.id}-${NN}`
    base = projectBase(event, unit)                  // title, status, refs
    overlay = pmOverlayStore.get(task_id) ?? {}
    yield merge(base, overlay)
```

Properties:
- **Idempotent:** same CES state → same set of Task records.
- **Stable IDs:** unit ordering is determined by CES, not PM.
- **Additive:** unknown overlay rows for missing tasks are retained but flagged orphan (cleanup tool, not auto-deleted).

---

## 6. Sprint Window Function

### 6.1 Algorithm
```
function sprintWindowsForYear(year):
  start = firstSundayOf(year)
  windows = []
  for n in 1..26:
    s = start + (n-1)*14 days
    e = s + 13 days
    windows.push({ id: `${year}-${pad2(n)}`, start: s, end: e })
  return windows
```

### 6.2 Date → Sprint
```
function sprintForDate(date):
  y = date.year
  windows = sprintWindowsForYear(y)
  hit = windows.find(w => date in [w.start, w.end])
  if hit: return hit.id
  // year-boundary edge: see 6.4
  return edgeSprintFor(date)
```

### 6.3 Weekend rule
- Sat/Sun are valid sprint days but NOT valid scheduling days for compliance tasks unless `weekend_override = true`.
- Personal tasks may use weekends if `is_weekend_ok = true`.

### 6.4 Year-boundary edge
- Days between Jan 1 and the first Sunday belong to the previous year's last sprint window (extension day).
- Days after sprint 26 end and before Dec 31 belong to sprint 26 (tail extension).
- Always documented and unit-tested in `PM-Sprint-Board-Design.md`.

---

## 7. Backend Contract Impact

- New persisted collections: `pm_overlay_task`, `pm_personal_task`, `pm_dependency`, `pm_notification`, `pm_audit`.
- No CES tables modified.
- All PM reads that surface compliance status go through the projection selector — never via direct cached copy of CES status.

---

## 8. UI Behavior Implications

- Every list/board cell that shows a status must derive from the merged Task — never from overlay alone.
- Sprint pickers are bounded to `01..26` and a year selector.
- Story points field is numeric, optional, free-form (Fibonacci suggested but not enforced).
- Dependencies are bidirectional in queries (incoming + outgoing) but stored once.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Orphan overlay rows after CES re-numbering | Projection is deterministic by event-defined order; renumbering should be rare and gated; orphan reaper script |
| Duplicate task IDs across events | Event IDs are unique → `{event.id}-{NN}` unique by construction |
| Sprint math off-by-one at year boundary | Single pure function + property tests |
| Personal task accidentally counted as compliance | `source` discriminator enforced everywhere; KPI selectors filter `source === 'ces'` |

---

## 10. Acceptance Criteria

- All entity schemas defined with field types.
- Projection algorithm is deterministic and documented.
- Sprint windows reproducible from `(year, sprintNumber)` alone.
- CES → PM status mapping table is exhaustive.
- Personal vs CES discriminator present on every relevant read path.

---

## 11. Verification Checklist

- [ ] Schemas reviewed by backend owner.
- [ ] Projection algorithm pseudocode reviewed.
- [ ] Sprint window function manually verified for 2025, 2026, 2027.
- [ ] Status mapping table cross-checked against `regulatoryExecutionStore` actual states.
- [ ] No PM table writes in any documented compliance-completion path.
