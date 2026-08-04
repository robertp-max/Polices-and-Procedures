> ## ⚠️ CORRECTION — read before acting on finding #1 or #2
>
> **The "BLOCKER-severity" findings below are wrong, and acting on them would delete accurate data.**
>
> This review treated the static `Care_Indeed_Home_Health_EHR_Complete_Requirements.html`
> extract as the sole authority. It is not. The figures it reports as unsourced —
> **1,108** workflow steps, **192** target elements, **Corridor / 269 / 201**, **77**,
> the **CL-PA / FN-BL / IT-AC** taxonomies, and the orphan/missing-alignment counts —
> were all verified present in the same source app's requirements *workspace* data:
> `app/requirements/requirements-program-data.ts`, `requirements-data.ts`,
> `requirements-audit-data.ts`, `requirements-pm-model.ts`.
>
> **5,350** is not a literal anywhere because it is *computed* at runtime
> (`planningTasks.length`); it renders on the live `/requirements` page, which was
> read directly and showed "5350 Planning tasks", "15 Planning buckets" and
> "30 flagged".
>
> So the numbers are sourced — just not from the document this review checked.
> The real defect is **attribution**, and it is narrow: the on-screen `TASKS_NOTE`
> said "The source states…" while pointing at the addendum. `requirementsSpec.ts`
> now carries a header naming both sources and which supplies what.
>
> **Do not remove these figures.** The remainder of the review (register fidelity,
> gates, ADRs, architecture, traceability, sources) was independently useful and stands.

# Requirements Screen — Fidelity & Honesty Review

**Scope reviewed:** `src/screens/RequirementsScreen.tsx` (766 lines), `src/screens/req.css` (602 lines),
`src/data/requirementsSpec.ts` (885 lines).

**Canonical source (authority):** `bp-extract/requirements.txt` — the full 1,774-line extraction of
*Care_Indeed_Home_Health_EHR_Complete_Requirements.html*, "Requirements addendum · Version 1.1 · July 29, 2026."
The entire file was read end‑to‑end (not sampled) and cross-checked against every figure and quoted
passage in `requirementsSpec.ts`. `npx tsc --noEmit -p .` was run (clean, zero errors) and all three
files were confirmed to compile via the dev server (`curl` → 200 for each).

**Headline verdict:** the requirement-register content, gates, ADRs, architecture, traceability chain,
and sources are excellent — genuinely verbatim, well-organized, and honestly captioned. But a cluster of
high-visibility statistics (planning tasks, workflow steps, element count, blocker total, and three of
the five "BL‑0x" blocker descriptions) **do not appear anywhere in the 1,774-line canonical source**, and
one of them is asserted in the code's own on-screen copy as if it were a direct quote from the source.
That is the dominant finding and is ranked first below.

---

## BLOCKER-severity findings

### 1. Five headline statistics are absent from the canonical source, and one is falsely attributed to it

I grepped the complete `requirements.txt` for every numeral and phrase below. None occur anywhere in
the 1,774-line document:

| Figure used on screen | Where it's asserted | Found in source? |
|---|---|---|
| **5,350 planning tasks** | `INVENTORY_STATS` (line 135), `FOOTER_SUMMARY` (664), `NAV_GROUPS` "tasks" sublabel (751), `TASKS_NOTE` (850‑851), rail badge `5350` | **No — zero occurrences.** Source only says "R0 through R6 describe delivery increments" (source L437) and "the full specification and the delivery backlog are complementary" (L401‑408); it never gives a task count. |
| **15 planning buckets (14 increments + 1 backlog)** | `PLANNING_BUCKETS` (843‑846), `INVENTORY_STATS` (136), `PLANNING_NOTE` (279‑280) | **No.** Source never enumerates increments/buckets by count. |
| **1,108 workflow steps still needing semantic approval** | `INVENTORY_STATS` (140), `WORKFLOW_NOTE` (362‑363), `WorkflowsWorkspace` note (RequirementsScreen.tsx:629‑630) | **No.** Source's own "Blocker 03 / Workflow depth" (source L389‑391) and TRC‑003 (source L1586‑1590) discuss the *concept* that 166/166 ID coverage ≠ step-level disposition, but no step count is ever given. |
| **192 target elements** | `INVENTORY_STATS` (139), `ELEMENT_REGISTRY_NOTE` (327‑328), `FOOTER_SUMMARY` (664), `UiuxWorkspace` (RequirementsScreen.tsx:438) | **No — and the source's own text has an em‑dash placeholder at exactly this spot:** source line 314 literally reads `"— named reusable components and interface elements"`. That dash is where a live/JS‑computed counter would normally render; the static extraction never resolved it to a number. The "16 governed families" figure right next to it *is* genuine (source L329), but "192" is not recoverable from the cited source at all. |
| **30 authorization blockers flagged** | `INVENTORY_STATS` (142), `BlockerList` card‑kicker "30 blockers flagged" (RequirementsScreen.tsx:227), `NAV_GROUPS` "risks" count (768) | **No.** The source names exactly **four** blockers (`BLOCKER 01`–`BLOCKER 04`, L381‑395); it never gives an aggregate count of 30 individual issues. |

The most serious instance is `TASKS_NOTE` (requirementsSpec.ts:850‑851), which is rendered verbatim in
`TasksWorkspace` (RequirementsScreen.tsx:468):

> "**The source states** a corpus total of 5,350 planning tasks distributed across 15 planning buckets…"

This is a direct, on-screen false attribution — the cited source does not state this anywhere. Every
other note in the file is careful to say "the source does not enumerate…" (e.g. `STORY_SLOT_NOTE`,
`TASKS_NOTE`'s second sentence); this one clause claims sourcing that doesn't exist.

**Fix:** either locate the real JS-rendered source of these five figures (e.g. re-extract the live page
with JS executed, since the "192" em-dash proves at least one of them is a live counter the static
extraction missed) and cite it explicitly as a second source, or relabel all five as editorially
estimated/placeholder figures the way `STORY_SLOT_NOTE` and `TASKS_NOTE`'s own second sentence already
do — and remove the "the source states" clause specifically.

---

### 2. Three of the five BL‑0x blocker write-ups reuse real identifiers from an unrelated system in this repo, with figures that don't trace to the cited source

`BLOCKERS` (requirementsSpec.ts:172‑203) presents `BL‑01` … `BL‑05` as if all five come from the
Requirements addendum. Checking each against the source's own four `BLOCKER 0x` callouts (L381‑395):

- **BL‑01** (legacy authority conflict) — genuine match to source `BLOCKER 01` (L383).
- **BL‑02** ("77 unresolved workflow policy references + CL‑PA / FN‑BL / IT‑AC taxonomy collisions") —
  the *theme* (semantic ID collisions) matches source `BLOCKER 02` (L387), but the number **77** and the
  taxonomy codes **CL‑PA / FN‑BL / IT‑AC** never appear in `requirements.txt`.
- **BL‑03** ("201 of 269 Corridor alignment records awaiting SME review") — **has no antecedent anywhere
  in the source.** None of "Corridor," "269," or "201" occur in the 1,774-line file. Source `BLOCKER 03`
  is actually about workflow-step depth (166/166 IDs = coverage only), which the app instead folds into
  `WORKFLOW_NOTE` — meaning BL‑03 as written is *additional*, undocumented content, not a restatement of
  the source's own third blocker.
- **BL‑04** ("Registry/map drift — 11 missing, 8 orphan, 6 absent HH‑map policy IDs") — theme matches
  source `BLOCKER 04` (source/version drift, L393‑395), but the **11/8/6** figures are not in the source.
- **BL‑05** (prototype persistence only) — reasonable, honestly self-referential about *this app*, but
  has no source counterpart either (there are only 4 `BLOCKER` callouts in the document, not 5).

Critically, **"Corridor," "CL‑PA," "FN‑BL," "IT‑AC," and "HH‑map" are not placeholders** — they are real
identifiers used by *this repository's actual Policy & Procedures ACHC-crosswalk system*
(`scripts/validateCorridorAlignment.ts`, `src/policy/data/formsLibraryDataset.ts`,
`src/policy/data/masterControlDocumentation.generated.ts`, `src/policy/data/policy_hh_section_map.csv`),
which is an entirely separate application from the fictional EHR-prototype whose sole cited authority
for this screen is the Requirements addendum HTML. Per this session's own memory
(`policy-pnp-achc-qa-workflow.md`): that real Corridor/crosswalk audit **"has never yet run"** and its
referenced Corridor path "doesn't exist" as cited. That makes `BL‑03`'s "201 of 269 … awaiting SME
review" doubly unsupportable: it is not in the named canonical source, and the real system it borrows
its vocabulary from has no completed audit that could have produced that figure either.

**Effect on the reader:** `BlockerList` is rendered with full visual confidence (StatusChip "Blocking"/"At
risk", card styling identical to the fully-verified blockers) in *both* the Overview workspace
(RequirementsScreen.tsx:220‑246) and the Risks & Issues workspace (line 690) — a reader has no way to
tell that 2 of 5 rows (and specific sub-numbers in 2 more) are not traceable to the stated authority.

**Fix:** either cite a second, real source document for BL‑02/03/04's specific figures (if one exists and
was simply omitted from the "Canonical source" pointer given to this review), or rewrite those three rows
to state the qualitative gap only (as the source itself does) without inventing precise counts.

---

## Major findings

### 3. `RELEASES` (R0–R6 names) are not in the source — six of seven borrow unrelated Gate titles

`RELEASES` (requirementsSpec.ts:269‑277) gives each release a specific name: "Scope baseline," "Secure
synthetic foundation," "Limited-PHI authorization," "Read-only shadow workflow," "Clinical record pilot,"
"Revenue-cycle pilot," "Domain cutover & stabilization." The source states only that *"R0 through R6
describe delivery increments"* (L437) — it never names an individual release. A search confirms that
five of these six non-R0 names are lifted verbatim from the **Gate** section instead: `GATE 1` "Secure
synthetic foundation" (source L1649), `GATE 2` "Limited-PHI authorization" (L1659), `GATE 3` "Read-only
shadow workflow" (L1669), `GATE 4` "Clinical record pilot" (L1679), `GATE 5` "Revenue-cycle pilot"
(L1689), `GATE 6` "Domain cutover" (L1699). Reusing gate-decision titles as release names is a defensible
editorial bridge (gates plausibly gate releases 1:1), but it is presented in `ReleasesWorkspace`
(RequirementsScreen.tsx:302‑320) as if these are the document's actual release names, with no disclosure
that they were synthesized from the Gates section.

### 4. Document-control block is not verifiable against the cited source

`DOCUMENT_CONTROL` (requirementsSpec.ts:653‑662) — `documentId: 'CI-EHR-SRS-PM-001'`, `owner`,
`approvers`, `status: 'Draft for controlled approval'`, `deliveryStatus`, `changeRule` — is displayed with
full confidence in the page header chip (RequirementsScreen.tsx:51) and the Overview doc-control grid
(203‑214). Only the version string ("Version 1.1 · July 29, 2026," source L10/L1773) is confirmed in the
source; the document ID, the named approver categories, and the "Draft for controlled approval" /
"Second-pass unified baseline" labels do not occur anywhere in `requirements.txt`. (For comparison,
`businessPlan.ts` has no analogous document-control block at all, so this isn't an established, source‑
matched convention carried over from elsewhere in the app.) These are reasonable business fabrications
for a document mock-up, but should be flagged as editorially supplied rather than extracted fact, since
the task's own ground-truth checklist treats them as verifiable.

### 5. The app's blocker set doesn't 1:1 map to the source's four `BLOCKER` callouts

Beyond finding #2's numeric issue: the source has exactly four named blockers (`BLOCKER 01`–`04`,
L381‑395), while the app has five (`BL‑01`…`BL‑05`, requirementsSpec.ts:172‑203) that don't line up
positionally — source `BLOCKER 03` (workflow depth) is *not* represented as a risk/blocker row anywhere
in the app (its content is folded into `WORKFLOW_NOTE` instead), while the app's `BL‑03` (Corridor) is
new content with no source antecedent at all. `SPRINT_BOARD_NOTE` (requirementsSpec.ts:873‑874) says "the
source names the blockers" — true for BL‑01/02/04 in theme only, but false for BL‑03, which the source
never names in any form.

---

## Minor findings

### 6. One register row silently drops part of its "verbatim" text

`REQUIREMENT_REGISTER`'s `DAT-001` (requirementsSpec.ts:92) reads: *"…lineage, visible source and
last-updated time, reconciliation, and no direct clinical write-back."* The source's DAT-001 (L980) has
one more sentence after that: *"Calculations, unit conversions, and rule versions shall be explainable."*
This is the only truncation found across ~15 spot-checked rows (the other 44 were confirmed
character-for-character against source); it's minor, but the file's own header comment
(requirementsSpec.ts:14‑18) promises the sample is "verbatim … an HONEST, LABELED SAMPLE," so any silent
truncation should be avoided or noted.

### 7. "30 blockers flagged" vs. 5 rendered rows reads as self-contradictory in isolation

`BlockerList`'s card‑kicker literally says "30 blockers flagged" (RequirementsScreen.tsx:227) directly
above a list of exactly 5 rows. The intent (30 individual flagged items organized into 5 named groups) is
only spelled out in a *different* stat card's sub-label ("5 named blocker groups below,"
requirementsSpec.ts:142), not next to the list itself. Combined with finding #1 (the "30" figure itself
being unverifiable), this compounds into a confusing presentation.

### 8. `DEVELOPMENT_SEQUENCE` (7 steps) silently compresses the source's distinct 10-step sequence

Source section "06 · UI/UX prototyping & interface specification" (L285‑310) lists a **10**-step sequence
(Scope & outcomes → Epics & journeys → User stories → Information architecture → Low-fidelity prototype →
High-fidelity prototype → User validation → Build-ready specification → Development only → Verification &
release). `DEVELOPMENT_SEQUENCE` (requirementsSpec.ts:153‑161) instead shows **7** steps that merge this
with separately-described Gate‑0/backlog material (e.g., step 6 "Tasks, estimates, dependencies & sprint
authorization" isn't part of the source's 10-step UI/UX sequence at all). This is a legitimate editorial
synthesis — the themes are genuinely drawn from the source — but it's presented as *the* "Required
development sequence" without disclosing that it's a re-numbered composite of two different source lists.

---

## Honesty of gate posture (verified — largely good)

- `GATE_STATUS_LABEL`/`GATE_STATUS_DETAIL` (requirementsSpec.ts:554‑557) match the source's "Definition of
  complete" paragraph (L59) essentially verbatim, and are shown with a red `StatusChip` "Not build
  authorized" in both the rail (RequirementsScreen.tsx:73) and Overview (166) — correct and consistent.
- Forms & fields workspace correctly renders **0 / 349** as a bad/critical gate (RequirementsScreen.tsx:
  599‑619), matching source L341 exactly — no attempt to soften this into a percentage or green state.
- Workflow note correctly frames 166/166 as "coverage only," not completion (RequirementsScreen.tsx:629‑
  630), consistent with source's Blocker 03 theme (though its "1,108 steps" figure is unverified — see
  finding #1).
- `SprintWorkspace` explicitly states no column represents "in progress" or "shipped" work
  (`SPRINT_BOARD_NOTE`, requirementsSpec.ts:873‑874) and every epic queued at step 1 with "Queued — none
  have passed Gate 0" (RequirementsScreen.tsx:513) — good, no risk of a reader mistaking this for a real
  kanban board with completed work.
- `EPIC_CARDS` are honestly pinned at 0% planning progress with an explanatory note (`EPIC_PROGRESS_NOTE`,
  requirementsSpec.ts:802‑803) tied to the source's own "0 of 170 … crosswalk" statement (source L439) —
  correct and appropriately conservative.

No instance was found of the screen rendering an incomplete gate as complete/green.

---

## Sampling transparency (verified — mostly good, one issue)

- **Requirements register:** `RegisterWorkspace` states "Showing N of 170" (RequirementsScreen.tsx:560)
  and an explicit "labeled sample… drawn verbatim from source — never a substitute for the full 170-item
  register" (561) — good. Actual sample size is **46** rows (`REQUIREMENT_REGISTER.length`), not the "~42"
  approximation in the review brief — not a defect, just a correction for the record. All 27 domains are
  represented with at least one row (verified by count). Text is verbatim except finding #6's one
  truncation.
- **User stories:** honestly labeled as unauthored structural slots (`STORY_SLOT_NOTE`,
  requirementsSpec.ts:832‑833); the underlying 27×4=108 claim genuinely traces to source ("Every epic owns
  four testable delivery stories," source L423, L749). Good.
- **Tasks & backlog:** the bucket *names* (Increment 1‑14 + Unscheduled backlog) are a reasonable
  synthetic structure, but `TASKS_NOTE` falsely claims the *5,350* total and *15-bucket* breakdown come
  from the source (finding #1) — this is the one place sampling transparency fails outright, because the
  note asserts a false provenance rather than honestly flagging the figure as unsourced.

---

## Coverage gaps (workspace-by-workspace)

- **Workflows** (RequirementsScreen.tsx:626‑633) is the thinnest workspace in the app: a heading plus one
  warning note, with no table, list, or grouping — despite "166 workflow IDs" being one of the most
  frequently repeated figures in the source (appears in the nav badge, footer, gate criteria, and TRC‑003).
  Even without enumerable workflow IDs in the extracted source, this workspace could bucket the concept by
  the 27 domains (same pattern already used successfully in the Requirements register) or surface TRC‑003 /
  GOV‑006's full requirement text, which is only summarized in `WORKFLOW_NOTE`.
- **Risks & issues** (RequirementsScreen.tsx:686‑693) renders nothing beyond `<BlockerList/>`, an exact
  duplicate of the Overview workspace's blocker section — no distinct content, despite the source having
  additional risk-relevant material (e.g. QAP‑004's PIP/RCA/CAP framework) that isn't surfaced anywhere.
- **Releases & planning** is thin (7 cards + one paragraph) and, per finding #3, uses names not drawn from
  the source.
- **UI/UX inventory** shows only aggregate stat cards for pageviews (104) and elements (192/unverified) —
  no sample list of actual pageview or element names, unlike the Requirements register's 46-row sample.
  This may be an extraction limitation (the source's own text doesn't enumerate individual pageview/element
  names either — like the "192" figure, they may be JS-rendered elsewhere) rather than an authoring choice,
  but it leaves this workspace comparatively bare relative to what the source claims exists.
- **Two entire canonical sections have zero footprint anywhere in the app:**
  - Source section **"04 · Canonical resource map"** (L193‑238): ten well-structured FHIR resource
    groupings (Identity, Referral, Episode, OASIS, Plan + Orders, Delivery, Revenue, Trust + Evidence) plus
    the "FHIR modeling guardrail" callout about not misusing FHIR's `Evidence` resource. None of this
    appears in `ArchitectureWorkspace` or elsewhere.
  - Source section **"05 · Epic-informed workspaces"** (L240‑283): nine role-based workspace descriptions
    (Intake, Scheduler, Field Clinician, DON/Manager, QA/OASIS, Physician/Practitioner, Billing,
    Compliance/QAPI, Admin/Security) plus the "Universal work-item contract" definition. This is rich,
    ready-to-use content that is completely unused — it would be a strong fit for either a new workspace or
    an expansion of Architecture.

---

## Correctness / robustness (code-level)

- **`import type` usage:** correct throughout. `RequirementsScreen.tsx:2` (`import type { ReactNode }`)
  and `:21` (`import type { EpicCard, ReqPriority, WorkspaceKey }`) both correctly use `import type` for
  type-only imports per the project's `verbatimModuleSyntax` requirement; value imports (lucide icons, UI
  components, data constants) correctly use plain `import`. No violations found.
- **Typecheck:** `npx tsc --noEmit -p .` from the app root completed with zero errors/output.
- **Dev-server compile:** `curl -s -o /dev/null -w "%{http_code}"` returned `200` for
  `src/screens/RequirementsScreen.tsx`, `src/screens/req.css`, and `src/data/requirementsSpec.ts`.
- **List keys:** every `.map()` in the file keys on a stable, unique identifier (`b.id`, `e.id`, `r.id`,
  `g.id`, `a.id`, `step.n`, `layer.n`, `col.step`, etc.). The one index-keyed list (`Array.from({length:
  selected.storyCount}, (_, i) => <li key={i}>` in the epic drawer, RequirementsScreen.tsx:363‑365) is safe
  because the list is a fixed-length, never-reordered/filtered placeholder sequence — not a bug.
- **Filter/search logic:** `StoriesWorkspace` (384‑391), `TasksWorkspace` (463‑464), and `RegisterWorkspace`
  (544‑556) filter correctly on real fields with no off-by-one or wrong-field errors; empty states are
  present and correctly triggered in `StoriesWorkspace` (416) and `RegisterWorkspace` (585). No path exists
  where `TasksWorkspace`'s bucket filter can reach an empty result (the `<select>` only offers valid bucket
  ids), so the absence of an empty-state row there is not a gap.
- **CSS:** `req.css` uses exactly one raw hex (`#fff`, line 125, on the active nav badge) and the one
  documented `#FFD9C7` on-dark chip pairing (line 148) — consistent with the app-wide exception budget. No
  blue anywhere. Every class uses the `.req-` prefix except the deliberate, documented
  `.doc-content:has(.req-pm)` DocShell opt-out (lines 12‑13), which matches the known convention exception
  for this file.

No crash-risk or type-error bugs were found in the implementation files.

---

## Priority summary

| # | Finding | Severity |
|---|---|---|
| 1 | 5 headline stats (5,350 tasks / 15 buckets / 1,108 steps / 192 elements / 30 blockers) absent from cited source; `TASKS_NOTE` falsely claims "the source states" 5,350 | **Blocker** |
| 2 | 3 of 5 BL‑0x blockers carry specific figures/taxonomies (77, 201/269 Corridor, 11/8/6, CL‑PA/FN‑BL/IT‑AC) absent from source, apparently borrowed from an unrelated real system in this repo | **Blocker** |
| 3 | `RELEASES` names (R1‑R6) not in source — reused from Gate titles undisclosed | Major |
| 4 | `DOCUMENT_CONTROL` block (ID, owner, approvers, status) unverifiable against source | Major |
| 5 | App's 5 blockers don't 1:1 map to source's 4 named `BLOCKER` callouts | Major |
| 6 | `DAT-001` register row silently drops one source sentence | Minor |
| 7 | "30 blockers flagged" heading vs. 5 rendered rows, unexplained in place | Minor |
| 8 | `DEVELOPMENT_SEQUENCE` (7 steps) undisclosed synthesis of source's 10-step sequence + other sections | Minor |
| — | Workflows / Risks & Issues workspaces near-empty or duplicate; source sections 04 & 05 entirely unused | Coverage gap |
| — | No `import type`, key, filter, tsc, or compile bugs found | Clean |

---

## Notes for anyone continuing this work

1. Before trusting any of `5,350`, `15 buckets`, `1,108`, `192`, or `30`, re-extract
   *Care_Indeed_Home_Health_EHR_Complete_Requirements.html* **with JavaScript executed** — the literal
   em-dash at source line 314 (where "192" should be) proves at least one of these is a live-rendered
   counter the static-text extraction missed. If a JS-rendered re-extraction still doesn't produce these
   numbers, they should be relabeled as editorial placeholders, not asserted as source fact.
2. The BL‑02/03/04 sub-figures and vocabulary (Corridor, CL‑PA/FN‑BL/IT‑AC, HH‑map) trace to this repo's
   *separate* real Policy P&P ACHC-crosswalk system, not to the EHR Requirements document. If those figures
   are meant to be included, they need their own explicit source citation distinct from the Requirements
   addendum — right now the screen implies single-document provenance that doesn't hold up.
3. Sections 04 (Canonical resource map) and 05 (Epic-informed workspaces) of the source are fully
   verbatim-usable, well-structured content with no current home in the app — high-value, low-risk
   additions for a future pass.
