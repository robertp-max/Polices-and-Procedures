import { type ReactNode } from 'react';

interface JourneyLearningShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function JourneyLearningShell({ children }: JourneyLearningShellProps) {

  return (
    <div className="relative -m-xl min-h-[calc(100vh-var(--topbar-h))] overflow-hidden rounded-2xl border border-hairline bg-surface-glass text-ink shadow-glass-inset">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_100%_12%,rgba(0,121,125,0.11),transparent_32%),linear-gradient(135deg,rgba(247,254,255,0.92),rgba(255,255,255,0.74)_52%,rgba(250,248,248,0.86))]" />

      <main className="relative z-base ml-0 mr-auto grid w-full max-w-content gap-xl px-lg py-xl desktop:px-2xl" id="journey-main-content">
        {children}
      </main>

      <footer className="relative z-base border-t border-hairline bg-white/64 px-lg py-md text-left text-tag text-muted backdrop-blur-xl">
        No PHI. Demo training data only. Clearance, evidence, and signature gates remain governed by HomeHealth onboarding policy.
      </footer>
    </div>
  );
}
