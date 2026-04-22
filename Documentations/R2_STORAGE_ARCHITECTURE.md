# Cloudflare R2 Storage Architecture

**System:** Home Health Compliance Application — Evidence Repository
**Status:** Authoritative design for SANDBOX, forward-compatible with PRODUCTION
**Owner:** Brad (authority) / Compliance Officer / Administrator
**Last updated:** 2026-04-22
**Regulatory anchors:** 42 CFR § 484.45, § 484.60, § 484.65, § 484.70, § 484.75, § 484.80, § 484.102, § 484.105, § 484.110, § 484.245; HIPAA 45 CFR Parts 160/164; CMS SOM Appendix B

---

## 0. DESIGN PRINCIPLES (non-negotiable)

1. **Every object is traceable.** No object may exist in R2 that cannot resolve to a `(policy_id, workflow_id, event_id)` triplet. If any one is missing, the upload is rejected at the API gateway.
2. **Environment isolation is physical, not logical.** Sandbox and production live in **separate buckets with separate credentials**. There is no shared bucket.
3. **Evidence is immutable in production.** Sandbox may be reset freely. Production objects are write-once, versioned, and governed by Object Lock–equivalent retention.
4. **The database is the index, R2 is the vault.** No object is "discoverable" by listing R2 — discovery flows through the SQLite/Postgres index keyed by `event_id`.
5. **Metadata is the contract.** If the metadata is wrong, the object is treated as non-compliant evidence even if the bytes are correct.
6. **Brad is the authority.** All lifecycle-breaking operations (deletion in prod, retention overrides, legal holds) require Brad's signed approval + audit log entry.

---

## PART 1 — BUCKET DESIGN

### 1.1 Bucket count and purpose

The system uses **six R2 buckets per environment** (12 total across sandbox + prod). A single-bucket-with-prefixes design was rejected because CORS, lifecycle policies, access credentials, and retention rules differ sharply by content class.

| # | Bucket role | Sandbox name | Production name | Lifecycle | Public access |
|---|-------------|--------------|-----------------|-----------|---------------|
| 1 | **Evidence** (authoritative survey-ready artifacts) | `hh-sbx-evidence` | `hh-prd-evidence` | Versioned, retention-locked | Private |
| 2 | **Workflow outputs** (intermediate/generated artifacts from the workflow engine) | `hh-sbx-workflows` | `hh-prd-workflows` | Versioned, 7-yr retention | Private |
| 3 | **Forms** (generated PDFs from forms engine, filled instances) | `hh-sbx-forms` | `hh-prd-forms` | Versioned, 7-yr retention | Private |
| 4 | **Audit logs** (append-only evidence of system + user actions) | `hh-sbx-audit` | `hh-prd-audit` | Append-only, 10-yr retention, legal hold capable | Private |
| 5 | **Exports** (dashboard exports, survey packets, ad-hoc reports) | `hh-sbx-exports` | `hh-prd-exports` | 90-day rolling (ephemeral) | Presigned only |
| 6 | **Uploads** (inbound user uploads awaiting validation/scan) | `hh-sbx-uploads` | `hh-prd-uploads` | 24-hr TTL staging | Private, server-side only |

### 1.2 Naming convention

```
hh-<env>-<class>
```

- `hh` — Home Health application prefix (namespace guard).
- `<env>` — `sbx` | `prd` (explicit three-letter code, never `sandbox`/`production` spelled out to keep names short and unambiguous; `dev`/`stg` may be added later).
- `<class>` — one of: `evidence`, `workflows`, `forms`, `audit`, `exports`, `uploads`.

**Rules:**
- `sbx` and `prd` buckets **never share credentials**. Each environment has its own `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` pair stored in environment-specific secret stores.
- Bucket names are lowercase, hyphenated, and match the regex `^hh-(sbx|prd|stg|dev)-(evidence|workflows|forms|audit|exports|uploads)$`. Any other name is rejected at bucket-provisioning time.
- A `stg` (staging) tier is reserved for future pre-production rehearsals. `dev` is reserved for per-developer personal buckets.

### 1.3 Why six, not one

| Concern | Why separate bucket | Blast radius |
|---|---|---|
| Evidence immutability | Object Lock / retention applies at bucket level | A misconfig on `exports` cannot affect `evidence` |
| Audit append-only guarantee | Dedicated keys with write-only + read-restricted IAM | Compromise of app keys cannot rewrite history |
| Lifecycle rules differ | Exports expire in 90 days; evidence survives 7–10 years | Rules cannot collide |
| CORS & presigned URL scope | Exports need browser-accessible presigned URLs; evidence never does | No accidental exposure |
| Sandbox reset | `sbx` buckets can be emptied nightly without touching `prd` | Physical safety |

---

## PART 2 — DIRECTORY / OBJECT STRUCTURE

All object keys are **hierarchical prefixes** — R2 is flat, but we enforce structure via the key. The canonical prefix shape is:

```
<env>/<domain>/<workflow_id>/<event_id>/<artifact_class>/<filename>
```

### 2.1 Top-level layout per bucket

#### `hh-<env>-evidence/`
```
sandbox/
  GV/
    GV-WF-01/
      <event_id>/
        packet/        ← final signed governance packet (PDF)
        minutes/       ← board meeting minutes
        approvals/     ← signature blocks, attestations
        source/        ← source documents referenced by the packet
        manifest.json  ← signed list of all artifacts in this event
  QA/
    QA-WF-04/
      <event_id>/
        pip-charter/
        baseline-data/
        rca/
        action-plan/
        remeasurement/
        sustainment/
        manifest.json
  CL/
  RM/
  CO/
  OP/
  FN/
  HR/
  IT/
  EN/
```

#### `hh-<env>-workflows/`
```
sandbox/
  <domain>/<workflow_id>/<event_id>/
    inputs/            ← raw inputs pulled by workflow engine
    intermediate/      ← partial outputs between workflow steps
    outputs/           ← final workflow outputs before promotion to evidence
    runs/<run_id>/     ← per-execution logs, step timings, retry history
```

#### `hh-<env>-forms/`
```
sandbox/
  <domain>/<form_id>/
    <event_id>/
      <form_id>__<version>__<timestamp>.pdf
      <form_id>__<version>__<timestamp>.json   ← structured data payload
      signatures/<signer_role>__<timestamp>.sig
  templates/           ← blank form templates (not tied to event_id)
    <form_id>__<version>.pdf
    <form_id>__<version>.schema.json
```

#### `hh-<env>-audit/`
```
sandbox/
  YYYY/MM/DD/
    events/<event_id>/<timestamp>__<action>.json
    users/<user_id>/<timestamp>__<action>.json
    system/<component>/<timestamp>__<action>.json
  daily-digest/
    YYYY-MM-DD.ndjson.gz   ← sealed daily digest, hash-chained
```

#### `hh-<env>-exports/`
```
sandbox/
  by-user/<user_id>/<YYYY-MM-DD>/<export_id>.zip
  by-event/<event_id>/survey-packet__<timestamp>.zip
  dashboards/<dashboard_id>/<YYYY-MM>.csv
```

#### `hh-<env>-uploads/`
```
sandbox/
  staging/<upload_id>/<original_filename>
  quarantine/<upload_id>/              ← failed AV scan or validation
```

### 2.2 Client and employee scoping

Client- and employee-specific artifacts are scoped **inside** the event prefix, not in separate top-level client/employee directories. This is because every clinical or HR document must be bound to an event (e.g., an OASIS transmission event, an aide observation event). Convenience lookups by client or employee are served by the **index database**, not by R2 directory scans.

When PHI scoping is needed, client/employee IDs are **hashed** and appear in metadata only, never in the key path, to avoid PHI leakage via access logs:

```
GV/GV-WF-01/<event_id>/packet/minutes__<timestamp>__v1.pdf
  └ metadata: client_id_hash=sha256(...), employee_id_hash=sha256(...)
```

### 2.3 `event_id` as the universal pivot

The `event_id` (UUID, already established in `server/sync/eventSync.ts`) is the **required** fourth segment of every evidence/workflow/forms key. This guarantees:

- Every artifact resolves to a calendar-bound event.
- Survey retrieval = single prefix list: `evidence/sandbox/<domain>/<workflow_id>/<event_id>/`.
- Deletion of a sandbox event's evidence = single prefix delete.
- Dashboard "show everything for event X" = single prefix query.

---

## PART 3 — FILE NAMING CONVENTION

### 3.1 Canonical filename format

```
<domain>__<workflow_id>__<event_id>__<form_id|artifact_kind>__v<version>__<UTC_timestamp>.<ext>
```

**Delimiter:** double underscore `__` (single underscores appear inside IDs like `QA-FM-001`, so double-underscore is the field separator).

**Field definitions:**

| Field | Format | Required | Example |
|---|---|---|---|
| `domain` | 2-letter code | yes | `QA`, `GV`, `CL` |
| `workflow_id` | `<DOMAIN>-WF-<NN>` | yes | `QA-WF-04` |
| `event_id` | UUID v4 (lowercase, hyphenated) | yes | `7c9e6679-7425-40de-944b-e07fc1f90ae7` |
| `form_id` or `artifact_kind` | `<DOMAIN>-FM-<NNN>` or controlled vocabulary | yes | `QA-FM-001`, `MINUTES`, `PACKET`, `RCA` |
| `version` | `v<MAJOR>.<MINOR>` (integer versions for drafts, semver for releases) | yes | `v1.0`, `v2.3` |
| `timestamp` | `YYYYMMDDTHHMMSSZ` (ISO 8601 basic, UTC) | yes | `20260422T143015Z` |
| `ext` | lowercase extension | yes | `pdf`, `json`, `csv`, `png`, `ndjson.gz` |

### 3.2 Controlled `artifact_kind` vocabulary

When an artifact is not tied to a specific form, use one of these fixed kinds (extend the enum in code, never ad-hoc):

`PACKET`, `MINUTES`, `MANIFEST`, `APPROVAL`, `ATTESTATION`, `RCA`, `CHARTER`, `BASELINE`, `REMEASURE`, `EXERCISE_AAR`, `OBSERVATION`, `TRAINING_ROSTER`, `EXPORT`, `DIGEST`, `DASHBOARD`, `LOG`, `UPLOAD`, `SOURCE`.

### 3.3 Examples

```
QA__QA-WF-04__7c9e6679-7425-40de-944b-e07fc1f90ae7__QA-FM-005__v1.0__20260422T143015Z.pdf
GV__GV-WF-01__a1b2c3d4-5678-4abc-9def-0123456789ab__PACKET__v2.1__20260115T090000Z.pdf
QA__QA-WF-04__7c9e6679-7425-40de-944b-e07fc1f90ae7__MANIFEST__v1.0__20260422T143015Z.json
HR__HR-WF-03__f0e9d8c7-b6a5-4321-8765-fedcba987654__HR-FM-017__v1.0__20260210T101500Z.pdf
```

### 3.4 Full object keys

The filename above is concatenated with the prefix from Part 2:

```
sandbox/QA/QA-WF-04/7c9e6679-7425-40de-944b-e07fc1f90ae7/pip-charter/
  QA__QA-WF-04__7c9e6679-7425-40de-944b-e07fc1f90ae7__CHARTER__v1.0__20260422T143015Z.pdf
```

### 3.5 Collision and idempotency

- Timestamps are UTC, second-granularity. If two uploads collide in the same second, the second one increments the version.
- The tuple `(workflow_id, event_id, form_id|artifact_kind, version)` is **unique**. Re-uploading the same tuple is rejected; a new version must be minted.

---

## PART 4 — METADATA DESIGN (CRITICAL)

Every R2 object carries **two parallel metadata layers**:

1. **R2 user-metadata** (`x-amz-meta-*` headers) — denormalized, indexed at the storage layer, survives across restore.
2. **Database index row** (`evidence_objects` table) — authoritative, queryable, joinable.

They are written atomically: if the DB write fails, the R2 upload is rolled back (delete + audit entry).

### 4.1 Required R2 user-metadata (enforced at upload gateway)

| Metadata key | Type | Required | Notes |
|---|---|---|---|
| `x-amz-meta-env` | enum `sbx`\|`prd` | yes | Must match bucket's env; mismatch = reject |
| `x-amz-meta-event-id` | UUID v4 | yes | Primary pivot |
| `x-amz-meta-workflow-id` | `<DOMAIN>-WF-<NN>` | yes | From workflow registry |
| `x-amz-meta-policy-id` | `<DOMAIN>-<SUB>-<NNN>` | yes | e.g. `QA-PG-001` |
| `x-amz-meta-domain` | 2-letter code | yes | Denormalized for fast filter |
| `x-amz-meta-form-id` | `<DOMAIN>-FM-<NNN>` | conditional | Required when object is a form instance |
| `x-amz-meta-artifact-kind` | enum | yes | See §3.2 |
| `x-amz-meta-version` | `v<MAJOR>.<MINOR>` | yes | Matches filename |
| `x-amz-meta-created-by` | user_id (UUID) | yes | Must exist in users table |
| `x-amz-meta-created-at` | RFC 3339 UTC | yes | Server-generated, not client-trusted |
| `x-amz-meta-created-by-role` | enum | yes | `admin`, `compliance_officer`, `clinical_mgr`, `qapi_lead`, `aide`, `system`, `brad` |
| `x-amz-meta-content-sha256` | 64-char hex | yes | Integrity hash, verified on read |
| `x-amz-meta-compliance-flag` | enum | conditional | `survey_ready`, `draft`, `superseded`, `under_review`, `corrective_action_required` |
| `x-amz-meta-retention-class` | enum | yes | `transient_90d`, `operational_7y`, `evidence_10y`, `permanent`, `legal_hold` |
| `x-amz-meta-phi` | bool | yes | `true` if contains PHI — triggers stricter access rules |
| `x-amz-meta-client-id-hash` | sha256 hex | conditional | Required when object references a patient |
| `x-amz-meta-employee-id-hash` | sha256 hex | conditional | Required when object references staff |
| `x-amz-meta-google-event-id` | string | conditional | Links back to Google Calendar event when applicable |
| `x-amz-meta-source-upload-id` | UUID | conditional | Set when object was promoted from the uploads bucket |
| `x-amz-meta-supersedes` | object key | conditional | When this object replaces a prior version |
| `x-amz-meta-signed-by` | comma-separated user_ids | conditional | When digital signatures are attached |

### 4.2 Database index schema (authoritative mirror)

```sql
CREATE TABLE evidence_objects (
  id                   TEXT PRIMARY KEY,              -- UUID of the row
  bucket               TEXT NOT NULL,                 -- e.g. hh-sbx-evidence
  object_key           TEXT NOT NULL,                 -- full key path
  env                  TEXT NOT NULL CHECK (env IN ('sbx','prd')),
  event_id             TEXT NOT NULL,                 -- FK -> events.event_id
  workflow_id          TEXT NOT NULL,
  policy_id            TEXT NOT NULL,
  domain               TEXT NOT NULL,
  form_id              TEXT,
  artifact_kind        TEXT NOT NULL,
  version              TEXT NOT NULL,
  created_by           TEXT NOT NULL,
  created_by_role      TEXT NOT NULL,
  created_at           TEXT NOT NULL,                 -- RFC 3339
  content_sha256       TEXT NOT NULL,
  size_bytes           INTEGER NOT NULL,
  mime_type            TEXT NOT NULL,
  compliance_flag      TEXT,
  retention_class      TEXT NOT NULL,
  phi                  INTEGER NOT NULL DEFAULT 0,
  client_id_hash       TEXT,
  employee_id_hash     TEXT,
  google_event_id      TEXT,
  supersedes_key       TEXT,
  superseded_by_key    TEXT,
  signed_by_json       TEXT,                          -- JSON array
  legal_hold           INTEGER NOT NULL DEFAULT 0,
  deleted_at           TEXT,                          -- NULL unless soft-deleted (sandbox only hard-deletes)
  UNIQUE (workflow_id, event_id, COALESCE(form_id, artifact_kind), version)
);
CREATE INDEX idx_evidence_event    ON evidence_objects (event_id);
CREATE INDEX idx_evidence_workflow ON evidence_objects (workflow_id);
CREATE INDEX idx_evidence_policy   ON evidence_objects (policy_id);
CREATE INDEX idx_evidence_domain   ON evidence_objects (domain);
CREATE INDEX idx_evidence_created  ON evidence_objects (created_at);
```

### 4.3 How metadata enables the three core guarantees

| Guarantee | Enabled by |
|---|---|
| **Audit traceability** | `event_id` + `created_by` + `created_at` + `content_sha256` + daily hash-chained digest in `hh-<env>-audit` |
| **Workflow linkage** | `workflow_id` + `policy_id` + `form_id` + `supersedes` form a DAG queryable in one SQL join |
| **Compliance validation** | `compliance_flag` + `retention_class` + `signed_by` + manifest.json in each event folder — surveyor can be handed a single prefix and verify provenance offline |

---

## PART 5 — WORKFLOW INTEGRATION

### 5.1 Create / update / finalize lifecycle

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Uploads     │→→│  Workflows   │→→│   Forms      │→→│   Evidence   │
│  (staging)   │   │  (transform) │   │  (rendered)  │   │  (final)     │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
       │                  │                  │                  │
       └──────────────────┴───────▼──────────┴──────────────────┘
                           ┌──────────────┐
                           │    Audit     │
                           │  (immutable) │
                           └──────────────┘
```

### 5.2 Workflow engine ↔ R2

| Moment | Bucket | Action |
|---|---|---|
| Workflow run starts | `workflows` | Create run dir `<domain>/<wf>/<event_id>/runs/<run_id>/` with `run.started.json` |
| Each step completes | `workflows` | Write step output to `intermediate/step-<n>.json` + audit entry |
| Workflow emits a form | `forms` | Render form instance → upload with full metadata |
| Workflow produces final artifact | `evidence` | Promote `workflows/.../outputs/` → `evidence/` with `compliance_flag=survey_ready` |
| Workflow fails / retries | `workflows` + `audit` | Retry counters, failure reason, Brad notification if retries exhausted |
| Workflow finalized | `evidence` | Write `manifest.json` listing every object key + sha256 in this event |

### 5.3 Forms engine ↔ R2

| Moment | Action |
|---|---|
| Template published | Upload to `forms/templates/<form_id>__<version>.pdf` + `.schema.json` |
| User fills a form | Draft saved to `forms/<domain>/<form_id>/<event_id>/...__DRAFT__v0.N.json` with `compliance_flag=draft` |
| Form submitted | Rendered PDF + JSON uploaded, `compliance_flag=under_review` |
| Form approved / signed | Metadata updated: `compliance_flag=survey_ready`, `signed_by` populated, supersedes any prior draft |
| Form superseded | New version uploaded; prior version's `superseded_by_key` set; prior object **not** deleted |

### 5.4 Audit logging ↔ R2

Every R2 mutation (PUT, metadata update, soft-delete) emits an audit event:

```json
{
  "ts": "2026-04-22T14:30:15.234Z",
  "actor": "user_7f3a...",
  "actor_role": "qapi_lead",
  "action": "evidence.put",
  "env": "sbx",
  "bucket": "hh-sbx-evidence",
  "object_key": "sandbox/QA/QA-WF-04/<event_id>/pip-charter/QA__...__v1.0__...pdf",
  "event_id": "...",
  "workflow_id": "QA-WF-04",
  "policy_id": "QA-PG-001",
  "content_sha256": "...",
  "prev_sha256": null,
  "source_ip": "...",
  "user_agent": "...",
  "trace_id": "...",
  "prev_hash": "<hash of previous audit row>"
}
```

Audit rows are written both to the DB (`audit_log` table, already present per `server/sync/auditLog.ts`) **and** to `hh-<env>-audit` as NDJSON. At midnight UTC a daily digest is sealed: all rows for that day concatenated, gzipped, hash-chained to the prior day's digest, and uploaded to `hh-<env>-audit/daily-digest/YYYY-MM-DD.ndjson.gz`. The digest hash is posted to an external append-only log (future: AWS QLDB / blockchain anchor) for tamper evidence.

### 5.5 Dashboard ↔ R2

The dashboard **never reads R2 directly**. It reads the `evidence_objects` index, then requests presigned URLs via `/api/storage/presign` for any object the user is authorized to see. Rationale:

- Dashboard queries stay fast (SQL, not LIST).
- Access control applies before R2 is touched.
- All reads audited with the full context (event, workflow, policy).

---

## PART 6 — ACCESS CONTROL STRATEGY

### 6.1 Role matrix

| Role | Evidence R | Evidence W | Workflows R | Workflows W | Forms R | Forms W | Audit R | Audit W | Exports R | Exports W | Uploads W |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `brad` (authority) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌* | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `compliance_officer` | ✅ | ✅** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `qapi_lead` | ✅ (QA,GV) | ✅ (QA) | ✅ (QA) | ✅ (QA) | ✅ (QA,GV) | ✅ (QA) | ✅ (QA) | ❌ | ✅ (QA) | ✅ (QA) | ✅ |
| `clinical_mgr` | ✅ (CL,QA,RM) | ✅ (CL) | ✅ (CL) | ✅ (CL) | ✅ (CL) | ✅ (CL) | ✅ (own) | ❌ | ✅ (own) | ✅ (own) | ✅ |
| `hr_mgr` | ✅ (HR) | ✅ (HR) | ✅ (HR) | ✅ (HR) | ✅ (HR) | ✅ (HR) | ✅ (own) | ❌ | ✅ (own) | ✅ (own) | ✅ |
| `aide` / `nurse` | ❌ | ❌ | ❌ | ❌ | ✅ (own) | ✅ (drafts) | ❌ | ❌ | ❌ | ❌ | ✅ (own) |
| `auditor` (read-only) | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `system` (workflow runner) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Audit bucket is append-only for everyone; there is **no** delete or overwrite path, not even for Brad. Tamper = legal exposure.
\** Admin and compliance write to evidence via **promotion** only (workflows → evidence), never direct writes.

### 6.2 Enforcement points

1. **R2 IAM (coarse):** Each role gets its own R2 token with bucket-level scope. The `aide` role token cannot reach the `evidence` bucket at all.
2. **API gateway (fine):** Row-level domain filtering, PHI redaction, presign TTL enforcement. No client ever gets raw R2 credentials.
3. **DB row-level security:** `evidence_objects` queries are filtered by role + domain before any R2 presign is issued.

### 6.3 Sandbox vs production differences

| Control | Sandbox | Production |
|---|---|---|
| Delete on evidence bucket | Allowed for admin/compliance | Forbidden (Brad-only legal hold removal) |
| Presigned URL TTL | 24 hours | 15 minutes |
| Anonymous read | Never | Never |
| MFA for delete | Not required | Required |
| IP allow-list | Not required | Required for write roles |
| Credential rotation | Quarterly | Monthly |

---

## PART 7 — DELETION + SAFETY RULES

### 7.1 Sandbox rules

- **Hard delete allowed** for admin + compliance + brad roles.
- **Bulk reset allowed** via `scripts/resetSandbox.ts` (future): empties all `hh-sbx-*` buckets except `hh-sbx-audit` (audit is append-only even in sbx), then reseeds from `Builder/` seed data.
- **Every delete still writes an audit row.**
- Accidental-deletion guard: 7-day soft-delete window. `deleted_at` is set; actual object purge happens after 7 days via R2 lifecycle rule.

### 7.2 Production rules

- **No hard delete, ever**, on `evidence`, `workflows`, `forms`, or `audit` buckets.
- "Delete" means set `compliance_flag=superseded` + `deleted_at`, leave bytes in place. Object remains discoverable by auditors.
- **Retention-class enforcement** via R2 Object Lock–equivalent (WORM):
  - `evidence_10y` → immutable for 10 years from `created_at`.
  - `operational_7y` → immutable for 7 years.
  - `legal_hold` → immutable indefinitely until Brad + Compliance Officer jointly release.
- **Admin override** (purge before retention expiry) requires:
  1. Brad's signed authorization (stored as an object in `evidence/GV/.../approvals/`).
  2. Compliance Officer co-signature.
  3. Audit entry with the approval packet's object key.
  4. Legal review attestation.
- **Exports bucket** in prod: 90-day TTL retained (shorter than evidence; exports are derivatives).

### 7.3 Destructive-action circuit breakers

| Action | Sandbox | Production |
|---|---|---|
| Delete single object | `DELETE /api/storage/:key` | Returns 403 unless legal-hold release flow |
| Empty bucket | `POST /api/sandbox/reset` | Endpoint does not exist in prod build |
| Overwrite object at same key | Rejected (must version) | Rejected (must version) |
| Change retention class down | Rejected | Rejected except via Brad override |

---

## PART 8 — SANDBOX-SPECIFIC BEHAVIOR

### 8.1 Identification markers

Every sandbox object is identifiable by **four independent signals** (defense in depth):

1. **Bucket name** contains `-sbx-`.
2. **Key prefix** starts with `sandbox/`.
3. **Metadata** `x-amz-meta-env=sbx`.
4. **Rendered PDFs** carry a diagonal watermark `SANDBOX — NOT FOR SURVEY USE` applied by the forms engine when `env=sbx`.

If any one of these signals is missing, the upload is rejected. A production consumer that accidentally reads a sandbox object fails fast at the metadata check.

### 8.2 Preventing accidental production use

- **Separate credentials:** production R2 keys are never loaded in a sandbox build (`server/env.ts` reads `APP_ENV` and refuses to start if `APP_ENV=sandbox` but a `prd`-scoped key is present).
- **Bucket name allow-list:** the storage client is constructed with an explicit allow-list: `APP_ENV=sandbox` ⇒ only `hh-sbx-*` buckets are addressable.
- **Cross-env copy guard:** any attempt to `COPY` from `hh-sbx-*` to `hh-prd-*` (or vice versa) is blocked at the API layer; evidence cannot be "promoted" across environments, it must be regenerated.
- **DNS isolation:** sandbox API runs under `sbx.<app>.internal`; production under `app.<app>.internal`. Clients bake environment into the build.

### 8.3 Reset and reseed

```bash
npm run sandbox:reset        # empties hh-sbx-{evidence,workflows,forms,exports,uploads}
npm run sandbox:seed         # re-uploads seed fixtures from Builder/
npm run sandbox:reset-full   # also truncates evidence_objects index + resets audit (SANDBOX ONLY)
```

- `hh-sbx-audit` is optionally preserved across resets so reset history itself is auditable. A full-wipe flag is gated behind a typed confirmation prompt.
- Reset operations emit a single `sandbox.reset` audit event before + after, with a manifest of object counts deleted.
- Reseed uses fixtures from `Builder/Policies/Workflows/` and `Builder/Forns/` so every domain has baseline events for UI development.

---

## PART 9 — FILE TYPES

| Category | MIME types | Typical bucket | Versioning | Max size |
|---|---|---|---|---|
| **PDF documents** (packets, forms, minutes, attestations) | `application/pdf` | evidence, forms | yes | 50 MB |
| **JSON exports** (structured form data, manifests, workflow outputs) | `application/json` | workflows, forms, evidence | yes | 10 MB |
| **NDJSON** (audit streams, digests) | `application/x-ndjson`, `application/gzip` | audit | append-only | 500 MB/day |
| **CSV reports** (dashboard exports, quality indicators) | `text/csv` | exports | no (ephemeral) | 100 MB |
| **Logs** (workflow run logs, error traces) | `text/plain`, `application/x-ndjson` | workflows | yes | 50 MB |
| **Images** (photo evidence of wound care, aide observation, exercise AAR photos) | `image/png`, `image/jpeg`, `image/webp` | evidence | yes | 20 MB |
| **Signatures** (digital signature blobs, PAdES) | `application/pkcs7-signature`, `application/pdf` | evidence | yes | 1 MB |
| **Archives** (survey packets, export bundles) | `application/zip` | exports | no | 500 MB |
| **Calendar attachments** (ICS) | `text/calendar` | workflows | yes | 1 MB |
| **Spreadsheets** (budget packets, staffing matrices) | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | evidence | yes | 25 MB |

**Rejected at upload gateway:**
- Executables (`.exe`, `.dll`, `.sh`, `.bat`, `.ps1`), scripts (`.js`, `.py`) — defense in depth even though R2 doesn't execute.
- Office macro-enabled formats (`.docm`, `.xlsm`) — must be flattened to PDF first.
- Unknown MIME types — rejected; vocabulary is allow-list, not deny-list.
- Files that fail the upstream AV scan in the uploads bucket.

---

## PART 10 — FUTURE PRODUCTION STRATEGY

### 10.1 Retention policies (codified in bucket lifecycle rules)

| Retention class | Duration | Enforced by | Typical use |
|---|---|---|---|
| `transient_90d` | 90 days | R2 lifecycle expiration | Exports, dashboards snapshots |
| `operational_7y` | 7 years from `created_at` | Object Lock (compliance mode) | Workflow intermediates, forms drafts |
| `evidence_10y` | 10 years from `created_at` | Object Lock (compliance mode) | Final evidence, audit logs, signed packets |
| `permanent` | Indefinite | Object Lock + governance flag | Policy masters, board-approved charters |
| `legal_hold` | Indefinite until released | Legal hold flag | Litigation, survey dispute, investigation |

Ten-year baseline reflects the longest CMS record-retention expectation and state-law outliers. QAPI and governance documents default to `evidence_10y`; aide training records default to at least `operational_7y`; clinical records follow the longer of state law or 5 years post-discharge, implemented as `evidence_10y` for safety.

### 10.2 Version history

- Bucket-level R2 versioning enabled on `evidence`, `workflows`, `forms`, `audit`.
- Every mutation creates a new object; prior versions stay addressable via version-id.
- The `evidence_objects` table tracks the version chain via `supersedes_key` / `superseded_by_key`.
- Version labels (`v1.0`, `v2.1`) are authored, not automatic — they encode intent. Storage version-ids are the low-level safety net.

### 10.3 Immutable records

- Object Lock compliance mode on `hh-prd-evidence` and `hh-prd-audit` — no one (including root) can delete within retention.
- Audit digests hash-chained daily; the head hash is externally anchored (Cloudflare Logpush to a WORM destination + optional cross-cloud copy).
- Manifests (`manifest.json` per event folder) are signed and themselves retention-locked.

### 10.4 Audit compliance requirements

- **42 CFR § 484.110** (clinical records retention) — satisfied by `evidence_10y`.
- **HIPAA 45 CFR § 164.316(b)(2)(i)** (6-year retention) — satisfied.
- **State survey readiness** — prefix-list a single event folder = complete evidence bundle.
- **Tamper evidence** — content SHA-256 on upload, verified on read; any mismatch triggers `compliance_flag=integrity_failure` and Brad notification.
- **Chain of custody** — every read, write, and presign recorded; exports carry a provenance file.

---

## PART 11 — DASHBOARD + AUDIT LINKAGE

### 11.1 How files surface in dashboards

The dashboard's "Regulatory Execution Center" (per `RegulatoryPlannerOverview.txt`) renders event cards. Each card queries:

```sql
SELECT artifact_kind, form_id, version, compliance_flag, created_at, object_key
FROM evidence_objects
WHERE event_id = :event_id
ORDER BY artifact_kind, version DESC;
```

Each row becomes a badge on the card:
- Green `survey_ready` — packet is complete.
- Yellow `under_review` — pending approval.
- Gray `draft` — in progress.
- Red `corrective_action_required` — flagged issue.
- Red-outlined `missing` — computed from the workflow's required-artifact list minus present rows.

### 11.2 Linkage to workflows

Each event card links upward to its workflow via `workflow_id`, and downward to policies via `policy_id`. The "policy view" pane lists:

```
policy_id  →  workflows[]  →  events[]  →  evidence_objects[]
```

Surveyors can start at any node and walk to any other.

### 11.3 Retrieval during audits

A single API endpoint produces the survey packet:

```
GET /api/audit/packet?event_id=<uuid>&format=zip
```

It performs:

1. `SELECT * FROM evidence_objects WHERE event_id=?`.
2. Fetches each object from R2, verifies `content_sha256`.
3. Builds a zip: `manifest.json`, all artifacts, chain-of-custody trail (audit rows for this event).
4. Signs the zip with the agency key.
5. Uploads to `hh-<env>-exports/by-event/<event_id>/survey-packet__<ts>.zip`.
6. Returns a 15-min presigned URL (prod) or 24-hr (sbx).

A surveyor receives one link, one hash, one packet. Everything traces back to `(policy_id, workflow_id, event_id)`.

---

## 12. OUTPUT SUMMARY

### 12.1 R2 architecture at a glance

```
┌─────────────────── CLIENT (Dashboard / Forms UI) ────────────────────┐
│                          No direct R2 access                         │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ presigned URLs, signed API
┌───────────────────────────────▼──────────────────────────────────────┐
│                        APP API (server/)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │
│  │ /api/storage │  │ /api/forms   │  │ /api/audit   │  │ workflow│  │
│  │  /presign    │  │              │  │              │  │ engine  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬────┘  │
│         │                 │                 │               │        │
│         └────────┬────────┴────────┬────────┴───────┬───────┘        │
│                  ▼                 ▼                ▼                │
│         ┌──────────────────────────────────────────────────┐         │
│         │   evidence_objects index (SQLite/Postgres)       │         │
│         └─────────────────────────┬────────────────────────┘         │
└───────────────────────────────────┼──────────────────────────────────┘
                                    │ atomic upload + metadata
┌───────────────────────────────────▼──────────────────────────────────┐
│                         CLOUDFLARE R2                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ hh-sbx-      │  │ hh-sbx-      │  │ hh-sbx-      │  (sandbox)     │
│  │  evidence    │  │  workflows   │  │  forms       │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ hh-sbx-audit │  │ hh-sbx-      │  │ hh-sbx-      │                │
│  │  (WORM)      │  │  exports     │  │  uploads     │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ hh-prd-      │  │ hh-prd-      │  │ hh-prd-      │  (production)  │
│  │  evidence    │  │  workflows   │  │  forms       │                │
│  │  (Obj Lock)  │  │  (Obj Lock)  │  │  (Obj Lock)  │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ hh-prd-audit │  │ hh-prd-      │  │ hh-prd-      │                │
│  │  (WORM)      │  │  exports     │  │  uploads     │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
└──────────────────────────────────────────────────────────────────────┘
```

### 12.2 Integration flow (create-to-survey)

1. Workflow trigger fires (time-based or event-based; see `server/sync/eventSync.ts`).
2. Workflow engine creates `event_id` (or reuses Google Calendar-synced one) and opens `workflows/<domain>/<wf>/<event_id>/runs/<run_id>/`.
3. Each step's output lands in `workflows/.../intermediate/` with full metadata.
4. Forms engine renders required forms (from `QA-FM-001`, `GV-FM-005`, etc.) into `forms/<domain>/<form_id>/<event_id>/` as drafts.
5. User/approver reviews → signs → `compliance_flag=survey_ready`.
6. Workflow finalization copies final artifacts into `evidence/<domain>/<wf>/<event_id>/`, writes `manifest.json`, closes the event.
7. Audit log writes every mutation; daily digest sealed to `hh-<env>-audit/daily-digest/`.
8. Dashboard surfaces the event card; surveyor export yields a single signed zip.

### 12.3 Sandbox vs production in one table

| Dimension | Sandbox (`hh-sbx-*`) | Production (`hh-prd-*`) |
|---|---|---|
| Creds | Per-environment, quarterly rotation | Per-environment, monthly rotation, MFA |
| Delete | Allowed (soft 7-day) | Forbidden except Brad-signed override |
| Reset | Nightly allowed | Endpoint does not exist |
| Retention | Advisory | Object Lock enforced |
| Presign TTL | 24 hours | 15 minutes |
| Watermark | `SANDBOX — NOT FOR SURVEY USE` | None |
| Audit tamper evidence | DB only | DB + hash-chained digest + external anchor |
| Cross-env copy | Blocked | Blocked |

---

## 13. IMPLEMENTATION CHECKLIST (SANDBOX)

- [ ] Provision six sandbox buckets with the exact names above.
- [ ] Generate sandbox R2 tokens; store in `server/env.ts` behind `APP_ENV=sandbox` gate.
- [ ] Add `server/storage/r2Client.ts` with bucket allow-list + env check.
- [ ] Create `evidence_objects` table + migration.
- [ ] Add `/api/storage/presign`, `/api/storage/put`, `/api/storage/get` routes with role + domain enforcement.
- [ ] Extend `server/sync/auditLog.ts` to emit the mutation events from §5.4.
- [ ] Add daily digest sealer as a cron.
- [ ] Wire workflow engine to write into `workflows/` at step boundaries.
- [ ] Wire forms engine to write into `forms/` with draft/final lifecycle.
- [ ] Add sandbox reset + reseed scripts under `scripts/`.
- [ ] Add upload validator: metadata presence, `env` match, sha256 verification, MIME allow-list, AV scan hook.
- [ ] Add dashboard query + survey-packet export endpoint per §11.
- [ ] Document `APP_ENV=production` rollout plan with Object Lock + cred rotation + cross-env guard.

---

## 14. FINAL RULE (restated)

> **If a file cannot be traced back to a workflow, event, and policy, the upload is rejected.**

The gateway enforces this on every PUT by validating that `x-amz-meta-workflow-id`, `x-amz-meta-event-id`, and `x-amz-meta-policy-id` are all present, resolve to existing registry entries, and that the `event_id` exists in the events table. Anything else never reaches R2.

This guarantees survey readiness, audit traceability, and workflow-level evidence — the three non-negotiable outputs of this design.
