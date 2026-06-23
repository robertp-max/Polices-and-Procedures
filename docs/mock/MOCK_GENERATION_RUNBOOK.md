# Mock Generation Runbook

This runbook outlines the standard guidelines and operational workflow for generating mock compliance data in the Care Indeed Home Health system.

## Repository Scoping

- **Target Repository**: Mock generation and indexing MUST belong exclusively to the old/full repository:
  `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`
- **V2 Repository Warning**: The Policies_and_Procedures_V2 repository is for UI/design prototyping only. It does not contain the full compliance workflow engine or form corpus and MUST NOT be used for mock generation.

## Standard Workflow

1. **Read Input**: Read the provided compliance records (`Mock_Records`).
2. **Preserve Medical Number**: Keep and output the medical record number (MRN) exactly as provided in the source files.
3. **Preserve Diagnoses**: Keep and output patient diagnoses exactly as provided in the source files.
4. **Use Actual Forms**: Match the requirements to actual Care Indeed forms from the repo form sources.
5. **Set Label**: Label every generated document and evidence record with **`Brad Training Mock Test`**.
6. **Generate Artifacts**: Create markdown-based event and document compliance artifacts.
7. **Index Metadata**: Index all generated compliance documents into Evidence Center metadata records.
8. **Hydrate Store**: Generate/update the full snapshot to hydrate the Evidence Center UI on application load.
9. **Verify System**: Validate TypeScript compilation, project build output, and git line endings/formatting.
10. **Stage Intended Files**: Carefully stage only the necessary artifact files and updated metadata snapshots (avoid bulk-adding untracked files).

## Scheduling Rules

To model realistic operational workflows:
- **Preferred Days**: Tuesday and Thursday.
- **Daily Volume**: Maximum of 4 compliance events per day.
- **Overflow Days**: Monday, Wednesday, and Friday (only when Tuesday/Thursday capacity is exceeded).
- **Weekends**: No weekend dates unless explicitly mandated by the scenario.
- **Grouping**: Group related events (e.g., Clinical onboarding, QAPI reviews, HR credentials, and Operations reports) together in sequence.
- **Distinct compliance records**: Every event must be preserved as a separate, distinct compliance record.

## Future Mock 6 Instructions

- **Do Not Recreate**: Future mock runs (e.g., Mock 6) should not rediscover the backend snapshot or hydration architecture.
- **Reuse Hydration**: Directly reuse the Zustand-based `importSnapshotState` merge pattern proven in Mock 5.
- **Update Parameters**: Update only the mock ID (`MOCK6`), the period/quarter, the target calendar year, and the Evidence Center folder path.
