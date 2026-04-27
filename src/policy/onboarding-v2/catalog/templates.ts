import type { OnboardingTemplate, RoleId, TriggerType } from '../types';
import { REQUIREMENTS, requirementsForRole } from './requirements';

/**
 * Build a template from the requirements that apply to (role, trigger).
 * For NEW_HIRE we include all `cadence.initial` requirements.
 * For ANNUAL_REVALIDATION we include only requirements with annual recurrence.
 * For ROLE_CHANGE we include role-specific initials minus universal already-satisfied items
 * (reconciliation handled at runtime).
 */
function build(role: RoleId, trigger: TriggerType): OnboardingTemplate {
  const all = requirementsForRole(role);
  const reqIds = all
    .filter(r => {
      if (trigger === 'NEW_HIRE' || trigger === 'GOVERNANCE_APPOINTMENT' || trigger === 'VENDOR_ONBOARD') {
        return r.cadence.initial;
      }
      if (trigger === 'ANNUAL_REVALIDATION') {
        return r.cadence.recurrence?.kind === 'Annual';
      }
      if (trigger === 'ROLE_CHANGE') {
        return r.cadence.initial;
      }
      if (trigger === 'REACTIVATION') {
        return r.cadence.initial;
      }
      if (trigger === 'POLICY_VERSION_CHANGE') {
        return r.signatureSpecs.some(s => s.bindsTo === 'PolicyVersion');
      }
      return r.cadence.initial;
    })
    .map(r => r.id);

  const policyVersionRefs = Array.from(
    new Map(
      REQUIREMENTS
        .filter(r => reqIds.includes(r.id))
        .flatMap(r => r.policyRefs.map(p => [p.policyId + '@' + p.policyVersion, p] as const)),
    ).values(),
  );

  return {
    id: `TPL-${role}-${trigger}`,
    version: 1,
    effectiveFrom: '2026-01-01T00:00:00Z',
    roleId: role,
    triggerType: trigger,
    requirementIds: reqIds,
    policyVersionRefs,
    immutable: true,
  };
}

const ROLES: RoleId[] = [
  'ADMIN','CLINICAL_MANAGER','RN','LVN','HHA','THERAPIST','QAPI_MEMBER',
  'COMPLIANCE_OFFICER','PRIVACY_OFFICER','SECURITY_OFFICER','OFFICE_STAFF',
  'INTAKE','BILLING','GOVERNING_BODY','MEDICAL_DIRECTOR','VENDOR','VOLUNTEER',
];

const TRIGGERS: TriggerType[] = [
  'NEW_HIRE','ROLE_CHANGE','REACTIVATION','ANNUAL_REVALIDATION',
  'VENDOR_ONBOARD','GOVERNANCE_APPOINTMENT','POLICY_VERSION_CHANGE',
];

export const TEMPLATES: OnboardingTemplate[] = ROLES.flatMap(r => TRIGGERS.map(t => build(r, t)));

export function selectTemplate(role: RoleId, trigger: TriggerType): OnboardingTemplate | undefined {
  return TEMPLATES.find(t => t.roleId === role && t.triggerType === trigger);
}
