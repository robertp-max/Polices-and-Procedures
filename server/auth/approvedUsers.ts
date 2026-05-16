import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { log } from '../logger.js';

export interface ApprovedUser {
  email: string;
  fullName: string;
  sfOrgId: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface AllowlistStatus {
  available: boolean;
  path: string;
  totalDataRows: number;
  malformedRows: number;
  activeRows: number;
  error: string | null;
}

// Module-level cache. Both fields are null until first load or explicit reload.
let _cache: ApprovedUser[] | null = null;
let _status: AllowlistStatus | null = null;

function getAllowlistPath(): string {
  // Read env at call time so reload picks up any path change.
  return resolve(process.env.APPROVED_USERS_CSV_PATH || './config/approved-users.csv');
}

export function normalizeSfOrgId(raw: string): string {
  return String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeEmail(raw: string): string {
  return String(raw || '').trim().toLowerCase();
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

interface ParseResult {
  users: ApprovedUser[];
  totalDataRows: number;
  malformedRows: number;
  error: string | null;
}

function parseFromDisk(csvPath: string): ParseResult {
  let raw: string;

  try {
    raw = readFileSync(csvPath, 'utf-8');
  } catch (err) {
    const msg = (err as Error)?.message || 'Unknown IO error';
    return { users: [], totalDataRows: 0, malformedRows: 0, error: `Approved user allowlist not loaded. File not found or unreadable: ${csvPath} — ${msg}` };
  }

  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);

  if (lines.length < 2) {
    return { users: [], totalDataRows: 0, malformedRows: 0, error: `Approved user allowlist is empty or has no data rows: ${csvPath}` };
  }

  const headerFields = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
  const emailIdx      = headerFields.indexOf('email');
  const fullNameIdx   = headerFields.indexOf('fullname');
  const sfOrgIdIdx    = headerFields.indexOf('sforgid');
  const roleIdx       = headerFields.indexOf('role');
  const departmentIdx = headerFields.indexOf('department');
  const statusIdx     = headerFields.indexOf('status');
  const notesIdx      = headerFields.indexOf('notes');

  if (emailIdx === -1 || sfOrgIdIdx === -1) {
    return { users: [], totalDataRows: 0, malformedRows: 0, error: `Approved user CSV missing required columns (email, sfOrgId): ${csvPath}` };
  }

  const users: ApprovedUser[] = [];
  const totalDataRows = lines.length - 1;
  let malformedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const email   = normalizeEmail(fields[emailIdx] ?? '');
    const sfOrgId = normalizeSfOrgId(fields[sfOrgIdIdx] ?? '');

    // A row is malformed if it is missing either required field after normalization.
    if (!email || !email.includes('@') || !sfOrgId) {
      malformedRows++;
      continue;
    }

    const statusRaw = (fields[statusIdx] ?? '').toLowerCase();
    const status: 'active' | 'inactive' = statusRaw === 'inactive' ? 'inactive' : 'active';

    users.push({
      email,
      fullName:   (fields[fullNameIdx]   ?? '').trim(),
      sfOrgId,
      role:       (fields[roleIdx]       ?? '').trim(),
      department: (fields[departmentIdx] ?? '').trim(),
      status,
      notes:      (fields[notesIdx]      ?? '').trim() || undefined,
    });
  }

  if (users.length === 0) {
    return { users: [], totalDataRows, malformedRows, error: `Approved user CSV parsed but contained 0 valid rows: ${csvPath}` };
  }

  return { users, totalDataRows, malformedRows, error: null };
}

function buildStatus(result: ParseResult, csvPath: string): AllowlistStatus {
  const activeRows = result.users.filter(u => u.status === 'active').length;
  return {
    available: result.error === null && activeRows > 0,
    path: csvPath,
    totalDataRows: result.totalDataRows,
    malformedRows: result.malformedRows,
    activeRows,
    error: result.error,
  };
}

function doLoad(forceReload: boolean): AllowlistStatus {
  if (_status !== null && !forceReload) return _status;

  const csvPath = getAllowlistPath();
  const result  = parseFromDisk(csvPath);
  const status  = buildStatus(result, csvPath);

  _cache  = result.users;
  _status = status;

  // Startup / reload log — never logs raw CSV contents, org IDs, or passwords.
  log.info('auth.approved_users.startup', {
    available:    status.available,
    path:         status.path,
    totalDataRows: status.totalDataRows,
    malformedRows: status.malformedRows,
    activeRows:   status.activeRows,
    ...(status.error ? { error: status.error } : {}),
  });

  return status;
}

/** Load (or return cached) approved users. */
export function loadApprovedUsers(forceReload = false): ApprovedUser[] {
  doLoad(forceReload);
  return _cache ?? [];
}

/** Clear cache and reload from disk. Returns new status. */
export function reloadApprovedUsers(): AllowlistStatus {
  _cache  = null;
  _status = null;
  return doLoad(true);
}

/** Return current allowlist status (loads on first call). */
export function getAllowlistStatus(): AllowlistStatus {
  return doLoad(false);
}

/** Returns true only when allowlist loaded cleanly and has ≥1 active row. */
export function isAllowlistAvailable(): boolean {
  return doLoad(false).available;
}

/** Returns the load error string, or null if loaded successfully. */
export function getLoadError(): string | null {
  return doLoad(false).error;
}

/**
 * Dry-run: parse and validate a CSV file without touching the live cache.
 * Use this to verify a new CSV before deploying it.
 */
export function validateAllowlistCsv(overridePath?: string): AllowlistStatus {
  const csvPath = overridePath ? resolve(overridePath) : getAllowlistPath();
  const result  = parseFromDisk(csvPath);
  const status  = buildStatus(result, csvPath);

  // Log result of the dry-run but do NOT update _cache or _status.
  log.info('auth.approved_users.dry_run', {
    path:          status.path,
    totalDataRows: status.totalDataRows,
    malformedRows: status.malformedRows,
    activeRows:    status.activeRows,
    available:     status.available,
    ...(status.error ? { error: status.error } : {}),
  });

  return status;
}

/** Look up an active approved user by normalized email + normalized SF Org ID. */
export function findApprovedUser(email: string, sfOrgId: string): ApprovedUser | null {
  const users = loadApprovedUsers();
  if (users.length === 0) return null;

  const normEmail  = normalizeEmail(email);
  const normOrgId  = normalizeSfOrgId(sfOrgId);
  if (!normEmail || !normOrgId) return null;

  return users.find(
    u => u.email === normEmail
      && u.sfOrgId === normOrgId
      && u.status === 'active',
  ) ?? null;
}

/** Count of active rows in the currently loaded allowlist. */
export function getApprovedUserCount(): number {
  return loadApprovedUsers().filter(u => u.status === 'active').length;
}

export interface AllowlistAuditUser {
  email: string;
  sfOrgId?: string;
}
export interface AllowlistAuditResult {
  totalChecked: number;
  matchedActive: number;
  matchedInactive: number;
  notOnAllowlist: number;
  missingOrgId: number;
  allowlistUnavailable: boolean;
}

/**
 * Audit-only reconciliation: given a list of "existing users" (e.g. from
 * Cognito / Dynamo), compare each against the loaded allowlist and emit
 * structured log events for mismatches. NEVER mutates user state. NEVER
 * disables users. Per MVP plan L1208 — "audit existing users against CSV
 * — never auto-disable".
 *
 * Returns a summary so callers can persist a report if needed; does not
 * mutate anything.
 */
export function auditAllowlistCoverage(existingUsers: AllowlistAuditUser[]): AllowlistAuditResult {
  if (!isAllowlistAvailable()) {
    log.info('auth.allowlist_audit.unavailable', {});
    return { totalChecked: 0, matchedActive: 0, matchedInactive: 0, notOnAllowlist: 0, missingOrgId: 0, allowlistUnavailable: true };
  }

  const users = loadApprovedUsers();
  let totalChecked = 0;
  let matchedActive = 0;
  let matchedInactive = 0;
  let notOnAllowlist = 0;
  let missingOrgId = 0;

  for (const u of existingUsers) {
    totalChecked++;
    const email = normalizeEmail(u.email);
    const sfOrgId = u.sfOrgId ? normalizeSfOrgId(u.sfOrgId) : '';

    if (!sfOrgId) {
      missingOrgId++;
      log.info('auth.allowlist_audit.missing_org_id', { email });
      continue;
    }

    const match = users.find(
      au => au.email === email && au.sfOrgId === sfOrgId
    );

    if (!match) {
      notOnAllowlist++;
      log.info('auth.allowlist_audit.not_on_allowlist', { email });
    } else if (match.status === 'inactive') {
      matchedInactive++;
      log.info('auth.allowlist_audit.matched_inactive', { email });
    } else {
      matchedActive++;
      // no per-row log for active (noise)
    }
  }

  const result: AllowlistAuditResult = {
    totalChecked,
    matchedActive,
    matchedInactive,
    notOnAllowlist,
    missingOrgId,
    allowlistUnavailable: false,
  };
  log.info('auth.allowlist_audit.summary', result);
  return result;
}
