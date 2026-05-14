/**
 * pdfAppendUtil — Utilities for multi-signer PDF accumulation.
 *
 * Root cause fix (2026-05-12): The previous implementation round-tripped
 * html2pdf.js output through pdf-lib and then used
 * `btoa(String.fromCharCode(...pdfBytes))` which throws RangeError
 * (maximum call stack exceeded) for any PDF > ~100KB.
 *
 * Now:
 *   - First-signer PDF: html2pdf.js → Blob → FileReader.readAsDataURL
 *     (no pdf-lib intermediary, no spread-based base64)
 *   - Multi-signer accumulation: uses pdf-lib only for page manipulation,
 *     with chunked base64 encoding for output
 */

import { PDFDocument } from 'pdf-lib';

/* ─── Safe base64 helpers (no call-stack blowup) ────────────────── */

function uint8ToBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    parts.push(String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK))));
  }
  return btoa(parts.join(''));
}

function base64ToUint8(b64: string): Uint8Array {
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/* ─── Core html2pdf.js render (shared by all callers) ───────────── */

const HTML2PDF_OPTS = {
  margin: [0.4, 0.4, 0.6, 0.4] as [number, number, number, number],
  image: { type: 'jpeg' as const, quality: 0.82 },
  html2canvas: { scale: 1.2, useCORS: true, letterRendering: true, logging: false, windowWidth: 816 },
  jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
};

/**
 * Render HTML to a PDF Blob using html2pdf.js.
 * This is the ONLY place html2pdf.js is called.
 *
 * Strategy: We inject the full HTML into an iframe instead of an
 * off-screen div. This gives the content its own document context so
 * Tailwind/CI CSS applies correctly without interference from the
 * host page, and html2canvas can capture the rendered content
 * reliably.
 */
async function renderHtmlToPdfBlob(html: string, filename: string): Promise<Blob> {
  const { default: html2pdf } = await import('html2pdf.js');

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:816px;height:1056px;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Cannot access iframe document');
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for images to load inside the iframe
    await new Promise<void>((resolve) => {
      const imgs = Array.from(iframeDoc.querySelectorAll('img'));
      if (imgs.length === 0) { resolve(); return; }
      let loaded = 0;
      const check = () => { if (++loaded >= imgs.length) resolve(); };
      const timer = setTimeout(resolve, 8000);
      imgs.forEach(img => {
        if (img.complete) check();
        else { img.onload = check; img.onerror = check; }
      });
      void timer;
    });

    // Allow layout/paint to settle
    await new Promise(r => setTimeout(r, 500));

    const body = iframeDoc.body;
    const root = body.querySelector('.ecign-print-root') || body;

    const blob: Blob = await html2pdf()
      .set({
        ...HTML2PDF_OPTS,
        filename,
        html2canvas: {
          ...HTML2PDF_OPTS.html2canvas,
          // Render the iframe's own window context
          windowWidth: 816,
          windowHeight: 1056,
          foreignObjectRendering: false,
          removeContainer: false,
        },
      })
      .from(root as HTMLElement)
      .outputPdf('blob');

    return blob;
  } finally {
    document.body.removeChild(iframe);
  }
}

/* ─── Public API ────────────────────────────────────────────────── */

export async function loadPdfFromDataUrl(dataUrl: string): Promise<PDFDocument> {
  const base64Match = dataUrl.match(/^data:application\/pdf;base64,(.+)$/);
  if (!base64Match) throw new Error('Invalid PDF data URL format');
  return PDFDocument.load(base64ToUint8(base64Match[1]));
}

export async function pdfToDataUrl(pdf: PDFDocument): Promise<string> {
  const pdfBytes = await pdf.save();
  return `data:application/pdf;base64,${uint8ToBase64(new Uint8Array(pdfBytes))}`;
}

export async function pdfToBlobUrl(pdf: PDFDocument): Promise<string> {
  const pdfBytes = await pdf.save();
  const buffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(buffer).set(pdfBytes);
  return URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
}

export async function htmlToPdfDocument(html: string, filename?: string): Promise<PDFDocument> {
  const blob = await renderHtmlToPdfBlob(html, filename || 'document.pdf');
  return PDFDocument.load(await blob.arrayBuffer());
}

export async function appendPages(basePdf: PDFDocument, appendPdf: PDFDocument): Promise<PDFDocument> {
  const copiedPages = await basePdf.copyPages(appendPdf, appendPdf.getPageIndices());
  for (const page of copiedPages) basePdf.addPage(page);
  return basePdf;
}

export function removeLastPages(pdf: PDFDocument, count: number): PDFDocument {
  const totalPages = pdf.getPageCount();
  for (let i = 0; i < count && pdf.getPageCount() > 0; i++) {
    pdf.removePage(totalPages - 1 - i);
  }
  return pdf;
}

export async function accumulateSignerPdf(opts: {
  existingPdfDataUrl: string;
  formPageCount: number;
  existingCertPageCount: number;
  newCertHtml: string;
  updatedAuditHtml: string;
  updatedManifestHtml: string;
  updatedRosterHtml: string;
  filename: string;
}): Promise<string> {
  const existingPdf = await loadPdfFromDataUrl(opts.existingPdfDataUrl);
  const totalExisting = existingPdf.getPageCount();
  const pagesToKeep = opts.formPageCount + opts.existingCertPageCount;
  if (totalExisting > pagesToKeep) {
    for (let i = totalExisting - 1; i >= pagesToKeep; i--) existingPdf.removePage(i);
  }

  if (opts.newCertHtml) {
    const certPdf = await htmlToPdfDocument(opts.newCertHtml, 'cert.pdf');
    await appendPages(existingPdf, certPdf);
  }
  if (opts.updatedAuditHtml) {
    const auditPdf = await htmlToPdfDocument(opts.updatedAuditHtml, 'audit.pdf');
    await appendPages(existingPdf, auditPdf);
  }
  if (opts.updatedManifestHtml) {
    const manifestPdf = await htmlToPdfDocument(opts.updatedManifestHtml, 'manifest.pdf');
    await appendPages(existingPdf, manifestPdf);
  }
  if (opts.updatedRosterHtml) {
    const rosterPdf = await htmlToPdfDocument(opts.updatedRosterHtml, 'roster.pdf');
    await appendPages(existingPdf, rosterPdf);
  }

  return pdfToDataUrl(existingPdf);
}

/**
 * Generate a fresh first-signer PDF from full HTML packet.
 *
 * Does NOT round-trip through pdf-lib. Goes directly:
 *   html2pdf.js → Blob → FileReader.readAsDataURL
 * This avoids the base64 stack-overflow and preserves all embedded
 * images, fonts, and styling faithfully.
 */
export async function generateFirstSignerPdf(
  fullPacketHtml: string,
  filename: string,
): Promise<{ pdfDataUrl: string; blobUrl: string }> {
  const blob = await renderHtmlToPdfBlob(fullPacketHtml, filename);
  const blobUrl = URL.createObjectURL(blob);
  const pdfDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
  return { pdfDataUrl, blobUrl };
}
