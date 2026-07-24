"use client";

/* ═══════════════════════════════════════════════════════════════════════════
   Nolan — Nurse Onboarding & Learning Assistant (floating training tutor).

   Replaces the generic "Need help?" support treatment (Master Correction §15).
   Uses the main app's existing Nolan visual and its existing tutor endpoint
   (POST /api/nolan/tutor/ask) — this app creates NO new Nolan backend. Because
   the Employee Journey app is a separate origin, the request is sent to the
   configured main-app origin (getMainAppOrigin()); if that origin is not
   configured (production) or unreachable, Nolan degrades to an honest
   "temporarily unavailable" state with support alternatives — never a raw 404.

   Nolan may explain navigation, assignments, a policy concept from approved
   sources, what is due, and supervised-visit prep. Nolan may NOT answer a
   scored quiz, submit work, mark completion, grant competency/clearance, accept
   PHI, or give patient-specific advice. It is reachable from every portal route
   (mounted in EmployeePortalShell) and via the "nolan:open" window event.
   ═══════════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { GraduationCap, Send, X, Loader2, LifeBuoy } from "lucide-react";
import { usePreview } from "./PreviewContext";
import { getMainAppOrigin } from "../_lib/mainAppUrl";

interface TutorMsg {
  id: string;
  role: "user" | "nolan";
  text: string;
}

let seq = 0;
const nextId = () => `n${++seq}`;

function nolanErrorFor(status: number): string {
  if (status === 401) return "Your session has expired — sign in again to ask Nolan.";
  if (status === 403) return "Your account doesn't have access to Nolan.";
  if (status === 404) return "Nolan is temporarily unavailable — the training assistant isn't reachable on this deployment.";
  if (status === 503) return "Nolan is temporarily unavailable in this environment.";
  return `Nolan is temporarily unavailable right now (${status}).`;
}

const SUGGESTIONS = [
  "What do I need to complete, and when?",
  "Why is this assigned to me?",
  "How do the quiz attempts work?",
  "How do I prepare for a supervised visit?",
];

/** Derive safe, non-PHI learner/page context for Nolan. */
function useNolanContext() {
  const { persona } = usePreview();
  const pathname = usePathname();
  return useMemo(() => {
    const ctx: Record<string, string> = {
      surface: "employee-journey",
      role: persona.role,
      roleCode: persona.roleCode,
      journeyStage: persona.stage,
      currentPath: pathname,
    };
    // /journey/policies/<PATHWAY__COURSE__POLICY>
    const policyMatch = /\/journey\/policies\/([^/?]+)/.exec(pathname);
    if (policyMatch) {
      const parts = decodeURIComponent(policyMatch[1]).split("__");
      if (parts.length === 3) {
        ctx.currentCourseId = parts[1];
        ctx.currentPolicyId = parts[2];
      }
    }
    const appendixMatch = /\/journey\/appendices\/([^/?]+)/.exec(pathname);
    if (appendixMatch) ctx.currentAppendixKey = decodeURIComponent(appendixMatch[1]);
    const formMatch = /\/journey\/forms\/([^/?]+)/.exec(pathname);
    if (formMatch) ctx.currentFormId = decodeURIComponent(formMatch[1]);
    return ctx;
  }, [persona.role, persona.roleCode, persona.stage, pathname]);
}

export function NolanAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TutorMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useNolanContext();

  // Open on the shared "nolan:open" window event (fired by the sidebar / support page).
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("nolan:open", handler);
    return () => window.removeEventListener("nolan:open", handler);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || thinking) return;
      setError(null);
      setInput("");
      setMessages((m) => [...m, { id: nextId(), role: "user", text: q }]);
      setThinking(true);
      try {
        const origin = getMainAppOrigin();
        if (!origin) {
          throw new Error(
            "Nolan is temporarily unavailable — the training service isn't configured for this environment.",
          );
        }
        const devHeaders: Record<string, string> =
          process.env.NODE_ENV !== "production"
            ? { "x-user-id": "journey-preview", "x-user-display-name": "Journey Preview" }
            : {};
        const res = await fetch(`${origin}/api/nolan/tutor/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...devHeaders },
          body: JSON.stringify({ question: q, context }),
        });
        if (!res.ok) throw new Error(nolanErrorFor(res.status));
        const data = (await res.json()) as { text?: string };
        setMessages((m) => [
          ...m,
          { id: nextId(), role: "nolan", text: data.text ?? "Nolan returned an empty response." },
        ]);
      } catch (e) {
        const msg =
          e instanceof Error && e.message.startsWith("Nolan")
            ? e.message
            : "Nolan can't be reached right now. Check your connection and try again.";
        setError(msg);
      } finally {
        setThinking(false);
      }
    },
    [thinking, context],
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#007970] px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        aria-label="Ask Nolan, the training assistant"
        data-testid="nolan-fab"
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
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close Nolan"
          className="rounded-full p-1 text-white/90 transition hover:bg-white/15"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="font-roboto text-sm leading-relaxed text-[#3d3d3b]">
              Hi! I can explain what&apos;s assigned, what&apos;s due, how the quizzes and attempts
              work, and how to prepare for a supervised visit. I can&apos;t answer quiz questions,
              submit work, or handle patient information — for policy detail I&apos;ll point you to
              the right source.
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
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#007970] px-3.5 py-2 font-roboto text-sm text-white"
                  : "max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-[#E5E4E3] bg-[#FAFBF8] px-3.5 py-2 font-roboto text-sm leading-relaxed text-[#3d3d3b]"
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
        {error && (
          <div className="rounded-xl border border-[#F06923]/40 bg-[#FFF0E5] p-3">
            <p className="font-roboto text-xs text-[#B3261E]">{error}</p>
            <p className="mt-2 flex items-center gap-1.5 font-roboto text-[11px] text-[#3d3d3b]">
              <LifeBuoy className="h-3.5 w-3.5 text-[#D1571A]" aria-hidden />
              Meanwhile: ask your supervisor / clinical educator, or the People Team for
              onboarding, credentials, and lifecycle questions.
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="flex items-center gap-2 border-t border-[#E5E4E3] p-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about assignments, due dates, quizzes…"
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

/** Fire-and-forget opener other components can call. */
export function openNolan() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("nolan:open"));
}
