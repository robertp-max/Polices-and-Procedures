import { Readable } from 'node:stream';
import { google, type drive_v3 } from 'googleapis';
import { env, DRIVE_EVIDENCE_LOCK } from './env.js';
import { log } from './logger.js';
import { ApiError, fromGoogleError } from './errors.js';
import { planDriveAuth, createDriveAuthClient, describeDriveAuthPlan } from './googleDriveAuth.js';

/* ═══════════════════════════════════════════════════════════════
   Google Drive service — evidence FILE storage beside the existing
   Calendar integration.

   Auth (DRIVE ONLY — Calendar keeps its own key-file path):
     - production/Cloud Run: keyless impersonation of the locked Drive
       service account (GOOGLE_DRIVE_AUTH_MODE=impersonation)
     - local development: the existing external JSON key file
       (GOOGLE_APPLICATION_CREDENTIALS — default, unchanged)
   Mode selection + fail-closed validation live in googleDriveAuth.ts.

   Scopes (narrowest-first, per integration brief) are defined in
   googleDriveAuth.ts (DRIVE_SCOPES). If Shared-Drive folder find/create
   fails with insufficient scope, broaden to
   https://www.googleapis.com/auth/drive (documented in the report).
   The Drive identity must also be a Content manager (or equivalent)
   on the Shared Drive.
   ═══════════════════════════════════════════════════════════════ */

const DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';

let _client: drive_v3.Drive | null = null;

/** Cache of resolved folder ids keyed by `${parentId}::${name}`. */
const folderIdCache = new Map<string, string>();

async function getClient(): Promise<drive_v3.Drive> {
  if (_client) return _client;
  try {
    const plan = planDriveAuth({
      authMode: env.driveAuthMode,
      impersonateServiceAccount: env.driveImpersonateServiceAccount,
      credentialsPath: env.credentialsPath,
      credentialsPresent: env.calendarCredentialsPresent,
      approvedServiceAccountEmail: DRIVE_EVIDENCE_LOCK.serviceAccountEmail,
    });
    for (const warning of plan.warnings) log.warn('google.drive.auth.config', { warning });
    const authClient = await createDriveAuthClient(plan);
    _client = google.drive({ version: 'v3', auth: authClient as never });
    log.info('google.drive.auth.ready', {
      ...describeDriveAuthPlan(plan),
      sharedDriveId: env.driveEvidenceSharedDriveId,
    });
    return _client;
  } catch (e) {
    log.error('google.drive.auth.failed', { error: (e as Error).message });
    throw new ApiError('auth_error', 'Failed to initialize Google Drive auth.', 500);
  }
}

/** Shared-Drive aware list/create options.
 * Only set corpora+driveId when a shared drive ID is configured.
 * Prevents "driveId must be specified if corpora=drive" when using regular Drive folders or no shared configured.
 */
function driveScopeParams() {
  const id = env.driveEvidenceSharedDriveId;
  const base = {
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  };
  if (id) {
    return {
      ...base,
      corpora: 'drive' as const,
      driveId: id,
    };
  }
  return base;
}

/** Health check — confirms the Shared Drive root is reachable. */
export async function pingDrive(): Promise<{ reachable: boolean; rootId?: string; error?: string }> {
  try {
    const c = await getClient();
    await c.files.get({
      fileId: env.driveEvidenceRootFolderId,
      fields: 'id,name',
      supportsAllDrives: true,
    });
    return { reachable: true, rootId: env.driveEvidenceRootFolderId };
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.drive.ping.failed', { code: err.code, message: err.message });
    return { reachable: false, error: err.code };
  }
}

/** Find an existing child folder by exact name under a parent. */
export async function findFolder(name: string, parentId: string): Promise<string | null> {
  const c = await getClient();
  const escaped = name.replace(/'/g, "\\'");
  try {
    const res = await c.files.list({
      q: `name='${escaped}' and mimeType='${DRIVE_FOLDER_MIME}' and '${parentId}' in parents and trashed=false`,
      fields: 'files(id,name)',
      pageSize: 5,
      ...driveScopeParams(),
    });
    return res.data.files?.[0]?.id ?? null;
  } catch (e) {
    throw fromGoogleError(e);
  }
}

/** Create a child folder under a parent. */
export async function createFolder(name: string, parentId: string): Promise<string> {
  const c = await getClient();
  try {
    const res = await c.files.create({
      requestBody: { name, mimeType: DRIVE_FOLDER_MIME, parents: [parentId] },
      fields: 'id,name',
      supportsAllDrives: true,
    });
    const id = res.data.id;
    if (!id) throw new ApiError('upstream_error', 'Drive folder create returned no id.', 502);
    log.info('google.drive.folder.created', { name, parentId, id });
    return id;
  } catch (e) {
    throw fromGoogleError(e);
  }
}

/** Find-or-create a folder (idempotent, cached). Never creates duplicates. */
export async function findOrCreateFolder(name: string, parentId: string): Promise<string> {
  const cacheKey = `${parentId}::${name}`;
  const cached = folderIdCache.get(cacheKey);
  if (cached) return cached;

  const existing = await findFolder(name, parentId);
  const id = existing ?? (await createFolder(name, parentId));
  folderIdCache.set(cacheKey, id);
  return id;
}

/**
 * Walk a sanitized segment path under the evidence root, creating missing
 * folders. Returns the leaf folder id.
 */
/** Top-level folders that are LOCKED — no writes until a readiness date is set. */
const LOCKED_ROOT_SEGMENTS = ['01_CES'];

export async function ensureFolderPath(segments: string[], rootId = env.driveEvidenceRootFolderId): Promise<string> {
  // 01_CES is locked until production: refuse to create/resolve any folder under
  // it so nothing is written there. Packets are routed to Event Packets instead.
  const top = segments.find((s) => s)?.trim();
  if (env.drive01CesLocked && top && LOCKED_ROOT_SEGMENTS.includes(top)) {
    throw new ApiError(
      'validation_error',
      `"${top}" is locked until production (no readiness date set). Set DRIVE_01_CES_READINESS_DATE to unlock; packets are filed to Event Packets meanwhile.`,
      423,
    );
  }
  let parentId = rootId;
  for (const segment of segments) {
    if (!segment) continue;
    parentId = await findOrCreateFolder(segment, parentId);
  }
  return parentId;
}

export interface DriveUploadResult {
  fileId: string;
  webViewLink?: string;
  webContentLink?: string;
  mimeType?: string;
  name?: string;
}

export interface DriveSourceFile {
  fileId: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  buffer: Buffer;
  exported: boolean;
}

const DRIVE_SOURCE_MAX_BYTES = 32 * 1024 * 1024;
const GOOGLE_APP_MIME_PREFIX = 'application/vnd.google-apps.';
const GOOGLE_APP_EXPORTS: Record<string, { mimeType: string; ext: string }> = {
  'application/vnd.google-apps.document': { mimeType: 'text/plain', ext: 'txt' },
  'application/vnd.google-apps.spreadsheet': { mimeType: 'text/csv', ext: 'csv' },
  'application/vnd.google-apps.presentation': { mimeType: 'text/plain', ext: 'txt' },
  'application/vnd.google-apps.drawing': { mimeType: 'application/pdf', ext: 'pdf' },
};

function ensureExtension(name: string, ext: string): string {
  const safeName = name || 'drive-source';
  return /\.[A-Za-z0-9]{1,8}$/.test(safeName) ? safeName : `${safeName}.${ext}`;
}

function assertDownloadSize(buffer: Buffer, name: string): void {
  if (buffer.length > DRIVE_SOURCE_MAX_BYTES) {
    throw new ApiError(
      'validation_error',
      `Drive source "${name}" is ${Math.round(buffer.length / (1024 * 1024))} MB; the source intake limit is 32 MB.`,
      413,
    );
  }
}

/** Upload a file (from a Buffer) into a Drive folder. */
export async function uploadFile(input: {
  parentId: string;
  name: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<DriveUploadResult> {
  const c = await getClient();
  try {
    const res = await c.files.create({
      requestBody: { name: input.name, parents: [input.parentId] },
      media: { mimeType: input.mimeType, body: Readable.from(input.buffer) },
      fields: 'id,name,mimeType,webViewLink,webContentLink',
      supportsAllDrives: true,
    });
    const fileId = res.data.id;
    if (!fileId) throw new ApiError('upstream_error', 'Drive upload returned no file id.', 502);
    log.info('google.drive.upload.ok', { fileId, parentId: input.parentId, name: input.name });
    return {
      fileId,
      webViewLink: res.data.webViewLink ?? undefined,
      webContentLink: res.data.webContentLink ?? undefined,
      mimeType: res.data.mimeType ?? input.mimeType,
      name: res.data.name ?? input.name,
    };
  } catch (e) {
    throw fromGoogleError(e);
  }
}

/**
 * Upload a file, REPLACING any existing file of the same name in the folder
 * (content updated in place so the webViewLink/fileId stays stable). Used for
 * generated packets: a new packet for the same event replaces the prior one.
 */
export async function uploadOrReplaceFile(input: {
  parentId: string;
  name: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<DriveUploadResult & { replaced: boolean }> {
  const c = await getClient();
  const escaped = input.name.replace(/'/g, "\\'");
  try {
    const existing = await c.files.list({
      q: `name='${escaped}' and '${input.parentId}' in parents and trashed=false`,
      fields: 'files(id,name)',
      pageSize: 1,
      ...driveScopeParams(),
    });
    const priorId = existing.data.files?.[0]?.id;
    if (priorId) {
      const res = await c.files.update({
        fileId: priorId,
        media: { mimeType: input.mimeType, body: Readable.from(input.buffer) },
        fields: 'id,name,mimeType,webViewLink,webContentLink',
        supportsAllDrives: true,
      });
      log.info('google.drive.replace.ok', { fileId: priorId, parentId: input.parentId, name: input.name });
      return {
        fileId: priorId,
        webViewLink: res.data.webViewLink ?? driveFileUrl(priorId),
        webContentLink: res.data.webContentLink ?? undefined,
        mimeType: res.data.mimeType ?? input.mimeType,
        name: res.data.name ?? input.name,
        replaced: true,
      };
    }
    const created = await uploadFile(input);
    return { ...created, replaced: false };
  } catch (e) {
    throw fromGoogleError(e);
  }
}

/**
 * Copy an existing Drive file into a destination folder (Section 10 — physical
 * packet copies). Returns the NEW file id. Preserves the source bytes; never
 * overwrites the canonical original. Provenance (canonicalEvidenceId, source
 * file id) is recorded by the caller, not here.
 */
export async function copyFile(input: {
  sourceFileId: string;
  destFolderId: string;
  name?: string;
}): Promise<DriveUploadResult> {
  const c = await getClient();
  try {
    const res = await c.files.copy({
      fileId: input.sourceFileId,
      requestBody: { name: input.name, parents: [input.destFolderId] },
      fields: 'id,name,mimeType,webViewLink,webContentLink',
      supportsAllDrives: true,
    });
    const fileId = res.data.id;
    if (!fileId) throw new ApiError('upstream_error', 'Drive copy returned no file id.', 502);
    log.info('google.drive.copy.ok', { fileId, sourceFileId: input.sourceFileId, destFolderId: input.destFolderId });
    return {
      fileId,
      webViewLink: res.data.webViewLink ?? undefined,
      webContentLink: res.data.webContentLink ?? undefined,
      mimeType: res.data.mimeType ?? undefined,
      name: res.data.name ?? input.name,
    };
  } catch (e) {
    throw fromGoogleError(e);
  }
}

/** Download a Drive file's raw bytes by File ID (e.g. the CSV manifest). */
export async function downloadFileBytes(fileId: string): Promise<Buffer> {
  const c = await getClient();
  try {
    const res = await c.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' },
    );
    return Buffer.from(res.data as ArrayBuffer);
  } catch (e) {
    throw fromGoogleError(e);
  }
}

/** Download a selected Drive source as bytes, exporting native Google files. */
export async function downloadSourceFile(fileId: string): Promise<DriveSourceFile> {
  const c = await getClient();
  try {
    const meta = await c.files.get({
      fileId,
      fields: 'id,name,mimeType,size,webViewLink',
      supportsAllDrives: true,
    });
    const id = meta.data.id || fileId;
    const name = meta.data.name || id;
    const mimeType = meta.data.mimeType || 'application/octet-stream';
    if (mimeType === DRIVE_FOLDER_MIME) {
      throw new ApiError('validation_error', 'Select a Drive document or file, not a folder.', 400);
    }
    const reportedSize = meta.data.size ? Number(meta.data.size) : 0;
    if (reportedSize > DRIVE_SOURCE_MAX_BYTES) {
      throw new ApiError(
        'validation_error',
        `Drive source "${name}" is ${Math.round(reportedSize / (1024 * 1024))} MB; the source intake limit is 32 MB.`,
        413,
      );
    }

    const googleExport = GOOGLE_APP_EXPORTS[mimeType] || (mimeType.startsWith(GOOGLE_APP_MIME_PREFIX)
      ? { mimeType: 'application/pdf', ext: 'pdf' }
      : null);
    if (googleExport) {
      const exported = await c.files.export(
        { fileId: id, mimeType: googleExport.mimeType },
        { responseType: 'arraybuffer' },
      );
      const buffer = Buffer.from(exported.data as ArrayBuffer);
      const exportName = ensureExtension(name, googleExport.ext);
      assertDownloadSize(buffer, exportName);
      return {
        fileId: id,
        name: exportName,
        mimeType: googleExport.mimeType,
        webViewLink: meta.data.webViewLink ?? driveFileUrl(id),
        buffer,
        exported: true,
      };
    }

    const buffer = await downloadFileBytes(id);
    assertDownloadSize(buffer, name);
    return {
      fileId: id,
      name,
      mimeType,
      webViewLink: meta.data.webViewLink ?? driveFileUrl(id),
      buffer,
      exported: false,
    };
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw fromGoogleError(e);
  }
}

/** Overwrite an existing Drive file's content by File ID (stable id/link). */
export async function updateFileContent(fileId: string, mimeType: string, buffer: Buffer): Promise<void> {
  const c = await getClient();
  try {
    await c.files.update({
      fileId,
      media: { mimeType, body: Readable.from(buffer) },
      supportsAllDrives: true,
    });
    log.info('google.drive.content.updated', { fileId, bytes: buffer.length });
  } catch (e) {
    throw fromGoogleError(e);
  }
}

/** Find a (non-folder) file by exact name under a parent folder. */
export async function findFileByName(
  name: string, parentId: string,
): Promise<{ id: string; webViewLink?: string } | null> {
  const c = await getClient();
  const escaped = name.replace(/'/g, "\\'");
  try {
    const res = await c.files.list({
      q: `name='${escaped}' and '${parentId}' in parents and trashed=false`,
      fields: 'files(id,name,webViewLink)',
      pageSize: 1,
      ...driveScopeParams(),
    });
    const f = res.data.files?.[0];
    return f?.id ? { id: f.id, webViewLink: f.webViewLink ?? undefined } : null;
  } catch (e) {
    throw fromGoogleError(e);
  }
}

export interface DriveTreeFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  path: string;
}

/**
 * Recursively list non-folder files under a root folder (Shared-Drive aware).
 * Returns each file's id/name/mimeType/webViewLink plus its folder path — used
 * to seed the Brad Training library with URL-only references (no bytes).
 */
export async function listFolderTree(rootId: string, maxDepth = 4): Promise<DriveTreeFile[]> {
  const c = await getClient();
  const out: DriveTreeFile[] = [];
  const escape = (s: string) => s.replace(/'/g, "\\'");

  const listChildren = async (id: string): Promise<drive_v3.Schema$File[]> => {
    const children: drive_v3.Schema$File[] = [];
    let pageToken: string | undefined;
    do {
      const res = await c.files.list({
        q: `'${escape(id)}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id,name,mimeType,webViewLink)',
        pageSize: 1000,
        orderBy: 'folder,name',
        pageToken,
        ...driveScopeParams(),
      });
      children.push(...(res.data.files ?? []));
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
    return children;
  };

  // Walk subfolders concurrently — sequential recursion over a deep tree is
  // dominated by round-trip latency and can exceed request timeouts.
  const walk = async (id: string, path: string[], depth: number): Promise<void> => {
    if (depth > maxDepth) return;
    const children = await listChildren(id);
    const subfolders: Promise<void>[] = [];
    for (const f of children) {
      if (!f.id) continue;
      if (f.mimeType === DRIVE_FOLDER_MIME) {
        subfolders.push(walk(f.id, [...path, f.name ?? ''], depth + 1));
      } else {
        out.push({
          id: f.id,
          name: f.name ?? f.id,
          mimeType: f.mimeType ?? 'application/octet-stream',
          webViewLink: f.webViewLink ?? driveFileUrl(f.id),
          path: path.join(' / '),
        });
      }
    }
    await Promise.all(subfolders);
  };
  await walk(rootId, [], 0);
  return out;
}

export interface DriveFolderRef { id: string; name: string }
export interface DriveChildren { folders: DriveFolderRef[]; files: DriveTreeFile[] }

/**
 * List the IMMEDIATE children of a folder, split into subfolders and files
 * (Shared-Drive aware, paginated). Used for lazy folder-by-folder navigation
 * of the Brad Training drive — far cheaper than recursing the whole tree.
 */
export async function listFolderChildren(folderId: string): Promise<DriveChildren> {
  const c = await getClient();
  const escaped = folderId.replace(/'/g, "\\'");
  const folders: DriveFolderRef[] = [];
  const files: DriveTreeFile[] = [];
  let pageToken: string | undefined;
  do {
    const res = await c.files.list({
      q: `'${escaped}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id,name,mimeType,webViewLink)',
      pageSize: 1000,
      orderBy: 'folder,name',
      pageToken,
      ...driveScopeParams(),
    });
    for (const f of res.data.files ?? []) {
      if (!f.id) continue;
      if (f.mimeType === DRIVE_FOLDER_MIME) {
        folders.push({ id: f.id, name: f.name ?? f.id });
      } else {
        files.push({
          id: f.id,
          name: f.name ?? f.id,
          mimeType: f.mimeType ?? 'application/octet-stream',
          webViewLink: f.webViewLink ?? driveFileUrl(f.id),
          path: '',
        });
      }
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);
  return { folders, files };
}

/** Drive web link for a folder/file id (used when the API omits webViewLink). */
export function driveFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

export function driveFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/** Test/diagnostic hook — clears the folder-id cache. */
export function _resetFolderCache(): void {
  folderIdCache.clear();
}
