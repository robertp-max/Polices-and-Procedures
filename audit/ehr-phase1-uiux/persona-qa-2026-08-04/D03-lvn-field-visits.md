# D03 — LVN — Field visits & EVV

- **Routes:** `#/field-visits`, `#/schedule`, `#/work-queue`, `#/messages`
- **Base:** http://127.0.0.1:5194/#
- **Worktree:** `ehr_phase1` · `apps/ehr-prototype`
- **Method:** Source review of screen TSX + synthetic data + prior route UAT (`new-pageviews-route-uat` PASS for `#/field-visits` and `#/work-queue`). Live `open_page` against 5194 failed this session; route registration and prior UAT used as load evidence.
- **Verdict:** **CONDITIONAL**
- **Summary:** Field visits correctly models **Documentation due** and **Missed** status chips, filters, and StatCards, with honest “visual only / no durable write” footers. Missed-visit **cross-links** across work queue, messages, schedule, and field visits are wired and useful for an LVN follow-up path. The sample set **never includes a visit with `status: 'missed'`**, so Missed always reads **0** while queue item `wq-5` and thread `msg-3` claim a critical missed SN visit for Raymond — story honesty fails for the persona’s core exception workflow. EVV is title-level and label-only (no clock-in/out, applicability, exception codes, or real outbox).

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| `#/field-visits` loads | OK | Route in `App.tsx`; prior UAT h1 “Field visits & EVV”, 0 pageerrors |
| `#/schedule` loads | OK | `ScheduleScreen` registered; week grid + rail stats |
| `#/work-queue` loads | OK | Prior UAT PASS; closed-loop task registry |
| `#/messages` loads | OK | Thread list + inspector; channel filters |
| Documentation-due status visible | OK | `documentation-due` → chip “Documentation due” (field) / “Note due” (schedule); StatCard count from week sample; filter chip present; sample `v-4` Raymond PT |
| Missed status visible | **FAIL** | UI meta + filter + StatCard exist, but **no** `weekVisits`/`todayVisits` row has `status: 'missed'` → Missed StatCard **0**, filter empty; complete-disabled path for missed never demoable |
| EVV cues | **FAIL** (prototype-thin) | Domain kicker “field visits & EVV”; inspector “Sync / EVV” text only (`Exception path` / `Synced · note due` / `Sample · not production EVV`); “Outbox status” / “Complete visit” visual-only; no check-in, geo method, attestation, aggregator state, or applicability matrix in UI |
| Cross-links for missed-visit follow-up | OK (wiring) / **FAIL** (data story) | `wq-5` → `/field-visits` + Messages / Schedule / QAPI; `msg-3` “Missed visit · Raymond” → Field visits / Work queue / QAPI; Schedule “Missed-visit task” → `wq-5.href`; Field visits → Schedule / Work queue / chart. **But** field registry has no matching missed visit |
| RelatedNav present | OK | `/field-visits` → Schedule, Aide supervision, Work queue; `/schedule` → Field visits, Work queue, Patients; `/work-queue` → Today, Orders, OASIS, Legal evidence (**no** Field visits on hub); `/messages` → Work queue, Orders, Vendors (**no** Field visits on hub) |
| Honesty (no false complete) | OK | Synthetic banners; Complete visit disabled for completed/missed with reason; Outbox/Complete footnotes; Compose/Claim visual-only |
| Filters / inspector | OK | Scope Today/Week; status filters; search; inspector with patient chart deep-link |
| Persona (LVN field day) | **CONDITIONAL** | Workflow surfaces exist for visit list, notes-due, queue, ops messages; demo identity is RN-centric (`Taylor Brooks, RN`); no LVN-scoped visit packet or EVV punch UI |

## Findings

### P0

_None for prototype safety / false legal action._ Durable writes are blocked and labeled. Incomplete work does not present as filed or billed.

### P1

1. **Missed-visit sample is inconsistent across surfaces (story integrity)**  
   - Work queue `wq-5` (“Missed-visit follow-up”, patient Raymond, critical/escalated/Overdue, FLD, href `/field-visits`) and Messages `msg-3` (“Missed visit · Raymond”, ops, unread) assert a missed **SN** visit.  
   - `clinical.ts` week sample: Raymond appears only as `v-4` **PT · documentation-due** (and `v-7` scheduled PT). **Zero** visits with `status: 'missed'`.  
   - Field Visits Missed StatCard and Missed filter therefore contradict the queue/message narrative. An LVN following “Missed-visit task” lands on a registry that looks clean.  
   - **Fix (data):** add e.g. a prior SN visit for `pt-raymond` with `status: 'missed'`, and align `wq-5`/`msg-3` discipline/type copy.

2. **EVV is branding-only on Field visits**  
   - Title/domain sell “EVV” and FLD requirements (`FLD-005`, CalEVV/applicability) live elsewhere in the prototype, but the field screen never shows: service applicability, clock-in/out, location method, offline outbox items, exception reason, or aggregator acceptance/rejection.  
   - “Outbox status” is a non-functional button; Sync/EVV grid is three static strings.  
   - For LVN field QA, this is a major workflow gap vs schedule/notes-due, which at least have real status rows.  
   - **Fix (UX skeleton):** inspector EVV panel with applicability badge, sample punch times, exception path CTA that deep-links to `wq-5` when status is missed.

3. **“Open visit packet” does not open a packet**  
   - Primary action only switches scope to Today and selects first `scheduled` or `documentation-due` row. Title admits visual-only; LVN still cannot enter documentation-due work from this surface.  
   - **Fix:** deep-link to patient chart / clinical note surface, or a labeled “packet stub” drawer so notes-due is actionable in the demo.

4. **Work-queue RelatedNav omits Field visits**  
   - Hub links: Today, Orders, OASIS, Legal evidence. Missed-visit item carries primary href, but hub RelatedNav does not surface FLD for the LVN after closing the inspector. Schedule and Field visits cross-link each other well; queue hub does not.

### P2

1. **Status label inconsistency:** Schedule uses “Note due”; Field visits uses “Documentation due” for the same status enum. Prefer one field-facing label.  
2. **In-progress filter empty:** Status type and filter exist; no sample visit is `in-progress`, so mid-visit EVV/outbox story cannot be shown.  
3. **Messages RelatedNav** lacks Field visits / Schedule; only thread-level Continue-in on `msg-3` reaches FLD.  
4. **RN-default persona:** Schedule subtitle and many owners are RN; LVN-specific sample (LVN SN visit, LVN-owned queue item) would strengthen D-wave evaluation.  
5. **CloudOff icon on Missed StatCard** slightly conflates offline/outbox with missed-visit exception (copy says “Exception / reschedule path” — OK once read).

## What works

- Clear **status model** (`scheduled` | `in-progress` | `completed` | `missed` | `documentation-due`) with tones and filters on Field visits and Schedule.  
- **Documentation due** is real in data (`v-4`), counted on StatCards (field + schedule “Notes due”), and filterable.  
- **Missed-visit follow-up graph** is intentionally designed: Schedule → Missed-visit task → `wq-5` → Field visits / Messages / Schedule / QAPI; Messages `msg-3` mirrors the same destinations; QAPI PIP “Missed-visit communication” also points at Field visits / Messages / Work queue.  
- **Honesty pattern** is consistent: flask banners, disabled complete for exception path, footnotes that complete/EVV/claim/compose do not write state.  
- **Patient deep-links** from field inspector and message threads to chart.  
- **Search + scope (Today/Week)** on field registry supports a field nurse scanning the day.  
- Prior automated UAT: `#/field-visits` and `#/work-queue` load without console/page errors.

## Route-by-route (LVN lens)

### `#/field-visits` — Field visits & EVV
- Domain FLD, registry + inspector, StatCards: Today’s visits, Documentation due, Missed, Telehealth.  
- Actions: Schedule, Work queue, Open visit packet (select-only). Continue-in: Schedule, Work queue, Aide supervision, Patient chart.  
- Complete disabled when completed/missed; EVV section label-only.

### `#/schedule`
- Week-of grid with StatusChips including Note due / Missed (when data present).  
- Rail: notes-due count; Continue-in Work queue, Field visits, **Missed-visit task** (good LVN affordance).  
- Add visit is local draft only (no claim of filed schedule).

### `#/work-queue`
- `wq-5` Missed-visit follow-up is critical/escalated/overdue — correct urgency for LVN ops.  
- Primary surface `/field-visits`; related Messages, Reschedule, Missed-visit PIP.  
- Claim/Escalate visual-only with footnotes.

### `#/messages`
- `msg-3` “Missed visit · Raymond” unread ops thread with Field visits + Work queue + QAPI — strong notify path.  
- Compose visual-only; not Connect rail (banner honest).

## Persona quote

> “I can see notes due and the queue/message telling me Raymond’s visit was missed — but when I open Field visits the Missed count is zero and EVV is just a label, so I still don’t know how I’d document the exception or punch a real visit.”

## Sources (code)

| Area | Path |
|------|------|
| Field visits UI | `apps/ehr-prototype/src/screens/FieldVisitsScreen.tsx` |
| Schedule UI | `apps/ehr-prototype/src/screens/ScheduleScreen.tsx` |
| Work queue UI | `apps/ehr-prototype/src/screens/WorkQueueScreen.tsx` |
| Messages UI | `apps/ehr-prototype/src/screens/MessagesScreen.tsx` |
| Visit sample data | `apps/ehr-prototype/src/data/clinical.ts` |
| Queue / messages / RelatedNav | `apps/ehr-prototype/src/data/workspace.ts` (`wq-5`, `msg-3`, `ROUTE_RELATED`) |
| Routes | `apps/ehr-prototype/src/App.tsx` |
| Prior load UAT | `audit/ehr-phase1-uiux/new-pageviews-route-uat.md` |

---

**Report-only.** No app source changes. No commit.
