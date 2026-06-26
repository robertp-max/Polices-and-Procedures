import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileSearch, Loader2, PencilLine, Send, Sparkles } from 'lucide-react';
import { bradApi, type BradReference } from '@/v6/screens/brad/bradApi';

/* ════════════════════════════════════════════════════════════════
   Edit Packet — remediation. Enter the unique ID printed on a
   generated packet, then chat with Brad to log corrections, feedback,
   and suggestions against it. Backed by the real /api/brad/ask
   endpoint (its `synthetic` flag is surfaced honestly).
   ════════════════════════════════════════════════════════════════ */

interface ChatMsg { role: 'user' | 'brad'; text: string; kind?: Kind; refs?: BradReference[]; synthetic?: boolean }
type Kind = 'correction' | 'feedback' | 'suggestion';

const KINDS: { id: Kind; label: string; hint: string }[] = [
  { id: 'correction', label: 'Correction', hint: 'A factual error or wrong value to fix' },
  { id: 'feedback', label: 'Feedback', hint: 'How the packet reads or is structured' },
  { id: 'suggestion', label: 'Suggestion', hint: 'Something to add or improve' },
];

// Packet IDs are {eventId}-{sequence}, e.g. qapi_meeting-20260609-10-3 or mock-training-1.
const PACKET_ID_RE = /^.+-\d+$/;

export function EditPacketRemediation() {
  const navigate = useNavigate();
  const [packetId, setPacketId] = useState('');
  const [locked, setLocked] = useState(false);
  const [kind, setKind] = useState<Kind>('correction');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The Studio posts the newest packet ID when one is generated — prefill it.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; packetId?: string } | undefined;
      if (d?.type === 'ci-packet-generated' && d.packetId) { setPacketId(d.packetId); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, busy]);

  const idValid = PACKET_ID_RE.test(packetId.trim());

  const send = async () => {
    const content = input.trim();
    if (!content || !locked || busy) return;
    const userMsg: ChatMsg = { role: 'user', text: content, kind };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    try {
      const prompt = `A reviewer is remediating evidence packet ${packetId.trim()}. They submitted a ${kind}: "${content}". Acknowledge it, describe precisely how it would be applied to that packet, flag any compliance risk, and cite the relevant policy/form references.`;
      const ans = await bradApi.ask(prompt);
      setMessages((m) => [...m, { role: 'brad', text: ans.text, refs: ans.references, synthetic: ans.synthetic }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'brad', text: `I couldn't reach the Brad service — ${(e as Error).message}. Your ${kind} was logged locally against ${packetId.trim()}.` }]);
    } finally {
      setBusy(false);
    }
  };

  const openRef = (r: BradReference) => {
    if (r.type === 'policy') navigate(`/policies/${encodeURIComponent(r.id)}`);
    else if (r.type === 'workflow') navigate(`/workflows/${encodeURIComponent(r.id)}`);
    else if (r.type === 'form') navigate(`/forms/${encodeURIComponent(r.id)}`);
    else if (r.type === 'event') navigate(`/calendar?event=${encodeURIComponent(r.id)}`);
  };

  return (
    <section className="grid gap-md" data-hash-id="edit-packet" data-route="/evidence" data-template="evidence">
      {/* Packet ID entry */}
      <div className="rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
        <div className="flex flex-wrap items-end gap-md">
          <label className="grid gap-xs">
            <span className="text-[11px] font-medium uppercase tracking-tag text-muted">Packet ID</span>
            <input
              value={packetId}
              onChange={(e) => { setPacketId(e.target.value.toUpperCase()); setLocked(false); }}
              placeholder="qapi_meeting-20260609-10-1"
              aria-label="Packet ID"
              className="w-[280px] rounded-lg border border-hairline bg-surface px-md py-sm font-mono text-sm text-ink outline-none focus:border-brand-teal"
            />
          </label>
          <button
            type="button"
            onClick={() => idValid && setLocked(true)}
            disabled={!idValid || locked}
            className="flex items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-lg py-sm text-sm font-medium text-white enabled:hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FileSearch className="h-4 w-4" /> {locked ? 'Loaded' : 'Load packet'}
          </button>
          {packetId.trim() && !idValid && (
            <span className="flex items-center gap-xs text-xs text-tone-orange-text"><AlertTriangle className="h-3.5 w-3.5" /> Expected format {'{eventId}-{number}'} (printed on the packet cover &amp; footer).</span>
          )}
        </div>
        <p className="mt-sm text-xs text-muted">Find the Packet ID on the cover page and every page footer of a generated packet. Loading it starts a remediation thread with Brad.</p>
      </div>

      {/* Chat */}
      <div className={`grid gap-md rounded-lg border border-hairline bg-surface p-lg shadow-rest ${locked ? '' : 'opacity-55'}`}>
        <div className="flex items-center gap-sm">
          <PencilLine className="h-icon-sm w-icon-sm text-brand-teal" />
          <h2 className="text-sm font-medium text-ink">Remediation {locked && <span className="font-mono text-brand-teal-deep">· {packetId.trim()}</span>}</h2>
        </div>

        <div ref={scrollRef} className="grid max-h-[440px] min-h-[220px] content-start gap-sm overflow-auto rounded-lg border border-hairline bg-surface-glass p-md">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-xs text-center text-sm text-muted">
              <Sparkles className="h-5 w-5 text-brand-teal" />
              {locked ? 'Describe a correction, feedback, or suggestion below.' : 'Load a packet ID to begin.'}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[88%] rounded-lg px-md py-sm text-sm ${m.role === 'user' ? 'justify-self-end bg-tone-teal-bg text-brand-teal-deep' : 'justify-self-start border border-hairline bg-surface text-ink'}`}>
              {m.role === 'user' && m.kind && <span className="mr-xs rounded-full bg-brand-teal/15 px-sm py-[1px] text-[10px] uppercase tracking-tag text-brand-teal-deep">{m.kind}</span>}
              <span className="whitespace-pre-wrap">{m.text}</span>
              {m.synthetic && <span className="ml-xs align-middle text-[10px] uppercase tracking-tag text-muted">· synthetic</span>}
              {m.refs && m.refs.length > 0 && (
                <div className="mt-xs flex flex-wrap gap-xs">
                  {m.refs.map((r, j) => (
                    <button key={j} type="button" onClick={() => openRef(r)} className="rounded-full border border-tone-teal-border bg-tone-teal-bg px-sm py-[1px] text-[10px] text-brand-teal-deep hover:bg-surface-hover">
                      {r.title || r.id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && <div className="flex items-center gap-xs justify-self-start rounded-lg border border-hairline bg-surface px-md py-sm text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Brad is reviewing…</div>}
        </div>

        {/* Kind chips */}
        <div className="flex flex-wrap gap-xs">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              title={k.hint}
              disabled={!locked}
              className={`rounded-full border px-md py-xs text-xs transition ${kind === k.id ? 'border-brand-teal bg-tone-teal-bg text-brand-teal-deep' : 'border-card bg-tone-slate-bg text-secondary hover:bg-surface-hover'} disabled:opacity-50`}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* Composer */}
        <div className="flex items-end gap-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            disabled={!locked || busy}
            rows={2}
            placeholder={locked ? `Enter a ${kind} for ${packetId.trim()}…` : 'Load a packet first'}
            aria-label="Remediation message"
            className="min-h-[44px] flex-1 resize-y rounded-lg border border-hairline bg-surface px-md py-sm text-sm text-ink outline-none focus:border-brand-teal disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!locked || busy || !input.trim()}
            className="flex items-center gap-sm rounded-lg border border-brand-teal bg-brand-teal px-lg py-sm text-sm font-medium text-white enabled:hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Send className="h-4 w-4" /> Send
          </button>
        </div>
      </div>
    </section>
  );
}

export default EditPacketRemediation;
