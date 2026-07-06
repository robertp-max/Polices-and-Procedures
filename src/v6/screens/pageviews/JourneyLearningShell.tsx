import { type ReactNode } from 'react';

interface JourneyLearningShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function JourneyLearningShell({ children }: JourneyLearningShellProps) {

  return (
    <div className="relative -m-xl min-h-[calc(100vh-var(--topbar-h))] overflow-hidden bg-transparent text-ink isolate">
      <main className="relative z-base ml-0 mr-auto grid w-full max-w-content gap-xl px-lg py-xl desktop:px-2xl" id="journey-main-content">
        {children}
      </main>
    </div>
  );
}
