# B06 — Administrator — Reports & data exports / PHI boundary

- **Routes:** `/reports`, `/data-exports`, `/cms-quality`, `/legal-evidence`
- **Base:** http://127.0.0.1:5194/# (HashRouter)
- **Worktree:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1`
- **App path:** `apps/ehr-prototype`
- **Method:** Source review of screen TSX + `workspace.ts` sample data + RelatedNav map (live browser fetch to 127.0.0.1 blocked in this agent environment; routes confirmed mounted in `App.tsx`)
- **Verdict:** **CONDITIONAL**
- **Summary:** Data & exports and Legal evidence clearly model PHI boundaries, stale/failed labels, and dual-control full-PHI gating for an Administrator. CMS quality links cleanly into QAPI/OASIS/exports with rejection honesty. Reports is useful operational intelligence with QAPI/CMS cross-links, but it under-states that scorecards are **not** the legal clinical record and lacks the same freshness/lineage honesty as the export registry. Prototype controls that claim write/export/submit are generally disabled or footnoted as visual-only.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Routes load / mounted | OK | `App.tsx`: `/reports` → `ReportsScreen`, `/data-exports` → `DataExportsScreen`, `/cms-quality` → `CmsQualityScreen`, `/legal-evidence` → `LegalEvidenceScreen` |
| Titles / domain kickers | OK | Reports: “Reports”; DEX: “Data, analytics & exports” (DAT); HQR: “CMS quality reporting”; DOC: “Legal evidence packages” |
| RelatedNav present | OK | All four routes have `RelatedNav` entries in `ROUTE_RELATED` |
| StatCards / registry + inspector | OK | DEX, CMS quality, Legal evidence: stats + list + inspector. Reports: scorecard KPIs + report grid + drawers |
| Filters / search | OK | DEX status + PHI boundary; CMS status; Legal status + purpose. Reports: no filters (card catalog is fine for prototype) |
| **Stale / failed export labeled?** | OK | DEX: `StatusChip` Current/Stale/Failed/Running; row icon variants; inspector callouts; StatCards “Stale views” / “Failed jobs”; sample rows `DEX-118` stale, `DEX-155` failed |
| **Full-PHI gated?** | OK | PHI boundary filter + chip `Full PHI · gated`; `exportBlocked()` disables **Run export** for `full-phi-gated` (“requires dual-control and legal evidence path”); StatCard “Full PHI gated” + route to legal evidence; sample `DEX-141` |
| **Links to QAPI / CMS quality?** | OK | Reports RelatedNav + drawer: QAPI, CMS quality; DEX RelatedNav: CMS quality; CMS related tab + RelatedNav: QAPI; Legal RelatedNav: QAPI; quality measure dataset `DEX-130` → QAPI + CMS quality |
| **Analytics not legal record?** | PARTIAL | DEX is explicit (“not transactional clinical authority”; lineage: warehouse does not seal notes/claims). Reports only says “synthetic” — no DAT-001 “cannot silently become the legal record” copy on the scorecard surface |
| PHI boundary taxonomy | OK | `de-identified` · `limited-phi` · `aggregate` · `full-phi-gated` on every export row |
| Honesty: incomplete ≠ complete | OK | Failed/stale block export; seal/submit/export disabled with footnotes; banners “synthetic · no PHI export / no CMS file / nothing sealed” |
| Sign / export / submit visual-only | OK (mostly) | DEX Run export / Request export; Legal Seal / Hold / Export; CMS Submit / Execute run. Exception: Reports “Schedule email digest” lacks visual-only title/disabled |
| Shell no-PHI posture | OK | App shell footer/banner elsewhere: synthetic · no PHI (global) |

## Route notes

### `/reports` — ReportsScreen
- Agency scorecard KPIs (census, referral→SOC, OASIS on-time, claim-ready) + six report cards (timeliness, OASIS accuracy, utilization, referral conversion, hospitalization/ED, med recon aging).
- Related: Exports, QAPI, CMS quality. Report drawer continues into Data exports, QAPI, CMS quality, OASIS review.
- Footer chip: “All figures synthetic — design prototype.”
- Gap: no explicit statement that analytics/scorecards are derived views and **not** legal medical-record authority (contrast `/data-exports` subtitle and lineage panel).
- Gap: “Schedule email digest” is an active-looking control with no visual-only affordance.

### `/data-exports` — DataExportsScreen (primary PHI-boundary surface)
- Banner: no warehouse write, disclosure, or PHI export performed; production needs DAT requirements, lineage, dual-control for full PHI.
- Registry of six synthetic datasets covering all status + PHI classes, including failed iQIES extract and full-PHI legal job.
- Export gate logic (`exportBlocked`): failed → blocked; stale → blocked until refresh acknowledgment; full-phi-gated → dual-control / legal evidence path.
- Continue-in links per row (Reports, Billing, QAPI, CMS quality, Legal evidence, etc.) + requirement IDs (DAT-001…).

### `/cms-quality` — CmsQualityScreen
- HHQRP completeness, submission batch, rejection repair, HHVBP, HHCAHPS exemption sample.
- Rejected work labeled (tone bad, callout, Submit disabled until repair).
- Related: OASIS, Data exports, QAPI, Quality desk; header actions to OASIS + Data exports.
- Honesty: “no CMS file is generated, submitted, or certified.”

### `/legal-evidence` — LegalEvidenceScreen
- DOC-005-oriented packages: draft SOC, legal hold incident, sealed discharge, pending order countersign, disclosure, survey hash-attention.
- Dual-format export readiness (PDF + JSON) with Ready / Partial / Blocked; blocked export buttons disabled.
- Seal gated on hold, hash mismatch, pending signatures, completeness &lt; 100%.
- Full-PHI evidence path destination for gated DEX-141; RelatedNav to Documents / QAPI / Orders / DOC-005.

## Findings

### P0
_None._ No silent legal seal, no unlabeled full-PHI export path, no failed export presented as success in sample data.

### P1
1. **Reports under-communicates “analytics ≠ legal record” (DAT-001)**  
   - **Where:** `/reports` hero scorecard and report cards (`ReportsScreen.tsx`).  
   - **Why it matters (Admin):** Administrators and survey prep staff can treat high “OASIS on-time” / scorecard tiles as record integrity. DAT-001 acceptance requires derived data never silently become the legal record; that story is clear on `/data-exports` but not on the leadership-facing reports surface.  
   - **Expected:** Short banner or footer on Reports aligned with DEX (derived operational intelligence · not chart authority · freshness/lineage via Data & exports).

2. **Reports freshness is always “Updated 6:00 AM · daily” with no stale/failed concept**  
   - **Where:** report card footers and drawers.  
   - **Why:** If scorecards feed leadership decisions while export registry shows failed/stale feeds (e.g. claim readiness, iQIES), Admin has no bridge from dashboard numbers to export health.  
   - **Expected:** Link or chip to export register health (stale/failed counts) or per-report “source dataset status.”

### P2
1. **“Schedule email digest” on Reports looks operational** without `title` / disabled / “visual only” footnote (unlike Run export / Submit to CMS).  
2. **Reports screen-head** lacks domain kicker (`Domain DAT`) present on sibling governance screens — minor IA consistency.  
3. **CMS quality** RelatedNav omits `/reports` (has Exports + QAPI); optional Admin path from HQR back to scorecard.  
4. **Primary “Request export”** on DEX is not disabled (only titled visual-only); inspector **Run export** is correctly `disabled` when gated — slight inconsistency.

## What works
- Full PHI boundary vocabulary and filters on Data & exports, with dual-control messaging into Legal evidence.
- Stale and failed jobs are first-class: chips, icons, callouts, stat rollups, and hard-disable of export.
- Cross-links among Reports ↔ Exports ↔ CMS quality ↔ QAPI ↔ Legal evidence match Administrator reporting oversight.
- Legal evidence models hold, hash attention, dual-format export readiness, and non-destructive prototype honesty.
- CMS quality surfaces rejection repair and blocks resubmit appropriately; completeness run is review-only.
- Synthetic / no-PHI prototype framing is repeated on DEX, CMS quality, and Legal evidence banners.

## Persona quote
> “I can finally see which extracts are stale, failed, or full-PHI gated — just put the same ‘this is not the legal chart’ stamp on the morning scorecard so nobody mistakes a pretty KPI for a sealed record.”

## Trace (code anchors)
| Area | Path |
|------|------|
| Routes | `apps/ehr-prototype/src/App.tsx` |
| Reports UI | `apps/ehr-prototype/src/screens/ReportsScreen.tsx` |
| Data exports UI + gates | `apps/ehr-prototype/src/screens/DataExportsScreen.tsx` (`exportBlocked`, `PHI_META`, status callouts) |
| CMS quality UI | `apps/ehr-prototype/src/screens/CmsQualityScreen.tsx` |
| Legal evidence UI | `apps/ehr-prototype/src/screens/LegalEvidenceScreen.tsx` |
| Export sample data | `apps/ehr-prototype/src/data/workspace.ts` (`DATA_EXPORTS`, `ROUTE_RELATED`) |
| DAT-001 requirement text | `apps/ehr-prototype/src/data/requirementsSpec.ts` (DAT-001 acceptance: stale/failed labeled; not legal record) |

## Sign-off
- **Agent:** B06 (Administrator — Reports & data exports / PHI boundary)
- **Mode:** Report-only (no app source changes)
- **Date:** 2026-08-04
)
