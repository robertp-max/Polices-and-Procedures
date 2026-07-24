# Policy Quiz Report

_Master Correction Prompt §10. Source: `QuizPlayer.tsx`, `policyQuizMap.generated.ts`, `_lib/policyQuizAccess.ts`. Status: **IMPLEMENTED (pre-existing; re-verified)**._

## Player behavior

- One question per page; answered/unanswered map; Back/Next; flag-for-review; review screen;
  submit confirmation; score; missed concepts linked back to policy sections.
- 80% pass threshold, max 3 attempts, 10 questions (defaults from `_lib/policyQuizAccess.ts`).
- **No correct answers revealed before submission.**
- No certificate is issued for a single policy quiz.

## Bank integrity (no AI-authored questions)

Questions are bound to the course/policy version and come only from the generated bank.
`bankStatus` is one of `APPROVED` / `DRAFT_REVIEW_REQUIRED` / `MISSING`:
- `MISSING` → the quiz UI renders "quiz not yet published" and **blocks completion**.
- `DRAFT_REVIEW_REQUIRED` (e.g. G-01 pilot, 3 clearly-labelled DRAFT items) → opens as an
  unofficial practice run, never a scored official attempt.
No questions are generated in the browser.

## Remaining

Approved 10-item banks do not yet exist for most courses (`bankStatus: MISSING`) — this is a
content-authoring dependency, surfaced truthfully rather than faked.
