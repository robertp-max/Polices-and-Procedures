import { AlertCircle, ChevronRight, FolderOpen, KeyRound, PenLine, BadgeCheck, ListChecks } from 'lucide-react';
import { ToneTag } from '../components';

export function PersonalOpsPanel() {
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

  return (
    <aside className="relative z-20 flex h-screen w-[380px] shrink-0 flex-col overflow-y-auto border-l border-hairline bg-surface text-ink shadow-right-rail">
      <header className="border-b border-hairline bg-tone-teal-bg/60 p-lg">
        <div>
          <p className="font-heading text-[10px] font-medium uppercase tracking-[0.2em] text-brand-teal">Personal Operations</p>
          <h3 className="mt-xs text-xl font-medium text-brand-teal-deep">Today's Focus</h3>
        </div>
      </header>

      <div className="p-lg flex-1 space-y-xl overflow-y-auto bg-tone-teal-bg/30">
        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-sm">
          {[
            { value: '2', label: 'Late' },
            { value: '5', label: 'Soon' },
            { value: '3', label: 'Sign' },
            { value: '7', label: 'Ev' },
            { value: '4', label: 'Rev' }
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-tone-teal-border bg-surface p-sm text-center shadow-sm">
              <div className="text-sm font-medium text-brand-teal">{stat.value}</div>
              <div className="text-[8px] font-medium uppercase tracking-wider text-muted mt-xs">{stat.label}</div>
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
                  className="rounded-lg border border-hairline bg-surface p-md text-left shadow-sm transition hover:shadow-md hover:border-tone-teal-border"
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
