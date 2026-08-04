# A06 — CMS Surveyor — Legal evidence packages & survey retrieval
- Routes: `#/legal-evidence`, `#/documents`, `#/data-exports`
- Base: `http://127.0.0.1:5194/`
- Worktree: `ehr_phase1` · app `apps/ehr-prototype`
- Method: Source review of live screen implementations + prior route UAT (loads PASS for legal-evidence / data-exports); browser fetch to loopback blocked from this agent environment
- Verdict: **PASS**
- Summary: As a CMS surveyor evaluating survey retrieval UX, the legal-evidence workspace models DOC-005 correctly for a design prototype: legal hold blocks disposition and seal, hash attention keeps packages unsealed and export-blocked, and every package shows dual human+machine export readiness with independent hash language. Synthetic honesty banners are consistent across all three routes; documents and data-exports correctly defer full-PHI / evidence-grade retrieval into the legal path rather than pretending warehouse extracts are the legal record.

## Checks
| Check | Result | Notes |
| --- | --- | --- |
| Load / title / structure (`#/legal-evidence`) | OK | Prior UAT: h1 **Legal evidence packages**, 0 pageerrors; screen has RelatedNav, 4 StatCards, registry filters (status + purpose), master–detail inspector (Overview / Artifacts / Custody / Exports), ops strip, Assemble drawer |
| Load / title / structure (`#/documents`) | OK | h1 **Documents & signatures**; RelatedNav; StatCards (including pending that “Blocks claim / seal paths”); registry + inspector; cross-link to legal evidence |
| Load / title / structure (`#/data-exports`) | OK | Prior UAT: h1 **Data, analytics & exports**; RelatedNav; PHI + status filters; lineage / jobs tabs; full-PHI gated row routes to legal evidence |
| **Hold blocks disposition?** | **OK** | Sample **PKG-8790** (Incident · on-hold): `disposition: "Blocked · legal hold active"`, retention “disposition blocked”, custody “Disposition and destructive overwrite blocked.” StatCard sub: “Disposition blocked until counsel releases.” `sealDisabledReason` when `hold`: “Legal hold blocks seal and destructive disposition.” Request hold disabled when hold already active |
| **Hash attention not sealed?** | **OK** | Survey rehearsal **PKG-8688** (ACHC survey evidence set): `status: "attention"`, `hashOk: false`, completeness 88%, **not** sealed. Hash chip “Hash attention”; integrity callout requires re-pin before export or seal. `sealDisabledReason`: “Hash attention must clear before seal.” Both export formats **blocked** |
| **Seal disabled appropriately?** | **OK** | Seal gates: hold · already sealed · `!hashOk` · pending signatures · completeness &lt; 100%. Primary “Seal package” is `disabled={!!sealBlock}` with title + footnote restating reason and “No durable write occurs in this prototype.” Draft SOC (62%) and pending countersign packages correctly stay unsealed |
| **Human + machine export readiness?** | **OK** | Every package lists **Human-readable PDF packet** and **Machine-readable manifest (JSON)** with Ready / Partial / Blocked. Exports tab copy: DOC-005 acceptance needs both formats + independent hash verification. On-hold package can show Ready with hold watermark/metadata (export allowed; disposition still blocked). Survey hash-attention package blocks both. Data export **DEX-141** purpose: dual-format legal packets with hash verify; full PHI gated |
| **DOC-005 language?** | **OK** | Screen sub anchors “synthetic design prototype for DOC-005”; head action “DOC-005 register”; RelatedNav chip to `/requirements` labeled DOC-005; package `reqIds` include DOC-005; artifacts: “Production DOC-005 pins exact FHIR and document versions — never floating ‘latest’”; assemble wizard rejects floating latest for DOC-005 acceptance; requirements register DOC-005 acceptance matches dual export + hash + hold + controlled disposition |
| **Synthetic honesty banner?** | **OK** | Legal: “nothing is sealed, held, disclosed, or written to WORM storage.” Documents: “nothing is signed or sealed.” Data exports: “no warehouse write, disclosure, or PHI export is performed.” FlaskConical `role="status"` pattern on all three. Footnotes on seal/export/signature controls reinforce visual-only |
| Cross-links | OK | Legal ↔ Documents; Legal → Requirements (DOC-005); Documents → Legal evidence; Data exports → Evidence export / Open legal evidence; full-PHI gated export blocked until dual-control/legal path. RelatedNav maps present for all three routes |
| Incomplete never looks complete | OK | Completeness meters; incomplete pins labeled Incomplete/Unpinned; sealed only on explicit sample rows with WORM-**proposed** / “not production” wording; assemble wizard ends at “Preview sample package” and never invents sealed packages |

## Findings
### P0
- None.

### P1
- None for survey-readiness of this prototype scope. Hold, hash, seal, dual-export, and honesty behaviors match CMS surveyor expectations for a design prototype (not production CoP certification).

### P2
1. **RelatedNav on `/legal-evidence` omits `/data-exports`.** Surveyors who need “warehouse extract vs legal packet” contrast must use screen actions elsewhere or enter from data-exports. Adding an “Exports / DAT” related chip would close the loop (data-exports already links to Evidence export).
2. **Documents status filters omit `void`.** `STATUS_META` includes void, but the filter toolbar only offers All / Pending / Signed / Draft — minor registry completeness polish if void samples appear later.
3. **Export buttons for `partial` readiness remain clickable (visual-only).** Only `blocked` disables the control. Acceptable for prototype honesty via title/footnote, but a surveyor drill might prefer Partial also disabled (or labeled “Review draft only”) to reduce misread of readiness chips.

## What works
- **Survey package as honesty fixture:** PKG-8688 is purpose-built for ACHC/CMS survey retrieval and deliberately fails integrity so it cannot be mistaken for a sealeable/exportable survey packet.
- **Legal hold model:** Hold callout (reason + owner), Hold chip on rows, ops strip of active holds, disposition string, seal block, and custody event form a coherent counsel-driven freeze story.
- **DOC-005 dual-format discipline:** Human PDF + machine JSON on every package; blocked/partial/ready states track signatures and hash; language matches requirementsSpec DOC-005 acceptance.
- **Seal gate matrix** is explicit and survey-defensible (hold, hash, signatures, completeness, already sealed).
- **Domain separation:** Data exports refuse to claim clinical/legal authority (“Warehouse facts do not seal clinical notes or claims”; full PHI gated through legal evidence). Documents own signature queue and point into packages.
- **Assemble wizard** teaches purpose → pin versions → signatures → seal preview without inventing clinical facts or writing seals.
- **Consistent synthetic banners** prevent false production claims across DOC and DAT screens.

## Persona quote
> If this is how you intend operators to hand me a survey packet, I can see when something is held, when a hash failed, and that you still need both a human-readable set and a machine-readable manifest—just don’t let partial readiness look exportable in a real survey drill.

## Evidence map (source)
| Concern | Primary source |
| --- | --- |
| Packages, hold, hash, seal gates, dual export | `apps/ehr-prototype/src/screens/LegalEvidenceScreen.tsx` (`PACKAGES`, `sealDisabledReason`, exports tab, banners) |
| Signature queue honesty | `apps/ehr-prototype/src/screens/DocumentsScreen.tsx` |
| Full-PHI / lineage / export block | `apps/ehr-prototype/src/screens/DataExportsScreen.tsx` (`exportBlocked`, DEX-141 data in `workspace.ts`) |
| RelatedNav routes | `apps/ehr-prototype/src/data/workspace.ts` `ROUTE_RELATED` |
| DOC-005 requirement text | `apps/ehr-prototype/src/data/requirementsSpec.ts` |
| Prior route load UAT | `audit/ehr-phase1-uiux/new-pageviews-route-uat.md` |
