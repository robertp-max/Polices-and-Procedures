import type { V3ShellNavItem } from './V3CollapsibleSidebarNav'
import {
  LayoutDashboard, Users, Heart, CalendarDays, Zap,
  ClipboardCheck, Network, UserCheck, FileEdit, FolderOpen,
  ArrowUpCircle, HelpCircle, PlayCircle, ShieldCheck
} from 'lucide-react'

// Rich nav model matching the real app sidebar from APP_Screenshots.pdf (full menu + sections).
// Used by V3WorkbenchShell previews for exact visual parity in WIP shell views.
export const v3WorkbenchNavItems: readonly V3ShellNavItem[] = [
  { label: 'Dashboard', to: '/ui-staging', icon: <LayoutDashboard size={16} />, end: true, group: 'PRIMARY OPERATIONS' },
  { label: 'Clinician Profiles', to: '/ui-staging/clinician-profile', icon: <Users size={16} />, group: 'PRIMARY OPERATIONS' },
  { label: 'Patient Profiles', to: '/ui-staging/patient-profile', icon: <Heart size={16} />, group: 'PRIMARY OPERATIONS' },
  { label: 'Calendar', to: '/ui-staging/calendar', icon: <CalendarDays size={16} />, group: 'PRIMARY OPERATIONS' },
  { label: 'Brad', to: '/ui-staging/brad', icon: <Zap size={16} />, group: 'PRIMARY OPERATIONS' },

  { label: 'Compliance Execution (CES)', to: '/ui-staging/ces', icon: <ClipboardCheck size={16} />, group: 'COMPLIANCE EXECUTION' },
  { label: 'CES Board', to: '/ui-staging/ces/board', icon: <ClipboardCheck size={16} />, group: 'COMPLIANCE EXECUTION' },
  { label: 'Taxonomy', to: '/ui-staging/taxonomy', icon: <Network size={16} />, group: 'COMPLIANCE EXECUTION' },
  { label: 'Onboarding', to: '/ui-staging/onboarding', icon: <UserCheck size={16} />, group: 'COMPLIANCE EXECUTION' },
  { label: 'Policy Library', to: '/ui-staging/library', icon: <FileEdit size={16} />, group: 'COMPLIANCE EXECUTION' },
  { label: 'Evidence', to: '/ui-staging/evidence', icon: <FolderOpen size={16} />, group: 'COMPLIANCE EXECUTION' },
  { label: 'Reports', to: '/ui-staging/ces/reports', icon: <ClipboardCheck size={16} />, group: 'COMPLIANCE EXECUTION' },

  { label: 'Hubstaff', to: '/ui-staging/hubstaff', icon: <ArrowUpCircle size={16} />, group: 'ADMINISTRATION / KNOWLEDGE' },
  { label: 'System Documentation', to: '/ui-staging/docs', icon: <FolderOpen size={16} />, group: 'ADMINISTRATION / KNOWLEDGE' },
  { label: 'Help Center', to: '/ui-staging/help', icon: <HelpCircle size={16} />, group: 'ADMINISTRATION / KNOWLEDGE' },
  { label: 'Demo', to: '/ui-staging/demo', icon: <PlayCircle size={16} />, group: 'ADMINISTRATION / KNOWLEDGE' },
  { label: 'Admin', to: '/ui-staging/admin', icon: <ShieldCheck size={16} />, group: 'ADMINISTRATION / KNOWLEDGE' },
]
