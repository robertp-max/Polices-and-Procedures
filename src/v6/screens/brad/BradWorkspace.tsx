import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot, Send, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  FileText, ClipboardList, Cloud, RefreshCw, Lock,
} from 'lucide-react';
import {
  bradApi, getIdentity, setIdentity, DEV_IDENTITIES,
  type RuntimeInfo, type SuperAdminMe, type GeneratedObject, type ApprovalRequest, type EventMetaResult,
} from './bradApi';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad iAdministrator workspace — clean, centered, light Care Indeed branding.
   • Hero + composer landing → chat after first message.
   • Runtime badge reflects server-verified state (never hardcodes PHI Enabled).
   • Append-only generated objects + Super Admin approval surface.
   ═══════════════════════════════════════════════════════════════════════════ */

type ChatMsg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'brad'; text: string; synthetic: boolean; blocked: boolean; reason?: string };

const PHI_BLOCK_MESSAGE = 'This request may contain PHI and cannot be processed in the current mode.';

function badgeTone(badge: string): string {
  if (/Mock Data/i.test(badge)) return 'border-slate-300 bg-slate-50 text-slate-700';
  if (/Fail Closed|Error/i.test(badge)) return 'border-rose-300 bg-rose-50 text-rose-800';
  if (/PHI Enabled/i.test(badge)) return 'border-amber-300 bg-amber-50 text-amber-900';
  if (/CLI|PHI Disabled/i.test(badge)) return 'border-violet-300 bg-violet-50 text-violet-800';
  return 'border-teal-300 bg-teal-50 text-teal-800';
}

function statusTone(status: string): string {
  switch (status) {
    case 'committed': return 'border-teal-300 bg-teal-50 text-teal-800';
    case 'approved': case 'applied': return 'border-green-300 bg-green-50 text-green-800';
    case 'pending-approval': return 'border-amber-300 bg-amber-50 text-amber-900';
    case 'denied': case 'blocked': return 'border-rose-300 bg-rose-50 text-rose-800';
    default: return 'border-slate-300 bg-slate-50 text-slate-700';
  }
}

const QUICK_PROMPTS: Record<string, string> = {
  'Find a policy': 'Find the policy that governs ',
  'Check a workflow': 'Walk me through the workflow for ',
  'Review evidence': 'Review the evidence collected for ',
  'Identify QAPI gaps': 'Identify the QAPI gaps for the upcoming committee meeting.',
  'Explain this requirement': 'Explain the requirement for ',
  'Show missing forms': 'Show me the missing forms for ',
  'Help with onboarding': 'Help me with the onboarding steps for a new clinician.',
};

let msgSeq = 0;
const nextId = () => `m${++msgSeq}`;

export default function BradWorkspace() {
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [me, setMe] = useState<SuperAdminMe | null>(null);
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
  const transcriptEnd = useRef<HTMLDivElement>(null);

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

  function onIdentityChange(userId: string) {
    setIdentity(userId);
    setIdentityState(getIdentity());
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

  function onChip(label: string) {
    if (QUICK_PROMPTS[label]) { setInput(QUICK_PROMPTS[label]); return; }
    switch (label) {
      case 'Run Report': void runAction(() => bradApi.report('event-readiness', eventId).then((r) => ({ object: r.object })), 'Event Readiness Report'); break;
      case 'Prepare audit packet':
      case 'Generate Event Packet': void runAction(() => bradApi.eventPacket('general', eventId), 'Event Packet'); break;
      case 'Generate QAPI Minutes': void runAction(() => bradApi.qapiMinutes(eventId), 'QAPI Minutes Draft'); break;
      case 'Review Pending Brad Objects': document.getElementById('brad-objects')?.scrollIntoView({ behavior: 'smooth' }); break;
      case 'Cloud Change Set': void proposeSampleCloud(); break;
      default: setInput(`${label}: `);
    }
  }

  async function proposeSampleCloud() {
    setError(null); setThinking(true);
    try {
      const ops = [{ type: 'cloudrun.scaling.update', resource: 'care-indeed-hh-v2-dev', description: 'set min instances 0 / max 2', params: { min: 0, max: 2 } }];
      const out = await bradApi.proposeCloudChangeSet(ops, eventId);
      setMessages((m) => [...m, {
        id: nextId(), role: 'brad', synthetic: false, blocked: false,
        text: `Cloud change set proposed (dry-run only, no mutation). Allowlist ${out.plan.allowlistValid ? 'VALID' : 'INVALID'}, risk ${out.plan.riskLevel}. ${out.approvalId ? 'Awaiting Super Admin approval.' : ''}\n${out.plan.dryRunSummary.join('\n')}`,
      }]);
      await refreshObjects(); await refreshApprovals();
    } catch (e) { setError((e as Error).message); } finally { setThinking(false); }
  }

  async function decide(approvalId: string, decision: 'approved' | 'denied') {
    try {
      await bradApi.decide(approvalId, decision, reason[approvalId]);
      await refreshApprovals(); await refreshObjects();
    } catch (e) { setError((e as Error).message); }
  }

  const chips = [
    'Find a policy', 'Check a workflow', 'Review evidence', 'Prepare audit packet',
    'Identify QAPI gaps', 'Explain this requirement', 'Show missing forms', 'Help with onboarding',
    'Run Report', 'Generate Event Packet', 'Generate QAPI Minutes', 'Review Pending Brad Objects',
    ...(me?.isSuperAdmin ? ['Cloud Change Set'] : []),
  ];

  const landing = messages.length === 0;

  return (
    <div className="grid gap-xl font-light">
      {/* Header: identity + runtime badge */}
      <div className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-hairline bg-surface px-lg py-md shadow-rest">
        <div className="flex items-center gap-md">
          <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-brand-teal">
            <Bot aria-hidden className="h-icon-md w-icon-md" />
          </span>
          <div>
            <div className="text-base font-medium text-ink">Brad iAdministrator</div>
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
          {/* DEV identity selector — server still verifies Super Admin. */}
          <label className="flex items-center gap-1 text-xs text-muted" title="Dev identity — the server independently verifies Super Admin status">
            <span className="hidden sm:inline">Acting as</span>
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
        <div className="flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-md py-2 text-xs text-teal-800">
          <ShieldCheck className="h-icon-sm w-icon-sm" aria-hidden /> Super Admin — {me.displayName}. Permissions: {me.permissions.join(', ')}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-md py-2 text-sm text-rose-800">
          <AlertTriangle className="h-icon-sm w-icon-sm" aria-hidden /> {error}
        </div>
      )}

      {/* Hero (landing only) */}
      {landing && (
        <div className="mx-auto mt-lg max-w-2xl text-center">
          <h1 className="text-h1 font-medium text-ink">What can Brad help with?</h1>
          <p className="mt-sm text-base text-muted">Ask about policies, workflows, evidence, audits, onboarding, and compliance execution.</p>
        </div>
      )}

      {/* Chat transcript */}
      {!landing && (
        <div className="mx-auto grid w-full max-w-3xl gap-md">
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'user' ? 'justify-self-end max-w-[85%]' : 'justify-self-start max-w-[92%]'}>
              <div className={`rounded-lg border px-lg py-md text-sm ${m.role === 'user' ? 'border-teal-200 bg-tone-teal-bg text-ink' : 'border-hairline bg-surface text-ink shadow-rest'}`}>
                {m.role === 'brad' && m.blocked && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800">
                    <Lock className="h-3 w-3" aria-hidden /> PHI blocked
                  </div>
                )}
                {m.role === 'brad' && m.synthetic && !m.blocked && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Describe what you need help with…"
            rows={2}
            className="w-full resize-none border-0 bg-transparent px-md py-sm text-base text-ink outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-between px-md pb-1">
            <span className="text-xs text-muted">Enter to send · Shift+Enter for a new line</span>
            <button
              type="button"
              onClick={() => void send()}
              disabled={!input.trim() || thinking}
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Run with Brad
            </button>
          </div>
        </div>

        {/* Quick chips */}
        <div className="mt-md flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChip(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition hover:border-brand-teal hover:text-brand-teal ${c === 'Cloud Change Set' ? 'border-violet-300 bg-violet-50 text-violet-800' : 'border-hairline bg-surface text-ink'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {lastEventUpdate && (
        <div className="mx-auto w-full max-w-3xl rounded-md border border-teal-200 bg-teal-50 px-md py-2 text-xs text-teal-800">
          Event metadata appended (append-only): {lastEventUpdate.appliedFields.join(', ') || 'none'}.
          {lastEventUpdate.rejectedFields.length > 0 && ` Rejected (needs changeset): ${lastEventUpdate.rejectedFields.join(', ')}.`}
        </div>
      )}

      {/* Super Admin approval surface */}
      {me?.isSuperAdmin && approvals.length > 0 && (
        <section className="mx-auto w-full max-w-3xl rounded-lg border border-amber-200 bg-amber-50/40 p-lg">
          <h2 className="mb-md flex items-center gap-2 text-h3 font-medium text-ink"><ShieldCheck className="h-icon-sm w-icon-sm text-amber-700" aria-hidden /> Pending Super Admin approvals</h2>
          <div className="grid gap-md">
            {approvals.map((a) => (
              <div key={a.approvalId} className="rounded-md border border-hairline bg-surface p-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-ink">{a.objectType}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${a.riskLevel === 'high' ? 'border-rose-300 bg-rose-50 text-rose-800' : a.riskLevel === 'medium' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-teal-300 bg-teal-50 text-teal-800'}`}>risk: {a.riskLevel}</span>
                </div>
                <div className="mt-1 text-xs text-muted">Object {a.objectId.slice(0, 32)}… · permission <code>{a.requiredPermission}</code>{a.sourceEventId ? ` · event ${a.sourceEventId}` : ''}</div>
                {a.protectedCoreRefs.length > 0 && <div className="mt-1 text-xs text-muted">Protected-core refs: {a.protectedCoreRefs.join(', ')}</div>}
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs text-ink">{a.preview.summary}</pre>
                <input
                  value={reason[a.approvalId] ?? ''}
                  onChange={(e) => setReason((r) => ({ ...r, [a.approvalId]: e.target.value }))}
                  placeholder="Reason / comment (optional)"
                  className="mt-2 w-full rounded-md border border-hairline bg-white px-2 py-1 text-xs text-ink"
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => void decide(a.approvalId, 'approved')} className="inline-flex items-center gap-1 rounded-md bg-brand-teal px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                  <button type="button" onClick={() => void decide(a.approvalId, 'denied')} className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"><XCircle className="h-3.5 w-3.5" /> Deny</button>
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
                    <div className="text-amber-800">Super Admin approval {o.metadata.write_status === 'approved' || o.metadata.write_status === 'applied' ? 'granted' : o.metadata.write_status === 'denied' ? 'denied' : 'required'}.</div>
                  )}
                </div>
                <button type="button" onClick={() => setExpanded(expanded === o.metadata.object_id ? null : o.metadata.object_id)} className="mt-2 text-xs text-brand-teal hover:underline">
                  {expanded === o.metadata.object_id ? 'Hide' : 'View'} generated object
                </button>
                {expanded === o.metadata.object_id && (
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs text-ink">{JSON.stringify(o.content, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Public research note — Nolan output, when present, is always separated + untrusted. */}
      <div className="mx-auto w-full max-w-3xl rounded-md border border-hairline bg-surface px-md py-2 text-xs text-muted">
        <Cloud className="mr-1 inline h-3.5 w-3.5" aria-hidden /> Public Regulatory Research — Nolan runs through the audited relay and is labeled <strong>untrusted external</strong>; it is never blended into Brad’s internal answers.
      </div>
    </div>
  );
}
