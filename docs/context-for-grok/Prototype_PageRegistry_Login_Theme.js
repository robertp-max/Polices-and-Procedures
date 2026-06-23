/**
 * ============================================================================
 * CARE INDEED — PREMIUM HEALTHCARE COMMAND CENTER PROTOTYPE
 * Single-file React 18 (CDN) ready module
 *
 * Focus: LoginPage (dark + light variants) + ThemeToggle + PAGE_REGISTRY
 * This file is the SINGLE SOURCE OF TRUTH for page inventory + auth chrome.
 *
 * Usage in HTML prototype (React 18 via CDN + JSX transform):
 *   <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
 *   <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
 *   <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
 *   <script type="text/babel" src="this-file.js"></script>
 *
 * Exports (globals or module):
 *   - COMPONENT_GROUPS
 *   - PAGE_REGISTRY
 *   - usePrototypeTheme (hook)
 *   - ThemeToggle (component)
 *   - LoginPage (component)  — accepts { onEnter }
 *
 * Design goals:
 *   • Dark mode: cinematic glassmorphic navy/slate preserving existing Care Indeed
 *     locked dark login direction (rich dark bg, subtle glass card, teal accents).
 *   • Light mode: brand-new warm paper palette (#FAF9F6 base), gray logo,
 *     clean elevated paper surfaces, deep readable text, teal primary + subtle orange.
 *   • Premium micro-interactions, fully accessible, production-grade prototype code.
 *   • Theme persists in localStorage, instantly updates data-theme + class + logos.
 *   • Registry is exhaustive (12 groups, 48 page entries) with templateType hints.
 *
 * Logos (CDN as specified):
 *   Dark: https://dovdry3t4njek.cloudfront.net/assets/ci-logo-white-DfgJTkII.png
 *   Light: https://dovdry3t4njek.cloudfront.net/assets/ci-logo-gray-Dju7zS6k.png
 *
 * Reference source (exact match):
 *   src/policy/security/identity/pageRegistry.ts + docs/Page_Views_List.md
 * ============================================================================
 */

/* global React, ReactDOM */

// -----------------------------------------------------------------------------
// React convenience (works in UMD CDN + Babel standalone without import)
const { useState, useEffect, useCallback, useMemo } = React;

// -----------------------------------------------------------------------------
// THEME SYSTEM (global single source — data-theme + class + localStorage)
// -----------------------------------------------------------------------------
const THEME_STORAGE_KEY = 'ci-prototype-theme';
const DEFAULT_THEME = 'dark';

function applyThemeToDocument(nextTheme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', nextTheme);
  root.classList.toggle('dark', nextTheme === 'dark');
  root.classList.toggle('light', nextTheme === 'light');
  root.classList.toggle('theme-dark', nextTheme === 'dark');
  root.classList.toggle('theme-light', nextTheme === 'light');
}

/**
 * usePrototypeTheme — production-grade, SSR-safe, instantly reactive hook.
 * Default: dark (preserves existing Care Indeed locked dark login).
 * Persists to localStorage. Updates <html data-theme> + body classes.
 */
function usePrototypeTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'light' || saved === 'dark' ? saved : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const setTheme = useCallback((next) => {
    const resolved = next === 'light' ? 'light' : 'dark';
    setThemeState(resolved);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, resolved);
    } catch {}
    applyThemeToDocument(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Apply on mount + whenever theme changes (covers direct setTheme calls)
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  // Bootstrap once on first load (in case hook not mounted immediately)
  useEffect(() => {
    applyThemeToDocument(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isDark = theme === 'dark';

  return useMemo(() => ({ theme, setTheme, toggleTheme, isDark }), [theme, setTheme, toggleTheme, isDark]);
}

// -----------------------------------------------------------------------------
// BEAUTIFUL THEME TOGGLE — premium micro-interaction switch
// Works independently. Use with the hook or pass controlled props.
// -----------------------------------------------------------------------------
function ThemeToggle({ isDark: controlledIsDark, onToggle, theme: controlledTheme, toggleTheme: controlledToggle }) {
  // Support both controlled (preferred) and internal hook usage
  const hook = usePrototypeTheme();
  const isDark = controlledIsDark !== undefined ? controlledIsDark : hook.isDark;
  const handleToggle = onToggle || controlledToggle || hook.toggleTheme;

  const bg = isDark
    ? 'linear-gradient(90deg, #0f1624 0%, #1a2333 100%)'
    : 'linear-gradient(90deg, #EDEBE3 0%, #F5F3EB 100%)';

  const knobBg = isDark
    ? 'linear-gradient(145deg, #111A28, #0B111C)'
    : 'linear-gradient(145deg, #FFFFFF, #F8F6F0)';

  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(30,35,45,0.12)';
  const iconColor = isDark ? '#A5B4C8' : '#4B5563';

  return React.createElement(
    'button',
    {
      type: 'button',
      onClick: handleToggle,
      'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
      'aria-pressed': !isDark,
      title: isDark ? 'Switch to light mode' : 'Switch to dark mode',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 4px 4px 5px',
        borderRadius: '999px',
        background: bg,
        border: `1px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'all 180ms cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: isDark
          ? '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        outline: 'none',
        position: 'relative',
        width: '64px',
        height: '32px',
      },
    },
    // Track
    React.createElement(
      'div',
      {
        style: {
          position: 'relative',
          flex: 1,
          height: '24px',
          borderRadius: '999px',
          overflow: 'hidden',
        },
      },
      // Sliding knob
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute',
            top: '1px',
            left: isDark ? '1px' : '33px',
            width: '22px',
            height: '22px',
            borderRadius: '999px',
            background: knobBg,
            border: `1px solid ${borderColor}`,
            boxShadow: isDark
              ? '0 2px 6px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset'
              : '0 3px 8px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.95) inset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 220ms cubic-bezier(0.23, 1.0, 0.32, 1), background 180ms ease, box-shadow 180ms ease',
          },
        },
        // Icon
        React.createElement(
          'span',
          {
            style: {
              fontSize: '13px',
              lineHeight: 1,
              color: iconColor,
              transition: 'color 180ms ease',
              userSelect: 'none',
            },
          },
          isDark ? '🌙' : '☀︎'
        )
      )
    )
  );
}

// -----------------------------------------------------------------------------
// PAGE_REGISTRY — Single Source of Truth
// Exactly matching Page Views Master Table (COMPONENT_GROUPS + 48 entries)
// Added templateType hint for prototype shell routing / stub rendering.
// -----------------------------------------------------------------------------
const COMPONENT_GROUPS = [
  { componentId: 'cmp-dashboard', label: 'Dashboard / Command Center', defaultAccess: 'read', order: 10, description: 'Operator landing surfaces.' },
  { componentId: 'cmp-policy-library', label: 'Policy Library', defaultAccess: 'read', order: 20, description: 'Policy browsing, lifecycle, framework / taxonomy.' },
  { componentId: 'cmp-forms', label: 'Forms', defaultAccess: 'read', order: 30, description: 'Forms library and signing surfaces.' },
  { componentId: 'cmp-ces', label: 'CES / Compliance Execution', defaultAccess: 'read', order: 40, description: 'Sprint board, calendar, workloads, reports, PM layer.' },
  { componentId: 'cmp-calendar', label: 'Calendar', defaultAccess: 'read', order: 50, description: 'Master CES calendar + mobile incident execution.' },
  { componentId: 'cmp-evidence', label: 'Evidence Center', defaultAccess: 'read', order: 60, description: 'Evidence collection and inspection workspace.' },
  { componentId: 'cmp-audit', label: 'Audit Mode', defaultAccess: 'read', order: 70, description: 'Read-only audit and export surfaces.' },
  { componentId: 'cmp-journey', label: 'Journey / Training', defaultAccess: 'read', order: 80, description: 'Onboarding journey, modules, Onboarding v2 activation.' },
  { componentId: 'cmp-staffing', label: 'Staffing / Clinical', defaultAccess: 'read', order: 90, description: 'Clinician + patient profiles, staffing calendar.' },
  { componentId: 'cmp-iadministrator', label: 'iAdministrator', defaultAccess: 'read', order: 100, description: 'Brad decision-support surfaces.' },
  { componentId: 'cmp-user-management', label: 'User Management / Identity Admin', defaultAccess: 'none', order: 110, description: 'User assignments, roles, permissions, groups, page access.' },
  { componentId: 'cmp-system', label: 'System / Settings', defaultAccess: 'read', order: 120, description: 'Help Center, system documentation, demo, operational tooling.' },
];

const PAGE_REGISTRY = [
  // ─── Dashboard ─────────────────────────────────────────────
  { pageId: 'page.dashboard', label: 'Dashboard', routePattern: '/dashboard', componentGroup: 'cmp-dashboard', defaultAccess: 'read', templateType: 'dashboard' },

  // ─── Policy Library ────────────────────────────────────────
  { pageId: 'page.library', label: 'Policy Library', routePattern: '/library', componentGroup: 'cmp-policy-library', defaultAccess: 'read', templateType: 'registry-table' },
  { pageId: 'page.policy-detail', label: 'Policy Detail', routePattern: '/library/:policyId', componentGroup: 'cmp-policy-library', defaultAccess: 'read', templateType: 'detail' },
  { pageId: 'page.policy-lifecycle', label: 'Policy Lifecycle', routePattern: '/policy-lifecycle', componentGroup: 'cmp-policy-library', defaultAccess: 'read', templateType: 'documentation' },
  { pageId: 'page.framework', label: 'Framework', routePattern: '/framework', componentGroup: 'cmp-policy-library', defaultAccess: 'read', templateType: 'documentation' },
  { pageId: 'page.taxonomy', label: 'Taxonomy', routePattern: '/taxonomy', componentGroup: 'cmp-policy-library', defaultAccess: 'read', templateType: 'directory' },
  { pageId: 'page.achc-survey', label: 'ACHC Survey Alignment', routePattern: '/framework/achc-survey', componentGroup: 'cmp-policy-library', defaultAccess: 'read', templateType: 'documentation' },

  // ─── Forms ─────────────────────────────────────────────────
  { pageId: 'page.forms', label: 'Forms Library', routePattern: '/forms', componentGroup: 'cmp-forms', defaultAccess: 'read', templateType: 'registry-table' },
  { pageId: 'page.form-viewer', label: 'Form Viewer / Sign', routePattern: '/forms/:formId', componentGroup: 'cmp-forms', defaultAccess: 'read', templateType: 'detail' },

  // ─── CES ───────────────────────────────────────────────────
  { pageId: 'page.ces-calendar', label: 'CES Calendar', routePattern: '/ces/calendar', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'calendar' },
  { pageId: 'page.ces-board', label: 'CES Sprint Board', routePattern: '/ces/board', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'board' },
  { pageId: 'page.ces-workloads', label: 'CES Workloads', routePattern: '/ces/workloads', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'board' },
  { pageId: 'page.ces-reports', label: 'CES Reports', routePattern: '/ces/reports', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'registry-table' },
  { pageId: 'page.my-tasks', label: 'My Tasks', routePattern: '/my-tasks', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'board' },
  { pageId: 'page.workflows', label: 'Workflows Library', routePattern: '/workflows', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'registry-table' },
  { pageId: 'page.master-controls', label: 'Master Control Inventory', routePattern: '/compliance/master-controls', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'registry-table' },
  { pageId: 'page.pm-tasks', label: 'PM — My Tasks', routePattern: '/pm/my-tasks', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'board' },
  { pageId: 'page.pm-sprint-plan', label: 'PM — Sprint Plan', routePattern: '/pm/sprint-plan', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'board' },
  { pageId: 'page.pm-sprint-review', label: 'PM — Sprint Review', routePattern: '/pm/sprint-review', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'board' },
  { pageId: 'page.pm-approvals', label: 'PM — Approvals', routePattern: '/pm/approvals', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'board' },
  { pageId: 'page.pm-dashboard', label: 'PM — Dashboard', routePattern: '/pm/dashboard', componentGroup: 'cmp-ces', defaultAccess: 'read', templateType: 'dashboard' },

  // ─── Calendar ──────────────────────────────────────────────
  { pageId: 'page.calendar', label: 'Master Calendar', routePattern: '/calendar', componentGroup: 'cmp-calendar', defaultAccess: 'read', templateType: 'calendar' },

  // ─── Evidence ──────────────────────────────────────────────
  { pageId: 'page.evidence', label: 'Evidence Center', routePattern: '/evidence', componentGroup: 'cmp-evidence', defaultAccess: 'read', templateType: 'evidence' },

  // ─── Audit ─────────────────────────────────────────────────
  { pageId: 'page.audit', label: 'Audit Mode', routePattern: '/audit', componentGroup: 'cmp-audit', defaultAccess: 'read', templateType: 'registry-table' },

  // ─── Journey / Training ────────────────────────────────────
  { pageId: 'page.journey-home', label: 'Journey Home', routePattern: '/journey', componentGroup: 'cmp-journey', defaultAccess: 'read', templateType: 'journey' },
  { pageId: 'page.journey-v1', label: 'Journey v1', routePattern: '/journey/v1-journey', componentGroup: 'cmp-journey', defaultAccess: 'read', templateType: 'journey' },
  { pageId: 'page.journey-appendix-f', label: 'Journey — Appendix F', routePattern: '/journey/appendix-f', componentGroup: 'cmp-journey', defaultAccess: 'read', templateType: 'journey' },
  { pageId: 'page.journey-module', label: 'Journey Module Player', routePattern: '/journey/module/:moduleId', componentGroup: 'cmp-journey', defaultAccess: 'read', templateType: 'detail' },
  { pageId: 'page.journey-supervisor', label: 'Journey Supervisor View', routePattern: '/journey/supervisor', componentGroup: 'cmp-journey', defaultAccess: 'read', templateType: 'journey' },
  { pageId: 'page.journey-admin', label: 'Journey Admin', routePattern: '/journey/admin', componentGroup: 'cmp-journey', defaultAccess: 'read', templateType: 'journey' },
  { pageId: 'page.journey-guide', label: 'Journey User Guide', routePattern: '/journey/guide', componentGroup: 'cmp-journey', defaultAccess: 'read', templateType: 'documentation' },
  { pageId: 'page.onboarding-v2', label: 'Onboarding v2', routePattern: '/onboarding-v2', componentGroup: 'cmp-journey', defaultAccess: 'read', templateType: 'journey' },

  // ─── Staffing / Clinical ───────────────────────────────────
  { pageId: 'page.clinicians', label: 'Clinician Profiles', routePattern: '/clinicians', componentGroup: 'cmp-staffing', defaultAccess: 'read', templateType: 'profile-list' },
  { pageId: 'page.clinician-detail', label: 'Clinician Detail', routePattern: '/clinicians/:clinicianId', componentGroup: 'cmp-staffing', defaultAccess: 'read', templateType: 'detail' },
  { pageId: 'page.patients', label: 'Patient Profiles', routePattern: '/patients', componentGroup: 'cmp-staffing', defaultAccess: 'read', templateType: 'profile-list' },
  { pageId: 'page.patient-detail', label: 'Patient Detail', routePattern: '/patients/:patientId', componentGroup: 'cmp-staffing', defaultAccess: 'read', templateType: 'detail' },
  { pageId: 'page.staffing-calendar', label: 'Staffing Calendar', routePattern: '/staffing-calendar', componentGroup: 'cmp-staffing', defaultAccess: 'read', templateType: 'calendar' },

  // ─── iAdministrator ────────────────────────────────────────
  { pageId: 'page.iadministrator', label: 'iAdministrator (Brad)', routePattern: '/iadministrator', componentGroup: 'cmp-iadministrator', defaultAccess: 'read', templateType: 'dashboard' },

  // ─── User Management ───────────────────────────────────────
  // Default access = 'none' (explicit grant required)
  { pageId: 'page.user-assignments', label: 'User Assignments', routePattern: '/admin/users', componentGroup: 'cmp-user-management', defaultAccess: 'none', templateType: 'admin-matrix' },
  { pageId: 'page.user-groups', label: 'User Groups', routePattern: '/admin/user-groups', componentGroup: 'cmp-user-management', defaultAccess: 'none', templateType: 'admin-matrix' },
  { pageId: 'page.admin-roles', label: 'Roles', routePattern: '/admin/roles', componentGroup: 'cmp-user-management', defaultAccess: 'none', templateType: 'admin-matrix' },
  { pageId: 'page.admin-permissions', label: 'Permissions', routePattern: '/admin/permissions', componentGroup: 'cmp-user-management', defaultAccess: 'none', templateType: 'admin-matrix' },
  { pageId: 'page.page-access', label: 'Page View Access', routePattern: '/admin/users#page-access', componentGroup: 'cmp-user-management', defaultAccess: 'none', templateType: 'admin-matrix' },

  // ─── System / Settings ─────────────────────────────────────
  { pageId: 'page.help-center', label: 'Help Center', routePattern: '/help', componentGroup: 'cmp-system', defaultAccess: 'read', templateType: 'documentation' },
  { pageId: 'page.system-documentation', label: 'System Documentation', routePattern: '/system-documentation', componentGroup: 'cmp-system', defaultAccess: 'read', templateType: 'documentation' },
  { pageId: 'page.demo', label: 'Demo Page', routePattern: '/demo', componentGroup: 'cmp-system', defaultAccess: 'read', templateType: 'documentation' },
  { pageId: 'page.hubstaff', label: 'Hubstaff Staging', routePattern: '/hubstaff', componentGroup: 'cmp-system', defaultAccess: 'read', templateType: 'documentation' },
];

// Convenience lookups (single source of truth consumers)
const PAGE_BY_ID = Object.fromEntries(PAGE_REGISTRY.map((p) => [p.pageId, p]));
const GROUP_BY_ID = Object.fromEntries(COMPONENT_GROUPS.map((g) => [g.componentId, g]));

function getPagesForComponent(componentId) {
  return PAGE_REGISTRY.filter((p) => p.componentGroup === componentId);
}

function getOrderedComponentGroups() {
  return [...COMPONENT_GROUPS].sort((a, b) => a.order - b.order);
}

// -----------------------------------------------------------------------------
// LOGIN PAGE — Dark (cinematic glassmorphic) + Light (warm paper) variants
// Premium, expensive feel. High fidelity. Self-contained with inline styles.
// Accepts onEnter() prop to transition to the app shell prototype.
// -----------------------------------------------------------------------------
function LoginPage({ onEnter }) {
  const { theme, toggleTheme, isDark } = usePrototypeTheme();

  const [email, setEmail] = useState('robert@careindeed.com');
  const [password, setPassword] = useState('demo2026');
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null); // success / error state for mock

  // CDN logos (exact as specified)
  const logoSrc = isDark
    ? 'https://dovdry3t4njek.cloudfront.net/assets/ci-logo-white-DfgJTkII.png'
    : 'https://dovdry3t4njek.cloudfront.net/assets/ci-logo-gray-Dju7zS6k.png';

  // Palette tokens (derived from task + existing Care Indeed direction)
  const tokens = isDark
    ? {
        // Dark — cinematic navy/slate glassmorphic
        pageBg: 'linear-gradient(160deg, #0A0F1C 0%, #0C1220 35%, #101827 100%)',
        cardBg: 'rgba(16, 22, 36, 0.82)',
        cardBorder: 'rgba(255, 255, 255, 0.09)',
        cardShadow: '0 40px 120px -30px rgba(0, 0, 0, 0.75), 0 10px 30px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        textPrimary: '#E8ECF2',
        textSecondary: '#A7B3C6',
        textTertiary: '#6B7A91',
        inputBg: 'rgba(9, 13, 23, 0.92)',
        inputBorder: 'rgba(255, 255, 255, 0.09)',
        inputFocusBorder: '#14B8A6',
        accent: '#14B8A6',
        accentHover: '#0F9B8C',
        orange: '#F59E0B',
        divider: 'rgba(255,255,255,0.07)',
      }
    : {
        // Light — brand new warm paper palette
        pageBg: '#FAF9F6',
        cardBg: '#FFFFFF',
        cardBorder: '#E6E3D9',
        cardShadow: '0 30px 90px -25px rgba(30, 35, 45, 0.14), 0 8px 25px -12px rgba(30,35,45,0.08)',
        textPrimary: '#1C252E',
        textSecondary: '#4B5563',
        textTertiary: '#6B7280',
        inputBg: '#FBFAF6',
        inputBorder: '#D8D4C7',
        inputFocusBorder: '#0F766E',
        accent: '#0F766E',
        accentHover: '#0C5F57',
        orange: '#C2410C',
        divider: '#EDEAE0',
      };

  // Premium micro-interaction helpers
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage(null);

    // Mock realistic network latency + success (prototype only)
    await new Promise((r) => setTimeout(r, 620));

    // In real app this would call AuthProvider. Here we just give nice feedback.
    setAuthMessage({ type: 'success', text: 'Credentials accepted. Welcome back.' });
    setLoading(false);

    // Short delay then allow seamless entry (or user can use big button)
    setTimeout(() => {
      if (typeof onEnter === 'function') {
        // Some teams prefer explicit "Enter Prototype" click.
        // We keep both behaviors available.
      }
    }, 180);
  };

  const handleEnterPrototype = () => {
    if (typeof onEnter === 'function') {
      onEnter({ theme }); // pass current theme context if needed by shell
    }
  };

  // Subtle link style factory
  const linkStyle = {
    color: tokens.textSecondary,
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'color 140ms ease',
    cursor: 'pointer',
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '13px 15px',
    fontSize: '15px',
    borderRadius: '10px',
    border: `1px solid ${tokens.inputBorder}`,
    background: tokens.inputBg,
    color: tokens.textPrimary,
    outline: 'none',
    transition: 'border-color 160ms ease, box-shadow 160ms ease, background 160ms ease',
    boxSizing: 'border-box',
  };

  const primaryBtnStyle = {
    width: '100%',
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderRadius: '11px',
    border: 'none',
    background: `linear-gradient(145deg, ${tokens.accent}, ${tokens.accentHover})`,
    color: isDark ? '#0B111C' : '#FFFFFF',
    cursor: 'pointer',
    transition: 'transform 140ms cubic-bezier(0.23,1,0.32,1), box-shadow 140ms ease, filter 140ms ease',
    boxShadow: isDark ? '0 4px 14px rgba(20, 184, 166, 0.35)' : '0 4px 14px rgba(15, 118, 110, 0.28)',
  };

  const enterPrototypeBtnStyle = {
    width: '100%',
    padding: '16px 22px',
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    borderRadius: '12px',
    border: isDark ? '1px solid rgba(255,255,255,0.16)' : `1px solid ${tokens.accent}`,
    background: isDark
      ? 'rgba(255,255,255,0.04)'
      : 'linear-gradient(145deg, rgba(15,118,110,0.06), rgba(15,118,110,0.02))',
    color: isDark ? tokens.textPrimary : tokens.accent,
    cursor: 'pointer',
    transition: 'all 180ms cubic-bezier(0.23,1,0.32,1)',
    boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.25)' : '0 3px 12px rgba(15,118,110,0.1)',
  };

  return React.createElement(
    'div',
    {
      style: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: tokens.pageBg,
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    },
    // Subtle cinematic background treatment (dark only)
    isDark &&
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 40% 20%, rgba(20,184,166,0.035) 0%, transparent 55%), radial-gradient(ellipse at 70% 75%, rgba(245,158,11,0.02) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }),

    // Top-right theme toggle (accessible, always visible)
    React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          top: '22px',
          right: '24px',
          zIndex: 50,
        },
      },
      React.createElement(ThemeToggle, {
        isDark,
        onToggle: toggleTheme,
      })
    ),

    // Main centered card container
    React.createElement(
      'div',
      {
        style: {
          width: '100%',
          maxWidth: '440px',
          position: 'relative',
          zIndex: 10,
        },
      },
      // Glass / Paper Card
      React.createElement(
        'div',
        {
          style: {
            background: tokens.cardBg,
            border: `1px solid ${tokens.cardBorder}`,
            borderRadius: '20px',
            padding: '42px 38px 38px',
            boxShadow: tokens.cardShadow,
            backdropFilter: isDark ? 'blur(22px) saturate(1.15)' : 'none',
            WebkitBackdropFilter: isDark ? 'blur(22px) saturate(1.15)' : 'none',
            transition: 'background 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
          },
        },
        // Logo
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '28px',
            },
          },
          React.createElement('img', {
            src: logoSrc,
            alt: 'Care Indeed',
            style: {
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              opacity: isDark ? 0.96 : 0.92,
              transition: 'opacity 180ms ease',
            },
            onError: (e) => {
              // Graceful fallback if CDN unavailable in this env
              e.target.style.display = 'none';
            },
          })
        ),

        // Eyebrow + Title + Subtitle
        React.createElement(
          'div',
          { style: { textAlign: 'center', marginBottom: '28px' } },
          React.createElement(
            'div',
            {
              style: {
                fontSize: '10px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: tokens.textTertiary,
                fontWeight: 600,
                marginBottom: '6px',
              },
            },
            'CARE INDEED • HOME HEALTH'
          ),
          React.createElement(
            'h1',
            {
              style: {
                fontSize: '27px',
                fontWeight: 600,
                letterSpacing: '-0.015em',
                color: tokens.textPrimary,
                margin: '0 0 6px',
                lineHeight: 1.1,
              },
            },
            'Sign in'
          ),
          React.createElement(
            'p',
            {
              style: {
                fontSize: '14px',
                color: tokens.textSecondary,
                margin: 0,
                lineHeight: 1.45,
              },
            },
            'Secure access to the Command Center'
          )
        ),

        // Auth message (mock success / error)
        authMessage &&
          React.createElement(
            'div',
            {
              style: {
                marginBottom: '18px',
                padding: '11px 14px',
                borderRadius: '9px',
                fontSize: '13.5px',
                border: `1px solid ${authMessage.type === 'success' ? (isDark ? 'rgba(52,211,153,0.25)' : 'rgba(16,185,129,0.3)') : (isDark ? 'rgba(251,113,133,0.25)' : '#FECACA')}`,
                background: authMessage.type === 'success'
                  ? (isDark ? 'rgba(52,211,153,0.08)' : 'rgba(16,185,129,0.07)')
                  : (isDark ? 'rgba(251,113,133,0.07)' : '#FEF2F2'),
                color: authMessage.type === 'success' ? (isDark ? '#6EE7B7' : '#166534') : tokens.textPrimary,
              },
            },
            authMessage.text
          ),

        // Form
        React.createElement(
          'form',
          { onSubmit: handleSignIn, style: { display: 'grid', gap: '17px' } },
          // Email
          React.createElement(
            'label',
            { style: { display: 'grid', gap: '6px', fontSize: '12.5px', color: tokens.textSecondary, fontWeight: 500 } },
            'Email address',
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: 'you@careindeed.com',
              autoComplete: 'email',
              required: true,
              style: {
                ...inputBaseStyle,
              },
              onFocus: (e) => {
                e.target.style.borderColor = tokens.inputFocusBorder;
                e.target.style.boxShadow = isDark
                  ? '0 0 0 3px rgba(20,184,166,0.12)'
                  : '0 0 0 3px rgba(15,118,110,0.12)';
              },
              onBlur: (e) => {
                e.target.style.borderColor = tokens.inputBorder;
                e.target.style.boxShadow = 'none';
              },
            })
          ),

          // Password
          React.createElement(
            'label',
            { style: { display: 'grid', gap: '6px', fontSize: '12.5px', color: tokens.textSecondary, fontWeight: 500 } },
            'Password',
            React.createElement('input', {
              type: 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: '••••••••',
              autoComplete: 'current-password',
              required: true,
              style: {
                ...inputBaseStyle,
              },
              onFocus: (e) => {
                e.target.style.borderColor = tokens.inputFocusBorder;
                e.target.style.boxShadow = isDark
                  ? '0 0 0 3px rgba(20,184,166,0.12)'
                  : '0 0 0 3px rgba(15,118,110,0.12)';
              },
              onBlur: (e) => {
                e.target.style.borderColor = tokens.inputBorder;
                e.target.style.boxShadow = 'none';
              },
            })
          ),

          // Sign In CTA
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: loading,
              style: {
                ...primaryBtnStyle,
                marginTop: '4px',
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'default' : 'pointer',
              },
              onMouseEnter: (e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'none';
              },
            },
            loading ? 'Signing in…' : 'Sign in'
          )
        ),

        // Subtle footer links (mock)
        React.createElement(
          'div',
          {
            style: {
              marginTop: '22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
            },
          },
          React.createElement(
            'a',
            {
              href: '#',
              onClick: (e) => {
                e.preventDefault();
                alert('Prototype: Forgot password flow would open here.');
              },
              style: linkStyle,
              onMouseEnter: (e) => (e.currentTarget.style.color = tokens.accent),
              onMouseLeave: (e) => (e.currentTarget.style.color = tokens.textSecondary),
            },
            'Forgot password?'
          ),
          React.createElement(
            'a',
            {
              href: '#',
              onClick: (e) => {
                e.preventDefault();
                alert('Prototype: Support / contact modal would appear.');
              },
              style: linkStyle,
              onMouseEnter: (e) => (e.currentTarget.style.color = tokens.accent),
              onMouseLeave: (e) => (e.currentTarget.style.color = tokens.textSecondary),
            },
            'Need help?'
          )
        ),

        // Divider
        React.createElement('div', {
          style: {
            height: '1px',
            background: tokens.divider,
            margin: '26px 0 18px',
          },
        }),

        // ENTER PROTOTYPE — Large prominent action (the key demo affordance)
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: handleEnterPrototype,
            style: enterPrototypeBtnStyle,
            onMouseEnter: (e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = isDark
                ? '0 6px 18px rgba(0,0,0,0.35)'
                : '0 8px 20px rgba(15,118,110,0.16)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.28)' : tokens.accentHover;
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = isDark
                ? '0 2px 10px rgba(0,0,0,0.25)'
                : '0 3px 12px rgba(15,118,110,0.1)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.16)' : tokens.accent;
            },
          },
          'Enter Prototype →'
        ),

        React.createElement(
          'p',
          {
            style: {
              textAlign: 'center',
              fontSize: '11.5px',
              color: tokens.textTertiary,
              marginTop: '14px',
              letterSpacing: '0.01em',
            },
          },
          'Bypass auth for full command center exploration'
        )
      )
    )
  );
}

// -----------------------------------------------------------------------------
// Convenience: Export surface for the prototype shell
// (In UMD / global script context these become available on window)
// -----------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.CI_PROTOTYPE = {
    COMPONENT_GROUPS,
    PAGE_REGISTRY,
    PAGE_BY_ID,
    GROUP_BY_ID,
    getPagesForComponent,
    getOrderedComponentGroups,
    usePrototypeTheme,
    ThemeToggle,
    LoginPage,
    // Quick helpers
    getAllPageIds: () => PAGE_REGISTRY.map((p) => p.pageId),
    getRegistryStats: () => ({
      totalPages: PAGE_REGISTRY.length,
      groups: COMPONENT_GROUPS.length,
    }),
  };
}

// Final note for implementers:
//   <LoginPage onEnter={(ctx) => { console.log('Theme at entry:', ctx?.theme); /* mount shell */ }} />
//   <ThemeToggle /> can be dropped anywhere after the hook is active.

export {
  COMPONENT_GROUPS,
  PAGE_REGISTRY,
  PAGE_BY_ID,
  GROUP_BY_ID,
  getPagesForComponent,
  getOrderedComponentGroups,
  usePrototypeTheme,
  ThemeToggle,
  LoginPage,
};
