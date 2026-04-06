import type { Policy } from '@/policy/types';
import type { SortField } from '@/policy/stores/uiStore';

interface PolicyFilters {
  search: string;
  selectedDomain: string;
  selectedSubdomain: string;
  selectedTier: string;
  selectedStatus: string;
  selectedAccessTier: string;
  sortField: SortField;
}

function includesIgnoreCase(input: string, needle: string): boolean {
  return input.toLowerCase().includes(needle.toLowerCase());
}

export function filterAndSortPolicies(
  policies: Policy[],
  filters: PolicyFilters,
): Policy[] {
  const filtered = policies.filter(policy => {
    if (filters.selectedDomain !== 'ALL' && policy.domainCode !== filters.selectedDomain) {
      return false;
    }

    if (filters.selectedSubdomain !== 'ALL' && policy.subdomainCode !== filters.selectedSubdomain) {
      return false;
    }

    if (filters.selectedTier !== 'ALL' && policy.tier !== filters.selectedTier) {
      return false;
    }

    if (filters.selectedStatus !== 'ALL' && policy.lifecycleStatus !== filters.selectedStatus) {
      return false;
    }

    if (filters.selectedAccessTier !== 'ALL' && policy.accessTier !== filters.selectedAccessTier) {
      return false;
    }

    if (!filters.search.trim()) {
      return true;
    }

    const term = filters.search.trim();
    return (
      includesIgnoreCase(policy.id, term) ||
      includesIgnoreCase(policy.title, term) ||
      includesIgnoreCase(policy.description, term)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const field = filters.sortField;
    const left = `${a[field] || ''}`.toLowerCase();
    const right = `${b[field] || ''}`.toLowerCase();
    return left.localeCompare(right);
  });

  return sorted;
}

export function computeDashboardMetrics(policies: Policy[]) {
  return {
    total: policies.length,
    drafts: policies.filter(policy => policy.lifecycleStatus === 'Draft').length,
    underReview: policies.filter(policy => policy.lifecycleStatus === 'Under Review').length,
    revisionRequested: policies.filter(policy => policy.lifecycleStatus === 'Revision Requested').length,
    approved: policies.filter(policy => policy.lifecycleStatus === 'Approved').length,
    published: policies.filter(policy => policy.lifecycleStatus === 'Published').length,
    archived: policies.filter(policy => policy.lifecycleStatus === 'Archived').length,
  };
}
