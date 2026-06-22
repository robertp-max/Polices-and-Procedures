# eCIgn Workspace — Stage-B Readiness Plan (read-only analysis)

Read-only readiness assessment for reconnecting the V6 eCIgn Workspace to real preserved data.
No code was edited, staged, committed, pushed, or tagged. This is a plan only.

---

## STATUS: NEEDS CONFIRMATION

eCIgn is **not blocked** — the screen exists, real sources exist, and a fully honest
de-fabrication pass is achievable at LOW risk. It is **not cleanly READY** because, unlike Forms
and Policy (which reconnected from **client-importable static datasets**), eCIgn's real
*per-instance* data (signatures, signer names, instance IDs, timestamps, hashes, audit trail)
lives **server-side** in `server/ecign/data/*.jsonl` behind `server/ecign/store.ts` + HTTP
`api.ts`. The V6 client screen cannot import those statically. That forces a scope decision the
user must confirm before implementation:

- **Path A — static-honest de-fabrication (recommended, LOW risk):** map only client-importable
  real structure (role hierarchy, signing-flow model, certificate field schema) and mark every
  per-instance value (signer names, status, IDs, timestamps, hashes, IP) as *source-unavailable*.
  No server dependency; removes all fabrication; consistent with the Forms/Policy approach.
- **Path B — live read-only API adapter (MED-HIGH risk):** fetch real instances/signatures from
  the eCIgn server API at runtime. Shows real data (377 instances / 55 signatures) but adds a
  runtime server dependency, is not exercised by the static `verify:designless`/build gate, and
  departs from the "pure static, no bulk re-include" pattern used so far.

**Confirmation needed:** Path A only now, or Path A + a later explicitly-scoped Path B?

---

## ⛔ HARD REQUIREMENT — eCIgn Signed Artifact Evidence Rule (NON-NEGOTIABLE)

**This rule gates ANY eCIgn Stage-B merge and ALL Path B / signing-pipeline work. It is not
optional and must not be reinterpreted, deferred, or satisfied by metadata alone.**

eCIgn evidence must preserve the **actual signed PDF artifact** — the exact bytes presented for
signing — not just metadata.

- The exact PDF bytes presented to the signer are the **signed artifact of record** and must be
  saved verbatim.
- If that PDF had a bad logo, layout issue, rendering defect, missing image, or formatting problem
  at signing time, **that defective PDF is still the signed record and must be preserved as-is**.
- **Do not** regenerate, "fix," normalize, or re-render the PDF after signature and present it as
  the signed artifact. Post-signature regeneration/replacement is prohibited.
- Metadata (formInstanceId, signer status, hashes, Drive IDs, audit rows) is **only an index/audit
  layer**. Metadata alone is **not** sufficient evidence.
- The **Evidence Center must link to the saved signed PDF artifact** itself.
- Google Drive / evidence storage must **retain the signed PDF artifact bytes**, not just references.
- **Multi-signer artifact chain (append-only, fully traceable):**
  - signer 1 signs PDF **version A**
  - signer 2 signs the same lineage → **version B**
  - signer 3 signs that lineage → **version C**
  - every signed version / append-only signature state remains independently retrievable; earlier
    signed versions are **never** replaced by a later regenerated version.
- The system must be able to retrieve the actual signed PDF for the **policy-configured retention
  period**. Retention duration is **configurable and policy-confirmed** — do **not** hardcode
  "5 years" / "7 years" unless explicitly approved.

**Path B (and any signing/write pipeline) precondition — architecture must define ALL of:**
1. Canonical PDF artifact creation (the bytes shown for signing == the bytes stored).
2. Immutable signed-PDF storage (write-once; no overwrite/replace).
3. Artifact versioning for multiple signers (append-only A→B→C lineage).
4. Drive / evidence file retention of the artifact bytes (configurable duration).
5. Evidence Center linkage to the actual signed file (not a regenerated copy).
6. Audit metadata **linked to** the artifact, never **replacing** it.
7. Prevention of post-signature PDF regeneration / replacement.

> Relationship to this plan: the readiness plan's **Path B is a read-only display adapter** for the
> Workspace *screen* and does not itself create artifacts — but it must read from a signing pipeline
> that already satisfies this rule. Existing sources `captureSignedFormSnapshot.ts` and
> `pdfAppendUtil.ts` (snapshot + append) are consistent with it; nothing in this plan or the current
> eCIgn/evidence code **contradicts** it (no PDF regeneration and no hardcoded retention were found).
> The plan was previously **silent** on artifact-byte preservation; this section closes that gap and
> makes it a merge gate.

---

## SOURCE MAP

### Current V6 eCIgn screen file
- `src/v6/screens/pageviews/EcignWorkspaceScreen.tsx` — 100% mock/static. Hard-codes signer names
  (Thomas Parker / Alexandra Rivera / Mei Chen), a form-instance ID (`GV-FM-006-2026-0619`),
  document/manifest hashes (`sha256: 84f2…`), IP (`192.0.2.44`), step progress values, and
  certificate state. Route: `/forms/:formId/esign`.

### Real eCIgn source files (`src/policy/ecign/**`) — client-importable (static, pure)
- `signerHierarchy.ts` — `SIGNER_HIERARCHY_RULES` (per-domain owner/reviewer/signer/finalApprover
  **roles** + `governingBodyRequired`) and `ROLE_ALIASES`. **Real, importable, role-level only.**
- `signerAuthority.ts`, `permissionRoles.ts` — role authority + `ECIgnPermissionRole` config. Real.
- `ecignAgreement.ts` — consent/agreement text + version. Real.
- `types.ts` — full canonical models: `SignatureRequirement`, `SignatureTaskRecord`,
  `ResolvedSignaturePath`, `ECIgnConsentProfile`, `ECIgnSignatureProfile`, `ECIgnSignatureRecord`,
  `ECIgnCertificate`, `ECIgnSignReadiness`, status/method/block-reason enums. **Real schema.**
- `signatureTaskBuilder.ts`, `resolveCanonicalSignedPackage.ts`, `validateRequiredFields.ts`,
  `roleKey.ts` — pure logic/derivation (no embedded data). Usable to derive the flow model.

### Signature / task / form-instance source files — runtime / server (NOT client-static)
- `server/ecign/data/form_instances.jsonl` — **377** records (`instance_id`, `form_id`,
  `document_version_id`, `state`, `required_signers`, `role`, `tier`, `field_values`, `created_at_utc`).
- `server/ecign/data/signatures.jsonl` — **55** records (`signature_id`, `instance_id`, `field_id`,
  `signer_user_id`, `signer_name`, `signer_role`, `signer_email`, `signed_at_utc`, `signature_png`,
  `signature_hash`, `attestation_text_hash`).
- `server/ecign/data/consents.jsonl` (48), `document_versions.jsonl` (114).
- `server/ecign/store.ts` + `src/policy/ecign/api.ts` / `demoLocalApi.ts` — the only access path
  (server fs / HTTP). `ecignConsentStore.ts`, `ecignSignatureProfileStore.ts`,
  `ecignSignatureRecordStore.ts` — **runtime client stores**, empty until a signing session runs.
- `useEcignInstance.ts`, `useEcignSession.ts`, `signerIdentity.ts` — runtime hooks (session-bound).

### Evidence / locked-package source files
- `server/ecign/data/audit_events.jsonl` — **316** records (audit trail; server-only).
- `captureSignedFormSnapshot.ts`, `ecignCertificateBuilder.ts`, `hhcEvidence.ts`,
  `pdfAppendUtil.ts`, `buildSignerRosterHtml.ts` — locked-snapshot / certificate / evidence
  builders (logic; produce artifacts at signing time, no standalone client dataset).
- Per `EVIDENCE-DRIVE-FINDINGS.md` (this folder): evidence/Drive metadata model preserved via
  `regulatoryExecutionStore.ts` + `server/googleEvidence.ts` (separate from the eCIgn screen).

### Fields available (client-static, no fabrication)
- Signer **roles** per domain & ordered role sequence (owner → reviewer → signer → final approver,
  governing-body flag) — from `SIGNER_HIERARCHY_RULES`.
- Signing **flow model**: the 6 canonical checkpoints (consent → identity → review → signature →
  attestation → lock) and their status vocabulary — from `types.ts` enums + flow logic.
- **Certificate field schema** (what a certificate records) and consent/signature **method** options
  — from `ECIgnCertificate` / `ECIgnSignatureProfile` types. Schema only, not values.

### Fields unavailable (server-only → must be marked source-unavailable in a static screen)
- Real signer **names / emails / user IDs**, real **signature status** per instance,
  **form-instance IDs**, **timestamps** (`signed_at_utc`), document/manifest **hashes**,
  **certificate IDs**, **IP / device** evidence, and the **audit trail** — all server jsonl,
  reachable only via the eCIgn API at runtime (Path B).

---

## GAP ANALYSIS

| Section (current mock) | Real source available? | Source-unavailable until live API | Risk if reconnected |
|---|---|---|---|
| Metric tiles (step readiness, active/queued signers, cert state) | Counts derivable from flow model; live counts need API | live instance counts | LOW (structure) / MED (live counts) |
| Signing steps (6-step flow) | YES — flow model + status enums are real | per-instance progress %/status | LOW |
| Signer sequence (names: Parker/Rivera/Chen) | Roles only (real); **names are server-only** | signer names/emails/status/due | HIGH (names are fabricated today) |
| Document lines / disclosure / linked policy | Linked-policy relationship derivable; instance specifics server-only | instance field values, review state | MED |
| Typed-signature pad + modal | UI control real; bound signer identity server-only | signer profile, IP/device | MED |
| Certificate rows (instance ID, hashes, IP, timestamp) | Schema real; **values server-only** | every value | HIGH (all fabricated today) |
| Readiness / action panels | Flow model real; live state server-only | live signer state | LOW–MED |

Overall: structure/roles/schema = **LOW** risk to reconnect statically; every per-instance
identity/status/hash/timestamp = **HIGH** risk (currently fabricated) and must become real (Path B)
or be explicitly labeled source-unavailable (Path A).

---

## RECONNECTION PLAN

- **Phase 1 — read-only source adapter.** Add a thin, dependency-light adapter that exposes only
  client-importable real structure (`SIGNER_HIERARCHY_RULES`, role ordering, flow-step model,
  certificate schema). No server calls in Path A. No writes. No new runtime deps.
- **Phase 2 — show real form/signature package list.** Render the real signing-flow model and the
  real domain role sequence. (Path B option: list real instances/signatures from the API.)
- **Phase 3 — show signer/task status if source exists.** Replace mock signer **names** with real
  **role-based** sequence; show per-signer status only if a real source is wired (else source-unavailable).
- **Phase 4 — show locked evidence/package references if source exists.** Surface certificate
  **schema** and the evidence-package relationship; show real hashes/IDs only via API (Path B),
  otherwise source-unavailable.
- **Phase 5 — preserve mock-only sections only if clearly labeled source-unavailable.** Any panel
  without a real source (specific names, hashes, IPs, timestamps, audit entries) is replaced with an
  explicit *source-unavailable* state — never fabricated values.
- **Phase 6 — validation and visual QA.** `npm run build` + `npm run verify:designless` + `tsc`;
  visual smoke of `/forms/:formId/esign`; confirm CES/QAPI and Form Viewer/Evidence behavior unchanged.

---

## DO-NOT-FABRICATE LIST

Never invent any of the following — show real (from a wired source) or mark *source-unavailable*:

- Signer **names / roles** (real roles come from hierarchy; real names are server-only).
- Signature **status**.
- Form **instance IDs**.
- **Timestamps** (signed-at, due).
- **Locked package state**.
- **Evidence IDs**.
- **Audit trail** entries.
- **Approver identity** (and IP / device / hashes / certificate IDs).

Likewise **do not destroy or substitute** the signed artifact: never regenerate/normalize/re-render
a signed PDF, never replace an earlier signed version, and never present a metadata record in place
of the actual signed PDF bytes (see the HARD REQUIREMENT above).

---

## ACCEPTANCE CRITERIA

- eCIgn Workspace uses real source data where available (role hierarchy, flow model, certificate schema; plus live instances/signatures if Path B is authorized).
- Mock data removed or explicitly marked **source-unavailable** — no leftover hard-coded names/hashes/IPs.
- No fake signer / signature / audit status anywhere.
- Existing Form Viewer and evidence behavior preserved (no regression to `/forms`, Evidence Center, or Drive metadata).
- CES / QAPI unaffected (no edits outside the eCIgn screen + its read-only adapter).
- `npm run build`, `npm run verify:designless`, and `tsc` all pass.

**Signed-artifact evidence (HARD gate — required before any Stage-B merge / Path B):**
- The exact signed PDF bytes are stored immutably as the artifact of record (defects preserved, not "fixed").
- No post-signature regeneration, normalization, re-render, or replacement of signed PDFs.
- Multi-signer lineage (A→B→C) is append-only and every signed version is independently retrievable.
- Evidence Center and Drive/evidence storage link to / retain the **actual signed PDF**, not metadata alone.
- Audit metadata links to the artifact and never substitutes for it.
- Retention duration is policy-configurable and confirmed (no hardcoded 5/7-year value without approval).

---

## SMALLEST SAFE STAGE-B PASS (recommended)

**Path A, Phases 1–3 + 5–6, no server dependency.** De-fabricate the screen: map the real role
hierarchy and the real 6-step flow model, render the signer sequence by **role** (not invented
names), and replace every per-instance value (names, status, instance IDs, hashes, IP, timestamps,
audit) with explicit *source-unavailable* states. Defer the live read-only API adapter (Path B,
real 377 instances / 55 signatures) to a separate, explicitly-authorized pass. This removes all
fabrication immediately at LOW risk while keeping the door open for live data later.
