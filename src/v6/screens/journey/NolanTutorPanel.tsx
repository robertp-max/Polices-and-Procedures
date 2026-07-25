import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, Send, X, Loader2 } from 'lucide-react';
import { getIdentity } from '../brad/bradApi';
import { apiRoot, bearerAuthHeader } from '@/auth/apiClient';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';

/* ═══════════════════════════════════════════════════════════════════════════
   Nolan — Nurse Onboarding & Learning Assistant (floating Training tutor).
   User-facing, deterministic, catalog-grounded (/api/nolan/tutor/ask): module
   lookups, role journeys, quiz/retake rules. Refers policy/compliance questions
   to Brad. Completely separate surface from Nolan's Brad-only research relay.
   ═══════════════════════════════════════════════════════════════════════════ */

interface TutorMsg {
  id: string;
  role: 'user' | 'nolan';
  text: string;
  moduleIds?: string[];
}

let seq = 0;
const nextId = () => `n${++seq}`;

/** Truthful, status-specific message. 401 ≠ 404 ≠ 503 — never a generic blur. */
function nolanErrorFor(status: number): string {
  if (status === 401) return 'Your session has expired. Please sign in again to ask Nolan.';
  if (status === 403) return "Your account doesn't have access to Nolan.";
  if (status === 404) return 'Nolan is unavailable right now (404). The training assistant is not reachable on this deployment.';
  if (status === 503) return 'Nolan is temporarily disabled in this environment.';
  return `Nolan is unavailable right now (${status}).`;
}

const SUGGESTIONS = [
  'What do I need to complete, and when?',
  'What modules does an RN need?',
  'What happens if I fail the quiz?',
];

export function NolanTutorPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<TutorMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Learner context from the journey store — powers deadline/plan answers.
  const employees = useJourneyStore((s) => s.employees);
  const currentEmployeeId = useJourneyStore((s) => s.currentEmployeeId);
  const attempts = useJourneyStore((s) => s.attempts);
  const learnerContext = useMemo(() => {
    const me = employees.find((e) => e.id === currentEmployeeId);
    if (!me) return {};
    const completedModuleIds = [...new Set(
      attempts
        .filter((a) => a.employeeId === me.id && (a.lessonStatus === 'passed' || a.lessonStatus === 'completed'))
        .map((a) => a.moduleId),
    )];
    return {
      learnerName: me.name,
      role: me.role,
      startDateIso: me.startDate ?? me.hireDate,
      licenseExpiryIso: me.licenseExpiry,
      appendixFCleared: me.appendixFCleared,
      completedModuleIds,
    };
  }, [employees, currentEmployeeId, attempts]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const ask = useCallback(async (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    setError(null);
    setInput('');
    setMessages((m) => [...m, { id: nextId(), role: 'user', text: q }]);
    setThinking(true);
    try {
      const devId = getIdentity();
      const devHeaders: Record<string, string> = import.meta.env.DEV
        ? { 'x-user-id': devId.userId, 'x-user-display-name': devId.displayName }
        : {};
      const res = await fetch(`${apiRoot()}/nolan/tutor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...bearerAuthHeader(),
          ...devHeaders,
        },
        body: JSON.stringify({ question: q, context: learnerContext }),
      });
      if (!res.ok) throw new Error(nolanErrorFor(res.status));
      const data = (await res.json()) as { text: string; moduleIds?: string[] };
      setMessages((m) => [...m, { id: nextId(), role: 'nolan', text: data.text, moduleIds: data.moduleIds }]);
    } catch (e) {
      // A network/DNS failure (server unreachable) throws a TypeError, not a Response.
      const msg = e instanceof Error && e.message.startsWith('Nolan')
        ? e.message
        : "Nolan can't be reached right now. Check your connection and try again.";
      setError(msg);
    } finally {
      setThinking(false);
    }
  }, [thinking, learnerContext]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#007970] px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        aria-label="Ask Nolan, the training assistant"
      >
        <GraduationCap className="h-4 w-4" aria-hidden />
        Ask Nolan
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Nolan — Nurse Onboarding & Learning Assistant"
      className="fixed bottom-6 right-6 z-40 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[20px] border border-[#E5E4E3] bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between bg-[#007970] px-4 py-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-white" aria-hidden />
          <div>
            <div className="font-montserrat text-sm font-bold text-white">Nolan</div>
            <div className="font-roboto text-[10px] text-white/80">Nurse Onboarding &amp; Learning Assistant</div>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close Nolan" className="rounded-full p-1 text-white/90 transition hover:bg-white/15">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="font-roboto text-sm leading-relaxed text-[#3d3d3b]">
              Hi! I know every module in your journey — what it covers, what your role needs, and how the quizzes work. Training questions only; Brad in iAdministrator handles policy and compliance.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void ask(s)}
                  className="rounded-full border border-[#007970]/30 bg-[#F7FEFF] px-3 py-1.5 text-left font-roboto text-xs text-[#007970] transition hover:border-[#007970]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#007970] px-3.5 py-2 font-roboto text-sm text-white'
                  : 'max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-[#E5E4E3] bg-[#FAFBF8] px-3.5 py-2 font-roboto text-sm leading-relaxed text-[#3d3d3b]'
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 font-roboto text-xs text-[#007970]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Nolan is checking the catalog…
          </div>
        )}
        {error && <p className="font-roboto text-xs text-[#B3261E]">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void ask(input); }}
        className="flex items-center gap-2 border-t border-[#E5E4E3] p-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about modules, roles, quizzes…"
          aria-label="Ask Nolan a training question"
          className="min-w-0 flex-1 rounded-full border border-[#E5E4E3] px-4 py-2 font-roboto text-sm outline-none transition focus:border-[#007970]"
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          aria-label="Send question to Nolan"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F06923] text-white transition disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
