# 08 — UI/UX Security & Tasking Model

**Layer:** Z1 (Authenticated UI) over EUL/IAL/AEL.

---

## 1. Principles

1. **Visibility follows authorization.** Every UI element that triggers a server action is gated by the same permission model on the server. Hiding ≠ securing; the server still denies.
2. **CEU is the universal task surface.** No checklist-only UI, no "to-do" widgets that aren't CEUs.
3. **Make state legible.** Block, At-Risk, Awaiting-Signature, Awaiting-Evidence are surfaced explicitly with the reason and the actor who can clear them.
4. **Minimum necessary PHI.** Default redacted; reveal requires `phi.read` AND a deliberate user action that emits `PHI_VIEWED`.
5. **No silent enforcement.** Denials, gate failures, and overrides are visible to the affected user with reason codes — never a generic "permission denied" with nothing else.

---

## 2. Role-Based UI Visibility

- A `usePermissions()` hook resolves the current actor's effective permissions.
- A `<Authorized action="ceu.complete" resource={ceuRef}>` component renders children only when allowed; otherwise renders a non-interactive read-only view.
- Navigation menu items are filtered by the same hook.
- Auditor role: every UI surface is read-only; write controls are not rendered (and the server denies if probed).

---

## 3. CEU Presentation (consistent across system)

Every CEU surface (CES board, Onboarding tracker, Policy approvals, Audit readiness) renders a CEU using the **same** primitive:

```
<CeuCard ceu={ceu} compact|expanded />
```

Containing:
- Title + short code
- State badge (color-blind safe; not color-only)
- Risk tier indicator
- Due date / SLA bar
- Block reasons (if Blocked)
- Required signatures (collected/total)
- Required evidence (validated/total)
- Assignee + reviewer
- Actions: contextual, authorization-gated

This guarantees uniform task semantics; users learn one task model.

---

## 4. Audit Indicators

- A small **audit badge** appears wherever the user's action will be logged with `phi: true` or `riskFlags` (e.g., revealing PHI, exporting). The badge is a surface contract: "this will be recorded".
- Override-applied CEUs display a persistent `OVERRIDE` chip with approver names and expiration.
- Chain integrity status is shown in the Compliance dashboard header (green/amber/red).

---

## 5. Blocked State Indicators

- Blocked CEUs render with:
  - Lock icon + "Blocked" badge.
  - List of `blockReason[]` with the clearing actor (e.g., "Awaiting Onboarding Step CEU-...; Onboarding Specialist can clear").
  - Link to the blocking CEU(s).
  - No Start/Complete actions; only "Request Override" if user is eligible.

---

## 6. Signature Status Indicators

- `Awaiting Signature` shows per-requirement status (signer role, signed/pending, order if sequential).
- Clicking a pending requirement opens the eCIgn flow (no in-app "fake sign" path).
- Collected signatures display signer, time, document hash short prefix (forensic anchor).

---

## 7. Minimal PHI Exposure

- Patient identifiers redacted by default in lists (e.g., "Patient ●●●● 1234").
- "Reveal" actions require user action and emit `PHI_VIEWED` with reason picker (`treatment | payment | operations | audit`).
- Bulk exports require explicit confirmation modal that summarizes what will be exported and warns about logging.
- Print views never include PHI unless the same `phi.read` + reauth conditions are satisfied.

---

## 8. What the UI Does **Not** Do

- No client-side "trust me" enforcement (`disabled` attributes are conveniences only; the server is the authority).
- No checklist UI that creates state outside CEUs.
- No silent state changes (every transition shows a toast + appears in the activity timeline).
- No backdoor admin pages that bypass `Authorized`.
- No raw audit log editing UI. Audit views are read-only.

---

## 9. Accessibility & Forensics

- All state badges meet WCAG AA contrast and are non-color-only.
- Activity timeline export (per-CEU) is one click for the assignee, two-factor for export beyond the CEU scope.
- Keyboard-first task flows for clinical roles (low UI friction for high-volume CEU work).
