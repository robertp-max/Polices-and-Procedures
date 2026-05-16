# Accessibility Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Target:** WCAG 2.2 AA (with AAA aspirations in key areas)

---

## 1. Philosophy

Accessibility is not a checklist — it is a core part of building a **trustworthy, professional, and inclusive** compliance platform.

Every clinician, DON, surveyor, and administrator — regardless of ability — must be able to use the platform effectively, especially during high-stakes activities like signing documents, capturing evidence, and completing regulatory tasks.

---

## 2. Core Principles

- **Perceivable** — Information must be presentable in ways users can perceive.
- **Operable** — Interface components must be operable by all users.
- **Understandable** — Information and operation must be understandable.
- **Robust** — Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

---

## 3. Key Requirements by Area

### 3.1 Color & Contrast

- Minimum contrast ratio of **4.5:1** for normal text and **3:1** for large text (WCAG AA).
- **7:1** contrast is preferred for body text in light mode.
- Never rely on color alone to convey meaning (always pair with text or icons).
- Status colors (Teal, Orange, Red) must meet contrast requirements against their backgrounds.

### 3.2 Touch Targets (Mobile)

- All interactive elements must have a minimum touch target of **44 × 44 px**.
- This applies to buttons, icons, form fields, checkboxes, signature areas, and navigation items.

### 3.3 Keyboard Navigation

- All functionality must be reachable via keyboard.
- Visible focus indicator (teal ring) must be present on all focusable elements.
- Logical tab order must be maintained.
- No keyboard traps (users must be able to tab out of modals, drawers, etc.).

### 3.4 Screen Reader Support

- All interactive elements must have accessible names (via `aria-label`, `aria-labelledby`, or visible text).
- Status changes (e.g., "Document Locked", "Evidence Uploaded", "Signature Applied") must be announced via `aria-live` regions or equivalent.
- Form fields must be properly labeled and associated with their labels.
- Tables (especially in Reports, Audit Readiness, Evidence) must have proper headers and scope attributes.

### 3.5 Forms & Signing

- Large, comfortable inputs and signature areas (especially on mobile).
- Clear error messaging that is announced to screen readers.
- Ability to review content before signing (critical for legal defensibility).
- Support for external keyboards and assistive input devices during signing.

### 3.6 Motion & Animation

- Respect `prefers-reduced-motion`.
- Provide static alternatives for animated elements when reduced motion is enabled.
- Avoid flashing or rapidly changing content that could trigger vestibular disorders.

### 3.7 Glassmorphism & Visual Effects

- Ensure text remains readable over glass panels in both light and dark modes.
- Do not rely solely on blur or transparency for visual hierarchy.
- Maintain sufficient contrast even when glass layers overlap.

---

## 4. Testing Requirements

- Automated testing with **axe** or **WAVE** on all major screens.
- Manual keyboard testing on desktop.
- Screen reader testing (VoiceOver on iOS/macOS, TalkBack on Android) for key flows:
  - eCign Signing
  - Evidence Capture
  - Task execution
  - Onboarding flows
- Real-device testing on both light and dark modes.

---

## 5. Common Pitfalls to Avoid

- Using orange or teal text on low-contrast backgrounds.
- Making signature areas too small or low-contrast.
- Hiding important information behind hover states.
- Creating custom components that break standard accessibility patterns.
- Overusing glass transparency in light mode without proper contrast support.

---

## 6. Future Work

- Create an Accessibility Component Checklist.
- Define ARIA patterns for common components (Tabs, Bottom Sheets, Status, etc.).
- Establish an accessibility review gate in the design process.

---

*Accessible design is not optional — it is part of delivering a professional, defensible, and ethical compliance platform.*