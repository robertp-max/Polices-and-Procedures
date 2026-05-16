# Voice / Brad Integration Hooks — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines the visual and interaction hooks where **Brad** (the platform’s guidance avatar) and future voice features can be naturally integrated without breaking the calm, premium glass aesthetic.

---

## 2. Who is Brad?

Brad is the friendly, knowledgeable compliance assistant. He appears in:
- Guided tours
- Contextual help
- Proactive suggestions
- (Future) Voice interactions

The goal is to make Brad feel helpful and calm — never annoying or salesy.

---

## 3. Visual Treatment

- **Avatar**: Clean, professional illustration or simple icon (not cartoonish).
- **Placement**: Usually bottom-right or as a floating action element on Layer 2.
- **Appearance**: Subtle fade-in. Should feel like part of the glass system.
- **Color**: Uses the Care Indeed palette (Teal or Navy dominant).

---

## 4. Integration Hooks (Places to Add Brad)

| Surface                  | Recommended Hook                          | Trigger Type          | Example Use |
|--------------------------|-------------------------------------------|-----------------------|-------------|
| CES Board                | Floating “Need help?” bulb                | Contextual            | “You have 3 overdue tasks. Would you like me to show them first?” |
| eCign Signing            | Before final “Sign & Lock”                | Proactive             | “Double-check the attestation text before signing.” |
| Onboarding V2            | After completing a gate                  | Guidance              | “Great job. Next, you’ll need evidence for the medication list.” |
| Evidence Capture         | First time using the camera               | Onboarding            | “Take a clear photo of the signed form.” |
| Policy Detail            | Complex policies (many statements)        | On-demand             | “Would you like me to summarize the key requirements?” |
| Calendar                 | High number of overdue items              | Proactive             | “You have several items due today. Want me to read them out?” |
| Audit Readiness          | Low readiness score                       | Alert + Guidance      | “Here’s what’s blocking activation. I can walk you through it.” |

---

## 5. Voice Interaction Patterns (Future)

When voice is enabled, Brad should support:

- “Hey Brad, show me my overdue tasks”
- “Hey Brad, what do I need to do for this patient?”
- “Hey Brad, read the next requirement”
- “Hey Brad, mark this as complete”

**Design rules for voice UI:**
- Use a calm listening indicator (subtle pulsing teal ring).
- Keep the main glass interface visible — voice should feel like an enhancement, not a takeover.
- Always provide a visual transcript or action summary after voice commands.

---

## 6. Do’s and Don’ts

**✅ Do**
- Make Brad feel like a helpful colleague, not a tutor.
- Allow users to easily dismiss or snooze Brad suggestions.
- Use natural, conversational language.
- Respect user preference (some users may want Brad less frequently).

**❌ Don’t**
- Interrupt critical flows (e.g., during signature).
- Use overly enthusiastic or sales-like tone.
- Block the interface with Brad.
- Make voice the only way to complete important tasks.

---

## 7. Implementation Notes

- Brad should be built as a reusable component (`BradAvatar`, `BradSuggestion`, `BradTourTrigger`).
- All suggestions should be dismissible and learn from user behavior over time.
- Keep the current GuidedTour system as the foundation for future voice expansion.

---

*Brad should feel like the calm, knowledgeable person on your team who is always available when needed.*

---

**Related Documents:**
- `CONTENT_MICROCOPY_GUIDELINES.md`
- `GESTURE_INTERACTION_GUIDELINES.md`