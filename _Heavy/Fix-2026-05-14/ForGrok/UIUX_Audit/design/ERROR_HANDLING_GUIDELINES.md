# Error Handling Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Philosophy

Errors in a compliance platform create anxiety. Good error handling must be:

- **Calm and clear** — Never alarming unless there is real patient or regulatory risk.
- **Actionable** — Always tell the user what they can do next.
- **Recoverable** — Give users a path forward when possible.
- **Consistent** — Same tone and treatment across the entire app.

---

## 2. Error Severity Levels

| Level | Name             | Treatment                              | Example |
|-------|------------------|----------------------------------------|---------|
| 1     | Inline / Field   | Subtle red text under the field        | Invalid date format |
| 2     | Banner / Toast   | Top or bottom banner with action       | "Failed to save. Retry?" |
| 3     | Modal / Sheet    | Focused error with clear resolution    | Signature failed to lock |
| 4     | Full Screen      | Rare — major system issue              | "We cannot reach the server" |

---

## 3. Visual Treatment

- Use semantic red only for true errors (never for warnings or info).
- Pair color with clear text and, when possible, an icon.
- In light mode: soft red background tint + hairline border.
- In dark mode: slightly stronger but still calm red treatment on glass.
- Always include a primary recovery action when possible ("Retry", "Go Back", "Contact Support").

---

## 4. Microcopy Rules

**Good examples:**
- "We couldn't save your signature. Please try again."
- "This document is currently locked by another user."
- "Network connection lost. Your changes are saved locally."

**Bad examples:**
- "Error 500"
- "Something went wrong"
- "Invalid input" (too vague)

Always explain **what happened** + **what the user can do**.

---

## 5. Technical Requirements

- All error states must use `role="alert"` or `aria-live="assertive"` when appropriate.
- Network errors should detect offline state and offer graceful degradation.
- Form validation errors must appear immediately on blur (not only on submit).

---

## 6. Do’s and Don’ts

**✅ Do**
- Log technical details for support while showing human-friendly messages to users.
- Offer "Retry" for transient failures.
- Allow users to copy error codes when contacting support.

**❌ Don’t**
- Show stack traces or raw error objects to end users.
- Use scary language for normal business errors ("Critical failure").
- Trap the user with no recovery path.

---

## 7. Special Cases

- **Signature / eCign locking errors**: Highest priority. Must be extremely clear and offer immediate retry + support escalation.
- **Evidence upload failures**: Keep the photo locally and allow retry without forcing recapture.
- **Onboarding gate submission failures**: Preserve all entered data.

---

*Good error handling turns frustration into trust.*

---

**Related:** `FORM_VALIDATION_PATTERNS.md`, `LOADING_STATE_GUIDELINES.md`