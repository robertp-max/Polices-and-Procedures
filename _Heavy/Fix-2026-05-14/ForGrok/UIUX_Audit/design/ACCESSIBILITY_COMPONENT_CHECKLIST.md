# Accessibility Component Checklist — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Target:** WCAG 2.2 AA

---

## Purpose

This checklist helps designers and developers ensure every component meets accessibility standards before it is released.

---

## General Requirements (All Components)

- [ ] Minimum touch target size of 44 × 44 px (mobile)
- [ ] Visible focus indicator (teal ring) on keyboard focus
- [ ] Sufficient color contrast (4.5:1 for text, 3:1 for large text)
- [ ] Does not rely on color alone to convey meaning
- [ ] Works with `prefers-reduced-motion` enabled
- [ ] No keyboard traps
- [ ] Logical tab order
- [ ] Proper ARIA attributes where needed (`role`, `aria-label`, `aria-labelledby`, `aria-describedby`)

---

## Button

- [ ] Minimum 44px height on mobile
- [ ] Clear accessible name (visible text or `aria-label`)
- [ ] Focus ring visible on keyboard navigation
- [ ] Disabled state is clearly communicated (not just lower opacity)

---

## Card

- [ ] If the entire card is clickable, it has proper `role="button"` or is wrapped in a link
- [ ] Focus is properly managed when the card is interactive
- [ ] Content inside the card remains readable when the card is focused

---

## Form Field

- [ ] Label is properly associated with the input (`<label>` or `aria-labelledby`)
- [ ] Required fields are clearly marked
- [ ] Error messages are associated with the field (`aria-describedby`)
- [ ] Helper text is announced to screen readers
- [ ] Focus state is clearly visible

---

## Status Badge

- [ ] Color is never the only way to understand the status (text or icon must accompany it)
- [ ] Meets contrast requirements against its background

---

## Navigation (Bottom Nav / Sidebar)

- [ ] Active state is clearly indicated (not just by color)
- [ ] Icons have accessible names (or are accompanied by visible text)
- [ ] Tab order follows visual order

---

## Modal / Bottom Sheet

- [ ] Focus is trapped inside when open
- [ ] Focus returns to the trigger element when closed
- [ ] Has a clear accessible name (`aria-labelledby` or `aria-label`)
- [ ] Can be closed with Escape key

---

## Status & Loading

- [ ] Loading states are announced to screen readers (`aria-live="polite"`)
- [ ] Status changes (e.g., “Document Locked”, “Evidence Uploaded”) are announced

---

## Signature Component

- [ ] Large, comfortable touch target on mobile
- [ ] Clear instructions for the user
- [ ] Ability to review the document before signing (critical for legal defensibility)
- [ ] Keyboard-accessible alternative where possible (or clear support for external input devices)

---

## Evidence Upload

- [ ] File input is properly labeled
- [ ] Drag-and-drop area (if present) is accessible via keyboard
- [ ] Clear feedback when file is successfully captured or uploaded
- [ ] Error states are clearly communicated

---

## Empty States

- [ ] Clear explanation of why the section is empty
- [ ] Clear next action (if available)
- [ ] Does not rely only on color or imagery

---

## Notes

- This checklist should be used during design reviews and before development handoff.
- Any component that fails multiple items on this list should be revised before release.

---

**Next:** Turn this into an interactive checklist (Notion, Figma, or code) for the team.

---

*Accessibility is everyone’s responsibility.*