# Brad + Nolan Dual-Agent Security Architecture

**Branch:** `evidence`  ·  **Scope:** server-side code hardening (mock-first MVP harness).
**Status:** `PARTIAL — DUAL-AGENT CODE HARDENED, CLOUD SECURITY DEPLOYMENT REQUIRED`.

> Code boundaries are implemented + verified (`scripts/verifyBradNolanIsolation.ts` → **30/30 pass**, exit 0).
> Cloud/network controls (BAA, VPC-SC, CMEK, separate GCP projects, pentest, human
> sign-off) are **not deployable from code** and remain unverified — Brad's PHI mode
> therefore **fails closed**. Separately: the interactive Brad/iAdministrator chat UI
> was pruned on `evidence` (only a static `BradScreen` remains), so the UI components
> here are ready-to-mount but **not wired**, and **no browser smoke** was run.

## Model configuration
- `BRAD_MODEL_ID = gemini-3.5-flash`, `NOLAN_MODEL_ID = gemini-3.5-flash` (server-side config only; no key in frontend JS).
- MVP runs **mock** adapters (output flagged `synthetic`, never presented as live Gemini). The Vertex adapters **validate availability and fail closed** — `gemini-3.5-flash` is not verified-available in any configured project/region, so Vertex modes do not activate and never silently downgrade.
- System prompts are versioned + hashed (`BRAD_PROMPT_VERSION`, `NOLAN_PROMPT_VERSION`); model ID, prompt version, request ID, and mode are logged per invocation.

## Components (`server/ia/harness/`)
`types.ts` (contract) · `config.ts` (server env + `assertSeparateIdentities`) · `PhiEgressGuard.ts` · `BradPhiReadinessGate.ts` · `WebContentSafetyGuard.ts` · `PublicResearchPolicy.ts` · `AgentAuditLogger.ts` · `BradRuntime.ts` · `NolanRuntime.ts` · `BradNolanRelay.ts` · `modelAdapters/{MockBrad,VertexBrad,MockNolan,VertexNolan}Adapter.ts`. UI: `src/policy/pages/iAdministrator/{AgentRuntimeBadge,NolanResearchCitationCard}.tsx`. Tests: `scripts/verifyBradNolanIsolation.ts`.

---

### A. Trust-zone matrix

| Capability | Brad | Nolan | Relay | Reason |
| --- | :--: | :--: | :--: | --- |
| Internet / web search / browser | ❌ | ✅ | ❌ | `BradModelAdapter.canReachInternet:false` (type-level); Nolan is the only egress path |
| Internal app data (CES, events, evidence) | ✅ (approved) | ❌ | ❌ | Nolan imports no internal modules (verified) |
| PHI | ✅ only in verified `vertex-phi` | ❌ never | ❌ (blocks it) | Readiness gate + PHI Egress Guard |
| Google Drive / Salesforce / eCign | ✅ (approved) | ❌ | ❌ | No Nolan credentials/imports |
| Initiate cross-agent call | calls relay | ❌ cannot call Brad | mediates | Nolan is passive; relay is Brad-invoked |
| Trigger CAP/PIP/disciplinary/admin/code | via internal validation + human approval | ❌ | ❌ | Relay output is `untrusted-external`, data-only |
| Generate OTP | ❌ (deterministic service) | ❌ | ❌ | No OTP code in harness (verified) |

### B. Data-access matrix

| Data class | Brad mock | Brad PHI mode (gate-pass) | Nolan | Relay |
| --- | :--: | :--: | :--: | :--: |
| Public | ✅ | ✅ | ✅ | ✅ (sanitized Q only) |
| Internal | ✅ | ✅ | ❌ | ❌ |
| Confidential | ✅ | ✅ | ❌ | ❌ |
| PII | ❌ (blocked) | ✅ (approved) | ❌ | ❌ (blocks) |
| PHI | ❌ (blocked) | ✅ (approved, in-zone) | ❌ | ❌ (blocks) |
| Credentials | ❌ | ❌ (Secret Mgr only) | ❌ | ❌ |
| OTP | ❌ | ❌ | ❌ | ❌ |
| Event packets | ✅ (in-zone) | ✅ (in-zone) | ❌ | ❌ (blocks) |
| Patient/client/clinician JSON | ❌ | ✅ (in-zone) | ❌ | ❌ (blocks) |
| Google Drive drafts | ✅ (approved) | ✅ (approved) | ❌ | ❌ |
| Audit logs | Brad log | Brad log | Nolan log (PHI-free) | Relay log |

### C. Tool-access matrix

| Tool | Brad | Nolan | Deterministic approval required? |
| --- | :--: | :--: | :--: |
| Internal RAG / retrieval | ✅ | ❌ | n/a |
| Web search / grounding | ❌ | ✅ | n/a |
| Arbitrary URL fetch / browser | ❌ | ❌ (allowlisted public only) | n/a |
| Nolan Relay (research) | ✅ | n/a | Egress guard (auto, default-block) |
| Packet/form generation | ✅ | ❌ | Yes (internal validation) |
| Admin mutation / signer assignment | proposes only | ❌ | Yes (actor auth + diff + confirm) |
| Git commit / push | ❌ (model) | ❌ | Yes (explicit user authorization) |
| OTP generation | ❌ | ❌ | Yes (deterministic identity/OTP service) |

### D. PHI readiness ledger

(`BradPhiReadinessGate` — fail-closed; attestation flags `BRAD_GATE_*`. None set in MVP → gate **not ready**.)

| Control | Required | Verified (MVP) | Evidence / mechanism | Blocking? |
| --- | :--: | :--: | --- | :--: |
| Google Cloud BAA executed | ✅ | ❌ | `BRAD_GATE_BAA_EXECUTED` | critical |
| Services BAA-covered | ✅ | ❌ | `BRAD_GATE_SERVICES_COVERED` | critical |
| Correct org/project | ✅ | ❌ | `BRAD_GATE_ORG_PROJECT` | critical |
| Prod/non-prod separation | ✅ | ❌ | `BRAD_GATE_PROD_SEPARATION` | high |
| Least-privilege SA | ✅ | ❌ | `BRAD_GATE_LEAST_PRIV_SA` | critical |
| No long-lived creds in source | ✅ | ❌ | `BRAD_GATE_NO_LONGLIVED_CREDS` | critical |
| Secret Manager | ✅ | ❌ | `BRAD_GATE_SECRET_MANAGER` | high |
| VPC-SC perimeter | ✅ | ❌ | `BRAD_GATE_VPC_SC` | critical |
| Internet egress blocked (network) | ✅ | ❌ | `BRAD_GATE_INTERNET_BLOCKED` | critical |
| Web tools disabled (Brad) | ✅ | ✅ | code: `canReachInternet:false` | critical |
| Private Google API access | ✅ | ❌ | `BRAD_GATE_PRIVATE_GOOGLE_ACCESS` | high |
| CMEK | ✅ | ❌ | `BRAD_GATE_CMEK` | medium |
| Approved region | ✅ | ❌ | `BRAD_GATE_APPROVED_REGION` | high |
| Audit logging | ✅ | ❌ | `BRAD_GATE_AUDIT_LOGGING` | high |
| PHI excluded from names/labels/logs | ✅ | ❌ | `BRAD_GATE_PHI_EXCLUDED_LOGS` + Nolan-log scrub | critical |
| Retention policy approved | ✅ | ❌ | `BRAD_GATE_RETENTION_APPROVED` | high |
| Internal PHI store approved | ✅ | ❌ | `BRAD_GATE_INTERNAL_STORE_APPROVED` | high |
| Cross-tenant isolation | ✅ | ❌ | `BRAD_GATE_TENANT_ISOLATION` | critical |
| Pentest + PHI-egress tests | ✅ | ❌ | `BRAD_GATE_PENTEST_PASSED` | critical |
| Separate Brad/Nolan identities | ✅ | ✅ | code: `assertSeparateIdentities` | critical |
| Human security/compliance sign-off | ✅ | ❌ | `BRAD_GATE_HUMAN_SIGNOFF` | critical |

→ **PHI gate result: NOT READY.** `vertex-phi` cannot activate; PHI prompts blocked from model calls.

### E. Nolan configuration reconciliation (vs. CNA repo)

The CNA repo (`CNA_Recertification_Theory_Clinical_Support`) has **no "Nolan"** and **no internet/search agent**. Its equivalent is **"Nia"** (course-grounded learner assistant, local RAG only). Sound *patterns* were re-implemented in V2 (no code/secrets/Moodle/cert logic copied).

| CNA (Nia) source | Pattern found | Reused | Modified | Rejected | Reason |
| --- | --- | :--: | :--: | :--: | --- |
| `providers/*NiaProvider.ts` + `types.ts` | Provider interface + deterministic fallback | ✅ | adapted | | → `BradModelAdapter`/`NolanModelAdapter` + Mock adapters |
| `niaGuardrails.ts` (`screenInput/Output`, `PHI_PATTERNS`) | PHI regex + output scrub + fiction exception | ✅ | adapted | | → `PhiEgressGuard` (block-by-default) + Nolan log scrub |
| `NiaCitationCards.tsx` + citation types | Structured citation pipeline | ✅ | adapted | | → `NolanSource` + `NolanResearchCitationCard` |
| `.env.example` split (public toggle vs server secret) | No key in browser | ✅ | adapted | | → `config.ts` server-only, no frontend key |
| `__tests__/nia*.test.ts` | Pure-function safety tests | ✅ | adapted | | → `verifyBradNolanIsolation.ts` (30 tests) |
| Internet/search tool | NONE (Nia is local-only) | | | ✅ built fresh | Nia has no web capability to reuse |
| Tool-calling registry | NONE (action registry only) | | | ✅ N/A | No LLM tool dispatch needed for MVP |
| Logging infra | NONE meaningful | | | ✅ built fresh | `AgentAuditLogger` (separated Brad/Nolan/relay) |
| Moodle / CNA cert logic | (present) | | | ✅ rejected | Out of scope; not copied |

### F. Data-flow diagram

```text
PHI ZONE (no internet)
[User] → [Brad UI] → [Brad Secure Runtime] → [Internal Tools / PHI (approved mode only)]

PUBLIC ZONE
[Nolan Runtime] → [Public Internet (allowlisted, citations required)]

ONLY BRIDGE (audited, deterministic)
[Brad] → [PHI Egress Guard (default BLOCK)] → [Nolan Relay] → [Nolan]
[Nolan] → [Web Content Safety Guard] → [Brad]  (result = UNTRUSTED external data; cannot trigger actions)
```

## Honest blockers / remaining work
1. **Cloud security not deployed** — BAA, VPC-SC, CMEK, separate GCP projects + SAs, pentest, human sign-off. Until attested (`BRAD_GATE_*`), PHI mode stays fail-closed.
2. **Interactive Brad UI pruned on `evidence`** — `AgentRuntimeBadge`/`NolanResearchCitationCard` are ready but not mounted; no browser smoke possible here.
3. **Vertex adapters are fail-closed stubs** — live Gemini/grounding wiring deferred to the cloud phase (with model-availability validation).
4. **PHI Egress Guard is heuristic** (regex + block-by-default) — recall is bounded; production should add a classifier + DLP and the pentest gate before PHI mode.

## Adversarial hardening pass (applied)
An adversarial review of the harness drove these fixes (all re-verified, 30/30):
- **Relay-bypass closed (was critical):** `NolanRuntime.research()` is now capability-gated by a private symbol the relay owns — an in-process caller can no longer reach Nolan and skip the egress guard. (Test 8.)
- **Egress recall widened:** SSN with `.`/space separators, **international/E.164 phones**, **9+ digit runs** (bare SSN/MRN/PAN), **"born"-context** DOB, **base64url + short (≥16) base64**, and **percent-encoded** payloads are now decoded/blocked. (Test 9.)
- **Nolan logs store only the query *hash*** (never the text) → PHI cannot land in a Nolan log regardless of scanner recall. All Brad/relay log string fields are scrubbed; OTP/secret scrubbers broadened (spaced/keyword-proximate OTP, `Bearer`, prose secrets).
- **Identity separation** now fails when project IDs/service accounts are unset (not just equal).

**Residual (documented) gaps** — require the classifier + pentest gate, not regex: homoglyph/Unicode-substituted names, rare-diagnosis indirect re-identification, rot13/novel ciphers, and bare full-names with **no** clinical/person-context word (not blocked, to avoid over-blocking legitimate org names like "Joint Commission" in regulatory research). These are why `vertex-phi` stays gated behind `pentest-egress` + human sign-off.
