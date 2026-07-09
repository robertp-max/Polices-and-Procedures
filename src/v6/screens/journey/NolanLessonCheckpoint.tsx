import { useCallback, useMemo, useRef, useState } from 'react';
import { GraduationCap, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { getIdentity } from '../brad/bradApi';

/* ═══════════════════════════════════════════════════════════════════════════
   Nolan lesson checkpoint — the "any clarifying questions?" moment.
   Rendered inline under each lesson's controls. NON-BLOCKING by design: it
   never gates Next (matches the shell's non-blocking canContinue posture).
   Answers come from /api/nolan/tutor/ask with THIS lesson's text as context,
   so Nolan can quote the lesson itself. Deterministic — no model, no PHI.
   ═══════════════════════════════════════════════════════════════════════════ */

interface CheckpointMsg { id: string; role: 'user' | 'nolan'; text: string }

let seq = 0;
const nextId = () => `nc${++seq}`;

/** Flatten a lesson's card objects into plain text for retrieval context —
    defensive against card-shape variance: collects every meaningful string. */
export function flattenLessonText(cards: unknown[], cap = 12000): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  const walk = (v: unknown, depth: number) => {
    if (parts.join(' ').length > cap || depth > 6 || v == null) return;
    if (typeof v === 'string') {
      const t = v.trim();
      // Skip ids/urls/classNames; keep sentence-like content.
      if (t.length >= 30 && !/^[a-z0-9_/.:-]+$/i.test(t) && !seen.has(t)) {
        seen.add(t);
        parts.push(t);
      }
      return;
    }
    if (Array.isArray(v)) { for (const x of v) walk(x, depth + 1); return; }
    if (typeof v === 'object') { for (const x of Object.values(v as Record<string, unknown>)) walk(x, depth + 1); }
  };
  walk(cards, 0);
  return parts.join('\n').slice(0, cap);
}

export function NolanLessonCheckpoint({ moduleId, lessonTitle, cards }: {
  moduleId: string;
  lessonTitle: string;
  cards: unknown[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CheckpointMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const lessonText = useMemo(() => flattenLessonText(cards), [cards]);

  const ask = useCallback(async (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    setError(null);
    setInput('');
    setMessages((m) => [...m, { id: nextId(), role: 'user', text: q }]);
    setThinking(true);
    try {
      const id = getIdentity();
      const res = await fetch('/api/nolan/tutor/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': id.userId,
          'x-user-display-name': id.displayName,
        },
        body: JSON.stringify({
          question: q,
          context: { moduleId, lessonTitle, lessonText, learnerName: id.displayName },
        }),
      });
      if (!res.ok) throw new Error(`Nolan is unavailable right now (${res.status}).`);
      const data = (await res.json()) as { text: string };
      setMessages((m) => [...m, { id: nextId(), role: 'nolan', text: data.text }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nolan is unavailable right now.');
    } finally {
      setThinking(false);
    }
  }, [thinking, moduleId, lessonTitle, lessonText]);

  if (dismissed) return null;

  return (
    <section
      aria-label="Nolan lesson checkpoint"
      className="mt-4 rounded-xl border border-tone-teal-border/40 bg-tone-teal-bg/20 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => { setExpanded((e) => !e); if (!expanded) setTimeout(() => inputRef.current?.focus(), 50); }}
          className="flex min-w-0 items-center gap-2 text-left"
        >
          <GraduationCap className="h-4 w-4 shrink-0 text-brand-teal" aria-hidden />
          <span className="truncate text-xs font-medium text-brand-teal">
            Nolan — any clarifying questions about this lesson before you continue?
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-brand-teal" aria-hidden /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-brand-teal" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full border border-hairline bg-white px-3 py-1 text-[10px] font-medium text-secondary transition hover:border-brand-teal hover:text-brand-teal"
        >
          I’m good
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          {messages.length > 0 && (
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] whitespace-pre-wrap rounded-xl rounded-tr-sm bg-brand-teal px-3 py-1.5 text-xs text-white'
                        : 'max-w-[92%] whitespace-pre-wrap rounded-xl rounded-tl-sm border border-hairline bg-white px-3 py-1.5 text-xs leading-relaxed text-primary'
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          )}
          {thinking && (
            <div className="flex items-center gap-1.5 text-[11px] text-brand-teal">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Checking this lesson…
            </div>
          )}
          {error && <p className="text-[11px] text-tone-orange-text">{error}</p>}
          <form onSubmit={(e) => { e.preventDefault(); void ask(input); }} className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about “${lessonTitle}”…`}
              aria-label="Ask Nolan a question about this lesson"
              className="min-w-0 flex-1 rounded-full border border-hairline bg-white px-3.5 py-1.5 text-xs outline-none transition focus:border-brand-teal"
            />
            <button
              type="submit"
              disabled={thinking || !input.trim()}
              aria-label="Send question to Nolan"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-teal text-white transition disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
