# Gesture Interaction Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Mobile users (clinicians, DONs, surveyors) often use the app one-handed while walking, in the field, or under time pressure. Gestures must be intuitive, forgiving, and consistent.

---

## 2. Core Principles

- **One-handed friendly** — All primary gestures should be reachable with the thumb.
- **Forgiving** — Accidental gestures should not cause destructive actions.
- **Consistent** — The same gesture must mean the same thing across the app.
- **Discoverable** — Use visual affordances when possible.

---

## 3. Approved Gestures & Patterns

### Tap
- Primary action on buttons, cards, and list items.
- Minimum 44×44px target (48px preferred).

### Long Press (Press & Hold)
- Reveals contextual menu or quick actions.
- Recommended duration: 500–600ms.
- Use cases: Quick actions on CES tasks, evidence items, policy cards.

### Swipe Left / Right
- **Swipe Left** on list items → Primary quick action (e.g., “Mark Complete”, “Capture Evidence”).
- **Swipe Right** → Secondary action or “More”.
- Must show clear visual feedback during the swipe.
- Destructive actions (Delete, Reject) should require confirmation or be harder to trigger.

### Pull-to-Refresh
- Supported on list views (CES Board, Policy Library, Evidence Center, Calendar).
- Should feel calm and not overly bouncy.

### Drag & Drop (Desktop + Tablet only)
- Supported on CES Board for reordering or moving tasks between columns.
- Provide clear visual feedback (ghost card + drop zone highlight).

### Two-Finger Pinch / Zoom
- Only for document viewers and eCign packet preview.
- Disabled by default on most operational screens.

---

## 4. Bottom Sheet & Modal Gestures

- **Swipe down** on bottom sheets → Dismiss (standard iOS/Android pattern).
- Must include a clear drag handle at the top of the sheet.
- Tapping the backdrop should also dismiss the sheet (except for critical flows like signing).

---

## 5. Signature & Evidence Capture Specifics

- **Signature pad**: Support both finger and stylus. Large target area. No complex gestures required.
- **Evidence camera**: Large shutter button. Tap to capture. Long press not used here.

---

## 6. Do’s and Don’ts

**✅ Do**
- Make swipe actions predictable and reversible when possible.
- Show the action label while swiping (not just an icon).
- Use long press for secondary actions only.
- Respect `prefers-reduced-motion` for gesture animations.

**❌ Don’t**
- Use swipe-to-delete as the only way to delete important items.
- Require multi-finger gestures for core tasks.
- Make gestures too sensitive (accidental triggers are common in the field).

---

## 7. Accessibility & Reduced Motion

- All gestures must have a non-gesture alternative (e.g., menu button).
- Gesture animations should respect the user’s reduced-motion preference.

---

## 8. Future Enhancements

- Voice + gesture combination (“Hey Brad, mark this task complete” while swiping)
- Haptic feedback on successful gestures (subtle)
- Contextual quick actions that adapt based on task urgency

---

*Great gestures feel invisible. The user just knows what to do.*

---

**Related Documents:**
- `HOVER_FOCUS_ACTIVE_STATES.md`
- `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`
- `CES_BOARD_VISUAL_LANGUAGE.md`