# Signature Capture Best Practices — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Critical For:** eCign legal defensibility, regulatory compliance

---

## 1. Purpose

Electronic signatures in the CareIndeed platform are **legally binding** compliance artifacts. This document defines the visual, interaction, and technical standards for all signature capture experiences.

---

## 2. Core Requirements

### 2.1 Legal & Audit Trail (Non-negotiable)

- The signer must explicitly affirm they are the named person and that the signature is theirs.
- Timestamp, device info, IP (when available), and form version must be captured.
- The signature image + metadata must be stored immutably (tied to the eCign hash chain).

### 2.2 Visual Treatment

- Large, comfortable capture area on mobile (minimum 300px height on phone, preferably more).
- Clean white or very light background for the signature pad (high contrast for later printing).
- Clear "Sign here" placeholder text that disappears on first stroke.
- Visible "Clear" button that is easy to tap but not accidentally triggered.
- "I am [Name] and this is my electronic signature" checkbox or affirmation statement **before** the final "Sign & Lock" action.

### 2.3 Mobile Ergonomics

- Signature area must be usable one-handed (thumb-friendly zone when possible).
- Support both finger and stylus.
- Do not require precise small movements.
- Provide generous undo/clear affordance.

---

## 3. Interaction Flow (Recommended)

1. User reaches the signature step in the eCign packet.
2. System shows the document summary + "You are about to electronically sign this document as [Full Name]".
3. Large signature pad appears.
4. User draws signature.
5. "Clear" button available at all times.
6. Affirmation checkbox appears: "I confirm this is my signature and I am authorized to sign."
7. Primary action button: **"Sign & Lock"** (Orange, high emphasis).
8. On success: Clear confirmation ("Document signed and locked") + immediate transition to signed_locked state.

---

## 4. Error & Edge Cases

- User tries to sign without the affirmation → Block with clear message.
- Signature is too small / too faint → Gentle prompt ("Please provide a clear signature").
- Network failure during final lock → Clear error + option to retry without losing the signature data.
- User wants to go back → Allow until the final "Sign & Lock" is confirmed.

---

## 5. Print / PDF Output

The captured signature must render cleanly in the printed eCign packet:
- Reasonable size (not microscopic)
- Good contrast on paper
- Paired with signer name, timestamp, and certificate ID in the footer

See `PRINT_PDF_CONSISTENCY_GUIDELINES.md` for exact footer requirements.

---

## 6. Accessibility

- Signature pad must be usable via external input devices when possible.
- All buttons and the affirmation must be keyboard and screen-reader accessible.
- Clear focus states on the capture area and controls.

---

## 7. Do’s and Don’ts

**✅ Do**
- Make the capture area large and forgiving
- Require explicit affirmation before locking
- Show a clear, calm success state
- Store the signature at high enough resolution for printing

**❌ Don’t**
- Allow signing without the legal affirmation
- Make the pad too small on mobile
- Hide the "Clear" button
- Use overly stylized or "fun" signature pad visuals (this is a legal document)

---

*Signature capture is one of the highest-risk interactions in the entire platform. It must feel serious, clear, and trustworthy.*

---

**Related Documents:**
- `PRINT_PDF_CONSISTENCY_GUIDELINES.md`
- `EVIDENCE_CAPTURE_SPECIFICATION.md` (future)
- `FORM_VALIDATION_PATTERNS.md` (future)