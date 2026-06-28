import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert,
  X, Paperclip, FolderClosed, Sparkles, FileText, ExternalLink,
} from 'lucide-react';
import {
  bradApi, getIdentity,
  type SuperAdminMe, type GeneratedObject, type ApprovalRequest, type EventMetaResult, type UploadMeta,
  type BradReference,
} from './bradApi';
import { getQuickActions, SCOPED_ACTION_COPY, type QuickAction, type ScopedActionId } from './quickActions';
import { HowBradWorksPanel } from './HowBradWorksPanel';
import { PublicResearchCard } from './PublicResearchCard';
import { VeilDrawer } from '../../components/VeilDrawer';
import { resolveBradReferences, type ResolvedBradReference } from '@/policy/utils/bradReferenceResolver';
import { BradFormPanel } from './BradFormPanel';
import { classifyGuidedAssistance, applySlotAnswer, followUpQuestion } from '../../guided/guidedAssistanceClassifier';
import { getTourBuilder } from '../../guided/tourRegistry';
import { useGuidedTourStore } from '../../guided/guidedTourStore';
import { rehearseGuidedTour } from '../../guided/rehearsal';
import { buildDomRehearsalContext } from '../../guided/guidedDomProbe';
import type { GuidedAssistanceIntent } from '../../guided/types';
import { useUiStore } from '@/policy/stores/uiStore';
import { AnimatedCareIndeedLogo } from '../../shell/AnimatedCareIndeedLogo';
import { BradResponseThreadActions } from '@/policy/help-center/threads';

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
  | { id: string; role: 'brad'; text: string; synthetic: boolean; blocked: boolean; reason?: string; references?: BradReference[] };

/** Drop the plain-text reference line — the UI renders references as clickable chips instead. */
function stripReferenceLine(text: string): string {
  return text
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('Related internal references:'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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
    case 'committed': return 'border-tone-teal-border bg-tone-teal-bg text-brand-teal';
    case 'approved': case 'applied': return 'border-tone-teal-border bg-tone-teal-bg text-ink';
    case 'pending-approval': return 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text';
    case 'denied': case 'blocked': return 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text';
    default: return 'border-[var(--brad-border)] bg-[var(--brad-surface-2)] text-[var(--brad-muted)]';
  }
}

let msgSeq = 0;
const nextId = () => `m${++msgSeq}`;

export default function BradWorkspace() {
  const navigate = useNavigate();
  const setBradActivityActive = useUiStore((s) => s.setBradActivityActive);

  const [me, setMe] = useState<SuperAdminMe | null>(null);
  const [eventId, setEventId] = useState<string>('');
  // Identity is read once at mount; the acting-as switcher lives in the nav drawer and reloads on change.
  const [identity] = useState(getIdentity());

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [objects, setObjects] = useState<GeneratedObject[]>([]);
  const [lastEventUpdate, setLastEventUpdate] = useState<EventMetaResult | null>(null);
  const [showQuickActionsPanel, setShowQuickActionsPanel] = useState(false);
  const [showGeneratedPanel, setShowGeneratedPanel] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [reason, setReason] = useState<Record<string, string>>({});

  const [showHowBrad, setShowHowBrad] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [scoped, setScoped] = useState<ScopedActionId | null>(null);
  const [refDrawer, setRefDrawer] = useState<ResolvedBradReference | null>(null);

  const [attachments, setAttachments] = useState<UploadMeta[]>([]);
  const [uploading, setUploading] = useState(false);

  // Brad Guided Assistance — pending slot-collection session (null when idle).
  const [guidedSession, setGuidedSession] = useState<GuidedAssistanceIntent | null>(null);

  const transcriptEnd = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readB64 = (file: File) => new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(file);
  });

  async function handleFiles(list: FileList | null) {
    if (!list || !list.length) return;
    setUploading(true); setError(null);
    try {
      const files = await Promise.all(Array.from(list).map(async (f) => ({
        filename: f.name, mime: f.type || 'application/octet-stream', contentBase64: await readB64(f),
      })));
      const out = await bradApi.upload(files, eventId);
      setAttachments((prev) => [...prev, ...out.uploaded]);
    } catch (e) { setError((e as Error).message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  }

  const refreshObjects = useCallback(async () => {
    try { setObjects((await bradApi.objects()).objects.reverse()); } catch { /* ignore */ }
  }, []);
  const refreshApprovals = useCallback(async () => {
    if (!me?.isSuperAdmin) { setApprovals([]); return; }
    try { setApprovals((await bradApi.approvals()).pending); } catch { setApprovals([]); }
  }, [me]);

  const loadIdentityScoped = useCallback(async () => {
    try {
      const [who, ev] = await Promise.all([bradApi.me(), bradApi.events()]);
      setMe(who);
      if (!eventId && ev.events[0]) setEventId(ev.events[0].eventId);
    } catch (e) { setError((e as Error).message); }
  }, [eventId]);

  useEffect(() => { void loadIdentityScoped(); void refreshObjects(); }, [loadIdentityScoped, refreshObjects, identity]);
  useEffect(() => { void refreshApprovals(); }, [refreshApprovals]);
  useEffect(() => { transcriptEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    const active = thinking || uploading || guidedSession !== null || messages.length > 0;
    setBradActivityActive(active);
    return () => setBradActivityActive(false);
  }, [guidedSession, messages.length, setBradActivityActive, thinking, uploading]);

  function focusComposer() { requestAnimationFrame(() => composerRef.current?.focus()); }

  const bradSay = useCallback((text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: 'brad', text, synthetic: false, blocked: false }]);
  }, []);

  /** Build (or reuse) the tour for a domain, REHEARSE it, then launch (co-pilot). */
  const launchGuidedTour = useCallback((domain: GuidedAssistanceIntent['domain'], slotValues: Record<string, unknown>) => {
    const entry = getTourBuilder(domain);
    if (!entry) { bradSay('I can’t walk you through that one yet, but tell me what you’re trying to do and I’ll help.'); return; }
    const key = entry.key(slotValues);
    const store = useGuidedTourStore.getState();
    const { tour, reused } = store.getOrCreateTour(
      key,
      () => entry.build(slotValues, new Date().toISOString()),
      // Reuse only when the saved tour still has resolvable, well-formed steps.
      (saved) => saved.steps.length > 0 && saved.steps.every((s) => /\[data-tour-target=/.test(s.targetSelector)),
    );

    // PREFLIGHT: rehearse against the current screen to skip already-done steps.
    const route = typeof window !== 'undefined' ? window.location.pathname : '/iadministrator';
    const rehearsal = rehearseGuidedTour(tour, buildDomRehearsalContext(route));
    const startStepId = rehearsal.startStepId ?? tour.steps[0]?.id ?? null;
    const startNo = Math.max(1, tour.steps.findIndex((s) => s.id === startStepId) + 1);

    // Co-pilot: never blocks — Brad runs the safe steps and hands off at checkpoints.
    if (tour.mode === 'copilot') {
      store.launchTour(tour, startStepId);
      bradSay(
        `${reused ? 'Reusing your saved walkthrough' : 'Got it'} — I’ll co-pilot “${tour.title}”. I’ll do the steps I safely can and hand off to you for the parts that need you (typing, uploading, signing, anything that needs your judgment). ${startNo > 1 ? `Some steps are already done, so I’ll pick up at step ${startNo}. ` : ''}Watch the panel on the right.`,
      );
      return;
    }

    // Coached (legacy lock) mode: only lock once the next target is verified ready.
    if (!rehearsal.okToLaunch) {
      const blocker = rehearsal.blockers[0];
      bradSay(
        blocker?.type === 'missing_target' && /Studio panel/.test(blocker.message)
          ? `${reused ? 'Reusing your saved walkthrough' : 'I built your walkthrough'} — “${tour.title}”. You’re already at the point where the rest happens inside the Studio panel. I won’t lock the screen for that part.`
          : 'I found the walkthrough, but I need to refresh the step targets before launching. I won’t lock the screen until the tour is ready.',
      );
      return;
    }
    store.launchTour(tour, startStepId);
    bradSay(
      `${reused ? 'Reusing your saved walkthrough' : 'I built your walkthrough'} — “${tour.title}”. ${startNo > 1 ? `You’ve already done the earlier steps, so I’ll start at step ${startNo}. ` : ''}Follow the highlighted control on the right.`,
    );
  }, [bradSay]);

  const send = useCallback(async (raw?: string) => {
    const text = (raw ?? input).trim();
    if ((!text && attachments.length === 0) || thinking) return;
    setError(null); setInput('');

    // ── Brad Guided Assistance: intercept before any network call ──
    if (text) {
      if (guidedSession) {
        setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);
        const updated = applySlotAnswer(guidedSession, text);
        const nextSlot = updated.missingSlots[0];
        if (updated.shouldLaunchTour) {
          setGuidedSession(null);
          launchGuidedTour(updated.domain, updated.collectedSlots);
        } else if (nextSlot) {
          setGuidedSession(updated);
          bradSay(followUpQuestion(nextSlot));
        } else {
          // No slot to ask and nothing to launch — don't trap the conversation.
          setGuidedSession(null);
          bradSay('Let’s keep going — tell me which event and packet type, or ask me anything else.');
        }
        return;
      }
      const intent = classifyGuidedAssistance(text);
      // Only intercept when we can actually act: launch a tour OR collect a known slot.
      // Otherwise fall through to a normal Brad answer (never crash on a missing slot).
      if (intent && (intent.shouldLaunchTour || intent.missingSlots.length > 0)) {
        setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);
        if (intent.shouldLaunchTour) {
          launchGuidedTour(intent.domain, intent.collectedSlots);
        } else {
          setGuidedSession(intent);
          bradSay(followUpQuestion(intent.missingSlots[0]));
        }
        return;
      }
    }

    const docNote = attachments.length
      ? `Attached documents (entered into the Care Indeed system today): ${attachments.map((a) => a.filename).join(', ')}.\n\n`
      : '';
    const shown = text || `Review my ${attachments.length} attached document(s).`;
    setMessages((m) => [...m, { id: nextId(), role: 'user', text: shown }]);
    setThinking(true);
    try {
      const ans = await bradApi.ask(`${docNote}${text || 'Organize the attached documents neatly and tell me what is needed to prepare the evidence packet.'}`);
      setMessages((m) => [...m, {
        id: nextId(), role: 'brad',
        text: ans.blocked ? PHI_BLOCK_MESSAGE : ans.text,
        synthetic: ans.synthetic, blocked: ans.blocked, reason: ans.reason,
        references: ans.references,
      }]);
    } catch (e) {
      setMessages((m) => [...m, { id: nextId(), role: 'brad', text: `Sorry — I hit a problem: ${(e as Error).message}`, synthetic: false, blocked: false }]);
      setAttachments([]);
    } finally { setThinking(false); }
  }, [input, thinking, attachments, guidedSession, launchGuidedTour, bradSay]);

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

  const composerInner = (
    <div className="group relative w-full">
      <div className={`absolute -inset-1.5 z-0 rounded-[32px] brad-rainbow-glow blur-xl transition-all duration-500 ${thinking ? 'opacity-100 blur-2xl' : 'opacity-60 group-focus-within:opacity-100'}`} aria-hidden />
      <div className="relative z-10 flex flex-col overflow-hidden rounded-3xl border border-[var(--brad-border)] bg-[var(--brad-surface)] shadow-rest">
        <input ref={fileInputRef} type="file" multiple className="hidden" aria-label="Upload documents" title="Upload documents" onChange={(e) => void handleFiles(e.target.files)} />
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-3">
            {attachments.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--brad-border)] bg-[var(--brad-surface-2)] px-2 py-0.5 text-xs text-[var(--brad-ink)]">
                <Paperclip className="h-3 w-3" aria-hidden /> {a.filename}
                <button type="button" aria-label={`Remove ${a.filename}`} onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))} className="ml-0.5 text-[var(--brad-muted)] hover:text-brand-orange"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
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
          <div className="flex items-center gap-3 pl-1 flex-wrap">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} aria-label="Attach documents" title="Attach documents" className="text-[var(--brad-muted)] transition hover:text-brand-teal disabled:opacity-50">
              {uploading ? <Loader2 aria-hidden className="h-5 w-5 animate-spin" /> : <Paperclip aria-hidden className="h-5 w-5" />}
            </button>
            <span className="mx-1 hidden h-4 w-px bg-[var(--brad-border)] sm:block" />

            <button
              type="button"
              onClick={() => { setShowQuickActionsPanel(!showQuickActionsPanel); setShowGeneratedPanel(false); }}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:border-brand-orange hover:text-brand-orange ${showQuickActionsPanel ? 'border-brand-orange text-brand-orange bg-surface-glass' : 'border-[var(--brad-border)] bg-[var(--brad-surface-2)] text-[var(--brad-ink)]'}`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Quick Actions
            </button>

            <button
              type="button"
              onClick={() => { setShowGeneratedPanel(!showGeneratedPanel); setShowQuickActionsPanel(false); }}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:border-brand-orange hover:text-brand-orange ${showGeneratedPanel ? 'border-brand-orange text-brand-orange bg-surface-glass' : 'border-[var(--brad-border)] bg-[var(--brad-surface-2)] text-[var(--brad-ink)]'}`}
            >
              <FolderClosed className="h-3.5 w-3.5" /> Generated Work {objects.length ? `(${objects.length})` : ''}
            </button>

            <span className="mx-1 hidden h-4 w-px bg-[var(--brad-border)] sm:block" />
            <span className="hidden items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--brad-muted)] sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-teal" aria-hidden /> Secure
            </span>
          </div>
          <button
            type="button" onClick={() => void send()} disabled={(!input.trim() && attachments.length === 0) || thinking} aria-label="Send to Brad"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-medium text-on-brand shadow-md transition hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:bg-[var(--brad-surface-2)] disabled:text-[var(--brad-muted)] disabled:shadow-none"
          >
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Run with Brad
          </button>
        </div>
      </div>

      {showQuickActionsPanel && (
        <div className="absolute top-full left-0 right-0 z-30 mt-2 rounded-2xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-4 shadow-xl text-[var(--brad-ink)] max-h-[300px] overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-orange mb-3 px-1">Quick Actions</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {quickActions.map((a) => (
              <button
                key={a.id} type="button" onClick={() => { handleQuickAction(a); setShowQuickActionsPanel(false); }} disabled={thinking}
                className="flex items-center gap-2 rounded-xl border border-[var(--brad-border)] bg-[var(--brad-surface-2)] p-2.5 text-xs font-medium text-[var(--brad-ink)] transition hover:border-brand-teal hover:text-brand-teal disabled:opacity-50"
              >
                <a.Icon aria-hidden className="h-4 w-4 shrink-0 text-brand-teal" />
                <span className="truncate">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showGeneratedPanel && (
        <div className="absolute top-full left-0 right-0 z-30 mt-2 rounded-2xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-4 shadow-xl text-[var(--brad-ink)] max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[var(--brad-border)] pb-2 mb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-orange">Generated Work</div>
            <button type="button" onClick={() => setShowGeneratedPanel(false)} className="text-xs text-[var(--brad-muted)] hover:text-brand-teal">Close</button>
          </div>
          <div className="space-y-2">
            {objects.length === 0 ? (
              <p className="py-4 text-center text-xs text-[var(--brad-muted)]">No generated work yet. Run a report or draft minutes.</p>
            ) : objects.map((o) => (
              <div key={o.metadata.object_id} className="rounded-xl border border-[var(--brad-border)] bg-[var(--brad-surface-2)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[var(--brad-ink)]">{objLabel(o.metadata.object_type)}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusTone(o.metadata.write_status)}`}>{o.metadata.write_status}</span>
                </div>
                <div className="mt-1 text-[10px] text-[var(--brad-muted)]">
                  {new Date(o.metadata.generated_at).toLocaleString()}
                </div>
                <button type="button" onClick={() => setExpanded(expanded === o.metadata.object_id ? null : o.metadata.object_id)} className="mt-2 text-xs text-brand-teal hover:underline">
                  {expanded === o.metadata.object_id ? 'Hide details' : 'View details'}
                </button>
                {expanded === o.metadata.object_id && (
                  <pre className="mt-2 max-h-[200px] overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--brad-surface)] p-2 text-[10px] text-[var(--brad-ink)]">{JSON.stringify(o.content, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="brad-workspace relative flex min-h-screen flex-col overflow-hidden px-lg pb-lg pt-16 font-light text-[var(--brad-ink)] [background:var(--brad-canvas)]"
    >
      <div className="brad-grid-pattern pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      {me?.isSuperAdmin && (
        <div className="relative z-10 mb-md flex items-center gap-2 rounded-md border border-tone-teal-border bg-tone-teal-bg px-md py-2 text-xs text-ink">
          <ShieldCheck className="h-4 w-4" aria-hidden /> Super Admin — {me.displayName}.
        </div>
      )}
      {error && (
        <div className="relative z-10 mb-md flex items-center gap-2 rounded-md border border-tone-orange-border bg-tone-orange-bg px-md py-2 text-sm text-tone-orange-text">
          <AlertTriangle className="h-4 w-4" aria-hidden /> {error}
        </div>
      )}

      {/* ───────────────────────── LANDING (centered, decluttered) ───────────────────────── */}
      {landing && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-xl">
          <div className="w-full max-w-2xl text-center">
            <div className="mb-xl flex justify-center">
              <img src="/ci-logo-gray.png" alt="Care Indeed" className="logo-light h-auto w-[280px] object-contain desktop:w-[320px]" />
              <img src="/ci-logo-white.png" alt="Care Indeed" className="logo-dark h-auto w-[280px] object-contain desktop:w-[320px]" />
            </div>
            <h1 className="text-4xl font-light tracking-tight text-[var(--brad-heading)] desktop:text-5xl">Welcome back</h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-[var(--brad-muted)]">Ask Brad about policies, workflows, evidence, QAPI, onboarding, and compliance execution.</p>
          </div>

          <div className="mt-lg w-full max-w-2xl">
            {composerInner}
            <p className="mt-2 text-center text-xs text-[var(--brad-muted)]">Enter to send · Shift+Enter for a new line</p>
          </div>
        </div>
      )}

      {/* ───────────────────────── ACTIVE CHAT ───────────────────────── */}
      {!landing && (
        <div className="relative z-10 flex flex-1 flex-col">
          {/* Bottom-anchored transcript: newest sits just above the composer, older
              messages are pushed up — standard chat behavior. */}
          <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-y-auto pb-4">
            <div className="flex-1" aria-hidden />
            <div className="space-y-5">
            {messages.map((m, i) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'brad' && (
                  <span className="mr-3 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--brad-border)] bg-[var(--brad-surface)] shadow-sm">
                    <AnimatedCareIndeedLogo className="h-5 w-5" />
                  </span>
                )}
                <div className="max-w-[85%]">
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap rounded-3xl rounded-tr-sm px-5 py-3 font-light leading-relaxed shadow-sm [background:var(--brad-user-bubble)] [color:var(--brad-user-text)]">{m.text}</div>
                  ) : m.blocked ? (
                    <div className="flex items-start gap-3 rounded-2xl rounded-tl-sm border border-tone-orange-border bg-tone-orange-bg px-5 py-4 text-tone-orange-text shadow-sm">
                      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /><span className="font-light leading-relaxed">{m.text}</span>
                    </div>
                  ) : (
                    <div className="space-y-2 rounded-3xl rounded-tl-sm border border-[var(--brad-border)] bg-[var(--brad-surface)] px-5 py-3.5 font-light leading-relaxed text-[var(--brad-ink)] shadow-md">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-teal">Brad</div>
                      <p className="whitespace-pre-wrap text-[15px]">{stripReferenceLine(m.text)}</p>
                      {m.references && m.references.length > 0 && (
                        <BradReferenceLinks references={m.references} onOpen={setRefDrawer} />
                      )}
                      {!m.synthetic && (
                        <BradResponseThreadActions
                          responseId={m.id}
                          userPrompt={messages.slice(0, i).reverse().find((x) => x.role === 'user')?.text ?? ''}
                          responseText={stripReferenceLine(m.text)}
                          references={m.references}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2 pl-1 text-sm text-brand-teal">
                <AnimatedCareIndeedLogo active className="h-7 w-7" />
                Brad is working…
              </div>
            )}
            {guidedSession && (guidedSession.missingSlots[0]?.options?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 pl-11">
                {guidedSession.missingSlots[0].options!.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => void send(o.label)}
                    disabled={thinking}
                    className="rounded-full border border-[var(--brad-border)] bg-[var(--brad-surface-2)] px-3 py-1 text-xs font-medium text-brand-teal transition hover:border-brand-teal hover:bg-surface-hover disabled:opacity-50"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
            </div>
            <div ref={transcriptEnd} />
          </div>

          {/* Composer LOCKED to bottom (ChatGPT/Grok-style) */}
          <div className="sticky bottom-0 z-20 -mx-md px-md pb-2 pt-3 [background:linear-gradient(180deg,transparent,var(--brad-surface-2)_38%)]">
            <div className="mx-auto w-full max-w-3xl">
              {composerInner}
              <p className="mt-1.5 pl-2 text-[11px] text-[var(--brad-muted)]">Enter to send · Shift+Enter for a new line</p>
            </div>
          </div>
        </div>
      )}

      {lastEventUpdate && (
        <div className="relative z-10 mx-auto mt-md w-full max-w-3xl rounded-md border border-tone-teal-border bg-tone-teal-bg px-md py-2 text-xs text-ink">
          Updated the event record. {lastEventUpdate.appliedFields.length} field(s) appended.
        </div>
      )}

      {/* Super Admin approvals (only when present) */}
      {me?.isSuperAdmin && approvals.length > 0 && (
        <section className="relative z-10 mx-auto mt-md w-full max-w-3xl rounded-2xl border border-tone-orange-border bg-tone-orange-bg p-lg">
          <h2 className="mb-md flex items-center gap-2 text-base font-medium text-ink"><ShieldCheck className="h-5 w-5 text-brand-orange" aria-hidden /> Pending approvals</h2>
          <div className="grid gap-md">
            {approvals.map((a) => (
              <div key={a.approvalId} className="rounded-xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-md shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-ink">{objLabel(a.objectType)}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(a.riskLevel === 'high' ? 'denied' : a.riskLevel === 'medium' ? 'pending-approval' : 'committed')}`}>risk: {a.riskLevel}</span>
                </div>
                <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-[var(--brad-surface-2)] p-2 text-xs text-[var(--brad-ink)]">{a.preview.summary}</pre>
                <input value={reason[a.approvalId] ?? ''} onChange={(e) => setReason((r) => ({ ...r, [a.approvalId]: e.target.value }))} placeholder="Reason (optional)" className="mt-2 w-full rounded-md border border-[var(--brad-border)] bg-[var(--brad-surface)] px-2 py-1 text-xs text-[var(--brad-ink)]" />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => void decide(a.approvalId, 'approved')} className="inline-flex items-center gap-1 rounded-md bg-brand-teal px-3 py-1.5 text-xs font-medium text-on-brand hover:bg-brand-teal-deep"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                  <button type="button" onClick={() => void decide(a.approvalId, 'denied')} className="inline-flex items-center gap-1 rounded-md border border-tone-orange-border bg-surface-glass px-3 py-1.5 text-xs font-medium text-tone-orange-text"><XCircle className="h-3.5 w-3.5" /> Deny</button>
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

      <HowBradWorksPanel open={showHowBrad} onClose={() => setShowHowBrad(false)} />
      {scoped && (
        <ScopedActionDialog scope={scoped} onClose={() => setScoped(null)} onDraft={(prompt) => { setScoped(null); setInput(prompt); focusComposer(); }} />
      )}

      {/* Reference document — opens in the right-side panel; chat context is preserved behind it.
          The renderer dispatches by typed target kind: forms render as a fillable form,
          everything else renders the document preview. */}
      {refDrawer && (
        <VeilDrawer
          open
          onClose={() => setRefDrawer(null)}
          eyebrow={`${refDrawer.type.charAt(0).toUpperCase()}${refDrawer.type.slice(1)} reference`}
          title={refDrawer.preview.heading}
          footer={refDrawer.target?.kind !== 'form' && refDrawer.routePath ? (
            <button
              type="button"
              onClick={() => { const path = refDrawer.routePath!; setRefDrawer(null); navigate(path); }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-on-brand transition hover:bg-brand-teal-deep"
            >
              <ExternalLink className="h-4 w-4" aria-hidden /> Open full document
            </button>
          ) : undefined}
        >
          {refDrawer.target?.kind === 'form' ? (
            <BradFormPanel
              formId={refDrawer.target.formId}
              onOpenEsign={(path) => { setRefDrawer(null); navigate(path); }}
            />
          ) : (
            <div className="space-y-3">
              {refDrawer.preview.subheading && (
                <div className="text-xs font-medium uppercase tracking-wider text-muted">{refDrawer.preview.subheading}</div>
              )}
              {refDrawer.preview.lines.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink">{line}</p>
              ))}
              {refDrawer.section && (
                <div className="text-xs text-muted">Section: {refDrawer.section}</div>
              )}
            </div>
          )}
        </VeilDrawer>
      )}
    </div>
  );
}

/** Renders Brad's internal references as clickable chips (resolvable → opens the
    right-side document panel) or muted "unavailable" text (unresolved). */
function BradReferenceLinks({ references, onOpen }: { references: BradReference[]; onOpen: (r: ResolvedBradReference) => void }) {
  const resolved = useMemo(() => resolveBradReferences(references), [references]);
  if (resolved.length === 0) return null;
  return (
    <div className="mt-1 border-t border-[var(--brad-border)] pt-2.5">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--brad-muted)]">Related references</div>
      <div className="flex flex-wrap gap-1.5">
        {resolved.map((r, i) => (
          r.resolvable ? (
            <button
              key={`${r.resolverKey}-${i}`}
              type="button"
              onClick={() => onOpen(r)}
              title={`Open ${r.type}: ${r.title}`}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--brad-border)] bg-[var(--brad-surface-2)] px-2 py-1 text-xs font-medium text-brand-teal transition hover:border-brand-teal hover:bg-surface-hover"
            >
              <FileText className="h-3 w-3 shrink-0" aria-hidden /> <span className="truncate max-w-[220px]">{r.title}</span>
            </button>
          ) : (
            <span
              key={`${r.resolverKey}-${i}`}
              title="Reference unavailable"
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[var(--brad-border)] px-2 py-1 text-xs text-[var(--brad-muted)]"
            >
              <span className="truncate max-w-[220px]">{r.title}</span> · unavailable
            </span>
          )
        ))}
      </div>
    </div>
  );
}


function ScopedActionDialog({ scope, onClose, onDraft }: { scope: ScopedActionId; onClose: () => void; onDraft: (prompt: string) => void }) {
  const copy = SCOPED_ACTION_COPY[scope];
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => { closeRef.current?.focus(); }, []);
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-ink/10 p-lg backdrop-blur-sm" onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="brad-workspace grid w-full max-w-md gap-md rounded-2xl border border-[var(--brad-border)] bg-[var(--brad-surface)] p-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-md">
          <h2 id={titleId} className="text-lg font-medium text-[var(--brad-heading)]">{copy.title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-md text-[var(--brad-muted)] hover:bg-[var(--brad-surface-2)]"><X aria-hidden className="h-4 w-4" /></button>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-sm text-tone-orange-text">
          <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><span>{copy.body}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--brad-border)] bg-[var(--brad-surface-2)] px-lg py-2 text-sm font-medium text-[var(--brad-ink)]">Close</button>
          <button type="button" onClick={() => onDraft(copy.draftPrompt)} className="rounded-lg bg-brand-teal px-lg py-2 text-sm font-medium text-on-brand hover:bg-brand-teal-deep">Draft with Brad</button>
        </div>
      </div>
    </div>
  );
}
