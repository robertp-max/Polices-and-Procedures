# Files Changed / Preserved in Recovery

The following files represent the Plan of Care (CMS-485) and Onboarding Journey LMS migration work.

## New Files
- `src/auth/AuthProvider.tsx`: Mock authorization provider fallback context for headless runtimes.
- `src/favicon_careindeed_com_256x256.png`: Care Indeed official favicon branding asset.
- `src/v6/screens/pageviews/CareIndeedOnboardingLMS.tsx`: Core LMS training simulator and visual slide player.
- `src/v6/screens/pageviews/Cms485AssessmentQuizPage.tsx`: Quiz player page for the CMS-485 Plan of Care advanced training.
- `src/v6/screens/pageviews/NewHireScreen.tsx`: New Hire checklist gate view.
- `src/policy/journey/components/ReviewerToolsPanel.tsx`: Admin panel for simulating study time and overriding gates.
- `src/policy/journey/data/ACHC_Annual_Assembled.ts`: Assembled annual curriculum training.
- `src/policy/journey/data/advancedTraining/cms485PlanOfCare.data.ts`: Plan of Care (CMS-485) lesson slides and text curriculum.
- `src/policy/journey/data/advancedTraining/cms485PlanOfCareCases.data.ts`: Simulated clinical case study scenarios.
- `src/policy/journey/data/advancedTraining/qapi.data.ts`: Quality Assurance and Process Improvement lesson data.
- `src/policy/journey/data/contentV2.generated.ts`: Pre-baked curriculum text data.
- `src/policy/journey/data/contentV2Adapter.ts`: Adaptor layer mapping curriculum schema to visual slides.
- `src/policy/journey/data/courseModules.ts`: Module list definitions.
- `src/policy/journey/data/examPool.ts`: Question pool for module final exams.
- `src/policy/journey/data/lessonModel.ts`: Data schema definitions for lessons.
- `src/policy/journey/data/mediaManifest.ts`: Image visual aid mapping.
- `src/policy/journey/data/narrationManifest.ts`: Text-to-speech audio asset paths.
- `src/policy/journey/data/remediation.ts`: Theory remediation plans and retry checklist definitions.
- `src/policy/journey/data/remediationOverrides.ts`: Challenge question debrief explanations.
- `src/policy/journey/data/v2ModuleQuiz.ts`: Module assessment question pools.
- `src/policy/journey/lib/activeTime.ts`: Timer hook for active study-hour counting.
- `src/policy/journey/lib/gates.ts`: Core gating checks for certificate release.
- `src/policy/journey/lib/learnerState.ts`: Hook for legal name, license number, and completion variables.
- `src/policy/journey/lib/moduleProgress.ts`: Status tracking (started, in-progress, completed).
- `src/policy/journey/lib/progress.ts`: Progress utilities.
- `src/policy/journey/lib/storage.ts`: Persistence layer helper.
- `src/policy/journey/lib/uiState.tsx`: LMS UI states (e.g., drawer toggles, active lesson slide).
- `src/policy/journey/lib/v2state.ts`: State adapters.

## Modified Files
- `src/policy/data/formsLibraryContent.ts`: Moved `FormSignerSlot` type to avoid circular dependency.
- `src/policy/security/identity/pageAccess.ts`: Adjusted permissions for onboarding subnav.
- `src/policy/security/identity/pageRegistry.ts`: Updated metadata to group items under "ACHC Annual Training" instead of "Journey / Training", and deleted legacy `page.journey-v1`.
- `src/policy/stores/regulatoryExecutionStore.ts`: Moved `SignerTask` type definition for clean imports.
- `src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts`: Typing fixes.
- `src/policy/workflows/swimlanes/formInstanceResolver.ts`: Resolved canonical alias import cleanups.
- `src/v6/routing/navigationManifest.ts`: Updated sidebar item structure to link `onboarding` directly to `/journey/new-hire` and `/journey`.
- `src/v6/routing/routePresentation.ts`: Labeled nav group "Onboarding & Training" and matched new routes.
- `src/v6/routing/routeRegistry.ts`: Added routes for lesson, quiz, assessment, and certificate players.
- `src/v6/screens/pageviews/AppendixFScreen.tsx`: Updated with new gate checking and mock completion certificate visual viewer.
- `src/v6/screens/pageviews/JourneyLearningShell.tsx`: Simplified; removed internal navigation bar.
- `src/v6/screens/pageviews/JourneyOverviewScreen.tsx`: Replaced content with the new `CareIndeedOnboardingLMS`.
- `src/v6/screens/pageviews/ModulePlayerScreen.tsx`: Extended player component to support routing constraints, assessment players, and remediation check-offs.
- `src/v6/screens/pageviews/SupervisorScreen.tsx`: Cleaned up clinical hub view mapping optional scenario practices.
- `src/v6/screens/pageviews/index.ts`: Re-registered page view screen components.

## Deleted Files
- `src/v6/screens/pageviews/JourneyV1Screen.tsx`: Retired in favor of unified `CareIndeedOnboardingLMS`.
