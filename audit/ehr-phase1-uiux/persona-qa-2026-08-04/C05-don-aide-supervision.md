# C05 — DON — Aide supervision clocks
- Routes: `#/aide-supervision`, `#/field-visits`, `#/competency`, `#/schedule`
- Verdict: **CONDITIONAL**
- Summary: The aide-supervision workspace is a credible DON surface: skilled 14-day vs non-skilled 60-day clock kinds, status filters, overdue list styling, an inspector overdue callout, synthetic honesty banner/footnotes, and solid two-way links to field visits and competency. Live load for `#/aide-supervision` previously **PASS**ed pageview UAT (0 console errors). Conditional because sample clock arithmetic does not reconcile to a real 14-day window from last observation dates, and the “Due ≤7 days” StatCard double-counts overdue clocks (`daysRemaining <= 7` includes negatives), which undermines DON trust in the headline metrics.

**Method:** Code-level review of `AideSupervisionScreen.tsx`, `hha.css`, `workspace.ts` RelatedNav map, reverse links on Field Visits / Competency / Schedule; prior UAT at `audit/ehr-phase1-uiux/new-pageviews-route-uat.md`. Live `127.0.0.1` fetch blocked from this agent environment; load evidence taken from prior Playwright UAT on the same base (`http://127.0.0.1:5194`).

**Sources:**  
- `apps/ehr-prototype/src/screens/AideSupervisionScreen.tsx`  
- `apps/ehr-prototype/src/screens/hha.css`  
- `apps/ehr-prototype/src/screens/FieldVisitsScreen.tsx`  
- `apps/ehr-prototype/src/screens/CompetencyScreen.tsx`  
- `apps/ehr-prototype/src/screens/ScheduleScreen.tsx`  
- `apps/ehr-prototype/src/data/workspace.ts` (`ROUTE_RELATED`, work-queue `wq-4`)  
- `apps/ehr-prototype/src/data/requirementsSpec.ts` (HHA-002 / HHA-003)  
- `apps/ehr-prototype/src/App.tsx` routes  

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Load `#/aide-supervision` | **OK** | Route registered; prior UAT: h1 “Aide supervision”, 0 pageerrors / console errors, ~921 ms |
| Title / domain kicker | **OK** | “Domain HHA · aide supervision”; screen sub mentions plan-authorized services + effective-dated clocks |
| Synthetic honesty banner | **OK** | Flask banner: no durable clinical write; points to HHA-002 / HHA-003 |
| RelatedNav | **OK** | Field visits · Competency · Schedule (`ROUTE_RELATED['/aide-supervision']`) |
| StatCards present | **OK** | Active clocks · Due ≤7 days · Overdue · Recently observed |
| Status + clock-type filters | **OK** | All / on-track / due-soon / overdue / observed; All / skilled-14 / non-skilled-60 |
| Search | **OK** | Patient, aide, supervisor, clock id, MRN |
| Registry + inspector | **OK** | Listbox rows + selected inspector; default selects first filtered clock |
| **14-day window honesty** | **FAIL** | Clock *kinds* correctly name skilled 14-day vs non-skilled 60-day (aligns with HHA-002/003 / CoP framing). Copy correctly states canceled/wrong-type encounters do not reset clocks. **But** sample `lastObservation` → `nextDue` / `daysRemaining` does not arithmetically reconcile to 14-day windows (see P1). `nextDue` mix of weekday names (“Wed”/“Fri”) and calendar dates is ambiguous for DON/survey read. |
| **Overdue callouts** | **OK** (with note) | List: Siren icon, `is-overdue` styling, StatusChip “Overdue”, “Nd overdue” in bad tone. Inspector: `hha-overdue-callout` with escalation copy when `status === 'overdue'`. StatCard Overdue = 1 (hha-3). Header “Schedule supervision” jumps selection to first overdue/due-soon. Overdue is **not** default-selected on load (defaults to hha-1 due-soon). |
| **Links → competency** | **OK** | Header “Competency”; RelatedNav; inspector “Clock rules” → `/competency`; per-row Continue-in for some clocks (hha-1, hha-4, hha-5). Reverse: Competency header, related tab, footer “Supervision clocks”. |
| **Links → field visits** | **OK** | Header “Field visits”; RelatedNav; Continue-in on several clocks. Reverse: Field Visits inspector “Aide supervision”. |
| **Links → schedule** | **OK** (one-way) | RelatedNav + inspector Schedule supervision (when not blocked) → `/schedule`. Schedule RelatedNav is field visits / work queue / patients — **no** reverse chip to aide-supervision. |
| Visual-only / no false completeness | **OK** | Schedule/observe/escalate titled visual-only; schedule disabled after recent observation sample; footnotes explicit |
| Work-queue cross-link | **OK** | `wq-4` “Aide supervision clock” (14-day window closing) → `/aide-supervision` |
| Nav status honesty | **OK** | Care delivery → Aide supervision `status: 'built'` matches real route |

## Findings

### P0
- None. No false “complete/compliant” seal on overdue clocks; prototype does not claim production CoP certification.

### P1
1. **Due ≤7 StatCard double-counts overdue**  
   - Code: `dueSoon = SUPERVISION_CLOCKS.filter(c => c.status === 'due-soon' || c.daysRemaining <= 7).length`  
   - With sample data this counts hha-1 (due-soon), hha-2 (5d remaining, status still “on-track”), **and hha-3 (overdue, −4d)** → value **3**.  
   - DON impact: “Due ≤7” and “Overdue” both light up for the same breach; headline risk is inflated and status chip vs metric disagree for hha-2 (“On track” while included in due-soon metric).  
   - Fix direction: exclude `status === 'overdue'` (or `daysRemaining < 0`) from due-soon; align row status with ≤7 rule or document “approaching only.”

2. **14-day sample arithmetic is not reconcilable**  
   - Screen markets “effective-dated supervision clocks” and skilled **14-day** kind.  
   - Examples (prototype calendar anchors schedule “today” ≈ Mon Aug 3):  
     - hha-1 skilled-14: last obs **Aug 1**, **3d remaining**, next due **Wed** — a true 14-day from Aug 1 is ~Aug 15, not ~Aug 5.  
     - hha-4 skilled-14: last **Aug 2**, **9d remaining**, next **Aug 12** — 14-day from Aug 2 ≈ Aug 16.  
     - hha-3 non-skilled-60: last **Jun 12**, **4d overdue** — 60-day from Jun 12 ≈ Aug 11 (would still be open if “today” is early August).  
   - DON / surveyor persona will treat numbers as clinical risk clocks; illustrative-only banner mitigates but does not fix metric distrust.  
   - Fix direction: recompute sample so `lastObservation + interval ≈ nextDue` and `daysRemaining` matches app “today,” or label due fields explicitly as “illustrative labels (not calculated).”

### P2
1. **Default selection is not highest risk** — registry defaults to hha-1 (due-soon), not overdue hha-3; DON must filter or click to see the overdue callout. Prefer overdue-first sort or default select highest-severity clock.
2. **Schedule reverse link missing** — `/schedule` RelatedNav omits Aide supervision though schedule is a primary destination from this screen.
3. **Uneven per-clock Continue-in links** — overdue hha-3 has field visits / QAPI / reschedule but not Competency; hha-2 lacks Competency. Acceptable for story variety; slightly inconsistent for DON muscle memory.
4. **Header “Schedule supervision” does not navigate** — only focuses an at-risk clock (title: visual only). Footer primary *does* go to `/schedule`. Dual affordances with different behavior may confuse.
5. **“Clock rules” → Competency** — useful cross-link, but label implies rule engine/policy viewer rather than competency roster.
6. **Weekday-only next due** (“Wed”/“Fri”) without date — weak for multi-week non-skilled clocks and printed export mindset.

## What works
- Clear HHA domain workspace with registry + inspector pattern matching other built clinical surfaces.
- Clock kinds map to CoP-shaped patterns (skilled 14-day / non-skilled 60-day) and requirements HHA-002 / HHA-003 language.
- Overdue is never dressed as complete: bad StatusChip, Siren, `hha-due-bad`, dedicated inspector callout with escalate/document exception (visual only).
- Status never color-alone (StatusChip + icon + text remaining/overdue).
- Filters for status and clock type support DON triage (“show me overdue only,” “skilled 14-day only”).
- Bidirectional navigation to **Field visits** and **Competency**; RelatedNav on aide-supervision includes Schedule.
- Honesty: synthetic banner, visual-only titles, schedule disable after recent observation sample, no durable write claimed.
- Work queue item `wq-4` surfaces closing 14-day window with path back to this screen.
- CSS callout (`.hha-overdue-callout`) uses status-bad tokens — readable escalation affordance for DON scan.

## Persona quote
> “I can finally *see* who is overdue on aide supervision and jump to field visits or competency — but until your Due ≤7 and 14-day numbers actually add up from the last observation date, I will not trust this board in a surveyor walk-through.”
