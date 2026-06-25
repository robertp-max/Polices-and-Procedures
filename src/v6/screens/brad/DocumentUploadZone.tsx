import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Loader2, Paperclip } from 'lucide-react';
import { bradApi, type UploadMeta } from './bradApi';

/* Reusable document dump-zone. Users drop/choose documents; Brad ingests them
   for the evidence packet. Each file's date-created-in-system = ingest time, so
   late-reported items fall in the current compliance scope. Shared by the
   Evidence Center and (via the composer) Brad chat. */
export function DocumentUploadZone({ eventId, title = 'Drop documents for Brad' }: { eventId?: string; title?: string }) {
  const [files, setFiles] = useState<UploadMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try { setFiles((await bradApi.uploads(eventId)).uploads); } catch { /* ignore */ }
  }, [eventId]);
  useEffect(() => { void refresh(); }, [refresh]);

  const readB64 = (f: File) => new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] ?? '');
    r.onerror = () => rej(new Error('read failed'));
    r.readAsDataURL(f);
  });

  async function handleFiles(list: FileList | null) {
    if (!list || !list.length) return;
    setUploading(true); setError(null);
    try {
      const payload = await Promise.all(Array.from(list).map(async (f) => ({
        filename: f.name, mime: f.type || 'application/octet-stream', contentBase64: await readB64(f),
      })));
      await bradApi.upload(payload, eventId);
      await refresh();
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  }

  return (
    <div className="mt-lg">
      <input ref={inputRef} type="file" multiple className="hidden" aria-label="Upload documents" onChange={(e) => void handleFiles(e.target.files)} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void handleFiles(e.dataTransfer.files); }}
        className={cxLocal('flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-lg text-center transition', drag ? 'border-brand-teal bg-tone-teal-bg' : 'border-hairline bg-tone-slate-bg hover:border-brand-teal')}
      >
        {uploading ? <Loader2 className="h-icon-md w-icon-md animate-spin text-brand-teal" aria-hidden /> : <Upload className="h-icon-md w-icon-md text-brand-teal" aria-hidden />}
        <span className="text-sm font-medium text-ink">{title}</span>
        <span className="text-xs text-muted">Drop or choose files. Brad organizes them and prepares the packet. Date-in-system = today.</span>
      </button>

      {error && <p className="mt-2 text-xs text-brand-orange">{error}</p>}

      {files.length > 0 && (
        <div className="mt-md space-y-1.5">
          <p className="text-tag uppercase tracking-tag text-muted">Uploaded ({files.length})</p>
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink">
              <span className="flex min-w-0 items-center gap-1.5"><Paperclip className="h-3 w-3 shrink-0 text-brand-teal" aria-hidden /> <span className="truncate">{f.filename}</span></span>
              <span className="shrink-0 text-muted">{new Date(f.dateCreatedInSystem).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Local tiny class combiner to avoid cross-import churn.
function cxLocal(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export default DocumentUploadZone;
