# B05 — Administrator — Revenue cycle oversight (claims, auth, notices)

- Routes: `/billing` · `/authorizations` · `/beneficiary-notices` · `/episodes`
- Base: http://127.0.0.1:5194/# (HashRouter; Vite log shows port 5194 ready)
- Worktree: `ehr_phase1` · App: `apps/ehr-prototype`
- Method: Live route wiring + full TSX/data review (BillingScreen, AuthorizationsScreen, BeneficiaryNoticesScreen, EpisodesScreen; claims / AUTHORIZATIONS / EPISODES / ROUTE_RELATED / WORK_QUEUE). Browser fetch to 127.0.0.1 blocked from agent sandbox; server process confirmed via `audit/ehr-phase1-uiux/phase0/vite-5194.log`.
- Verdict: **CONDITIONAL**
- Summary: Revenue-cycle screens give an Administrator a coherent oversight map—holds surface in the claim table and drawer with resolve links into Orders/OASIS/Authorizations; expiring and exhausted units are first-class on Authorizations; beneficiary notice clocks and appeal paths are explicit; Episodes ties certification to OASIS, orders, and claim status. There is **no Submit claim control**, so silent claim submission is not possible. CONDITIONAL because Billing’s primary actions (“Export 837”, “Run claim check”) are unlabeled no-ops without visual-only affordances, and the readiness checklist understates RCM-003 (no authorization / certification / EVV gates).

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Routes load / registered | OK | `App.tsx` mounts all four under `AppShell`; nav group **Revenue cycle** lists Billing, Authorizations, Beneficiary notices; Episodes under Care delivery. Command palette includes Episodes, Billing, Authorizations. |
| RelatedNav present | OK | `/billing` → Auth, Orders, OASIS, Notices; `/authorizations` → Billing, Schedule, Work queue; `/beneficiary-notices` → Billing, Forms, Documents; `/episodes` → OASIS, Orders, Billing. |
| StatCards / filters / inspector | OK | Billing: 4 StatCards + claims table + Drawer. Auth: stats + status filters + list + inspector tabs. Notices: stats + status/kind filters + inspector tabs + packet drawer. Episodes: stats + status filters + list + inspector. |
| **Holds transparent?** | OK | Table **Holds** column chips (e.g. Elena: “POC signature outstanding”, “OASIS not finalized”; Dorothy: “Recert POC in draft”). Drawer lists each hold with **Resolve in Orders / OASIS / Check authorizations** when text matches. Claims with holds sort first. StatCard “On hold” counts dollars blocked. Episode registry shows claim path labels (`Holds · POC + OASIS`, `Final holds · recert POC`). |
| **Units expiring?** | OK | Auth registry: status `expiring` / `exhausted` / `pending` with warn/bad tones; StatCard “Expiring / near limit”; Margaret PT “2 visits remaining”; June SN “0 · pending reauth” with exhausted callout; utilization ledger samples; work-queue item `wq-3` Authorization unit check. |
| **Notices path?** | OK | Full BEN workspace: NOMNC, DENC, HHABN, HHCCN; delivery clocks (`Due ≤48h` card); delivery timeline; appeal tab (BFCC-QIO / payer); forms/documents/legal evidence links; “Start NOMNC packet” drawer with **Create packet** disabled. |
| **Cross-links to OASIS/orders?** | OK | Billing drawer Continue-in → OASIS, Orders, Authorizations, Notices; holdResolution deep-links; Episodes inspector → OASIS (`oasisHref`), Orders, Billing; RelatedNav on billing/episodes. Notices do not deep-link OASIS/orders (less critical for BEN). |
| **No silent submit claim?** | OK (with caveat) | **No Submit claim button** anywhere on Billing. Footer: “nothing is submitted without biller review.” Recheck readiness only timestamps “no change.” Caveat: **Export 837** and **Run claim check** look real, have no `onClick`, and lack disabled/title/footnote (see P1). Auth “Submit request” and Notices “Create packet” / “Mark delivered” are disabled or footnoted. Episodes cert actions titled visual-only. |
| Honesty / incomplete ≠ complete | COND | Auth, Notices, Episodes carry synthetic banners + footers. Billing has a soft biller-review note only—no flask banner; primary export/check CTAs overclaim capability. |
| RCM-003 clinical ≠ billing release | OK / partial | Copy and architecture separate clinical completion from release; readiness checklist only flips OASIS + orders from holds (eligibility/visits always “done”; auth not listed). |

## Findings

### P0

_None._ No control silently submits a claim, files a NOMNC, or requests payer auth. Disabled or absent write paths dominate legal/financial actions.

### P1

1. **Billing primary actions are unlabeled no-ops** (`BillingScreen.tsx` header: Export 837, Run claim check). No `onClick`, no `disabled`, no `title`/`footnote` saying visual-only. An Administrator may believe export/edit check ran. Align with Auth/Notices pattern (disabled + explicit footnote) or wire visual feedback.

2. **Readiness checklist incomplete vs RCM-003** (`readinessChecklist`). Only OASIS and order-signature holds drive pending state; **authorization, certification, EVV, coding, coverage** never appear. Claims can look “ready enough” while real release gates are invisible. Sample data also has **no claim with an auth hold**, so the auth resolution link path is code-only, not demoed.

3. **Claim-ready path has no gated Submit (honest gap vs ops expectation)**. Absence avoids silent submit (good), but claim-ready rows (Raymond, Samuel) have no inspector CTA that shows a **blocked/visual-only submit with hold reasons**. Admin oversight of “who may release” is weaker than hold transparency for held claims.

### P2

1. **Billing lacks the synthetic design-prototype banner** present on Authorizations, Beneficiary notices, and Episodes—uneven honesty chrome across revenue surfaces.

2. **Beneficiary notices Related** omits Episodes / discharge clinical path; discharge-triggered NOMNC would benefit from episode + orders links for admin triangulation.

3. **Export 837** button missing `type="button"` consistency is minor; more important is the honesty labeling (P1).

4. **Auth “Expiring / near limit” StatCard** counts only `status === 'expiring'`; exhausted rows appear only in the combined Exhausted/pending card—fine, but filter default “All” is the only place to see both without switching.

## What works

- **Hold transparency as admin cockpit:** chips + sorted table + dollar-on-hold StatCard + per-hold resolve links into the clinical workspaces that unblock revenue.
- **Authorizations as unit risk board:** expiring/exhausted states, remaining balances, utilization samples, claim linkage tab, reauth request drawer with **Submit disabled** and status-based disable reasons.
- **Beneficiary notices path:** kinds, clocks, appeal, delivery proof story, forms library handoff—usable for admin oversight of NOMNC/DENC risk without pretending QIO filing works.
- **Episodes bridge clinical ↔ revenue:** cert/recert status, open orders count, claim status labels, Continue-in OASIS/Orders/Billing, visual-only cert controls with footnotes.
- **Cross-nav density:** RelatedNav + header shortcuts + drawer Continue-in form a closed loop among Billing ↔ Auth ↔ Notices ↔ OASIS ↔ Orders ↔ Episodes.
- **No silent claim submit:** design chooses review language and omits submit rather than faking a green “Submit all.”

## Route notes (persona lens)

### `/billing` — Billing & claims
- PDGM August cycle framing; statuses claim-ready / holds / submitted / paid / denied.
- Synthetic claims include held (Elena POC+OASIS, Dorothy recert POC) and claim-ready (Raymond, Samuel).
- Drawer: amount/type/status, holds with resolve links, readiness checklist, Continue-in (Auth, OASIS, Notices, Orders + work-queue related).
- Admin can answer “what is blocking revenue?” for held claims; less clear “what would release claim-ready?”

### `/authorizations`
- SCH-004 / RCM-003 framing in subtitle and copy (“clinical necessity stays separate”).
- Filters: active / expiring / exhausted / pending.
- Inspector tabs: Overview (callouts), Utilization, Claims (linked synthetic claims), Related.
- Request reauth primary respects pending and open PDGM cases.

### `/beneficiary-notices`
- BEN-004 drill surface; open / appeals / ≤48h clocks / acknowledged stats.
- Deliver disabled with reasons for acknowledged, closed, appeal-open.
- Packet start is review-only; Create packet disabled.

### `/episodes`
- Certification & payment-period registry; recert-due and pending-SOC called out.
- Claim status string on each row supports admin revenue glance without leaving EPI.
- Open cert period disabled when `pending-soc`; footnotes deny CMS-485/claim submit.

## Evidence map (source)

| Topic | Source |
| --- | --- |
| Routes | `apps/ehr-prototype/src/App.tsx` |
| Claims + holds data | `apps/ehr-prototype/src/data/clinical.ts` (`claims`) |
| Auth / episodes / related | `apps/ehr-prototype/src/data/workspace.ts` |
| Hold → workspace map | `BillingScreen.tsx` `holdResolution` / `readinessChecklist` |
| Nav honesty (built) | `apps/ehr-prototype/src/data/navigation.ts` Revenue cycle group |
| Live port | `audit/ehr-phase1-uiux/phase0/vite-5194.log` → http://127.0.0.1:5194/ |

## Persona quote

> As Administrator I can finally see *why* claims are held and that auth units and notice clocks are not hiding in someone’s inbox—but until Export/claim-check stop looking live and readiness shows every release gate (including auth), I will not trust this board as a go/no-go for revenue release.
