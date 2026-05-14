/**
 * Feature catalog.
 *
 * Single source of truth for which UI surfaces are available to which
 * roles in this app. Read by featureAccess.ts to produce decisions
 * and by FeatureGate / FeatureRouteGuard / nav filtering to enforce
 * them at render time.
 *
 * IMPORTANT: This is metadata only. The decision engine still runs
 * through the existing Phase A authorize() function. Do NOT add
 * permission grants or role assignments here — those belong in
 * `userGroups.ts` and `roleAssignments.ts`.
 */

import type { FeatureDefinition } from './types';

/**
 * Catalog of gateable UI surfaces.
 *
 * Conventions for permissions:
 * - Read-only views use `*.view` perms (policy.view, form.view, ceu.view, audit.read).
 * - Action buttons use the corresponding action perm (form.sign, policy.draft, ceu.assign, etc.).
 *
 * Conventions for groups:
 * - Use `allowedGroupNames` for surfaces that don't have a direct
 *   Phase A permission (e.g., the staffing module is not represented
 *   in PERMISSION_CATALOG, so it's gated by group membership).
 * - Super Admin and Admin always pass — do not list them; the
 *   evaluator already includes them as a global allow.
 */
export const FEATURE_CATALOG: FeatureDefinition[] = [
  // ─── Core: open to all authenticated users ──────────────────
  { featureId: 'dashboard.view',     label: 'Command Center / Dashboard', rolloutPhase: 'full' },
  { featureId: 'helpCenter.view',    label: 'Help Center', rolloutPhase: 'full' },

  // ─── Brad / iAdministrator (decision-support) ───────────────
  {
    featureId: 'brad.view',
    label: 'Brad (iAdministrator)',
    allowedGroupNames: ['Director', 'Executive', 'Compliance'],
    rolloutPhase: 'pilot',
  },
  {
    featureId: 'bradProposal.view',
    label: 'Brad Proposal',
    allowedGroupNames: ['Director', 'Executive'],
    rolloutPhase: 'pilot',
    visibleInNav: false,
  },

  // ─── CES / Calendar (Compliance Execution) ──────────────────
  {
    featureId: 'ces.view',
    label: 'Compliance Execution (CES)',
    requiredPermissions: ['ceu.view'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'calendar.view',
    label: 'Calendar (CES Master)',
    requiredPermissions: ['ceu.view'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'pmTasks.view',
    label: 'My Tasks / PM',
    requiredPermissions: ['ceu.view'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'workflows.view',
    label: 'Workflows Library',
    requiredPermissions: ['ceu.view'],
    rolloutPhase: 'full',
  },

  // ─── Evidence + Audit ───────────────────────────────────────
  {
    featureId: 'evidence.view',
    label: 'Evidence Center',
    requiredPermissions: ['audit.read', 'ceu.view'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'audit.view',
    label: 'Audit Mode',
    requiredPermissions: ['audit.read'],
    rolloutPhase: 'full',
  },

  // ─── eCIgn / Forms ──────────────────────────────────────────
  {
    featureId: 'ecign.view',
    label: 'eCIgn Signing',
    requiredPermissions: ['form.view', 'form.sign'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'forms.view',
    label: 'Forms Library',
    requiredPermissions: ['form.view'],
    rolloutPhase: 'full',
  },

  // ─── Policy Library + Lifecycle ─────────────────────────────
  {
    featureId: 'policyLibrary.view',
    label: 'Policy Library',
    requiredPermissions: ['policy.view'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'policyLifecycle.view',
    label: 'Policy Lifecycle',
    requiredPermissions: ['policy.draft', 'policy.approve', 'policy.publish'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'frameworkTaxonomy.view',
    label: 'Taxonomy / Framework',
    allowedGroupNames: ['Compliance', 'Director', 'Executive'],
    rolloutPhase: 'full',
  },

  // ─── Surveyor / ACHC ────────────────────────────────────────
  {
    featureId: 'surveyor.view',
    label: 'Surveyor / ACHC',
    requiredPermissions: ['policy.view', 'audit.read'],
    allowedGroupNames: ['Auditor', 'Compliance'],
    rolloutPhase: 'pilot',
  },

  // ─── Journey / LMS / Onboarding ─────────────────────────────
  {
    featureId: 'journey.view',
    label: 'Onboarding Journey / LMS',
    allowedGroupNames: ['Onboarding', 'Director', 'Executive', 'Compliance', 'RN', 'LVN', 'CHHA'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'onboardingV2.view',
    label: 'Onboarding v2 (audit-grade activation)',
    requiredPermissions: ['user.provision'],
    allowedGroupNames: ['Onboarding'],
    rolloutPhase: 'pilot',
  },

  // ─── Staffing (Phase 1: read-only profiles) ─────────────────
  {
    featureId: 'staffing.view',
    label: 'Staffing (umbrella)',
    allowedGroupNames: ['Director', 'Executive', 'Compliance', 'Onboarding'],
    rolloutPhase: 'pilot',
  },
  {
    featureId: 'clinicians.view',
    label: 'Clinician Profiles',
    allowedGroupNames: ['Director', 'Executive', 'Compliance', 'Onboarding'],
    rolloutPhase: 'pilot',
  },
  {
    featureId: 'patients.view',
    label: 'Patient Profiles',
    allowedGroupNames: ['Director', 'Executive', 'Compliance', 'Onboarding', 'RN', 'LVN', 'CHHA'],
    rolloutPhase: 'pilot',
  },
  {
    featureId: 'staffing.calendar.view',
    label: 'Staffing Calendar (out-of-Phase-1 preview)',
    internalOnly: true,
    rolloutPhase: 'internal',
    note: 'Pre-Phase-1 calendar work; visible only to admins until formally scoped.',
  },

  // ─── Operational tooling ────────────────────────────────────
  {
    featureId: 'hubstaff.view',
    label: 'Hubstaff Staging',
    internalOnly: true,
    rolloutPhase: 'internal',
  },
  {
    featureId: 'demo.view',
    label: 'Demo Page',
    rolloutPhase: 'demo',
    allowedGroupNames: ['Compliance', 'Director', 'Executive', 'Onboarding'],
  },
  {
    featureId: 'systemDocumentation.view',
    label: 'System Documentation',
    internalOnly: true,
    rolloutPhase: 'internal',
  },
  {
    featureId: 'masterControlInventory.view',
    label: 'Master Control Inventory',
    requiredPermissions: ['audit.read'],
    rolloutPhase: 'pilot',
  },

  // ─── Admin (already gated by AdminRouteGuard; mirrored here) ─
  // Admin UI access is governed by group membership in Super Admin or
  // Admin (decoupled from the `user.provision` action permission so a
  // Trainer/Onboarding user holding scoped provisioning rights does NOT
  // automatically see the Admin section). The evaluator in
  // featureAccess.ts already short-circuits to allow for Super Admin /
  // Admin via isAdminUser, so leaving requiredPermissions empty is
  // correct: only admins ever pass.
  {
    featureId: 'admin.permissions.view',
    label: 'Admin / Permissions',
    allowedGroupNames: ['Super Admin', 'Admin'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'admin.users.view',
    label: 'Admin / User Assignments',
    allowedGroupNames: ['Super Admin', 'Admin'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'admin.roles.view',
    label: 'Admin / Roles',
    allowedGroupNames: ['Super Admin', 'Admin'],
    rolloutPhase: 'full',
  },
  {
    featureId: 'admin.userGroups.view',
    label: 'Admin / User Groups',
    allowedGroupNames: ['Super Admin', 'Admin'],
    rolloutPhase: 'full',
  },

  // ─── Mobile incident execution (clinical action) ────────────
  {
    featureId: 'mobileIncidentExecution.view',
    label: 'Mobile Incident Execution',
    requiredPermissions: ['ceu.execute', 'ceu.view'],
    rolloutPhase: 'clinical',
  },

  // ─── Action-level features (button-level gates) ─────────────
  // These mirror Phase A action permissions one-to-one, so a single
  // <PermissionGate permissionId="…"> works without a feature lookup.
  // We register them here as well so admins can see them in the
  // diagnostic/badge view.
  { featureId: 'action.policy.draft',     label: 'Action: Edit policy draft',         requiredPermissions: ['policy.draft'] },
  { featureId: 'action.policy.approve',   label: 'Action: Approve policy version',    requiredPermissions: ['policy.approve'] },
  { featureId: 'action.policy.publish',   label: 'Action: Publish policy version',    requiredPermissions: ['policy.publish'] },
  { featureId: 'action.form.sign',        label: 'Action: Sign form',                 requiredPermissions: ['form.sign'] },
  { featureId: 'action.ces.assign',       label: 'Action: Assign CES work',           requiredPermissions: ['ceu.assign'] },
  { featureId: 'action.ces.complete',     label: 'Action: Complete task',             requiredPermissions: ['ceu.complete'] },
  { featureId: 'action.ces.override',     label: 'Action: Override (dual approval)',  requiredPermissions: ['ceu.override'] },
  { featureId: 'action.audit.export',     label: 'Action: Export audit',              requiredPermissions: ['audit.export'] },
  { featureId: 'action.user.provision',   label: 'Action: Provision user',            requiredPermissions: ['user.provision'] },
  { featureId: 'action.user.suspend',     label: 'Action: Suspend user',              requiredPermissions: ['user.suspend'] },
  { featureId: 'action.system.replay',    label: 'Action: Sandbox / system replay',   requiredPermissions: ['system.replay'] },
  { featureId: 'action.evidence.upload',  label: 'Action: Upload evidence',           requiredPermissions: ['ceu.execute', 'audit.read'] },
];

export const FEATURE_BY_ID: Record<string, FeatureDefinition> = Object.fromEntries(
  FEATURE_CATALOG.map(f => [f.featureId, f]),
);
