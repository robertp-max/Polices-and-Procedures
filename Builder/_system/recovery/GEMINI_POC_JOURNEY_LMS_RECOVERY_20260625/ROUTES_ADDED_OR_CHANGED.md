# Routes Added or Changed

The routing setup under `src/v6/routing/routeRegistry.ts` has been updated to support sequential lessons, quizzes, assessments, and the certificate viewer.

## Main Navigation Entry
* **Path:** `/journey`
* **Label:** "Onboarding & Training" (changed from "Onboarding")
* **Sidebar Section:** Matches `journey-overview`, `journey-new-hire`, `appendix-f`, `supervisor`, `journey-admin`, `user-guide`.

## Registered Routes & Screens

### 1. Journey Overview (Home)
- **Path:** `/journey`
- **Hash ID:** `journey-overview`
- **Screen:** `JourneyOverviewScreen`
- **Description:** Entry point of the LMS training simulator.

### 2. New Hire Portal
- **Path:** `/journey/new-hire`
- **Hash ID:** `journey-new-hire`
- **Screen:** `NewHireScreen`
- **Description:** Multi-gate checklist coordinate for pre-employment screening, credentialing, vaccines, and supervisor check-offs.

### 3. Orientation Module
- **Path:** `/journey/module/m0`
- **Hash ID:** `journey-orientation`
- **Screen:** `ModulePlayerScreen` (triggers `Module0OrientationPage`)
- **Description:** Module 0 onboarding declaration, legal name verification, and CNA certificate entry.

### 4. Module Player / Lesson Player
- **Path:** `/journey/module/:moduleId` (Overview of lessons within a module)
- **Path:** `/journey/module/:moduleId/lesson/:lessonId` (Sequential slide viewer)
- **Hash ID:** `module-player` / `lesson-player`
- **Screen:** `ModulePlayerScreen`
- **Description:** Slide-by-slide theory reading with embedded TTS browser preview narration and image slot layouts.

### 5. Module Assessments & Quizzes
- **Path:** `/journey/module/:moduleId/assessment` (Splash instructions)
- **Path:** `/journey/module/:moduleId/assessment/quiz` (Quiz question sequence player)
- **Hash ID:** `module-assessment-splash` / `module-assessment-quiz`
- **Screen:** `ModulePlayerScreen`
- **Description:** Multiple-choice exams enforcing passing scores.

### 6. Final Exams & Certification
- **Path:** `/journey/final` (Splash details)
- **Path:** `/journey/final/quiz` (Final theory exam questions)
- **Path:** `/journey/final/result` (Score output and feedback)
- **Hash ID:** `final-assessment-splash` / `final-assessment-quiz` / `final-result`
- **Screen:** `ModulePlayerScreen`
- **Description:** Annual recertification examination player.

### 7. Certificate Gate
- **Path:** `/journey/appendix-f`
- **Hash ID:** `appendix-f`
- **Screen:** `AppendixFScreen`
- **Description:** Checks legal status, time elapsed, and exam outcomes to unlock the mock completion certificate view.
