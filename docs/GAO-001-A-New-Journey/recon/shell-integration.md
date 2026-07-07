I have everything needed. Here is the full recon report.

```markdown
# ModulePlayerScreen Architecture — Shell vs. Workspace Boundary

File under review: `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/ModulePlayerScreen.tsx` (2186 lines)

## 0. How it gets mounted (routing chain)

- Route table: `src/v6/routing/routeRegistry.ts:106-113` — all `/journey/module/...`, `/journey/final...` paths map to `template: 'module-player'` with `hashId`s `journey-orientation | module-player | lesson-player | module-assessment-splash | module-assessment-quiz | final-assessment-splash | final-assessment-quiz | final-result`.
- Dispatcher: `src/v6/screens/RepresentativeScreens.tsx:1750-1759` — all 7 of those `hashId`s route to the single `<ModulePlayerScreen />` component. There is one physical player component for the entire onboarding/training system; sub-page selection happens *inside* `ModulePlayerScreen` via `pathname`/`params` (see `ModulePlayerScreen.tsx:2094-2135`, the `useMemo` "Sub-route dispatcher").
- Shell chrome suppression: `src/v6/shell/V6Shell.tsx:48` — `isLessonPlayerRoute = /^\/journey\/module\/[^/]+\/lesson\/[^/]+\/?$/` strips the outer app dock/top-nav padding (`V6Shell.tsx:60-64`, `isChromeFreeRoute`, `suppressShellPadding`) specifically for the lesson-player sub-route, so the module player draws its own full-bleed chrome (headers, footers) rather than sitting inside normal page padding.
- `src/v6/screens/pageviews/CareIndeedOnboardingLMS.tsx` is **not rendered for learners at all**. It is a pure data module: it exports `ALL_MODULES` (raw onboarding module/lesson/exam content), imported only by `src/policy/journey/data/contentV2Adapter.ts:5,381` (`onboardingModulesRaw`). `ModulePlayerScreen.tsx` never imports this file directly — it consumes the normalized data via `contentV2Adapter.ts` (`getModuleDef`, `getGeneratedLesson`, `getModuleAssessment`, etc., imported at `ModulePlayerScreen.tsx:38-50`). So GAO-001 (and all onboarding modules) are rendered for learners by `ModulePlayerScreen.tsx`, sourced from content that originates in `CareIndeedOnboardingLMS.tsx` but passes through the adapter first.

---

## 1. SHELL ANATOMY (protected outer LMS shell)

The player has **two parallel shell skins** selected by `isCareIndeedOnboardingModule(moduleId)` (`ModulePlayerScreen.tsx:150-157`): the newer full-screen "onboarding" skin (used for GAO/ADM/DON/RN/... prefixed + CAO- modules, i.e. GAO-001) and the older embedded-card skin (non-onboarding/legacy modules, e.g. ACHC-ART-*). GAO-001 uses the **onboarding skin**.

### Onboarding skin (GAO-001 path) — `LessonPlayerPage`, `ModulePlayerScreen.tsx:1048-1236`
- **Outer fixed frame**: `ModulePlayerScreen.tsx:1049` — `<div className="fixed inset-0 z-[9998] ...">`. This covers the whole viewport above V6Shell's chrome (which is already suppressed for this route by `V6Shell.tsx:48/60`).
- **Idle warning modal**: `ModulePlayerScreen.tsx:1050-1068`. Driven by `idleWarning` from `useActiveTime()` (`ModulePlayerScreen.tsx:963`, engine in `src/policy/journey/lib/activeTime.ts`). Not touchable by scene components — it's a global overlay above everything (`z-[9999]`).
- **Top lesson-progress pills header**: `ModulePlayerScreen.tsx:1070-1103`. Renders one pill per lesson in the module (`allLessons.map`, line 1074), highlighting the active lesson and marking completed ones via `isLessonComplete(learnerState, moduleId, lessonItem.id)` (`src/policy/journey/lib/moduleProgress.ts:23-31`). Clicking a pill navigates directly to that lesson (`navigate(...)`, line 1081) — this is a shell-level navigation escape hatch scene components cannot intercept.
- **Save & Exit button**: `ModulePlayerScreen.tsx:1096-1101`. Literally just `navigate('/journey/module/${moduleId}')` — no draft-save call, no confirmation. It returns to the module overview page immediately; any answered-but-unsubmitted quiz/scene state is discarded (state lives in local `useState` inside `LessonPlayerPage`, which unmounts).
- **Left rail (Content/Narration tabs)**: `ModulePlayerScreen.tsx:1106-1139`. Tab state `activeTab` (line 914) is shell-owned; renders `OnboardingLessonHtml` (content) or raw narration script text (narration tab).
- **Workspace region** (where custom scenes mount): `ModulePlayerScreen.tsx:1141-1186`. See Section 2.
- **Bottom player controls / footer**: `ModulePlayerScreen.tsx:1189-1233`.
  - "Previous Lesson" button (1191-1203): decrements `currentIdx` or jumps to `prevLesson`.
  - Narration play/pause button + elapsed/total time readout (1205-1222): backed by `narrationAudioRef` (`<audio>` element, line 1233) and `lessonSeconds`/`totalNarrationSeconds` from `useActiveTime`.
  - "Next Lesson →" button (1224-1229): calls `handleNext` (`ModulePlayerScreen.tsx:1025-1038`) — this is the **only** function that writes lesson completion (`withLessonCompleted`) and advances routing. Scene components cannot call this directly; they can only call their own `onComplete` prop, which does **not** by itself trigger `handleNext`.
- **Card-index progress pips** (invisible/zero-opacity currently but present): `ModulePlayerScreen.tsx:1313-1322` — `stepLabels[currentIdx]`, hidden via `opacity-0 h-0`, still exists in DOM and could resurface with a CSS change; not a scene concern but flag as shell-owned.

### Legacy/non-onboarding skin (older modules) — same file, `ModulePlayerScreen.tsx:1238-1699`
- Same conceptual regions (lesson pips at 1263-1289, "Quit Lesson" link, narration tabs at 1327-1340, footer nav at 1644-1696) but laid out as an embedded card rather than full-viewport. Two-column grid: left column = content/quiz/challenge/debrief (1324-1633), right column = `MediaSlot` (1634-1640) — **no custom scene-component hook exists in this skin**. `CoreValuesInteractiveViewer`/`GAO001Scene01WelcomeDesk` are only wired into the onboarding skin's workspace (Section 2). If a legacy (non `isCareIndeedOnboardingModule`) module ever needed a custom scene, today there's no slot for it.

### Module-level / course-level shell pages (all shell, not workspace)
- `Module0OrientationPage` (`ModulePlayerScreen.tsx:562-647`): legal-identity fields + 3 mandatory acknowledgement checkboxes (`acks0`, line 560) that write directly into `useLearner()` state (`update(ack.key, !checked)`, line 619). **This is a real attestation-writing surface** — see Risks.
- `Module1OverviewPage` (653-870): module overview / lesson grid / "Start Module Knowledge Check" and "Start/Review Theory" buttons. Has its own onboarding-specific branch (662-777) vs. generic branch (779-869).
- `ModuleAssessmentSplashPage` (1706-1769), `ModuleAssessmentQuizPage` (1775-1875): quiz engine entry + execution. Quiz rendering delegated to shared `QuizRunner` (360-446) or, for `moduleId === "cms-485"`, to `Cms485AssessmentQuizPage` (a separate file). Scoring via `scoreModuleQuiz`/`getModuleQuizPassPct` from `contentV2Adapter`. Pass/fail writes `withModuleAssessment(s, scored.passed, moduleId)` into learner state (`ModulePlayerScreen.tsx:1811`).
- `FinalAssessmentSplashPage` / `FinalAssessmentQuizPage` / `FinalResultPage` (1882-2071): course-final exam flow. `recordExamAttempt(scored.pct, scored.passed)` (line 1955) is the write path; "Proceed to Certificate →" (line 1994) navigates to `/journey/appendix-f` — the **certificate/affidavit screen lives outside this file entirely** (AppendixFScreen, routed separately per `RepresentativeScreens.tsx:1760-1761`).
- `ModuleRemediationPanel` (452-554) and `ChallengeDebrief` (244-354): required-reading/retry-readiness gating UI, shared by both quiz engine and lesson debrief cards. Not part of the interactive-scene workspace; these are shell/content, not something a scene component should reimplement.

### What a custom scene component may NOT touch
- Route navigation of the lesson/module flow (`handleNext`, prev/next lesson buttons, Save & Exit, lesson pips) — all owned by `LessonPlayerPage`.
- `useLearner()` writes (`withLessonCompleted`, `withModuleAssessment`, acknowledgement flags, `recordExamAttempt`, `addActiveSeconds`) — these are the only sanctioned attestation/progress writers.
- The narration `<audio>` element and its play/pause state (`narrationAudioRef`, `narrationPlaying`) — shared/owned by the footer, not the workspace.
- The active-time engine (`useActiveTime`) and idle-warning modal — global to the lesson, not scene-scoped.
- Anything above `z-[9998]`/`z-[9999]` (idle modal, fixed frame) — a scene must never assume it can layer over these.

---

## 2. WORKSPACE INTEGRATION CONTRACT

Location: `ModulePlayerScreen.tsx:1141-1186` inside `LessonPlayerPage`, onboarding skin only.

### Container / sizing constraints
```
<section className="h-full rounded-[24px] border ... p-[20px] ... lg:min-h-0">      // ModulePlayerScreen.tsx:1141
  <div className="h-full w-full flex flex-col rounded-[18px] border ... overflow-hidden">   // 1142
    {/* scene renders here, fills 100% width/height of this inner div */}
  </div>
</section>
```
- The workspace column is the right side of a `lg:grid-cols-[420px_minmax(0,1fr)]` grid (`ModulePlayerScreen.tsx:1105`) — scenes get "whatever is left" width, full available height (`h-full`), with an outer 20px padding + 24px/18px rounded borders already applied by the shell. A scene component should render `className="h-full w-full ..."` at its own root (both example components do: `CoreValuesInteractiveViewer.tsx:806`, `GAO001Scene01WelcomeDesk.tsx:298`) and manage internal scroll/overflow itself.
- No fixed pixel width/height is passed in — scenes must be responsive to unknown container size (grid can go single-column below `lg` breakpoint, line 1105).

### Discriminator that selects a scene (page-type detection)
Pure content-sniffing, **not a declared `card.pageType` field** — this is the main hardcoding hazard:
```js
// ModulePlayerScreen.tsx:1143-1156
{isCoreValuesLesson(currentCard) ? (
  <CoreValuesInteractiveViewer onComplete={...} />
) : isGAO001WelcomeScene(currentCard) ? (
  <GAO001Scene01WelcomeDesk onComplete={...} />
) : hasMedia(currentCard.app.location) ? (
  <MediaSlot ... />
) : (
  <>{/* placeholder */}</>
)}
```
- `isCoreValuesLesson(card)` (`ModulePlayerScreen.tsx:159-164`): regex-matches `card.display_title`/`card.title`/`card.learner_facing_content` for `/core value/i` or "our core values". **Title/content text matching, no explicit id.**
- `isGAO001WelcomeScene(card)` (166-170): regex-matches title for "welcome to care indeed" or "first day". Also text-matching, and notably **not scoped to GAO-001 specifically** — any module whose card title contains those phrases would trigger it.
- Both checks run on `currentCard` (the current lesson "card"/slide from `contentV2Adapter`'s generated lesson `cards` array), evaluated fresh on every card change (`cards[currentIdx]`, line 984).
- Fallback chain after the two hardcoded scenes: `hasMedia()` (real media asset present) → static `MediaSlot` → gradient placeholder box. So there is exactly one `if/else if` chain, currently 2 slots deep, with zero abstraction (no registry/map keyed by card id or type).

### Props contract
Both current scene components implement the same minimal shape:
```ts
interface SceneProps { onComplete?: () => void; }
```
- `CoreValuesInteractiveViewer.tsx:690-694`, `GAO001Scene01WelcomeDesk.tsx:3-5`. No other props passed in (no card data, no moduleId/lessonId, no theme tokens) — scenes are fully self-contained black boxes that only report back via `onComplete`.
- Neither example receives the `currentCard` data, `moduleId`, or `lessonId` — if a future scene component needs contextual data (e.g., learner's name, module id for analytics), the contract has no channel for it today.

### How scene completion gates Next/Continue
**It doesn't, currently.** Look at the two `onComplete` handlers actually wired in (`ModulePlayerScreen.tsx:1144-1155`):
```js
<CoreValuesInteractiveViewer onComplete={() => { console.info('[GAO Core Values] Interactive scene completed'); }} />
<GAO001Scene01WelcomeDesk onComplete={() => { console.info('[GAO-001 Scene 1] visual_scene_completed'); }} />
```
Both just `console.info` — they do **not** set any state, do not call `setCanContinue`, do not touch `canContinue`/`handleNext`. The `canContinue` gate (`ModulePlayerScreen.tsx:1001-1009`) is computed purely from `isChallengeCard`/`isDebriefCard`/`isTerminologyCard`/`isLast+meetsLessonMinimum` — scene completion is **not one of the gate's inputs**. Today a learner can click "Next Lesson" without ever finishing the interactive scene. This is the single biggest gap to close for the 9 new scenes if completion-gating is required.
- The scene components *do* internally track their own completion (`isFullyComplete` in `CoreValuesInteractiveViewer.tsx:732`, `showComplete` in `GAO001Scene01WelcomeDesk.tsx:161`) and show their own "Scene Complete" overlay, but that state is local to the scene and dies on unmount/lesson switch.

### How progress persists
- Lesson-level completion: `withLessonCompleted(state, moduleId, lessonId)` → `src/policy/journey/lib/v2state.ts:33-41`, written into `learnerState.lessonProgress[moduleId::lessonId] = { viewed: true, checkPassed: true, completedAt }`. Called only from `handleNext` (`ModulePlayerScreen.tsx:1030`), never from scene `onComplete`.
- Persistence layer: `useLearner()` (`src/policy/journey/lib/learnerState.ts`) — single localStorage key **`ci-cna-learner-v1`** (`learnerState.ts:7`), loaded/saved via `loadJSON`/`saveJSON` (`src/policy/journey/lib/storage.ts`) on every state change (`learnerState.ts:134-137`, effect on `state`).
- Active-time engine has its own tab-ownership localStorage key **`ci-cna-at-owner`** (`activeTime.ts:25`), but accrued seconds are committed into the same learner-state blob (`state.lessonActiveSeconds[moduleId:lessonId]`, `activeTime.ts:47`) — not a separate store.
- There is also a secondary "bridge" write on lesson completion: `useJourneyStore.getState().recordLearnerCompletion(...)` (`ModulePlayerScreen.tsx:1032`, wrapped in try/catch) — a second, separate Zustand store (`src/policy/journey/stores/journeyStore.ts`) that duplicates completion signal for some other consumer (dashboards/admin screens likely). Any new scene-gating logic that changes when `handleNext` fires needs to keep both writers in sync.
- Nothing scene-specific persists today (no per-scene progress key, no partial-completion resume state) — if "Save & Exit mid-scene" needs to resume mid-interaction, that storage doesn't exist yet.

---

## 3. NARRATION/AUDIO IN PLAYER

- **Pre-recorded audio path**: `hasNarrationAudio(currentCard.app.location)` / `narrationAssetPath(...)` from `src/policy/journey/data/narrationManifest.ts` (imported `ModulePlayerScreen.tsx:55`). If an asset exists, a hidden `<audio>` element is rendered (`ModulePlayerScreen.tsx:1233` in the onboarding skin, `:1696` in the legacy skin) and toggled via `toggleNarrationAudio` (`933-942`), which just calls `.play()`/`.pause()` on the ref.
- **Browser TTS fallback**: `speechSynthesis` used only when `!narrationAudioReady && speechSupported` (`ModulePlayerScreen.tsx:915, 944-961, 1668-1676`). `toggleNarrationSpeech` builds a `SpeechSynthesisUtterance` from `currentCard.transcript_text || currentCard.narration_script` and calls `window.speechSynthesis.speak(utter)`. Cleaned up on unmount (`927-931`, `.cancel()`).
- **Captions/transcript**: no live captions synced to audio — instead there's a whole separate "Narration" tab (`activeTab === 'narration'`) that shows the full script as static text (`ModulePlayerScreen.tsx:1128-1136` onboarding skin, `:1628-1631`/`1629` legacy skin fallback). This is a manual, non-synchronized transcript view, not real captions.
- **Per-card, not per-scene**: narration is keyed off `currentCard` (the lesson slide), entirely orthogonal to which visual/scene component is mounted in the workspace region. Neither `CoreValuesInteractiveViewer` nor `GAO001Scene01WelcomeDesk` receives or drives the lesson-level narration audio — they instead have their **own internal, separate** Web-Audio-API sound-effect synthesizers (`InteractiveAudioSynth` in `CoreValuesInteractiveViewer.tsx:22-104`, `SoftAudio` in `GAO001Scene01WelcomeDesk.tsx:65-149`) for UI click/chime feedback — a completely different, unrelated audio subsystem than the lesson narration. Any new scene doing narration/TTS will need to either (a) reuse the shell's per-card narration exactly as-is (it plays alongside, unaware of the scene), or (b) build its own audio like the two existing scenes do, with no framework support for synchronizing the two.

---

## 4. EXTENSION RECIPE — registering 9 new GAO-001 scene components

Minimal steps given the current architecture:

1. **Build each scene component** as a self-contained default export accepting `{ onComplete?: () => void }`, matching the existing pattern (`CoreValuesInteractiveViewer.tsx`, `GAO001Scene01WelcomeDesk.tsx`). Root element should be `className="h-full w-full ..."` to fill the workspace region.
2. **Add a discriminator function** per scene, e.g. `isGAO001Scene02(card)`, following `isGAO001WelcomeScene` (`ModulePlayerScreen.tsx:166-170`) — match on `card.display_title`/`card.title` (or better: card id if the underlying GAO-001 content data assigns stable per-card ids/slugs — check `contentV2Adapter.ts`/`ACHC_Annual_Assembled.ts`/`CareIndeedOnboardingLMS.tsx` for whether cards carry a stable `card_id`; if so, discriminate on `card.card_id` instead of fuzzy title text — far safer for 9 scenes than string matching titles).
3. **Import and wire into the `if/else if` chain** at `ModulePlayerScreen.tsx:1143-1156`. This is the awkward part: it's a flat, hand-written conditional chain, not a registry. For 9 more scenes this becomes an 11-branch ternary/if chain in JSX. Recommended (still non-invasive) refactor: replace the chain with a small ordered array of `{ test: (card) => boolean, Component: React.ComponentType<SceneProps> }[]` resolved with `.find()`, still rendered in exactly the same slot — this touches only this one file/region, not shell behavior.
4. **Decide on completion gating.** Currently scene `onComplete` is a no-op console log — it does not feed `canContinue`. If the 9 new scenes must block "Next" until interacted with, you need to: add scene-completion state to `LessonPlayerPage` (e.g. `const [sceneComplete, setSceneComplete] = useState(false)`, reset in the existing reset-effect at `ModulePlayerScreen.tsx:917-925`), pass `onComplete={() => setSceneComplete(true)}`, and fold `sceneComplete` into `canContinue` (`1001-1009`) — but only for cards where a scene is actually mounted (don't require it for cards using `MediaSlot`/placeholder). This is a shell-file change but a narrowly scoped, additive one (doesn't alter Save & Exit, pills, or other module types).
5. **No new persistence needed for "scene shown" status** if lesson-level completion (`withLessonCompleted`) remains the unit of record — the existing per-lesson `ci-cna-learner-v1` write on `handleNext` already covers it, since a GAO-001 scene lives inside a lesson card, not as its own gate. Only add new storage if partial/mid-scene resume is required (see Risks).
6. **Hardcoding calls to flag before extending:**
   - `isCareIndeedOnboardingModule()` regex on module-id prefix (`ModulePlayerScreen.tsx:150-157`) determines which of the two entire player skins (onboarding vs. legacy) is used — confirm all 9 new pages stay under a `GAO-` (or `CAO-`) prefixed module id or they'll render in the legacy skin, which has **no scene-mounting slot at all** (Section 1).
   - Title-text-based discriminators are fragile across content edits/localization and can silently double-match (e.g., another module's card titled "welcome to care indeed" would incorrectly mount `GAO001Scene01WelcomeDesk`). Card-id-based discrimination is strongly preferable if available.
   - The `mediaTitle`/`hasMedia(currentCard.app.location)` fallback chain (`ModulePlayerScreen.tsx:1044-1045, 1156`) means if a discriminator fails to match, the card silently falls through to a generic media placeholder rather than erroring — useful for graceful degradation, but it also means a scene that fails to register will fail *silently*, not loudly, in QA.

---

## 5. RISKS

1. **Save & Exit does not persist scene progress.** `Save & Exit` (`ModulePlayerScreen.tsx:1096-1101`) is a bare `navigate()` — no explicit save call. Because `useLearner()` autosaves the whole learner-state blob to localStorage on every change (`learnerState.ts:134-137`), anything already committed via `setState`/`update` before the click is safe, but **any in-progress interaction inside a scene component (hotspots explored, email steps read, badge photo captured, checklist items ticked) is only React `useState` local to the scene and is lost immediately on unmount** — there is no scene-level checkpoint API. A learner who is 80% through a 9-scene sequence and hits Save & Exit (or navigates via a lesson pill, or the browser back button) restarts that scene from zero on return.
2. **Resume/retake always starts scenes at their initial state.** Since scene completion isn't part of `LessonPlayerPage`'s persisted state, re-entering a lesson (`navigate` to the same lesson id) remounts the scene component fresh — there's no "already completed this scene" indicator surfaced back into the shell, so a learner who finished a scene, left, and came back sees the scene reset (though the *lesson* itself may already show as complete in the pills if `handleNext` was reached, decoupling scene-visual-state from lesson-complete-state).
3. **Scene `onComplete` doesn't currently gate `canContinue` (Section 2) — this is a completion-integrity risk, not just a UX gap.** A learner can currently skip directly past `CoreValuesInteractiveViewer`/`GAO001Scene01WelcomeDesk` by clicking "Next Lesson" without interacting at all, since neither scene's completion is wired into `canContinue`. For 9 new scenes intended to convey required training content, decide explicitly (and test) whether this gating is required — right now, nothing in the code enforces it despite the components being built to detect their own completion.
4. **`Module0OrientationPage` acknowledgement checkboxes are a real attestation write path inside the training UI**, not the workspace, but worth flagging since new scenes sit in the same file/state ecosystem: `acks0.every((a) => state[a.key])` gates "Confirm & Continue" (`ModulePlayerScreen.tsx:565, 634-644`), and clicking a checkbox calls `update(ack.key, !checked)` (line 619) directly into persisted learner state — i.e., an unrelated interactive element accidentally wired the same way as a new scene's checklist (e.g. the `orientationChecks` state inside `GAO001Scene01WelcomeDesk.tsx:159, 285-291`) could just as easily start writing into `useLearner()` state if a future scene author imports `useLearner` inside a scene component instead of keeping it local — currently both example scenes correctly avoid touching `useLearner`/attestation state directly (they only call `onComplete`), but there's **no lint/architectural guard preventing a new scene from importing `useLearner` and writing acknowledgement/attestation fields directly**, which would bypass the shell's single write path (`handleNext`) entirely.
5. **Two duplicate completion-writers must stay in sync.** `handleNext` calls both `withLessonCompleted` (canonical persisted state) and `useJourneyStore.getState().recordLearnerCompletion(...)` (`ModulePlayerScreen.tsx:1030-1032`, second store, wrapped in try/catch so failures are swallowed silently). Any change to when/how lesson completion fires (e.g., to also require scene completion) must update both call sites or the two stores will disagree about a learner's completion status — and failures in the second writer are currently swallowed silently (empty `catch {}`), so drift between the two stores wouldn't surface as an error.
6. **Title-text discriminators risk false-positive scene mounts** across modules/content edits (Section 4) — a content author renaming a card title to include "core value" or "welcome to care indeed" in an unrelated module would silently swap in the wrong interactive scene instead of the intended lesson content, with no warning surfaced anywhere.
7. **Legacy skin has zero scene-mounting capability.** If any of the 9 new GAO-001 scenes need to be reused for a non-onboarding-prefixed module later, the workspace slot mechanism (Section 2) simply doesn't exist in the legacy player branch (`ModulePlayerScreen.tsx:1238-1699`) — only `MediaSlot` is available there.
```