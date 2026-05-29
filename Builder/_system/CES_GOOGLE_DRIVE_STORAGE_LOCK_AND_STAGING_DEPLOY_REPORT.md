# CES Google Drive Storage Lock & Staging Deploy Report

**Date:** 2026-05-29
**Account:** 069857851156 · **Profile:** blokey
**Staging URL (unchanged):** https://d14dlrdifuuet5.cloudfront.net
**Production (NOT touched):** https://dovdry3t4njek.cloudfront.net (and `CiPolicyFrontend-prod` / `d3p8vdsg4qksb6`)
**QA-WF-03 custom page:** untouched (diff empty)

---

## 1. Locked storage architecture

| Concern | Provider | Notes |
| --- | --- | --- |
| Files / artifacts (PHI files, signed PDFs, eCIgn certs, packages) | **Google Drive** (`google_drive_calendar`) | Bytes live here; Calendar indexes/attaches references |
| Live operational metadata (event/task/form/signature/evidence pointers, completion/cert state) | **DynamoDB** (`dynamodb_metadata`) | NON-PHI metadata + pointers only — never bytes |
| Optional non-PHI snapshots/exports | `s3_metadata_snapshot` | Not used for CES artifact files |
| Browser persistence for CES | **none** | No `localStorage` provider; no fallback |

The single source of truth for this contract is
`src/policy/evidence/storageProviders/types.ts` (`CesStorageProvider` has **no**
localStorage member; `CES_FORBIDDEN_METADATA_FIELDS` lists banned byte fields).

## 2. Application layer (built + tested)

- `server/cesMetadataStore.ts` — metadata store with two implementations:
  `FileCesMetadataStore` (local `.cache/ces-metadata`, default) and
  `DynamoCesMetadataStore`. Every write passes `assertNoFileBytes()`.
- `server/routes/ces.ts` — `GET /api/ces/health`, `GET|PUT /api/ces/snapshot/:workspaceId`,
  `GET /api/ces/events/:eventId/evidence`.
- `server/routes/calendar.ts` — Part 9 endpoints: evidence list, `drive-folder`,
  `signed-artifact/publish` (requires `completed:true`), and upload now records a
  non-PHI pointer in the CES store.
- `src/policy/services/evidenceApi.ts` — CES client; `loadSnapshot` returns an
  explicit `unavailable` state (no silent fallback).
- Google Drive evidence integration: `server/googleDrive.ts`, `server/googleEvidence.ts`,
  `server/googleCalendar.ts` (attach + allowlisted extendedProperties),
  `GoogleEvidencePanel.tsx`, `GoogleEvidenceProviderCard.tsx`.

## 3. Validators (npm scripts)

- `validate:ces-no-localstorage` — PASS. New CES layer has zero localStorage usage;
  legacy `regulatoryExecutionStore` localStorage footprint reported honestly as the
  checkpoint-gated migration (see §7).
- `validate:google-drive-ces-evidence` — PASS. Provider contract, PHI guards,
  pointer-only metadata, S3/localStorage prohibitions.
- `validate:google-drive-evidence` — PASS.

## 4. Infrastructure (CDK)

**`infra/ces-api-cdk/` — `CesApi-staging` (us-west-1):**
- DynamoDB `ces_metadata_staging` (pk/sk, PAY_PER_REQUEST, PITR on, RETAIN).
- Lambda (`cesApi.ts`) — DynamoDB-backed CES routes; same `assertNoFileBytes` guard.
- HTTP API v2 catch-all (`ANY /{proxy+}`), tolerates the `/api` prefix.
- Outputs: `CesApiOriginDomain = 9kh2cl1e3h.execute-api.us-west-1.amazonaws.com`,
  `CesMetadataTableName = ces_metadata_staging`.

**`infra/frontend-cdk` — `CiPolicyFrontend-staging` (us-west-2):**
- Added an **optional** `/api/*` CloudFront behavior → the us-west-1 HTTP API origin
  (HTTPS-only, `CACHING_DISABLED`, `ALL_VIEWER_EXCEPT_HOST`, all methods).
- Gated on `env === 'staging'` **and** `-c apiOrigin=<host>`. Without the context (or
  for prod) the behavior is **not** added — a verified no-op. CSP `connect-src`
  gained `*.execute-api.us-west-1.amazonaws.com`.

> Region note: the frontend/CloudFront stack pre-exists in **us-west-2**; the CES API
> is in **us-west-1** per instruction. CloudFront is global, so a cross-region origin
> is fine. The staging distribution change was applied by updating the existing
> us-west-2 stack (no new distribution, same URL).

## 5. Deploy (staging only)

1. `aws sts get-caller-identity` → account **069857851156** ✅
2. `cdk deploy CesApi-staging` → CREATE_COMPLETE (DynamoDB + Lambda + HTTP API).
3. Fixed a Lambda bug (route handlers must `await` so the no-bytes guard returns 400,
   not a 500) and redeployed → UPDATE_COMPLETE.
4. `cdk diff CiPolicyFrontend-staging -c apiOrigin=...` → only change = `/api/*`
   behavior + new origin + CSP + output. No change to S3 origin, default behavior,
   buckets, or IAM.
5. `cdk deploy CiPolicyFrontend-staging --exclusively -c apiOrigin=...` →
   UPDATE_COMPLETE. `DistributionId = E9IG1BICGDZ49`, `ApiBehaviorEnabled = true`.
6. CloudFront invalidation on **E9IG1BICGDZ49 only**: `/api/*`, `/index.html`
   (Id `IBYFA47RYPVPICK4V13QMPS1E8`).

## 6. Staging smoke test (through CloudFront) — PASS

- `GET  /api/ces/health` → 200 `{ provider: dynamodb_metadata, table: ces_metadata_staging }`
- `PUT  /api/ces/snapshot/staging-smoke` → 200 (round-tripped via GET → 200)
- `PUT` with `pdfBlob`/`localDataUrl` → **400 validation_error** (no-bytes guard)
- `GET  /api/ces/events/:id/evidence` → 200 `{ count: 0 }`
- `GET  /` (SPA) → 200 (unchanged)
- Smoke rows deleted; `ces_metadata_staging` scan count = 0.

(A few transient `HTTP 000` curl results appeared during rapid looped requests —
client-side TLS connect errors at the edge, not server failures; spaced requests all
returned correctly.)

## 7. Remaining work (sequenced AFTER this deploy)

- **Store migration:** `src/policy/stores/regulatoryExecutionStore.ts` still persists
  to `localStorage` (`reg-execution-v2`, 14 refs). Migrating it to read/write the CES
  snapshot via `EvidenceApi` is the final step to make "no localStorage for CES"
  literally true in the browser. Deferred per the agreed sequence so staging kept
  working until the backend went live (now done). This is a high-risk store rewrite —
  recommended as its own change with focused testing.

## 8. Security / PHI

- No public ("anyone with link") Drive sharing.
- No PHI in Calendar `extendedProperties` (allowlist enforced), Drive filenames/folders,
  or CES metadata.
- No file bytes in CES metadata / DynamoDB (guard enforced server-side **and** in the
  Lambda, verified live with a 400).
- No secrets committed; `.env`/credentials excluded; CDK build artifacts excluded.
