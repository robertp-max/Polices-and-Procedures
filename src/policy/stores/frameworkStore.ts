import { create } from 'zustand';
import { loadFrameworkSeed } from '@/policy/adapters/frameworkSeedAdapter';
import type { Domain, Policy, Subdomain } from '@/policy/types';

const seed = loadFrameworkSeed();

interface FrameworkState {
  domains: Domain[];
  subdomains: Subdomain[];
  policies: Policy[];
  getPolicyById: (policyId: string) => Policy | undefined;
}

export const useFrameworkStore = create<FrameworkState>(() => ({
  domains: seed.domains,
  subdomains: seed.subdomains,
  policies: seed.policies,
  getPolicyById: policyId => seed.policies.find(policy => policy.id === policyId),
}));
