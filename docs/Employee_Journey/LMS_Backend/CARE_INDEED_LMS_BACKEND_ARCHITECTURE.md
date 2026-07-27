# CARE INDEED LMS BACKEND ARCHITECTURE
## Grades, activity tracking, evidence, certificate gates, certificate generation, recurrence, and clearance

**Architecture version:** 1.0  
**Status:** Proposed target architecture  
**Primary product:** Care Indeed Employee Journey / Training Academy  
**Authoritative identity:** Existing Care Indeed authenticated workforce identity  
**Initial production stack:** Cognito + existing TypeScript API service + DynamoDB + S3/KMS  
**Deployment rule:** Architecture only; no deployment is authorized by this document

---

# 1. Executive decision

The production LMS must replace browser-local completion logic with a **server-authoritative learning record system**.

The backend must treat these as separate concepts:

```text
Activity        = what the learner did
Attempt         = one assessable try
Score           = calculated result for one attempt
Grade           = the official result selected by a versioned grade policy
Completion      = a server decision that an assignment’s requirements are satisfied
Evidence        = immutable proof supporting completion
Certificate     = an immutable representation of an approved completion snapshot
Clearance       = an operational permission decision made from broader gates
Transcript      = a report of historical learning records
```

A certificate must never create clearance by itself.

A learner must never become complete because:

- a page opened;
- a local boolean changed;
- a PDF was printed;
- a card displayed 100%;
- a browser-local signature image exists;
- an administrator manually changed `completedAt`;
- a client supplied a score;
- a migrated legacy record merely said `true`.

The authoritative rule is:

> **Assignments, grades, completion, certificate eligibility, and clearance are derived server-side from version-bound, identity-bound, immutable evidence.**

---

# 2. Why this backend is required

The current Journey runtime is built around browser persistence and prototype evidence/signature records. That is appropriate for UAT but unsafe as the final system of record.

The production backend must correct these risks:

```text
cross-device loss
learner identity ambiguity
client-side score manipulation
duplicate attempts
inconsistent role assignments
stale policy-version acknowledgments
self-approved competency
certificate issuance without evidence
historical records overwritten by annual recurrence
localStorage treated as a personnel file
browser-generated PDF treated as proof
```

The current policy/Journey architecture also requires:

```text
P&P readings inside the Journey
10-question policy quiz
80% pass threshold
maximum 3 ordinary attempts
attestation
personnel-file evidence
supervisor/competency signoff when applicable
certificate dependency
```

Those requirements cannot be enforced safely by the UI alone.

---

# 3. Non-negotiable domain principles

## 3.1 Server authority

The browser may cache drafts and resume position.

The browser is never authoritative for:

```text
completion
official score
attempt number
policy acknowledgment
competency validation
supervisor signoff
certificate eligibility
certificate issuance
field clearance
system-access clearance
```

## 3.2 Exact version binding

Every assignment must pin:

```text
requirement definition version
module/content version and SHA-256
policy ID/version/content SHA-256
assessment-bank version
grade-policy version
evidence specification version
certificate-definition version
recurrence-rule version
```

A pointer to “current content” is not sufficient for historical evidence.

## 3.3 Append-only history

Attempts, evidence, signoffs, gate decisions, and certificates are never overwritten.

Corrections occur through:

```text
supersede
revoke
void
regrade
reissue
new attempt
new evidence version
new gate decision
```

## 3.4 Completion is derived

There is no authoritative standalone:

```ts
completed: true
```

Completion is an evaluated decision over the pinned assignment snapshot.

## 3.5 Certificates and clearance are separate

A training certificate proves that a defined learning gate passed.

It does not independently prove:

```text
license is current
health clearance is current
background/screening is clear
competency was observed
supervised visits are complete
the employee may practice independently
```

Those belong to separate clearance gates.

## 3.6 Initial, annual, and advanced scopes remain separate

Use independent certificate scopes:

```text
initial onboarding
role onboarding
annual/recurring
ACHC bundle
advanced module
competency
HHA in-service hours
policy reading
```

Annual or Advanced assignments must not retroactively block a historical onboarding certificate unless the certificate definition explicitly included them at issuance.

## 3.7 P&P remains a Journey activity

Policy reading is not a disconnected second LMS.

A policy assignment is a `JourneyActivity` with:

```text
exact policy version
full text
reading requirement
knowledge check when approved
attestation when approved
evidence routing
certificate-gate participation
```

## 3.8 No PHI

Training activity payloads, assessment responses, competency notes, certificates, and logs must not contain patient-identifying information.

---

# 4. Recommended physical architecture

Use provider-neutral domain interfaces, but make one production decision for Phase 1.

## 4.1 Phase 1 deployment

```text
Employee Journey / Main App
        |
        | Cognito-authenticated HTTPS
        v
Existing TypeScript API service
  /api/training/*
        |
        +------------------------+
        |                        |
        v                        v
DynamoDB learning records   DynamoDB learning events
        |                        |
        +------------+-----------+
                     |
                     v
             Transactional outbox
                     |
          +----------+-----------+
          |          |           |
          v          v           v
 Certificate     Notifications   CES / Calendar /
 worker          & reminders     audit projections
          |
          v
  S3 immutable artifacts
  + KMS signed manifest
          |
          +---- optional controlled Google Drive mirror
```

The logical LMS service may initially run inside the existing authenticated server/container. It can later be split into Lambda/API Gateway without changing the domain contracts.

## 4.2 Recommended AWS resources

```text
Cognito
- authenticated workforce identity

DynamoDB: cihh-learning-records-{env}
- definitions, plans, assignments, attempts, grades, evidence metadata,
  signoffs, gates, certificates, recurrence, overrides, read models

DynamoDB: cihh-learning-events-{env}
- append-only learning/audit events

S3: cihh-learning-upload-staging-{env}
- temporary uploads pending validation

S3: cihh-learning-artifacts-{env}
- validated evidence, certificate PDFs, certificate manifests,
  transcripts, exported audit packages

SQS
- certificate generation
- evidence validation
- notification delivery
- read-model projections

KMS
- encryption
- signed GateDecision assertions
- signed certificate manifests

CloudWatch
- logs, metrics, alarms
```

Use S3 versioning. Enable Object Lock for immutable evidence/certificates when the approved retention design permits it.

Google Drive may receive an approved personnel-file copy or pointer, but it should not replace the canonical certificate/evidence metadata record.

---

# 5. Logical service boundaries

## 5.1 Identity and subject service

Owns the stable learning subject identity.

Inputs:

```text
authenticated Cognito subject
employee registry ID
employment status
branch/location
supervisor
primary and secondary roles
department
job code
duty flags
```

It does not let the learner self-select a role.

## 5.2 Content registry

Resolves existing content; it does not author lesson bodies.

Content adapters:

```text
canonical Journey module
standalone GAO/LVN/RN/ADM/DON/ACHC player
advanced module player
SCORM 1.2 package
packaged HTML/React content
policy-reading content
form/appendix content
external approved course
live session / drill
competency / supervised practice
```

A content revision is `AVAILABLE` only when the adapter can resolve and launch the exact version/hash.

## 5.3 Requirement and assignment service

Creates per-person obligations from:

```text
role
secondary roles
department
duty flags
hire date
annual cycle
policy publication
credential expiry
failed competency
remediation
incident/trigger
approved manual assignment
```

## 5.4 Activity service

Accepts append-only learner/session activity.

It validates:

```text
identity
assignment access
content version
session sequence
idempotency
clock skew
active-time rules
event schema
```

## 5.5 Assessment and grade service

Owns:

```text
attempt creation
question-bank selection
response submission
scoring
grade policy
pass/fail
critical-error rules
attempt lockout
regrade
```

Answer keys remain server-side.

## 5.6 Remediation service

Creates and closes remediation cases.

Examples:

```text
policy quiz failure
module quiz failure
critical scenario error
competency deficiency
expired attempt authorization
required 1:1 review
```

## 5.7 Evidence and signoff service

Owns metadata for:

```text
training records
policy attestations
competency checkoffs
supervised visits
external certificates
live-session attendance
drill participation
screening/credential status pointers
```

It integrates with the existing evidence and eCIgn/signature systems where appropriate.

## 5.8 Gate service

Evaluates:

```text
assignment completion
certificate eligibility
field clearance
system-access clearance
policy compliance
current annual readiness
```

It returns a signed `GateDecision`.

## 5.9 Certificate service

Separates:

```text
eligibility
authorization
generation
artifact storage
verification
revocation
supersession
```

## 5.10 Recurrence service

Creates deterministic cycles for:

```text
calendar year
hire anniversary
rolling 12 months
quarter
biennial
credential expiry
policy republish
post-incident retraining
last completion
```

## 5.11 Reporting and transcript service

Produces role-scoped read models for:

```text
learner
supervisor
DON
HR
Compliance
auditor
administrator
```

---

# 6. Canonical domain model

All IDs are opaque UUIDs/ULIDs. Human-readable codes such as `RN-001` remain stable external identifiers.

## 6.1 Subject and role

```ts
interface LearningSubject {
  id: string;
  tenantId: string;
  identityProviderSubject: string;
  employeeId?: string;
  status: "PENDING" | "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED";
  branchId?: string;
  createdAt: string;
}

interface RoleAssignment {
  id: string;
  subjectId: string;
  roleCode:
    | "GENERAL"
    | "ADM"
    | "DON"
    | "RN"
    | "LVN"
    | "HHA"
    | "PT"
    | "PTA"
    | "OT"
    | "COTA"
    | "SLP"
    | "MSW";
  isPrimary: boolean;
  department?: string;
  dutyFlags: string[];
  supervisorSubjectId?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  sourceSystem: string;
  sourceRecordId: string;
}
```

## 6.2 Content revision

```ts
interface ContentRevision {
  id: string;                    // canonical content id, e.g. RN-001
  version: string;
  sha256: string;
  adapterType:
    | "JOURNEY"
    | "STANDALONE"
    | "SCORM_1_2"
    | "POLICY"
    | "FORM"
    | "EXTERNAL"
    | "LIVE"
    | "COMPETENCY";
  launchRef?: string;
  publicationStatus: "DRAFT" | "PUBLISHED" | "SUPERSEDED" | "RETIRED";
  available: boolean;
}
```

## 6.3 Requirement definition

```ts
type RequirementKind =
  | "TRAINING"
  | "POLICY_READING"
  | "KNOWLEDGE_ASSESSMENT"
  | "SCENARIO_ASSESSMENT"
  | "COMPETENCY"
  | "SUPERVISED_PRACTICE"
  | "ATTESTATION"
  | "LIVE_SESSION"
  | "DRILL"
  | "EXTERNAL_CERTIFICATE"
  | "CREDENTIAL"
  | "ACCUMULATED_HOURS"
  | "CLEARANCE";

interface RequirementDefinition {
  id: string;
  version: number;
  code: string;
  name: string;
  kind: RequirementKind;
  applicableRoleCodes: string[];
  dutyFlags?: string[];
  contentRef?: {
    id: string;
    version: string;
    sha256: string;
  };
  policyVersionRefs: PolicyVersionRef[];
  attemptPolicyRef?: VersionRef;
  gradePolicyRef?: VersionRef;
  evidenceSpecRefs: VersionRef[];
  recurrenceRuleRef?: VersionRef;
  prerequisiteRequirementRefs: VersionRef[];
  certificateScopes: string[];
  effectiveFrom: string;
  effectiveTo?: string;
  status: "DRAFT" | "PUBLISHED" | "RETIRED";
}
```

## 6.4 Journey plan and assignment

```ts
interface JourneyPlan {
  id: string;
  subjectId: string;
  roleAssignmentIds: string[];
  planType:
    | "PRE_HIRE"
    | "INITIAL_ONBOARDING"
    | "ROLE_ONBOARDING"
    | "ANNUAL"
    | "ADVANCED"
    | "REMEDIATION";
  planVersion: number;
  generatedAt: string;
  sourceStateSha256: string;
  assignmentIds: string[];
}

type AssignmentStatus =
  | "PENDING_CONTENT"
  | "READY"
  | "LOCKED_PREREQUISITE"
  | "IN_PROGRESS"
  | "PENDING_EVIDENCE"
  | "PENDING_REVIEW"
  | "PENDING_SIGNOFF"
  | "REMEDIATION"
  | "COMPLETED"
  | "OVERDUE"
  | "BLOCKED_CONTENT"
  | "WAIVED"
  | "SUPERSEDED"
  | "REVOKED";

interface LearningAssignment {
  id: string;
  subjectId: string;
  roleAssignmentIds: string[];
  requirementRef: VersionRef;
  pinnedContentRef?: ContentRevisionRef;
  assignedAt: string;
  availableAt: string;
  dueAt?: string;
  cycleId?: string;
  status: AssignmentStatus;
  statusReasonCodes: string[];
  completionDecisionId?: string;
  version: number;
}
```

## 6.5 Activity session and event

```ts
interface ActivitySession {
  id: string;
  subjectId: string;
  assignmentId: string;
  contentRef: ContentRevisionRef;
  startedAt: string;
  endedAt?: string;
  state: "OPEN" | "CLOSED" | "ABANDONED" | "INVALIDATED";
  acceptedActiveSeconds: number;
  lastAcceptedSequence: number;
}

interface LearningActivityEvent {
  id: string;
  tenantId: string;
  subjectId: string;
  actorSubjectId: string;
  assignmentId: string;
  sessionId?: string;
  eventType: string;
  eventVersion: number;
  sequence?: number;
  occurredAt: string;
  receivedAt: string;
  idempotencyKey: string;
  correlationId: string;
  causationId?: string;
  contentRef?: ContentRevisionRef;
  payload: Record<string, unknown>;
  payloadSha256: string;
}
```

## 6.6 Attempt, score, and grade

```ts
type AttemptStatus =
  | "STARTED"
  | "SUBMITTED"
  | "SCORED"
  | "PASSED"
  | "FAILED"
  | "LOCKED"
  | "VOIDED"
  | "TECHNICAL_ERROR";

interface AssessmentAttempt {
  id: string;
  assignmentId: string;
  assessmentDefinitionRef: VersionRef;
  questionBankRef?: VersionRef;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  status: AttemptStatus;
  questionSetSha256?: string;
  responseSetSha256?: string;
}

interface ScoreResult {
  id: string;
  attemptId: string;
  rawEarned: number;
  rawPossible: number;
  percentage?: number;
  scaledScore?: number;
  criticalFailureCodes: string[];
  scoredAt: string;
  scoringEngineVersion: string;
  resultSha256: string;
}

interface GradeResult {
  id: string;
  assignmentId: string;
  gradePolicyRef: VersionRef;
  selectedAttemptId?: string;
  outcome:
    | "NOT_GRADED"
    | "PASSED"
    | "FAILED"
    | "NEEDS_REMEDIATION"
    | "PENDING_EVALUATOR";
  displayedScore?: number;
  reasonCodes: string[];
  decidedAt: string;
  decisionSha256: string;
}
```

## 6.7 Remediation

```ts
interface RemediationCase {
  id: string;
  subjectId: string;
  assignmentId: string;
  triggerAttemptId?: string;
  state:
    | "OPEN"
    | "COOLDOWN"
    | "SUPERVISOR_REVIEW"
    | "TRAINING_HOLD"
    | "REAUTHORIZED"
    | "CLOSED";
  requiredActions: string[];
  dueAt?: string;
  assignedReviewerSubjectIds: string[];
  completedEvidenceIds: string[];
  reattemptAuthorizationId?: string;
}
```

## 6.8 Evidence and signatures

```ts
interface CompletionEvidence {
  id: string;
  subjectId: string;
  assignmentId?: string;
  evidenceType:
    | "TRAINING_RECORD"
    | "POLICY_ATTESTATION"
    | "ASSESSMENT_RESULT"
    | "COMPETENCY_FORM"
    | "SUPERVISED_VISIT"
    | "LIVE_ATTENDANCE"
    | "DRILL_RECORD"
    | "EXTERNAL_CERTIFICATE"
    | "SYSTEM_ASSERTION";
  artifactRef?: {
    provider: "S3" | "DRIVE";
    locator: string;
    versionId?: string;
    sha256: string;
  };
  policyVersionRefs: PolicyVersionRef[];
  workflowRefs: VersionRef[];
  status: "PENDING" | "VALID" | "REJECTED" | "SUPERSEDED" | "REVOKED";
  createdAt: string;
  createdBy: string;
  validatedAt?: string;
  validatedBy?: string;
  retentionClass: string;
  legalHold: boolean;
}

interface SignoffRecord {
  id: string;
  subjectId: string;
  assignmentId: string;
  signerSubjectId: string;
  actingRoleAssignmentId: string;
  signerSlot: string;
  attestationTextVersion: string;
  decision: "APPROVE" | "REJECT" | "NEEDS_CORRECTION";
  signedAt: string;
  evidenceId: string;
  signatureServiceRef?: string;
}
```

## 6.9 Gate decision

```ts
type GateOutcome = "PASS" | "FAIL" | "CONDITIONAL";

interface GateDecision {
  id: string;
  gateDefinitionRef: VersionRef;
  subjectId: string;
  roleAssignmentId?: string;
  evaluatedAt: string;
  inputAssignmentIds: string[];
  inputEvidenceIds: string[];
  inputSignoffIds: string[];
  inputGradeIds: string[];
  stateVectorSha256: string;
  outcome: GateOutcome;
  reasonCodes: string[];
  activeOverrideId?: string;
  assertionSignature: string;       // KMS-backed signature
  evaluatorVersion: string;
}
```

## 6.10 Certificate

```ts
type CertificateKind =
  | "MODULE_COMPLETION"
  | "POLICY_READING"
  | "GAO_TRACK"
  | "ROLE_ONBOARDING"
  | "ACHC_ANNUAL_BUNDLE"
  | "ANNUAL_CYCLE"
  | "ADVANCED_MODULE"
  | "HHA_INSERVICE_12H"
  | "COMPETENCY_VALIDATION";

interface CertificateDefinition {
  id: string;
  version: number;
  kind: CertificateKind;
  titleTemplate: string;
  gateDefinitionRef: VersionRef;
  templateId: string;
  templateVersion: string;
  includeTranscriptAppendix: boolean;
  publicVerificationEnabled: boolean;
  effectiveFrom: string;
}

interface CertificateRecord {
  id: string;
  publicId: string;
  certificateDefinitionRef: VersionRef;
  subjectId: string;
  roleAssignmentIds: string[];
  gateDecisionId: string;
  eligibilitySnapshotSha256: string;
  assignmentIds: string[];
  policyVersions: PolicyVersionRef[];
  gradeIds: string[];
  evidenceIds: string[];
  signoffIds: string[];
  issuedAt: string;
  issuedBy: "SYSTEM" | string;
  artifactEvidenceId: string;
  manifestArtifactEvidenceId: string;
  templateId: string;
  templateVersion: string;
  status: "ACTIVE" | "SUPERSEDED" | "REVOKED";
  supersedesCertificateId?: string;
  revocationReason?: string;
}
```

---

# 7. Activity tracking architecture

## 7.1 Event categories

```text
assignment.created
assignment.ready
assignment.started
assignment.blocked
assignment.completed
assignment.reopened

activity.session.started
activity.session.heartbeat
activity.session.closed
lesson.opened
lesson.viewed
interaction.completed
bookmark.updated

assessment.started
assessment.response.saved
assessment.submitted
assessment.scored
assessment.passed
assessment.failed
assessment.voided
assessment.regraded

policy.opened
policy.section.viewed
policy.review.confirmed
policy.attested

competency.requested
competency.scheduled
competency.observed
competency.approved
competency.rejected

evidence.upload.requested
evidence.uploaded
evidence.validated
evidence.rejected
evidence.superseded

signoff.requested
signoff.completed
signoff.rejected

remediation.opened
remediation.cooldown.started
remediation.reauthorized
remediation.closed

gate.evaluated
gate.changed

certificate.requested
certificate.generated
certificate.issued
certificate.revoked
certificate.superseded

recurrence.cycle.opened
recurrence.cycle.satisfied
recurrence.cycle.overdue
```

## 7.2 Active-time rules

Active time is used only when the published requirement says it matters.

Recommended heartbeat contract:

```text
heartbeat interval: 30 seconds
maximum accepted increment per heartbeat: 45 seconds
session idle threshold: 120 seconds
page must be visible
window must be focused
session sequence must be monotonic
server reception must be within allowed clock skew
background-tab time is not accepted
duplicate heartbeats are idempotently ignored
```

Opening the last page does not satisfy active-time or content-completion rules.

## 7.3 Offline behavior

For field workers:

```text
client queues signed event envelopes locally
events remain PENDING_SYNC
server validates sequence/version/time on reconnect
official status changes only after server acceptance
```

The UI must distinguish:

```text
Saved on this device
Syncing
Synced
Rejected — action required
```

## 7.4 SCORM adapter

SCORM 1.2 data maps into canonical events:

```text
cmi.core.lesson_status
cmi.core.score.raw
cmi.core.score.min/max
cmi.core.session_time
cmi.suspend_data
cmi.core.lesson_location
```

The SCORM package does not directly issue a certificate.

Its data is validated and projected into attempts, score, activity, and completion rules.

---

# 8. Grade and assessment architecture

## 8.1 Assessment definition

Each assessment publishes:

```text
assessment type
question-bank version
question count
selection algorithm
pass threshold
max attempts
cooldown rules
critical-error rules
grade-selection rule
remediation policy
```

## 8.2 Attempt selection policies

Support versioned policies:

```text
FIRST_PASS
HIGHEST_SCORE
LATEST_ATTEMPT
LATEST_PASS
EVALUATOR_DECISION
ALL_COMPONENTS_REQUIRED
```

Do not assume every course uses the highest score.

All attempts remain visible to authorized reviewers.

## 8.3 Rounding

Calculate with exact raw values.

Recommended display:

```text
raw score stored exactly
percentage stored to four decimal places
UI display rounded to one decimal place
pass/fail compares unrounded percentage to threshold
```

## 8.4 Critical failures

Scenario, safety, and clinical assessments may include critical rules.

Example:

```text
score = 94%
critical error = failed to report suspected abuse
result = FAILED
```

The grade policy must record the critical-failure reason.

## 8.5 Competency grades

Competency is not a normal percentage quiz.

Use:

```text
VALIDATED
VALIDATED_WITH_CONDITION
NEEDS_IMPROVEMENT
FAILED
PENDING_EVALUATOR
```

A qualified evaluator, observation evidence, and signoff are required.

## 8.6 Policy-reading attempt rule

For approved P&P activities:

```text
10 questions
80% pass
3 ordinary attempts
```

Recommended failure workflow:

```text
Failure 1:
- immediate retake permitted
- relevant policy sections shown again

Failure 2:
- 24-hour cooldown
- supervisor notification
- remediation assignment

Failure 3:
- training hold
- DON/HR review
- mandatory 1:1 remediation
- no fourth attempt on the same authorization
```

After remediation, issue a new identity-bound `ReattemptAuthorization`.

That authorization permits a new attempt cycle without altering or deleting the original three attempts.

## 8.7 Question-bank security

- Question banks are immutable and versioned.
- Correct answers never ship in learner payloads.
- Each attempt receives a server-created question-set manifest.
- Question and option order are randomized server-side.
- Consecutive P&P attempts should not use the same ten-question set when the approved pool supports variation.
- Regrading creates a new score/grade decision; it does not overwrite the original result.

---

# 9. Assignment completion state machine

```text
PENDING_CONTENT
    |
    | exact content resolves
    v
READY
    |
    | learner starts
    v
IN_PROGRESS
    |
    +--> PENDING_EVIDENCE
    +--> PENDING_REVIEW
    +--> PENDING_SIGNOFF
    +--> REMEDIATION
    |
    | all published rules pass
    v
COMPLETED
```

Exceptional states:

```text
BLOCKED_CONTENT
LOCKED_PREREQUISITE
OVERDUE
WAIVED
SUPERSEDED
REVOKED
```

A passing score may move an assignment to:

```text
PENDING_EVIDENCE
PENDING_SIGNOFF
PENDING_REVIEW
```

It does not necessarily move it directly to `COMPLETED`.

---

# 10. Gate architecture

## 10.1 Gate definition

A gate is a versioned Boolean/rule tree.

```ts
interface GateDefinition {
  id: string;
  version: number;
  gateType:
    | "ASSIGNMENT_COMPLETION"
    | "CERTIFICATE_ELIGIBILITY"
    | "FIELD_CLEARANCE"
    | "SYSTEM_ACCESS_CLEARANCE"
    | "ANNUAL_READINESS";
  allOf: GateRule[];
  anyOf?: GateRule[];
  effectiveFrom: string;
  status: "DRAFT" | "PUBLISHED" | "RETIRED";
}

type GateRule =
  | { kind: "ASSIGNMENT_STATUS"; assignmentSelector: string; allowed: AssignmentStatus[] }
  | { kind: "GRADE_OUTCOME"; assignmentSelector: string; allowed: string[] }
  | { kind: "EVIDENCE_VALID"; evidenceSpecRef: VersionRef }
  | { kind: "SIGNOFF_PRESENT"; signerSlot: string; distinctHumanGroup?: string }
  | { kind: "ACCUMULATED_VALUE"; ledgerType: string; minimum: number; unit: string }
  | { kind: "NO_OPEN_REMEDIATION"; scope: string }
  | { kind: "CREDENTIAL_CURRENT"; credentialType: string }
  | { kind: "NO_ACTIVE_HOLD"; holdType: string };
```

## 10.2 Signed decisions

A `GateDecision` is evaluated server-side and signed with KMS.

Downstream systems may require:

```text
PASS
```

and must refuse:

```text
FAIL
CONDITIONAL
expired decision
invalid signature
stale state-vector hash
```

## 10.3 Distinct-human enforcement

When two signer slots require independent people:

```text
employee
supervisor
DON
HR
```

one person cannot satisfy two slots merely because they hold multiple roles.

Store:

```text
signer subject
acting role assignment
signer slot
distinct-human group
```

## 10.4 Overrides

Overrides never mutate the underlying failure.

```ts
interface GateOverride {
  id: string;
  gateId: string;
  subjectId: string;
  reasonCode: string;
  approvedBy: string[];
  effectiveFrom: string;
  expiresAt: string;
  evidenceIds: string[];
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
}
```

Every override expires and is auditable.

---

# 11. Certificate gate matrix

## 11.1 Module completion certificate

Requires:

```text
assignment COMPLETED
required grade PASSED
minimum active time, when defined
required evidence VALID
no open remediation
```

## 11.2 Policy-reading certificate

Requires:

```text
exact policy version/hash
required review confirmation
10-question quiz ≥80%, when assigned
attestation
personnel-file evidence
no open remediation/hold
```

## 11.3 GAO track certificate

Requires:

```text
all required GAO modules complete
GAO final assessment passed
all assigned GAO P&P activities complete
required evidence valid
no blocking remediation
```

## 11.4 Role-onboarding certificate

Requires:

```text
GAO gate PASS
all role-track module assignments complete
role assessments passed
required policy readings complete
required competencies validated
required supervised-practice evidence
required signoffs
no active training hold
```

## 11.5 HHA field-clearance decision

This is a clearance gate, not merely a certificate.

Requires:

```text
GAO complete
HHA role modules complete
HHA-SUP supervised practice signed by qualified RN
all assigned P&P activities complete
competency checkoff valid
RN/supervisor clearance
personnel-file evidence complete
required credentials/current status
no active hold
```

The system may issue an HHA onboarding certificate, but independent patient assignment depends on the separate signed field-clearance GateDecision.

## 11.6 ACHC annual bundle certificate

Requires:

```text
all 12 assigned ACHC modules complete
required module assessments passed
approved annual evidence complete
no unresolved equivalency gap
certificate issuance rule published
```

A module card count alone is insufficient.

## 11.7 HHA 12-hour in-service certificate

Requires a validated credit ledger totaling at least:

```text
12 accepted hours
within the applicable rolling 12-month window
```

The ledger may include approved modules, live education, and accepted external evidence.

It must not be calculated from a single Boolean.

## 11.8 Advanced module certificate

Issued per canonical Advanced module and assignment context.

An Advanced annual assignment and an onboarding assignment can point to the same content revision but remain distinct assignment records.

---

# 12. Certificate generation architecture

## 12.1 Issuance sequence

```text
1. Gate service evaluates eligibility
2. GateDecision PASS is signed
3. Certificate service creates issuance request
4. SQS job starts certificate renderer
5. Renderer loads immutable eligibility snapshot
6. Renderer generates:
   - certificate PDF
   - detailed transcript appendix
   - signed JSON verification manifest
7. Artifacts are hashed
8. KMS signs the manifest
9. Artifacts are stored in versioned S3
10. CertificateRecord is committed
11. certificate.issued event is emitted
12. optional personnel-file / Drive publication occurs
13. learner receives notification
```

## 12.2 Certificate package

Recommended package:

### Page 1 — certificate face

```text
Care Indeed logo
learner name
certificate title
role/pathway
completion/issue date
plan year or cycle
hours/credits, when approved
certificate public ID
QR verification code
issuer
```

### Appendix — detailed transcript

```text
completed module IDs and versions
P&P policy IDs and versions
quiz passing scores
attempt count
attestation dates
competency/signoff dates
supervised-practice evidence
hours/credits ledger
gate decision ID
artifact hashes
```

## 12.3 QR verification

The QR points to:

```text
/verify/certificate/:publicId
```

Do not encode private learner or score data directly in the QR.

Default public verification response:

```text
certificate status
learner display name
certificate title
issue date
issuer
public ID
active / superseded / revoked
```

Do not expose employee ID, question responses, detailed remediation, or private evidence.

## 12.4 Deterministic generation

The PDF must be reproducible from:

```text
certificate record
eligibility snapshot
template ID/version
approved Care Indeed logo hash
rendering-engine version
```

Browser print is not the authoritative generator.

## 12.5 Idempotency

Enforce a unique issuance key:

```text
subject
certificate definition/version
cycle or plan
eligibility snapshot hash
```

A retry returns the existing certificate instead of creating a duplicate.

## 12.6 Revocation and supersession

Never delete an issued certificate.

Use:

```text
REVOKED
SUPERSEDED
```

with an event and reason.

Examples:

```text
identity correction
content/grade invalidation
fraudulent evidence
administrative error
replacement certificate
```

A later annual lapse does not rewrite the historical onboarding certificate.

---

# 13. Credit and hours ledger

Create a separate ledger for:

```text
training hours
HHA in-service hours
CEU credits
live-session hours
drill participation
external accepted education
```

```ts
interface CreditLedgerEntry {
  id: string;
  subjectId: string;
  assignmentId?: string;
  evidenceId: string;
  creditType: "TRAINING_HOUR" | "HHA_INSERVICE_HOUR" | "CEU";
  value: number;
  occurredAt: string;
  acceptedAt: string;
  acceptedBy: string;
  cycleIds: string[];
  status: "ACCEPTED" | "REJECTED" | "REVERSED";
}
```

Do not equate:

```text
one module completion = one hour
```

unless the published content/credit definition says so.

External certificates remain pending until reviewed.

---

# 14. Recurrence architecture

“Annual” is not one Boolean.

## 14.1 Supported anchors

```text
calendar date
hire anniversary
role-start anniversary
last completion
rolling 12 months
credential expiry
RRULE
policy publication event
incident/remediation event
```

## 14.2 Recurrence cycle

```ts
interface RecurrenceCycle {
  id: string;
  subjectId: string;
  requirementRef: VersionRef;
  recurrenceRuleRef: VersionRef;
  cycleKey: string;
  windowStart: string;
  availableAt: string;
  dueAt: string;
  windowEnd: string;
  status:
    | "SCHEDULED"
    | "OPEN"
    | "DUE"
    | "OVERDUE"
    | "SATISFIED"
    | "CLOSED";
  assignmentIds: string[];
  accumulatedValue?: number;
  satisfiedAt?: string;
}
```

The unique key is:

```text
subject + requirement revision + recurrence-rule revision + cycleKey
```

This prevents duplicate annual assignments.

## 14.3 Current readiness versus historical completion

A current annual lapse may change:

```text
annual readiness
field clearance
scheduling eligibility
```

It does not erase:

```text
historical onboarding completion
historical certificate
past attempt
past evidence
```

---

# 15. API design

All mutation endpoints require:

```text
Cognito JWT
object-level authorization
Idempotency-Key
schema validation
conditional-write version
audit/outbox write
```

## 15.1 Learner APIs

```text
GET  /api/training/me
GET  /api/training/me/plan
GET  /api/training/me/assignments
GET  /api/training/me/assignments/:assignmentId
POST /api/training/me/assignments/:assignmentId/start

POST /api/training/me/sessions
POST /api/training/me/sessions/:sessionId/events
POST /api/training/me/sessions/:sessionId/close

POST /api/training/me/assignments/:assignmentId/attempts
POST /api/training/me/attempts/:attemptId/responses
POST /api/training/me/attempts/:attemptId/submit

POST /api/training/me/policies/:assignmentId/confirm-review
POST /api/training/me/policies/:assignmentId/attest

GET  /api/training/me/competencies
POST /api/training/me/competencies/:assignmentId/request

POST /api/training/me/external-training/upload-init
POST /api/training/me/external-training/:evidenceId/submit

GET  /api/training/me/certificates
GET  /api/training/me/certificates/:certificateId/download
GET  /api/training/me/transcript
```

## 15.2 Evaluator/supervisor APIs

```text
GET  /api/training/review-queue
GET  /api/training/subjects/:subjectId/assignments
POST /api/training/competencies/:assignmentId/observation
POST /api/training/signoffs/:assignmentId
POST /api/training/evidence/:evidenceId/validate
POST /api/training/remediation/:caseId/action
POST /api/training/remediation/:caseId/reauthorize
```

## 15.3 Administrator APIs

```text
GET  /api/training/admin/definitions
POST /api/training/admin/definitions
POST /api/training/admin/plans/resolve
POST /api/training/admin/assignments
POST /api/training/admin/waivers
POST /api/training/admin/gates/evaluate
POST /api/training/admin/certificates/:definitionId/issue
POST /api/training/admin/certificates/:certificateId/revoke
GET  /api/training/admin/reports/compliance
```

## 15.4 Public verification

```text
GET /api/public/certificates/:publicId
```

## 15.5 Error model

```json
{
  "error": {
    "code": "ATTEMPT_LIMIT_REACHED",
    "message": "This assignment requires supervisor remediation before another attempt.",
    "correlationId": "..."
  }
}
```

Use stable machine-readable codes.

---

# 16. Authorization model

Recommended capabilities:

```text
training.self.read
training.self.activity.write
training.self.attempt.submit
training.self.evidence.submit

training.supervisor.read
training.supervisor.review
training.evaluator.observe
training.evaluator.sign

training.hr.assign
training.hr.waive
training.hr.screening-status

training.don.clearance
training.don.remediation

training.compliance.audit.read
training.compliance.evidence.review

training.certificate.issue
training.certificate.revoke

training.definition.manage
```

Enforce:

```text
self-only learner access
supervisor scope
branch/location scope
acting-role scope
distinct-human signatures
no self-approval where independence is required
suspended-user denial
terminated-user read-only historical access policy
```

---

# 17. Audit and event integrity

Every accepted command must write:

```text
domain state change
append-only domain event
transactional outbox record
audit actor/time/correlation
```

in one transaction or a transactionally equivalent flow.

Event consumers deduplicate on `idempotencyKey`.

Sensitive documents and detailed remediation narratives belong in encrypted artifact storage, not event payloads.

Optional high-assurance audit chain:

```text
event hash
previous event hash
stream ID
sequence
```

---

# 18. Notifications and projections

Outbox consumers create:

```text
learner reminders
supervisor queue items
DON/HR escalation
CES task
calendar event
evidence/personnel-file routing
certificate notification
compliance dashboard projection
```

Calendar and CES are projections.

They are not the deadline or completion authority.

---

# 19. Reporting

## 19.1 Learner transcript

Shows:

```text
completed assignments
certificate links
policy acknowledgments
competencies
hours/credits
current assignments
```

## 19.2 Supervisor dashboard

Shows:

```text
due/overdue
pending signoffs
competency requests
remediation
expiring annual requirements
```

## 19.3 HR/Compliance report

Shows:

```text
assignment coverage
completion by audience
attempt/failure/remediation rate
certificate status
evidence gaps
screening/credential gate status
current annual readiness
```

## 19.4 Audit package

Exports:

```text
definitions and versions
assignment history
attempts/grades
policy versions
evidence hashes
signatures
gate decisions
certificate manifest
audit events
```

Governing Body reporting should be aggregate unless an authorized case requires individual detail.

---

# 20. DynamoDB access patterns

## 20.1 Records table examples

```text
PK = SUBJECT#<subjectId>
SK = PROFILE
SK = ROLE#<roleAssignmentId>
SK = PLAN#<planId>
SK = ASSIGNMENT#<assignmentId>
SK = ATTEMPT#<assignmentId>#<attemptNumber>
SK = GRADE#<assignmentId>
SK = EVIDENCE#<evidenceId>
SK = SIGNOFF#<signoffId>
SK = GATE#<gateId>#<evaluatedAt>
SK = CERTIFICATE#<certificateId>
SK = CYCLE#<cycleId>
```

Definition partitions:

```text
PK = REQUIREMENT#<requirementId>
SK = VERSION#<version>

PK = CERTIFICATE_DEF#<id>
SK = VERSION#<version>

PK = GATE_DEF#<id>
SK = VERSION#<version>
```

## 20.2 Suggested GSIs

```text
GSI1: supervisor/reviewer queue
GSI2: due/overdue assignments
GSI3: certificate public ID
GSI4: content revision → assignments
GSI5: cycle/status reporting
```

## 20.3 Events table

Partition by subject/month or assignment stream to avoid hot partitions.

```text
PK = SUBJECT#<subjectId>#<YYYYMM>
SK = TS#<occurredAt>#EVENT#<eventId>

GSI1PK = ASSIGNMENT#<assignmentId>
GSI1SK = TS#<occurredAt>#EVENT#<eventId>
```

---

# 21. Migration from `ci-journey-v1`

Treat existing browser records as untrusted claims.

## 21.1 Import states

```text
MAPPED
AMBIGUOUS
QUARANTINED
REJECTED
```

## 21.2 Rules

- Exact module ID/version + score + valid evidence may be reconciled.
- In-progress SCORM data imports as progress only.
- A local signature image is not a valid signoff.
- `appendixFCleared=true` becomes a historical claim pending evidence review.
- `clearedForIndependentWork=true` never creates a signed GateDecision.
- Unknown module IDs are quarantined.
- `CORE-*` and `ROLE-*` aliases are not accepted as new canonical IDs.
- Every import decision emits an audit event.
- Reruns are idempotent.

## 21.3 Shadow mode

Before cutover:

```text
legacy store remains read-only
new backend evaluates in parallel
gate differences are reported
no automatic certificate issuance from imported records
```

---

# 22. Build-time and release gates

Fail the build/release when:

```text
a gating requirement has no resolvable content revision
a policy reading references missing/unpublished/hash-mismatched text
a question bank lacks source/version metadata
a grade threshold or denominator is missing
a certificate-gating requirement has no evidence specification
a competency lacks an evaluator/signature rule
a recurrence rule lacks timezone/cycle strategy
a dual-signature rule allows the same human twice
a certificate template references an unapproved logo
a mutation emits no event/outbox record
a public certificate exposes sensitive fields
a generated certificate cannot be reproduced from its manifest
```

---

# 23. Runtime health

Expose sanitized health metrics:

```text
content adapter availability
unresolved content count
event projection lag
outbox backlog
oldest certificate job age
evidence rejection rate
signature backlog
overdue recurrence cycles
gate evaluation errors
audit-chain status
migration conflicts
```

Do not expose learner PII, tokens, answer keys, or artifact paths.

---

# 24. Testing strategy

## 24.1 Unit tests

```text
grade calculations
critical-error failure
attempt selection
cooldown/lockout
recurrence cycle keys
gate rules
certificate idempotency
credit aggregation
role resolution
distinct-human signatures
```

## 24.2 Property tests

```text
completion never passes with missing required evidence
certificate never issues from FAIL/CONDITIONAL gate
attempt number never decreases or duplicates
revocation never deletes history
annual lapse never edits historical onboarding certificate
```

## 24.3 Integration tests

```text
Cognito actor → assignment → session → attempt → grade
policy version → quiz → attestation → evidence
competency → evaluator signoff
gate evaluation → certificate job → S3 artifact
revocation → public verification status
```

## 24.4 Concurrency/idempotency

```text
duplicate submit
double-click certificate issue
out-of-order heartbeat
retry after timeout
two supervisors sign simultaneously
role change during active assignment
policy superseded during attempt
```

## 24.5 Security tests

```text
forged subject/role headers
learner reads another learner
answer-key exposure
expired JWT
suspended user
object-level authorization
presigned URL expiry
public verification data minimization
```

## 24.6 Browser tests

```text
cross-device resume
offline/sync states
attempt lockout
remediation flow
competency request
certificate download
QR verification
screen-reader and keyboard
mobile field-worker layout
```

---

# 25. Implementation order

## Phase 0 — approve architecture decisions

Approve:

```text
AWS production system of record
certificate types
certificate template/official logo
attempt-reset rule after third P&P failure
grade-selection rules
record-routing rules
retention classes
recurrence conflicts
```

## Phase 1 — foundation

Build:

```text
Cognito subject adapter
DynamoDB tables/GSIs
S3/KMS
training API baseline
event envelope
transactional outbox
audit writer
```

## Phase 2 — assignments and activity

Build:

```text
content registry
role/duty resolver
Journey plans
assignments
sessions
activity events
SCORM adapter
read models
```

## Phase 3 — assessments and grades

Build:

```text
attempt service
question-bank service
scoring
grade policies
critical errors
cooldowns
remediation
```

## Phase 4 — evidence and signoff

Build:

```text
upload validation
policy attestation
competency evidence
supervised visits
signature/eCIgn adapter
personnel-file routing
```

## Phase 5 — gate engine

Build:

```text
assignment completion
certificate eligibility
field clearance
system-access clearance
signed GateDecision
override workflow
```

## Phase 6 — certificate generation

Build:

```text
certificate definitions
SQS renderer
PDF/transcript/manifest
KMS signature
S3 storage
QR verification
revocation/supersession
```

## Phase 7 — recurrence and reporting

Build:

```text
annual cycles
rolling HHA hours
policy republish
credential triggers
notifications
supervisor/admin reports
audit exports
```

## Phase 8 — migration and cutover

Build:

```text
legacy import quarantine
shadow evaluation
parity reports
route cutover
legacy write retirement
```

---

# 26. Minimum production acceptance

Do not call the LMS backend production-ready until:

- authenticated identity is authoritative;
- localStorage is no longer the official learning record;
- assignments are role/duty/version bound;
- all attempts are immutable;
- grades are server-calculated;
- answer keys are server-only;
- P&P three-attempt/remediation rules work;
- active time is server-validated where required;
- evidence and signoffs are identity-bound;
- completion is derived;
- GateDecision is server-signed;
- certificate eligibility and issuance are separate;
- certificates are server-generated, hashed, versioned, and verifiable;
- certificate revocation/supersession works;
- clearance remains separate from certificates;
- annual/advanced/onboarding scopes remain separate;
- HHA 12-hour accumulation works;
- migration does not over-credit completion;
- audit/outbox writes accompany every state mutation;
- role, mobile, accessibility, security, and concurrency tests pass.

---

# 27. Key architecture rule

> **The PDF is not the certificate source of truth.**  
> The source of truth is the immutable `CertificateRecord`, its signed eligibility snapshot, its exact evidence/grade/signoff inputs, and its signed artifact manifest.
