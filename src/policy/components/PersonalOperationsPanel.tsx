import { useState, type ReactElement, type ComponentType, type ReactNode, type SVGProps } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FolderOpen,
  HelpCircle,
  KeyRound,
  ListChecks,
  LogOut,
  PenLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import type {
  PersonalOpsDisplayItem,
  PersonalOpsModel,
  PersonalOpsPriority,
  PersonalOpsWorkQueueGroup,
} from '@/policy/personal-ops/personalOpsModel';

type PanelIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;

const FOCUS_LIMIT = 5;
const GROUP_PREVIEW_LIMIT = 3;
const CALENDAR_PREVIEW_LIMIT = 3;

interface PersonalOperationsPanelProps {
  model: PersonalOpsModel;
  isOpen: boolean;
  isMobile: boolean;
  canViewTasks: boolean;
  canViewCalendar: boolean;
  canViewEvidence: boolean;
  canViewBrad: boolean;
  canViewHelp: boolean;
  onNavigate: (target: string) => void;
  onOpenTask: (taskId: string) => void;
  onLogout: () => void;
  onRestartGuide: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: PanelIcon;
  onClick: () => void;
  show: boolean;
  primary?: boolean;
}

interface SummaryPill {
  id: string;
  label: string;
  value: number;
  urgent?: boolean;
}

export function PersonalOperationsPanel({
  model,
  isOpen,
  isMobile,
  canViewTasks,
  canViewCalendar,
  canViewEvidence,
  canViewBrad,
  canViewHelp,
  onNavigate,
  onOpenTask,
  onLogout,
  onRestartGuide,
}: PersonalOperationsPanelProps): ReactElement | null {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showAllCalendar, setShowAllCalendar] = useState(false);

  if (!isOpen) return null;

  const signatureItem = model.workQueueGroups.find(group => group.id === 'signature')?.items[0];
  const quickActions = buildQuickActions({
    model,
    signatureItem,
    canViewTasks,
    canViewCalendar,
    canViewEvidence,
    canViewBrad,
    canViewHelp,
    onNavigate,
    onOpenTask,
    onLogout,
    onRestartGuide,
  });
  const focusItems = buildFocusItems(model);
  const summaryPills = buildSummaryPills(model);
  const calendarItems = showAllCalendar ? model.calendarItems : model.calendarItems.slice(0, CALENDAR_PREVIEW_LIMIT);
  const hiddenCalendarCount = Math.max(0, model.calendarItems.length - CALENDAR_PREVIEW_LIMIT);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(current => ({ ...current, [groupId]: !current[groupId] }));
  };

  return (
    <aside
      role="dialog"
      aria-modal={isMobile ? 'true' : undefined}
      aria-labelledby="personal-ops-title"
      data-personal-ops-panel="right-third"
      data-personal-ops-no-duplicate-profile="true"
      className={[
        'personal-ops-panel custom-scrollbar flex shrink-0 flex-col overflow-y-auto border-l',
        isMobile ? 'fixed inset-x-0 bottom-0 top-[72px] z-[65] w-full' : 'absolute z-[70] right-0 top-0 bottom-0 w-[380px] min-w-[360px] max-w-[440px]',
      ].join(' ')}
      style={{
        background: 'color-mix(in srgb, var(--ci-secondary-100, #F7FEFF) 76%, var(--ci-bg, #FAFBF8))',
        borderColor: 'var(--v3-border-subtle)',
        boxShadow: isMobile ? 'var(--ci-light-shadow-floating, 0 -18px 44px rgba(0,0,0,0.16))' : 'var(--ci-light-shadow-soft, -12px 0 32px rgba(0,0,0,0.08))',
        color: 'var(--v3-text-primary)',
      }}
    >
      <div className="flex flex-col gap-3 px-4 py-4">
        <header
          className="sticky top-0 z-10 -mx-4 -mt-4 px-4 pb-3 pt-4"
          style={{
            background: 'color-mix(in srgb, var(--ci-secondary-100, #F7FEFF) 82%, var(--ci-bg, #FAFBF8))',
            borderBottom: '1px solid color-mix(in srgb, var(--v3-border-subtle) 70%, transparent)',
          }}
        >
          <p
            className="font-montserrat text-[10px] font-bold uppercase"
            style={{ color: 'var(--brand-primary, #007970)', letterSpacing: '0.18em' }}
          >
            Personal Operations
          </p>
          <h2
            id="personal-ops-title"
            className="mt-1 font-montserrat text-[17px] font-semibold leading-tight"
            style={{ color: 'var(--brand-primary, #007970)' }}
          >
            Today's Focus
          </h2>
          <SummaryStrip pills={summaryPills} />
        </header>

        <SectionBlock title="Today's Focus" icon={AlertCircle}>
          {focusItems.length > 0 ? (
            <ListSurface>
              {focusItems.map(item => (
                <PersonalOpsRow key={item.id} item={item} onOpen={() => openItem(item, onNavigate, onOpenTask)} />
              ))}
            </ListSurface>
          ) : (
            <PanelEmptyState title="No focus items" description="No urgent controls are currently visible for this role." />
          )}
        </SectionBlock>

        <SectionBlock title="My Work Queue" icon={ListChecks}>
          {model.workQueueGroups.length > 0 ? (
            <div className="space-y-2">
              {model.workQueueGroups.map(group => (
                <WorkQueueGroupBlock
                  key={group.id}
                  group={group}
                  expanded={Boolean(expandedGroups[group.id])}
                  onToggle={() => toggleGroup(group.id)}
                  onNavigate={onNavigate}
                  onOpenTask={onOpenTask}
                />
              ))}
            </div>
          ) : (
            <PanelEmptyState title="No visible queue" description="Assigned work will appear here when it needs your attention." />
          )}
        </SectionBlock>

        <SectionBlock title="My Calendar" icon={CalendarDays}>
          {model.calendarItems.length > 0 ? (
            <>
              <ListSurface>
                {calendarItems.map(item => (
                  <PersonalOpsRow key={item.id} item={item} onOpen={() => openItem(item, onNavigate, onOpenTask)} />
                ))}
              </ListSurface>
              {hiddenCalendarCount > 0 && (
                <ViewAllButton
                  label={showAllCalendar ? 'Show fewer' : `View all ${formatCount(model.calendarItems.length)}`}
                  onClick={() => setShowAllCalendar(value => !value)}
                />
              )}
            </>
          ) : (
            <PanelEmptyState title="No upcoming items" description="Visible calendar items will appear when assigned to your role or group." />
          )}
        </SectionBlock>

        <SectionBlock title="Quick Actions" icon={Sparkles}>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(action => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className="ci-subtle-hover flex min-h-[38px] items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] font-semibold"
                style={{
                  background: action.primary
                    ? 'var(--brand-primary, #007970)'
                    : 'color-mix(in srgb, var(--ci-surface, #FFFFFF) 86%, transparent)',
                  borderColor: action.primary ? 'var(--brand-primary, #007970)' : 'var(--v3-border-subtle)',
                  color: action.primary ? '#FFFFFF' : 'var(--v3-text-primary)',
                }}
              >
                <action.icon size={14} strokeWidth={2} aria-hidden="true" className="shrink-0" />
                <span className="min-w-0 leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </SectionBlock>

        <SecurityFooter model={model} />
      </div>
    </aside>
  );
}

function buildQuickActions(args: {
  model: PersonalOpsModel;
  signatureItem: PersonalOpsDisplayItem | undefined;
  canViewTasks: boolean;
  canViewCalendar: boolean;
  canViewEvidence: boolean;
  canViewBrad: boolean;
  canViewHelp: boolean;
  onNavigate: (target: string) => void;
  onOpenTask: (taskId: string) => void;
  onLogout: () => void;
  onRestartGuide: () => void;
}): QuickAction[] {
  return [
    {
      id: 'continue-signing',
      label: 'Continue Signing',
      icon: PenLine,
      show: Boolean(args.signatureItem?.taskId),
      primary: true,
      onClick: () => {
        if (args.signatureItem?.taskId) args.onOpenTask(args.signatureItem.taskId);
      },
    },
    {
      id: 'open-my-tasks',
      label: 'Open My Tasks',
      icon: ClipboardCheck,
      show: args.canViewTasks,
      onClick: () => args.onNavigate('/pm/my-tasks'),
    },
    {
      id: 'upload-evidence',
      label: 'Upload Evidence',
      icon: UploadCloud,
      show: args.canViewEvidence,
      onClick: () => args.onNavigate('/evidence'),
    },
    {
      id: 'open-calendar',
      label: 'Open Calendar',
      icon: CalendarDays,
      show: args.canViewCalendar,
      onClick: () => args.onNavigate('/calendar'),
    },
    {
      id: 'ask-brad',
      label: 'Ask Brad',
      icon: Sparkles,
      show: args.canViewBrad,
      onClick: () => args.onNavigate('/iadministrator'),
    },
    {
      id: 'request-access',
      label: 'Request Access',
      icon: KeyRound,
      show: args.model.isLimited && args.canViewHelp,
      onClick: () => args.onNavigate('/help'),
    },
    {
      id: 'restart-guide',
      label: 'Restart Guide',
      icon: HelpCircle,
      show: true,
      onClick: args.onRestartGuide,
    },
    {
      id: 'sign-out',
      label: 'Sign Out',
      icon: LogOut,
      show: true,
      onClick: args.onLogout,
    },
  ].filter(action => action.show);
}

function buildFocusItems(model: PersonalOpsModel): PersonalOpsDisplayItem[] {
  const fallbackItems = model.workQueueGroups.flatMap(group => group.items);
  return uniqueItems(model.outstandingControls.length > 0 ? model.outstandingControls : fallbackItems).slice(0, FOCUS_LIMIT);
}

function buildSummaryPills(model: PersonalOpsModel): SummaryPill[] {
  const workItems = model.workQueueGroups.flatMap(group => group.items);
  const items = uniqueItems([...model.outstandingControls, ...workItems]);
  const signatureCount = model.workQueueGroups.find(group => group.id === 'signature')?.count ?? 0;
  const evidenceCount = model.workQueueGroups.find(group => group.id === 'evidence')?.count ?? model.counts.evidenceRecords;
  const reviewCount = model.workQueueGroups.find(group => group.id === 'approvals')?.count ?? 0;

  return [
    { id: 'overdue', label: 'Overdue', value: items.filter(isOverdueItem).length, urgent: true },
    { id: 'due-soon', label: 'Due Soon', value: items.filter(isDueSoonItem).length },
    { id: 'signatures', label: 'Signatures', value: signatureCount },
    { id: 'evidence', label: 'Evidence', value: evidenceCount },
    { id: 'reviews', label: 'Reviews', value: reviewCount },
  ];
}

function SummaryStrip({ pills }: { pills: SummaryPill[] }): ReactElement {
  return (
    <div className="mt-3 grid grid-cols-5 gap-1.5">
      {pills.map(pill => (
        <div
          key={pill.id}
          className="min-w-0 rounded-lg border px-1.5 py-1.5 text-center"
          style={{
            background: pill.urgent
              ? 'color-mix(in srgb, var(--ci-primary-500, #C74601) 10%, var(--ci-surface, #FFFFFF))'
              : 'color-mix(in srgb, var(--ci-surface, #FFFFFF) 88%, transparent)',
            borderColor: pill.urgent
              ? 'color-mix(in srgb, var(--ci-primary-500, #C74601) 24%, var(--v3-border-subtle))'
              : 'var(--v3-border-subtle)',
          }}
        >
          <p
            className="text-[8px] font-bold uppercase leading-none"
            style={{
              color: pill.urgent ? 'var(--ci-primary-500, #C74601)' : 'var(--brand-primary, #007970)',
              letterSpacing: '0.02em',
            }}
          >
            {pill.label}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold leading-none" style={{ color: 'var(--v3-text-primary)' }}>
            {formatCount(pill.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function SectionBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: PanelIcon;
  children: ReactNode;
}): ReactElement {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={14} strokeWidth={2} aria-hidden="true" style={{ color: 'var(--brand-primary, #007970)' }} />
          <h3
            className="truncate font-montserrat text-[11px] font-bold uppercase"
            style={{ color: 'var(--brand-primary, #007970)', letterSpacing: '0.12em' }}
          >
            {title}
          </h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function WorkQueueGroupBlock({
  group,
  expanded,
  onToggle,
  onNavigate,
  onOpenTask,
}: {
  group: PersonalOpsWorkQueueGroup;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: (target: string) => void;
  onOpenTask: (taskId: string) => void;
}): ReactElement {
  const visibleItems = expanded ? group.items : group.items.slice(0, GROUP_PREVIEW_LIMIT);
  const hiddenCount = Math.max(0, group.items.length - GROUP_PREVIEW_LIMIT);

  return (
    <div
      className="rounded-lg border"
      style={{
        background: 'color-mix(in srgb, var(--ci-surface, #FFFFFF) 82%, transparent)',
        borderColor: 'var(--v3-border-subtle)',
      }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="truncate text-[12px] font-semibold" style={{ color: 'var(--v3-text-primary)' }}>{group.title}</p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: 'color-mix(in srgb, var(--brand-primary, #007970) 11%, transparent)',
            color: 'var(--brand-primary, #007970)',
          }}
        >
          {formatCount(group.count)}
        </span>
      </div>
      {visibleItems.length > 0 && (
        <div className="border-t" style={{ borderColor: 'var(--v3-border-subtle)' }}>
          {visibleItems.map(item => (
            <PersonalOpsRow key={item.id} item={item} compact onOpen={() => openItem(item, onNavigate, onOpenTask)} />
          ))}
        </div>
      )}
      {hiddenCount > 0 && (
        <div className="border-t px-3 py-1.5" style={{ borderColor: 'var(--v3-border-subtle)' }}>
          <ViewAllButton label={expanded ? 'Show fewer' : `View all ${formatCount(group.count)}`} onClick={onToggle} compact />
        </div>
      )}
    </div>
  );
}

function ListSurface({ children }: { children: ReactNode }): ReactElement {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{
        background: 'color-mix(in srgb, var(--ci-surface, #FFFFFF) 82%, transparent)',
        borderColor: 'var(--v3-border-subtle)',
      }}
    >
      {children}
    </div>
  );
}

function PersonalOpsRow({
  item,
  onOpen,
  compact = false,
}: {
  item: PersonalOpsDisplayItem;
  onOpen: () => void;
  compact?: boolean;
}): ReactElement {
  const tone = toneForItem(item);
  const Icon = iconForItem(item);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="ci-subtle-hover group flex w-full items-center gap-2 border-b px-3 text-left last:border-b-0"
      style={{
        borderColor: 'var(--v3-border-subtle)',
        paddingTop: compact ? 7 : 9,
        paddingBottom: compact ? 7 : 9,
      }}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 items-center gap-2">
          <StatusChip label={statusLabel(item.status)} color={tone.color} soft={tone.soft} />
          <span className="truncate text-[12px] font-semibold leading-tight" style={{ color: 'var(--v3-text-primary)' }}>
            {item.title}
          </span>
        </span>
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] leading-tight" style={{ color: 'var(--v3-text-tertiary)' }}>
          <span className="inline-flex items-center gap-1">
            <Icon size={11} strokeWidth={2} aria-hidden="true" style={{ color: 'var(--brand-primary, #007970)' }} />
            {item.source}
          </span>
          {item.dueDate && <span>Due {formatDue(item.dueDate)}</span>}
          <span>{priorityLabel(item.priority)}</span>
        </span>
      </span>
      <ChevronRight
        size={15}
        strokeWidth={2}
        aria-hidden="true"
        className="shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: 'var(--v3-text-tertiary)' }}
      />
    </button>
  );
}

function StatusChip({ label, color, soft }: { label: string; color: string; soft: string }): ReactElement {
  return (
    <span
      className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
      style={{ color, background: soft, letterSpacing: '0.06em' }}
    >
      {label}
    </span>
  );
}

function ViewAllButton({ label, onClick, compact = false }: { label: string; onClick: () => void; compact?: boolean }): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ci-subtle-hover rounded-full font-semibold"
      style={{
        color: 'var(--brand-primary, #007970)',
        fontSize: compact ? 11 : 12,
        padding: compact ? '2px 0' : '4px 0',
      }}
    >
      {label}
    </button>
  );
}

function PanelEmptyState({ title, description }: { title: string; description: string }): ReactElement {
  return (
    <div
      className="rounded-lg border px-3 py-2.5"
      style={{
        background: 'color-mix(in srgb, var(--ci-surface, #FFFFFF) 78%, transparent)',
        borderColor: 'var(--v3-border-subtle)',
      }}
    >
      <p className="text-[12px] font-semibold" style={{ color: 'var(--v3-text-primary)' }}>{title}</p>
      <p className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--v3-text-secondary)' }}>{description}</p>
    </div>
  );
}

function SecurityFooter({ model }: { model: PersonalOpsModel }): ReactElement {
  return (
    <footer
      className="rounded-lg border px-3 py-2.5"
      style={{
        background: 'color-mix(in srgb, var(--brand-primary, #007970) 7%, var(--ci-surface, #FFFFFF))',
        borderColor: 'color-mix(in srgb, var(--brand-primary, #007970) 22%, var(--v3-border-subtle))',
      }}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <ShieldCheck size={14} aria-hidden="true" style={{ color: 'var(--brand-primary, #007970)' }} />
        <p
          className="font-montserrat text-[10px] font-bold uppercase"
          style={{ color: 'var(--brand-primary, #007970)', letterSpacing: '0.1em' }}
        >
          Secure Session
        </p>
      </div>
      <div className="space-y-0.5 text-[10.5px] leading-snug" style={{ color: 'var(--v3-text-secondary)' }}>
        <p>{model.security.secureStatus}</p>
        <p>Clearance: {model.security.clearance}</p>
        <p>Status: {model.security.handshakeStatus}</p>
        <p>{model.security.permissionPosture}</p>
        <p>{model.security.noPhiNotice}</p>
        <p>{model.security.lastSyncLabel}</p>
      </div>
    </footer>
  );
}

function openItem(
  item: PersonalOpsDisplayItem,
  onNavigate: (target: string) => void,
  onOpenTask: (taskId: string) => void,
): void {
  if (item.openKind === 'task' && item.taskId) {
    onOpenTask(item.taskId);
    return;
  }
  if ((item.openKind === 'calendar' || item.openKind === 'evidence' || item.openKind === 'route') && item.openTarget) {
    onNavigate(item.openTarget);
  }
}

function iconForItem(item: PersonalOpsDisplayItem): PanelIcon {
  if (item.kind === 'signature') return PenLine;
  if (item.kind === 'evidence') return FolderOpen;
  if (item.kind === 'approval') return FileCheck2;
  if (item.kind === 'calendar') return CalendarDays;
  if (item.kind === 'security') return KeyRound;
  return ClipboardCheck;
}

function toneForItem(item: PersonalOpsDisplayItem): { color: string; soft: string } {
  const status = item.status.toLowerCase();
  if (status.includes('overdue') || status.includes('blocked') || status.includes('returned') || item.priority === 'critical') {
    return { color: 'var(--ci-primary-500, #C74601)', soft: 'color-mix(in srgb, var(--ci-primary-500, #C74601) 12%, transparent)' };
  }
  if (status.includes('pending') || item.priority === 'high') {
    return { color: 'var(--ci-primary-500, #C74601)', soft: 'color-mix(in srgb, var(--ci-primary-500, #C74601) 10%, transparent)' };
  }
  if (status.includes('complete') || status.includes('active')) {
    return { color: '#008540', soft: 'rgba(0, 133, 64, 0.12)' };
  }
  return { color: 'var(--brand-primary, #007970)', soft: 'color-mix(in srgb, var(--brand-primary, #007970) 10%, transparent)' };
}

function statusLabel(status: string): string {
  if (status.length <= 12) return status;
  if (/in review/i.test(status)) return 'Review';
  if (/scheduled/i.test(status)) return 'Scheduled';
  if (/complete/i.test(status)) return 'Complete';
  return status.split(/\s+/)[0] ?? status;
}

function priorityLabel(priority: PersonalOpsPriority): string {
  if (priority === 'critical') return 'Critical';
  if (priority === 'high') return 'High';
  if (priority === 'low') return 'Low';
  return 'Normal';
}

function isOverdueItem(item: PersonalOpsDisplayItem): boolean {
  const status = item.status.toLowerCase();
  return status.includes('overdue') || status.includes('blocked') || status.includes('returned') || item.priority === 'critical';
}

function isDueSoonItem(item: PersonalOpsDisplayItem): boolean {
  if (!item.dueDate || isOverdueItem(item)) return false;
  const due = new Date(`${item.dueDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDays = new Date(today);
  sevenDays.setDate(today.getDate() + 7);
  return due >= today && due <= sevenDays;
}

function uniqueItems(items: PersonalOpsDisplayItem[]): PersonalOpsDisplayItem[] {
  const seen = new Set<string>();
  const result: PersonalOpsDisplayItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function formatDue(dateIso: string): string {
  const date = new Date(`${dateIso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return String(value);
}
