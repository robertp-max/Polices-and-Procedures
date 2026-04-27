# 04 — eCIgn Role / Permission Model

## Purpose
Define who can do what in the eCIgn-controlled form-submission lifecycle.

## Roles (CES-aligned)
| Role | Description |
|---|---|
| `Assignee` | Primary doer for a form-submission task. Drafts, submits, signs first signature when applicable. |
| `Required Signer` | Identified by `required_signers[]` on the eCIgn FormInstance. Must sign before lock. |
| `Approver` | Authorized to approve/reject a packet that requires approval (e.g. policy ack by manager). Tier ≥ assignee tier − 1. |
| `Reviewer` | Read-only on the packet; receives notifications. |
| `Observer / Watcher` | Read-only and notified. Set in PM overlay only. |
| `Administrator` | Can void instances (until lock), open returns-for-correction, manage role registry. |
| `Auditor` | Read-only across all packets, evidence, audit log; can export survey packets. |

## Permission matrix
| Action | Assignee | Signer | Approver | Reviewer | Watcher | Admin | Auditor |
|---|---|---|---|---|---|---|---|
| Create packet (POST /forms) | ✓ | – | – | – | – | ✓ | – |
| Disclosure / consent | ✓ | ✓ | – | – | – | – | – |
| Identity step-up (MFA) | ✓ | ✓ | ✓ | – | – | – | – |
| Field edit | ✓ | – | – | – | – | – | – |
| Acknowledge review | ✓ | ✓ | – | – | – | – | – |
| Apply signature | – | ✓ | – | – | – | – | – |
| Lock | ✓ (if all required signed) | ✓ | – | – | – | – | – |
| Approve / Reject | – | – | ✓ | – | – | – | – |
| Return for correction | – | – | ✓ | – | – | ✓ | – |
| Void (pre-lock) | ✓ | – | – | – | – | ✓ | – |
| Read packet | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Read evidence | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Verify hash chain | – | – | – | – | – | ✓ | ✓ |
| Mark CES task done | ✗ FORBIDDEN — derived only |
| Override weekend schedule | – | – | – | – | – | ✓ | – |

## Identity strength (step-up)
- High-impact forms (e.g. `CL-POC*`, `EN-FM-485`) require MFA token (`X-MFA-Token`) at signature step (existing).
- Approvers on these forms also require MFA at approve step.

## Tiering
- Approver must be `tier === signer.tier - 1` (existing rule in [FormSignatureFlow](../../src/policy/components/FormSignatureFlow.tsx)).
- Self-approval is rejected.

## Permission enforcement points
1. **Backend route guards** in [server/routes/ecign.ts](../../server/routes/ecign.ts) inspect headers (`X-User-Id`, `X-User-Role`, `X-User-Tier`, `X-MFA-Token`).
2. **State machine** in [server/ecign/stateMachine.ts](../../server/ecign/stateMachine.ts) rejects out-of-order actions.
3. **Frontend selector layer** filters notifications and read access by role; never the only line of defense.
4. **PM Right Panel** hides destructive actions a user cannot perform.

## Audit
Every permission-relevant action appends an `AuditRow` with `actor_user_id`, `role`, `tier`, `action`, `subject_id`, `result` (allow/deny). Denials are also logged.

## Backend contract impact
- No schema changes; relies on existing header-driven auth model.
- New (additive) administrative endpoint to manage weekend overrides — see [15](15-eCIgn-Developer-Implementation-Notes.md).

## UI behavior
- Buttons disabled with explanatory tooltip when role lacks permission.
- "Return for correction" requires a non-empty reason field; reason is appended to audit.
- "Approve" disabled until all required signatures present.

## Risks
| # | Risk | Mitigation |
|---|---|---|
| R1 | Header spoofing | Server-side identity service validates token; demo headers must not ship to prod |
| R2 | Approver tier misconfigured | Tier registry is data-driven; admin UI required to maintain |
| R3 | Self-approval | Backend rejection + UI hide |

## Acceptance criteria
- Matrix exists and is enforced at backend.
- Tier rule preserved.
- All denials audited.
- PM never grants a permission CES wouldn't grant.

## Verification checklist
- [ ] Matrix backed by route guards.
- [ ] MFA required on high-impact forms (sign + approve).
- [ ] Audit records denials.
- [ ] Right Panel hides forbidden actions per role.
