/* ═══════════════════════════════════════════════════════════════
   Text normalization shared by every parser.

   Goals:
     - unify line endings
     - collapse excessive blank lines (preserving paragraph boundaries)
     - neutralize page headers/footers that frequently appear in docx
     - keep markdown tables & section numbers intact (the ingest
       metadata extractor needs them)
   ═══════════════════════════════════════════════════════════════ */

const PAGE_FOOTER_PATTERNS = [
  /Page \d+ of \d+/gi,
  /Care Indeed Home Health Care, Inc\. · Confidential/gi,
];

export function normalizeText(raw: string): string {
  let text = raw.replace(/\r\n?/g, '\n');

  for (const pattern of PAGE_FOOTER_PATTERNS) {
    text = text.replace(pattern, '');
  }

  // Trim trailing whitespace per line.
  text = text
    .split('\n')
    .map(line => line.replace(/[ \t]+$/g, ''))
    .join('\n');

  // Collapse 3+ blank lines down to 2.
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim() + '\n';
}
