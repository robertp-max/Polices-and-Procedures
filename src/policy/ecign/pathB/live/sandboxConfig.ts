/**
 * eCIgn Path B — Phase 2-live A: sandbox config + feature flag (NO live calls).
 *
 * Pure config model + resolver. NO Google client, NO network, NO `process.env`
 * coupling (env is INJECTED → deterministic/testable), and NO secret values are
 * retained (only presence booleans). Default = DISABLED → fake adapter. A live
 * sandbox is opt-in and gated (see liveReadiness / replicaSelector); subphase A
 * performs no external effects.
 */
export type ReplicaMode = 'fake' | 'live-sandbox';

/** Env var NAMES only — values are never embedded here. */
export const SANDBOX_ENV = {
  enable: 'ECIGN_LIVE_SANDBOX',
  driveFolder: 'ECIGN_SANDBOX_DRIVE_FOLDER_ID',
  credentials: 'GOOGLE_APPLICATION_CREDENTIALS',
} as const;

/** Mandatory label for every sandbox artifact/record. */
export const SANDBOX_LABEL = 'TRAINING' as const;

export interface SandboxConfig {
  readonly mode: ReplicaMode;
  readonly enabled: boolean;
  /** Sandbox Drive folder id (NOT a secret). Undefined when unset. */
  readonly sandboxDriveFolderId?: string;
  /** Presence only — the credential value/path is NEVER stored here. */
  readonly credentialConfigured: boolean;
  readonly label: typeof SANDBOX_LABEL;
}

type Env = Readonly<Record<string, string | undefined>>;

/**
 * Resolve config from an INJECTED env map. Live sandbox is enabled only by an
 * explicit `ECIGN_LIVE_SANDBOX=1`. Defaults to disabled → fake. Never retains
 * the credential value (only whether one is configured).
 */
export function resolveSandboxConfig(env: Env): SandboxConfig {
  const enabled = env[SANDBOX_ENV.enable] === '1';
  const folderRaw = env[SANDBOX_ENV.driveFolder];
  const sandboxDriveFolderId = folderRaw && folderRaw.trim().length > 0 ? folderRaw.trim() : undefined;
  const credRaw = env[SANDBOX_ENV.credentials];
  const credentialConfigured = typeof credRaw === 'string' && credRaw.trim().length > 0;
  return {
    mode: enabled ? 'live-sandbox' : 'fake',
    enabled,
    sandboxDriveFolderId,
    credentialConfigured,
    label: SANDBOX_LABEL,
  };
}

/** Safe-to-log summary: booleans + mode only; no secret material. */
export function redactConfig(cfg: SandboxConfig): Readonly<Record<string, string | boolean>> {
  return {
    mode: cfg.mode,
    enabled: cfg.enabled,
    sandboxDriveFolderConfigured: cfg.sandboxDriveFolderId !== undefined,
    credentialConfigured: cfg.credentialConfigured,
    label: cfg.label,
  };
}
