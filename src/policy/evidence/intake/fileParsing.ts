/**
 * Source-file parsing adapters (Section 4).
 *
 * Pure, dependency-free parsers for the structured/text formats that carry
 * per-record created dates: JSON, CSV, TSV, Markdown, TXT. These run safely in
 * the browser and under tsx.
 *
 * Formats requiring an approved server-side parser:
 *   - DOCX  → server `mammoth` extractor (server/ia/ingest/parsers.ts)
 *   - XLS/XLSX, PDF → NO approved parser exists in the repo. These are accepted,
 *     MIME/size-validated, lineage-tracked, and routed, but extraction is
 *     fail-closed: parseStatus = 'needs_extraction'. We never silently OCR a
 *     scanned PDF or fabricate spreadsheet rows.
 *
 * MIME validation checks magic bytes where cheaply possible (not extension
 * alone); filenames are sanitized; a configurable size limit is enforced.
 */

export type SourceFileFormat = 'json' | 'csv' | 'tsv' | 'markdown' | 'txt' | 'xlsx' | 'xls' | 'pdf' | 'docx' | 'unknown';

export type ParseStatus = 'parsed' | 'needs_extraction' | 'unsupported' | 'failed' | 'empty';

export interface ParsedRecordCell {
  /** sourcePointer for this record (row:N, sheet:S,row:N, $.path, page:N, heading:H). */
  pointer: string;
  /** Flat field map for structured records (column header → value). */
  fields: Record<string, unknown>;
  /** Raw text snippet for unstructured records (used for classification). */
  text?: string;
}

export interface ParsedFile {
  format: SourceFileFormat;
  parseStatus: ParseStatus;
  records: ParsedRecordCell[];
  /** Distinct column headers / keys observed (classification signal). */
  columnHeaders: string[];
  /** Human note when extraction is gated or failed. */
  note?: string;
}

export interface ParseInput {
  fileName: string;
  /** Declared MIME type (validated, not trusted alone). */
  mimeType?: string;
  /** Decoded UTF-8 text content for text formats; undefined for binary. */
  text?: string;
  /** First bytes (for magic-byte sniffing of binary formats). */
  headBytes?: Uint8Array;
  byteLength: number;
}

/** Default configurable size limit (32 MB matches the Brad upload body cap). */
export const DEFAULT_MAX_FILE_BYTES = 32 * 1024 * 1024;

const EXTENSION_FORMAT: Record<string, SourceFileFormat> = {
  json: 'json', csv: 'csv', tsv: 'tsv', md: 'markdown', markdown: 'markdown', txt: 'txt', text: 'txt',
  xlsx: 'xlsx', xls: 'xls', pdf: 'pdf', docx: 'docx',
};

export function sanitizeFileName(name: string): string {
  const raw = String(name ?? 'file');
  const dot = raw.lastIndexOf('.');
  const ext = dot > 0 ? raw.slice(dot + 1).replace(/[^A-Za-z0-9]/g, '').slice(0, 8) : '';
  const stem = raw
    .slice(0, dot > 0 ? dot : raw.length)
    .normalize('NFKD')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\.\.+/g, '-') // defeat path traversal in the name itself
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 120) || 'file';
  return ext ? `${stem}.${ext.toLowerCase()}` : stem;
}

export function detectFormat(fileName: string, mimeType?: string, headBytes?: Uint8Array): SourceFileFormat {
  const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : '';
  const byExt = EXTENSION_FORMAT[ext] ?? 'unknown';

  // Magic-byte sniffing overrides a lying extension for binary formats.
  if (headBytes && headBytes.length >= 4) {
    const b = headBytes;
    // %PDF
    if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'pdf';
    // PK\x03\x04 (zip) → xlsx/docx; rely on extension to disambiguate.
    if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) {
      return byExt === 'docx' ? 'docx' : 'xlsx';
    }
    // OLE2 (legacy .xls)
    if (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return 'xls';
  }

  const mime = (mimeType ?? '').toLowerCase();
  if (mime.includes('application/json')) return 'json';
  if (mime.includes('text/csv')) return 'csv';
  if (mime.includes('spreadsheet') || mime.includes('excel')) return byExt === 'xls' ? 'xls' : 'xlsx';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('wordprocessingml') || mime === 'application/msword') return 'docx';
  if (mime.includes('markdown')) return 'markdown';
  return byExt;
}

/* ─── Pure text-format parsers ─────────────────────────────────── */

/** RFC-4180-ish CSV/TSV parser supporting quoted fields and embedded delimiters. */
export function parseDelimited(text: string, delimiter: ',' | '\t'): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === delimiter) { row.push(field); field = ''; continue; }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v.trim() !== '') || rows.length === 0) rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  const headers = (rows.shift() ?? []).map((h) => h.trim());
  const dataRows = rows.filter((r) => r.some((v) => v.trim() !== ''));
  return { headers, rows: dataRows };
}

function recordsFromDelimited(text: string, delimiter: ',' | '\t'): { records: ParsedRecordCell[]; headers: string[] } {
  const { headers, rows } = parseDelimited(text, delimiter);
  const records = rows.map((cols, idx) => {
    const fields: Record<string, unknown> = {};
    headers.forEach((h, i) => { fields[h || `col${i + 1}`] = cols[i] ?? ''; });
    return {
      // 1-based, +1 for the header line, so the first data row is "row:2"
      pointer: `row:${idx + 2}`,
      fields,
      text: cols.join(' '),
    };
  });
  return { records, headers };
}

/** Walk a JSON value, emitting one record per object found at array leaves. */
function recordsFromJson(value: unknown): { records: ParsedRecordCell[]; headers: Set<string> } {
  const records: ParsedRecordCell[] = [];
  const headers = new Set<string>();

  const emit = (obj: Record<string, unknown>, path: string) => {
    for (const k of Object.keys(obj)) headers.add(k);
    records.push({ pointer: path, fields: obj, text: JSON.stringify(obj) });
  };

  const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);

  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`));
      return;
    }
    if (isPlainObject(node)) {
      // Treat an object whose values are scalars/arrays-of-scalars as a record;
      // also descend into array-valued properties (e.g. $.complaints[14]).
      const hasNestedArray = Object.values(node).some(
        (v) => Array.isArray(v) && v.some((x) => x && typeof x === 'object'),
      );
      if (!hasNestedArray) { emit(node, path); return; }
      emit(node, path);
      for (const [k, v] of Object.entries(node)) {
        if (Array.isArray(v) && v.some((x) => x && typeof x === 'object')) walk(v, `${path}.${k}`);
      }
    }
  };

  if (Array.isArray(value)) walk(value, '$');
  else if (isPlainObject(value)) {
    // Prefer top-level array properties as the record collections.
    const arrayProps = Object.entries(value).filter(([, v]) => Array.isArray(v));
    if (arrayProps.length > 0) {
      for (const [k, v] of arrayProps) walk(v, `$.${k}`);
    } else {
      walk(value, '$');
    }
  }
  return { records, headers };
}

/**
 * Recover the largest valid JSON value from text that may carry leading/trailing
 * prose around an embedded JSON blob (mirrors server/sourceExtraction.ts's
 * parseJsonLoose). Shrinks the candidate slice from the end until it parses.
 */
function parseJsonLoose(text: string): unknown | null {
  const start = text.search(/[[{]/);
  if (start < 0) return null;
  for (let end = text.length; end > start; end--) {
    const slice = text.slice(start, end);
    if (!/[\]}]\s*$/.test(slice)) continue;
    try { return JSON.parse(slice); } catch { /* keep shrinking */ }
  }
  return null;
}

/** Markdown: emit one record per list item / table row under a heading. */
function recordsFromMarkdown(text: string): ParsedRecordCell[] {
  const lines = text.split(/\r?\n/);
  const records: ParsedRecordCell[] = [];
  let heading = 'root';
  let itemIndex = 0;
  for (const line of lines) {
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    if (h) { heading = h[1].trim(); itemIndex = 0; continue; }
    const li = /^\s*(?:[-*+]|\d+\.)\s+(.*)$/.exec(line);
    if (li && li[1].trim()) {
      itemIndex += 1;
      records.push({
        pointer: `heading:${heading},item:${itemIndex}`,
        fields: { heading, item: li[1].trim() },
        text: li[1].trim(),
      });
    }
  }
  if (records.length === 0 && text.trim()) {
    records.push({ pointer: 'heading:root,item:1', fields: { text: text.trim().slice(0, 4000) }, text: text.trim() });
  }
  return records;
}

export function parseSourceFile(input: ParseInput): ParsedFile {
  if (input.byteLength > DEFAULT_MAX_FILE_BYTES) {
    return { format: 'unknown', parseStatus: 'failed', records: [], columnHeaders: [], note: `File exceeds the ${Math.round(DEFAULT_MAX_FILE_BYTES / (1024 * 1024))} MB limit.` };
  }
  const format = detectFormat(input.fileName, input.mimeType, input.headBytes);

  switch (format) {
    case 'json': {
      if (!input.text) return { format, parseStatus: 'empty', records: [], columnHeaders: [], note: 'No text content for JSON parse.' };
      try {
        const value = JSON.parse(input.text);
        const { records, headers } = recordsFromJson(value);
        if (records.length === 0) return { format, parseStatus: 'empty', records: [], columnHeaders: [], note: 'JSON contained no record objects.' };
        return { format, parseStatus: 'parsed', records, columnHeaders: [...headers] };
      } catch (e) {
        // Strict JSON.parse failed (e.g. a document mixing prose with an
        // embedded JSON blob). Do NOT drop the source: recover the largest
        // embedded JSON value if one exists, and always keep a plain-text
        // fallback record so the raw content stays reviewable — never
        // silently return empty fields when source text exists.
        const parseError = (e as Error).message;
        const textRecord: ParsedRecordCell = { pointer: 'page:1', fields: { text: input.text.slice(0, 8000) }, text: input.text };
        const recovered = parseJsonLoose(input.text);
        if (recovered != null) {
          const { records, headers } = recordsFromJson(recovered);
          return {
            format,
            parseStatus: 'parsed',
            records: [...records, textRecord],
            columnHeaders: [...headers],
            note: `Invalid JSON (${parseError}). Recovered a partial JSON value from the source and kept the full text as a fallback record — verify extracted fields manually.`,
          };
        }
        return {
          format,
          parseStatus: 'parsed',
          records: [textRecord],
          columnHeaders: [],
          note: `Invalid JSON (${parseError}). Fell back to plain-text parsing so source content is not lost — no source evidence was structured, verify manually.`,
        };
      }
    }
    case 'csv':
    case 'tsv': {
      if (!input.text) return { format, parseStatus: 'empty', records: [], columnHeaders: [] };
      const { records, headers } = recordsFromDelimited(input.text, format === 'tsv' ? '\t' : ',');
      if (records.length === 0) return { format, parseStatus: 'empty', records: [], columnHeaders: headers, note: 'No data rows found.' };
      return { format, parseStatus: 'parsed', records, columnHeaders: headers };
    }
    case 'markdown': {
      if (!input.text) return { format, parseStatus: 'empty', records: [], columnHeaders: [] };
      const records = recordsFromMarkdown(input.text);
      return { format, parseStatus: records.length ? 'parsed' : 'empty', records, columnHeaders: ['heading', 'item'] };
    }
    case 'txt': {
      if (!input.text || !input.text.trim()) return { format, parseStatus: 'empty', records: [], columnHeaders: [] };
      return {
        format,
        parseStatus: 'parsed',
        records: [{ pointer: 'page:1', fields: { text: input.text.slice(0, 8000) }, text: input.text }],
        columnHeaders: [],
      };
    }
    case 'docx':
      return {
        format,
        parseStatus: 'needs_extraction',
        records: [],
        columnHeaders: [],
        note: 'DOCX requires server-side extraction (mammoth). Submit through the server intake endpoint for text extraction.',
      };
    case 'xls':
    case 'xlsx':
      return {
        format,
        parseStatus: 'needs_extraction',
        records: [],
        columnHeaders: [],
        note: 'Spreadsheet extraction is not yet wired to an approved parser. The file is accepted and lineage-tracked; export the sheet to CSV for full record-level parsing, or wait for the server XLSX extractor.',
      };
    case 'pdf':
      return {
        format,
        parseStatus: 'needs_extraction',
        records: [],
        columnHeaders: [],
        note: 'PDF text extraction is not available (no approved extractor / OCR service). Marked for supported extraction or user review — content is never silently OCR-ed.',
      };
    default:
      return { format: 'unknown', parseStatus: 'unsupported', records: [], columnHeaders: [], note: 'Unsupported file format.' };
  }
}

/** Formats that this build can fully parse client-side into source records. */
export const FULLY_PARSEABLE_FORMATS: SourceFileFormat[] = ['json', 'csv', 'tsv', 'markdown', 'txt'];
