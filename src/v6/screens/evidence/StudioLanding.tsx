import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CheckCircle2, CloudUpload, ExternalLink, Loader2, Upload, XCircle } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { CalendarApi, type EvidenceHealthResponse } from '@/policy/services/calendarApi';
import {
  buildEvidenceIdentityScope, buildIdempotencyKey, detectFormat, extractRecordFromCell,
  parseSourceFile, sanitizeFileName, type EvidenceSourceRecord, type SourceSystem,
} from '@/policy/evidence/intake';
import { applyDriveOutcome, persistCanonicalEvidence } from '@/policy/evidence/intake/intakeService';

/* ════════════════════════════════════════════════════════════════
   Studio pane — the branded Packet Studio rendered INLINE (in-page)
   via an embedded, app-light-themed studio document, plus a slim
   toolbar that folds in the one useful Intake capability: drop source
   files → parse, resolve created-date, classify, and FILE into the
   Evidence Library (and Drive when reachable).
   ════════════════════════════════════════════════════════════════ */

const STUDIO_URL = '/care_indeed_pdf_studio.html';
const ACCEPTED = '.json,.csv,.tsv,.md,.markdown,.txt';

async function readText(file: File): Promise<{ text?: string; headBytes: Uint8Array }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const fmt = detectFormat(file.name, file.type, bytes.subarray(0, 8));
  const text = ['json', 'csv', 'tsv', 'markdown', 'txt'].includes(fmt) ? new TextDecoder('utf-8').decode(bytes) : undefined;
  return { text, headBytes: bytes.subarray(0, 8) };
}
function b64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

export function StudioLanding() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [driveHealth, setDriveHealth] = useState<EvidenceHealthResponse | null>(null);
  const [eventId, setEventId] = useState<string>(
    REGULATORY_EVENTS.find((e) => /qapi/i.test(e.title) && (e.policyRefs?.length ?? 0) > 0 && !!e.workflowId)?.id
    ?? REGULATORY_EVENTS.find((e) => !e.isContext)?.id ?? '',
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ filed: number; uploaded: number; failed: number } | null>(null);

  // Camera capture (photograph physical documents → file as evidence).
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  // Embedded studio auto-grows to its content so the host page scrolls (no inner clipping).
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [studioH, setStudioH] = useState(960);
  // Push CES calendar events into the embedded studio so a packet can be tied
  // to an event (its id/title/date drive the packet ID + Step-2 auto-fill).
  const events = useMemo(() => REGULATORY_EVENTS.filter((e) => !e.isContext), []);
  const postEventsToStudio = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'ci-events', events: events.map((e) => ({ id: e.id, title: e.title, date: e.date })), selectedEventId: eventId },
        '*',
      );
    } catch { /* ignore */ }
  }, [events, eventId]);

  const handleStudioLoad = useCallback(() => {
    postEventsToStudio();
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;
      const measure = () => { const h = doc.documentElement.scrollHeight || doc.body.scrollHeight; if (h) setStudioH(h + 12); };
      measure();
      roRef.current?.disconnect();
      roRef.current = new ResizeObserver(measure);
      roRef.current.observe(doc.documentElement);
    } catch { /* cross-origin guard — keep fallback height */ }
  }, [postEventsToStudio]);
  useEffect(() => () => roRef.current?.disconnect(), []);
  useEffect(() => { postEventsToStudio(); }, [postEventsToStudio]);

  // When the studio's own event picker changes, keep the host's filing target in
  // sync; and relay a print request from the Signature Tracker into the iframe
  // (the host switches back to this tab first so the studio is visible to print).
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; eventId?: string } | undefined;
      if (d?.type === 'ci-event-selected' && typeof d.eventId === 'string') setEventId(d.eventId || eventId);
      else if (d?.type === 'ci-print-packet') {
        // Returned from the Signature Tracker — enable the studio's own Download
        // button (a direct click prints just the packet pages, gesture-safe).
        window.setTimeout(() => { try { iframeRef.current?.contentWindow?.postMessage({ type: 'ci-enable-download' }, '*'); } catch { /* ignore */ } }, 200);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [eventId]);

  useEffect(() => {
    let on = true;
    CalendarApi.evidenceHealth().then((h) => on && setDriveHealth(h)).catch(() => on && setDriveHealth({ ok: false, enabled: false, provider: 'unknown', drive: { reachable: false, error: 'unreachable' } }));
    return () => { on = false; };
  }, []);
  const driveReachable = !!driveHealth?.drive?.reachable;

  const selectedEvent = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);

  const handleFiles = useCallback(async (list: FileList | null) => {
    if (!list || !list.length || !selectedEvent) return;
    setBusy(true);
    let filed = 0, uploaded = 0, failed = 0;
    const policyIds = selectedEvent.policyRefs ?? [];
    const workflowId = selectedEvent.workflowId;
    for (const file of Array.from(list)) {
      const { text, headBytes } = await readText(file);
      const parsed = parseSourceFile({ fileName: file.name, mimeType: file.type, text, headBytes, byteLength: file.size });
      if (parsed.parseStatus !== 'parsed') { failed += 1; continue; }
      const fileId = `FILE-${sanitizeFileName(file.name)}-${Date.now()}`;
      for (const cell of parsed.records) {
        const rec: EvidenceSourceRecord = extractRecordFromCell(cell, {
          batchId: `studio-${Date.now()}`, sourceFileId: fileId, sourceFileName: file.name,
          sourceSystem: 'unknown' as SourceSystem, uploadedAt: new Date().toISOString(),
        });
        if (rec.status === 'needs_date_review' || !rec.filingPeriodKey) continue;
        const id = { sourceSystem: rec.sourceSystem, sourceRecordId: rec.sourceRecordId, sourceSystemCreatedAt: rec.sourceSystemCreatedAt, contentHash: rec.contentHash, sourcePointer: rec.sourcePointer };
        const persisted = persistCanonicalEvidence(rec, {
          eventKey: eventId, eventId, workflowId, policyIds,
          identityScope: buildEvidenceIdentityScope(id), idempotencyKey: buildIdempotencyKey(id),
        });
        if (!persisted.evidenceId || persisted.reused) continue;
        filed += 1;
        if (driveReachable) {
          try {
            const out = await CalendarApi.intakeUploadEvidence({
              canonicalEvidenceId: persisted.evidenceId, filingPeriodKey: rec.filingPeriodKey,
              filingQuarterKey: rec.filingQuarterKey ?? undefined, classification: rec.classification,
              title: `${rec.classification} ${rec.sourcePointer}`,
              fileName: `${sanitizeFileName(file.name)}-${rec.sourcePointer.replace(/[^A-Za-z0-9]+/g, '-')}.json`,
              mimeType: 'application/json', contentBase64: b64(JSON.stringify(cell.fields, null, 2)), eventId,
            });
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: true, driveFileId: out.driveFileId, driveFolderId: out.driveFolderId, driveFolderPath: out.driveFolderPath, driveWebViewLink: out.driveWebViewLink });
            uploaded += 1;
          } catch (e) {
            const err = e as { message?: string; code?: string };
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: false, errorCode: err.code, errorMessage: err.message });
            failed += 1;
          }
        }
      }
    }
    setResult({ filed, uploaded, failed });
    setBusy(false);
  }, [selectedEvent, eventId, driveReachable]);

  const openCamera = useCallback(async () => {
    setCameraError(null);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; void videoRef.current.play(); } }, 0);
    } catch (e) {
      setCameraError((e as Error).message || 'Camera access was denied or is unavailable.');
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  const captureDocument = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !selectedEvent) return;
    const w = video.videoWidth || 1280, h = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    setBusy(true);
    const ts = new Date().toISOString();
    const rec: EvidenceSourceRecord = extractRecordFromCell(
      { pointer: `camera:${Date.now()}`, fields: { capturedAt: ts, kind: 'document_photo' }, text: 'scanned document photo capture' },
      { batchId: `camera-${Date.now()}`, sourceFileId: `CAM-${Date.now()}`, sourceFileName: `document-capture-${ts.slice(0, 10)}.jpg`, sourceSystem: 'manual' as SourceSystem, uploadedAt: ts },
    );
    let filed = 0, uploaded = 0, failed = 0;
    if (rec.filingPeriodKey) {
      const id = { sourceSystem: rec.sourceSystem, sourceRecordId: rec.sourceRecordId, sourceSystemCreatedAt: rec.sourceSystemCreatedAt, contentHash: rec.contentHash, sourcePointer: rec.sourcePointer };
      const persisted = persistCanonicalEvidence(rec, {
        eventKey: eventId, eventId, workflowId: selectedEvent.workflowId, policyIds: selectedEvent.policyRefs ?? [],
        identityScope: buildEvidenceIdentityScope(id), idempotencyKey: buildIdempotencyKey(id),
      });
      if (persisted.evidenceId) {
        filed = 1;
        if (driveReachable) {
          try {
            const out = await CalendarApi.intakeUploadEvidence({
              canonicalEvidenceId: persisted.evidenceId, filingPeriodKey: rec.filingPeriodKey,
              filingQuarterKey: rec.filingQuarterKey ?? undefined, classification: rec.classification,
              title: `Document photo ${ts.slice(0, 10)}`, fileName: `document-capture-${Date.now()}.jpg`,
              mimeType: 'image/jpeg', contentBase64: base64, eventId,
            });
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: true, driveFileId: out.driveFileId, driveFolderId: out.driveFolderId, driveFolderPath: out.driveFolderPath, driveWebViewLink: out.driveWebViewLink });
            uploaded = 1;
          } catch (e) {
            const err = e as { message?: string; code?: string };
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: false, errorCode: err.code, errorMessage: err.message });
            failed = 1;
          }
        }
      }
    }
    setResult({ filed, uploaded, failed });
    setBusy(false);
  }, [selectedEvent, eventId, driveReachable]);

  return (
    <section className="grid gap-sm">
      {/* Light, borderless action row — file source docs / capture into the Library */}
      <div className="flex flex-wrap items-center justify-end gap-sm px-xs text-[11px]">
        <span className="mr-auto flex items-center gap-xs text-muted" title={driveReachable ? 'Google Drive reachable' : 'Google Drive unavailable'}>
          <span className={`h-2 w-2 rounded-full ${driveReachable ? 'bg-brand-teal' : 'bg-[#c74601]'}`} />
          Drive {driveReachable ? 'connected' : (driveHealth ? 'unavailable' : 'checking…')}
        </span>
        <select aria-label="File to event" title="File captured/added source documents to this event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="max-w-[200px] rounded-lg border border-hairline bg-surface px-sm py-xs text-xs text-ink">
          <option value="mock-training">Mock Event (for training)</option>
          {events.slice(0, 80).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <input ref={fileInputRef} aria-label="Upload source documents" title="Upload source documents" type="file" multiple accept={ACCEPTED} className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy || !eventId} title="Parse + file source documents into the Evidence Library" className="flex items-center gap-xs rounded-lg px-sm py-xs text-secondary hover:bg-surface-hover disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Add source
        </button>
        <button type="button" onClick={() => void openCamera()} disabled={busy || !eventId} title="Photograph a physical document with your camera and file it as evidence" className="flex items-center gap-xs rounded-lg px-sm py-xs text-secondary hover:bg-surface-hover disabled:opacity-50">
          <Camera className="h-4 w-4" /> Capture
        </button>
        <button type="button" onClick={() => window.open(STUDIO_URL, '_blank', 'noopener,noreferrer')} title="Open the studio in a new tab" className="flex items-center gap-xs rounded-lg px-sm py-xs text-secondary hover:bg-surface-hover">
          <ExternalLink className="h-4 w-4" /> New tab
        </button>
      </div>

      {result && (
        <div className={`flex flex-wrap items-center gap-md rounded-lg px-md py-sm text-xs ${result.failed > 0 ? 'text-tone-orange-text' : 'text-brand-teal-deep'}`}>
          <span className="flex items-center gap-xs"><CheckCircle2 className="h-4 w-4" /> Filed {result.filed} to Library</span>
          {driveReachable && <span className="flex items-center gap-xs"><CloudUpload className="h-4 w-4" /> {result.uploaded} to Drive</span>}
          {result.failed > 0 && <span className="flex items-center gap-xs"><XCircle className="h-4 w-4" /> {result.failed} failed/skipped</span>}
        </div>
      )}

      {/* Studio rendered inline (app-light-themed) */}
      <iframe
        ref={iframeRef}
        onLoad={handleStudioLoad}
        title="Evidence Packet Studio"
        src={`${STUDIO_URL}?embed=1`}
        className="w-full rounded-lg border border-hairline bg-white shadow-rest"
        style={{ height: studioH, minHeight: '70vh' }}
      />

      {cameraOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-lg" role="dialog" aria-modal="true" aria-label="Capture document">
          <div className="w-full max-w-2xl rounded-lg border border-hairline bg-surface p-lg shadow-rest">
            <div className="flex items-center justify-between">
              <h3 className="text-h3 font-medium text-ink">Capture document</h3>
              <button type="button" onClick={closeCamera} aria-label="Close camera" className="text-muted hover:text-ink"><XCircle className="h-5 w-5" /></button>
            </div>
            {cameraError ? (
              <p className="mt-md rounded-lg border border-tone-orange-border bg-tone-orange-bg p-md text-sm text-tone-orange-text">{cameraError}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="mt-md w-full rounded-lg bg-black" style={{ maxHeight: '60vh' }} />
            )}
            <div className="mt-md flex justify-end gap-sm">
              <button type="button" onClick={closeCamera} className="rounded-lg border border-card bg-tone-slate-bg px-md py-sm text-sm text-secondary hover:bg-surface-hover">Close</button>
              <button type="button" onClick={() => void captureDocument()} disabled={!!cameraError || busy} className="flex items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-md py-sm text-sm font-medium text-white enabled:hover:bg-brand-teal-deep disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Capture &amp; file
              </button>
            </div>
            <p className="mt-sm text-[11px] text-muted">Files the photo into the Evidence Drive{driveReachable ? ' and Google Drive' : ' (image upload pending — connect Drive to store it)'} under the selected event, dated to capture time. Capture multiple, then Close.</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudioLanding;
