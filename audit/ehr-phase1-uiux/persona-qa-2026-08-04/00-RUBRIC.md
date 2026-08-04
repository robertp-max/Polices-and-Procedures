# Shared QA rubric

Base URL: http://127.0.0.1:5194/#
Worktree: C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1
App path: apps/ehr-prototype

This is a **design prototype** (synthetic data). Score whether it is **survey-ready as a UX prototype**, not whether production CoPs are certified.

For each assigned route:
1. Open live URL (or read screen TSX/CSS if browser unavailable)
2. Note: load success, title, RelatedNav presence, StatCards, filters, inspector
3. Persona lens checks (see your assignment)
4. Cross-links: click or verify "Related" / "Continue in" go to sensible destinations
5. Honesty: incomplete work never looks complete; sign/seal/submit disabled or visual-only with footnote
6. Findings with severity P0/P1/P2 or OK

## Report format (required markdown)

```md
# {ID} — {Persona} — {Topic}
- Routes: ...
- Verdict: PASS | CONDITIONAL | FAIL
- Summary: 2-4 sentences

## Checks
| Check | Result | Notes |
| ... | OK/FAIL | ... |

## Findings
### P0
### P1
### P2

## What works
- ...

## Persona quote
> One sentence as this persona would say to product leadership.
```

Write ONLY to your assigned report path under persona-qa-2026-08-04/. Do not commit. Do not modify app source unless you find a critical P0 you can fix in <5 lines AND document it — prefer report-only.
