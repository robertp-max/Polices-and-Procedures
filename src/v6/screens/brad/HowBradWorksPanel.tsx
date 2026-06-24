import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, ChevronRight, ShieldAlert, ShieldCheck, Lock, Eye, GitBranch } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   "How Brad works" — compact, INTERACTIVE selling-point experience.
   Not a slide deck / carousel / wall of text. Selectable selling points and a
   clickable mini-flow that reveal supporting detail. Accessible dialog:
   role=dialog, labelled, focus trap, Escape closes, focus returns to trigger.
   ═══════════════════════════════════════════════════════════════════════════ */

const SELLING_POINTS = [
  {
    id: 'controlled',
    Icon: Lock,
    title: 'Internal work stays controlled',
    detail:
      'Brad works from Care Indeed policies, workflows, events, forms, evidence, and approved internal records without turning protected content into public research prompts.',
  },
  {
    id: 'separate',
    Icon: GitBranch,
    title: 'Public research stays separate',
    detail:
      'External public-source context can support an answer, but it cannot directly change records, finalize documents, approve actions, or bypass Care Indeed controls.',
  },
  {
    id: 'traceable',
    Icon: ShieldCheck,
    title: 'Every action stays traceable',
    detail:
      'Brad-generated reports, packets, minutes, and recommendations remain connected to their source event, workflow, policy, form, evidence, user request, and review state.',
  },
  {
    id: 'review',
    Icon: Eye,
    title: 'Human review stays in charge',
    detail:
      'Brad can analyze, draft, and recommend. Protected actions remain subject to authorized review and signature before becoming final.',
  },
] as const;

const FLOW_STEPS = [
  {
    id: 'internal',
    label: 'Brad Internal Operations',
    detail: 'Policies, workflows, evidence, reports, forms, and generated objects remain inside Brad’s controlled workflow.',
  },
  {
    id: 'bridge',
    label: 'Safety Bridge',
    detail: 'Patient data, protected internal records, signed documents, and evidence packets are blocked from public-research requests.',
  },
  {
    id: 'public',
    label: 'Public Research',
    detail: 'De-identified questions may be reviewed against cited public sources such as CMS, ACHC, federal/state guidance, and public vendor documentation.',
  },
  {
    id: 'validation',
    label: 'Brad Validation',
    detail: 'Brad evaluates external context against Care Indeed policies, workflows, evidence, and review controls before recommending action.',
  },
] as const;

export function HowBradWorksPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedPoint, setSelectedPoint] = useState<string>(SELLING_POINTS[0].id);
  const [selectedStep, setSelectedStep] = useState<string>(FLOW_STEPS[0].id);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);
  const titleId = useId();

  const point = SELLING_POINTS.find((p) => p.id === selectedPoint)!;
  const step = FLOW_STEPS.find((s) => s.id === selectedStep)!;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement;
    closeRef.current?.focus();
    return () => {
      (restoreFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-ink/10 p-lg backdrop-blur-sm motion-reduce:backdrop-blur-0"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="grid max-h-[90vh] w-full max-w-2xl gap-lg overflow-y-auto rounded-2xl border border-hairline bg-surface p-xl shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-md">
          <div>
            <h2 id={titleId} className="text-h2 font-medium text-ink">Built for trusted healthcare operations</h2>
            <p className="mt-1 text-sm font-light text-ink">
              Brad turns policies, workflows, evidence, and compliance tasks into guided, traceable action while keeping sensitive healthcare operations controlled.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close How Brad works"
            className="grid h-tap w-tap shrink-0 place-items-center rounded-md bg-canvas text-muted transition hover:bg-tone-teal-bg hover:text-brand-teal focus-visible:outline-none focus-visible:shadow-focus"
          >
            <X aria-hidden className="h-icon-sm w-icon-sm" />
          </button>
        </div>

        <p className="text-sm font-light leading-relaxed text-muted">
          Brad is designed for healthcare compliance work where accuracy, traceability, and control matter. It helps teams generate reports, prepare event packets, draft QAPI minutes, review policies, and identify gaps while keeping protected actions governed by Care Indeed rules.
        </p>

        {/* Interactive selling points */}
        <div className="grid gap-md">
          <div className="grid grid-cols-2 gap-sm" role="tablist" aria-label="Selling points">
            {SELLING_POINTS.map((p) => {
              const active = p.id === selectedPoint;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedPoint(p.id)}
                  className={
                    'flex items-center gap-2 rounded-lg border px-md py-sm text-left text-sm font-medium transition focus-visible:outline-none focus-visible:shadow-focus ' +
                    (active
                      ? 'border-brand-teal bg-tone-teal-bg text-brand-teal-deep shadow-rest'
                      : 'border-hairline bg-canvas text-ink hover:border-brand-teal hover:text-brand-teal')
                  }
                >
                  <p.Icon aria-hidden className="h-icon-sm w-icon-sm shrink-0" />
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-lg border border-hairline bg-canvas p-lg text-sm font-light leading-relaxed text-ink" role="region" aria-live="polite">
            {point.detail}
          </div>
        </div>

        {/* Clickable mini flow */}
        <div className="grid gap-md">
          <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            {FLOW_STEPS.map((s, i) => {
              const active = s.id === selectedStep;
              return (
                <div key={s.id} className="flex items-center gap-1.5 sm:flex-1">
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedStep(s.id)}
                    className={
                      'flex-1 rounded-md border px-2 py-2 text-center text-[11px] font-medium uppercase tracking-tag transition focus-visible:outline-none focus-visible:shadow-focus ' +
                      (active
                        ? 'border-brand-teal bg-brand-teal text-on-brand'
                        : 'border-hairline bg-tone-teal-bg text-brand-teal hover:border-brand-teal')
                    }
                  >
                    {s.label}
                  </button>
                  {i < FLOW_STEPS.length - 1 && (
                    <ArrowRight aria-hidden className="hidden h-icon-sm w-icon-sm shrink-0 text-muted sm:block" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="rounded-lg border border-hairline bg-canvas p-lg text-sm font-light leading-relaxed text-ink" role="region" aria-live="polite">
            <span className="font-medium text-brand-teal-deep">{step.label}: </span>{step.detail}
          </div>
        </div>

        {/* Status */}
        <div className="grid gap-md rounded-lg border border-hairline bg-canvas p-lg">
          <div className="flex items-start gap-2 text-sm">
            <ShieldAlert aria-hidden className="mt-0.5 h-icon-sm w-icon-sm shrink-0 text-brand-orange" />
            <span className="font-medium text-brand-orange">MVP: Synthetic PHI only. Real PHI is blocked.</span>
          </div>
          <div className="border-t border-hairline pt-md text-sm font-light text-muted">
            <span className="font-medium text-ink">Production target: </span>
            Google Vertex AI after BAA, eligible services, security controls, and readiness gate pass.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-md">
          <Link
            to="/help/brad-how-brad-works"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-teal hover:underline focus-visible:outline-none focus-visible:shadow-focus"
          >
            Review to learn more <ChevronRight aria-hidden className="h-icon-sm w-icon-sm" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-brand-teal px-lg py-2 text-sm font-medium text-on-brand transition hover:bg-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowBradWorksPanel;
