# 07 — Help Center Integration

> **Purpose**: Specify how the Onboarding documentation set in this folder integrates with the in-app Help Center, how articles map to UI components, and how articles trace to real workflows, forms, and policies.
>
> **References**:
> - Knowledge base structure: `02-Knowledge-Base-Architecture.md`
> - Article catalog: `03-Knowledge-Base-Articles.md`
> - Component contracts: `04-Component-Documentation.md`
> - End user manual: `05-End-User-Manual.md`

---

## 1. Integration Principles

1. **One Help Center.** Onboarding articles are integrated as a category, not a separate site.
2. **Contextual help everywhere.** Every onboarding surface exposes a "?" affordance that opens the topical article in a side drawer.
3. **Real artifacts only.** Every article links to real workflows (`WF-*`), forms (`FRM-*`), policies (versioned), gates, and events. No placeholders.
4. **Audience-aware ranking.** Search results rank by tier match (T1–T4) and by surface context.
5. **No duplication.** eCIgn lives only in the Signatures category; CES lives only in the Compliance Execution category. Onboarding links to them, never copies them.

---

## 2. Article ↔ Component Map

The mapping below drives the in-app contextual help drawer. Each component shows the listed primary article(s); the side panel offers the "Related" stack from §4.

| Component | Primary Help Articles |
|-----------|------------------------|
| Onboarding Dashboard | A1 *What onboarding is*; A2 *How onboarding works*; A8 *How audit readiness works* |
| Role-Based Activation Screen | A1; A2; A3 *How execution units are generated* |
| Execution Batch View | A2; A3; A9 *How gates work*; A10 *How overrides work* |
| Evidence & Forms Panel | A4 *How evidence works*; A6 *How policy acknowledgment works* |
| Competency Validation View | A5 *How competency validation works*; A7 *How signatures work* |
| Signature / Acknowledgment View | A7; A6 |
| Audit Readiness View | A8; A9; A10; A11 *How recurring revalidation works* |

Article IDs reference `03-Knowledge-Base-Articles.md`.

---

## 3. Article ↔ Workflow / Form / Policy Trace

Every article links to its underlying artifacts so the Help Center is operationally accurate.

| Article | Linked Workflows | Linked Forms | Linked Policies | Linked Events |
|---------|------------------|--------------|-----------------|---------------|
| A1 | (overview) | n/a | All domain catalogs | `TRIGGER_RECEIVED`, `BATCH_CREATED` |
| A2 | (engine overview) | n/a | n/a | Full event catalog |
| A3 | per-role workflows from `../05-Workflow-and-Form-Mapping.md` | n/a | Templates pin policies | `TEMPLATE_SELECTED`, `REQUIREMENT_RESOLVED`, `UNIT_CREATED` |
| A4 | All `WF-*` that capture evidence | All `FRM-*` | Policies bound via `PolicyVersionRef` | `EVIDENCE_CAPTURED`, `EVIDENCE_REJECTED` |
| A5 | `WF-OASIS-COMPETENCY`, `WF-MED-RECON-COMP`, `WF-WOUND-COMP`, `WF-HHA-COMPETENCY-12`, `WF-LVN-COMPETENCY`, etc. | `FRM-*-COMPETENCY` series | CL domain; CL §484.80 | `EVIDENCE_CAPTURED`, `SIGNATURE_COMPLETED`, `UNIT_STATE_CHANGED` |
| A6 | `WF-COC-ACK`, `WF-AUP-ACK`, `WF-HIPAA-WORKFORCE`, `WF-DOC-HIERARCHY`, `WF-FWA-TRAIN`, `WF-EP-ORIENT` | `FRM-*-ACK` series | CO-CP-001; IT-HIPAA-*; CL-OA-006; RM-EP-001 | `SIGNATURE_REQUESTED`, `SIGNATURE_COMPLETED` |
| A7 | All workflows requiring `SignatureSpec` | n/a | Policies bound by signature | `SIGNATURE_REQUESTED`, `SIGNATURE_COMPLETED`, `SIGNATURE_DECLINED` |
| A8 | All onboarding workflows (read-only) | n/a | All policies (read-only) | All events (audit projection) |
| A9 | `WF-FIELD-CLEARANCE`, `WF-BILLING-CLEARANCE` | `FRM-FIELD-CLEARANCE`, `FRM-BILLING-CLEARANCE` | CL; FN-BC-001; CO-CP-001; IT-HIPAA | `GATE_EVALUATED`, `DOWNSTREAM_REFUSAL` |
| A10 | n/a (system) | n/a | CO-CP-001 | `OVERRIDE_GRANTED`, `OVERRIDE_EXPIRED` |
| A11 | All recurring `WF-*` (e.g., `WF-LICENSE-PSV`, `WF-EXCLUSION-SCREEN`, `WF-HHA-INSERVICE-12HR`) | per workflow | per requirement | `CREDENTIAL_EXPIRY_WINDOW`, `ANNUAL_REVALIDATION` |

The integration validator (see §6) ensures every link resolves to an artifact actually present in the libraries.

---

## 4. Related Article Stacks

For each surface, the side panel offers a "Related" stack to deepen context.

- **Onboarding Dashboard**: A1 → A2 → A8 → A9
- **Activation Screen**: A1 → A2 → A3 → (Templates & Reconciliation reference)
- **Batch View**: A2 → A3 → A9 → A10 → A11
- **Evidence & Forms**: A4 → A6 → (Forms Library) → (Workflows & Evidence)
- **Competency**: A5 → A7 → A4
- **Signature**: A7 → A6 → (eCIgn Multi-Signer)
- **Audit Readiness**: A8 → A10 → A11 → (Audit & Reporting)

---

## 5. In-App Surfacing Rules

- **"?" affordance**: top-right of every onboarding surface; opens a 480px side drawer with the primary article(s).
- **Inline link triggers**: any error / blocker message links directly to the relevant Troubleshooting article and to the relevant primary article.
- **Unit-row contextual help**: hovering the help icon on a unit row opens the article keyed by the unit's `workflow_id`.
- **Notification cards**: include a "Learn more" link to the relevant article.
- **Search**: global search returns Help Center results inline with platform results, ranked by audience tier and current surface.

---

## 6. Integration Validator (CI gate)

A build-time validator runs on every Help Center change and fails the build if any of the following holds:

- An article references a `WF-*`, `FRM-*`, policy ID, or event type that does not exist in the respective registry.
- A surface is missing a primary article mapping.
- An article links to a policy without a pinned version.
- A surface's "?" affordance has no resolvable article.
- eCIgn or CES content appears under any category other than its canonical category (anti-duplication rule).
- An article uses a "checkbox completion" pattern (forbidden phrase set).

The validator output is itself recorded as a build artifact for governance review.

---

## 7. Authoring Workflow

1. New or revised articles are drafted in Markdown using the schema in `02-Knowledge-Base-Architecture.md` §3.
2. Linked artifacts must exist before merge; the validator enforces this.
3. Compliance Officer review is required for any article in:
   - Onboarding (Compliance Activation)
   - Compliance Execution (CES)
   - Policy Lifecycle
   - Signatures (eCIgn)
   - Audit & Reporting
   - Enforcement & Gates
4. Engineering review is required for any article in:
   - Developer Reference
   - Workflows & Evidence (technical sections)
5. A policy version change automatically opens review tasks for all articles tagged with that policy.
6. Reader feedback ("Was this helpful?") routes to a CES backlog labeled `KB-Onboarding`.

---

## 8. Surface-Specific Hand-Off Patterns

- **Activation → Batch View**: on activation, the Batch View opens with the primary article preloaded but collapsed; user opens on demand.
- **Batch View → Evidence Panel**: opening the Evidence tab carries the article context; switching to Signatures swaps the primary article.
- **Override flow**: opening "Request Override" auto-opens A10 in the side drawer; the article cannot be dismissed until the user confirms they have read the dual-signature constraints.
- **Dossier Export**: confirms with A8 inline; the data-classification acknowledgment is tied to the export action.

---

## 9. Versioning and Telemetry

- Each article carries a `version` and `last_reviewed_at`.
- Article versions are referenced from in-app surfacing so users can see which version they read.
- Telemetry tracks: article opens per surface, time-on-article, "Was this helpful?" answers, and search-to-article conversion. Telemetry is aggregated and never tied to specific patient or PHI context.

---

## 10. What This Integration Forbids

- Splitting eCIgn or CES content into onboarding-specific articles.
- Creating a "Tasks" or "Checklist" surface inside the Help Center for onboarding.
- Linking to a policy without pinning a version.
- Articles that describe completion paths bypassing evidence + signature.
- Replacing the in-app contextual help with a generic "Open Help Center" link without a primary article anchor.
