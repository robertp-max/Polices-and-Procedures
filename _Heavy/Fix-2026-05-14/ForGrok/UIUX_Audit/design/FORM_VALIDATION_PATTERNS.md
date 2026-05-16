# Form Validation Patterns — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Consistent, clear, and helpful form validation is essential for eCign packets, onboarding forms, evidence metadata, and administrative workflows. This document defines the standard patterns.

---

## 2. Validation Timing

- **On blur** (when the user leaves the field): Show error if invalid.
- **On submit**: Re-validate all fields and highlight all errors.
- **Real-time** (optional): For complex rules (password strength, date ranges) where helpful.

Never wait until the very end of a long form to show errors.

---

## 3. Error Presentation

### Per-Field Errors
- Red text directly below the input.
- Clear, specific message.
- Keep the field border in the error state (subtle red tint in light mode).

### Form-Level Summary (for long forms)
- When the user submits a form with multiple errors, show a summary banner at the top:
  - "Please fix the 3 errors below before continuing."
- Scroll the first error into view.

---

## 4. Message Style

**Good:**
- "Date of birth must be in the past."
- "Signature is required before locking this document."
- "This email is already associated with another clinician."

**Bad:**
- "Invalid value"
- "Required"
- "Error"

Always explain **what is wrong** and (when possible) **how to fix it**.

---

## 5. Required vs Optional

- Clearly mark required fields with an asterisk or "(required)" text.
- Do not show "required" errors until the user has interacted with the field or tries to submit.

---

## 6. Complex Validation

- Date ranges: "End date cannot be before start date."
- Signature + Affirmation: Block final submit until both signature exists **and** affirmation checkbox is checked.
- File uploads: Show specific errors ("File too large. Maximum size is 25MB.").

---

## 7. Accessibility

- Associate error messages with inputs using `aria-describedby`.
- Announce validation errors to screen readers on submit.
- Ensure error states have sufficient contrast.

---

## 8. Do’s and Don’ts

**✅ Do**
- Be specific and helpful.
- Validate as early as reasonable.
- Preserve user input after validation errors.

**❌ Don’t**
- Use generic messages.
- Clear the entire form on validation failure.
- Show validation errors only after a full page reload.

---

*Validation should feel like a helpful colleague, not a strict examiner.*

---

**Related Documents:**
- `ERROR_HANDLING_GUIDELINES.md`
- `SIGNATURE_CAPTURE_BEST_PRACTICES.md`