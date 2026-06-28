import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, AlertTriangle, ArrowRight, RefreshCw, Lock, ShieldAlert, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useGuidedTourStore, TOUR_LOCKED_REASON } from './guidedTourStore';
import { evalDomPredicate } from './guidedDomProbe';

/** Programmatically set a <select> to an option matching `desired` (by value or text). */
function performSetSelect(selector: string, desired: string) {
  const el = document.querySelector(selector) as HTMLSelectElement | null;
  if (!el) return;
  let val = '';
  for (const opt of Array.from(el.options)) {
    if (opt.value === desired || (desired && opt.text.toLowerCase().includes(desired.toLowerCase()))) { val = opt.value; break; }
  }
  if (!val) return; // no confident match → leave the existing/default selection
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
  setter?.call(el, val);
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/* ═══════════════════════════════════════════════════════════════════════════
   GuidedTourRunner — global, route-spanning overlay.
   ----------------------------------------------------------------------------
   Spotlights the current target (rainbow glow), darkens + LOCKS everything else,
   validates the step's completion condition, then enables Next. Crucially: it
   NEVER locks the screen when the current target is missing or lives inside the
   Studio iframe — it shows a recovery / hand-off panel instead, so the user is
   never trapped. Rehearsal (see rehearsal.ts) decides start step + okToLaunch
   before this ever renders a lock.
   ═══════════════════════════════════════════════════════════════════════════ */

interface Rect { top: number; left: number; width: number; height: number }

export function GuidedTourRunner() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = useGuidedTourStore((s) => s.active);
  const tour = useGuidedTourStore((s) => s.tour);
  const currentStepIndex = useGuidedTourStore((s) => s.currentStepIndex);
  const stepValidated = useGuidedTourStore((s) => s.stepValidated);
  const targetMissing = useGuidedTourStore((s) => s.targetMissing);
  const markStepValidated = useGuidedTourStore((s) => s.markStepValidated);
  const next = useGuidedTourStore((s) => s.next);
  const skipStep = useGuidedTourStore((s) => s.skipStep);
  const cancelTour = useGuidedTourStore((s) => s.cancelTour);
  const setTargetMissing = useGuidedTourStore((s) => s.setTargetMissing);

  const step = tour?.steps[currentStepIndex] ?? null;
  const isFrame = !!step?.frameScoped;
  const copilot = tour?.mode === 'copilot';
  const isBradStep = copilot && step?.actor === 'brad';
  const actionedRef = useRef<Set<string>>(new Set());
  const [rect, setRect] = useState<Rect | null>(null);
  const [lockedToast, setLockedToast] = useState(false);
  const [escConfirm, setEscConfirm] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const missingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLockedToast = useCallback(() => {
    setLockedToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setLockedToast(false), 2600);
  }, []);

  // Track the target element's rect (iframe-scoped steps are never anchored here).
  const recompute = useCallback(() => {
    if (!step || isFrame) { setRect(null); return; }
    const el = document.querySelector(step.targetSelector) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) { setRect(null); return; }
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step, isFrame]);

  useLayoutEffect(() => {
    if (!active || !step) return undefined;
    recompute();
    const id = window.setInterval(recompute, 150);
    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute, true);
    };
  }, [active, step, recompute, pathname]);

  // Target-missing detection (grace period → recovery UI). Frame steps skip this.
  useEffect(() => {
    if (!active || !step || isFrame) { setTargetMissing(false); return undefined; }
    setTargetMissing(false);
    if (missingTimer.current) clearTimeout(missingTimer.current);
    missingTimer.current = setTimeout(() => {
      if (!document.querySelector(step.targetSelector)) setTargetMissing(true);
    }, 1400);
    return () => { if (missingTimer.current) clearTimeout(missingTimer.current); };
  }, [active, step, isFrame, pathname, setTargetMissing]);

  // Reset Escape-confirm on step change.
  useEffect(() => { setEscConfirm(false); }, [currentStepIndex, active]);

  // Auto-complete on entry: if the step's state is ALREADY satisfied (route match
  // or a readable predicate), validate immediately so the user is never stuck on
  // an already-done step (e.g. the event is already selected on Step 3).
  useEffect(() => {
    if (!active || !step || stepValidated) return;
    const ac = step.autoCompleteWhen;
    let complete = false;
    if (ac?.route && pathname.startsWith(ac.route)) complete = true;
    const pred = ac?.predicate
      ?? (step.waitFor.type === 'store_predicate' && !step.frameScoped ? step.waitFor.predicateId : undefined);
    if (!complete && pred && evalDomPredicate(pred as never) === true) complete = true;
    if (complete) markStepValidated();
  }, [active, step, stepValidated, pathname, markStepValidated]);

  // Completion validation per waitFor condition.
  useEffect(() => {
    if (!active || !step || stepValidated) return undefined;
    const wf = step.waitFor;

    if (wf.type === 'click') {
      const onClick = (e: MouseEvent) => {
        const t = e.target as Element | null;
        if (t && t.closest(wf.selector)) markStepValidated();
      };
      document.addEventListener('click', onClick, true);
      return () => document.removeEventListener('click', onClick, true);
    }
    if (wf.type === 'route_change') {
      if (pathname.startsWith(wf.route)) markStepValidated();
      return undefined;
    }
    if (wf.type === 'element_visible') {
      const id = window.setInterval(() => {
        const el = document.querySelector(wf.selector) as HTMLElement | null;
        if (el && el.getBoundingClientRect().width > 0) { markStepValidated(); window.clearInterval(id); }
      }, 200);
      return () => window.clearInterval(id);
    }
    if (wf.type === 'form_value') {
      const id = window.setInterval(() => {
        const el = document.querySelector(wf.selector) as HTMLInputElement | null;
        if (el && String(el.value) === String(wf.expected)) { markStepValidated(); window.clearInterval(id); }
      }, 200);
      return () => window.clearInterval(id);
    }
    if (wf.type === 'store_predicate') {
      // Frame-scoped predicates can't be read from the parent → manual confirm.
      if (step.frameScoped) return undefined;
      const id = window.setInterval(() => {
        if (evalDomPredicate(wf.predicateId as never) === true) { markStepValidated(); window.clearInterval(id); }
      }, 200);
      return () => window.clearInterval(id);
    }
    return undefined;
  }, [active, step, stepValidated, pathname, markStepValidated]);

  // Co-pilot: Brad performs the deterministic action for 'brad' steps (once each).
  useEffect(() => {
    if (!active || !step || !copilot || step.actor !== 'brad' || !step.autoAction) return;
    if (actionedRef.current.has(step.id)) return;
    actionedRef.current.add(step.id);
    const a = step.autoAction;
    const t = setTimeout(() => {
      if (a.kind === 'navigate') { if (!pathname.startsWith(a.route)) navigate(a.route); }
      else if (a.kind === 'click') (document.querySelector(a.selector) as HTMLElement | null)?.click();
      else if (a.kind === 'set_select') performSetSelect(a.selector, String(tour?.slotValues?.[a.valueFromSlot ?? ''] ?? ''));
    }, 450);
    return () => clearTimeout(t);
  }, [active, step, copilot, navigate, pathname, tour]);

  // Co-pilot: auto-advance once a Brad-performed step validates.
  useEffect(() => {
    if (!active || !step || !copilot || step.actor !== 'brad' || !stepValidated) return undefined;
    const t = setTimeout(() => next(), 850);
    return () => clearTimeout(t);
  }, [active, step, copilot, stepValidated, next]);

  // Keyboard: Escape always opens the exit confirm. Coached mode also locks other
  // shortcuts; co-pilot never traps the keyboard (you interact with the page freely).
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setEscConfirm(true); return; }
      if (copilot) return;
      const t = e.target as Element | null;
      const insideAllowed = !!t && (t.closest('[data-tour-control]') || (step && !isFrame && t.closest(step.targetSelector)));
      if (!insideAllowed) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [active, step, isFrame, copilot]);

  if (!active || !step || !tour) return null;

  const total = tour.steps.length;
  const stepNo = currentStepIndex + 1;
  // We only lock the screen in COACHED mode when there's a real, same-origin target.
  // Co-pilot never locks; missing target / iframe hand-off never traps the user.
  const locked = !!rect && !isFrame && !copilot;
  const softGlow = copilot && !!rect && !isFrame; // gentle highlight, no lock
  const manualConfirm = (isFrame || step.waitFor.type === 'manual_confirm') && !isBradStep;
  const confirmAndAdvance = () => { markStepValidated(); next(); };
  const PAD = 10;

  const segments: Rect[] = locked && rect
    ? [
        { top: 0, left: 0, width: window.innerWidth, height: Math.max(0, rect.top - PAD) },
        { top: rect.top + rect.height + PAD, left: 0, width: window.innerWidth, height: Math.max(0, window.innerHeight - (rect.top + rect.height + PAD)) },
        { top: Math.max(0, rect.top - PAD), left: 0, width: Math.max(0, rect.left - PAD), height: rect.height + PAD * 2 },
        { top: Math.max(0, rect.top - PAD), left: rect.left + rect.width + PAD, width: Math.max(0, window.innerWidth - (rect.left + rect.width + PAD)), height: rect.height + PAD * 2 },
      ]
    : [];

  return (
    <div className="pointer-events-none">
      {/* Accessibility: announce the active step. */}
      <div className="sr-only" role="status" aria-live="assertive">
        {`Guided tour step ${stepNo} of ${total} active. Only the highlighted control is available.`}
      </div>

      {/* Darkened lock segments — ONLY when a real target is spotlighted. */}
      {segments.map((s, i) => (
        <div
          key={i}
          onClick={showLockedToast}
          className="pointer-events-auto fixed"
          style={{ top: s.top, left: s.left, width: s.width, height: s.height, zIndex: 9000, background: 'rgba(0,0,0,0.76)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          aria-hidden
        />
      ))}

      {/* Co-pilot: gentle, non-locking rainbow highlight so you can see where to look. */}
      {softGlow && rect && (
        <div
          className="brad-rainbow-glow pointer-events-none fixed rounded-2xl opacity-70 blur-md"
          style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, zIndex: 9001 }}
          aria-hidden
        />
      )}

      {/* Rainbow-glow highlight ring around the live target (coached lock). */}
      {locked && rect && (
        <>
          <div
            className="brad-rainbow-glow pointer-events-none fixed rounded-2xl opacity-90 blur-md"
            style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, zIndex: 9001 }}
            aria-hidden
          />
          <div
            className="pointer-events-none fixed rounded-xl ring-2 ring-white/80"
            style={{ top: rect.top - 3, left: rect.left - 3, width: rect.width + 6, height: rect.height + 6, zIndex: 9002 }}
            aria-hidden
          />
        </>
      )}

      {lockedToast && (
        <div className="pointer-events-none fixed left-1/2 top-6 -translate-x-1/2 rounded-xl border border-tone-orange-border bg-tone-orange-bg px-4 py-2 text-sm font-medium text-tone-orange-text shadow-lg" style={{ zIndex: 9006 }} role="status">
          <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" aria-hidden /> {TOUR_LOCKED_REASON}</span>
        </div>
      )}

      {/* Right-side guided-assistance panel (never darkened; the only control surface). */}
      <aside
        data-tour-control
        className="pointer-events-auto fixed right-0 top-0 flex h-screen w-[92vw] max-w-[480px] flex-col border-l border-hairline bg-surface-glass text-ink shadow-2xl backdrop-blur-xl md:w-[440px]"
        style={{ zIndex: 9004 }}
        role="dialog" aria-modal="true" aria-label="Brad guided assistance"
      >
        <div className="relative flex items-center justify-between gap-2 overflow-hidden border-b border-hairline px-5 py-4">
          <div className="brad-rainbow-glow pointer-events-none absolute inset-x-0 top-0 h-1 opacity-90" aria-hidden />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-teal">Brad guided assistance</div>
            <div className="text-sm font-medium text-ink">{tour.title}</div>
          </div>
          <button data-tour-control type="button" onClick={() => setEscConfirm(true)} aria-label="Exit tour"
            className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface-hover hover:text-tone-orange-text">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-teal">Step {stepNo} of {total}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
              <div className="h-full rounded-full bg-brand-teal transition-all" style={{ width: `${(stepNo / total) * 100}%` }} />
            </div>
          </div>
          <h3 className="text-base font-medium text-ink">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-secondary">{step.instruction}</p>
          <p className="mt-2 text-xs text-muted">Target: {step.targetDescription}</p>

          {/* Iframe hand-off — the Studio panel can't be locked; guide, don't trap. */}
          {isFrame && (
            <div className="mt-4 rounded-xl border border-tone-teal-border bg-tone-teal-bg p-3 text-sm text-brand-teal-deep">
              <div className="flex items-center gap-2 font-medium"><ExternalLink className="h-4 w-4" aria-hidden /> Continue in the Studio panel</div>
              <p className="mt-1 text-xs">This step happens inside the embedded Studio, which the tour doesn’t lock. Do it there, then mark it done to continue.</p>
            </div>
          )}

          {/* Co-pilot: Brad is performing this step. */}
          {isBradStep && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-tone-teal-border bg-tone-teal-bg p-3 text-sm text-brand-teal-deep">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              <span><span className="inline-flex items-center gap-1 font-medium"><Sparkles className="h-3.5 w-3.5" aria-hidden /> Brad</span> is doing this step for you — no action needed.</span>
            </div>
          )}

          {/* No same-origin target to spotlight (missing / still locating) → never a lock;
              always give the user a way forward so they can't get stuck. (Coached mode only.) */}
          {!copilot && !locked && !isFrame && (
            <div className="mt-4 rounded-xl border border-tone-orange-border bg-tone-orange-bg p-3 text-sm text-tone-orange-text">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" aria-hidden /> {targetMissing ? 'We couldn’t find this control' : 'Locating the highlighted control…'}
              </div>
              <p className="mt-1 text-xs">The screen is not locked. Retry, continue anyway, or exit the tour.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button data-tour-control type="button" onClick={() => { setTargetMissing(false); recompute(); }}
                  className="inline-flex items-center gap-1 rounded-md border border-tone-orange-border bg-surface-glass px-2.5 py-1 text-xs font-medium text-tone-orange-text"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>
                <button data-tour-control type="button" onClick={skipStep}
                  className="inline-flex items-center gap-1 rounded-md bg-brand-teal px-2.5 py-1 text-xs font-medium text-on-brand hover:bg-brand-teal-deep">Continue anyway <ArrowRight className="h-3.5 w-3.5" /></button>
                <button data-tour-control type="button" onClick={() => setEscConfirm(true)}
                  className="rounded-md border border-hairline bg-surface-glass px-2.5 py-1 text-xs font-medium text-secondary">Exit tour</button>
              </div>
            </div>
          )}

          {manualConfirm && !escConfirm && (
            <button data-tour-control type="button" onClick={copilot ? confirmAndAdvance : markStepValidated}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-3 py-1.5 text-sm font-medium text-on-brand hover:bg-brand-teal-deep">
              {step.waitFor.type === 'manual_confirm' ? step.waitFor.label : 'I’ve done this in the Studio'}
              {copilot && <ArrowRight className="h-4 w-4" aria-hidden />}
            </button>
          )}

          {locked && (
            <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-surface-hover px-3 py-2 text-[11px] text-muted">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Everything else is locked until you finish this step. Only the highlighted control works.
            </div>
          )}

          {escConfirm && (
            <div className="mt-4 rounded-xl border border-tone-orange-border bg-tone-orange-bg p-3 text-sm text-tone-orange-text">
              <div className="font-medium">Exit the guided tour?</div>
              <div className="mt-2 flex gap-2">
                <button data-tour-control type="button" onClick={cancelTour} className="rounded-md bg-tone-orange-text px-2.5 py-1 text-xs font-medium text-on-brand">Exit tour</button>
                <button data-tour-control type="button" onClick={() => setEscConfirm(false)} className="rounded-md border border-hairline bg-surface-glass px-2.5 py-1 text-xs font-medium text-secondary">Keep going</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-hairline px-5 py-3">
          <span className="text-xs text-muted">
            {isBradStep ? 'Brad is working…' : stepValidated ? 'Step complete ✓' : copilot ? 'Do the step above, then continue' : 'Complete the highlighted step'}
          </span>
          <button data-tour-control type="button" disabled={!stepValidated || isBradStep} onClick={() => next()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-on-brand transition hover:bg-tone-orange-text disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-muted">
            {stepNo >= total ? 'Finish' : 'Next'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}
