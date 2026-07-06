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
    <section className="grid gap-6 animate-fade-in" data-hash-id="edit-packet" data-route="/evidence" data-template="evidence">
      {/* Packet ID entry */}
      <div className="rounded-[32px] border border-transparent bg-white/95 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted">Packet ID</div>
        <div className="mb-3 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            value={packetId}
            onChange={(e) => { setPacketId(e.target.value.toUpperCase()); setLocked(false); }}
            placeholder="qapi_meeting-20260609-10-1"
            aria-label="Packet ID"
            className="max-w-md flex-1 rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 transition-all focus:border-[#007C7A] focus:bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={() => idValid && setLocked(true)}
            disabled={!idValid || locked}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#69A7A3] px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors enabled:hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            <FileSearch className="h-4 w-4" /> {locked ? 'Loaded' : 'Load packet'}
          </button>
          {packetId.trim() && !idValid && (
            <span className="flex items-center gap-1 text-xs text-orange-600"><AlertTriangle className="h-3.5 w-3.5" /> Expected format {'{eventId}-{number}'}.</span>
          )}
        </div>
        <p className="text-xs font-light text-disabled">Find the Packet ID on the cover page and every page footer of a generated packet. Loading it starts a remediation thread with Brad.</p>
      </div>

      {/* Chat */}
      <div className="flex min-h-[500px] flex-col rounded-[32px] border border-transparent bg-white/95 p-8 shadow-xl backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 font-medium text-teal-800">
          <PencilLine className="h-5 w-5" /> Remediation {locked && <span className="font-mono text-sm text-[#007C7A]">· {packetId.trim()}</span>}
        </h3>

        <div ref={scrollRef} className="mb-6 flex flex-1 flex-col justify-end overflow-y-auto rounded-[24px] border border-gray-100 bg-gray-50/50 p-6">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-center text-disabled">
              <Sparkles className="h-6 w-6 text-[#007C7A]/70" />
              <p className="text-sm font-light">{locked ? 'Describe a correction, feedback, or suggestion below.' : 'Load a packet ID to begin.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'brad' && <img src="/apple-icon.png" alt="Brad" className="h-6 w-6 shrink-0 rounded" />}
                  <div className={`max-w-[80%] rounded-[16px] p-4 text-sm font-light ${m.role === 'user' ? 'bg-[#007C7A] text-white' : 'border border-gray-200 bg-white text-gray-800 shadow-sm'}`}>
                    {m.role === 'user' && m.kind && <span className="mr-1 rounded-full bg-white/20 px-2 py-[1px] text-[10px] uppercase tracking-wider">{m.kind}</span>}
                    <span className="whitespace-pre-wrap">{m.text}</span>
                    {m.synthetic && <span className="ml-1 align-middle text-[10px] uppercase tracking-wider text-disabled">· synthetic</span>}
                    {m.refs && m.refs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.refs.map((r, j) => (
                          <button key={j} type="button" onClick={() => openRef(r)} className="rounded-full border border-teal-100 bg-teal-50 px-2 py-[1px] text-[10px] text-[#007C7A] hover:bg-teal-100">
                            {r.title || r.id}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {busy && <div className="flex items-center gap-2 text-sm font-light text-disabled"><img src="/apple-icon.png" alt="Brad" className="h-6 w-6 rounded opacity-70" /><Loader2 className="h-4 w-4 animate-spin" /> Brad is reviewing…</div>}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex gap-2">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                title={k.hint}
                disabled={!locked}
                className={`rounded-full border px-4 py-1.5 text-xs font-light transition-colors ${kind === k.id ? 'border-[#007C7A] bg-teal-50 text-[#007C7A]' : 'border-gray-200 bg-gray-50 text-muted hover:bg-gray-100'} disabled:opacity-50`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
              disabled={!locked || busy}
              rows={2}
              placeholder={locked ? `Enter a ${kind} for ${packetId.trim()}…` : 'Load a packet first'}
              aria-label="Remediation message"
              className="min-h-[48px] flex-1 resize-y rounded-[24px] border border-gray-200 bg-gray-50 px-6 py-3 text-sm text-gray-800 transition-all focus:border-[#007C7A] focus:bg-white focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={!locked || busy || !input.trim()}
              className="flex items-center justify-center gap-2 rounded-full bg-[#69A7A3] px-8 py-3 font-medium text-white shadow-md transition-colors enabled:hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditPacketRemediation;
