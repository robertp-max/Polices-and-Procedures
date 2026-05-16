/**
 * MVP-P0-ECIGN-002 — Stored signed form snapshot capture.
 *
 * Strategy (chosen per Wave 3 exploration): HTML byte snapshot.
 *
 * At sign time, the caller passes a fully-rendered HTML string representing
 * the signed form packet (typically the output of `buildPacketHtml(...)` in
 * FormSigningWorkspace). This helper encodes the HTML as a `data:text/html`
 * URL ready for upload through the existing evidence pipeline
 * (`regulatoryExecutionStore.uploadEvidence` → `stashDemoEvidenceDataUrl`).
 *
 * Why HTML and not PDF:
 *   - No new heavy dependencies (html2pdf.js / pdf-lib are bundled but
 *     produce non-deterministic bytes through the html2canvas pipeline,
 *     which violates ECIGN-002 byte-stable retrieval).
 *   - Matches the existing `signed_package` artifact flow already used in
 *     finalize.
 *   - HTML bytes are byte-stable across reads when stored as data URL.
 *   - Browser print/save-to-PDF remains available for user export.
 *
 * Migration path: when the backend signing pipeline lands (Strategy 4 — see
 * Wave 3 exploration §D), swap this helper for a backend call returning a
 * canonical PDF artifact. Consumer call site (FormSigningWorkspace) stays
 * unchanged.
 *
 * Per MVP plan L1208 ("ECIGN-002 — cache version bump; old browsers re-init;
 * no data loss"): cache version is governed by Wave 2's
 * `EVIDENCE_BLOB_DB_VERSION` constant. This helper does not own version.
 */

export type SignedSnapshotEncoding = 'utf8' | 'base64';

export interface CaptureSignedFormSnapshotInput {
  /** Fully-rendered HTML of the signed packet. Typically buildPacketHtml(record). */
  packetHtml: string;
  /** Canonical form instance id this snapshot represents. */
  formInstanceId: string;
  /** Optional descriptive filename (used by EvidenceDoc UI). */
  filename?: string;
  /**
   * Encoding for the data URL. Default 'utf8' (URI-encoded). Pass 'base64'
   * if the HTML may contain characters that bloat under URI encoding
   * (e.g. lots of non-ASCII). 'base64' is safer for very large payloads.
   */
  encoding?: SignedSnapshotEncoding;
}

export interface SignedSnapshotArtifact {
  /** Ready-to-upload data URL: `data:text/html;charset=utf-8,...` or `data:text/html;base64,...`. */
  dataUrl: string;
  /** MIME type for the EvidenceDoc. Always 'text/html'. */
  mimeType: string;
  /** Recommended filename for the EvidenceDoc. */
  filename: string;
  /** Approximate byte size of the encoded data URL (string length). */
  approxBytes: number;
  /** Length of the original (un-encoded) HTML in bytes (UTF-8). */
  rawHtmlBytes: number;
  /** Echo of formInstanceId for caller convenience. */
  formInstanceId: string;
}

/**
 * Build a byte-stable snapshot artifact from a fully-rendered packet HTML
 * string. Pure function — no DOM access, no fetch, no timing.
 *
 * @example
 *   const html = buildPacketHtml(record);
 *   const snapshot = captureSignedFormSnapshot({
 *     packetHtml: html,
 *     formInstanceId: 'EVT-FORM-001',
 *     filename: 'Signed-FORM-A-001.html',
 *   });
 *   store.uploadEvidence(eventId, {
 *     name: snapshot.filename,
 *     mimeType: snapshot.mimeType,
 *     size: snapshot.approxBytes,
 *     localDataUrl: snapshot.dataUrl,
 *     linkedFormInstanceId: snapshot.formInstanceId,
 *     artifactType: 'signed_package',
 *     // ... other EvidenceDoc fields
 *   });
 */
export function captureSignedFormSnapshot(
  input: CaptureSignedFormSnapshotInput,
): SignedSnapshotArtifact {
  const { packetHtml, formInstanceId, filename, encoding = 'utf8' } = input;

  if (!formInstanceId || formInstanceId.trim() === '') {
    throw new Error('captureSignedFormSnapshot: formInstanceId is required');
  }

  const rawHtmlBytes = new TextEncoder().encode(packetHtml).length;

  // NOTE: For payloads >10MB raw, callers may pre-check rawHtmlBytes before
  // calling to decide on chunking or backend path; IDB layer will accept it.

  let finalEncoding: SignedSnapshotEncoding = encoding;
  let dataUrl: string;

  if (finalEncoding === 'base64') {
    try {
      // Unicode-safe base64: encode to UTF-8 bytes then base64
      const utf8Bytes = new TextEncoder().encode(packetHtml);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64 = btoa(binary);
      dataUrl = `data:text/html;base64,${base64}`;
    } catch {
      // Fallback to UTF-8 URI encoding on any base64 failure
      finalEncoding = 'utf8';
      dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(packetHtml)}`;
    }
  } else {
    dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(packetHtml)}`;
  }

  const sanitizedFilename = (filename || `Signed-Form-${formInstanceId}.html`)
    .replace(/[^A-Za-z0-9-_.]/g, '-');

  return {
    dataUrl,
    mimeType: 'text/html',
    filename: sanitizedFilename,
    approxBytes: dataUrl.length,
    rawHtmlBytes,
    formInstanceId,
  };
}

/**
 * Convenience helper that detects which encoding to prefer based on payload
 * characteristics. Use this when the caller doesn't know the right encoding
 * up front.
 *   - Returns 'base64' if the HTML contains > 5% non-ASCII bytes (under
 *     URI encoding, those bloat by ~3x; base64 bloats by ~1.33x).
 *   - Returns 'utf8' otherwise (URI encoded; faster to encode/decode).
 */
export function recommendSnapshotEncoding(packetHtml: string): SignedSnapshotEncoding {
  const sample = packetHtml.slice(0, 4096);
  if (sample.length === 0) return 'utf8';

  let nonAscii = 0;
  for (let i = 0; i < sample.length; i++) {
    if (sample.charCodeAt(i) > 127) nonAscii++;
  }

  const ratio = nonAscii / sample.length;
  return ratio > 0.05 ? 'base64' : 'utf8';
}
