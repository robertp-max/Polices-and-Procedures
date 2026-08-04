# B07 — Administrator — Migration & adoption / WellSky coexistence

- Routes: `/migration`, `/vendors`, `/interoperability`, `/data-exports`
- Base: `http://127.0.0.1:5194/#` (HashRouter · apps/ehr-prototype)
- Method: Static screen + data review (`MigrationScreen`, `VendorsBaaScreen`, `InteroperabilityScreen`, `DataExportsScreen`, `workspace.ts` sample sets, RelatedNav map). Live browser fetch to `127.0.0.1` was blocked from this agent environment; behavior is fully determined by the wired TSX (no hidden mutation paths on the four action footers).
- Verdict: **CONDITIONAL**
- Summary: Migration honesty is strong for an Administrator: clinical cutover is explicitly blocked, rollback drill is tabletop/visual-only, and high-risk advance is gated. WellSky is correctly labeled as the incumbent clinical/billing system of record on Vendors, and Data/Exports refuses transactional authority. The coexistence story weakens on Interoperability (no WellSky dual-run adapter) and readiness meters can paint “green” at ≥60% progress even when risk remains medium/high.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Route load · `/migration` | OK | Domain MIG · title “Migration & adoption”; sub: WellSky export readiness, pilot cohorts, rehearsed rollback — **no live cutover authorized**. Flask banner: synthetic · no pilot · no chart cutover · rollback drills do not touch production · build unauthorized until TRC gates clear. |
| Route load · `/vendors` | OK | Domain TPR · “Vendors & BAAs”; WellSky row is first sample (`vnd-1`) with **Clinical / billing system of record**. BAA active; PHI-blocked callout only for missing/expired. |
| Route load · `/interoperability` | OK | Domain FHR · adapter registry + inspector; synthetic banner · no partner traffic. RelatedNav → Vendors / Migration / Exports. |
| Route load · `/data-exports` | OK | Domain DAT · “not transactional clinical authority”; lineage + PHI boundaries; full-PHI dual-control language. |
| RelatedNav present | OK | `/migration` → Vendors, Interfaces, Exports. `/vendors` → Interop, Security, Migration. `/interoperability` → Vendors, Migration, Exports. `/data-exports` → Reports, CMS quality, Evidence export (**no Migration back-link**). |
| StatCards / filters / inspector | OK | All four screens: multi-stat header, search + status filters, list + inspector pattern. Migration also has risk filter and Overview/Evidence/Gates tabs. |
| **Cutover blocked until gates?** | OK | `MIG-04` Clinical chart cutover `status: blocked`, progress 10%, evidence “None · blocked”, next gate “Build authorization”. Inspector callout **Cutover blocked**. `advanceBlocked()` disables **Advance gate** for blocked streams and for high-risk with progress &lt; 50%. Gates tab hard-codes **Dev authorization · Blocked** + link to Traceability. Banner + subtitle reinforce no live cutover. |
| **Rollback drill visual-only?** | OK | Footer **Rollback drill** button: `title="Visual only · no rollback executes"`; no `onClick` side effect. `MIG-03` purpose/evidence: tabletop only · live drill not authorized. StatCard “Rollback drills” sub: **Tabletop / scheduled only**. Evidence tab: “Tabletop notes only · live drill not authorized.” Footnote when advance allowed: “Advance / drill controls are visual only.” |
| **Incumbent authority clear?** | CONDITIONAL | **Clear:** WellSky named “incumbent EHR” + “Clinical / billing system of record” (`VENDOR_BAAS` `vnd-1`); migration subtitle centered on WellSky export readiness; `MIG-06` dual-run “without writing clinical authority”; DAT screen “Not transactional authority”; FHR ops “Clinical authority · Never auto-created · ADT does not auto-SOC.” **Gap:** FHR adapter register has no WellSky export/coexistence adapter; coexistence is only implied via MIG-01/MIG-06 + vendor row. Business-plan domain authority matrix is not surfaced on these four ops screens. |
| **Risk meters honest?** | CONDITIONAL | Risk chips use correct tones (high=bad, medium=warn, low=good). Blocked/high-risk counts use warn/bad StatCard accents. **Honesty slip:** row `ProgressBar` uses green when `progress >= 60` regardless of `risk` (e.g. `MIG-03` 60% medium risk → green readiness while next gate is still “Live drill”). Advance rule only blocks high-risk below 50%, not medium/low that look “ready.” |
| Destructive / legal actions honest | OK | Primary/secondary actions: Open export inventory, Register vendor, View adapter, Request export, Run export, Replay queue, Advance gate — all visual-only titles and/or disabled with explicit disable reasons + footnotes. No silent write. |
| Cross-links sensible | OK | Migration ↔ Vendors/Exports/Interop; blocked cutover → Requirements/Traceability/Clinical; full PHI → Legal evidence; FHR contract tab → Vendors. Minor: `/data-exports` RelatedNav omits Migration despite MIG-01 related → Exports. |
| Incomplete never looks complete | OK | No complete cutover stream; blocked callouts; pilot patients = 0; full-PHI export gated; failed/stale exports labeled and block Run export. |

## Findings

### P0

_None._ No false completeness on cutover, no silent production action, no claim that WellSky has been retired.

### P1

1. **WellSky coexistence missing from Interoperability registry**  
   - **Where:** `/interoperability` · `INTERFACE_ADAPTERS` (`workspace.ts`)  
   - **Issue:** Adapters are Hospital ADT, Lab, EVV, Accounting, eCign, Patient Access — none named WellSky / incumbent export / dual-run compare. Admin evaluating “WellSky coexistence” only sees coexistence on `/migration` (MIG-01 inventory, MIG-06 dual-run) and `/vendors` (SoR label). FHR is the natural operational home for a shadow/export adapter.  
   - **Ask:** Add a synthetic **WellSky clinical export / dual-run** adapter in `shadow` or `attention` health with purpose “incumbent remains authority; owned side validates only,” linked to `/migration` and `/vendors`.

2. **Readiness progress color can overstate gate readiness**  
   - **Where:** `/migration` row meters (`MigrationScreen.tsx` ProgressBar color: green if `pct >= 60` unless blocked)  
   - **Issue:** Green readiness bars read as “go” to an Administrator. `MIG-03` Rollback drill is medium risk, scheduled, 60% → green, while live drill is still unauthorized. Risk chip and status chip mitigate but the meter itself is optimistic.  
   - **Ask:** Tie bar color to risk and/or gate state (e.g. never green while risk=high, or while next gate is “Live drill” / “Build authorization”), or label meters “evidence readiness (not cutover ready).”

### P2

1. **`/data-exports` RelatedNav does not link back to Migration**  
   - Related map: Reports · CMS quality · Evidence export only. Migration → Exports is one-way. Add Migration (or Vendors) for admin migration journeys.

2. **Primary header CTAs not disabled (title-only honesty)**  
   - “Open export inventory”, “Register vendor”, “View adapter”, “Request export” rely on `title` tooltips, not `disabled` + visible footnote at the header. Footer actions are better (disabled + footnote). Consistent with other prototype screens; still easy to mis-click expectation for a new Administrator.

3. **No domain-level authority register on MIG surface**  
   - Business plan data has shadow/pilot/target authority by domain (WellSky vs Care Indeed). Migration inspector shows workstream risk/gates but not a compact “who is legal SoR for clinical / OASIS / claims today” strip. Would strengthen incumbent clarity without leaving MIG for the Board deck.

4. **Vendors badge “2” in nav**  
   - Navigation badge on Vendors & BAAs is `2` (matches missing+expiring sample counts). Fine if intentional; confirm it tracks blocked PHI vendors, not total.

## What works

- **Cutover discipline:** `MIG-04` blocked + callout + disabled Advance gate + TRC link is the right Administrator posture.
- **Rollback honesty:** Tabletop-only stream, visual-only drill control, banner language, and “0 pilot patients” in evidence tab — no production drill fiction.
- **Incumbent labeling on Vendors:** “WellSky (incumbent EHR)” + “Clinical / billing system of record” is unambiguous.
- **Export / PHI gates:** Stale, failed, and full-PHI-gated rows disable **Run export** with explicit reasons; DAT copy refuses clinical/claims seal authority.
- **Interop safety language:** Replay blocked for shadow/down/fail; ops panel “Never auto-created / ADT does not auto-SOC”; BAA dependency called out on contract tab.
- **Cross-domain RelatedNav** among Migration · Vendors · Interop · Exports is generally coherent for coexistence work.
- **Synthetic banners** on all four routes prevent survey/false-production misread for prototype QA.

## Persona quote

> “I will not authorize cutover from this board — and that is correct — but I still need WellSky sitting on the interoperability board as a shadow dual-run so coexistence is operational, not just a vendor label and a migration sticky note.”

## Route inventory (sample data)

| ID | Screen object | Status / risk | Admin takeaway |
|----|---------------|---------------|----------------|
| MIG-01 | WellSky export inventory | open · high · 35% | Advance disabled (high &lt; 50%); fidelity partial |
| MIG-02 | Identity mapping | draft · medium · 48% | Pre-pilot IAM work |
| MIG-03 | Rollback drill | scheduled · medium · 60% | Tabletop only; meter may look green |
| MIG-04 | Clinical chart cutover | **blocked** · high · 10% | No live cutover |
| MIG-05 | Forms catalog migration | open · low · 55% | Non-seal semantic mapping |
| MIG-06 | Interface dual-run | draft · medium · 40% | No clinical authority write |
| vnd-1 | WellSky (incumbent EHR) | BAA **active** | SoR clinical + claims |
| vnd-4 | Field telemetry pilot | BAA **missing** | PHI blocked callout |
| DEX-141 | Legal evidence export | full-phi-gated · current | Run export disabled (dual-control path) |
| DEX-118 / DEX-155 | Claim readiness / iQIES | stale / failed | Export blocked until refresh/repair |

## Evidence references (source)

- `apps/ehr-prototype/src/screens/MigrationScreen.tsx` — banners, advanceBlocked, rollback title, cutover callout, progress color
- `apps/ehr-prototype/src/screens/VendorsBaaScreen.tsx` — BAA PHI gate, WellSky display
- `apps/ehr-prototype/src/screens/InteroperabilityScreen.tsx` — replayBlocked, clinical authority ops copy
- `apps/ehr-prototype/src/screens/DataExportsScreen.tsx` — exportBlocked, lineage authority disclaimer
- `apps/ehr-prototype/src/data/workspace.ts` — `VENDOR_BAAS`, `MIGRATION_STREAMS`, `INTERFACE_ADAPTERS`, `DATA_EXPORTS`, RelatedNav map
- `apps/ehr-prototype/src/data/navigation.ts` — MIG/TPR/FHR/DAT nav entries

## Severity rollup

| Severity | Count |
|----------|-------|
| P0 | 0 |
| P1 | 2 |
| P2 | 4 |
| OK checks | Cutover gate, rollback visual-only, action honesty, synthetic banners |

**Go/no-go for this persona slice:** Prototype is **safe to show** an Administrator for migration *governance posture* (no false cutover, no live drill). **Not yet complete** for a WellSky coexistence walkthrough until Interoperability carries an explicit incumbent dual-run/export adapter and readiness meters stop reading as green “go” before live gates.
