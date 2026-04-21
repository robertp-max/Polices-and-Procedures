import path from 'node:path';
import fs from 'node:fs';

/* ═══════════════════════════════════════════════════════════════
   Corpus source discovery.

   Enumerates policy / form / appendix files on disk. Deliberately
   explicit about WHAT gets indexed so we never accidentally pull in
   UI mock HTML or large image assets.
   ═══════════════════════════════════════════════════════════════ */

export interface SourceFile {
  /** Absolute path on disk. */
  path: string;
  /** Parser key: how the ingester should read this file. */
  kind: 'md' | 'txt-form' | 'docx' | 'txt-policy';
  /** Intended document type in the corpus. */
  docType: 'policy' | 'form' | 'appendix';
}

const FORM_FOLDER = 'Forns'; // note: repo spelling preserved
const POLICIES_FOLDER = 'Policies';

function safeReadDir(dir: string): fs.Dirent[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/**
 * Discover every ingestable file under `<repoRoot>/Builder/*`.
 * Keeps ingestion deterministic (sorted) so rebuilds are stable.
 */
export function discoverSources(repoRoot: string): SourceFile[] {
  const builderRoot = path.join(repoRoot, 'Builder');
  const found: SourceFile[] = [];

  // 1) Policy markdown files sitting directly under Builder/
  for (const entry of safeReadDir(builderRoot)) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    if (/\.(md)$/i.test(name)) {
      // Filter out non-policy md files (currently none, but be explicit).
      if (/^(CI Brand|CIHHPP|README)/i.test(name)) continue;
      found.push({
        path: path.join(builderRoot, name),
        kind: 'md',
        docType: 'policy',
      });
    } else if (name === 'CL-OA-006-extracted.txt') {
      found.push({
        path: path.join(builderRoot, name),
        kind: 'txt-policy',
        docType: 'policy',
      });
    }
  }

  // 2) Policy .docx files (and .md) under Builder/Policies/
  const policiesDir = path.join(builderRoot, POLICIES_FOLDER);
  for (const entry of safeReadDir(policiesDir)) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    const full = path.join(policiesDir, entry.name);
    if (ext === '.docx') {
      // Skip binary / cover assets by name.
      if (/brand kit|design system|logo/i.test(entry.name)) continue;
      found.push({ path: full, kind: 'docx', docType: 'policy' });
    } else if (ext === '.md') {
      if (/^(CI Brand|CIHHPP)/i.test(entry.name)) continue;
      found.push({ path: full, kind: 'md', docType: 'policy' });
    }
    // Deliberately ignore .html / .png / .pdf here — those are UI/brand assets.
  }

  // 3) Form exports under Builder/Forns/
  const formsDir = path.join(builderRoot, FORM_FOLDER);
  for (const entry of safeReadDir(formsDir)) {
    if (!entry.isFile()) continue;
    if (!/\.txt$/i.test(entry.name)) continue;
    // Skip index / map files — they're catalogues, not documents.
    if (/^FORMS_/.test(entry.name)) continue;
    // Skip anything that doesn't look like a form ID (XX-FM-###.txt).
    if (!/^[A-Z]{2}-FM-\d{3}\.txt$/i.test(entry.name)) continue;
    found.push({
      path: path.join(formsDir, entry.name),
      kind: 'txt-form',
      docType: 'form',
    });
  }

  return found.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Lightweight file fingerprint used to decide whether a file needs
 * re-parsing/re-embedding. Combining size + mtime is sufficient for a
 * local MVP without hashing every byte on every run.
 */
export function fingerprint(filePath: string): string {
  const st = fs.statSync(filePath);
  return `${st.size}:${st.mtimeMs}`;
}
