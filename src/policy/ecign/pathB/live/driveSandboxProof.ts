/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2-live B: MANUAL sandbox upload proof (NOT a test).
 *
 * Explicit, manually-run, sandbox-only. Uploads exactly ONE synthetic TRAINING
 * artifact to the approved sandbox Drive folder and verifies sha256 parity.
 * NEVER deletes, NEVER writes Evidence Center records, NEVER sets public links,
 * NEVER commits output. Refuses to run unless ALL gates are explicitly set:
 *   ECIGN_LIVE_SANDBOX=1, ECIGN_RUN_LIVE_PROOF=1,
 *   ECIGN_SANDBOX_DRIVE_FOLDER_ID set, GOOGLE_APPLICATION_CREDENTIALS set.
 *
 * Run manually:  npx tsx src/policy/ecign/pathB/live/driveSandboxProof.ts
 */
import type { ArtifactVersionId, IsoTimestamp } from '../ids';
import { resolveSandboxConfig } from './sandboxConfig';
import { assessLiveReadiness } from './liveReadiness';
import {
  DriveSandboxPublisher,
  buildSandboxUploadResult,
  publishAndVerifyAsync,
} from './driveSandboxPublisher';
import { sha256Hex } from '../storage/hash';
import { createLiveDriveClient } from './liveDriveClient';

export async function runDriveSandboxProof(env: NodeJS.ProcessEnv): Promise<number> {
  const cfg = resolveSandboxConfig(env);
  const readiness = assessLiveReadiness(cfg);
  const optedIn = env.ECIGN_RUN_LIVE_PROOF === '1';

  if (!optedIn || cfg.mode !== 'live-sandbox' || !readiness.ready || cfg.sandboxDriveFolderId === undefined) {
    console.log(
      '[ecign sandbox proof] NOT configured — skipping (no upload). ' +
        `optedIn=${optedIn} mode=${cfg.mode} ready=${readiness.ready} issues=${readiness.issues.join('|') || 'none'}`,
    );
    return 0;
  }

  // Synthetic, non-PHI TRAINING payload — a tiny valid-magic PDF byte fixture.
  const bytes = new TextEncoder().encode('%PDF-1.7\nTRAINING SANDBOX eCIgn Path B — synthetic, non-PHI.\n%%EOF\n');
  const versionId = 'TRAINING-SANDBOX-PROOF-AVS-1' as ArtifactVersionId;
  const canonicalSha256 = sha256Hex(bytes);
  const uploadedAt = new Date().toISOString() as IsoTimestamp;

  const publisher = new DriveSandboxPublisher({
    client: createLiveDriveClient({ credentialPath: env.GOOGLE_APPLICATION_CREDENTIALS }),
    sandboxFolderId: cfg.sandboxDriveFolderId,
  });

  const parity = await publishAndVerifyAsync(publisher, { versionId, canonicalSha256, bytes, verifiedAt: uploadedAt });
  const result = buildSandboxUploadResult({ publisher, versionId, bytes, sandboxFolderId: cfg.sandboxDriveFolderId, uploadedAt, parity });

  console.log('[ecign sandbox proof] upload result:', JSON.stringify({
    artifactVersionId: result.artifactVersionId,
    driveFileId: result.driveFileId,
    webViewLink: result.webViewLink,
    sandboxFolderId: result.sandboxFolderId,
    sha256: result.sha256,
    byteLength: result.byteLength,
    label: result.label,
    parityStatus: result.parityStatus,
  }, null, 2));

  if (result.parityStatus !== 'verified') {
    console.error('[ecign sandbox proof] PARITY NOT VERIFIED — failure/mismatch.');
    return 1;
  }
  console.log('[ecign sandbox proof] sha256 parity VERIFIED (no delete, no Evidence record, no public link).');
  return 0;
}

// Manual entry: only acts when explicitly opted in via env (no side effects on import).
if (process.env.ECIGN_RUN_LIVE_PROOF === '1') {
  runDriveSandboxProof(process.env)
    .then((code) => { process.exitCode = code; })
    .catch((err) => { console.error('[ecign sandbox proof] error:', err instanceof Error ? err.message : String(err)); process.exitCode = 1; });
}
