# V3 Phase 5A-B Artifact Viewer / Local Download Report

Date: 2026-05-26

## 1. Executive Summary

Phase 5A-B adds truth-based artifact viewer/local download wiring to the V3 Evidence Center. Primary evidence row clicks remain inside `/ui-staging`; only explicit artifact actions can open `/artifacts/:artifactId`.

This phase does not add backend/AWS persistence, production S3/download APIs, backend upload/download, validation/promote, legal signature, immutable audit, certification, or level 5 completion.

## 2. Files Changed

- `src/ui-staging/V3_2StagingApp.tsx`
- `Seeding-Live-Staging-Alignment-2026-05/QA_RUNTIME/ces-phase5b-artifact-viewer-download-qa.cjs`
- `Seeding-Live-Staging-Alignment-2026-05/QA_RUNTIME/artifacts/phase5b-artifact-viewer-download-results.json`
- `Seeding-Live-Staging-Alignment-2026-05/QA_RUNTIME/artifacts/phase5b-artifact-detail.png`
- `Seeding-Live-Staging-Alignment-2026-05/QA_RUNTIME/artifacts/phase5b-artifact-blocked.png`
- `Seeding-Live-Staging-Alignment-2026-05/GPT5.5/V3_SEEDING_TRUTH_MATRIX.md`
- `Seeding-Live-Staging-Alignment-2026-05/GPT5.5/V3_CLICK_PATH_AUDIT.md`
- `Seeding-Live-Staging-Alignment-2026-05/GPT5.5/V3_PRODUCTION_PARITY_GAPS.md`
- `Seeding-Live-Staging-Alignment-2026-05/V3_PHASE_5A_B_ARTIFACT_VIEWER_DOWNLOAD_REPORT.md`

## 3. Evidence Center Source Inventory

- Artifact route builder: `src/policy/artifacts/artifactRoute.ts`
- Artifact viewer route: `/artifacts/:artifactId` in `src/App.tsx`
- Artifact viewer page: `src/policy/pages/ArtifactViewerPage.tsx`
- Evidence metadata store: `useRegulatoryExecutionStore` / `reg-execution-v2`
- Demo-local bytes resolver: `resolveEvidenceDataUrl` from `src/policy/evidence/demoEvidenceRuntimeCache.ts`
- Seed fallback metadata: `V3_ExecutionUnitsSeed`

## 4. Data Source Priority Used

1. Existing `useRegulatoryExecutionStore` evidence metadata.
2. Existing demo-local artifact bytes available through `resolveEvidenceDataUrl`.
3. Existing artifact route targets built with `buildArtifactRoute`.
4. CES seed evidence metadata, labeled as seeded preview.

No fake artifact bytes or fake PDF files are generated.

## 5. Evidence Row / Detail Behavior

- `data-qa="v3-evidence-row"` remains the primary in-shell click target.
- `data-qa="v3-evidence-detail"` updates with the selected evidence ID.
- The detail panel now exposes `data-qa-artifact-action-state`.
- Primary row clicks do not navigate away from `/ui-staging`.

## 6. Artifact Mode Handling

Implemented action states:

- `real-local-artifact`: existing data URL/blob bytes are available; explicit artifact viewer and local download are enabled.
- `real-route-only`: artifact route/object path exists, but local bytes are unavailable; explicit artifact viewer is enabled, local download remains blocked.
- `metadata-placeholder`: metadata exists but no file artifact exists; open/download remain blocked.
- `seeded-preview`: seed metadata only; open/download remain blocked.
- `missing`: no usable artifact metadata; open/download remain blocked.

## 7. Blocked Upload / Download / Validate / Promote Behavior

- Backend upload remains blocked.
- Backend download remains blocked.
- Local download is available only when existing local bytes exist.
- Validation/promote remains blocked.
- Certify evidence remains blocked.
- Production audit immutability remains blocked.

## 8. Wording Corrections Made

The V3 Evidence Center now distinguishes:

- `Demo-local artifact available`
- `Artifact route available; local bytes may not survive refresh`
- `Metadata is available, but no artifact file is available for this record`
- `Seed evidence metadata only; not a file artifact`
- Local/demo artifact access is not backend persistence.
- Local/demo downloads are not production S3/download APIs.

## 9. Containment Result

Containment grep:

- `window.location|location.href|location.assign|navigate(` in `src/ui-staging`: no matches.
- `href=` in `src/ui-staging`: no matches.
- `window.open|Open live route` in V3 staging files: existing secondary live-route buttons plus the new explicit artifact viewer button in `V3_2StagingApp.tsx`.

Primary Evidence Center clicks stay in V3. Artifact viewer access is explicit and secondary.

## 10. Mutation Audit Classification

- Existing pre-Phase 5A behavior: CES local preview state, Phase 4C-A durable app-store actions, existing evidence stores/cache, existing AWS staging adapter files, existing CES seed strings.
- Local read-only adapter: Phase 5A-B reads `useRegulatoryExecutionStore` evidence metadata and `resolveEvidenceDataUrl`.
- Local persisted app-store read: evidence metadata comes from `reg-execution-v2` where present.
- New adapter write: none.
- Backend/API call: none added by Phase 5A-B.
- Forbidden fake mutation: none found.

## 11. Validation Results

- `npx tsc -b --pretty false`: passed
- `npx tsc --noEmit --skipLibCheck`: passed
- `npm run build`: passed

## 12. Playwright Results

- Phase 5A-B Artifact Viewer / Download QA: 51 passed / 0 failed
- Phase 5A-A Evidence Center QA: 22 passed / 0 failed
- Phase 4C-A Durable Adapter QA: 49 passed / 0 failed
- Phase 4B Evidence / Signature QA: 44 passed / 0 failed
- Phase 4A hardened QA: 16 passed / 0 failed

The current seed/store state had no real-local-artifact fixture and no real artifact route fixture, so the Phase 5A-B QA passed blocked-state assertions and recorded `no real-local-artifact fixture available`.

## 13. Remaining Phase 5A-B / Phase 4C-B Blockers

- Backend artifact upload/download is not wired.
- Evidence validation/promote workflow is not wired.
- Backend evidence persistence is not wired.
- Production audit immutability is not wired.
- Legal durable signature is not wired.
- Evidence certification is not wired.
- No V3 surface is level 5.

## 14. No Level 5 Claim

Confirmed. Phase 5A-B is V3 Evidence Center artifact viewer/local download wiring only where existing local/demo references or bytes already exist. It is not backend persistence, not production S3/download, not production evidence certification, and not level 5.
