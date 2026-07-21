---
name: policy-pnp-achc-qa
description: Run the full Care Indeed Home Health P&P QA audit — evidence-based, read-only comparison of the V2 P&P system against the ACHC HH survey-readiness baseline PDF (coverage checklist only), the ACHC HH crosswalk, and CMS/California regulatory requirements — via the saved policy-pnp-achc-crosswalk-qa workflow. Use when the user invokes /policy-pnp-achc-qa or asks for the P&P ACHC crosswalk QA audit, survey-readiness gap audit, or HH tag confidence audit. Produces a timestamped report folder under UAT_Reports/; never modifies policy or app source.
---

# Policy P&P ACHC Crosswalk QA Audit

The user has opted into multi-agent orchestration by invoking this skill — run the saved Workflow; do not hand-roll agents unless the workflow file is missing.

This audit is **read-only and report-only**. Hard rules the workflow enforces (do not weaken them):

- No modification of policy content, app source, forms, templates, or docs — the only writes are into the new `UAT_Reports/POLICY_PNP_QA_ACHC_CROSSWALK_<timestamp>/` folder.
- No git mutations (no commits, stash, checkout, reset) at any point, including after the run.
- The baseline PDF (`CA ACHC HH PP 12-2025.docx (1).pdf`) and the Corridor-Alignment-Strategy folder are **proprietary references**: used as a minimum coverage checklist / mapping reference only. Copying their narrative language is a hard failure; an adversarial non-copying pass and a `NON_COPYING_ATTESTATION.md` enforce this.
- No invented citations, no fabricated ACHC/HH tags, no "survey ready" claims. Unverifiable items are labeled `REVIEW_REQUIRED`, never upgraded.
- Findings carry confidence (`HIGH`/`MEDIUM`/`LOW`/`REVIEW_REQUIRED`) and severity (`P0`–`P3`); the verdict (`PASS`/`CONDITIONAL PASS`/`NEEDS REMEDIATION`/`NO-GO`) is computed deterministically by the orchestrator script, and agents can only lower it, never raise it.

## Arguments

`$ARGUMENTS` (all optional):

- `corridorPath=<path>` — override the Corridor-Alignment-Strategy reference location (default: `C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Corridor-Alignment-Strategy`). If the default is missing, the audit still runs but the verdict is capped at CONDITIONAL PASS.
- `baselinePdf=<path>` — override the baseline reference PDF (default: `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/CA ACHC HH PP 12-2025.docx (1).pdf`).

## Preflight (do all before launching)

1. Confirm the working directory is `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2`. This workflow must not run from any other repo.
2. Confirm `.claude/workflows/policy-pnp-achc-crosswalk-qa.workflow.js` exists. If missing, follow the manual orchestration spec in `docs/Workflows/POLICY_PNP_ACHC_QA_MASTER_PROMPT.md` instead — it carries the full phase, guardrail, and gate-math spec; never improvise the audit from scratch.
3. Generate the run timestamp yourself (workflow scripts cannot call Date):
   ```powershell
   Get-Date -Format yyyy-MM-dd_HHmmss
   ```
4. Quick existence check of the baseline PDF (and corridor path if the user overrode it). If the baseline PDF is missing, stop and ask — the workflow would preflight to NO-GO anyway.
5. Do **not** stash, clean, or otherwise "tidy" the working tree first (see the no-stash-while-dev-server-runs memory). A dirty tree is fine — the workflow records it as a soft finding.

## Launch

```
Workflow({
  scriptPath: '.claude/workflows/policy-pnp-achc-crosswalk-qa.workflow.js',
  args: {
    timestamp: '<from step 3>',
    corridorPath: '<only if overridden>',
    baselinePdf: '<only if overridden>',
  }
})
```

It runs in the background (roughly 20–30 agents: preflight → inventory → baseline extraction/comparison → crosswalk + tag confidence → regulatory freshness → defensibility/linkage/app-rendering → 3 adversarial refuters → synthesis). All agent calls carry explicit model overrides (haiku for mechanical extraction/inventory/CSV work, sonnet for review/interpretation/synthesis) with bounded fan-out — if you ever extend the workflow, keep both properties.

While it runs, do not touch `UAT_Reports/`, the policy/app source, or git state — a post-run **source-integrity gate** compares fresh `git status --porcelain` output against the preflight snapshot and forces **NO-GO** if anything outside the report folder changed mid-run (nothing is auto-reverted; the changed paths are reported for human inspection).

## After the workflow returns

1. Report to the user: the **verdict** (and the deterministic **ceiling**, if the synthesis agent went lower), the **gate table** (`gateFailures` / `softFailures`), severity totals, baseline coverage totals, HH tag inflation count, adversarial pass results, and the report folder path.
2. List any `deliverables.missing`/`empty` files — 13 deliverables are expected; an incomplete set already forced a downgrade.
3. Surface every `REVIEW_REQUIRED` register (executive summary points at them) — these need human judgment, not re-running.
4. Execute `housekeepingForMainSession` from the result. In particular: **do not commit anything**; the audit output is for human review.
5. If the verdict is `NO-GO` or `NEEDS REMEDIATION`, walk the user through `ACTION_PLAN.md` P0 items first.

## What a verdict means

- `PASS` — all hard gates passed, zero P0 and zero P1 findings, no soft failures. Still **not** a "survey ready" claim — only "no blocking gaps found within audit scope".
- `CONDITIONAL PASS` — no hard-gate failures or P0s, but P1 findings and/or soft failures (e.g. corridor reference unavailable, dirty tree) exist.
- `NEEDS REMEDIATION` — any hard gate failed (baseline comparison incomplete, HH tag confidence inflated, critical app-rendered policies missing, core forms/workflows/evidence links missing, a required audit section failed, fewer than 3 adversarial passes completed), or any P0 finding, or adversarial violations left unresolved after the fix + re-verification round.
- `NO-GO` — source files unreadable (baseline PDF or app source), preflight failed, or the source-integrity gate detected mutations outside the report folder during the run. Nothing downstream is trustworthy.

A `PASS` is structurally impossible when baseline comparison is incomplete, sources are unreadable, HH confidence is inflated, critical app-rendered policies are missing, or required forms/workflows/evidence are missing — the orchestrator clamps the verdict regardless of what any agent writes.
