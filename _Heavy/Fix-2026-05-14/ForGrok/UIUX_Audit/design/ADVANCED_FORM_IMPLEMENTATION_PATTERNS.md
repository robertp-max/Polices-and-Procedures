# Advanced Form Implementation Patterns — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document provides deeper implementation guidance for complex forms (eCign packets, Onboarding V2 gates, policy acknowledgments, etc.), going beyond basic validation.

---

## 2. Recommended Architecture

### Form State Management
- Prefer **React Hook Form** + **Zod** (or similar schema validation) for most forms.
- For very large multi-step forms (eCign, Onboarding), consider a state machine or step-based approach.

### Progressive Saving
- Auto-save drafts locally (especially important for long eCign packets).
- Show subtle “Draft saved” indicators.
- Allow resuming from where the user left off.

---

## 3. Complex Form Patterns

### Multi-Step / Wizard Forms
- Clear progress indicator (stepper or progress bar).
- Allow going back without losing data.
- Validate only the current step before allowing progression.
- Save progress on every step change.

### Conditional Fields
- Show/hide fields based on previous answers.
- Keep the form structure clean — avoid deeply nested conditionals when possible.

### Signature + Affirmation Combination
- Signature capture should be treated as a required field.
- Affirmation checkbox must be checked **before** allowing final submission.
- See `SIGNATURE_CAPTURE_BEST_PRACTICES.md` for full requirements.

---

## 4. Performance Considerations

- Lazy load heavy form sections when possible.
- Debounce expensive validations.
- Use `useMemo` and `useCallback` appropriately on large forms.

---

## 5. Accessibility in Complex Forms

- Group related fields with `<fieldset>` and `<legend>`.
- Announce step changes to screen readers.
- Ensure error messages are associated with their fields using `aria-describedby`.

---

## 6. Do’s and Don’ts

**✅ Do**
- Treat long forms as multi-step journeys.
- Save progress frequently.
- Make the current step and overall progress always visible.

**❌ Don’t**
- Build massive single-page forms without clear structure.
- Lose user input on validation errors or navigation.
- Require all fields to be filled before allowing partial save.

---

*Good form implementation reduces abandonment and increases compliance completion rates.*

---

**Related Documents:**
- `FORM_VALIDATION_PATTERNS.md`
- `SIGNATURE_CAPTURE_BEST_PRACTICES.md`
- `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md`