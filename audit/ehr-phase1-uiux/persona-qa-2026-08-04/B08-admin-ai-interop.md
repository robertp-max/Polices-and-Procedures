# B08 — Administrator — AI governance + interoperability

- Routes: `/ai-governance` · `/interoperability` · `/clinical` · `/security`
- Base: http://127.0.0.1:5194/# (HashRouter; Vite log shows port 5194 ready)
- Worktree: `ehr_phase1` · App: `apps/ehr-prototype`
- Method: Full TSX/data review (`AiGovernanceScreen`, `InteroperabilityScreen`, `ClinicalScreen`, `SecurityReliabilityScreen`; `AI_CAPABILITIES`, `INTERFACE_ADAPTERS`, `SEC_CONTROLS`, `ROUTE_RELATED`, `App.tsx` routes, nav). Browser fetch to 127.0.0.1 blocked from agent sandbox; server process confirmed via `audit/ehr-phase1-uiux/phase0/vite-5194.log`. Report-only.
- Verdict: **PASS**
- Summary: For an Administrator, the AIG + FHR + SEC cluster correctly models **assistive-only AI**, **armed/tripped kill switches**, **adapter health including shadow**, and **BAA-gated production credentials** without pretending production write-through. Promote is disabled for prohibited, already-approved, evaluation (incl. shadow), and kill-tripped capabilities; replay is disabled for shadow, down, and failing contract tests. Clinical surfaces reinforce “nothing files without clinician signature” and Brad draft as human-gated. Gaps are polish (clinical ↔ AIG related link, paused-state promote edge case) not false authority.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Routes load / registered | OK | `App.tsx` mounts `/clinical`, `/interoperability`, `/ai-governance`, `/security` under `AppShell`. Nav: Clinical under care delivery; Interoperability / AI governance / Security under platform group (`navigation.ts`). |
| RelatedNav present | OK | `/ai-governance` → Clinical, Security, Traceability. `/interoperability` → Vendors, Migration, Exports. `/security` → Users & access, Vendors, Legal holds. `/clinical` → Orders, Medications, OASIS, Documents. |
| StatCards / filters / inspector | OK | AIG: 4 stats + state filters + capability list + inspector tabs (Overview / Evaluation / Controls). FHR: 4 stats + health filters + adapter list + inspector (Overview / Contract / Ops). SEC: 4 stats + status filters + control list + inspector (Overview / Proof / Gaps). Clinical: tabs + worklist + note drawer (no StatCards; worklist pattern). |
| **AI never autonomous clinical authority?** | OK | Banner: “Brad never acts without a human gate”; “no clinical note is auto-sealed.” Each capability carries `humanGate` (required accept / hard deny). AIG-01 purpose: “Never seals notes or signs orders.” Eval tab: “Assistive draft only · seal / sign / submit remain human.” Controls tab: “Human always final · No silent clinical write.” Clinical note footer: “Nothing files without clinician signature.” Sections labeled “Pre-filled from assessment — review required.” OASIS suggestion (AIG-03) is **prohibited** / hard deny. Interop ops: “Clinical authority · Never auto-created · ADT does not auto-SOC.” |
| **Kill switch?** | OK | `killSwitch: 'armed' \| 'tripped' \| 'n/a'` on every capability; row chip “Kill · {state}”; inspector StatusChip + grid + Controls tab. AIG-05 Claim denial narrative sample is **tripped** with callout “No generation until re-arm after evaluation refresh.” Kill-switch drill is titled visual-only; banner states drills do not affect production. Promote blocked when tripped. |
| **Interface health + BAA gate?** | OK | Adapter health: healthy / attention / down / **shadow** with chips and filters. Failing contract tests StatCard; EVV fail + Patient Access down demos attention/down. Banner: production needs “BAA-active vendors, contract tests, and SEC gates.” Contract tab: “Production credentials stay dark until vendor BAA is active” + **Open vendors & BAAs**. Header shortcut to Vendors. SEC-25 **Vendor BAA gate** (“No PHI without active BAA”, status at-risk, gap “1 missing BAA vendor”) related → Vendors + Interoperability. |
| **Promote blocked when shadow?** | OK | AI: `promoteBlocked()` disables for prohibited, approved, kill tripped, and **evaluation** (AIG-02 Med list extract evalStatus **“Shadow mode”** → “Evaluation must complete human gate review before promote.”). Eval copy: “Shadow mode never writes chart authority.” Interop: `replayBlocked()` disables **Replay queue** when `status === 'shadow'` (“Shadow adapters do not accept production replay”) — eCign FHR-12 is shadow with 0 events. |
| Honesty / incomplete ≠ complete | OK | All three governance screens use flask synthetic banners + action footnotes. Promote / kill drill / replay / contract tests / incident drill labeled visual-only; no `onClick` mutates capability, adapter, or SEC state. |
| Cross-links sensible | OK | AIG ↔ Clinical/Security/Traceability/Requirements IDs; FHR ↔ Vendors/Migration/Clinical/Field visits/Security; SEC ↔ Vendors/Interop/Users/Legal evidence. Clinical worklist deep-links meds/OASIS/orders/chart. |

## Findings

### P0

_None._ No path auto-seals notes, auto-promotes models, auto-replays partner traffic, or issues PHI credentials. Disabled promote/replay and hard-deny prohibited capabilities prevent false completeness on authority transfers.

### P1

_None for assigned authority checks._ (Optional product gap, not a false-authority defect: Clinical RelatedNav does not surface **AI governance**, so an admin reviewing Brad “Draft ready” notes must navigate via palette/nav rather than in-flow Related/Continue-in. Does not claim autonomous AI.)

### P2

1. **`promoteBlocked` omits bare `paused` without trip** (`AiGovernanceScreen.tsx`). Logic covers prohibited / approved / kill tripped / evaluation. Sample data only has paused **with** tripped kill (AIG-05), so UI is correct today; a future paused+armed row would enable the Promote button (still no-op / footnoted, but weaker gate messaging).

2. **Clinical “Review & sign” is an unlabeled no-op** relative to AIG/FHR pattern. Footnote is honest (“Nothing files without clinician signature”), but the primary button lacks `disabled`/`title` “visual only” used on Promote/Replay. Admin surveying honesty chrome across domains sees uneven discipline.

3. **BAA gate is narrative + SEC control, not data-joined to adapters.** Interop contract tab states credentials stay dark without BAA, but adapter rows do not show live BAA status from `VENDOR_BAAS` (e.g. missing/expired vendor chip on FHR-*). Prototype-appropriate; production design should join TPR register to FHR health.

4. **Clinical ↔ AIG related gap.** `/clinical` RelatedNav omits AI governance; Brad draft chip does not deep-link AIG-01. Admin AI oversight story is strong on `/ai-governance` but weakly discoverable from the clinical desk.

5. **Kill-switch drill always enabled** (by design, visual-only). Fine for prototype; production should require dual control / reason code and actually flip state with audit — not expected here.

## What works

- **Clear human-in-the-loop doctrine:** intended use + human gate + overrides/7d + prohibited OASIS auto-suggest + clinical signature gate form a coherent Administrator story that AI is never clinical authority.
- **Kill switch as first-class UX:** armed/tripped/n/a chips, tripped callout, promote block, drill rehearsal copy that refuses production pretence.
- **Shadow honesty on both rails:** AI evaluation shadow blocks promote and chart write; interface shadow blocks production replay and shows 0 (shadow) volume.
- **Interop health cockpit:** healthy / attention / down / shadow, contract test pass/fail/skip, failure visibility (“no silent drop”), ADT never auto-SOC.
- **BAA as admin control plane:** Vendors shortcut, contract dependency text, SEC-25 at-risk BAA gate with continue-in to Vendors and Interoperability — matches TPR-002 / SEC-007 intent at prototype fidelity.
- **Security posture board:** met / at-risk / gap / not-tested stay visible (legal hold gap, access review at-risk, audit log not-tested) without checkbox theater; incident count 0 labeled synthetic.
- **Promote disabled matrix is correct for current sample** (all five capabilities either blocked or already approved; no free promote path).

## Route notes (persona lens)

### `/ai-governance` — Domain AIG
- Subtitle: “Approved intended uses, human control, evaluation, and kill switch — Brad remains assistive only.”
- Sample set: Brad draft assist (approved, kill armed), Med list extract (evaluation / shadow, promote blocked), OASIS suggestion (prohibited), Schedule optimizer (approved), Claim denial narrative (paused, kill **tripped**).
- Stats: approved uses, pending eval, prohibited, human overrides (7d sum).
- Inspector: purpose, hard-deny / kill callouts, intended use, human gate, eval, kill; Evaluation + Controls tabs; Promote capability disabled with explicit reason string.

### `/interoperability` — Domain FHR
- Adapter sample: Hospital ADT, Lab results, EVV (fail/attention), Accounting export, eCign (shadow/skip), Patient Access (down/cert expired).
- Replay queue primary disabled for shadow / down / fail with footnote.
- Contract tab ties go-live to BAA + tests; Ops tab denies auto clinical authority from ADT.

### `/clinical` — Care delivery desk
- Worklist: needs attention / drafts / completed; Brad “Draft ready” on SOC follow-up only as assistive badge.
- Note drawer: pre-filled SOAP with review-required chips; signed notes show human signer; unsigned shows Review & sign + filing footnote.
- Reinforces AIG claim that drafts do not equal sealed clinical record.

### `/security` — Domain SEC
- Controls include Vendor BAA gate (SEC-25), access review, legal hold gap, audit log not-tested, backup met, a11y improving.
- Related to Users, Vendors, Legal holds; interop BAA story closes through Vendors + SEC-25 related links.
- Incident/SLO/drill actions visual-only with synthetic banner.

## Persona quote

> “I can see which AI is allowed, which is in shadow, which is hard-denied, and which kill switch is tripped — and promote stays off until a human gate finishes. Interfaces show health and won’t replay shadow rails, and BAA is called out as a hard gate for production credentials. That is the admin control story I need for survey and board risk; join adapter health to live BAA status next and keep clinical sign as honest as promote.”
