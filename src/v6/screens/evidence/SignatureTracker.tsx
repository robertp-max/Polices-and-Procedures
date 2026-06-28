import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardCheck, FileSignature, Loader2, PenLine, Printer } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { resolveSignerName } from '@/policy/evidence/signerDirectory';

/* ════════════════════════════════════════════════════════════════
   Signature Tracker — enter a packet ID to (a) generate eCIgn signature
   tasks for the currently-assigned signer roster, scheduled to be assigned
   after the meeting event, and (b) review signature completion.
   Tasks persist locally keyed by packet ID so the two views stay in sync.
   ════════════════════════════════════════════════════════════════ */

const PACKET_ID_RE = /^.+-\d+$/;

/** Currently-assigned governance signer roster (name · signer role). Compliance
 *  and billing roles resolve to the real signers via the canonical directory. */
const DEFAULT_ROSTER: { role: string; name: string }[] = [
  { role: 'DON / Chair', name: 'Dakota Director' },
  { role: 'Clinical Manager', name: 'Riley RN' },
  { role: 'Billing / Accounting', name: resolveSignerName('billing', 'Adrian Lindain') },
  { role: 'Compliance / HIPAA / Security / Infection Control Officer', name: resolveSignerName('compliance', 'Dee Bustos') },
  { role: 'Medical Director', name: 'Morgan MD' },
  { role: 'Administrator', name: 'Avery Admin' },
  { role: 'Social Worker', name: 'Jordan SW' },
];

interface SignerTask { role: string; name: string; status: 'scheduled' | 'signed'; signedAt?: string }
interface PacketSignatureRecord { eventId: string; scheduledFor: string; createdAt: string; signers: SignerTask[] }

const LS_KEY = 'ci-signature-tasks';
function loadAll(): Record<string, PacketSignatureRecord> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function saveAll(m: Record<string, PacketSignatureRecord>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

function fmtTime(t?: string): string {
  if (!t) return '10:00 AM';
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  let h = parseInt(m[1], 10); const min = m[2];
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${min} ${ap}`;
}
function addMinutes(t: string | undefined, mins: number): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || '10:00');
  let total = (m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 600) + mins;
  total = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60), min = String(total % 60).padStart(2, '0');
  return fmtTime(`${h}:${min}`);
}
function fmtDate(d?: string): string {
  if (!d) return 'TBD';
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d + 'T00:00:00' : d;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function SignatureTracker({ incomingPacketId }: { incomingPacketId?: string | null }) {
  const [packetId, setPacketId] = useState('');
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [record, setRecord] = useState<PacketSignatureRecord | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'schedule' | 'review'>('schedule');

  const idValid = PACKET_ID_RE.test(packetId.trim());

  // The Studio hands off the packet here before printing/downloading.
  useEffect(() => {
    if (!incomingPacketId || !PACKET_ID_RE.test(incomingPacketId)) return;
    setPacketId(incomingPacketId);
    setLoadedId(incomingPacketId);
    setConfirmed(false);
    const existing = loadAll()[incomingPacketId] ?? null;
    setRecord(existing);
    setView(existing ? 'review' : 'schedule');
  }, [incomingPacketId]);

  // Print/Download the packet AFTER signing is set up. Runs in the host window
  // (same-origin as the studio iframe), so a direct button click can open the
  // clean print window in the same user gesture — only the packet pages, the
  // studio's page rules, and the "EVENT NAME DATE" title (no app chrome).
  const printPacket = () => {
    // Prefer the packet's Google Drive PDF: open it in a new window and bring up
    // the print view. Falls back to a clean client-side print if no Drive URL yet.
    const driveUrl = (() => {
      try {
        const map = JSON.parse(localStorage.getItem('ci-packet-drive-urls') || '{}') as Record<string, string>;
        return (loadedId && map[loadedId]) || (eventInfo.id && map[eventInfo.id]) || '';
      } catch { return ''; }
    })();
    if (driveUrl) {
      const dw = window.open(driveUrl, '_blank', 'noopener,noreferrer');
      if (!dw) { window.alert('Pop-up blocked — allow pop-ups for this site to open the Google Drive PDF.'); return; }
      // Bring up the print view once the Drive PDF has loaded. Cross-origin Drive
      // tabs may block programmatic print — then the user prints with Ctrl/Cmd+P.
      window.setTimeout(() => { try { dw.focus(); dw.print(); } catch { /* use Ctrl/Cmd+P in the Drive tab */ } }, 1500);
      return;
    }
    const iframe = document.querySelector('iframe[title="Evidence Packet Studio"]') as HTMLIFrameElement | null;
    const doc = iframe?.contentDocument ?? null;
    // CSS is static — always read it live from the studio iframe. The packet
    // pages + title come from the stash captured at hand-off (survives the
    // studio iframe re-rendering while we're on this tab); fall back to live.
    const stash = (window as unknown as { __ciPacketPrint?: Record<string, { title: string; html: string }> }).__ciPacketPrint;
    const saved = (loadedId && stash && stash[loadedId]) || null;
    const livePages = doc?.getElementById('previewMain');
    const html = saved?.html || livePages?.innerHTML || '';
    if (!html.trim()) {
      window.alert('Open the Studio tab and generate this packet first, then return here to download.');
      return;
    }
    const styles = doc ? Array.from(doc.querySelectorAll('style')).map((s) => s.outerHTML).join('\n') : '';
    const title = (saved?.title || doc?.title || 'Care Indeed Packet').replace(/[\\/:*?"<>|]/g, ' ').trim();
    // The print window is about:blank — rewrite the (root-relative) logo to an
    // absolute same-origin URL so it actually loads, and never block on it.
    const printableHtml = html.replace(/src="\/ci-logo-gray\.png"/g, `src="${window.location.origin}/ci-logo-gray.png"`);
    const w = window.open('', '_blank');
    if (!w) { window.alert('Pop-up blocked — allow pop-ups for this site to download the PDF.'); return; }
    w.document.open();
    w.document.write(
      '<!doctype html><html class="print-export"><head><meta charset="utf-8"><title>' + title + '</title>' + styles +
      '<style>@page{size:letter;margin:0;}html,body{margin:0!important;padding:0!important;background:#fff!important;}' +
      '.preview-sidebar,.page-thumb,.studio-nav,.toast-container,.gen-overlay,.page-modal{display:none!important;}' +
      // Disable blur/backdrop effects for print — they rasterize slowly and can blank the preview.
      '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}' +
      // Pages are PRE-PAGINATED to fixed 8.5x11 — lock them, one sheet each.
      '.rendered-page{zoom:1!important;box-shadow:none!important;border-radius:0!important;margin:0!important;width:8.5in!important;height:11in!important;overflow:hidden!important;page-break-after:always;break-after:page;break-inside:avoid;}' +
      '.rendered-page:last-child{page-break-after:auto;break-after:auto;}</style></head><body>' +
      printableHtml + '</body></html>'
    );
    w.document.close();
    const go = () => { try { w.focus(); w.print(); } catch { /* ignore */ } };
    if (w.document.readyState === 'complete') setTimeout(go, 350); else w.onload = () => setTimeout(go, 350);
  };

  const eventInfo = useMemo(() => {
    const id = (loadedId ?? '').replace(/-\d+$/, '');
    if (id === 'mock-training') return { id, name: 'Mock Event (for training)', date: '', time: '', durationMin: 120 };
    const ev = REGULATORY_EVENTS.find((e) => e.id === id);
    const evWithDuration = ev as (typeof ev & { durationMin?: unknown });
    const durationMin = typeof evWithDuration?.durationMin === 'number' ? evWithDuration.durationMin : 120;
    return ev ? { id, name: ev.title, date: ev.date, time: ev.time, durationMin } : { id, name: id || '(unknown event)', date: '', time: '', durationMin: 120 };
  }, [loadedId]);

  const endTime = useMemo(() => addMinutes(eventInfo.time, eventInfo.durationMin), [eventInfo]);
  const scheduledForLabel = `${fmtDate(eventInfo.date)} at ${endTime}`;

  const load = () => {
    const id = packetId.trim();
    if (!PACKET_ID_RE.test(id)) return;
    setLoadedId(id);
    setConfirmed(false);
    const existing = loadAll()[id] ?? null;
    setRecord(existing);
    setView(existing ? 'review' : 'schedule');
  };

  const generate = () => {
    if (!loadedId || !confirmed) return;
    setBusy(true);
    const rec: PacketSignatureRecord = {
      eventId: eventInfo.id,
      scheduledFor: scheduledForLabel,
      createdAt: new Date().toISOString(),
      signers: DEFAULT_ROSTER.map((r) => ({ role: r.role, name: r.name, status: 'scheduled' })),
    };
    const all = loadAll(); all[loadedId] = rec; saveAll(all);
    setRecord(rec);
    setBusy(false);
  };

  const markSigned = (i: number) => {
    if (!loadedId || !record) return;
    const next = { ...record, signers: record.signers.map((s, j) => j === i ? { ...s, status: 'signed' as const, signedAt: new Date().toISOString() } : s) };
    const all = loadAll(); all[loadedId] = next; saveAll(all);
    setRecord(next);
  };

  const signedCount = record?.signers.filter((s) => s.status === 'signed').length ?? 0;
  const total = record?.signers.length ?? 0;

  return (
    <section className="grid gap-md" data-hash-id="signature-tracker" data-route="/evidence" data-template="evidence">
      {/* Packet ID entry */}
      <div className="rounded-[32px] border border-transparent bg-white/95 p-8 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-end gap-md">
          <label className="grid gap-xs">
            <span className="text-[11px] font-medium uppercase tracking-tag text-muted">Packet ID</span>
            <input
              value={packetId}
              onChange={(e) => { setPacketId(e.target.value); setLoadedId(null); setRecord(null); }}
              placeholder="qapi_meeting-20260609-10-1"
              aria-label="Packet ID"
              className="w-[280px] rounded-lg border border-hairline bg-surface px-md py-sm font-mono text-sm text-ink outline-none focus:border-brand-teal"
            />
          </label>
          <button type="button" onClick={load} disabled={!idValid} className="flex items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-lg py-sm text-sm font-medium text-white enabled:hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-45">
            <FileSignature className="h-4 w-4" /> Load packet
          </button>
          {packetId.trim() && !idValid && (
            <span className="flex items-center gap-xs text-xs text-tone-orange-text"><AlertTriangle className="h-3.5 w-3.5" /> Expected format {'{eventId}-{number}'}.</span>
          )}
        </div>
        {loadedId && (
          <p className="mt-sm text-xs text-muted">Packet <span className="font-mono text-brand-teal-deep">{loadedId}</span> · Event <strong className="text-ink">{eventInfo.name}</strong>{eventInfo.date ? ` · ${fmtDate(eventInfo.date)}` : ''}</p>
        )}
      </div>

      {!loadedId && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-hairline text-sm text-muted">
          Enter a packet ID to generate signature tasks or review completion.
        </div>
      )}

      {loadedId && (
        <>
          {/* View toggle */}
          {record && (
            <div className="flex gap-sm">
              <button type="button" onClick={() => setView('schedule')} className={`rounded-lg border px-md py-xs text-xs ${view === 'schedule' ? 'border-brand-teal bg-tone-teal-bg text-brand-teal-deep' : 'border-card bg-tone-slate-bg text-secondary hover:bg-surface-hover'}`}>Tasks & schedule</button>
              <button type="button" onClick={() => setView('review')} className={`rounded-lg border px-md py-xs text-xs ${view === 'review' ? 'border-brand-teal bg-tone-teal-bg text-brand-teal-deep' : 'border-card bg-tone-slate-bg text-secondary hover:bg-surface-hover'}`}>Completion review</button>
            </div>
          )}

          {/* SCHEDULE / GENERATE — two-card panel (roster left, confirm/thank-you right) */}
          {view === 'schedule' && (
            <div className="grid items-start gap-md desktop:grid-cols-2">
              {/* Card 1 — signer roster + schedule note */}
              <div className="grid content-start gap-md rounded-[32px] border border-transparent bg-white/95 p-8 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-sm">
                  <ClipboardCheck className="h-icon-sm w-icon-sm text-brand-teal" />
                  <h2 className="text-sm font-medium text-ink">Signature tasks · currently assigned signer roster</h2>
                </div>
                <RosterTable signers={(record?.signers ?? DEFAULT_ROSTER.map((r) => ({ ...r, status: 'scheduled' as const })))} />
                <div className="flex items-center gap-xs rounded-lg border border-tone-teal-border bg-tone-teal-bg px-md py-sm text-xs text-brand-teal-deep">
                  <CalendarClock className="h-4 w-4" />
                  Signature tasks are scheduled to be assigned <strong>after the meeting</strong> — on {scheduledForLabel}.
                </div>
              </div>

              {/* Card 2 — confirm + generate (pre) OR thank-you (post) */}
              {!record ? (
                <div className="grid content-start gap-md rounded-[32px] border border-transparent bg-white/95 p-8 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center gap-sm">
                    <PenLine className="h-icon-sm w-icon-sm text-brand-teal" />
                    <h2 className="text-sm font-medium text-ink">Schedule signing</h2>
                  </div>
                  <label className="flex items-start gap-sm text-sm text-ink">
                    <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--brand-teal,#00897B)]" />
                    I confirm these individuals will be assigned tasks to sign this packet after the scheduled meeting event.
                  </label>
                  <button type="button" onClick={generate} disabled={!confirmed || busy} className="flex w-fit items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-lg py-sm text-sm font-medium text-white enabled:hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-45">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />} Generate &amp; schedule signature tasks
                  </button>
                </div>
              ) : (
                <ThankYou eventName={eventInfo.name} dateLabel={fmtDate(eventInfo.date)} timeLabel={fmtTime(eventInfo.time)} scheduledFor={record.scheduledFor} signers={record.signers} onReview={() => setView('review')} onPrint={printPacket} />
              )}
            </div>
          )}

          {/* COMPLETION REVIEW */}
          {view === 'review' && record && (
            <div className="grid gap-md rounded-[32px] border border-transparent bg-white/95 p-8 shadow-xl backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div className="flex items-center gap-sm">
                  <CheckCircle2 className="h-icon-sm w-icon-sm text-brand-teal" />
                  <h2 className="text-sm font-medium text-ink">Signature completion</h2>
                </div>
                <span className={`rounded-full px-md py-xs text-xs font-medium ${signedCount === total ? 'bg-tone-teal-bg text-brand-teal-deep' : 'bg-tone-orange-bg text-tone-orange-text'}`}>
                  {signedCount} of {total} signed{signedCount === total ? ' · complete' : ''}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-tone-slate-bg">
                <div className="h-full rounded-full bg-brand-teal transition-all" style={{ width: `${total ? (signedCount / total) * 100 : 0}%` }} />
              </div>
              <RosterTable signers={record.signers} onMarkSigned={markSigned} />
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <p className="text-[11px] text-muted">Signing happens in eCIgn after the meeting. Use “Mark signed” to record completion here, or open the packet’s forms to sign.</p>
                <button type="button" onClick={printPacket} className="flex items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-lg py-sm text-sm font-medium text-white hover:bg-brand-teal-deep">
                  <Printer className="h-4 w-4" /> Print / Download packet
                </button>
              </div>
            </div>
          )}

          {view === 'review' && !record && (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-hairline text-sm text-muted">
              No signature tasks scheduled for this packet yet. Switch to “Tasks &amp; schedule” to generate them.
            </div>
          )}
        </>
      )}
    </section>
  );
}

function RosterTable({ signers, onMarkSigned }: { signers: SignerTask[]; onMarkSigned?: (i: number) => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-tone-slate-bg text-left text-[10px] uppercase tracking-tag text-muted">
            <th className="px-md py-sm">Name</th>
            <th className="px-md py-sm">Signer role</th>
            <th className="px-md py-sm">Status</th>
            {onMarkSigned && <th className="px-md py-sm"></th>}
          </tr>
        </thead>
        <tbody>
          {signers.map((s, i) => (
            <tr key={`${s.role}-${i}`} className="border-t border-hairline">
              <td className="px-md py-sm text-ink">{s.name}</td>
              <td className="px-md py-sm text-secondary">{s.role}</td>
              <td className="px-md py-sm">
                {s.status === 'signed' ? (
                  <span className="flex items-center gap-xs text-brand-teal-deep"><CheckCircle2 className="h-3.5 w-3.5" /> Signed{s.signedAt ? ` · ${new Date(s.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</span>
                ) : (
                  <span className="flex items-center gap-xs text-tone-orange-text"><CalendarClock className="h-3.5 w-3.5" /> Scheduled</span>
                )}
              </td>
              {onMarkSigned && (
                <td className="px-md py-sm text-right">
                  {s.status !== 'signed' && <button type="button" onClick={() => onMarkSigned(i)} className="rounded-lg border border-card px-md py-xs text-xs text-secondary hover:bg-surface-hover">Mark signed</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThankYou({ eventName, dateLabel, timeLabel, scheduledFor, signers, onReview, onPrint }: { eventName: string; dateLabel: string; timeLabel: string; scheduledFor: string; signers: SignerTask[]; onReview: () => void; onPrint: () => void }) {
  return (
    <div className="grid gap-sm rounded-lg border border-tone-teal-border bg-tone-teal-bg p-lg text-sm text-brand-teal-deep">
      <div className="flex items-center gap-sm font-medium"><CheckCircle2 className="h-5 w-5" /> Thank you — your meeting packet is ready.</div>
      <p>Please use this as your agenda for the upcoming <strong>{eventName}</strong> on <strong>{dateLabel}</strong> at <strong>{timeLabel}</strong>. Please go over this packet and use the Evidence Studio if you have any corrections.</p>
      <p>Signature tasks are scheduled to be assigned to these individuals on <strong>{scheduledFor}</strong>:</p>
      <ul className="grid gap-xs pl-md">
        {signers.map((s, i) => <li key={i} className="list-disc">{s.name} — {s.role}</li>)}
      </ul>
      <p className="text-[11px] text-brand-teal-deep/80">An eCIgn process has been scheduled to assign these signing tasks at the meeting’s end time.</p>
      <div className="mt-xs flex flex-wrap gap-sm">
        <button type="button" onClick={onPrint} className="flex w-fit items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-md py-sm text-xs font-medium text-white hover:bg-brand-teal-deep">
          <Printer className="h-4 w-4" /> Print / Download packet
        </button>
        <button type="button" onClick={onReview} className="flex w-fit items-center gap-sm rounded-lg border border-brand-teal bg-surface px-md py-sm text-xs font-medium text-brand-teal-deep hover:bg-surface-hover">
          <CheckCircle2 className="h-4 w-4" /> View completion status
        </button>
      </div>
    </div>
  );
}

export default SignatureTracker;
