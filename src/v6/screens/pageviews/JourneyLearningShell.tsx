import { type ReactNode } from 'react';
import { DemoOnlyBanner } from '@/policy/journey/components/DemoOnlyBanner';

interface JourneyLearningShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function JourneyLearningShell({ children }: JourneyLearningShellProps) {

  return (
    <div className="relative -m-xl min-h-[calc(100vh-var(--topbar-h))] overflow-hidden bg-transparent text-ink isolate">
      <div className="relative z-base mx-lg mt-lg">
        <DemoOnlyBanner />
      </div>

      <main className="relative z-base ml-0 mr-auto grid w-full max-w-content gap-xl px-lg py-xl desktop:px-2xl" id="journey-main-content">
        {children}
      </main>

      <footer className="relative z-base bg-surface-glass backdrop-blur-md shadow-glass-inset px-lg py-md text-left text-tag text-muted">
        No PHI. Demo training data only. Clearance, evidence, and signature gates remain governed by HomeHealth onboarding policy.
      </footer>
    </div>
  );
}
