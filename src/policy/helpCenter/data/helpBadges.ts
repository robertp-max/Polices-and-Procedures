import type { HelpBadgeDef, HelpBadgeGroup, HelpBadgeId } from '../types';

// Calm, brand-consistent tones: teal/orange are the brand pair; slate for
// reference/status; amber reserved for caution; rose only for PHI warning.
export const HELP_BADGES: Record<HelpBadgeId, HelpBadgeDef> = {
  // --- Audience -----------------------------------------------------------
  'office-staff': { id: 'office-staff', group: 'audience', label: 'Office Staff', tone: 'teal', description: 'Written for office staff and non-admin end users.' },
  learner: { id: 'learner', group: 'audience', label: 'Learner', tone: 'teal', description: 'Written for onboarding learners working through Journey modules.' },
  clinician: { id: 'clinician', group: 'audience', label: 'Clinician', tone: 'teal', description: 'Written for clinicians using field-facing workflows.' },
  supervisor: { id: 'supervisor', group: 'audience', label: 'Supervisor', tone: 'teal', description: 'Written for supervisors reviewing team work.' },
  compliance: { id: 'compliance', group: 'audience', label: 'Compliance', tone: 'teal', description: 'Written for compliance and QAPI staff.' },
  admin: { id: 'admin', group: 'audience', label: 'Admin', tone: 'slate', description: 'Covers admin-gated configuration; excluded from office-staff training.' },
  'all-staff': { id: 'all-staff', group: 'audience', label: 'All Staff', tone: 'teal', description: 'Applies to every user of the application.' },

  // --- Feature ------------------------------------------------------------
  brad: { id: 'brad', group: 'feature', label: 'Brad', tone: 'sky', description: 'Covers the Brad AI compliance assistant.' },
  nolan: { id: 'nolan', group: 'feature', label: 'Nolan', tone: 'sky', description: 'Covers the Nolan learner assistant and training tutor.' },
  ces: { id: 'ces', group: 'feature', label: 'CES', tone: 'sky', description: 'Covers the Compliance Execution System: calendar, board, and events.' },
  evidence: { id: 'evidence', group: 'feature', label: 'Evidence', tone: 'sky', description: 'Covers evidence intake, review, and packet studio.' },
  ecign: { id: 'ecign', group: 'feature', label: 'eCign', tone: 'sky', description: 'Covers signature sending and signature status tracking.' },
  forms: { id: 'forms', group: 'feature', label: 'Forms', tone: 'sky', description: 'Covers the forms library, viewer, and printing.' },
  policies: { id: 'policies', group: 'feature', label: 'Policies', tone: 'sky', description: 'Covers the policy library and policy detail pages.' },
  reports: { id: 'reports', group: 'feature', label: 'Reports', tone: 'sky', description: 'Covers QAPI dashboards and report views.' },
  admission: { id: 'admission', group: 'feature', label: 'Admission', tone: 'sky', description: 'Covers the patient admission packet workflow.' },
  journey: { id: 'journey', group: 'feature', label: 'Journey', tone: 'sky', description: 'Covers onboarding Journey modules and lessons.' },
  community: { id: 'community', group: 'feature', label: 'Community', tone: 'sky', description: 'Covers community profiles, threads, and discussions.' },

  // --- Task type ----------------------------------------------------------
  'quick-start': { id: 'quick-start', group: 'task', label: 'Quick Start', tone: 'orange', description: 'Fast path: get the task done in a few steps.' },
  'guided-tour': { id: 'guided-tour', group: 'task', label: 'Guided Tour', tone: 'orange', description: 'Launches an interactive in-app walkthrough.' },
  troubleshooting: { id: 'troubleshooting', group: 'task', label: 'Troubleshooting', tone: 'orange', description: 'Diagnoses and fixes a known problem.' },
  workflow: { id: 'workflow', group: 'task', label: 'Workflow', tone: 'orange', description: 'End-to-end multi-step working procedure.' },
  reference: { id: 'reference', group: 'task', label: 'Reference', tone: 'slate', description: 'Look-up material; read as needed.' },
  checklist: { id: 'checklist', group: 'task', label: 'Checklist', tone: 'orange', description: 'Verifiable list of completion items.' },
  'decision-tree': { id: 'decision-tree', group: 'task', label: 'Decision Tree', tone: 'orange', description: 'Branching yes/no guidance to a correct outcome.' },
  print: { id: 'print', group: 'task', label: 'Print', tone: 'slate', description: 'Covers printing or downloading a document.' },
  upload: { id: 'upload', group: 'task', label: 'Upload', tone: 'slate', description: 'Covers uploading files or evidence.' },
  signature: { id: 'signature', group: 'task', label: 'Signature', tone: 'slate', description: 'Covers signing or tracking signature status.' },

  // --- Status ---------------------------------------------------------------
  core: { id: 'core', group: 'status', label: 'Core', tone: 'emerald', description: 'Core reading for this workspace.' },
  basics: { id: 'basics', group: 'status', label: 'Basics', tone: 'emerald', description: 'Foundation material; start here.' },
  required: { id: 'required', group: 'status', label: 'Required', tone: 'emerald', description: 'Required in the office-staff training path.' },
  optional: { id: 'optional', group: 'status', label: 'Optional', tone: 'slate', description: 'Optional enrichment material.' },
  new: { id: 'new', group: 'status', label: 'New', tone: 'amber', description: 'Recently published.' },
  updated: { id: 'updated', group: 'status', label: 'Updated', tone: 'amber', description: 'Recently revised for accuracy.' },
  'needs-review': { id: 'needs-review', group: 'status', label: 'Needs Review', tone: 'amber', description: 'Content pending editorial or SME review.' },
  retired: { id: 'retired', group: 'status', label: 'Retired', tone: 'slate', description: 'No longer maintained; superseded by a replacement article.' },

  // --- Safety / compliance --------------------------------------------------
  'no-phi': { id: 'no-phi', group: 'safety', label: 'No PHI', tone: 'emerald', description: 'All examples use mock data. Never enter PHI in this surface.' },
  'phi-warning': { id: 'phi-warning', group: 'safety', label: 'PHI Warning', tone: 'rose', description: 'This workflow can expose PHI; follow minimum-necessary handling.' },
  'audit-support': { id: 'audit-support', group: 'safety', label: 'Audit Support', tone: 'amber', description: 'Supports audit preparation; not a compliance determination.' },
  'survey-support': { id: 'survey-support', group: 'safety', label: 'Survey Support', tone: 'amber', description: 'Supports survey preparation; does not claim survey readiness.' },
  'training-only': { id: 'training-only', group: 'safety', label: 'Training Only', tone: 'slate', description: 'Training material only; not an operational directive.' },
  'not-attestation': { id: 'not-attestation', group: 'safety', label: 'Not Attestation', tone: 'slate', description: 'Completing this content is not a compliance attestation.' },
};

export const HELP_BADGE_GROUPS: HelpBadgeGroup[] = ['audience', 'feature', 'task', 'status', 'safety'];

export const HELP_BADGE_GROUP_LABELS: Record<HelpBadgeGroup, string> = {
  audience: 'Audience',
  feature: 'Feature',
  task: 'Task type',
  status: 'Status',
  safety: 'Safety & compliance',
};

export function badgesByGroup(group: HelpBadgeGroup): HelpBadgeDef[] {
  return Object.values(HELP_BADGES).filter((b) => b.group === group);
}

export function getBadge(id: HelpBadgeId): HelpBadgeDef {
  return HELP_BADGES[id];
}
