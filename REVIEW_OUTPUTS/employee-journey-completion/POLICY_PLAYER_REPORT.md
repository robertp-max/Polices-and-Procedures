# Policy & Procedure Player Report

_Master Correction Prompt §9. Source: `PolicyLearningPlayer.tsx`, `PolicyMarkdown.tsx`. Status: **PARTIALLY IMPLEMENTED** (structured render improved; premium right-rail/scenario still pending)._

## Current state (accurate)

Contrary to the prompt's framing, the P&P player already renders **parsed structured HTML in a
three-column layout** (left TOC with IntersectionObserver read-tracking; center tabs Read / Key
changes / Forms & appendices / Knowledge check / Review & attestation; right assignment-detail
rail), not raw markdown tokens. It sources verified baked text from `policyCatalog.generated.ts`
(via the main-app `getPolicyTextForReading`), never hand-authored fixtures.

## Fixed this pass (the real "looks like a dump" cause)

`PolicyMarkdown` previously parsed only headings/tables/bulleted-lists/bold/links. **Ordered
lists** ("1." / "1)") and **numbered policy clauses** ("4.1", "10.2") fell through to plain
paragraphs, so a policy's numbered statements rendered as a wall of run-on text. Added:
- ordered-list parsing → `<ol>`;
- numbered-clause parsing → hanging-indent clause with the clause number set apart
  (`.policy-clause` / `.policy-clause-number`);
- `* ` bullets in addition to `- `.

Verified live on `RN__G-01__GV-PM-004`: 14 numbered clauses now render as structured
statements; 18 tables render responsively; no raw `##`/`**`/`|` tokens.

## Remaining (not yet implemented)

- Right rail is currently **assignment metadata** (why assigned / required action / policy
  basis / related forms / related module). §9.3 asks for a learning rail: "Why this matters",
  role/scope warning, key decision points, a practice scenario, an embedded knowledge-check
  preview, and **Nolan** in-context. Nolan is globally available via the floating panel but is
  not yet embedded in the policy right rail.
- Minor: the meta block shows Version and Effective date from the same `versionDate` field
  (source has no separate effective date); "Key changes" is honestly "not supplied".
- The quiz player (`QuizPlayer.tsx`) already implements one-question-per-page, 10q/80%/3
  attempts, answered/flagged map, review-before-submit, no answer reveal, and source-linked
  missed concepts (§10) — re-verified as still present; no changes this pass.
