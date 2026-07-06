# UAT_ADVANCED_TRAINING_DEFECT_LOG.md

## P1 Defects
1. Thin content for GAO-03 and GAO-04 (data files have 1 lesson; panels provide lab but not full source repo extraction as intended in original plan).
2. Completion artifact objects in panels include moduleId/score/timestamp/noPhi/type but lack explicit policy_id, workflow_id, event_id (contract defined but not populated at runtime).
3. Narration present but minimal for new modules; no audio files or explicit "missing audio" flags wired in ADV implementation.
4. No full end-to-end runtime browser/console verification performed (tool/shell limitations on dev server + full build capture).

## P2 Defects
- Hardcoded demo progress in player.
- Limited a11y (no aria labels in simple panel JSX).
- Some pre-existing TS errors in the broader tree (unrelated to ADV).

## P0
- None.

## Notes
All defects documented from code inspection. No silent fixes applied.