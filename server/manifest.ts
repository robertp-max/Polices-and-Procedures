import fs from 'node:fs';
import { env } from './env.js';
import { log } from './logger.js';
import { downloadFileBytes, updateFileContent, findFileByName } from './googleDrive.js';
import { appendManifestAudit } from './manifestAudit.js';
import {
  type ManifestRow, type PacketManifestInput, type ManifestFolder,
  parseManifest, serializeManifest, buildManifestRow, upsertRow, topLevelFolders, rootFolderUrl,
  parseFolderIndex, topLevelFoldersFromIndex, serializeFolderIndex, incrementFolderFilesWritten,
  type SearchManifestRow, buildSearchRows,
} from './manifestCore.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Drive CSV manifest service — single source of truth for evidence Drive links.

   "URL - Drive File Links (2).csv" lives on Google Drive. Every packet
   generation UPSERTS a row here (match by stable identity), writes the CSV back
   to Drive, and emits a survey-defensible audit entry. Pure parse/upsert logic
   lives in manifestCore.ts (network-free, unit-tested against the real CSV).
   ═══════════════════════════════════════════════════════════════════════════ */

export * from './manifestCore.js';

let _manifestFileId: string | null = null;
export const MANIFEST_FILE_NAME = process.env.DRIVE_MANIFEST_FILE_NAME || 'URL - Drive File Links (2).csv';

/** Resolve the manifest's Drive File ID (env override, else find by name under the evidence root). */
export async function resolveManifestFileId(): Promise<string> {
  if (_manifestFileId) return _manifestFileId;
  const configured = process.env.DRIVE_MANIFEST_FILE_ID;
  if (configured) { _manifestFileId = configured; return configured; }
  const found = await findFileByName(MANIFEST_FILE_NAME, env.driveEvidenceRootFolderId);
  if (!found?.id) throw new Error(`Manifest "${MANIFEST_FILE_NAME}" not found; set DRIVE_MANIFEST_FILE_ID.`);
  _manifestFileId = found.id;
  return found.id;
}

/** List the TOP-LEVEL Drive folders in the manifest (for the Evidence Drive grid)
 * — the folders as they appear in the shared-drive root (01_CES, 2026 Brad
 * Training, Event Packets, Mock Records), not every nested subfolder.
 * Prefers live Google Drive (source of truth); falls back to the bundled local
 * CSV export so the DRIVE tab still lists the real folders + Folder URLs when
 * Drive isn't reachable (local dev / no credentials). */
function foldersFromCsv(csv: string): ManifestFolder[] {
  const { rows } = parseManifest(csv);
  return topLevelFolders(rows, rootFolderUrl(rows));
}
/** Top-level folders from the bundled folder INDEX (every folder has a real ID/
 * URL — including container folders that hold no files directly). Returns null
 * when no index is present so the caller falls back to the file manifest. */
function foldersFromLocalIndex(): ManifestFolder[] | null {
  const idx = env.manifestLocalFolderIndex;
  if (!idx || !fs.existsSync(idx)) return null;
  const folders = topLevelFoldersFromIndex(parseFolderIndex(fs.readFileSync(idx, 'utf8')));
  return folders.length ? folders : null;
}
export async function listManifestFolders(): Promise<ManifestFolder[]> {
  try {
    const fileId = await resolveManifestFileId();
    const csv = (await downloadFileBytes(fileId)).toString('utf8');
    return foldersFromCsv(csv);
  } catch (driveErr) {
    // Prefer the folder index (real Folder IDs for every folder), then the
    // bundled file manifest, so the DRIVE tab still shows the real root folders.
    const fromIndex = foldersFromLocalIndex();
    if (fromIndex) {
      log.info('manifest.folders.localIndex', { source: env.manifestLocalFolderIndex, folders: fromIndex.length });
      return fromIndex;
    }
    const local = env.manifestLocalCsv;
    if (local && fs.existsSync(local)) {
      const folders = foldersFromCsv(fs.readFileSync(local, 'utf8'));
      log.info('manifest.folders.local', { source: local, folders: folders.length });
      return folders;
    }
    throw driveErr;
  }
}

/**
 * Write-through the packet into the APP'S local Drive copy (the bundled CSVs the
 * Evidence DRIVE tab reads): upsert the file row in the local manifest and, when
 * the row is newly appended, bump the containing folder's count in the folder
 * index. Best-effort and never throws — keeps the app's Drive view current even
 * when live Google Drive isn't reachable (local dev). */
export function syncPacketToLocalDrive(input: PacketManifestInput, nowISO: string): 'updated' | 'appended' | 'skipped' {
  try {
    const local = env.manifestLocalCsv;
    if (!local || !fs.existsSync(local)) return 'skipped';
    const { rows } = parseManifest(fs.readFileSync(local, 'utf8'));
    const result = upsertRow(rows, buildManifestRow(input, nowISO));
    fs.writeFileSync(local, serializeManifest(result.rows), 'utf8');
    if (result.action === 'appended') {
      const idxPath = env.manifestLocalFolderIndex;
      if (idxPath && fs.existsSync(idxPath)) {
        const idxRows = incrementFolderFilesWritten(parseFolderIndex(fs.readFileSync(idxPath, 'utf8')), input.folderId, 1);
        fs.writeFileSync(idxPath, serializeFolderIndex(idxRows), 'utf8');
      }
    }
    log.info('manifest.localDrive.sync', { action: result.action, fileId: input.fileId, folderId: input.folderId });
    return result.action;
  } catch (e) {
    log.warn('manifest.localDrive.failed', { error: e instanceof Error ? e.message : String(e), fileId: input.fileId });
    return 'skipped';
  }
}

/** Read-only enriched manifest rows (files + folders) for the CES Evidence Drive
 * search/filter layer. Prefers live Google Drive (the canonical spreadsheet);
 * falls back to the bundled file manifest + folder index for local dev. */
function searchRowsFromLocal(): SearchManifestRow[] | null {
  const csvPath = env.manifestLocalCsv;
  if (!csvPath || !fs.existsSync(csvPath)) return null;
  const fileRows = parseManifest(fs.readFileSync(csvPath, 'utf8')).rows;
  const idxPath = env.manifestLocalFolderIndex;
  const folderRows = idxPath && fs.existsSync(idxPath) ? parseFolderIndex(fs.readFileSync(idxPath, 'utf8')) : [];
  return buildSearchRows(fileRows, folderRows);
}
export async function listManifestRows(): Promise<SearchManifestRow[]> {
  try {
    const fileId = await resolveManifestFileId();
    const csv = (await downloadFileBytes(fileId)).toString('utf8');
    return buildSearchRows(parseManifest(csv).rows);
  } catch (driveErr) {
    const local = searchRowsFromLocal();
    if (local) {
      log.info('manifest.rows.local', { source: env.manifestLocalCsv, rows: local.length });
      return local;
    }
    throw driveErr;
  }
}

export interface ManifestSyncResult {
  status: 'synced' | 'failed';
  action?: 'updated' | 'appended';
  manifestFileId?: string;
  syncedAt?: string;
  error?: string;
  beforeHash?: string | null;
  afterHash?: string;
  before?: ManifestRow | null;
  after?: ManifestRow;
}
export interface ManifestAuditContext {
  actor: string; eventId: string; workflowId?: string; packetType: string;
}

/**
 * Upsert one packet row into the Drive CSV manifest and write it back.
 * NEVER throws — packet generation already succeeded; a manifest failure is
 * returned as { status: 'failed', error } so the caller warns + offers retry.
 *
 * On every call we ALSO write-through to the app's local Drive copy (the bundled
 * CSVs the Evidence DRIVE tab reads) so the in-app view reflects the new packet
 * whether or not live Google Drive is reachable.
 */
export async function upsertPacketIntoManifest(
  input: PacketManifestInput, audit: ManifestAuditContext, nowISO = new Date().toISOString(),
): Promise<ManifestSyncResult> {
  syncPacketToLocalDrive(input, nowISO);
  try {
    const fileId = await resolveManifestFileId();
    const csv = (await downloadFileBytes(fileId)).toString('utf8');
    const { rows } = parseManifest(csv);
    const incoming = buildManifestRow(input, nowISO);
    const result = upsertRow(rows, incoming);
    await updateFileContent(fileId, 'text/csv', Buffer.from(serializeManifest(result.rows), 'utf8'));
    const after = result.rows[result.index];
    await appendManifestAudit({
      actor: audit.actor, eventId: audit.eventId, workflowId: audit.workflowId,
      packetType: audit.packetType, fileId: input.fileId, driveLink: after['Google Drive Link'],
      manifestFileId: fileId, action: result.action, priorHash: result.beforeHash,
      newHash: result.afterHash, priorRow: result.before, newRow: after, timestamp: nowISO,
    });
    log.info('manifest.upsert.ok', { action: result.action, fileId: input.fileId, manifestFileId: fileId, packetType: audit.packetType });
    return { status: 'synced', action: result.action, manifestFileId: fileId, syncedAt: nowISO, beforeHash: result.beforeHash, afterHash: result.afterHash, before: result.before, after };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    log.error('manifest.upsert.failed', { error, fileId: input.fileId, packetType: audit.packetType });
    return { status: 'failed', error, syncedAt: nowISO };
  }
}
