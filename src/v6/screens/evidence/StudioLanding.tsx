import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CloudUpload, ExternalLink, Loader2, Upload, XCircle } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore, type EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
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
  const evidenceByEvent = useRegulatoryExecutionStore((s) => s.evidence);
  const [driveHealth, setDriveHealth] = useState<EvidenceHealthResponse | null>(null);
  const [eventId, setEventId] = useState<string>(
    REGULATORY_EVENTS.find((e) => /qapi/i.test(e.title) && (e.policyRefs?.length ?? 0) > 0 && !!e.workflowId)?.id
    ?? REGULATORY_EVENTS.find((e) => !e.isContext)?.id ?? '',
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ filed: number; uploaded: number; failed: number } | null>(null);

  // Embedded studio auto-grows to its content so the host page scrolls (no inner clipping).
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [studioH, setStudioH] = useState(960);
  const handleStudioLoad = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;
      const measure = () => { const h = doc.documentElement.scrollHeight || doc.body.scrollHeight; if (h) setStudioH(h + 12); };
      measure();
      roRef.current?.disconnect();
      roRef.current = new ResizeObserver(measure);
      roRef.current.observe(doc.documentElement);
    } catch { /* cross-origin guard — keep fallback height */ }
  }, []);
  useEffect(() => () => roRef.current?.disconnect(), []);

  useEffect(() => {
    let on = true;
    CalendarApi.evidenceHealth().then((h) => on && setDriveHealth(h)).catch(() => on && setDriveHealth({ ok: false, enabled: false, provider: 'unknown', drive: { reachable: false, error: 'unreachable' } }));
    return () => { on = false; };
  }, []);
  const driveReachable = !!driveHealth?.drive?.reachable;

  const events = useMemo(() => REGULATORY_EVENTS.filter((e) => !e.isContext), []);
  const selectedEvent = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);
  const filedCount = useMemo(
    () => (Object.values(evidenceByEvent).flat() as EvidenceDoc[]).filter((d) => d.artifactVersion === 'evidence-intake-v1').length,
    [evidenceByEvent],
  );

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

  return (
    <section className="grid gap-md">
      {/* Slim toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-hairline bg-surface-glass p-md shadow-rest">
        <div className="flex flex-wrap items-center gap-sm">
          <span className={`flex items-center gap-xs rounded-full border px-md py-xs text-[11px] ${driveReachable ? 'border-tone-teal-border bg-tone-teal-bg text-brand-teal-deep' : 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text'}`}>
            <span className={`h-2 w-2 rounded-full ${driveReachable ? 'bg-brand-teal' : 'bg-[#c74601]'}`} />
            Drive {driveReachable ? 'connected' : (driveHealth ? 'unavailable' : 'checking…')}
          </span>
          <span className="text-[11px] text-muted">{filedCount} item(s) in Library</span>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <label className="flex items-center gap-xs text-[11px] text-secondary">
            File to
            <select aria-label="File to event" title="File to event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="max-w-[220px] rounded-lg border border-hairline bg-surface px-sm py-xs text-xs text-ink">
              {events.slice(0, 80).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </label>
          <input ref={fileInputRef} aria-label="Upload source documents" title="Upload source documents" type="file" multiple accept={ACCEPTED} className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy || !eventId} title="Parse + file source documents into the Evidence Library" className="flex items-center gap-xs rounded-lg border border-card bg-tone-slate-bg px-md py-xs text-xs text-secondary hover:bg-surface-hover disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Add source documents
          </button>
          <button type="button" onClick={() => window.open(STUDIO_URL, '_blank', 'noopener,noreferrer')} title="Open the studio in a new tab" className="flex items-center gap-xs rounded-lg border border-card bg-tone-slate-bg px-md py-xs text-xs text-secondary hover:bg-surface-hover">
            <ExternalLink className="h-4 w-4" /> New tab
          </button>
        </div>
      </div>

      {result && (
        <div className={`flex flex-wrap items-center gap-md rounded-lg border p-md text-sm ${result.failed > 0 ? 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text' : 'border-tone-teal-border bg-tone-teal-bg text-brand-teal-deep'}`}>
          <span className="flex items-center gap-xs"><CheckCircle2 className="h-4 w-4" /> Filed {result.filed} to Library</span>
          {driveReachable && <span className="flex items-center gap-xs"><CloudUpload className="h-4 w-4" /> {result.uploaded} to Drive</span>}
          {result.failed > 0 && <span className="flex items-center gap-xs"><XCircle className="h-4 w-4" /> {result.failed} failed/skipped</span>}
          <span className="text-xs text-muted">Open the Evidence Drive tab to browse them.</span>
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
    </section>
  );
}

export default StudioLanding;
