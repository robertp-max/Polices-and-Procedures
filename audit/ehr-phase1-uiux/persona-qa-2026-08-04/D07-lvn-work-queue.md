# D07 — LVN — Personal work queue ownership

- Routes: `#/work-queue`, `#/today`, `#/oasis`, `#/field-visits`
- Base: `http://127.0.0.1:5194/#`
- Worktree: `ehr_phase1` · App: `apps/ehr-prototype`
- Method: Design-prototype code + data walk of screen TSX / `workspace.ts` / `clinical.ts` / routes; cross-checked with prior live UAT on same base (`audit/ehr-phase1-uiux/new-pageviews-route-uat.md` — `#/work-queue`, `#/today`, `#/oasis` load PASS). Direct browser fetch of `127.0.0.1` blocked in this agent environment.
- Verdict: **CONDITIONAL**
- Summary: Taylor Brooks–owned work items are present and searchable on **My work queue**, with clear owner, due, and status chips, and primary deep-link buttons that navigate to the correct route surfaces (`/oasis`, `/field-visits`). Escalated missed-visit **wq-5** is visually unmistakable on the queue, but the destination field-visit registry has **zero** `missed` visits, so the exception does not close the loop. The screen is labeled “My” yet lists multi-owner agency sample items with no “mine only” filter, and the live shell identity is **RN case manager**, not LVN.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Routes load (no 404) | **OK** | `App.tsx` registers `/work-queue`, `/today`, `/oasis`, `/field-visits`. Prior live UAT: work-queue / today / oasis h1 PASS, 0 pageerrors. |
| Tasks owned by Taylor Brooks findable | **OK** | Sample owns **wq-1** (SOC OASIS review) and **wq-5** (Missed-visit follow-up). Owner string shown on every row + inspector; search haystack includes `item.owner` so “Taylor” / “Brooks” filters correctly. |
| “My” ownership scoped for personal queue | **FAIL (P1)** | Title is “My work queue” but list is **all 6 synthetic items** (Billing desk, Clinical manager, Dr. Cho, Compliance, Taylor). No owner filter / “Assigned to me” chip. Nav badge hard-coded **18** while sample open count is **6**. |
| Deep link lands correctly (route-level) | **OK** | HashRouter destinations match routes; inspector **Open primary · {href}** uses `navigate(selected.href)` — wq-1 → `/oasis`, wq-5 → `/field-visits`. Related chips (Chart, Messages, Reschedule, Missed-visit PIP) present. |
| Deep link lands correctly (item-level) | **FAIL (P1)** | No `useSearchParams` / `?id=wq-5` / hash selection. Landing `/work-queue` always preselects `WORK_QUEUE[0]` (wq-1). Landing `/field-visits` preselects `weekVisits[0]`, not Raymond’s exception. |
| Escalated missed visit clear on queue | **OK** | wq-5: status **Escalated** (bad chip), priority **Critical**, due **Overdue** (bad text), siren row icon when escalated/critical; stat “Overdue / escalated” counts escalated items. |
| Escalated missed visit clear on field surface | **FAIL (P1)** | `todayVisits` / `weekVisits` have **no** `status: 'missed'`. Missed StatCard value = **0**. Raymond appears as PT documentation-due / scheduled under Marcus Webb — contradicts queue “missed SN visit” narrative. |
| Cross-links / RelatedNav | **OK** | Work queue Related → Today, Orders, OASIS, Legal evidence. Field visits Related → Schedule, Aide supervision, Work queue. Today links Full queue + Open primary for first queue item. |
| Honesty (claim / complete / escalate) | **OK** | Prototype banner + footnote: claim/complete/escalate visual-only; waiting/done claim disabled with reason. No durable write implied as complete. |
| LVN persona fit for this topic | **FAIL (P2→P1 for role story)** | Shell user: **Taylor Brooks, RN · Case manager**. No LVN identity, no LVN-scoped queue. OASIS SOC ownership is RN work; LVN daily ownership story is underspecified. |

## Findings

### P0
- None for prototype-survey readiness of this topic. No false “complete” on escalated work; controls are explicitly visual-only.

### P1
1. **Personal ownership is not enforced on “My work queue”.**  
   - Evidence: `WorkQueueScreen.tsx` filters status/priority/search only; `WORK_QUEUE` mixes owners. Nav label “My work queue” + badge `18` vs 6 sample rows (`navigation.ts` badge: 18).  
   - LVN impact: Field nurse cannot trust the list as *my* open work; triage noise from billing/compliance/physician items.

2. **Escalated missed-visit does not resolve on Field visits.**  
   - Evidence: `workspace.ts` wq-5 → `href: '/field-visits'`, patient `pt-raymond`, detail “missed SN visit”; `clinical.ts` week set never uses `missed`. Field screen computes `missed = weekVisits.filter(v => v.status === 'missed').length` → 0.  
   - LVN impact: Opening the deep link after an escalation looks “all clear” on Missed stat — risk of treating exception as resolved.

3. **Deep links are surface-level only; no task/visit context carry.**  
   - Evidence: local `selectedId` state only on WorkQueue / FieldVisits / OASIS; no URL binding.  
   - LVN impact: Message or external share of “open missed visit” cannot land on the right row; must re-search.

### P2
1. **Role mismatch for LVN persona pack.** Session and owned clinical work are RN case-manager shaped (OASIS SOC, countersign chase). An LVN pack would need SN-under-plan / visit packet / med task ownership labels and a role switcher or sample LVN identity.
2. **RelatedNav on work-queue omits Field visits** even though an escalated FLD item is in-queue; field-visits *does* link back. Minor discoverability polish.
3. **Today “Next best actions”** only surfaces SOC / POC / med items for Elena — not the escalated missed-visit, so the highest-severity owned item is invisible on the morning desk unless user opens Full queue.

## Route notes (persona lens)

### `#/work-queue` — My work queue
- **Load / chrome:** Domain COR kicker, h1 “My work queue”, synthetic honesty banner, RelatedNav, 4 StatCards (open, due today, overdue/escalated, high+critical), list + inspector.
- **Taylor-owned rows:**  
  | ID | Title | Status | Priority | Due | Primary href |  
  |----|-------|--------|----------|-----|--------------|  
  | wq-1 | SOC OASIS review | In progress | High | Today 4:00 PM | `/oasis` |  
  | wq-5 | Missed-visit follow-up | Escalated | Critical | Overdue | `/field-visits` |
- **Findability:** Owner on row meta + inspector; search placeholder “Search task, patient, owner, or domain”. Escalated filter chip isolates wq-5. Claim next prefers open/escalated (visual select only).
- **Ownership honesty:** Inspector shows “Assignment is sample-only” under Owner — good for prototype; weak for “personal ownership” story.

### `#/today`
- Greets “Good afternoon, Taylor”; Work queue CTA; Full queue (open count from `WORK_QUEUE`).
- NBA deep links map act-1 → wq-1 `/oasis`, act-2 → wq-2 `/orders`, act-3 → `/medications`.
- Gap: escalated missed visit not in NBA; visit strip shows agency-day mix (Iris Duan, Marcus Webb) not purely Taylor-owned.

### `#/oasis`
- Primary land for wq-1. Elena SOC `oas-elena-soc` in-progress 82% with blockers (GG0170, meds, lock). Matches queue detail “7 GG / med items”.
- No clinician owner field on OASIS records (ownership lives only on work-queue side). Continue assessment is visual-only; lock blocked when blockers present — honest.

### `#/field-visits`
- Primary land for wq-5. Missed filter exists in UI but empty data. Raymond Delgado visits are not missed and not SN under Taylor.
- Complete disabled for missed (if any existed) with exception-path copy — good pattern waiting on sample data.
- RelatedNav includes Work queue for return path.

## What works
- Closed-loop **owner + due + priority + status + domain + href + related** contract on every work item (`COR`-style sample).
- Escalation visual language on the queue is strong (status chip, critical, overdue, siren, overdue/escalated stat).
- Search and status filters make Taylor’s items and escalations recoverable without hunting code.
- Deep-link **buttons** to OASIS and Field visits / Messages / Schedule / QAPI are coherent for follow-up.
- Prototype honesty banners prevent claim/escalate looking production-durable.
- Message thread `msg-3` “Missed visit · Raymond” reinforces the escalation story if the user opens Messages.

## Data anchors (absolute paths)
- Queue items: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\data\workspace.ts` (`WORK_QUEUE` wq-1, wq-5)
- Visits: `...\src\data\clinical.ts` (`todayVisits`, `weekVisits` — no missed)
- Screens: `...\src\screens\WorkQueueScreen.tsx`, `TodayScreen.tsx`, `OasisAssessmentsScreen.tsx`, `FieldVisitsScreen.tsx`
- Routes: `...\src\App.tsx`
- Shell identity: `...\src\shell\AppShell.tsx` (Taylor Brooks, RN)

## Persona quote
> “I can find Taylor’s OASIS and the red escalated missed-visit on My work queue — but when I open Field visits the Missed count is zero, and half the queue isn’t even mine; as an LVN I’d never trust this list for my day until ‘mine’ means mine and escalations still look escalated on the visit board.”
