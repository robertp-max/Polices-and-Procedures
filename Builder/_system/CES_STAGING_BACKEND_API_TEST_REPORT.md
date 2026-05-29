# CES Staging Backend API Test Report

## 1. Timestamp

- Test run: 2026-05-29 12:45-13:00 PT
- Mode: LOCKED - STAGING CES BACKEND + CLOUDFRONT API TEST ONLY
- Verdict: PASS WITH NOTES

## 2. Branch

- Branch: `checkpoint/full-app-vercel-deploy-2026-05-27`
- Repo path verified: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`

## 3. Commit Tested

- Commit tested: `43a4363 feat(ces): Google Drive + DynamoDB CES storage backend; deploy CES metadata API to staging`
- Recent commits:
  - `43a4363 feat(ces): Google Drive + DynamoDB CES storage backend; deploy CES metadata API to staging`
  - `e037a3c checkpoint: add ecign consent signature profile and permission foundation`
  - `a09812e checkpoint: save canonical signer hierarchy and swimlane stabilization`

## 4. AWS Account

- `aws sts get-caller-identity` account: `069857851156`
- Expected account: `069857851156`
- Result: PASS

## 5. AWS Region

- `AWS_PROFILE`: `blokey`
- `AWS_REGION`: `us-west-1`
- `AWS_DEFAULT_REGION`: `us-west-1`
- `aws configure list` showed region from environment as `us-west-1`.
- Result: PASS

## 6. Staging URL

- Staging URL tested: `https://d14dlrdifuuet5.cloudfront.net`
- Staging CloudFront distribution: `E9IG1BICGDZ49`
- Result: PASS

## 7. Production Untouched Confirmation

- Production URL: `https://dovdry3t4njek.cloudfront.net`
- Production CloudFront distribution checked read-only: `EB3BTJ7RLYPH4`
- Production distribution status: `Deployed`
- Production last modified time: `2026-05-20T10:27:56.326000+00:00`
- Production `/api/*` behavior: `null`
- No deploy, invalidation, update, or write command targeted production in this test pass.
- Result: PASS

## 8. QA-WF-03 Diff Result

- Command: `git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx`
- Output: empty
- Result: PASS

## 9. Backend Health Result

- Endpoint: `GET https://d14dlrdifuuet5.cloudfront.net/api/ces/health`
- Expected: HTTP 200, provider `dynamodb_metadata`, table `ces_metadata_staging`
- Observed body:
  - `ok: true`
  - `provider: dynamodb_metadata`
  - `metadataProvider: dynamodb_metadata`
  - `cesStorageProvider: google_drive_calendar`
  - `table: ces_metadata_staging`
- Result: PASS

## 10. CloudFront `/api/*` Result

- Staging CloudFront distribution metadata confirmed:
  - Domain: `d14dlrdifuuet5.cloudfront.net`
  - Status: `Deployed`
  - `/api/*` behavior: present
- Browser-side `fetch('/api/ces/health')` from staging returned HTTP 200 with provider `dynamodb_metadata` and table `ces_metadata_staging`.
- Intermittent command-line curl checks returned transient `HTTP 000` on some rapid requests, but retried/spaced requests and browser fetches succeeded. No API CORS failures were observed in Playwright.
- Result: PASS WITH NOTES

## 11. DynamoDB Table Verification

- Table: `ces_metadata_staging`
- `describe-table` result:
  - TableName: `ces_metadata_staging`
  - Status: `ACTIVE`
  - BillingMode: `PAY_PER_REQUEST`
- Smoke records were visible after write using keys:
  - `pk = WS#smoke-test-event-20260529124704`, `sk = SNAPSHOT` (partial row from an initial curl body test)
  - `pk = WS#smoke-test-event-20260529124810`, `sk = SNAPSHOT` (successful round-trip row)
- Both rows were deleted with DynamoDB `delete-item` using temporary key files outside the repo.
- Final table scan count: `0`
- Result: PASS

## 12. Snapshot Round-Trip Result

- Fake non-PHI smoke event:
  - `eventId: smoke-test-event-20260529124810`
  - `workflowId: SMOKE-WF`
  - `taskId: SMOKE-TASK-001`
  - no PHI
  - no patient data
- `PUT /api/ces/snapshot/smoke-test-event-20260529124810` returned HTTP 200.
- `GET /api/ces/snapshot/smoke-test-event-20260529124810` returned HTTP 200.
- Round-trip values matched:
  - `eventId`
  - `workflowId`
  - `taskId`
  - nested `stepStates.SMOKE-TASK-001`
- Result: PASS

## 13. No-File-Bytes Guard Result

- Blocked body included `pdfBlob` and `localDataUrl`.
- Endpoint: `PUT /api/ces/snapshot/smoke-test-event-20260529124810-blocked`
- Expected: HTTP 400, not 500.
- Observed: HTTP 400.
- Result: PASS

## 14. Evidence Endpoint Result

- Endpoint: `GET /api/ces/events/smoke-test-event-20260529124810/evidence`
- Observed: HTTP 200.
- Body shape:
  - `eventId: smoke-test-event-20260529124810`
  - `items: []`
  - `count: 0`
- Result: PASS

## 15. Browser Smoke-Test Result

- Tool: Playwright Chromium headless, using the repo's installed Playwright package.
- Routes opened:
  - `/`
  - `/calendar`
  - `/events/oig_sam_exclusion_check-20260505-01/swimlane?workflowId=CO-WF-15`
  - `/events/qapi_meeting-20260507-08/swimlane`
  - `/evidence`
- Observed route behavior:
  - All routes returned HTTP 200.
  - Protected routes redirected to `/login` with the expected `next` query parameter.
  - Login page rendered non-blank content.
  - Browser `fetch('/api/ces/health')` returned HTTP 200.
  - API request failures: `0`
  - Page errors: `0`
- Notes:
  - Console reported existing CSP errors for Google Fonts and an inline script hash requirement. These did not cause blank screens, page errors, or API/CORS failures.
  - Login/protected route behavior appeared unchanged. No credentials were used and no sign-in code was modified.
- Result: PASS WITH NOTES

## 16. Build and Validator Results

- `npm run build`: PASS
- `npm run validate:event-dataflow`: PASS
- `npm run verify:task-identity`: PASS
- `npm run check:ecign-routes`: PASS
- `npm run validate:ces-no-localstorage`: PASS WITH EXPECTED WARNING
  - Warning: legacy `regulatoryExecutionStore` still has 14 `localStorage` references and `reg-execution-v2`; this is the intentionally deferred next phase.
- `npm run validate:google-drive-ces-evidence`: PASS
- `npm run validate:google-drive-evidence`: PASS

## 17. Cleanup Result

- No cleanup API endpoint exists for snapshots.
- Manual cleanup was performed with DynamoDB `delete-item`.
- Deleted keys:
  - `pk = WS#smoke-test-event-20260529124704`, `sk = SNAPSHOT`
  - `pk = WS#smoke-test-event-20260529124810`, `sk = SNAPSHOT`
- Final `scan --select COUNT` on `ces_metadata_staging`: `0`
- Result: PASS

## 18. Remaining Issues

- `regulatoryExecutionStore` localStorage migration is still pending and should remain a separate phase.
- Playwright detected CSP console errors for Google Fonts and an inline script. They are not new API/CORS failures and did not block rendering, but they remain a staging hardening item.
- Command-line curl checks occasionally returned transient `HTTP 000` against CloudFront during rapid repeated calls; browser fetch and retried/spaced API checks passed.
- Existing dirty working tree items were present before this test pass and were not modified intentionally:
  - `docs/CES_Evidence_and_Tasks_Right_Panel_V3_Removals.md`
  - `docs/UIUX/Audit/UAT/V3`
  - `infra/frontend-cdk/cdk.out/*`

## 19. Go/No-Go Recommendation

- Recommendation: GO for the next phase, with caution.
- Next phase: migrate `regulatoryExecutionStore` off `localStorage` to the CES snapshot API.
- Rationale: staging backend, CloudFront `/api/*`, DynamoDB persistence, no-file-bytes guard, Evidence endpoint, browser protected-route behavior, build, and validators all passed.
- Suggested condition: treat the store migration as a separate high-risk change with focused rollback notes and post-migration browser testing.
