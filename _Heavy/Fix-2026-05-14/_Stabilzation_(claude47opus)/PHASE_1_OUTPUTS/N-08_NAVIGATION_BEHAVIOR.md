# N-08 — New Navigation Behavior Documentation

**Task:** Document Phase 1 navigation safety changes (removal of global swipe and arrow-key handlers) for future engineers, QA, and UAT participants.  
**Owner:** Track A (Navigation & Input Safety)  
**Related:** N-05 (`replace: true` audit)  
**Date:** 2026-05-16

---

## 1. What Changed (Phase 1)

Two global handlers that previously overrode browser and component behavior were removed from `CommandCenterLayout.tsx`:

- **Global touch-swipe handler** (swipe-left / swipe-right) — removed entirely.
- **Global keyboard ArrowLeft / ArrowRight handler** — removed entirely.
- `useNavStore.initiateBack()` and `initiateForward()` are no longer invoked by the global shell (these methods remain in the store exclusively for the intentional `UniversalNavControls.tsx` surface).

**User-visible impact:**
- Typing arrow keys in any input field, text area, or dropdown no longer triggers unintended app-level navigation.
- Scrolling or swiping on mobile no longer accidentally triggers back/forward navigation.
- The app now respects native browser history and per-component input behavior.

These changes restore predictable navigation while preserving all intentional in-app controls.

---

## 2. What Is Now Canonical

The following are the **only** supported navigation primitives:

| Primitive                        | Description                                                                 | Applies To                  |
|----------------------------------|-----------------------------------------------------------------------------|-----------------------------|
| Browser Back / Forward buttons   | Native history stack traversal                                              | All surfaces                |
| Mobile system back gesture       | Android system back button / iOS edge swipe                                 | All surfaces                |
| `<Link>` / `<NavLink>`           | Declarative in-app navigation                                               | All surfaces                |
| `navigate()` (react-router)      | Programmatic navigation (without global side effects)                       | All surfaces                |

No global gesture or key handlers exist outside explicitly scoped component surfaces (see §4).

---

## 3. Browser Back / Forward Expectations

Browser history now behaves consistently across major operational surfaces. Legacy route aliases intentionally use `replace: true` so Back skips the alias and lands on the prior real page (see N-05 audit for full list).

| Starting Surface                        | Action          | Expected Landing Page                                      | Notes |
|-----------------------------------------|-----------------|------------------------------------------------------------|-------|
| CES Board (`/ces/board`)                | Browser Back    | Previous page (whatever user was on before entering CES)   | Alias redirects (`/ces` → `/ces/dashboard`) are `replace: true` |
| eCign packet (`/forms/:formId`)         | Browser Back    | Forms list (`/forms` or prior list view)                   | Standard history entry |
| Evidence detail (`/evidence/:id`)       | Browser Back    | Evidence Center list                                       | Standard history entry |
| Onboarding V2 batch view                | Browser Back    | Batches list                                               | Index redirect uses `replace: true` |
| Calendar event detail (`/calendar/event/:id`) | Browser Back | Calendar (`/calendar`)                                  | Standard history entry |

**Key guarantee:** No operational route performs an aggressive `replace: true` that would skip a just-visited form or detail page. All current usages were audited and confirmed appropriate (see N-05).

---

## 4. Scoped Exceptions (Intentional Per-Surface Arrow-Key Behavior)

The following surfaces retain **local** arrow-key handling. These are component-owned behaviors and are **not** global shell features:

- **LMS / Journey ModulePlayerPage** — Arrow keys navigate slides within a single module. Owned locally by the player component (LMS pattern).
- **Form viewer / input fields** — Arrow keys move cursor within text fields, select dropdown options, etc. (browser default).
- **PDF / print preview pages** — Arrow keys scroll the document (browser default).
- **Search dropdowns / comboboxes** — Arrow keys move highlight / selection (ARIA pattern).

These exceptions are intentional and scoped. Future surfaces that need similar intra-component navigation should follow the LMS ModulePlayerPage local-handler pattern (see §8).

---

## 5. Mobile Behavior

- Global swipe-left / swipe-right navigation hijacking has been removed.
- Touch swipe on a card, list, or drawer now performs the action the component expects (scroll, dismiss bottom-sheet drawer at <1024 px per MVP §C4, etc.).
- Android system back button and iOS edge-swipe gesture work as native browser history navigation.
- No accidental navigation triggers during normal scrolling or form interaction.

---

## 6. Things That Did NOT Change

The following surfaces and mechanisms continue to work exactly as before:

- In-app top navigation bar and breadcrumbs
- Hamburger menu on mobile (<1024 px)
- All `<Link>`-based navigation
- Programmatic `navigate()` calls (with or without `replace: true` where appropriate)
- All existing `replace: true` usages (audited; remain intact — see N-05)
- `UniversalNavControls.tsx` (still uses `initiateBack()` / `initiateForward()` intentionally)

---

## 7. For QA / UAT: Manual Smoke-Check List

Run the following checks on **Chrome, Edge, Safari, mobile Safari, and Android Chrome**:

1. From CES Board, press browser Back → lands on previous page (not a synthetic alias).
2. From an eCign packet, press browser Back → returns to forms list.
3. From Evidence detail view, press browser Back → returns to Evidence Center list.
4. From Onboarding V2 batch detail, press browser Back → returns to batches list.
5. From Calendar event detail, press browser Back → returns to calendar.
6. In any form input or text field, ArrowLeft / ArrowRight move the cursor (no app navigation).
7. On mobile, swipe on a list or card scrolls or dismisses drawer; does **not** navigate the app.
8. Browser Forward after any of the above steps restores the expected page.

All checks should pass without random jumps or lost history entries.

---

## 8. For Developers: Adding Per-Surface Arrow-Key Handling

If a new surface (e.g., a module player, timeline scrubber, or canvas) requires local arrow-key navigation:

- Do **not** add handlers to `CommandCenterLayout.tsx` or any global shell component.
- Implement the handler locally inside the page or component that owns the surface (see `ModulePlayerPage.tsx` in the LMS/Journey module for the established pattern).
- Use `useEffect` + `keydown` listener scoped to that component, and clean up on unmount.
- Ensure the handler only acts when the component is focused or the user is explicitly interacting with that surface.

This keeps navigation predictable and prevents future global conflicts.

---

## 9. Where This Affects Existing User Training

**Note for trainers (internal ~100 users):**  
Swipe gestures and arrow keys no longer move you forward or backward through the whole application. You can now use the browser's Back and Forward buttons (or your phone's system back gesture) exactly as you would on any normal website. Arrow keys will only move the cursor inside forms, scroll PDFs, or navigate slides inside learning modules — just like everyday web apps. No change to the top menu, hamburger, or any on-screen links.

---

**Status: Ready for Phase 2 close-out**  
**Date:** 2026-05-16

---

*End of N-08 documentation.*