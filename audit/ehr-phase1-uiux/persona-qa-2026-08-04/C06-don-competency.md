# C06 — DON — Competency & in-service programme

- **Routes:** `/competency`, `/aide-supervision`, `/qapi`, `/emergency`
- **Base:** http://127.0.0.1:5194/# (HashRouter · `apps/ehr-prototype`)
- **Worktree:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1`
- **Method:** Source-level UX audit of screen TSX/CSS + `ROUTE_RELATED` (live page fetch to :5194 unavailable from this agent; routes and components verified in tree). Report-only.
- **Verdict:** **CONDITIONAL**
- **Summary:** Competency & in-service is a survey-credible DON prototype: overdue/remediation/due-soon states are visually distinct from complete, assignment gates call out blocks, and synthetic banners/footnotes prevent false writes. In-service cross-links to QAPI and emergency prep are present on the competency surface (RelatedNav, header, inspector Related tab) and reciprocated from QAPI (PIP-related + Competency button) and Emergency (Related tab + drill→QAPI). Gaps: primary **Record evidence** is disabled precisely when the gate is blocked/overdue (inverted DON action), there is **no role chip filter** (only free-text staff/role search + status), and Emergency **route-level RelatedNav** omits Competency (inspector-only).

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| `/competency` loads / titled | OK | `CompetencyScreen` · title “Competency & in-service” · kicker Domain QAP |
| RelatedNav on competency | OK | Aide supervision · QAPI · Emergency prep (`ROUTE_RELATED['/competency']`) |
| StatCards present | OK | Due ≤14d, Overdue, Complete (sample), Remediation open |
| Inspector + detail tabs | OK | Overview / Evidence / Assignment gate / Related |
| **Gaps not shown complete** | OK | Overdue = bad + gate Blocked + callout; remediation/due-soon = warn; complete only `cmp-5`; evidence “Missing” / “pending” / “failed”; Confirm assignment always disabled |
| **In-service → QAPI** | OK | Header “QAPI programme”, RelatedNav, inspector Related → `/qapi`; QAPI Related tab + pip-2 “In-service” link back |
| **In-service → emergency** | OK | RelatedNav + inspector Related → `/emergency`; `cmp-5` is Emergency preparedness drill with complete evidence; EMP Related tab → Competency |
| **Staff filters** | CONDITIONAL | Status filter chips + search on staff/role/requirement work; **no dedicated role (HHA/RN/PT) filter** |
| `/aide-supervision` honesty + link | OK | Overdue callout; schedule disabled when recently observed; Competency header/foot + per-clock related |
| `/qapi` honesty | OK | Mark sustained disabled until effectiveness path; no close on task completion alone; Competency link |
| `/emergency` honesty | OK | Incomplete / needs-refresh ≠ current; Save disabled when already current; missing/incomplete StatCard |
| Sign/seal/submit visual-only | OK | Assign drawer Confirm disabled; Record evidence gated/disabled with footnotes; no durable write claimed |
| False completeness (P0 risk) | OK | Flask banners on all four routes; sample labels; blocked/overdue not green-washed as Complete |

## Findings

### P0

_None._ Incomplete competency is not presented as Complete; blocked gates and overdue status use bad tone and explicit copy. Write/sign paths are disabled or footnoted as prototype-only.

### P1

1. **Inverted primary action on overdue competency (DON workflow).**  
   On `/competency`, `assignDisabledReason` disables **Record evidence** when `gate === 'blocked'` (sample `cmp-2` Sam Ortiz · In-service infection prevention · Overdue · Missing evidence). The DON’s natural next step is to capture observation/quiz evidence to clear the gate; the control that says “Record evidence” is the one disabled. Assign training from the header still opens a review-only drawer, so the gap is not total—but the inspector foot primary is backwards for the staff the programme exists to fix.  
   **Fix direction:** Disable **new field assignment** / clear-gate for blocked rows; keep **Record evidence** (or open evidence drawer) enabled for overdue/remediation with visual-only confirm still disabled.

2. **Emergency route RelatedNav omits Competency.**  
   `ROUTE_RELATED['/emergency']` = QAPI · Patients · Security only. Competency appears only in the inspector Related tab after selection. DON hopping EMP drill attendance → workforce in-service must open Related tab or navigate manually; route-level strip should include Competency for parity with `/competency` → Emergency prep.

### P2

1. **No role filter chips on competency registry.** Status filters (All / Due soon / Overdue / Remediation / On track / Complete) and free-text search cover staff name and role string, but a DON reviewing “all HHA annual competencies” must type `HHA` rather than press a Role = HHA chip. Aide supervision and emergency have multi-axis filters (status + kind / status + priority); competency only status.

2. **Assignment gate tab uses check icons for all bullets.** Gate tab always renders `CheckCircle2` beside “Gate state · Blocked” and related lines. Not a status-chip lie, but checkmarks next to a blocked state can read as “verified OK.” Prefer neutral bullets or tone that follows gate status.

3. **Aide supervision overdue clock (`hha-3`) Related links QAPI but not Competency.** Other clocks link Competency; the overdue Sam Ortiz clock escalates to QAPI/work-queue only. For the same aide with overdue in-service on `/competency`, a direct Competency chip on the overdue supervision inspector would tighten HHA↔QAP linkage.

4. **Live runtime not re-fetched in this agent session.** Routes and behaviour are validated from current TSX/CSS in `ehr_phase1`; orchestrator should spot-check :5194 if the Vite process is the same build.

## What works

- **Honest gap language:** Overdue + Blocked + “Assignment blocked” callout; remediation path for failed observation; due-soon vs complete chips; evidence labels “Missing” / “Observation form pending” / “Observation failed · remediation.”
- **Prototype containment:** Synthetic banners on competency, aide supervision, QAPI, emergency; Confirm assignment / Create PIP / Save profile disabled with footnotes.
- **DON programme topology:** Competency RelatedNav wires Aide supervision ↔ QAPI ↔ Emergency prep; QAPI PIP-2 links In-service + Emergency; EMP plan tab feeds QAPI; EMP Related includes Competency.
- **Filters that do exist:** Competency status toolbar + search; aide supervision status + clock kind + search; QAPI status; emergency status + priority.
- **Gate framing:** Copy separates education completion from schedule eligibility; blocked gate subtext says production scheduling would prevent new field assignment.
- **Cross-surface consistency:** Shared registry + inspector pattern with StatCards and empty states when filters clear the list.

## Persona quote

> “I can see who is overdue and blocked, and I can jump to QAPI and emergency drills from competency—but don’t disable Record evidence on the aide who is already blocked; that’s the person I need to fix first, and give me a one-click HHA role filter so I’m not typing names during survey week.”
