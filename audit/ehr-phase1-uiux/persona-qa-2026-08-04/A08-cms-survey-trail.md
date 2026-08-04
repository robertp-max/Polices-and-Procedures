# A08 — CMS Surveyor — End-to-end survey trail (Today → claim readiness)

- Routes: `#/today`, `#/work-queue`, `#/patients/pt-elena`, `#/oasis`, `#/orders`, `#/billing`, `#/legal-evidence`
- Verdict: **CONDITIONAL**
- Summary: Elena Martinez’s SOC story is the clearest vertical slice in the prototype and a surveyor can reconstruct Referral → SOC → POC holds → OASIS incompleteness → claim holds → SOC evidence package without inventing data. Integrity of the *story* is strong (incomplete work is mostly labeled incomplete). Integrity of the *trail* is weaker: RelatedNav chips do not form a continuous patient-scoped path, two drawers inject the wrong patient’s “Continue in” links, and the Today → work-queue deep link for POC signature points at Walter’s queue item. No route fails to load (prior pageview UAT + App routes). Prototype is survey-useful as a demo narrative, not yet survey-tight as a closed-loop clinical-record trail.

**Method:** Design-prototype QA against worktree `ehr_phase1` (`apps/ehr-prototype`). Live base `http://127.0.0.1:5194/#` (HashRouter). Route loadability corroborated by `audit/ehr-phase1-uiux/new-pageviews-route-uat.md` (PASS for `#/today`, `#/work-queue`, `#/oasis`, `#/legal-evidence`; Billing/Orders/chart present in App and prior builds). Persona path evaluated by reading screen TSX + `data/clinical.ts` + `data/workspace.ts` + `RelatedNav` / `ROUTE_RELATED` wiring. Report-only; no source edits.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| All assigned routes resolve | OK | `App.tsx` routes present; UAT matrix PASS for core new surfaces; chart is `/patients/:id` |
| Surveyor can identify Elena SOC story on Today | OK | PatientBanner Elena, slice `Referral→…→Claim-ready`, NBA all `pt-elena`, SOC 82%, integrity 11/13 sub “2 checks blocking” |
| Work queue carries Elena blockers into clinical/RCM | COND | `wq-1` SOC OASIS · Elena with Chart / Episode / Claim holds / PKG-8821 — strong. No dedicated queue item for Elena CMS-485 signature (only Today NBA). |
| Chart (`#/patients/pt-elena`) reconstructs episode | OK | Timeline Jul 26–Aug 3; integrity checklist; POC pending signature; OASIS 82%; docs draft/pending; Continue-in from episode → OASIS, Orders, Claims, SOC package |
| OASIS shows SOC incomplete honestly | OK | `oas-elena-soc` 82%, in-progress, blockers GG0170 / meds / lock; Lock disabled + footnote |
| Orders shows Elena CMS-485 pending | COND | `ord-1` pending-signature, urgent, due in 4h. Drawer “Continue in” hard-wired to `wq-2` (Walter) related links — wrong patient context |
| Billing shows claim not ready | OK | `clm-2` holds: POC signature + OASIS not finalized; readiness checklist pending; hold links to `/orders` and `/oasis` |
| Legal evidence has SOC defense package | OK | `PKG-8821` draft 62% for Elena; unsigned OASIS/POC pins; seal disabled; synthetic banner |
| RelatedNav continuous along trail | FAIL | See matrix below — chips are domain-local, not patient-trail-local; chart uses generic `/patients` related set |
| No dead ends (links land somewhere sensible) | COND | Destinations exist; some land on wrong patient or lose Elena context (Orders drawer, Billing RCM fallback, act-2→wq-2 href only) |
| False completeness along path | COND | Elena claim correctly *not* claim-ready. Weak signals: integrity 11/13 with `accent="good"`; Today checkboxes can mark blockers “done”; header actions on Billing/Orders lack visual-only footnotes; notification “OASIS warning cleared” vs still-blocked GG0170 |
| Inspector / filters / StatCards present where expected | OK | Work queue, OASIS, Legal evidence full registry+inspector; Orders/Billing tables+drawers; Today stats+NBA |

### RelatedNav trail matrix (Elena SOC path)

| Surface | RelatedNav chips (`ROUTE_RELATED`) | Elena-scoped Continue-in elsewhere? | Surveyor trail fit |
|---------|------------------------------------|--------------------------------------|--------------------|
| `/today` | Work queue, Schedule, Clinical, Messages | Vertical slice + NBA → oasis/orders/meds; Continue SOC → chart assessments | Weak RelatedNav; strong local affordances |
| `/work-queue` | Today, Orders, OASIS, Legal evidence | `wq-1` related: Chart, Episode, Claim holds, PKG-8821 | Strong for Elena item; chips not patient-filtered |
| `/patients/pt-elena` | **Patients-list set:** Intake, Schedule, Episodes | Episode related: Chart, OASIS SOC, Orders, Claims, SOC package + Work queue | RelatedNav misleading; Continue-in OK |
| `/oasis` | Episodes, CMS quality, Claims, Clinical | Inspector: Chart + related (no Legal PKG) | Missing Legal evidence / patient list chip |
| `/orders` | Signatures, Medications, Order packages | Drawer uses **Walter `wq-2`** related | Cross-patient contamination |
| `/billing` | Authorizations, Orders, OASIS, Notices | Hold resolve → Orders/OASIS; Continue-in also injects **Margaret `wq-3`** when no Elena RCM item | Partial wrong-patient pollution |
| `/legal-evidence` | Documents, QAPI, Orders, DOC-005 | Inspector chart link for Elena packages | Missing OASIS / Billing / Today |

## Per-route notes (surveyor walk)

### 1. `#/today` — entry desk
- **Load / title:** “Good afternoon, Taylor”; sub notes SOC episode attention.
- **Elena spine:** Banner CTA “Continue SOC” → `/patients/pt-elena/assessments`. Live vertical slice shows Referral **done**, SOC **current**, POC/Visit/Claim-ready/QAPI **todo** (honest incomplete).
- **NBA honesty:** POC follow-up labeled “Blocks claim readiness”; metoprolol “High-risk medication”. Checkboxes are local React state only (can look done without work — see P1).
- **Deep links:** `act-1` → `/oasis` (via `wq-1.href`); `act-2` → `/orders` via **`wq-2.href`** (correct surface, wrong queue semantic — Walter’s countersign item); `act-3` → `/medications`.
- **StatCard tension:** “Record integrity **11 / 13**” with `accent="good"` while subtext admits “2 checks blocking claim readiness” — green meter underplays survey concern.

### 2. `#/work-queue` — closed-loop tasks
- Synthetic banner + Claim item disabled with reason/footnote — honesty OK.
- **Elena items:** `wq-1` SOC OASIS review (high, in-progress); `wq-4` aide supervision (medium). Missing: POC signature / claim hold as first-class queue rows for Elena.
- Inspector Continue-in for `wq-1` is the best single hop set on the trail (Chart + Episode + Claim holds + PKG-8821).
- Search/filter work for surveyor triage.

### 3. `#/patients/pt-elena` — clinical record core
- Full tab set: overview, timeline, plan of care, assessments, visits, orders, medications, documents.
- **Timeline** is survey-grade narrative: referral → eligibility → SOC → consents → CMS-485 sent → med flag → PT eval → HHA → claim-readiness check (POC outstanding).
- **Integrity list (Elena only):** OASIS attention, med recon attention, **POC signature blocked** — matches claim holds directionally.
- **Data bug:** `integrityChecks` enumerates **10 passed / 2 attention / 1 blocked**, but `elena.integrity.passed = 11` and copy says “11 of 13” — numbers do not reconcile (see P1).
- RelatedNav is the **patients directory** related set, not chart-trail chips.

### 4. `#/oasis` — assessment lock path
- Elena SOC package first in sample; 82%; blockers explicit; Lock disabled until 100% and no blockers; footer “visual only”.
- Continue-in: Chart, Episode, Clinical, QRP, Claim holds — good revenue coupling; **no PKG-8821**.
- RelatedNav omits Legal evidence and Work queue.

### 5. `#/orders` — physician signature path
- Elena’s CMS-485 (`ord-1`) and metoprolol clarification (`ord-2`) visible with urgent flags.
- **No synthetic banner** on Orders (unlike WQ / OASIS / Legal).
- **New order / Send reminder / Edit order** primary actions have no “visual only” title/footnote (contrast Work queue / OASIS / Legal).
- Drawer “Continue in” always maps `WORK_QUEUE.find(w => w.id === 'wq-2')` → Walter Chart + Signature queue + PKG-8844 — **breaks Elena survey trail**.

### 6. `#/billing` — claim readiness gate
- Elena RAP/NOA **On hold** with both expected holds; sorted holds-first.
- Hold chips deep-link: signature/POC → Orders; OASIS → OASIS. Readiness checklist marks those pending.
- Recheck readiness is local only and reports “no change” — acceptable prototype honesty.
- **Export 837 / Run claim check** lack visual-only affordance (P1).
- Continue-in falls back to **Margaret authorization** related when patient has no RCM queue item — pollutes Elena claim drawer.

### 7. `#/legal-evidence` — survey / defense package
- `PKG-8821` SOC evidence bundle (Elena): draft, 62%, unsigned note/OASIS/POC pins, seal blocked on completeness + pending signatures.
- `PKG-8688` ACHC survey evidence set (also Elena): hash attention, export blocked — honest “not survey-ready” rehearsal.
- Banner + seal disable + export readiness labels meet honesty bar for DOC-005 prototype.

## Findings

### P0
- None for *false claim readiness* on Elena: claim stays on hold; OASIS lock and legal seal blocked; Brad copy “nothing filed without review.”
- No silent legal seal / WORM write in this path.

### P1
1. **Wrong-patient “Continue in” on Orders drawer**  
   Always uses `wq-2` (Walter Feld · PKG-8844). Surveyor opening Elena’s CMS-485 is steered to Walter’s chart / order-authority package.  
   *Source:* `OrdersScreen.tsx` ~383–388.

2. **Billing drawer RCM fallback injects Margaret context for Elena**  
   `WORK_QUEUE.find(… domain === 'RCM') ?? wq-3` — Elena has no RCM queue row, so Margaret’s Schedule/Claims/Chart chips appear on Elena’s claim.  
   *Source:* `BillingScreen.tsx` ~310–312.

3. **POC signature is not a work-queue closed loop for Elena**  
   Today NBA `act-2` (Elena CMS-485, blocks claim) deep-links via `wq-2` (Walter). Queue has no Elena POC-signature item. Surveyor cannot follow “signature outstanding” as a single owned task with legal package link.

4. **Integrity count inconsistency (false precision)**  
   Checklist: 10 `passed`, 2 `attention`, 1 `blocked`. Banner/stat/timeline advertise **11/13** with green accent. Surveyor cannot trust the numeric integrity meter vs the detailed checklist.

5. **RelatedNav not a continuous survey trail**  
   Chart RelatedNav = directory neighbors; Today omits OASIS/Orders/Billing/Legal; OASIS/Billing/Legal omit reciprocal patient-trail chips. Inspector/Continue-in patches some gaps but Related strip is inconsistent by design domain, not by episode.

6. **Honesty gaps on Billing/Orders primary actions**  
   Export 837, Run claim check, New order, Send reminder, Edit order lack the synthetic/visual-only banner or disabled+footnote pattern used on Work queue / OASIS / Legal. Prototype risk of looking production-actionable.

7. **Notification vs OASIS blocker contradiction**  
   Notifications include “OASIS warning cleared · GG0170 response conflict resolved” while `oas-elena-soc.blocking` still lists `GG0170 confirmation`. Surveyor evidence conflict.

### P2
1. Today NBA checkboxes can strike through blockers with no durable state and no “sample only” note on the checkbox itself (page has no flask banner).
2. Orders screen lacks the flask/synthetic banner present on sibling domain screens.
3. OASIS inspector related set omits Legal evidence PKG-8821 even though Work queue names that package.
4. Slice step labels are non-clickable (Open walkthrough only goes to timeline) — minor navigation polish.
5. Legal RelatedNav includes QAPI/Documents but not OASIS/Billing for SOC defense path.

## What works

- **Elena is a coherent SOC golden path** across clinical data: orders, meds, assessments, documents, claims, timeline, episodes, and PKG-8821.
- **Claim readiness is not faked green:** holds name POC + OASIS; readiness checklist pending; episode `claimStatus: 'Holds · POC + OASIS'`.
- **OASIS lock and Legal seal are correctly gated** with explicit disable reasons and visual-only footnotes.
- **Work queue `wq-1`** is an excellent survey hop: patient + OASIS + billing holds + SOC evidence package in one inspector.
- **Chart timeline + integrity breakdown** give a CMS surveyor a defensible chronological narrative for CoP-style clinical record review (face-to-face, consents, F2F, POC pending, med recon).
- **Billing hold resolution links** to the right *workspaces* (Orders / OASIS) even when RelatedNav is domain-local.
- **Legal evidence** models draft vs sealed vs hold vs hash attention without sealing incomplete SOC packages.
- Prior route UAT: zero pageerrors on sibling redesign routes; titles non-blank.

## Recommended trail fix (product, not executed)

1. Patient-scoped Continue-in everywhere (never hard-code `wq-2` / fallback `wq-3`).
2. Add Elena work-queue item: “CMS-485 physician signature” → `/orders` + related Chart / Billing / PKG-8821.
3. Align integrity `passed` count with checklist enumeration; use warn/bad accent when any blocked/attention on claim path.
4. Chart RelatedNav should use episode-related links (or a dedicated chart route key), not `/patients` directory set.
5. Reciprocal RelatedNav: OASIS ↔ Legal evidence ↔ Billing for SOC defense path.
6. Apply flask banner + visual-only titles to Orders and Billing mutating-looking CTAs.
7. Reconcile GG0170 notification with OASIS blockers.

## Persona quote

> “I can follow Elena’s start-of-care story from the desk through the chart, OASIS, orders, claim holds, and the SOC evidence package — but every time a ‘Continue in’ chip drops me on the wrong patient or a green 11/13 meter disagrees with a blocked plan-of-care signature, I lose confidence that this trail would survive a real survey sample.”
