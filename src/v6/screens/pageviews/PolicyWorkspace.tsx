import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, type LucideIcon } from 'lucide-react';
import { ProgressMeter, ToneTag, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { PolicyAreaNav } from './PolicyAreaNav';
import {
  workspaceCompactTabClass,
  workspaceTabActiveClass,
  workspaceTabInactiveClass,
  workspaceTabNavClass,
} from './workspaceTabChrome';

export interface PolicyWorkspaceTab<T extends string = string> {
  id: T;
  label: string;
  tone?: 'teal' | 'orange' | 'green' | 'blue' | 'red';
}

export interface PolicyWorkspaceAction {
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary';
}

export function PolicyWorkspaceTabs<T extends string>({
  activeTab,
  onChange,
  tabs,
}: {
  activeTab: T;
  onChange: (tab: T) => void;
  tabs: readonly PolicyWorkspaceTab<T>[];
}) {
  return (
    <nav aria-label="Policy workspace sections" className={workspaceTabNavClass}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cx(
              workspaceCompactTabClass,
              'flex items-center justify-center whitespace-nowrap',
              isActive ? workspaceTabActiveClass : workspaceTabInactiveClass,
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function PolicyActionButton({ action }: { action: PolicyWorkspaceAction }) {
  const Icon = action.icon;
  const className = cx(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] px-5 py-3 font-montserrat text-[10px] font-bold uppercase tracking-widest transition-all',
    action.variant === 'secondary'
      ? 'border-[1.5px] border-[#007970] bg-white text-[#007970] hover:bg-[#F7FEFF]'
      : 'bg-[#F06923] text-white hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.22)]',
  );
  const content = (
    <>
      {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {action.label}
    </>
  );
  if (action.to) {
    return (
      <Link to={action.to} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {content}
    </button>
  );
}

export function PolicyWorkspaceShell<T extends string = string>({
  actions,
  activeTab,
  children,
  dataHashId,
  dataRoute,
  description,
  eyebrow,
  onTabChange,
  showTabs = true,
  tabPlacement = 'top',
  tabs,
  title,
}: {
  actions?: readonly PolicyWorkspaceAction[];
  activeTab?: T;
  children: ReactNode;
  dataHashId: string;
  dataRoute: string;
  description: string;
  eyebrow: string;
  onTabChange?: (tab: T) => void;
  showTabs?: boolean;
  tabPlacement?: 'top' | 'hero';
  tabs?: readonly PolicyWorkspaceTab<T>[];
  title: string;
}) {
  const renderedTabs = showTabs && tabs && activeTab && onTabChange
    ? <PolicyWorkspaceTabs activeTab={activeTab} onChange={onTabChange} tabs={tabs} />
    : null;

  return (
    <div
      className="-m-xl min-h-screen overflow-x-hidden bg-[#FAFBF8] px-6 pb-16 pt-4 font-roboto text-[#52404B] selection:bg-[#E5FEFF] md:px-12"
      data-hash-id={dataHashId}
      data-route={dataRoute}
    >
      <main className="mx-auto flex w-full max-w-[1400px] flex-col">
        <PolicyAreaNav />
        {renderedTabs && tabPlacement === 'top' ? (
          <div className="relative z-20 flex justify-start">
            {renderedTabs}
          </div>
        ) : null}
        <section className="ci-page-hero mb-8 rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:px-12 md:py-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 font-montserrat text-[12px] font-bold uppercase tracking-wider text-[#F06923]">{eyebrow}</p>
              <h1 className="font-montserrat text-3xl font-bold leading-tight tracking-tight text-[#007970] md:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#747470]">{description}</p>
            </div>
            {(renderedTabs && tabPlacement === 'hero') || actions?.length ? (
              <div
                className={cx(
                  'flex flex-col items-stretch gap-3 sm:flex-row sm:items-center xl:justify-end',
                  renderedTabs && tabPlacement === 'hero' && 'xl:translate-x-12 xl:translate-y-8',
                )}
              >
                {renderedTabs && tabPlacement === 'hero' ? renderedTabs : null}
                {actions?.map((action) => (
                  <PolicyActionButton action={action} key={action.label} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
        {children}
      </main>
    </div>
  );
}

export function PolicyMetricsGrid({ metrics }: { metrics: readonly MetricTileData[] }) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-[24px] border border-[#E5E4E3] bg-white p-7 shadow-sm">
          <p className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470]">{metric.label}</p>
          <p className="mt-3 font-montserrat text-4xl font-bold text-[#F06923]">{metric.value}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#747470]">{metric.helper}</p>
        </div>
      ))}
    </div>
  );
}

export function PolicyPanel({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  title?: string;
}) {
  return (
    <section className="rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
      {title || description || actions ? (
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {title ? <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">{title}</h2> : null}
            {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#747470]">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function PolicySegmentTabs<T extends string>({
  active,
  onChange,
  tabs,
}: {
  active: T;
  onChange: (value: T) => void;
  tabs: readonly { id: T; label: string }[];
}) {
  return (
    <div className="flex max-w-full items-stretch overflow-x-auto font-montserrat" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cx(
            workspaceCompactTabClass,
            'whitespace-nowrap',
            active === tab.id ? workspaceTabActiveClass : workspaceTabInactiveClass,
          )}
          aria-selected={active === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function PolicySignalCard({ card, label = 'Signal strength' }: { card: SurfaceCardData; label?: string }) {
  const Icon = card.icon ?? FileCheck2;
  return (
    <article className="flex min-h-[192px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md">
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#E5FEFF] text-[#007970]">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <ToneBadge size="sm" status={card.status} />
        </div>
        <h3 className="font-montserrat text-base font-bold text-[#007970]">{card.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#747470]">{card.body}</p>
      </div>
      <div className="mt-5">
        <ProgressMeter label={label} tone={card.tone} value={card.progress ?? 0} />
      </div>
    </article>
  );
}

export function PolicyTinyStat({
  label,
  tone = 'teal',
  value,
}: {
  label: string;
  tone?: Tone;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#E5E4E3] bg-[#FAFBF8] p-3 text-center">
      <p className="font-montserrat text-xl font-bold text-[#007970]">{value}</p>
      <div className="mt-1 flex justify-center">
        <ToneTag tone={tone}>{label}</ToneTag>
      </div>
    </div>
  );
}
