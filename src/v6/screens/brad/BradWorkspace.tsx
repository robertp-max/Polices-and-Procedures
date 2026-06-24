import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  FileText, ClipboardList, RefreshCw, Lock, X,
} from 'lucide-react';
import {
  bradApi, getIdentity, setIdentity, DEV_IDENTITIES,
  type RuntimeInfo, type SuperAdminMe, type BradProfile, type GeneratedObject, type ApprovalRequest, type EventMetaResult,
} from './bradApi';
import { getQuickActions, SCOPED_ACTION_COPY, type QuickAction, type ScopedActionId } from './quickActions';
import { HowBradWorksPanel } from './HowBradWorksPanel';
import { PublicResearchCard } from './PublicResearchCard';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad iAdministrator workspace — polished, light Care Indeed branding.
   • Greeting (server-resolved first name) + premium composer landing.
   • 12 quick actions in contractual order (Builder = #2 for Super Admins).
   • Runtime badge reflects server-verified state (never hardcodes PHI Enabled).
   • Real /api/brad actions, append-only generated objects, Super Admin approvals.
   ═══════════════════════════════════════════════════════════════════════════ */

type ChatMsg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'brad'; text: string; synthetic: boolean; blocked: boolean; reason?: string };

const PHI_BLOCK_MESSAGE = 'This request may contain PHI and cannot be processed in the current mode.';

function badgeTone(badge: string): string {
  if (/Mock Data/i.test(badge)) return 'border-hairline bg-canvas text-muted';
  if (/Fail Closed|Error/i.test(badge)) return 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text';
  if (/PHI Enabled/i.test(badge)) return 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text';
  return 'border-tone-teal-border bg-tone-teal-bg text-brand-teal';
}

function statusTone(status: string): string {
  switch (status) {
    case 'committed': return 'border-tone-teal-border bg-tone-teal-bg text-brand-teal';
    case 'approved': case 'applied': return 'border-tone-teal-border bg-tone-teal-bg text-brand-teal-deep';
    case 'pending-approval': return 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text';
    case 'denied': case 'blocked': return 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text';
    default: return 'border-hairline bg-canvas text-muted';
  }
}

function greetingPrefix(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
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

  function focusComposer() {
    requestAnimationFrame(() => composerRef.current?.focus());
  }

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
    } finally {
      setThinking(false);
    }
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

  return (
    <div className="grid gap-xl font-light">
      {/* Header: identity + runtime badge */}
      <div className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-hairline bg-surface px-lg py-md shadow-rest">
        <div className="flex items-center gap-md">
          <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-brand-teal">
            <Bot aria-hidden className="h-icon-md w-icon-md" />
          </span>
          <div>
            <div className="text-base font-medium text-ink">Brad</div>
            <div className="text-sm text-muted">Policy · workflow · evidence · audit execution support</div>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          {runtime && (
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${badgeTone(runtime.badge)}`} role="status" title={`Model: ${runtime.modelId}`}>
              <span className="h-2 w-2 rounded-full bg-current opacity-70" />
              {runtime.badge}<span className="opacity-60">· {runtime.modelId}</span>
            </span>
          )}
          {/* DEV identity selector — the server independently verifies Super Admin. */}
          <label className="flex items-center gap-1 text-xs text-muted" title="Dev identity — the server independently verifies Super Admin status">
            <span className="hidden tablet-l:inline">Acting as</span>
            <select
              aria-label="Dev identity"
              value={identity.userId}
              onChange={(e) => onIdentityChange(e.target.value)}
              className="rounded-md border border-hairline bg-white px-2 py-1 text-xs text-ink"
            >
              {DEV_IDENTITIES.map((d) => <option key={d.userId} value={d.userId}>{d.displayName}</option>)}
            </select>
          </label>
        </div>
      </div>

      {me?.isSuperAdmin && (
        <div className="flex items-center gap-2 rounded-md border border-tone-teal-border bg-tone-teal-bg px-md py-2 text-xs text-brand-teal-deep">
          <ShieldCheck className="h-icon-sm w-icon-sm" aria-hidden /> Super Admin — {me.displayName}. Permissions: {me.permissions.join(', ')}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-tone-orange-border bg-tone-orange-bg px-md py-2 text-sm text-tone-orange-text">
          <AlertTriangle className="h-icon-sm w-icon-sm" aria-hidden /> {error}
        </div>
      )}

      {/* Greeting (landing only) */}
      {landing && (
        <div className="mx-auto mt-sm w-full max-w-3xl">
          <h1 className="text-display font-light text-ink">
            {firstName ? (
              <>
                <span className="text-muted">{greetingPrefix()}, </span>
                <span className="font-medium text-brand-teal-deep">{firstName}</span>
              </>
            ) : (
              <span className="font-medium text-brand-teal-deep">Welcome back</span>
            )}
          </h1>
          <p className="mt-sm text-base text-muted">Ask Brad to generate, analyze, or draft documents — grounded in Care Indeed policies, workflows, and evidence.</p>
        </div>
      )}

      {/* Chat transcript */}
      {!landing && (
        <div className="mx-auto grid w-full max-w-3xl gap-md">
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'user' ? 'justify-self-end max-w-[85%]' : 'justify-self-start max-w-[92%]'}>
              <div className={`rounded-lg border px-lg py-md text-sm ${m.role === 'user' ? 'border-tone-teal-border bg-tone-teal-bg text-ink' : 'border-hairline bg-surface text-ink shadow-rest'}`}>
                {m.role === 'brad' && m.blocked && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-tone-orange-border bg-tone-orange-bg px-2 py-0.5 text-xs font-medium text-tone-orange-text">
                    <Lock className="h-3 w-3" aria-hidden /> PHI blocked
                  </div>
                )}
                {m.role === 'brad' && m.synthetic && !m.blocked && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-hairline bg-canvas px-2 py-0.5 text-xs font-medium text-muted">
                    Synthetic / mock output
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
          {thinking && <div className="justify-self-start text-sm text-muted"><Loader2 className="inline h-4 w-4 animate-spin" /> Brad is working…</div>}
          <div ref={transcriptEnd} />
        </div>
      )}

      {/* Composer */}
      <div className="mx-auto w-full max-w-3xl">
        {events.length > 0 && (
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <span>Context event:</span>
            <select aria-label="Context event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="rounded-md border border-hairline bg-white px-2 py-1 text-xs text-ink">
              {events.map((ev) => <option key={ev.eventId} value={ev.eventId}>{ev.eventTitle}</option>)}
            </select>
          </div>
        )}
        <div className="rounded-2xl border border-hairline bg-surface p-sm shadow-rest focus-within:border-brand-teal">
          <textarea
            ref={composerRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Ask Brad to generate, analyze, or draft documents…"
            rows={3}
            disabled={thinking}
            aria-label="Ask Brad"
            className="w-full resize-none border-0 bg-transparent px-md py-sm text-base text-ink outline-none placeholder:text-muted disabled:opacity-60"
          />
          <div className="flex items-center justify-between px-md pb-1">
            <span className="text-xs text-muted">Enter to send · Shift+Enter for a new line</span>
            <button
              type="button"
              onClick={() => void send()}
              disabled={!input.trim() || thinking}
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-medium text-on-brand transition hover:opacity-90 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50"
            >
              {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Run with Brad
            </button>
          </div>
        </div>
      </div>

      {/* Quick action grid (landing) */}
      {landing && (
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-md tablet-p:grid-cols-2 tablet-l:grid-cols-3 desktop:grid-cols-4">
            {quickActions.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleQuickAction(a)}
                disabled={thinking}
                className="group flex min-h-[116px] flex-col justify-between gap-md rounded-lg border border-hairline bg-surface p-lg text-left shadow-rest transition hover:-translate-y-0.5 hover:border-brand-teal hover:shadow-hover focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:hover:translate-y-0"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-md transition ${a.id === 'builder' ? 'bg-tone-orange-bg text-brand-orange' : 'bg-tone-teal-bg text-brand-teal'}`}>
                  <a.Icon aria-hidden className="h-icon-md w-icon-md" />
                </span>
                <span className="text-sm font-medium leading-snug text-ink group-hover:text-brand-teal-deep">{a.label}</span>
              </button>
            ))}
          </div>
          {me?.isSuperAdmin && (
            <p className="mt-md text-center text-xs text-muted">
              <span className="font-medium text-brand-orange">Builder Beta</span> — available for review. Subject to modification or removal.
            </p>
          )}
        </div>
      )}

      {/* Public research panel (opened by "Trusted Public Research") */}
      {showResearch && (
        <div className="mx-auto w-full max-w-3xl">
          <PublicResearchCard />
          <p className="mt-2 text-xs text-muted">
            Ask Brad above to request cited public-source context. External results appear here, separate from Brad’s internal analysis, and must be validated before any action.
          </p>
        </div>
      )}

      {lastEventUpdate && (
        <div className="mx-auto w-full max-w-3xl rounded-md border border-tone-teal-border bg-tone-teal-bg px-md py-2 text-xs text-brand-teal-deep">
          Event metadata appended (append-only): {lastEventUpdate.appliedFields.join(', ') || 'none'}.
          {lastEventUpdate.rejectedFields.length > 0 && ` Rejected (needs changeset): ${lastEventUpdate.rejectedFields.join(', ')}.`}
        </div>
      )}

      {/* Super Admin approval surface */}
      {me?.isSuperAdmin && approvals.length > 0 && (
        <section className="mx-auto w-full max-w-3xl rounded-lg border border-tone-orange-border bg-tone-orange-bg/40 p-lg">
          <h2 className="mb-md flex items-center gap-2 text-h3 font-medium text-ink"><ShieldCheck className="h-icon-sm w-icon-sm text-brand-orange" aria-hidden /> Pending Super Admin approvals</h2>
          <div className="grid gap-md">
            {approvals.map((a) => (
              <div key={a.approvalId} className="rounded-md border border-hairline bg-surface p-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-ink">{a.objectType}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(a.riskLevel === 'high' ? 'denied' : a.riskLevel === 'medium' ? 'pending-approval' : 'committed')}`}>risk: {a.riskLevel}</span>
                </div>
                <div className="mt-1 text-xs text-muted">Object {a.objectId.slice(0, 32)}… · permission <code>{a.requiredPermission}</code>{a.sourceEventId ? ` · event ${a.sourceEventId}` : ''}</div>
                {a.protectedCoreRefs.length > 0 && <div className="mt-1 text-xs text-muted">Protected-core refs: {a.protectedCoreRefs.join(', ')}</div>}
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-canvas p-2 text-xs text-ink">{a.preview.summary}</pre>
                <input
                  value={reason[a.approvalId] ?? ''}
                  onChange={(e) => setReason((r) => ({ ...r, [a.approvalId]: e.target.value }))}
                  placeholder="Reason / comment (optional)"
                  className="mt-2 w-full rounded-md border border-hairline bg-white px-2 py-1 text-xs text-ink"
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => void decide(a.approvalId, 'approved')} className="inline-flex items-center gap-1 rounded-md bg-brand-teal px-3 py-1.5 text-xs font-medium text-on-brand hover:opacity-90"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                  <button type="button" onClick={() => void decide(a.approvalId, 'denied')} className="inline-flex items-center gap-1 rounded-md border border-tone-orange-border bg-white px-3 py-1.5 text-xs font-medium text-brand-orange hover:bg-tone-orange-bg"><XCircle className="h-3.5 w-3.5" /> Deny</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Generated objects */}
      <section id="brad-objects" className="mx-auto w-full max-w-3xl">
        <div className="mb-md flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-h3 font-medium text-ink"><FileText className="h-icon-sm w-icon-sm text-brand-teal" aria-hidden /> Brad-generated objects (append-only)</h2>
          <button type="button" onClick={() => void refreshObjects()} className="inline-flex items-center gap-1 text-xs text-muted hover:text-brand-teal"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
        </div>
        {objects.length === 0 ? (
          <p className="rounded-md border border-dashed border-hairline bg-surface px-md py-lg text-center text-sm text-muted">No objects yet. Run a report, generate a packet, or draft QAPI minutes.</p>
        ) : (
          <div className="grid gap-sm">
            {objects.map((o) => (
              <div key={o.metadata.object_id} className="rounded-md border border-hairline bg-surface p-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-ink"><ClipboardList className="h-4 w-4 text-brand-teal" aria-hidden /> {o.metadata.object_type}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(o.metadata.write_status)}`}>{o.metadata.write_status}</span>
                </div>
                <div className="mt-1 grid gap-0.5 text-xs text-muted">
                  <div>ID: <code>{o.metadata.object_id.slice(0, 40)}…</code></div>
                  {o.metadata.source_event_id && <div>Event: {o.metadata.source_event_id}</div>}
                  <div>Created: {new Date(o.metadata.generated_at).toLocaleString()} · provenance: {o.metadata.model_provider}/{o.metadata.model_id} ({o.metadata.runtime_mode})</div>
                  {(o.metadata.object_type === 'BradGeneratedChangeSet' || o.metadata.object_type === 'BradGeneratedCloudChangeSet') && (
                    <div className="text-brand-orange">Super Admin approval {o.metadata.write_status === 'approved' || o.metadata.write_status === 'applied' ? 'granted' : o.metadata.write_status === 'denied' ? 'denied' : 'required'}.</div>
                  )}
                </div>
                <button type="button" onClick={() => setExpanded(expanded === o.metadata.object_id ? null : o.metadata.object_id)} className="mt-2 text-xs text-brand-teal hover:underline">
                  {expanded === o.metadata.object_id ? 'Hide' : 'View'} generated object
                </button>
                {expanded === o.metadata.object_id && (
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-canvas p-2 text-xs text-ink">{JSON.stringify(o.content, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Neutral public-research note (no internal agent name; always separated + untrusted) */}
      <div className="mx-auto w-full max-w-3xl rounded-md border border-hairline bg-surface px-md py-2 text-xs text-muted">
        <ShieldCheck className="mr-1 inline h-3.5 w-3.5" aria-hidden /> External public-source review runs through an audited public research layer, is labeled <strong>untrusted external</strong>, and is never blended into Brad’s internal answers.
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
      className="fixed inset-0 z-modal flex items-center justify-center bg-ink/10 p-lg backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="grid w-full max-w-md gap-md rounded-2xl border border-hairline bg-surface p-xl shadow-hover" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-md">
          <h2 id={titleId} className="text-h3 font-medium text-ink">{copy.title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="grid h-tap w-tap place-items-center rounded-md bg-canvas text-muted hover:bg-tone-teal-bg hover:text-brand-teal focus-visible:outline-none focus-visible:shadow-focus">
            <X aria-hidden className="h-icon-sm w-icon-sm" />
          </button>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-sm text-tone-orange-text">
          <AlertTriangle aria-hidden className="mt-0.5 h-icon-sm w-icon-sm shrink-0" />
          <span>{copy.body}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-hairline bg-canvas px-lg py-2 text-sm font-medium text-ink hover:bg-tone-teal-bg focus-visible:outline-none focus-visible:shadow-focus">Close</button>
          <button type="button" onClick={() => onDraft(copy.draftPrompt)} className="rounded-lg bg-brand-teal px-lg py-2 text-sm font-medium text-on-brand hover:bg-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus">Draft with Brad (synthetic)</button>
        </div>
      </div>
    </div>
  );
}
