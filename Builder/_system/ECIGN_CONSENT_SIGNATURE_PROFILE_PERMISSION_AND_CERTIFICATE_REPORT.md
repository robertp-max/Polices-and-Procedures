# eCIgn Consent, Signature Profile, Permission, and Certificate Report

Execution mode: LOCKED — Canonical eCIgn signer hierarchy, permission role,
one-time consent, signature profile, and one-click signing.

Repo verified: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`
(matched exactly). No commit. No deploy. QA-WF-03 custom page untouched.

This work **extends** the existing canonical eCIgn layer under `src/policy/ecign/`
(established by the prior signer-hierarchy/task-mapping work) rather than creating
a second disconnected signing system under `src/policy/signing/`.

---

## 1. Files inspected

- `src/policy/ecign/types.ts`
- `src/policy/ecign/signerHierarchy.ts`
- `src/policy/ecign/signatureTaskBuilder.ts`
- `src/policy/ecign/signaturePathResolver.ts`
- `src/policy/ecign/signerIdentity.ts`
- `src/policy/ecign/useEcignSession.ts`, `useEcignInstance.ts`, `api.ts`
- `src/policy/components/FormSignatureFlow.tsx`, `FormSignatureContext.tsx`, `FormSigningWorkspace.tsx`
- `src/policy/ces/cesRoles.ts`, `src/policy/ces/signerTaskFactory.ts`
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx`, `types.ts`, `swimlaneRegistry.ts`
- `src/policy/stores/regulatoryExecutionStore.ts`, `src/policy/stores/uiStore.ts`
- `src/auth/api.ts`, `src/auth/AuthProvider.tsx`
- `Builder/_system/audit-signer-hierarchy-and-ecign-task-mapping.ts`
- `package.json`

## 2. Files changed

Updated:
- `src/policy/ecign/types.ts` — added `ECIgnPermissionRole`, `requiredPermissionRole`
  on `SignatureRequirement`/`SignatureTaskRecord`, and the canonical consent
  profile / signature profile / signature record / certificate models + readiness types.
- `src/policy/ecign/signaturePathResolver.ts` — every generated requirement now
  carries a resolved `requiredPermissionRole`.
- `src/policy/ecign/signatureTaskBuilder.ts` — propagates `requiredPermissionRole`
  onto deterministic signer tasks.
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx` — signature workspace
  now shows the required eCIgn permission role + permission status and renders the
  one-click `ECIgnSignatureField` only when actionable in event-execution mode.
- `package.json` — added `validate:ecign-consent-signature` script.

Created:
- `src/policy/ecign/permissionRoles.ts`
- `src/policy/ecign/ecignAgreement.ts`
- `src/policy/ecign/ecignConsentStore.ts`
- `src/policy/ecign/ecignSignatureProfileStore.ts`
- `src/policy/ecign/ecignSignatureRecordStore.ts`
- `src/policy/ecign/ecignCertificateBuilder.ts`
- `src/policy/ecign/ecignSigning.ts`
- `src/policy/ecign/ECIgnSetupModal.tsx`
- `src/policy/ecign/ECIgnSignatureField.tsx`
- `Builder/_system/audit-ecign-consent-signature-profile-and-permission.ts`
- `Builder/_system/ECIGN_CONSENT_SIGNATURE_PROFILE_PERMISSION_AND_CERTIFICATE_REPORT.md` (this file)

## 3. Signer hierarchy config

The canonical `SignerRole` union and domain-level `SIGNER_HIERARCHY_RULES`
(Governance, Clinical, QAPI, Compliance, HR, Finance, Operations, IT/Security,
Risk, Enterprise) already existed in `signerHierarchy.ts` and are reused unchanged.
The QAPI reviewer inference (dashboard/data → Data Analyst; clinical/RCA → Clinical
Manager; complaints/compliance → Compliance Officer; infection → Infection
Preventionist; minutes/committee → Committee/Voting Members) is preserved.

## 4. eCIgner permission role model

`src/policy/ecign/permissionRoles.ts` defines `ECIgnPermissionRole`:
`eCIgner`, `eCIgn Reviewer`, `eCIgn Final Approver`, `eCIgn Administrator`,
`eCIgn Witness`, `eCIgn System`.

Hierarchical rank: `eCIgner (1) < eCIgn Reviewer (2) < eCIgn Final Approver (3) <
eCIgn Administrator (4)`. `permissionSatisfies(held, required)` enforces:

1. signer tasks need `eCIgner` or higher,
2. reviewer tasks need `eCIgn Reviewer` or higher,
3. final-approval tasks need `eCIgn Final Approver` or higher,
4. `eCIgn Administrator` satisfies all hierarchical signing requirements,
5. `eCIgn Witness` is a discrete (non-escalating) capability,
6. `eCIgn System` is never satisfiable — it is never a human signer.

`resolveUserPermissionRoles(role)` derives a user's granted permission roles from
their workflow role (e.g. Administrator → Administrator/Final Approver/Reviewer/eCIgner;
Compliance Officer → Reviewer/eCIgner; Governing Body → Final Approver/Reviewer/eCIgner;
`Evidence / eCIgn System` → `eCIgn System` only).

## 5. signerRole vs requiredPermissionRole distinction

- `signerRole` = business/workflow authority (e.g. "Clinical Manager").
- `requiredPermissionRole` = system permission required to execute the action.

A user assigned to a signer role still cannot sign unless they hold the required
eCIgn permission role. `inferRequiredPermissionRole` resolves per requirement:
Clinical Manager signing → `eCIgner`; QAPI chair minutes → `eCIgn Final Approver`;
Governing Body → `eCIgn Final Approver`; Compliance Officer review → `eCIgn Reviewer`.

## 6. eCIgn consent profile model

`ECIgnConsentProfile` (in `types.ts`, persisted by `ecignConsentStore.ts`) records
`consentProfileId`, `userId`, signer names, `requiredPermissionRoles`, `consentVersion`,
`consentTextHash`, `consentAcceptedAt`, IP/user-agent/device, and `consentStatus`
(`active|revoked|expired|superseded`). `getActiveConsent` returns the active profile;
`hasCurrentActiveConsent` additionally requires the version to equal the current
agreement version. Consent is created **only** by an explicit `recordConsent(...)`
call from the manual enrollment flow — never auto-created.

## 7. First-time setup popup behavior

`ECIgnSetupModal.tsx` ("Set Up eCIgn Electronic Signature") presents all eight
explanation sections (What eCIgn Means, One-Time Agreement, What Happens When You
Click, What the System Records, Your Responsibility, Permission Requirement,
Certificate Statement, Event/Form Context) plus the "Create Your eCIgn Signature"
section, a "View Full Agreement Text" toggle, a manually-checked enrollment checkbox,
and the **Accept & Save Signature Profile** / **Cancel** buttons.

It appears only when consent/signature profile is missing/revoked/superseded or the
agreement version changed. Cancel/Escape/backdrop close without enrolling, saving a
profile, or signing — signing stays blocked.

## 8. Signature profile capture behavior

The setup modal captures a reusable signature profile (`ecignSignatureProfileStore.ts`):
draw (pointer canvas → PNG data URL) or typed-signature fallback for accessibility,
plus optional drawn/typed initials, confirmed signer name, and confirmed permission
role display. Capturing a profile does **not** sign any document. A user has only one
active profile; updating creates a new `signatureProfileId` and supersedes the prior
one (never mutating profiles already referenced by signed records).

## 9. One-click signature behavior

`ECIgnSignatureField.tsx` + `ecignSigning.ts` implement one-click signing. After
enrollment, clicking the field/icon applies the stored signature to the specific form
instance with one intentional click — no repeated agreement, checkbox, or signature pad.
`evaluateSignReadiness` gates on: template mode, authentication, signer-task existence,
required permission role, active consent, current consent version, active signature
profile, existing form instance, and event/task context. `applyOneClickSignature`
re-runs the gates and creates exactly one document-specific record + certificate; it
never creates a form instance or signer task.

## 10. Agreement version/hash logic

`ecignAgreement.ts` exports `ECIGN_AGREEMENT_VERSION = "2026-05-28-v1"`,
`ECIGN_AGREEMENT_TEXT`, and `ecignContentHash` (synchronous FNV-1a content
fingerprint usable in stores, UI, validators, and Node). `getCurrentConsentTextHash`
hashes version + text. Consent at a non-current version returns
`consent_version_changed`, forcing re-acceptance via the setup modal.

## 11. Certificate fields added

`ECIgnCertificate` (built by `ecignCertificateBuilder.ts`) includes signer name/userId,
signerRole, requiredPermissionRole, event/workflow/task/form/formInstance ids,
signatureId, consentProfileId/version/textHash/acceptedAt, signatureProfileId/hash,
signatureMethod, signedAt, signatureIntentMethod, document hashes + IP/device/user-agent
where available, the three required statements (active consent, active signature profile,
click intent), and the canonical statement:

> "The signer previously accepted eCIgn Agreement Version {consentVersion} on
> {consentAcceptedAt}. At the time of this signature, the signer had an active eCIgn
> consent profile, active signature profile, and the required permission role. The
> visual signature applied to this document came from signature profile
> {signatureProfileId}. The signer applied the signature by clicking the eCIgn
> icon/signature field for form instance {formInstanceId} on {signedAt}."

## 12. Event execution behavior

In event-execution mode the form instance and signer task must already exist; the
signature action updates the existing signer requirement and creates a record/certificate
linked to the event/task/workflow/form/formInstance context. No duplicate form instances
or signer tasks are created (deterministic ids ensure idempotency).

## 13. Template mode behavior

Template mode is preview-only: `evaluateSignReadiness` returns `template_mode` and the
field renders a preview-only notice. No consent records, signature profiles, signer
tasks, signature records, or evidence artifacts are produced from template mode.

## 14. Validator result

`npm run validate:ecign-consent-signature` — PASS.
Inspected 102 generated signature requirements across 5 routes and verified all 22
checks (permission roles present, hierarchy gate, consent/profile lifecycle, one-click
record + certificate, no-duplicate, historical-profile preservation, stale-version
re-acceptance, enrollment UI contract, no-auto-consent, eCIgn System non-human, and
QA-WF-03 empty diff).

## 15. Build result

`npm run build` (`tsc -b && vite build`) — PASS (built in ~4s, 2237 modules).
Also PASS: `npm run validate:signer-hierarchy-ecign`, `npm run verify:task-identity`,
`npm run validate:event-dataflow`, `npm run check:ecign-routes`.

## 16. QA-WF-03 diff result

`git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx` → empty.
The file is not present in `git status --short`.

## 17. Remaining limitations

- Consent/signature/record stores persist to `localStorage` (demo/training runtime),
  consistent with the existing app stores; a production deployment would back these
  with the server identity/permission directory.
- `resolveUserPermissionRoles` derives permission grants from the workflow role for the
  demo; real grants would come from an admin-managed permission catalog.
- The content hash is a synchronous FNV-1a fingerprint for audit linkage, not a
  cryptographic digest; `api.ts` retains the async `sha256Hex` for document hashing.
- Interactive click-through browser verification of every listed route was not run in
  this headless session; the validator exercises the model + signing pipeline logic and
  the enrollment UI contract statically.
- Wiring `ECIgnSignatureField` into the in-form `FormViewer`/`FormSigningWorkspace`
  signature fields (beyond the swimlane signature workspace) is the natural next step
  and was intentionally scoped to the swimlane ceremony view here.
