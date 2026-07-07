import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight, FolderOpen, HelpCircle, Info, KeyRound, LogOut, MessageCircle, PenLine, BadgeCheck, ListChecks, Share2, Users, X } from 'lucide-react';
import { ToneTag } from '../components';
import { useAuth } from '@/auth/AuthProvider';
import { getUserBadges, getCommendations, type CommunityCommendation } from '../utils/communityBadges';
import { useThreadStore } from '../../policy/help-center/threads';

export function PersonalOpsPanel({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const displayName = user?.name || user?.email || 'Demo User';
  const role = user?.role || 'Member';
  const initials = (displayName.match(/\b\w/g) || []).join('').slice(0, 2).toUpperCase() || 'ME';
  const threads = useThreadStore((s) => s.threads);
  const activeThreadCount = threads.filter((thread) => thread.status !== 'archived' && thread.status !== 'duplicate').length;
  const focusItems = [
    { title: 'Missing disclosure signature', meta: 'GV-FM-006 - Due today', status: 'Critical', tone: 'orange' as const },
    { title: 'QAPI minutes packet', meta: 'QA-WF-03 - Due Jun 15', status: 'Review', tone: 'teal' as const },
    { title: 'Credential evidence upload', meta: 'HR-PE-001 - Due Jun 16', status: 'Evidence', tone: 'orange' as const },
  ];

  const workGroups = [
    { label: 'Signatures', value: 3, icon: PenLine, tone: 'orange' as const },
    { label: 'Evidence', value: 7, icon: FolderOpen, tone: 'teal' as const },
    { label: 'Approvals', value: 4, icon: BadgeCheck, tone: 'teal' as const },
    { label: 'Security', value: 1, icon: KeyRound, tone: 'orange' as const },
  ];

  const openFeedback = () => {
    window.dispatchEvent(new Event('v6:open-feedback'));
  };

  return (
    <aside className="personal-ops-panel relative z-20 flex h-full w-full max-w-[380px] shrink-0 flex-col overflow-hidden border-l border-hairline pt-20 text-ink shadow-right-rail">
      <header className="personal-ops-panel__header sticky top-0 z-10 shrink-0 border-b-0 p-lg shadow-none">
        <div className="flex items-start justify-between gap-md">
          <div>
            <p className="font-heading text-[10px] font-medium uppercase tracking-[0.2em] text-brand-teal">Personal Operations</p>
            <h3 className="mt-xs text-xl font-medium text-brand-teal-deep">Today's Focus</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => navigate('/login')}
              aria-label="Sign out"
              title="Sign out"
              className="grid h-11 w-11 place-items-center rounded-full text-brand-teal transition-colors hover:bg-tone-teal-bg focus-visible:outline-none focus-visible:shadow-focus"
            >
              <LogOut aria-hidden="true" className="h-icon-sm w-icon-sm" />
            </button>
            <button
              type="button"
              onClick={() => onClose?.()}
              aria-label="Close panel"
              title="Close"
              className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-tone-teal-bg hover:text-brand-teal focus-visible:outline-none focus-visible:shadow-focus"
            >
              <X aria-hidden="true" className="h-icon-sm w-icon-sm" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-lg flex-1 space-y-xl overflow-y-auto bg-transparent">
        <section className="grid grid-cols-5 gap-sm" aria-label="Personal navigation">
          <button
            type="button"
            onClick={openFeedback}
            aria-label="Open feedback"
            className="relative grid h-12 place-items-center rounded-lg border border-hairline bg-surface text-ink shadow-sm transition hover:border-brand-teal/40 hover:text-brand-teal hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
          >
            <MessageCircle aria-hidden className="h-icon-sm w-icon-sm" />
            <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-medium text-muted shadow-rest">
              {Math.min(activeThreadCount, 99)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              navigate('/community');
              onClose?.();
            }}
            aria-label="Open community"
            className="grid h-12 place-items-center rounded-lg border border-hairline bg-surface text-ink shadow-sm transition hover:border-brand-teal/40 hover:text-brand-teal hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Users aria-hidden className="h-icon-sm w-icon-sm" />
          </button>
          <button
            type="button"
            onClick={() => {
              navigate('/help');
              onClose?.();
            }}
            data-tour-target="nav.help"
            aria-label="Open help center"
            className="grid h-12 place-items-center rounded-lg border border-hairline bg-surface text-ink shadow-sm transition hover:border-brand-teal/40 hover:text-brand-teal hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
          >
            <HelpCircle aria-hidden className="h-icon-sm w-icon-sm" />
          </button>
          <button
            type="button"
            aria-label="Share"
            className="grid h-12 place-items-center rounded-lg border border-hairline bg-surface text-ink shadow-sm transition hover:border-brand-teal/40 hover:text-brand-teal hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Share2 aria-hidden className="h-icon-sm w-icon-sm" />
          </button>
          <button
            type="button"
            aria-label="Information"
            className="grid h-12 place-items-center rounded-lg border border-hairline bg-surface text-ink shadow-sm transition hover:border-brand-teal/40 hover:text-brand-teal hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Info aria-hidden className="h-icon-sm w-icon-sm" />
          </button>
        </section>

        {/* Clickable profile entry — opens full standalone personal profile page */}
        <button
          type="button"
          onClick={() => {
            navigate('/personal/profile', { state: { from: location.pathname || '/dashboard' } });
            onClose?.();
          }}
          className="group flex w-full items-center gap-md rounded-lg border border-hairline bg-surface p-md text-left shadow-sm transition hover:shadow-md hover:border-brand-teal/40 focus-visible:outline-none focus-visible:shadow-focus"
          aria-label="View my profile"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-sm font-medium text-brand-teal-deep ring-1 ring-inset ring-brand-teal/20">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-brand-teal-deep group-hover:text-brand-teal transition-colors">{displayName}</div>
            <div className="truncate text-[11px] text-muted">{role}</div>
          </div>
          <ChevronRight className="h-icon-sm w-icon-sm text-brand-teal/60 group-hover:text-brand-teal" />
        </button>

        {/* Real community teaser (positive-only, no fakes) */}
        {(() => {
          const uid = user?.id || 'demo-user';
          const bs = getUserBadges(uid, true);
          const cs = getCommendations(uid, true).filter((c: CommunityCommendation) => c.status === 'approved');
          if (bs.length === 0 && cs.length === 0) return null;
          return (
            <div className="text-[11px] text-muted px-1 -mt-1">
              Recognition: {bs.length} badges • {cs.length} commendations
            </div>
          );
        })()}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-sm">
          {[
            { value: '2', label: 'Late' },
            { value: '5', label: 'Soon' },
            { value: '3', label: 'Sign' },
            { value: '7', label: 'Ev' },
            { value: '4', label: 'Rev' }
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-hairline bg-surface p-sm text-center shadow-sm">
              <div className="text-sm font-medium text-brand-teal">{stat.value}</div>
              <div className="text-[9px] font-medium uppercase tracking-wider text-muted mt-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Today's Focus Priorities */}
        <section className="space-y-md">
          <div className="flex items-center gap-xs text-brand-orange">
            <AlertCircle className="h-icon-sm w-icon-sm" />
            <h4 className="text-xs font-medium uppercase tracking-wider">Today's Focus</h4>
          </div>
          <div className="space-y-sm">
            {focusItems.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-hairline bg-surface p-md shadow-sm transition hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-md">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-brand-teal-deep group-hover:text-brand-teal transition-colors truncate">{item.title}</div>
                    <div className="mt-xs text-[10px] text-muted">{item.meta}</div>
                  </div>
                  <div className="flex items-center gap-xs shrink-0">
                    <ToneTag tone={item.tone}>{item.status}</ToneTag>
                    <ChevronRight className="h-icon-xs w-icon-xs text-brand-teal/60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My Work Queue */}
        <section className="space-y-md">
          <div className="flex items-center gap-xs text-brand-teal">
            <ListChecks className="h-icon-sm w-icon-sm" />
            <h4 className="text-xs font-medium uppercase tracking-wider">My Work Queue</h4>
          </div>
          <div className="grid grid-cols-2 gap-sm">
            {workGroups.map((group) => {
              const Icon = group.icon;
              return (
                <button
                  key={group.label}
                  className="rounded-lg border border-hairline bg-surface p-md text-left shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`h-icon-sm w-icon-sm ${group.tone === 'orange' ? 'text-brand-orange' : 'text-brand-teal'}`} />
                    <span className="text-lg font-medium text-brand-teal-deep">{group.value}</span>
                  </div>
                  <div className="mt-md text-[10px] font-medium uppercase tracking-wider text-muted">{group.label}</div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

    </aside>
  );
}
