import { PDFDocument } from 'pdf-lib';
import { extractText, getDocumentProxy } from 'unpdf';

/* ═══════════════════════════════════════════════════════════════════════════
   PDF source extraction — pulls the REAL content out of an uploaded document so
   the packet pipeline reads the assessment, not just a handful of cover form
   fields. Two complementary signals:
     - AcroForm fields  (pdf-lib)  : any pre-filled form values (e.g. cover.*)
     - Page text        (unpdf)    : the full clinical narrative across all pages
   Text is what makes "different patient -> different output" possible; the prior
   pipeline only read the 6 cover AcroForm fields and ignored everything else.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PdfExtraction {
  pageCount: number;
  text: string;                       // full normalized page text
  pages: string[];                    // per-page normalized text
  formFields: Record<string, string>; // AcroForm text-field name -> value
  charCount: number;
  hasText: boolean;                   // false => likely a scanned/image PDF (OCR needed)
}

/** Read AcroForm text fields (best-effort; non-text fields are skipped). */
async function readFormFields(bytes: Uint8Array): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    for (const f of doc.getForm().getFields()) {
      const name = f.getName();
      const getText = (f as { getText?: () => string | undefined }).getText;
      if (typeof getText === 'function') {
        const v = getText.call(f);
        if (v && String(v).trim()) out[name] = String(v).trim();
      }
    }
  } catch { /* no form / unreadable form: text is the primary signal */ }
  return out;
}

/** Repair pdfjs letter-spacing artifacts ("P A T I E N T") and collapse whitespace. */
export function normalizePdfText(raw: string): string {
  let s = String(raw ?? '');
  // Join runs of single characters separated by spaces, iteratively for long runs.
  for (let i = 0; i < 6; i++) {
    const next = s.replace(/(^|\s)((?:\S\s){2,}\S)(?=\s|$)/g, (_m, pre: string, run: string) => pre + run.replace(/\s+/g, ''));
    if (next === s) break;
    s = next;
  }
  return s.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/** Extract full text + AcroForm fields from a PDF buffer. */
export async function extractPdf(buffer: Buffer | Uint8Array): Promise<PdfExtraction> {
  // pdf-lib and pdfjs each DETACH the ArrayBuffer they're handed, so give each
  // consumer a FRESH copy. Note: Buffer.slice() returns a shared view (not a
  // copy), so use Uint8Array.from to guarantee an independent buffer.
  const fresh = () => Uint8Array.from(buffer);
  const formFields = await readFormFields(fresh());

  let pages: string[] = [];
  let pageCount = 0;
  let merged = '';
  try {
    const pdf = await getDocumentProxy(fresh());
    pageCount = pdf.numPages;
    const full = await extractText(pdf, { mergePages: true });
    merged = String(full.text ?? '');
    try {
      const perPage = await extractText(pdf, { mergePages: false });
      pages = Array.isArray(perPage.text) ? perPage.text.map((t) => String(t ?? '')) : [merged];
    } catch { pages = merged ? [merged] : []; }
  } catch { /* text layer unreadable: treated as scanned (hasText=false) */ }

  const text = normalizePdfText(merged || pages.join('\n\n'));
  return {
    pageCount: pageCount || pages.length,
    text,
    pages: pages.map(normalizePdfText),
    formFields,
    charCount: text.length,
    hasText: text.replace(/\s/g, '').length > 40,
  };
}
