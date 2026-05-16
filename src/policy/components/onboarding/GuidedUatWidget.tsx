import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Compass, ChevronDown, ChevronUp, X } from 'lucide-react';

const DISMISS_KEY = 'ci_guided_uat_widget_dismissed_v1';

type UatStep = {
  id: string;
  label: string;
  to: string;
  matches: (pathname: string) => boolean;
};

const STEPS: UatStep[] = [
  { id: 'dashboard', label: 'Review operational posture', to: '/dashboard', matches: (p) => p.startsWith('/dashboard') },
  { id: 'tasks', label: 'Open and execute tasks', to: '/my-tasks', matches: (p) => p.startsWith('/my-tasks') || p.startsWith('/pm/') },
  { id: 'calendar', label: 'Validate workflow timeline', to: '/calendar', matches: (p) => p.startsWith('/calendar') },
  { id: 'forms', label: 'Complete required forms', to: '/forms', matches: (p) => p.startsWith('/forms') },
  { id: 'evidence', label: 'Upload and verify evidence', to: '/evidence', matches: (p) => p.startsWith('/evidence') || p.startsWith('/artifacts') },
  { id: 'audit', label: 'Run audit readiness pass', to: '/audit', matches: (p) => p.startsWith('/audit') },
];

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function setDismissed(value: boolean): void {
  try {
    if (value) localStorage.setItem(DISMISS_KEY, '1');
    else localStorage.removeItem(DISMISS_KEY);
  } catch {
    // noop
  }
}

export function GuidedUatWidget() {
  const location = useLocation();
  const [dismissed, setDismissedState] = useState<boolean>(() => isDismissed());
  const [collapsed, setCollapsed] = useState(() =>
    /^\/(audit|evidence|calendar)(\/|$)/.test(location.pathname),
  );
  const isDenseRoute = /^\/(audit|evidence|calendar)(\/|$)/.test(location.pathname);

  useEffect(() => {
    if (isDenseRoute) setCollapsed(true);
  }, [isDenseRoute]);

  const { completedCount, activeStepId } = useMemo(() => {
    let active: string | null = null;
    let completed = 0;
    for (const step of STEPS) {
      if (step.matches(location.pathname)) active = step.id;
    }
    if (!active) return { completedCount: 0, activeStepId: null as string | null };
    const index = STEPS.findIndex(step => step.id === active);
    completed = index + 1;
    return { completedCount: completed, activeStepId: active };
  }, [location.pathname]);

  if (dismissed) return null;

  return (
    <aside
      className={`fixed right-3 bottom-24 md:bottom-6 z-40 w-[min(92vw,340px)] rounded-xl border ci-subtle-hover ${isDenseRoute ? 'opacity-[0.96]' : ''}`}
      style={{
        background: 'var(--ci-surface)',
        borderColor: 'var(--ci-border)',
        boxShadow: isDenseRoute ? '0 10px 24px rgba(15,23,42,0.18)' : '0 12px 28px rgba(15,23,42,0.24)',
      }}
      aria-label="Guided UAT checklist"
    >
      <header className="flex items-start gap-2 p-3 border-b" style={{ borderColor: 'var(--ci-border)' }}>
        <Compass size={16} className="mt-0.5 text-[var(--ci-link)]" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-[var(--ci-text-subtle)]">
            Guided UAT
          </p>
          <p className="text-[12px] text-[var(--ci-text-muted)]">
            {completedCount}/{STEPS.length} operational checkpoints
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="ci-touch-target rounded-md p-1 text-[var(--ci-text-muted)]"
          aria-label={collapsed ? 'Expand guided UAT steps' : 'Collapse guided UAT steps'}
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            setDismissedState(true);
          }}
          className="ci-touch-target rounded-md p-1 text-[var(--ci-text-muted)]"
          aria-label="Dismiss guided UAT widget"
        >
          <X size={14} />
        </button>
      </header>

      {!collapsed && (
        <div className="p-2.5 flex flex-col gap-1.5">
          {STEPS.map((step, idx) => {
            const done = completedCount > idx;
            const active = step.id === activeStepId;
            return (
              <Link
                key={step.id}
                to={step.to}
                className="ci-touch-target rounded-md border px-2.5 py-2 text-[12px] flex items-center gap-2 transition-colors ci-subtle-hover"
                style={{
                  borderColor: active ? 'var(--ci-link)' : 'var(--ci-border)',
                  background: active ? 'var(--ci-surface-2)' : 'transparent',
                  color: 'var(--ci-text-primary)',
                }}
              >
                <CheckCircle2
                  size={14}
                  className={done ? 'text-emerald-500' : 'text-[var(--ci-text-subtle)]'}
                />
                <span>{step.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setDismissed(false);
              setDismissedState(false);
            }}
            className="text-[11px] mt-1 text-[var(--ci-link)] underline text-left px-1"
          >
            Keep checklist visible
          </button>
        </div>
      )}
    </aside>
  );
}

