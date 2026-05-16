# Global Error Handling & Error Boundary Patterns — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how to handle unexpected errors at the application level while staying consistent with the calm, professional tone of the v2 design system.

---

## 2. Error Boundary Strategy

### Recommended Structure

1. **App-Level Error Boundary**
   - Catches unhandled errors in the entire React tree.
   - Shows a full-screen calm error state.
   - Allows user to reload or contact support.
   - Logs error to monitoring tool (Sentry, etc.).

2. **Route / Feature Level Error Boundaries**
   - Wrap major sections (CES Board, Onboarding V2, eCign flow) in their own error boundaries.
   - Allows the rest of the app to remain usable if one feature breaks.

3. **Component Level Error Handling**
   - Use `try/catch` + error states inside complex components (forms, signature, evidence upload).

---

## 3. Design Treatment for Errors

- Use the approved `EmptyState` or dedicated `ErrorState` component.
- Tone: Calm and helpful, never alarming unless it is a safety/regulatory issue.
- Always provide:
  - Clear explanation of what happened (user-friendly language)
  - Recommended next action
  - Option to report the issue

**Example Message:**
> “Something went wrong while loading your tasks. Your data is safe.  
> You can try again or continue working on other sections.”

---

## 4. Error Logging & Monitoring

- Log all errors with context (user ID, route, action being performed).
- Include design system version and app version.
- Tag errors that come from `ui/` components for easier triage.

---

## 5. Special Cases

- **eCign Signing Errors**: Highest priority. Must be extremely clear and offer immediate support escalation.
- **Evidence Upload Failures**: Must preserve the captured photo locally.
- **Offline Errors**: Should be handled gracefully (see Offline-First document).

---

## 6. Do’s and Don’ts

**✅ Do**
- Show recovery paths whenever possible.
- Log technical details but show simple messages to users.
- Test error boundaries regularly.

**❌ Don’t**
- Show raw error messages or stack traces to end users.
- Crash the entire app for non-critical errors.
- Use scary language for normal transient failures.

---

*Good error handling protects user trust even when things go wrong.*

---

**Related Documents:**
- `ERROR_HANDLING_GUIDELINES.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`