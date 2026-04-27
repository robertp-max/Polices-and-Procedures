-- ═══════════════════════════════════════════════════════════════
-- 002 — Policy Lifecycle Schema
-- Adds the canonical 5-state lifecycle envelope alongside the
-- existing policy tables. No "Deprecated" state exists.
--
-- States: DRAFT | REVIEW | APPROVED | PUBLISHED | ARCHIVED
--
-- Mirrors src/policy/lifecycle/types.ts. The client-side Zustand
-- store is the source of truth in development; this schema is the
-- target for the persistence layer.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- Lifecycle states (controlled vocabulary, no Deprecated entry).
CREATE TABLE IF NOT EXISTS policy_lifecycle_states (
  state TEXT PRIMARY KEY
);
INSERT INTO policy_lifecycle_states (state) VALUES
  ('DRAFT'),
  ('REVIEW'),
  ('APPROVED'),
  ('PUBLISHED'),
  ('ARCHIVED')
ON CONFLICT (state) DO NOTHING;

-- One envelope per logical Policy id.
CREATE TABLE IF NOT EXISTS policy_lifecycle_envelopes (
  policy_id            TEXT PRIMARY KEY,
  state                TEXT NOT NULL REFERENCES policy_lifecycle_states (state),
  created_by_user_id   TEXT NOT NULL,
  created_by_name      TEXT NOT NULL,
  created_by_email     TEXT NOT NULL,
  created_by_role      TEXT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_policy_lifecycle_envelopes_state
  ON policy_lifecycle_envelopes (state);

-- Append-only history with a hash chain per policy.
CREATE TABLE IF NOT EXISTS policy_lifecycle_history (
  id              TEXT PRIMARY KEY,
  policy_id       TEXT NOT NULL REFERENCES policy_lifecycle_envelopes (policy_id) ON DELETE CASCADE,
  from_state      TEXT REFERENCES policy_lifecycle_states (state),
  to_state        TEXT NOT NULL REFERENCES policy_lifecycle_states (state),
  intent          TEXT NOT NULL,
  actor_user_id   TEXT NOT NULL,
  actor_name      TEXT NOT NULL,
  actor_email     TEXT NOT NULL,
  actor_role      TEXT NOT NULL,
  rationale       TEXT NOT NULL DEFAULT '',
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  chain_hash      TEXT NOT NULL,
  signature_ref   TEXT
);

CREATE INDEX IF NOT EXISTS ix_policy_lifecycle_history_policy_ts
  ON policy_lifecycle_history (policy_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS ix_policy_lifecycle_history_chain
  ON policy_lifecycle_history (policy_id, chain_hash);

-- Enforce that exactly one envelope row per policy id is non-archived
-- without conflict (single-row PK already handles uniqueness; the
-- partial index makes "active vs archived" lookups cheap).
CREATE INDEX IF NOT EXISTS ix_policy_lifecycle_envelopes_active
  ON policy_lifecycle_envelopes (policy_id) WHERE state <> 'ARCHIVED';

-- Update updated_at on every state change.
CREATE OR REPLACE FUNCTION trg_policy_lifecycle_envelopes_touch()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS policy_lifecycle_envelopes_touch
  ON policy_lifecycle_envelopes;
CREATE TRIGGER policy_lifecycle_envelopes_touch
  BEFORE UPDATE ON policy_lifecycle_envelopes
  FOR EACH ROW EXECUTE PROCEDURE trg_policy_lifecycle_envelopes_touch();

COMMIT;
