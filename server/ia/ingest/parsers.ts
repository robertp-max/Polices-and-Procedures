import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';

/* ═══════════════════════════════════════════════════════════════
   Per-format text extractors. Each returns a plain UTF-8 string;
   downstream normalization handles heading unification and cleanup.
   ═══════════════════════════════════════════════════════════════ */

export async function extractText(
  filePath: string,
  kind: 'md' | 'txt-form' | 'docx' | 'txt-policy',
): Promise<string> {
  switch (kind) {
    case 'md':
    case 'txt-form':
    case 'txt-policy':
      return fs.promises.readFile(filePath, 'utf8');
    case 'docx':
      return extractDocx(filePath);
  }
}

async function extractDocx(filePath: string): Promise<string> {
  // mammoth.extractRawText preserves paragraph breaks while dropping
  // most formatting; its output is stable enough for header detection
  // and section-aware chunking.
  const { value } = await mammoth.extractRawText({ path: filePath });
  return value ?? '';
}

/** Simple content hash for change detection — djb2 over UTF-8 bytes. */
export function hashContent(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  }
  // Also incorporate byte-length to further disambiguate.
  return `${(hash >>> 0).toString(16)}:${Buffer.byteLength(text, 'utf8')}`;
}

export function relativeFrom(repoRoot: string, filePath: string): string {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}
