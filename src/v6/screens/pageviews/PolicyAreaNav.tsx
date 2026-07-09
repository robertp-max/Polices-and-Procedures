import { BookOpen, ClipboardList, GitBranch, Landmark, Library, Network, Workflow, type LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cx } from '../../utils/classNames';
import {
  workspaceCompactTabClass,
  workspaceTabActiveClass,
  workspaceTabInactiveClass,
  workspaceTabNavClass,
} from './workspaceTabChrome';

interface PolicyAreaTab {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
  matches: (pathname: string) => boolean;
}

const mainTabs: readonly PolicyAreaTab[] = [
  {
    id: 'home',
    icon: Library,
    label: 'Home',
    path: '/library',
    matches: (pathname) => pathname === '/library',
  },
  {
    id: 'policies',
    icon: BookOpen,
    label: 'Policies',
    path: '/library/policies',
    matches: (pathname) =>
      pathname === '/library/policies' ||
      pathname.startsWith('/library/policies/') ||
      (pathname.startsWith('/library/') && !pathname.startsWith('/library/policies')) ||
      pathname.startsWith('/print/'),
  },
  {
    id: 'forms',
    icon: ClipboardList,
    label: 'Forms',
    path: '/forms',
    matches: (pathname) => pathname === '/forms' || pathname.startsWith('/forms/'),
  },
  {
    id: 'workflows',
    icon: Workflow,
    label: 'Workflows',
    path: '/workflows',
    matches: (pathname) => pathname === '/workflows' || pathname.startsWith('/workflows/') || pathname.startsWith('/events/'),
  },
  {
    id: 'taxonomy',
    icon: Network,
    label: 'Taxonomy',
    path: '/framework',
    matches: (pathname) =>
      pathname === '/framework' ||
      pathname.startsWith('/framework/') ||
      pathname === '/taxonomy' ||
      pathname.startsWith('/taxonomy/') ||
      pathname === '/policy-lifecycle' ||
      pathname.startsWith('/policy-lifecycle/'),
  },
];

const taxonomyTabs: readonly PolicyAreaTab[] = [
  {
    id: 'framework',
    icon: Library,
    label: 'Framework',
    path: '/framework',
    matches: (pathname) => pathname === '/framework' || pathname === '/taxonomy',
  },
  {
    id: 'lifecycle',
    icon: GitBranch,
    label: 'Lifecycle',
    path: '/policy-lifecycle',
    matches: (pathname) => pathname === '/policy-lifecycle' || pathname.startsWith('/policy-lifecycle/'),
  },
  {
    id: 'achc',
    icon: Landmark,
    label: 'ACHC',
    path: '/framework/achc-survey',
    matches: (pathname) => pathname.startsWith('/framework/achc-survey') || pathname === '/framework/hh-evidence-map',
  },
];

function TabButton({ active, tab }: { active: boolean; tab: PolicyAreaTab }) {
  const navigate = useNavigate();
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={() => navigate(tab.path)}
      className={cx(
        workspaceCompactTabClass,
        'inline-flex items-center justify-center gap-2 whitespace-nowrap',
        active ? workspaceTabActiveClass : workspaceTabInactiveClass,
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon aria-hidden className="h-4 w-4 shrink-0" />
      {tab.label}
    </button>
  );
}

export function PolicyAreaNav() {
  const { pathname } = useLocation();
  const activeMain = mainTabs.find((tab) => tab.matches(pathname)) ?? mainTabs[0];
  const showTaxonomyTabs = activeMain.id === 'taxonomy';
  const activeTaxonomy = taxonomyTabs.find((tab) => tab.matches(pathname)) ?? taxonomyTabs[0];

  return (
    <div className="relative z-20 flex w-full flex-wrap items-stretch justify-between gap-3 font-montserrat">
      <nav aria-label="Policies primary sections" className={workspaceTabNavClass}>
        {mainTabs.map((tab) => (
          <TabButton active={tab.id === activeMain.id} key={tab.id} tab={tab} />
        ))}
      </nav>

      {showTaxonomyTabs ? (
        <nav aria-label="Taxonomy sections" className={cx(workspaceTabNavClass, 'ml-auto')}>
          {taxonomyTabs.map((tab) => (
            <TabButton active={tab.id === activeTaxonomy.id} key={tab.id} tab={tab} />
          ))}
        </nav>
      ) : null}
    </div>
  );
}
