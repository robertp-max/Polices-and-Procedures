# Evidence Capture Specification — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Evidence capture is the **core action** of the CES system. Clinicians must be able to quickly and reliably capture proof of completed work (photos of documents, signatures, forms, etc.) in the field, often under time pressure and sometimes in poor lighting or one-handed.

This document defines the exact experience and visual treatment for evidence capture.

---

## 2. Primary Use Cases

- CES task completion (most common)
- Onboarding V2 unit activation evidence
- Policy acknowledgment evidence
- Incident / MobileIncident photo evidence
- Audit / Surveyor evidence requests

---

## 3. Capture Flow (Mobile-First)

### Recommended Simple Flow

1. User taps "Capture Evidence" on a task or requirement.
2. Bottom sheet or full-screen camera view opens.
3. Clear instructions: "Take a clear photo of [specific document / signature / form]".
4. Camera preview with large, thumb-friendly shutter button.
5. Optional: "Upload from library" as secondary action.
6. After capture: Immediate preview with "Retake" and "Use this photo" actions.
7. Optional quick note / description field (not required in most cases).
8. "Attach to [Task/Requirement]" confirmation.

**Key rule:** Minimize steps. A clinician should be able to capture and attach evidence in under 15 seconds in ideal conditions.

---

## 4. Visual Treatment

- Camera UI should feel part of the Care Indeed glass system (subtle overlays, not jarring system camera).
- Large, high-contrast shutter button (minimum 56px).
- Clear "Retake" and "Confirm" actions after capture.
- Evidence thumbnail should use the same Layer 2 card treatment as the rest of the app.
- Status after upload: "Evidence attached" with teal check + timestamp.

**Never** use bright CI-ION colors or heavy borders on evidence thumbnails.

---

## 5. Quality & Compliance Requirements

- Photos must be stored at sufficient resolution for audit review and printing.
- EXIF data (timestamp, location when permitted) should be captured where possible.
- Evidence must be linked immutably to the specific task/requirement and the clinician who captured it.
- Support for multiple photos per requirement when needed.

---

## 6. Edge Cases & Error States

- User has no camera permission → Clear message + "Go to Settings" deep link.
- Poor lighting / blurry photo detected → Gentle suggestion ("This photo may be too dark. Consider retaking.").
- Upload fails after capture → Keep the photo locally and offer retry (do not lose the capture).
- User tries to attach evidence to the wrong requirement → Prevent or warn strongly.

---

## 7. Desktop / Tablet Behavior

- On larger screens, allow drag-and-drop file upload in addition to camera.
- Still show the same "Capture Evidence" primary action for consistency.
- Evidence grid should use the same card language as mobile.

---

## 8. Do’s and Don’ts

**✅ Do**
- Make the camera experience feel native and fast
- Give very specific instructions ("Photo of the signed consent form", not just "Upload evidence")
- Allow easy retake
- Show clear confirmation that evidence was successfully attached

**❌ Don’t**
- Force long forms before allowing capture
- Use tiny camera controls
- Lose the photo if upload fails
- Mix evidence capture UI with generic file pickers

---

## 9. Related Components & Patterns

- `EMPTY_STATE_PATTERNS.md` — "No evidence yet" treatment
- `LOADING_STATE_GUIDELINES.md` — Upload progress
- `CES_BOARD_VISUAL_LANGUAGE.md` — How evidence status appears on task cards
- `PRINT_PDF_CONSISTENCY_GUIDELINES.md` — How evidence appears in exported reports

---

*Evidence capture must be the fastest, most reliable action in the entire operational workflow.*

---

**Next:** Align the actual Evidence Center and CES evidence upload components with this specification.