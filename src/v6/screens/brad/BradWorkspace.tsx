import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert,
  FileText, ClipboardList, RefreshCw, Lock, X, Paperclip, Mic, Sparkles, Cpu, Search,
} from 'lucide-react';
import {
  bradApi, getIdentity, setIdentity, DEV_IDENTITIES,
  type RuntimeInfo, type SuperAdminMe, type BradProfile, type GeneratedObject, type ApprovalRequest, type EventMetaResult,
} from './bradApi';
import { getQuickActions, SCOPED_ACTION_COPY, type QuickAction, type ScopedActionId } from './quickActions';
import { HowBradWorksPanel } from './HowBradWorksPanel';
import { PublicResearchCard } from './PublicResearchCard';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad iAdministrator workspace — premium light Care Indeed experience.
   • "Good {time}, {first name}" hero + animated rainbow-glow composer.
   • 12 quick actions in contractual order (Builder = #2 for Super Admins).
   • Runtime badge reflects server-verified state (never hardcodes PHI Enabled).
   • Real /api/brad actions, append-only generated objects, Super Admin approvals.
   Palette mirrors Care Indeed brand (teal #00797D / #004142, orange #E56E2E /
   #C74601) on a warm off-white canvas — no maroon, no dark panels.
   ═══════════════════════════════════════════════════════════════════════════ */

type ChatMsg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'brad'; text: string; synthetic: boolean; blocked: boolean; reason?: string };

const PHI_BLOCK_MESSAGE = 'This request may contain PHI and cannot be processed in the current mode.';

function greetingPrefix(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function statusTone(status: string): string {
  switch (status) {
    case 'committed': return 'border-[#C4F4F5] bg-[#F7FEFF] text-[#00797D]';
    case 'approved': case 'applied': return 'border-[#C4F4F5] bg-[#E5F0EF] text-[#004142]';
    case 'pending-approval': return 'border-[#FFD5BF] bg-[#FFFAF7] text-[#C74601]';
    case 'denied': case 'blocked': return 'border-[#FFD5BF] bg-[#FFFAF7] text-[#C74601]';
    default: return 'border-[#E9E5E3] bg-[#FAF8F8] text-[#7A7470]';
  }
}

let msgSeq = 0;
const nextId = () => `m${++msgSeq}`;

export default function BradWorkspace() {
  const navigate = useNavigate();

  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [me, setMe] = useState<SuperAdminMe | null>(null);
  const [profile, setProfile] = useState<BradProfile | null>(null);
  const [events, setEvents] = useState<Array<{ eventId: string; eventTitle: string; eventType: string }>>([]);
  const [eventId, setEventId] = useState<string>('');
  const [identity, setIdentityState] = useState(getIdentity());

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMvp, setShowMvp] = useState(false);

  const [objects, setObjects] = useState<GeneratedObject[]>([]);
  const [lastEventUpdate, setLastEventUpdate] = useState<EventMetaResult | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});

  const [showHowBrad, setShowHowBrad] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [scoped, setScoped] = useState<ScopedActionId | null>(null);

  const transcriptEnd = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const refreshObjects = useCallback(async () => {
    try { setObjects((await bradApi.objects()).objects.reverse()); } catch { /* ignore */ }
  }, []);
  const refreshApprovals = useCallback(async () => {
    if (!me?.isSuperAdmin) { setApprovals([]); return; }
    try { setApprovals((await bradApi.approvals()).pending); } catch { setApprovals([]); }
  }, [me]);

  const loadIdentityScoped = useCallback(async () => {
    try {
      const [rt, who, prof, ev] = await Promise.all([bradApi.runtime(), bradApi.me(), bradApi.profile(), bradApi.events()]);
      setRuntime(rt); setMe(who); setProfile(prof); setEvents(ev.events);
      if (!eventId && ev.events[0]) setEventId(ev.events[0].eventId);
    } catch (e) { setError((e as Error).message); }
  }, [eventId]);

  useEffect(() => { void loadIdentityScoped(); void refreshObjects(); }, [loadIdentityScoped, refreshObjects, identity]);
  useEffect(() => { void refreshApprovals(); }, [refreshApprovals]);
  useEffect(() => { transcriptEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function onIdentityChange(userId: string) {
    setIdentity(userId);
    setIdentityState(getIdentity());
  }
  function focusComposer() { requestAnimationFrame(() => composerRef.current?.focus()); }

  const send = useCallback(async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;
    setError(null);
    setInput('');
    setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);
    setThinking(true);
    try {
      const ans = await bradApi.ask(text);
      setMessages((m) => [...m, {
        id: nextId(), role: 'brad',
        text: ans.blocked ? PHI_BLOCK_MESSAGE : ans.text,
        synthetic: ans.synthetic, blocked: ans.blocked, reason: ans.reason,
      }]);
    } catch (e) {
      setMessages((m) => [...m, { id: nextId(), role: 'brad', text: `Error: ${(e as Error).message}`, synthetic: false, blocked: false }]);
    } finally { setThinking(false); }
  }, [input, thinking]);

  async function runAction(fn: () => Promise<{ object: GeneratedObject; eventUpdate?: EventMetaResult }>, label: string) {
    setError(null); setThinking(true);
    try {
      const out = await fn();
      setLastEventUpdate(out.eventUpdate ?? null);
      setMessages((m) => [...m, {
        id: nextId(), role: 'brad', synthetic: false, blocked: false,
        text: `${label} created — ${out.object.metadata.object_type} (${out.object.metadata.object_id.slice(0, 28)}…), status: ${out.object.metadata.write_status}.`,
      }]);
      await refreshObjects(); await refreshApprovals();
    } catch (e) { setError((e as Error).message); } finally { setThinking(false); }
  }

  function handleQuickAction(a: QuickAction) {
    setError(null);
    switch (a.kind) {
      case 'panel': setShowHowBrad(true); break;
      case 'navigate': if (a.to) navigate(a.to); break;
      case 'research':
        setShowResearch(true);
        setInput('Request cited public-source context (CMS, ACHC, federal/state guidance) for: ');
        focusComposer();
        break;
      case 'prefill': if (a.prompt) { setInput(a.prompt); focusComposer(); } break;
      case 'scoped': if (a.scope) setScoped(a.scope); break;
      case 'action':
        if (a.action === 'report') void runAction(() => bradApi.report('event-readiness', eventId).then((r) => ({ object: r.object })), 'Event Readiness Report');
        else if (a.action === 'event-packet') void runAction(() => bradApi.eventPacket('general', eventId), 'Event Packet & Agenda');
        else if (a.action === 'qapi-minutes') void runAction(() => bradApi.qapiMinutes(eventId), 'QAPI Minutes Draft');
        break;
    }
  }

  async function decide(approvalId: string, decision: 'approved' | 'denied') {
    try {
      await bradApi.decide(approvalId, decision, reason[approvalId]);
      await refreshApprovals(); await refreshObjects();
    } catch (e) { setError((e as Error).message); }
  }

  const quickActions = useMemo(() => getQuickActions(!!me?.isSuperAdmin), [me]);
  const landing = messages.length === 0;
  const firstName = profile?.firstName?.trim();
  const initials = (firstName?.[0] ?? identity.displayName?.[0] ?? 'U').toUpperCase();

  const composer = (variant: 'hero' | 'chat') => (
    <div className="group relative w-full">
      <div className={`absolute -inset-1.5 z-0 rounded-[32px] brad-rainbow-glow blur-xl transition-all duration-500 ${thinking ? 'opacity-100 blur-2xl' : 'opacity-70 group-focus-within:opacity-100'}`} aria-hidden />
      <div className="relative z-10 flex flex-col overflow-hidden rounded-3xl border border-[#D9D6D5] bg-white/95 shadow-lg backdrop-blur-xl">
        <textarea
          ref={variant === 'hero' ? composerRef : undefined}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
          placeholder="Ask Brad to generate, analyze, or draft documents…"
          rows={variant === 'hero' ? 3 : 2}
          disabled={thinking}
          aria-label="Ask Brad"
          className={`w-full resize-none bg-transparent font-light text-[#524D4B] outline-none placeholder:text-[#7A7470] disabled:opacity-60 ${variant === 'hero' ? 'min-h-[120px] p-6 text-lg' : 'px-6 py-4 text-base'}`}
        />
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-1">
          <div className="flex items-center gap-3 pl-1">
            <Paperclip aria-hidden className="h-5 w-5 text-[#D9D6D5]" />
            <Mic aria-hidden className="h-5 w-5 text-[#D9D6D5]" />
            <span className="mx-1 hidden h-4 w-px bg-[#E9E5E3] sm:block" />
            <span className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7A7470] sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00797D]" aria-hidden /> Secure mode active
            </span>
          </div>
          <button
            type="button"
            onClick={() => void send()}
            disabled={!input.trim() || thinking}
            aria-label="Send to Brad"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E56E2E] px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-[#C74601] disabled:cursor-not-allowed disabled:bg-[#FAF8F8] disabled:text-[#D9D6D5] disabled:shadow-none"
          >
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Run with Brad
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative -m-md min-h-[80vh] overflow-hidden rounded-lg bg-[#FAF8F8] p-md font-light text-[#524D4B]">
      <div className="brad-grid-pattern pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative z-10 grid gap-xl">

        {/* Header strip */}
        <div className="flex flex-wrap items-center justify-between gap-md rounded-xl border border-[#E9E5E3] bg-white/80 px-lg py-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="relative grid h-9 w-9 place-items-center rounded-full border border-[#C4F4F5] bg-[#E5F0EF] text-[#00797D]">
              <Bot aria-hidden className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-medium tracking-wide text-[#004142]">Brad iAdministrator</div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-[#00797D]"><Sparkles className="h-2.5 w-2.5" aria-hidden /> Care Indeed AI Core</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {runtime && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMvp((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E9E5E3] bg-[#FAF8F8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7A7470] transition hover:bg-[#F3F0EF]"
                  title={`Model: ${runtime.modelId}`}
                >
                  <Cpu className="h-3 w-3 text-[#00797D]" aria-hidden /> {runtime.badge}
                </button>
                {showMvp && (
                  <div className="absolute right-0 top-10 z-20 w-80 rounded-xl border border-[#D9D6D5] bg-white p-5 shadow-lg">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#004142]"><ShieldAlert className="h-4 w-4 text-[#E56E2E]" aria-hidden /> Runtime status</h4>
                    <p className="text-xs font-light leading-relaxed text-[#524D4B]">
                      Brad is running <strong>{runtime.badge}</strong> on model <code>{runtime.modelId}</code>. Real PHI stays blocked until Brad moves to the approved Google Vertex AI production runtime and the HIPAA readiness gate passes.
                    </p>
                    <div className="mt-3 flex justify-end"><button type="button" onClick={() => setShowMvp(false)} className="text-xs font-medium text-[#00797D] hover:underline">Close</button></div>
                  </div>
                )}
              </div>
            )}
            <select
              aria-label="Acting-as identity (server verifies Super Admin)"
              value={identity.userId}
              onChange={(e) => onIdentityChange(e.target.value)}
              title="Review identity — the server independently verifies Super Admin status"
              className="rounded-md border border-[#E9E5E3] bg-white px-2 py-1 text-xs text-[#524D4B]"
            >
              {DEV_IDENTITIES.map((d) => <option key={d.userId} value={d.userId}>{d.displayName}</option>)}
            </select>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#004142] text-xs font-medium text-white">{initials}</span>
          </div>
        </div>

        {me?.isSuperAdmin && (
          <div className="flex items-center gap-2 rounded-md border border-[#C4F4F5] bg-[#E5F0EF] px-md py-2 text-xs text-[#004142]">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Super Admin — {me.displayName}. Permissions: {me.permissions.join(', ')}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-[#FFD5BF] bg-[#FFFAF7] px-md py-2 text-sm text-[#C74601]">
            <AlertTriangle className="h-4 w-4" aria-hidden /> {error}
          </div>
        )}

        {/* Hero greeting (landing only) */}
        {landing && (
          <div className="mx-auto mt-sm w-full max-w-5xl">
            <h1 className="text-4xl font-light tracking-tight text-[#004142] desktop:text-5xl">
              {firstName ? (
                <><span className="opacity-70">{greetingPrefix()},</span><br /><span className="font-medium">{firstName}</span></>
              ) : (
                <span className="font-medium">Welcome back</span>
              )}
            </h1>
            <p className="mt-3 text-base font-light text-[#7A7470]">Ask about policies, workflows, evidence, audits, onboarding, and compliance execution.</p>
          </div>
        )}

        {/* Chat transcript */}
        {!landing && (
          <div className="mx-auto grid w-full max-w-4xl gap-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'brad' && (
                  <span className="mr-3 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#E9E5E3] bg-white text-[#00797D] shadow-sm"><Bot className="h-4 w-4" aria-hidden /></span>
                )}
                <div className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap rounded-3xl rounded-tr-sm border border-[#C4F4F5] bg-[#E5F0EF] px-6 py-3.5 font-light leading-relaxed text-[#004142] shadow-sm">{m.text}</div>
                  ) : m.blocked ? (
                    <div className="flex items-start gap-3 rounded-2xl rounded-tl-sm border border-[#FFD5BF] bg-[#FFFAF7] px-5 py-4 text-[#C74601] shadow-sm">
                      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                      <span className="font-light leading-relaxed">{m.text}</span>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-3xl rounded-tl-sm border border-[#E9E5E3] bg-white px-6 py-4 font-light leading-relaxed text-[#524D4B] shadow-md">
                      {m.synthetic && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#E9E5E3] bg-[#FAF8F8] px-2 py-0.5 text-[11px] font-medium text-[#7A7470]"><Lock className="h-3 w-3" aria-hidden /> Synthetic / mock output</span>
                      )}
                      <p className="whitespace-pre-wrap text-[15px]">{m.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-sm text-[#00797D]">
                <Sparkles className="h-4 w-4 animate-spin" aria-hidden /> Brad is analyzing…
              </div>
            )}
            <div ref={transcriptEnd} />
          </div>
        )}

        {/* Composer */}
        <div className="mx-auto w-full max-w-4xl">
          {events.length > 0 && (
            <div className="mb-2 flex items-center gap-2 text-xs text-[#7A7470]">
              <span>Context event:</span>
              <select aria-label="Context event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="rounded-md border border-[#E9E5E3] bg-white px-2 py-1 text-xs text-[#524D4B]">
                {events.map((ev) => <option key={ev.eventId} value={ev.eventId}>{ev.eventTitle}</option>)}
              </select>
            </div>
          )}
          {composer(landing ? 'hero' : 'chat')}
          <p className="mt-2 pl-2 text-xs text-[#7A7470]">Enter to send · Shift+Enter for a new line</p>
        </div>

        {/* Quick action grid (landing) */}
        {landing && (
          <div className="mx-auto w-full max-w-5xl">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 tablet-l:grid-cols-3 desktop:grid-cols-4">
              {quickActions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleQuickAction(a)}
                  disabled={thinking}
                  className="group flex min-h-[116px] flex-col gap-4 rounded-2xl border-2 border-white bg-white/80 p-5 text-left shadow-[0_6px_16px_rgba(0,0,0,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#E5F0EF] hover:shadow-[0_12px_28px_rgba(0,121,125,0.18)] active:scale-[0.98] disabled:opacity-50 motion-reduce:hover:translate-y-0"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl shadow-sm transition ${a.id === 'builder' ? 'bg-[#FFFAF7] text-[#C74601] group-hover:bg-[#FFD5BF]/40' : 'bg-[#FAF8F8] text-[#00797D] group-hover:bg-[#E5F0EF]'}`}>
                    <a.Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium leading-snug text-[#524D4B] group-hover:text-[#004142]">{a.label}</span>
                </button>
              ))}
            </div>
            {me?.isSuperAdmin && (
              <p className="mt-md text-center text-xs text-[#7A7470]">
                <span className="font-medium text-[#C74601]">Builder Beta</span> — available for Super Admin review. Subject to modification or removal.
              </p>
            )}
          </div>
        )}

        {/* Public research panel */}
        {showResearch && (
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#00797D]"><Search className="h-3.5 w-3.5" aria-hidden /> Public regulatory research</div>
            <PublicResearchCard />
            <p className="mt-2 text-xs text-[#7A7470]">External public-source review only — no patient data, no internal records. Results are <strong>untrusted external</strong> and must be validated before any action.</p>
          </div>
        )}

        {lastEventUpdate && (
          <div className="mx-auto w-full max-w-4xl rounded-md border border-[#C4F4F5] bg-[#F7FEFF] px-md py-2 text-xs text-[#004142]">
            Event metadata appended (append-only): {lastEventUpdate.appliedFields.join(', ') || 'none'}.
            {lastEventUpdate.rejectedFields.length > 0 && ` Rejected (needs changeset): ${lastEventUpdate.rejectedFields.join(', ')}.`}
          </div>
        )}

        {/* Super Admin approval surface */}
        {me?.isSuperAdmin && approvals.length > 0 && (
          <section className="mx-auto w-full max-w-4xl rounded-2xl border border-[#FFD5BF] bg-[#FFFAF7]/60 p-lg">
            <h2 className="mb-md flex items-center gap-2 text-lg font-medium text-[#004142]"><ShieldCheck className="h-5 w-5 text-[#C74601]" aria-hidden /> Pending Super Admin approvals</h2>
            <div className="grid gap-md">
              {approvals.map((a) => (
                <div key={a.approvalId} className="rounded-xl border border-[#E9E5E3] bg-white p-md shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-[#004142]">{a.objectType}</div>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(a.riskLevel === 'high' ? 'denied' : a.riskLevel === 'medium' ? 'pending-approval' : 'committed')}`}>risk: {a.riskLevel}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#7A7470]">Object {a.objectId.slice(0, 32)}… · permission <code>{a.requiredPermission}</code>{a.sourceEventId ? ` · event ${a.sourceEventId}` : ''}</div>
                  {a.protectedCoreRefs.length > 0 && <div className="mt-1 text-xs text-[#7A7470]">Protected-core refs: {a.protectedCoreRefs.join(', ')}</div>}
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-[#FAF8F8] p-2 text-xs text-[#524D4B]">{a.preview.summary}</pre>
                  <input
                    value={reason[a.approvalId] ?? ''}
                    onChange={(e) => setReason((r) => ({ ...r, [a.approvalId]: e.target.value }))}
                    placeholder="Reason / comment (optional)"
                    className="mt-2 w-full rounded-md border border-[#E9E5E3] bg-white px-2 py-1 text-xs text-[#524D4B]"
                  />
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => void decide(a.approvalId, 'approved')} className="inline-flex items-center gap-1 rounded-md bg-[#00797D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#004142]"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                    <button type="button" onClick={() => void decide(a.approvalId, 'denied')} className="inline-flex items-center gap-1 rounded-md border border-[#FFD5BF] bg-white px-3 py-1.5 text-xs font-medium text-[#C74601] hover:bg-[#FFFAF7]"><XCircle className="h-3.5 w-3.5" /> Deny</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Generated objects */}
        <section id="brad-objects" className="mx-auto w-full max-w-4xl">
          <div className="mb-md flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-medium text-[#004142]"><FileText className="h-5 w-5 text-[#00797D]" aria-hidden /> Brad-generated objects (append-only)</h2>
            <button type="button" onClick={() => void refreshObjects()} className="inline-flex items-center gap-1 text-xs text-[#7A7470] hover:text-[#00797D]"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
          </div>
          {objects.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#D9D6D5] bg-white/70 px-md py-lg text-center text-sm text-[#7A7470]">No objects yet. Run a report, generate a packet, or draft QAPI minutes.</p>
          ) : (
            <div className="grid gap-sm">
              {objects.map((o) => (
                <div key={o.metadata.object_id} className="rounded-xl border border-[#E9E5E3] bg-white p-md shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#004142]"><ClipboardList className="h-4 w-4 text-[#00797D]" aria-hidden /> {o.metadata.object_type}</div>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(o.metadata.write_status)}`}>{o.metadata.write_status}</span>
                  </div>
                  <div className="mt-1 grid gap-0.5 text-xs text-[#7A7470]">
                    <div>ID: <code>{o.metadata.object_id.slice(0, 40)}…</code></div>
                    {o.metadata.source_event_id && <div>Event: {o.metadata.source_event_id}</div>}
                    <div>Created: {new Date(o.metadata.generated_at).toLocaleString()} · provenance: {o.metadata.model_provider}/{o.metadata.model_id} ({o.metadata.runtime_mode})</div>
                    {(o.metadata.object_type === 'BradGeneratedChangeSet' || o.metadata.object_type === 'BradGeneratedCloudChangeSet') && (
                      <div className="text-[#C74601]">Super Admin approval {o.metadata.write_status === 'approved' || o.metadata.write_status === 'applied' ? 'granted' : o.metadata.write_status === 'denied' ? 'denied' : 'required'}.</div>
                    )}
                  </div>
                  <button type="button" onClick={() => setExpanded(expanded === o.metadata.object_id ? null : o.metadata.object_id)} className="mt-2 text-xs text-[#00797D] hover:underline">
                    {expanded === o.metadata.object_id ? 'Hide' : 'View'} generated object
                  </button>
                  {expanded === o.metadata.object_id && (
                    <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-[#FAF8F8] p-2 text-xs text-[#524D4B]">{JSON.stringify(o.content, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Neutral public-research note (no internal agent name; always separated + untrusted) */}
        <div className="mx-auto w-full max-w-4xl rounded-md border border-[#E9E5E3] bg-white/70 px-md py-2 text-xs text-[#7A7470]">
          <ShieldCheck className="mr-1 inline h-3.5 w-3.5" aria-hidden /> External public-source review runs through an audited public research layer, is labeled <strong>untrusted external</strong>, and is never blended into Brad’s internal answers.
        </div>
      </div>

      <HowBradWorksPanel open={showHowBrad} onClose={() => setShowHowBrad(false)} />
      {scoped && (
        <ScopedActionDialog
          scope={scoped}
          onClose={() => setScoped(null)}
          onDraft={(prompt) => { setScoped(null); setInput(prompt); focusComposer(); }}
        />
      )}
    </div>
  );
}

/* Honest "scoped / not-yet-wired" dialog — never fabricates completion. */
function ScopedActionDialog({ scope, onClose, onDraft }: { scope: ScopedActionId; onClose: () => void; onDraft: (prompt: string) => void }) {
  const copy = SCOPED_ACTION_COPY[scope];
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => { closeRef.current?.focus(); }, []);
  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-[#004142]/10 p-lg backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="grid w-full max-w-md gap-md rounded-2xl border border-[#D9D6D5] bg-white p-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-md">
          <h2 id={titleId} className="text-lg font-medium text-[#004142]">{copy.title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-md bg-[#FAF8F8] text-[#7A7470] hover:bg-[#E5F0EF] hover:text-[#00797D]">
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-[#FFD5BF] bg-[#FFFAF7] p-md text-sm text-[#C74601]">
          <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{copy.body}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#E9E5E3] bg-[#FAF8F8] px-lg py-2 text-sm font-medium text-[#524D4B] hover:bg-[#E5F0EF]">Close</button>
          <button type="button" onClick={() => onDraft(copy.draftPrompt)} className="rounded-lg bg-[#00797D] px-lg py-2 text-sm font-medium text-white hover:bg-[#004142]">Draft with Brad (synthetic)</button>
        </div>
      </div>
    </div>
  );
}
