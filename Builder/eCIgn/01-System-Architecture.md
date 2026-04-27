# 01 · System Architecture

Covers Phases 1 (Design Enforcement), 2 (Legal + CoPs Enforcement), 6 (System Integration),
10 (Alignment with Existing System).

---

## 1. Design system (non-negotiable)

| Rule | Implementation |
|---|---|
| Single-pane UI, no layered cards | Workspace shell uses a flat surface (`bg-[#FAFBF8]`); modals reserved for second-signature assignment only |
| Two-panel layout | LEFT = document + signing progress · RIGHT = audit data, signer status, workflow context |
| All critical data visible in 1–2 interactions | Right rail always shows identity, IP, geo, device, document hash, signature state; no hover-only data |
| High-trust visual language | Brand tokens NAVY `#1A3778`, NAVY_DEEP `#122555`, ORANGE `#F04B22`, INK `#1F1C1B` (defined in `FormSigningWorkspace.tsx`) |
| No hidden navigation | Stepper (Sign → Verify → Review → Options) is always visible with current/complete state |

The reference layout matches the design at
[Builder/eCIgn/design](./design). The `Stepper`, `SignatureStep`, `VerifyStep`,
`ReviewStep`, and `FinalActionsStep` map 1:1 to the workspace state machine
(`step ∈ { sign, camera, done }` extended to 4 phases for clarity).

---

## 2. Frontend topology

```
src/
├── App.tsx                              # routing
├── policy/
│   ├── components/
│   │   ├── FormSigningWorkspace.tsx     # 4-step shell + canvas + camera + certificate builder
│   │   ├── FormSignatureContext.tsx     # types, demo session, geo, field-edit log
│   │   ├── FormSignatureFlow.tsx        # post-sign action banner + 2nd-sig modal
│   │   └── FormViewer.tsx               # form render (read-only template)
│   ├── pages/
│   │   ├── FormsPage.tsx                # signature dashboard (pending / completed / expired)
│   │   ├── FormPrintView.tsx            # /forms/:id/print  ← TEMPLATE LOCKED
│   │   └── AuditModePage.tsx            # admin compliance view
│   ├── audit/                           # audit aggregation, dependency check, export
│   ├── compliance/                      # compliance event evaluator + state machine
│   └── workflows/                       # workflow engine (signature is a step)
```

### Routes

| Route | Purpose | Notes |
|---|---|---|
| `/forms` | Signature dashboard | tabs: Pending · Completed · Expired |
| `/forms/:formId` | Form viewer + signing workspace | two-panel layout |
| `/forms/:formId/print` | Print template | **immutable** — see Outputs doc |
| `/audit` | Admin compliance view | flags, missing signatures |
| `/compliance/master-controls` | Master control inventory | governing-policy linkage |

---

## 3. Backend topology

```
server/
├── index.ts              # Express bootstrap
├── routes/
│   ├── ecign.ts          # signature, consent, attestation, certificate endpoints
│   ├── audit.ts          # immutable audit-trail append + export
│   ├── forms.ts          # form instance CRUD (signature triggers state transition)
│   └── compliance.ts     # compliance event ingestion
├── ia/                   # identity-assurance helpers (OTP, login, device fingerprint)
├── sync/                 # outbound integration (HR, billing unlock, QAPI close)
└── credentials/          # signing keypair, tenant config (HIPAA-isolated)
```

### Persistence strategy

| Store | Holds | Integrity |
|---|---|---|
| `documents.versions` | Immutable snapshot per version (`version_id`, SHA-256, byte length, MIME) | Append-only, verified on read |
| `signatures` | One row per `SignatureRecord` (FK to version_id) | Insert-only |
| `audit_events` | Append-only log of every state transition | Hash-chained: `event.hash = sha256(prev_hash ‖ payload)` |
| `consents` | ESIGN/UETA disclosure acceptance (one row per user × disclosure version) | Insert-only |
| `compliance_states` | Current state + history per compliance object | Versioned rows |

> **Mutability rule.** No table that touches a signed object exposes UPDATE or DELETE
> in production. All change is modeled as append. Rollback is performed by appending a
> reversing event and re-evaluating compliance state.

---

## 4. Integration map (Phase 6 + 10)

```
            ┌──────────────────────────────────────────────────────┐
            │                  POLICY LIBRARY                       │
            │  src/policy/data/policiesDataset.ts                   │
            └─────────────┬────────────────────────────────────────┘
                          │  governs
                          ▼
            ┌──────────────────────────────────────────────────────┐
            │              WORKFLOW ENGINE                          │
            │  src/policy/workflows/                                │
            │  step.kind = 'signature' triggers eCIgn               │
            └─────────────┬────────────────────────────────────────┘
                          │  emits
                          ▼
            ┌──────────────────────────────────────────────────────┐
            │             FORMS LIBRARY                             │
            │  formInstance ← formTemplate (immutable version)      │
            └─────────────┬────────────────────────────────────────┘
                          │  signature requested
                          ▼
            ┌──────────────────────────────────────────────────────┐
            │                  eCIgn                                │
            │  consent → identity → review → sign → attest → lock   │
            └─────────────┬────────────────────────────────────────┘
                          │  state transition
                          ▼
            ┌──────────────────────────────────────────────────────┐
            │     COMPLIANCE EVENT EVALUATOR                        │
            │  src/policy/compliance/evaluateEvent.ts               │
            │  - unlock billing (POC)                               │
            │  - close event (QAPI)                                 │
            │  - mark employee compliant (HR/policy ack)            │
            └─────────────┬────────────────────────────────────────┘
                          │  appends
                          ▼
            ┌──────────────────────────────────────────────────────┐
            │            IMMUTABLE AUDIT TRAIL                      │
            │  src/policy/audit/auditState.ts                       │
            └──────────────────────────────────────────────────────┘
```

Every signed document is uniquely addressable by the tuple
`(policy_id, workflow_instance_id, form_instance_id, user_id, event_id?)`.
This tuple is embedded in the certificate page footer and the watermark.
