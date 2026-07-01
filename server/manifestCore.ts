import { createHash } from 'node:crypto';

/* ═══════════════════════════════════════════════════════════════════════════
   Drive CSV manifest — PURE helpers (no network/Drive imports) so they can be
   unit-validated against the real CSV. parse/serialize/match/upsert/hash.
   ═══════════════════════════════════════════════════════════════════════════ */

export const MANIFEST_COLUMNS = [
  'Section / Root Folder', 'Full Folder Path', 'Parent Folder Path', 'Folder Name',
  'Folder ID', 'Folder URL', 'Folder Depth', 'Professional Display Name',
  'Raw File Name', 'File Type', 'File ID', 'Google Drive Link', 'Last Updated', 'Notes',
] as const;
export type ManifestColumn = (typeof MANIFEST_COLUMNS)[number];
export type ManifestRow = Record<ManifestColumn, string>;

export const SYSTEM_NOTE_PREFIX = '[DefenCIble]';

export const folderUrlFor = (id: string) => (id ? `https://drive.google.com/drive/folders/${id}` : '');
export const fileUrlFor = (id: string) => (id ? `https://drive.google.com/file/d/${id}/view` : '');

/* ── RFC-4180 CSV parse/serialize (quotes, commas, embedded newlines) ── */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '', row: string[] = [], inQuotes = false;
  const s = String(text ?? '').replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\r') { /* skip */ }
    else if (ch === '\n') { row.push(field); rows.push(row); field = ''; row = []; }
    else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function csvCell(v: string): string {
  const val = v ?? '';
  return /[",\r\n]/.test(val) ? '"' + val.replace(/"/g, '""') + '"' : val;
}
export function serializeCsv(rows: string[][]): string {
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export function parseManifest(text: string): { header: string[]; rows: ManifestRow[] } {
  const matrix = parseCsv(text);
  if (!matrix.length) return { header: [...MANIFEST_COLUMNS], rows: [] };
  const header = matrix[0];
  const rows: ManifestRow[] = matrix.slice(1)
    .filter((r) => r.some((c) => String(c).trim() !== ''))
    .map((r) => {
      const o = {} as ManifestRow;
      for (const col of MANIFEST_COLUMNS) {
        const idx = header.indexOf(col);
        o[col] = idx >= 0 ? (r[idx] ?? '') : '';
      }
      return o;
    });
  return { header, rows };
}
export function serializeManifest(rows: ManifestRow[]): string {
  const matrix = [[...MANIFEST_COLUMNS], ...rows.map((row) => MANIFEST_COLUMNS.map((c) => row[c] ?? ''))];
  return serializeCsv(matrix);
}

export function rowHash(row: Partial<ManifestRow>): string {
  const canon = MANIFEST_COLUMNS.map((c) => `${c}=${row[c] ?? ''}`).join('');
  return createHash('sha256').update(canon).digest('hex').slice(0, 16);
}

const norm = (v?: string) => String(v ?? '').trim().toLowerCase();

/** Match by STABLE identity: File ID → Google Drive Link → Full Folder Path + Raw File Name. */
export function findRowIndex(rows: ManifestRow[], incoming: Partial<ManifestRow>): number {
  const fid = norm(incoming['File ID']);
  if (fid) { const i = rows.findIndex((r) => norm(r['File ID']) === fid); if (i >= 0) return i; }
  const link = norm(incoming['Google Drive Link']);
  if (link) { const i = rows.findIndex((r) => norm(r['Google Drive Link']) === link); if (i >= 0) return i; }
  const path = norm(incoming['Full Folder Path']), name = norm(incoming['Raw File Name']);
  if (path && name) { const i = rows.findIndex((r) => norm(r['Full Folder Path']) === path && norm(r['Raw File Name']) === name); if (i >= 0) return i; }
  return -1;
}

export function upsertRow(rows: ManifestRow[], incoming: ManifestRow): {
  rows: ManifestRow[]; action: 'updated' | 'appended'; index: number;
  before: ManifestRow | null; beforeHash: string | null; afterHash: string;
} {
  const out = rows.map((r) => ({ ...r }));
  const idx = findRowIndex(out, incoming);
  if (idx >= 0) {
    const before = { ...out[idx] };
    const existingNote = before['Notes'] ?? '';
    const userEntered = existingNote.trim() !== '' && !existingNote.startsWith(SYSTEM_NOTE_PREFIX);
    const merged: ManifestRow = { ...before, ...incoming };
    merged['File ID'] = incoming['File ID'] || before['File ID'];
    merged['Google Drive Link'] = incoming['Google Drive Link'] || before['Google Drive Link'];
    // Preserve a human-entered note across routine auto-syncs; the system note
    // only fills Notes when none was entered (the sync is captured in the audit).
    merged['Notes'] = userEntered ? existingNote : (incoming['Notes'] || existingNote);
    out[idx] = merged;
    return { rows: out, action: 'updated', index: idx, before, beforeHash: rowHash(before), afterHash: rowHash(merged) };
  }
  out.push(incoming);
  return { rows: out, action: 'appended', index: out.length - 1, before: null, beforeHash: null, afterHash: rowHash(incoming) };
}

export interface ManifestFolder {
  section: string;
  folderName: string;
  fullFolderPath: string;
  folderId: string;
  folderUrl: string;
  folderDepth: number;
  count: number;        // files referenced under this folder
  lastUpdated: string;  // most recent row Last Updated
}
/** Distinct Drive folders referenced by the manifest (for the Evidence Drive folder grid). */
export function distinctFolders(rows: ManifestRow[]): ManifestFolder[] {
  const byKey = new Map<string, ManifestFolder>();
  for (const r of rows) {
    const folderId = (r['Folder ID'] || '').trim();
    const key = folderId || `${r['Section / Root Folder']}::${r['Full Folder Path']}`;
    if (!key.trim()) continue;
    const url = (r['Folder URL'] || '').trim() || folderUrlFor(folderId);
    const last = r['Last Updated'] || '';
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
      if (last > existing.lastUpdated) existing.lastUpdated = last;
    } else {
      byKey.set(key, {
        section: r['Section / Root Folder'] || r['Folder Name'] || '',
        folderName: r['Folder Name'] || r['Section / Root Folder'] || '',
        fullFolderPath: r['Full Folder Path'] || '',
        folderId, folderUrl: url,
        folderDepth: Number(r['Folder Depth'] || 0) || 0,
        count: 1, lastUpdated: last,
      });
    }
  }
  return Array.from(byKey.values()).sort((a, b) => a.section.localeCompare(b.section) || a.folderName.localeCompare(b.folderName));
}

/** Split a "Drive / A / B / C" full path into clean segments. */
const pathSegs = (p: string) => String(p ?? '').split('/').map((s) => s.trim()).filter(Boolean);

/**
 * Top-level Drive folders as they appear in the shared-drive ROOT (e.g. 01_CES,
 * 2026 Brad Training, Event Packets, Mock Records) — NOT every nested folder.
 * Groups every row by the first path segment under the root, aggregates the
 * descendant file count, and resolves each folder's own Folder ID/URL when the
 * export carries one (a depth-1 row), else falls back to `rootUrl` so a click
 * still opens the Drive that contains the folder.
 */
export function topLevelFolders(rows: ManifestRow[], rootUrl = ''): ManifestFolder[] {
  const byTop = new Map<string, ManifestFolder>();
  for (const r of rows) {
    const segs = pathSegs(r['Full Folder Path']);
    if (segs.length < 2) continue; // depth-0 root itself ("Drive") — skip
    const top = segs[1];
    const isOwnRow = Number(r['Folder Depth'] || 0) === 1 && (r['Folder Name'] || '').trim() === top;
    const isFile = (r['Raw File Name'] || '').trim() !== '';
    const last = r['Last Updated'] || '';
    const existing = byTop.get(top);
    if (existing) {
      if (isFile) existing.count += 1;
      if (last > existing.lastUpdated) existing.lastUpdated = last;
      if (isOwnRow && r['Folder ID']) {
        existing.folderId = r['Folder ID'];
        existing.folderUrl = (r['Folder URL'] || '').trim() || folderUrlFor(r['Folder ID']);
      }
    } else {
      const folderId = isOwnRow ? (r['Folder ID'] || '') : '';
      byTop.set(top, {
        section: r['Section / Root Folder'] || 'Drive',
        folderName: top,
        fullFolderPath: segs.slice(0, 2).join(' / '),
        folderId,
        folderUrl: folderId ? ((r['Folder URL'] || '').trim() || folderUrlFor(folderId)) : rootUrl,
        folderDepth: 1,
        count: isFile ? 1 : 0,
        lastUpdated: last,
      });
    }
  }
  // Any folder that never found its own ID falls back to the Drive root URL.
  for (const f of byTop.values()) if (!f.folderUrl) f.folderUrl = rootUrl;
  return Array.from(byTop.values()).sort((a, b) => a.folderName.localeCompare(b.folderName));
}

/* ── Folder INDEX (one row PER FOLDER, with a real Folder ID even for container
   folders that hold no files directly) — exported from the spreadsheet's
   "Evidence Manifest Queue" sheet. Columns: Folder ID, Full Folder Path,
   Folder Depth, Folder Name, Files Written. ── */
export interface FolderIndexRow {
  folderId: string; fullFolderPath: string; folderDepth: number; folderName: string; filesWritten: number;
}
export function parseFolderIndex(text: string): FolderIndexRow[] {
  const m = parseCsv(text);
  if (!m.length) return [];
  const h = m[0].map((c) => String(c).trim());
  const idx = (n: string) => h.indexOf(n);
  const iId = idx('Folder ID'), iPath = idx('Full Folder Path'), iDepth = idx('Folder Depth'),
    iName = idx('Folder Name'), iFiles = idx('Files Written');
  return m.slice(1)
    .filter((r) => (r[iId] ?? '').trim() !== '')
    .map((r) => ({
      folderId: (r[iId] ?? '').trim(),
      fullFolderPath: (r[iPath] ?? '').trim(),
      folderDepth: Number(r[iDepth] ?? 0) || 0,
      folderName: (r[iName] ?? '').trim(),
      filesWritten: Number(r[iFiles] ?? 0) || 0,
    }));
}

const FOLDER_INDEX_COLUMNS = ['Folder ID', 'Full Folder Path', 'Folder Depth', 'Folder Name', 'Files Written'] as const;
export function serializeFolderIndex(rows: FolderIndexRow[]): string {
  const matrix = [
    [...FOLDER_INDEX_COLUMNS],
    ...rows.map((r) => [r.folderId, r.fullFolderPath, String(r.folderDepth), r.folderName, String(r.filesWritten)]),
  ];
  return serializeCsv(matrix);
}

/** Add `delta` to the Files Written count of the folder with `folderId` (used to
 * reflect a newly-saved packet in the app's local folder index). No-op if absent. */
export function incrementFolderFilesWritten(rows: FolderIndexRow[], folderId: string, delta = 1): FolderIndexRow[] {
  const id = norm(folderId);
  if (!id) return rows;
  return rows.map((r) => (norm(r.folderId) === id ? { ...r, filesWritten: Math.max(0, r.filesWritten + delta) } : r));
}

/** Top-level Drive folders (root view) from the folder INDEX — each carries its
 * own real Folder ID/URL; `count` aggregates files written across all descendants. */
export function topLevelFoldersFromIndex(index: FolderIndexRow[]): ManifestFolder[] {
  const tops = index.filter((r) => r.folderDepth === 1);
  return tops.map((t) => {
    const prefix = `${t.fullFolderPath} /`;
    const count = index
      .filter((r) => r.fullFolderPath === t.fullFolderPath || r.fullFolderPath.startsWith(prefix))
      .reduce((s, r) => s + r.filesWritten, 0);
    return {
      section: 'Drive',
      folderName: t.folderName,
      fullFolderPath: t.fullFolderPath,
      folderId: t.folderId,
      folderUrl: folderUrlFor(t.folderId),
      folderDepth: 1,
      count,
      lastUpdated: '',
    };
  }).sort((a, b) => a.folderName.localeCompare(b.folderName));
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH ROWS — a read-only, enriched projection of the manifest for the CES
   Evidence Drive search/filter layer. Every row is either a FILE (opens its
   Google Drive Link) or a FOLDER (opens its Folder URL). Parsed evidence fields
   (event/workflow/policy/form/packet/signer/createdBy/status) are best-effort:
   populated ONLY when unambiguously present in the file name, folder path, or
   notes — never invented. This adds NO Drive mutations.
   ═══════════════════════════════════════════════════════════════════════════ */
export interface SearchManifestRow {
  kind: 'file' | 'folder';
  rawFileName: string;
  displayName: string;
  fullFolderPath: string;
  parentFolderPath: string;
  folderName: string;
  folderId: string;
  folderUrl: string;
  fileType: string;
  fileId: string;
  driveLink: string;     // file: Google Drive Link; folder: '' (use folderUrl)
  lastUpdated: string;
  notes: string;
  // Parsed evidence metadata (empty string when not derivable — never faked).
  eventId: string;
  workflowId: string;
  policyId: string;
  formId: string;
  packetName: string;
  signerName: string;
  createdBy: string;
  evidenceStatus: string;
}

const firstMatch = (re: RegExp, ...sources: string[]): string => {
  for (const s of sources) { const m = (s || '').match(re); if (m) return m[1] ?? m[0]; }
  return '';
};

/** Derive best-effort evidence metadata from a file name / folder path / notes. */
export function parseEvidenceMeta(name: string, path: string, notes: string): {
  eventId: string; workflowId: string; policyId: string; formId: string;
  packetName: string; signerName: string; createdBy: string; evidenceStatus: string;
} {
  const hay = `${name} ${path} ${notes}`;
  // Boundaries treat '_' as a delimiter (it isn't a regex word boundary), so IDs
  // embedded in snake_case file names (MOCK-EVT-Q2-0011_qapi) are still matched.
  const B0 = '(?<![A-Za-z0-9])', B1 = '(?![A-Za-z0-9])';
  const eventId = firstMatch(new RegExp(`${B0}(MOCK-EVT-[A-Z0-9]+-\\d+)${B1}`, 'i'), hay)
    || firstMatch(new RegExp(`${B0}(evt-\\d+)${B1}`, 'i'), hay);
  const workflowId = firstMatch(new RegExp(`${B0}([A-Z]{2,4}-WF-\\d+)${B1}`, 'i'), hay);
  const policyId = firstMatch(new RegExp(`${B0}(POL-[A-Z0-9-]+)${B1}`, 'i'), hay);
  const formId = firstMatch(new RegExp(`${B0}([A-Z]{2,4}-FM-\\d+)${B1}`, 'i'), hay)
    || firstMatch(new RegExp(`${B0}(cdph\\d+[a-z]?)${B1}`, 'i'), hay);
  // packet name: the file stem when it is clearly a packet artifact.
  const packetName = /packet/i.test(`${name} ${notes}`)
    ? (name.replace(/\.[a-z0-9]+$/i, '') || firstMatch(/\b([\w-]*packet[\w-]*)\b/i, hay))
    : '';
  const signerName = ''; // not present in the manifest — do not fake
  const createdBy = '';   // owner/uploader metadata unavailable — do not fake
  // Status only when obvious from name/path/notes.
  const lc = hay.toLowerCase();
  let evidenceStatus = '';
  if (/\bsuperseded\b/.test(lc)) evidenceStatus = 'Superseded';
  else if (/pending[_\s-]?sign|awaiting[_\s-]?signature/.test(lc)) evidenceStatus = 'Pending signature';
  else if (/\bsigned\b/.test(lc)) evidenceStatus = 'Signed';
  else if (/missing[_\s-]?(evidence|information|signature)/.test(lc)) evidenceStatus = 'Missing evidence';
  else if (/packet/.test(lc)) evidenceStatus = 'Generated packet';
  else if (/supporting[_\s-]?proof|04_supporting/.test(lc)) evidenceStatus = 'Supporting proof';
  else if (/\brequired\b/.test(lc)) evidenceStatus = 'Required';
  return { eventId, workflowId, policyId, formId, packetName, signerName, createdBy, evidenceStatus };
}

const parentOf = (fullPath: string): string => {
  const segs = pathSegs(fullPath);
  return segs.length > 1 ? segs.slice(0, -1).join(' / ') : '';
};

/** Build the read-only search dataset: every manifest file row plus every
 * indexed folder (so folders are searchable and Type=Folder returns results).
 * Drive links / folder URLs are taken AS-IS from the manifest; only folders that
 * the manifest provides no URL for fall back to the canonical folder URL. */
export function buildSearchRows(fileRows: ManifestRow[], folderRows: FolderIndexRow[] = []): SearchManifestRow[] {
  const out: SearchManifestRow[] = [];
  for (const r of fileRows) {
    const name = r['Raw File Name'] || '';
    const path = r['Full Folder Path'] || '';
    const notes = r['Notes'] || '';
    const link = (r['Google Drive Link'] || '').trim();
    const folderUrl = (r['Folder URL'] || '').trim();
    const fileType = (r['File Type'] || '').trim();
    // A row with no file name / no file link but a folder URL is a folder entry.
    const isFolder = (!name && !link) || /^folder$/i.test(fileType);
    out.push({
      kind: isFolder ? 'folder' : 'file',
      rawFileName: name,
      displayName: r['Professional Display Name'] || '',
      fullFolderPath: path,
      parentFolderPath: r['Parent Folder Path'] || parentOf(path),
      folderName: r['Folder Name'] || '',
      folderId: r['Folder ID'] || '',
      folderUrl,
      fileType: fileType || (isFolder ? 'Folder' : ''),
      fileId: r['File ID'] || '',
      driveLink: link,
      lastUpdated: r['Last Updated'] || '',
      notes,
      ...parseEvidenceMeta(name, path, notes),
    });
  }
  // Add indexed folders that the file manifest doesn't already represent as a row.
  const seenFolderIds = new Set(out.filter((o) => o.kind === 'folder' && o.folderId).map((o) => o.folderId));
  for (const f of folderRows) {
    if (!f.folderId || seenFolderIds.has(f.folderId)) continue;
    out.push({
      kind: 'folder',
      rawFileName: '',
      displayName: f.folderName,
      fullFolderPath: f.fullFolderPath,
      parentFolderPath: parentOf(f.fullFolderPath),
      folderName: f.folderName,
      folderId: f.folderId,
      folderUrl: folderUrlFor(f.folderId),
      fileType: 'Folder',
      fileId: '',
      driveLink: '',
      lastUpdated: '',
      notes: '',
      ...parseEvidenceMeta(f.folderName, f.fullFolderPath, ''),
    });
  }
  return out;
}

/** The Drive ROOT row's Folder URL (depth 0), if the manifest carries one. */
export function rootFolderUrl(rows: ManifestRow[]): string {
  const root = rows.find((r) => Number(r['Folder Depth'] || 0) === 0 && (r['Folder URL'] || '').trim());
  return (root?.['Folder URL'] || '').trim();
}

export interface PacketManifestInput {
  section: string;
  fullFolderPath: string;
  parentFolderPath?: string;
  folderName?: string;
  folderId: string;
  folderDepth?: number;
  displayName: string;
  rawFileName: string;
  fileType: string;
  fileId: string;
  driveLink: string;
  note?: string;
}
export function buildManifestRow(input: PacketManifestInput, nowISO: string): ManifestRow {
  const segs = input.fullFolderPath.split('/').filter(Boolean);
  const folderName = input.folderName || segs[segs.length - 1] || input.section;
  const parent = input.parentFolderPath ?? segs.slice(0, -1).join('/');
  const depth = input.folderDepth ?? Math.max(0, segs.length - 1);
  return {
    'Section / Root Folder': input.section,
    'Full Folder Path': input.fullFolderPath,
    'Parent Folder Path': parent,
    'Folder Name': folderName,
    'Folder ID': input.folderId,
    'Folder URL': folderUrlFor(input.folderId),
    'Folder Depth': String(depth),
    'Professional Display Name': input.displayName,
    'Raw File Name': input.rawFileName,
    'File Type': input.fileType,
    'File ID': input.fileId,
    'Google Drive Link': input.driveLink || fileUrlFor(input.fileId),
    'Last Updated': nowISO,
    'Notes': `${SYSTEM_NOTE_PREFIX} auto-synced on packet generation${input.note ? ' — ' + input.note : ''}`,
  };
}
