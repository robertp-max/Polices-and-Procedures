```markdown
# Interaction Design System Recon — CoreValuesInteractiveViewer vs GAO001Scene01WelcomeDesk

## 1. Per-Component Breakdown

### CoreValuesInteractiveViewer.tsx (`src/policy/journey/components/CoreValuesInteractiveViewer.tsx`)

**Layout structure**
- Fixed-chrome shell: header bar (title + progress chip + mute/reset controls) at `CoreValuesInteractiveViewer.tsx:806-836`, single flex-1 "Stage" region below it at `:839`.
- Stage is one big inline `<svg viewBox="0 0 1000 600">` background scene (`SceneArtwork`, `:328-688`) rendered via `preserveAspectRatio="xMidYMid slice"`, absolutely filling the stage `div`.
- Hotspots are **HTML** `<div>`s absolutely positioned with inline `top`/`left` percentages over the SVG (`:843-873`), not SVG-native `<g onClick>` elements — position data lives in `SCENE_HOTSPOTS[i].position` (`:120,135,150,165`).
- A single full-screen modal overlay (`:876-1015`) is used for every hotspot's interaction (not per-hotspot custom UI), and a second full-screen "scene complete" overlay (`:1018-1034`).

**Interaction model**
- Hotspot registry → modal → 3-phase micro state machine per hotspot: `interactionPhase` 1 (pick Core Value) → 2 (pick correct action) → 3 (feedback + close). Driven by `SCENE_HOTSPOTS` config array (`:115-176`) with `targetValueId`, `options[].isCorrect`, `feedback` text baked into data.
- No SVG-driven interactivity — SVG is purely decorative/ambient (breathing, blinking, pacing animations via CSS `@keyframes` string injected into `document.head`, `:178-326,706-712`).

**Interaction states**
- `activeHotspotId` (null | hotspot id) — which modal is open.
- `completedHotspots: string[]` — solved hotspots.
- `interactionPhase: 1|2|3` — sub-step inside active modal.
- `selectedValue`, `selectedAction` — current picks, used to derive per-button correct/incorrect visual state.
- `shakeId` — transient wrong-answer shake target.
- `eyesClosed` — ambient blink animation flag (unrelated to interaction correctness).
- `isMuted` — audio toggle.
- Derived: `isFullyComplete = completedHotspots.length === SCENE_HOTSPOTS.length` (`:732`).

**Feedback mechanics**
- Wrong pick: `triggerShake(id)` → `synth.playError()` + CSS `.animate-shake` for 400ms, selection cleared after 850ms (`:754-758,767-770,785-788`).
- Right pick phase 1→2: `synth.playClick()`, 550ms delay before advancing phase (`:764-766`).
- Right pick phase 2→3 (final): `synth.playChime()`, 550ms delay, hotspot added to `completedHotspots` (`:777-784`).
- All feedback is via a self-contained `InteractiveAudioSynth` (Web Audio API oscillators — click/error/chime), no audio files (`:22-104`).
- Button visual states computed inline per render (`isSelected`/`isCorrect`/`isWrong`/`disabled` → conditional `btnClass` strings, `:915-943, 955-990`) — not extracted into a shared component.

**Completion criteria / onComplete**
- Completion = all hotspots solved (`completedHotspots.length === SCENE_HOTSPOTS.length`).
- `onComplete` fires via `useEffect` watching `isFullyComplete` (`:734-738`) — fire-once-per-mount pattern (no guard against re-firing if parent doesn't unmount, but state only transitions true once since hotspots aren't uncompleted except via `resetProgress`).
- `resetProgress()` (`:796-803`) fully clears state — supports replay but not resumability (no persistence).

**Narration / audio**
- No voice narration. Only diegetic SFX (click/error/chime) via synth. Dialogue/feedback text is silent, read-only copy in the modal.

**Accessibility**
- `aria-label` on hotspot buttons only (`:854`). No keyboard handling beyond native `<button>` semantics (works for Tab/Enter but no documented focus management, no visible focus-ring styling beyond browser default). No `aria-live` for feedback/shake/correctness changes. No `prefers-reduced-motion` handling — ping/pulse/shake/breathe animations are unconditional. Icons carry no additional `aria-hidden`.

**Styling/theming**
- Fully hardcoded hex literals throughout (`#007970`, `#C74601`, `#0F5B54`, `#E5FEFF`, `#FDF8F3`, etc.) via Tailwind arbitrary-value classes (`bg-[#007970]`), not semantic/theme tokens, not `theme-ci-light-orange` classes. No dark-mode/theme-variant awareness at all.

---

### GAO001Scene01WelcomeDesk.tsx (`src/policy/journey/components/GAO001Scene01WelcomeDesk.tsx`)

**Layout structure**
- Top bar (scene label + mute + status chip) `:300-314`, main SVG desk stage `:317-550`, then a static 4-card "Key Takeaway / Why It Matters / Completion Evidence / Reminder" info grid below the stage (`:697-715`) — copy is hardcoded prose, not modal-driven.
- Unlike CoreValues, hotspots here are **native SVG elements** with `onClick`/`role="button"`/`className="desk-clickable"` directly on `<g>` nodes inside the single big SVG (monitor `:433`, notebook `:482`, badge `:493`, orientation folder `:508`, mug `:520`) — no separate absolutely-positioned HTML hotspot layer.
- Email content, when opened, is an absolutely-positioned HTML div overlaid onto the monitor's SVG coordinates using percentage offsets (`:552-593`) — a hybrid SVG+HTML overlay technique.
- Two independent modal patterns: badge zoom (camera capture flow, `:596-650`) and orientation checklist zoom (`:652-687`), each a full-screen `bg-black/70` overlay + centered white card — structurally similar to but independently coded from each other (not shared).

**Interaction model**
- Not a uniform hotspot→same-modal state machine like CoreValues. Each clickable object has bespoke behavior:
  - Monitor → switches `viewMode` to `'emailOnMonitor'`, opens paged email overlay (`emailStep` 0-3, Next-button paging) `:238-261`.
  - Notebook, mug → just call `markExplored(id)`, no modal (`:482,520`).
  - Badge → opens zoom modal with live camera capture via `getUserMedia`, canvas snapshot to dataURL, sets `badgePhoto` (`:270-275,166-207`).
  - Orientation folder → opens checklist modal with independent per-item toggle state (`:278-291`).
- `explored: string[]` tracks which non-modal objects were touched (badge/checklist/notebook/mug) but is **not** wired into the completion gate at all — dead tracking.

**Interaction states**
- `viewMode: 'desk'|'emailOnMonitor'`, `emailStep: number` (0-3, paging).
- `badgeZoomOpen`, `orientationZoomOpen` — modal visibility.
- `badgePhoto: string|null` (data URL), `cameraActive: boolean`.
- `orientationChecks: Record<string, boolean>` — per-item checklist state (5 hardcoded items, `:660-666`), unused for completion gating.
- `explored: string[]` — visited non-critical objects, not used for gating either.
- `isMuted`, `showComplete`.

**Feedback mechanics**
- SFX only, via a second, differently-shaped `SoftAudio` class (`:65-147`) with named sound types `'mail'|'click'|'open'|'chime'|'complete'` — duplicate/parallel implementation of the same idea as `InteractiveAudioSynth` in CoreValues, not shared.
- No shake/error state at all — nothing in this scene can be "wrong" (checklist is boolean toggle, email is just paging forward).
- `console.info` telemetry breadcrumbs scattered through handlers (`:193,232,241-242,249,256,273,281`) tagged `[GAO-001 Scene 1]` — an ad hoc analytics/event-logging convention not present in CoreValues at all.

**Completion criteria / onComplete**
- Completion is gated **solely** on reading the email to its 3rd step (`emailStep >= 3`) — `:252-260`. Badge photo capture, orientation checklist, notebook, mug are all optional flavor with zero effect on `onComplete`.
- `onComplete()` fires once inside a `setTimeout` after `showComplete` is set (`:253-259`) — same fire-based-on-effect-of-click pattern as CoreValues but embedded directly in the click handler rather than a `useEffect` watching derived state.
- No reset/replay affordance at all (no `resetProgress` equivalent).

**Narration/audio**
- No voice narration; only SFX. Same gap as CoreValues.

**Accessibility**
- Some `role="button"` + `aria-label` on SVG interactive `<g>` groups (`:433,482,493,508,520`) — a bit more consistent than CoreValues' single aria-label. `.desk-clickable:focus-visible` CSS defines an outline (`:39-42`) — the *only* explicit focus-visible styling across both files. Still: SVG `<g>` elements are not natively focusable/tabbable without `tabIndex`, which is absent, so despite `role="button"` these are not actually keyboard-operable. No `aria-live` regions for email paging or checklist state changes.

**Styling/theming**
- Same pattern as CoreValues: hardcoded hex Tailwind-arbitrary values (`#0F5B54`, `#F26D33`, `#FDF8F3`, `#EEF4F3`...) — a mostly-overlapping-but-not-identical palette from CoreValues' (`#007970`/`#C74601` vs `#0F5B54`/`#F26D33`), suggesting per-scene ad hoc color picks rather than a shared token set. No `theme-ci-light-orange` or CSS variable usage; no dark mode.

---

## 2. Reusable Primitives Inventory

| Primitive | Where seen | Shape / prop pattern | Notes for generalization |
|---|---|---|---|
| **Injected keyframe stylesheet** | CoreValues `:178-326,706-712`; GAO001 `:7-63,214-220` | `useState(styleInjected)` + `useEffect` appends a `<style>` tag with a template-string CSS block to `document.head` | Duplicated verbatim pattern in both files. Should become a single `useInjectStyles(css: string)` hook or a real CSS module, since a mounted-twice scenario would double-inject (no cleanup/removal on unmount in either file).|
| **Self-contained Web Audio SFX engine** | `InteractiveAudioSynth` (CoreValues `:22-104`) vs `SoftAudio` (GAO001 `:65-147`) | Both: private `AudioContext`, `muted` flag, method-per-sound-type using oscillator+gain envelopes | Two independently-written, slightly-incompatible classes doing the same job. Prime candidate for a shared `useSceneAudio()` hook / synth module with a named sound-effect enum (`click|error|chime|complete|open|mail`) and a single mute-state source of truth. |
| **Hotspot registry pattern** | CoreValues `SCENE_HOTSPOTS` array (`:115-176`) with `id/title/icon/position/dialogue/actor/targetValueId/question2/options/feedback` | Data-driven array of objects, rendered generically via `.map` | This is the most reusable idea in the whole pair, but GAO001 doesn't use it — its hotspots are hardcoded inline SVG `<g onClick>` blocks. A shared `Hotspot[]` config + generic renderer (position, icon, label, click handler) would unify both scenes' hotspot layer. |
| **Completed/explored-set tracking** | `completedHotspots: string[]` (CoreValues `:697`) vs `explored: string[]` (GAO001 `:153`) | Simple array-of-ids + `.includes()` check before push | Same shape both places; ready to lift into a `useUnlockTracking(ids)` hook returning `{done, markDone, isDone, resetAll}`. |
| **Modal/zoom overlay shell** | CoreValues interaction modal (`:876-1015`) + full-completion modal (`:1018-1034`); GAO001 badge zoom (`:596-650`) + orientation zoom (`:652-687`) | Common shape: `fixed/absolute inset-0` dim backdrop + centered white rounded-2xl card + close button/X, `onClick` backdrop-to-close pattern (`stopPropagation` on card) | 4 independently hand-rolled overlay instances across the two files, all structurally identical (backdrop + card + optional header X). Strong candidate for a single `<SceneModal>` component. |
| **Multi-phase in-modal state machine** | CoreValues `interactionPhase` 1→2→3 (`:698,760-789`) | `phase` number gates which sub-section is visible/disabled, each phase has its own correct/incorrect branch with shake-on-wrong / advance-on-right | Reusable as a generic `useStepFlow(steps)` or `usePhaseGate(n)` primitive; GAO001's email paging (`emailStep` 0→3, `:246-261`) is a simpler linear version of the same idea and could ride the same hook. |
| **Correct/incorrect answer button styling logic** | CoreValues value-select buttons (`:915-943`) and action-select buttons (`:955-990`) | Per-item derived `isSelected/isCorrect/isWrong/disabled` → conditional class string assembly, duplicated twice within the same file | Should be a single `<ChoiceButton selected correct disabled>` component instead of two near-identical inline blocks. |
| **Shake-on-wrong feedback** | `triggerShake(id)` (CoreValues `:754-758`) | `shakeId` state + CSS class + `setTimeout` clear | Generalizable timing/animation utility (`useTransientFlag(duration)`). |
| **Progress chip in header** | CoreValues "`{completed} / {total} Solved`" chip (`:814-817`) | Just a computed count/total render | GAO001 has no equivalent — an easy, cheap primitive to standardize as `<ProgressChip current total label icon>`. |
| **Mute toggle button** | Both files, separately implemented (CoreValues `:791-794,820-826`; GAO001 `:222-226,303-309`) | `isMuted` state + toggler calling into the respective audio singleton's `muted`/`setMuted` | Should share one `<MuteToggle>` wired to the unified audio hook above. |
| **Reset/replay** | CoreValues `resetProgress()` (`:796-803`) only | Clears all interaction state to initial values | GAO001 has no reset at all — gap, but the CoreValues implementation is a reasonable template (clear all state atomically) to generalize into `useSceneState().reset()`. |
| **`onComplete` firing pattern** | CoreValues: `useEffect` watching derived `isFullyComplete` (`:734-738`); GAO001: inline `setTimeout` inside click handler (`:253-259`) | Two different mechanisms for conceptually the same "fire once when criteria met" job | Should converge on one pattern — a `useEffect` watching a single derived `isComplete` boolean is safer (guards against double-fire better than embedding in a handler) and should be the standardized approach. |
| **SVG ambient character animation via CSS classes** | CoreValues breathing/nodding/pacing/blinking (`:211-325`, `eyesClosed` prop `:328,512,563`); GAO001 subtle-bob/gentle-pulse/mail-blink (`:8-30`) | `className="animate-x"` on SVG `<g>` groups, keyframes in injected stylesheet | Cosmetic-only; reusable as a small library of "ambient life" keyframe mixins, independent of interaction logic. |

---

## 3. Gaps vs the Interactivity Quality Bar

**Keyboard / screen-reader access**
- CoreValues: hotspot `<button>`s are keyboard-operable by virtue of being real `<button>` elements, but nothing else is — no focus trap in modals, no `Escape`-to-close, no `aria-live` announcing phase transitions/correctness feedback, choice buttons have no `aria-pressed`/`aria-invalid`, icons aren't marked `aria-hidden`.
- GAO001: interactive SVG `<g>` elements have `role="button"` and `aria-label` but **no `tabIndex`**, so they are not actually reachable via keyboard Tab order despite the ARIA role — a real access break (role without focusability). Modals here also lack focus trap/Escape handling. Camera-capture flow (`getUserMedia`) has zero accessible fallback messaging beyond a blocking `alert()` (`:177`).
- Neither file sets `role="dialog"`/`aria-modal="true"` on any of the four overlay modals.

**Reduced motion**
- Neither file checks `prefers-reduced-motion`. CoreValues has persistent infinite animations (breathing, pacing, blinking, curtain sway, ping-slow) that would run for motion-sensitive users regardless of OS setting. GAO001's `mailBlink`/`gentlePulse`/`subtleBob` are milder but equally unconditional.

**Narration sync**
- Neither component has any narration/voiceover or transcript hook point — audio is exclusively short synthesized SFX tones, not spoken content. There's no timing/sync scaffold (e.g., no `<audio>` element, no captions, no word-highlight-while-speaking) to build narration on top of; it would have to be added from scratch.

**Resumability**
- Neither component persists any state (no localStorage/sessionStorage/URL param/prop-driven initial state). Refreshing or remounting always restarts at zero. CoreValues at least offers `onComplete` + a manual `resetProgress`; GAO001 offers neither persistence nor a reset control. Neither accepts an `initialState`/`resumeFrom` prop, so a learner who leaves mid-scene loses all progress (badge photo, checklist answers, email step, solved hotspots).

**Content/data-driven configuration**
- CoreValues is meaningfully data-driven for its hotspot content (`SCENE_HOTSPOTS`, `CORE_VALUES` arrays) — swapping scenario text/answers doesn't require touching JSX, only the arrays at `:106-176`.
- GAO001 is almost entirely hardcoded: email copy is inline JSX per `emailStep` (`:561-577`), orientation checklist items are an inline string array inside the render tree (`:660-666`), badge name "ALEX"/role "RN • NEW HIRE" are literal SVG `<text>` (`:501-502,615-616`), takeaway cards are hardcoded prose (`:699-714`). None of this could be reconfigured for a different scene/character/policy without editing this file's JSX directly.

**Redundancy (same text/logic in multiple places)**
- GAO001: employee name/role "ALEX" / "RN • NEW HIRE" is duplicated between the on-desk SVG badge (`:501-502`) and the zoomed badge modal (`:615-616`) — two literal copies that could drift.
- Both files duplicate near-identical audio-engine classes (`InteractiveAudioSynth` vs `SoftAudio`) and near-identical style-injection `useEffect` boilerplate, and both duplicate the "dim backdrop + centered card + X-close" modal shell 1x (CoreValues) / 2x (GAO001) rather than sharing one component.
- CoreValues duplicates the answer-button correct/incorrect class-computation logic between the value-select grid (`:915-943`) and the action-select list (`:955-990`) almost verbatim.
- GAO001's `explored` and `orientationChecks` state is tracked but never read for gating — dead/redundant state that implies designed-but-abandoned functionality (or a currently-invisible completion contract).

---

## 4. Verdict: Bespoke Per-Scene Components vs. Data-Driven Scene Engine

**Recommendation: build one data-driven scene engine**, not more bespoke per-scene files like these two.

Rationale grounded in what was read:
1. **The two prototypes already diverged in incompatible ways for the same job.** Two separately-written audio engines (`InteractiveAudioSynth` vs `SoftAudio`), two different hotspot mechanisms (HTML-div-over-SVG vs native SVG `<g onClick>`), two different completion-firing patterns (`useEffect` vs `setTimeout`-in-handler), and two different color hex sets for what should be one theme. Every new scene built bespoke will keep re-inventing (and subtly breaking) these same primitives — the badge-name duplication bug in GAO001 (`:501-502` vs `:615-616`) is a direct, observable symptom of "no single source of truth" that a data-driven engine's config object would eliminate by construction.
2. **CoreValues' `SCENE_HOTSPOTS` config array already proves the data-driven model works well** — the modal, phase progression, and answer-button rendering are fully generic against that array. GAO001 shows what happens when a scene *doesn't* follow that discipline: hardcoded checklist items, hardcoded email paragraphs, hardcoded badge text, and unused/dead state (`explored`, `orientationChecks`) that never wires into completion.
3. **The identified gaps (keyboard access, `prefers-reduced-motion`, `aria-live`, focus-trap/`role="dialog"`, resumable state, narration hooks) are cross-cutting concerns that must be solved once, in shared primitives, not per-scene.** If each future scene is a bespoke component, each one will need someone to remember to re-implement focus traps, tabIndex on SVG hotspots, reduced-motion guards, and localStorage-based resume — and history (GAO001 shipping `role="button"` without `tabIndex`) shows that discipline slips without a shared abstraction enforcing it.
4. **The reusable-primitives inventory in section 2 is large and clean-edged** (hotspot registry, unlock tracking, modal shell, phase-gate flow, choice-button component, mute/audio hook, progress chip) — this is exactly the shape of problem a small scene-engine (a `<SceneStage hotspots={...} audio={...} onComplete={...}>` + config schema for dialogue/choices/feedback/checklist/email-like content) is built to solve, and the two prototypes collectively supply nearly a complete parts list for it.
5. **Bespoke-per-scene is only preferable if scenes are expected to need truly one-off interaction shapes indefinitely** (camera capture in GAO001 is the one truly bespoke mechanic here). Even so, camera-capture can be one more pluggable "interaction type" registered with the engine rather than justifying a fully separate bespoke component; it doesn't need its own audio engine, modal shell, or style-injection boilerplate.
```