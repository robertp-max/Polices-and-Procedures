# 04 — CES Integration

## Purpose

Onboarding is not a parallel system. Every onboarding execution unit lives inside the Compliance Execution Sprint (CES) system. This document specifies the contract.

---

## 1. Integration Principles

1. **Single execution surface**: CES Sprint Board is the only place work is executed.
2. **Single calendar**: Compliance Calendar is the only place deadlines are surfaced.
3. **Single audit ledger**: Audit Mode reads onboarding events from the same ledger as all other CES events.
4. **Single signature pipeline**: All onboarding signatures route through eCIgn.
5. **Single readiness score**: Onboarding completeness contributes to the agency-wide audit readiness score.

---

## 2. Mapping Onboarding → CES Primitives

| Onboarding Object | CES Object (per CES docs 01–06) |
|-------------------|---------------------------------|
| `OnboardingExecutionBatch` | A scoped **Sprint Bundle** (per CES Work Bundling, doc 05) |
| `OnboardingExecutionUnit` | A **Sprint Execution Unit** (per CES Sprint Structure, doc 02) |
| `RoleRequirement` | The driving spec behind the unit (CES Workflow-Based Execution, doc 03) |
| Onboarding deadline | A **Compliance Calendar entry** (per CES Calendar Integration, doc 09) |
| Recurring revalidation | A **Recurring Execution rule** (per CES Recurring Execution, doc 07) |
| Onboarding escalation | A CES **enforcement rule trigger** (per CES doc 10) |
| Onboarding completion | A CES **audit ledger event** (per CES doc 11) |

---

## 3. Sprint Board Surfacing

Onboarding execution units appear on the Sprint Board with:

- **Source tag**: `Onboarding` + sub-tag (`New Hire`, `Role Change`, `Revalidation`, `Vendor`, `Governance`)
- **Subject chip**: workforce member or vendor
- **Bundle pill**: the onboarding batch ID (clickable → batch view)
- **Standard CES columns**: Backlog → Ready → In Progress → Awaiting Signature → Awaiting Evidence → Blocked → Completed
- **CES filters**: domain, role, owner, due window, risk level — work uniformly with onboarding units

Onboarding units obey the same WIP limits, ownership rules, and assignment model as any other CES unit (CES doc 04).

---

## 4. Compliance Calendar Surfacing

Every onboarding deadline becomes a calendar entry:

- Initial onboarding due date
- Pre-field gate deadline
- Each credential expiry (license, TB, BLS, CPR, drug screen, OIG check)
- Annual in-service hour deadlines (HHA 12hr, RN in-service)
- Annual revalidation
- Vendor monthly exclusion checks
- Policy republish re-acknowledgment windows

Calendar entries carry:
- subject, role, requirement, batch_id, unit_id
- escalation tier
- direct link to the unit on the Sprint Board

---

## 5. State Mapping

| Onboarding Batch State | CES Surfacing |
|------------------------|---------------|
| Pending Activation | Bundle visible in next sprint planning |
| In Progress | Bundle active; units distributed across columns |
| At Risk | Bundle flagged At Risk; calendar entries red-amber |
| Blocked | Bundle Blocked; downstream units hidden until gate clears; escalation event raised |
| Awaiting Signature | Bundle in Awaiting Signature aggregate column |
| Awaiting Evidence | Bundle in Awaiting Evidence aggregate column |
| Completed | Bundle archived; readiness score updated; dossier sealed |
| Revalidation Due | New bundle auto-emitted to next sprint |

---

## 6. eCIgn Integration

For every signature requirement on an onboarding unit:

1. Engine creates a signing envelope referencing:
   - subject
   - policy version (immutable hash)
   - evidence object (if any)
   - role
   - unit_id, batch_id
2. eCIgn handles single or multi-signer flow (per eCIgn doc 09).
3. On signature completion, eCIgn writes:
   - signed artifact (with watermark + hash) to evidence store
   - audit event to ledger
   - status callback to onboarding engine → unit moves to Completed (if no further conditions)
4. On signer rejection or timeout, escalation rules fire.

No paper signatures. No generic e-sign. eCIgn is the only signature pipeline.

---

## 7. Audit Mode Integration

Audit Mode (CES) gains an **Onboarding lens**:

- Per-employee dossier view (auto-generated from onboarding audit events)
- "Show me how this person was qualified to perform X on date Y"
- Per-policy acknowledgment ledger (who signed what version, when)
- Vendor compliance ledger (BAA, exclusion checks, insurance)
- Governance ledger (GB members, officers, medical director)

All onboarding evidence is queryable from Audit Mode using the same primitives as any other CES evidence.

---

## 8. Audit Readiness Score Contribution

The agency-wide readiness score gains weighted contributors:

| Contributor | Weight (illustrative) |
|-------------|-----------------------|
| All active workforce have completed initial onboarding | High |
| Zero overdue revalidations | High |
| All vendors have current BAA + monthly exclusion check | Medium |
| Zero policy-version-change re-acknowledgment overdue | Medium |
| Governance appointments current and attested | Medium |
| Pre-field/pre-billing gates enforced (zero violations) | Critical |

Final weights set in CES Metrics doc 11. Onboarding never produces a "green" if any **Critical** gate is violated.

---

## 9. Enforcement Hooks

CES enforcement (doc 10) gains onboarding rules:

- Scheduling system queries CES for `field_clearance(subject, date)` → false if any pre-field unit not Completed.
- Billing system queries CES for `billing_clearance(subject)` → false if FN-BC-001 onboarding incomplete.
- System access provisioning queries CES for `system_access_clearance(subject)` → false if HIPAA workforce + AUP not signed.
- These checks return signed assertions consumable by downstream systems.

---

## 10. Sprint Planning Behavior

During sprint planning (CES doc 02):

- Onboarding bundles appear automatically based on trigger date and SLA.
- Bundles cannot be deferred past their pre-field/pre-billing gate without an explicit Compliance Officer override (audited).
- Revalidation bundles auto-fill recurring slots per CES doc 07.

---

## 11. Non-Negotiables

- Onboarding never gets its own task list, its own calendar, or its own signature flow.
- Onboarding never marks itself complete outside the CES audit ledger.
- Onboarding never bypasses CES assignment, escalation, or enforcement rules.
