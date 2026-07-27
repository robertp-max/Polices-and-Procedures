# ADR-LEARNING-004 — Certificate vs clearance separation

**Status:** Accepted (Wave 0)
**Date:** 2026-07-27
**Controlling spec:** architecture §3.5, §3.6, §10, §11, §14.3

## Context

A training certificate must never, by itself, authorize independent practice or
system access (§3.5). Clearance depends on broader gates (license current, health
clearance, screening, competency observed, supervised visits, RN signoff). Initial,
annual, and advanced scopes must remain separate, and an annual lapse must not
rewrite a historical onboarding certificate (§3.6, §14.3).

## Decision

1. **Two distinct gate families, both producing signed `GateDecision`s:**
   - **Certificate-eligibility gates** (`CERTIFICATE_ELIGIBILITY`) — prove a defined
     *learning* outcome for a certificate scope.
   - **Clearance gates** (`FIELD_CLEARANCE`, `SYSTEM_ACCESS_CLEARANCE`) — operational
     permission, evaluated over a broader rule set including credentials, screening,
     competency, supervised practice, RN/supervisor signoff, and "no active hold".

2. **A `CertificateRecord` never grants clearance.** Downstream consumers that gate
   patient assignment or system access must require a **`FIELD_CLEARANCE` /
   `SYSTEM_ACCESS_CLEARANCE` `GateDecision` with `outcome: PASS`** — never a
   certificate's existence. Presenting a certificate is not accepted as clearance input.

3. **Scope isolation.** Certificate scopes are independent
   (`initial onboarding | role onboarding | annual/recurring | ACHC bundle |
   advanced module | competency | HHA in-service hours | policy reading`). A gate
   for one scope reads only that scope's assignments; ANN/ADV assignments do **not**
   block issuance of a historical onboarding certificate unless that certificate
   definition explicitly included them **at issuance** (§3.6).

4. **Historical immutability.** A later annual lapse changes *current readiness /
   field clearance / scheduling eligibility* (a fresh clearance `GateDecision`), but
   never edits the historical onboarding `CertificateRecord`, its past attempts, or
   its evidence (§14.3). Corrections use supersede/revoke, never edit/delete.

5. **HHA field clearance** is explicitly a clearance gate, not a certificate
   (§11.5): GAO complete + HHA role modules + HHA-SUP supervised practice signed by a
   qualified RN + assigned P&P + competency + RN/supervisor clearance + personnel-file
   evidence + current credentials + no hold. The system may still issue an HHA
   *onboarding certificate*, but independent patient assignment requires the separate
   signed field-clearance decision.

## Consequences

- Certificate issuance and clearance can diverge safely (e.g., certificate valid,
  clearance revoked on an expired license) without rewriting history.
- The gate engine (Wave 5) needs `gateType` as a first-class discriminator, and
  clearance gates consume non-training inputs (credential/screening status pointers)
  via evidence, not via the certificate.

## Rejected alternatives

- **Single "completed → cleared" flag** — rejected by §3.4/§3.5.
- **Annual lapse invalidates onboarding certificate** — rejected by §14.3.
