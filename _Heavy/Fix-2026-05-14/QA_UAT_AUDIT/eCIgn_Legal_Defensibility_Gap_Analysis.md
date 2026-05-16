# eCIgn Architecture – Legal Defensibility & Evidence Binding Gap Analysis

**Date:** 2026-05-14  
**Context:** Part of the ongoing QA/UAT audit (full auto-pilot)  
**Focus:** Whether eCIgn-produced evidence is defensible, legally binding, and respects necessary constraints for Home Health compliance (ESIGN Act, UETA, ACHC, potential litigation).

---

## 1. Architecture Summary (Strengths)

### Cryptographic & Audit Integrity
- **Hash Chain** (`server/ecign/hashChain.ts`):
  - Every audit event includes `prev_hash`, `event_id` (ulid), `occurred_at_utc`.
  - Payload is canonicalized (sorted keys, recursive).
  - Hash = `sha256(prev_hash + '|' + canonical(payload))`.
  - `verifyChain()` recomputes from GENESIS and detects the first break.

- **Document + Manifest Hashing** (`server/ecign/integrity.ts` + `demoLocalApi.ts`):
  - `canonicalBytes(instance, version)` = `template_snapshot + sorted(field_values)`.
  - On lock: `document_hash` and `manifest_hash` are computed and stored.
  - `assertTemplateIntegrity()` prevents drift between rendered snapshot and stored version.

- **State Machine** (`server/ecign/stateMachine.ts`):
  - Strict forward transitions: `created → disclosed → verified → reviewed → attested → signed_locked`.
  - Terminal states: `signed_locked`, `voided`.
  - Out-of-order transitions are rejected at the API layer.

These elements provide strong technical non-repudiation and tamper evidence.

### Intent & Attribution
- Explicit consent disclosure + acceptance before signing.
- "Reviewed" state requires the signer to acknowledge the full document.
- Attestation text is captured.
- Network metadata (IP, geo, user-agent) is recorded on key actions.
- Actor identity (user_id, name, role, email, auth_method) is attached to every audit event.

### Evidence Mirroring
- After `document.locked`, the signature event is mirrored to the HHC evidence backend via `recordEsign` / `hhcEvidence.ts`.
- Includes `document_hash`, `signature_hash`, `form_instance_id`, `event_id`, `network_location`, etc.
- Retention policy is set (typically ~7 years based on audit events).

### Role & Constraint Enforcement (Client Side)
- `cesRoles.ts`: `CES_SIGNER_ROLES` explicitly excludes "DON Assistant".
- `isDonAssistant()` gates signing capability.
- Multi-signer support via `required_signers` array + `signerIndex` / `totalSigners`.
- `blocksOnSignerTasks` prevents parent form completion until all signers complete.

---

## 2. Gaps & Risks to Legal Defensibility

### 1. Server-Side Role Enforcement (Medium-High Risk)
- "Who can sign" logic lives primarily in client-side `cesRoles.ts` and `FormSigningWorkspace`.
- The eCIgn server (state machine + lock endpoint) does not appear to re-validate the caller's role against the form's `required_signers` before allowing `attested → signed_locked`.
- **Recommendation**: Add server-side assertion in the lock transition that the actor's role is in the required signers list for that form instance.

### 2. Field Completion Constraints Before Signing (Medium Risk)
- There is no visible enforcement that all required fields are filled before allowing the final transition to `signed_locked`.
- `assertTemplateIntegrity` only checks the template snapshot, not that required fields have non-empty values.
- A signer could theoretically reach the final signature step on an incomplete form.
- **Recommendation**: Add a "required fields complete" gate before `attested` or `signed_locked`.

### 3. Snapshot vs Live Data for Subsequent Signers (Medium Risk)
- For multi-signer flows, the second (and later) signers review a **static HTML snapshot** captured via `getPrintableFormHtml()` at the time the previous signer finalized (see `FormSigningWorkspace.tsx:1402`, `FormViewer.tsx:1350`).
- They do **not** receive a live, editable `FormViewer` instance with the previous data re-hydrated.
- While this is arguably defensible (they are attesting to the exact version presented), it creates a disconnect from the "live form" experience the first signer had.
- If the snapshot generation misses any dynamic content or styling, the second signer may be attesting to an incomplete representation.
- **Recommendation**: Ensure `getPrintableFormHtml()` is rigorously tested for fidelity, and document clearly that subsequent signers review a captured snapshot (not the live form).

### 4. Cross-System ID Linkage (High Risk – ties to P0-01)
- The eCIgn `form_instance_id` (FI-...) and the CES `canonicalFormInstanceId` (`{eventId}-{formId}-{seq}`) are related but not always consistently linked in evidence records.
- When multiple `signed_package` artifacts are created for the same `canonicalFormInstanceId` (due to the current `removeEvidence + uploadEvidence` pattern in `FormSigningWorkspace.tsx`), the chain of custody in Evidence Center and Audit Trail becomes ambiguous.
- This is the most significant current threat to defensibility for multi-signer forms.

### 5. Audit Event Granularity for "Review"
- The "document.reviewed" action exists, but it is a single boolean-like event.
- There is no detailed record of *which sections* or *which pages* the signer actually scrolled through or spent time on.
- In high-stakes litigation, a signer could claim they did not meaningfully review the document.
- **Recommendation**: Consider capturing more granular review telemetry (e.g., scroll depth, time spent on sections) if stronger non-repudiation of review is required.

---

## 3. Overall Assessment

**Strengths**: The combination of hash chain, strict state machine, template+field canonical hashing, network metadata, consent, and evidence mirroring provides a **solid technical foundation** for legally defensible electronic signatures.

**Weaknesses**: 
- Several important constraints (role authorization, field completeness, snapshot fidelity for multi-signer review) are either client-side only or not explicitly enforced at the point of lock.
- The current multi-signer artifact handling (P0-01) creates the biggest current risk to clean chain-of-custody in Evidence Center and Audit Trail.

**Verdict**: The architecture is **directionally compliant and defensible**, but has material gaps that should be closed before relying on it for high-stakes clinical or compliance evidence that may face external audit or litigation.

---

## 4. Recommended Next Actions (Pre-Approved per QA/UAT Charter)

1. Add server-side role + required-fields gates before `signed_locked`.
2. Strengthen and document the snapshot mechanism for subsequent signers.
3. Fix the multi-signer artifact identity issue (P0-01) so that Evidence and Audit Trail maintain a single canonical `linkedFormInstanceId` chain.
4. Consider adding more granular review telemetry if stronger "I actually read it" proof is needed.

---

**Document Status**: Living analysis. Will be updated as the deep trace continues.