# A03 — CMS Surveyor — OASIS & episode/certification honesty

- Routes: `/oasis`, `/episodes`, `/cms-quality`, `/billing` (plus export path `/data-exports`)
- Verdict: **CONDITIONAL**
- Summary: Incomplete OASIS packages do not present as locked, exported, or claim-ready; lock is blocked on completeness and blockers; episode and billing claim holds surface with OASIS/POC reasons and resolution jumps. HHQRP/export pathways are present and labeled as non-submitting prototypes. Condition is driven by **Billing** primary actions (`Export 837`, `Run claim check`) that still look fully armed without the visual-only / disabled / footnote pattern used on OASIS and CMS quality — a survey-demo honesty gap, not a false clinical completeness claim.

**Method:** Live app base `http://127.0.0.1:5194` (Vite on 5194 reported ready). SPA content reviewed from `apps/ehr-prototype` screen TSX + shared workspace/clinical data (browser DOM fetch of hash routes not usable for body content). Report-only; no app source changes.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Load success · `/oasis` | OK | `OasisAssessmentsScreen` routed in `App.tsx`; title **OASIS assessments**; domain kicker EPI; synthetic banner; RelatedNav; 4 StatCards; status + time-point filters; registry + inspector |
| Load success · `/episodes` | OK | `EpisodesScreen`; title **Episodes & certification**; RelatedNav; StatCards; status filters; registry + inspector |
| Load success · `/cms-quality` | OK | `CmsQualityScreen`; title **CMS quality reporting**; RelatedNav; StatCards; filters; inspector tabs (Overview / Cohort·OASIS / CMS response / Related); completeness drawer |
| Load success · `/billing` | OK | `BillingScreen`; title **Billing**; RelatedNav; StatCards; claims table + drawer; **no** FlaskConical prototype banner (unlike the other three) |
| Incomplete OASIS % honest? | OK | Sample: Elena SOC **82%** `in-progress` + 3 blockers; Dorothy Recert **0%** `due-soon` + blockers; June SOC **100%** `exported` / no blockers. List shows % + ProgressBar (warn when blockers). Status chips never show incomplete as Locked/Exported. HHQRP **96.2%** labeled sample numerator / not production cert |
| Lock blocked when incomplete? | OK | `lockDisabledReason`: blocks if already locked/exported, `completion < 100`, or `blocking.length > 0`. **Lock package** `disabled` + title + foot: e.g. “Completeness must reach 100% before lock.” Even when eligible path is open, title is “Visual only · nothing is locked” |
| Episode claim holds visible? | OK | Registry meta + inspector **Claim status**: Elena `Holds · POC + OASIS`; Dorothy `Final holds · recert POC`; Walter `NOA submitted`; Harold `Not started`. Billing table/drawer itemizes holds (`OASIS not finalized`, `POC signature outstanding`, etc.) with resolve links |
| QRP / export path? | OK | `/cms-quality`: HHQRP completeness, July file Accepted, rejection repair, HHVBP, HHCAHPS; **Submit to CMS** gated; **Export prep** / Related → `/data-exports`; OASIS → Validation report → `/cms-quality`; exported OASIS → Vendor file; DEX-155 `iQIES quality extract` failed+labeled |
| Cross-links work? | OK | RelatedNav maps: oasis↔episodes↔billing↔cms-quality; cms-quality→data-exports; episode Continue in OASIS/Orders/Billing; OASIS Continue in Episode/QRP/Claims; billing → OASIS/Orders/Auth. All targets registered in `App.tsx` |
| Sign / seal / submit honesty | COND | OASIS lock, CMS Submit/Execute run, data-export Run export: disabled or visual-only + footnotes. **Billing** `Export 837` / `Run claim check` are enabled-looking primary/secondary with no title/footnote/disable (P1) |
| Incomplete never looks complete | OK | No incomplete OASIS marked locked/exported; claims with OASIS/POC issues status `holds` not `claim-ready`; claim-ready rows have empty holds |

## Findings

### P0

- None. No incomplete OASIS package is presented as locked, exported, or claim-ready; lock and CMS submit controls are blocked or explicitly non-durable.

### P1

1. **Billing primary actions lack prototype honesty chrome**  
   File: `apps/ehr-prototype/src/screens/BillingScreen.tsx`  
   `Export 837` and `Run claim check` render as normal active buttons without `disabled`, without “visual only” titles, and without the FlaskConical synthetic banner used on `/oasis`, `/episodes`, `/cms-quality`, and `/data-exports`. A survey walkthrough can read these as live revenue actions. Align with OASIS/HQR pattern (banner + title/disabled + footnote).

2. **Episode holds are free-text, not structured like Billing**  
   File: `EpisodesScreen.tsx` + `EPISODES` in `workspace.ts`  
   Surveyors see claim status strings, but not itemized hold reasons with “Resolve in OASIS/Orders” deep-links on the episode inspector. Billing drawer does this well (`holdResolution`). For certification honesty, episode inspector should surface the same hold list (or always open billing with holds expanded) so CoP/RCM readiness is one click without decoding a label.

### P2

1. **OASIS nav badge `7` not bound to registry counts**  
   `navigation.ts` badge `7` vs `OASIS_RECORDS` length 3 (2 open). Chart integrity text mentions “7 items need clinician confirmation” for Elena — likely item-level — but the nav chip is unlabeled. Risk: reading “7 incomplete assessments.” Bind badge to open assessments or rename/tool-tip as items.

2. **Billing missing synthetic prototype banner**  
   Only revenue screen among the four without explicit “no durable write / synthetic” status strip.

3. **OASIS inspector completeness bar vs list**  
   List ProgressBar uses warn when blockers present; inspector completeness bar stays teal unless 100%. Minor visual consistency for incomplete honesty.

4. **No aggregate “incomplete %” KPI on OASIS**  
   Screen uses counts (In progress / Due soon / With blockers / Locked·exported) and per-row %. Fine for prototype; surveyors often ask for incomplete share — optional derived % would match HHQRP language without inventing production thresholds.

## What works

- **Lock honesty is survey-credible for a prototype:** incomplete packages cannot “Lock package”; reasons are human-readable (completeness, blockers, already sealed).
- **Blocking items are explicit** (GG0170, meds, visit not started, prior-period export check) — incomplete work is named, not a vague yellow chip alone.
- **Status never color-alone:** `StatusChip` + labels + % + blockers on OASIS; claim status chips on billing.
- **Claim ↔ OASIS story is consistent:** Elena OASIS 82% / not finalized ↔ claim holds `OASIS not finalized` + `POC signature outstanding` ↔ episode `Holds · POC + OASIS`; June 100% exported ↔ paid RAP/NOA.
- **HHQRP path is walkable:** CMS quality registry → OASIS cohort tab listing all sample packages → Data exports / iQIES extract failure labeled, not silent success.
- **Cross-nav is wired:** Related strips and Continue-in actions connect EPI (episodes/OASIS), HQR (cms-quality), RCM (billing), DAT (exports) without dead routes.
- **Certification controls on episodes** are footnoted visual-only; **Open cert period** disabled for `pending-soc` (“SOC not started”).

## Evidence anchors (code)

```47:52:apps/ehr-prototype/src/screens/OasisAssessmentsScreen.tsx
function lockDisabledReason(rec: OasisRecord): string | null {
  if (rec.status === 'locked' || rec.status === 'exported') return 'Already locked or exported in this sample.'
  if (rec.completion < 100) return 'Completeness must reach 100% before lock.'
  if (rec.blocking.length > 0) return 'Blocking items must clear before lock.'
  return null
}
```

```314:357:apps/ehr-prototype/src/data/workspace.ts
export const OASIS_RECORDS: OasisRecord[] = [
  { id: 'oas-elena-soc', /* … */ completion: 82, status: 'in-progress',
    blocking: ['GG0170 confirmation', 'Medication items', 'Lock not available'], /* … */ },
  { id: 'oas-dorothy-recert', /* … */ completion: 0, status: 'due-soon',
    blocking: ['Visit not started', 'Prior period export check'], /* … */ },
  { id: 'oas-june-soc', /* … */ completion: 100, status: 'exported', blocking: [], /* … */ },
]
```

```96:99:apps/ehr-prototype/src/data/clinical.ts
export const claims: Claim[] = [
  // …
  { id: 'clm-2', patientId: 'pt-elena', /* … */ status: 'holds',
    holds: ['POC signature outstanding', 'OASIS not finalized'] },
```

```132:137:apps/ehr-prototype/src/screens/CmsQualityScreen.tsx
function submitDisabledReason(w: QualityWork): string | null {
  if (w.status === 'closed') return 'Already closed / accepted in this sample.'
  if (w.status === 'rejected') return 'Repair the rejected assessment before resubmit.'
  if (w.kind === 'hhcahps') return 'HHCAHPS determination is on file — not a file submission.'
  return null
}
```

## Persona quote

> Incomplete OASIS is not dressed up as locked or claim-ready here — keep it that way, and put the same “this does not submit” discipline on Billing’s Export 837 / claim-check buttons so a survey demo never implies a live CMS or MAC transaction.
