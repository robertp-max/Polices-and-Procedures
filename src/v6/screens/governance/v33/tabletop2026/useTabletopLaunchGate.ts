// React binding for the ONE authoritative tabletop launch gate.
//
// Every launch entry point (Hub Solo / Facilitated Group / Resume / Start over,
// My Compliance, Oversight, a deep link, and a browser-Forward restore) reads
// its eligibility from this hook. Nothing recomputes the rules locally.

import { useMemo } from 'react';

import {
  resolvePrivilegedAccessMode,
  useTabletopAccessIdentity,
} from '../compliance/accessMode';
import { useCompliance } from '../compliance/useCompliance';
import { getOfficialEvidence } from '../compliance/complianceStore';
import { resolveTabletopLaunchGate, type TabletopLaunchGate } from './tabletopLaunchGate';

export function useTabletopLaunchGate(learnerIdOverride?: string): TabletopLaunchGate {
  const identity = useTabletopAccessIdentity();
  const { views, learnerId, evidenceConnected } = useCompliance(learnerIdOverride);
  const officialEvidence = getOfficialEvidence();
  const privilegedMode = useMemo(() => resolvePrivilegedAccessMode(identity), [identity]);

  return useMemo(
    () =>
      resolveTabletopLaunchGate({
        views,
        officialEvidence,
        learnerId,
        evidenceConnected,
        privilegedMode,
      }),
    [views, officialEvidence, learnerId, evidenceConnected, privilegedMode],
  );
}
