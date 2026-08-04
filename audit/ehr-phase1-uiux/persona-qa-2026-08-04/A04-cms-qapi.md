# A04 — CMS Surveyor — QAPI programme
- Routes: `/qapi`, `/quality`, `/cms-quality` (HashRouter base `http://127.0.0.1:5194/#`)
- Worktree: `ehr_phase1` · App: `apps/ehr-prototype`
- Method: Source + data review (Vite confirmed on 5194; localhost browser fetch blocked from agent sandbox). Screens: `QapiProgrammeScreen.tsx`, `QualityScreen.tsx`, `CmsQualityScreen.tsx`; data: `workspace.ts` `QAPI_PIPS` / `ROUTE_RELATED`; reverse evidence: `LegalEvidenceScreen.tsx`.
- Verdict: **CONDITIONAL**
- Summary: The dedicated QAPI programme screen correctly frames PIPs as a closed-loop programme (baseline → countermeasure → effectiveness return), not a task checklist. Effectiveness-due is highly visible, Mark sustained is blocked with honest footnotes, and incident legal-evidence cross-links exist for the fall PIP and desk-level navigation. Gaps that keep this from PASS for a surveyor: effectiveness checklist always paints green checkmarks even when not sustained, sample data never demonstrates a true `closed` vs `sustained` distinction, RCA/CAP are disclaimer-only (not inspectable artefacts), and related links land on the legal-evidence workspace without package deep-links (e.g. PKG-8790).

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Route `/qapi` loads | OK | `App.tsx` → `QapiProgrammeScreen`; nav domain QAP “built”; title “QAPI programme”; synthetic banner present |
| Route `/quality` loads | OK | Quality & compliance desk; RelatedNav → QAPI / CMS quality / Evidence; continues into programme |
| Route `/cms-quality` loads | OK | HHQRP / HHVBP / HHCAHPS posture; RelatedNav → OASIS / Exports / QAPI |
| RelatedNav present | OK | `/qapi` → Quality, Incident packages, Competency; `/quality` → QAPI, CMS quality, Evidence; `/cms-quality` → OASIS, Exports, QAPI |
| StatCards | OK | QAPI: PIPs in sample, Active, Effectiveness due, Sustained/closed. Quality: integrity / OASIS / holds / infection. CMS quality: completeness / rejected / on-track / OASIS open |
| Filters + inspector | OK | Status filters + search on `/qapi` and `/cms-quality`; inspector tabs Overview / Measures / Effectiveness / Related |
| PIPs have baseline | OK | List meta “Baseline · …”; inspector grid field Baseline = problem magnitude; sample 22.4% / 6 events / 4.1% |
| PIPs have countermeasure | OK | Inspector Countermeasure; search covers countermeasure text; sample After-hours pathway / Home safety kit / Call-tree drill |
| PIPs have return | OK | `returnDate` on list (“Return · …”) and inspector “Return · Effectiveness check”; callout for due PIPs cites return date |
| Effectiveness-due visible | OK | Status type + chip (warn), dedicated filter, StatCard kicker “Effectiveness due”, warn callout on overview for pip-2 |
| Sustained vs closed | **PARTIAL** | Type + filter chips for both; Mark sustained disabled with status-aware reasons; **sample has `sustained` only, no `closed` row**; StatCard merges “Sustained / closed” |
| No close on task completion alone | OK | Subtitle + banner + `closeDisabledReason()`: active “Effectiveness return not yet due — cannot close on task completion alone”; effectiveness-due “Return evidence required before sustained closure”; Create PIP disabled |
| Links to incident legal evidence | **PARTIAL** | Header “Incident packages” → `/legal-evidence`; RelatedNav; pip-2 related “Incident packages”; Quality desk continue-in. **No deep-link to PKG-8790** (fall incident package assembled by QAPI desk). pip-1/pip-3 do not surface incident evidence (acceptable for non-incident PIPs) |
| Programme depth (RCA / CAP / GB minutes) | **FAIL (prototype depth)** | Explicit copy: “does not write RCA, CAP, or governing-body minutes.” Surveyor cannot inspect RCA tree or CAP artefacts in UI — only narrative disclaimer |
| Honesty (incomplete ≠ complete) | **PARTIAL** | Primary actions disabled with footnotes (good). Effectiveness tab uses green CheckCircle2 for all three checklist lines regardless of status (can read as “complete” for active/due PIPs) |
| Cross-link Quality ↔ QAPI ↔ CMS quality | OK | Bidirectional buttons/RelatedNav; CMS related includes QAPI + Quality desk; Quality focus “Continue in” includes QAPI programme + CMS quality |
| Alignment to QAP-004 (requirements) | CONDITIONAL | QAP-004 acceptance: “No corrective action closes on task completion alone; a dated effectiveness decision and evidence are required.” UX encodes the rule; full problem statement / root cause / outcome measures / closure approval chain remain incomplete as inspectable fields |

## Findings

### P0
- None for prototype honesty on hard actions (Mark sustained / Create PIP disabled; synthetic banners). No false sealed/submitted QAPI record.

### P1
1. **Effectiveness checklist false-complete affordance** (`QapiProgrammeScreen` Effectiveness tab)  
   All three items always render with `CheckCircle2` (green success icon), including “Status · Active · not sustained yet.” A surveyor scanning for effectiveness evidence may misread the row as already proven. Prefer status-aware icons (pending/warn vs good) or open/unchecked markers until `sustained`/`closed`.

2. **RCA / CAP not inspectable as programme artefacts**  
   Screen headline promises “PIPs, RCA, CAP, and effectiveness return,” but inspector has no RCA root-cause tree, CAP steps, owner deadlines beyond return date, or governing-body linkage—only a disclaimer that the prototype does not write them. For CoP §484.65-style survey walkthrough, this is a major programme-depth gap (acceptable as prototype limit only if product leadership treats QAPI as shell-not-evidence).

3. **Incident evidence link is workspace-level, not package-level**  
   Fall events PIP (pip-2, effectiveness-due) correctly points to `/legal-evidence`, and PKG-8790 is an incident package assembled by “QAPI desk” with hold + hash trail. No PIP row or related button opens PKG-8790 (or any package id). Surveyor path is “go find it,” not “trace signal → package.”

4. **Quality desk “QAPI focus areas” do not join the PIP registry**  
   Medication reconciliation / OASIS accuracy / Falls MTD sparklines sit beside claim integrity but do not navigate to `/qapi` PIP rows or show baseline/countermeasure/return. Focus areas read as KPI tiles, not programme projects—risk that survey posture looks like metrics-without-PIPs if user stops on `/quality` alone.

### P2
1. **Sustained vs closed blurred in sample**  
   Filter offers Closed; data has zero `closed` PIPs. StatCard label “Sustained / closed” collapses a useful survey distinction (sustained-with-proof vs administratively closed/abandoned). Add one closed (or abandoned-after-effectiveness) sample with different chip tone.

2. **`returnDate: 'Closed'` on sustained PIP**  
   pip-3 uses the string “Closed” as return date, mixing calendar return with lifecycle status. Prefer an actual return date + separate sustained decision date.

3. **Progress % on list rows can over-claim**  
   pip-3 shows 100% with Sustained (OK). Active HF PIP at 45% is fine. Effectiveness-due at 70% with green-ish progress is slightly optimistic without outcome decision—consider warn color until sustained.

4. **CMS quality RelatedNav omits legal evidence / Quality desk**  
   Related is OASIS / Exports / QAPI only. Inspector Related adds Quality desk. Minor: surveyor may want Evidence from HQR when rejection repair intersects incident.

5. **Export QAPI packet on `/quality`**  
   Drawer is preview-only (honest subcopy). No disabled primary “Transmit” control—lower risk than Mark sustained, but still slightly less explicit than QAPI’s disabled Create/Mark pattern.

## What works
- **Programme framing, not task board:** Subtitle and banner state the CoP-aligned rule explicitly; disabled Mark sustained reasons encode “not yet due” vs “return evidence required.”
- **Data model for survey walkthrough:** `QapiPip` carries baseline, countermeasure, returnDate, and status enum `active | effectiveness-due | sustained | closed` (`workspace.ts`).
- **Effectiveness-due is operationally visible:** warn chip, filter, StatCard count, and overview callout with return date.
- **Measure snapshots:** Measures tab shows baseline / current / target with progress—enough for a design conversation about outcome vs process measures.
- **Cross-workspace graph:** Quality ↔ QAPI ↔ CMS quality ↔ Legal evidence ↔ Competency (for countermeasure training) is wired via RelatedNav and inspector Related.
- **Legal evidence reverse story:** PKG-8790 (incident, QAPI desk, legal hold) and PKG-8688 (survey set with “PIP excerpt · HF cohort”) support bidirectional narrative even without deep-links.
- **CMS quality honesty:** Submit to CMS / Execute run disabled with footnotes; rejected repair path visible—complements QAPI as HQR reporting, not a substitute for PIPs.

## Persona quote
> I can walk the closed loop on your QAPI board—baseline, countermeasure, return date, effectiveness-due—and I see you won’t let staff mark sustained on tasks alone; what I still need for survey is the RCA/CAP paper trail, a clear sustained-versus-closed story, and one click from the fall PIP into the held incident package.

## Evidence pointers (absolute)

| Artefact | Path |
|----------|------|
| QAPI screen | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\QapiProgrammeScreen.tsx` |
| Quality desk | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\QualityScreen.tsx` |
| CMS quality | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\CmsQualityScreen.tsx` |
| PIP data + Related | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\data\workspace.ts` (`QAPI_PIPS`, `ROUTE_RELATED`) |
| QAP-004 requirement | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\data\requirementsSpec.ts` |
| Incident package PKG-8790 | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\LegalEvidenceScreen.tsx` |
| Routes | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\App.tsx` |

## Live URLs (HashRouter)
- `http://127.0.0.1:5194/#/qapi`
- `http://127.0.0.1:5194/#/quality`
- `http://127.0.0.1:5194/#/cms-quality`
- Cross-check: `http://127.0.0.1:5194/#/legal-evidence` (incident + survey packages)

## Suggested fix priority (report-only; not implemented)
1. Status-aware icons on Effectiveness checklist (P1).
2. Deep-link pip-2 → `/legal-evidence` with package focus (PKG-8790) if route supports selection (P1).
3. Add minimal RCA/CAP panel fields on inspector even if synthetic (P1 programme depth).
4. Sample `closed` PIP + split StatCard labels (P2).
5. Wire Quality focus “Falls without injury” → pip-2 (P1/P2).
