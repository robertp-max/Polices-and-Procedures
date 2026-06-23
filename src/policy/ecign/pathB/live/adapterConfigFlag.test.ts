/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2-live A tests (REQUIRED GREEN).
 * Feature flag + sandbox config + gated selector. Default = fake (no external
 * effects); live requires Gate-B readiness and is intentionally not implemented
 * in subphase A. No secrets retained. Run via tsx --test.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ArtifactVersionId } from '../ids';
import {
  SANDBOX_ENV,
  SANDBOX_LABEL,
  redactConfig,
  resolveSandboxConfig,
  type SandboxConfig,
} from './sandboxConfig';
import { assessLiveReadiness } from './liveReadiness';
import {
  LiveAdapterNotImplementedError,
  LiveSandboxNotReadyError,
  selectReplicaPublisher,
} from './replicaSelector';

const readyEnv = {
  [SANDBOX_ENV.enable]: '1',
  [SANDBOX_ENV.driveFolder]: 'SANDBOX_FOLDER_TRAINING_1',
  [SANDBOX_ENV.credentials]: '/secure/path/creds.json',
};

describe('Phase 2-live A — sandbox config (default off, no secrets)', () => {
  it('empty env → disabled, fake mode, no credential, no folder', () => {
    const cfg = resolveSandboxConfig({});
    assert.equal(cfg.mode, 'fake');
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.credentialConfigured, false);
    assert.equal(cfg.sandboxDriveFolderId, undefined);
    assert.equal(cfg.label, SANDBOX_LABEL);
  });

  it('enable flag flips mode to live-sandbox; credential stored as presence only', () => {
    const cfg = resolveSandboxConfig(readyEnv);
    assert.equal(cfg.mode, 'live-sandbox');
    assert.equal(cfg.enabled, true);
    assert.equal(cfg.credentialConfigured, true);
    assert.equal(cfg.sandboxDriveFolderId, 'SANDBOX_FOLDER_TRAINING_1');
    // the credential VALUE must never appear anywhere on the config
    assert.equal(JSON.stringify(cfg).includes('/secure/path/creds.json'), false);
  });

  it('redactConfig emits booleans/mode only — no secret material', () => {
    const r = redactConfig(resolveSandboxConfig(readyEnv));
    assert.equal(JSON.stringify(r).includes('/secure/path/creds.json'), false);
    assert.equal(r.credentialConfigured, true);
    assert.equal(r.sandboxDriveFolderConfigured, true);
  });
});

describe('Phase 2-live A — live readiness gate (Gate B)', () => {
  it('disabled config is not ready', () => {
    assert.deepEqual(assessLiveReadiness(resolveSandboxConfig({})).issues.includes('sandbox_disabled'), true);
  });
  it('enabled but missing folder/credentials is not ready', () => {
    const noFolder = assessLiveReadiness(resolveSandboxConfig({ [SANDBOX_ENV.enable]: '1', [SANDBOX_ENV.credentials]: 'x' }));
    assert.equal(noFolder.ready, false);
    assert.ok(noFolder.issues.includes('missing_sandbox_folder'));
    const noCred = assessLiveReadiness(resolveSandboxConfig({ [SANDBOX_ENV.enable]: '1', [SANDBOX_ENV.driveFolder]: 'f' }));
    assert.ok(noCred.issues.includes('missing_credentials'));
  });
  it('fully configured live sandbox is ready', () => {
    assert.equal(assessLiveReadiness(resolveSandboxConfig(readyEnv)).ready, true);
  });
});

describe('Phase 2-live A — gated selector (fake default, live not wired)', () => {
  it('default (fake) returns a functional fake publisher', () => {
    const pub = selectReplicaPublisher('drive', resolveSandboxConfig({}));
    const v = 'AVS-1' as ArtifactVersionId;
    const res = pub.publish(v, new TextEncoder().encode('%PDF-1.7\nx'));
    assert.equal(res.replicaKind, 'drive');
    assert.equal(pub.exists(v), true);
  });

  it('live mode that is NOT ready throws LiveSandboxNotReadyError with issues', () => {
    const cfg: SandboxConfig = resolveSandboxConfig({ [SANDBOX_ENV.enable]: '1' });
    assert.throws(
      () => selectReplicaPublisher('drive', cfg),
      (e: unknown) => e instanceof LiveSandboxNotReadyError && e.issues.length > 0,
    );
  });

  it('live mode that IS ready still throws LiveAdapterNotImplementedError (no Google wiring in subphase A)', () => {
    const cfg = resolveSandboxConfig(readyEnv);
    for (const kind of ['drive', 'evidence_center'] as const) {
      assert.throws(
        () => selectReplicaPublisher(kind, cfg),
        (e: unknown) => e instanceof LiveAdapterNotImplementedError,
      );
    }
  });
});
