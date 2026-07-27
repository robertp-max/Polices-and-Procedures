# CLAUDE MASTER PROMPT — IMPLEMENT THE CARE INDEED LMS BACKEND
## Grades, activity, attempts, remediation, evidence, gates, certificates, recurrence, and audit

Use the attached `CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` as the controlling target architecture.

This is a backend implementation program. Do not collapse it into one oversized unreviewable commit.

## Core outcomes

Implement a server-authoritative LMS for Care Indeed Employee Journey covering:

```text
subjects and roles
requirement definitions
Journey plans and assignments
activity sessions/events
SCORM/Journey adapters
assessment attempts
server scoring
grade policies
attempt cooldown/lockout
remediation
policy review and attestation
evidence and signoffs
competency and supervised-practice validation
recurrence
credit/hour ledger
server-side gate decisions
certificate eligibility
certificate PDF/manifest generation
certificate verification/revocation
transcripts/reports
migration from ci-journey-v1
```

## Non-negotiable rules

- No browser/localStorage completion authority.
- No client-supplied official score.
- No standalone authoritative `completed=true`.
- Every assignment pins exact requirement/content/policy/assessment versions and hashes.
- Attempts, evidence, grades, gate decisions, and certificates are append-only.
- Policy reading remains a JourneyActivity.
- Approved P&P activities use 10 questions, 80%, and three ordinary attempts.
- After third failure: training hold + DON/HR review + 1:1 remediation; a new attempt requires an identity-bound reattempt authorization.
- A certificate is not field clearance.
- ANN and ADV do not block historical onboarding certificate issuance.
- HHA field clearance requires GAO, HHA role track, HHA-SUP, policy activities, competency, RN signoff, and valid personnel-file evidence.
- HHA 12-hour in-service is accumulated from validated credit evidence.
- Certificates are server-generated and immutable.
- Browser print is never the authoritative artifact.
- Certificate manifests and GateDecisions are KMS signed.
- One person cannot satisfy two distinct-human signer slots.
- No PHI in training events, certificates, logs, or assessment responses.

## Recommended physical implementation

Use:

```text
existing authenticated TypeScript API service
Cognito
DynamoDB learning records table
DynamoDB append-only learning events table
S3 staging and artifact storage
SQS certificate/evidence jobs
KMS
CloudWatch
```

Keep repository interfaces provider-neutral.

## Required branch safety

Create a clean isolated branch/worktree.

Never run:

```text
git prune
git gc
git repack
git maintenance
git clean
git worktree prune
git reset --hard
git stash
git add -A
git add .
```

Do not force-push.

Do not deploy until separately authorized.

## Work waves

### Wave 0 — source truth and ADRs

Create:

```text
ADR-LEARNING-001 — production storage decision
ADR-LEARNING-002 — event/outbox model
ADR-LEARNING-003 — assessment/attempt policy
ADR-LEARNING-004 — certificate and clearance separation
ADR-LEARNING-005 — artifact, signature, and record routing
```

Resolve the post-third-failure reattempt rule before publishing AttemptPolicy records.

### Wave 1 — infrastructure and domain foundation

Implement:

```text
domain types
DynamoDB adapters
event envelope
outbox
audit writer
Cognito subject adapter
capability checks
health/readiness
```

### Wave 2 — plan, assignment, and activity

Implement:

```text
ContentRegistry
role/duty resolver
JourneyPlan
LearningAssignment
ActivitySession
LearningActivityEvent
SCORM adapter
learner read models
```

### Wave 3 — assessment, grade, and remediation

Implement:

```text
AssessmentDefinition
AttemptPolicy
GradePolicy
AssessmentAttempt
server question-set selection
response submission
ScoreResult
GradeResult
critical-error rules
cooldown/lockout
RemediationCase
ReattemptAuthorization
```

### Wave 4 — evidence, competency, and signoff

Implement:

```text
CompletionEvidence
upload-init/validate/promote
policy attestation
competency observation
supervised-visit evidence
SignoffRecord
eCIgn/signature adapter
distinct-human enforcement
personnel-file routing
```

### Wave 5 — gate engine

Implement:

```text
GateDefinition
GateDecision
KMS assertion signature
assignment completion gate
certificate eligibility gate
field clearance gate
system-access clearance gate
override/expiry
```

### Wave 6 — certificates

Implement:

```text
CertificateDefinition
CertificateRecord
issuance idempotency
SQS renderer
Care Indeed certificate HTML template
PDF
transcript appendix
JSON verification manifest
KMS signature
S3 artifact
QR verification route
revocation/supersession
optional Drive publication
```

### Wave 7 — recurrence, hours, notifications, reports

Implement:

```text
RecurrenceRule
RecurrenceCycle
CreditLedgerEntry
HHA rolling 12-hour calculation
annual/advanced cycles
policy-republish assignments
notifications
CES/calendar projections
learner transcript
supervisor/admin/compliance reporting
```

### Wave 8 — migration and controlled cutover

Implement:

```text
LegacyIdentityMap
QuarantinedLegacyArtifact
ci-journey-v1 importer
shadow evaluation
gate difference report
no boolean-to-pass conversion
legacy read-only period
cutover gates
```

## API contract

Implement the `/api/training` learner, supervisor, admin, certificate, and public-verification endpoints specified in the architecture.

Every mutation requires:

```text
Cognito JWT
object-level authorization
Idempotency-Key
schema validation
optimistic concurrency
domain event
outbox record
audit metadata
```

## Required tests

At minimum:

```text
unit
property/invariant
DynamoDB integration
S3/KMS integration
auth/object-scope
idempotency/concurrency
SCORM adapter
policy quiz 3-attempt flow
competency/signoff
HHA field clearance
HHA 12-hour ledger
certificate deterministic rendering
QR verification
revocation
migration quarantine
Playwright learner/supervisor/admin flows
```

Release must fail when:

```text
content or policy version cannot resolve
question bank lacks approval/version/source
score denominator/threshold is missing
certificate-gating evidence spec is missing
competency has no evaluator rule
distinct-human rule can be violated
mutation lacks event/outbox write
certificate cannot be reproduced from manifest
```

## Required deliverables

```text
REVIEW_OUTPUTS/lms-backend/
├── SOURCE_TRUTH.md
├── ADR_INDEX.md
├── DOMAIN_MODEL.md
├── DYNAMODB_ACCESS_PATTERNS.md
├── API_CONTRACT.md
├── ACTIVITY_EVENT_CATALOG.md
├── ASSESSMENT_AND_GRADE_RULES.md
├── REMEDIATION_RULES.md
├── EVIDENCE_AND_SIGNOFF_MODEL.md
├── GATE_DEFINITION_MATRIX.md
├── CERTIFICATE_DEFINITION_MATRIX.md
├── CERTIFICATE_RENDERING_QA.md
├── RECURRENCE_AND_CREDIT_MODEL.md
├── AUTHORIZATION_MATRIX.md
├── MIGRATION_RECONCILIATION.md
├── SECURITY_QA.md
├── PERFORMANCE_QA.md
├── TEST_RESULTS.md
└── FINAL_READINESS.md
```

## Stop condition

Do not report production readiness until:

```text
server authority is live
all version binding works
attempts and grades are immutable
gate decisions are signed
certificates are server-generated and verifiable
clearance is separate from certificates
HHA requirements work
migration does not over-credit
full security/concurrency/browser suites pass
```
