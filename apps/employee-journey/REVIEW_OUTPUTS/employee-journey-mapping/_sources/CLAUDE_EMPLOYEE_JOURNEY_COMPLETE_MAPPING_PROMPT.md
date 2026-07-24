# CLAUDE MASTER PROMPT — MAP THE COMPLETE EMPLOYEE JOURNEY CONTENT
## Policies, Policy Player, Quiz, Actual Appendix Forms, All Modules, Annual/ACHC, Advanced Training, and Same-Tab Navigation

You are completing the front-end content integration for the Care Indeed Employee Journey / Training Academy.

The portal shell and responsive UI are already substantially built.

Do **not** redesign the entire portal again.

This pass must replace synthetic mapping fixtures with deterministic, canonical policy, form, module, annual, and advanced-training projections.

This remains a **front-end and build-time content-integration task**.

Do not perform backend, database, authentication, Cloud Run, Cognito, Drive, Brad, Nolan, eCign-server, or deployment work.

Do not deploy.

---

# 1. REQUIRED SOURCE BRANCH

Continue from the exact latest remote branch:

```text
feature/governing-body-portal
```

The reviewed checkpoint was:

```text
9de7f2e0787fb932a20e31a50e54c5c43a48f3e1
```

Fetch first and verify whether the branch has advanced.

Create a clean isolated worktree from the exact latest remote SHA.

Record:

```text
branch
starting SHA
worktree path
git status
ahead/behind
```

Do not touch the dirty main checkout or unrelated worktrees.

The final reviewed commits must be pushed back to:

```text
origin/feature/governing-body-portal
```

Do not merge to another branch.

Do not deploy.

---

# 2. REPOSITORY SAFETY

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

Stage exact paths only.

Do not touch or regenerate:

```text
GAO TTS
existing audio
DON scratch work
credentials
tokens
Drive keys
Cloudflare credentials
server data
```

Do not run:

```text
gao:tts:freeze
```

Do not use the evidence-route pre-commit override for this task.

This pass should not touch DefenCIble, evidence, policy authoring, or unrelated app-wide contrast files.

---

# 3. HARD SCOPE BOUNDARY

## Allowed

You may change/add:

```text
apps/employee-journey/app/journey/**
apps/employee-journey/app/styles/**
apps/employee-journey/scripts/**
apps/employee-journey/tests/**
apps/employee-journey/package.json
apps/employee-journey/next.config.ts
apps/employee-journey/vite.config.ts
front-end mapping tests
REVIEW_OUTPUTS/**
```

You may add small front-end mapping/config helpers in the main app only when required for same-tab routing or chrome-free form/player embedding.

## Forbidden

Do not modify:

```text
server/**
src/auth/**
deploy/**
Dockerfiles
Cognito
Cloud Run
database schemas
persistence
API routes
policy bodies
approved module lesson content
approved quiz scoring in existing modules
Brad runtime
Nolan runtime
eCign backend
Drive evidence backend
```

Do not turn this into a backend LMS project.

---

# 4. CURRENT GAPS TO CORRECT

The current Employee Journey app still uses hard-coded fixture arrays for:

```text
training assignments
policy assignments
documents
competencies
performance
history
```

Synthetic personas may remain for design review, but persona assignments must now be calculated from canonical generated registries.

The current policy workspace displays only five example policies and says official text will appear later.

The current training workspace displays only a handful of sample assignments.

Appendix F is represented as checklist text rather than an actual form workspace.

Correct all of those gaps.

---

# 5. SOURCE-OF-TRUTH ORDER

Use this precedence:

1. Current Git branch and current approved content
2. `src/policy/journey/data/modules.ts`
3. Standalone module registries and `ModulePlayerScreen` dispatch
4. `src/policy/journey/types/journey.ts`
5. `docs/onboarding/ONBOARDING_ARCHITECTURE_v2.3.md`
6. Approved role-policy assignment matrix / training readiness registry
7. `src/policy/journey/policyReading/policyResolver.ts`
8. `src/policy/data/allPoliciesContent.generated.ts`
9. `src/policy/data/policyCorpus.ts`
10. `src/policy/data/formsLibraryDataset.ts`
11. `src/policy/data/formsLibraryContent*.ts`
12. `src/policy/data/formTitles.generated.ts`
13. Current workflow and form alias registries

Do not invent a policy ID, form ID, appendix ID, module ID, title, role, quiz, or route.

When sources conflict:

```text
status = REVIEW_REQUIRED
employee action = none
admin mapping report = exact conflict
```

---

# 6. LOCATE THE APPROVED ROLE-POLICY SOURCE

The onboarding architecture identifies:

```text
ONBOARDING_ROLE_ASSIGNED_PP_MATRIX.md
```

as the controlling role-policy assignment source.

Search every current branch, worktree, prior authoritative Employee Journey package, and approved generated registry for:

```text
ONBOARDING_ROLE_ASSIGNED_PP_MATRIX
trainingReadinessRegistry
policyCourseCatalog
coursePolicyMappings
rolePolicyAssignments
expanded role-policy activities
```

Do not modify the source worktree during discovery.

Produce:

```text
REVIEW_OUTPUTS/employee-journey-mapping/POLICY_ASSIGNMENT_SOURCE_TRUTH.md
```

Record:

```text
source path
source SHA/hash
role codes
policy count
course/bundle count
assignment count
release states
conditional rules
conflicts
```

If the approved matrix cannot be located:

- map exact policy refs already verified through the canonical architecture;
- generate a complete gap report;
- do not assign every agency policy to every employee;
- do not guess role applicability.

---

# 7. CREATE A DETERMINISTIC MAPPING PIPELINE

Add commands such as:

```text
journey:map:generate
journey:map:verify
journey:map:audit
```

Recommended source:

```text
apps/employee-journey/scripts/generateJourneyMappings.ts
apps/employee-journey/scripts/verifyJourneyMappings.ts
```

Recommended outputs:

```text
apps/employee-journey/app/journey/_generated/
  journeySourceManifest.generated.json
  moduleCatalog.generated.ts
  modulePlayerMap.generated.ts
  moduleAssignmentMap.generated.ts
  policyCatalog.generated.ts
  policyAssignmentMap.generated.ts
  policyQuizMap.generated.ts
  appendixFormCrosswalk.generated.ts
  appendixForms.generated.ts
  annualAssignmentMap.generated.ts
  advancedAssignmentMap.generated.ts
```

Every generated file must contain:

```text
AUTO-GENERATED — DO NOT EDIT
source branch/SHA
source paths
source hashes
generated timestamp
schema version
record counts
unresolved counts
```

The verify command must fail on drift.

Do not manually paste hundreds of records into `fixtures.ts`.

Keep synthetic dates and statuses in fixtures; move canonical content and assignment identity into generated registries.

---

# 8. MAP EVERY CANONICAL MODULE

Read:

```text
src/policy/journey/data/modules.ts
```

Map every module in:

```text
ALL_MODULES
```

Families include:

```text
GAO
ADM
DON
RN
LVN
PT
PTA
OT
COTA
SLP
MSW
HHA
ANN
COMP
ACHC-ART
ADV
DRILL
SUPERVISED
```

For every module generate:

```text
module ID
canonical title
group
phase
week/quarter
roles
policy refs
regulatory refs
method
pass threshold
duration
prerequisites
evidence appendix
supervisor-signature requirement
player type
player route
player availability
source path
```

## 8.1 Player integrity

Audit the actual dispatch sources:

```text
ModulePlayerScreen
GAO registry
LVN registry
RN registry
ADM registry
DON registry
ACHC registry
advanced-training registry
generic content adapter
```

Classify each module:

```text
STANDALONE_PLAYER
CANONICAL_GENERIC_PLAYER
EXTERNAL_CANONICAL_PLAYER
UNAVAILABLE
IDENTITY_MISMATCH
```

A module card may launch only when one exact canonical player resolves.

If unavailable:

```text
Content not yet available
Assignment retained
No employee completion available
```

Do not silently drop it.

Do not create a fake generic player.

## 8.2 Portal assignment

Replace the synthetic `${persona.roleCode}-006` example with the complete canonical role path.

Use primary and secondary roles.

Deduplicate exact module IDs.

Preserve the strictest prerequisite and validation rule.

---

# 9. BUILD A BEAUTIFUL POLICY LEARNING PLAYER

Create front-end routes such as:

```text
/journey/policies/[assignmentId]/page.tsx
/journey/policies/[assignmentId]/quiz/page.tsx
```

Use the existing policy resolver and canonical policy content.

The player must render the **actual full policy body**, not a summary placeholder.

## 9.1 Desktop design

Use a premium three-zone layout:

```text
Left rail
- section table of contents
- reading progress
- assignment status

Center
- policy header
- version / effective date
- actual policy sections
- readable tables/lists/callouts

Right rail
- why assigned
- required action
- due date
- policy basis
- related forms
- related module
- help / Nolan boundary
```

## 9.2 Mobile design

Use one column:

```text
compact policy header
section selector sheet
full policy body
sticky Continue / Knowledge Check action
```

No horizontal policy table overflow.

## 9.3 Player sections

Provide:

```text
Read
Key changes
Forms & appendices
Knowledge check
Review / attestation
```

Do not invent changed-section summaries when no approved diff exists.

Display:

```text
Change summary not supplied
```

truthfully.

## 9.4 Policy resolution

Use or port:

```text
src/policy/journey/policyReading/policyResolver.ts
```

It already resolves:

```text
exact policy ID
title
full text
sections
version/effective data
quiz readiness
source confidence
```

Do not create another fuzzy policy resolver.

An unresolved policy must not launch as if verified.

---

# 10. CREATE THE POLICY QUIZ PLAYER

Use the existing v2.3 model:

```text
10 questions
80% pass
maximum 3 attempts
attestation after required completion
source-linked question rationale
```

Do not generate questions at browser runtime.

Do not call AI from the learner player.

## 10.1 Question-bank rules

Each question must contain:

```text
question ID
policy ID
policy version
policy section ID/title
stem
4 plausible options
correct index
rationale
source support
review status
reviewer / approval metadata when available
```

Question states:

```text
DRAFT_REVIEW_REQUIRED
APPROVED
RETIRED
```

Employee production mode may use only approved questions.

Synthetic preview mode may render draft questions only with:

```text
DRAFT KNOWLEDGE CHECK
No official score is recorded
```

## 10.2 Quiz UX

Provide:

```text
one question per view
question progress
Back / Next
flag for review
answered/unanswered map
Review answers
Submit confirmation
accessible radio groups
keyboard operation
results
source-linked remediation
attempt counter
```

Do not reveal correct answers before final submission.

After submission show:

```text
score
pass/fail
missed concepts
policy section links
next permitted action
remaining attempts
```

No celebratory certificate before all gates are met.

## 10.3 Mapping rules

Use approved policy quiz banks when present.

Where no approved bank exists:

```text
Quiz not yet published
Reading remains available
Completion blocked only when the assignment explicitly requires the quiz
Mapping report records the gap
```

Do not fabricate official completion.

---

# 11. RENDER THE ACTUAL APPENDIX FORMS

This is a non-negotiable requirement.

Do not render appendix descriptions as prose or checklist summaries.

Create routes:

```text
/journey/appendices/[appendixKey]
/journey/forms/[formId]
```

Create a polished:

```text
AppendixFormPlayer
ControlledFormRenderer
AppendixPacketNavigator
```

## 11.1 Actual form source

Use the real canonical form schema from:

```text
FORMS_DATASET
FORM_OVERRIDES_EXT
buildFormContent
formTitles.generated.ts
formIdAliases.ts
```

Render actual:

```text
instructions
fields
checkbox items
tables
acknowledgments
signature roles
orientation
form metadata
policy links
```

Do not substitute text saying what the form would contain.

## 11.2 Same-tab form rendering

The main V6 shell already supports:

```text
?embed=1
```

for chrome-free actual form rendering.

Choose one of these verified approaches:

### Preferred

Generate the selected form schemas into the Employee Journey app and render them with a shared read-only form renderer.

### Approved fallback

Embed the actual main-app form route in the same Employee Journey page:

```text
<MAIN_APP_URL>/forms/<FORM_ID>?embed=1
```

If iframe embedding is blocked by security headers, use same-tab full navigation to the canonical form and preserve a return URL.

Never use a new tab.

## 11.3 Appendix crosswalk

Generate an explicit crosswalk for every `EvidenceAppendix` key:

```text
F
A
B
HRTA005_A
HRTA005_B
HRTA005_D
HRTA005_E
HRTD003_A
HRTD003_C
HRTD003_D
HRTD003_E
HRER001_C
HRTD001_B
HRTD005_B
NONE
```

Each row must be:

```text
EXACT_FORM
COMPOSITE_PACKET
QUIZ_NOT_FORM
NO_FORM_REQUIRED
FORM_MAPPING_REVIEW_REQUIRED
```

Do not force one form onto an appendix when the identities differ.

## 11.4 Candidate mappings to verify—not assumptions

Review these candidates against the actual policy appendices:

```text
A               → HR-FM-005 candidate
B               → HR-FM-006 candidate
F               → composite pre-hire packet, including HR-FM-007 and linked screening forms
HRTA005_A       → HR-FM-007 candidate
HRTA005_B       → role-specific sign-off / competency form; verify exact identity
HRTA005_D       → policy/GAO quiz player, not a form
HRTA005_E       → supervised visit form; locate exact source
HRTD003_A       → HR-FM-016 candidate
HRTD003_C       → HR-FM-038 candidate
HRTD003_D       → HHA-specific competency form; locate exact source
HRTD003_E       → HHA supervisory visit form; locate exact source
HRER001_C       → 90-day introductory evaluation; do not substitute the annual HR-FM-008
HRTD001_B       → annual training dashboard/roster; verify exact source
HRTD005_B       → distinguish attendance log from after-action report
```

If an exact form does not exist:

```text
FORM_MAPPING_REVIEW_REQUIRED
```

and keep the UI blocked.

## 11.5 Composite Appendix F

Appendix F is a packet, not merely fifteen lines.

Render actual linked records such as:

```text
background authorization/status
OIG/SAM verification
license primary-source verification
reference checks
I-9 status
health/TB/immunization status
driving clearance when applicable
offer letter
job-description acknowledgment
new-hire onboarding checklist
HR sign-off
```

Employee mode should show confidential items as safe statuses and should not expose private reports.

---

# 12. MAP POLICY ASSIGNMENTS BY TIER AND ROLE

Use the v2.3 policy tiers:

```text
TIER 1 — ALL STAFF
TIER 2A — PATIENT-FACING
TIER 2B — QUALIFIED CLINICAL
TIER 3 — ROLE-SPECIFIC
TIER 4 — LEADERSHIP / SUPERVISOR
```

Preserve scope guards.

Do not require HHA, PTA, COTA, or MSW to complete assessor-level OASIS, comprehensive-assessment, medication-management, wound-management, or plan-of-care policy training unless the approved source explicitly marks it as:

```text
awareness_reference
```

Show a scope warning for awareness content.

Map general/office employees only to their approved Tier 1 and job-specific assignments.

Do not give every policy to every role.

Every policy assignment must include:

```text
assignment ID
role/audience
policy ID
policy version
assignment tier
required versus awareness
related module IDs
required action
quiz required
attestation required
estimated time
source matrix row
release status
```

---

# 13. MAP THE COMPLETE ANNUAL TRAINING PLAN

The Annual workspace must contain separate sections:

```text
Agency Annual Plan
ACHC Clinical Field Worker Bundle
Annual Competency
Emergency Drills / Live Activities
Policy Updates
```

## 13.1 Agency Annual Plan

Map all canonical `ANN-*` and `COMP-*` requirements according to their current role fields.

General employees may receive applicable universal annual items.

Clinical-only annual items remain clinical-only.

OASIS updates remain role/scope controlled.

Do not treat all annual requirements as one 100% number.

Show separate counts/hours for:

```text
online training
policy learning
competency
drill/live participation
```

## 13.2 ACHC owner-directed assignment rule

Assign every module:

```text
ACHC-ART-M01
through
ACHC-ART-M12
```

to this exact clinical portal audience:

```text
DON
RN
LVN
HHA
PT
PTA
OT
COTA
SLP
MSW
```

Exclude:

```text
GEN / general employee
office-only employees
finance-only employees
HR-only employees
driver-only employees
```

Administrator receives the ACHC clinical bundle only when the user also has a verified clinical secondary role.

Correct the current leak where M04, M07, and M09 use `roles: 'ALL'`.

Correct the current field-worker set that omits DON.

Implement the owner rule in one explicit source:

```text
ACHC_CLINICAL_AUDIENCE
```

Do not scatter exceptions across cards.

## 13.3 ACHC UX

Display:

```text
12-module bundle
Q1–Q4 grouping
module duration
policy basis
pass threshold
completion count
certificate gate
```

Every module must route to its actual ACHC player.

Do not use generic placeholders.

General employees should see:

```text
ACHC Clinical Field Worker Bundle
Not assigned to this role
```

only in admin/design preview—not in the normal employee assignment list.

---

# 14. MAP ADVANCED TRAINING

Create one explicit owner-approved audience constant:

```text
ADVANCED_PORTAL_MINIMUM_AUDIENCE = [
  'PT',
  'RN',
  'DON',
  'ADM'
]
```

Ensure these four roles can access the Advanced Training collection:

```text
CMS-485 Plan of Care and Compliance Integration
QAPI Training
OASIS-E2 Start of Care Assessment
Documentation Matters / Documentation Defensibility
```

## 14.1 Preserve valid additional scope

“Also assigned” is interpreted as minimum inclusion.

Do not silently remove an additional canonical role such as OT or SLP from a module where the current source explicitly requires that role.

Generate an audience report showing:

```text
canonical audience
owner-added audience
effective portal audience
scope warning
```

## 14.2 ADM scope

Administrator may receive leadership/oversight framing.

Do not imply that Administrator assignment grants clinical assessor authority.

Display:

```text
Leadership / oversight learning
Does not expand clinical scope of practice
```

when applicable.

## 14.3 Advanced player integrity

Every advanced module must launch its real advanced player.

Do not simplify OASIS or CMS-485 into a generic card player.

---

# 15. SAME-TAB NAVIGATION — PRESERVE AND HARDEN

Both Governance and Training Academy must remain same-tab.

Do not introduce:

```text
target="_blank"
window.open
newWindow=true
rel="noopener" for new tabs
```

## 15.1 Main app

Governance:

```text
/governance
```

Training Academy:

```text
configured Training Academy URL
```

Use:

```text
window.location.assign
```

or a normal same-tab link.

## 15.2 Remove hard-coded localhost

Replace:

```text
http://localhost:5190/
```

with an environment-aware resolver, for example:

```text
VITE_TRAINING_ACADEMY_URL
```

Development fallback may be localhost.

Production must fail truthfully when the URL is not configured.

Do not silently send a production user to localhost.

## 15.3 Employee Journey return routes

Add:

```text
NEXT_PUBLIC_MAIN_APP_URL
```

for same-tab return links to:

```text
main app
policy source
form source
canonical module player
governance
```

## 15.4 Duplicate Training navigation

The main app currently has:

```text
Training Academy
Training
```

Choose one employee-facing primary destination:

```text
Training Academy
```

Keep the old `/journey` main-app route available by direct URL for compatibility, but remove or relabel the duplicate primary navigation item.

Do not break canonical module routes.

---

# 16. VISUAL DESIGN

Keep the corrected Employee Journey design:

```text
Care Indeed teal structure
Care Indeed orange actions
warm ivory / white surfaces
Montserrat headings
Roboto body
role-neutral colors
field-worker mobile layout
44px touch targets
restrained shadows
```

Do not reintroduce claymorphism.

## 16.1 Policy player visual target

Make the policy player feel like a premium Care Indeed learning product:

- persistent section progress;
- clean document typography;
- strong metadata;
- elegant policy-basis callouts;
- actual forms displayed as controlled artifacts;
- quiz flow visually distinct but consistent;
- no huge walls of cards;
- no tiny all-caps copy.

## 16.2 Form player visual target

Use controlled-document cues:

```text
teal/orange top rule
form identity
version metadata
section badges
real field layout
read-only/employee-action state
signature owner
```

Do not flatten a real form into paragraphs.

---

# 17. TESTS

## 17.1 Mapping parity

Test:

- every canonical module appears exactly once in the generated catalog;
- every role assignment resolves;
- duplicate module IDs fail;
- player route mismatch fails;
- unavailable modules remain truthful;
- every policy assignment resolves exact policy ID or explicit review status;
- every appendix key has exact mapping classification;
- generated source hashes are current.

## 17.2 ACHC

Test all 12 modules for:

```text
DON  assigned
RN   assigned
LVN  assigned
HHA  assigned
PT   assigned
PTA  assigned
OT   assigned
COTA assigned
SLP  assigned
MSW  assigned
GEN  not assigned
office not assigned
```

Test that M04, M07, and M09 do not leak to general employees.

## 17.3 Advanced

Test:

```text
PT  sees Advanced
RN  sees Advanced
DON sees Advanced
ADM sees Advanced
```

Test additional canonical roles remain only when explicitly retained.

Test ADM scope warning.

## 17.4 Policy player

Test:

- actual full policy sections render;
- unresolved policy does not launch;
- version/effective data render;
- section navigation;
- mobile layout;
- changed-section absence is truthful;
- appendices/forms open;
- quiz uses source-linked approved/draft bank;
- 10 questions;
- 80% threshold;
- 3-attempt display;
- no answer reveal before submission;
- accessible keyboard flow.

## 17.5 Forms

Test:

- actual fields/checklists/tables/signers render;
- no appendix route renders only a prose summary;
- composite Appendix F shows actual constituent forms;
- HRER001_C is not replaced with annual HR-FM-008;
- unknown mapping is blocked;
- same-tab or embed behavior works;
- Back to assignment works.

## 17.6 Same-tab

Test:

- Governance does not open a new tab;
- Training Academy does not open a new tab;
- module player does not open a new tab;
- policy source does not open a new tab;
- form player does not open a new tab;
- no `window.open`;
- no `target=_blank`;
- production URL cannot resolve to localhost.

## 17.7 Responsive/accessibility

Run:

```text
320px
375px
768px
1024px
1440px
1600px
200% zoom
keyboard only
reduced motion
```

Check:

```text
policy TOC
quiz
form tables
sticky actions
same-tab return
no overflow
focus trap/restore
screen-reader labels
```

---

# 18. REQUIRED COMMANDS

Run:

```text
npm run journey:map:generate
npm run journey:map:verify
npm run journey:map:audit
```

Run the Employee Journey app:

```text
typecheck
lint
build
source tests
rendered route tests
Playwright/browser QA
```

Run main-app focused tests for:

```text
navigation manifest
V6Shell same-tab navigation
module dispatch
policy resolver
forms renderer
ACHC role calculations
advanced role calculations
```

Run root typecheck/build only as needed to prove no regression.

Do not change backend code to make a front-end test pass.

---

# 19. REQUIRED DELIVERABLES

Create:

```text
REVIEW_OUTPUTS/employee-journey-mapping/
├── SOURCE_TRUTH.md
├── POLICY_ASSIGNMENT_SOURCE_TRUTH.md
├── MODULE_CATALOG_AND_PLAYER_AUDIT.md
├── POLICY_MAPPING_REPORT.md
├── POLICY_QUIZ_BANK_REPORT.md
├── APPENDIX_FORM_CROSSWALK.md
├── APPENDIX_FORM_GAP_REPORT.md
├── ANNUAL_ASSIGNMENT_REPORT.md
├── ACHC_ASSIGNMENT_REPORT.md
├── ADVANCED_ASSIGNMENT_REPORT.md
├── SAME_TAB_NAVIGATION_REPORT.md
├── RESPONSIVE_QA.md
├── ACCESSIBILITY_QA.md
├── TEST_RESULTS.md
└── FINAL_MAPPING_READINESS.md
```

Final summary must include:

```text
starting/final branch and SHA
canonical module count
mapped module count
player-ready count
unavailable count
policy assignment count by role
verified/needs-review/invalid policy counts
quiz-bank approved/draft/missing counts
appendix exact/composite/gap counts
ACHC role matrix
advanced role matrix
same-tab route matrix
tests and exact results
unresolved decisions
confirmation no backend work
confirmation no deployment
```

---

# 20. ACCEPTANCE CRITERIA

Do not declare completion until:

- the Employee Journey no longer uses a seven-item training fixture as its content authority;
- every canonical module is mapped;
- every mapped module has one real player or truthful unavailable state;
- policy assignments come from an approved role-policy source;
- actual full policy text renders in a beautiful learner player;
- a complete accessible quiz player exists;
- quiz questions are source-linked and not runtime AI;
- actual canonical forms render for appendices;
- Appendix F renders as a form packet, not a text checklist;
- every appendix key has an exact classification;
- all annual modules are mapped;
- all 12 ACHC modules are assigned to the clinical audience and excluded from general employees;
- PT, RN, DON, and ADM receive the Advanced collection;
- valid additional canonical advanced roles are not silently deleted;
- Governance and Training Academy remain same-tab;
- no production URL uses localhost;
- duplicate primary Training destinations are resolved;
- responsive and accessibility QA passes;
- no backend files changed;
- no deployment occurred;
- final branch is pushed and synchronized.

Do not stop at another mapping report.

Implement the front-end mappings, players, quizzes, actual form rendering, and QA.
