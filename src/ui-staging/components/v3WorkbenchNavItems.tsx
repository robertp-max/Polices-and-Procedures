import type { V3ShellNavItem } from './V3CollapsibleSidebarNav'

// Minimal shared nav model used by V3WorkbenchShell previews.
export const v3WorkbenchNavItems: readonly V3ShellNavItem[] = [
  { label: 'Dashboard', to: '/ui-staging', icon: 'DB', end: true },
  { label: 'Clinicians', to: '/ui-staging/clinician-profile', icon: 'CL' },
  { label: 'Patients', to: '/ui-staging/patient-profile', icon: 'PT' },
  { label: 'Calendar', to: '/ui-staging/calendar', icon: 'CA' },
  { label: 'Workflow', to: '/ui-staging/workflow', icon: 'WF' },
]
