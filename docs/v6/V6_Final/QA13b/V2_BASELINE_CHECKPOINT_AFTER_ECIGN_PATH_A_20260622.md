# V2 Baseline Checkpoint After eCIgn Path A

Documentation/checkpoint only. No app code was edited; no merge/tag was performed to produce this
record. Date: 2026-06-22.

## 1. Current baseline

| Field | Value |
|---|---|
| Branch | `v2/designless-baseline` |
| HEAD | `6bd906f` — *feat(v6): replace ecign mock workspace with source-grounded model* |
| Pushed status | in sync with `origin/v2/designless-baseline` (0 ahead / 0 behind) |
| Tags at HEAD | `backup/phase16-ecign-path-a-v2-proof-20260622-144444` |

Recent backup tags on this line:
- `backup/phase15-policy-forms-reconnect-20260622-133129` (Policy/Forms Stage-B)
- `backup/phase16-form-viewer-border-cleanup-20260622-144128` (`e0faa8a`, Form Viewer border)
- `backup/phase16-ecign-path-a-v2-proof-20260622-144444` (`6bd906f`, eCIgn Path A — at HEAD)

## 2. Completed milestones now on baseline

- **V6 final integration baseline** (light design system; CES/QAPI swimlane routing preserved).
- **Policy Library** — 279 real policies.
- **Policy Lifecycle + detail** — real policy corpus (domain-grouped).
- **Forms Library** — 410 real forms.
- **Form Viewer** — real form data (graceful not-found).
- **Policy Detail** — real policy content and dynamic real-section rendering.
- **Form Viewer outer border cleanup** — only the document card's outer `border border-card` removed;
  white surface + `shadow-rest` (paper feel) retained; internal field borders and the left "Sections"
  rail border preserved.
- **eCIgn Path A** — source-grounded static model: real signer-role hierarchy, eCIgn permission-role
  ladder, signing lifecycle, certificate field schema, and versioned E-SIGN Act consent (real
  agreement version + deterministic consent-text hash). **No fabricated signer/package/audit data**;
  per-instance data is shown as explicit *source-unavailable* (Path B) panels.

## 3. eCIgn Path A proof

- **V2 server used: port `5200`** (V2's own Vite started from the V2 repo root; origin `localhost:5200`).
- **Old repo port `5199` was NOT used** for proof.
- **Routes proven (rendered, no redirect to /dashboard):**
  - `/forms/FN-F-004/esign`
  - `/forms/GV-FM-003/esign`
- **Visible proof summary:**
  - "eCIgn signing model" header — present.
  - Role hierarchy / authority model ("Signing role hierarchy", Governance → Governing Body, etc.) — present.
  - Lifecycle model — present.
  - Certificate / schema section — present.
  - Source-unavailable panels ("Path B" / "Live signature data") — present.
  - No fabricated signer names / status / hashes / IP / audit IDs — confirmed absent
    (no "Thomas Parker", no `GV-FM-006-2026-0619`, no `84f2…`/`c77e…`, no `192.0.2.44`).
  - **Console errors: 0.**
- **Corrected finding:** the earlier "eCIgn route unreachable / redirects to /dashboard" result was
  invalid — it came from the **old Mock 5 repo served on port 5199**, not V2. On V2 the route renders.

## 4. Non-negotiable eCIgn artifact rule (gates any Path B)

(Full text: `ECIGN_STAGE_B_READINESS_PLAN.md` — "HARD REQUIREMENT — eCIgn Signed Artifact Evidence Rule".)

- Metadata (formInstanceId, signer status, hashes, Drive IDs, audit rows) is **not** the evidence of record.
- The **actual signed PDF bytes** presented for signing are the evidence of record and must be saved verbatim.
- A defective PDF (bad logo/layout/missing image/formatting) at signing time must be **preserved as the
  signed record** — never regenerated, normalized, re-rendered, or replaced after signature.
- Multiple signers must preserve an **append-only artifact lineage** (version A → B → C), each signed
  version independently retrievable; earlier versions are never replaced.
- The **Evidence Center and Google Drive/evidence storage must point to / retain the actual signed PDF
  artifact**, not metadata alone.
- **Retention duration must be configurable and policy-confirmed** (no hardcoded 5/7 years without approval).
- **Path B must not proceed unless this rule is satisfied.**

## 5. Deferred work

- **eCIgn Path B** — real runtime/API adapter (live instances/signatures from `server/ecign` store).
- **Immutable signed-PDF artifact storage + versioning** (append-only A→B→C lineage).
- **Evidence Center artifact linkage** to the actual signed file.
- **Configurable retention policy** (policy-confirmed duration).
- **Cleanup/decision on remaining untracked QA13b docs** (other-lane findings; see §6).
- **Cleanup/decision on local logs/screenshots** (see §6).

## 6. Known untracked files (NOT committed)

The following are present in the working tree as **untracked** and are intentionally **not** part of
baseline (none committed by this checkpoint):

- `.vscode/settings.json`
- `docs/v6/V6_Final/QA13/V1_TO_V2_FUNCTIONAL_MIGRATION_QA.md`
- `docs/v6/V6_Final/QA13b/00-DEPLOYMENT-AND-SYNTHESIS-NOTE.md`
- `docs/v6/V6_Final/QA13b/ECIGN-SIGNATURE-FINDINGS.md`
- `docs/v6/V6_Final/QA13b/EVIDENCE-DRIVE-FINDINGS.md`
- `docs/v6/V6_Final/QA13b/JOURNEY-02-MODULE-PLAYER-FINDINGS.md`
- `docs/v6/V6_Final/QA13b/JOURNEY-04-ONBOARDING-V2-FINDINGS.md`
- `docs/v6/V6_Final/QA13b/LEAD-SYNTHESIS-PARTIALS-INDEX.md`
- `docs/v6/V6_Final/QA13b/ROUTE-NAV-02-CES-FINDINGS.md`
- `docs/v6/V6_Final/QA13b/SAFETY-REPO-01-FINDINGS.md`
- `docs/v6/V6_Final/QA13b/SAFETY-REPO-03-FINDINGS.md`
- `docs/v6/V6_Final/QA13b/VALIDATION-FINDINGS.md`
- `docs/v6/V6_Final/QA13b/WORKFLOW-SWIMLANE-FINDINGS.md`
- `lint-output.txt`, `npm-dev.log`, `preview-smoke.log`
- `tmp-ui-verify-screenshots/`

**Runtime drift note:** running V2 Vite can append records to `server/ecign/data/*.jsonl`
(`audit_events`, `document_versions`, `form_instances`). If present, this drift **must not be staged
or committed** — restore with `git checkout -- server/ecign/data/*.jsonl`. (None present at this checkpoint.)

## 7. Branch hygiene

- Baseline `v2/designless-baseline` @ `6bd906f` is **clean** (no tracked changes) and **safe for future
  branch creation** (branch off HEAD or any backup tag).
- Old feature branches (`phase16/form-viewer-remove-border`, `phase16/ecign-path-a-v2-visual-proof`,
  `phase16/ecign-stage-b-path-a-static-honest`, `phase15/policy-forms-data-reconnect`) may be **left
  preserved** unless the user approves cleanup.
- **No force push / no history rewrite occurred.** All integration was fast-forward; backup tags exist
  for each merged milestone.

## 8. Recommended next phase

- **Do not start Path B casually.** Path B is **MED-HIGH** architecture/integration work.
- First **plan Path B around the signed-PDF artifact evidence rule** (§4): define canonical PDF
  artifact creation, immutable storage, append-only multi-signer versioning, Drive/evidence retention,
  Evidence Center linkage to the real file, audit-links-not-replaces, and prevention of post-signature
  regeneration — before any implementation.
- Treat Path B as a separate, explicitly-authorized effort with its own readiness/QA gates.
