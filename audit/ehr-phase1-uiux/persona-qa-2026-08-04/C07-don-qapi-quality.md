# C07 — DON — QAPI + quality ownership

- **Routes:** `/qapi`, `/quality`, `/legal-evidence`, `/cms-quality`
- **Base:** http://127.0.0.1:5194/# (HashRouter)
- **Worktree:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1`
- **App path:** `apps/ehr-prototype`
- **Method:** Source review of screen TSX + `workspace.ts` PIP/package sample data + RelatedNav map (live browser fetch to 127.0.0.1 blocked in this agent environment; routes confirmed mounted in `App.tsx`; prior route UAT documents loads for related pageviews)
- **Verdict:** **CONDITIONAL**
- **Summary:** For a Director of Nursing owning QAPI effectiveness, the programme screen correctly surfaces **effectiveness-due** PIPs, accountable **owners**, and a hard “no close on task completion alone” story. Cross-links from QAPI → **Incident packages** (`/legal-evidence`) and Quality ↔ CMS quality are present and sensible. The primary **Open active PIP** CTA is mislabeled: it opens a visual-only *create* drawer instead of focusing an existing active/due PIP, which undercuts the DON’s first action in a survey or monthly QAPI drill.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Routes load / mounted | OK | `App.tsx`: `/quality` → `QualityScreen`, `/qapi` → `QapiProgrammeScreen`, `/cms-quality` → `CmsQualityScreen`, `/legal-evidence` → `LegalEvidenceScreen` |
| Titles / domain kickers | OK | QAPI: “QAPI programme” (Domain QAP); Quality: “Quality & compliance”; CMS: “CMS quality reporting” (HQR); Legal: “Legal evidence packages” (DOC) |
| RelatedNav present | OK | All four routes in `ROUTE_RELATED`; QAPI chips: Quality, **Incident packages**, Competency |
| StatCards / registry + inspector | OK | QAPI: 4 stats + PIP registry + master–detail inspector (Overview / Measures / Effectiveness / Related). Quality: integrity + holds + QAPI focus + compliance checks. CMS & Legal: stats + registry + inspector |
| Filters / search | OK | QAPI: search + status including **Effectiveness due**; CMS: status; Legal: status + purpose (incl. Incident); Quality: no filter (dashboard layout — acceptable) |
| **Effectiveness-due PIPs?** | **OK** | Sample `pip-2` status `effectiveness-due`; StatCard “Effectiveness due” = 1; filter chip; row warn tone; inspector callout “Effectiveness return due · Return date Aug 30 · Closure requires measure evidence — not task checkboxes alone.” `closeDisabledReason` for due: “Return evidence required before sustained closure.” Mark sustained **disabled** |
| **Incident packages link?** | **OK** | QAPI head action **Incident packages** → `/legal-evidence`; RelatedNav label “Incident packages”; `pip-2` related: “Incident packages” → `/legal-evidence`. Legal sample **PKG-8790** Incident evidence (fall) assembled by QAPI desk, on legal hold — supports PIP fall / effectiveness narrative |
| **DON can open active PIP and see owners?** | **PARTIAL** | **Owners visible:** every PIP row shows `Owner · {owner}`; inspector Overview “Owner / Accountable lead”; search includes owner. Active sample `pip-1` owner “QAPI lead”; **DON owns** effectiveness-due `pip-2` (“Fall events · SOC week”). **Open path:** selecting a row loads inspector (default selects `pip-1`). **Gap:** primary CTA **Open active PIP** opens a *Create PIP* drawer (“Review-only · nothing is opened or filed”) — does **not** select/focus an existing active PIP |
| Honesty: incomplete ≠ complete | OK | Mark sustained disabled for active & effectiveness-due with footnote; sustained/closed only when status already sustained; banners: no PIP opened/closed/marked effective; CMS submit gated; Legal seal/hold visual-only |
| Sign / close / submit visual-only | OK | QAPI Mark sustained / Create PIP disabled + footnotes; Quality Export QAPI packet “Preview only”; CMS Submit / Run completeness; Legal seal/hold/export |
| Cross-links Quality ↔ QAPI ↔ CMS ↔ Legal | OK | Quality head + Continue in → QAPI, CMS, Legal; QAPI → Quality desk + Incident packages; CMS related → QAPI + Quality desk; Legal RelatedNav → QAPI |

## Route notes

### `/qapi` — QapiProgrammeScreen (primary DON surface)
- **Story:** PIPs, RCA, CAP, effectiveness return — “no closure on task completion alone.”
- **Sample PIPs (`QAPI_PIPS`):**
  | ID | Title | Owner | Status | Return | Related |
  |----|-------|-------|--------|--------|---------|
  | pip-1 | Hospitalization · HF cohort | QAPI lead | active | Sep 15 | Quality, CMS quality, Reports |
  | pip-2 | Fall events · SOC week | **DON** | **effectiveness-due** | Aug 30 | **Incident packages**, Emergency, In-service |
  | pip-3 | Missed-visit communication | Ops director | sustained | Closed | Field visits, Messages, Work queue |
- Stats: PIPs in sample (3), Active (1), Effectiveness due (1), Sustained/closed (1).
- Inspector tabs teach measure snapshots + effectiveness checklist (return date, countermeasure, status/not sustained yet).
- Synthetic banner + Create PIP disabled — production write posture is honest.
- **UX defect for DON:** primary **Open active PIP** ≠ open existing active work; it is a create-layout drawer. DON must discover that “open” means **click the registry row**.

### `/quality` — QualityScreen
- Survey-ready posture dashboard: record integrity (worst-first), claim holds, infection MTD, QAPI focus sparklines with named owners (Dana / Taylor / QAPI committee).
- Head actions: QAPI programme, Legal evidence, Export QAPI packet (preview drawer only).
- Continue-in under QAPI focus: QAPI programme, CMS quality, Evidence (+ related from first PIP).
- **Gaps for quality ownership:** focus rows are not deep-linked to specific PIPs; screen lacks the FlaskConical “synthetic prototype” banner used on QAPI/CMS/Legal; “Export QAPI packet” is preview-only but the primary control is not disabled (drawer clarifies).

### `/legal-evidence` — LegalEvidenceScreen (incident package destination)
- **PKG-8790** Incident evidence package: fall without injury, **on-hold**, assembled by **QAPI desk**, hold owner counsel/privacy, completeness 100%, disposition blocked — matches QAPI fall PIP / incident package story.
- Purpose filter includes **Incident**; RelatedNav includes QAPI.
- Honesty banner + seal gates (hold, hash, signatures, completeness) remain survey-defensible.

### `/cms-quality` — CmsQualityScreen
- HHQRP completeness, submission, rejection repair, HHVBP, HHCAHPS exemption — owners on every work row (OASIS coordinator, Quality desk, Clinical QA, Compliance).
- Related tab + RelatedNav to QAPI and Quality desk; Submit blocked when rejected/closed.
- Supports DON quality ownership by linking measure ops back into QAPI programme, not as a substitute for effectiveness return.

## Findings

### P0
_None._ No silent PIP closure; effectiveness-due is labeled; incident package path exists; owners are visible on PIPs.

### P1
1. **“Open active PIP” does not open an active PIP**  
   - **Where:** `/qapi` primary screen action + `Drawer` title “Open active PIP” (`QapiProgrammeScreen.tsx` ~lines 143–146, 484–505).  
   - **Behavior:** Opens a create-layout drawer; primary control is **Create PIP** (disabled, visual-only). Does not select `status === 'active'` (or effectiveness-due) rows or jump the inspector to that PIP.  
   - **Why it matters (DON):** In a monthly QAPI or survey walkthrough, the DON expects the primary CTA to land on an in-flight PIP with owner, baseline, countermeasure, and return date. The label implies open-existing; the UI is open-new.  
   - **Expected (prototype):** Either (a) rename to “New PIP (preview)” / “Draft PIP layout”, or (b) on click, select first active (or effectiveness-due) PIP in the registry and focus the inspector — keep Create as a secondary disabled control.

### P2
1. **Quality desk QAPI focus areas are display-only** — no click-through to `/qapi` filtered by PIP or to the matching effectiveness-due fall work. DON must leave the dashboard and re-find work.  
2. **`/quality` lacks the synthetic honesty banner** present on QAPI, CMS quality, and Legal evidence (only export drawer says preview-only).  
3. **Effectiveness tab checklist** uses success check icons for all lines including “not sustained yet” — mild visual risk of reading incomplete effectiveness as complete; prefer open/warn icons until status is sustained.  
4. **No “My PIPs / DON-owned” filter** — owners are searchable (“DON”) but not one-click for role-scoped ownership review.  
5. **Quality ↔ PIP data split** — `QAPI_FOCUS` (falls without injury) and `pip-2` (Fall events · SOC week) are thematically aligned but not the same object IDs; prototype coherence would improve with one linked entity.

## What works
- **Effectiveness-due as a first-class status** with stats, filter, row tone, inspector callout, and hard-disabled Mark sustained until return evidence — matches CoP QAPI effectiveness spirit for a UX prototype.
- **Accountable owners on every PIP** (including DON on the due PIP) plus owner in search haystack.
- **Incident packages cross-link** from QAPI head, RelatedNav, and PIP-related actions into Legal evidence with a coherent fall/hold sample package (PKG-8790).
- **Close gates are honest:** active = effectiveness not yet due; effectiveness-due = return evidence required; sustained sample only when already sustained.
- **Quality desk** surfaces integrity blockers and claim holds with navigation into patient charts; continues into QAPI / CMS / Legal.
- **CMS quality** keeps submission/rejection ownership separate from PIP effectiveness and still links back to QAPI.
- Synthetic / no durable write framing on QAPI, CMS, and Legal reduces false completeness risk.

## Persona quote
> “I can see my fall PIP is effectiveness-due and that incident packages sit one click away — just make ‘Open active PIP’ actually open *my* active work with the owner on the face of the card, not a create drawer I’ll never use in a survey drill.”

## Trace (code anchors)

| Area | Path |
|------|------|
| Routes | `apps/ehr-prototype/src/App.tsx` |
| QAPI programme UI + close gates | `apps/ehr-prototype/src/screens/QapiProgrammeScreen.tsx` (`closeDisabledReason`, Open active PIP drawer, inspector) |
| PIP sample data | `apps/ehr-prototype/src/data/workspace.ts` (`QapiPip`, `QAPI_PIPS`) |
| RelatedNav map | `apps/ehr-prototype/src/data/workspace.ts` (`ROUTE_RELATED` for `/qapi`, `/quality`, `/cms-quality`, `/legal-evidence`) |
| Quality desk | `apps/ehr-prototype/src/screens/QualityScreen.tsx` |
| CMS quality | `apps/ehr-prototype/src/screens/CmsQualityScreen.tsx` |
| Legal evidence + incident PKG-8790 | `apps/ehr-prototype/src/screens/LegalEvidenceScreen.tsx` |
| Nav / command palette | `apps/ehr-prototype/src/data/navigation.ts`, `shell/CommandPalette.tsx` |

## Sign-off
- **Agent:** C07 Persona QA (DON · QAPI + quality ownership)
- **Mode:** Report-only — no app source changes
- **Date:** 2026-08-04
