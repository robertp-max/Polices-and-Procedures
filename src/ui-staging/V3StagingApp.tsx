import V3_2StagingApp from './V3_2StagingApp';

/**
 * Canonical V3 staging entry.
 *
 * Phase 2 route stabilization keeps `/ui-staging` intentional and build-safe
 * by forwarding it to the current V3.2 staging experience. This is still a
 * preview harness, not a production parity claim.
 */
export default function V3StagingApp() {
  return <V3_2StagingApp />;
}
