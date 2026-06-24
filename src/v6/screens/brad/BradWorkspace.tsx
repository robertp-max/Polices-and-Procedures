import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert,
  FileText, ClipboardList, X, Paperclip, ChevronDown, ChevronRight, FolderClosed,
} from 'lucide-react';
import {
  bradApi, getIdentity, setIdentity, DEV_IDENTITIES,
  type RuntimeInfo, type SuperAdminMe, type GeneratedObject, type ApprovalRequest, type EventMetaResult,
} from './bradApi';
import { getQuickActions, SCOPED_ACTION_COPY, type QuickAction, type ScopedActionId } from './quickActions';
import { HowBradWorksPanel } from './HowBradWorksPanel';
import { PublicResearchCard } from './PublicResearchCard';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad iAdministrator workspace.
   • Brad-only identity — NO model/provider names in the UI.
   • Landing: greeting + centered composer + quick actions + collapsed work card.
   • Chat: thread fills, composer LOCKS to the bottom (ChatGPT/Grok-style),
     quick actions collapse, generated work hidden behind a drawer.
   • Surfaces use --brad-* theme variables (time-of-day themes; default = noon).
   ═══════════════════════════════════════════════════════════════════════════ */

type ChatMsg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'brad'; text: string; synthetic: boolean; blocked: boolean; reason?: string };

const PHI_BLOCK_MESSAGE = 'This request may contain PHI and cannot be processed in the current mode.';

/** Human-friendly labels for generated object types (no internal model text). */
const OBJ_LABEL: Record<string, string> = {
  BradGeneratedReport: 'Report',
  BradGeneratedEventPacket: 'Event Packet',
  BradGeneratedMeetingMinutes: 'Meeting Minutes',
  BradGeneratedQapiMinutes: 'QAPI Minutes (draft)',
  BradGeneratedActionPlan: 'Action Plan',
  BradGeneratedEvidenceChecklist: 'Evidence Checklist',
  BradGeneratedCloudChangeSet: 'Cloud Change Set',
  BradGeneratedAuditNote: 'Audit Note',
  BradGeneratedTaskRecommendation: 'Task Recommendation',
  BradGeneratedChangeSet: 'Change Set',
};
function objLabel(t: string): string {
  return OBJ_LABEL[t] ?? t.replace(/^BradGenerated/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
}
function statusTone(status: string): string {
  switch (status) {
    case 'committed': return 'border-[#C4F4F5] bg-[#F7FEFF] text-[#00797D]';
    case 'approved': case 'applied': return 'border-[#C4F4F5] bg-[#E5F0EF] text-[#004142]';
    case 'pending-approval': return 'border-[#FFD5BF] bg-[#FFFAF7] text-[#C74601]';
    case 'denied': case 'blocked': return 'border-[#FFD5BF] bg-[#FFFAF7] text-[#C74601]';
    default: return 'border-[var(--brad-border)] bg-[var(--brad-surface-2)] text-[var(--brad-muted)]';
  }
}

let msgSeq = 0;
const nextId = () => `m${++msgSeq}`;

export default function BradWorkspace() {
  const navigate = useNavigate();

  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [me, setMe] = useState<SuperAdminMe | null>(null);
  const [events, setEvents] = useState<Array<{ eventId: string; eventTitle: string; eventType: string }>>([]);
  const [eventId, setEventId] = useState<string>('');
  const [identity, setIdentityState] = useState(getIdentity());

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  const [objects, setObjects] = useState<GeneratedObject[]>([]);
  const [lastEventUpdate, setLastEventUpdate] = useState<EventMetaResult | null>(null);
  const [showGenerated, setShowGenerated] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [moreActions, setMoreActions] = useState(false);

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
      const [rt, who, ev] = await Promise.all([bradApi.runtime(), bradApi.me(), bradApi.events()]);
      setRuntime(rt); setMe(who); setEvents(ev.events);
      if (!eventId && ev.events[0]) setEventId(ev.events[0].eventId);
    } catch (e) { setError((e as Error).message); }
  }, [eventId]);

  useEffect(() => { void loadIdentityScoped(); void refreshObjects(); }, [loadIdentityScoped, refreshObjects, identity]);
  useEffect(() => { void refreshApprovals(); }, [refreshApprovals]);
  useEffect(() => { transcriptEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function onIdentityChange(userId: string) { setIdentity(userId); setIdentityState(getIdentity()); }
  function focusComposer() { requestAnimationFrame(() => composerRef.current?.focus()); }

  const send = useCallback(async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || thinking) return;
    setError(null); setInput('');
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
      setMessages((m) => [...m, { id: nextId(), role: 'brad', text: `Sorry — I hit a problem: ${(e as Error).message}`, synthetic: false, blocked: false }]);
    } finally { setThinking(false); }
  }, [input, thinking]);

  async function runAction(fn: () => Promise<{ object: GeneratedObject; eventUpdate?: EventMetaResult }>) {
    setError(null); setThinking(true);
    try {
      const out = await fn();
      setLastEventUpdate(out.eventUpdate ?? null);
      setMessages((m) => [...m, {
        id: nextId(), role: 'brad', synthetic: false, blocked: false,
        text: `Done — I created a ${objLabel(out.object.metadata.object_type)} (${out.object.metadata.write_status}). Open “Generated work” to review it.`,
      }]);
      await refreshObjects(); await refreshApprovals();
    } catch (e) { setError((e as Error).message); } finally { setThinking(false); }
  }

  function handleQuickAction(a: QuickAction) {
    setError(null); setMoreActions(false);
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
        if (a.action === 'report') void runAction(() => bradApi.report('event-readiness', eventId).then((r) => ({ object: r.object })));
        else if (a.action === 'event-packet') void runAction(() => bradApi.eventPacket('general', eventId));
        else if (a.action === 'qapi-minutes') void runAction(() => bradApi.qapiMinutes(eventId));
        break;
    }
  }

  async function decide(approvalId: string, decision: 'approved' | 'denied') {
    try { await bradApi.decide(approvalId, decision, reason[approvalId]); await refreshApprovals(); await refreshObjects(); }
    catch (e) { setError((e as Error).message); }
  }

  const quickActions = useMemo(() => getQuickActions(!!me?.isSuperAdmin), [me]);
  const landing = messages.length === 0;
  const phiPermitted = !!runtime?.phiPermitted;
  const statusLabel = phiPermitted ? 'Brad — PHI Enabled' : 'Brad MVP — Synthetic PHI Only';

  const composerInner = (
    <div className="group relative w-full">
      <div className={`absolute -inset-1.5 z-0 rounded-[32px] brad-rainbow-glow blur-xl transition-all duration-500 ${thinking ? 'opacity-100 blur-2xl' : 'opacity-60 group-focus-within:opacity-100'}`} aria-hidden />
      <div className="relative z-10 flex flex-col overflow-hidden rounded-3xl border border-[var(--brad-border)] bg-[var(--brad-surface)] shadow-lg">
        <textarea
          ref={composerRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
          placeholder="Ask Brad to generate, analyze, or draft documents…"
          rows={landing ? 3 : 1}
          disabled={thinking}
          aria-label="Ask Brad"
          className={`w-full resize-none bg-transparent font-light text-[var(--brad-ink)] outline-none placeholder:text-[var(--brad-muted)] disabled:opacity-60 ${landing ? 'min-h-[110px] p-6 text-lg' : 'px-5 py-3.5 text-base'}`}
        />
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-1">
          <div className="flex items-center gap-3 pl-1">
            <button type="button" disabled aria-label="Attach document (coming soon)" title="Document upload — coming soon" className="cursor-not-allowed text-[var(--brad-muted)] opacity-50">
              <Paperclip aria-hidden className="h-5 w-5" />
            </button>
            <span className="mx-1 hidden h-4 w-px bg-[var(--brad-border)] sm:block" />
            <span className="hidden items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--brad-muted)] sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00797D]" aria-hidden /> Secure
            </span>
          </div>
          <button
            type="button" onClick={() => void send()} disabled={!input.trim() || thinking} aria-label="Send to Brad"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E56E2E] px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-[#C74601] disabled:cursor-not-allowed disabled:bg-[var(--brad-surface-2)] disabled:text-[var(--brad-muted)] disabled:shadow-none"
          >
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Run with Brad
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="brad-workspace relative -m-md flex min-h-[84vh] flex-col overflow-hidden rounded-lg p-md font-light text-[var(--brad-ink)] [background:var(--brad-canvas)]"
    >
      <div className="brad-grid-pattern pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      {/* Header strip — Brad identity only, no model/provider names */}
      <div className="relative z-10 mb-xl flex flex-wrap items-center justify-between gap-md rounded-xl border border-[var(--brad-border)] bg-[var(--brad-surface)]/85 px-lg py-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[#C4F4F5] bg-[#E5F0EF] text-[#00797D]">
            <Bot aria-hidden className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-medium tracking-wide text-[var(--brad-heading)]">Brad iAdministrator</div>
            <div className="text-[11px] text-[var(--brad-muted)]">Care Indeed compliance assistant</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button" onClick={() => setShowStatus((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#C4F4F5] bg-[#F7FEFF] px-3 py-1.5 text-[11px] font-medium text-[#00797D] transition hover:bg-[#E5F0EF]"
            >
              <span className="h-2 w-2 rounded-full bg-[#00797D]" /> {statusLabel}
            </button>
            {showStatus && (
              <div className="absolute right-0 top-9 z-20 w-72 rounded-xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-4 text-[var(--brad-ink)] shadow-lg">
                <p className="text-xs font-light leading-relaxed">
                  Brad is running in MVP mode with synthetic PHI only. Real PHI remains blocked until the approved production readiness gate passes.
                </p>
                <div className="mt-2 flex justify-end"><button type="button" onClick={() => setShowStatus(false)} className="text-xs font-medium text-[#00797D] hover:underline">Close</button></div>
              </div>
            )}
          </div>
          <select
            aria-label="Acting-as identity (server verifies Super Admin)"
            value={identity.userId} onChange={(e) => onIdentityChange(e.target.value)}
            title="Review identity — the server independently verifies Super Admin status"
            className="rounded-md border border-[var(--brad-border)] bg-[var(--brad-surface)] px-2 py-1 text-xs text-[var(--brad-ink)]"
          >
            {DEV_IDENTITIES.map((d) => <option key={d.userId} value={d.userId}>{d.displayName}</option>)}
          </select>
        </div>
      </div>

      {me?.isSuperAdmin && (
        <div className="relative z-10 mb-md flex items-center gap-2 rounded-md border border-[#C4F4F5] bg-[#E5F0EF] px-md py-2 text-xs text-[#004142]">
          <ShieldCheck className="h-4 w-4" aria-hidden /> Super Admin — {me.displayName}.
        </div>
      )}
      {error && (
        <div className="relative z-10 mb-md flex items-center gap-2 rounded-md border border-[#FFD5BF] bg-[#FFFAF7] px-md py-2 text-sm text-[#C74601]">
          <AlertTriangle className="h-4 w-4" aria-hidden /> {error}
        </div>
      )}

      {/* ───────────────────────── LANDING ───────────────────────── */}
      {landing && (
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mx-auto mt-sm w-full max-w-5xl">
            <h1 className="text-4xl font-light tracking-tight text-[var(--brad-heading)] desktop:text-5xl">Welcome back</h1>
            <p className="mt-3 text-base text-[var(--brad-muted)]">Ask Brad about policies, workflows, evidence, QAPI, onboarding, and compliance execution.</p>
          </div>

          <div className="mx-auto mt-lg w-full max-w-5xl">
            {events.length > 0 && (
              <div className="mb-2 flex items-center gap-2 text-xs text-[var(--brad-muted)]">
                <span>Context</span>
                <select aria-label="Context event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="max-w-[260px] truncate rounded-md border border-[var(--brad-border)] bg-[var(--brad-surface)] px-2 py-1 text-xs text-[var(--brad-ink)]">
                  {events.map((ev) => <option key={ev.eventId} value={ev.eventId}>{ev.eventTitle}</option>)}
                </select>
              </div>
            )}
            {composerInner}
            <p className="mt-2 pl-2 text-xs text-[var(--brad-muted)]">Enter to send · Shift+Enter for a new line</p>
          </div>

          {/* Quick actions */}
          <div className="mx-auto mt-lg w-full max-w-5xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 tablet-l:grid-cols-3 desktop:grid-cols-4">
              {quickActions.map((a) => (
                <button
                  key={a.id} type="button" onClick={() => handleQuickAction(a)} disabled={thinking}
                  className="group flex min-h-[108px] flex-col gap-3 rounded-2xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] disabled:opacity-50 motion-reduce:hover:translate-y-0"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${a.id === 'builder' ? 'bg-[#FFFAF7] text-[#C74601]' : 'bg-[var(--brad-surface-2)] text-[#00797D]'}`}>
                    <a.Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium leading-snug text-[var(--brad-ink)]">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Collapsed generated-work card */}
          <div className="mx-auto mt-lg w-full max-w-5xl">
            <GeneratedWorkCard objects={objects} onOpen={() => setShowGenerated(true)} />
          </div>
        </div>
      )}

      {/* ───────────────────────── ACTIVE CHAT ───────────────────────── */}
      {!landing && (
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-3xl flex-1 space-y-5 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'brad' && (
                  <span className="mr-3 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--brad-border)] bg-[var(--brad-surface)] text-[#00797D] shadow-sm"><Bot className="h-4 w-4" aria-hidden /></span>
                )}
                <div className="max-w-[85%]">
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap rounded-3xl rounded-tr-sm px-5 py-3 font-light leading-relaxed shadow-sm [background:var(--brad-user-bubble)] [color:var(--brad-user-text)]">{m.text}</div>
                  ) : m.blocked ? (
                    <div className="flex items-start gap-3 rounded-2xl rounded-tl-sm border border-[#FFD5BF] bg-[#FFFAF7] px-5 py-4 text-[#C74601] shadow-sm">
                      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /><span className="font-light leading-relaxed">{m.text}</span>
                    </div>
                  ) : (
                    <div className="space-y-2 rounded-3xl rounded-tl-sm border border-[var(--brad-border)] bg-[var(--brad-surface)] px-5 py-3.5 font-light leading-relaxed text-[var(--brad-ink)] shadow-md">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#00797D]">Brad</div>
                      <p className="whitespace-pre-wrap text-[15px]">{m.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && <div className="flex items-center gap-2 text-sm text-[#00797D]"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Brad is working…</div>}
            <div ref={transcriptEnd} />
          </div>

          {/* Composer LOCKED to bottom (ChatGPT/Grok-style) */}
          <div className="sticky bottom-0 z-20 -mx-md px-md pb-2 pt-3 [background:linear-gradient(180deg,transparent,var(--brad-surface-2)_38%)]">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-2 flex items-center justify-between gap-2">
                <button type="button" onClick={() => setMoreActions((v) => !v)} className="inline-flex items-center gap-1 rounded-full border border-[var(--brad-border)] bg-[var(--brad-surface)] px-3 py-1 text-xs font-medium text-[var(--brad-muted)] hover:text-[#00797D]">
                  Actions {moreActions ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
                {events.length > 0 && (
                  <select aria-label="Context event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="max-w-[220px] truncate rounded-md border border-[var(--brad-border)] bg-[var(--brad-surface)] px-2 py-1 text-xs text-[var(--brad-ink)]">
                    {events.map((ev) => <option key={ev.eventId} value={ev.eventId}>{ev.eventTitle}</option>)}
                  </select>
                )}
              </div>
              {moreActions && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {quickActions.map((a) => (
                    <button key={a.id} type="button" onClick={() => handleQuickAction(a)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brad-border)] bg-[var(--brad-surface)] px-3 py-1.5 text-xs font-medium text-[var(--brad-ink)] hover:text-[#00797D]">
                      <a.Icon aria-hidden className="h-3.5 w-3.5" /> {a.label}
                    </button>
                  ))}
                </div>
              )}
              {composerInner}
              <p className="mt-1.5 pl-2 text-[11px] text-[var(--brad-muted)]">Enter to send · Shift+Enter for a new line</p>
            </div>
          </div>
        </div>
      )}

      {lastEventUpdate && (
        <div className="relative z-10 mx-auto mt-md w-full max-w-3xl rounded-md border border-[#C4F4F5] bg-[#F7FEFF] px-md py-2 text-xs text-[#004142]">
          Updated the event record. {lastEventUpdate.appliedFields.length} field(s) appended.
        </div>
      )}

      {/* Super Admin approvals (only when present) */}
      {me?.isSuperAdmin && approvals.length > 0 && (
        <section className="relative z-10 mx-auto mt-md w-full max-w-3xl rounded-2xl border border-[#FFD5BF] bg-[#FFFAF7] p-lg">
          <h2 className="mb-md flex items-center gap-2 text-base font-medium text-[#004142]"><ShieldCheck className="h-5 w-5 text-[#C74601]" aria-hidden /> Pending approvals</h2>
          <div className="grid gap-md">
            {approvals.map((a) => (
              <div key={a.approvalId} className="rounded-xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-md shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-[#004142]">{objLabel(a.objectType)}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(a.riskLevel === 'high' ? 'denied' : a.riskLevel === 'medium' ? 'pending-approval' : 'committed')}`}>risk: {a.riskLevel}</span>
                </div>
                <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-[var(--brad-surface-2)] p-2 text-xs text-[var(--brad-ink)]">{a.preview.summary}</pre>
                <input value={reason[a.approvalId] ?? ''} onChange={(e) => setReason((r) => ({ ...r, [a.approvalId]: e.target.value }))} placeholder="Reason (optional)" className="mt-2 w-full rounded-md border border-[var(--brad-border)] bg-[var(--brad-surface)] px-2 py-1 text-xs text-[var(--brad-ink)]" />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => void decide(a.approvalId, 'approved')} className="inline-flex items-center gap-1 rounded-md bg-[#00797D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#004142]"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                  <button type="button" onClick={() => void decide(a.approvalId, 'denied')} className="inline-flex items-center gap-1 rounded-md border border-[#FFD5BF] bg-[var(--brad-surface)] px-3 py-1.5 text-xs font-medium text-[#C74601]"><XCircle className="h-3.5 w-3.5" /> Deny</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Public research panel (opened by Trusted Public Research) */}
      {showResearch && (
        <div className="relative z-10 mx-auto mt-md w-full max-w-3xl"><PublicResearchCard /></div>
      )}

      {/* Generated-work drawer */}
      {showGenerated && (
        <GeneratedWorkDrawer
          objects={objects}
          expanded={expanded}
          onToggleExpand={(id) => setExpanded(expanded === id ? null : id)}
          onClose={() => setShowGenerated(false)}
        />
      )}

      <HowBradWorksPanel open={showHowBrad} onClose={() => setShowHowBrad(false)} />
      {scoped && (
        <ScopedActionDialog scope={scoped} onClose={() => setScoped(null)} onDraft={(prompt) => { setScoped(null); setInput(prompt); focusComposer(); }} />
      )}
    </div>
  );
}

/* Collapsed summary card shown on the landing page (no raw objects/JSON). */
function GeneratedWorkCard({ objects, onOpen }: { objects: GeneratedObject[]; onOpen: () => void }) {
  const latest = objects[0];
  return (
    <button type="button" onClick={onOpen} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-5 text-left shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brad-surface-2)] text-[#00797D]"><FolderClosed aria-hidden className="h-5 w-5" /></span>
        <div>
          <div className="text-sm font-medium text-[var(--brad-heading)]">Generated work</div>
          <div className="text-xs text-[var(--brad-muted)]">
            {objects.length === 0
              ? 'Recent Brad drafts and records will appear here for review.'
              : `${objects.length} item${objects.length === 1 ? '' : 's'} · latest: ${objLabel(latest.metadata.object_type)} · ${new Date(latest.metadata.generated_at).toLocaleDateString()}`}
          </div>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brad-border)] px-3 py-1 text-xs font-medium text-[#00797D]">View generated work <ChevronRight className="h-3.5 w-3.5" /></span>
    </button>
  );
}

/* Slide-over drawer with polished summaries; raw details behind a click. */
function GeneratedWorkDrawer({ objects, expanded, onToggleExpand, onClose }: {
  objects: GeneratedObject[]; expanded: string | null; onToggleExpand: (id: string) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-modal flex justify-end bg-[#004142]/10 backdrop-blur-sm" onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <aside className="brad-workspace flex h-full w-full max-w-md flex-col border-l border-[var(--brad-border)] bg-[var(--brad-surface-2)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--brad-border)] px-lg py-4">
          <h2 className="flex items-center gap-2 text-base font-medium text-[var(--brad-heading)]"><FileText className="h-5 w-5 text-[#00797D]" aria-hidden /> Generated work</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-md text-[var(--brad-muted)] hover:bg-[var(--brad-surface)]"><X className="h-4 w-4" aria-hidden /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-lg">
          {objects.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--brad-border)] bg-[var(--brad-surface)] px-md py-lg text-center text-sm text-[var(--brad-muted)]">No generated work yet. Run a report, generate a packet, or draft QAPI minutes.</p>
          ) : objects.map((o) => (
            <div key={o.metadata.object_id} className="rounded-xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-md shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--brad-heading)]"><ClipboardList className="h-4 w-4 text-[#00797D]" aria-hidden /> {objLabel(o.metadata.object_type)}</div>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(o.metadata.write_status)}`}>{o.metadata.write_status}</span>
              </div>
              <div className="mt-1 text-xs text-[var(--brad-muted)]">
                {new Date(o.metadata.generated_at).toLocaleString()}{o.metadata.source_event_id ? ` · ${o.metadata.source_event_id}` : ''}
              </div>
              <button type="button" onClick={() => onToggleExpand(o.metadata.object_id)} className="mt-2 text-xs text-[#00797D] hover:underline">
                {expanded === o.metadata.object_id ? 'Hide details' : 'View details'}
              </button>
              {expanded === o.metadata.object_id && (
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-[var(--brad-surface-2)] p-2 text-[11px] text-[var(--brad-ink)]">{JSON.stringify(o.content, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function ScopedActionDialog({ scope, onClose, onDraft }: { scope: ScopedActionId; onClose: () => void; onDraft: (prompt: string) => void }) {
  const copy = SCOPED_ACTION_COPY[scope];
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => { closeRef.current?.focus(); }, []);
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-[#004142]/10 p-lg backdrop-blur-sm" onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="brad-workspace grid w-full max-w-md gap-md rounded-2xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-md">
          <h2 id={titleId} className="text-lg font-medium text-[var(--brad-heading)]">{copy.title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-md text-[var(--brad-muted)] hover:bg-[var(--brad-surface-2)]"><X aria-hidden className="h-4 w-4" /></button>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-[#FFD5BF] bg-[#FFFAF7] p-md text-sm text-[#C74601]">
          <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><span>{copy.body}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--brad-border)] bg-[var(--brad-surface-2)] px-lg py-2 text-sm font-medium text-[var(--brad-ink)]">Close</button>
          <button type="button" onClick={() => onDraft(copy.draftPrompt)} className="rounded-lg bg-[#00797D] px-lg py-2 text-sm font-medium text-white hover:bg-[#004142]">Draft with Brad</button>
        </div>
      </div>
    </div>
  );
}
