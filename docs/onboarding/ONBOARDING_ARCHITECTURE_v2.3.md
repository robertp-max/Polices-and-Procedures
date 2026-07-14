# ONBOARDING_ARCHITECTURE v2.3

## Objective
Implement the ONBOARDING_ARCHITECTURE v2.3 support layer so P&P readings become first-class JourneyActivity records inside GAO and role-specific onboarding journeys.

The app must support this flow:

Role assignment
→ journey generation
→ GAO modules
→ embedded All Staff P&P reading activities
→ Direct Care / Qualified Clinical P&P activities where applicable
→ role-specific modules
→ role-specific P&P reading activities
→ 10-item P&P quizzes
→ attestation
→ evidence record
→ certificate gate

## CORE ARCHITECTURE RULES
- P&P readings are NOT a separate LMS.
- P&P readings are JourneyActivity records inside GAO and role-specific journeys.
- Every required P&P activity includes:
  - full policy text display
  - 10-item multiple-choice quiz
  - 80% pass score
  - max 3 attempts
  - attestation
  - personnel-file evidence record
  - certificate gate dependency
- Quiz questions must come from actual policy text in allPoliciesContent.generated.ts.
- Certificate cannot issue until all required P&P readings, quizzes, attestations, competencies, supervisor signoffs, and evidence records are complete.
- Do not use CORE-* or ROLE-* as primary IDs.
- Use actual module IDs:
  GAO, ADM, DON, RN, LVN, PT, PTA, OT, COTA, SLP, MSW, HHA.
- HHA cannot be independently assigned until all HHA clearance gates are complete per 42 CFR §484.80.
- Preserve patient-facing vs qualified-clinical scope split.
- Preserve ScopeOfPracticeGuard / awareness_reference logic.

## IMPLEMENTATION SCOPE
Implement a safe architecture scaffold and pilot integration.

Do NOT attempt to manually write hundreds of final quiz questions in this pass.
Instead:
- implement the quiz data model
- implement policy-text-derived quiz structure
- create a small pilot quiz set for 1–2 verified policies only
- add TODO/source hooks for the rest
- never claim all quizzes are complete unless they actually exist

## Tiers
- Tier 1: ALL STAFF → inside GAO journey
- Tier 2A: ALL PATIENT-FACING STAFF
- Tier 2B: QUALIFIED CLINICAL STAFF ONLY
- Tier 3: ROLE-SPECIFIC
- Tier 4: LEADERSHIP / SUPERVISOR

Rules:
- RN, LVN, PT, OT, SLP may receive qualified-clinical policies as required training.
- HHA, PTA, COTA, MSW must NOT receive comprehensive assessment/OASIS/POC/medication/wound policies as required training unless explicitly marked awareness_reference.
- HHA awareness/reference must display a scope warning.
- Administrator/DON receive leadership/supervisor policies.

## SOURCE PRIORITY (for implementation)
1. ONBOARDING_ARCHITECTURE_v2.3 is the controlling architecture.
2. CareIndeedOnboardingLMS.tsx is the controlling source for actual module IDs and journey ranges.
3. allPoliciesContent.generated.ts is the controlling source for real policy IDs, titles, and policy text.
4. ONBOARDING_ROLE_ASSIGNED_PP_MATRIX.md controls role-to-policy assignment logic, but policy IDs must be validated against allPoliciesContent.generated.ts.
5. AAA_CORRECTION_LOG_ONBOARDING_MODULE_IDS controls ID cleanup: no CORE-* or ROLE-* as primary IDs.

## ALLOWED FILE AREAS (for this work)
You may modify/create:
- Journey/onboarding types
- Journey activity model
- P&P reading activity model
- P&P assignment engine
- P&P activity rendering components
- P&P quiz component
- P&P attestation component
- certificate gate logic, only to include new activity completion conditions
- HHA clearance guard, only to implement v2.3 gate logic
- docs/architecture implementation notes
- test/fixture data for pilot policies

## ABSOLUTE RESTRICTIONS
Do NOT modify:
- generated policy files
- policy content
- evidence/eCign signature logic outside the minimal gate interface
- CES workflow logic
- packet generation
- advanced training/OASIS scoring
- auth/API/database/migrations unless unavoidable and explicitly documented
- route names
- theme branch or theme files
- Gemini theme work

## PHASE 1 — Validation + Types
1. Validate that ONBOARDING_ARCHITECTURE_v2.3 §3 matches CareIndeedOnboardingLMS.tsx.
2. Add/confirm TypeScript types:
   - JourneyActivity
   - PolicyReadingActivity
   - PolicyReadingQuiz
   - PolicyQuizQuestion
   - PolicyQuizAttempt
   - PolicyAcknowledgment
   - PolicyVersionReference
   - RolePolicyAssignment
   - CertificateGate
   - HHAClearanceRecord
   - ScopeOfPracticeGuard
3. Add comments/docstrings explaining v2.3 source.

Commit after Phase 1 if typecheck passes.

Commit message:
feat(onboarding): add v2.3 policy activity types

## Notes
This document is the canonical controlling source for the v2.3 policy-as-activity onboarding architecture.
It supersedes earlier BUILD1.x documents that used conflicting CORE-* / ROLE-* naming.
