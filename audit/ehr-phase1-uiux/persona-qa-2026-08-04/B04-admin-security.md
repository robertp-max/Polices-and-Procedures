# B04 — Administrator — Security & reliability posture
- Routes: `/security`, `/users-access`, `/vendors`, `/legal-evidence`
- Base: http://127.0.0.1:5194/ (HashRouter · `apps/ehr-prototype`)
- Worktree: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1`
- Method: Route registry + screen/data source review against live Vite on 5194 (process confirmed in `audit/ehr-phase1-uiux/phase0/vite-5194.log`); report-only, no app edits
- Verdict: **CONDITIONAL**
- Summary: The Administrator security cluster is survey-ready as a **UX prototype**: control register with Met / At risk / Gap / Not tested, explicit Proof and Gaps inspector tabs, proposed RTO/RPO labels, and honest synthetic banners. Cross-links from security to users, vendors, and legal holds work in data and UI. Residual issues are honesty on one “Met” control that still needs a live restore, RPO copy that is generic (not per-control), and primary actions that rely on `title`/footnotes rather than disabled affordances.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| `/security` loads with title, banner, RelatedNav, StatCards, filters, inspector | OK | `SecurityReliabilityScreen.tsx` — Domain SEC · “Security & reliability”; Flask banner; RelatedNav; 4 StatCards; status filters; list + inspector with Overview / Proof / Gaps |
| Controls show **proof** and **gaps** (not checkbox theater) | OK | Detail tabs `proof` + `gaps`; gap callouts for at-risk/gap; status model includes `gap`, `at-risk`, `not-tested`, `improving`, `met` |
| **RTO / RPO** visible and framed as targets/labels | OK | SEC-11 target `≤4h RTO`; Proof tab shows `99.9% core · ≤15m RPO — labels only in this prototype` |
| Links to **legal holds** from security posture | OK | Header “Legal holds” → `/legal-evidence`; RelatedNav includes Legal holds; SEC-20 related → Legal evidence |
| No fake “100% secure” / fully hardened claim | OK | Subtitle: “not a production SOC console”; banner: no vuln remediated / no hold applied / no ticket filed; status labels include Gap / Not tested; WORM called out as non-production |
| `/users-access` IAM honesty (invite / revoke / break-glass) | OK | Synthetic directory banner; Invite visual-only; Revoke disabled with reason for service accounts / already disabled; break-glass visual-only |
| `/vendors` BAA gate honesty | OK | Missing/expired → PHI blocked callout; “BAA status does not gate real PHI”; missing vendor (Field telemetry pilot) in sample |
| `/legal-evidence` hold + seal honesty | OK | Hold package PKG-8790; seal blocked when hold / hash fail / pending sig / completeness &lt; 100%; banner: nothing sealed, held, or WORM-written |
| Cross-links sensible for Admin security narrative | OK | SEC ↔ Users, Vendors, Legal holds; IAM principal Jordan Lee → Legal holds; Vendor BAAs → Security; SEC-20 / SEC-25 / SEC-14 related routes present |
| Incomplete work never looks complete | CONDITIONAL | Mostly honest; **SEC-11 status Met** while gap text includes “live restore still due” undercuts Met semantics (see P1) |
| Sign/seal/submit disabled or visual-only with footnote | OK | Incident drill / SLO dashboard / Run drill visual-only + footnote; Legal seal uses `sealDisabledReason`; Vendors register visual-only |

## Control register snapshot (synthetic)

| ID | Control | Status | Target / proof notes | Related |
|----|---------|--------|----------------------|---------|
| SEC-11 | Backup restore drill | **Met** | Target ≤4h RTO; last proof “Jun tabletop”; gap “None · live restore still due” | Migration, Org master |
| SEC-14 | Access review | At risk | Quarterly; gap “5 users past window” | Users & access, Traceability |
| SEC-18 | WCAG 2.2 AA | Improving | AA; contrast residual | Requirements |
| SEC-20 | Legal hold enforcement | **Gap** | Disposition blocked; WORM not production | Legal evidence, Documents |
| SEC-22 | Audit log completeness | Not tested | Target “100% privileged actions” (coverage target, not “100% secure”); export path unproven | Users & access, Exports |
| SEC-25 | Vendor BAA gate | At risk | No PHI without active BAA; 1 missing BAA | Vendors, Interoperability |

Sample stats derived from data: 6 controls · 1 met · 3 at-risk/gap (14, 20, 25) · 1 not-tested · incidents 30d = 0 (explicitly “Synthetic env · none”).

## Findings

### P0
- None. No false “fully secure” attestation, no silent legal hold apply, no write-path claiming production enforcement.

### P1
1. **SEC-11 Met vs unfinished live restore** (`workspace.ts` SEC_CONTROLS · SEC-11)  
   Status chip is **Met** while gap string is `None · live restore still due`. For an Administrator reading resilience posture, “Met” + outstanding live restore is contradictory. Prefer status `improving` / `not-tested` until live restore proof exists, or split “tabletop met” vs “live restore pending” into two controls.

2. **RPO not first-class on resilience controls** (`SecurityReliabilityScreen.tsx` Proof tab)  
   RPO (`≤15m`) is a hardcoded Proof-panel string applied to **every** selected control, not a field on `SecControl`. RTO appears only on SEC-11’s `target`. Admin expectation: RTO/RPO on resilience SLOs (backup, DR, availability), not generic copy on a11y/access rows. Still labeled “labels only” — not a false production claim, but weak as a posture model.

### P2
1. **Primary “Open incident drill” / “Run drill” not disabled** — rely on `title` + footer footnote. Visual-only is disclosed; a disabled button or chip (“Demo only”) would reduce mis-click trust risk for exec demos.
2. **RelatedNav on `/legal-evidence`** links Documents / QAPI / Orders / DOC-005, not back to `/security`. Forward link from security → holds is strong; reverse path is only via shell nav / command palette / principal related links.
3. **Incidents (30d) = 0 with green accent** — honest subtext, but a zero-incident green card can still be misread in screenshots; optional “Sample only” chip on the card would match the Flask banner tone.
4. **Vendor RelatedNav** goes Interoperability / Security / Migration — good; no direct RelatedNav hop from vendors to legal holds (acceptable; holds are package-centric).

## What works
- **Honesty stack:** Flask banners on all four routes; screen-sub disclaimers (“not a production SOC console”, synthetic directory, BAA does not gate real PHI, nothing written to WORM).
- **Control lifecycle language:** Explicit Met / At risk / Improving / Gap / Not tested — gaps stay visible (“not checkbox theater” copy on Gaps tab).
- **Proof vs Gaps inspector:** Separate tabs force Admin to open evidence and residual risk; callouts for gap/at-risk on Overview.
- **RTO present:** Backup restore drill targets ≤4h RTO with owner Platform and last proof date.
- **RPO present and caveated:** Proof tab states proposed availability + ≤15m RPO as labels only.
- **Hold linkage:** Security header + RelatedNav + SEC-20 related buttons navigate to `/legal-evidence`; IAM privacy officer principal links “Legal holds”; incident package PKG-8790 demonstrates hold reason, owner, disposition blocked, seal disabled with reason.
- **No fake 100% secure claim:** “100% privileged actions” is an **audit-coverage target** on SEC-22 (status Not tested). Subtitle and banners reject SOC completeness. Legal WORM labeled proposed/not production.
- **IAM dual-control sample:** Service-account revoke blocked with dual-owner message; break-glass history on privacy officer; MFA-off chip on pending invite.
- **Vendor BAA sample includes failure modes:** Active, expiring, missing (PHI blocked callout) — Admin can see gate design without fake all-green register.
- **Destructive / write actions** (invite, revoke, break-glass, register vendor, incident drill, seal under block) are visual-only or disabled with reasons.

## Persona quote
> As Administrator I can brief the board on control gaps, proposed RTO/RPO, BAA blockers, and legal holds from this prototype—but fix the “Met” restore control that still needs a live drill, or I will not put that slide in front of a surveyor.
