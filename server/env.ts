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
  // eslint-disable-next-line no-console
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
  evidenceStorageProvider: process.env.GOOGLE_EVIDENCE_STORAGE_PROVIDER ?? 'google_calendar_drive',
  calendarEvidenceEnabled: (process.env.GOOGLE_CALENDAR_EVIDENCE_ENABLED ?? 'true').toLowerCase() === 'true',
  driveEvidenceSharedDriveId: process.env.GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID ?? '0AFWjpId3CYL3Uk9PVA',
  driveEvidenceRootFolderId:
    process.env.GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID
    ?? process.env.GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID
    ?? '0AFWjpId3CYL3Uk9PVA',

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
