import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, ChevronDown, FileText, Search, ShieldCheck, UserCheck, XCircle } from 'lucide-react';
import { buildCalendarEvents, buildSprintSummary, type CesCalendarEvent } from '@/policy/ces/cesViewProjections';
import { loadMasterControlInventorySeed } from '@/policy/data/masterControlInventory';
import type { MasterControlItem, MasterControlReadinessStatus } from '@/policy/types/masterControlInventory';
import {
  workspaceTabActiveClass,
  workspaceTabClass,
  workspaceTabInactiveClass,
  workspaceTabNavClass,
} from './workspaceTabChrome';
import { StaticCardWatermark } from './StaticCardWatermark';

type ComplianceView = 'home' | 'calendar' | 'controls' | 'workspace';
type ComplianceWorkspaceView = 'drive' | 'create' | 'edit' | 'ecign';

interface ComplianceMainTab {
  id: ComplianceView;
  label: string;
  to: string;
}

interface HighlightCardData {
  badge: string;
  badgeColor?: string;
  body: string;
  eyebrow: string;
  title: string;
}

interface ControlRow {
  category: string;
  domain: string;
  id: string;
  name: string;
  readiness: string;
  risk: string;
  status: string;
}

const complianceTabs: readonly ComplianceMainTab[] = [
  { id: 'home', label: 'Sprint Home', to: '/compliance' },
  { id: 'calendar', label: 'CES Calendar', to: '/ces/calendar' },
  { id: 'controls', label: 'Control Register', to: '/compliance/master-controls' },
];

const workspaceTabs: readonly { id: ComplianceWorkspaceView; label: string }[] = [
  { id: 'drive', label: 'Drive' },
  { id: 'create', label: 'Create Packet' },
  { id: 'edit', label: 'Edit Packet' },
  { id: 'ecign', label: 'eCign' },
];

const highlights: readonly HighlightCardData[] = [
  {
    eyebrow: 'Execution',
    badge: 'In progress',
    title: 'Current Compliance Sprint',
    body: 'View all active sprint work across mandated events, workflows, forms, evidence, minutes, approvals, and sign-offs.',
  },
  {
    eyebrow: 'Blockers',
    badge: 'Needs review',
    title: 'Missing Evidence & Stuck Tasks',
    badgeColor: 'bg-[#FFF0E5] text-[#C2410C]',
    body: 'See what cannot be certified yet because required files, forms, signatures, approvals, or minutes are missing.',
  },
  {
    eyebrow: 'Ownership',
    badge: 'Active',
    title: 'Assigned Work by Role',
    body: 'Track who owns each item across Administrator, DON, Clinical Manager, Compliance, HR, IT, QAPI, and office operations.',
  },
  {
    eyebrow: 'QAPI',
    badge: 'Monitoring',
    title: 'QAPI Sprint Readiness',
    badgeColor: 'bg-[#EBF4FF] text-[#2563EB]',
    body: 'Monitor feeder audits, quality dashboards, PIPs, CAPs, adverse events, infection logs, complaints, and Governing Body escalation items.',
  },
  {
    eyebrow: 'Sign-offs',
    badge: 'Pending',
    title: 'Approvals & eCign Status',
    badgeColor: 'bg-[#FFF0E5] text-[#C2410C]',
    body: 'Find unsigned packets, pending approvals, expired signature requests, missing dual-capacity sign-offs, and records waiting for certification.',
  },
  {
    eyebrow: 'Audit',
    badge: 'Ready check',
    title: 'Survey-Ready Output',
    badgeColor: 'bg-[#E5F4EE] text-[#008540]',
    body: 'Confirm the sprint has complete evidence, clean audit trails, approved minutes, required forms, and export-ready survey packets.',
  },
];

const registryWorkspaces = [
  {
    eyebrow: 'Canonical controls',
    title: 'Registry Management',
    body: 'Review regulatory controls, evidence requirements, accountable owners, and readiness gates.',
    to: '/compliance/master-controls',
    icon: ShieldCheck,
  },
  {
    eyebrow: 'Entity oversight',
    title: 'Vendor Management',
    body: 'Manage vendor classification, agreements, BAAs, monitoring, renewals, incidents, and offboarding.',
    to: '/compliance/vendors',
    icon: Building2,
  },
  {
    eyebrow: 'Workforce clearance',
    title: 'Contractor Management',
    body: 'Review contractor classification, credentials, clearance, assignments, renewals, and offboarding.',
    to: '/compliance/contractors',
    icon: UserCheck,
  },
] as const;

const HOME_SURFACE_CLASS = 'rounded-lg bg-white shadow-[0_14px_34px_rgba(31,41,55,0.10),0_2px_8px_rgba(31,41,55,0.06)] ring-1 ring-black/[0.03]';
const HOME_SURFACE_HOVER_CLASS = 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(31,41,55,0.14),0_4px_12px_rgba(31,41,55,0.08)]';

function viewFromPath(pathname: string): ComplianceView {
  if (pathname.startsWith('/ces/calendar')) return 'calendar';
  if (pathname.startsWith('/compliance/master-controls')) return 'controls';
  if (pathname.startsWith('/evidence')) return 'workspace';
  return 'home';
}

function workspaceViewFromSearch(search: string): ComplianceWorkspaceView | null {
  const value = new URLSearchParams(search).get('workspace');
  if (value === 'drive' || value === 'create' || value === 'edit' || value === 'ecign') return value;
  return null;
}

function readinessLabel(status: MasterControlReadinessStatus): string {
  if (status === 'OK') return 'Ok';
  if (status === 'BLOCKED') return 'Blocked';
  if (status === 'DOCUMENTATION_MISSING') return 'Documentation missing';
  if (status === 'NOT_CONFIGURED') return 'Not configured';
  return 'Needs attention';
}

function toControlRow(item: MasterControlItem): ControlRow {
  return {
    category: item.category,
    domain: item.domain,
    id: item.id,
    name: item.name,
    readiness: readinessLabel(item.readinessStatus),
    risk: item.riskTier,
    status: item.sourceStatus,
  };
}

function eventToneClass(event: CesCalendarEvent): string {
  if (event.tone === 'orange') return 'bg-[#F06923] text-white';
  if (event.tone === 'green') return 'bg-[#008540] text-white';
  if (event.tone === 'amber') return 'bg-[#D99100] text-white';
  return 'bg-[#007970] text-white';
}

function NavigationTabs({ activeView }: { activeView: ComplianceView }) {
  return (
    <nav aria-label="Compliance portal sections" className={workspaceTabNavClass}>
      {complianceTabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.to}
          className={`${workspaceTabClass} ${activeView === tab.id ? workspaceTabActiveClass : workspaceTabInactiveClass}`}
          aria-current={activeView === tab.id ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function HighlightCard({ card }: { card: HighlightCardData }) {
  return (
    <article className={`flex h-full flex-col p-8 ${HOME_SURFACE_CLASS} ${HOME_SURFACE_HOVER_CLASS}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">{card.eyebrow}</span>
        <span className={`rounded-[8px] px-2.5 py-1 font-montserrat text-[9px] font-bold uppercase tracking-wider ${card.badgeColor ?? 'bg-[#E5FEFF] text-[#007970]'}`}>
          {card.badge}
        </span>
      </div>
      <h3 className="mb-3 font-montserrat text-lg font-semibold leading-snug text-[#007970]">{card.title}</h3>
      <p className="flex-1 font-roboto text-[14px] leading-relaxed text-[#3D3D3A]">{card.body}</p>
    </article>
  );
}

function HomeLandingView({ openWorkspace }: { openWorkspace: () => void }) {
  const sprint = buildSprintSummary();
  const openTasks = Math.max(0, sprint.total - sprint.completed);
  const readiness = Math.round(((sprint.readyToCertify + sprint.completed) / Math.max(1, sprint.total)) * 100);
  const stats = [
    { value: 'Active Sprint', label: 'Current Cycle', strong: true },
    { value: String(openTasks), label: 'Open Tasks' },
    { value: String(sprint.blocked), label: 'Blocked Items' },
    { value: String(sprint.surveyCritical), label: 'Missing Evidence' },
    { value: String(sprint.awaitingSignature), label: 'Pending Sign-offs' },
    { value: `${readiness}%`, label: 'Audit Readiness' },
  ];

  return (
    <div className="relative z-10 space-y-8">
      <section className={`ci-page-hero relative w-full overflow-hidden p-10 md:p-14 ${HOME_SURFACE_CLASS}`}>
        <StaticCardWatermark />
        <div className="relative z-10">
          <span className="mb-4 block font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#C2410C]">
            CES Overview
          </span>
          <h1 className="mb-6 max-w-3xl font-montserrat text-4xl font-bold leading-tight tracking-tight text-[#007970] md:text-5xl">
            Care Indeed{' '}
            <br />
            Compliance Execution Sprint
          </h1>
          <p className="mb-10 max-w-3xl font-roboto text-lg font-light leading-relaxed text-[#3D3D3A]">
            A focused workspace for completing compliance work before it becomes a survey risk. Track mandated events, workflow tasks, evidence, forms, minutes, approvals, sign-offs, blockers, and audit readiness in one sprint view.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={openWorkspace}
              className="rounded-[12px] bg-[#F06923] px-8 py-3.5 font-montserrat text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_4px_12px_rgba(240,105,35,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#D1571A] hover:shadow-[0_6px_16px_rgba(240,105,35,0.3)]"
            >
              Open Sprint Dashboard
            </button>
            <Link
              to="/audit"
              className="rounded-[12px] border-[1.5px] border-[#007970] bg-white px-8 py-3.5 text-center font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970] transition-all hover:bg-[#F7FEFF]"
            >
              Review Missing Evidence
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`flex min-h-[140px] flex-col justify-center p-6 text-center md:p-8 ${HOME_SURFACE_CLASS}`}>
            <span className={`mb-2 block font-montserrat font-bold ${stat.strong ? 'text-xl text-[#007970]' : 'text-3xl text-[#C2410C]'}`}>
              {stat.value}
            </span>
            <span className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#474742]">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="pt-4" aria-labelledby="registry-contracts-heading">
        <div className="mb-6 flex flex-col gap-2 px-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#C2410C]">
              Compliance operations
            </p>
            <h2 id="registry-contracts-heading" className="mt-1 font-montserrat text-2xl font-semibold text-[#007970]">
              Registry &amp; Contracts
            </h2>
          </div>
          <p className="max-w-xl font-roboto text-sm leading-relaxed text-[#3D3D3A]">
            Move from canonical controls into the entity and person-level workspaces they govern.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {registryWorkspaces.map((workspace) => {
            const Icon = workspace.icon;
            return (
              <Link
                key={workspace.title}
                to={workspace.to}
                aria-label={`Open ${workspace.title}`}
                className={`group flex min-h-[220px] flex-col p-7 ${HOME_SURFACE_CLASS} ${HOME_SURFACE_HOVER_CLASS}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#E5FEFF] text-[#007970]">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <ArrowRight
                    className="h-5 w-5 text-[#474742] transition group-hover:translate-x-1 group-hover:text-[#007970]"
                    aria-hidden
                  />
                </div>
                <p className="mt-7 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#C2410C]">
                  {workspace.eyebrow}
                </p>
                <h3 className="mt-2 font-montserrat text-lg font-semibold text-[#007970]">{workspace.title}</h3>
                <p className="mt-3 font-roboto text-sm leading-relaxed text-[#3D3D3A]">{workspace.body}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="pt-8">
        <h2 className="mb-6 px-2 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970]">
          Sprint Highlights
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((card) => (
            <HighlightCard card={card} key={card.title} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-12">
        <div className={`p-8 lg:col-span-4 ${HOME_SURFACE_CLASS}`}>
          <h2 className="mb-6 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970]">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Open Sprint Dashboard', '/ces/board'],
              ['Review Blocked Items', '/audit'],
              ['Upload Missing Evidence', '/evidence?workspace=drive'],
              ['Check Pending Signatures', '/evidence?workspace=ecign'],
              ['Open QAPI Sprint', '/ces/calendar'],
              ['Run Audit Readiness Check', '/compliance/review'],
              ['Export Sprint Packet', '/ces/reports'],
              ['Ask Brad for Next Step', '/iadministrator'],
            ].map(([label, to]) => (
              <Link
                key={label}
                to={to}
                className="group flex w-full items-center justify-between rounded-xl border border-[#E5E4E3] bg-[#FAFAF7] px-5 py-3.5 text-left font-montserrat text-[13px] font-semibold text-[#52404B] transition-colors hover:border-[#007970] hover:bg-[#F7FEFF]"
              >
                {label}
                <ArrowRight className="h-3.5 w-3.5 text-[#474742] transition-colors group-hover:text-[#007970]" aria-hidden />
              </Link>
            ))}
          </div>
        </div>

        <div className={`relative flex flex-col justify-between overflow-hidden p-10 md:p-14 lg:col-span-8 ${HOME_SURFACE_CLASS}`}>
          <ShieldCheck className="pointer-events-none absolute -bottom-10 -right-10 h-[280px] w-[280px] text-[#007970] opacity-[0.05]" aria-hidden />
          <div className="relative z-10">
            <h2 className="mb-4 font-montserrat text-3xl font-bold text-[#007970]">Ready to close the sprint?</h2>
            <p className="mb-10 max-w-xl font-roboto text-base leading-relaxed text-[#3D3D3A]">
              Review blockers, confirm evidence, complete sign-offs, and certify the sprint when every required item is defensible.
            </p>
            <Link
              to="/ces/reports"
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#007970] px-8 py-3.5 font-montserrat text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_4px_12px_rgba(0,121,112,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#00635C] hover:shadow-[0_6px_16px_rgba(0,121,112,0.3)]"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Close Sprint Review
            </Link>
          </div>
          <div className="relative z-10 mt-8 border-t border-[#E5E4E3] pt-12">
            <p className="font-roboto text-[11px] leading-relaxed text-[#474742]">
              Built for fast, defensible compliance execution: no scattered spreadsheets, no missing sign-offs, no last-minute scrambling.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CalendarView() {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const cells = Array.from({ length: 35 }, (_, i) => i + 1);
  const eventsByDay = useMemo(() => {
    const grouped = new Map<number, CesCalendarEvent[]>();
    buildCalendarEvents({ force: true })
      .filter((event) => (event.month ?? 6) === 6 && event.day >= 1 && event.day <= 30)
      .forEach((event) => {
        const list = grouped.get(event.day) ?? [];
        list.push(event);
        grouped.set(event.day, list);
      });
    return grouped;
  }, []);

  return (
    <section className="flex h-[800px] flex-col overflow-hidden rounded-b-[32px] rounded-tr-[32px] border border-[#E5E4E3] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-6 border-b border-[#E5E4E3] bg-white px-8 py-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-montserrat text-2xl font-bold text-[#52404B]">
            CES Calendar <span className="font-semibold text-[#007970]">Jun 2026</span>
          </h1>
          <p className="mt-1 font-roboto text-sm text-[#3D3D3A]">Teal events are ready; orange events need owner action.</p>
        </div>

        <div className="flex flex-col gap-4 xl:items-end">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="rounded-full bg-[#E5FEFF] px-5 py-2 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970]">
              Calendar
            </span>
            <Link
              to="/ces/board"
              className="rounded-full bg-[#F06923] px-6 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_10px_24px_rgba(240,105,35,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#D1571A]"
            >
              Open Sprint Dashboard
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex max-w-full items-center overflow-x-auto rounded-full border border-[#E5E4E3] bg-[#FAFAF7] p-1 shadow-sm">
              {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((month) => (
                <button
                  key={month}
                  type="button"
                  className={`rounded-full px-2.5 py-1.5 font-montserrat text-[10px] font-bold transition-colors ${month === 'JUN' ? 'bg-[#007970] text-white' : 'text-[#474742] hover:text-[#52404B]'}`}
                >
                  {month}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-full border border-[#E5E4E3] bg-[#FAFAF7] p-1 shadow-sm">
              {['2025', '2026', '2027'].map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`rounded-full px-3 py-1.5 font-montserrat text-[10px] font-bold transition-colors ${year === '2026' ? 'bg-[#007970] text-white' : 'text-[#474742] hover:text-[#52404B]'}`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-[#FAFAF7]">
        <div className="grid grid-cols-7 border-b border-[#E5E4E3] bg-white">
          {days.map((day) => (
            <div key={day} className="py-4 text-center font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#474742]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-7 grid-rows-5 gap-px bg-[#E5E4E3]">
          {cells.map((dayNum) => {
            const isValid = dayNum <= 30;
            const events = isValid ? eventsByDay.get(dayNum) ?? [] : [];
            return (
              <div key={dayNum} className="group flex flex-col gap-1.5 overflow-hidden bg-white p-3 transition-colors hover:bg-[#F7FEFF]">
                {isValid ? <span className="mb-1 font-montserrat text-sm font-semibold text-[#3D3D3A]">{dayNum}</span> : null}
                {events.slice(0, 2).map((event) => (
                  <Link
                    key={event.id ?? `${event.label}-${event.day}`}
                    to={event.workflowId ? `/events/${encodeURIComponent(event.id ?? event.label)}/swimlane` : '/evidence'}
                    className={`${eventToneClass(event)} truncate rounded-lg px-2.5 py-1.5 font-roboto text-[10px] shadow-sm transition hover:opacity-90`}
                    title={event.label}
                  >
                    {event.label}
                  </Link>
                ))}
                {events.length > 2 ? (
                  <span className="font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#474742]">
                    +{events.length - 2} more
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ControlRegisterView() {
  const [items, setItems] = useState<readonly MasterControlItem[]>([]);

  useEffect(() => {
    let mounted = true;
    loadMasterControlInventorySeed().then((loaded) => {
      if (mounted) setItems(loaded);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const controls = useMemo<readonly ControlRow[]>(
    () => items.slice(0, 14).map(toControlRow),
    [items],
  );

  return (
    <section className="overflow-hidden rounded-b-[32px] rounded-tr-[32px] border border-[#E5E4E3] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="overflow-x-auto p-2">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E5E4E3]">
              {['Control ID', 'Control Name', 'Category', 'Domain', 'Risk Tier', 'Status', 'Readiness'].map((heading) => (
                <th key={heading} className="whitespace-nowrap bg-[#F7FEFF] px-6 py-5 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#007970] first:rounded-tl-xl last:rounded-tr-xl">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-roboto text-sm text-[#52404B]">
            {controls.length > 0 ? (
              controls.map((control) => (
                <tr key={control.id} className="border-b border-[#E5E4E3] transition-colors hover:bg-[#FAFAF7]">
                  <td className="whitespace-nowrap px-6 py-4 font-montserrat font-semibold text-[#3D3D3A]">{control.id}</td>
                  <td className="min-w-[320px] px-6 py-4">{control.name}</td>
                  <td className="min-w-[190px] px-6 py-4 text-[#3D3D3A]">{control.category}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-[#3D3D3A]">{control.domain}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-[#3D3D3A]">{control.risk}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-[#3D3D3A]">{control.status}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-montserrat text-[10px] font-bold uppercase tracking-wider ${control.readiness === 'Blocked' || control.readiness === 'Documentation missing' ? 'text-[#C2410C]' : 'text-[#007970]'}`}>
                      {control.readiness === 'Blocked' || control.readiness === 'Documentation missing' ? <XCircle className="h-3.5 w-3.5" aria-hidden /> : <ShieldCheck className="h-3.5 w-3.5" aria-hidden />}
                      {control.readiness}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center font-roboto text-sm text-[#3D3D3A]">
                  Loading live control register data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WorkspaceShell({
  activeTab,
  setTab,
}: {
  activeTab: ComplianceWorkspaceView;
  setTab: (tab: ComplianceWorkspaceView) => void;
}) {
  return (
    <section className="flex min-h-[800px] flex-col rounded-b-[32px] rounded-tr-[32px] border border-[#E5E4E3] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="px-8 pt-8 font-montserrat md:px-12">
        <div className="flex max-w-full flex-wrap items-center gap-3 overflow-x-auto rounded-full bg-[#FAFAF7] p-2">
          {workspaceTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className={`min-h-11 whitespace-nowrap rounded-full px-8 py-3 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F06923] text-white shadow-[0_10px_24px_rgba(240,105,35,0.22)]'
                    : 'bg-white text-[#474742] hover:bg-[#FFF2EB] hover:text-[#C2410C]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12">
        {activeTab === 'drive' ? <DriveView /> : null}
        {activeTab === 'create' ? <CreatePacketView /> : null}
        {activeTab === 'edit' ? <EditPacketView /> : null}
        {activeTab === 'ecign' ? <EcignView /> : null}
      </div>
    </section>
  );
}

function DriveView() {
  const folders = [
    { color: '#3B82F6', title: '01_CES', files: '73 files' },
    { color: '#A855F7', title: '2026 Brad Training', files: '38 files' },
    { color: '#10B981', title: 'Event Packets', files: '11 files' },
    { color: '#F97316', title: 'Mock Records', files: '1034 files' },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h2 className="font-montserrat text-2xl font-semibold text-[#52404B]">Google Drive Evidence</h2>
        <p className="mt-1 font-roboto text-sm text-[#3D3D3A]">Folders are color-coded by event domain; documents file flat inside each event.</p>
      </div>

      <div className="flex items-center rounded-full border border-[#E5E4E3] bg-[#FAFAF7] p-2">
        <Search className="ml-4 mr-2 h-5 w-5 text-[#474742]" aria-hidden />
        <input
          type="text"
          placeholder="Search CES Evidence Drive"
          className="flex-1 border-none bg-transparent py-3 font-roboto text-[#52404B] focus:outline-none"
        />
        <button type="button" className="ml-2 rounded-full bg-[#007970] px-8 py-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#00635C]">
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 md:grid-cols-4">
        {folders.map((folder) => (
          <button
            key={folder.title}
            type="button"
            className="flex min-h-[224px] flex-col items-center justify-center gap-4 rounded-3xl border border-[#E5E4E3] bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
          >
            <span className="relative h-20 w-24 rounded-xl border-[4px]" style={{ borderColor: folder.color }}>
              <span className="absolute left-0 top-0 h-4 w-1/2 rounded-br-lg border-b-[4px] border-r-[4px]" style={{ borderColor: folder.color }} />
            </span>
            <span className="mt-2 font-montserrat text-lg font-bold text-[#52404B]">{folder.title}</span>
            <span className="rounded border border-[#E5E4E3] bg-[#FAFAF7] px-3 py-1 font-montserrat text-[10px] font-bold uppercase text-[#3D3D3A]">
              {folder.files}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CreatePacketView() {
  const templates = [
    { num: 1, title: 'Patient Admission Packet', desc: 'Full patient admission agreement with standard consents.' },
    { num: 2, title: 'QAPI Quarterly Committee Meeting', desc: 'Quarterly QAPI committee review with KPIs, PIPs, incidents, and audits.' },
    { num: 3, title: 'QAPI Monthly Committee Meeting', desc: 'Monthly QAPI review for rolling KPIs, open PIPs, incidents, and complaints.' },
    { num: 4, title: 'Governing Body / Board Meeting', desc: 'Governance review of operations, financials, compliance, and quality.' },
    { num: 5, title: 'Patient Safety Committee', desc: 'Review adverse events, near-misses, root-cause analyses, and trends.' },
    { num: 6, title: 'Custom Meeting Packet', desc: 'Build a custom packet from attached source evidence.' },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12">
      <div className="text-center">
        <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-[0.15em] text-[#52404B]">1 &bull; Select a packet template *</h2>
        <p className="mt-3 font-roboto text-sm text-[#3D3D3A]">Choose the packet structure first; you&apos;ll pick the data source next.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.num}
            type="button"
            className="flex min-h-[220px] flex-col rounded-[24px] border border-[#E5E4E3] bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#F06923]/30 hover:shadow-md"
          >
            <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E4E3] font-montserrat text-sm font-semibold text-[#474742]">
              {template.num}
            </span>
            <span className="mb-3 font-montserrat text-sm font-semibold uppercase leading-relaxed tracking-wide text-[#52404B]">
              {template.title}
            </span>
            <span className="font-roboto text-sm leading-relaxed text-[#3D3D3A]">{template.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EditPacketView() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="rounded-[26px] border border-[#E5E4E3] bg-[#FAFAF7] p-8">
        <label htmlFor="compliance-packet-id" className="mb-3 block font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#474742]">
          Packet ID
        </label>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <input
            id="compliance-packet-id"
            type="text"
            placeholder="qapi_meeting-20260609-"
            className="flex-1 rounded-xl border border-[#E5E4E3] bg-white px-4 py-3.5 font-roboto text-[#52404B] transition-colors focus:border-[#007970] focus:outline-none"
          />
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F06923] px-8 py-3.5 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_4px_12px_rgba(240,105,35,0.2)] transition-all hover:bg-[#D1571A]">
            <FileText className="h-4 w-4" aria-hidden />
            Load packet
          </button>
        </div>
      </div>
    </div>
  );
}

function EcignView() {
  const stats = [
    ['Assigned to me', '4'],
    ['Waiting on others', '50'],
    ['Copied to me', '0'],
    ['Created by me', '0'],
    ['Overdue', '0'],
    ['Expiring soon', '0'],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="flex flex-col justify-between gap-6 rounded-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:flex-row md:items-start">
        <div className="flex gap-5">
          <span className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#E5E4E3] bg-white shadow-sm">
            <span className="h-3.5 w-3.5 rounded-full bg-[#F06923]" />
          </span>
          <div>
            <h2 className="font-montserrat text-3xl font-bold text-[#52404B]">eCign Tracking</h2>
            <p className="mt-2 font-roboto text-sm text-[#3D3D3A]">Track packets assigned to you, copied to you, or created by you.</p>
            <p className="mt-1 font-roboto text-[12px] text-[#474742]">Signed in as TJ Padilla &bull; super_admin</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5E4E3] bg-[#FAFAF7] p-5 md:text-right">
          <div className="mb-1 flex items-center gap-3 md:justify-end">
            <span className="font-montserrat text-sm font-semibold text-[#52404B]">Create custom eCign packet</span>
            <span className="rounded bg-[#FFF0E5] px-2 py-0.5 font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#C2410C]">Coming Soon</span>
          </div>
          <p className="font-roboto text-xs text-[#474742]">Send a custom packet outside a CES event.</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-6">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm">
            <span className="mb-3 block font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">{label}</span>
            <span className="font-montserrat text-3xl font-semibold text-[#007970]">{value}</span>
          </div>
        ))}
      </section>

      <section className="space-y-6 rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['My action needed', 'Waiting on others', 'Copied to me', 'Created by me', 'All open', 'Completed'].map((tab, index) => (
            <button key={tab} type="button" className={`rounded-full px-5 py-2.5 font-montserrat text-[12px] font-bold transition-colors ${index === 0 ? 'bg-[#E5FEFF] text-[#007970]' : 'bg-[#FAFAF7] text-[#3D3D3A] hover:bg-[#E5E4E3]'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="relative md:col-span-4">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#474742]" aria-hidden />
            <input type="text" placeholder="Search packet ID, title, signer, event, workflow, status" className="w-full rounded-xl border border-[#E5E4E3] bg-[#FAFAF7] py-3.5 pl-12 pr-4 font-roboto text-sm text-[#52404B] transition-colors focus:border-[#007970] focus:outline-none" />
          </div>
          {['All relationships', 'All sources', 'All statuses', 'Any due date'].map((label) => (
            <div key={label} className="relative md:col-span-2">
              <select className="w-full appearance-none rounded-xl border border-[#E5E4E3] bg-[#FAFAF7] py-3.5 pl-4 pr-10 font-roboto text-sm text-[#3D3D3A] focus:outline-none">
                <option>{label}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#474742]" aria-hidden />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {[0, 1].map((index) => (
          <article key={index} className="flex flex-col gap-6 rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm transition-colors hover:border-[#007970]/30 md:flex-row">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-roboto text-sm text-[#52404B]">{index === 0 ? 'mokppmzr_8205360708e47231' : 'mokpsgk3_8d7940c7ebc08ab0'}</span>
                <span className="rounded bg-[#FFF0E5] px-2 py-0.5 font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#C2410C]">Pending My Signature</span>
                <span className="rounded bg-[#E5FEFF] px-2 py-0.5 font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#007970]">Assigned to me</span>
              </div>

              <div>
                <h3 className="mb-1 font-montserrat text-lg font-bold text-[#52404B]">EN-FM-011</h3>
                <p className="font-roboto text-sm text-[#474742]">Context: No context label</p>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
                {[
                  ['Source', 'CES'],
                  ['Due', 'Jul 22, 2026'],
                  ['Signers', '0 of 1 signed'],
                  ['Expires', 'Oct 5, 2026'],
                  ['Waiting on', 'super_admin'],
                  ['Last activity', index === 0 ? 'Apr 29, 4:54 PM' : 'Apr 29, 4:57 PM'],
                ].map(([label, value]) => (
                  <div key={`${label}-${value}`}>
                    <p className="mb-0.5 font-roboto text-[11px] text-[#474742]">{label}</p>
                    <p className="font-roboto text-sm text-[#3D3D3A]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-start justify-end md:w-[200px]">
              <button type="button" className="rounded-full bg-[#007970] px-8 py-3 font-montserrat text-[12px] font-bold tracking-wider text-white shadow-sm transition-colors hover:bg-[#00635C]">
                Review &amp; sign
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function ComplianceHomeScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = viewFromPath(location.pathname);
  const [localWorkspaceView, setLocalWorkspaceView] = useState<ComplianceWorkspaceView>('ecign');
  const activeWorkspaceView = workspaceViewFromSearch(location.search) ?? localWorkspaceView;

  const setWorkspaceView = (tab: ComplianceWorkspaceView) => {
    setLocalWorkspaceView(tab);
    if (activeView === 'workspace') {
      navigate(tab === 'ecign' ? '/evidence' : `/evidence?workspace=${tab}`, { replace: true });
    }
  };

  return (
    <section
      className="-m-xl min-h-screen overflow-x-hidden bg-[#FAFAF7] px-6 pb-16 pt-4 font-roboto text-[#52404B] selection:bg-[#E5FEFF] md:px-12"
      data-hash-id={activeView === 'home' ? 'compliance-home' : activeView === 'calendar' ? 'ces-calendar' : activeView === 'controls' ? 'master-controls' : 'defensible-2'}
      data-route={location.pathname}
      data-template={activeView === 'calendar' ? 'calendar' : activeView === 'controls' ? 'matrix' : activeView === 'workspace' ? 'evidence' : 'dashboard'}
    >
      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col">
        <NavigationTabs activeView={activeView} />

        {activeView === 'home' ? <HomeLandingView openWorkspace={() => navigate('/ces/board')} /> : null}
        {activeView === 'calendar' ? <CalendarView /> : null}
        {activeView === 'controls' ? <ControlRegisterView /> : null}
        {activeView === 'workspace' ? <WorkspaceShell activeTab={activeWorkspaceView} setTab={setWorkspaceView} /> : null}
      </main>
    </section>
  );
}

export default ComplianceHomeScreen;
