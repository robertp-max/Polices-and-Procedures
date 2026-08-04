# A07 — CMS Surveyor — Personnel competency & aide supervision

- **Routes:** `/competency`, `/aide-supervision`, `/field-visits`
- **Base:** `http://127.0.0.1:5194/#` (HashRouter) · worktree `ehr_phase1` · app `apps/ehr-prototype`
- **Method:** Live localhost fetch blocked by agent network policy; full static review of screen TSX/CSS, `App.tsx` routes, `navigation.ts`, `workspace.ts` RelatedNav, and synthetic sample data (per `00-RUBRIC.md`). Vite log confirms prior bind on **5194**.
- **Verdict:** **CONDITIONAL**
- **Summary:** Overdue aide supervision and competency gaps are **not greenwashed** — bad-tone chips, overdue StatCards, siren/callout patterns, and blocked gates make noncompliance visible. Bidirectional links between competency and aide supervision exist at screen and RelatedNav level. Gaps for a survey-readiness prototype: the highest-risk sample aide (Sam Ortiz) has concurrent overdue supervision **and** overdue competency but the overdue supervision inspector omits a Competency deep-link; “Record evidence” is disabled when the gate is blocked (circular remediation path); and field-visits does not surface competency readiness. No false complete/sign/seal behavior was found.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Routes load (registered) | OK | `App.tsx` mounts `/competency` → `CompetencyScreen`, `/aide-supervision` → `AideSupervisionScreen`, `/field-visits` → `FieldVisitsScreen` |
| Titles / domain kickers | OK | QAP competency & in-service; HHA aide supervision; FLD field visits & EVV |
| RelatedNav present | OK | Competency → Aide supervision, QAPI, Emergency prep; Aide supervision → Field visits, Competency, Schedule; Field visits → Schedule, Aide supervision, Work queue |
| StatCards surface risk | OK | Overdue counts use `accent="bad"` when &gt; 0 on both competency and aide supervision; due-soon warn accents |
| Overdue supervision visible? | OK | Sample `hha-3` status `overdue`, `StatusChip` tone `bad`, row icon `is-overdue` + siren, list text “4d overdue” (`hha-due-bad`), inspector **Supervision overdue** callout, Overdue filter, Overdue StatCard = 1 |
| Competency gaps not greenwashed? | OK | `cmp-2` Sam Ortiz: status Overdue (bad), gate Blocked (bad), evidence “Missing”, overview callout **Assignment blocked**; remediation uses warn not good; complete only for finished sample |
| Links aide supervision ↔ competency | CONDITIONAL | Header + RelatedNav + inspector “Supervision clocks” / Competency CTAs bidirectional; per-row **Continue in** includes Competency for some clocks but **not** overdue `hha-3` (Sam Ortiz) |
| Field visits ↔ supervision | OK | RelatedNav + inspector Continue in → Aide supervision |
| Field visits ↔ competency | FAIL (affordance) | No RelatedNav/header/inspector link to `/competency`; only via aide-supervision hop |
| Honesty (no false complete write) | OK | Synthetic banners; schedule/observe/assign/complete disabled or titled visual-only; Confirm assignment disabled; footnotes state no durable write |
| Filters / inspector | OK | Status (+ clock kind on HHA); registry + inspector pattern consistent across three routes |
| Command palette reachability | P2 | Palette lists Field visits; **omits** Aide supervision and Competency destinations |
| Regulatory clock model (prototype) | OK | Skilled 14-day / non-skilled 60-day clocks align with §484.80(h) supervisory visit cadence framing; annual aide observation not modeled as a distinct clock type |

## Findings

### P0

_None._ No silent legal/sign action; incomplete work is not presented as complete; overdue risk is visually escalated.

### P1

1. **Circular “Record evidence” when gate is blocked** (`CompetencyScreen.tsx`)  
   - `assignDisabledReason` returns a block when `gate === 'blocked'` (overdue missing evidence).  
   - Primary inspector action is labeled **Record evidence** but uses that same disable rule, so the overdue/blocked row cannot open the evidence path with reason *“Gate blocked until overdue competency evidence is captured.”*  
   - **Survey impact:** Remediation path looks self-locked; a surveyor would ask how the agency clears the CoP gap if the only capture control is disabled.  
   - **Fix direction:** Disable **new field assignment** on blocked, but keep **Record evidence** / observation capture enabled (visual-only still OK).

2. **Highest-risk aide lacks supervision→competency row link**  
   - Sam Ortiz appears on overdue non-skilled clock `hha-3` (Raymond) **and** overdue competency `cmp-2` (infection prevention, gate blocked).  
   - `hha-3.related` = Field visits, Work queue, QAPI, Schedule — **no Competency**.  
   - Contrast: due-soon/on-track/observed clocks for Priya/June do include Competency.  
   - **Survey impact:** Concurrent personnel-file and onsite-supervision failures for the same aide should be one hop, not a scavenger hunt.

3. **No person-level multi-risk join across domains**  
   - Prototype keeps separate registries (staff requirements vs patient supervision clocks).  
   - No “this aide has overdue competency **and** overdue supervision” banner, staff dossier, or cross-filter.  
   - **Survey impact:** CMS personnel-file review often starts with one aide and asks for both competency eval/in-service **and** supervisory/observation evidence; the UX does not yet simulate that single-aide packet view.

### P2

1. **“Due ≤7 days” StatCard includes already-overdue clocks** (`AideSupervisionScreen`: `status === 'due-soon' \|\| daysRemaining <= 7`). Overdue `daysRemaining: -4` counts toward due-soon, inflating the warn card with closed windows.
2. **“Clock rules” secondary action navigates to `/competency`** — label implies supervision interval policy; destination is workforce competency. Misleading cross-link copy.
3. **Command palette** missing Aide supervision / Competency while main nav lists both under Care delivery / Quality & compliance.
4. **Competency evidence tab** lists module names only; no observer identity, form version, pass/fail, or date pins (acceptable prototype honesty, but thin for survey-demo evidence story).
5. **No explicit 42 CFR §484.80 / §484.80(h) citation** on screens (policy IDs HHA-002/HHA-003 mentioned in banner only).
6. **Annual direct observation of aide with patient** (skilled-patient annual observation vs 14-day supervisory visit without aide always present) collapsed into generic “last observation” — fine for design, not CoP-complete.

## What works

- **Overdue supervision is survey-visible:** bad StatusChip, overdue StatCard, siren row treatment, red “Xd overdue” text, inspector callout with escalate/document exception language, dedicated Overdue filter.
- **Competency gaps are not greenwashed:** overdue + blocked dual chips; evidence “Missing”; assignment-blocked callout; remediation warn path for failed observation (Marcus Webb PT); complete reserved for actual complete sample (Dana drill).
- **Assignment honesty:** drawer Confirm disabled; footnotes and flask banners state synthetic/no durable write; schedule supervision disabled when recent observation already recorded.
- **Cross-workspace wiring:** Competency ↔ Aide supervision at header, RelatedNav, and inspector; Field visits ↔ Aide supervision; Aide supervision ↔ Field visits / Schedule / (often) Competency.
- **Clock types** skilled-14 vs non-skilled-60 match common survey language for HHA supervisory visit cadence.
- **Gate model** (clear / assignment watch / blocked) communicates field eligibility impact without pretending production schedule mutation.

## Persona quote

> I can already see who is overdue for aide supervision and who is blocked on competency — just connect the same aide’s open gaps in one place and stop disabling the very control that should capture the missing evidence.

## Route notes (CMS lens)

### `/aide-supervision` (HHA)

| Element | Observation |
|---------|-------------|
| Sample set | 5 clocks; 1 overdue (`hha-3` Sam Ortiz / pt-raymond / non-skilled-60 / last obs Jun 12 / −4d) |
| Due soon | `hha-1` Priya / Elena / skilled-14 / Wed / 3d |
| Observed | `hha-5` marked observed with “aide present” — good survey language for observation vs mere supervisory visit |
| Escalation | Overdue callout + QAPI in related for overdue row |

### `/competency` (QAP)

| Element | Observation |
|---------|-------------|
| Sample set | 5 staff requirements; HHA×2, RN, PT, RN·CM |
| Overdue | Sam Ortiz HHA in-service infection prevention — blocked |
| Due soon | Priya annual competency · observation pending |
| Remediation | Marcus PT failed observation — assignment watch (not falsely “clear”) |
| Cross-link | Strong to aide supervision; also QAPI / emergency |

### `/field-visits` (FLD)

| Element | Observation |
|---------|-------------|
| Role | Visit/EVV operations; Continue in includes Aide supervision |
| Competency | Not linked; surveyor must leave field domain via supervision or nav |
| Honesty | Complete visit disabled for completed/missed; EVV labels visual-only |

## Verdict rationale

**CONDITIONAL** (not FAIL): primary persona questions — *are overdue supervisions visible?* and *are competency gaps greenwashed?* — answer **yes** and **no** respectively, with honest prototype disclaimers. **Not PASS** because person-level multi-failure linkage is incomplete on the worst sample row and the blocked-gate disable logic breaks the evidence-capture story a surveyor would demand to clear a citation.

## Source files reviewed

- `apps/ehr-prototype/src/screens/CompetencyScreen.tsx`
- `apps/ehr-prototype/src/screens/AideSupervisionScreen.tsx`
- `apps/ehr-prototype/src/screens/FieldVisitsScreen.tsx`
- `apps/ehr-prototype/src/screens/cmp.css`, `hha.css`, `fld.css` (status/overdue styles)
- `apps/ehr-prototype/src/App.tsx`
- `apps/ehr-prototype/src/data/navigation.ts`
- `apps/ehr-prototype/src/data/workspace.ts` (`ROUTE_RELATED`)
- `apps/ehr-prototype/src/shell/CommandPalette.tsx`
- `apps/ehr-prototype/src/components/RelatedNav.tsx`
