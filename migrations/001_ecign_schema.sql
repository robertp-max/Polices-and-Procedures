-- ============================================================================
-- 001_ecign_schema.sql
-- eCIgn canonical schema. Production deployment must apply this and revoke
-- UPDATE/DELETE on every table marked APPEND-ONLY at the role level.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS ecign;

-- ── document_versions  (immutable) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ecign.document_versions (
  version_id          TEXT        PRIMARY KEY,
  form_id             TEXT        NOT NULL,
  semver              TEXT        NOT NULL,
  effective_at_utc    TIMESTAMPTZ NOT NULL,
  next_review_utc     TIMESTAMPTZ NOT NULL,
  governing_policies  TEXT[]      NOT NULL DEFAULT '{}',
  canonical_bytes     INTEGER     NOT NULL,
  hash_sha256         TEXT        NOT NULL,
  template_snapshot   TEXT        NOT NULL,
  created_at_utc      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (form_id, semver)
);

-- ── consents  (APPEND-ONLY) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ecign.consents (
  consent_id            TEXT        PRIMARY KEY,
  user_id               TEXT        NOT NULL,
  disclosure_version    TEXT        NOT NULL,
  disclosure_text_hash  TEXT        NOT NULL,
  accepted_at_utc       TIMESTAMPTZ NOT NULL,
  ip                    TEXT        NOT NULL,
  user_agent            TEXT        NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_consents_user_disclosure
  ON ecign.consents (user_id, disclosure_version, accepted_at_utc DESC);

-- ── form_instances  (mutable until signed_locked, then frozen) ──────────────
CREATE TABLE IF NOT EXISTS ecign.form_instances (
  instance_id          TEXT        PRIMARY KEY,
  form_id              TEXT        NOT NULL,
  document_version_id  TEXT        NOT NULL REFERENCES ecign.document_versions(version_id),
  state                TEXT        NOT NULL CHECK (state IN
    ('created','disclosed','verified','reviewed','attested','signed_locked','voided','expired')),
  required_signers     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  field_values         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  workflow_instance_id TEXT,
  event_id             TEXT,
  retention_until_utc  TIMESTAMPTZ,
  document_hash        TEXT,
  manifest_hash        TEXT,
  locked_at_utc        TIMESTAMPTZ,
  created_at_utc       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_form_instances_state ON ecign.form_instances (state);

-- ── signatures  (APPEND-ONLY) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ecign.signatures (
  signature_id     TEXT        PRIMARY KEY,
  instance_id      TEXT        NOT NULL REFERENCES ecign.form_instances(instance_id),
  field_id         TEXT        NOT NULL,
  signer_user_id   TEXT        NOT NULL,
  signer_name      TEXT        NOT NULL,
  signer_role      TEXT        NOT NULL,
  signer_email     TEXT        NOT NULL,
  signed_at_utc    TIMESTAMPTZ NOT NULL,
  signature_png    TEXT        NOT NULL,
  signature_hash   TEXT        NOT NULL,
  attestation_text_hash TEXT   NOT NULL,
  UNIQUE (instance_id, signer_user_id, field_id)
);

-- ── audit_events  (APPEND-ONLY, hash-chained) ───────────────────────────────
CREATE TABLE IF NOT EXISTS ecign.audit_events (
  event_id        TEXT        PRIMARY KEY,
  prev_hash       TEXT        NOT NULL,
  hash            TEXT        NOT NULL UNIQUE,
  occurred_at_utc TIMESTAMPTZ NOT NULL,
  actor           JSONB       NOT NULL,
  network         JSONB       NOT NULL,
  subject         JSONB       NOT NULL,
  action          TEXT        NOT NULL,
  payload         JSONB       NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_subject ON ecign.audit_events ((subject->>'id'));
CREATE INDEX IF NOT EXISTS idx_audit_occurred ON ecign.audit_events (occurred_at_utc);

-- ── compliance_states  (versioned rows, APPEND-ONLY) ────────────────────────
CREATE TABLE IF NOT EXISTS ecign.compliance_states (
  transition_id     TEXT        PRIMARY KEY,
  object_kind       TEXT        NOT NULL,
  object_id         TEXT        NOT NULL,
  state_before      TEXT        NOT NULL,
  state_after       TEXT        NOT NULL,
  trigger_signature TEXT,
  governing         JSONB       NOT NULL,
  dependencies      JSONB       NOT NULL,
  occurred_at_utc   TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_compliance_object
  ON ecign.compliance_states (object_kind, object_id, occurred_at_utc DESC);

-- ── Append-only enforcement ─────────────────────────────────────────────────
-- Run as superuser after creating an `app_rw` role:
--   REVOKE UPDATE, DELETE ON ecign.consents       FROM app_rw;
--   REVOKE UPDATE, DELETE ON ecign.signatures     FROM app_rw;
--   REVOKE UPDATE, DELETE ON ecign.audit_events   FROM app_rw;
--   REVOKE UPDATE, DELETE ON ecign.compliance_states FROM app_rw;
--   REVOKE UPDATE, DELETE ON ecign.document_versions FROM app_rw;
-- form_instances UPDATE is permitted ONLY where state != 'signed_locked' via a
-- BEFORE UPDATE trigger:
CREATE OR REPLACE FUNCTION ecign.block_locked_update() RETURNS trigger AS $$
BEGIN
  IF OLD.state = 'signed_locked' AND NEW.state = 'signed_locked' THEN
    RAISE EXCEPTION 'DOCUMENT_LOCKED' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS form_instance_lock ON ecign.form_instances;
CREATE TRIGGER form_instance_lock
  BEFORE UPDATE ON ecign.form_instances
  FOR EACH ROW EXECUTE FUNCTION ecign.block_locked_update();
