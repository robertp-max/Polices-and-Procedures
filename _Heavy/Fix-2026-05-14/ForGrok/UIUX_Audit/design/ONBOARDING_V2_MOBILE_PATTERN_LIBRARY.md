# Onboarding V2 Mobile Pattern Library — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Onboarding V2 is a complex, high-stakes workflow involving batch creation, unit assignment, gate resolution, evidence collection, and activation. This document defines the mobile-first visual and interaction patterns so the experience feels consistent and manageable on phones and tablets.

---

## 2. Core Philosophy for Mobile

- **Progressive disclosure** — Do not overwhelm the user with the entire batch at once.
- **One-handed friendly** — Large targets, thumb zones, bottom sheets.
- **Clear state** — User must always know "where we are" in the activation process (Draft → In Progress → Gates → Evidence → Ready → Activated).
- **Calm urgency** — Use the restrained orange only for real blockers.

---

## 3. Key Mobile Patterns

### 3.1 Batch List View
- Vertical list of batches.
- Each card shows: Batch name, # of units, overall progress (visual bar or percentage), current phase, due date.
- Tap opens the Batch Detail (not a wide drawer on mobile).

### 3.2 Batch Detail (Mobile)
- Use **bottom sheet or full-screen page** (not the 760px desktop drawer).
- Segmented control or tabs for: Overview, Units, Gates, Evidence, Audit Readiness.
- Units shown as a clean list (not a complex table).

### 3.3 Unit Detail
- Large header with unit name + current status.
- Accordion or progressive sections for each gate/requirement.
- "Capture Evidence" as a prominent action (see `EVIDENCE_CAPTURE_SPECIFICATION.md`).
- Clear "Mark Complete" or "Request Review" buttons.

### 3.4 Gate Resolution Flow
- When a gate is ready for review: Clear "Submit for Review" button.
- Status badges: Not Started / In Progress / Evidence Needed / Under Review / Approved / Blocked.
- Use teal for approved, orange for action needed, red only for blocked.

---

## 4. Visual Treatment

- All surfaces follow the 3-layer glass system.
- Progress indicators should be subtle but clear (never flashy).
- Use the same card language as CES and Evidence Center.
- "Activation Readiness" score or checklist should feel like a calm dashboard, not a red alert system.

---

## 5. Interaction Patterns Specific to V2

- **Long press on unit** → Quick actions (Assign clinician, Capture evidence, Mark reviewed).
- **Pull to refresh** on batch list and unit list.
- **FAB** on Batch Detail for common actions ("Add Unit", "Capture Evidence for All").
- Bottom sheet for unit assignment instead of complex modals.

---

## 6. Empty States

- New batch with no units: "Add your first unit to begin the activation process."
- Unit with no outstanding gates: "This unit has cleared all gates. Ready for activation review."
- No evidence yet: Use the standard empty state pattern with "Capture Evidence" as primary action.

---

## 7. Do’s and Don’ts

**✅ Do**
- Keep the most common actions (Capture Evidence, Mark Gate Complete) extremely easy to reach.
- Show clear "Next Step" guidance on every screen.
- Make the final "Activate Batch" action feel deliberate and important (confirmation + summary).

**❌ Don’t**
- Replicate the wide desktop drawer pattern on mobile.
- Show 15+ requirements at once without strong grouping and search.
- Use different status colors or labels than the rest of the system.

---

## 8. Accessibility & Field Considerations

- Must work well in bright sunlight (good contrast).
- Large tap targets for gloved hands when relevant.
- Clear voice labels for screen readers on all status and action elements.

---

*Onboarding V2 on mobile must feel like a powerful but calm assistant, not a complex form to fight.*

---

**Related Documents:**
- `EVIDENCE_CAPTURE_SPECIFICATION.md`
- `EMPTY_STATE_PATTERNS.md`
- `CES_BOARD_VISUAL_LANGUAGE.md` (similar card and urgency language)