import { useFrameworkStore } from '@/policy/stores/frameworkStore';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { useCalendarStore } from '@/policy/stores/calendarStore';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { sweepEscalations } from '@/policy/enforcement/useEnforcement';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { EvidenceApi } from '@/policy/services/evidenceApi';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';

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

  // Enforcement sweep — materialize any latent escalations on startup so
  // the Audit dashboard is immediately populated with real signal.
  try {
    const { generatedEvents, triggeredEvents } = useAutogenStore.getState();
    sweepEscalations([...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents]);
  } catch (e) {
    // Never block app startup on the enforcement sweep.
    console.warn('Enforcement sweep failed at startup', e);
  }

  // Hydrate regulatory execution store from backend snapshot asynchronously
  EvidenceApi.loadSnapshot('full')
    .then(res => {
      if (res.status === 'ok' && res.snapshot) {
        const snapshot = res.snapshot as Parameters<ReturnType<typeof useRegulatoryExecutionStore.getState>['importSnapshotState']>[0];
        useRegulatoryExecutionStore.getState().importSnapshotState(snapshot);
        console.log('Successfully hydrated regulatory execution store from backend snapshot.');
      } else {
        console.warn('Backend snapshot not found or empty:', res.status);
      }
    })
    .catch(err => {
      console.warn('Failed to load compliance execution snapshot from backend:', err);
    });

  // Log successful initialization
  console.log('Application initialized with framework seed data', {
    domains: frameworkState.domains.length,
    subdomains: frameworkState.subdomains.length,
    policies: policyState.policies.length,
    versions: policyState.versions.length,
    calendarTasks: calendarState.tasks.length,
  });
}
