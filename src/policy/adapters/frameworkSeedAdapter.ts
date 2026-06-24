import {
  typedFrameworkDomains,
  typedFrameworkPolicies,
  typedFrameworkPolicyVersions,
  typedFrameworkSubdomains,
  typedSeedCalendarTasks,
  typedSeedUrgentTasks,
} from '@/policy/data/frameworkSeed.generated';
import type { Domain, Policy, PolicyVersion, Subdomain, UrgentTask, CalendarTask } from '@/policy/types';
import { resolveAchcCrosswalkTarget } from '@/policy/data/achcStandardTargetResolver';

function normalizeAccessTier(value: string): string {
  return value.replace(/—/g, '-');
}

export interface FrameworkSeedBundle {
  domains: Domain[];
  subdomains: Subdomain[];
  policies: Policy[];
  policyVersions: PolicyVersion[];
  calendarTasks: CalendarTask[];
  urgentTasks: UrgentTask[];
  resolveCrosswalk: typeof resolveAchcCrosswalkTarget;
}

export function loadFrameworkSeed(): FrameworkSeedBundle {
  return {
    domains: typedFrameworkDomains,
    subdomains: typedFrameworkSubdomains.map(subdomain => ({
      ...subdomain,
      accessTier: normalizeAccessTier(subdomain.accessTier),
    })),
    policies: typedFrameworkPolicies.map(policy => ({
      ...policy,
      accessTier: normalizeAccessTier(policy.accessTier),
      lifecycleStatus: 'Draft',
      isPublished: false,
      publishedVersion: null,
    })),
    policyVersions: typedFrameworkPolicyVersions.map(version => ({
      ...version,
      lifecycleStatus: 'Draft',
      isLocked: false,
      approvedBy: null,
      approvedDate: null,
    })),
    calendarTasks: typedSeedCalendarTasks,
    urgentTasks: typedSeedUrgentTasks,
    resolveCrosswalk: resolveAchcCrosswalkTarget,
  };
}
