# D05 — LVN — Messages / care team comms

- Routes: `/messages`, `/work-queue`, `/patients` (plus chart deep-links `/patients/:id`)
- Persona: LVN (field care-team messaging lens)
- App: http://127.0.0.1:5194/# (HashRouter · `apps/ehr-prototype`)
- Worktree: `ehr_phase1`
- Method: Source review of live screen TSX/data/CSS against assigned checks (localhost browser fetch blocked from this agent; Vite log shows port **5194** previously served)
- Verdict: **CONDITIONAL**
- Summary: In-app Messages is a coherent prototype inbox with channel filters, unread chips, patient avatars, chart deep-links, and honest “nothing is sent” copy. For an LVN it still fails day-to-day trust: selecting a thread never clears unread (badge stays 3 forever), there is no multi-message conversation body—only a one-line preview—and the topbar Messages icon still jumps to external Connect while the screen banner says Connect is *not* this destination. Work queue ↔ messages deep-links work for missed-visit style tasks; patient chart does not surface threads back the other way.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| `/messages` loads with title + COR kicker | OK | `MessagesScreen` title “Messages”, kicker “Domain COR · messages”, synthetic banner present |
| RelatedNav present & sensible | OK / partial | Related → Work queue, Orders, Vendors — useful for ops/compliance; **missing Patients / Field visits** for field LVN path |
| StatCards accurate vs synthetic data | OK | Open threads 4, Unread 3, Patient-linked 3, Compliance 1 — matches `MESSAGE_THREADS` |
| Unread clear on open / select? | **FAIL** | `onClick` only `setSelectedId`; `unread` is static on const data. List chip, inspector “Unread”, StatCard, and nav badge **3** never change |
| Patient-linked threads? | OK | 3/4 threads have `patientId`; list shows avatar/name; inspector “open chart” → `/patients/{id}` |
| No-patient / org threads labeled | OK | msg-4 BAA shows “No patient link”; compliance channel chip |
| Continue-in to chart / visits / queue? | OK | Per-thread `related` uses real `navigate()` (Chart, Field visits, Work queue, Orders, QAPI, Vendors, etc.) |
| Work-queue cross-link for care comms | OK | Header “Work queue”; wq-5 “Missed-visit follow-up” related includes Messages; primary href `/field-visits` |
| Work-queue honesty (claim/escalate) | OK | Visual-only titles + footnote; claim disabled when waiting/done |
| Patients roster supports context jump | OK | Roster → chart; search/filters work. **No message-thread badge or “open threads” from roster/chart** |
| Chart → messages reverse path | **FAIL** | `PatientChartScreen` Care team is display-only; Continue-in has Work queue but **no Messages** |
| Compose honest? | OK (with caveats) | Primary **Compose** has `title="Visual only · no message is sent"`; no send side-effect. Screen banner + inspector footnote reinforce prototype. Not `disabled` / no click toast — easy to miss honesty without hover |
| Reply / escalate honesty | Partial | Footnote says “Reply / escalate controls are visual only” but **no reply/escalate controls are rendered** — copy without affordance |
| Dual entry-point honesty (shell vs nav) | **FAIL** | Left nav `/messages` = in-app prototype; topbar Messages icon `aria-label="Messages — open Connect in a new tab"` → `getIntegrationHref('connect')` (port 5192). Screen sub/banner say this is **not** Connect — LVN can open the wrong surface |
| Channel filters + search | OK | All / Clinical / Ops / Billing / Compliance; search includes subject, people, patient name |
| Inspector vs filter selection sync | P2 | `selected` always from full `MESSAGE_THREADS`; filtering can leave inspector on a hidden row (no auto-reselect like WorkQueue) |
| Nav badge honesty | OK for count | `navigation.ts` badge **3** matches unread count; does not update live (static, same as unread non-clear) |
| Session persona vs LVN | P2 | Shell user is “Taylor Brooks, **RN** · Case manager” — not LVN; prototype-wide, not messages-only |
| False completeness / silent legal action | OK | No send/seal of clinical communications; flask banner + footnotes keep compose non-authoritative |

## Findings

### P0
- None for this prototype scope. Compose does not silently deliver messages or claim legal send.

### P1
1. **Unread never clears** — Opening/selecting a thread does not flip `unread`. StatCard “Unread”, row chips, inspector state, and sidebar badge stay permanently at **3**. An LVN cannot trust that “I handled my care-team inbox” is reflected anywhere.
2. **No conversation body** — Inspector shows subject, channel, participants, single `preview` line, patient card, and Continue-in. There is no thread timeline, timestamps per message, or prior replies. Care-team coordination (e.g. PT gait note) is a stub, not a readable exchange.
3. **Shell Messages ≠ in-app Messages** — Topbar MessagesSquare opens external Connect; primary nav opens `/messages` which explicitly disclaims Connect. Dual destinations with the same iconography is a high-confusion care-comms path for field staff.

### P2
1. **Compose honesty is title-only** — Primary button looks fully actionable; honesty is hover `title` only (no disabled state, no inline “visual only” label on the button, no onClick acknowledgement).
2. **Orphan honesty footnote** — “Reply / escalate controls are visual only” with no such controls in the inspector.
3. **RelatedNav for `/messages`** skews admin (Orders, Vendors) vs LVN field loop (Patients, Field visits, Schedule).
4. **Chart / Patients lack reverse message entry** — Cannot see “2 open clinical threads for Elena” from chart Care team or roster.
5. **Filter + selection desync** — Unlike Work queue’s `useEffect` reselect, Messages can inspect a thread not in the filtered list.
6. **Persona chrome** — RN case-manager shell identity; LVN evaluating field workflow must ignore role chrome.

## What works

- Built route `/messages` with dedicated layout (`msg.css`), list + sticky inspector, channel chips, search, EmptyState when filters empty.
- Synthetic honesty: flask banner (“threads are not delivered to real staff inboxes”), screen-sub distinguishing in-app threads from Connect, Compose tooltip, inspector footnote.
- Patient-linked majority of sample (Elena ×2 clinical/ops, Raymond missed visit ops); chart open from patient card with MRN.
- Continue-in destinations are real routes (not dead domain placeholders) and align with thread topic (missed visit → Field visits + Work queue + QAPI PIP; gait → Chart + Field visits + Clinical; BAA → Vendors).
- Work queue item wq-5 closes the loop from operational task → Messages; Messages header returns to Work queue.
- StatCards call out patient-linked vs compliance channels so LVN can deprioritize BAA noise.
- Nav + command palette both expose Messages as a first-class built workspace.

## Evidence (code)

| Area | Path |
| --- | --- |
| Screen | `apps/ehr-prototype/src/screens/MessagesScreen.tsx` |
| Styles | `apps/ehr-prototype/src/screens/msg.css` |
| Thread data | `apps/ehr-prototype/src/data/workspace.ts` → `MESSAGE_THREADS`, `ROUTE_RELATED['/messages']` |
| Work queue link-in | `apps/ehr-prototype/src/data/workspace.ts` → `WORK_QUEUE` wq-5 related Messages |
| Work queue UI | `apps/ehr-prototype/src/screens/WorkQueueScreen.tsx` |
| Patients / chart | `apps/ehr-prototype/src/screens/PatientsScreen.tsx`, `PatientChartScreen.tsx` |
| Nav badge | `apps/ehr-prototype/src/data/navigation.ts` (Messages badge: 3) |
| Shell dual destination | `apps/ehr-prototype/src/shell/AppShell.tsx` topbar Connect link |
| Route | `apps/ehr-prototype/src/App.tsx` → `/messages` |

### Thread sample (synthetic)

| id | Subject | Patient | Unread | Channel | Continue-in (labels) |
| --- | --- | --- | --- | --- | --- |
| msg-1 | Elena gait progress | pt-elena | yes | clinical | Chart, PT visit, Clinical |
| msg-2 | POC signature nudge | pt-elena | yes | ops | Orders, Signature queue, Holds |
| msg-3 | Missed visit · Raymond | pt-raymond | yes | ops | Field visits, Work queue, Missed-visit PIP |
| msg-4 | BAA renewal · Labs-R-Us | *(none)* | no | compliance | Vendors & BAAs, Security, Interfaces |

## Recommended prototype fixes (report-only; not applied)

1. On select: local state `readIds` (or toggle `unread`) so chips/stat/badge drop; keep “prototype” banner.
2. Add 2–4 synthetic message bubbles per thread (who / when / body) still marked non-delivered.
3. Retarget topbar MessagesSquare to `/#/messages`, or label it explicitly “Connect (external)” with a different icon; keep single mental model for LVN.
4. Put `disabled` + visible “Visual only” on Compose, or open a non-send modal with the same honesty line.
5. Chart Care team: “Open messages” filter query or Continue-in chip when `MESSAGE_THREADS` has that `patientId`.
6. Mirror WorkQueue selection sync when filters change; add Patients / Field visits to `ROUTE_RELATED['/messages']`.

## Persona quote

> “I can see PT pinged me about Elena’s walker and that Raymond’s missed visit sits on the queue—but if the unread count never moves and the top bar messages icon sends me somewhere else called Connect, I still don’t trust this as my care-team inbox.”
