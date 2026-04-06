import { useFrameworkStore } from '@/policy/stores/frameworkStore';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { useCalendarStore } from '@/policy/stores/calendarStore';

/**
 * Initializes the policy application by hydrating all stores with framework seed data.
 * Called once on app mount to ensure all stores are properly initialized before components render.
 */
export function initializeApp(): void {
  // Verify framework store is hydrated
  const frameworkState = useFrameworkStore.getState();
  if (frameworkState.domains.length === 0) {
    console.warn('Framework store: domains not hydrated');
  }
  if (frameworkState.subdomains.length === 0) {
    console.warn('Framework store: subdomains not hydrated');
  }

  // Verify policy store is hydrated
  const policyState = usePolicyStore.getState();
  if (policyState.policies.length === 0) {
    console.warn('Policy store: policies not hydrated');
  }
  if (policyState.versions.length === 0) {
    console.warn('Policy store: versions not hydrated');
  }

  // Verify calendar store is hydrated
  const calendarState = useCalendarStore.getState();
  if (calendarState.tasks.length === 0) {
    console.warn('Calendar store: tasks not hydrated');
  }

  // Log successful initialization
  console.log('Application initialized with framework seed data', {
    domains: frameworkState.domains.length,
    subdomains: frameworkState.subdomains.length,
    policies: policyState.policies.length,
    versions: policyState.versions.length,
    calendarTasks: calendarState.tasks.length,
  });
}
