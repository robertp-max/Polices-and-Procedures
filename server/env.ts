import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/* ═══════════════════════════════════════════════════════════════
   Env loader — single source of truth for server configuration.
   Loads `.env` from repo root. Soft-fails optional integrations so
   each subsystem (Calendar, Compliance Intelligence) can start
   independently during local development.
   ═══════════════════════════════════════════════════════════════ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(repoRoot, '.env') });

// Resolve the Google service-account path but don't hard-fail at boot.
// The calendar router will return a typed auth error if the file is
// absent, which lets the Compliance Intelligence (IA) surface run
// without Google credentials present on developer machines.
const credPathRaw =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  './server/credentials/service-account.json';
const credPath = path.isAbsolute(credPathRaw)
  ? credPathRaw
  : path.resolve(repoRoot, credPathRaw);

const calendarCredentialsPresent = fs.existsSync(credPath);
if (!calendarCredentialsPresent) {
  console.warn(
    `[env] Google service-account JSON not found at: ${credPath}\n` +
    `      Calendar routes will return auth errors until this file is\n` +
    `      provided. Compliance Intelligence (IA) does not require it.`,
  );
}

// Resolve an absolute path for the local IA index cache.
const iaIndexRaw = process.env.IA_INDEX_ROOT ?? '.cache/ia-index';
const iaIndexRoot = path.isAbsolute(iaIndexRaw)
  ? iaIndexRaw
  : path.resolve(repoRoot, iaIndexRaw);

/** ───── Google Drive Evidence — LOCKED canonical identity ───────────────────
 * Pinned to protect the evidence pipeline from accidental config drift (a wrong
 * service-account key, a different shared drive, or a mistyped provider). These
 * values are the single source of truth; `assertDriveEvidenceLock()` verifies the
 * live config matches them at boot and FAILS CLOSED on any mismatch. To change a
 * value, edit it HERE in a reviewed code change — not via an ad-hoc env var. */
export const DRIVE_EVIDENCE_LOCK = {
  serviceAccountEmail: 'careindeed-drive-evidence@orbital-stage-443721-v1.iam.gserviceaccount.com',
  projectId: 'orbital-stage-443721-v1',
  sharedDriveId: '0AMhwVb2RmU-fUk9PVA',
  storageProvider: 'google_drive_calendar',
  /** Canonical "Event Packets" folder — the active packet destination. */
  packetFolderId: '1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0',
} as const;

export const env = {
  port: Number(process.env.PORT ?? 8787),
  /** Calendar — optional at boot. */
  calendarId: process.env.GOOGLE_CALENDAR_ID ?? '',
  calendarCredentialsPresent,
  credentialsPath: credPath,
  timezone: process.env.DEFAULT_TIMEZONE ?? 'America/Los_Angeles',

  /** ───── Google Drive Evidence Attachment ─────────────────────
   * Extends the Calendar integration. Reuses the SAME service-account
   * key (credentialsPath above) — no second Google auth path. Drive
   * stores files; Calendar attaches/indexes them. */
  // Provider is PINNED to the canonical value — a mistyped env var can no longer
  // change it (the whole evidence pipeline asserts this exact string).
  evidenceStorageProvider: DRIVE_EVIDENCE_LOCK.storageProvider,
  calendarEvidenceEnabled: (process.env.GOOGLE_CALENDAR_EVIDENCE_ENABLED ?? 'true').toLowerCase() === 'true',
  driveEvidenceSharedDriveId: process.env.GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID ?? DRIVE_EVIDENCE_LOCK.sharedDriveId,
  driveEvidenceRootFolderId:
    process.env.GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID
    ?? process.env.GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID
    ?? DRIVE_EVIDENCE_LOCK.sharedDriveId,
  /** TEMP override: when set, ALL generated packets are saved to this single
   *  Drive folder (for easy cleanup during testing). Unset to restore the normal
   *  per-event / admission folder structure. The service account must have write
   *  access to this folder. */
  packetOverrideFolderId: process.env.GOOGLE_DRIVE_PACKET_FOLDER_ID ?? '',
  /** Resolved packet destination: configured value or the locked canonical
   *  Event Packets folder. Externalizes the previously hardcoded id WITHOUT
   *  changing the runtime value. */
  get drivePacketFolderId(): string {
    return this.packetOverrideFolderId || DRIVE_EVIDENCE_LOCK.packetFolderId;
  },

  /** ───── Drive authentication mode (DRIVE ONLY — Calendar unaffected) ─────
   * 'key_file'      → LOCAL DEVELOPMENT ONLY: the existing external JSON key
   *                   referenced by GOOGLE_APPLICATION_CREDENTIALS (default,
   *                   preserves current local behavior).
   * 'impersonation' → production/Cloud Run: keyless — ADC of the runtime
   *                   identity impersonates ONLY the locked Drive service
   *                   account. Validated fail-closed in googleDriveAuth.ts
   *                   and assertDriveEvidenceLock(). */
  driveAuthMode: process.env.GOOGLE_DRIVE_AUTH_MODE ?? '',
  driveImpersonateServiceAccount: process.env.GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT ?? '',
  // 01_CES is LOCKED — no writes land there until a readiness date is provided.
  // All packets go to the Event Packets folder instead. To unlock, set
  // DRIVE_01_CES_READINESS_DATE to an ISO date (YYYY-MM-DD); 01_CES then opens
  // on/after that date. Empty = locked indefinitely (default, until production).
  drive01CesReadinessDate: process.env.DRIVE_01_CES_READINESS_DATE ?? '',
  get drive01CesLocked(): boolean {
    const d = this.drive01CesReadinessDate?.trim();
    if (!d) return true; // no readiness date → locked
    const ready = new Date(d);
    return Number.isNaN(ready.getTime()) ? true : new Date() < ready;
  },
  // Local CSV fallback for the Drive manifest so the Evidence DRIVE tab lists
  // the real folders even when live Google Drive isn't reachable (local dev).
  // Defaults to the bundled export; override with an absolute path if needed.
  manifestLocalCsv: (() => {
    const raw = process.env.DRIVE_MANIFEST_LOCAL_CSV ?? 'server/data/drive-manifest.csv';
    return path.isAbsolute(raw) ? raw : path.resolve(repoRoot, raw);
  })(),
  // Folder INDEX (one row per folder, with a real Folder ID even for container
  // folders) — exported from the spreadsheet's "Evidence Manifest Queue" sheet.
  // Preferred source for the DRIVE-tab root folder grid so every card deep-links.
  manifestLocalFolderIndex: (() => {
    const raw = process.env.DRIVE_MANIFEST_FOLDER_INDEX ?? 'server/data/drive-folder-index.csv';
    return path.isAbsolute(raw) ? raw : path.resolve(repoRoot, raw);
  })(),

  /** ───── CES metadata backend (NON-PHI metadata; NO file bytes) ─────
   * `file_local` (default) writes to .cache/ces-metadata for local/dev so the
   * backend is testable without AWS. `dynamodb_metadata` uses DynamoDB in
   * deployed environments. There is NO localStorage provider for CES. */
  cesMetadataProvider: (process.env.CES_METADATA_PROVIDER ?? 'file_local') as 'file_local' | 'dynamodb_metadata',
  cesMetadataTableName: process.env.CES_METADATA_TABLE_NAME ?? '',
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
  apiSharedSecret: process.env.API_SHARED_SECRET ?? '',
  logLevel: (process.env.LOG_LEVEL ?? 'info') as 'debug' | 'info' | 'warn' | 'error',
  repoRoot,

  /** ───── Compliance Intelligence (IA) ─────────────────────── */
  iaIndexRoot,
  iaCorpusRoot: process.env.IA_CORPUS_ROOT
    ? (path.isAbsolute(process.env.IA_CORPUS_ROOT)
        ? process.env.IA_CORPUS_ROOT
        : path.resolve(repoRoot, process.env.IA_CORPUS_ROOT))
    : repoRoot,
  iaRequireEmbeddings: (process.env.IA_REQUIRE_EMBEDDINGS ?? 'false').toLowerCase() === 'true',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434',
  ollamaChatModel: process.env.OLLAMA_CHAT_MODEL ?? 'llama3.1:8b-instruct-q4_K_M',
  ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  ollamaTimeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS ?? 60_000),

  /** ───── Hubstaff Integration ──────────────────────────── */
  hubstaffPat: process.env.HUBSTAFF_PAT ?? '',
  hubstaffOrgId: process.env.HUBSTAFF_ORG_ID ?? '',

  /** ───── Demo Auth (Cognito/SES/DynamoDB) ───────────────── */
  awsRegion: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? '',
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:5173',
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
  cognitoClientId: process.env.COGNITO_CLIENT_ID ?? '',
  fromEmail: process.env.FROM_EMAIL ?? '',
  registrationTableName: process.env.REGISTRATION_TABLE_NAME ?? '',
  setupTokenTtlMinutes: Number(process.env.SETUP_TOKEN_TTL_MINUTES ?? 60),
  autoApprovedDomain: (process.env.AUTO_APPROVED_DOMAIN ?? 'careindeed.com').toLowerCase(),
};

export interface DriveLockResult {
  ok: boolean;
  enforced: boolean;
  problems: string[];
  info: Record<string, string>;
}

/**
 * Verify the live Google Drive evidence config matches the LOCKED canonical
 * identity (service account, project, shared drive, provider). Reads only the
 * non-secret identity fields of the credentials JSON (never the private key).
 *
 * Fail-closed: when credentials are present AND evidence is enabled, a mismatch
 * throws (so a swapped key / drive / provider cannot silently run). When no
 * credentials are present (e.g. a dev box without the key), it soft-passes so
 * unrelated subsystems can still boot.
 */
export function assertDriveEvidenceLock(opts: { throwOnMismatch?: boolean } = {}): DriveLockResult {
  const problems: string[] = [];
  const driveAuthMode = (env.driveAuthMode || 'key_file').trim().toLowerCase();
  const info: Record<string, string> = {
    storageProvider: env.evidenceStorageProvider,
    sharedDriveId: env.driveEvidenceSharedDriveId,
    rootFolderId: env.driveEvidenceRootFolderId,
    packetFolderId: env.drivePacketFolderId,
    driveAuthMode,
    credentialsPath: env.credentialsPath,
    evidenceEnabled: String(env.calendarEvidenceEnabled),
  };

  if (env.evidenceStorageProvider !== DRIVE_EVIDENCE_LOCK.storageProvider) {
    problems.push(`storageProvider "${env.evidenceStorageProvider}" != locked "${DRIVE_EVIDENCE_LOCK.storageProvider}"`);
  }
  if (env.driveEvidenceSharedDriveId !== DRIVE_EVIDENCE_LOCK.sharedDriveId) {
    problems.push(`sharedDriveId "${env.driveEvidenceSharedDriveId}" != locked "${DRIVE_EVIDENCE_LOCK.sharedDriveId}"`);
  }

  // Keyless impersonation (DRIVE ONLY): the target must be configured and must
  // be exactly the locked Drive service account. Fail closed on drift/absence.
  if (driveAuthMode === 'impersonation') {
    const target = env.driveImpersonateServiceAccount.trim();
    info.driveImpersonationTarget = target || '(missing)';
    if (!target) {
      problems.push('GOOGLE_DRIVE_AUTH_MODE=impersonation but GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT is not set');
    } else if (target !== DRIVE_EVIDENCE_LOCK.serviceAccountEmail) {
      problems.push(`impersonation target "${target}" != locked "${DRIVE_EVIDENCE_LOCK.serviceAccountEmail}"`);
    }
    // Production-shaped mode also pins the packet destination: the TEMP
    // packet-folder override is a development-only convenience and must not
    // redirect packets in a deployed impersonation environment.
    if (env.drivePacketFolderId !== DRIVE_EVIDENCE_LOCK.packetFolderId) {
      problems.push(
        `packetFolderId "${env.drivePacketFolderId}" != locked "${DRIVE_EVIDENCE_LOCK.packetFolderId}" `
        + '(GOOGLE_DRIVE_PACKET_FOLDER_ID overrides are development-only)',
      );
    }
  } else if (driveAuthMode !== 'key_file') {
    problems.push(`unknown GOOGLE_DRIVE_AUTH_MODE "${env.driveAuthMode}" (use "impersonation" or "key_file")`);
  }

  if (env.calendarCredentialsPresent) {
    try {
      const k = JSON.parse(fs.readFileSync(env.credentialsPath, 'utf8')) as {
        type?: string; client_email?: string; project_id?: string; private_key?: string;
      };
      info.serviceAccountEmail = k.client_email ?? '(missing)';
      info.projectId = k.project_id ?? '(missing)';
      info.hasPrivateKey = String(!!k.private_key);
      if (k.client_email !== DRIVE_EVIDENCE_LOCK.serviceAccountEmail) {
        problems.push(`service account "${k.client_email}" != locked "${DRIVE_EVIDENCE_LOCK.serviceAccountEmail}"`);
      }
      if (k.project_id !== DRIVE_EVIDENCE_LOCK.projectId) {
        problems.push(`project "${k.project_id}" != locked "${DRIVE_EVIDENCE_LOCK.projectId}"`);
      }
      if (!k.private_key) problems.push('credentials JSON has no private_key');
    } catch (e) {
      problems.push(`could not read credentials at ${env.credentialsPath}: ${(e as Error).message}`);
    }
  } else {
    info.serviceAccountEmail = '(credentials absent on this host)';
  }

  const ok = problems.length === 0;
  // Enforced whenever evidence is enabled AND a Drive auth path is in play:
  // key file present (dev) or keyless impersonation configured (deployed).
  const enforced = env.calendarEvidenceEnabled
    && (env.calendarCredentialsPresent || driveAuthMode === 'impersonation');
  if (!ok && enforced && opts.throwOnMismatch) {
    throw new Error(
      `[drive-lock] Google Drive evidence config drift detected — refusing to start:\n  - ${problems.join('\n  - ')}\n` +
      `  These settings are locked in server/env.ts (DRIVE_EVIDENCE_LOCK). Change them only via a reviewed code edit.`,
    );
  }
  return { ok, enforced, problems, info };
}
