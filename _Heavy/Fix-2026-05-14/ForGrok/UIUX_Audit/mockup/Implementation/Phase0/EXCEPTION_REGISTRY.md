# Visual Contract Exception Registry

**Owner:** Visual Language Police Chair
**Re-justification cadence:** Quarterly
**Format:** Every accepted deviation from the Canonical UI System Spec must be logged here with owner, justification, and a dated re-justification deadline. Entries past their deadline auto-promote to the Program Owner's escalation queue.

## Entry Schema

```
### #N — <surface or pattern>
- **Type:** dialect | token | layout | a11y | motion
- **Owner:** <name>
- **Granted:** <YYYY-MM-DD>
- **Re-justify by:** <YYYY-MM-DD>
- **Scope:** <file globs or surface names>
- **Justification:** <plain text>
- **Remediation plan:** <plain text or "permanent">
- **Linked decision:** <link to brief or PR>
```

---

## Active Entries

### #1 — CES (Compliance Evidence System) parallel visual dialect
- **Type:** dialect
- **Owner:** _TBD (CES Domain Lead)_
- **Granted:** _pending CES_DECISION_BRIEF outcome_
- **Re-justify by:** _TBD_
- **Scope:** `src/policy/**/ces/**` and named siblings (final glob set in CES_DECISION_BRIEF outcome)
- **Justification:** Largest active parallel dialect; decision pending whether to migrate (Option A) or bound (Option B).
- **Remediation plan:** Per CES_DECISION_BRIEF outcome.
- **Linked decision:** `./CES_DECISION_BRIEF.md`

---

## Closed Entries

_(none yet)_
